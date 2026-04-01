import express from 'express';
import crypto from 'crypto';
import { query, pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { enforceFinancialSecurity } from '../../shared/security-middleware.js';
import { sseEmit } from '../services/event-processor.js';

const router = express.Router();

// GET /api/qarsan/status - Get Qarsan status for current user
router.get('/status', requireAuth, async (req, res) => {
  try {   
    const userId = req.user.id
    
    const userEmailRes = await query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    )
    const userEmail = userEmailRes.rows.length > 0 ? userEmailRes.rows[0].email : null
    
    // Get Watch-Dog state
    const dogResult = await query(
      'SELECT last_fed_at, dog_state FROM watchdog_state WHERE user_id = $1',
      [userId]
    )
    let dogState = 'SLEEPING'
    let lastFedAt = null
    if (dogResult.rows.length > 0) {
      dogState = dogResult.rows[0].dog_state
      lastFedAt = dogResult.rows[0].last_fed_at
      if (lastFedAt) {
        const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60)
        if (hoursSinceLastFeed >= 72) dogState = 'DEAD'
      }
    }
    
    // Get Qarsan state
    const qarsanResult = await query(
      'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1',
      [userId]
    )
    const qarsanMode = qarsanResult.rows.length > 0 ? qarsanResult.rows[0].mode : 'OFF'
    const walletBalance = qarsanResult.rows.length > 0 ? parseInt(qarsanResult.rows[0].wallet_balance || 0, 10) : 0
    
    // Calculate steal scope
    let stealScope = 'NONE'
    if (dogState === 'SLEEPING') {
      if (qarsanMode === 'RANGED') stealScope = 'QARSAN_WALLET_ONLY'
      else if (qarsanMode === 'EXPOSURE') stealScope = 'ALL_ASSETS'
    }
    
    return res.json({
      success: true,
      userId,
      userEmail,
      qarsanMode,
      walletBalance,
      watchDogState: dogState,
      stealScope,
      lastFedAt
    })
  } catch (err) {
    console.error('[QARSAN] status error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/mode', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {   
    const userId = req.user.id
    const { mode, depositAmount } = req.body || {}
    if (!mode || !['OFF', 'RANGED', 'EXPOSURE'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'invalid_mode' })
    }
    const client = await pool.connect()
    try {   
      await client.query('BEGIN')
      const dogResult = await client.query(
        'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1',
        [userId]
      )
      let dogState = 'SLEEPING'
      if (dogResult.rows.length > 0) {
        dogState = dogResult.rows[0].dog_state
        const lastFedAt = dogResult.rows[0].last_fed_at
        if (lastFedAt) {
          const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60)
          if (hoursSinceLastFeed >= 72) dogState = 'DEAD'
        }
      }
      if (dogState === 'DEAD') {
        await client.query('ROLLBACK')
        return res.status(403).json({ success: false, error: 'DOG_DEAD' })
      }
      let currentMode = 'OFF'
      let currentWallet = 0
      const existing = await client.query(
        'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1',
        [userId]
      )
      if (existing.rows.length > 0) {
        currentMode = existing.rows[0].mode
        currentWallet = parseInt(existing.rows[0].wallet_balance || 0, 10)
      }
      let newWallet = currentWallet
      if (mode === 'RANGED' && depositAmount > 0) {
        const balanceResult = await client.query(
          "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0) as balance FROM ledger WHERE user_id = $1 AND asset_type = 'codes'",
          [userId]
        )
        const balance = parseInt(balanceResult.rows[0]?.balance || 0, 10)
        if (balance < depositAmount) {
          await client.query('ROLLBACK')
          return res.status(400).json({ success: false, error: 'INSUFFICIENT_BALANCE' })
        }
        const txId = crypto.randomUUID()
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'debit', 'codes', $3, 'QARSAN_MODE_CHANGE')",
          [txId, userId, depositAmount]
        )
        newWallet = currentWallet + depositAmount
      }
      await client.query(
        `INSERT INTO qarsan_state (user_id, mode, wallet_balance, updated_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET mode = $2, wallet_balance = $3, updated_at = CURRENT_TIMESTAMP`,
        [userId, mode, newWallet]
      )
      const modeTxId = crypto.randomUUID()
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'debit', 'codes', 0, 'QARSAN_MODE_CHANGE')",
        [modeTxId, userId]
      )
      await client.query(
        "INSERT INTO audit_logs (actor_user_id, event_type, metadata) VALUES ($1, $2, $3)",
        [userId, 'QARSAN_MODE_CHANGE', JSON.stringify({ mode, walletBalance: newWallet, ts: new Date().toISOString() })]
      )
      await client.query('COMMIT')
      sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'mode', mode, walletBalance: newWallet })
      sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      return res.json({ success: true, qarsanMode: mode, walletBalance: newWallet })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

router.post('/attack', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {   
    const attackerId = req.user.id
    const { targetUserId, amount, txId: providedTxId } = req.body || {}
    if (!targetUserId) return res.status(400).json({ success: false, error: 'target_required' })
    if (attackerId === targetUserId) return res.status(400).json({ success: false, error: 'self_attack_not_allowed' })
    if (!providedTxId) return res.status(400).json({ success: false, error: 'txId_required' })
    
    const stealAmount = parseInt(amount || 0, 10)
    if (stealAmount <= 0) return res.status(400).json({ success: false, error: 'invalid_amount' })
    
    const client = await pool.connect()
    try {   
      await client.query('BEGIN')
      const prior = await client.query('SELECT 1 FROM ledger WHERE tx_id = $1 LIMIT 1', [providedTxId])
      if (prior.rows.length > 0) {
        await client.query('ROLLBACK')
        return res.json({ success: true, idempotent: true, amount: 0, message: 'duplicate_tx' })
      }
      
      const targetDogResult = await client.query(
        'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1',
        [targetUserId]
      )
      
      let targetDogState = 'SLEEPING'
      if (targetDogResult.rows.length > 0) {
        targetDogState = targetDogResult.rows[0].dog_state
        const lastFedAt = targetDogResult.rows[0].last_fed_at
        if (lastFedAt) {
          const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60)
          if (hoursSinceLastFeed >= 72) targetDogState = 'DEAD'
        }
      }
      
      if (targetDogState !== 'SLEEPING') {
        await client.query('ROLLBACK')
        return res.status(403).json({ 
          success: false, 
          error: targetDogState === 'ACTIVE' ? 'DOG_ACTIVE' : 'DOG_DEAD',
          message: `Cannot steal from user with ${targetDogState} dog`
        })
      }
      
      const targetQarsanResult = await client.query(
        'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1',
        [targetUserId]
      )
      const targetMode = targetQarsanResult.rows.length > 0 ? targetQarsanResult.rows[0].mode : 'OFF'
      const targetWallet = parseInt(targetQarsanResult.rows[0]?.wallet_balance || 0, 10)
      
      const targetBalanceResult = await client.query(
        "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0) as balance FROM ledger WHERE user_id = $1 AND asset_type = 'codes'",
        [targetUserId]
      )
      const targetBalance = parseInt(targetBalanceResult.rows[0]?.balance || 0, 10)
      
      let stealScope = 'NONE'
      let actualStealAmount = 0
      
      if (targetMode === 'RANGED') {
        stealScope = 'QARSAN_WALLET_ONLY'
        actualStealAmount = Math.min(stealAmount, targetWallet)
      } else if (targetMode === 'EXPOSURE') {
        stealScope = 'ALL_ASSETS'
        actualStealAmount = Math.min(stealAmount, targetBalance + targetWallet)
      }
      
      if (actualStealAmount <= 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ success: false, error: 'NOTHING_TO_STEAL', message: 'Target has no stealable assets' })
      }
      
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'debit', 'codes', $3, 'QARSAN_THEFT_DEBIT')",
        [providedTxId, targetUserId, actualStealAmount]
      )
      
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'codes', $3, 'QARSAN_THEFT_CREDIT')",
        [providedTxId, attackerId, actualStealAmount]
      )
      
      if (stealScope === 'QARSAN_WALLET_ONLY') {
        await client.query(
          "UPDATE qarsan_state SET wallet_balance = MAX(0, wallet_balance - $1), updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
          [actualStealAmount, targetUserId]
        )
      }
      
      await client.query(
        "INSERT INTO audit_logs (actor_user_id, target_user_id, event_type, metadata) VALUES ($1, $2, $3, $4)",
        [attackerId, targetUserId, 'QARSAN_THEFT', JSON.stringify({ amount: actualStealAmount, scope: stealScope, txId: providedTxId, ts: new Date().toISOString() })]
      )
      
      await client.query('COMMIT')
      
      sseEmit(attackerId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      sseEmit(targetUserId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      sseEmit(attackerId, { type: 'QARSAN_UPDATE', action: 'attack', targetUserId, amount: actualStealAmount, txId: providedTxId, scope: stealScope })
      sseEmit(targetUserId, { type: 'QARSAN_UPDATE', action: 'attacked', attackerId, amount: actualStealAmount, txId: providedTxId, scope: stealScope })
      
      return res.json({
        success: true,
        amount: actualStealAmount,
        scope: stealScope,
        message: `Successfully stole ${actualStealAmount} codes`
      })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('[QARSAN] attack error:', err)
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router;
