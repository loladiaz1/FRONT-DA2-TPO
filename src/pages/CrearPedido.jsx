import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearPedido } from "../services/pedidoService";

function CrearPedido() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    descripcion: "",
    nombreCliente: "",
    telefonoCliente: "",
    direccionOrigen: "",
    direccionDestino: "",
    fechaEntrega: "",
    total: "",
    observaciones: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
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
      await crearPedido({
        descripcion: form.descripcion.trim(),
        nombreCliente: form.nombreCliente.trim(),
        telefonoCliente: form.telefonoCliente.trim(),
        direccionOrigen: form.direccionOrigen.trim(),
        direccionDestino: form.direccionDestino.trim(),
        fechaEntrega: form.fechaEntrega,
        total,
        observaciones: form.observaciones.trim(),
      });

      navigate("/pedidos");
    } catch (error) {
      console.error(error);
      setError(
        "No se pudo crear el pedido. Verificá que el servidor esté funcionando."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Crear nuevo pedido</h1>
          <p>Ingresá la información del pedido y del cliente.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>

        <div className="form-section">
          <h2>Información del pedido</h2>

          <label htmlFor="descripcion">
            Descripción *
            <input
              id="descripcion"
              name="descripcion"
              type="text"
              placeholder="Ej: Pedido de productos electrónicos"
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="total">
            Total *
            <input
              id="total"
              name="total"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="25000"
              value={form.total}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="fechaEntrega">
            Fecha de entrega *
            <input
              id="fechaEntrega"
              name="fechaEntrega"
              type="datetime-local"
              value={form.fechaEntrega}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Información del cliente</h2>

          <label htmlFor="nombreCliente">
            Nombre del cliente *
            <input
              id="nombreCliente"
              name="nombreCliente"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={form.nombreCliente}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="telefonoCliente">
            Teléfono *
            <input
              id="telefonoCliente"
              name="telefonoCliente"
              type="tel"
              placeholder="Ej: 1123456789"
              value={form.telefonoCliente}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Información de entrega</h2>

          <label htmlFor="direccionOrigen">
            Dirección de origen *
            <input
              id="direccionOrigen"
              name="direccionOrigen"
              type="text"
              placeholder="Ej: Av. Corrientes 1234"
              value={form.direccionOrigen}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="direccionDestino">
            Dirección de destino *
            <input
              id="direccionDestino"
              name="direccionDestino"
              type="text"
              placeholder="Ej: Av. Santa Fe 2500"
              value={form.direccionDestino}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="observaciones">
            Observaciones
            <textarea
              id="observaciones"
              name="observaciones"
              placeholder="Ej: Entregar en recepción"
              value={form.observaciones}
              onChange={handleChange}
              rows="4"
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
            to="/pedidos"
          >
            Cancelar
          </Link>

          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Creando..." : "Crear pedido"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CrearPedido;