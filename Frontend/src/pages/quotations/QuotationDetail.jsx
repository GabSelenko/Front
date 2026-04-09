import { useState, useEffect } from 'react';

const getOperatorName = (operator) =>
  typeof operator === 'string' ? operator : (operator?.name ?? '');
import { useParams, useNavigate } from 'react-router-dom';
import { quotationApi } from '../../api/quotationApi';
import { FiArrowLeft, FiDownload, FiShare2 } from 'react-icons/fi';
import { useSharePdf } from '../../hooks/useSharePdf';
import './Quotations.css';

export default function QuotationDetail() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { canShareFiles, sharePdf } = useSharePdf();

  useEffect(() => {
    loadQuotation();
  }, [publicId]);

  async function loadQuotation() {
    try {
      const res = await quotationApi.getById(publicId);
      setQuotation(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar cotação');
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPdf() {
    try {
      const res = await quotationApi.exportSavedPdf(publicId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quotation?.quotationName || 'cotacao'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao exportar PDF');
    }
  }

  async function handleSharePdf() {
    try {
      const res = await quotationApi.exportSavedPdf(publicId);
      const fileName = `${quotation?.quotationName || 'cotacao'}.pdf`;
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

  if (loading) return <div className="loading">Carregando...</div>;
  if (!quotation) return <div className="empty-state">Cotação não encontrada</div>;

  const r = quotation.result;

  return (
    <div className="quotation-detail">
      <div className="detail-top-bar">
        <button className="btn btn-ghost" onClick={() => navigate('/quotations')}>
          <FiArrowLeft /> Voltar
        </button>
        <div className="detail-top-actions">
          {canShareFiles && (
            <button className="btn btn-secondary" onClick={handleSharePdf}>
              <FiShare2 /> Compartilhar
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleExportPdf}>
            <FiDownload /> Exportar PDF
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-card">
        <h1>{quotation.quotationName}</h1>
        <p className="detail-date">
          Criada em {new Date(quotation.createdAt).toLocaleDateString('pt-BR')}
        </p>

        <div className="detail-plan-info">
          {r.logoUrl && <img src={r.logoUrl} alt={getOperatorName(r.operator)} className="plan-logo-lg" />}
          <div>
            <h2>{r.healthPlanName}</h2>
            <p>{getOperatorName(r.operator)}</p>
            <span className="tag">
              {r.accommodationType === 'ENFERMARIA' ? 'Enfermaria' : 'Apartamento'}
            </span>
            {r.hasObstetrics && <span className="tag tag-green">Obstetrícia</span>}
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
            {r.ageRangePrices?.map((item) => (
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
              <td colSpan="2"><strong>Total ({r.totalLives} vidas)</strong></td>
              <td></td>
              <td><strong>{formatCurrency(r.monthlyTotal)}</strong></td>
            </tr>
          </tfoot>
        </table>

        {r.hasCopay && r.copayDetails?.length > 0 && (
          <div className="copay-section">
            <h3>Coparticipação</h3>
            <div className="copay-list">
              {r.copayDetails.map((c, i) => (
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
      </div>
    </div>
  );
}
