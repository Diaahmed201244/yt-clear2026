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
    )
  } catch (e) {
    try {    console.warn('[auditLog] insert failed:', e.message) } catch (_) {}
  }
  return { ok: true }
}

}
export default { auditLog, audit }
