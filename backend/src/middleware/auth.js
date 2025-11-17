import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  console.log('Auth Middleware - Request:', {
    method: req.method,
    path: req.path,
    headers: {
      cookie: req.headers.cookie ? 'present' : 'missing',
      origin: req.headers.origin
    },
    cookies: req.cookies
  });

  // Only check cookies (you removed header auth)
  const tokenFromCookie = req.cookies?.token;

  console.log('Token sources:', {
    cookie: tokenFromCookie ? 'present' : 'missing'
  });

  if (!tokenFromCookie) {
    console.log('No token found in request');

    return res.status(401).json({
      error: "Unauthorized: No token provided",
      details: {
        hasCookies: !!req.cookies,
        cookieKeys: req.cookies ? Object.keys(req.cookies) : []
      }
    });
  }

  try {
    const decoded = jwt.verify(
      tokenFromCookie,
      process.env.JWT_SECRET || "changeme"
    );

    if (!decoded.role) {
      return res.status(401).json({ error: "Invalid token: Missing role information" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
