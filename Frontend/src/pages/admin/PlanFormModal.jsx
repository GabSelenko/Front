import { useState, useEffect } from 'react';
import { healthPlanApi } from '../../api/healthPlanApi';
import { networkApi } from '../../api/networkApi';
import { cityApi } from '../../api/cityApi';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import './Admin.css';

const MODALITY_OPTIONS = [
  { value: 'STANDARD', label: 'Padrão' },
  { value: 'WITH_COPAY', label: 'Com Coparticipação' },
  { value: 'WITH_OBSTETRICS', label: 'Com Obstetrícia' },
  { value: 'WITH_COPAY_AND_OBSTETRICS', label: 'Com Coparticipação e Obstetrícia' },
];

const COPAY_SERVICE_TYPES = [
  'CONSULTA_MEDICO_GESTOR',
  'CONSULTA_MEDICO_FAMILIA',
  'CONSULTA_APS',
  'CONSULTA_ELETIVA',
  'CONSULTA_URGENCIA',
  'PUERICULTURA_PEDIATRICA',
  'EXAME_SIMPLES',
  'EXAME_COMPLEXO',
  'TETO_EXAMES',
  'INTERNAMENTO_CIRURGIA',
  'TERAPIA_NEUROLOGICA',
  'TERAPIA_GERAL',
  'DEMAIS_TERAPIAS',
];

const COPAY_CHARGE_TYPES = [
  { value: 'FIXED', label: 'Valor Fixo' },
  { value: 'PERCENTAGE', label: 'Percentual' },
  { value: 'EXEMPT', label: 'Isento' },
];

export default function PlanFormModal({ plan, onClose }) {
  const isEditing = !!plan;
  const [form, setForm] = useState({
    name: plan?.name || '',
    operator: plan?.operator || '',
    operatorCode: plan?.operatorCode || '',
    category: plan?.category || 'PessoaJuridica',
    consultationType: plan?.consultationType || 'TodasEspecialidades',
    coverage: plan?.coverage || 'REGIONAL',
    logoUrl: plan?.logoUrl || '',
    minAge: plan?.minAge ?? 0,
    maxAge: plan?.maxAge ?? 99,
    notes: plan?.notes || '',
    hasObstetrics: plan?.hasObstetrics || false,
    hasCopay: plan?.hasCopay || false,
    copayDetails: plan?.copayDetails || [],
    availableAccommodationTypes: plan?.availableAccommodationTypes || ['ENFERMARIA'],
    priceTables: plan?.priceTables || [
      { cityId: null, companyType: 'TODOS', minLives: 1, maxLives: 99, modality: 'STANDARD', priceMatrix: [] },
    ],
    networkIds: plan?.networks?.map((n) => n.publicId) || [],
  });
  const [networks, setNetworks] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    networkApi.getAll().then((res) => setNetworks(res.data.data || [])).catch(() => {});
    cityApi.getAll().then((res) => setCities(res.data.data || [])).catch(() => {});
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAccommodation(type) {
    setForm((prev) => {
      const types = prev.availableAccommodationTypes.includes(type)
        ? prev.availableAccommodationTypes.filter((t) => t !== type)
        : [...prev.availableAccommodationTypes, type];
      return { ...prev, availableAccommodationTypes: types };
    });
  }

  function addPriceEntry(tableIndex) {
    setForm((prev) => {
      const tables = [...prev.priceTables];
      tables[tableIndex] = {
        ...tables[tableIndex],
        priceMatrix: [
          ...tables[tableIndex].priceMatrix,
          { ageRange: '', enfermaria: 0, apartamento: 0 },
        ],
      };
      return { ...prev, priceTables: tables };
    });
  }

  function updatePriceEntry(tableIndex, entryIndex, field, value) {
    setForm((prev) => {
      const tables = [...prev.priceTables];
      const matrix = [...tables[tableIndex].priceMatrix];
      matrix[entryIndex] = { ...matrix[entryIndex], [field]: value };
      tables[tableIndex] = { ...tables[tableIndex], priceMatrix: matrix };
      return { ...prev, priceTables: tables };
    });
  }

  function removePriceEntry(tableIndex, entryIndex) {
    setForm((prev) => {
      const tables = [...prev.priceTables];
      tables[tableIndex] = {
        ...tables[tableIndex],
        priceMatrix: tables[tableIndex].priceMatrix.filter((_, i) => i !== entryIndex),
      };
      return { ...prev, priceTables: tables };
    });
  }

  function updateTableField(tableIndex, field, value) {
    setForm((prev) => {
      const tables = [...prev.priceTables];
      tables[tableIndex] = { ...tables[tableIndex], [field]: value };
      return { ...prev, priceTables: tables };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        await healthPlanApi.update(plan.id, form);
      } else {
        await healthPlanApi.create(form);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar plano');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Plano' : 'Novo Plano'}</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome do Plano</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Operadora</label>
              <input
                type="text"
                value={form.operator}
                onChange={(e) => updateField('operator', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Código Operadora</label>
              <input
                type="text"
                value={form.operatorCode}
                onChange={(e) => updateField('operatorCode', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Logo URL</label>
              <input
                type="text"
                value={form.logoUrl}
                onChange={(e) => updateField('logoUrl', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoria</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              >
                <option value="PessoaFisica">Pessoa Física</option>
                <option value="PessoaJuridica">Pessoa Jurídica</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Consulta</label>
              <select
                value={form.consultationType}
                onChange={(e) => updateField('consultationType', e.target.value)}
              >
                <option value="TodasEspecialidades">Todas Especialidades</option>
                <option value="CoordenadoMedicoGestor">Coordenado Médico Gestor</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cobertura</label>
              <select
                value={form.coverage}
                onChange={(e) => updateField('coverage', e.target.value)}
              >
                <option value="NATIONAL">Nacional</option>
                <option value="REGIONAL">Regional</option>
                <option value="MUNICIPAL">Municipal</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Idade Mínima</label>
              <input
                type="number"
                value={form.minAge}
                onChange={(e) => updateField('minAge', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Idade Máxima</label>
              <input
                type="number"
                value={form.maxAge}
                onChange={(e) => updateField('maxAge', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              placeholder="Observações sobre o plano (opcional)"
            />
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.hasObstetrics}
                onChange={(e) => updateField('hasObstetrics', e.target.checked)}
              />
              Obstetrícia
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.hasCopay}
                onChange={(e) => updateField('hasCopay', e.target.checked)}
              />
              Coparticipação
            </label>
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.availableAccommodationTypes.includes('ENFERMARIA')}
                onChange={() => toggleAccommodation('ENFERMARIA')}
              />
              Enfermaria
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.availableAccommodationTypes.includes('APARTAMENTO')}
                onChange={() => toggleAccommodation('APARTAMENTO')}
              />
              Apartamento
            </label>
          </div>

          {form.hasCopay && (
            <div className="form-section">
              <h3>Detalhes de Coparticipação</h3>
              {form.copayDetails.map((detail, i) => (
                <div key={i} className="form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label>Serviço</label>
                    <select
                      value={detail.serviceType}
                      onChange={(e) => {
                        const updated = [...form.copayDetails];
                        updated[i] = { ...updated[i], serviceType: e.target.value };
                        updateField('copayDetails', updated);
                      }}
                    >
                      {COPAY_SERVICE_TYPES.map((st) => (
                        <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      value={detail.chargeType}
                      onChange={(e) => {
                        const updated = [...form.copayDetails];
                        updated[i] = { ...updated[i], chargeType: e.target.value };
                        updateField('copayDetails', updated);
                      }}
                    >
                      {COPAY_CHARGE_TYPES.map((ct) => (
                        <option key={ct.value} value={ct.value}>{ct.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      value={detail.value}
                      onChange={(e) => {
                        const updated = [...form.copayDetails];
                        updated[i] = { ...updated[i], value: parseFloat(e.target.value) || 0 };
                        updateField('copayDetails', updated);
                      }}
                      disabled={detail.chargeType === 'EXEMPT'}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-icon btn-danger"
                    onClick={() => updateField('copayDetails', form.copayDetails.filter((_, idx) => idx !== i))}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  updateField('copayDetails', [
                    ...form.copayDetails,
                    { serviceType: COPAY_SERVICE_TYPES[0], chargeType: 'FIXED', value: 0 },
                  ])
                }
              >
                <FiPlus /> Adicionar Coparticipação
              </button>
            </div>
          )}

          {networks.length > 0 && (
            <div className="form-section">
              <h3>Redes Credenciadas</h3>
              <div className="checkbox-grid">
                {networks.map((n) => (
                  <label key={n.publicId || n.name} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.networkIds.includes(n.publicId)}
                      onChange={(e) => {
                        const ids = e.target.checked
                          ? [...form.networkIds, n.publicId]
                          : form.networkIds.filter((id) => id !== n.publicId);
                        updateField('networkIds', ids);
                      }}
                    />
                    {n.name} ({n.networkType}) {n.city ? `- ${n.city.name}/${n.city.state}` : ''}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>Tabelas de Preço</h3>
            {form.priceTables.map((table, ti) => (
              <div key={ti} className="price-table-card">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo Empresa</label>
                    <select
                      value={table.companyType}
                      onChange={(e) => updateTableField(ti, 'companyType', e.target.value)}
                    >
                      <option value="TODOS">Todos</option>
                      <option value="MEI">MEI</option>
                      <option value="LTDA">LTDA</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Modalidade</label>
                    <select
                      value={table.modality || 'STANDARD'}
                      onChange={(e) => updateTableField(ti, 'modality', e.target.value)}
                    >
                      {MODALITY_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mín. Vidas</label>
                    <input
                      type="number"
                      value={table.minLives}
                      onChange={(e) =>
                        updateTableField(ti, 'minLives', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Máx. Vidas</label>
                    <input
                      type="number"
                      value={table.maxLives}
                      onChange={(e) =>
                        updateTableField(ti, 'maxLives', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Cidade</label>
                    <select
                      value={table.cityId || ''}
                      onChange={(e) =>
                        updateTableField(ti, 'cityId', e.target.value ? parseInt(e.target.value) : null)
                      }
                    >
                      <option value="">Opcional</option>
                      {cities.map((c) => (
                        <option key={c.publicId} value={c.publicId}>
                          {c.name} - {c.state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <table className="price-matrix-table">
                  <thead>
                    <tr>
                      <th>Faixa Etária</th>
                      <th>Enfermaria (R$)</th>
                      <th>Apartamento (R$)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.priceMatrix.map((entry, ei) => (
                      <tr key={ei}>
                        <td>
                          <input
                            type="text"
                            value={entry.ageRange}
                            onChange={(e) => updatePriceEntry(ti, ei, 'ageRange', e.target.value)}
                            placeholder="0-18"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={entry.enfermaria}
                            onChange={(e) =>
                              updatePriceEntry(ti, ei, 'enfermaria', parseFloat(e.target.value) || 0)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={entry.apartamento}
                            onChange={(e) =>
                              updatePriceEntry(ti, ei, 'apartamento', parseFloat(e.target.value) || 0)
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-icon btn-danger"
                            onClick={() => removePriceEntry(ti, ei)}
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => addPriceEntry(ti)}>
                  <FiPlus /> Adicionar Faixa
                </button>
                {form.priceTables.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-danger"
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      priceTables: prev.priceTables.filter((_, i) => i !== ti),
                    }))}
                  >
                    <FiTrash2 /> Remover Tabela
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  priceTables: [
                    ...prev.priceTables,
                    { cityId: null, companyType: 'TODOS', minLives: 1, maxLives: 99, modality: 'STANDARD', priceMatrix: [] },
                  ],
                }))
              }
            >
              <FiPlus /> Nova Tabela de Preço
            </button>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
