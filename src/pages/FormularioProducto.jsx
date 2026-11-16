import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import {
  actualizarProducto,
  crearProducto,
  obtenerProductoPorId,
} from "../services/catalogoService";

const emptyProduct = {
  nombre: "",
  descripcion: "",
  sku: "",
  categoria: "",
  precio: 0,
  moneda: "ARS",
  stockDisponible: 0,
  stockBloqueado: 0,
};

function FormularioProducto() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    let active = true;
    obtenerProductoPorId(id)
      .then((producto) => {
        if (!active) return;
        setForm({
          nombre: producto.nombre || "",
          descripcion: producto.descripcion || "",
          sku: producto.sku || "",
          categoria: producto.categoria || "",
          precio: Number(producto.precio) || 0,
          moneda: producto.moneda || "ARS",
          stockDisponible: Number(producto.stockDisponible) || 0,
          stockBloqueado: Number(producto.stockBloqueado) || 0,
        });
      })
      .catch((requestError) => {
        if (active) setError(`No se pudo cargar el producto. ${requestError.message}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({
      ...actual,
      [name]: name === "precio" || name === "stockDisponible" || name === "stockBloqueado"
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      ...form,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      sku: form.sku.trim(),
      categoria: form.categoria.trim(),
      precio: Number(form.precio) || 0,
      stockDisponible: Number(form.stockDisponible) || 0,
      stockBloqueado: Number(form.stockBloqueado) || 0,
    };

    if (!payload.nombre || !payload.sku) {
      setError("Completá nombre y SKU del producto.");
      return;
    }

    setSaving(true);
    try {
      const producto = isEditing
        ? await actualizarProducto(id, payload)
        : await crearProducto(payload);
      navigate(`/catalogo/${producto.id || id}`);
    } catch (requestError) {
      setError(`No se pudo ${isEditing ? "guardar" : "crear"} el producto. ${requestError.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message={isEditing ? "Cargando producto..." : "Preparando formulario..."} />;

  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>{isEditing ? "Editar producto" : "Nuevo producto"}</h1>
          <p>Actualizá la información del catálogo y la disponibilidad del producto.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="message message--error">{error}</p>}

        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>

        <label>
          SKU
          <input name="sku" value={form.sku} onChange={handleChange} required />
        </label>

        <label>
          Categoría
          <input name="categoria" value={form.categoria} onChange={handleChange} />
        </label>

        <label>
          Descripción
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <label>
            Precio
            <input type="number" min="0" step="0.01" name="precio" value={form.precio} onChange={handleChange} />
          </label>

          <label>
            Moneda
            <select name="moneda" value="ARS" disabled>
              <option value="ARS">ARS</option>
            </select>
          </label>

          <label>
            Stock disponible
            <input type="number" min="0" name="stockDisponible" value={form.stockDisponible} onChange={handleChange} />
          </label>

          <label>
            Stock bloqueado
            <input type="number" min="0" name="stockBloqueado" value={form.stockBloqueado} readOnly />
            <span className="field-hint">No se modifica porque corresponde a pedidos activos.</span>
          </label>
        </div>

        <div className="form-actions">
          <Link className="button button--secondary" to={isEditing ? `/catalogo/${id}` : "/catalogo"}>
            Cancelar
          </Link>
          <button className="button button--primary" type="submit" disabled={saving}>
            {saving ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar cambios" : "Crear producto")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormularioProducto;
