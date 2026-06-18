/**
 * env-loader.js — Must be the VERY FIRST import in server.js.
 *
 * ES module `import` statements are hoisted and executed before any
 * code runs in the importing module.  If we put `dotenv.config()` inline
 * in server.js after some imports, those earlier modules are evaluated
 * without the env vars set.  By putting dotenv.config() here and
 * importing this file first, we guarantee the env vars exist before any
 * other module (including firebase.js) runs.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
