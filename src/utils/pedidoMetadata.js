const extraerCampo = (descripcion = "", campo) => {
  const coincidencia = descripcion.match(new RegExp(`(?:^|\\|\\s*)(?:${campo}):\\s*([^|]+)`, "i"));
  return coincidencia?.[1]?.trim() || "";
};

export const obtenerMetadataPedido = (pedido) => {
  const descripcion = pedido?.descripcion || "";

  return {
    usuario: extraerCampo(descripcion, "Usuario"),
    sku: extraerCampo(descripcion, "SKU"),
    producto: extraerCampo(descripcion, "Producto"),
    direccion: extraerCampo(descripcion, "Dirección|Direccion"),
    automatico: /pedido automático|pedido automatico/i.test(descripcion),
    deposito: pedido?.deposito?.nombre || extraerCampo(descripcion, "Depósito|Deposito"),
  };
};
