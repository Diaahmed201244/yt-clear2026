/**
 * config/database.js
 *
 * Turso (libSQL) connection and query helper.
 * Uses the TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env
 *
 * Exports:
 *   db    — the raw libsql client instance
 *   query — shorthand for executing SQL with parameters
 */

import { createClient } from '@libsql/client';
import { DATABASE_URL } from './index.js';

// Log level configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const DEBUG = LOG_LEVEL === 'debug' || process.env.NODE_ENV !== 'production';

// Turso/libSQL configuration
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Log connection status
if (LOG_LEVEL !== 'error') {
  console.log('📦 [DB] Turso/libSQL client initialized');
  console.log('📦 [DB] URL:', process.env.TURSO_DATABASE_URL || DATABASE_URL);
}

/**
 * Execute a parameterised SQL query.
 *
 * @param {string} sql       SQL statement with ? placeholders
 * @param {any[]}  params    Values bound to the placeholders
 * @returns {Promise<object>} Query result with rows array
 */
async function query(sql, params = []) {
  try { 
    const result = await db.execute({ sql, args: params });
    return {
      rows: result.rows,
      rowCount: result.rows.length,
      changes: result.changes || 0,
    };
  } catch (error) {
    if (error.message && error.message !== '') {
      console.error('💥 [DB] Query error:', error.message);
      console.error('💥 [DB] SQL:', sql);
      console.error('💥 [DB] Params:', params);
    }
    throw error;
  }
}

/**
 * Execute multiple SQL statements in a transaction.
 *
 * @param {Array<{sql: string, args: any[]}>} statements
 * @returns {Promise<Array<object>>}
 */
async function transaction(statements) {
  try { 
    const result = await db.batch(statements);
    return result;
  } catch (error) {
    console.error('💥 [DB] Transaction error:', error.message);
    throw error;
  }
}

/**
 * Execute a raw SQL statement (for DDL like CREATE TABLE).
 *
 * @param {string} sql
 * @returns {Promise<object>}
 */
async function execute(sql) {
  try { 
    const result = await db.execute(sql);
    return result;
  } catch (error) {
    console.error('💥 [DB] Execute error:', error.message);
    throw error;
  }
}

export { db, query, transaction, execute };

/**
 * Execute a raw SQL statement (for DDL like CREATE TABLE) without logging.
 *
 * @param {string} sql
 * @returns {Promise<object>}
 */
async function querySilent(sql, params = []) {
  try { 
    const result = await db.execute({ sql, args: params });
    return {
      rows: result.rows,
      rowCount: result.rows.length,
      changes: result.changes || 0,
    };
  } catch (error) {
    if (error.message && error.message !== '') {
      console.error('[DB Schema Error]', error.message);
    }
    throw error;
  }
}

export { querySilent };
