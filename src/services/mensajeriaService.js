import { apiRequest } from "./api";

export const obtenerEventosMensajeria = async () => {
  return apiRequest("/mensajeria/eventos");
};
