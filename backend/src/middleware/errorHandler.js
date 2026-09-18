import ENV from "../config/env.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
}

export function centralizedErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // In production, suppress technical internal error details
  let message = err.message || "An unexpected server error occurred.";
  if (ENV.NODE_ENV === "production" && statusCode === 500) {
    message = "An unexpected server error occurred. Please try again later.";
  }

  // Log error on server
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
}
