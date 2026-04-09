import { useState, useEffect } from 'react';

const getOperatorName = (operator) =>
  typeof operator === 'string' ? operator : (operator?.name ?? '');
import { useNavigate } from 'react-router-dom';
import { quotationApi } from '../../api/quotationApi';
import { FiTrash2, FiDownload, FiEye, FiShare2 } from 'react-icons/fi';
import { useSharePdf } from '../../hooks/useSharePdf';
import ConfirmModal from '../../components/ConfirmModal';
import './Quotations.css';

export default function MyQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const navigate = useNavigate();
  const { canShareFiles, sharePdf } = useSharePdf();

  useEffect(() => {
    loadQuotations();
  }, []);

  async function loadQuotations() {
    try {
      const res = await quotationApi.getMyQuotations();
      setQuotations(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar cotações');
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(publicId) {
    setConfirmModal({
      message: 'Deseja excluir esta cotação permanentemente?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await quotationApi.remove(publicId);
          setQuotations((prev) => prev.filter((q) => q.publicId !== publicId));
        } catch (err) {
          setError(err.response?.data?.message || 'Erro ao excluir cotação');
        }
      },
    });
  }

  async function handleExportPdf(publicId, name) {
    try {
      const res = await quotationApi.exportSavedPdf(publicId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name || 'cotacao'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao exportar PDF');
    }
  }

  async function handleSharePdf(publicId, name) {
    try {
      const res = await quotationApi.exportSavedPdf(publicId);
      const fileName = `${name || 'cotacao'}.pdf`;
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

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) return <div className="loading">Carregando cotações...</div>;

  return (
    <div className="my-quotations">
      <div className="page-header">
        <h1>Minhas Cotações</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {quotations.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não tem cotações salvas.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Fazer uma Cotação
          </button>
        </div>
      ) : (
        <div className="quotations-list">
          {quotations.map((q) => (
            <div key={q.publicId} className="quotation-item">
              <div className="quotation-info">
                <h3>{q.quotationName}</h3>
                <div className="quotation-meta">
                  <span>{q.healthPlanName} - {getOperatorName(q.operator)}</span>
                  <span>{q.totalLives} vidas</span>
                  <span>{formatDate(q.createdAt)}</span>
                </div>
              </div>
              <div className="quotation-price">
                <span className="monthly-total">{formatCurrency(q.monthlyTotal)}</span>
                <span className="price-label">/mês</span>
              </div>
              <div className="quotation-actions">
                <button
                  className="btn btn-icon"
                  onClick={() => navigate(`/quotations/${q.publicId}`)}
                  title="Ver detalhes"
                >
                  <FiEye />
                </button>
                <button
                  className="btn btn-icon"
                  onClick={() => handleExportPdf(q.publicId, q.quotationName)}
                  title="Exportar PDF"
                >
                  <FiDownload />
                </button>
                {canShareFiles && (
                  <button
                    className="btn btn-icon"
                    onClick={() => handleSharePdf(q.publicId, q.quotationName)}
                    title="Compartilhar PDF"
                  >
                    <FiShare2 />
                  </button>
                )}
                <button
                  className="btn btn-icon btn-danger"
                  onClick={() => handleDelete(q.publicId)}
                  title="Excluir"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          danger
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
