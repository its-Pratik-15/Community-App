import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "changeme", {
    expiresIn: "7d",
  });
}

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

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: "Forbidden: No user information found" });
    }

    const flattenedRoles = roles.flat(Infinity);
    
    const userRole = req.user.role?.toUpperCase();
    const requiredRoles = flattenedRoles.map(role => {
      if (typeof role === 'string') {
        return role.toUpperCase();
      }
      console.warn('Invalid role type:', role);
      return ''; // Will never match
    });
    
    if (!requiredRoles.includes(userRole)) {
      console.log(`Access denied. User role: ${userRole}, Required roles: ${requiredRoles.join(', ')}`);
      return res.status(403).json({ 
        error: "Forbidden: Insufficient permissions",
        requiredRoles,
        currentRole: userRole
      });
    }
    
    next();
  };
}
