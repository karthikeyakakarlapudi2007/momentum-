import jwt from 'jsonwebtoken';

/**
 * Sign a JWT for the given user id.
 *
 * The secret comes from JWT_SECRET (see server/.env). Tokens expire after
 * JWT_EXPIRES_IN (default 7d) so a stolen token can't live forever.
 */
export function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in the environment');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
