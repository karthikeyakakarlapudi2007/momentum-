/**
 * Auth service — talks to the backend `/api/users` auth endpoints.
 *
 * Each call returns the parsed JSON body (or throws an ApiError on non-2xx,
 * via the shared `api` wrapper). The token returned by register/login is
 * stored by AuthContext, not here.
 */

import { api } from "./api";

const RESOURCE = "/api/users";

export function registerUser({ name, email, password }) {
  return api.post(`${RESOURCE}/register`, { name, email, password });
}

export function loginUser({ email, password }) {
  return api.post(`${RESOURCE}/login`, { email, password });
}

/** Fetch the current user — requires the JWT (attached automatically by api). */
export function getProfile({ signal } = {}) {
  return api.get(`${RESOURCE}/profile`, { signal });
}

export function googleAuth(idToken) {
  return api.post(`/api/auth/google`, { idToken });
}

/** Persist profile field changes (name, email, age, mobile, etc.) to MongoDB. */
export function updateProfile(fields) {
  return api.put(`${RESOURCE}/profile`, fields);
}

export default { register: registerUser, login: loginUser, getProfile, googleAuth };
