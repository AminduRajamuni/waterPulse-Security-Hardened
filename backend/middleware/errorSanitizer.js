// V8 fix (A05:2021 Security Misconfiguration): stops internal error details
// (raw Mongoose messages, model/field names, etc.) from reaching clients in
// production. It wraps res.json so that, in production only:
//   - any 5xx response body is reduced to a single generic message, and
//   - any lingering internal `error` detail field is stripped from the body.
// Outside production (development/test) responses pass through untouched, so
// local debugging and the existing test suite keep their full detail.
export const sanitizeErrorResponses = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === "object" && !Array.isArray(body)) {
      // Server-side failures: never reveal the underlying reason.
      if (res.statusCode >= 500) {
        return originalJson({ message: "Server error" });
      }
      // Client errors (4xx): keep the user-facing message, drop internal detail.
      if ("error" in body) {
        const { error, ...safe } = body;
        return originalJson(safe);
      }
    }
    return originalJson(body);
  };

  next();
};
