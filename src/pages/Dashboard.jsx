import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import Loading from "../components/Loading";
import PedidoCard from "../components/PedidoCard";
import StatCard from "../components/StatCard";
import { eliminarPedido, obtenerPedidos } from "../services/pedidoService";

function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const cargarPedidos = async () => {
    setLoading(true);
    setError(false);
    try { setPedidos(await obtenerPedidos()); } catch { setError(true); } finally { setLoading(false); }
  };

  useEffect(() => { let activo = true; obtenerPedidos().then((data) => { if (activo) setPedidos(data); }).catch(() => { if (activo) setError(true); }).finally(() => { if (activo) setLoading(false); }); return () => { activo = false; }; }, []);
  const confirmarEliminacion = async () => { setDeleting(true); try { await eliminarPedido(pedidoAEliminar.id); setPedidos((actuales) => actuales.filter((pedido) => pedido.id !== pedidoAEliminar.id)); setPedidoAEliminar(null); } catch { setError(true); } finally { setDeleting(false); } };

  return (
    <section>
      <div className="page-heading"><div><h1>Dashboard</h1><p>Resumen de operaciones de LogiRed</p></div><Link className="button button--primary" to="/pedidos/nuevo">+ Nuevo pedido</Link></div>
      {loading && <Loading message="Cargando pedidos..." />}
      {error && <div className="message message--error">No pudimos cargar los pedidos.<br />Verifica que el servidor este funcionando.<br /><button className="button button--secondary" onClick={cargarPedidos}>Reintentar</button></div>}
      {!loading && !error && <>
        <div className="stats"><StatCard label="Total de pedidos" value={pedidos.length} /><StatCard label="Pedidos creados" value={pedidos.filter((pedido) => pedido.estado === "CREADO").length} /><StatCard label="Entregados" value={pedidos.filter((pedido) => pedido.estado === "ENTREGADO").length} /></div>
        <section className="section"><div className="section-header"><h2>Pedidos recientes</h2><Link to="/pedidos">Ver todos</Link></div><div className="pedido-list">{pedidos.slice(-5).reverse().map((pedido) => <PedidoCard key={pedido.id} pedido={pedido} onDelete={setPedidoAEliminar} />)}</div>{pedidos.length === 0 && <p className="empty-state">Todavia no hay pedidos registrados.</p>}</section>
      </>}
      {pedidoAEliminar && <ConfirmModal pedidoId={pedidoAEliminar.id} onCancel={() => setPedidoAEliminar(null)} onConfirm={confirmarEliminacion} loading={deleting} />}
    </section>
  );
}

export default Dashboard