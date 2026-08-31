import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Loading from "../components/Loading";

import {
  actualizarPedido,
  obtenerPedidoPorId,
} from "../services/pedidoService";

function EditarPedido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    descripcion: "",
    estado: "CREADO",
    nombreCliente: "",
    telefonoCliente: "",
    direccionOrigen: "",
    direccionDestino: "",
    fechaEntrega: "",
    total: "",
    observaciones: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const pedido = await obtenerPedidoPorId(id);

        if (!pedido) {
          setError("Pedido no encontrado.");
          return;
        }

        setForm({
          descripcion: pedido.descripcion || "",
          estado: pedido.estado || "CREADO",
          nombreCliente: pedido.nombreCliente || "",
          telefonoCliente: pedido.telefonoCliente || "",
          direccionOrigen: pedido.direccionOrigen || "",
          direccionDestino: pedido.direccionDestino || "",
          fechaEntrega: pedido.fechaEntrega
            ? pedido.fechaEntrega.substring(0, 16)
            : "",
          total: pedido.total ?? "",
          observaciones: pedido.observaciones || "",
        });

      } catch (error) {
        console.error(error);
        setError("No pudimos cargar el pedido.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const guardar = async (event) => {
    event.preventDefault();

    const total = Number(form.total);

    if (
      !form.descripcion.trim() ||
      !form.nombreCliente.trim() ||
      !form.telefonoCliente.trim() ||
      !form.direccionOrigen.trim() ||
      !form.direccionDestino.trim() ||
      !form.fechaEntrega ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await actualizarPedido(id, {
        descripcion: form.descripcion.trim(),
        estado: form.estado,
        nombreCliente: form.nombreCliente.trim(),
        telefonoCliente: form.telefonoCliente.trim(),
        direccionOrigen: form.direccionOrigen.trim(),
        direccionDestino: form.direccionDestino.trim(),
        fechaEntrega: form.fechaEntrega,
        total,
        observaciones: form.observaciones.trim(),
      });

      navigate(`/pedidos/${id}`);

    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar el pedido.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando pedido..." />;
  }

  if (error && !form.descripcion) {
    return (
      <div className="message message--error">
        {error}

        <br />

        <Link to="/pedidos">
          Volver a pedidos
        </Link>
      </div>
    );
  }

  return (
    <section>

      <div className="page-heading">
        <div>
          <h1>Editar pedido</h1>
          <p>Actualizá los datos del pedido #{id}.</p>
        </div>
      </div>

      <form
        className="form-card"
        onSubmit={guardar}
      >

        <div className="form-section">
          <h2>Información del pedido</h2>

          <label>
            Descripción *
            <input
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Estado
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
            >
              <option value="CREADO">Creado</option>
              <option value="EN_PREPARACION">
                En preparación
              </option>
              <option value="EN_CAMINO">
                En camino
              </option>
              <option value="ENTREGADO">
                Entregado
              </option>
              <option value="CANCELADO">
                Cancelado
              </option>
            </select>
          </label>

          <label>
            Total *
            <input
              name="total"
              type="number"
              min="0.01"
              step="0.01"
              value={form.total}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Fecha de entrega *
            <input
              name="fechaEntrega"
              type="datetime-local"
              value={form.fechaEntrega}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Cliente</h2>

          <label>
            Nombre del cliente *
            <input
              name="nombreCliente"
              value={form.nombreCliente}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Teléfono *
            <input
              name="telefonoCliente"
              value={form.telefonoCliente}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Entrega</h2>

          <label>
            Dirección de origen *
            <input
              name="direccionOrigen"
              value={form.direccionOrigen}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Dirección de destino *
            <input
              name="direccionDestino"
              value={form.direccionDestino}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Observaciones
            <textarea
              name="observaciones"
              rows="4"
              value={form.observaciones}
              onChange={handleChange}
            />
          </label>
        </div>

        {error && (
          <p className="message message--error">
            {error}
          </p>
        )}

        <div className="form-actions">

          <Link
            className="button button--secondary"
            to={`/pedidos/${id}`}
          >
            Cancelar
          </Link>

          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

        </div>

      </form>
    </section>
  );
}

export default EditarPedido;