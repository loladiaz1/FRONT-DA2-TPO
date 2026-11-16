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
  const [error, setError] = useState("");
  const cargarPedidos = async () => { setLoading(true); setError(""); try { setPedidos(await obtenerPedidos()); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } };
  useEffect(() => {
    let activo = true;
    const actualizar = () => obtenerPedidos()
      .then((data) => { if (activo) { setPedidos(data); setError(""); } })
      .catch((requestError) => { if (activo) setError(requestError.message); })
      .finally(() => { if (activo) setLoading(false); });
    actualizar();
    const intervalo = window.setInterval(actualizar, 15000);
    return () => { activo = false; window.clearInterval(intervalo); };
  }, []);
  const confirmarEliminacion = async () => { setDeleting(true); try { await eliminarPedido(pedidoAEliminar.id); setPedidos((actuales) => actuales.filter((pedido) => pedido.id !== pedidoAEliminar.id)); setMessage("Pedido eliminado correctamente."); setPedidoAEliminar(null); } catch (requestError) { setMessage(`No se pudo eliminar el pedido. ${requestError.message}`); } finally { setDeleting(false); } };

  return (
    <section>
      <div className="page-heading">
        <div><h1>Pedidos</h1><p>Consulta pedidos, estados y detalles de despacho.</p></div>
        <Link className="button button--primary" to="/pedidos/nuevo">+ Nuevo pedido</Link>
      </div>
      {message && <div className="message">{message}</div>}
      {loading && <Loading message="Cargando pedidos..." />}
      {error && (
        <div className="message message--error">
          No se pudieron cargar los pedidos. {error}
          <br />
          <button className="button button--secondary" onClick={cargarPedidos}>Reintentar</button>
        </div>
      )}
      {!loading && !error && (
        <div className="pedido-list">
          {pedidos.map((pedido) => <PedidoCard key={pedido.id} pedido={pedido} onDelete={setPedidoAEliminar} />)}
          {pedidos.length === 0 && <p className="empty-state">Todavía no hay pedidos registrados.</p>}
        </div>
      )}
      {pedidoAEliminar && <ConfirmModal pedidoId={pedidoAEliminar.id} onCancel={() => setPedidoAEliminar(null)} onConfirm={confirmarEliminacion} loading={deleting} />}
    </section>
  );
}

export default Pedidos