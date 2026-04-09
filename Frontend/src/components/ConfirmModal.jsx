import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ConfirmModal.css';

export default function ConfirmModal({ message, danger = false, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className={`confirm-modal-icon ${danger ? 'confirm-danger' : ''}`}>
            <FiAlertTriangle />
          </div>
          <button className="btn btn-icon" onClick={onCancel}>
            <FiX />
          </button>
        </div>
        <div className="confirm-modal-body">
          <h3>Confirmação</h3>
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
