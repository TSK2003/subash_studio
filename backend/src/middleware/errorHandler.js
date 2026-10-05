import ENV from "../config/env.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
}

export function centralizedErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Handle malformed JSON body parse errors cleanly without dumping an unhandled stack trace
  if (err.type === "entity.parse.failed" || (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400) && "body" in err)) {
    console.warn(`[Client Warning][${req?.id || "N/A"}] ${req.method} ${req.originalUrl}: Malformed JSON in request body`);
    return res.status(400).json({
      success: false,
      error: "Invalid JSON format in request body. Please verify that JSON syntax is valid.",
      requestId: req?.id || null,
    });
  }

  // In production, suppress technical internal error details
  let message = err.message || "An unexpected server error occurred.";
  if (ENV.NODE_ENV === "production" && statusCode === 500) {
    message = "An unexpected server error occurred. Please try again later.";
  }

  // Log error on server with request correlation ID
  console.error(`[Error][${req?.id || "N/A"}] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    success: false,
    error: message,
    requestId: req?.id || null,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
}

