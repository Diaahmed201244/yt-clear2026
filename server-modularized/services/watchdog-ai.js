/**
 * services/watchdog-ai.js
 *
 * WatchdogAI — AI-driven risk analysis and transaction monitoring.
 *
 * Tracks success/failure patterns per user and evaluates risk for financial
 * operations. Used by the transfer system to gate high-risk transactions.
 *
 * TODO: The original server.js imported this as a default export from
 * './services/watchdog-ai.js'. This stub provides the interface used
 * by transfer routes. Implement real velocity/pattern detection as needed.
 *
 * Exports (default):
 *   WatchdogAI.evaluateRisk(userId)          — returns { decision, reasons }
 *   WatchdogAI.trackSuccess(userId, action)  — record a successful operation
 *   WatchdogAI.trackFailure(userId, reason)  — record a failed operation
 */

// ---------------------------------------------------------------------------
// In-memory tracking store (per-process)
// ---------------------------------------------------------------------------

/** @type {Map<string, { successes: number, failures: number, lastAction: number }>} */
const userHistory = new Map();
const MAX_HISTORY_SIZE = 10_000;

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of userHistory.entries()) {
    if (now - entry.lastAction > 24 * 60 * 60 * 1000) {
      userHistory.delete(key);
    }
  }
}, 5 * 60_000);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const WatchdogAI = {
  /**
   * Evaluate the risk of allowing a financial operation for the given user.
   *
   * @param {string} userId
   * @returns {{ decision: 'ALLOW' | 'REVIEW' | 'FREEZE', reasons: string[] }}
   */
  evaluateRisk(userId) {
    const history = userHistory.get(userId);
    if (!history) {
      return { decision: 'ALLOW', reasons: [] };
    }

    const reasons = [];

    // High failure rate check
    if (history.failures > 10 && history.failures > history.successes * 2) {
      reasons.push('HIGH_FAILURE_RATE');
    }

    // Velocity check — too many actions in a short window
    const timeSinceLast = Date.now() - history.lastAction;
    if (timeSinceLast < 1000 && history.successes + history.failures > 20) {
      reasons.push('HIGH_VELOCITY');
    }

    if (reasons.length >= 2) {
      return { decision: 'FREEZE', reasons };
    }
    if (reasons.length === 1) {
      return { decision: 'REVIEW', reasons };
    }
    return { decision: 'ALLOW', reasons: [] };
  },

  /**
   * Record a successful financial operation.
   *
   * @param {string} userId
   * @param {string} action — e.g. 'TRANSFER'
   */
  trackSuccess(userId, action) {
    if (userHistory.size > MAX_HISTORY_SIZE && !userHistory.has(userId)) return;
    const entry = userHistory.get(userId) || { successes: 0, failures: 0, lastAction: 0 };
    entry.successes++;
    entry.lastAction = Date.now();
    userHistory.set(userId, entry);
  },

  /**
   * Record a failed financial operation.
   *
   * @param {string} userId
   * @param {string} reason — error message or code
   */
  trackFailure(userId, reason) {
    if (userHistory.size > MAX_HISTORY_SIZE && !userHistory.has(userId)) return;
    const entry = userHistory.get(userId) || { successes: 0, failures: 0, lastAction: 0 };
    entry.failures++;
    entry.lastAction = Date.now();
    userHistory.set(userId, entry);
  },
};

export default WatchdogAI;
