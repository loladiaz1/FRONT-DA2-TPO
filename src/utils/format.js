export const formatearPrecio = (valor, moneda = "ARS") => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: moneda || "ARS",
  maximumFractionDigits: 2,
}).format(Number(valor) || 0);