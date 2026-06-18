import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Route guard for protected APIs.
 *
 * Expects an `Authorization: Bearer <token>` header. On success it verifies
 * the JWT, loads the user (minus the password hash) and attaches it to
 * `req.user` so downstream handlers know who is calling. Any failure ends
 * the request with 401 — no handler downstream runs.
 */
export const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // password already excluded by schema

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
