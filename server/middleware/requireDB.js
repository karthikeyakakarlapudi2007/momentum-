import { isDBConnected } from '../config/db.js';

/**
 * Short-circuit DB-backed requests when MongoDB isn't connected.
 *
 * Without this, Mongoose buffers the query and the request hangs until the
 * buffer timeout before failing — slow and confusing. This returns a clear
 * 503 immediately so the frontend can show a meaningful message.
 */
export function requireDB(req, res, next) {
  if (!isDBConnected()) {
    return res.status(503).json({
      message:
        'Database unavailable. The server is running but cannot reach MongoDB — please try again shortly.',
    });
  }
  next();
}
