import { useState, useEffect, useCallback } from 'react';

const getOperatorName = (operator) =>
  typeof operator === 'string' ? operator : (operator?.name ?? '');
import { useNavigate } from 'react-router-dom';
import { healthPlanApi } from '../../api/healthPlanApi';
import { quotationApi } from '../../api/quotationApi';
import {
  FiX, FiSave, FiDownload, FiShare2,
  FiGrid, FiShare, FiFileText,
  FiActivity, FiUsers, FiDroplet, FiZap, FiMonitor,
  FiMapPin, FiClock, FiCreditCard, FiFolder, FiAlertCircle,
} from 'react-icons/fi';
import { useSharePdf } from '../../hooks/useSharePdf';
import './Quotations.css';

/* ── helpers ── */
const SERVICE_TYPE_LABELS = {
  CONSULTA_ELETIVA: 'Consulta Eletiva',
  CONSULTA_URGENCIA: 'Consulta Urgência',
  EXAME_SIMPLES: 'Exames Simples',
  EXAME_ESPECIAL: 'Exames Especiais',
  INTERNACAO: 'Internação',
  CIRURGIA: 'Cirurgia',
  PRONTO_SOCORRO: 'Pronto Socorro',
  TERAPIA: 'Terapia',
  PARTO: 'Parto',
  ODONTOLOGIA: 'Odontologia',
  FISIOTERAPIA: 'Fisioterapia',
  PSICOLOGIA: 'Psicologia',
  NUTRICAO: 'Nutrição',
};

const NETWORK_CONFIG = {
  HOSPITAL:           { label: 'Hospitais',           icon: FiActivity, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  CLINICA:            { label: 'Clínicas',             icon: FiUsers,    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  LABORATORIO:        { label: 'Laboratórios',          icon: FiDroplet,  color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
  PRONTO_SOCORRO:     { label: 'Pronto Socorro',        icon: FiZap,      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  CENTRO_DIAGNOSTICO: { label: 'Centros Diagnósticos',  icon: FiMonitor,  color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
};

const CARENCIAS = [
  { label: 'Urgência e Emergência',     value: '24 horas' },
  { label: 'Consultas e Exames Simples', value: '30 dias'  },
  { label: 'Exames Especiais',           value: '90 dias'  },
  { label: 'Internações',                value: '180 dias' },
  { label: 'Parto',                      value: '300 dias' },
];

const DOCUMENTOS = [
  'Documento de identidade (RG ou CNH)',
  'CPF do titular e dependentes',
  'Comprovante de residência recente',
  'Carteira de trabalho (planos empresariais)',
  'Declaração de saúde',
];

function formatCopayValue(c) {
  if (c.chargeType === 'EXEMPT') return 'Isento';
  if (c.chargeType === 'PERCENTAGE') return `${c.value}% do valor`;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.value) + ' por atendimento';
}

/* ── Rede Credenciada Tab ── */
function NetworkTab({ plan }) {
  const networks = plan?.networks ?? [];
  const grouped = Object.entries(NETWORK_CONFIG).reduce((acc, [type]) => {
    const items = networks.filter(n => n.networkType === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  if (networks.length === 0) {
    return (
      <div className="qmodal-empty-tab">
        <FiShare className="qmodal-empty-icon" />
        <p>Nenhuma rede credenciada cadastrada para este plano.</p>
      </div>
    );
  }

  return (
    <div className="qmodal-network">
      <div className="qmodal-network-info">
        <FiMapPin />
        <span>Rede credenciada para <strong>{plan.coverage === 'NATIONAL' ? 'todo o Brasil' : 'sua região'}</strong></span>
      </div>
      <div className="qmodal-network-grid">
        {Object.entries(grouped).map(([type, items]) => {
          const cfg = NETWORK_CONFIG[type];
          const Icon = cfg.icon;
          return (
            <div key={type} className="qmodal-network-card" style={{ '--nc-color': cfg.color, '--nc-bg': cfg.bg, '--nc-border': cfg.border }}>
              <div className="qmodal-network-card-header">
                <div className="qmodal-network-card-title">
                  <Icon />
                  <span>{cfg.label}</span>
                </div>
                <span className="qmodal-network-count">{items.length}</span>
              </div>
              <ul className="qmodal-network-list">
                {items.slice(0, 4).map((n, i) => <li key={i}>{n.name}</li>)}
                {items.length > 4 && <li className="qmodal-network-more">+{items.length - 4} mais</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Regras & Copart Tab ── */
function RulesTab({ plan }) {
  const copay = plan?.copayDetails ?? [];
  const [openSections, setOpenSections] = useState(['carencias', 'copay', 'docs']);

  function toggle(id) {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  return (
    <div className="qmodal-rules">
      <div className="qmodal-rules-notice">
        <FiAlertCircle />
        <span>As regras abaixo seguem as diretrizes da ANS. Consulte o contrato para informações detalhadas.</span>
      </div>

      {/* Carências */}
      <div className="qmodal-rules-section" style={{ '--rs-color': '#2563eb', '--rs-bg': '#eff6ff', '--rs-border': '#bfdbfe' }}>
        <button className="qmodal-rules-section-header" onClick={() => toggle('carencias')}>
          <div className="qmodal-rules-section-title"><FiClock /><span>Carências</span></div>
          <span className="qmodal-rules-chevron">{openSections.includes('carencias') ? '∧' : '∨'}</span>
        </button>
        {openSections.includes('carencias') && (
          <div className="qmodal-rules-section-body">
            {CARENCIAS.map((c, i) => (
              <div key={i} className="qmodal-rules-row">
                <span>{c.label}</span>
                <span className="qmodal-rules-badge">{c.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coparticipação */}
      {copay.length > 0 && (
        <div className="qmodal-rules-section" style={{ '--rs-color': '#16a34a', '--rs-bg': '#f0fdf4', '--rs-border': '#bbf7d0' }}>
          <button className="qmodal-rules-section-header" onClick={() => toggle('copay')}>
            <div className="qmodal-rules-section-title"><FiCreditCard /><span>Coparticipação</span></div>
            <span className="qmodal-rules-chevron">{openSections.includes('copay') ? '∧' : '∨'}</span>
          </button>
          {openSections.includes('copay') && (
            <div className="qmodal-rules-section-body">
              {copay.map((c, i) => (
                <div key={i} className="qmodal-rules-row">
                  <span>{SERVICE_TYPE_LABELS[c.serviceType] || c.serviceType.replace(/_/g, ' ')}</span>
                  <span className="qmodal-rules-badge qmodal-rules-badge--green">{formatCopayValue(c)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documentos */}
      <div className="qmodal-rules-section" style={{ '--rs-color': '#7c3aed', '--rs-bg': '#faf5ff', '--rs-border': '#ddd6fe' }}>
        <button className="qmodal-rules-section-header" onClick={() => toggle('docs')}>
          <div className="qmodal-rules-section-title"><FiFolder /><span>Documentos Necessários</span></div>
          <span className="qmodal-rules-chevron">{openSections.includes('docs') ? '∧' : '∨'}</span>
        </button>
        {openSections.includes('docs') && (
          <div className="qmodal-rules-section-body">
            {DOCUMENTOS.map((d, i) => (
              <div key={i} className="qmodal-rules-row">
                <span>{d}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Modal ── */
export default function QuotationModal({ planId, ageCounts = {}, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calculator');
  const [plan, setPlan] = useState(null);
  const [availableAccommodationTypes, setAvailableAccommodationTypes] = useState([]);
  const [accommodationType, setAccommodationType] = useState('');
  const [withCopay, setWithCopay] = useState(false);
  const [withObstetrics, setWithObstetrics] = useState(false);
  const [copayRequired, setCopayRequired] = useState(false);
  const [obstetricsRequired, setObstetricsRequired] = useState(false);
  const [ageRangeQuantities, setAgeRangeQuantities] = useState([]);
  const [result, setResult] = useState(null);
  const [quotationName, setQuotationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { canShareFiles, sharePdf } = useSharePdf();

  const handleKeyDown = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [handleKeyDown]);

  useEffect(() => { loadPlan(); }, [planId]);

  async function loadPlan() {
    try {
      const res = await healthPlanApi.getById(planId);
      const planData = res.data.data;
      setPlan(planData);

      let accommodationTypes = planData.availableAccommodationTypes;
      if (!accommodationTypes?.length) {
        const firstMatrix = planData.priceTables?.[0]?.priceMatrix?.[0];
        const inferred = [];
        if (firstMatrix?.enfermaria != null) inferred.push('ENFERMARIA');
        if (firstMatrix?.apartamento != null) inferred.push('APARTAMENTO');
        accommodationTypes = inferred.length > 0 ? inferred : ['ENFERMARIA'];
      }
      setAvailableAccommodationTypes(accommodationTypes);
      setAccommodationType(accommodationTypes[0]);

      const modalities = new Set(planData.priceTables?.map(pt => pt.modality));
      if (planData.hasCopay && !(modalities.has('STANDARD') || modalities.has('WITH_OBSTETRICS'))) {
        setWithCopay(true); setCopayRequired(true);
      }
      if (planData.hasObstetrics && !(modalities.has('STANDARD') || modalities.has('WITH_COPAY'))) {
        setWithObstetrics(true); setObstetricsRequired(true);
      }

      const ageRanges = Array.from(new Set(planData.priceTables?.flatMap(pt => pt.priceMatrix?.map(pe => pe.ageRange) ?? []))).sort();
      setAgeRangeQuantities(ageRanges.map(ar => ({ ageRange: ar, quantity: ageCounts[ar] ?? 0 })));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar plano');
    } finally {
      setLoading(false);
    }
  }

  function resolveModality() {
    if (withCopay && withObstetrics) return 'WITH_COPAY_AND_OBSTETRICS';
    if (withCopay) return 'WITH_COPAY';
    if (withObstetrics) return 'WITH_OBSTETRICS';
    return 'STANDARD';
  }

  function getPriceForAgeRange(ageRange) {
    if (!plan?.priceTables || !accommodationType) return null;
    const totalLives = ageRangeQuantities.reduce((s, i) => s + i.quantity, 0);
    const modality = resolveModality();
    const table =
      plan.priceTables.find(pt => pt.modality === modality && totalLives >= (pt.minLives ?? 0) && totalLives <= (pt.maxLives ?? Infinity)) ||
      plan.priceTables.find(pt => totalLives >= (pt.minLives ?? 0) && totalLives <= (pt.maxLives ?? Infinity)) ||
      plan.priceTables[0];
    if (!table) return null;
    for (const pe of table.priceMatrix) {
      if (pe.ageRange === ageRange) return accommodationType === 'ENFERMARIA' ? pe.enfermaria : pe.apartamento;
    }
    return null;
  }

  function updateQuantity(index, value) {
    const num = Math.max(0, parseInt(value) || 0);
    setAgeRangeQuantities(prev => { const u = [...prev]; u[index] = { ...u[index], quantity: num }; return u; });
    setResult(null);
  }

  async function handleCalculate(e) {
    e.preventDefault();
    setError(''); setResult(null); setCalculating(true);
    const filtered = ageRangeQuantities.filter(a => a.quantity > 0);
    if (!filtered.length) { setError('Informe ao menos uma vida para calcular'); setCalculating(false); return; }
    try {
      const res = await quotationApi.calculate({ publicId: planId, accommodationType, withCopay: plan?.hasCopay ? withCopay : false, withObstetrics: plan?.hasObstetrics ? withObstetrics : false, ageRangeQuantities: filtered });
      setResult(res.data.data);
    } catch (err) { setError(err.response?.data?.message || 'Erro ao calcular cotação'); }
    finally { setCalculating(false); }
  }

  async function handleSave() {
    if (saved) return;
    setSaving(true); setError(''); setSuccess('');
    const filtered = ageRangeQuantities.filter(a => a.quantity > 0);
    try {
      await quotationApi.save({ quotationName: quotationName || null, publicId: planId, accommodationType, withCopay: plan?.hasCopay ? withCopay : null, withObstetrics: plan?.hasObstetrics ? withObstetrics : null, ageRangeQuantities: filtered });
      setSaved(true); setSuccess('Cotação salva com sucesso!');
      setTimeout(() => { onClose(); navigate('/quotations'); }, 1500);
    } catch (err) { setError(err.response?.data?.message || 'Erro ao salvar cotação'); setSaving(false); }
  }

  async function handleExportPdf() {
    const filtered = ageRangeQuantities.filter(a => a.quantity > 0);
    try {
      const res = await quotationApi.exportCalculatedPdf({ publicId: planId, accommodationType, withCopay: plan?.hasCopay ? withCopay : null, withObstetrics: plan?.hasObstetrics ? withObstetrics : null, ageRangeQuantities: filtered });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `cotacao_${plan?.name || 'plano'}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { setError(err.response?.data?.message || 'Erro ao exportar PDF'); }
  }

  async function handleSharePdf() {
    const filtered = ageRangeQuantities.filter(a => a.quantity > 0);
    try {
      const res = await quotationApi.exportCalculatedPdf({ publicId: planId, accommodationType, withCopay: plan?.hasCopay ? withCopay : null, withObstetrics: plan?.hasObstetrics ? withObstetrics : null, ageRangeQuantities: filtered });
      await sharePdf(res.data, `cotacao_${plan?.name || 'plano'}.pdf`);
    } catch (err) { if (err.name !== 'AbortError') setError(err.response?.data?.message || 'Erro ao compartilhar PDF'); }
  }

  function formatCurrency(v) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v); }

  const TABS = [
    { id: 'calculator', label: 'Tabela de Preços',  Icon: FiGrid     },
    { id: 'network',    label: 'Rede Credenciada',  Icon: FiShare    },
    { id: 'rules',      label: 'Regras & Copart',   Icon: FiFileText },
  ];

  return (
    <div className="qmodal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="qmodal">

        {/* ── Header ── */}
        <div className="qmodal-header">
          <div className="qmodal-plan-info">
            {plan?.logoUrl && <img src={plan.logoUrl} alt={getOperatorName(plan?.operator)} className="qmodal-logo" />}
            <div>
              <h2 className="qmodal-title">{loading ? 'Carregando...' : plan?.name}</h2>
              {plan && <p className="qmodal-operator">{getOperatorName(plan.operator)} • {plan.coverage === 'NATIONAL' ? 'Nacional' : plan.coverage === 'REGIONAL' ? 'Regional' : 'Municipal'}</p>}
            </div>
          </div>
          <button className="qmodal-close" onClick={onClose} aria-label="Fechar"><FiX /></button>
        </div>

        {/* ── Tabs ── */}
        {!loading && (
          <div className="qmodal-tabs">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`qmodal-tab${activeTab === id ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Body ── */}
        <div className="qmodal-body">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner" />
              <span className="loading-text">Carregando plano...</span>
            </div>
          ) : activeTab === 'network' ? (
            <NetworkTab plan={plan} />
          ) : activeTab === 'rules' ? (
            <RulesTab plan={plan} />
          ) : (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleCalculate} className="calc-form">
                <div className="calc-section">
                  <h2>Tipo de Acomodação</h2>
                  <div className="radio-group">
                    {availableAccommodationTypes.map(type => (
                      <label key={type} className={`radio-card ${accommodationType === type ? 'active' : ''}`}>
                        <input type="radio" name="accommodation" value={type} checked={accommodationType === type}
                          onChange={e => { setAccommodationType(e.target.value); setResult(null); }} />
                        <span>{type === 'ENFERMARIA' ? 'Enfermaria' : 'Apartamento'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {(plan.hasCopay || plan.hasObstetrics) && (
                  <div className="calc-section">
                    <h2>Opções do Plano</h2>
                    <div className="radio-group">
                      {plan.hasCopay && (
                        <label className={`radio-card ${withCopay ? 'active' : ''} ${copayRequired ? 'locked' : ''}`}>
                          <input type="checkbox" checked={withCopay} disabled={copayRequired}
                            onChange={e => { setWithCopay(e.target.checked); setResult(null); }} />
                          <span>Com Coparticipação{copayRequired ? ' (incluso)' : ''}</span>
                        </label>
                      )}
                      {plan.hasObstetrics && (
                        <label className={`radio-card ${withObstetrics ? 'active' : ''} ${obstetricsRequired ? 'locked' : ''}`}>
                          <input type="checkbox" checked={withObstetrics} disabled={obstetricsRequired}
                            onChange={e => { setWithObstetrics(e.target.checked); setResult(null); }} />
                          <span>Com Obstetrícia{obstetricsRequired ? ' (incluso)' : ''}</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div className="calc-section">
                  <h2>Quantidade de Vidas por Faixa Etária</h2>
                  <div className="age-range-grid">
                    <div className="age-range-header">
                      <span>Faixa Etária</span><span>Valor Unitário</span><span>Vidas</span><span>Subtotal</span>
                    </div>
                    {ageRangeQuantities.map((item, index) => {
                      const price = getPriceForAgeRange(item.ageRange);
                      const subtotal = price != null ? price * item.quantity : null;
                      return (
                        <div key={item.ageRange} className={`age-range-item${item.quantity > 0 ? ' age-range-item--active' : ''}`}>
                          <span className="age-range-label">{item.ageRange} anos</span>
                          <span className="age-range-price">{price != null ? formatCurrency(price) : '—'}</span>
                          <div className="lives-counter">
                            <button
                              type="button"
                              className="lives-btn lives-btn--minus"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              disabled={item.quantity === 0}
                            >−</button>
                            <span className="lives-value">{item.quantity}</span>
                            <button
                              type="button"
                              className="lives-btn lives-btn--plus"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                            >+</button>
                          </div>
                          <div className="age-range-subtotal">
                            <span className={subtotal != null && item.quantity > 0 ? 'subtotal-value' : ''}>
                              {subtotal != null && item.quantity > 0 ? formatCurrency(subtotal) : '—'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="age-range-total">
                      <span>Total</span><span></span>
                      <span className="age-range-total-lives">{ageRangeQuantities.reduce((s, i) => s + i.quantity, 0)} vidas</span>
                      <span className="age-range-total-value">
                        {formatCurrency(ageRangeQuantities.reduce((s, i) => { const p = getPriceForAgeRange(i.ageRange); return s + (p != null ? p * i.quantity : 0); }, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={calculating}>
                  {calculating ? 'Calculando...' : 'Calcular Cotação'}
                </button>
              </form>

              {result && (
                <div className="result-section">
                  <h2>Resultado da Cotação</h2>
                  <div className="result-card">
                    <div className="result-header">
                      <div>
                        <strong>{result.healthPlanName}</strong>
                        <span className="result-operator">{getOperatorName(result.operator)}</span>
                      </div>
                      <div>
                        <span className="result-accommodation">
                          {result.accommodationType === 'ENFERMARIA' ? 'Enfermaria' : 'Apartamento'}
                        </span>
                        {result.hasObstetrics && <span className="result-accommodation"> | Obstetrícia</span>}
                      </div>
                    </div>
                    <table className="result-table">
                      <thead><tr><th>Faixa Etária</th><th>Qtd</th><th>Valor Unit.</th><th>Subtotal</th></tr></thead>
                      <tbody>
                        {result.ageRangePrices?.map(item => (
                          <tr key={item.ageRange}>
                            <td>{item.ageRange} anos</td><td>{item.quantity}</td>
                            <td>{formatCurrency(item.unitPrice)}</td><td>{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="2"><strong>Total ({result.totalLives} vidas)</strong></td>
                          <td></td><td><strong>{formatCurrency(result.monthlyTotal)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                    {result.hasCopay && result.copayDetails?.length > 0 && (
                      <div className="copay-section">
                        <h3>Coparticipação</h3>
                        <div className="copay-list">
                          {result.copayDetails.map((c, i) => (
                            <div key={i} className="copay-item">
                              <span>{c.serviceType.replace(/_/g, ' ')}</span>
                              <span>{c.chargeType === 'EXEMPT' ? 'Isento' : c.chargeType === 'PERCENTAGE' ? `${c.value}%` : formatCurrency(c.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="result-actions">
                      <div className="form-group save-name-group">
                        <input type="text" value={quotationName} onChange={e => setQuotationName(e.target.value)} placeholder="Nome da cotação (opcional)" />
                      </div>
                      <div className="result-buttons">
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving || saved}>
                          <FiSave /> {saved ? 'Salva!' : saving ? 'Salvando...' : 'Salvar Cotação'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleExportPdf}><FiDownload /> PDF</button>
                        {canShareFiles && (
                          <button className="btn btn-secondary" onClick={handleSharePdf}><FiShare2 /> Compartilhar</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
