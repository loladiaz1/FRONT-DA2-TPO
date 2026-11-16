import { apiRequest } from "./api";

export const obtenerInventario = async () => {
  return apiRequest("/inventario", { credentials: "include" });
};

export const reservarStock = async (sku, deposito, cantidad = 1) => {
  const result = await apiRequest("/inventario/reservar", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ sku, deposito, cantidad }),
  });
  if (result?.exitoso === false) {
    throw new Error(result.mensaje || "No se pudo reservar stock.");
  }
  return result;
};

export const liberarStock = async (sku, deposito, cantidad = 1) => {
  const result = await apiRequest("/inventario/liberar", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ sku, deposito, cantidad }),
  });
  if (result?.exitoso === false) {
    throw new Error(result.mensaje || "No se pudo liberar stock.");
  }
  return result;
};
