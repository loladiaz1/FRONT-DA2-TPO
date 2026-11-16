import { useState } from "react";
import { optimizarRuta } from "../services/ruteoService";

function Ruteo() {
  const [direcciones, setDirecciones] = useState("");
  const [criterio, setCriterio] = useState("DISTANCIA_CORTA");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calcular = async (event) => {
    event.preventDefault();
    const paradas = direcciones.split("\n").map((direccion) => direccion.trim()).filter(Boolean);
    if (paradas.length < 2) {
      setError("Ingresá al menos dos direcciones, una por línea.");
      return;
    }
    setLoading(true);
    setError("");
    setResultado(null);
    try {
      setResultado(await optimizarRuta(paradas, criterio));
    } catch (requestError) {
      setError(`No se pudo optimizar la ruta. ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Optimización de ruta</h1>
          <p>Compará el orden de las paradas según distancia o tiempo estimado.</p>
        </div>
      </div>
      <form className="form-card route-form" onSubmit={calcular}>
        <label htmlFor="direcciones">
          Direcciones (una por línea)
          <textarea
            id="direcciones"
            rows="5"
            value={direcciones}
            onChange={(event) => setDirecciones(event.target.value)}
            placeholder={"Av. Corrientes 1234, CABA\nAv. Santa Fe 2400, CABA"}
            required
          />
        </label>
        <label htmlFor="criterio">
          Criterio
          <select id="criterio" value={criterio} onChange={(event) => setCriterio(event.target.value)}>
            <option value="DISTANCIA_CORTA">Distancia más corta</option>
            <option value="TIEMPO_RAPIDO">Tiempo más rápido</option>
          </select>
        </label>
        {error && <p className="message message--error">{error}</p>}
        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? "Calculando..." : "Optimizar paradas"}
        </button>
      </form>

      {resultado && (
        <section className="section route-result">
          <div className="section-header"><h2>Resultado</h2><span>{resultado.estrategiaAplicada}</span></div>
          <dl className="product-card__details">
            <div><dt>Distancia estimada</dt><dd>{resultado.distanciaTotalKm} km</dd></div>
            <div><dt>Tiempo estimado</dt><dd>{resultado.tiempoEstimadoMinutos} min</dd></div>
          </dl>
          {resultado.paradasOrdenadas && (
            <ol className="route-stops">
              {resultado.paradasOrdenadas.map((parada, index) => (
                <li key={`${parada}-${index}`}>{typeof parada === "string" ? parada : parada.direccion || JSON.stringify(parada)}</li>
              ))}
            </ol>
          )}
          {resultado.mensaje && <p>{resultado.mensaje}</p>}
          <p className="field-hint">Estimación del servicio; no representa navegación vial ni contempla tráfico en tiempo real.</p>
        </section>
      )}
    </section>
  );
}

export default Ruteo;
