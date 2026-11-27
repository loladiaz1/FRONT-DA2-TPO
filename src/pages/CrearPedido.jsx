import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearPedido } from "../services/pedidoService";
import { optimizarRuta } from "../services/ruteoService";

function CrearPedido() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ descripcion: "", total: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Estado del Servicio SOA de Ruteo (Componente 5 - Patrón Strategy)
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [criterio, setCriterio] = useState("DISTANCIA_CORTA");
  const [calculandoRuta, setCalculandoRuta] = useState(false);
  const [rutaResult, setRutaResult] = useState(null);
  const [ruteoError, setRuteoError] = useState("");

  const handleCalcularRuta = async (e) => {
    e.preventDefault();
    if (!origen.trim() || !destino.trim()) {
      setRuteoError("Ingresá origen y destino para calcular la ruta.");
      return;
    }

    setCalculandoRuta(true);
    setRuteoError("");
    setRutaResult(null);

    try {
      const res = await optimizarRuta([origen.trim(), destino.trim()], criterio);
      setRutaResult(res);

      // Autocompleta descripción y total sugerido en el formulario
      const totalSugerido = Math.round((1500 + res.distanciaTotalKm * 250) * 100) / 100;
      setForm((prev) => ({
        ...prev,
        descripcion: prev.descripcion || `Envío: ${origen.trim()} -> ${destino.trim()} (${res.distanciaTotalKm} km)`,
        total: prev.total || totalSugerido,
      }));
    } catch {
      setRuteoError("Error al conectar con RuteoService en el Hub.");
    } finally {
      setCalculandoRuta(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const total = Number(form.total);

    if (!form.descripcion.trim() || !form.total || !Number.isFinite(total) || total <= 0) {
      setError("Completa una descripción y un total mayor que 0.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await crearPedido({ descripcion: form.descripcion.trim(), total });
      navigate("/pedidos");
    } catch {
      setError("No se pudo crear el pedido. Verifica el servidor e intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Crear nuevo pedido</h1>
          <p>Registra un nuevo envío urbano en LogiRed integrando RuteoService (Componente 5).</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", maxWidth: "680px" }}>
        {/* Panel SOA: RuteoService con Patrón Strategy */}
        <div className="section" style={{ borderLeft: "4px solid var(--primary, #0284c7)" }}>
          <div className="section-header" style={{ marginBottom: "12px" }}>
            <h2>RuteoService (Componente 5 · Patrón Strategy)</h2>
          </div>
          <p style={{ color: "var(--text-secondary, #64748b)", fontSize: "14px", marginBottom: "16px" }}>
            Calcula la ruta óptima urbana entre paradas aplicando la estrategia seleccionada antes de confirmar el despacho.
          </p>

          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700" }}>Punto de Origen / Depósito</label>
              <input
                type="text"
                placeholder="Ej: Depósito Central Barracas"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "700" }}>Punto de Destino / Cliente</label>
              <input
                type="text"
                placeholder="Ej: Av. Santa Fe 2400, CABA"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "700" }}>Estrategia de Optimización (Patrón Strategy)</label>
              <select
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "white" }}
              >
                <option value="DISTANCIA_CORTA">Ruta Más Corta (Ahorro de Combustible)</option>
                <option value="TIEMPO_RAPIDO">Ruta Más Rápida (Menor Tiempo / Circunvalación)</option>
              </select>
            </div>

            <button
              type="button"
              className="button button--secondary"
              onClick={handleCalcularRuta}
              disabled={calculandoRuta}
              style={{ marginTop: "8px" }}
            >
              {calculandoRuta ? "Calculando con Strategy..." : "Calcular Ruta Óptima (SOA)"}
            </button>

            {ruteoError && <p className="message message--error" style={{ marginTop: "10px" }}>{ruteoError}</p>}

            {rutaResult && (
              <div style={{ marginTop: "12px", padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: "#166534" }}>{rutaResult.estrategiaAplicada}</strong>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: "#15803d" }}>{rutaResult.distanciaTotalKm} km</span>
                </div>
                <div style={{ fontSize: "13px", color: "#166534", marginTop: "6px" }}>
                  Tiempo estimado: {rutaResult.tiempoEstimadoMinutos} min · {rutaResult.mensaje}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de Pedido */}
        <form className="form-card" onSubmit={handleSubmit} style={{ maxWidth: "100%" }}>
          <label htmlFor="descripcion">
            Descripción del Pedido
            <input
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
              placeholder="Ej: Despacho de insumos urbanos"
              required
            />
          </label>

          <label htmlFor="total">
            Total ($)
            <input
              id="total"
              name="total"
              type="number"
              min="0.01"
              step="0.01"
              value={form.total}
              onChange={(event) => setForm({ ...form, total: event.target.value })}
              required
            />
          </label>

          {error && <p className="message message--error">{error}</p>}

          <div className="form-actions">
            <Link className="button button--secondary" to="/pedidos">
              Cancelar
            </Link>
            <button className="button button--primary" type="submit" disabled={saving}>
              {saving ? "Creando..." : "Crear pedido"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CrearPedido;