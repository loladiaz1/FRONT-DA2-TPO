import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ConfirmModal from "../components/ConfirmModal";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";

import {
  eliminarPedido,
  obtenerPedidoPorId,
} from "../services/pedidoService";

import { formatearPrecio } from "../utils/format";

function formatearFecha(fecha) {
  if (!fecha) return "No especificada";

  return new Date(fecha).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

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

  useEffect(() => {
    const cargar = async () => {
      try {
        const resultado = await obtenerPedidoPorId(id);

        if (!resultado) {
          setNotFound(true);
        } else {
          setPedido(resultado);
        }
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  const borrar = async () => {
    setDeleting(true);

    try {
      await eliminarPedido(id);
      navigate("/pedidos");
    } catch (error) {
      console.error(error);
      setMessage("No se pudo eliminar el pedido.");
      setDeleting(false);
      setShowModal(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando pedido..." />;
  }

  if (error) {
    return (
      <div className="message message--error">
        No pudimos cargar el pedido.
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="empty-state">
        <h2>Pedido no encontrado</h2>

        <Link
          className="button button--primary"
          to="/pedidos"
        >
          Volver a pedidos
        </Link>
      </div>
    );
  }

  return (
    <section>

      <div className="page-heading">
        <div>
          <h1>Pedido #{pedido.id}</h1>
          <p>Información completa del pedido.</p>
        </div>

        <StatusBadge estado={pedido.estado} />
      </div>

      <article className="detail-card">

        <div className="detail-section">
          <h2>Información del pedido</h2>

          <div className="detail-grid">

            <div>
              <dt>Descripción</dt>
              <dd>{pedido.descripcion}</dd>
            </div>

            <div>
              <dt>Estado</dt>
              <dd>{pedido.estado}</dd>
            </div>

            <div>
              <dt>Total</dt>
              <dd className="detail-total">
                {formatearPrecio(pedido.total)}
              </dd>
            </div>

            <div>
              <dt>Fecha de creación</dt>
              <dd>
                {formatearFecha(pedido.fechaCreacion)}
              </dd>
            </div>

            <div>
              <dt>Fecha de entrega</dt>
              <dd>
                {formatearFecha(pedido.fechaEntrega)}
              </dd>
            </div>

          </div>
        </div>

        <div className="detail-section">
          <h2>Cliente</h2>

          <div className="detail-grid">

            <div>
              <dt>Nombre</dt>
              <dd>{pedido.nombreCliente || "No especificado"}</dd>
            </div>

            <div>
              <dt>Teléfono</dt>
              <dd>{pedido.telefonoCliente || "No especificado"}</dd>
            </div>

          </div>
        </div>

        <div className="detail-section">
          <h2>Entrega</h2>

          <div className="detail-grid">

            <div>
              <dt>Dirección de origen</dt>
              <dd>
                {pedido.direccionOrigen || "No especificada"}
              </dd>
            </div>

            <div>
              <dt>Dirección de destino</dt>
              <dd>
                {pedido.direccionDestino || "No especificada"}
              </dd>
            </div>

          </div>
        </div>

        {pedido.observaciones && (
          <div className="detail-section">
            <h2>Observaciones</h2>

            <p className="observaciones">
              {pedido.observaciones}
            </p>
          </div>
        )}

        {message && (
          <p className="message message--error">
            {message}
          </p>
        )}

        <div className="form-actions">

          <Link
            className="button button--secondary"
            to="/pedidos"
          >
            Volver
          </Link>

          <Link
            className="button button--outline"
            to={`/pedidos/${id}/editar`}
          >
            Editar
          </Link>

          <button
            className="button button--danger"
            onClick={() => setShowModal(true)}
            disabled={deleting}
          >
            Eliminar
          </button>

        </div>

      </article>

      {showModal && (
        <ConfirmModal
          pedidoId={id}
          onCancel={() => setShowModal(false)}
          onConfirm={borrar}
          loading={deleting}
        />
      )}

    </section>
  );
}

export default DetallePedido;