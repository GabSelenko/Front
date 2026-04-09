import { useState, useEffect } from 'react';
import { networkApi } from '../../api/networkApi';
import { cityApi } from '../../api/cityApi';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import './Admin.css';

const NETWORK_TYPES = [
  'HOSPITAL',
  'LABORATORIO',
  'CLINICA',
  'PRONTO_SOCORRO',
  'CENTRO_DIAGNOSTICO',
  'AMBULATORIO',
  'MATERNIDADE',
];

const TYPE_LABELS = {
  HOSPITAL: 'Hospital',
  LABORATORIO: 'Laboratório',
  CLINICA: 'Clínica',
  PRONTO_SOCORRO: 'Pronto Socorro',
  CENTRO_DIAGNOSTICO: 'Centro Diagnóstico',
  AMBULATORIO: 'Ambulatório',
  MATERNIDADE: 'Maternidade',
};

export default function AdminNetworks() {
  const [networks, setNetworks] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    networkType: 'HOSPITAL',
    address: '',
    cityId: '',
    enfermariaServices: [],
    apartamentoServices: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [networksRes, citiesRes] = await Promise.all([
        networkApi.getAll(),
        cityApi.getAll(),
      ]);
      setNetworks(networksRes.data.data || []);
      setCities(citiesRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      name: '',
      networkType: 'HOSPITAL',
      address: '',
      cityId: '',
      enfermariaServices: [],
      apartamentoServices: [],
    });
    setShowForm(true);
  }

  function openEdit(network) {
    setEditing(network);
    setForm({
      name: network.name,
      networkType: network.networkType,
      address: network.address || '',
      cityId: network.city?.publicId ? cities.find(c => c.publicId === network.city.publicId)?.publicId || '' : '',
      enfermariaServices: network.enfermariaServices || [],
      apartamentoServices: network.apartamentoServices || [],
    });
    setShowForm(true);
  }

  function toggleService(field, type) {
    setForm((prev) => {
      const list = prev[field];
      const updated = list.includes(type) ? list.filter((t) => t !== type) : [...list, type];
      return { ...prev, [field]: updated };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const selectedCity = cities.find((c) => c.publicId === form.cityId);
    const payload = {
      name: form.name,
      networkType: form.networkType,
      address: form.address,
      cityId: selectedCity ? selectedCity.publicId : null,
      enfermariaServices: form.enfermariaServices,
      apartamentoServices: form.apartamentoServices,
    };
    try {
      if (editing) {
        await networkApi.update(editing.publicId, payload);
      } else {
        await networkApi.create(payload);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar rede');
    }
  }

  async function handleDelete(publicId) {
    if (!confirm('Deseja excluir esta rede?')) return;
    try {
      await networkApi.remove(publicId);
      setNetworks((prev) => prev.filter((n) => n.publicId !== publicId));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir rede');
    }
  }

  if (loading) return <div className="loading">Carregando redes...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Redes Credenciadas</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Nova Rede
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="inline-form-card">
          <div className="inline-form-header">
            <h3>{editing ? 'Editar Rede' : 'Nova Rede'}</h3>
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
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={form.networkType}
                  onChange={(e) => setForm({ ...form, networkType: e.target.value })}
                >
                  {NETWORK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <select
                value={form.cityId}
                onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                required
              >
                <option value="">Selecione uma cidade</option>
                {cities.map((c) => (
                  <option key={c.publicId} value={c.publicId}>
                    {c.name} - {c.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-section">
              <h4>Serviços - Enfermaria</h4>
              <div className="checkbox-grid">
                {NETWORK_TYPES.map((t) => (
                  <label key={`enf-${t}`} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.enfermariaServices.includes(t)}
                      onChange={() => toggleService('enfermariaServices', t)}
                    />
                    {TYPE_LABELS[t]}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h4>Serviços - Apartamento</h4>
              <div className="checkbox-grid">
                {NETWORK_TYPES.map((t) => (
                  <label key={`apt-${t}`} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.apartamentoServices.includes(t)}
                      onChange={() => toggleService('apartamentoServices', t)}
                    />
                    {TYPE_LABELS[t]}
                  </label>
                ))}
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
              <th>Nome</th>
              <th>Tipo</th>
              <th>Cidade</th>
              <th>UF</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {networks.map((n) => (
              <tr key={n.publicId || n.name}>
                <td>{n.name}</td>
                <td>{TYPE_LABELS[n.networkType] || n.networkType}</td>
                <td>{n.city?.name || '-'}</td>
                <td>{n.city?.state || '-'}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-icon" onClick={() => openEdit(n)} title="Editar">
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-icon btn-danger"
                      onClick={() => handleDelete(n.publicId)}
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
