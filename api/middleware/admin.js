import rateLimit from 'express-rate-limit'
import { query } from '../config/db.js'

const ROLE_ORDER = { normal: 0, admin: 1, superadmin: 2 }

      return res.status(403).json({ ok: false, error: 'FORBIDDEN' })
    }
    next()
  }
}

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ ok: false, error: 'RATE_LIMIT_EXCEEDED' })
})

export function requireGateValid() {
  return async (req, res, next) => {
    try {   
      // If no user is authenticated, return 401 instead of 403
      if (!req.user) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' })
      
      const r = await query('SELECT 1 FROM bankode_password_sessions WHERE user_id=$1 AND expires_at > now() ORDER BY created_at DESC LIMIT 1', [req.user.clerkUserId])
      if (!r.rowCount) return res.status(403).json({ ok: false, error: 'GATE_REQUIRED' })
      next()
    } catch (e) {
      return res.status(500).json({ ok: false, error: 'ADMIN_INTERNAL_ERROR' })
    }
  }
}