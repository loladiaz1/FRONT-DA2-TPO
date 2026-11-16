import { apiRequest } from "./api";

export const obtenerDepositoDefault = () => apiRequest("/deposito/default");
