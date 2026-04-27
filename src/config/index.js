require("./loadEnv");

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const config = {
  appEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 3000),
  allowedOrigin: process.env.ALLOWED_ORIGIN || "*",
  adminApiKey: process.env.ADMIN_API_KEY || "",
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMaxRequests: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 60)
};

function isProduction() {
  return config.appEnv === "production";
}

module.exports = {
  config,
  isProduction
};
