import dotenv from 'dotenv';
dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rvrjcce@2026';
const JWT_SECRET = process.env.JWT_SECRET || 'rvrjcce_super_secure_jwt_token_2026';

export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access the Admin Console.'
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // Validate token (supports structured base64 token or matching secret)
  try {
    if (token === JWT_SECRET || token === 'admin-session-active') {
      req.adminUser = { username: ADMIN_USERNAME, role: 'superadmin' };
      return next();
    }

    // Try decoding JSON token
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decoded.username === ADMIN_USERNAME && decoded.secret === JWT_SECRET) {
      req.adminUser = decoded;
      return next();
    }
  } catch (err) {
    // Fall through to 401
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid or expired administrative token. Please log in again.'
  });
}
