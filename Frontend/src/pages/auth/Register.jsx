import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/verify', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-close" onClick={() => navigate('/')} aria-label="Voltar">
          <FiX />
        </button>
        <div className="auth-brand">
          <div className="auth-brand-mark">S</div>
          <span>SWIFT</span>
        </div>
        <h1>Criar Conta</h1>
        <p className="auth-subtitle">Cadastre-se para começar a cotar</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome"
              minLength={3}
              maxLength={20}
            />
          </div>
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
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Já tem conta? Entrar</Link>
        </div>
      </div>
    </div>
  );
}
