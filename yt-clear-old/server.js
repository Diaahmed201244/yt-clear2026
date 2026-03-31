import dotenv from 'dotenv';
// Configure environment variables
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import cloudinary from 'cloudinary';
import multer from 'multer';
import puppeteer from 'puppeteer';
import { handleSamma3nySongs } from './api/samma3ny/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
// Clerk removed: zero-auth mode


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// AUTH REMOVED — CLEAN RESET
import { AuthService } from './core/auth/auth-service.js';
import { requireAuth, optionalAuth } from './core/auth/auth-middleware.js';
import { AssetsKernel } from './core/assets/assets-kernel.js';
import { AssetReadonly } from './core/assets/asset-readonly.js';
import { assetsBus } from './ledger/local-assets-bus.js';

// Development CSP middleware
// CodeBank specific CSP middleware
const PORT = process.env.PORT || 3001;

let dbPool = null;
async function getDb() {
  if (dbPool) return dbPool;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const { Pool } = await import('pg');
    dbPool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    return dbPool;
  } catch (_) {
    return null;
  }
}

async function dbQuery(sql, params = []) {
  const pool = await getDb();
  if (!pool) throw new Error('DB unavailable');
  const client = await pool.connect();
  try { const res = await client.query(sql, params); return res; } finally { client.release(); }
}

// AUTH REMOVED — CLEAN RESET

// Configure multer for file uploads (support multiple files)
const upload = multer({
  dest: '/tmp/',
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB per file (increased for high-quality audio)
    files: 2000, // Maximum 2000 files at once (as requested)
    fieldSize: 200 * 1024 * 1024, // 200MB field size
    fields: 10 // Allow multiple form fields
  },
  fileFilter: (req, file, cb) => {
    // Allow any file type for now (we'll validate in the handler)
    cb(null, true);
  }
});

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhpyneqgk',
  api_key: process.env.CLOUDINARY_API_KEY || '799518422494748',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'zfSbK0-zK3tHdmCWdcCduPcxtU4'
});

// Middleware
// Helmet removed

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.options('*', cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(cookieParser());
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true }));
// Note: upload.any() is applied only to specific upload routes below

// In-memory dev sessions
const devSessions = new Map();

function readSessionFromCookie(req) {
  try {
    const token = (req.cookies && req.cookies.session_token) || null;
    if (!token) return null;
    const s = devSessions.get(token);
    return s || null;
  } catch (_) {
    return null;
  }
}

const JWT_SECRET = 'secret-demo';
function signJwt(userId, email) { return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' }) }
function requireJwtAuth(req, res, next) { try { const h = req.headers.authorization || ''; const parts = h.split(' '); if (parts[0] !== 'Bearer' || !parts[1]) return res.status(401).json({ status: 'failed', error: 'Unauthorized' }); const decoded = jwt.verify(parts[1], JWT_SECRET); req.auth = { userId: decoded.userId, email: decoded.email }; next() } catch (e) { return res.status(401).json({ status: 'failed', error: 'Unauthorized' }) } }
const __authUsers = new Map(); // email -> { id, email, username, password_hash }
let __USER_SEQ = 1000;
async function neonFindUserByEmail(email){
  const { Pool } = await import('pg')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  const client = await pool.connect()
  try {
    const r = await client.query('SELECT id, email, password_hash, balance FROM users WHERE email=$1', [email])
    return r.rows[0] || null
  } finally { client.release(); await pool.end() }
}
function memFindUserByEmail(email){ return __authUsers.get(email) || null }
async function memCreateUser(email, username, password){
  const hash = await bcrypt.hash(password, 8)
  let id
  if (process.env.DATABASE_URL) {
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    const client = await pool.connect()
    try {
      const existing = await client.query('SELECT id FROM users WHERE email=$1', [email])
      if (existing.rows[0]) {
        id = existing.rows[0].id
      } else {
        const r = await client.query('INSERT INTO users(email, password_hash) VALUES($1,$2) RETURNING id', [email, hash])
        id = r.rows[0].id
        try { await client.query('INSERT INTO balances(user_id, balance) VALUES($1,$2) ON CONFLICT (user_id) DO UPDATE SET balance=$2', [id, 100]) } catch(_){ }
      }
      try { await client.query('INSERT INTO user_assets(user_id, asset_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [id, 'init']) } catch(_){ }
    } catch(e) {
      try { console.error('[SIGNUP][DB]', e && e.message ? e.message : e) } catch(_){}
      id = ++__USER_SEQ
    } finally { client.release(); await pool.end() }
  } else {
    id = ++__USER_SEQ
  }
  __authUsers.set(email, { id, email, username: username || null, password_hash: hash })
  if (!usersManager.getUser(id)) usersManager.addUser({ id, balance: 100, assets: [] })
  return { id }
}

// Transaction-Core bootstrap (PolicyEngine + Managers)
import { Ledger } from './transaction-core/core/Ledger.js'
import { UsersManager } from './transaction-core/core/UsersManager.js'
import { BankodeManager } from './transaction-core/core/BankodeManager.js'
import { TransactionManager } from './transaction-core/core/TransactionManager.js'
import { NeonClient } from './transaction-core/persistence/NeonClient.js'
import { UsersRepository } from './transaction-core/persistence/UsersRepository.js'
import { LedgerRepository } from './transaction-core/persistence/LedgerRepository.js'
import { BankodeRepository } from './transaction-core/persistence/BankodeRepository.js'
import { PolicyEngine } from './transaction-core/policy-engine/PolicyEngine.js'
import { LikePolicy } from './transaction-core/policies/LikePolicy.js'
import { GameRewardPolicy } from './transaction-core/policies/GameRewardPolicy.js'
import { StorePolicy } from './transaction-core/policies/StorePolicy.js'
import { CreatorIncentivePolicy } from './transaction-core/policies/CreatorIncentivePolicy.js'

const ledger = new Ledger()
const usersManager = new UsersManager()
const bankodeManager = new BankodeManager()
let transactionManager = new TransactionManager(usersManager, bankodeManager, ledger)

// Optionally bind Neon repositories for atomic DB writes
try {
  if (process.env.DATABASE_URL) {
    async function ensureCoreTables() {
      const { Pool } = await import('pg')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
      const client = await pool.connect()
      try {
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
        await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`)
        await client.query(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE, password_hash TEXT)`)
        await client.query(`CREATE TABLE IF NOT EXISTS user_assets (user_id UUID NOT NULL, asset_id TEXT NOT NULL, PRIMARY KEY(user_id, asset_id))`)
        await client.query(`CREATE TABLE IF NOT EXISTS bankode (balance NUMERIC NOT NULL DEFAULT 0)`)
        await client.query(`CREATE TABLE IF NOT EXISTS event_vault (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_type TEXT NOT NULL,
          version TEXT NOT NULL DEFAULT '1.0',
          actor_user_id UUID,
          target_user_id UUID,
          amount NUMERIC,
          asset_id TEXT,
          metadata JSONB,
          status TEXT NOT NULL DEFAULT 'success',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          tx_hash TEXT UNIQUE
        )`)
        await client.query(`CREATE TABLE IF NOT EXISTS ledger (
          id UUID PRIMARY KEY,
          event_type TEXT NOT NULL,
          from_user UUID,
          to_user UUID,
          amount NUMERIC,
          asset_id TEXT,
          status TEXT,
          timestamp TIMESTAMPTZ NOT NULL
        )`)
        await client.query(`CREATE TABLE IF NOT EXISTS balances (
          user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          balance NUMERIC NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`)
        await client.query(`CREATE TABLE IF NOT EXISTS codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          session_id TEXT,
          code TEXT NOT NULL,
          suffix TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`)
        // Ensure compatibility with existing schema variants
        await client.query(`ALTER TABLE IF EXISTS codes ADD COLUMN IF NOT EXISTS code TEXT`)
        await client.query(`ALTER TABLE IF EXISTS codes ADD COLUMN IF NOT EXISTS suffix TEXT`)
        await client.query(`ALTER TABLE IF EXISTS codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()`)
        await client.query(`UPDATE codes SET code = COALESCE(code, code_value) WHERE code IS NULL AND code_value IS NOT NULL`)
        await client.query(`UPDATE codes SET suffix = COALESCE(suffix, substring(COALESCE(code, code_value) FROM '(P[0-9])$')) WHERE COALESCE(suffix,'') = ''`)
        const r = await client.query('SELECT COUNT(*) AS c FROM bankode')
        if (r.rows[0].c === '0') { await client.query('INSERT INTO bankode(balance) VALUES (0)') }
      } finally { client.release(); await pool.end() }
    }
    await ensureCoreTables()
    const neon = new NeonClient()
    const { EventVaultRepository } = await import('./transaction-core/persistence/EventVaultRepository.js')
    const { BalancesRepository } = await import('./transaction-core/persistence/BalancesRepository.js')
    const repos = {
      eventVaultRepo: new EventVaultRepository(neon),
      ledgerRepo: new LedgerRepository(neon),
      balancesRepo: new BalancesRepository(neon),
      usersRepo: new UsersRepository(neon),
      bankodeRepo: new BankodeRepository(neon)
    }
    transactionManager = new TransactionManager(usersManager, bankodeManager, ledger, repos)
  }
} catch (e) { console.warn('[NEON] binding skipped:', e?.message) }

// Register baseline policies
const policyEngine = new PolicyEngine(transactionManager)
policyEngine.register('like', new LikePolicy(transactionManager))
policyEngine.register('gameReward', new GameRewardPolicy(transactionManager))
policyEngine.register('storePurchase', new StorePolicy(transactionManager))
policyEngine.register('creatorIncentive', new CreatorIncentivePolicy(transactionManager))

// DEV auth endpoints (must precede any /api catch-all)
app.post('/api/auth/dev-login', (req, res) => {
  try {
    const sessionId = (crypto && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    const userId = (crypto && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    devSessions.set(sessionId, { userId, role: 'dev', sessionId });
    res.cookie('session_token', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    try { console.log('[AUTH] dev login success'); } catch(_){}
    try {
      if (process.env.DATABASE_URL) {
        const insertUser = async () => {
          const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
          await NeonAdapter.query(
            'INSERT INTO users (id, status, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING',
            [userId, 'active']
          )
        }
        insertUser().catch(() => {})
      }
    } catch(_){ }
    return res.status(200).json({ ok: true, userId, sessionId });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'dev login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const token = req.cookies && req.cookies.session_token;
    if (token) devSessions.delete(token);
    res.clearCookie('session_token', { path: '/' });
    try { console.log('[AUTH] logout success'); } catch(_){}
  } catch(_){}
  return res.status(200).json({ ok: true });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ status: 'failed', error: 'Email and password required' })
    const exists = process.env.DATABASE_URL ? await neonFindUserByEmail(email) : memFindUserByEmail(email)
    if (exists) return res.status(400).json({ status: 'failed', error: 'User already exists' })
    const created = await memCreateUser(email, username, password)
    const token = signJwt(created.id, email)
    try {
      const sessionId = (crypto && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : Math.random().toString(36).slice(2)
      devSessions.set(sessionId, { userId: created.id, role: 'user', sessionId })
      res.cookie('session_token', sessionId, { httpOnly: true, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 })
    } catch(_){ }
    return res.json({ status: 'success', userId: created.id, token })
  } catch (err) {
    console.error('Signup Error:', err)
    return res.status(500).json({ status: 'failed', error: 'Signup failed' })
  }
})

// Dev auth: whoami
app.get('/api/auth/me', (req, res) => {
  try {
    const token = (req.cookies && req.cookies.session_token) || null;
    if (!token) return res.json({ user: null });
    const s = devSessions.get(token);
    if (!s) return res.json({ user: null });
    return res.json({ user: { id: s.userId, sessionId: s.sessionId, role: s.role } });
  } catch (_) {
    return res.json({ user: null });
  }
});

// Alias: session info
app.get('/api/me', (req, res) => {
  try {
    const token = (req.cookies && req.cookies.session_token) || null;
    if (!token) return res.json({ user: null });
    const s = devSessions.get(token);
    if (!s) return res.json({ user: null });
    return res.json({ user: { id: s.userId, sessionId: s.sessionId, role: s.role } });
  } catch (_) {
    return res.json({ user: null });
  }
});

app.post('/api/auth/login-v2-disabled', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ status: 'failed', error: 'Email and password required' })
    const u = process.env.DATABASE_URL ? await neonFindUserByEmail(email) : memFindUserByEmail(email)
    if (!u) return res.status(401).json({ status: 'failed', error: 'Invalid credentials' })
    const ok = u.password_hash ? (await bcrypt.compare(password, u.password_hash)) : true
    if (!ok) return res.status(401).json({ status: 'failed', error: 'Invalid credentials' })
    const token = signJwt(u.id, u.email)
    
    // Always set session cookie on successful login
    const sessionId = (crypto && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    devSessions.set(sessionId, { userId: u.id, role: 'user', sessionId, email: u.email })
    res.cookie('session_token', sessionId, { 
      httpOnly: true, 
      path: '/', 
      sameSite: 'lax', 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    })
    
    console.log('[AUTH] Login success - userId:', u.id, 'sessionId:', sessionId)
    return res.json({ status: 'success', userId: u.id, token, sessionId })
  } catch (err) {
    console.error('Login Error:', err)
    return res.status(500).json({ status: 'failed', error: 'Login failed' })
  }
})

app.get('/api/users/resolve', async (req, res) => {
  try {
    const email = (req.query.email || '').trim()
    if (!email) return res.status(400).json({ status: 'failed', error: 'Email required' })
    const u = process.env.DATABASE_URL ? await neonFindUserByEmail(email) : memFindUserByEmail(email)
    if (!u) return res.status(404).json({ status: 'failed', error: 'User not found' })
    return res.json({ status: 'success', userId: u.id })
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: 'Resolve failed' })
  }
})

app.get('/api/users/state', async (req, res) => {
  try {
    const userId = (req.query.userId || '').trim()
    if (!userId) return res.status(400).json({ status: 'failed', error: 'UserId required' })
    const user = usersManager.getUser(userId)
    if (!user) return res.json({ status: 'success', user: null })
    return res.json({ status: 'success', user })
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: 'State fetch failed' })
  }
})

app.get('/api/ledger', (req, res) => { try { return res.json({ status: 'success', ledger: ledger.getAll() }) } catch(e) { return res.status(500).json({ status: 'failed', error: e.message }) } })
app.get('/api/events', (req, res) => { try { return res.json({ status: 'success', events: (globalThis.__eventVaultMem || []) }) } catch(e) { return res.status(500).json({ status: 'failed', error: e.message }) } })

// Verification endpoints (Neon)
app.get('/api/neon/vault', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(400).json({ status: 'failed', error: 'Neon disabled' })
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    const client = await pool.connect()
    try {
      const uid = (req.query.userId || '').trim()
      if (!uid) return res.status(400).json({ status: 'failed', error: 'userId required' })
      const r = await client.query(`SELECT * FROM event_vault WHERE actor_user_id=$1 OR target_user_id=$1 ORDER BY created_at DESC`, [uid])
      return res.json({ status: 'success', rows: r.rows })
    } finally { client.release(); await pool.end() }
  } catch (e) { return res.status(500).json({ status: 'failed', error: e.message }) }
})

app.get('/api/neon/ledger', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(400).json({ status: 'failed', error: 'Neon disabled' })
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    const client = await pool.connect()
    try {
      const uid = (req.query.userId || '').trim()
      if (!uid) return res.status(400).json({ status: 'failed', error: 'userId required' })
      const r = await client.query(`SELECT * FROM ledger WHERE from_user=$1 OR to_user=$1 ORDER BY timestamp DESC`, [uid])
      return res.json({ status: 'success', rows: r.rows })
    } finally { client.release(); await pool.end() }
  } catch (e) { return res.status(500).json({ status: 'failed', error: e.message }) }
})

app.get('/api/neon/balances', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(400).json({ status: 'failed', error: 'Neon disabled' })
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    const client = await pool.connect()
    try {
      const u1 = (req.query.user1 || '').trim()
      const u2 = (req.query.user2 || '').trim()
      if (!u1) return res.status(400).json({ status: 'failed', error: 'user1 required' })
      const ids = u2 ? [u1, u2] : [u1]
      const r = await client.query(`SELECT * FROM balances WHERE user_id = ANY($1::uuid[])`, [ids])
      return res.json({ status: 'success', rows: r.rows })
    } finally { client.release(); await pool.end() }
  } catch (e) { return res.status(500).json({ status: 'failed', error: e.message }) }
})

// Legacy CodeBank codes endpoint (renamed to avoid collision)
app.post('/api/neon/codes-legacy', async (req, res) => {
  try {
    const body = req.body || {}
    const code = body.code || ''
    if (!code || typeof code !== 'string') return res.status(400).json({ status: 'failed', error: 'Invalid code' })
    if (/_PP$/.test(code)) { try { console.warn('[PP-FILTER] codes-legacy rejected PP payload') } catch(_){}; return res.json({ status: 'success', ignored: true, reason: 'guest PP' }) }
    let userId = null
    try { const token = req.cookies && req.cookies.session_token; const s = token && devSessions.get(token); if (s && s.userId) userId = s.userId; } catch(_){}
    if (!userId) return res.status(401).json({ status: 'failed', error: 'Unauthorized' })
    // Accept and acknowledge; persistence handled elsewhere
    return res.json({ status: 'success', code, userId })
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e.message })
  }
})

// Unified Action Endpoint
app.post('/api/action', async (req, res) => {
  try {
    const s = readSessionFromCookie(req)
    if (!s || !s.userId) return res.status(401).json({ status: 'failed', error: 'Unauthorized' })
    req.auth = { userId: s.userId }
    const body = req.body || {}
    const type = body.type
    if (!type) return res.status(400).json({ status: 'failed', error: 'Invalid request: missing type' })

    // Enhanced guest mode filtering - check ALL string fields for _PP suffix
    function hasGuestSuffix(value) {
      return typeof value === 'string' && /_PP$/.test(value)
    }
    
    // Check all string fields in the payload for guest _PP suffix
    for (const [key, value] of Object.entries(body)) {
      if (hasGuestSuffix(value)) { try { console.warn('[PP-FILTER] action rejected key:', key) } catch(_){}; return res.json({ status: 'success', ignored: true, reason: 'guest PP' }) }
    }

    // Ensure virtual users exist in UsersManager for demo; in real system syncs from Neon
    try {
      const uid = req.auth.userId
      if (!usersManager.getUser(uid)) usersManager.addUser({ id: uid, balance: 100, assets: [] })
    } catch (_) {}

    // Resolve recipient if toEmail provided
    let toUser = body.toUser
    if (!toUser && body.toEmail) {
      const u = process.env.DATABASE_URL ? await neonFindUserByEmail(body.toEmail) : memFindUserByEmail(body.toEmail)
      if (!u) return res.status(404).json({ status: 'failed', error: 'User not found' })
      toUser = u.id
    }

    // Route types
    if (type === 'transfer') {
      const from = req.auth.userId
      const to = toUser
      const amount = body.amount
      const description = body.description || 'Transfer'
      if (!to) return res.status(400).json({ status: 'failed', error: 'Missing recipient' })
      await transactionManager.executeTransaction({ type: 'UserToUser', from, to, amount, description })
    } else if (type === 'superlike') {
      if (!toUser) return res.status(400).json({ status: 'failed', error: 'Missing recipient' })
      await policyEngine.run('like', { fromUser: req.auth.userId, toUser, amount: body.amount, likeType: 'super' })
    } else if (type === 'like') {
      if (!toUser) return res.status(400).json({ status: 'failed', error: 'Missing recipient' })
      await policyEngine.run('like', { fromUser: req.auth.userId, toUser, amount: body.amount, likeType: 'like' })
    } else if (type === 'storePurchase') {
      await policyEngine.run('storePurchase', { fromUser: req.auth.userId, amount: body.amount, assetId: body.assetId })
    } else if (type === 'creatorIncentive') {
      if (!toUser) return res.status(400).json({ status: 'failed', error: 'Missing recipient' })
      await policyEngine.run('creatorIncentive', { toUser, amount: body.amount, reason: body.reason })
    } else if (type === 'gameReward') {
      if (!toUser) return res.status(400).json({ status: 'failed', error: 'Missing recipient' })
      await policyEngine.run('gameReward', { toUser, amount: body.amount })
    } else {
      return res.status(400).json({ status: 'failed', error: 'Unsupported action type' })
    }

    const entries = ledger.getAll()
    const last = entries[entries.length - 1] || null
    try {
      const { serializeEvent } = await import('./transaction-core/event-vault/VaultSerializer.js')
      const eventObj = { eventId: last?.id || crypto.randomUUID(), version: '1.0', type: last?.type || type, status: last?.status || 'success', from: last?.from || req.auth.userId, to: last?.to || toUser || null, amount: last?.amount || body.amount || null, assetId: last?.assetId || body.assetId || null, reason: last?.error || null }
      const serialized = serializeEvent(eventObj)
      globalThis.__eventVaultMem = globalThis.__eventVaultMem || []
      globalThis.__eventVaultMem.push(JSON.parse(serialized))
    } catch(_) {}
    return res.json({ status: 'success', transactionId: last?.id || null, error: null, ledgerEntry: last || null })
  } catch (e) {
    const entries = ledger.getAll()
    const last = entries[entries.length - 1] || null
    return res.status(200).json({ status: 'failed', transactionId: last?.id || null, error: e.message, ledgerEntry: last || null })
  }
})

// Removed API blocker to allow valid API routes

// CSRF token issuer (set cookie early)
app.use((req, res, next) => {
  const existing = req.cookies?.['XSRF-TOKEN'];
  if (!existing) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, { httpOnly: false, sameSite: 'lax', secure: !!(process.env.NODE_ENV === 'production'), maxAge: 7 * 24 * 60 * 60 * 1000 });
  }
  next();
});
// CSRF protection for unsafe methods
app.use((req, res, next) => {
  const m = (req.method || 'GET').toUpperCase();
  const unsafe = m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE';
  if (!unsafe) return next();

  // Skip CSRF protection for smoke tests and development
  if (process.env.DISABLE_CSRF === 'true' || process.env.NODE_ENV !== 'production') {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.['XSRF-TOKEN'];
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ message: 'CSRF validation failed' });
  }
  next();
});
// Serve static files for all services
// Serve CodeBank as static app
app.use(
  "/codebank",
  express.static(path.join(__dirname, "services/codebank"), {
    index: false,
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

app.use('/uploads/images', express.static(path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'images')))
app.use('/uploads/piccarboon', express.static(path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon')))

try {
  const dirs = [
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'images'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon'),
    path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'challenges'),
    path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'reference'),
    path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'submissions'),
    path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'scores'),
    path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'fraud'),
    path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'winners'),
    path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'losers'),
    path.join(__dirname, 'services', 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'sponsor'),
  ]
  for (const d of dirs) fs.ensureDirSync(d)
} catch (_) { }

// Serve /styles/* and /js/* routes for yt-new.html
// removed root /styles and /js static mappings in cleanup phase

// Serve shared modules and codebank assets aliases
app.use('/shared', express.static(path.join(__dirname, 'shared'), {
  maxAge: '1d', etag: true, lastModified: true
}));
app.use('/shared_external', express.static(path.join(__dirname, 'shared_external'), {
  maxAge: '1d', etag: true, lastModified: true
}));
app.use('/nostaglia', express.static(path.join(__dirname, 'services/codebank/nostaglia'), {
  maxAge: '1d', etag: true, lastModified: true
}));
// ensure canonical assets mapping only
app.use('/src', express.static(path.join(__dirname, 'services/codebank/src'), {
  maxAge: '1d', etag: true, lastModified: true
}));

// env.js removed

// Service-specific routes
app.get('/', (req, res) => {
  console.log('[route] / → yt-new-clear.html');
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});
app.use('/services', express.static(path.join(__dirname, 'services'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Alias to serve yt-clear assets under /services/yt-clear/* for CodeBank base href compatibility
app.use('/services/yt-clear', express.static(path.join(__dirname), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Aliases for YT-Clear static assets
app.use('/js', express.static(path.join(__dirname, 'js'), {
  maxAge: '1d', etag: true, lastModified: true
}));
app.use('/styles', express.static(path.join(__dirname, 'styles'), {
  maxAge: '1d', etag: true, lastModified: true
}));

// Serve root static files
app.use(express.static(path.join(__dirname), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Service-specific routes

// YT-Clear Default Route
app.get('/yt-coder', (req, res) => {
  res.redirect('/');
});

app.get('/yt-simple', (req, res) => {
  // serving main app as fallback
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});

app.get('/yt-new', (req, res) => {
  console.log('[route] /yt-new → yt-new-clear.html');
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});

// Alias route to support direct file path access
app.get('/yt-new.html', (req, res) => {
  console.log('[route] /yt-new.html → yt-new-clear.html');
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});


// ------------------------------------------------------------------
// NEW AUTHENTICATION API (NEON BACKED)
// ------------------------------------------------------------------

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ status: 'failed', error: 'Email and password required' })
    const u = process.env.DATABASE_URL ? await neonFindUserByEmail(email) : memFindUserByEmail(email)
    try { console.log('[LOGIN DEBUG] userFound:', !!u, 'hasHash:', !!(u && u.password_hash)) } catch(_){}
    if (!u) return res.status(401).json({ status: 'failed', error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, u.password_hash)
    try { console.log('[LOGIN DEBUG] compareResult:', !!ok) } catch(_){}
    if (!ok) return res.status(401).json({ status: 'failed', error: 'Invalid credentials' })
    const token = signJwt(u.id, u.email)
    const sessionId = (crypto && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    devSessions.set(sessionId, { userId: u.id, role: 'user', sessionId, email: u.email })
    res.cookie('session_token', sessionId, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    try { console.log('[AUTH] Login success (v2) - userId:', u.id, 'sessionId:', sessionId) } catch(_){}
    return res.json({ status: 'success', userId: u.id, token, sessionId })
  } catch (err) {
    console.error('Login Error:', err)
    return res.status(500).json({ status: 'failed', error: 'Login failed' })
  }
})


// Assets API (Read Only)
app.get('/api/assets/balance', requireAuth, async (req, res) => {
  try {
    const balances = await AssetReadonly.getAllBalances(req.user.id);
    res.json(balances);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// YT-Clear routes
app.get('/yt-clear', (req, res) => {
  console.log('[route] /yt-clear → yt-new-clear.html');
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});
app.get('/yt-clear/yt-new-clear.html', (req, res) => {
  console.log('[route] /yt-clear/yt-new-clear.html → yt-new-clear.html');
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});

// YT-New-Modular routes
app.get('/yt-new-modular', (req, res) => {
  console.log('[route] /yt-new-modular → yt-new-modular.html');
  res.sendFile(path.join(__dirname, 'yt-new-modular/yt-new-modular.html'));
});
app.get('/yt-new-modular/yt-new-modular.html', (req, res) => {
  console.log('[route] /yt-new-modular/yt-new-modular.html → yt-new-modular.html');
  res.sendFile(path.join(__dirname, 'yt-new-modular/yt-new-modular.html'));
});

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// CodeBank routes
app.get('/codebank/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'services/codebank/indexCB.html'));
});

// Pebalaash static assets (built)
app.use('/codebank/pebalaash', express.static(path.join(__dirname, 'services/codebank/pebalaash/dist/public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}))

// Legacy placeholder endpoints removed; unified API provides real implementations

// Samma3ny static files
app.use('/samma3ny', express.static(path.join(__dirname, 'services/codebank/samma3ny'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Samma3ny routes
app.get('/samma3ny', (req, res) => {
  res.sendFile(path.join(__dirname, 'services/codebank/samma3ny/index.html'));
});

// Farragna routes - serve React app
app.use('/farragna', express.static(path.join(__dirname, 'services/codebank/farragna/dist'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
app.get('/farragna/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'services/codebank/farragna/dist/index.html'));
});

// E7ki! routes
app.get('/e7ki', (req, res) => {
  res.sendFile(path.join(__dirname, 'services/codebank/e7ki/frontend/build/index.html'));
});

// Serve E7ki! static files
app.use('/e7ki/static', express.static(path.join(__dirname, 'services/codebank/e7ki/frontend/build/static'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// OneWorld routes
app.get('/oneworld', (req, res) => {
  res.sendFile(path.join(__dirname, 'services/codebank/oneworld/index.html'));
});

// Community routes
app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'services/codebank/community/index.html'));
});

// Games Centre routes
// Serve Games Centre static assets
// Games Centre removed in cleanup phase

const nostagliaClients = new Set();
function nostagliaBroadcast(event, payload) {
  const data = `event: ${event}\n` + `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of nostagliaClients) {
    try { res.write(data); } catch (e) { }
  }
}
// AUTH REMOVED — CLEAN RESET

let nostagliaStore = {
  uploads: [],
  reactions: new Map(),
  comments: new Map(),
  shares: new Map(),
  cycles: [],
};

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

function isAdmin(req) {
  const roles = req.user?.roles || [];
  return roles.includes('admin') || req.user?.id === 'admin';
}

// AUTH REMOVED — CLEAN RESET
// AUTH REMOVED — CLEAN RESET
// AUTH REMOVED — CLEAN RESET
// AUTH REMOVED — CLEAN RESET

function adjustCodes(userId, delta) {
  // LEGACY MUTATION REMOVED
  console.warn('Attempted legacy adjustCodes call. Ignored.');
}

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET
// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET
// AUTH REMOVED — CLEAN RESET

// Login route
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Public health/version endpoints
app.get('/api/health', (req, res) => { res.status(404).end() });
app.get('/api/version', (req, res) => { res.status(404).end() });

// Core API endpoints for yt-new integrations
app.get('/api/user-assets', (req, res, next) => {
  return next();
});

app.get('/api/youtube/status', (req, res) => { res.status(404).end() });

// Session endpoint bound to Neon users.id (UUID) via Clerk session
app.get('/api/auth/session', (req, res) => { res.status(404).end() })

// Neon-backed API routes
app.get('/api/users/:id', (req, res) => { res.status(404).end() })

app.get('/api/user-assets', (req, res) => { res.status(404).end() })

app.get('/api/rewards', (req, res) => { res.status(404).end() })

app.post('/api/telemetry', (req, res) => {
  try { console.error('📡 TELEMETRY', req.body) } catch (_) { }
  res.sendStatus(204)
})

// Neon codes persistence endpoint
app.post('/api/neon/codes', async (req, res) => {
  try {
    const { code, suffix } = req.body || {};
    const session = readSessionFromCookie(req);
    if (!session || !session.userId) return res.status(401).json({ status:'failed', error:'unauthorized' });
    if (!code || typeof code !== 'string' || !suffix) return res.status(400).json({ status:'failed', error:'missing_fields' });
    if (!/^P\d+$/.test(String(suffix))) return res.status(400).json({ status:'failed', error:'invalid_suffix' });

    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'));
    try {
      await NeonAdapter.query('BEGIN');
      const sqlInsertCode = 'INSERT INTO codes (id, user_id, session_id, code, suffix, created_at, generated_at, next_at) VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3::text, $4::text, NOW(), NOW(), NOW())';
      try { console.log('[NEON SQL WRITE]', sqlInsertCode, { user: session.userId, code, suffix }) } catch(_){}
      await NeonAdapter.query(sqlInsertCode, [session.userId, session.sessionId || null, code, suffix]);
      const sqlUpsertBal = "INSERT INTO balances (user_id, asset, amount, updated_at) VALUES ($1::uuid, 'codebank', 1, NOW()) ON CONFLICT (user_id) DO UPDATE SET amount = balances.amount + 1, updated_at = NOW()";
      try { console.log('[NEON SQL WRITE]', sqlUpsertBal, { user: session.userId }) } catch(_){}
      await NeonAdapter.query(sqlUpsertBal, [session.userId]);
      await NeonAdapter.query('COMMIT');
      try { console.log('[NEON] code + balance updated', session.userId, code, suffix) } catch(_){}
      return res.json({ status:'success' });
    } catch (err) {
      try { await NeonAdapter.query('ROLLBACK') } catch(_){}
      try { console.error('[NEON] insert failed', err) } catch(_){}
      if (err && err.code === '23505') { return res.status(409).json({ status:'failed', error:'duplicate' }); }
      return res.status(500).json({ status:'failed', error:'internal_error' });
    }
  } catch(e) {
    res.status(500).json({ status:'failed', error: e && e.message });
  }
});

// Neon codes retrieval endpoint
app.get('/api/neon/codes', async (req, res) => { 
  try { 
    const session = readSessionFromCookie(req);
    if (!session || !session.userId) { 
      return res.status(401).json({ status:'failed', error:'unauthorized' }); 
    } 

    const { NeonAdapter } = await import('./neon/neon-server-adapter.js'); 

    const sqlSelectCodes = "SELECT COALESCE(code_value, code) AS code, COALESCE(meta->>'suffix', suffix) AS suffix, created_at, COUNT(*) OVER() AS total FROM codes WHERE user_id=$1 ORDER BY created_at DESC";
    try { console.log('[NEON SQL FETCH]', sqlSelectCodes, { user: session.userId }) } catch(_){}
    const { rows } = await NeonAdapter.query(sqlSelectCodes, [session.userId]);

    try { console.log('[NEON] codes query for session user:', session.userId); } catch(_){}
    const total = (rows && rows[0] && typeof rows[0].total==='number') ? rows[0].total : (rows ? rows.length : 0);
    const latest = (rows && rows[0] && rows[0].code) || null;
    return res.json({
      status: 'success',
      count: total,
      latest,
      rows: rows.map(r=>({ code: r.code, suffix: r.suffix, created_at: r.created_at }))
    });

  } catch (e) { 
    return res.status(500).json({ 
      status: 'failed', 
      error: e.message 
    }); 
  } 
}); 

app.post('/api/send-codes', async (req, res) => {
  try {
    const body = req.body || {};
    const codes = Array.isArray(body.codes) ? body.codes : [];
    const receiverEmail = (body.receiverEmail || '').toString().trim();
    const session = readSessionFromCookie(req);
    if (!session || !session.userId) return res.status(401).json({ success: false, message: 'unauthorized' });
    if (!codes.length) return res.status(400).json({ success: false, message: 'no_codes' });
    if (!receiverEmail) return res.status(400).json({ success: false, message: 'invalid_email' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ success: false, message: 'neon_unavailable' });
    const receiver = await neonFindUserByEmail(receiverEmail);
    if (!receiver || !receiver.id) return res.status(404).json({ success: false, message: 'user_not_found' });
    const fromUserId = session.userId;
    const toUserId = receiver.id;
    if (fromUserId === toUserId) return res.status(400).json({ success: false, message: 'self_transfer_not_allowed' });
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'));
    const pool = await NeonAdapter.connect();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT pg_advisory_xact_lock((('x'||substr(md5($1||$2),1,16))::bit(64))::bigint)", [fromUserId, toUserId]);
      const sel = await client.query('SELECT id, code FROM codes WHERE user_id=$1::uuid AND code = ANY($2::text[]) FOR UPDATE', [fromUserId, codes]);
      if ((sel.rows || []).length !== codes.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'codes_not_owned' });
      }
      const ids = sel.rows.map(r => r.id);
      await client.query('UPDATE codes SET user_id=$1::uuid WHERE id = ANY($2::uuid[])', [toUserId, ids]);
      await client.query("UPDATE balances SET amount = amount - $1, updated_at = NOW() WHERE user_id=$2::uuid AND asset='codebank'", [codes.length, fromUserId]);
      await client.query("INSERT INTO balances (user_id, asset, amount, updated_at) VALUES ($1::uuid, 'codebank', $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET amount = balances.amount + EXCLUDED.amount, updated_at = NOW()", [toUserId, codes.length]);
      await client.query('COMMIT');
      return res.json({ success: true });
    } catch (e) {
      try { await client.query('ROLLBACK') } catch(_){}
      return res.status(500).json({ success: false, message: 'tx_failed' });
    } finally {
      try { client.release() } catch(_){}
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: 'server_error' });
  }
});

app.get('/api/neon/diag', async (req, res) => {
  try {
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const cols = await NeonAdapter.query(
      `SELECT column_name, table_name FROM information_schema.columns 
       WHERE table_name IN ('users','codes','ledger','rewards','events','transactions','vault','balances')
       ORDER BY (CASE WHEN table_name='users' THEN 0 ELSE 1 END), table_name, column_name`
    )
    const fks = await NeonAdapter.query(
      `SELECT constraint_name, table_name FROM information_schema.table_constraints 
       WHERE constraint_type='FOREIGN KEY'`
    )
    return res.json({ status: 'success', columns: cols.rows, foreign_keys: fks.rows })
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e && e.message })
  }
})

// Neon sync diagnostic endpoint (session required)
app.get('/api/diag/neon-sync', async (req, res) => {
  try {
    const s = readSessionFromCookie(req);
    if (!s || !s.userId) {
      return res.json({ ok: false, reason: 'no_session' });
    }
    if (!process.env.DATABASE_URL) {
      return res.json({ ok: true, userId: s.userId, balanceRows: 0, balances: [], timestamp: null });
    }
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const { rows } = await NeonAdapter.query(
      'SELECT asset, amount, updated_at FROM balances WHERE user_id=$1 ORDER BY asset ASC',
      [s.userId]
    )
    let ts = null;
    try {
      const r2 = await NeonAdapter.query('SELECT MAX(updated_at) AS ts FROM balances WHERE user_id=$1', [s.userId]);
      ts = (r2 && r2.rows && r2.rows[0] && r2.rows[0].ts) || null;
    } catch(_) {}
    return res.json({ ok: true, userId: s.userId, balanceRows: rows.length, balances: rows, timestamp: ts });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message })
  }
})

// Neon codes diagnostic endpoint (session required)
app.get('/api/diag/neon-codes', async (req, res) => {
  try {
    const s = readSessionFromCookie(req);
    if (!s || !s.userId) {
      return res.json({ ok: false, reason: 'no_session' });
    }
    if (!process.env.DATABASE_URL) {
      return res.json({ ok: true, count: 0, latest: null, codes: [] });
    }
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const { rows } = await NeonAdapter.query(
      'SELECT code_value, created_at FROM codes WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',
      [s.userId]
    )
    const latest = rows && rows[0] ? rows[0].code_value : null;
    return res.json({ ok: true, count: rows.length, latest, codes: rows })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message })
  }
})

// Rewards transfer (codes) — atomic Neon transaction
app.post('/api/rewards/transfer', async (req, res) => {
  try {
    const session = readSessionFromCookie(req);
    if (!session || !session.userId) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const fromUserId = session.userId;
    const { toUserId, asset, amount } = req.body || {};

    if (!toUserId || !asset || typeof amount !== 'number') {
      return res.status(400).json({ error: 'bad_request' });
    }
    if (toUserId === fromUserId) {
      return res.status(400).json({ error: 'self_transfer_not_allowed' });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: 'invalid_amount' });
    }
    if (asset !== 'codes') {
      return res.status(400).json({ error: 'unsupported_asset' });
    }

    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const pool = await NeonAdapter.connect();
    const client = await pool.connect();

    const MAX_RETRIES = 3;
    let attempt = 0;
    while (true) {
      attempt++;
      try {
        await client.query('BEGIN');
        await client.query("SELECT pg_advisory_xact_lock((('x'||substr(md5($1||$2),1,16))::bit(64))::bigint)", [fromUserId, toUserId]);

        const lockRes = await client.query(
          "SELECT amount FROM balances WHERE user_id=$1::uuid AND asset='codebank' FOR UPDATE",
          [fromUserId]
        );
        try { console.log('[TRANSFER] lock sender amount =', (lockRes.rows[0] && Number(lockRes.rows[0].amount)) || 0) } catch(_){ }
        const fromAmount = (lockRes.rows[0] && Number(lockRes.rows[0].amount)) || 0;
        if (fromAmount < amount) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'insufficient_balance' });
        }

        await client.query(
          "UPDATE balances SET amount = amount - $1, updated_at = NOW() WHERE user_id=$2::uuid AND asset='codebank'",
          [amount, fromUserId]
        );
        try { console.log('[TRANSFER] deducted', amount, 'from', fromUserId) } catch(_){ }

        await client.query(
          "INSERT INTO balances (user_id, asset, amount, updated_at) VALUES ($1::uuid, 'codebank', $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET amount = balances.amount + EXCLUDED.amount, updated_at = NOW()",
          [toUserId, amount]
        );
        try { console.log('[TRANSFER] credited', amount, 'to', toUserId) } catch(_){ }

        const finalBal = await client.query(
          "SELECT amount FROM balances WHERE user_id=$1::uuid AND asset='codebank'",
          [fromUserId]
        );
        try { console.log('[TRANSFER] final sender amount =', (finalBal.rows[0] && Number(finalBal.rows[0].amount)) || 0) } catch(_){ }
        const finalBalB = await client.query(
          "SELECT amount FROM balances WHERE user_id=$1::uuid AND asset='codebank'",
          [toUserId]
        );
        try { console.log('[TRANSFER] commit sender->receiver', { from: fromUserId, to: toUserId, amount, sender_final: (finalBal.rows[0] && Number(finalBal.rows[0].amount)) || 0, receiver_final: (finalBalB.rows[0] && Number(finalBalB.rows[0].amount)) || 0, attempt }) } catch(_){}

        await client.query('COMMIT');

        return res.json({
          status: 'success',
          balances: {
            codes: (finalBal.rows[0] && Number(finalBal.rows[0].amount)) || 0
          }
        });
      } catch (e) {
        try { await client.query('ROLLBACK') } catch(_){}
        const code = e && e.code || '';
        const retriable = code === '40001' || code === '40P01';
        try { console.warn('[REWARD TX RETRY]', { attempt, code, message: e && e.message }) } catch(_){}
        if (retriable && attempt < MAX_RETRIES) { await new Promise(r => setTimeout(r, 80 * attempt)); continue; }
        console.error('[REWARD TX ERROR]', e);
        return res.status(500).json({ error: 'tx_failed' });
      } finally {
        if (attempt >= MAX_RETRIES) { try { client.release() } catch(_){ } }
      }
    }
  } catch (e) {
    console.error('[REWARD API ERROR]', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// Balances endpoint (session-only)
app.get('/api/balances', async (req, res) => {
  try {
    try { console.error('RUNNING PATCHED SNAPSHOT LOGIC v1 (server balances gate)') } catch(_){ }
    const token = (req.cookies && req.cookies.session_token) || null;
    const s = token ? devSessions.get(token) : null;
    if (!s || !s.userId) return res.status(401).json({ status: 'failed', error: 'unauthorized' });
    if (!process.env.DATABASE_URL) return res.json({ status: 'success', balances: {} });
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const { rows } = await NeonAdapter.query(
      'SELECT asset, SUM(amount)::int AS total FROM balances WHERE user_id=$1 GROUP BY asset ORDER BY asset ASC',
      [s.userId]
    )
    const balances = {};
    for (const r of rows) {
      const key = r.asset === 'codebank' ? 'codes' : r.asset;
      balances[key] = typeof r.total === 'number' ? r.total : 0;
    }
    return res.json({ status: 'success', balances })
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e && e.message })
  }
})

app.get('/api/games', async (req, res) => {
  try {
    let userId = req.query.userId || null
    if (!userId) {
      const email = (req.query?.email || '').toString().trim()
      if (email) {
        try {
          const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
          const found = await NeonAdapter.query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email])
          userId = found?.rows?.[0]?.id || null
        } catch (_) { userId = null }
      }
    }

    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const { rows } = await NeonAdapter.query(
      'SELECT id, game_name, score FROM games WHERE user_id=$1 ORDER BY score DESC',
      [userId]
    )
    res.json(rows || [])
  } catch (e) {
    res.json([])
  }
})

app.post('/api/transactions', async (req, res) => {
  try {
    const { sender_id, receiver_id, asset_name, amount } = req.body || {}
    if (!sender_id || !receiver_id || !asset_name || typeof amount !== 'number') {
      return res.status(400).json({ message: 'Invalid payload' })
    }
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const { rows } = await NeonAdapter.query(
      'INSERT INTO transactions (sender_id, receiver_id, asset_name, amount) VALUES ($1,$2,$3,$4) RETURNING id',
      [sender_id, receiver_id, asset_name, amount]
    )
    res.status(201).json({ id: rows && rows[0] ? rows[0].id : null })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Ensure Neon schema compatibility for auth sessions
// try {
//   await query('ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS token TEXT');
//   await query('ALTER TABLE IF EXISTS auth_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + interval \'7 days\')');
//   await query('ALTER TABLE IF EXISTS auth_sessions ALTER COLUMN token DROP NOT NULL');
// } catch (e) {
//   console.warn('Schema ensure failed:', e.message);
// }


// New endpoint for Samma3ny with direct Cloudinary fetch
app.get('/api/samma3ny/list', async (req, res) => {
  try {
    console.log('🔄 Fetching Samma3ny songs with direct Cloudinary API call...');

    const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'dhpyneqgk';
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '799518422494748';
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'zfSbK0-zK3tHdmCWdcCduPcxtU4';

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/resources/video?prefix=samma3ny/&type=upload&max_results=500`;

    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Cloudinary API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const files = data.resources || [];

    console.log(`✅ Direct fetch: Found ${files.length} resources in samma3ny/ folder`);

    res.json({ ok: true, files });
  } catch (error) {
    console.error('❌ Direct Cloudinary fetch error:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/samma3ny/songs', handleSamma3nySongs);

// Farragna media listing handled in unified API

// Enhanced bulk upload endpoint for Samma3ny with metadata extraction
app.post('/api/samma3ny/upload', upload.any(), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select audio files to upload'
      });
    }

    console.log(`📤 Starting bulk upload for ${files.length} Samma3ny files`);

    const uploadResults = [];
    const errors = [];
    let successCount = 0;
    let failCount = 0;

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileIndex = i + 1;

      try {
        console.log(`📤 Processing file ${fileIndex}/${files.length}: ${file.originalname}`);

        // Validate file type
        if (!file.mimetype.startsWith('audio/')) {
          errors.push({
            file: file.originalname,
            error: 'Invalid file type',
            message: 'Only audio files are allowed'
          });
          failCount++;

          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }

        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
          errors.push({
            file: file.originalname,
            error: 'File too large',
            message: `Maximum file size is ${Math.round(maxSize / (1024 * 1024))}MB`
          });
          failCount++;

          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }

        // Extract metadata from filename (basic parsing)
        const metadata = extractMetadataFromFilename(file.originalname);

        // Generate unique public ID
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const publicId = `media-player/audio_${timestamp}_${randomId}`;

        try {
          // Upload to Cloudinary
          const result = await cloudinary.v2.uploader.upload(file.path, {
            resource_type: 'video', // Cloudinary uses 'video' for audio
            folder: 'media-player',
            public_id: publicId,
            format: 'mp3',
            quality: 'auto',
            // Add metadata context
            context: {
              title: metadata.title,
              artist: metadata.artist || 'Unknown Artist',
              album: metadata.album || 'Samma3ny Collection',
              uploaded_by: 'admin',
              upload_date: new Date().toISOString()
            }
          });

          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }

          const uploadResult = {
            success: true,
            file: file.originalname,
            url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration || 0,
            format: result.format,
            bytes: result.bytes,
            size: formatFileSize(result.bytes),
            metadata: {
              title: metadata.title,
              artist: metadata.artist || 'Unknown Artist',
              album: metadata.album || 'Samma3ny Collection'
            },
            uploaded_at: new Date().toISOString()
          };

          uploadResults.push(uploadResult);
          successCount++;

          console.log(`✅ Successfully uploaded: ${file.originalname} (${formatFileSize(result.bytes)})`);

        } catch (uploadError) {
          console.error(`❌ Cloudinary upload failed for ${file.originalname}:`, uploadError.message);

          // Fallback to local storage
          try {
            const localPath = path.join(__dirname, 'services/codebank/samma3ny/uploads');
            if (!fs.existsSync(localPath)) {
              fs.mkdirSync(localPath, { recursive: true });
            }

            const localFileName = `local_${timestamp}_${file.originalname}`;
            const localFilePath = path.join(localPath, localFileName);

            // Move file to local storage
            fs.moveSync(file.path, localFilePath);

            const uploadResult = {
              success: true,
              file: file.originalname,
              url: `/services/codebank/samma3ny/uploads/${localFileName}`,
              public_id: `local_${timestamp}`,
              duration: 0,
              format: 'mp3',
              bytes: file.size,
              size: formatFileSize(file.size),
              offline_mode: true,
              metadata: {
                title: metadata.title,
                artist: metadata.artist || 'Unknown Artist',
                album: metadata.album || 'Samma3ny Collection'
              },
              message: 'Uploaded locally - Cloudinary temporarily unavailable',
              uploaded_at: new Date().toISOString()
            };

            uploadResults.push(uploadResult);
            successCount++;

            console.log(`⚠️ Uploaded locally: ${file.originalname}`);

          } catch (localError) {
            console.error(`❌ Local storage failed for ${file.originalname}:`, localError.message);
            errors.push({
              file: file.originalname,
              error: 'Upload failed',
              message: 'Both Cloudinary and local storage failed'
            });
            failCount++;

            // Clean up temp file
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          }
        }

      } catch (fileError) {
        console.error(`❌ Error processing ${file.originalname}:`, fileError.message);
        errors.push({
          file: file.originalname,
          error: 'Processing failed',
          message: fileError.message
        });
        failCount++;

        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // Send comprehensive response
    const response = {
      total_files: files.length,
      successful_uploads: successCount,
      failed_uploads: failCount,
      results: uploadResults,
      errors: errors,
      summary: `${successCount} files uploaded successfully, ${failCount} failed`
    };

    // Log summary
    console.log(`📊 Bulk upload completed: ${successCount}/${files.length} files successful`);

    if (successCount > 0) {
      console.log('🎵 New songs are now available in the playlist');
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    res.status(500).json({
      error: 'Bulk upload service error',
      message: error.message,
      total_files: 0,
      successful_uploads: 0,
      failed_uploads: 0,
      results: [],
      errors: [{ error: 'Server error', message: error.message }]
    });
  }
});

// Helper function to extract metadata from filename
function extractMetadataFromFilename(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Common patterns: "Artist - Title", "Title - Artist", "Artist_Title", etc.
  let title = nameWithoutExt;
  let artist = 'Unknown Artist';
  let album = null;

  // Try to extract artist and title
  const separators = [' - ', '_-_', '__', ' – '];

  for (const separator of separators) {
    if (nameWithoutExt.includes(separator)) {
      const parts = nameWithoutExt.split(separator);
      if (parts.length >= 2) {
        // Assume first part is artist, rest is title
        artist = parts[0].trim();
        title = parts.slice(1).join(separator).trim();
        break;
      }
    }
  }

  // Clean up common prefixes/suffixes
  title = title.replace(/^(official|music|video|audio|song)\s+/i, '');
  title = title.replace(/\s+(official|music|video|audio|song)$/i, '');

  return {
    title: title || nameWithoutExt,
    artist: artist,
    album: album
  };
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

// Enhanced bulk upload endpoint for Farragna with metadata extraction
app.post('/api/farragna/upload', upload.any(), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select video files to upload'
      });
    }

    console.log(`📤 Starting bulk upload for ${files.length} Farragna files`);

    const uploadResults = [];
    const errors = [];
    let successCount = 0;
    let failCount = 0;

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileIndex = i + 1;

      try {
        console.log(`📤 Processing file ${fileIndex}/${files.length}: ${file.originalname}`);

        // Validate file type
        if (!file.mimetype.startsWith('video/')) {
          errors.push({
            file: file.originalname,
            error: 'Invalid file type',
            message: 'Only video files are allowed'
          });
          failCount++;

          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }

        // Validate file size (500MB limit for videos)
        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
          errors.push({
            file: file.originalname,
            error: 'File too large',
            message: `Maximum file size is ${Math.round(maxSize / (1024 * 1024))}MB`
          });
          failCount++;

          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          continue;
        }

        // Extract metadata from filename (basic parsing)
        const metadata = extractMetadataFromFilename(file.originalname);

        // Generate unique public ID
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const publicId = `farragna/video_${timestamp}_${randomId}`;

        try {
          // Upload to Cloudinary
          const result = await cloudinary.v2.uploader.upload(file.path, {
            resource_type: 'video',
            folder: 'farragna',
            public_id: publicId,
            format: 'mp4',
            quality: 'auto',
            // Add metadata context
            context: {
              title: metadata.title,
              creator: metadata.artist || 'Unknown Creator',
              uploaded_by: 'admin',
              upload_date: new Date().toISOString()
            }
          });

          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }

          const uploadResult = {
            success: true,
            file: file.originalname,
            url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration || 0,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            size: formatFileSize(result.bytes),
            metadata: {
              title: metadata.title,
              creator: metadata.artist || 'Unknown Creator'
            },
            uploaded_at: new Date().toISOString()
          };

          uploadResults.push(uploadResult);
          successCount++;

          console.log(`✅ Successfully uploaded: ${file.originalname} (${formatFileSize(result.bytes)})`);

        } catch (uploadError) {
          console.error(`❌ Cloudinary upload failed for ${file.originalname}:`, uploadError.message);

          // Fallback to local storage
          try {
            const localPath = path.join(__dirname, 'services/codebank/farragna/uploads');
            if (!fs.existsSync(localPath)) {
              fs.mkdirSync(localPath, { recursive: true });
            }

            const localFileName = `local_${timestamp}_${file.originalname}`;
            const localFilePath = path.join(localPath, localFileName);

            // Move file to local storage
            fs.moveSync(file.path, localFilePath);

            const uploadResult = {
              success: true,
              file: file.originalname,
              url: `/services/codebank/farragna/uploads/${localFileName}`,
              public_id: `local_${timestamp}`,
              duration: 0,
              width: 0,
              height: 0,
              format: 'mp4',
              bytes: file.size,
              size: formatFileSize(file.size),
              offline_mode: true,
              metadata: {
                title: metadata.title,
                creator: metadata.artist || 'Unknown Creator'
              },
              message: 'Uploaded locally - Cloudinary temporarily unavailable',
              uploaded_at: new Date().toISOString()
            };

            uploadResults.push(uploadResult);
            successCount++;

            console.log(`⚠️ Uploaded locally: ${file.originalname}`);

          } catch (localError) {
            console.error(`❌ Local storage failed for ${file.originalname}:`, localError.message);
            errors.push({
              file: file.originalname,
              error: 'Upload failed',
              message: 'Both Cloudinary and local storage failed'
            });
            failCount++;

            // Clean up temp file
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          }
        }

      } catch (fileError) {
        console.error(`❌ Error processing ${file.originalname}:`, fileError.message);
        errors.push({
          file: file.originalname,
          error: 'Processing failed',
          message: fileError.message
        });
        failCount++;

        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // Send comprehensive response
    const response = {
      total_files: files.length,
      successful_uploads: successCount,
      failed_uploads: failCount,
      results: uploadResults,
      errors: errors,
      summary: `${successCount} files uploaded successfully, ${failCount} failed`
    };

    // Log summary
    console.log(`📊 Bulk upload completed: ${successCount}/${files.length} files successful`);

    if (successCount > 0) {
      console.log('🎥 New videos are now available in the gallery');
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    res.status(500).json({
      error: 'Bulk upload service error',
      message: error.message,
      total_files: 0,
      successful_uploads: 0,
      failed_uploads: 0,
      results: [],
      errors: [{ error: 'Server error', message: error.message }]
    });
  }
});

// Upload status endpoint for real-time updates
app.get('/api/samma3ny/upload-status', (req, res) => { res.status(404).end() });

// Force playlist refresh endpoint
app.post('/api/samma3ny/refresh-playlist', (req, res) => { res.status(404).end() });

app.post('/api/samma3ny/order', (req, res) => { res.status(404).end() });

app.post('/api/samma3ny/rename', (req, res) => { res.status(404).end() });

app.post('/api/samma3ny/rename-bulk', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const name = (req.body?.name || '').trim();
    if (ids.length === 0 || !name) return res.status(400).json({ ok: false, error: 'INVALID_INPUT' });
    let updated = 0;
    for (const id of ids) {
      try {
        await cloudinary.v2.api.update(id, { context: { title: name, display_name: name } });
        updated++;
      } catch (_) { }
    }
    res.json({ ok: true, updated });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Farragna Webhook endpoint for Cloudinary notifications
app.post('/api/farragna/webhook', (req, res) => { res.status(404).end() });

// Samma3ny legacy endpoints (from separate server)
app.get('/api/songs/count', (req, res) => { res.status(404).end() });

// YouTube API proxy endpoints (legacy)
app.get('/api/youtube/search', (req, res) => { res.status(404).end() });
app.get('/api/youtube/videos', (req, res) => { res.status(404).end() });

// Samma3ny metadata endpoint (legacy)
app.post('/api/samma3ny/songs', (req, res) => { res.status(404).end() });

// Guest upload disabled; use unified API with JWT

// Guest create disabled; use unified API with JWT

// Admin API routes for Farragna
app.all('/api/admin/videos', (req, res) => { res.status(404).end() });
app.all('/api/admin/views', (req, res) => { res.status(404).end() });

// Health check
app.get('/health', (req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }) });

app.get('/api/auth/health', (req, res) => { res.status(404).end() });
app.get('/api/auth/test', (req, res) => { res.status(404).end() });

// Screenshot Service Integration
const screenshotService = {
  browser: null,
  isRunning: false,
  config: {
    maxScreenshotSize: 1920 * 1080,
    screenshotTimeout: 30000,
    browserOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  },

  async initializeBrowser() {
    if (this.browser) return this.browser;

    try {
      console.log('[Screenshot Service] Launching browser...');
      this.browser = await puppeteer.launch(this.config.browserOptions);
      this.isRunning = true;
      console.log('[Screenshot Service] Browser launched successfully');
      return this.browser;
    } catch (error) {
      console.error('[Screenshot Service] Failed to launch browser:', error);
      throw error;
    }
  },

  async captureScreenshot(url, options = {}) {
    const browser = await this.initializeBrowser();

    const defaultOptions = {
      width: 1920,
      height: 1080,
      quality: 'high',
      fullPage: false,
      timeout: this.config.screenshotTimeout,
      ...options
    };

    let page;
    try {
      page = await browser.newPage();
      await page.setViewport({
        width: defaultOptions.width,
        height: defaultOptions.height,
        deviceScaleFactor: defaultOptions.quality === 'high' ? 2 : 1
      });

      console.log(`[Screenshot Service] Navigating to: ${url}`);
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.screenshotTimeout
      });

      await page.waitForTimeout(2000);

      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: defaultOptions.fullPage,
        quality: defaultOptions.quality === 'high' ? undefined : 80
      });

      console.log(`[Screenshot Service] Screenshot captured successfully (${screenshot.length} bytes)`);

      return {
        data: screenshot.toString('base64'),
        size: screenshot.length,
        width: defaultOptions.width,
        height: defaultOptions.height,
        url: url
      };

    } catch (error) {
      console.error('[Screenshot Service] Screenshot capture failed:', error);
      throw error;
    } finally {
      if (page) await page.close();
    }
  },

  async captureYouTubeFrame(videoId, timestamp = null, quality = 'high', options = {}) {
    const browser = await this.initializeBrowser();

    const defaultOptions = {
      width: 1920,
      height: 1080,
      quality: quality,
      ...options
    };

    let page;
    try {
      page = await browser.newPage();
      await page.setViewport({
        width: defaultOptions.width,
        height: defaultOptions.height,
        deviceScaleFactor: defaultOptions.quality === 'high' ? 2 : 1
      });

      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=http://localhost:${PORT}&color=white&theme=light&vq=${defaultOptions.quality === 'high' ? 'hd1080' : 'hd720'}${timestamp ? `&start=${Math.floor(timestamp)}` : ''}`;

      console.log(`[Screenshot Service] Loading YouTube embed: ${embedUrl}`);
      await page.goto(embedUrl, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.screenshotTimeout
      });

      await page.waitForSelector('video', { timeout: 10000 }).catch(() => page.waitForTimeout(3000));
      await page.waitForTimeout(3000);

      if (timestamp) {
        console.log(`[Screenshot Service] Seeking to ${timestamp}s`);
        await page.evaluate((seekTime) => {
          const video = document.querySelector('video');
          if (video) video.currentTime = seekTime;
        }, timestamp);
        await page.waitForTimeout(2000);
      }

      const screenshot = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: defaultOptions.width,
          height: defaultOptions.height
        },
        quality: defaultOptions.quality === 'high' ? undefined : 80
      });

      console.log(`[Screenshot Service] YouTube frame captured successfully (${screenshot.length} bytes)`);

      return {
        data: screenshot.toString('base64'),
        size: screenshot.length,
        width: defaultOptions.width,
        height: defaultOptions.height,
        videoId: videoId,
        timestamp: timestamp
      };

    } catch (error) {
      console.error('[Screenshot Service] YouTube frame capture failed:', error);
      throw error;
    } finally {
      if (page) await page.close();
    }
  }
};

// Screenshot Service Routes
app.get('/screenshot/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    browserReady: !!screenshotService.browser,
    isRunning: screenshotService.isRunning
  });
});

app.post('/screenshot/capture', async (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`[Screenshot Service] Capturing screenshot for: ${url}`);
    const screenshot = await screenshotService.captureScreenshot(url, options);

    res.json({
      success: true,
      screenshot: screenshot,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Screenshot Service] Capture failed:', error);
    res.status(500).json({
      error: 'Screenshot capture failed',
      message: error.message
    });
  }
});

app.post('/screenshot/capture-youtube', async (req, res) => {
  try {
    const { videoId, timestamp, quality = 'high', options = {} } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log(`[Screenshot Service] Capturing YouTube frame for: ${videoId} at ${timestamp || 'current'}s`);
    const result = await screenshotService.captureYouTubeFrame(videoId, timestamp, quality, options);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Screenshot Service] YouTube capture failed:', error);
    res.status(500).json({
      error: 'YouTube screenshot capture failed',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('[SERVER] yt-clear listening on http://localhost:' + PORT);
  try {
    console.log(
      '[ROUTES]',
      app._router?.stack
        ?.map(r => (r && r.route ? r.route.path : null))
        ?.filter(Boolean)
    );
  } catch (_) {}
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server gracefully...');
  if (screenshotService.browser) {
    await screenshotService.browser.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server gracefully...');
  if (screenshotService.browser) {
    await screenshotService.browser.close();
  }
  process.exit(0);
});
/* // Unified API (Neon + JWT)
let apiRouter;
try {
  const mod = await import('./services/api/server.js');
  apiRouter = mod.default || mod;
} catch (e) {
  console.warn('[server] API router not available, skipping /api routes');
  apiRouter = express.Router();
}
app.use('/api', apiRouter); */
try {
  const settaMod = await import('./services/api/modules/setta.js');
  const settaRouter = settaMod.default || settaMod.router || settaMod;
  app.use('/api/setta', settaRouter);
  console.log('✅ Mounted /api/setta routes');
} catch (e) {
  console.warn('⚠️ Failed to mount /api/setta:', e && e.message);
}

// Mount rewards router (backend gate for claims)
try {
  const rewardsMod = await import('./api/modules/rewards.js');
  const rewardsRouter = rewardsMod.default || rewardsMod.router || rewardsMod;
  app.use('/api/rewards', requireAuth, rewardsRouter);
  console.log('✅ Mounted /api/rewards routes');
} catch (e) {
  console.warn('⚠️ Failed to mount /api/rewards:', e && e.message);
}

// AUTH REMOVED — CLEAN RESET
import 'dotenv/config';
// Neon DB environment check
const HAS_DB = !!(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
try {
  console.log('[NEON] DB connection configured: ' + (HAS_DB ? 'YES' : 'NO'));
} catch (_) {}
if (!HAS_DB) {
  console.error('[NEON] Missing DATABASE_URL or NEON_DATABASE_URL. Set DB URL and restart.');
  process.exit(1);
}

// Apply Neon DDL (UUID generation + tables/constraints) per instructions
(async function applyNeonDDL(){
  const statements = [
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',
    'CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid())',
    'CREATE TABLE IF NOT EXISTS codes (id UUID PRIMARY KEY DEFAULT gen_random_uuid())',
    'CREATE TABLE IF NOT EXISTS ledger (id UUID PRIMARY KEY DEFAULT gen_random_uuid())',
    'CREATE TABLE IF NOT EXISTS rewards (id UUID PRIMARY KEY DEFAULT gen_random_uuid())',
    'CREATE TABLE IF NOT EXISTS events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now())',
    'CREATE TABLE IF NOT EXISTS transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid())',
    'CREATE TABLE IF NOT EXISTS vault (id UUID PRIMARY KEY DEFAULT gen_random_uuid())',
    'CREATE TABLE IF NOT EXISTS balances (id UUID PRIMARY KEY DEFAULT gen_random_uuid())',
    'CREATE TABLE IF NOT EXISTS extra_sessions (session_id TEXT PRIMARY KEY, user_id UUID, state TEXT, failed BOOLEAN DEFAULT FALSE, claimed_at TIMESTAMP, completed_at TIMESTAMP, failed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS user_id UUID',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS session_id UUID',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS code TEXT',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS suffix TEXT',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS code_value VARCHAR(255)',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS next_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    "ALTER TABLE codes ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb",
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'ALTER TABLE codes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'CREATE INDEX IF NOT EXISTS idx_codes_user_id ON codes(user_id)',
    'CREATE UNIQUE INDEX IF NOT EXISTS uniq_codes_user_code ON codes(user_id, code) WHERE code IS NOT NULL',
    'CREATE UNIQUE INDEX IF NOT EXISTS uniq_codes_user_code_value ON codes(user_id, code_value) WHERE code_value IS NOT NULL',
    'ALTER TABLE ledger ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    'ALTER TABLE ledger ADD COLUMN IF NOT EXISTS user_id UUID',
    'ALTER TABLE ledger ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0',
    'ALTER TABLE ledger ADD COLUMN IF NOT EXISTS type VARCHAR(50)',
    'ALTER TABLE ledger ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'ALTER TABLE rewards ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    'ALTER TABLE rewards ADD COLUMN IF NOT EXISTS sender_id UUID',
    'ALTER TABLE rewards ADD COLUMN IF NOT EXISTS receiver_id UUID',
    'ALTER TABLE rewards ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0',
    'ALTER TABLE rewards ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'ALTER TABLE events ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    'ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID',
    'ALTER TABLE events ADD COLUMN IF NOT EXISTS type VARCHAR(50)',
    "ALTER TABLE events ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb",
    'ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sender_id UUID',
    'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receiver_id UUID',
    'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0',
    'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'ALTER TABLE vault ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    'ALTER TABLE vault ADD COLUMN IF NOT EXISTS user_id UUID',
    'ALTER TABLE vault ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0',
    'ALTER TABLE vault ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'ALTER TABLE balances ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    'ALTER TABLE balances ADD COLUMN IF NOT EXISTS user_id UUID',
    'ALTER TABLE balances ADD COLUMN IF NOT EXISTS asset VARCHAR(50)',
    'ALTER TABLE balances ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0',
    'ALTER TABLE balances ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
    'CREATE UNIQUE INDEX IF NOT EXISTS uniq_balances_user_asset ON balances(user_id, asset)',
  ];
  const doBlocks = [
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_codes_user') THEN ALTER TABLE codes ADD CONSTRAINT fk_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF; END$$;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_ledger_user') THEN ALTER TABLE ledger ADD CONSTRAINT fk_ledger_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF; END$$;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_rewards_sender') THEN ALTER TABLE rewards ADD CONSTRAINT fk_rewards_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE; ALTER TABLE rewards ADD CONSTRAINT fk_rewards_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE; END IF; END$$;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_events_user') THEN ALTER TABLE events ADD CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF; END$$;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_transactions_sender') THEN ALTER TABLE transactions ADD CONSTRAINT fk_transactions_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE; ALTER TABLE transactions ADD CONSTRAINT fk_transactions_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE; END IF; END$$;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_vault_user') THEN ALTER TABLE vault ADD CONSTRAINT fk_vault_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF; END$$;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_balances_user') THEN ALTER TABLE balances ADD CONSTRAINT fk_balances_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; END IF; END$$;",
  ];
  try{
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    for (const sql of statements) {
      try { await NeonAdapter.query(sql) } catch (e) { console.warn('[NEON] DDL stmt failed:', sql, e && e.message) }
    }
    for (const block of doBlocks) {
      try { await NeonAdapter.query(block) } catch (e) { console.warn('[NEON] DDL DO failed:', e && e.message) }
    }
    console.log('[NEON] DDL applied successfully')
  }catch(e){ console.warn('[NEON] DDL apply failed:', e && e.message) }
})();

(async function applyUsersSmallFix(){
  try{
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    await NeonAdapter.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255), ADD COLUMN IF NOT EXISTS name VARCHAR(255), ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)')
    await NeonAdapter.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    console.log('[NEON] users columns ensured')
  }catch(e){ console.warn('[NEON] users fix failed:', e && e.message) }
})();
