import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearPedido } from "../services/pedidoService";

function CrearPedido() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ descripcion: "", total: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (event) => { event.preventDefault(); const total = Number(form.total); if (!form.descripcion.trim() || !form.total || !Number.isFinite(total) || total <= 0) { setError("Completa una descripcion y un total mayor que 0."); return; } setSaving(true); setError(""); try { await crearPedido({ descripcion: form.descripcion.trim(), total }); navigate("/pedidos"); } catch { setError("No se pudo crear el pedido. Verifica el servidor e intenta nuevamente."); } finally { setSaving(false); } };
  return (
    <section><div className="page-heading"><div><h1>Crear nuevo pedido</h1><p>Incorpora una nueva solicitud a LogiRed.</p></div></div><form className="form-card" onSubmit={handleSubmit}><label htmlFor="descripcion">Descripcion<input id="descripcion" name="descripcion" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} required /></label><label htmlFor="total">Total<input id="total" name="total" type="number" min="0.01" step="0.01" value={form.total} onChange={(event) => setForm({ ...form, total: event.target.value })} required /></label>{error && <p className="message message--error">{error}</p>}<div className="form-actions"><Link className="button button--secondary" to="/pedidos">Cancelar</Link><button className="button button--primary" type="submit" disabled={saving}>{saving ? "Creando..." : "Crear pedido"}</button></div></form></section>
  );
}

export default CrearPedido