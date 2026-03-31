/**
 * services/compression.service.js
 *
 * Offline-first code compression logic for the reward / asset system.
 *
 * Compression tiers:
 *   100 normal codes  → 1 silver bar  (compressToSilver)
 *    10 silver bars   → 1 gold bar    (compressToGold)
 *
 * `autoCompressUserCodes` performs both compressions in a single call using
 * the raw `codes` table with BEGIN/COMMIT transactions.
 *
 * `compressToSilver` / `compressToGold` use the lightweight `balances`
 * aggregate table (counter-based, no individual row deletion).
 *
 * ⚠️  SCALING NOTE:
 * The original codebase ran compression for ALL users every 30 seconds via
 * setInterval. This is extremely harmful at scale — it issues O(N) DB queries
 * every 30 s where N = total users, regardless of whether they have anything
 * to compress. Instead, these functions are exported to be called **on-demand**
 * (e.g. after a mint or transfer event) for the specific user affected.
 *
 * Exports:
 *   autoCompressUserCodes(userId) — full two-tier compression via codes table
 *   compressToSilver(userId)      — balance-counter silver compression
 *   compressToGold(userId)        — balance-counter gold compression
 */

import crypto from 'crypto';
import { pool, query } from '../config/database.js';
import { deterministicHash, formatAsCompressedCode } from '../helpers/hash-helpers.js';

// ---------------------------------------------------------------------------
// Full two-tier compression (operates on the `codes` table directly)
// ---------------------------------------------------------------------------

/**
 * Compress a user's normal codes → silver → gold in one pass.
 *
 * - 100 normal codes become 1 silver bar
 * - 10 silver bars become 1 gold bar
 * - Recursive: keeps compressing until thresholds are no longer met
 *
 * @param {string} userId
 */
export async function autoCompressUserCodes(userId) {
  const client = await pool.connect();
  try {
    // 1. Compress Normal → Silver (100 → 1)
    const normalRes = await client.query(
      "SELECT id, code FROM codes WHERE user_id = $1 AND type = 'normal' ORDER BY created_at ASC",
      [userId]
    );

    if (normalRes.rows.length >= 100) {
      const batchToCompress = normalRes.rows.slice(0, 100);
      const ids = batchToCompress.map(r => r.id);
      const codes = batchToCompress.map(r => r.code);

      const silverHash = deterministicHash(codes.join(''));
      const silverCode = formatAsCompressedCode(silverHash, 'S1');

      await client.query('BEGIN');
      try {
        // BUG FIX: Use PostgreSQL $N placeholders instead of ?
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        await client.query(
          `DELETE FROM codes WHERE id IN (${placeholders})`,
          ids
        );
        // Insert 1 silver bar
        await client.query(
          "INSERT INTO codes (id, user_id, code, type, is_compressed, compressed_at) VALUES ($1, $2, $3, 'silver', 1, CURRENT_TIMESTAMP)",
          [crypto.randomUUID(), userId, silverCode]
        );
        await client.query('COMMIT');
        console.log(`✅ [COMPRESSION] Compressed 100 normal codes to 1 silver for user ${userId}`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }

      // Recursive check for further compression
      // BUG FIX: Release the current client before recursion to avoid connection leaks
      client.release();
      await autoCompressUserCodes(userId);
      return; // Early return — client already released
    }

    // 2. Compress Silver → Gold (10 → 1)
    const silverRes = await client.query(
      "SELECT id, code FROM codes WHERE user_id = $1 AND type = 'silver' ORDER BY created_at ASC",
      [userId]
    );

    if (silverRes.rows.length >= 10) {
      const batchToCompress = silverRes.rows.slice(0, 10);
      const ids = batchToCompress.map(r => r.id);
      const codes = batchToCompress.map(r => r.code);

      const goldHash = deterministicHash(codes.join(''));
      const goldCode = formatAsCompressedCode(goldHash, 'G1');

      await client.query('BEGIN');
      try {
        // BUG FIX: Use PostgreSQL $N placeholders instead of ?
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        await client.query(
          `DELETE FROM codes WHERE id IN (${placeholders})`,
          ids
        );
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
  } finally {
    // BUG FIX: Always release the client in a finally block
    try {
      client.release();
    } catch (_) {
      // Already released (e.g. after recursive call)
    }
  }
}

// ---------------------------------------------------------------------------
// Balance-counter compression (operates on the `balances` aggregate table)
// ---------------------------------------------------------------------------

/**
 * Compress 100 normal codes into 1 silver bar using the balances counter.
 *
 * @param {string} userId
 */
export async function compressToSilver(userId) {
  try {
    const r = await query(
      'SELECT codes_count FROM balances WHERE user_id = $1',
      [userId]
    );

    if (r.rows.length > 0 && r.rows[0].codes_count >= 100) {
      await query(
        'UPDATE balances SET codes_count = codes_count - 100, silver_count = silver_count + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
        [userId]
      );
      console.log(`[COMPRESSION] 100 normal -> 1 silver for user ${userId}`);
    }
  } catch (err) {
    console.error('[COMPRESSION ERROR] compressToSilver:', err.message);
  }
}

/**
 * Compress 10 silver bars into 1 gold bar using the balances counter.
 *
 * @param {string} userId
 */
export async function compressToGold(userId) {
  try {
    const r = await query(
      'SELECT silver_count FROM balances WHERE user_id = $1',
      [userId]
    );

    if (r.rows.length > 0 && r.rows[0].silver_count >= 10) {
      await query(
        'UPDATE balances SET silver_count = silver_count - 10, gold_count = gold_count + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
        [userId]
      );
      console.log(`[COMPRESSION] 10 silver -> 1 gold for user ${userId}`);
    }
  } catch (err) {
    console.error('[COMPRESSION ERROR] compressToGold:', err.message);
  }
}
