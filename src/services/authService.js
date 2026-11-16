import { apiRequest } from "./api";

const USER_STORAGE_KEY = "logired_user";
const AUTH_STORAGE_KEY = "logired_auth";

export const getAuthHeaders = () => {
  const credentials = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!credentials) {
    throw new Error("Tu sesión expiró. Iniciá sesión nuevamente.");
  }

  return {
    Authorization: `Basic ${credentials}`,
  };
};

export const getStoredUser = () => {
  const data = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!data) return null;
  if (!sessionStorage.getItem(AUTH_STORAGE_KEY)) {
    clearStoredUser();
    return null;
  }
  try {
    return JSON.parse(data);
  } catch {
    clearStoredUser();
    return null;
  }
};

export const setStoredUser = (user, password) => {
  const bytes = new TextEncoder().encode(`${user.username}:${password}`);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  sessionStorage.setItem(AUTH_STORAGE_KEY, btoa(binary));
};

export const clearStoredUser = () => {
  sessionStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

export const login = async (username, password) => {
  const data = await apiRequest("/auth/login", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const user = { username: data.username, rol: data.rol };
  setStoredUser(user, password);
  return user;
};

export const register = async (username, password) => {
  const data = await apiRequest("/auth/register", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return { username: data.username, rol: data.rol };
};
