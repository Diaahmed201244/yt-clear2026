import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { requireAuth, devSessions } from '../middleware/auth.js';
import { sendHybridOTP, verifyHybridOTP, resendOTP } from '../../hybrid-otp-service.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-demo';

function signJwt(userId, email) { 
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

async function sqliteFindUserByEmail(email) {
  try { 
    const normalizedEmail = String(email).toLowerCase().trim();
    const r = await query('SELECT id, email, password_hash, codes_count, silver_count, gold_count, last_sync_at, user_type, is_untrusted FROM users WHERE LOWER(email)=$1', [normalizedEmail]);
    return r.rows[0] || null;
  } catch (e) {
    console.error('[DB ERROR] sqliteFindUserByEmail failed:', e.message);
    throw e;
  }
}

async function createUser(email, username, password, profile = {}) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const hash = await bcrypt.hash(password, 10); 
  const id = crypto.randomUUID();

  try { 
    await query(
      'INSERT INTO users(id, email, username, password_hash, religion, country, phone) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [
        id, 
        normalizedEmail, 
        username || normalizedEmail.split('@')[0], 
        hash,
        profile.religion || null,
        profile.country || null,
        profile.phone || null
      ]
    );
    // Initialize default assets
    await query('INSERT INTO user_assets(user_id, asset_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [id, 'init']);
  } catch(e) {
    console.error('[SIGNUP][DB ERROR]', e.message);
    throw e;
  }
  return { id };
}

// Dev login
router.post('/dev-login', (req, res) => {
  try { 
    const sessionId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    devSessions.set(sessionId, { userId, role: 'dev', sessionId });
    res.cookie('session_token', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    query('INSERT INTO users (id, status, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING', [userId, 'active'])
      .catch(err => console.error('[AUTH] User insert error:', err));
      
    return res.status(200).json({ ok: true, userId, sessionId });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'dev login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try { 
    const token = req.cookies && req.cookies.session_token;
    if (token) devSessions.delete(token);
    res.clearCookie('session_token', { path: '/' });
  } catch(err){ console.error('[AUTH] Logout error:', err) }
  return res.status(200).json({ ok: true });
});

// Hybrid OTP
router.post('/send-hybrid-otp', async (req, res) => {
  try { 
    const { email, phone, countryCode } = req.body;
    if (!email || !phone || !countryCode) {
      return res.status(400).json({ success: false, error: 'Email, phone, and country code are required' });
    }
    const result = await sendHybridOTP({ email, phone, countryCode });
    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        sessionId: result.sessionId,
        channels: result.channels,
        ...(result.mockOtp && { mockOtp: result.mockOtp })
      });
    }
    return res.status(400).json({ success: false, error: result.error });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

router.post('/verify-hybrid-otp', async (req, res) => {
  try { 
    const { sessionId, otp, channel } = req.body;
    if (!sessionId || !otp || !channel) {
      return res.status(400).json({ success: false, error: 'Session ID, OTP, and channel are required' });
    }
    const result = await verifyHybridOTP(sessionId, otp, channel);
    if (result.success) {
      return res.json(result);
    }
    return res.status(400).json({ success: false, error: result.error });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

router.post('/resend-otp', async (req, res) => {
  try { 
    const { sessionId, channel } = req.body;
    const result = await resendOTP(sessionId, channel);
    if (result.success) return res.json({ success: true, message: `OTP resent via ${channel}` });
    return res.status(400).json({ success: false, error: result.error });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to resend OTP' });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try { 
    const { email, username, password, religion, country, phone, countryCode } = req.body;
    if (!email || !password || !religion || !country || !phone) {
      return res.status(400).json({ status: 'failed', error: 'All fields are required' });
    }
    
    const existing = await sqliteFindUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'USER_EXISTS', message: 'An account with this email already exists.' });
    }

    const formattedPhone = (phone && countryCode) ? `${countryCode}${phone.replace(/\D/g, '')}` : phone;
    const created = await createUser(email, username, password, { religion, country, phone: formattedPhone });
    
    const token = signJwt(created.id, email);
    const newSessionId = crypto.randomUUID();
    
    devSessions.set(newSessionId, {
      userId: created.id,
      role: 'user',
      sessionId: newSessionId,
      email,
      phone: formattedPhone,
      verified: true
    });
    
    res.cookie('session_token', newSessionId, {
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    return res.json({ 
      status: 'success', 
      userId: created.id, 
      token,
      sessionId: newSessionId,
      user: { id: created.id, email, username, religion, country, phone: formattedPhone, verified: true }
    });
  } catch (err) {
    res.status(500).json({ status: 'failed', error: err.message || 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try { 
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ status: 'failed', error: 'Email and password required' });

    const u = await sqliteFindUserByEmail(email);
    if (!u || !u.password_hash) {
      return res.status(401).json({ status: 'failed', error: 'Invalid credentials' });
    }

    let storedHash = String(u.password_hash).trim();
    if (storedHash.startsWith('$2y$')) storedHash = '$2a$' + storedHash.substring(4);
    
    const ok = await bcrypt.compare(String(password).trim(), storedHash);
    if (!ok) return res.status(401).json({ status: 'failed', error: 'Invalid credentials' });

    const token = signJwt(u.id, u.email);
    const sessionId = crypto.randomUUID();

    devSessions.set(sessionId, {
      userId: u.id,
      role: u.user_type || 'user',
      sessionId,
      email: u.email,
      isUntrusted: u.is_untrusted || false
    });

    res.cookie('session_token', sessionId, {
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ 
      status: 'success', 
      userId: u.id, 
      token, 
      sessionId,
      user: { id: u.id, email: u.email, username: u.username, role: u.user_type || 'user' }
    });
  } catch (err) {
    res.status(500).json({ status: 'failed', error: 'Login failed' });
  }
});

// Me
router.get('/me', async (req, res) => {
  const sessionId = req.cookies?.session_token || req.cookies?.sessionId || req.headers.authorization?.replace('Bearer ', '');
  
  console.log('[Auth] /api/auth/me called, sessionId:', sessionId ? 'present' : 'missing');
  
  if (!sessionId) {
    return res.json({ 
      authenticated: false,
      status: 'unauthenticated',
      userId: null,
      sessionId: null,
      user: null 
    });
  }

  try { 
    // 1. Check in-memory devSessions
    const memSession = devSessions.get(sessionId);
    if (memSession) {
      console.log('[Auth] Valid memory session found for user:', memSession.userId);
      return res.json({
        authenticated: true,
        status: 'authenticated',
        userId: memSession.userId,
        sessionId: sessionId,
        user: { id: memSession.userId, email: memSession.email, role: memSession.role || 'user' }
      });
    }

    // 2. Check database auth_sessions
    const dbSession = await query('SELECT user_id, expires_at FROM auth_sessions WHERE token = $1 OR token_hash = $2', [sessionId, sessionId]);
    if (dbSession.rows && dbSession.rows.length > 0 && new Date() < new Date(dbSession.rows[0].expires_at)) {
      const userId = dbSession.rows[0].user_id;
      const userRes = await query('SELECT email, username, user_type FROM users WHERE id = $1', [userId]);
      if (userRes.rows && userRes.rows.length > 0) {
        console.log('[Auth] Valid DB session found for user:', userId);
        return res.json({
          authenticated: true,
          status: 'authenticated',
          userId: userId,
          sessionId: sessionId,
          user: { id: userId, email: userRes.rows[0].email, username: userRes.rows[0].username, role: userRes.rows[0].user_type }
        });
      }
    }

    // 3. Fallback to unauthenticated
    console.log('[Auth] Session not found or expired:', sessionId);
    res.json({
      authenticated: false,
      status: 'unauthenticated',
      userId: null,
      sessionId: null,
      user: null
    });

  } catch (err) {
    console.error('[Auth] Error validating session:', err);
    res.json({
      authenticated: false,
      status: 'error',
      userId: null,
      sessionId: null,
      user: null
    });
  }
});

// ACC Token - short-lived JWT scoped to ACC, called by acc-adapter.js after login
router.post('/acc-token', requireAuth, (req, res) => {
  try { 
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const accToken = jwt.sign({ userId, scope: 'acc' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token: accToken, userId });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
