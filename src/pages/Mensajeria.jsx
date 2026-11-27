import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { obtenerEventosMensajeria } from "../services/mensajeriaService";
import { crearPedido } from "../services/pedidoService";

function Mensajeria() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disparando, setDisparando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargarEventos = async () => {
    try {
      const data = await obtenerEventosMensajeria();
      setEventos(data);
    } catch {
      // Silencioso o manejo suave
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEventos();
    const interval = setInterval(cargarEventos, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDispararPrueba = async () => {
    setDisparando(true);
    setMensaje(null);
    try {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const res = await crearPedido({
        descripcion: `Envío Express #${randomId} (Entrega 2 JMS)`,
        total: parseFloat((1500 + Math.random() * 3000).toFixed(2)),
      });
      setMensaje({
        tipo: "exito",
        texto: `¡Pedido #${res.id} creado con éxito! Se publicó el evento PEDIDO_CREADO en el tópico 'logired.envios.creados'.`,
      });
      setTimeout(cargarEventos, 500);
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al emitir el pedido de prueba al backend.",
      });
    } finally {
      setDisparando(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Integración Asincrónica (JMS ActiveMQ)</h1>
          <p>Entrega Parcial N.º 2 · Proceso de negocio reactivo con broker real y modelo Pub/Sub</p>
        </div>
        <button
          className="button button--primary"
          onClick={handleDispararPrueba}
          disabled={disparando}
        >
          {disparando ? "Publicando en Broker..." : "🚀 Disparar Pedido de Prueba"}
        </button>
      </div>

      {mensaje && (
        <div className={`message ${mensaje.tipo === "error" ? "message--error" : ""}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Métricas / Datos del Broker */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-label">Broker JMS</span>
          <span className="stat-value" style={{ fontSize: "22px" }}>ActiveMQ</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            tcp://localhost:61616
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Tópico Pub/Sub</span>
          <span className="stat-value" style={{ fontSize: "20px" }}>logired.envios</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Paradigma Fan-Out 1:N
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Suscriptores Activos</span>
          <span className="stat-value">{3}</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Depósito, Ruteo, Notificaciones
          </span>
        </div>
      </div>

      {/* Explicación de los 3 Suscriptores */}
      <section className="section" style={{ marginBottom: "28px" }}>
        <div className="section-header">
          <h2>Suscriptores Conectados al Tópico</h2>
          <span className="status-badge status-badge--entregado">
            Broker Online
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: "18px", fontSize: "14px", lineHeight: "1.5" }}>
          Al persistir un nuevo pedido en PostgreSQL, <code>PedidoService</code> emite un <code>TextMessage</code> JSON
          al tópico <code>logired.envios.creados</code>. Los siguientes tres subsistemas reciben una copia independiente y
          ejecutan su tarea en hilos de background desacoplados:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          <div className="pedido-card">
            <div className="pedido-card__header">
              <span>SUSCRIPTOR 1</span>
              <span className="status-badge">Depósito</span>
            </div>
            <h3>📦 Picking y Packing</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Inicia la preparación física en el depósito central sin bloquear la respuesta HTTP al usuario.
            </p>
          </div>

          <div className="pedido-card">
            <div className="pedido-card__header">
              <span>SUSCRIPTOR 2</span>
              <span className="status-badge">Logística</span>
            </div>
            <h3>🛵 Ruteo y Repartidores</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Aplica el patrón Strategy para proponer el recorrido óptimo y pre-asignar chofer de última milla.
            </p>
          </div>

          <div className="pedido-card">
            <div className="pedido-card__header">
              <span>SUSCRIPTOR 3</span>
              <span className="status-badge">Comunicaciones</span>
            </div>
            <h3>📲 Notificaciones B2C</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Despacha el mensaje con código de tracking al comprador por WhatsApp y correo electrónico.
            </p>
          </div>
        </div>
      </section>

      {/* Historial de Eventos Recibidos por los Listeners */}
      <section className="section">
        <div className="section-header">
          <h2>Mensajes Procesados en Vivo ({eventos.length})</h2>
          <button className="button button--secondary" onClick={cargarEventos}>
            Actualizar
          </button>
        </div>

        {loading && eventos.length === 0 && <Loading message="Cargando mensajes del broker..." />}

        {!loading && eventos.length === 0 && (
          <p className="empty-state">
            Aún no se han recibido eventos en esta sesión. Haz clic en <strong>"Disparar Pedido de Prueba"</strong> para ver el flujo en acción.
          </p>
        )}

        <div className="pedido-list">
          {eventos.map((evt, idx) => (
            <div key={idx} className="pedido-card">
              <div className="pedido-card__header">
                <span style={{ fontSize: "16px" }}>
                  {evt.icono} <strong>{evt.suscriptor}</strong>
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                  {evt.timestamp}
                </span>
              </div>
              <h3 style={{ margin: "6px 0 10px 0", fontSize: "15px", fontWeight: "600", color: "var(--text)" }}>
                {evt.accion}
              </h3>
              {evt.payload && (
                <div style={{ padding: "10px", background: "var(--background)", borderRadius: "6px", overflowX: "auto" }}>
                  <code style={{ fontSize: "12px", color: "var(--text)" }}>{evt.payload}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default Mensajeria;
