function AutomatizacionPedidos({ cantidad }) {
  const objetivo = 10;
  const progreso = Math.min((cantidad / objetivo) * 100, 100);

  return (
    <aside className="automation-card" aria-label="Estado de generación automática">
      <div className="automation-card__header">
        <div>
          <strong>Simulación automática</strong>
          <p>Generación gestionada por el backend</p>
        </div>
        <span className="automation-card__status">Configurada</span>
      </div>
      <div className="automation-card__details">
        <span>Un pedido cada 2 minutos</span>
        <strong>{cantidad} / {objetivo} pedidos</strong>
      </div>
      <div
        className="automation-card__progress"
        role="progressbar"
        aria-label="Pedidos generados hacia el objetivo"
        aria-valuemin="0"
        aria-valuemax={objetivo}
        aria-valuenow={Math.min(cantidad, objetivo)}
      >
        <span style={{ width: `${progreso}%` }} />
      </div>
      <small>
        Al bajar de {objetivo}, el backend vuelve a generar pedidos. La vista se actualiza cada 15 segundos.
      </small>
    </aside>
  );
}

export default AutomatizacionPedidos;
