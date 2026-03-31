/**
 * AI Brain - Behavior Analyzer & Decision Engine
 * Transforms simple rules into intelligent system management.
 */

class AIBrain {
  constructor() {
    if (window.__AI_BRAIN__) return window.__AI_BRAIN__

    this.history = []
    this.state = {}
    this.thresholds = {
      apiFlood: 5,
      ytFailures: 3,
      authFlaps: 3
    }

    this.lastStabilize = 0; // Throttling for STABILIZE_AUTH
    this.lastResetApi = 0; // Throttling for RESET_API

    window.__AI_BRAIN__ = this
  }

  /**
   * Record a system event for analysis
   * @param {string} event - Event name (e.g., 'api:error', 'yt:fail')
   * @param {object} data - Metadata about the event
   */
  record(event, data = {}) {
    this.history.push({
      event,
      data,
      ts: Date.now()
    })

    // Keep history focused on recent patterns
    if (this.history.length > 100) {
      this.history.shift()
    }
    
    console.log(`🧠 [AI-Brain] Recorded: ${event}`, data);
  }

  /**
   * Analyze recent behavior patterns
   */
  analyze() {
    const recent = this.history.slice(-20)

    const stats = {
      apiErrors: 0,
      ytFailures: 0,
      authChanges: 0
    }

    for (const e of recent) {
      if (e.event === "api:error") stats.apiErrors++
      if (e.event === "yt:fail") stats.ytFailures++
      if (e.event === "auth:change") stats.authChanges++
    }

    return stats
  }

  /**
   * Make a decision based on analyzed stats
   * @param {object} stats 
   */
  decide(stats) {
    if (stats.apiErrors > this.thresholds.apiFlood) {
      // Check if we're within the 30-second cooldown for RESET_API
      const now = Date.now();
      if (now - this.lastResetApi < 30000) {
        console.log("🧠 [AI-Brain] Skipping RESET_API decision (30s cooldown active)");
        return "STABLE"
      }
      this.lastResetApi = now;
      return "RESET_API"
    }

    if (stats.ytFailures > this.thresholds.ytFailures) {
      return "RESTART_YT"
    }

    if (stats.authChanges > this.thresholds.authFlaps) {
      return "STABILIZE_AUTH"
    }

    return "STABLE"
  }

  /**
   * Execute the decided action
   * @param {string} decision 
   */
  async act(decision) {
    if (decision === "STABLE") return;
    
    console.log("🧠 [AI-Brain] Executing Decision:", decision)

    switch (decision) {
      case "RESET_API":
        window.__API_ERRORS__ = 0
        this.lastResetApi = Date.now(); // Ensure cooldown is set on execution
        console.warn("🧠 [AI-Brain] API errors reset due to flooding pattern (30s cooldown applied)");
        break

      case "RESTART_YT":
        window.__YT_STARTED__ = false
        if (window.__APP_LIFECYCLE__) {
            console.warn("🧠 [AI-Brain] Restarting YouTube module due to repeated failures");
            await window.__APP_LIFECYCLE__.modules.get("yt")?.start()
        }
        break

      case "STABILIZE_AUTH":
        const now = Date.now();
        if (now - this.lastStabilize < 5000) {
            console.log("🧠 [AI-Brain] Skipping STABILIZE_AUTH decision (throttled)");
            return;
        }
        this.lastStabilize = now;
        console.warn("🔐 [AI-Brain] Auth instability detected. Stabilizing auth state...");
        // Additional stabilization logic could be added here
        break;
    }
  }

  /**
   * Run the brain cycle
   */
  async run() {
    const stats = this.analyze()
    const decision = this.decide(stats)

    await this.act(decision)
  }
}

export const AIBrainEngine = new AIBrain()
