import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { obtenerEventosMensajeria } from "../services/mensajeriaService";

function Mensajeria() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarEventos = useCallback(async () => {
    setError("");
    try {
      const data = await obtenerEventosMensajeria();
      if (!Array.isArray(data)) {
        throw new Error("La respuesta de eventos no tiene el formato esperado.");
      }
      setEventos(data);
    } catch (requestError) {
      setError(`No se pudieron cargar los eventos. ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.rol !== "ADMIN") {
      return undefined;
    }

    const timer = window.setTimeout(cargarEventos, 0);
    const interval = window.setInterval(cargarEventos, 15000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [cargarEventos, user?.rol]);

  if (user?.rol !== "ADMIN") {
    return (
      <section>
        <h1>Acceso restringido</h1>
        <p className="message message--error">Solo los administradores pueden consultar los eventos de mensajería.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Eventos de pedidos</h1>
          <p>Consulta REST de eventos recientes; esta vista no usa WebSocket.</p>
        </div>
        <button className="button button--secondary" type="button" onClick={cargarEventos} disabled={loading}>
          Actualizar
        </button>
      </div>
      {loading && eventos.length === 0 && <Loading message="Cargando eventos..." />}
      {error && <div className="message message--error">{error}</div>}
      {!loading && !error && eventos.length === 0 && (
        <p className="empty-state">No hay eventos recientes.</p>
      )}
      <div className="pedido-list">
        {eventos.map((evento, index) => (
          <article className="pedido-card" key={evento.id || `${evento.timestamp}-${index}`}>
            <div className="pedido-card__header">
              <strong>{evento.icono && <span aria-hidden="true">{evento.icono} </span>}{evento.suscriptor || evento.tipo || "Evento"}</strong>
              {evento.timestamp && <time>{evento.timestamp}</time>}
            </div>
            {evento.accion && <p>{evento.accion}</p>}
            {evento.payload && <pre className="event-payload">{evento.payload}</pre>}
          </article>
        ))}
      </div>
    </section>
  );
}

export default Mensajeria;
