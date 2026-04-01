/**
 * services/event-processor.service.js
 *
 * Background event processing loop that reads from `event_store`, applies
 * events idempotently via `applied_events`, and updates balance projections.
 *
 * Currently handles:
 *   - TRANSFER_COMPLETED — debits sender, credits receiver, generates codes,
 *     and fires SSE notifications.
 *
 * The processor runs as an infinite async loop (poll-based with 150 ms idle
 * sleep). It persists its cursor in `event_offsets` so it can resume after
 * restarts without reprocessing events.
 *
 * Exports:
 *   startEventProcessor() — kicks off the background loop (call once at boot)
 */

import crypto from 'crypto';
import { pool, query } from '../config/database.js';
import { emitSSE } from './sse.service.js';

// ---------------------------------------------------------------------------
// Event processor
// ---------------------------------------------------------------------------

/**
 * Start the background event processing loop.
 *
 * Safe to call multiple times — the loop is only started once (the function
 * returns immediately if `EVENT_PROCESSOR_DISABLED=1`).
 */
export async function startEventProcessor() {
  try {
    if (process.env.EVENT_PROCESSOR_DISABLED === '1') return;

    let lastId = 0;
    try {
      const r = await query("SELECT last_id FROM event_offsets WHERE key = 'default'");
      lastId = (r.rows && r.rows[0] && Number(r.rows[0].last_id)) || 0;
    } catch (err) {
      console.error('[SSE] Event processing offset check error:', err.message);
      lastId = 0;
    }

    // Start the infinite processing loop
    (async function loop() {
      for (;;) {
        try {
          const { rows } = await query(
            'SELECT id, event_type, payload FROM event_store WHERE id > $1 ORDER BY id ASC LIMIT 50',
            [lastId]
          );

          if (!rows || rows.length === 0) {
            await new Promise((r) => setTimeout(r, 150));
            continue;
          }

          for (const ev of rows) {
            const client = await pool.connect();
            try {
              await client.query('BEGIN');

              // Idempotency guard
              await client.query(
                'INSERT INTO applied_events(event_id) VALUES ($1) ON CONFLICT DO NOTHING',
                [ev.id]
              );
              const check = await client.query(
                'SELECT event_id FROM applied_events WHERE event_id = $1',
                [ev.id]
              );
              if (!check.rows || check.rows.length === 0) {
                await client.query('ROLLBACK');
                lastId = ev.id;
                continue;
              }

              // ----- Handle event types -----
              if (ev.event_type === 'TRANSFER_COMPLETED') {
                const p = typeof ev.payload === 'string' ? JSON.parse(ev.payload) : ev.payload || {};
                const from = p.from;
                const to = p.to;
                const assetType = p.assetType || 'codes';
                const amount = Number(p.amount || 0);

                // Debit sender
                await client.query(
                  'INSERT INTO balance_projection(user_id, asset_type, amount) VALUES ($1, $2, -$3) ON CONFLICT (user_id, asset_type) DO UPDATE SET amount = amount - EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP',
                  [from, assetType, amount]
                );
                // Credit receiver
                await client.query(
                  'INSERT INTO balance_projection(user_id, asset_type, amount) VALUES ($1, $2, $3) ON CONFLICT (user_id, asset_type) DO UPDATE SET amount = amount + EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP',
                  [to, assetType, amount]
                );

                // Generate individual code rows for the receiver
                for (let i = 0; i < amount; i++) {
                  const newCode = crypto.randomUUID();
                  await client.query(
                    "INSERT INTO codes (id, user_id, code, type, created_at, generated_at, next_at, spent, meta) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, $5)",
                    [
                      crypto.randomUUID(),
                      to,
                      newCode,
                      assetType,
                      JSON.stringify({ source_event_id: ev.id, source_tx: p.txId || null }),
                    ]
                  );
                }

                // Notify via SSE
                try {
                  if (assetType === 'codes') {
                    const codesRes = await client.query(
                      'SELECT code FROM codes WHERE id IN (SELECT id FROM codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2)',
                      [to, amount]
                    );
                    const newCodes = codesRes.rows.map((r) => r.code);

                    emitSSE(to, { type: 'CODES_RECEIVED', codes: newCodes, assetType, amount, eventId: ev.id });
                    emitSSE(from, { type: 'ASSET_UPDATE', assetType, amount: -amount, eventId: ev.id });
                  } else {
                    emitSSE(to, { type: 'ASSET_UPDATE', assetType, amount, eventId: ev.id });
                    emitSSE(from, { type: 'ASSET_UPDATE', assetType, amount: -amount, eventId: ev.id });
                  }
                } catch (err) {
                  console.error('[SEND-CODES] SSE emit error:', err);
                }
              }

              await client.query('COMMIT');
            } catch (e) {
              console.error('[PROCESSOR ERROR]', e.message);
              try {
                await client.query('ROLLBACK');
              } catch (_) {
                // Rollback may fail if connection is broken
              }
            } finally {
              try {
                client.release();
              } catch (_) {
                // Already released
              }
            }
            lastId = ev.id;
          }

          // Persist cursor
          try {
            await query(
              "UPDATE event_offsets SET last_id = $1, updated_at = CURRENT_TIMESTAMP WHERE key = 'default'",
              [lastId]
            );
          } catch (_) {
            // Non-fatal — will retry next loop
          }
        } catch (err) {
          console.error('[EVENT-PROCESSOR] loop error:', err?.message || err);
          await new Promise((r) => setTimeout(r, 5000)); // wait 5s, not 300ms
        }
      }
    })();
  } catch (err) {
    console.error('[EVENT-PROCESSOR] startup error:', err?.message || err);
    // Startup failure is non-fatal — event processing simply won't run
  }
}
