import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { healthPlanApi } from '../../api/healthPlanApi';
import { cityApi } from '../../api/cityApi';
import {
  FiSearch, FiChevronRight, FiFilter, FiSliders,
  FiMapPin, FiChevronDown, FiFileText, FiUsers,
  FiActivity, FiTrendingUp,
} from 'react-icons/fi';
import { getOperatorLogo, getOperatorColors } from '../../utils/operatorLogos';
import OperatorPlansModal from './OperatorPlansModal';
import QuotationModal from '../quotations/QuotationModal';
import './Dashboard.css';

// ─── Pure helpers (module-level, never re-created) ───────────────────────────

const getOperatorName = (operator) =>
  typeof operator === 'string' ? operator : (operator?.name ?? '');

const COVERAGE_LABEL = { NATIONAL: 'Nacional', REGIONAL: 'Regional', MUNICIPAL: 'Municipal' };

const TAG_FILTERS = [
  { key: 'hasCopay',     label: 'Coparticipação', className: 'tag-yellow' },
  { key: 'hasObstetrics', label: 'Obstetrícia',   className: 'tag-green'  },
];

const COVERAGE_FILTERS = [
  { value: 'NATIONAL',  label: 'Nacional'  },
  { value: 'REGIONAL',  label: 'Regional'  },
  { value: 'MUNICIPAL', label: 'Municipal' },
];

const PLAN_TABS = [
  { value: null,             label: 'P. Física' },
  { value: 'PessoaFisica',   label: 'PME'       },
  { value: 'PessoaJuridica', label: 'Adesão'    },
];

const SORT_OPTIONS = [
  { value: 'default',  label: 'Padrão'       },
  { value: 'name',     label: 'Nome A–Z'      },
  { value: 'operator', label: 'Operadora A–Z' },
];

const AGE_RANGES = [
  { label: '0-18',  min: 0,  max: 18 },
  { label: '19-23', min: 19, max: 23 },
  { label: '24-28', min: 24, max: 28 },
  { label: '29-33', min: 29, max: 33 },
  { label: '34-38', min: 34, max: 38 },
  { label: '39-43', min: 39, max: 43 },
  { label: '44-48', min: 44, max: 48 },
  { label: '49-53', min: 49, max: 53 },
  { label: '54-58', min: 54, max: 58 },
  { label: '59+',   min: 59, max: 99 },
];

const initialAgeCounts = Object.fromEntries(AGE_RANGES.map(r => [r.label, 0]));

// ─── Memoized operator card ───────────────────────────────────────────────────

const OperatorCard = memo(function OperatorCard({ name, plans, colorIdx, onSelect }) {
  const logo   = plans[0]?.logoUrl || getOperatorLogo(name);
  const colors = getOperatorColors(name);
  const headerStyle = colors
    ? { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }
    : undefined;

  return (
    <div
      className={`operator-card${!colors ? ` operator-card--c${colorIdx % 6}` : ''}`}
      onClick={onSelect}
    >
      <div className="operator-card-header" style={headerStyle}>
        {logo ? (
          <div className="operator-logo-wrap">
            <img src={logo} alt={name} className="operator-logo" loading="lazy" />
          </div>
        ) : (
          <div className="plan-logo-placeholder">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="plan-card-header-text">
          <h3>{name}</h3>
          <span className="plan-operator">
            {plans.length} {plans.length === 1 ? 'plano' : 'planos'}
          </span>
        </div>
      </div>

      <div className="operator-card-body">
        <ul className="operator-plan-list">
          {plans.slice(0, 4).map(p => (
            <li key={p.id} className="operator-plan-item">
              <span className="operator-plan-name">{p.name}</span>
              {p.coverage && (
                <span className="operator-plan-tags">
                  <span className="tag">{COVERAGE_LABEL[p.coverage] ?? p.coverage}</span>
                </span>
              )}
            </li>
          ))}
          {plans.length > 4 && (
            <li className="operator-plan-item operator-plan-more">
              +{plans.length - 4} mais planos
            </li>
          )}
        </ul>
      </div>

      <div className="plan-card-footer">
        <span>Ver planos</span>
        <FiChevronRight />
      </div>
    </div>
  );
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [plans, setPlans]               = useState([]);
  const [cities, setCities]             = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [ageCounts, setAgeCounts]       = useState(initialAgeCounts);
  const [search, setSearch]             = useState('');
  const [activeTagFilters, setActiveTagFilters] = useState([]);
  const [activeCategory, setActiveCategory]     = useState(null);
  const [activeCoverage, setActiveCoverage]     = useState(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [sortOrder, setSortOrder]       = useState('default');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedPlan, setSelectedPlan]         = useState(null);

  useEffect(() => {
    healthPlanApi.getAll()
      .then(res => setPlans(res.data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Erro ao carregar planos'))
      .finally(() => setLoading(false));
    cityApi.getAll().then(res => setCities(res.data.data || [])).catch(() => {});
  }, []);

  // ── Stable callbacks ──────────────────────────────────────────────────────

  const toggleTagFilter = useCallback((key) => {
    setActiveTagFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  const toggleCoverage = useCallback((value) => {
    setActiveCoverage(prev => prev === value ? null : value);
  }, []);

  const adjustAge = useCallback((label, delta) => {
    setAgeCounts(prev => ({ ...prev, [label]: Math.max(0, (prev[label] || 0) + delta) }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTagFilters([]);
    setActiveCoverage(null);
  }, []);

  const closeOperator  = useCallback(() => setSelectedOperator(null), []);
  const closePlan      = useCallback(() => setSelectedPlan(null), []);
  const handleSelectPlan = useCallback(plan => setSelectedPlan(plan), []);

  // ── Derived state (all memoized) ──────────────────────────────────────────

  const totalLives = useMemo(
    () => Object.values(ageCounts).reduce((s, v) => s + v, 0),
    [ageCounts]
  );

  const hasActiveFilters = useMemo(
    () => activeTagFilters.length > 0 || !!activeCoverage,
    [activeTagFilters, activeCoverage]
  );

  // Stable reference — only changes when ageCounts changes
  const selectedRanges = useMemo(
    () => AGE_RANGES.filter(r => ageCounts[r.label] > 0),
    [ageCounts]
  );

  const activeOperators = useMemo(
    () => new Set(plans.map(p => getOperatorName(p.operator))).size,
    [plans]
  );

  // Single pass: filter + group + sort
  const { groupedByOperator, totalFiltered } = useMemo(() => {
    const q = search.toLowerCase();
    const map = new Map();

    for (const p of plans) {
      const opName = getOperatorName(p.operator);

      // filter
      if (q && !p.name.toLowerCase().includes(q) && !opName.toLowerCase().includes(q)) continue;
      if (activeTagFilters.length && !activeTagFilters.every(k => p[k])) continue;
      if (activeCategory && p.category !== activeCategory) continue;
      if (activeCoverage && p.coverage !== activeCoverage) continue;
      if (selectedRanges.length) {
        const minAge = p.minAge ?? 0;
        const maxAge = p.maxAge ?? 99;
        if (!selectedRanges.every(r => minAge <= r.min && maxAge >= r.max)) continue;
      }
      if (selectedCity && p.priceTables?.length) {
        if (!p.priceTables.some(t => !t.cityId || t.cityId === selectedCity)) continue;
      }

      if (!map.has(opName)) map.set(opName, []);
      map.get(opName).push(p);
    }

    let entries = [...map.entries()].map(([name, plans]) => ({ name, plans }));

    if (sortOrder === 'operator' || sortOrder === 'name') {
      entries.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortOrder === 'name') {
      entries.forEach(e => e.plans.sort((a, b) => a.name.localeCompare(b.name)));
    }

    const totalFiltered = entries.reduce((s, e) => s + e.plans.length, 0);
    return { groupedByOperator: entries, totalFiltered };
  }, [plans, search, activeTagFilters, activeCategory, activeCoverage, selectedRanges, selectedCity, sortOrder]);

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      <span className="loading-text">Carregando planos...</span>
    </div>
  );

  return (
    <>
      {/* ── Sticky Header ── */}
      <div className="dashboard-sticky-header">
        <div className="dashboard-header-inner">

          <div className="dash-header-row">
            <div className="dash-title-group">
              <h1 className="dash-title">Planos de Saúde</h1>
              <span className="dash-subtitle">Compare e cote planos para seus clientes</span>
            </div>
            <div className="dash-search-wrap">
              <div className="dashboard-search-bar">
                <FiSearch className="dsb-icon" />
                <input
                  type="text"
                  className="dsb-input"
                  placeholder="Buscar por nome ou operadora..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                className={`filter-toggle${showFilters ? ' active' : ''}`}
                onClick={() => setShowFilters(v => !v)}
                title="Filtros avançados"
              >
                <FiSliders />
                {hasActiveFilters && <span className="filter-badge" />}
              </button>
            </div>
          </div>

          {/* Age / City filter row */}
          <div className="age-filter-bar">
            <div className="age-filter-city">
              <FiMapPin className="age-filter-city-icon" />
              <select
                className="age-filter-city-select"
                value={selectedCity || ''}
                onChange={e => setSelectedCity(e.target.value || null)}
              >
                <option value="">Todas as cidades</option>
                {cities.map(c => (
                  <option key={c.publicId} value={c.publicId}>{c.name}, {c.state}</option>
                ))}
              </select>
              <FiChevronDown className="age-filter-city-chevron" />
            </div>

            <div className="age-filter-divider" />

            <div className="age-filter-ranges">
              <div className="age-filter-ranges-header">
                <span className="age-filter-label">Vidas para cotar</span>
                {totalLives > 0 && (
                  <span className="age-filter-lives">
                    {totalLives} {totalLives === 1 ? 'vida' : 'vidas'}
                  </span>
                )}
              </div>
              <div className="age-filter-grid">
                {AGE_RANGES.map(r => {
                  const count  = ageCounts[r.label];
                  const active = count > 0;
                  return (
                    <div key={r.label} className={`dash-age-chip${active ? ' active' : ''}`}>
                      <span className="dash-age-chip-label">{r.label}</span>
                      <div className="dash-age-chip-controls">
                        <button
                          type="button"
                          className="age-range-btn"
                          onClick={e => { e.stopPropagation(); adjustAge(r.label, -1); }}
                          disabled={count === 0}
                        >−</button>
                        <span className="age-range-count">{count}</span>
                        <button
                          type="button"
                          className="age-range-btn age-range-btn-plus"
                          onClick={e => { e.stopPropagation(); adjustAge(r.label, 1); }}
                        >+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Expandable filters */}
          <div className={`filters-bar${showFilters ? ' open' : ''}`}>
            <div className="filters-bar-inner">
              <div className="filters-icon"><FiFilter /><span>Filtros</span></div>
              <div className="filter-groups">
                <div className="filter-group">
                  {TAG_FILTERS.map(tf => (
                    <button
                      key={tf.key}
                      className={`filter-chip ${tf.className}${activeTagFilters.includes(tf.key) ? ' active' : ''}`}
                      onClick={() => toggleTagFilter(tf.key)}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
                <div className="filter-divider" />
                <div className="filter-group">
                  {COVERAGE_FILTERS.map(cf => (
                    <button
                      key={cf.value}
                      className={`filter-chip${activeCoverage === cf.value ? ' active' : ''}`}
                      onClick={() => toggleCoverage(cf.value)}
                    >
                      {cf.label}
                    </button>
                  ))}
                </div>
              </div>
              {hasActiveFilters && (
                <button className="clear-filters" onClick={clearFilters}>Limpar filtros</button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="dashboard">

        {/* ── Metrics ── */}
        <div className="dashboard-metrics">
          <div className="metric-card">
            <div className="metric-icon metric-blue"><FiFileText /></div>
            <div className="metric-body">
              <span className="metric-value">{plans.length}</span>
              <span className="metric-label">Planos Disponíveis</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon metric-green"><FiUsers /></div>
            <div className="metric-body">
              <span className="metric-value">{activeOperators}</span>
              <span className="metric-label">Operadoras Ativas</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon metric-purple"><FiActivity /></div>
            <div className="metric-body">
              <span className="metric-value">{totalLives}</span>
              <span className="metric-label">Vidas Selecionadas</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon metric-orange"><FiTrendingUp /></div>
            <div className="metric-body">
              <span className="metric-value">{totalFiltered}</span>
              <span className="metric-label">Planos Filtrados</span>
            </div>
          </div>
        </div>

        {/* ── Plan Type Tabs ── */}
        <div className="plan-tabs">
          {PLAN_TABS.map(tab => (
            <button
              key={String(tab.value)}
              className={`plan-tab${activeCategory === tab.value ? ' active' : ''}`}
              onClick={() => setActiveCategory(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Operators List Header ── */}
        {groupedByOperator.length > 0 && (
          <div className="plans-list-header">
            <div>
              <h2 className="plans-list-title">Operadoras</h2>
              <span className="plans-list-count">
                {groupedByOperator.length} {groupedByOperator.length === 1 ? 'operadora' : 'operadoras'} · {totalFiltered} {totalFiltered === 1 ? 'plano' : 'planos'}
              </span>
            </div>
            <div className="sort-wrap">
              <select
                className="sort-select"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>Ordenar: {o.label}</option>
                ))}
              </select>
              <FiChevronDown className="sort-chevron" />
            </div>
          </div>
        )}

        {/* ── Operators Grid ── */}
        {groupedByOperator.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FiSearch /></div>
            <span className="empty-state-title">Nenhuma operadora encontrada</span>
            <span className="empty-state-desc">Tente ajustar os filtros ou a busca para encontrar planos disponíveis.</span>
          </div>
        ) : (
          <div className="operators-grid">
            {groupedByOperator.map(({ name, plans: opPlans }, idx) => (
              <OperatorCard
                key={name}
                name={name}
                plans={opPlans}
                colorIdx={idx}
                onSelect={() => setSelectedOperator({ name, plans: opPlans })}
              />
            ))}
          </div>
        )}
      </div>

      {selectedOperator && (
        <OperatorPlansModal
          operatorName={selectedOperator.name}
          plans={selectedOperator.plans}
          ageCounts={ageCounts}
          onClose={closeOperator}
          onSelectPlan={handleSelectPlan}
        />
      )}

      {selectedPlan && (
        <QuotationModal
          planId={selectedPlan.id}
          ageCounts={selectedPlan.ageCounts}
          onClose={closePlan}
        />
      )}
    </>
  );
}
