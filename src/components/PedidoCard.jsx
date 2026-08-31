import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatearPrecio } from "../utils/format";

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-AR");
}

function PedidoCard({ pedido, onDelete }) {
  return (
    <article className="pedido-card">

      <div className="pedido-card__header">

        <div>
          <h3>Pedido #{pedido.id}</h3>

          <p>
            {pedido.descripcion}
          </p>
        </div>

        <StatusBadge estado={pedido.estado} />

      </div>

      <div className="pedido-card__info">

        <div>
          <span>Cliente</span>
          <strong>
            {pedido.nombreCliente || "No especificado"}
          </strong>
        </div>

        <div>
          <span>Origen</span>
          <strong>
            {pedido.direccionOrigen || "No especificado"}
          </strong>
        </div>

        <div>
          <span>Destino</span>
          <strong>
            {pedido.direccionDestino || "No especificado"}
          </strong>
        </div>

        <div>
          <span>Entrega</span>
          <strong>
            {formatearFecha(pedido.fechaEntrega)}
          </strong>
        </div>

        <div>
          <span>Total</span>
          <strong>
            {formatearPrecio(pedido.total)}
          </strong>
        </div>

      </div>

      <div className="pedido-card__actions">

        <Link
          className="button button--outline"
          to={`/pedidos/${pedido.id}`}
        >
          Ver detalle
        </Link>

        <Link
          className="button button--secondary"
          to={`/pedidos/${pedido.id}/editar`}
        >
          Editar
        </Link>

        {onDelete && (
          <button
            className="button button--danger"
            onClick={() => onDelete(pedido)}
          >
            Eliminar
          </button>
        )}

      </div>

    </article>
  );
}

export default PedidoCard;