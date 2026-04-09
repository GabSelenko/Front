import { useState, useEffect } from 'react';
import { cityApi } from '../../api/cityApi';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import './Admin.css';

export default function AdminCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', state: '' });

  useEffect(() => {
    loadCities();
  }, []);

  async function loadCities() {
    try {
      const res = await cityApi.getAll();
      setCities(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar cidades');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', state: '' });
    setShowForm(true);
  }

  function openEdit(city) {
    setEditing(city);
    setForm({ name: city.name, state: city.state });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { name: form.name, state: form.state.toUpperCase() };
    try {
      if (editing) {
        await cityApi.update(editing.publicId, payload);
      } else {
        await cityApi.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', state: '' });
      loadCities();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar cidade');
    }
  }

  async function handleDelete(publicId) {
    if (!confirm('Deseja excluir esta cidade?')) return;
    try {
      await cityApi.remove(publicId);
      setCities((prev) => prev.filter((c) => c.publicId !== publicId));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir cidade');
    }
  }

  if (loading) return <div className="loading">Carregando cidades...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Cidades</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Nova Cidade
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="inline-form-card">
          <div className="inline-form-header">
            <h3>{editing ? 'Editar Cidade' : 'Nova Cidade'}</h3>
            <button className="btn btn-icon" onClick={() => setShowForm(false)}>
              <FiX />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ex: Curitiba"
                />
              </div>
              <div className="form-group">
                <label>UF</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                  maxLength={2}
                  placeholder="PR"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cidade</th>
              <th>UF</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.publicId}>
                <td>{c.name}</td>
                <td>{c.state}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-icon" onClick={() => openEdit(c)} title="Editar">
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-icon btn-danger"
                      onClick={() => handleDelete(c.publicId)}
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
    </div>
  );
}
