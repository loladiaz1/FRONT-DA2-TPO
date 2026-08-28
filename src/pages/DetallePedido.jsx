import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import { eliminarPedido, obtenerPedidoPorId } from "../services/pedidoService";
import { formatearPrecio } from "../utils/format";

function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { const cargar = async () => { try { const resultado = await obtenerPedidoPorId(id); if (!resultado) setNotFound(true); else setPedido(resultado); } catch { setError(true); } finally { setLoading(false); } }; cargar(); }, [id]);
  const borrar = async () => { setDeleting(true); try { await eliminarPedido(id); navigate("/pedidos"); } catch { setMessage("No se pudo eliminar el pedido."); setDeleting(false); setShowModal(false); } };
  return (
    <section><div className="page-heading"><div><h1>Detalle del pedido</h1><p>Consulta la informacion registrada.</p></div></div>{loading && <Loading message="Cargando pedido..." />}{error && <div className="message message--error">No pudimos cargar el pedido. Verifica que el servidor este funcionando.</div>}{!loading && !error && (notFound ? <div className="empty-state"><h2>Pedido no encontrado</h2><Link className="button button--primary" to="/pedidos">Volver a pedidos</Link></div> : <article className="detail-card"><div className="detail-card__header"><h2>Pedido #{pedido.id}</h2><StatusBadge estado={pedido.estado} /></div><dl><div><dt>Descripcion</dt><dd>{pedido.descripcion}</dd></div><div><dt>Estado</dt><dd>{pedido.estado}</dd></div><div><dt>Total</dt><dd className="detail-total">{formatearPrecio(pedido.total)}</dd></div></dl>{message && <p className="message message--error">{message}</p>}<div className="form-actions"><Link className="button button--secondary" to="/pedidos">Volver</Link><Link className="button button--outline" to={`/pedidos/${id}/editar`}>Editar</Link><button className="button button--danger" onClick={() => setShowModal(true)} disabled={deleting}>Eliminar</button></div></article>) }{showModal && <ConfirmModal pedidoId={id} onCancel={() => setShowModal(false)} onConfirm={borrar} loading={deleting} />}</section>
  );
}

export default DetallePedido