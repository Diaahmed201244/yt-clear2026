import { Router } from 'express'
import bcrypt from 'bcryptjs'

const router = Router()

router.use(adminLimiter)

// View audit logs with filters and pagination
router.get('/audit', requireRole('admin'), async (req, res) => {
  const { action, actor, from, to, page = 1, page_size = 50 } = req.query || {}
  const where = []
  const params = []
  let idx = 1
  if (action) { where.push(`action = $${idx++}`); params.push(action) }
  if (actor) { where.push(`actor_user_id = $${idx++}`); params.push(actor) }
  if (from) { where.push(`created_at >= $${idx++}`); params.push(new Date(from)) }
  if (to) { where.push(`created_at <= $${idx++}`); params.push(new Date(to)) }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const limit = Math.min(parseInt(page_size, 10) || 50, 200)
  const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit
  try {
    const rows = await query(
      `SELECT id, actor_user_id, actor_role, action, target_type, target_id, metadata, ip_address, user_agent, created_at
       FROM audit_logs ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    )
    res.json({ ok: true, logs: rows.rows })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_AUDIT_FETCH_FAILED' })
  }
})

// View users (read-only)
router.get('/users', requireRole('admin'), async (_req, res) => {
  try {
    const r = await query('SELECT id, email, user_type, disabled, created_at FROM users ORDER BY created_at DESC LIMIT 500', [])
    res.json({ ok: true, users: r.rows })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_USERS_FETCH_FAILED' })
  }
})

// Disable user (SUPERADMIN)
router.post('/users/:id/disable', requireGateValid(), requireRole('superadmin'), async (req, res) => {
  const { id } = req.params
  try {
    await audit(req, { action: 'USER_DISABLED', target_type: 'user', target_id: id })
    await audit(req, { action: 'SESSION_REVOKED', target_type: 'user', target_id: id })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_USER_DISABLE_FAILED' })
  }
})

// Enable user (SUPERADMIN)
router.post('/users/:id/enable', requireGateValid(), requireRole('superadmin'), async (req, res) => {
  const { id } = req.params
  try {
    await audit(req, { action: 'USER_ENABLED', target_type: 'user', target_id: id })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_USER_ENABLE_FAILED' })
  }
})

// Feature Flags control (ADMIN+)
router.post('/flags', requireGateValid(), requireRole('admin'), async (req, res) => {
  const { key, value } = req.body || {}
  if (!(key in featureFlags)) {
    return res.status(400).json({ ok: false, error: 'UNKNOWN_FLAG' })
  }
  const ok = setFlag(key, value)
  if (ok) {
    await audit(req, { action: 'FEATURE_FLAG_CHANGED', target_type: 'flag', target_id: key, metadata: { value: !!value } })
  }
  res.json({ ok: true, flags: featureFlags })
})

// Admin router error handler
router.use((err, _req, res, _next) => {
  res.status(500).json({ ok: false, error: 'ADMIN_INTERNAL_ERROR' })
})

// Bankode Gate verify (ADMIN+)
router.post('/bankode/verify', requireRole('admin'), async (req, res) => {
  const { password } = req.body || {}
  if (!password) return res.status(400).json({ ok: false, error: 'INVALID_INPUT' })
  try {
    const uid = req.user?.clerkUserId
    if (!uid) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' })
    let hash
    try {
      const r = await query('SELECT gate_password_hash FROM bankode_users WHERE user_id=$1', [uid])
      hash = r.rows[0]?.gate_password_hash
      if (!hash) {
        const u = await query('SELECT password_hash FROM users WHERE clerk_user_id=$1', [uid])
        hash = u.rows[0]?.password_hash || null
      }
    } catch (_) {}
    if (!hash) return res.status(500).json({ ok: false, error: 'NO_GATE_PASSWORD' })
    const valid = await bcrypt.compare(password, hash)
    if (!valid) {
      await audit(req, { action: 'ADMIN_GATE_INVALID', target_type: 'user', target_id: uid })
      return res.json({ ok: false, error: 'INVALID_PASSWORD' })
    }
    const expires = new Date(Date.now() + 5 * 60 * 1000)
    try {
      await query('INSERT INTO bankode_password_sessions (user_id, expires_at) VALUES ($1,$2)', [uid, expires])
    } catch (_) {}
    await audit(req, { action: 'ADMIN_GATE_VERIFIED', target_type: 'user', target_id: uid, metadata: { expires: expires.toISOString() } })
    res.json({ ok: true, expiry: expires.toISOString() })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_GATE_VERIFY_FAILED' })
  }
})

// Farragna moderation (Bankode protected)
router.get('/farragna/videos', requireGateValid(), requireRole('admin'), async (_req, res) => {
  try {
    const r = await query(
      `SELECT id, owner_id, stream_uid, status, playback_url, views_count, rewards_earned, created_at
       FROM farragna_videos
       ORDER BY created_at DESC
       LIMIT 200`,
      []
    )
    res.json({ ok: true, videos: r.rows })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_FARRAGNA_LIST_FAILED' })
  }
})

router.patch('/farragna/:id/hide', requireGateValid(), requireRole('admin'), async (req, res) => {
  const { id } = req.params
  try {
    await query('UPDATE farragna_videos SET status=$2 WHERE id=$1', [id, 'hidden'])
    await audit(req, { action: 'FARRAGNA_HIDE', target_type: 'video', target_id: id })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_FARRAGNA_HIDE_FAILED' })
  }
})

router.patch('/farragna/:id/restore', requireGateValid(), requireRole('admin'), async (req, res) => {
  const { id } = req.params
  try {
    await query('UPDATE farragna_videos SET status=$2 WHERE id=$1 AND status=$3', [id, 'ready', 'hidden'])
    await audit(req, { action: 'FARRAGNA_RESTORE', target_type: 'video', target_id: id })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_FARRAGNA_RESTORE_FAILED' })
  }
})

router.delete('/farragna/:id', requireGateValid(), requireRole('admin'), async (req, res) => {
  const { id } = req.params
  try {
    await query('DELETE FROM farragna_views WHERE video_id=$1', [id])
    await query('DELETE FROM farragna_videos WHERE id=$1', [id])
    await audit(req, { action: 'FARRAGNA_DELETE', target_type: 'video', target_id: id })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'ADMIN_FARRAGNA_DELETE_FAILED' })
  }
})

export default router
