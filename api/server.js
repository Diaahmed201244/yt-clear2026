import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { featureFlags, setFlag } from './config/flags.js'
import * as rewardsMod from './modules/rewards.js'
import * as logicodeMod from './modules/logicode.js'
import * as corsaMod from './modules/corsa.js'
import * as monetizationMod from './modules/monetization.js'
import * as samma3nyMod from './modules/samma3ny.js'
import * as nostagliaMod from './modules/nostaglia.js'
import * as pebalaashMod from './modules/pebalaash.js'
import * as adminMod from './modules/admin.js'
import * as testMod from './modules/test.js'
import farragnaDefault, { webhookCloudflare as farragnaWebhook } from './modules/farragna.js'
// Clerk removed: zero-auth mode
import { query } from './config/db.js'
import * as codesMod from './modules/codes.js'
import settaDefault from './modules/setta.js'

const router = express.Router()

router.use(cookieParser())
router.use(express.json())
router.use(cors({ origin: true, credentials: true }))

// Feature flags from singleton config

// API-wide rate limit: 100 req/min per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ ok: false, error: 'RATE_LIMIT_EXCEEDED' })
  }
})
router.use(apiLimiter)

// Ensure Neon schema exists
async function ensureSchema() {
  const ddl = [
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      country TEXT,
      language TEXT,
      religion TEXT,
      user_type TEXT DEFAULT 'normal',
      disabled BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT now()
    )`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`,
    `CREATE TABLE IF NOT EXISTS codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      code_value TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL, -- yt-new / game / reward
      created_at TIMESTAMP DEFAULT now(),
      expires_at TIMESTAMP,
      metadata JSONB
    )`,
    `CREATE TABLE IF NOT EXISTS identity_state (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      last_seen TIMESTAMP DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_user_id UUID,
      actor_role TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      metadata JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS bankode_users (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      gate_password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS bankode_password_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS farragna_videos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
      stream_uid TEXT UNIQUE NOT NULL,
      playback_url TEXT,
      status TEXT NOT NULL,
      duration INTEGER,
      size BIGINT,
      views_count INTEGER DEFAULT 0,
      rewards_earned INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS farragna_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      video_id UUID REFERENCES farragna_videos(id) ON DELETE CASCADE,
      viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT now(),
      UNIQUE (video_id, viewer_id)
    )`,
    `CREATE TABLE IF NOT EXISTS reward_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      meta JSONB,
      created_at TIMESTAMP DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS user_rewards (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      balance INTEGER DEFAULT 0,
      last_updated TIMESTAMP DEFAULT now()
    )`
  ]
  for (const sql of ddl) {
    try {  await query(sql) } catch (e) { /* ignore for dev/no-db */ }
  }
  try { 
    await query(`CREATE TABLE IF NOT EXISTS samma3ny_songs (
      id TEXT PRIMARY KEY,
      name TEXT,
      position INTEGER,
      metadata JSONB,
      updated_at TIMESTAMP DEFAULT now()
    )`)
  } catch (e) {}
}
ensureSchema().catch(() => {})

router.post('/neon/assets/save', async (req, res) => {
  try { 
    const { userId, codes, rewards, source, ts } = req.body || {}
    if (!userId) return res.status(400).json({ error: 'Missing userId' })
    const u = await query('SELECT id FROM users WHERE id=$1 LIMIT 1', [userId])
    if (!u?.rows?.[0]) return res.status(404).json({ error: 'User not found' })
    const list = Array.isArray(codes) ? codes : []
    const nowExp = new Date(Date.now() + (24 * 60 * 60 * 1000))
    let saved = 0
    for (const c of list) {
      if (typeof c !== 'string') continue
      if (c.length !== 26) continue
      if (!/^[A-Z0-9]+$/.test(c)) continue
      const dup = await query('SELECT id FROM codes WHERE code_value=$1', [c])
      if (dup?.rows?.length) continue
      try { 
        await query(
          'INSERT INTO codes (user_id, code_value, source, expires_at, metadata) VALUES ($1,$2,$3,$4,$5)',
          [userId, c, source || 'neon', nowExp, { ts }]
        )
        saved++
      } catch (e) {}
    }
    return res.status(200).json({ ok: true, saved })
  } catch (e) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

const testRouter = testMod.default || testMod.router || testMod
const rewardsRouter = rewardsMod.default || rewardsMod.router || rewardsMod
const farragnaRouter = farragnaDefault || farragnaDefault?.router || farragnaDefault
const logicodeRouter = logicodeMod.default || logicodeMod.router || logicodeMod
const corsaRouter = corsaMod.default || corsaMod.router || corsaMod
const monetizationRouter = monetizationMod.default || monetizationMod.router || monetizationMod
const samma3nyRouter = samma3nyMod.default || samma3nyMod.router || samma3nyMod
const nostagliaRouter = nostagliaMod.default || nostagliaMod.router || nostagliaMod
const pebalaashRouter = pebalaashMod.default || pebalaashMod.router || pebalaashMod
const codesRouter = codesMod.default || codesMod.router || codesMod
const settaRouter = settaDefault || settaDefault?.router || settaDefault

router.use('/test', testRouter)

// Public health/version endpoints
router.get('/health', (req, res) => {
  res.json({ ok: true })
})
router.get('/version', (req, res) => {
  res.json({ version: process.env.APP_VERSION || 'dev' })
})

// YouTube status proxy with safe fallback
router.get('/youtube/status', async (req, res) => {
  try { 
    const channelId = process.env.YOUTUBE_CHANNEL_ID || 'UCZ5heNyv3s5dIw9mtjsAGsg'
    const apiKey = process.env.YOUTUBE_API_KEY
    if (apiKey) {
      try { 
        const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`)
        if (r.ok) {
          const j = await r.json()
          const subs = parseInt(j?.items?.[0]?.statistics?.subscriberCount || '0', 10)
          const isMonetized = subs >= 1000
          const progressPercentage = Math.min((subs / 1000) * 100, 100)
          const remainingSubscribers = Math.max(1000 - subs, 0)
          return res.json({ subscribers: subs, isMonetized, progressPercentage, remainingSubscribers })
        }
      } catch (_) {}
    }
    return res.json({ subscribers: 0, isMonetized: false, progressPercentage: 0, remainingSubscribers: 1000 })
  } catch (_) {
    return res.json({ subscribers: 0, isMonetized: false, progressPercentage: 0, remainingSubscribers: 1000 })
  }
})

// Feature flags introspection and mutation
router.get('/flags', (_req, res) => {
  res.json({ ok: true, flags: featureFlags })
})
router.post('/flags', (req, res) => {
  const { key, value } = req.body || {}
  if (!(key in featureFlags)) {
    return res.status(400).json({ ok: false, error: 'UNKNOWN_FLAG' })
  }
  setFlag(key, value)
  res.json({ ok: true, flags: featureFlags })
})

// Farragna webhook (no auth)
router.post('/farragna/webhook/cloudflare', farragnaWebhook)

// Zero-auth mode: routes are public in development
router.use('/codes', codesRouter)
router.use('/setta', settaRouter)
router.use('/rewards', rewardsRouter)
router.use('/logicode', logicodeRouter)
router.use('/corsa', corsaRouter)
router.use('/monetization', monetizationRouter)
router.use('/samma3ny', samma3nyRouter)
router.use('/pebalaash', pebalaashRouter)
router.use('/farragna', farragnaRouter)
router.use('/admin', (adminMod.default || adminMod.router || adminMod))

router.post('/identity/sync', async (req, res) => {
  try { 
    const { name, country, religion, telephone, email, userId } = req.body || {}
    if (!email && !userId) return res.json({ ok: true })
    try { 
      const col = userId ? 'id' : 'email'
      await query(
        `UPDATE users SET name = $1, country = $2, religion = $3, phone = $4 WHERE ${col} = $5`,
        [name || null, country || null, religion || null, telephone || null, userId || email]
      )
    } catch (_) {}
    res.json({ ok: true })
  } catch (e) {
    res.json({ ok: true })
  }
})

// Global error silencing (JSON-safe)
router.use((err, _req, res, _next) => {
  try {  console.error('[API]', err?.message || err) } catch (_) {}
  res.status(500).json({ ok: false, error: 'INTERNAL_SERVER_ERROR' })
})

export default router
