function ConfirmModal({ pedidoId, onCancel, onConfirm, loading = false }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Eliminar pedido?</h2>
        <p>Estas seguro de que queres eliminar el pedido #{pedidoId}?</p>
        <p className="modal__warning">Esta accion no se puede deshacer.</p>
        <div className="modal__actions">
          <button className="button button--secondary" type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="button button--danger" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;