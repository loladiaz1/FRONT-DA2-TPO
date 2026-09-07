import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import {
  obtenerInventario,
  reservarStock,
  liberarStock,
  obtenerEstadoSesion,
} from "../services/inventarioService";

function Inventario() {
  const [items, setItems] = useState([]);
  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [procesandoSku, setProcesandoSku] = useState(null);

  const cargarDatos = async () => {
    try {
      setError(null);
      const [itemsData, sesionData] = await Promise.all([
        obtenerInventario(),
        obtenerEstadoSesion(),
      ]);
      setItems(itemsData);
      setSesion(sesionData);
    } catch (err) {
      setError(err.message || "Error al conectar con InventarioService en el Hub.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleReservar = async (item) => {
    setProcesandoSku(item.sku);
    setFeedback(null);
    try {
      const res = await reservarStock(item.sku, item.deposito, 1);
      setFeedback({ tipo: "exito", texto: res.mensaje });
      await cargarDatos();
    } catch (err) {
      setFeedback({ tipo: "error", texto: err.message });
    } finally {
      setProcesandoSku(null);
    }
  };

  const handleLiberar = async (item) => {
    setProcesandoSku(item.sku);
    setFeedback(null);
    try {
      const res = await liberarStock(item.sku, item.deposito, 1);
      setFeedback({ tipo: "exito", texto: res.mensaje });
      await cargarDatos();
    } catch (err) {
      setFeedback({ tipo: "error", texto: err.message });
    } finally {
      setProcesandoSku(null);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Gestión de Inventario & Depósitos</h1>
          <p>Componente 3: InventarioService (Stateful · @SessionScope con Hold de Stock)</p>
        </div>
        <button className="button button--secondary" onClick={cargarDatos} disabled={loading}>
          Actualizar Datos
        </button>
      </div>

      {/* Tarjeta de Evidencia de Ciclo de Vida y Sesión Stateful */}
      <div
        className="form-card"
        style={{
          maxWidth: "100%",
          marginBottom: "24px",
          backgroundColor: "#f8fafc",
          borderColor: "#cbd5e1",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", color: "var(--primary)", marginBottom: "4px" }}>
              Estado del Componente Stateful en el Contenedor Spring
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
              Ámbito de Inyección: <strong>@SessionScope</strong> | Ciclo de vida gestionado por anotaciones
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span className="status-badge" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
              Sesión ID: {sesion?.idSesionConversacional || "Conectando..."}
            </span>
            <span className="status-badge status-badge--entregado">
              @PostConstruct ACTIVO
            </span>
          </div>
        </div>

        <div style={{ marginTop: "16px", fontSize: "13px", color: "var(--text)", lineHeight: "1.6" }}>
          <p>
            <strong>Justificación de Diseño (Parcial 1):</strong> Este componente mantiene el estado conversacional
            del comercio durante el armado de pedidos, bloqueando stock temporalmente (Hold). Si la sesión expira o se cierra,
            el contenedor Spring invoca automáticamente el callback <code>@PreDestroy</code> para revertir los bloqueos huérfanos en PostgreSQL.
          </p>
        </div>

        {sesion?.reservasActivas && Object.keys(sesion.reservasActivas).length > 0 && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              background: "#fef3c7",
              borderRadius: "6px",
              border: "1px solid #fde68a",
              color: "#92400e",
              fontSize: "13px",
            }}
          >
            <strong>Hold de Stock activo en tu sesión actual:</strong>
            <ul style={{ marginLeft: "20px", marginTop: "4px" }}>
              {Object.entries(sesion.reservasActivas).map(([clave, cantidad]) => (
                <li key={clave}>
                  <strong>{clave}</strong>: {cantidad} unidad(es) bloqueada(s)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {feedback && (
        <div className={`message ${feedback.tipo === "error" ? "message--error" : ""}`}>
          {feedback.texto}
        </div>
      )}

      {loading && <Loading message="Consultando stock en PostgreSQL..." />}

      {error && (
        <div className="message message--error">
          {error}
          <br />
          <button className="button button--secondary" onClick={cargarDatos} style={{ marginTop: "8px" }}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="section">
          <div className="section-header">
            <h2>Stock en Depósitos (Barracas & Munro)</h2>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {items.length} ítems registrados en PostgreSQL
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "12px 8px" }}>SKU</th>
                  <th style={{ padding: "12px 8px" }}>Descripción</th>
                  <th style={{ padding: "12px 8px" }}>Depósito</th>
                  <th style={{ padding: "12px 8px", textAlign: "center" }}>Disponible</th>
                  <th style={{ padding: "12px 8px", textAlign: "center" }}>Bloqueado (Hold)</th>
                  <th style={{ padding: "12px 8px", textAlign: "center" }}>Operaciones Sesión</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const clave = `${item.sku}@${item.deposito}`;
                  const retenidoSesion = sesion?.reservasActivas?.[clave] || 0;
                  const isBusy = procesandoSku === item.sku;

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 8px", fontWeight: "700" }}>{item.sku}</td>
                      <td style={{ padding: "14px 8px" }}>{item.nombre || item.descripcion}</td>
                      <td style={{ padding: "14px 8px", color: "var(--text-secondary)" }}>{item.deposito}</td>
                      <td style={{ padding: "14px 8px", textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: "800",
                            color: item.stockDisponible > 0 ? "var(--success)" : "var(--danger)",
                          }}
                        >
                          {item.stockDisponible}
                        </span>
                      </td>
                      <td style={{ padding: "14px 8px", textAlign: "center" }}>
                        <span style={{ fontWeight: "700", color: item.stockBloqueado > 0 ? "var(--warning)" : "var(--text-secondary)" }}>
                          {item.stockBloqueado}
                        </span>
                        {retenidoSesion > 0 && (
                          <span style={{ fontSize: "11px", display: "block", color: "#b45309" }}>
                            ({retenidoSesion} en tu sesión)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 8px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            className="button button--primary"
                            style={{ padding: "6px 12px", minHeight: "32px", fontSize: "12px" }}
                            onClick={() => handleReservar(item)}
                            disabled={isBusy || item.stockDisponible <= 0}
                          >
                            {isBusy ? "..." : "+ Reservar (Hold)"}
                          </button>
                          <button
                            className="button button--secondary"
                            style={{ padding: "6px 12px", minHeight: "32px", fontSize: "12px" }}
                            onClick={() => handleLiberar(item)}
                            disabled={isBusy || retenidoSesion <= 0}
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
        </div>
      )}
    </section>
  );
}

export default Inventario;
