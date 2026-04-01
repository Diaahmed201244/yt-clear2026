import crypto from 'crypto';
import { query, pool } from '../config/db.js';

const __sseClients = new Map();

export function sseEmit(userId, payload) {
  try {   
    const set = __sseClients.get(String(userId));
    if (!set) return;
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const res of set) {
      try {    res.write(data); } catch(err) { console.error('[SSE] Write error:', err); }
    }
  } catch(err) { console.error('[SSE] Broadcast error:', err); }
}

export function registerSseClient(userId, res) {
  const uid = String(userId);
  if (!__sseClients.has(uid)) __sseClients.set(uid, new Set());
  __sseClients.get(uid).add(res);
  return () => {
    __sseClients.get(uid)?.delete(res);
  };
}

export async function startEventProcessor() {
  try {   
    if (process.env.EVENT_PROCESSOR_DISABLED === '1') return;
    let lastId = 0;
    try {   
      const r = await query("SELECT last_id FROM event_offsets WHERE key='default'");
      lastId = (r.rows && r.rows[0] && Number(r.rows[0].last_id)) || 0;
    } catch(err) { 
      console.error('[SSE] Event processing offset check error:', err.message);
      lastId = 0;
    }
    
    (async function loop() {
      for(;;) {
        try {   
          const { rows } = await query('SELECT id, event_type, payload FROM event_store WHERE id > $1 ORDER BY id ASC LIMIT 50', [lastId]);
          if (!rows || rows.length === 0) {
            await new Promise(r => setTimeout(r, 150));
            continue;
          }
          for (const ev of rows) {
            const client = await pool.connect();
            try {   
              await client.query('BEGIN');
              await client.query('INSERT OR IGNORE INTO applied_events(event_id) VALUES ($1)', [ev.id]);
              const check = await client.query('SELECT event_id FROM applied_events WHERE event_id = $1', [ev.id]);
              if (!check.rows || check.rows.length === 0) {
                await client.query('ROLLBACK');
                lastId = ev.id;
                continue;
              }
              
              if (ev.event_type === 'TRANSFER_COMPLETED') {
                const p = typeof ev.payload === 'string' ? JSON.parse(ev.payload) : ev.payload || {};
                const from = p.from;
                const to = p.to;
                const assetType = p.assetType || 'codes';
                const amount = Number(p.amount || 0);
                
                await client.query(
                  'INSERT INTO balance_projection(user_id, asset_type, amount) VALUES ($1, $2, -$3) ON CONFLICT (user_id, asset_type) DO UPDATE SET amount = amount - EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP',
                  [from, assetType, amount]
                );
                await client.query(
                  'INSERT INTO balance_projection(user_id, asset_type, amount) VALUES ($1, $2, $3) ON CONFLICT (user_id, asset_type) DO UPDATE SET amount = amount + EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP',
                  [to, assetType, amount]
                );
                
                for (let i = 0; i < amount; i++) {
                  const newCode = crypto.randomUUID();
                  await client.query(
                    "INSERT INTO codes (id, user_id, code, type, created_at, generated_at, next_at, spent, meta) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, $5)",
                    [crypto.randomUUID(), to, newCode, assetType, JSON.stringify({ source_event_id: ev.id, source_tx: p.txId || null })]
                  );
                }

                if (assetType === 'codes') {
                  const codesRes = await client.query(
                    'SELECT code FROM codes WHERE id IN (SELECT id FROM codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2)',
                    [to, amount]
                  );
                  const newCodes = codesRes.rows.map(r => r.code);
                  sseEmit(to, { type: 'CODES_RECEIVED', codes: newCodes, assetType, amount, eventId: ev.id });
                } else {
                  sseEmit(to, { type: 'ASSET_UPDATE', assetType, amount, eventId: ev.id });
                }
                sseEmit(from, { type: 'ASSET_UPDATE', assetType, amount: -amount, eventId: ev.id });
              }
              await client.query('COMMIT');
            } catch(e) {
              console.error('[PROCESSOR ERROR]', e.message);
              try {    await client.query('ROLLBACK'); } catch(err) {}
            } finally {
              try {    client.release(); } catch(err) {}
            }
            lastId = ev.id;
          }
          try {   
            await query("UPDATE event_offsets SET last_id=$1, updated_at=CURRENT_TIMESTAMP WHERE key='default'", [lastId]);
          } catch(_) {}
        } catch(_) {
          await new Promise(r => setTimeout(r, 300));
        }
      }
    })();
  } catch(_) {}
}
