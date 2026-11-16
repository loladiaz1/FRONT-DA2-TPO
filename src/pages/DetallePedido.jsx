import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Loading from "../components/Loading";
import MapaDeposito from "../components/MapaDeposito";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { canDeleteRecords } from "../services/authService";
import { eliminarPedido, obtenerPedidoPorId } from "../services/pedidoService";
import { formatearPrecio } from "../utils/format";

const nombreProducto = (producto) => (
  typeof producto === "string" ? producto : producto?.nombre || producto?.sku || "Producto"
);
const nombreDeposito = (deposito) => (
  typeof deposito === "string" ? deposito : deposito?.nombre || "—"
);

function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    obtenerPedidoPorId(id)
      .then((result) => {
        if (!active) return;
        if (!result) setNotFound(true);
        else setPedido(result);
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const borrar = async () => {
    setDeleting(true);
    setMessage("");
    try {
      await eliminarPedido(id);
      navigate("/pedidos");
    } catch (requestError) {
      setMessage(`No se pudo eliminar el pedido. ${requestError.message}`);
      setDeleting(false);
      setShowModal(false);
    }
  };

  if (loading) return <Loading message="Cargando pedido..." />;
  if (error) return <div className="message message--error">{error}<p><Link to="/pedidos">Volver a pedidos</Link></p></div>;
  if (notFound || !pedido) {
    return <div className="empty-state"><h2>Pedido no encontrado</h2><Link className="button button--primary" to="/pedidos">Volver a pedidos</Link></div>;
  }

  const canDelete = canDeleteRecords(user);

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Pedido #{pedido.id}</h1>
          <p>Detalle del despacho y de los productos solicitados.</p>
        </div>
        <StatusBadge estado={pedido.estado} />
      </div>
      {message && <p className="message message--error">{message}</p>}
      <article className="detail-card order-detail">
        <dl>
          <div><dt>Estado</dt><dd><StatusBadge estado={pedido.estado} /></dd></div>
          <div><dt>Cliente</dt><dd>{pedido.clienteNombre || "—"}</dd></div>
          <div><dt>Dirección de entrega</dt><dd>{pedido.direccionEntrega || "—"}</dd></div>
          <div><dt>Depósito de despacho</dt><dd>{nombreDeposito(pedido.deposito)}</dd></div>
          <div><dt>Total</dt><dd className="detail-total">{formatearPrecio(pedido.total)}</dd></div>
        </dl>

        <section className="section">
          <div className="section-header"><h2>Productos</h2></div>
          {pedido.items?.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th><th>Depósito</th></tr></thead>
                <tbody>
                  {pedido.items.map((item, index) => (
                    <tr key={`${item.producto?.id || item.productoId || index}`}>
                      <td>{nombreProducto(item.producto)}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatearPrecio(item.precioUnitario)}</td>
                      <td>{formatearPrecio(item.subtotal)}</td>
                      <td>{nombreDeposito(item.deposito)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-state">El pedido no contiene líneas.</p>}
        </section>

        <section className="section">
          <div className="section-header"><h2>Ubicación del depósito</h2></div>
          <MapaDeposito depositoPedido={pedido.deposito} />
          {pedido.mapaEntregaUrl && (
            <p>
              <a href={pedido.mapaEntregaUrl} target="_blank" rel="noreferrer">
                Buscar dirección de entrega en OpenStreetMap
              </a>
            </p>
          )}
          <p className="field-hint">Ubicación geográfica del depósito logístico sobre OpenStreetMap.</p>
        </section>

        <div className="form-actions">
          <Link className="button button--secondary" to="/pedidos">Volver</Link>
          <Link className="button button--secondary" to={`/pedidos/${id}/editar`}>Editar pedido</Link>
          {canDelete && (
            <button className="button button--danger" type="button" onClick={() => setShowModal(true)} disabled={deleting}>
              Eliminar pedido
            </button>
          )}
        </div>
      </article>
      {showModal && <ConfirmModal pedidoId={id} onCancel={() => setShowModal(false)} onConfirm={borrar} loading={deleting} />}
    </section>
  );
}

export default DetallePedido;
