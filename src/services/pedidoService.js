const API_URL = "http://localhost:8080/api/pedido";

const credentials = btoa("operador:operador123");

const getHeaders = () => ({
  Authorization: `Basic ${credentials}`,
  "Content-Type": "application/json",
});

export const obtenerPedidos = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los pedidos");
  }

  return response.json();
};

export const obtenerPedidoPorId = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error("No se pudo obtener el pedido");
  }

  return response.json();
};

export const crearPedido = async (pedido) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(pedido),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el pedido");
  }

  return response.json();
};

export const actualizarPedido = async (id, pedido) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(pedido),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar el pedido");
  }

  return response.json();
};

export const eliminarPedido = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el pedido");
  }

  return true;
};