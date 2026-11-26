import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import {
  liberarStock,
  obtenerEstadoSesionInventario,
  obtenerInventario,
  reservarStock,
} from "../services/inventarioService";

const normalizarInventario = (data) => {
  if (!Array.isArray(data)) {
    throw new Error("La respuesta de inventario no tiene el formato esperado.");
  }
  return data.flatMap((producto) => (
    Array.isArray(producto.stockPorDeposito)
      ? producto.stockPorDeposito.map((stock, index) => ({
        ...producto,
        ...stock,
        id: `${producto.id || producto.sku}-${index}`,
        deposito: stock.deposito,
      }))
      : [producto]
  ));
};

const cantidadDisponible = (item) => Number(item.disponible ?? item.stockDisponible) || 0;
const cantidadBloqueada = (item) => Number(item.bloqueado ?? item.stockBloqueado) || 0;

function Inventario() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [estadoSesion, setEstadoSesion] = useState(null);
  const [errorSesion, setErrorSesion] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [procesando, setProcesando] = useState("");

  const cargarInventario = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(normalizarInventario(await obtenerInventario()));
    } catch (requestError) {
      setError(`No se pudo cargar el inventario. ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarEstadoSesion = useCallback(async () => {
    setErrorSesion("");
    try {
      setEstadoSesion(await obtenerEstadoSesionInventario());
    } catch (requestError) {
      setErrorSesion(`No se pudo consultar la sesión de inventario. ${requestError.message}`);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      cargarInventario();
      cargarEstadoSesion();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cargarEstadoSesion, cargarInventario]);

  const operarStock = async (item, operacion) => {
    const key = `${item.sku}@${item.deposito}`;
    setProcesando(key);
    setFeedback(null);
    try {
      const result = await (operacion === "reservar"
        ? reservarStock(item.sku, item.deposito)
        : liberarStock(item.sku, item.deposito));
      setFeedback({
        tipo: "exito",
        texto: result?.mensaje || `Operación de ${operacion} completada.`,
      });
      await cargarInventario();
      await cargarEstadoSesion();
    } catch (requestError) {
      setFeedback({ tipo: "error", texto: requestError.message });
    } finally {
      setProcesando("");
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Inventario</h1>
          <p>Disponibilidad y stock bloqueado por depósito.</p>
        </div>
        <button className="button button--secondary" type="button" onClick={cargarInventario} disabled={loading}>
          Actualizar
        </button>
      </div>

      <div className="order-preview">
        Las reservas manuales pertenecen a la sesión del navegador y vencen a los cinco minutos.
        No reserves manualmente antes de confirmar un pedido: el checkout ya reserva el stock.
      </div>
      {feedback && <div className={`message ${feedback.tipo === "error" ? "message--error" : ""}`}>{feedback.texto}</div>}
      {errorSesion && <div className="message message--error">{errorSesion}</div>}
      {estadoSesion && (
        <section className="section">
          <div className="section-header">
            <h2>Sesión de inventario</h2>
            <span>{estadoSesion.tipoComponente}</span>
          </div>
          <p>ID de sesión: <strong>{estadoSesion.idSesionConversacional || "—"}</strong></p>
          {Object.entries(estadoSesion.reservasActivas || {}).length > 0 ? (
            <ul className="route-stops">
              {Object.entries(estadoSesion.reservasActivas).map(([reserva, cantidad]) => (
                <li key={reserva}>{reserva} · {cantidad} unidad(es) reservada(s)</li>
              ))}
            </ul>
          ) : <p className="empty-state">No hay reservas manuales activas en esta sesión.</p>}
        </section>
      )}
      {loading && <Loading message="Consultando stock..." />}
      {error && <div className="message message--error">{error}<button className="button button--secondary" onClick={cargarInventario}>Reintentar</button></div>}
      {!loading && !error && (
        <section className="section">
          <div className="section-header">
            <h2>Stock por depósito</h2>
            <span>{items.length} posiciones</span>
          </div>
          {items.length > 0 ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr><th>SKU</th><th>Producto</th><th>Depósito</th><th>Disponible</th><th>Bloqueado</th><th>Reserva manual</th></tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const key = `${item.sku}@${item.deposito}`;
                    const busy = procesando === key;
                    const deposito = typeof item.deposito === "string" ? item.deposito : item.deposito?.nombre;
                    return (
                      <tr key={item.id || `${key}-${index}`}>
                        <td>{item.sku || "—"}</td>
                        <td>{item.nombre || item.descripcion || "—"}</td>
                        <td>{deposito || "—"}</td>
                        <td>{cantidadDisponible(item)}</td>
                        <td>{cantidadBloqueada(item)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="button button--primary"
                              type="button"
                              onClick={() => operarStock(item, "reservar")}
                              disabled={busy || cantidadDisponible(item) <= 0}
                            >
                              Reservar
                            </button>
                            <button
                              className="button button--secondary"
                              type="button"
                              onClick={() => operarStock(item, "liberar")}
                              disabled={busy}
                            >
                              Liberar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-state">No hay existencias registradas.</p>}
        </section>
      )}
    </section>
  );
}

export default Inventario;
