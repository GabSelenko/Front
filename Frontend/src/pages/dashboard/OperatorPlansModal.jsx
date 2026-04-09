import { FiX, FiChevronRight } from 'react-icons/fi';
import { getOperatorLogo, getOperatorColors } from '../../utils/operatorLogos';

const CATEGORY_LABELS = {
  PessoaFisica: 'Pessoa Física',
  PessoaJuridica: 'Pessoa Jurídica',
};

const COVERAGE_LABELS = {
  NATIONAL: 'Nacional',
  REGIONAL: 'Regional',
  MUNICIPAL: 'Municipal',
};

const getOperatorName = (operator) =>
  typeof operator === 'string' ? operator : (operator?.name ?? '');

export default function OperatorPlansModal({ operatorName, plans, ageCounts, onClose, onSelectPlan }) {
  const logo   = plans[0]?.logoUrl || getOperatorLogo(operatorName);
  const colors = getOperatorColors(operatorName);
  const headerStyle = colors
    ? { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }
    : undefined;

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="opm-backdrop" onClick={handleBackdrop}>
        <div className="opm-panel">
          {/* Header */}
          <div className="opm-header" style={headerStyle}>
            <div className="opm-header-left">
              {logo ? (
                <div className="opm-logo-wrap">
                  <img src={logo} alt={operatorName} className="opm-logo" />
                </div>
              ) : (
                <div className="opm-logo-placeholder">
                  {operatorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="opm-header-text">
                <h2 className="opm-title">{operatorName}</h2>
                <span className="opm-count">
                  {plans.length} {plans.length === 1 ? 'plano disponível' : 'planos disponíveis'}
                </span>
              </div>
            </div>
            <button className="opm-close" onClick={onClose} aria-label="Fechar">
              <FiX />
            </button>
          </div>

          {/* Plans grid */}
          <div className="opm-body">
            <div className="opm-plans-grid">
              {plans.map((plan, idx) => (
                <div
                  key={plan.id}
                  className={`opm-plan-card plan-card--c${idx % 6}`}
                  onClick={() => onSelectPlan({ id: plan.id, ageCounts })}
                >
                  <div className="opm-plan-card-header">
                    <div className="opm-plan-card-header-text">
                      <h3>{plan.name}</h3>
                      <span className="plan-operator">{getOperatorName(plan.operator)}</span>
                    </div>
                  </div>

                  <div className="opm-plan-card-body">
                    <div className="plan-features-grid">
                      <span className="tag">{CATEGORY_LABELS[plan.category] || plan.category}</span>
                      <span className="tag">{COVERAGE_LABELS[plan.coverage] || plan.coverage}</span>
                      <span className={`tag tag-yellow${!plan.hasCopay ? ' tag-disabled' : ''}`}>Coparticipação</span>
                      <span className={`tag tag-green${!plan.hasObstetrics ? ' tag-disabled' : ''}`}>Obstetrícia</span>
                      {plan.availableAccommodationTypes?.map(t => (
                        <span key={t} className="accommodation-badge">
                          {t === 'ENFERMARIA' ? 'Enfermaria' : 'Apartamento'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="opm-plan-card-footer">
                    <span>Cotar este plano</span>
                    <FiChevronRight />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
