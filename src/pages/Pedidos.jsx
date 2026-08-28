import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Loading from "../components/Loading";
import PedidoCard from "../components/PedidoCard";
import { eliminarPedido, obtenerPedidos } from "../services/pedidoService";

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const cargarPedidos = async () => { setLoading(true); setError(false); try { setPedidos(await obtenerPedidos()); } catch { setError(true); } finally { setLoading(false); } };
  useEffect(() => { let activo = true; obtenerPedidos().then((data) => { if (activo) setPedidos(data); }).catch(() => { if (activo) setError(true); }).finally(() => { if (activo) setLoading(false); }); return () => { activo = false; }; }, []);
  const confirmarEliminacion = async () => { setDeleting(true); try { await eliminarPedido(pedidoAEliminar.id); setPedidos((actuales) => actuales.filter((pedido) => pedido.id !== pedidoAEliminar.id)); setMessage("Pedido eliminado correctamente."); setPedidoAEliminar(null); } catch { setMessage("No se pudo eliminar el pedido."); } finally { setDeleting(false); } };

  return (
    <section><div className="page-heading"><div><h1>Pedidos</h1><p>Gestiona todos los pedidos de LogiRed</p></div><Link className="button button--primary" to="/pedidos/nuevo">+ Nuevo pedido</Link></div>{message && <div className="message">{message}</div>}{loading && <Loading message="Cargando pedidos..." />}{error && <div className="message message--error">No pudimos cargar los pedidos.<br />Verifica que el servidor este funcionando.<br /><button className="button button--secondary" onClick={cargarPedidos}>Reintentar</button></div>}{!loading && !error && <div className="pedido-list">{pedidos.map((pedido) => <PedidoCard key={pedido.id} pedido={pedido} onDelete={setPedidoAEliminar} />)}{pedidos.length === 0 && <p className="empty-state">Todavia no hay pedidos registrados.</p>}</div>}{pedidoAEliminar && <ConfirmModal pedidoId={pedidoAEliminar.id} onCancel={() => setPedidoAEliminar(null)} onConfirm={confirmarEliminacion} loading={deleting} />}</section>
  );
}

export default Pedidos