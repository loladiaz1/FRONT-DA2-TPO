import { getAuthHeaders } from "./authService";

export const API_BASE_URL = "http://localhost:8080/api";

export async function apiRequest(path, options = {}) {
  const {
    auth = true,
    credentials,
    headers: customHeaders = {},
    ...requestOptions
  } = options;
  const headers = {
    ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
    ...(auth ? getAuthHeaders() : {}),
    ...customHeaders,
  };
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers,
    ...(credentials ? { credentials } : {}),
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data
      ? data.mensaje || data.message
      : data;
    const error = new Error(`${message || "La solicitud no pudo completarse"} (HTTP ${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}
