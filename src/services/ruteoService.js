import { apiRequest } from "./api";

export const optimizarRuta = async (direcciones, criterio = "DISTANCIA_CORTA") => {
  return apiRequest("/ruteo/optimizar", {
    method: "POST",
    body: JSON.stringify({ direcciones, criterio }),
  });
};
