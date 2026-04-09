import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import './Profile.css';

export default function Profile() {
  const { user, loadProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  function handleUpdateName(e) {
    e.preventDefault();
    setConfirmModal({
      message: `Deseja alterar seu nome para "${name}"?`,
      danger: false,
      onConfirm: async () => {
        setConfirmModal(null);
        setError('');
        setSuccess('');
        setLoading(true);
        try {
          await userApi.updateProfile({ name });
          await loadProfile();
          setSuccess('Nome atualizado com sucesso!');
        } catch (err) {
          setError(err.response?.data?.message || 'Erro ao atualizar nome');
        } finally {
          setLoading(false);
        }
      },
    });
  }

  async function handleChangeEmail(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await userApi.changeEmail({ email: newEmail });
      setSuccess(res.data.message || 'Email de confirmação enviado!');
      setNewEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar email');
    }
  }

  function handleDeleteAccount() {
    setConfirmModal({
      message: 'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
      danger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await userApi.deleteAccount();
          await logout();
          navigate('/login');
        } catch (err) {
          setError(err.response?.data?.message || 'Erro ao excluir conta');
        }
      },
    });
  }

  return (
    <div className="profile-page">
      <h1>Meu Perfil</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-card">
        <h2>Informações Pessoais</h2>
        <p className="profile-email">Email: {user?.email}</p>

        <form onSubmit={handleUpdateName}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={3}
              maxLength={20}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Nome'}
          </button>
        </form>
      </div>

      <div className="profile-card">
        <h2>Alterar Email</h2>
        <form onSubmit={handleChangeEmail}>
          <div className="form-group">
            <label>Novo Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              placeholder="novo@email.com"
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Solicitar Alteração
          </button>
        </form>
      </div>

      <div className="profile-card danger-zone">
        <h2>Zona de Perigo</h2>
        <p>Ao excluir sua conta, todos os seus dados serão permanentemente removidos.</p>
        <button className="btn btn-danger" onClick={handleDeleteAccount}>
          Excluir Minha Conta
        </button>
      </div>

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
