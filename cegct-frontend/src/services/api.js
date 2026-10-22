const isProduction = process.env.NODE_ENV === "production";
const productionApiUrl = "https://cegct-api.onrender.com/api";

export const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  (isProduction ? productionApiUrl : "http://localhost:5000/api")
).replace(/\/+$/, "");

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/i, "");

export const SOCKET_URL = (
  process.env.REACT_APP_SOCKET_URL ||
  (isProduction ? "https://cegct-api.onrender.com" : API_ORIGIN)
).replace(/\/+$/, "");

function endStaffSession() {
  localStorage.removeItem("cegct_token");
  window.dispatchEvent(new Event("cegct:session-expired"));
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("cegct_token");
  const isLoginRequest = path === "/auth/login";
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (_error) {
    if (token && !isLoginRequest) endStaffSession();
    throw new Error(token && !isLoginRequest
      ? "Your session ended. Please sign in again."
      : "Unable to connect. Please try again.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (token && !isLoginRequest && (response.status === 401 || response.status === 403 || response.status >= 500)) {
      endStaffSession();
      throw new Error("Your session ended. Please sign in again.");
    }
    if (isLoginRequest) throw new Error(payload.error || "Unable to sign in. Check your email and password.");
    throw new Error("This request could not be completed. Please try again.");
  }
  return payload; 
}
