import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateEmail(email)) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      setSuccess(res.data.message || 'Email de recuperação enviado!');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">S</div>
          <span>SWIFT</span>
        </div>
        <h1>Recuperar Senha</h1>
        <p className="auth-subtitle">Informe seu email para receber o link de recuperação</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
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
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
}
