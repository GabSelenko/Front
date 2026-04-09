import { useState, useEffect } from 'react';

const getOperatorName = (operator) =>
  typeof operator === 'string' ? operator : (operator?.name ?? '');
import { healthPlanApi } from '../../api/healthPlanApi';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PlanFormModal from './PlanFormModal';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      const res = await healthPlanApi.getAll();
      setPlans(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(publicId) {
    setConfirmModal({
      message: 'Deseja excluir este plano permanentemente?',
      danger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await healthPlanApi.remove(publicId);
          setPlans((prev) => prev.filter((p) => p.id !== publicId));
        } catch (err) {
          setError(err.response?.data?.message || 'Erro ao excluir plano');
        }
      },
    });
  }

  function handleEdit(plan) {
    setEditingPlan(plan);
    setShowModal(true);
  }

  function handleCreate() {
    setEditingPlan(null);
    setShowModal(true);
  }

  function handleModalClose() {
    setShowModal(false);
    setEditingPlan(null);
    loadPlans();
  }

  if (loading) return <div className="loading">Carregando planos...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Gerenciar Planos</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          <FiPlus /> Novo Plano
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Operadora</th>
              <th>Categoria</th>
              <th>Cobertura</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{getOperatorName(p.operator)}</td>
                <td>{p.category === 'PessoaFisica' ? 'PF' : 'PJ'}</td>
                <td>{p.coverage}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-icon" onClick={() => handleEdit(p)} title="Editar">
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-icon btn-danger"
                      onClick={() => handleDelete(p.id)}
                      title="Excluir"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <PlanFormModal plan={editingPlan} onClose={handleModalClose} />}

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
