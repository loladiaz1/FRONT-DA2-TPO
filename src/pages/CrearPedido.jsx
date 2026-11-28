import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import MapaDeposito from "../components/MapaDeposito";
import { actualizarPedido, crearPedido, obtenerPedidoPorId } from "../services/pedidoService";
import { obtenerProductos } from "../services/catalogoService";
import { formatearPrecio } from "../utils/format";
import {
  DIRECCIONES_PREDEFINIDAS,
  buscarCoordenadasPorDireccion,
} from "../utils/direccionesPredefinidas";

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

  const handleDireccionChange = (nuevaDireccion) => {
    const match = buscarCoordenadasPorDireccion(nuevaDireccion);
    setForm((actual) => ({
      ...actual,
      direccionEntrega: nuevaDireccion,
      latitudEntrega: match ? match.latitud : actual.latitudEntrega,
      longitudEntrega: match ? match.longitud : actual.longitudEntrega,
    }));
    setError("");
  };

  const seleccionarDireccionRapida = (item) => {
    setForm((actual) => ({
      ...actual,
      direccionEntrega: item.direccionCompleta,
      latitudEntrega: item.latitud,
      longitudEntrega: item.longitud,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    let latitudEntrega = Number(form.latitudEntrega);
    let longitudEntrega = Number(form.longitudEntrega);

    // Si aún no se marcaron las coordenadas, intentar resolverlas por catálogo
    if (form.latitudEntrega === "" || form.longitudEntrega === "") {
      const match = buscarCoordenadasPorDireccion(form.direccionEntrega);
      if (match) {
        latitudEntrega = match.latitud;
        longitudEntrega = match.longitud;
        setForm((actual) => ({
          ...actual,
          latitudEntrega: match.latitud,
          longitudEntrega: match.longitud,
        }));
      }
    }

    if (form.latitudEntrega === "" && !Number.isFinite(latitudEntrega)
        || !Number.isFinite(latitudEntrega) || latitudEntrega < -90 || latitudEntrega > 90
        || !Number.isFinite(longitudEntrega) || longitudEntrega < -180 || longitudEntrega > 180) {
      setError("Seleccioná en el mapa o en las sugerencias el punto de entrega antes de confirmar el pedido.");
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
              list="direcciones-sugeridas"
              value={form.direccionEntrega}
              onChange={(event) => handleDireccionChange(event.target.value)}
              placeholder="Ej: Av. Federico Lacroze 3496, Colegiales"
              autoComplete="street-address"
              required
            />
            <datalist id="direcciones-sugeridas">
              {DIRECCIONES_PREDEFINIDAS.map((item) => (
                <option key={item.id} value={item.direccionCompleta}>
                  {item.barrio} ({item.latitud}, {item.longitud})
                </option>
              ))}
            </datalist>
            <span className="field-hint">
              Escribí la dirección (se autocompleta con las 10 ubicaciones de CABA) o elegí un punto en el mapa.
            </span>
          </label>

          <div style={{ margin: "4px 0 16px 0" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              📍 Direcciones frecuentes de entrega (clic para autocompletar):
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {DIRECCIONES_PREDEFINIDAS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="button button--secondary"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                  onClick={() => seleccionarDireccionRapida(item)}
                >
                  {item.direccion} ({item.barrio})
                </button>
              ))}
            </div>
          </div>

          <section className="section">
            <div className="section-header"><h2>Ubicación y recorrido de entrega</h2></div>
            <MapaDeposito
              direccionEntrega={form.direccionEntrega}
              latitudEntrega={form.latitudEntrega}
              longitudEntrega={form.longitudEntrega}
              onSeleccionarEntrega={seleccionarEntrega}
            />
            <p className="field-hint" style={{ marginTop: "6px" }}>
              {form.latitudEntrega !== "" && form.longitudEntrega !== ""
                ? `Punto seleccionado: ${Number(form.latitudEntrega).toFixed(5)}, ${Number(form.longitudEntrega).toFixed(5)}`
                : "Hacé clic en el mapa o seleccioná una dirección arriba para marcar la entrega."}
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
