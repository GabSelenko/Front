import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/authApi';
import './Auth.css';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loadProfile } = useAuth();
  const emailFromState = location.state?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(value) {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Insira um email válido (ex: nome@email.com)');
      return false;
    }
    setEmailError('');
    return true;
  }

  useEffect(() => {
    if (!email) return;

    const eventSource = new EventSource(
      `http://localhost:8080/auth/verify/events?email=${encodeURIComponent(email)}`
    );

    eventSource.addEventListener('verified', async (event) => {
      eventSource.close();
      const { token, refreshToken } = JSON.parse(event.data);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      await loadProfile();
      navigate('/dashboard', { replace: true });
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [email, navigate, loadProfile]);

  async function handleVerify(e) {
    e.preventDefault();
    if (!validateEmail(email)) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authApi.verify({ email, verificationCode: code });
      const { token, refreshToken } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setSuccess('Email verificado com sucesso!');
      await loadProfile();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setSuccess('');
    try {
      const res = await authApi.resendVerification({ email });
      setSuccess(res.data.message || 'Código reenviado!');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao reenviar código');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">S</div>
          <span>SWIFT</span>
        </div>
        <h1>Verificar Email</h1>
        <p className="auth-subtitle">Digite o código de 6 dígitos enviado para seu email</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleVerify} noValidate>
          <div className="form-group">
            <label>Email</label>
            {emailError && (
              <div className="field-error-card">
                {emailError}
                <div className="field-error-arrow" />
              </div>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
              onBlur={(e) => validateEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>
          <div className="form-group">
            <label>Código de Verificação</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        <div className="auth-links">
          <button onClick={handleResend} className="link-btn">Reenviar código</button>
        </div>
      </div>
    </div>
  );
}
