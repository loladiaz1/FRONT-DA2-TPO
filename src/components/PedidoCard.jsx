import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatearPrecio } from "../utils/format";
import { useAuth } from "../context/AuthContext";

function PedidoCard({ pedido, onDelete }) {
  const { id, descripcion, estado, total } = pedido;
  const { user } = useAuth();
  const isAdmin = user?.rol === "ADMIN";

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
        {isAdmin ? (
          <button className="button button--danger-link" type="button" onClick={() => onDelete(pedido)}>
            Eliminar
          </button>
        ) : (
          <span
            style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "4px 0" }}
            title="Operación reservada para administradores"
          >
            Eliminar (Solo Admin)
          </span>
        )}
      </div>
    </article>
  );
}

export default PedidoCard