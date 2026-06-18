import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

/**
 * Returns a Firebase Admin Auth instance, initializing the app on first call.
 *
 * Lazy initialization is used because this module is statically imported at
 * startup, but ES module imports are hoisted — meaning this file's top-level
 * code runs BEFORE dotenv.config() in server.js has a chance to set
 * process.env vars. By deferring initialization to the first getFirebaseAuth()
 * call (which happens inside a request handler, after the server is fully
 * booted), the env vars are guaranteed to be present.
 */
function getFirebaseAuth() {
  // Return cached auth if already initialized
  if (getApps().length > 0) {
    return getAuth(getApp());
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    console.warn('⚠️  Firebase Admin credentials missing. Google Sign-In will fail.');
    console.warn('   FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING');
    console.warn('   FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'MISSING');
    console.warn('   FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'MISSING');
    return null;
  }

  try {
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin SDK Initialized');
    return getAuth(app);
  } catch (error) {
    console.error('❌ Firebase Admin Init Error:', error.message);
    return null;
  }
}

// Export a proxy `auth` object so existing code using `auth.verifyIdToken()`
// works unchanged — it will trigger lazy initialization on first use.
export const auth = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getFirebaseAuth();
      if (!instance) return undefined;
      const value = instance[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }
);
