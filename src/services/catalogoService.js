import { apiRequest } from "./api";

export const obtenerProductos = () => apiRequest("/productos");

export const obtenerProductoPorId = (id) => apiRequest(`/productos/${id}`);

export const crearProducto = async (producto) => apiRequest("/productos", {
  method: "POST",
  body: JSON.stringify(producto),
});

export const actualizarProducto = async (id, producto) => apiRequest(`/productos/${id}`, {
  method: "PUT",
  body: JSON.stringify(producto),
});

export const eliminarProducto = async (id) => {
  await apiRequest(`/productos/${id}`, { method: "DELETE" });
  return true;
};

export const obtenerVendedores = () => apiRequest("/vendedores");

export const obtenerVendedorPorId = (id) => apiRequest(`/vendedores/${id}`);
