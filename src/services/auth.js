/**
 * Auth service — wraps POST /api/users/register and POST /api/users/login.
 */

import { api } from "./api";

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 */
export function registerUser(data) {
  return api.post("/api/users/register", data);
}

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 */
export function loginUser(data) {
  return api.post("/api/users/login", data);
}

export default { register: registerUser, login: loginUser };
