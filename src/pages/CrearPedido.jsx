import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { crearPedido } from "../services/pedidoService";
import { obtenerProductos } from "../services/catalogoService";
import { formatearPrecio } from "../utils/format";

const nombreProducto = (producto) => producto.nombre || producto.sku;

function CrearPedido() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [form, setForm] = useState({ clienteNombre: "", direccionEntrega: "" });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    obtenerProductos()
      .then((data) => {
        if (active) setProductos(data);
      })
      .catch((requestError) => {
        if (active) setError(`No se pudo cargar el catálogo. ${requestError.message}`);
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => { active = false; };
  }, []);

  const totalEstimado = useMemo(() => lineas.reduce((total, linea) => {
    const producto = productos.find((item) => String(item.id) === String(linea.productoId));
    return total + (Number(producto?.precio) || 0) * linea.cantidad;
  }, 0), [lineas, productos]);

  const agregarProducto = () => {
    if (!productoId) return;
    setLineas((current) => {
      const existing = current.find((linea) => String(linea.productoId) === productoId);
      if (existing) {
        return current.map((linea) => String(linea.productoId) === productoId
          ? { ...linea, cantidad: linea.cantidad + 1 }
          : linea);
      }
      return [...current, { productoId: Number(productoId), cantidad: 1 }];
    });
    setError("");
  };

  const actualizarCantidad = (id, cantidad) => {
    const value = Number(cantidad);
    if (!Number.isInteger(value) || value < 1) return;
    setLineas((current) => current.map((linea) => String(linea.productoId) === String(id)
      ? { ...linea, cantidad: value }
      : linea));
  };

  const quitarProducto = (id) => {
    setLineas((current) => current.filter((linea) => String(linea.productoId) !== String(id)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (lineas.length === 0) {
      setError("Agregá al menos un producto al pedido.");
      return;
    }

    const stockInsuficiente = lineas.some((linea) => {
      const producto = productos.find((item) => String(item.id) === String(linea.productoId));
      return !producto || linea.cantidad > Number(producto.stockDisponible);
    });
    if (stockInsuficiente) {
      setError("La cantidad solicitada supera el stock disponible. Actualizá el catálogo e intentá nuevamente.");
      return;
    }

    setSaving(true);
    try {
      const pedido = await crearPedido({
        clienteNombre: form.clienteNombre.trim(),
        direccionEntrega: form.direccionEntrega.trim(),
        items: lineas.map(({ productoId: id, cantidad }) => ({ productoId: id, cantidad })),
      });
      navigate(`/pedidos/${pedido.id}`);
    } catch (requestError) {
      setError(`No se pudo crear el pedido. ${requestError.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Crear pedido</h1>
          <p>Seleccioná productos del catálogo; el backend calcula el total y reserva el stock.</p>
        </div>
      </div>

      {loadingProducts ? <Loading message="Cargando catálogo..." /> : (
        <form className="form-card" onSubmit={handleSubmit}>
          <label htmlFor="clienteNombre">
            Nombre del cliente
            <input
              id="clienteNombre"
              value={form.clienteNombre}
              onChange={(event) => setForm({ ...form, clienteNombre: event.target.value })}
              autoComplete="name"
              required
            />
          </label>

          <label htmlFor="direccionEntrega">
            Dirección de entrega
            <input
              id="direccionEntrega"
              value={form.direccionEntrega}
              onChange={(event) => setForm({ ...form, direccionEntrega: event.target.value })}
              placeholder="Calle, altura, localidad"
              autoComplete="street-address"
              required
            />
            <span className="field-hint">Se guarda como texto; el backend no proporciona coordenadas de entrega.</span>
          </label>

          <div className="add-product">
            <label htmlFor="productoPedido">
              Producto
              <select
                id="productoPedido"
                value={productoId}
                onChange={(event) => setProductoId(event.target.value)}
                disabled={productos.length === 0}
              >
                <option value="">Seleccioná un producto</option>
                {productos.map((producto) => (
                  <option
                    key={producto.id}
                    value={producto.id}
                    disabled={Number(producto.stockDisponible) <= 0}
                  >
                    {producto.sku} · {nombreProducto(producto)} · Stock: {producto.stockDisponible}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="button button--secondary" onClick={agregarProducto} disabled={!productoId}>
              Agregar producto
            </button>
          </div>

          {lineas.length > 0 && (
            <div className="order-lines">
              <h2>Productos del pedido</h2>
              {lineas.map((linea) => {
                const producto = productos.find((item) => String(item.id) === String(linea.productoId));
                if (!producto) return null;
                const stock = Number(producto.stockDisponible) || 0;
                const excedeStock = linea.cantidad > stock;
                return (
                  <div className="order-line" key={linea.productoId}>
                    <div>
                      <strong>{nombreProducto(producto)}</strong>
                      <span>{producto.sku} · {formatearPrecio(producto.precio, producto.moneda)} c/u · Stock: {stock}</span>
                    </div>
                    <label className="order-line__quantity" htmlFor={`cantidad-${producto.id}`}>
                      Cantidad
                      <input
                        id={`cantidad-${producto.id}`}
                        type="number"
                        min="1"
                        value={linea.cantidad}
                        onChange={(event) => actualizarCantidad(producto.id, event.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="button button--danger-link"
                      onClick={() => quitarProducto(producto.id)}
                      aria-label={`Quitar ${nombreProducto(producto)}`}
                    >
                      Quitar
                    </button>
                    {excedeStock && <span className="field-hint field-hint--error">Stock insuficiente.</span>}
                  </div>
                );
              })}
              <p className="order-estimate">
                Estimación informativa: <strong>{formatearPrecio(totalEstimado)}</strong>
                <span>El total definitivo lo calcula el backend.</span>
              </p>
            </div>
          )}

          <p className="order-preview">
            Al confirmar, el backend valida el stock y lo reserva como parte del checkout. No reserves stock manualmente antes.
          </p>
          {error && <p className="message message--error">{error}</p>}

          <div className="form-actions">
            <Link className="button button--secondary" to="/pedidos">Cancelar</Link>
            <button className="button button--primary" type="submit" disabled={saving || loadingProducts}>
              {saving ? "Creando..." : "Confirmar pedido"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default CrearPedido;
