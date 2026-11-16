import { apiRequest } from "./api";

export const obtenerPedidos = async () => {
  return apiRequest("/pedido");
};

export const obtenerPedidoPorId = async (id) => {
  try {
    return await apiRequest(`/pedido/${id}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

export const crearPedido = async (pedido) => {
  return apiRequest("/pedido", {
    method: "POST",
    body: JSON.stringify(pedido),
  });
};

export const actualizarPedido = async (id, pedido) => {
  return apiRequest(`/pedido/${id}`, {
    method: "PUT",
    body: JSON.stringify(pedido),
  });
};

export const eliminarPedido = async (id) => {
  await apiRequest(`/pedido/${id}`, { method: "DELETE" });
  return true;
};