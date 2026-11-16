import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatearPrecio } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { canDeleteRecords } from "../services/authService";

const nombreDeposito = (deposito) => (
  typeof deposito === "string" ? deposito : deposito?.nombre || "—"
);

function PedidoCard({ pedido, onDelete }) {
  const { user } = useAuth();
  const canDelete = canDeleteRecords(user);

  return (
    <article className="pedido-card">
      <div className="pedido-card__header">
        <span>Pedido #{pedido.id}</span>
        <StatusBadge estado={pedido.estado} />
      </div>
      <dl className="pedido-card__metadata">
        <div><dt>Cliente</dt><dd>{pedido.clienteNombre || "—"}</dd></div>
        <div><dt>Entrega</dt><dd>{pedido.direccionEntrega || "—"}</dd></div>
        <div><dt>Depósito</dt><dd>{nombreDeposito(pedido.deposito)}</dd></div>
        <div><dt>Productos</dt><dd>{pedido.items?.length || 0}</dd></div>
      </dl>
      <p className="pedido-card__total">{formatearPrecio(pedido.total)}</p>
      <div className="pedido-card__actions">
        <Link className="button button--secondary" to={`/pedidos/${pedido.id}`}>Ver detalle</Link>
        <Link className="button button--secondary" to={`/pedidos/${pedido.id}/editar`}>Editar</Link>
        {canDelete && (
          <button className="button button--danger-link" type="button" onClick={() => onDelete(pedido)}>
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
}

export default PedidoCard;
