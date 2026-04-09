import { useState, useEffect } from 'react';

const getOperatorName = (operator) =>
  typeof operator === 'string' ? operator : (operator?.name ?? '');
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { healthPlanApi } from '../../api/healthPlanApi';
import { quotationApi } from '../../api/quotationApi';
import { FiSave, FiDownload, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { useSharePdf } from '../../hooks/useSharePdf';
import './Quotations.css';

export default function QuotationCalculator() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { state: routeState } = useLocation();
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

  useEffect(() => {
    loadPlan();
  }, [planId]);

  async function loadPlan() {
    try {
      const res = await healthPlanApi.getById(planId);
      const planData = res.data.data;
      setPlan(planData);

      // Determine available accommodation types from plan data or infer from priceMatrix
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

      // Detectar modalidades obrigatórias a partir das priceTables
      const modalities = new Set(planData.priceTables?.map((pt) => pt.modality));
      const hasStandardOrObsOnly = modalities.has('STANDARD') || modalities.has('WITH_OBSTETRICS');
      const hasStandardOrCopayOnly = modalities.has('STANDARD') || modalities.has('WITH_COPAY');

      if (planData.hasCopay && !hasStandardOrObsOnly) {
        setWithCopay(true);
        setCopayRequired(true);
      }
      if (planData.hasObstetrics && !hasStandardOrCopayOnly) {
        setWithObstetrics(true);
        setObstetricsRequired(true);
      }

      const ageRanges = extractAgeRanges(planData.priceTables);
      const prefilledCounts = routeState?.ageCounts ?? {};
      setAgeRangeQuantities(ageRanges.map((ar) => ({
        ageRange: ar,
        quantity: prefilledCounts[ar] ?? 0,
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar plano');
    } finally {
      setLoading(false);
    }
  }

  function extractAgeRanges(priceTables) {
    const ranges = new Set();
    priceTables?.forEach((pt) => {
      pt.priceMatrix?.forEach((pe) => {
        ranges.add(pe.ageRange);
      });
    });
    return Array.from(ranges).sort();
  }

  function resolveModality() {
    if (withCopay && withObstetrics) return 'WITH_COPAY_AND_OBSTETRICS';
    if (withCopay) return 'WITH_COPAY';
    if (withObstetrics) return 'WITH_OBSTETRICS';
    return 'STANDARD';
  }

  function getPriceForAgeRange(ageRange) {
    if (!plan?.priceTables || !accommodationType) return null;

    const totalLives = ageRangeQuantities.reduce((sum, item) => sum + item.quantity, 0);
    const modality = resolveModality();

    // Try to match by modality + lives range; fall back to lives range only; then any table
    const table =
      plan.priceTables.find(
        (pt) =>
          pt.modality === modality &&
          totalLives >= (pt.minLives ?? 0) &&
          totalLives <= (pt.maxLives ?? Infinity)
      ) ||
      plan.priceTables.find(
        (pt) =>
          totalLives >= (pt.minLives ?? 0) &&
          totalLives <= (pt.maxLives ?? Infinity)
      ) ||
      plan.priceTables[0];

    if (!table) return null;

    for (const pe of table.priceMatrix) {
      if (pe.ageRange === ageRange) {
        return accommodationType === 'ENFERMARIA' ? pe.enfermaria : pe.apartamento;
      }
    }
    return null;
  }

  function updateQuantity(index, value) {
    const num = Math.max(0, parseInt(value) || 0);
    setAgeRangeQuantities((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: num };
      return updated;
    });
    setResult(null);
  }

  async function handleCalculate(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setCalculating(true);

    const filtered = ageRangeQuantities.filter((a) => a.quantity > 0);
    if (filtered.length === 0) {
      setError('Informe ao menos uma vida para calcular');
      setCalculating(false);
      return;
    }

    try {
      const res = await quotationApi.calculate({
        publicId: planId,
        accommodationType,
        withCopay: plan?.hasCopay ? withCopay : false,
        withObstetrics: plan?.hasObstetrics ? withObstetrics : false,
        ageRangeQuantities: filtered,
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao calcular cotação');
    } finally {
      setCalculating(false);
    }
  }

  async function handleSave() {
    if (saved) return;
    setSaving(true);
    setError('');
    setSuccess('');

    const filtered = ageRangeQuantities.filter((a) => a.quantity > 0);

    try {
      await quotationApi.save({
        quotationName: quotationName || null,
        publicId: planId,
        accommodationType,
        withCopay: plan?.hasCopay ? withCopay : null,
        withObstetrics: plan?.hasObstetrics ? withObstetrics : null,
        ageRangeQuantities: filtered,
      });
      setSaved(true);
      setSuccess('Cotação salva com sucesso!');
      setTimeout(() => navigate('/quotations'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar cotação');
      setSaving(false);
    }
  }

  async function handleExportPdf() {
    const filtered = ageRangeQuantities.filter((a) => a.quantity > 0);
    try {
      const res = await quotationApi.exportCalculatedPdf({
        publicId: planId,
        accommodationType,
        withCopay: plan?.hasCopay ? withCopay : null,
        withObstetrics: plan?.hasObstetrics ? withObstetrics : null,
        ageRangeQuantities: filtered,
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotacao_${plan?.name || 'plano'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao exportar PDF');
    }
  }

  async function handleSharePdf() {
    const filtered = ageRangeQuantities.filter((a) => a.quantity > 0);
    try {
      const res = await quotationApi.exportCalculatedPdf({
        publicId: planId,
        accommodationType,
        withCopay: plan?.hasCopay ? withCopay : null,
        withObstetrics: plan?.hasObstetrics ? withObstetrics : null,
        ageRangeQuantities: filtered,
      });
      const fileName = `cotacao_${plan?.name || 'plano'}.pdf`;
      await sharePdf(res.data, fileName);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.message || 'Erro ao compartilhar PDF');
      }
    }
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  if (loading) return <div className="loading">Carregando plano...</div>;
  if (!plan) return <div className="empty-state">Plano não encontrado</div>;

  return (
    <div className="quotation-calculator">
      <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
        <FiArrowLeft /> Voltar
      </button>

      <div className="plan-detail-header">
        <div className="plan-detail-info">
          {plan.logoUrl && <img src={plan.logoUrl} alt={getOperatorName(plan.operator)} className="plan-logo-lg" />}
          <div>
            <h1>{plan.name}</h1>
            <p className="plan-detail-operator">{getOperatorName(plan.operator)}</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleCalculate} className="calc-form">
        <div className="calc-section">
          <h2>Tipo de Acomodação</h2>
          <div className="radio-group">
            {availableAccommodationTypes.map((type) => (
              <label key={type} className={`radio-card ${accommodationType === type ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="accommodation"
                  value={type}
                  checked={accommodationType === type}
                  onChange={(e) => {
                    setAccommodationType(e.target.value);
                    setResult(null);
                  }}
                />
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
                  <input
                    type="checkbox"
                    checked={withCopay}
                    disabled={copayRequired}
                    onChange={(e) => {
                      setWithCopay(e.target.checked);
                      setResult(null);
                    }}
                  />
                  <span>Com Coparticipação{copayRequired ? ' (incluso)' : ''}</span>
                </label>
              )}
              {plan.hasObstetrics && (
                <label className={`radio-card ${withObstetrics ? 'active' : ''} ${obstetricsRequired ? 'locked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={withObstetrics}
                    disabled={obstetricsRequired}
                    onChange={(e) => {
                      setWithObstetrics(e.target.checked);
                      setResult(null);
                    }}
                  />
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
              <span>Faixa Etária</span>
              <span>Valor Unitário</span>
              <span>Vidas</span>
              <span>Subtotal</span>
            </div>
            {ageRangeQuantities.map((item, index) => {
              const price = getPriceForAgeRange(item.ageRange);
              const subtotal = price != null ? price * item.quantity : null;
              return (
                <div key={item.ageRange} className="age-range-item">
                  <span className="age-range-label">{item.ageRange} anos</span>
                  <span className="age-range-price">
                    {price != null ? formatCurrency(price) : '—'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(index, e.target.value)}
                  />
                  <div className="age-range-subtotal">
                    <span>{subtotal != null && item.quantity > 0 ? formatCurrency(subtotal) : '—'}</span>
                  </div>
                </div>
              );
            })}
            <div className="age-range-total">
              <span>Total</span>
              <span></span>
              <span className="age-range-total-lives">
                {ageRangeQuantities.reduce((sum, item) => sum + item.quantity, 0)} vidas
              </span>
              <span className="age-range-total-value">
                {formatCurrency(
                  ageRangeQuantities.reduce((sum, item) => {
                    const price = getPriceForAgeRange(item.ageRange);
                    return sum + (price != null ? price * item.quantity : 0);
                  }, 0)
                )}
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
              <thead>
                <tr>
                  <th>Faixa Etária</th>
                  <th>Qtd</th>
                  <th>Valor Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {result.ageRangePrices?.map((item) => (
                  <tr key={item.ageRange}>
                    <td>{item.ageRange} anos</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2"><strong>Total ({result.totalLives} vidas)</strong></td>
                  <td></td>
                  <td><strong>{formatCurrency(result.monthlyTotal)}</strong></td>
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
                      <span>
                        {c.chargeType === 'EXEMPT'
                          ? 'Isento'
                          : c.chargeType === 'PERCENTAGE'
                          ? `${c.value}%`
                          : formatCurrency(c.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="result-actions">
              <div className="form-group save-name-group">
                <input
                  type="text"
                  value={quotationName}
                  onChange={(e) => setQuotationName(e.target.value)}
                  placeholder="Nome da cotação (opcional)"
                />
              </div>
              <div className="result-buttons">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || saved}>
                  <FiSave /> {saved ? 'Cotação Salva' : saving ? 'Salvando...' : 'Salvar Cotação'}
                </button>
                <button className="btn btn-secondary" onClick={handleExportPdf}>
                  <FiDownload /> Exportar PDF
                </button>
                {canShareFiles && (
                  <button className="btn btn-secondary" onClick={handleSharePdf}>
                    <FiShare2 /> Compartilhar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
