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

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("cegct_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status}).`);
  }
  return payload; 
}
