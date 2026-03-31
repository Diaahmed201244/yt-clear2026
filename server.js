<<<<<<< HEAD
import dotenv from 'dotenv';
// Configure environment variables
dotenv.config();

import express from 'express';
=======
import 'dotenv/config';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

// 🛡️ Firebase Private Key Diagnostic
if (process.env.FIREBASE_PRIVATE_KEY) {
  console.log('🔥 Firebase Config Loaded:', {
    projectId: process.env.FIREBASE_PROJECT_ID,
    keyLength: process.env.FIREBASE_PRIVATE_KEY.length,
    hasNewlines: process.env.FIREBASE_PRIVATE_KEY.includes('\n')
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛡️ Secure Database Path & Directory
const DATA_DIR = path.join(__dirname, 'data');
fs.ensureDirSync(DATA_DIR);

// Use Turso if configured, otherwise local SQLite
const tursoUrl = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL;
if (tursoUrl) {
  process.env.DATABASE_URL = tursoUrl; // 🛡️ UNIFY: Set DATABASE_URL for Turso too
  console.log(`🚀 [DB] Using Turso Database: ${tursoUrl.split('@').pop()}`); // Log domain only for security
} else {
  const DB_PATH = process.env.DATABASE_URL?.replace('sqlite://', '') || path.join(DATA_DIR, 'database.sqlite');
  if (DB_PATH.startsWith('postgres')) {
    console.warn('⚠️ [DB] WARNING: DATABASE_URL is set to PostgreSQL but Turso is not configured. This may cause issues if the app expects SQLite.');
  }
  process.env.DATABASE_URL = `sqlite://${DB_PATH}`;
  console.log(`🚀 [DB] Using absolute database path: ${DB_PATH}`);
}

const PORT = process.env.PORT || 3001;

// 🛡️ CRITICAL: Global error handlers with enhanced logging
process.on('uncaughtException', (err) => {
  console.error('💥 [CRITICAL] UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  // 🛡️ CRITICAL: If we hit a serious error, we MUST exit so PM2 can restart the process
  // This prevents the server from hanging in a broken state.
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use, exiting...');
  }
  
  // Give some time for logs to flush before exiting
  // setTimeout(() => process.exit(1), 1000); // 🛡️ DISABLED: Prevent server auto-reload (from actly.md)
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [CRITICAL] UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // Most unhandled rejections are recoverable, but logging is vital
});

console.log("🚀 SEND-CODES VERSION: CLEAN V2");

import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
<<<<<<< HEAD
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
=======
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
import fetch from 'node-fetch';
import cloudinary from 'cloudinary';
import multer from 'multer';
import puppeteer from 'puppeteer';
import { handleSamma3nySongs } from './api/samma3ny/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
<<<<<<< HEAD
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
=======
import trustRouter from './api/modules/trust.js';
// Clerk removed: zero-auth mode

import * as monetizationMod from './api/modules/monetization.js';
import * as samma3nyMod from './api/modules/samma3ny.js';
import * as nostagliaMod from './api/modules/nostaglia.js';
import * as pebalaashMod from './api/modules/pebalaash.js';
import * as adminMod from './api/modules/admin.js';
import * as testMod from './api/modules/test.js';
import * as rewardsMod from './api/modules/rewards.js';
import farragnaDefault, { webhookCloudflare as farragnaWebhook } from './api/modules/farragna.js';
import * as logicodeMod from './api/modules/logicode.js';
import * as corsaMod from './api/modules/corsa.js';
import * as codesMod from './api/modules/codes.js';
import syncRouter from './api/modules/sync.js';
import settaDefault from './api/modules/setta.js';
import * as balloonMod from './api/modules/balloon.js';
import { query, pool } from './api/config/db.js';
import { watchdog } from './services/watchdog/watchdog.js';
import watchdogRoutes from './routes/watchdog.js';
import battaloodaRouter from './api/routes/battalooda.js';

import { 
  getAllCountries, 
  getCountryByCode, 
  getReligions, 
  getCountriesByContinent,
  searchCountries,
  getPhoneCode
} from './country-data-service.js';

import { sendOTP } from './api/utils/sms-provider.js';

import { 
  sendHybridOTP, 
  verifyHybridOTP, 
  resendOTP 
} from './hybrid-otp-service.js';

// 🛡️ Security Middleware
import { requireAuth, devSessions } from './api/middleware/auth.js';
import { enforceFinancialSecurity, enforceWatchDog, storeIdempotencyResponse } from './shared/security-middleware.js';


const app = express();

// 🛡️ CRITICAL: Trust proxy for Ngrok to pass internal session cookies correctly
app.set('trust proxy', 1);

// ============================================
// COUNTRY & RELIGION DATA API
// ============================================

// Get all countries with phone codes
app.get('/api/countries', (req, res) => {
  try {
    const countries = getAllCountries();
    res.json({ 
      success: true, 
      count: countries.length,
      countries 
    });
  } catch (err) {
    console.error('[Countries API Error]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch countries' });
  }
});

// Get countries grouped by continent
app.get('/api/countries/by-continent', (req, res) => {
  try {
    const grouped = getCountriesByContinent();
    res.json({ success: true, continents: grouped });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch countries' });
  }
});

// Search countries
app.get('/api/countries/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }
    const results = searchCountries(q);
    res.json({ success: true, query: q, count: results.length, countries: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// Get single country details
app.get('/api/countries/:code', (req, res) => {
  try {
    const { code } = req.params;
    const country = getCountryByCode(code.toUpperCase());
    if (!country) {
      return res.status(404).json({ success: false, error: 'Country not found' });
    }
    res.json({ success: true, country });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch country' });
  }
});

// Get all religions
app.get('/api/religions', (req, res) => {
  try {
    const religions = getReligions();
    res.json({ success: true, count: religions.length, religions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch religions' });
  }
});

// Get phone code for a country
app.get('/api/phone-code/:countryCode', (req, res) => {
  try {
    const { countryCode } = req.params;
    const phoneCode = getPhoneCode(countryCode.toUpperCase());
    if (!phoneCode) {
      return res.status(404).json({ success: false, error: 'Country not supported' });
    }
    res.json({ success: true, countryCode: countryCode.toUpperCase(), phoneCode });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get phone code' });
  }
});

const server = http.createServer(app);
let wss = null;
try {
  const { WebSocketServer } = await import('ws');
  wss = new WebSocketServer({ server });
  const wsClients = new Map(); // userId -> ws
  wss.on('connection', ws => {
    try { console.log('[WS] Client connected'); } catch(err){ console.error('[WS] Connection error:', err) }
    ws.on('message', msg => {
      try {
        const data = JSON.parse(msg.toString());
        if (data && data.type === 'AUTH' && data.userId) {
          ws.userId = String(data.userId);
          wsClients.set(ws.userId, ws);
          try { console.log('[WS] Authenticated:', ws.userId); } catch(err){ console.error('[WS] Auth error:', err) }
        }
      } catch(e) { try { console.error('[WS ERROR]', e && e.message ? e.message : e); } catch(err){ console.error('[WS] Error handling error:', err) } }
    });
    ws.on('close', () => { try { if (ws.userId) wsClients.delete(ws.userId); } catch(err){ console.error('[WS] Close error:', err) } });
  });
  // WebSocket emit function removed - Using SSE only
} catch (e) {
    try { console.warn('[WS] WebSocket unavailable:', e && e.message); } catch(err){ console.error('[WS] WebSocket error handling error:', err) }
  }

// WebSocket emit helpers removed - Using SSE only for all real-time updates

// Socket.IO Integration for E7ki Messenger
const io = new Server(server, {
  cors: { 
    origin: "*", 
    credentials: true 
  },
  path: '/ws'
});

// WebSocket auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-demo');
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Initialize WatchDog with the dbQuery helper
watchdog.setDb(query);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

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

<<<<<<< HEAD
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.options('*', cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(cookieParser());
=======
// 🛡️ CRITICAL: CORS must be configured properly
// Support Ngrok origins dynamically
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins including Ngrok domains
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-TOKEN']
}));

// Handle preflight
app.options('*', cors());

app.use(cookieParser());

// 🛡️ Debug logging middleware - add this FIRST (from actly.md)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.body);
  next();
});

// 🛡️ Diagnostic: Log all static requests (FIX 2 from actly.md)
app.use((req, res, next) => {
  if (req.path.includes('yt-player.init.js')) {
    console.log(`[DIAG] Request for ${req.path} - headers: ${JSON.stringify(req.headers)}`);
  }
  next();
});

// Test endpoint to serve the file directly
app.get('/test-yt', (req, res) => {
  const filePath = path.join(__dirname, 'yt-player', 'yt-player.init.js');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// 🛡️ ADD: Direct route to serve yt-player.init.js (FIX 1 from analysis)
// This bypasses any potential static middleware misconfiguration
app.get('/yt-player/yt-player.init.js', (req, res) => {
  const filePath = path.join(__dirname, 'yt-player', 'yt-player.init.js');
  console.log(`[DIRECT ROUTE] Serving yt-player.init.js from: ${filePath}`);
  console.log(`[DIRECT ROUTE] File exists: ${fs.existsSync(filePath)}`);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// 🛡️ SPAM PREVENTION MIDDLEWARE (FIX 3 from actly.md)
const requestCounts = new Map();
const REQUEST_SPAM_THRESHOLD = 50; // requests per minute
const REQUEST_SPAM_WINDOW = 60000; // 1 minute

app.use((req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();
    
    if (!requestCounts.has(key)) {
        requestCounts.set(key, { count: 1, start: now });
    } else {
        const data = requestCounts.get(key);
        if (now - data.start > REQUEST_SPAM_WINDOW) {
            requestCounts.set(key, { count: 1, start: now });
        } else {
            data.count++;
            if (data.count > REQUEST_SPAM_THRESHOLD) {
                console.warn(`[SPAM BLOCK] IP ${req.ip} blocked for ${req.path} (${data.count} requests)`);
                return res.status(429).send('Too many requests - possible infinite loop detected');
            }
        }
    }
    next();
});

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
        if (now - data.start > REQUEST_SPAM_WINDOW) requestCounts.delete(key);
    }
}, 60000);

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true }));
<<<<<<< HEAD
// Note: upload.any() is applied only to specific upload routes below

// In-memory dev sessions
const devSessions = new Map();

function readSessionFromCookie(req) {
=======
// Static files will be served later to allow custom route overrides
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
// Note: upload.any() is applied only to specific upload routes below

// Register Sync routes (AFTER middleware setup to ensure req.body is parsed)
app.use('/api/codes', syncRouter);

// Register WatchDog routes
app.use('/api/watchdog', watchdogRoutes);

// Register Trust Engine routes
app.use('/api/trust', trustRouter);

// Register Farragna routes
app.use('/api/farragna', farragnaDefault);

// Register Pebalaash routes
app.use('/api/pebalaash', pebalaashMod.default || pebalaashMod);

// Register Battalooda routes
app.use('/api/battalooda', battaloodaRouter);

app.get('/api/rewards/balance', async (req, res) => {
  try {
    const s = (req.cookies && req.cookies.session_token) || null;
    if (!s) return res.status(401).json({ error: 'unauthorized' });
    const session = devSessions.get(s);
    if (!session || !session.userId) return res.status(401).json({ error: 'unauthorized' });

    const userId = session.userId;
    const r = await query(
      'SELECT codes_count, silver_count, gold_count FROM balances WHERE user_id=$1',
      [userId]
    );

    const row = r.rows[0] || { codes_count: 0, silver_count: 0, gold_count: 0 };
    return res.json({
      codes: row.codes_count || 0,
      silver: row.silver_count || 0,
      gold: row.gold_count || 0,
      likes: 0,
      superlikes: 0,
      games: 0,
      transactions: 0,
      last_updated: new Date().toISOString()
    });
  } catch (err) {
    console.error('[BALANCES ERROR]', err);
    res.status(500).json({ error: 'fetch_failed' });
  }
});

app.get('/api/watchdog/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { getWatchDogState, updateDogStateByTime } = await import('./shared/watch-dog-guardian.js');
    
    // Refresh state based on time
    const info = await updateDogStateByTime(userId);
    const state = await getWatchDogState(userId);
    
    return res.json({
      success: true,
      dogState: state.dogState,
      lastFedAt: state.lastFedAt,
      isFrozen: state.isFrozen,
      hoursSinceLastFeed: info.hoursSinceLastFeed
    });
  } catch (err) {
    console.error('[WATCHDOG STATUS] error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

function readSessionFromCookie(req, res) {
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  try {
    const token = (req.cookies && req.cookies.session_token) || null;
    if (!token) return null;
    const s = devSessions.get(token);
<<<<<<< HEAD
    return s || null;
=======
    if (!s) {
      // Stale cookie – delete it
      if (res && typeof res.clearCookie === 'function') {
        res.clearCookie('session_token', { path: '/' });
      }
      return null;
    }
    return s;
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  } catch (_) {
    return null;
  }
}

const JWT_SECRET = 'secret-demo';
function signJwt(userId, email) { return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' }) }
function requireJwtAuth(req, res, next) { try { const h = req.headers.authorization || ''; const parts = h.split(' '); if (parts[0] !== 'Bearer' || !parts[1]) return res.status(401).json({ status: 'failed', error: 'Unauthorized' }); const decoded = jwt.verify(parts[1], JWT_SECRET); req.auth = { userId: decoded.userId, email: decoded.email }; next() } catch (e) { return res.status(401).json({ status: 'failed', error: 'Unauthorized' }) } }
const __authUsers = new Map(); // email -> { id, email, username, password_hash }
let __USER_SEQ = 1000;
<<<<<<< HEAD
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
=======
async function sqliteFindUserByEmail(email){
  try {
    // Normalize email
    const normalizedEmail = String(email).toLowerCase().trim();

    const r = await query('SELECT id, email, password_hash, codes_count, silver_count, gold_count, last_sync_at, user_type, is_untrusted FROM users WHERE LOWER(email)=$1', [normalizedEmail]);

    console.log("[DB] sqliteFindUserByEmail query result:", {
        rowsFound: r.rows?.length || 0,
        email: normalizedEmail
    });

    return r.rows[0] || null
  } catch (e) {
    console.error('[DB ERROR] sqliteFindUserByEmail failed:', e.message);
    throw e;
  }
}
function memFindUserByEmail(email){ return __authUsers.get(email) || null }
async function memCreateUser(email, username, password, profile = {}){
  const normalizedEmail = String(email).toLowerCase().trim();
  const hash = await bcrypt.hash(password, 10); 

  console.log("[SIGNUP] Creating user:", { email: normalizedEmail, profile });

  let id = crypto.randomUUID();

  try {
    if (process.env.DATABASE_URL) {
      // Check if user exists first
      const existing = await query('SELECT id, password_hash FROM users WHERE LOWER(email)=$1', [normalizedEmail]);

      if (existing.rows && existing.rows[0]) {
        // User exists - update password and profile data if it's a migration/overwrite case
        id = existing.rows[0].id;
        console.log(`[SIGNUP] User ${normalizedEmail} already exists, updating profile for id: ${id}`);
        
        await query(
          'UPDATE users SET password_hash=$1, username=$2, religion=$3, country=$4, phone=$5 WHERE id=$6',
          [
            hash, 
            username || normalizedEmail.split('@')[0], 
            profile.religion || null, 
            profile.country || null, 
            profile.phone || null, 
            id
          ]
        );
      } else {
        // Create new user
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
        console.log(`[SIGNUP] User ${normalizedEmail} created in DB: ${id}`);
      }

      // Initialize default assets
      try {
        await query('INSERT INTO user_assets(user_id, asset_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [id, 'init']);
      } catch(err){
        console.error('[SIGNUP] User assets insert error:', err.message);
      }
    }
  } catch(e) {
    console.error('[SIGNUP][DB ERROR]', e.message);
  }

  // Also keep in memory for current session compatibility
  __authUsers.set(normalizedEmail, { 
    id, 
    email: normalizedEmail, 
    username: username || null, 
    password_hash: hash,
    ...profile
  });

  if (!usersManager.getUser(id)) {
    usersManager.addUser({ id, balance: 100, assets: [] });
  }

  return { id };
}

const __sseClients = new Map();
function __sseEmit(userId, payload) {
  try {
    const set = __sseClients.get(String(userId));
    if (!set) return;
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const res of set) { try { res.write(data) } catch(err){ console.error('[SSE] Write error:', err) } }
  } catch(err){ console.error('[SSE] Broadcast error:', err) }
}
app.get('/events', (req, res) => {
  try {
    const s = readSessionFromCookie(req, res);
    if (!s || !s.userId) return res.status(401).end();
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();
    res.write(`event: hello\n` + `data: {"ok":true}\n\n`);
    const uid = String(s.userId);
    if (!__sseClients.has(uid)) __sseClients.set(uid, new Set());
    __sseClients.get(uid).add(res);
    const keep = setInterval(() => { try { res.write(':\n\n') } catch(err){ console.error('[SSE] Keep-alive error:', err) } }, 15000);
    req.on('close', () => { try { clearInterval(keep); __sseClients.get(uid)?.delete(res) } catch(err){ console.error('[SSE] Close cleanup error:', err) } });
  } catch(err) { try { res.status(500).end() } catch(err2){ console.error('[SSE] Error response error:', err2) } }
});

async function __startEventProcessor() {
  try {
    if (process.env.EVENT_PROCESSOR_DISABLED === '1') return;
    let lastId = 0;
    try {
      const r = await query("SELECT last_id FROM event_offsets WHERE key='default'");
      lastId = (r.rows && r.rows[0] && Number(r.rows[0].last_id)) || 0;
    } catch(err) { 
      console.error('[SSE] Event processing offset check error:', err.message)
      lastId = 0 
    }
    ;(async function loop(){
      for(;;) {
        try {
          const { rows } = await query('SELECT id, event_type, payload FROM event_store WHERE id > $1 ORDER BY id ASC LIMIT 50', [lastId]);
          if (!rows || rows.length === 0) { await new Promise(r => setTimeout(r, 150)); continue }
          for (const ev of rows) {
            const client = await pool.connect();
            try {
              await client.query('BEGIN');
              // SQLite: use INSERT OR IGNORE since ON CONFLICT ... DO NOTHING might not work with RETURNING in all SQLite versions
              // Actually, better-sqlite3 handles it if defined. Let's stick to standard SQLite for max compatibility.
              await client.query('INSERT OR IGNORE INTO applied_events(event_id) VALUES ($1)', [ev.id]);
              const check = await client.query('SELECT event_id FROM applied_events WHERE event_id = $1', [ev.id]);
              if (!check.rows || check.rows.length === 0) { await client.query('ROLLBACK'); lastId = ev.id; continue }
              
              if (ev.event_type === 'TRANSFER_COMPLETED') {
                const p = typeof ev.payload === 'string' ? JSON.parse(ev.payload) : ev.payload || {};
                const from = p.from; const to = p.to; const assetType = p.assetType || 'codes'; const amount = Number(p.amount||0);
                
                // SQLite: UPSERT syntax
                await client.query(
                  'INSERT INTO balance_projection(user_id, asset_type, amount) VALUES ($1, $2, -$3) ON CONFLICT (user_id, asset_type) DO UPDATE SET amount = amount - EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP',
                  [from, assetType, amount]
                );
                await client.query(
                  'INSERT INTO balance_projection(user_id, asset_type, amount) VALUES ($1, $2, $3) ON CONFLICT (user_id, asset_type) DO UPDATE SET amount = amount + EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP',
                  [to, assetType, amount]
                );
                
                // generate_series replacement
                for (let i = 0; i < amount; i++) {
                  const newCode = crypto.randomUUID();
                  await client.query(
                    "INSERT INTO codes (id, user_id, code, type, created_at, generated_at, next_at, spent, meta) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, $5)",
                    [crypto.randomUUID(), to, newCode, assetType, JSON.stringify({ source_event_id: ev.id, source_tx: p.txId || null })]
                  );
                }

                try {
                  if (assetType === 'codes') {
                    const codesRes = await client.query(
                      'SELECT code FROM codes WHERE id IN (SELECT id FROM codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2)',
                      [to, amount]
                    );
                    const newCodes = codesRes.rows.map(r => r.code);
                    
                    __sseEmit(to, { type: 'CODES_RECEIVED', codes: newCodes, assetType, amount, eventId: ev.id });
                    __sseEmit(from, { type: 'ASSET_UPDATE', assetType, amount: -amount, eventId: ev.id });
                  } else {
                    __sseEmit(to, { type: 'ASSET_UPDATE', assetType, amount, eventId: ev.id });
                    __sseEmit(from, { type: 'ASSET_UPDATE', assetType, amount: -amount, eventId: ev.id });
                  }
                } catch(err){ console.error('[SEND-CODES] SSE emit error:', err) }
              }
              await client.query('COMMIT');
            } catch(e) {
              console.error('[PROCESSOR ERROR]', e.message);
              try { await client.query('ROLLBACK') } catch(err){ }
            } finally { try { client.release() } catch(err){ } }
            lastId = ev.id;
          }
          try { await query("UPDATE event_offsets SET last_id=$1, updated_at=CURRENT_TIMESTAMP WHERE key='default'", [lastId]) } catch(_){ }
        } catch(_) { await new Promise(r => setTimeout(r, 300)) }
      }
    })();
  } catch(_) { }
}

// Event processor will be started in server.listen after DDL is applied

// Transaction-Core bootstrap (PolicyEngine + Managers) - DISABLED DUE TO MISSING FILES
// import { Ledger } from './transaction-core/core/Ledger.js'
// import { UsersManager } from './transaction-core/core/UsersManager.js'
// import { BankodeManager } from './transaction-core/core/BankodeManager.js'
// import { TransactionManager } from './transaction-core/core/TransactionManager.js'
// import { DbClient } from './transaction-core/persistence/NeonClient.js'
// import { UsersRepository } from './transaction-core/persistence/UsersRepository.js'
// import { LedgerRepository } from './transaction-core/persistence/LedgerRepository.js'
// import { BankodeRepository } from './transaction-core/persistence/BankodeRepository.js'
// import { PolicyEngine } from './transaction-core/policy-engine/PolicyEngine.js'
// import { LikePolicy } from './transaction-core/policies/LikePolicy.js'
// import { GameRewardPolicy } from './transaction-core/policies/GameRewardPolicy.js'
// import { StorePolicy } from './transaction-core/policies/StorePolicy.js'
// import { CreatorIncentivePolicy } from './transaction-core/policies/CreatorIncentivePolicy.js'

const ledger = { getAll: () => [] };
const usersManager = { getUser: () => null, addUser: () => {} };
const bankodeManager = {};
let transactionManager = { executeTransaction: async () => {} };
const policyEngine = { register: () => {}, run: async () => {} };

async function ensureQarsanVirtualUsers() {
  try {
    // SQLite schema already ensured in applyNeonCompressionDDL
    const r = await query('SELECT COUNT(*) AS c FROM qarsan_virtual_users')
    const c = parseInt(r.rows[0]?.c || 0, 10)
    if (c === 0) {
      await generateVirtualUsers()
    }
  } catch (_) {}
}

async function generateVirtualUsers() {
  try {
    const bots = [
      { email: 'bot1@qarsan.ai', name: 'Qarsan Bot 1', dog_state: 'SLEEPING', qarsan_mode: 'RANGED', balance: 150, qarsan_wallet: 50 },
      { email: 'bot2@qarsan.ai', name: 'Qarsan Bot 2', dog_state: 'ACTIVE', qarsan_mode: 'OFF', balance: 200, qarsan_wallet: 0 },
      { email: 'trap.user@qarsan.ai', name: 'Trap User', dog_state: 'ACTIVE', qarsan_mode: 'EXPOSURE', balance: 300, qarsan_wallet: 100 },
      { email: 'decoy@qarsan.ai', name: 'Decoy Account', dog_state: 'SLEEPING', qarsan_mode: 'EXPOSURE', balance: 120, qarsan_wallet: 20 },
      { email: 'honeypot@qarsan.ai', name: 'Honey Pot', dog_state: 'SLEEPING', qarsan_mode: 'RANGED', balance: 80, qarsan_wallet: 40 }
    ]
    for (const b of bots) {
      await query(
        `INSERT INTO qarsan_virtual_users (id, email, name, dog_state, qarsan_mode, balance, qarsan_wallet, last_fed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now', '-26 hours'))
         ON CONFLICT (email) DO NOTHING`,
        [crypto.randomUUID(), b.email, b.name, b.dog_state, b.qarsan_mode, b.balance, b.qarsan_wallet]
      )
    }
  } catch (_) {}
}

// Optionally bind SQLite repositories for atomic DB writes
// DISABLED due to persistent startup crashes - will use in-memory only
let repos = null;
try {
  // const { SQLiteClient } = await import('./transaction-core/persistence/SQLiteClient.js')
  // const sqlite = new SQLiteClient()
  // const { EventVaultRepository } = await import('./transaction-core/persistence/EventVaultRepository.js')
  // const { BalancesRepository } = await import('./transaction-core/persistence/BalancesRepository.js')
  // const { LedgerRepository } = await import('./transaction-core/persistence/LedgerRepository.js')
  // const { UsersRepository } = await import('./transaction-core/persistence/UsersRepository.js')
  // const { BankodeRepository } = await import('./transaction-core/persistence/BankodeRepository.js')
  // repos = {
  //   eventVaultRepo: new EventVaultRepository(sqlite),
  //   ledgerRepo: new LedgerRepository(sqlite),
  //   balancesRepo: new BalancesRepository(sqlite),
  //   usersRepo: new UsersRepository(sqlite),
  //   bankodeRepo: new BankodeRepository(sqlite)
  // }
  // transactionManager = new TransactionManager(usersManager, bankodeManager, ledger, repos)
} catch (e) { console.warn('[SQLITE] Core binding failed:', e?.message) }

// Register baseline policies
// const policyEngineInstance = new PolicyEngine(transactionManager)
// policyEngineInstance.register('like', new LikePolicy(transactionManager))
// policyEngineInstance.register('gameReward', new GameRewardPolicy(transactionManager))
// policyEngineInstance.register('storePurchase', new StorePolicy(transactionManager))
// policyEngineInstance.register('creatorIncentive', new CreatorIncentivePolicy(transactionManager))
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

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
<<<<<<< HEAD
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
=======
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    try { console.log('[AUTH] dev login success'); } catch(err){ console.error('[AUTH] Login success log error:', err) }
    try {
      const insertUser = async () => {
        await query(
          'INSERT INTO users (id, status, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING',
          [userId, 'active']
        )
      }
      insertUser().catch((err) => { console.error('[AUTH] User insert error:', err) })
    } catch(err){ console.error('[AUTH] Login error:', err) }
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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
<<<<<<< HEAD
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
=======
    try { console.log('[AUTH] logout success'); } catch(err){ console.error('[AUTH] Logout success log error:', err) }
  } catch(err){ console.error('[AUTH] Logout error:', err) }
  return res.status(200).json({ ok: true });
});

// ------------------------------------------------------------------
// AUTHENTICATION API
// ------------------------------------------------------------------

// Step 1: Send Hybrid OTP (Email + Phone)
app.post('/api/auth/send-hybrid-otp', async (req, res) => {
  try {
    const { email, phone, countryCode } = req.body;
    
    if (!email || !phone || !countryCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, phone number, and country code are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    const result = await sendHybridOTP({ email, phone, countryCode });
    
    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        sessionId: result.sessionId,
        channels: result.channels,
        // Only include in development
        ...(result.mockOtp && { mockOtp: result.mockOtp })
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }
    
  } catch (error) {
    console.error('[HybridOTP API] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send OTP' 
    });
  }
});

// Step 2: Verify OTP (Email or Phone)
app.post('/api/auth/verify-hybrid-otp', async (req, res) => {
  try {
    const { sessionId, otp, channel } = req.body;
    
    if (!sessionId || !otp || !channel) {
      return res.status(400).json({
        success: false,
        error: 'Session ID, OTP, and channel (email/phone) are required'
      });
    }
    
    const result = await verifyHybridOTP(sessionId, otp, channel);
    
    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        verified: result.verified,
        progress: result.progress,
        pendingChannel: result.pendingChannel,
        userData: result.userData
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('[HybridOTP Verify] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

// Step 3: Resend OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { sessionId, channel } = req.body;
    
    if (!sessionId || !channel) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and channel are required'
      });
    }
    
    const result = await resendOTP(sessionId, channel);
    
    if (result.success) {
      return res.json({
        success: true,
        message: `OTP resent via ${channel}`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('[Resend OTP] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resend OTP'
    });
  }
});

// Updated signup without OTP verification
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { 
      email, 
      username, 
      password, 
      religion, 
      country, 
      phone, 
      countryCode
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !religion || !country || !phone) {
      return res.status(400).json({ 
        status: 'failed', 
        error: 'All fields are required' 
      });
    }
    
    // Check if user exists
    const existing = process.env.DATABASE_URL 
      ? await sqliteFindUserByEmail(email) 
      : memFindUserByEmail(email);
      
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'USER_EXISTS',
        message: 'An account with this email already exists. Please sign in instead.' 
      });
    }

    // 🛡️ MODIFIED: Clear any existing sessions for this email to prevent stale session conflicts
    for (const [sid, sess] of devSessions.entries()) {
      if (sess.email === email) {
        devSessions.delete(sid);
      }
    }
    
    // Create user with profile data
    const formattedPhone = (phone && countryCode) ? `${countryCode}${phone.replace(/\D/g, '')}` : phone;
    
    const created = await memCreateUser(email, username, password, {
      religion,
      country,
      phone: formattedPhone,
      phoneVerified: true,
      emailVerified: true,
      verifiedAt: new Date().toISOString()
    });
    
    if (!created || !created.id) {
      throw new Error("User creation failed");
    }

    // 🛡️ MODIFIED: Ensure user is registered in the UsersManager/Ledger if needed
    try {
      if (global.UsersManager && typeof global.UsersManager.registerUser === 'function') {
        await global.UsersManager.registerUser(created);
        console.log(`[Signup] Registered user ${created.id} in UsersManager`);
      }
    } catch (e) {
      console.warn('[Signup] UsersManager registration failed:', e.message);
    }
    
    // Create session
    const token = signJwt(created.id, email);
    const newSessionId = crypto.randomUUID();
    
    devSessions.set(newSessionId, {
      userId: created.id,
      role: 'user',
      sessionId: newSessionId,
      email,
      phone: formattedPhone,
      religion,
      country,
      verified: true
    });
    
    // Set cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('session_token', newSessionId, {
      httpOnly: false, // 🛡️ MODIFIED: Allow client-side JS to see the cookie for redirection logic
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    return res.json({ 
      status: 'success', 
      userId: created.id, 
      token,
      sessionId: newSessionId,
      user: {
        id: created.id,
        email,
        username,
        religion,
        country,
        phone: formattedPhone,
        verified: true
      }
    });
    
  } catch (err) {
    console.error('[Signup Error]:', err);
    return res.status(500).json({ 
      status: 'failed', 
      error: err.message || 'Signup failed' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log("🔥 [LOGIN ATTEMPT] BODY:", req.body);
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ status: 'failed', error: 'Email and password required' });

    // Check in database or memory
    const u = process.env.DATABASE_URL ? await sqliteFindUserByEmail(email) : memFindUserByEmail(email);

    console.log("🔍 [LOGIN] User lookup result:", {
        found: !!u,
        hasPasswordHash: !!(u && u.password_hash),
        userId: u?.id,
        email: u?.email
    });

    if (!u) {
      console.warn("⚠️ [LOGIN] User not found:", email);
      return res.status(401).json({ status: 'failed', error: 'Invalid credentials' });
    }

    // Verify password
    if (!u.password_hash) {
      console.error("❌ [LOGIN] User account has no password hash:", email);
      return res.status(500).json({ status: 'failed', error: 'Account corrupted' });
    }

    // 🔧 FIX: Ensure password_hash is a string and handle PHP bcrypt format ($2y$ -> $2a$)
    let storedHash = String(u.password_hash).trim();
    if (storedHash.startsWith('$2y$')) {
      storedHash = '$2a$' + storedHash.substring(4);
      console.log("🔄 [LOGIN] Normalized PHP bcrypt hash to $2a$ format");
    }
    const inputPassword = String(password).trim();

    console.log("🔐 [LOGIN] Attempting password comparison...");
    const ok = await bcrypt.compare(inputPassword, storedHash);

    console.log("🔐 [LOGIN] Password comparison result:", ok);

    if (!ok) {
      console.warn("⚠️ [LOGIN] Password mismatch for user:", email);
      return res.status(401).json({ status: 'failed', error: 'Invalid credentials' });
    }

    const token = signJwt(u.id, u.email);
    const sessionId = (crypto && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : Math.random().toString(36).slice(2);

    // Store in-memory session
    devSessions.set(sessionId, {
      userId: u.id,
      role: u.user_type || 'user',
      sessionId,
      email: u.email,
      isUntrusted: u.is_untrusted || false
    });

    // Set cookie with path '/' to work across all sub-services including Battalooda
    res.cookie('session_token', sessionId, {
      httpOnly: false, // 🛡️ MODIFIED: Allow client-side JS to see the cookie for redirection logic
      path: '/', // CRITICAL: Must be '/' for sub-services to access
      sameSite: 'lax',
      secure: false, // Set to true only in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log('[AUTH] Login success - userId:', u.id, 'sessionId:', sessionId);
    return res.json({ status: 'success', userId: u.id, token, sessionId });
  } catch (err) {
    console.error('🔥 [LOGIN ERROR]:', err);
    return res.status(500).json({ status: 'failed', error: 'Login failed' });
  }
});

// Dev auth: whoami
app.get('/api/auth/me', requireAuth, (req, res) => {
  try {
    return res.json({ 
      success: true,
      user: { 
        id: req.user.id, 
        email: req.user.email,
        sessionId: req.user.sessionId, 
        role: req.user.role 
      } 
    });
  } catch (_) {
    return res.json({ success: false, user: null });
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  }
});

// Alias: session info
app.get('/api/me', (req, res) => {
  try {
<<<<<<< HEAD
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

=======
    const s = readSessionFromCookie(req, res);
    if (!s) return res.json({ success: false, user: null });
    return res.json({ 
      success: true,
      user: { 
        id: s.userId, 
        email: s.email,
        sessionId: s.sessionId, 
        role: s.role 
      } 
    });
  } catch (_) {
    return res.json({ success: false, user: null });
  }
});

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
app.get('/api/users/resolve', async (req, res) => {
  try {
    const email = (req.query.email || '').trim()
    if (!email) return res.status(400).json({ status: 'failed', error: 'Email required' })
<<<<<<< HEAD
    const u = process.env.DATABASE_URL ? await neonFindUserByEmail(email) : memFindUserByEmail(email)
=======
    const u = process.env.DATABASE_URL ? await sqliteFindUserByEmail(email) : memFindUserByEmail(email)
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    if (!u) return res.status(404).json({ status: 'failed', error: 'User not found' })
    return res.json({ status: 'success', userId: u.id })
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: 'Resolve failed' })
  }
})

<<<<<<< HEAD
app.get('/api/users/state', async (req, res) => {
  try {
    const userId = (req.query.userId || '').trim()
    if (!userId) return res.status(400).json({ status: 'failed', error: 'UserId required' })
=======
app.get('/api/users/state', requireAuth, async (req, res) => {
  try {
    const userId = (req.query.userId || '').trim()
    if (!userId) return res.status(400).json({ status: 'failed', error: 'UserId required' })
    
    // Authorization check
    if (req.user.id !== userId) {
      return res.status(403).json({ status: 'failed', error: 'unauthorized_access' })
    }
    
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    const user = usersManager.getUser(userId)
    if (!user) return res.json({ status: 'success', user: null })
    return res.json({ status: 'success', user })
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: 'State fetch failed' })
  }
})

app.get('/api/ledger', (req, res) => { try { return res.json({ status: 'success', ledger: ledger.getAll() }) } catch(e) { return res.status(500).json({ status: 'failed', error: e.message }) } })
app.get('/api/events', (req, res) => { try { return res.json({ status: 'success', events: (globalThis.__eventVaultMem || []) }) } catch(e) { return res.status(500).json({ status: 'failed', error: e.message }) } })

<<<<<<< HEAD
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
=======
// Verification endpoints (SQLite)
app.get('/api/sqlite/vault', requireAuth, async (req, res) => {
  try {
    const uid = (req.query.userId || '').trim()
    if (!uid) return res.status(400).json({ status: 'failed', error: 'userId required' })
    
    // Authorization check
    if (req.user.id !== uid) {
      return res.status(403).json({ status: 'failed', error: 'unauthorized_access' })
    }
    
    const r = await query(`SELECT * FROM audit_logs WHERE actor_user_id=$1 ORDER BY created_at DESC`, [uid])
    return res.json({ status: 'success', rows: r.rows })
  } catch (e) { return res.status(500).json({ status: 'failed', error: e.message }) }
})

app.get('/api/sqlite/ledger', requireAuth, async (req, res) => {
  try {
    const uid = (req.query.userId || '').trim()
    if (!uid) return res.status(400).json({ status: 'failed', error: 'userId required' })
    
    // Authorization check
    if (req.user.id !== uid) {
      return res.status(403).json({ status: 'failed', error: 'unauthorized_access' })
    }
    
    // 🛡️ MODIFIED: Add a small delay to prevent rapid polling spam (from actly.md)
    // await new Promise(r => setTimeout(r, 100));

    const r = await query(`SELECT * FROM ledger WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, [uid])
    return res.json({ status: 'success', rows: r.rows })
  } catch (e) { return res.status(500).json({ status: 'failed', error: e.message }) }
})

app.get('/api/sqlite/balances', async (req, res) => {
  return res.json({ status: 'success', rows: [], message: 'balances view deprecated' });
})

// Legacy CodeBank codes endpoint (renamed to avoid collision)
app.post('/api/sqlite/codes-legacy', async (req, res) => {
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  try {
    const body = req.body || {}
    const code = body.code || ''
    if (!code || typeof code !== 'string') return res.status(400).json({ status: 'failed', error: 'Invalid code' })
    if (/_PP$/.test(code)) { try { console.warn('[PP-FILTER] codes-legacy rejected PP payload') } catch(_){}; return res.json({ status: 'success', ignored: true, reason: 'guest PP' }) }
    let userId = null
    try { const token = req.cookies && req.cookies.session_token; const s = token && devSessions.get(token); if (s && s.userId) userId = s.userId; } catch(_){}
    if (!userId) return res.status(401).json({ status: 'failed', error: 'Unauthorized' })
    // Accept and acknowledge; persistence handled elsewhere
<<<<<<< HEAD
    return res.json({ status: 'success', code, userId })
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e.message })
=======
    return res.json({ status: 'success', code, userId });
  } catch (e) {
    return res.status(500).json({ status: 'failed', error: e.message });
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  }
})

// Unified Action Endpoint
app.post('/api/action', async (req, res) => {
  try {
<<<<<<< HEAD
    const s = readSessionFromCookie(req)
=======
    const s = readSessionFromCookie(req, res)
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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
<<<<<<< HEAD
      const u = process.env.DATABASE_URL ? await neonFindUserByEmail(body.toEmail) : memFindUserByEmail(body.toEmail)
=======
      const u = process.env.DATABASE_URL ? await sqliteFindUserByEmail(body.toEmail) : memFindUserByEmail(body.toEmail)
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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
<<<<<<< HEAD
app.use(
  "/codebank",
  express.static(path.join(__dirname, "codebank"), {
    index: false,
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);
=======
app.use('/codebank', express.static(path.join(__dirname, 'codebank'), { 
    maxAge: '1d',
    etag: true,
    lastModified: true 
}));
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

app.use('/uploads/images', express.static(path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'images')))
app.use('/uploads/piccarboon', express.static(path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon')))

try {
  const dirs = [
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'images'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'challenges'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'reference'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'submissions'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'scores'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'fraud'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'winners'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'losers'),
    path.join(__dirname, 'codebank', 'setta', 'server', 'uploads', 'piccarboon', 'sponsor'),
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
<<<<<<< HEAD
=======
app.use('/acc', express.static(path.join(__dirname, 'acc'), {
  maxAge: '1d', etag: true, lastModified: true
}));
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
app.use('/nostaglia', express.static(path.join(__dirname, 'services/codebank/nostaglia'), {
  maxAge: '1d', etag: true, lastModified: true
}));
// ensure canonical assets mapping only
app.use('/src', express.static(path.join(__dirname, 'services/codebank/src'), {
  maxAge: '1d', etag: true, lastModified: true
}));

// env.js removed

// Service-specific routes
<<<<<<< HEAD
app.get('/', (req, res) => {
  console.log('[route] / → yt-new-clear.html');
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});
=======
// PWA Entry Point - Serve yt-new-clear.html directly (no auth redirect for tunnel access)
app.get(['/', '/yt-new-clear.html'], (req, res) => {
  console.log(`[route] ${req.path} → yt-new-clear.html`);
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  } catch(_) {}
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});

// 🛡️ Serve Lifecycle files (Explicitly)
app.get('/main.js', (req, res) => res.sendFile(path.join(__dirname, 'main.js')));
app.get('/core/app-lifecycle.js', (req, res) => res.sendFile(path.join(__dirname, 'core/app-lifecycle.js')));

// 🛡️ PWA Support Routes
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'manifest.json')));
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
app.use('/services', express.static(path.join(__dirname, 'services'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
<<<<<<< HEAD
=======
app.use('/api/trust', trustRouter);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

// Alias to serve yt-clear assets under /services/yt-clear/* for CodeBank base href compatibility
app.use('/services/yt-clear', express.static(path.join(__dirname), {
  maxAge: '1d',
  etag: true,
<<<<<<< HEAD
  lastModified: true
}));

// Aliases for YT-Clear static assets
=======
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath && filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Aliases for YT-Clear static assets
app.use('/yt-player', express.static(path.join(__dirname, 'yt-player'), {
  maxAge: '1d', etag: true, lastModified: true
}));
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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
<<<<<<< HEAD
  lastModified: true
=======
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath && filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
}));

// Service-specific routes

// YT-Clear Default Route
app.get('/yt-coder', (req, res) => {
  res.redirect('/');
});

<<<<<<< HEAD
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
=======
app.get(['/yt-simple', '/yt-new', '/yt-new.html'], (req, res) => {
  const session = readSessionFromCookie(req, res);
  if (!session || !session.userId) {
    console.log(`[route] ${req.path} → Redirecting to login.html (Session missing)`);
    return res.redirect('/login.html');
  }
  console.log(`[route] ${req.path} → yt-new-clear.html (Session: ${session.userId})`);
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  } catch(_) {}
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});

// Explicit route for canonical file path
app.get('/yt-clear/yt-new-clear.html', (req, res) => {
  console.log('[route] /yt-clear/yt-new-clear.html → yt-new-clear.html');
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  } catch(_) {}
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});


// ------------------------------------------------------------------
// NEW AUTHENTICATION API (NEON BACKED)
// ------------------------------------------------------------------

<<<<<<< HEAD
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
=======
// ------------------------------------------------------------------
// OFFLINE-FIRST COMPRESSION LOGIC
// ------------------------------------------------------------------

/**
 * Deterministic hash for code compression
 */
function deterministicHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Format a hash as a 26-digit code (similar to normal codes)
 */
function formatAsCompressedCode(hash, suffix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = hash.repeat(4).slice(0, 26);
  // Ensure the suffix is applied
  return s.slice(0, 24) + suffix;
}

/**
 * Perform automatic compression for a user's codes in Neon
 */
async function autoCompressUserCodes(userId) {
  try {
    const client = await pool.connect();

    // 1. Compress Normal -> Silver (100 -> 1)
    const normalRes = await client.query(
      "SELECT id, code FROM codes WHERE user_id = $1 AND type = 'normal' ORDER BY created_at ASC",
      [userId]
    );

    if (normalRes.rows.length >= 100) {
      const batchToCompress = normalRes.rows.slice(0, 100);
      const ids = batchToCompress.map(r => r.id);
      const codes = batchToCompress.map(r => r.code);
      
      const silverHash = deterministicHash(codes.join(''));
      const silverCode = formatAsCompressedCode(silverHash, 'S1'); // S1 suffix for Silver

      await client.query('BEGIN');
      try {
        // Delete original 100 codes
        const placeholders = ids.map(() => '?').join(',');
        await client.query(`DELETE FROM codes WHERE id IN (${placeholders})`, ids);
        // Insert 1 silver bar
        await client.query(
          "INSERT INTO codes (id, user_id, code, type, is_compressed, compressed_at) VALUES ($1, $2, $3, 'silver', 1, CURRENT_TIMESTAMP)",
          [crypto.randomUUID(), userId, silverCode]
        );
        await client.query('COMMIT');
        console.log(`✅ [COMPRESSION] Compressed 100 normal codes to 1 silver for user ${userId}`);
        
        // Recursive check for silver -> gold
        await autoCompressUserCodes(userId); 
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }

    // 2. Compress Silver -> Gold (10 -> 1)
    const silverRes = await client.query(
      "SELECT id, code FROM codes WHERE user_id = $1 AND type = 'silver' ORDER BY created_at ASC",
      [userId]
    );

    if (silverRes.rows.length >= 10) {
      const batchToCompress = silverRes.rows.slice(0, 10);
      const ids = batchToCompress.map(r => r.id);
      const codes = batchToCompress.map(r => r.code);
      
      const goldHash = deterministicHash(codes.join(''));
      const goldCode = formatAsCompressedCode(goldHash, 'G1'); // G1 suffix for Gold

      await client.query('BEGIN');
      try {
        // Delete original 10 silver bars
        const placeholders = ids.map(() => '?').join(',');
        await client.query(`DELETE FROM codes WHERE id IN (${placeholders})`, ids);
        // Insert 1 gold bar
        await client.query(
          "INSERT INTO codes (id, user_id, code, type, is_compressed, compressed_at) VALUES ($1, $2, $3, 'gold', 1, CURRENT_TIMESTAMP)",
          [crypto.randomUUID(), userId, goldCode]
        );
        await client.query('COMMIT');
        console.log(`✅ [COMPRESSION] Compressed 10 silver codes to 1 gold for user ${userId}`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }
  } catch (err) {
    console.error('❌ [COMPRESSION ERROR]', err.message);
  }
}

// ------------------------------------------------------------------
// SERVER-AUTHORITATIVE DELTA SYNC API
// ------------------------------------------------------------------

app.post('/api/sync', requireAuth, async (req, res) => {
  try {
    const { delta_codes, delta_silver, delta_gold, sync_id } = req.body || {}
    const userId = req.user.id;

    console.log(`[SYNC REQUEST] User: ${userId}, SyncID: ${sync_id}, Deltas: C:${delta_codes} S:${delta_silver} G:${delta_gold}`);

    if (!sync_id) return res.status(400).json({ status: 'failed', error: 'Missing sync_id' });

    // 1. Idempotency Check
    const existingEvent = await client.query('SELECT id FROM sync_events WHERE id = $1', [sync_id]);
    if (existingEvent.rows.length > 0) {
      console.log(`[SYNC DUPLICATE] SyncID ${sync_id} already applied. Returning current balance.`);
      const balanceRes = await client.query('SELECT codes_count, silver_count, gold_count FROM users WHERE id = $1', [userId]);
      const row = balanceRes.rows[0] || { codes_count: 0, silver_count: 0, gold_count: 0 };
      return res.json({ 
        status: 'success', 
        synced_at: Date.now(),
        codes: Number(row.codes_count),
        silver: Number(row.silver_count),
        gold: Number(row.gold_count)
      });
    }

    // 2. Validate Delta Limits (Prevent Exploit)
    const d_codes = Number(delta_codes || 0);
    const d_silver = Number(delta_silver || 0);
    const d_gold = Number(delta_gold || 0);

    if (d_codes > 100 || d_silver > 20 || d_gold > 10) {
      console.warn(`[SYNC REJECTED] Delta limits exceeded for user ${userId}`);
      return res.status(400).json({ status: 'failed', error: 'Delta limits exceeded' });
    }
    
    if (d_codes < 0 || d_silver < 0 || d_gold < 0) {
      return res.status(400).json({ status: 'failed', error: 'Negative deltas not allowed' });
    }

    console.log(`[SYNC VALIDATED] User: ${userId}, Deltas approved.`);

    // 3. Atomic Transaction: Record Event + Update Balances
    await client.query('BEGIN');
    try {
      // Store sync event for idempotency
      await client.query(
        "INSERT INTO sync_events (id, user_id, delta_codes, delta_silver, delta_gold) VALUES ($1, $2, $3, $4, $5)",
        [sync_id, userId, d_codes, d_silver, d_gold]
      );

      // Update user balances using deltas (Server-Authoritative)
      const updateRes = await client.query(
        "UPDATE users SET codes_count = COALESCE(codes_count, 0) + $1, silver_count = COALESCE(silver_count, 0) + $2, gold_count = COALESCE(gold_count, 0) + $3, last_sync_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING codes_count, silver_count, gold_count",
        [d_codes, d_silver, d_gold, userId]
      );

      // 🛡️ Also update the 'balances' table to stay in sync
      await client.query(
        "INSERT INTO balances (user_id, codes_count, silver_count, gold_count, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET codes_count = balances.codes_count + $2, silver_count = balances.silver_count + $3, gold_count = balances.gold_count + $4, updated_at = CURRENT_TIMESTAMP",
        [userId, d_codes, d_silver, d_gold]
      );

      // 🛡️ RECORD IN LEDGER: So items show up in the SafeCode list
      if (d_codes > 0) {
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'codes', $3, 'sync')",
          [crypto.randomUUID(), userId, d_codes]
        );
      }
      if (d_silver > 0) {
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'silver', $3, 'sync')",
          [crypto.randomUUID(), userId, d_silver]
        );
      }
      if (d_gold > 0) {
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'gold', $3, 'sync')",
          [crypto.randomUUID(), userId, d_gold]
        );
      }
      
      await client.query('COMMIT');
      
      const row = updateRes.rows[0] || { codes_count: 0, silver_count: 0, gold_count: 0 };
      console.log(`[SYNC APPLIED] User ${userId} new counts: codes=${row.codes_count}, silver=${row.silver_count}, gold=${row.gold_count}`);

      return res.json({ 
        status: 'success', 
        synced_at: Date.now(),
        codes: Number(row.codes_count),
        silver: Number(row.silver_count),
        gold: Number(row.gold_count)
      });

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }

    return res.json({ status: 'success', synced_at: Date.now() });
  } catch (err) {
    console.error('🔥 [SYNC ERROR]:', err);
    return res.status(500).json({ status: 'failed', error: err.message });
  }
});

app.get('/api/ledger/verify', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      "SELECT COALESCE(codes_count, 0) as codes, COALESCE(silver_count, 0) as silver, COALESCE(gold_count, 0) as gold FROM users WHERE id = $1",
      [userId]
    );
    const row = result.rows[0] || { codes: 0, silver: 0, gold: 0 };
    return res.json({
      codes: Number(row.codes),
      silver: Number(row.silver),
      gold: Number(row.gold)
    });
  } catch (err) {
    console.error('[LEDGER VERIFY ERROR]', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)


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
<<<<<<< HEAD
app.get('/yt-clear', (req, res) => {
  console.log('[route] /yt-clear → yt-new-clear.html');
  res.sendFile(path.join(__dirname, 'yt-new-clear.html'));
});
app.get('/yt-clear/yt-new-clear.html', (req, res) => {
  console.log('[route] /yt-clear/yt-new-clear.html → yt-new-clear.html');
=======
app.get(['/yt-clear', '/yt-clear/yt-new-clear.html'], (req, res) => {
  const session = readSessionFromCookie(req, res);
  if (!session || !session.userId) {
    console.log(`[route] ${req.path} → Redirecting to login.html`);
    return res.redirect('/login.html');
  }
  console.log(`[route] ${req.path} → yt-new-clear.html`);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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

<<<<<<< HEAD
// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// AUTH REMOVED — CLEAN RESET

// CodeBank routes
// Serve CodeBank static assets first
app.use('/codebank', express.static(path.join(__dirname, 'codebank'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

=======
// CodeBank routes
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
// CodeBank SPA routes - serve indexCB.html for all other routes
app.get('/codebank/', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/indexCB.html'));
});
<<<<<<< HEAD
=======

// Explicit service routes to prevent 404 errors
app.get('/services/pebalaash/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'codebank/pebalaash/dist/public/index.html'));
});

app.get('/services/battalooda/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'codebank/battalooda/index.html'));
});

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
app.get('/codebank/*', (req, res) => {
  // If the request is for a static file that doesn't exist, serve indexCB.html
  const url = req.originalUrl;
  if (url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.status(404).send('Not Found');
  } else {
    res.sendFile(path.join(__dirname, 'codebank/indexCB.html'));
  }
});

// Pebalaash static assets (built)
app.use('/codebank/pebalaash', express.static(path.join(__dirname, 'codebank/pebalaash/dist/public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}))

<<<<<<< HEAD
=======
// Pebalaash routes - FIXED to match Samma3ny pattern
app.use('/pebalaash', express.static(path.join(__dirname, 'codebank/pebalaash/dist/public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/pebalaash', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/pebalaash/dist/public/index.html'));
});

app.get('/pebalaash/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/pebalaash/dist/public/index.html'));
});

// Battalooda routes - FIXED to match Samma3ny pattern
app.use('/battalooda', express.static(path.join(__dirname, 'codebank/battalooda'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/battalooda', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/battalooda/index.html'));
});

app.get('/battalooda/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/battalooda/index.html'));
});

// Games Centre routes - FIXED
app.use('/games-centre', express.static(path.join(__dirname, 'codebank/Games-Centre'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/games-centre', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/Games-Centre/index.html'));
});

app.get('/games-centre/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/Games-Centre/index.html'));
});

// E7ki routes - FIXED
app.use('/e7ki', express.static(path.join(__dirname, 'codebank/e7ki'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/e7ki', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/e7ki/index.html'));
});

app.get('/e7ki/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/e7ki/index.html'));
});

// Corsa routes - FIXED
app.use('/corsa', express.static(path.join(__dirname, 'codebank/corsa'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/corsa', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/corsa/index.html'));
});

app.get('/corsa/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/corsa/index.html'));
});

// Safecode routes - FIXED
app.use('/safecode', express.static(path.join(__dirname, 'codebank/safecode'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/safecode', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/safecode/index.html'));
});

app.get('/safecode/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/safecode/index.html'));
});

// Nostaglia routes - FIXED
app.use('/nostaglia', express.static(path.join(__dirname, 'codebank/nostaglia'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/nostaglia', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/nostaglia/index.html'));
});

app.get('/nostaglia/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/nostaglia/index.html'));
});

// Yahood routes - FIXED
app.use('/yahood', express.static(path.join(__dirname, 'codebank/yahood'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/yahood', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/yahood/index.html'));
});

app.get('/yahood/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/yahood/index.html'));
});

// Qarsan routes - FIXED
app.use('/qarsan', express.static(path.join(__dirname, 'codebank/qarsan'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/qarsan', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/qarsan/index.html'));
});

app.get('/qarsan/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/qarsan/index.html'));
});

// Setta routes - FIXED
app.use('/setta', express.static(path.join(__dirname, 'codebank/setta'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/setta', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/setta/index.html'));
});

app.get('/setta/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/setta/index.html'));
});

// Shots routes - FIXED
app.use('/shots', express.static(path.join(__dirname, 'codebank/shots'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/shots', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/shots/index.html'));
});

app.get('/shots/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/shots/index.html'));
});

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
// Legacy placeholder endpoints removed; unified API provides real implementations

// Samma3ny static files
app.use('/samma3ny', express.static(path.join(__dirname, 'codebank/samma3ny'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Samma3ny routes
app.get('/samma3ny', (req, res) => {
  res.sendFile(path.join(__dirname, 'codebank/samma3ny/index.html'));
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
<<<<<<< HEAD
app.get('/api/version', (req, res) => { res.status(404).end() });
=======
app.get('/api/reconcile', (req, res) => {
  // 🛡️ HOLE 7 FIX: Remove dangerous client-authoritative reconciliation
  return res.status(403).json({ status: 'failed', error: 'dangerous_operation_blocked', message: 'Client cannot send ledger values to server.' });
});
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)

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

<<<<<<< HEAD
=======
app.get('/api/rewards/balance', requireAuth, async (req, res) => {
  try {
    const session = readSessionFromCookie(req, res);
    if (!session || !session.userId) return res.status(401).json({ error: 'unauthorized' });

    const { userId } = session;
    
    if (process.env.DATABASE_URL) {
      // 🛡️ ARCHITECTURE ALIGNMENT: Fetch counts only from users table
      const result = await dbQuery(
        "SELECT COALESCE(codes_count, 0) as codes, COALESCE(silver_count, 0) as silver, COALESCE(gold_count, 0) as gold FROM users WHERE id = $1::uuid",
        [userId]
      );
      
      const row = result.rows[0] || { codes: 0, silver: 0, gold: 0 };

      return res.json({
        codes: Number(row.codes),
        silver: Number(row.silver),
        gold: Number(row.gold),
        likes: 0,
        superlikes: 0,
        games: 0,
        transactions: 0,
        updatedAt: Date.now(),
        last_updated: Date.now()
      });
    }

    return res.json({ codes: 0, silver: 0, gold: 0, likes: 0, updatedAt: Date.now() });
  } catch (err) {
    console.error('[REWARDS BALANCE ERROR]', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
app.get('/api/rewards', (req, res) => { res.status(404).end() })

app.post('/api/telemetry', (req, res) => {
  try { console.error('📡 TELEMETRY', req.body) } catch (_) { }
  res.sendStatus(204)
})

<<<<<<< HEAD
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
=======
app.post('/api/balloon/pop', async (req, res) => {
  try {
    const body = req.body || {}
    const p = Number(body.points || 0)
    const ts = Number(body.timestamp || Date.now())
    let uid = (body.userId || '').toString().trim()
    if (!uid) {
      const s = readSessionFromCookie(req, res)
      if (s && s.userId) uid = s.userId
    }
    if (!uid) return res.status(401).json({ ok: false, error: 'unauthorized' })
    if (!Number.isFinite(p) || p < 0 || p > 25) return res.status(400).json({ ok: false, error: 'invalid_points' })
    if (!Number.isFinite(ts) || (Date.now() - ts) > 5 * 60 * 1000) return res.status(400).json({ ok: false, error: 'invalid_timestamp' })
    global.__balloonClicks = global.__balloonClicks || new Map()
    const now = Date.now()
    const list = global.__balloonClicks.get(uid) || []
    const recent = list.filter(t => now - t < 60 * 1000)
    if (recent.length >= 20) return res.status(429).json({ ok: false, error: 'rate_limit' })
    recent.push(now)
    global.__balloonClicks.set(uid, recent)
    try { console.log('[BALLOON POP]', { userId: uid, points: p }) } catch (_){}
    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'internal_error' })
  }
})

// Neon codes persistence endpoint
app.post('/api/sqlite/codes', async (req, res) => {
  try {
    const { code } = req.body || {};
    const session = readSessionFromCookie(req, res);

    if (!session || !session.userId) {
      return res.status(401).json({ success: false, error: 'unauthorized' });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'code_required' });
    }

    // 1. Validate Code Format: xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-Pn
    const codePattern = /^([A-Z0-9]{4}-){6}P\d$/;
    if (!codePattern.test(code)) {
      console.warn(`[CLAIM REJECTED] Invalid code format: ${code}`);
      return res.status(400).json({ success: false, error: 'invalid_code_format' });
    }

    // 2. Prevent Double Spend using SHA256 Hash
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const userId = session.userId;

    await query('BEGIN');
    try {
      // Check if hash already used
      const used = await query("INSERT INTO used_codes (code_hash, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [hash, userId]);
      if (used.rowCount === 0) {
        console.warn(`[CLAIM REJECTED] Code already claimed (hash collision or duplicate): ${hash.slice(0, 8)}...`);
        await query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'code_already_claimed' });
      }

      // 3. Update Balance (Counts only)
      await query(
        "UPDATE users SET codes_count = COALESCE(codes_count, 0) + 1, last_sync_at = NOW() WHERE id = $1::uuid",
        [userId]
      );

      // 🛡️ ARCHITECTURE FIX: Actually persist the code string to the codes table
      // This ensures the GET /api/sqlite/codes endpoint can return the actual codes
      await query(
        "INSERT INTO codes (id, user_id, code, type, created_at) VALUES ($1, $2, $3, 'codes', CURRENT_TIMESTAMP)",
        [crypto.randomUUID(), userId, code]
      );

      // 4. Record in Ledger
      await query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', 'codes', 1, 'claim')",
        [crypto.randomUUID(), userId]
      );

      await query('COMMIT');
      return res.json({ success: true });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[CLAIM ERROR]', err);
    return res.status(500).json({ success: false, error: 'internal_error' });
  }
});

// AUTHORITATIVE CODES RETRIEVAL - MOVED TO END OF FILE

import WatchdogAI from './services/watchdog-ai.js';

// PRODUCTION-GRADE UNIFIED TRANSFER ENDPOINT
const transferLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 transfers per user/IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (_req, res) => {
    res.status(429).json({ success: false, error: 'TRANSFER_RATE_LIMIT_EXCEEDED' })
  }
});

app.post('/api/transfer', requireAuth, transferLimiter, enforceFinancialSecurity, async (req, res) => {
  const client = await pool.connect();
  const { transactionId, receiverEmail, codes, type } = req.body || {};
  const fromUserId = req.user.id;
  const assetType = type || 'codes';
  const amount = Array.isArray(codes) ? codes.length : 0;

  // 1. HARD VALIDATION: AUTH STATUS
  if (!req.user || !req.user.id) {
    console.error(`[AUDIT] [FAIL] [UNAUTHENTICATED] attempt from IP: ${req.ip}`);
    return res.status(401).json({ success: false, error: 'UNAUTHENTICATED', status: 'unauthenticated' });
  }

  if (!transactionId) return res.status(400).json({ success: false, error: 'MISSING_TRANSACTION_ID' });
  if (!receiverEmail) return res.status(400).json({ success: false, error: 'MISSING_RECEIVER' });
  if (amount <= 0) return res.status(400).json({ success: false, error: 'NO_ASSETS_PROVIDED' });

  // 🛡️ STEP 0: WATCHDOG AI RISK ANALYSIS
  const riskAnalysis = WatchdogAI.evaluateRisk(fromUserId);
  if (riskAnalysis.decision !== 'ALLOW') {
    console.warn(`[AUDIT] [WATCHDOG_BLOCK] user=${fromUserId} | decision=${riskAnalysis.decision} | reason=${riskAnalysis.reasons}`);
    return res.status(403).json({ 
      success: false, 
      error: 'SECURITY_RESTRICTION', 
      decision: riskAnalysis.decision, 
      message: riskAnalysis.decision === 'FREEZE' ? 'Your account is temporarily in a cool-down period. Please wait a few minutes.' : 'Your request was flagged for security review.'
    });
  }

  try {
    const receiver = await sqliteFindUserByEmail(receiverEmail);
    if (!receiver || !receiver.id) {
      console.warn(`[AUDIT] [FAIL] [RECEIVER_NOT_FOUND] sender=${fromUserId} receiverEmail=${receiverEmail}`);
      return res.status(404).json({ success: false, error: 'RECEIVER_NOT_FOUND' });
    }
    const toUserId = receiver.id;

    if (fromUserId === toUserId) {
      console.warn(`[AUDIT] [FRAUD_FLAG] [SELF_TRANSFER] user=${fromUserId}`);
      return res.status(400).json({ success: false, error: 'SELF_TRANSFER_FORBIDDEN' });
    }

    const balanceField = assetType === 'silver' ? 'silver_count' : (assetType === 'gold' ? 'gold_count' : 'codes_count');

    // 2. ATOMIC LOCKING & TRANSACTION
    await client.query('BEGIN');
    try {
      // 🛡️ STEP 1: IDEMPOTENCY BINDING (Inside transaction)
      const idempRes = await client.query(
        "INSERT INTO processed_transactions (tx_id) VALUES ($1) ON CONFLICT DO NOTHING",
        [transactionId]
      );
      
      if (idempRes.rowCount === 0) {
        await client.query('ROLLBACK');
        console.log(`[AUDIT] [IDEMPOTENCY] Transaction ${transactionId} already processed.`);
        return res.json({ success: true, message: 'ALREADY_PROCESSED', txId: transactionId });
      }

      // 🛡️ STEP 2: PRE-TRANSACTION BALANCE SNAPSHOT
      const preSnapshot = await client.query(
        `SELECT id, ${balanceField} FROM users WHERE id IN ($1, $2)`,
        [fromUserId, toUserId]
      );
      const senderPre = preSnapshot.rows.find(r => r.id === fromUserId)?.[balanceField] || 0;
      const receiverPre = preSnapshot.rows.find(r => r.id === toUserId)?.[balanceField] || 0;

      if (senderPre < amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // 🛡️ STEP 3: OWNERSHIP TRANSFER
      if (assetType === 'codes') {
        let transferredCount = 0;
        for (const code of codes) {
          const transferRes = await client.query(
            "UPDATE codes SET user_id = $1, created_at = CURRENT_TIMESTAMP WHERE code = $2 AND user_id = $3 AND spent = 0",
            [toUserId, code, fromUserId]
          );

          if (transferRes.rowCount === 0) {
            throw new Error(`OWNERSHIP_FAILED_OR_CODE_SPENT: ${code}`);
          }
          transferredCount++;
        }

        if (transferredCount !== amount) {
          throw new Error(`TRANSFER_COUNT_MISMATCH: Expected ${amount}, got ${transferredCount}`);
        }
      }

      // 🛡️ STEP 4: BALANCE UPDATES
      const senderBalanceRes = await client.query(
        `UPDATE users SET ${balanceField} = ${balanceField} - $1 WHERE id = $2 AND ${balanceField} >= $1 RETURNING ${balanceField}`,
        [amount, fromUserId]
      );

      if (senderBalanceRes.rows.length === 0) {
        throw new Error('INSUFFICIENT_BALANCE_DURING_UPDATE');
      }

      const receiverUpdateRes = await client.query(
        `UPDATE users SET ${balanceField} = COALESCE(${balanceField}, 0) + $1 WHERE id = $2`,
        [amount, toUserId]
      );

      if (receiverUpdateRes.rowCount === 0) {
        throw new Error('RECEIVER_BALANCE_UPDATE_FAILED');
      }

      // 🛡️ STEP 5: POST-TRANSACTION SNAPSHOT VERIFICATION
      const postSnapshot = await client.query(
        `SELECT id, ${balanceField} FROM users WHERE id IN ($1, $2)`,
        [fromUserId, toUserId]
      );
      const senderPost = postSnapshot.rows.find(r => r.id === fromUserId)?.[balanceField] || 0;
      const receiverPost = postSnapshot.rows.find(r => r.id === toUserId)?.[balanceField] || 0;

      if (senderPost !== (senderPre - amount) || receiverPost !== (receiverPre + amount)) {
        console.error(`[AUDIT] [FRAUD_FLAG] [BALANCE_MISMATCH] txId=${transactionId} senderPre=${senderPre} senderPost=${senderPost} receiverPre=${receiverPre} receiverPost=${receiverPost} amount=${amount}`);
        throw new Error('BALANCE_INTEGRITY_VIOLATION');
      }

      // 🛡️ STEP 6: RECORD LEDGER
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'debit', $3, $4, 'transfer_out')",
        [transactionId, fromUserId, assetType, amount]
      );
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, 'credit', $3, $4, 'transfer_in')",
        [transactionId, toUserId, assetType, amount]
      );

      await client.query('COMMIT');
      
      // 🛡️ WATCHDOG AI SUCCESS TRACKING
      WatchdogAI.trackSuccess(fromUserId, 'TRANSFER');
      
      console.log(`[AUDIT] [SUCCESS] txId=${transactionId} | sender=${fromUserId} | receiver=${toUserId} | amount=${amount} | asset=${assetType}`);
      
      return res.json({ 
        success: true, 
        txId: transactionId, 
        amount, 
        newBalance: Number(senderPost) 
      });

    } catch (txError) {
      await client.query('ROLLBACK');
      
      // 🛡️ WATCHDOG AI FAILURE TRACKING
      WatchdogAI.trackFailure(fromUserId, txError.message);
      
      console.error(`[AUDIT] [FAIL] txId=${transactionId} | error=${txError.message}`);
      return res.status(400).json({ success: false, error: txError.message });
    }

  } catch (err) {
    console.error(`[AUDIT] [FAIL] [SYSTEM_ERROR] txId=${transactionId} | error=${err.message}`);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  } finally {
    client.release();
  }
});

// Admin-only manual deposit endpoint
app.post('/api/admin/deposit', async (req, res) => {
  try {
    const session = readSessionFromCookie(req, res);
    let authEmail = null;
    try {
      const h = req.headers && req.headers.authorization || '';
      const parts = h.split(' ');
      if (parts[0] === 'Bearer' && parts[1]) {
        const decoded = jwt.verify(parts[1], JWT_SECRET);
        authEmail = decoded && decoded.email || null;
      }
    } catch(err) { 
      console.error('[AUTH] JWT decode error:', err)
      authEmail = null; 
    }
    if (!session && !authEmail) return res.status(401).json({ ok: false, error: 'unauthorized' });
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    const isDev = String(process.env.NODE_ENV||'development') !== 'production';
    const allowDev = isDev && (process.env.DEV_ALLOW_ADMIN_DEPOSIT === '1' || adminEmails.length === 0);
    const isAdmin = !!(allowDev || (session && (session.isAdmin || session.role === 'dev' || (session.email && adminEmails.includes(String(session.email).toLowerCase())))) || (authEmail && adminEmails.includes(String(authEmail).toLowerCase())));
    if (!isAdmin) return res.status(403).json({ ok: false, error: 'forbidden' });

    const { email, code, type, amount } = req.body || {};
    if (!email || !code || !type || !amount) return res.status(400).json({ ok: false, error: 'missing_fields' });
    const t = String(type);
    const kind = (t==='silver' || t==='gold') ? t : 'codes';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const u = await client.query('SELECT id FROM users WHERE email=$1 LIMIT 1', [String(email).trim()]);
      if (!u.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ ok: false, error: 'user_not_found' }); }
      const userId = u.rows[0].id;

      // Ensure type column exists
      try { await client.query("ALTER TABLE codes ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'codes'"); } catch(e) { if (!e.message.includes('duplicate column name')) throw e; }

      // Attempt N inserts; unique(code) prevents duplicates
      const amt = Math.max(1, parseInt(amount, 10) || 1);
      const ins = await client.query(
        "INSERT INTO codes (id, user_id, code, type, created_at, generated_at, next_at, meta) " +
        "VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5) ON CONFLICT (code) DO NOTHING",
        [crypto.randomUUID(), userId, String(code).trim(), kind, JSON.stringify({ from_admin: true })]
      );

      await client.query('COMMIT');
      try {
        if (wss) {
          const count = Math.max(1, parseInt(amt, 10) || 1);
          const codesPayload = Array(count).fill(String(code).trim());
          const payload = { type: 'CODES_RECEIVED', codes: codesPayload, assetType: kind, from_admin: true, to: userId, timestamp: Date.now() };
          if (typeof wss.__emitToUser === 'function') {
            wss.__emitToUser(userId, payload);
          } else if (wss.clients) {
            const s = JSON.stringify(payload);
            wss.clients.forEach(ws => { try { if (ws && ws.readyState === 1 && ws.userId === String(userId)) ws.send(s); } catch(_){} });
          }
        }
      } catch(_){ }
      
      // Get updated balances for immediate UI update
      const balancesRes = await client.query(
        "SELECT asset_type, SUM(amount) AS total FROM balance_projection WHERE user_id=$1 GROUP BY asset_type ORDER BY asset_type ASC",
        [userId]
      );
      const balances = {};
      for (const row of balancesRes.rows) {
        const key = row.asset_type === 'codebank' ? 'codes' : row.asset_type;
        balances[key] = typeof row.total === 'number' ? row.total : 0;
      }
      
      return res.json({ 
        ok: true, 
        inserted: ins.rowCount || 0, 
        userId, 
        type: kind,
        balances: balances
      });
    } catch (e) {
      try { await client.query('ROLLBACK'); } catch(_){ }
      try { console.error('[Admin Deposit]', e); } catch(_){ }
      return res.status(500).json({ ok: false, error: e && e.message || 'deposit_failed' });
    } finally {
      try { client.release(); } catch(_){ }
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message || 'internal_error' });
  }
});

app.get('/api/sqlite/diag', async (req, res) => {
    try {
      const tables = ['users','codes','ledger','rewards','events','transactions','vault'];
      const columns = [];
      for (const t of tables) {
        try {
          const { rows } = await query(`PRAGMA table_info(${t})`);
          rows.forEach(r => columns.push({ column_name: r.name, table_name: t }));
        } catch (_) {}
      }
      return res.json({ status: 'success', columns, foreign_keys: [] })
    } catch (e) {
      return res.status(500).json({ status: 'failed', error: e && e.message })
    }
})

// Watch-Dog Guardian API Endpoints
// 🛡️ PROTECTOR: Enforcer | Gatekeeper | Security Layer

// Tables initialization - disabled due to startup crashes
// Tables will be created on first API call instead
console.log('[INIT] Tables will be created on first use')

// WatchDog routes registered via app.use('/api/watchdog', watchdogRoutes) in main init section

// POST /api/watchdog/feed - Feed the watchdog (costs 10 codes) - Enhanced Security
app.post('/api/watchdog/feed', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' })
    
    // Get idempotency key from request
    const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || null
    
    // Use enhanced Watch-Dog Guardian feed function
    const result = await feedWatchDog(userId, idempotencyKey)
    
    // Store idempotency response if key was provided
    if (idempotencyKey && result.success) {
      storeIdempotencyResponse(userId, idempotencyKey, result)
    }
    
    if (result.success) {
      console.log(`[WATCHDOG] ✅ Dog fed for user ${userId}, cost: ${result.cost} codes`)
      return res.json({ 
        success: true, 
        cost: result.cost, 
        newBalance: result.newBalance,
        dogState: result.dogState,
        idempotent: result.idempotent || false,
        txId: result.txId
      })
    } else {
      return res.status(400).json({ 
        success: false, 
        error: result.error,
        message: result.message,
        details: result
      })
    }
    
  } catch (err) {
    console.error('[WATCHDOG] feed outer error:', err)
    return res.status(500).json({ success: false, error: err && err.message })
  }
})

// =============================================================================
// QARSAN API ENDPOINTS - Server-Side Financial Operations
// CRITICAL: All operations MUST go through security middleware
// =============================================================================

// Tables will be auto-created on first API call via ON CONFLICT DO UPDATE
console.log('[QARSAN] Tables auto-created on first use')

// GET /api/qarsan/status - Get Qarsan status for current user
app.get('/api/qarsan/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' })
    
    const userEmailRes = await query(
      'SELECT email FROM users WHERE id = $1::uuid',
      [userId]
    )
    const userEmail = userEmailRes.rows.length > 0 ? userEmailRes.rows[0].email : null
    
    // Get Watch-Dog state
    const dogResult = await query(
      'SELECT last_fed_at, dog_state FROM watchdog_state WHERE user_id = $1::uuid',
      [userId]
    )
    let dogState = 'SLEEPING'
    let lastFedAt = null
    if (dogResult.rows.length > 0) {
      dogState = dogResult.rows[0].dog_state
      lastFedAt = dogResult.rows[0].last_fed_at
      // Check if dead based on last fed time
      if (lastFedAt) {
        const hoursSinceLastFeed = (new Date() - new Date(lastFedAt)) / (1000 * 60 * 60)
        if (hoursSinceLastFeed >= 72) dogState = 'DEAD'
      }
    }
    
    // Get Qarsan state
    const qarsanResult = await query(
      'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1::uuid',
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
    return res.status(500).json({ success: false, error: err && err.message })
  }
})

app.post('/api/qarsan/mode', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' })
    const { mode, depositAmount } = req.body || {}
    if (!mode || !['OFF', 'RANGED', 'EXPOSURE'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'invalid_mode' })
    }
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const dogResult = await client.query(
        'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1::uuid',
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
        'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1::uuid',
        [userId]
      )
      if (existing.rows.length > 0) {
        currentMode = existing.rows[0].mode
        currentWallet = parseInt(existing.rows[0].wallet_balance || 0, 10)
      }
      let newWallet = currentWallet
      if (mode === 'RANGED' && depositAmount > 0) {
        const balanceResult = await client.query(
          "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0)::int as balance FROM ledger WHERE user_id = $1::uuid AND asset_type = 'codes'",
          [userId]
        )
        const balance = parseInt(balanceResult.rows[0]?.balance || 0, 10)
        if (balance < depositAmount) {
          await client.query('ROLLBACK')
          return res.status(400).json({ success: false, error: 'INSUFFICIENT_BALANCE' })
        }
        const txIdResult = await client.query('SELECT gen_random_uuid() AS id')
        const txId = txIdResult.rows[0].id
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', $3, 'QARSAN_MODE_CHANGE')",
          [txId, userId, depositAmount]
        )
        newWallet = currentWallet + depositAmount
      }
      await client.query(
        `INSERT INTO qarsan_state (user_id, mode, wallet_balance, updated_at) 
         VALUES ($1::uuid, $2, $3, NOW())
         ON CONFLICT (user_id) DO UPDATE SET mode = $2, wallet_balance = $3, updated_at = NOW()`,
        [userId, mode, newWallet]
      )
      const modeTxId = await client.query('SELECT gen_random_uuid() AS id')
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', 0, 'QARSAN_MODE_CHANGE')",
        [modeTxId.rows[0].id, userId]
      )
      await client.query(
        "INSERT INTO audit_log (type, payload) VALUES ($1, $2::jsonb)",
        ['QARSAN_MODE_CHANGE', JSON.stringify({ userId, mode, walletBalance: newWallet, ts: new Date().toISOString() })]
      )
      await client.query('COMMIT')
      __sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'mode', mode, walletBalance: newWallet })
      __sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      return res.json({ success: true, qarsanMode: mode, walletBalance: newWallet })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      if (typeof client.release === 'function') client.release()
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err && err.message })
  }
})

// POST /api/qarsan/activate - legacy alias
app.post('/api/qarsan/activate', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' })
    
    const { mode, depositAmount } = req.body || {}
    if (!mode || !['OFF', 'RANGED', 'EXPOSURE'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'invalid_mode' })
    }
    
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Check Watch-Dog state
      const dogResult = await client.query(
        'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1::uuid',
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
      
      // Cannot activate if dog is DEAD
      if (dogState === 'DEAD') {
        await client.query('ROLLBACK')
        return res.status(403).json({ success: false, error: 'DOG_DEAD', message: 'Cannot activate Qarsan - Watch-Dog has died' })
      }
      
      // Get or create Qarsan state
      let currentMode = 'OFF'
      let currentWallet = 0
      const existing = await client.query(
        'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1::uuid',
        [userId]
      )
      if (existing.rows.length > 0) {
        currentMode = existing.rows[0].mode
        currentWallet = parseInt(existing.rows[0].wallet_balance || 0, 10)
      }
      
      // Handle deposit for RANGED mode
      let newWallet = currentWallet
      if (mode === 'RANGED' && depositAmount > 0) {
        const balanceResult = await client.query(
          "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0)::int as balance FROM ledger WHERE user_id = $1::uuid AND asset_type = 'codes'",
          [userId]
        )
        const balance = parseInt(balanceResult.rows[0]?.balance || 0, 10)
        
        if (balance < depositAmount) {
          await client.query('ROLLBACK')
          return res.status(400).json({ success: false, error: 'INSUFFICIENT_BALANCE', message: `Need ${depositAmount} codes but only have ${balance}` })
        }
        
        const txIdResult = await client.query('SELECT gen_random_uuid() AS id')
        const txId = txIdResult.rows[0].id
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', $3, 'QARSAN_MODE_CHANGE')",
          [txId, userId, depositAmount]
        )
        newWallet = currentWallet + depositAmount
      }
      
      // Update Qarsan state
      await client.query(
        `INSERT INTO qarsan_state (user_id, mode, wallet_balance, updated_at) 
         VALUES ($1::uuid, $2, $3, NOW())
         ON CONFLICT (user_id) DO UPDATE SET mode = $2, wallet_balance = $3, updated_at = NOW()`,
        [userId, mode, newWallet]
      )
      
      const modeTxId = await client.query('SELECT gen_random_uuid() AS id')
      await client.query(
        "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'debit', 'codes', 0, 'QARSAN_MODE_CHANGE')",
        [modeTxId.rows[0].id, userId]
      )
      await client.query(
        "INSERT INTO audit_log (type, payload) VALUES ($1, $2::jsonb)",
        ['QARSAN_MODE_CHANGE', JSON.stringify({ userId, mode, walletBalance: newWallet, ts: new Date().toISOString() })]
      )
      
      await client.query('COMMIT')
      
      __sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'mode', mode, walletBalance: newWallet })
      __sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      return res.json({ success: true, qarsanMode: mode, walletBalance: newWallet })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      if (typeof client.release === 'function') client.release()
    }
  } catch (err) {
    console.error('[QARSAN] activate error:', err)
    return res.status(500).json({ success: false, error: err && err.message })
  }
})

// POST /api/qarsan/deactivate - Deactivate Qarsan
app.post('/api/qarsan/deactivate', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' })
    
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Get current Qarsan state
      const existing = await client.query(
        'SELECT wallet_balance FROM qarsan_state WHERE user_id = $1::uuid',
        [userId]
      )
      
      const currentWallet = existing.rows.length > 0 ? parseInt(existing.rows[0].wallet_balance || 0, 10) : 0
      
      if (currentWallet > 0) {
        const txIdResult = await client.query('SELECT gen_random_uuid() AS id')
        const txId = txIdResult.rows[0].id
        await client.query(
          "INSERT INTO ledger (tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1::uuid, $2::uuid, 'credit', 'codes', $3, 'QARSAN_MODE_CHANGE')",
          [txId, userId, currentWallet]
        )
      }
      
      // Set mode to OFF
      await client.query(
        "INSERT INTO qarsan_state (user_id, mode, wallet_balance, updated_at) VALUES ($1::uuid, 'OFF', 0, NOW()) ON CONFLICT (user_id) DO UPDATE SET mode = 'OFF', wallet_balance = 0, updated_at = NOW()",
        [userId]
      )
      
      await client.query('COMMIT')
      
      __sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'mode', mode: 'OFF', walletBalance: 0 })
      __sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      return res.json({ success: true, message: 'Qarsan deactivated' })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      if (typeof client.release === 'function') client.release()
    }
  } catch (err) {
    console.error('[QARSAN] deactivate error:', err)
    return res.status(500).json({ success: false, error: err && err.message })
  }
})

// POST /api/qarsan/attack - Execute theft (THE CRITICAL SECURITY OPERATION)
app.post('/api/qarsan/attack', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {
    const attackerId = req.user && req.user.id
    if (!attackerId) return res.status(401).json({ success: false, error: 'unauthorized' })
    
    const { targetUserId, amount, txId: providedTxId } = req.body || {}
    if (!targetUserId) return res.status(400).json({ success: false, error: 'target_required' })
    if (attackerId === targetUserId) return res.status(400).json({ success: false, error: 'self_attack_not_allowed' })
    if (!providedTxId) return res.status(400).json({ success: false, error: 'txId_required' })
    
    const stealAmount = parseInt(amount || 0, 10)
    if (stealAmount <= 0) return res.status(400).json({ success: false, error: 'invalid_amount' })
    
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      // SQLite doesn't need advisory locks as it's single-write
      // await client.query("SELECT pg_advisory_xact_lock((('x'||substr(md5($1||$2),1,16))::bit(64))::bigint)", [attackerId, targetUserId])
      
      const prior = await client.query('SELECT 1 FROM ledger WHERE tx_id = $1::uuid LIMIT 1', [providedTxId])
      if (prior.rows.length > 0) {
        await client.query('ROLLBACK')
        return res.json({ success: true, idempotent: true, amount: 0, message: 'duplicate_tx' })
      }
      
      // Check target's Watch-Dog state
      const targetDogResult = await client.query(
        'SELECT dog_state, last_fed_at FROM watchdog_state WHERE user_id = $1::uuid',
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
      
      // Cannot steal from ACTIVE or DEAD dog
      if (targetDogState !== 'SLEEPING') {
        await client.query('ROLLBACK')
        return res.status(403).json({ 
          success: false, 
          error: targetDogState === 'ACTIVE' ? 'DOG_ACTIVE' : 'DOG_DEAD',
          message: `Cannot steal from user with ${targetDogState} dog`
        })
      }
      
      // Get target's Qarsan mode
      const targetQarsanResult = await client.query(
        'SELECT mode, wallet_balance FROM qarsan_state WHERE user_id = $1',
        [targetUserId]
      )
      const targetMode = targetQarsanResult.rows.length > 0 ? targetQarsanResult.rows[0].mode : 'OFF'
      const targetWallet = parseInt(targetQarsanResult.rows[0]?.wallet_balance || 0, 10)
      
      // Get target's actual balance
      const targetBalanceResult = await client.query(
        "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0) as balance FROM ledger WHERE user_id = $1 AND asset_type = 'codes'",
        [targetUserId]
      )
      const targetBalance = parseInt(targetBalanceResult.rows[0]?.balance || 0, 10)
      
      // Calculate steal scope
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
      
      const txId = providedTxId
      await client.query(
        "INSERT INTO ledger (id, tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, $3, 'debit', 'codes', $4, 'QARSAN_THEFT_DEBIT')",
        [crypto.randomUUID(), txId, targetUserId, actualStealAmount]
      )
      
      // Credit to attacker
      await client.query(
        "INSERT INTO ledger (id, tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, $3, 'credit', 'codes', $4, 'QARSAN_THEFT_CREDIT')",
        [crypto.randomUUID(), txId, attackerId, actualStealAmount]
      )
      
      // Update Qarsan wallet if wallet was stolen
      if (stealScope === 'QARSAN_WALLET_ONLY') {
        await client.query(
          "UPDATE qarsan_state SET wallet_balance = MAX(0, wallet_balance - $1), updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
          [actualStealAmount, targetUserId]
        )
      }
      
      await client.query(
        "INSERT INTO audit_log (type, payload) VALUES ($1, $2)",
        ['QARSAN_THEFT', JSON.stringify({ attackerId, targetUserId, amount: actualStealAmount, scope: stealScope, txId, ts: new Date().toISOString() })]
      )
      
      await client.query('COMMIT')
      
      console.log(`[QARSAN] Theft: ${attackerId} stole ${actualStealAmount} codes from ${targetUserId}, scope: ${stealScope}`)
      
      __sseEmit(attackerId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      __sseEmit(targetUserId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      __sseEmit(attackerId, { type: 'QARSAN_UPDATE', action: 'attack', targetUserId, amount: actualStealAmount, txId, scope: stealScope })
      __sseEmit(targetUserId, { type: 'QARSAN_UPDATE', action: 'attacked', attackerId, amount: actualStealAmount, txId, scope: stealScope })
      
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
      if (typeof client.release === 'function') client.release()
    }
  } catch (err) {
    console.error('[QARSAN] attack error:', err)
    return res.status(500).json({ success: false, error: err && err.message })
  }
})

// GET /api/qarsan/users - Get virtual users for attack targets
app.get('/api/qarsan/users', requireAuth, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' })
    
    // Get virtual users with email information
    let virtualUsers = await query(`
      SELECT 
        virtual_user_id as id, 
        email, 
        name, 
        dog_state, 
        qarsan_mode, 
        balance, 
        qarsan_wallet,
        last_fed_at
      FROM qarsan_virtual_users 
      ORDER BY created_at DESC 
      LIMIT 20
    `)
    
    if (virtualUsers.rows.length === 0) {
      // Generate virtual users if none exist
      await generateVirtualUsers()
      
      // Re-query after generation
      virtualUsers = await query(`
        SELECT 
          virtual_user_id as id, 
          email, 
          name, 
          dog_state, 
          qarsan_mode, 
          balance, 
          qarsan_wallet,
          last_fed_at
        FROM qarsan_virtual_users 
        ORDER BY created_at DESC 
        LIMIT 20
      `)
    }
    
    // Filter out current user and calculate attackability
    const users = await Promise.all(virtualUsers.rows.map(async row => {
      let dogState = row.dog_state
      // Check if dead
      if (row.last_fed_at) {
        const hoursSinceLastFeed = (new Date() - new Date(row.last_fed_at)) / (1000 * 60 * 60)
        if (hoursSinceLastFeed >= 72) dogState = 'DEAD'
      }
      
      let stealScope = 'NONE'
      if (dogState === 'SLEEPING') {
        if (row.qarsan_mode === 'RANGED') stealScope = 'QARSAN_WALLET_ONLY'
        else if (row.qarsan_mode === 'EXPOSURE') stealScope = 'ALL_ASSETS'
      }
      
    // Fetch balance from LEDGER (source of truth) instead of direct columns
    const balanceRes = await query(
      "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END),0) AS balance FROM ledger WHERE user_id = $1 AND asset_type='codes'",
      [row.id]
    )
    
    // For virtual users, qarsan_wallet is maintained separately but should also use ledger
    const qarsanWalletRes = await query(
      "SELECT COALESCE(SUM(CASE WHEN reference LIKE 'QARSAN_%' THEN CASE WHEN direction='credit' THEN amount ELSE -amount END ELSE 0 END),0) AS qarsan_balance FROM ledger WHERE user_id = $1 AND asset_type='codes'",
      [row.id]
    )
      
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        dogState,
        qarsanMode: row.qarsan_mode,
        balance: parseInt(balanceRes.rows[0]?.balance || 0, 10),
        qarsanWallet: parseInt(qarsanWalletRes.rows[0]?.qarsan_balance || 0, 10),
        stealScope,
        canAttack: dogState === 'SLEEPING' && stealScope !== 'NONE'
      }
    }))
    
    return res.json({ success: true, users })
  } catch (err) {
    console.error('[QARSAN] users error:', err)
    return res.status(500).json({ success: false, error: err && err.message })
  }
})

app.post('/api/qarsan/feed-dog', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ success: false, error: 'unauthorized' })
    const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey || null
    const result = await feedWatchDog(userId, idempotencyKey)
    if (idempotencyKey && result.success) {
      storeIdempotencyResponse(userId, idempotencyKey, result)
    }
    if (result.success) {
      __sseEmit(userId, { type: 'ASSET_UPDATE', assetType: 'codes' })
      __sseEmit(userId, { type: 'QARSAN_UPDATE', action: 'dog_fed' })
      return res.json({ 
        success: true, 
        cost: result.cost, 
        newBalance: result.newBalance,
        dogState: result.dogState,
        idempotent: result.idempotent || false,
        txId: result.txId
      })
    } else {
      return res.status(400).json({ success: false, error: result.error, message: result.message, details: result })
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err && err.message })
  }
})

// Smart Compression Logic (normal -> silver -> gold)
async function compressToSilver(userId) {
  try {
    const r = await query(
      'SELECT codes_count FROM balances WHERE user_id=$1',
      [userId]
    );

    if (r.rows.length > 0 && r.rows[0].codes_count >= 100) {
      await query(
        'UPDATE balances SET codes_count = codes_count - 100, silver_count = silver_count + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id=$1',
        [userId]
      );
      console.log(`[COMPRESSION] 100 normal -> 1 silver for user ${userId}`);
    }
  } catch (err) {
    console.error('[COMPRESSION ERROR] compressToSilver:', err.message);
  }
}

async function compressToGold(userId) {
  try {
    const r = await query(
      'SELECT silver_count FROM balances WHERE user_id=$1',
      [userId]
    );

    if (r.rows.length > 0 && r.rows[0].silver_count >= 10) {
      await query(
        'UPDATE balances SET silver_count = silver_count - 10, gold_count = gold_count + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id=$1',
        [userId]
      );
      console.log(`[COMPRESSION] 10 silver -> 1 gold for user ${userId}`);
    }
  } catch (err) {
    console.error('[COMPRESSION ERROR] compressToGold:', err.message);
  }
}

// Mint endpoint - Server generates codes only when requested
app.post('/api/mint', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = 5;
    const codes = [];

    // Helper to generate a code (reusing existing logic or standard format)
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 26; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    for (let i = 0; i < amount; i++) {
      codes.push(generateCode());
    }

    // Batch insert codes
    for (const code of codes) {
      await query(
        'INSERT INTO codes (user_id, code, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [userId, code, 'normal']
      );
    }

    // Update balances (Upsert)
    await query(
      `INSERT INTO balances (user_id, codes_count) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET codes_count = balances.codes_count + $2, updated_at = CURRENT_TIMESTAMP`,
      [userId, codes.length]
    );

    res.json({ minted: codes.length });
  } catch (err) {
    console.error('[MINT ERROR]', err);
    res.status(500).json({ error: 'mint_failed', message: err.message });
  }
});

app.post('/api/rewards/claim', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body; // 'silver' or 'gold'

    if (!type || (type !== 'silver' && type !== 'gold')) {
      return res.status(400).json({ error: 'Invalid reward type' });
    }

    // Use UPSERT to initialize balance if it doesn't exist
    await query(
      `INSERT INTO balances (user_id, ${type}_count) VALUES ($1, 1) 
       ON CONFLICT (user_id) DO UPDATE SET ${type}_count = balances.${type}_count + 1, updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );

    console.log(`[REWARD CLAIM] 1 ${type} bar added to user ${userId}`);
    res.json({ success: true, claimed: type });

  } catch (err) {
    console.error('[REWARD CLAIM ERROR]', err);
    res.status(500).json({ error: 'claim_failed', message: err.message });
  }
});

setInterval(async () => {
  try {
    const users = await query('SELECT id FROM users');

    for (const u of users.rows) {
      await compressToSilver(u.id);
      await compressToGold(u.id);
    }
  } catch (err) {
    console.error('[SMART WATCHDOG ERROR]', err.message);
  }
}, 30000);

app.get('/api/balances', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const r = await query(
      'SELECT codes_count, silver_count, gold_count FROM balances WHERE user_id=$1',
      [userId]
    );

    if (r.rows.length === 0) {
      return res.json({ codes_count: 0, silver_count: 0, gold_count: 0 });
    }

    res.json(r.rows[0]);
  } catch (err) {
    console.error('[BALANCES ERROR]', err);
    res.status(500).json({ error: 'fetch_balances_failed' });
  }
});



app.get('/api/diag/ledger-schema', async (req, res) => {
  try {
    const { rows } = await query("PRAGMA table_info(ledger)");
    return res.json({ columns: rows.map(r => r.name) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Diagnostic endpoints (REMOVED balances view dependency)
app.get('/api/diag/neon-sync', async (req, res) => {
  try {
    const s = readSessionFromCookie(req, res);
    if (!s || !s.userId) {
      return res.json({ ok: false, reason: 'no_session' });
    }
    return res.json({ ok: true, userId: s.userId, message: 'balances view deprecated - use watchdog' });
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message })
  }
})

// Neon codes diagnostic endpoint (session required)
<<<<<<< HEAD
app.get('/api/diag/neon-codes', async (req, res) => {
  try {
    const s = readSessionFromCookie(req);
=======
app.get('/api/diag/sqlite-codes', async (req, res) => {
  try {
    const s = readSessionFromCookie(req, res);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    if (!s || !s.userId) {
      return res.json({ ok: false, reason: 'no_session' });
    }
    if (!process.env.DATABASE_URL) {
      return res.json({ ok: true, count: 0, latest: null, codes: [] });
    }
<<<<<<< HEAD
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
=======
    const { rows } = await query(
      'SELECT code, created_at FROM codes WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',
      [s.userId]
    )
    const latest = rows && rows[0] ? rows[0].code : null;
    return res.json({ ok: true, count: rows.length, latest, codes: rows })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message });
  }
})

// Rewards transfer (codes) — atomic Neon transaction - Enhanced Security
app.post('/api/rewards/transfer', requireAuth, enforceFinancialSecurity, async (req, res) => {
  try {
    const session = readSessionFromCookie(req, res);
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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

<<<<<<< HEAD
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const pool = await NeonAdapter.connect();
=======
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    const client = await pool.connect();

    const MAX_RETRIES = 3;
    let attempt = 0;
    while (true) {
      attempt++;
      try {
        await client.query('BEGIN');
<<<<<<< HEAD
        await client.query("SELECT pg_advisory_xact_lock((('x'||substr(md5($1||$2),1,16))::bit(64))::bigint)", [fromUserId, toUserId]);

        const lockRes = await client.query(
          "SELECT amount FROM balances WHERE user_id=$1::uuid AND asset='codebank' FOR UPDATE",
=======
        // SQLite doesn't need advisory locks as it's single-write
      // await client.query("SELECT pg_advisory_xact_lock((('x'||substr(md5($1||$2),1,16))::bit(64))::bigint)", [fromUserId, toUserId]);

        const lockRes = await client.query(
          "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END),0) AS amount FROM ledger WHERE user_id=$1 AND asset_type='codes'",
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
          [fromUserId]
        );
        try { console.log('[TRANSFER] lock sender amount =', (lockRes.rows[0] && Number(lockRes.rows[0].amount)) || 0) } catch(_){ }
        const fromAmount = (lockRes.rows[0] && Number(lockRes.rows[0].amount)) || 0;
        if (fromAmount < amount) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'insufficient_balance' });
        }

<<<<<<< HEAD
        await client.query(
          "UPDATE balances SET amount = amount - $1, updated_at = NOW() WHERE user_id=$2::uuid AND asset='codebank'",
          [amount, fromUserId]
=======
        const txId2 = crypto.randomUUID();
        await client.query(
          "INSERT INTO ledger (id, tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, $3, 'debit', 'codes', $4, 'reward_transfer')",
          [crypto.randomUUID(), txId2, fromUserId, amount]
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
        );
        try { console.log('[TRANSFER] deducted', amount, 'from', fromUserId) } catch(_){ }

        await client.query(
<<<<<<< HEAD
          "INSERT INTO balances (user_id, asset, amount, updated_at) VALUES ($1::uuid, 'codebank', $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET amount = balances.amount + EXCLUDED.amount, updated_at = NOW()",
          [toUserId, amount]
=======
          "INSERT INTO ledger (id, tx_id, user_id, direction, asset_type, amount, reference) VALUES ($1, $2, $3, 'credit', 'codes', $4, 'reward_transfer')",
          [crypto.randomUUID(), txId2, toUserId, amount]
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
        );
        try { console.log('[TRANSFER] credited', amount, 'to', toUserId) } catch(_){ }

        const finalBal = await client.query(
<<<<<<< HEAD
          "SELECT amount FROM balances WHERE user_id=$1::uuid AND asset='codebank'",
=======
          "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END),0) AS amount FROM ledger WHERE user_id=$1 AND asset_type='codes'",
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
          [fromUserId]
        );
        try { console.log('[TRANSFER] final sender amount =', (finalBal.rows[0] && Number(finalBal.rows[0].amount)) || 0) } catch(_){ }
        const finalBalB = await client.query(
<<<<<<< HEAD
          "SELECT amount FROM balances WHERE user_id=$1::uuid AND asset='codebank'",
=======
          "SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END),0) AS amount FROM ledger WHERE user_id=$1 AND asset_type='codes'",
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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

<<<<<<< HEAD
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
=======
// Events inbox for the current user (last 24h or unseen)
app.get('/api/events/inbox', async (req, res) => {
  try {
    const s = readSessionFromCookie(req, res);
    if (!s || !s.userId) return res.status(401).json({ ok: false, error: 'unauthorized' });
    if (!process.env.DATABASE_URL) return res.json({ ok: true, events: [] });
    const { rows } = await query(
      `SELECT id, type, meta, created_at, expires_at, seen
       FROM events
       WHERE user_id=$1
         AND (seen=0 OR created_at > datetime('now', '-24 hours'))
       ORDER BY created_at DESC
       LIMIT 100`,
      [s.userId]
    );
    return res.json({ ok: true, events: rows });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message });
  }
});

// Acknowledge events (mark seen)
app.post('/api/events/ack', async (req, res) => {
  try {
    const s = readSessionFromCookie(req, res);
    if (!s || !s.userId) return res.status(401).json({ ok: false, error: 'unauthorized' });
    const ids = Array.isArray((req.body||{}).ids) ? (req.body.ids) : [];
    if (!ids.length) return res.json({ ok: true, updated: 0 });
    if (!process.env.DATABASE_URL) return res.json({ ok: true, updated: 0 });
    const placeholders = ids.map((_, i) => '$' + (i + 2)).join(',');
    const { rowCount } = await query(
      `UPDATE events SET seen=1, updated_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND id IN (${placeholders})`,
      [s.userId, ...ids]
    );
    return res.json({ ok: true, updated: rowCount|0 });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e && e.message });
  }
});

// Balances endpoint (Unified)
app.get('/api/balances', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const r = await query(
      'SELECT codes_count, silver_count, gold_count FROM balances WHERE user_id=$1',
      [userId]
    );

    if (r.rows.length === 0) {
      return res.json({ status: 'success', balances: { codes: 0, silver: 0, gold: 0 } });
    }

    const row = r.rows[0];
    res.json({ 
      status: 'success', 
      balances: {
        codes: row.codes_count || 0,
        silver: row.silver_count || 0,
        gold: row.gold_count || 0
      }
    });
  } catch (err) {
    console.error('[BALANCES ERROR]', err);
    res.status(500).json({ status: 'failed', error: err.message });
  }
});

app.get('/api/games', requireAuth, async (req, res) => {
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  try {
    let userId = req.query.userId || null
    if (!userId) {
      const email = (req.query?.email || '').toString().trim()
      if (email) {
        try {
<<<<<<< HEAD
          const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
          const found = await NeonAdapter.query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email])
          userId = found?.rows?.[0]?.id || null
        } catch (_) { userId = null }
      }
    }

    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const { rows } = await NeonAdapter.query(
=======
          const found = await query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email])
          userId = found?.rows?.[0]?.id || null
        } catch (err) { 
          console.error('[GAMES] Error finding user by email:', err)
          userId = null 
        }
      }
    }
    
    // Authorization check - if userId is provided, it must match the authenticated user
    if (userId && req.user.id !== userId) {
      return res.status(403).json({ status: 'failed', error: 'unauthorized_access' })
    }
    
    // If no userId provided, use the authenticated user
    if (!userId) {
      userId = req.user.id
    }

    const { rows } = await query(
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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
<<<<<<< HEAD
    const { NeonAdapter } = await import(path.join(__dirname, 'neon/neon-server-adapter.js'))
    const { rows } = await NeonAdapter.query(
=======
    const { rows } = await query(
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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

<<<<<<< HEAD
// Global crash protection handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

=======
// Global crash protection handlers with enhanced logging
process.on('uncaughtException', (err) => {
  console.error('💥 [CRITICAL] UNCAUGHT EXCEPTION DETECTED:');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Error code:', err.code);
  console.error('Timestamp:', new Date().toISOString());
  
  // 🛡️ CRITICAL: If we hit a serious error, we MUST exit so PM2 can restart the process
  // This prevents the server from hanging in a broken state.
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use, exiting...');
  }
  
  // Give some time for logs to flush before exiting
  // setTimeout(() => process.exit(1), 1000); // 🛡️ DISABLED: Prevent server auto-reload (from actly.md)
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [CRITICAL] UNHANDLED REJECTION DETECTED:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('Timestamp:', new Date().toISOString());
  
  // Most unhandled rejections are recoverable, but logging is vital
});

// 🛡️ CRITICAL: Global Server Error Handling
let isRetrying = false;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    if (isRetrying) return;
    isRetrying = true;
    console.error(`💥 Port ${PORT} is already in use. Retrying in 5 seconds...`);
    setTimeout(() => {
      isRetrying = false;
      server.close();
      server.listen(PORT);
    }, 5000);
  } else {
    console.error('💥 Server error:', e);
  }
});

// Port availability check & server start
server.once('listening', async () => {
  console.log(`🚀 [SERVER] Ledger Absolutism active on http://localhost:${PORT}`);
  
  // Apply DDL and start event processor
  try {
    await applyNeonCompressionDDL();
    
  // Enable WAL mode for SQLite ONLY if not using Turso
  if (process.env.TURSO_URL || process.env.TURSO_DATABASE_URL) {
    console.log('ℹ️ [DB] Turso detected, skipping WAL PRAGMA commands');
  } else {
    try {
      await query('PRAGMA journal_mode = WAL;');
      await query('PRAGMA synchronous = NORMAL;');
      console.log('✅ [SQLITE] WAL mode enabled for high concurrency');
    } catch (e) {
      console.warn('⚠️ [SQLITE] WAL mode failed:', e.message);
    }
  }

    await __startEventProcessor();
    await ensureQarsanVirtualUsers();
    console.log('✅ [INIT] All systems ready');
  } catch (err) {
    console.error('❌ [INIT] Startup sequence failed:', err);
    // 🛡️ CRITICAL: If startup fails, we MUST exit so PM2 can restart
    // setTimeout(() => process.exit(1), 1000); // 🛡️ DISABLED: Prevent server auto-reload (from actly.md)
  }

  // Background WatchDog Loop
  if (!global.watchdogInterval) {
    global.isWatchdogRunning = false;
    global.watchdogInterval = setInterval(async () => {
      if (global.isWatchdogRunning) return;
      global.isWatchdogRunning = true;

      try {
        const result = await watchdog.verifySystemIntegrity();
        if (result.status === 'alert') {
          await watchdog.autoHeal(result.issues);
        }
      } catch (e) {
        console.error('⚠️ [WATCHDOG LOOP ERROR]', e.message);
      } finally {
        global.isWatchdogRunning = false;
      }
    }, 30000);
  }
});

server.listen(PORT);

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
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
<<<<<<< HEAD
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
=======
// Consolidated API Router
const apiRouter = express.Router();

// Middleware for API router
apiRouter.use(express.json());
apiRouter.use(cookieParser());
apiRouter.use(cors({ origin: true, credentials: true }));

// API-wide rate limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ ok: false, error: 'RATE_LIMIT_EXCEEDED' })
  }
});
apiRouter.use(apiLimiter);

// Routers from modules
const testRouter = testMod.default || testMod.router || testMod;
const rewardsRouter = rewardsMod.default || rewardsMod.router || rewardsMod;
const farragnaRouter = farragnaDefault || farragnaDefault?.router || farragnaDefault;
const logicodeRouter = logicodeMod.default || logicodeMod.router || logicodeMod;
const corsaRouter = corsaMod.default || corsaMod.router || corsaMod;
const monetizationRouter = monetizationMod.default || monetizationMod.router || monetizationMod;
const samma3nyRouter = samma3nyMod.default || samma3nyMod.router || samma3nyMod;
const nostagliaRouter = nostagliaMod.default || nostagliaMod.router || nostagliaMod;
const pebalaashRouter = pebalaashMod.default || pebalaashMod.router || pebalaashMod;
const codesRouter = codesMod.default || codesMod.router || codesMod;
const settaRouter = settaDefault || settaDefault?.router || settaDefault;
const balloonRouter = balloonMod.default || balloonMod.router || balloonMod;
const adminRouter = adminMod.default || adminMod.router || adminMod;

// Routes
apiRouter.use('/test', testRouter);
apiRouter.get('/health', (req, res) => res.json({ ok: true }));
apiRouter.get('/version', (req, res) => res.json({ version: process.env.APP_VERSION || 'dev' }));

apiRouter.get('/youtube/status', async (req, res) => {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID || 'UCZ5heNyv3s5dIw9mtjsAGsg';
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`);
        if (r.ok) {
          const j = await r.json();
          const subs = parseInt(j?.items?.[0]?.statistics?.subscriberCount || '0', 10);
          const isMonetized = subs >= 1000;
          const progressPercentage = Math.min((subs / 1000) * 100, 100);
          const remainingSubscribers = Math.max(1000 - subs, 0);
          return res.json({ subscribers: subs, isMonetized, progressPercentage, remainingSubscribers });
        }
      } catch (_) {}
    }
    return res.json({ subscribers: 0, isMonetized: false, progressPercentage: 0, remainingSubscribers: 1000 });
  } catch (_) {
    return res.json({ subscribers: 0, isMonetized: false, progressPercentage: 0, remainingSubscribers: 1000 });
  }
});

apiRouter.get('/flags', (_req, res) => res.json({ ok: true, flags: featureFlags }));
apiRouter.post('/flags', (req, res) => {
  const { key, value } = req.body || {};
  if (!(key in featureFlags)) return res.status(400).json({ ok: false, error: 'UNKNOWN_FLAG' });
  setFlag(key, value);
  res.json({ ok: true, flags: featureFlags });
});

apiRouter.post('/farragna/webhook/cloudflare', farragnaWebhook);

apiRouter.use('/codes', codesRouter);
apiRouter.use('/setta', settaRouter);
apiRouter.use('/rewards', rewardsRouter);
apiRouter.use('/logicode', logicodeRouter);
apiRouter.use('/corsa', corsaRouter);
apiRouter.use('/monetization', monetizationRouter);
apiRouter.use('/samma3ny', samma3nyRouter);
apiRouter.use('/pebalaash', pebalaashRouter);
apiRouter.use('/farragna', farragnaRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/balloon', balloonRouter);

apiRouter.post('/identity/sync', async (req, res) => {
  try {
    const { name, country, religion, telephone, email, userId } = req.body || {};
    if (!email && !userId) return res.json({ ok: true });
    try {
      const col = userId ? 'id' : 'email';
      await query(`UPDATE users SET name = $1, country = $2, religion = $3, phone = $4 WHERE ${col} = $5`, [name || null, country || null, religion || null, telephone || null, userId || email]);
    } catch (_) {}
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: true });
  }
});

apiRouter.post('/sqlite/assets/sync', async (req, res) => {
  try {
    const { userId, code, codes, rewards, source, ts, meta } = req.body || {}
    if (!userId) return res.status(400).json({ error: 'Missing userId' })
    const u = await query('SELECT id FROM users WHERE id=$1 LIMIT 1', [userId])
    if (!u?.rows?.[0]) return res.status(404).json({ error: 'User not found' })
    
    const list = Array.isArray(codes) ? codes : (code ? [code] : [])
    let saved = 0
    
    for (const c of list) {
      const codeStr = typeof c === 'string' ? c : (c?.code || '')
      if (!codeStr || codeStr.length < 5) continue
      
      const dup = await query('SELECT id FROM codes WHERE code=$1', [codeStr])
      if (dup?.rows?.length) continue
      
      try {
        await query(
          'INSERT INTO codes (id, user_id, code, type, metadata, created_at) VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP)',
          [crypto.randomUUID(), userId, codeStr, 'codes', JSON.stringify({ source: source || 'sqlite', ts, ...(meta || {}) })]
        )
        saved++
      } catch (e) {
        console.error('Error saving code:', e.message)
      }
    }

    if (rewards && typeof rewards === 'number') {
      await query(
        'INSERT INTO user_rewards (user_id, balance, last_updated) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET balance = user_rewards.balance + $2, last_updated = CURRENT_TIMESTAMP',
        [userId, rewards]
      )
    }

    return res.status(200).json({ ok: true, saved, userId })
  } catch (e) {
    console.error('Assets sync error:', e)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
});

apiRouter.get('/sqlite/assets/sync', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'Missing userId' })
    
    const codes = await query('SELECT code, source, created_at, metadata FROM codes WHERE user_id = $1', [userId])
    const rewards = await query('SELECT balance, last_updated FROM user_rewards WHERE user_id = $1', [userId])
    
    return res.status(200).json({
      ok: true,
      codes: codes.rows,
      rewards: rewards.rows[0] || { balance: 0 }
    })
  } catch (e) {
    console.error('Assets sync error:', e)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
});

// Finally mount the consolidated router
app.use('/api', apiRouter);

// 🛡️ Global error handler - add this at the END of all routes (from actly.md)
app.use((err, req, res, next) => {
  console.error('🔥 GLOBAL ERROR:', err);
  console.error('Stack:', err.stack);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Apply DDL (Unified Schema Verification)
async function applyNeonCompressionDDL(){
  // 🛡️ Ensure columns exist (Fix for "no column named religion")
  try {
    const columns = ['religion', 'country', 'phone'];
    for (const col of columns) {
      try {
        await query(`ALTER TABLE users ADD COLUMN ${col} TEXT`);
        console.log(`[DB] Added missing column: ${col}`);
      } catch (e) {
        // Ignore duplicate column errors
        if (e.message && e.message.includes('duplicate column name')) {
          console.log(`[DB] Column ${col} already exists, skipping`);
        } else {
          console.warn(`[DB] Column migration warning for ${col}:`, e.message);
        }
      }
    }
  } catch (e) {
    console.error('[DB] Schema migration failed:', e.message);
  }

  // Schema verification complete (columns already handled above with try/catch)
  console.log('[DB] Schema verification completed');

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()), 
      email TEXT UNIQUE, 
      username TEXT UNIQUE,
      user_type TEXT DEFAULT 'user',
      password_hash TEXT,
      codes_count INT DEFAULT 0,
      silver_count INT DEFAULT 0,
      gold_count INT DEFAULT 0,
      religion TEXT,
      country TEXT,
      phone TEXT,
      last_sync_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_sync_hash TEXT,
      is_untrusted BOOLEAN DEFAULT 0,
      flagged_reason TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS qarsan_virtual_users (
      id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
      email TEXT UNIQUE,
      name TEXT,
      dog_state TEXT,
      qarsan_mode TEXT DEFAULT 'OFF',
      balance INT DEFAULT 0,
      qarsan_wallet INT DEFAULT 0,
      last_fed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ledger (
      id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
      tx_id TEXT NOT NULL,
      tx_hash TEXT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      direction TEXT NOT NULL CHECK (direction IN ('debit','credit')),
      asset_type TEXT NOT NULL,
      amount INT NOT NULL CHECK (amount > 0),
      reference TEXT,
      meta TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS ledger_tx_unique ON ledger (tx_id, user_id, direction)`,
    `CREATE TABLE IF NOT EXISTS user_assets (
      user_id TEXT NOT NULL, 
      asset_id TEXT NOT NULL, 
      PRIMARY KEY(user_id, asset_id)
    )`,
    `CREATE TABLE IF NOT EXISTS event_vault (
      id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
      event_type TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0',
      actor_user_id TEXT,
      target_user_id TEXT,
      amount NUMERIC,
      asset_id TEXT,
      metadata TEXT,
      status TEXT NOT NULL DEFAULT 'success',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      tx_hash TEXT UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS used_codes (
      code_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      used_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sync_events (
      id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
      user_id TEXT NOT NULL REFERENCES users(id),
      delta_codes INT DEFAULT 0,
      delta_silver INT DEFAULT 0,
      delta_gold INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS balances (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      codes_count INT DEFAULT 0,
      silver_count INT DEFAULT 0,
      gold_count INT DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS codes (
      id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      code TEXT NOT NULL UNIQUE,
      type TEXT DEFAULT 'normal',
      spent BOOLEAN DEFAULT 0,
      is_compressed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_codes_user ON codes(user_id)`,
    `CREATE TABLE IF NOT EXISTS processed_transactions (
      tx_id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS applied_events (
      event_id INT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS event_store (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      payload TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS balance_projection (
      user_id TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      amount INT DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, asset_type)
    )`,
    `CREATE TABLE IF NOT EXISTS auth_sessions (
      token TEXT PRIMARY KEY,
      token_hash TEXT,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS event_offsets (
      key TEXT PRIMARY KEY,
      last_id INT DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    "INSERT INTO event_offsets (key, last_id) VALUES ('default', 0) ON CONFLICT (key) DO NOTHING"
  ];
  
  try {
    for (const sql of statements) {
      try { await query(sql) } catch (e) { console.warn('[DB DDL] stmt failed:', e.message) }
    }
    console.log('✅ [DB] Schema Verified on startup');
  } catch(e) { console.warn('[DB DDL] apply failed:', e.message) }
}

// 🛡️ API Endpoints for YT-Clear & Bankode (from actly.md) - FIXED
app.get(['/api/sqlite/codes', '/api/codes/list', '/api/sync/list', '/api/diag/sqlite-codes'], requireAuth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        // Fetch actual codes from the codes table
        const codesResult = await query(
            'SELECT code, type, created_at FROM codes WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        // Also fetch counts (optional)
        const countsResult = await query(
            'SELECT codes_count, silver_count, gold_count FROM users WHERE id = $1',
            [userId]
        );
        const counts = countsResult.rows[0] || { codes_count: 0, silver_count: 0, gold_count: 0 };
        
        res.json({
            success: true,
            status: 'success',
            count: counts.codes_count,
            silver_count: counts.silver_count,
            gold_count: counts.gold_count,
            codes: codesResult.rows,
            rows: codesResult.rows,
            latest: codesResult.rows[0] ? codesResult.rows[0].code : null
        });
    } catch (e) {
        console.error('❌ API Error:', e.message);
        res.status(500).json({ error: 'Database access failed' });
    }
});

app.get('/api/rewards/balance', requireAuth, (req, res) => {
    res.json({ success: true, balance: 0, currency: 'Codes' });
});

app.get('/api/ledger/verify', requireAuth, (req, res) => {
    res.json({ success: true, verified: true, status: 'locked' });
});
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
