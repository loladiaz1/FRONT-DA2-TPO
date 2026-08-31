const API_URL = "http://localhost:8080/api/pedido";

const auth = {
  username: "operador",
  password: "operador123",
};

const headers = {
  "Content-Type": "application/json",
  Authorization:
    "Basic " +
    btoa(`${auth.username}:${auth.password}`),
};

export async function obtenerPedidos() {
  const response = await fetch(API_URL, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Error al obtener pedidos");
  }

  return response.json();
}

export async function obtenerPedidoPorId(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    headers,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Error al obtener pedido");
  }

  return response.json();
}

export async function crearPedido(pedido) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(pedido),
  });

  if (!response.ok) {
    throw new Error("Error al crear pedido");
  }

  return response.json();
}

export async function actualizarPedido(id, pedido) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(pedido),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar pedido");
  }

  return response.json();
}

export async function eliminarPedido(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Error al eliminar pedido");
  }

  return true;
}