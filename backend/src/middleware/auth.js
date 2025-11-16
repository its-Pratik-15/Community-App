import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "changeme", {
    expiresIn: "7d",
  });
}

export function requireAuth(req, res, next) {
  // 1. Check for token in Authorization header
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;
  
  // 2. Check for token in cookies
  const tokenFromCookie = req.cookies?.token || 
                        (req.signedCookies ? req.signedCookies.token : null);
  
  // 3. Fallback to raw cookie header
  const tokenFromRawCookie = req.headers.cookie 
    ?.split('; ')
    ?.find(c => c.trim().startsWith('token='))
    ?.split('=')[1];
  
  // 4. Use the first available token
  const finalToken = tokenFromHeader || tokenFromCookie || tokenFromRawCookie;
  
  if (!finalToken) {
    console.log('No token found in request');
    console.log('Headers:', req.headers);
    return res.status(401).json({ 
      error: "Unauthorized: No token provided",
      details: {
        hasAuthHeader: !!authHeader,
        hasCookies: !!req.cookies,
        cookieKeys: req.cookies ? Object.keys(req.cookies) : []
      }
    });
  }
  
  try {
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET || "changeme");
    
    if (!decoded.role) {
      return res.status(401).json({ error: "Invalid token: Missing role information" });
    }
    
    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {    
    if (error.name === 'TokenExpiredError') {
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

    // Flatten the roles array in case it's nested
    const flattenedRoles = roles.flat(Infinity);
    
    // Convert both stored role and required roles to uppercase for case-insensitive comparison
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
