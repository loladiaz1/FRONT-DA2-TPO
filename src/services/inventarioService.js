import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:8080/api/inventario";

const getHeaders = () => getAuthHeaders();

/**
 * COMPONENTE 3 STATEFUL - InventarioService
 * Requiere credentials: "include" para enviar la cookie JSESSIONID
 * y permitir que el contenedor Spring identifique la sesion conversacional (@SessionScope).
 */

export const obtenerInventario = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el inventario de los depositos");
  }

  return response.json();
};

export const reservarStock = async (sku, deposito, cantidad = 1) => {
  const response = await fetch(`${API_URL}/reservar`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ sku, deposito, cantidad }),
  });

  const data = await response.json();
  if (!response.ok || !data.exitoso) {
    throw new Error(data.mensaje || "Error al reservar stock en la sesion");
  }

  return data;
};

export const liberarStock = async (sku, deposito, cantidad = 1) => {
  const response = await fetch(`${API_URL}/liberar`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ sku, deposito, cantidad }),
  });

  const data = await response.json();
  if (!response.ok || !data.exitoso) {
    throw new Error(data.mensaje || "Error al liberar stock de la sesion");
  }

  return data;
};

export const obtenerEstadoSesion = async () => {
  const response = await fetch(`${API_URL}/sesion`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar el estado conversacional de la sesion");
  }

  return response.json();
};
