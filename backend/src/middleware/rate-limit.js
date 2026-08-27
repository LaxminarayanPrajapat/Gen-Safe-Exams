import rateLimit from 'express-rate-limit'

/** Global API limiter — tuned for institutional ERP traffic, not consumer apps. */
export const limiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Too many requests. Try again shortly.' },
})

/** Stricter limiter for authentication endpoints (works with LOCK-5 lockout policy). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  skipSuccessfulRequests: true,
  message: { error: 'AUTH_RATE_LIMITED', message: 'Too many sign-in attempts from this network.' },
})
