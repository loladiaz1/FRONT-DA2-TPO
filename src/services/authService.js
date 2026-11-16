import { apiRequest } from "./api";

const USER_STORAGE_KEY = "logired_user";
const AUTH_STORAGE_KEY = "logired_auth";

const storage = {
  getItem(key) {
    try {
      return typeof window !== "undefined" && window.sessionStorage
        ? window.sessionStorage.getItem(key)
        : null;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage failure and preserve the app behavior in restricted contexts.
    }
  },
  removeItem(key) {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch {
      // Ignore storage failure and preserve the app behavior in restricted contexts.
    }
  },
};

export const isAdminAccount = (user = null) => (
  user?.rol === "ADMIN" && user?.username?.toLowerCase() === "admin"
);

export const canDeleteRecords = (user = null) => isAdminAccount(user);

export const getAuthHeaders = () => {
  const credentials = storage.getItem(AUTH_STORAGE_KEY);
  if (!credentials) {
    throw new Error("Tu sesión expiró. Iniciá sesión nuevamente.");
  }

  return {
    Authorization: `Basic ${credentials}`,
  };
};

export const getStoredUser = () => {
  const data = storage.getItem(USER_STORAGE_KEY);
  if (!data) return null;
  if (!storage.getItem(AUTH_STORAGE_KEY)) {
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
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  storage.setItem(AUTH_STORAGE_KEY, btoa(binary));
};

export const clearStoredUser = () => {
  storage.removeItem(USER_STORAGE_KEY);
  storage.removeItem(AUTH_STORAGE_KEY);
};

export const login = async (username, password) => {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  const data = await apiRequest("/auth/login", {
    auth: false,
    method: "POST",
    body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
  });
  const user = { username: data.username, rol: data.rol };
  setStoredUser(user, cleanPassword);
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
