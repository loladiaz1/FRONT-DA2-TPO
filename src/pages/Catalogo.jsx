import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import { obtenerProductos } from "../services/catalogoService";
import { formatearPrecio } from "../utils/format";

const nombreVendedor = (vendedor) => (
  typeof vendedor === "string" ? vendedor : vendedor?.nombre || vendedor?.razonSocial || "—"
);

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProductos(await obtenerProductos());
    } catch (requestError) {
      setError(`No se pudo cargar el catálogo. ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(cargarProductos, 0);
    return () => window.clearTimeout(timer);
  }, [cargarProductos]);

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Catálogo</h1>
          <p>Productos, vendedores, precios y disponibilidad informados por el backend.</p>
        </div>
      </div>
      {loading && <Loading message="Cargando productos..." />}
      {error && <div className="message message--error">{error}<button className="button button--secondary" onClick={cargarProductos}>Reintentar</button></div>}
      {!loading && !error && (
        <div className="catalog-grid">
          {productos.map((producto) => (
            <article className="product-card" key={producto.id}>
              <div className="product-card__heading">
                <span>{producto.categoria || "Producto"}</span>
                <span className="product-card__sku">{producto.sku}</span>
              </div>
              <h2>{producto.nombre}</h2>
              <p>{producto.descripcion || "Sin descripción disponible."}</p>
              <dl className="product-card__details">
                <div><dt>Vendedor</dt><dd>{nombreVendedor(producto.vendedor)}</dd></div>
                <div><dt>Precio</dt><dd>{formatearPrecio(producto.precio, producto.moneda)}</dd></div>
                <div><dt>Stock disponible</dt><dd>{producto.stockDisponible}</dd></div>
                <div><dt>Stock bloqueado</dt><dd>{producto.stockBloqueado}</dd></div>
              </dl>
              <Link className="button button--secondary" to={`/catalogo/${producto.id}`}>Ver detalle</Link>
            </article>
          ))}
          {productos.length === 0 && <p className="empty-state">No hay productos disponibles.</p>}
        </div>
      )}
    </section>
  );
}

export default Catalogo;
