const API_URL = "http://localhost:8080/api/ruteo/optimizar";

const credentials = btoa("operador:operador123");

const getHeaders = () => ({
  Authorization: `Basic ${credentials}`,
  "Content-Type": "application/json",
});

/**
 * Cliente síncrono para el Servicio SOA Reutilizable: Componente 5 (RuteoService).
 * Consume el endpoint expuesto por el Hub (Spring Boot) para optimizar rutas
 * aplicando el patrón Strategy.
 *
 * @param {Array<string>} direcciones Lista de direcciones / paradas a optimizar
 * @param {string} criterio "DISTANCIA_CORTA" o "TIEMPO_RAPIDO"
 * @returns {Promise<Object>} Resultado con paradasOrdenadas, distanciaTotalKm, tiempoEstimadoMinutos, etc.
 */
export const optimizarRuta = async (direcciones, criterio = "DISTANCIA_CORTA") => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ direcciones, criterio }),
  });

  if (!response.ok) {
    throw new Error("No se pudo calcular la ruta óptima en el Hub");
  }

  return response.json();
};
