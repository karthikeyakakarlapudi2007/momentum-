/**
 * Tiny fetch wrapper used by every service in /src/services.
 *
 * Reads the API base URL from REACT_APP_API_URL (see .env.example).
 * Adds JSON headers, parses JSON responses, and throws on non-2xx
 * so callers can `try / catch` naturally.
 */

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// Key under which AuthContext stores the JWT. Kept here too so the fetch
// wrapper can attach the token without importing React state.
export const TOKEN_KEY = "momentum.token";

function authHeader() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request(path, { method = "GET", body, headers, signal } = {}) {
  const url = `${BASE_URL}${path}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeader(),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    // fetch rejects with a TypeError ("Failed to fetch") only when the request
    // never reached a responding server: backend down, wrong URL/port, DNS, or
    // a CORS preflight rejection. Re-raise abort as-is; translate the rest into
    // a clear, user-facing message instead of the opaque "Failed to fetch".
    if (err?.name === "AbortError") throw err;
    throw new ApiError(
      `Can't reach the server at ${BASE_URL}. Make sure the backend is running and VITE_API_URL is correct.`,
      0,
      { cause: err?.message }
    );
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
  baseUrl: BASE_URL,
};
