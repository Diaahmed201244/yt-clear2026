/**
 * config/index.js
 *
 * Central configuration module. All environment-based constants are exported
 * from here so the rest of the application has a single source of truth.
 *
 * BUG FIX: JWT_SECRET no longer falls back to 'secret-demo'. It MUST be set
 * via process.env.JWT_SECRET. In production the server will refuse to start
 * without it.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

// ---------------------------------------------------------------------------
// Path helpers (ESM equivalent of __dirname)
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Project root — one level up from config/ */
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Core settings
// ---------------------------------------------------------------------------
export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
export const DATABASE_URL = process.env.DATABASE_URL;

// ---------------------------------------------------------------------------
// JWT — NO fallback value for the secret
// ---------------------------------------------------------------------------
export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && IS_PRODUCTION) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
    'The server cannot start in production without a JWT secret.'
  );
}

if (!JWT_SECRET) {
  console.warn(
    '⚠️  [CONFIG] JWT_SECRET is not set. Authentication will fail. ' +
    'Set JWT_SECRET in your .env file.'
  );
}

// ---------------------------------------------------------------------------
// File uploads
// ---------------------------------------------------------------------------
export const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp';

// ---------------------------------------------------------------------------
// Data directory (legacy SQLite / local file storage)
// ---------------------------------------------------------------------------
export const DATA_DIR = path.join(PROJECT_ROOT, 'data');
fs.ensureDirSync(DATA_DIR);

// ---------------------------------------------------------------------------
// Re-export path helpers so other modules can resolve project-relative paths
// ---------------------------------------------------------------------------
export { PROJECT_ROOT, __dirname, __filename };
