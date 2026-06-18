const trackers = new Map();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof global !== 'undefined') {
  if (!global._rateLimitCleanupInterval) {
    global._rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of trackers.entries()) {
        if (value.resetTime <= now) {
          trackers.delete(key);
        }
      }
    }, 5 * 60 * 1000);
    
    if (global._rateLimitCleanupInterval.unref) {
      global._rateLimitCleanupInterval.unref();
    }
  }
}

/**
 * Checks if a given IP has exceeded its request limit within a specified timeframe.
 * @param {string} ip - Client IP address.
 * @param {number} limit - Maximum allowed requests.
 * @param {number} windowMs - Time window in milliseconds.
 * @returns {object} Object containing limited status, current count, and reset time.
 */
export function isRateLimited(ip, limit, windowMs) {
  const now = Date.now();
  const entry = trackers.get(ip);

  if (!entry || entry.resetTime <= now) {
    const newEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    trackers.set(ip, newEntry);
    return { limited: false, currentCount: 1, resetTime: newEntry.resetTime };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { limited: true, currentCount: entry.count, resetTime: entry.resetTime };
  }

  return { limited: false, currentCount: entry.count, resetTime: entry.resetTime };
}
