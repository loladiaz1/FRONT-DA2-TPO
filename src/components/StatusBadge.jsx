const statusLabels = {
  CREADO: "Creado",
  ASIGNADO: "Asignado",
  EN_RUTA: "En ruta",
  FALLIDO: "Fallido",
  // Keep the older labels readable for records created by earlier frontend versions.
  EN_PREPARACION: "En preparacion",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

function StatusBadge({ estado }) {
  const normalizedStatus = estado || "CREADO";
  return (
    <span className={`status-badge status-badge--${normalizedStatus.toLowerCase()}`}>
      {statusLabels[normalizedStatus] || normalizedStatus}
    </span>
  );
}

export default StatusBadge;