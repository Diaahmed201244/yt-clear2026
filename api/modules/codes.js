import { Router } from 'express'

const router = Router()

// Configuration
}

// Rate limiting storage (in-memory for now, should use Redis in production)
const rateLimitStore = new Map()

function checkRateLimit(userId) {
  const lastCodeTime = rateLimitStore.get(userId)
  const now = Date.now()
  
  if (lastCodeTime && (now - lastCodeTime) < (RATE_LIMIT_SECONDS * 1000)) {
    return false
  }
  
  rateLimitStore.set(userId, now)
  return true
}

// New autosave endpoint for Phase 3
router.post('/save', async (req, res) => {

  const { code, source, metadata } = req.body
  
  // Input validation
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ ok: false, error: 'INVALID_CODE' })
  }
  
  
  if (!source || !['yt-new', 'game', 'reward'].includes(source)) {
    return res.status(400).json({ ok: false, error: 'INVALID_SOURCE' })
  }

  try {
    // Check rate limiting
    if (!checkRateLimit(identity.userId)) {
      return res.status(429).json({ ok: false, error: 'RATE_LIMIT_EXCEEDED' })
    }

      [code]
    )
    
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ ok: false, error: 'DUPLICATE_CODE' })
    }

      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    })

    res.json({
      ok: true,
    })
  } catch (error) {
    console.error('[CODE SAVE] Error:', error)
    res.status(500).json({ ok: false, error: 'INTERNAL_SERVER_ERROR' })
  }
})

// Legacy endpoints for backward compatibility (can be removed later)
router.get('/last', async (req, res) => {
      [identity.userId]
    )
    if (!r.rows[0]) return res.status(404).end()
    res.json(r.rows[0])
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch last code' })
  }
})

router.post('/generate', async (req, res) => {
  
  // Check rate limiting
  if (!checkRateLimit(identity.userId)) {
    return res.status(429).json({ ok: false, error: 'RATE_LIMIT_EXCEEDED' })
  }

  try {
    const code = generateCode()
    )

    const savedCode = result.rows[0]

    // Audit logging
    await auditLog({
      actor_user_id: identity.userId,
      actor_role: 'user',
      action: 'CODE_GENERATED',
      target_type: 'code',
      target_id: savedCode.id,
      metadata: {
        code_length: code.length,
        source: 'legacy'
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    })

    res.json({
      created_at: savedCode.created_at,
      expires_at: savedCode.expires_at
    })
  } catch (e) {
    console.error('[CODE GENERATION] Error:', e)
    res.status(500).json({ message: 'Generation failed' })
  }
})

    const senderResult = await query(
      'SELECT email FROM users WHERE id = $1',
      [identity.userId]
    )
    
    if (senderResult.rows.length > 0 && senderResult.rows[0].email.toLowerCase() === receiverEmail.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'CANNOT_SEND_TO_SELF' })
    }
    const receiverResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [receiverEmail.toLowerCase()]
    )
    
    if (receiverResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'RECEIVER_NOT_FOUND' })
    }

    const receiverId = receiverResult.rows[0].id

    // Verify sender owns the codes
    const codesToSend = []
    for (const code of codes) {
      const codeResult = await query(
        [code, identity.userId]
      )
      
      if (codeResult.rows.length > 0) {
        codesToSend.push(codeResult.rows[0])
      }
    }

    if (codesToSend.length === 0) {
      return res.status(403).json({ success: false, message: 'NO_CODES_OWNED' })
    }

    // Transfer codes to receiver
    for (const codeData of codesToSend) {
      await query(
        'UPDATE codes SET user_id = $1 WHERE id = $2',
        [receiverId, codeData.id]
      )

      // Audit logging
      await auditLog({
        actor_user_id: identity.userId,
        actor_role: 'user',
        action: 'CODE_SENT',
        target_type: 'code',
        target_id: codeData.id,
        metadata: {
          receiver_email: receiverEmail,
          receiver_id: receiverId
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      })
    }

    res.json({
      success: true,
      message: 'CODES_SENT_SUCCESSFULLY',
      sentCodesCount: codesToSend.length,
      receiverEmail: receiverEmail
    })
  }
})

export default router
