import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import MapaDeposito from "../components/MapaDeposito";
import { actualizarPedido, crearPedido, obtenerPedidoPorId } from "../services/pedidoService";
import { obtenerProductos } from "../services/catalogoService";
import { formatearPrecio } from "../utils/format";

const nombreProducto = (producto) => producto.nombre || producto.sku;

function CrearPedido() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [form, setForm] = useState({
    clienteNombre: "",
    direccionEntrega: "",
    latitudEntrega: "",
    longitudEntrega: "",
  });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    obtenerProductos()
      .then((data) => {
        if (!active) return;
        setProductos(data);
        if (isEditing) {
          return obtenerPedidoPorId(id);
        }
        return null;
      })
      .then((pedido) => {
        if (!active || !pedido || !isEditing) return;
        setForm({
          clienteNombre: pedido.clienteNombre || "",
          direccionEntrega: pedido.direccionEntrega || "",
          latitudEntrega: pedido.latitudEntrega ?? "",
          longitudEntrega: pedido.longitudEntrega ?? "",
        });
        const itemsActuales = pedido.items || [];
        const cantidadesReservadas = new Map();
        itemsActuales.forEach((item) => {
          const itemId = item.productoId ?? item.producto?.id;
          if (itemId != null) {
            const key = String(itemId);
            cantidadesReservadas.set(key, (cantidadesReservadas.get(key) || 0) + (Number(item.cantidad) || 0));
          }
        });
        setLineas(itemsActuales.map((item) => ({
          productoId: item.productoId ?? item.producto?.id,
          cantidad: Number(item.cantidad) || 1,
        })));
        setProductos((actuales) => {
          const porId = new Map(actuales.map((producto) => [String(producto.id), producto]));
          itemsActuales.forEach((item) => {
            const producto = item.producto;
            const itemId = item.productoId ?? producto?.id;
            if (itemId == null) return;
            const key = String(itemId);
            const disponible = Number(porId.get(key)?.stockDisponible) || 0;
            const datosProducto = porId.get(key) || producto;
            if (datosProducto) {
              porId.set(key, {
                ...datosProducto,
                stockDisponible: disponible + (cantidadesReservadas.get(key) || 0),
              });
            }
          });
          return [...porId.values()];
        });
      })
      .catch((requestError) => {
        if (active) setError(`No se pudo cargar el pedido o el catálogo. ${requestError.message}`);
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => { active = false; };
  }, [id, isEditing]);

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

  const seleccionarEntrega = ({ latitud, longitud }) => {
    setForm((actual) => ({
      ...actual,
      latitudEntrega: latitud,
      longitudEntrega: longitud,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const latitudEntrega = Number(form.latitudEntrega);
    const longitudEntrega = Number(form.longitudEntrega);
    if (form.latitudEntrega === "" || form.longitudEntrega === ""
        || !Number.isFinite(latitudEntrega) || latitudEntrega < -90 || latitudEntrega > 90
        || !Number.isFinite(longitudEntrega) || longitudEntrega < -180 || longitudEntrega > 180) {
      setError("Seleccioná en el mapa el punto de entrega antes de confirmar el pedido.");
      return;
    }
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
      const payload = {
        clienteNombre: form.clienteNombre.trim(),
        direccionEntrega: form.direccionEntrega.trim(),
        latitudEntrega,
        longitudEntrega,
        items: lineas.map(({ productoId: itemId, cantidad }) => ({ productoId: itemId, cantidad })),
      };
      const pedido = isEditing
        ? await actualizarPedido(id, payload)
        : await crearPedido(payload);
      navigate(`/pedidos/${pedido.id || id}`);
    } catch (requestError) {
      setError(`No se pudo ${isEditing ? "guardar" : "crear"} el pedido. ${requestError.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>{isEditing ? "Editar pedido" : "Crear pedido"}</h1>
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
              onChange={(event) => setForm((actual) => ({
                ...actual,
                direccionEntrega: event.target.value,
                latitudEntrega: "",
                longitudEntrega: "",
              }))}
              placeholder="Calle, altura, localidad"
              autoComplete="street-address"
              required
            />
            <span className="field-hint">La dirección se guarda como texto. Elegí el punto de entrega en el mapa para trazar el recorrido.</span>
          </label>

          <section className="section">
            <div className="section-header"><h2>Ubicación de entrega</h2></div>
            <MapaDeposito
              direccionEntrega={form.direccionEntrega}
              latitudEntrega={form.latitudEntrega}
              longitudEntrega={form.longitudEntrega}
              onSeleccionarEntrega={seleccionarEntrega}
              privado
            />
            <p className="field-hint">
              {form.latitudEntrega !== "" && form.longitudEntrega !== ""
                ? `Punto seleccionado: ${Number(form.latitudEntrega).toFixed(5)}, ${Number(form.longitudEntrega).toFixed(5)}`
                : "Todavía no seleccionaste un punto de entrega."}
            </p>
          </section>

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
              {saving ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar cambios" : "Confirmar pedido")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default CrearPedido;
