/**
 * helpers/hash-helpers.js
 *
 * Deterministic hashing and code-formatting utilities used by the
 * offline-first compression system and other modules that need
 * reproducible short hashes or formatted codes.
 *
 * All functions are pure (no I/O, no database) and safe to call anywhere.
 */

import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Deterministic hash
// ---------------------------------------------------------------------------

/**
 * Produce a deterministic 8-character uppercase hex hash of a string.
 *
 * Uses a simple 32-bit integer hash (djb2-style) — fast and good enough for
 * non-cryptographic de-duplication / code generation.
 *
 * @param {string} str
 * @returns {string} 8-char uppercase hex string
 */
export function deterministicHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

// ---------------------------------------------------------------------------
// Code formatting
// ---------------------------------------------------------------------------

/**
 * Format a hash string as a 26-character compressed code.
 *
 * The hash is repeated/truncated to fill 24 characters, then the two-character
 * suffix (e.g. "S1" for silver, "G1" for gold) is appended.
 *
 * @param {string} hash   — typically the output of deterministicHash()
 * @param {string} suffix — 2-character type suffix (e.g. "S1", "G1")
 * @returns {string} 26-character code
 */
export function formatAsCompressedCode(hash, suffix) {
  const padded = hash.repeat(4).slice(0, 24);
  return padded + suffix;
}

// ---------------------------------------------------------------------------
// Cryptographic helpers
// ---------------------------------------------------------------------------

/**
 * Generate a new random UUID (v4) via Node's built-in crypto module.
 *
 * @returns {string} UUID v4
 */
export function generateUUID() {
  return crypto.randomUUID();
}
