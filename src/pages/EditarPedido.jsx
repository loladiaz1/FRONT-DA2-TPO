import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { actualizarPedido, obtenerPedidoPorId } from "../services/pedidoService";

function EditarPedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ descripcion: "", estado: "CREADO", total: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const cargar = async () => { try { const pedido = await obtenerPedidoPorId(id); if (!pedido) setError("Pedido no encontrado."); else setForm({ descripcion: pedido.descripcion || "", estado: pedido.estado || "CREADO", total: pedido.total }); } catch { setError("No pudimos cargar el pedido."); } finally { setLoading(false); } }; cargar(); }, [id]);
  const guardar = async (event) => { event.preventDefault(); const total = Number(form.total); if (!form.descripcion.trim() || !Number.isFinite(total) || total <= 0) { setError("Completa una descripcion y un total mayor que 0."); return; } setSaving(true); setError(""); try { await actualizarPedido(id, { descripcion: form.descripcion.trim(), estado: form.estado, total }); navigate(`/pedidos/${id}`); } catch { setError("No se pudo actualizar el pedido. Intenta nuevamente."); } finally { setSaving(false); } };
  if (loading) return <Loading message="Cargando pedido..." />;
  if (error && !form.descripcion) return <div className="message message--error">{error}<br /><Link to="/pedidos">Volver a pedidos</Link></div>;
  return <section><div className="page-heading"><div><h1>Editar pedido</h1><p>Actualiza los datos del pedido #{id}.</p></div></div><form className="form-card" onSubmit={guardar}><label htmlFor="descripcion">Descripcion<input id="descripcion" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} required /></label><label htmlFor="estado">Estado<input id="estado" value={form.estado} readOnly /></label><label htmlFor="total">Total<input id="total" type="number" min="0.01" step="0.01" value={form.total} onChange={(event) => setForm({ ...form, total: event.target.value })} required /></label>{error && <p className="message message--error">{error}</p>}<div className="form-actions"><Link className="button button--secondary" to={`/pedidos/${id}`}>Cancelar</Link><button className="button button--primary" type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button></div></form></section>;
}

export default EditarPedido;