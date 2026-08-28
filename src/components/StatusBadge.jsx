const statusLabels = {
  CREADO: "Creado",
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