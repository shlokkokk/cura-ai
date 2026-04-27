const buckets = new Map();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run cleanup every 5 minutes

function getClientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return request.socket?.remoteAddress || "unknown";
}

function applyRateLimit(request, config) {
  const clientIp = getClientIp(request);
  const now = Date.now();
  const cutoff = now - config.rateLimitWindowMs;
  const existing = buckets.get(clientIp) || [];
  const recent = existing.filter((timestamp) => timestamp > cutoff);

  recent.push(now);
  buckets.set(clientIp, recent);

  return {
    allowed: recent.length <= config.rateLimitMaxRequests,
    retryAfterSeconds: Math.ceil(config.rateLimitWindowMs / 1000),
    remaining: Math.max(0, config.rateLimitMaxRequests - recent.length)
  };
}

// Periodically evict stale IP entries to prevent unbounded memory growth.
// This runs every 5 minutes and removes IPs with no recent activity.
function startCleanupTimer(windowMs) {
  const interval = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [ip, timestamps] of buckets) {
      const recent = timestamps.filter((t) => t > cutoff);
      if (recent.length === 0) {
        buckets.delete(ip);
      } else {
        buckets.set(ip, recent);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the process to exit even if the timer is still running
  interval.unref();
}

module.exports = {
  applyRateLimit,
  startCleanupTimer
};
