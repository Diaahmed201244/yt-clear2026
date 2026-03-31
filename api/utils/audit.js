<<<<<<< HEAD
=======
import crypto from 'crypto'
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
import { query } from '../config/db.js'

export async function auditLog({
  actor_user_id,
  actor_role,
  action,
  target_type,
  target_id,
  metadata,
  ip_address,
  user_agent
}) {
  try {
    await query(
<<<<<<< HEAD
      'INSERT INTO audit_logs(actor_user_id, actor_role, action, target_type, target_id, metadata, ip_address, user_agent, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())',
      [actor_user_id, actor_role, action, target_type, target_id, metadata || null, ip_address || null, user_agent || null]
=======
      'INSERT INTO audit_logs(id, actor_user_id, actor_role, action, target_type, target_id, metadata, ip_address, user_agent, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_TIMESTAMP)',
      [crypto.randomUUID(), actor_user_id, actor_role, action, target_type, target_id, metadata ? JSON.stringify(metadata) : null, ip_address || null, user_agent || null]
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    )
  } catch (e) {
    try { console.warn('[auditLog] insert failed:', e.message) } catch (_) {}
  }
  return { ok: true }
}

<<<<<<< HEAD
export async function audit(params) {
  return auditLog(params)
=======
export async function audit(arg1, arg2) {
  // Handle both audit(req, params) and audit(params) syntax
  let auditParams;
  if (arg1 && arg1.headers) {
    // If first parameter is a request object, extract ip and user agent
    auditParams = arg2 || {};
    auditParams.ip_address = arg1.ip;
    auditParams.user_agent = arg1.headers['user-agent'];
  } else {
    // If first parameter is params, use it directly
    auditParams = arg1;
  }
  
  console.log('[audit DEBUG] Params:', auditParams);
  
  // Ensure action parameter is present
  if (!auditParams.action) {
    auditParams.action = 'UNKNOWN_ACTION';
    console.log('[audit DEBUG] Action was missing, set to UNKNOWN_ACTION');
  }
  
  return auditLog(auditParams)
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
}
export default { auditLog, audit }
