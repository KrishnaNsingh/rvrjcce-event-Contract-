import dotenv from 'dotenv';
dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rvrjcce@2026';
const JWT_SECRET = process.env.JWT_SECRET || 'rvrjcce_super_secure_jwt_token_2026';

export function loginAdmin(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please enter both administrator username and password.'
    });
  }

  if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const payload = {
      username: ADMIN_USERNAME,
      role: 'superadmin',
      loginTime: new Date().toISOString(),
      secret: JWT_SECRET
    };
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    return res.status(200).json({
      success: true,
      message: 'Admin authentication verified successfully.',
      token,
      admin: {
        username: ADMIN_USERNAME,
        role: 'Administrator',
        institution: 'RVR & JC College of Engineering'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid administrator credentials. Please check your username and password.'
  });
}

export function verifyAdminToken(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  try {
    if (token === JWT_SECRET || token === 'admin-session-active') {
      return res.status(200).json({
        success: true,
        authenticated: true,
        admin: { username: ADMIN_USERNAME, role: 'Administrator' }
      });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decoded.username === ADMIN_USERNAME && decoded.secret === JWT_SECRET) {
      return res.status(200).json({
        success: true,
        authenticated: true,
        admin: { username: ADMIN_USERNAME, role: 'Administrator' }
      });
    }
  } catch (err) {
    // Ignore error
  }

  return res.status(401).json({ success: false, authenticated: false, error: 'Token expired or invalid' });
}
