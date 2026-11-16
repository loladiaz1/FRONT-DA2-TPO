import { apiRequest } from "./api";

export const obtenerProductos = () => apiRequest("/productos");

export const obtenerProductoPorId = (id) => apiRequest(`/productos/${id}`);

export const obtenerVendedores = () => apiRequest("/vendedores");

export const obtenerVendedorPorId = (id) => apiRequest(`/vendedores/${id}`);
