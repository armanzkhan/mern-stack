const DEFAULT_TARGETS = [
  /^\/api\/orders(?:\/|$)/i,
  /^\/api\/customers(?:\/|$)/i,
  /^\/api\/invoices(?:\/|$)/i,
  /^\/api\/notifications(?:\/|$)/i,
  /^\/api\/managers(?:\/|$)/i,
  /^\/api\/products(?:\/|$)/i,
];

function isEnabled() {
  const raw = String(process.env.API_TIMING_ENABLED || "").toLowerCase().trim();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return process.env.NODE_ENV !== "test";
}

function shouldTrack(pathname) {
  if (!pathname) return false;
  if (/^\/api\/health(?:\/|$)/i.test(pathname)) return false;
  return DEFAULT_TARGETS.some((pattern) => pattern.test(pathname));
}

module.exports = function requestTimingMiddleware(req, res, next) {
  if (!isEnabled()) return next();

  const pathname = req.path || req.originalUrl || req.url || "";
  if (!shouldTrack(pathname)) return next();

  const thresholdMs = Number(process.env.API_TIMING_THRESHOLD_MS || 250);
  const slowOnly = String(process.env.API_TIMING_SLOW_ONLY || "true").toLowerCase() !== "false";
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    if (slowOnly && durationMs < thresholdMs) return;

    const marker = durationMs >= thresholdMs ? "SLOW" : "OK";
    const url = req.originalUrl || req.url || pathname;
    console.log(
      `⏱️ [API ${marker}] ${req.method} ${url} -> ${res.statusCode} in ${durationMs.toFixed(1)}ms`
    );
  });

  next();
};
