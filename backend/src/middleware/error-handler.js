/* Central error handler — never leaks stack traces or SQL to clients. */
export function errorHandler(err, _req, res, _next) {
  console.error('[gse:error]', err.message)
  const status = err.status ?? 500
  res.status(status).json({
    error: err.code ?? 'INTERNAL_ERROR',
    message: status === 500 ? 'Unexpected server error. The incident has been logged.' : err.message,
  })
}
