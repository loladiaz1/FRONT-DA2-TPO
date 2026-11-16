import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { obtenerProductoPorId } from "../services/catalogoService";
import { formatearPrecio } from "../utils/format";

function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    obtenerProductoPorId(id)
      .then((data) => { if (active) setProducto(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <Loading message="Cargando producto..." />;
  if (error) return <div className="message message--error">{error}<p><Link to="/catalogo">Volver al catálogo</Link></p></div>;
  if (!producto) return <div className="empty-state"><h2>Producto no encontrado</h2><Link to="/catalogo">Volver al catálogo</Link></div>;

  const vendedor = typeof producto.vendedor === "string"
    ? producto.vendedor
    : producto.vendedor?.nombre || producto.vendedor?.razonSocial || "—";

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>{producto.nombre}</h1>
          <p>{producto.sku} · {producto.categoria || "Sin categoría"}</p>
        </div>
        <Link className="button button--secondary" to="/catalogo">Volver al catálogo</Link>
      </div>
      <article className="detail-card product-detail">
        <p>{producto.descripcion || "Sin descripción disponible."}</p>
        <dl>
          <div><dt>Vendedor</dt><dd>{vendedor}</dd></div>
          <div><dt>Precio</dt><dd>{formatearPrecio(producto.precio, producto.moneda)}</dd></div>
          <div><dt>Stock disponible total</dt><dd>{producto.stockDisponible}</dd></div>
          <div><dt>Stock bloqueado total</dt><dd>{producto.stockBloqueado}</dd></div>
        </dl>
        <section className="section">
          <div className="section-header"><h2>Stock por depósito</h2></div>
          {producto.stockPorDeposito?.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Depósito</th><th>Disponible</th><th>Bloqueado</th></tr></thead>
                <tbody>
                  {producto.stockPorDeposito.map((stock, index) => (
                    <tr key={`${stock.deposito}-${index}`}>
                      <td>{typeof stock.deposito === "string" ? stock.deposito : stock.deposito?.nombre}</td>
                      <td>{stock.disponible}</td>
                      <td>{stock.bloqueado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-state">No hay datos de stock por depósito.</p>}
        </section>
      </article>
    </section>
  );
}

export default DetalleProducto;
