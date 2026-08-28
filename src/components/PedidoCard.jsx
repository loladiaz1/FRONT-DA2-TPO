import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatearPrecio } from "../utils/format";

function PedidoCard({ pedido, onDelete }) {
  const { id, descripcion, estado, total } = pedido;

  return (
    <article className="pedido-card">
      <div className="pedido-card__header">
        <span>Pedido #{id}</span>
        <StatusBadge estado={estado} />
      </div>
      <h3>{descripcion}</h3>
      <p className="pedido-card__total">{formatearPrecio(total)}</p>
      <div className="pedido-card__actions">
        <Link className="button button--secondary" to={`/pedidos/${id}`}>Ver detalle</Link>
        <Link className="button button--outline" to={`/pedidos/${id}/editar`}>Editar</Link>
        <button className="button button--danger-link" type="button" onClick={() => onDelete(pedido)}>Eliminar</button>
      </div>
    </article>
  );
}

export default PedidoCard