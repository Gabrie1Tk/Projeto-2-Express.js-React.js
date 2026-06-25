import "./ConfirmModal.css";

export default function ConfirmModal({ show, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar exclusão"
      >
        <div className="confirm-modal__icon">🗑️</div>

        <h2 className="confirm-modal__title">Excluir série?</h2>

        <p className="confirm-modal__text">
          Tem certeza que deseja excluir{" "}
          <strong className="confirm-modal__name">{show?.name}</strong>?
          <br />
          Essa ação não pode ser desfeita.
        </p>

        <div className="confirm-modal__actions">
          <button className="confirm-modal__btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="confirm-modal__btn-delete" onClick={onConfirm}>
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  );
}
