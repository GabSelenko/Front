import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../contexts/AuthContext';
import { FiUserX, FiUserCheck, FiLogOut, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await adminApi.getAllUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  function requestConfirm(message, onConfirm, danger = false) {
    setConfirmModal({ message, onConfirm, danger });
  }

  async function handleConfirm() {
    if (!confirmModal) return;
    const { onConfirm } = confirmModal;
    setConfirmModal(null);
    await onConfirm();
  }

  async function handleBlock(publicId) {
    requestConfirm('Deseja bloquear este usuário?', async () => {
      try {
        await adminApi.blockUser(publicId);
        loadUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao bloquear usuário');
      }
    });
  }

  async function handleUnblock(publicId) {
    requestConfirm('Deseja desbloquear este usuário?', async () => {
      try {
        await adminApi.unblockUser(publicId);
        loadUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao desbloquear usuário');
      }
    });
  }

  async function handleForceLogout(publicId) {
    requestConfirm('Deseja forçar o logout deste usuário?', async () => {
      try {
        await adminApi.forceLogout(publicId);
        loadUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao deslogar usuário');
      }
    });
  }

  async function handleDelete(publicId) {
    requestConfirm('Deseja excluir este usuário permanentemente?', async () => {
      try {
        await adminApi.deleteUser(publicId);
        setUsers((prev) => prev.filter((u) => u.public_id !== publicId));
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao excluir usuário');
      }
    }, true);
  }

  if (loading) return <div className="loading">Carregando usuários...</div>;

  return (
    <div className="admin-page">
      <h1>Gerenciar Usuários</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.public_id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role === 'ADMIN' ? 'role-admin' : ''}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${u.blocked ? 'status-disabled' : 'status-active'}`}>
                    {u.blocked ? 'Bloqueado' : 'Ativo'}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  {u.email === currentUser?.email ? (
                    <></>
                  ) : (
                    <div className="table-actions">
                      <button
                        className="btn btn-icon"
                        onClick={() => handleForceLogout(u.public_id)}
                        title="Forçar logout"
                      >
                        <FiLogOut />
                      </button>
                      {u.blocked ? (
                        <button
                          className="btn btn-icon"
                          onClick={() => handleUnblock(u.public_id)}
                          title="Desbloquear"
                        >
                          <FiUserCheck />
                        </button>
                      ) : (
                        <button
                          className="btn btn-icon"
                          onClick={() => handleBlock(u.public_id)}
                          title="Bloquear"
                        >
                          <FiUserX />
                        </button>
                      )}
                      <button
                        className="btn btn-icon btn-danger"
                        onClick={() => handleDelete(u.public_id)}
                        title="Excluir"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          danger={confirmModal.danger}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
