import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:8080/api/mensajeria/eventos";

export const obtenerEventosMensajeria = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Error al obtener eventos de mensajería");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al consultar eventos JMS:", error);
    return [];
  }
};
