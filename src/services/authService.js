const API_URL = "http://localhost:8080/api/auth";

const USER_STORAGE_KEY = "logired_user";
const AUTH_STORAGE_KEY = "logired_auth";

/**
 * Retorna las cabeceras HTTP necesarias para peticiones autenticadas.
 * Si hay un usuario logueado en localStorage, usa sus credenciales en Base64.
 * Si no, usa fallback a operador para no romper llamadas iniciales.
 */
export const getAuthHeaders = () => {
  const auth = localStorage.getItem(AUTH_STORAGE_KEY);
  const credentials = auth || btoa("operador:operador123");

  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
};

export const getStoredUser = () => {
  const data = localStorage.getItem(USER_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setStoredUser = (user, password) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  if (user && password) {
    const encoded = btoa(`${user.username}:${password}`);
    localStorage.setItem(AUTH_STORAGE_KEY, encoded);
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Credenciales inválidas");
  }

  const user = { username: data.username, rol: data.rol };
  setStoredUser(user, password);
  return user;
};

export const register = async (username, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "Error al registrar el usuario");
  }

  return { username: data.username, rol: data.rol };
};
