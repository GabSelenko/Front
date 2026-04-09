import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiZap, FiShield, FiTrendingUp, FiArrowRight, FiFileText, FiSearch, FiDownload } from 'react-icons/fi';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* ─── Navbar ─── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-mark">S</div>
            <span>SWIFT</span>
          </Link>
          <div className="landing-nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Ir ao Dashboard <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav-link">Entrar</Link>
                <Link to="/register" className="btn btn-primary">
                  Criar Conta <FiArrowRight />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient-orb hero-orb-1" />
          <div className="hero-gradient-orb hero-orb-2" />
          <div className="hero-gradient-orb hero-orb-3" />
          <div className="hero-grid-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <FiZap />
            <span>Plataforma de cotações inteligente</span>
          </div>
          <h1 className="hero-title">
            Cotações de planos
            <br />
            de saúde em <span className="hero-highlight">segundos</span>
          </h1>
          <p className="hero-subtitle">
            Compare preços, gere propostas e exporte PDFs profissionais.
            Tudo o que um corretor precisa, em uma plataforma rápida e elegante.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn hero-btn-primary">
              Começar Gratuitamente <FiArrowRight />
            </Link>
            <Link to="/login" className="btn hero-btn-secondary">
              Já tenho conta
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">10x</span>
              <span className="hero-stat-label">mais rápido</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">preciso</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">PDF</span>
              <span className="hero-stat-label">profissional</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="features">
        <div className="features-inner">
          <div className="section-header">
            <span className="section-tag">Recursos</span>
            <h2>Tudo que você precisa para cotar</h2>
            <p>Ferramentas poderosas projetadas para agilizar o trabalho do corretor de saúde.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiSearch />
              </div>
              <h3>Busca Inteligente</h3>
              <p>Encontre planos por operadora, cobertura, acomodação e muito mais. Filtros avançados para encontrar o plano ideal.</p>
            </div>
            <div className="feature-card feature-card-accent">
              <div className="feature-icon">
                <FiTrendingUp />
              </div>
              <h3>Cálculo Instantâneo</h3>
              <p>Cotações calculadas em tempo real com preços atualizados. Defina faixas etárias e veja os valores na hora.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiFileText />
              </div>
              <h3>Propostas em PDF</h3>
              <p>Exporte propostas profissionais em PDF com um clique. Prontas para enviar ao seu cliente.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiShield />
              </div>
              <h3>Dados Seguros</h3>
              <p>Suas cotações e dados de clientes protegidos com autenticação segura e criptografia.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiDownload />
              </div>
              <h3>Salve & Compare</h3>
              <p>Salve cotações para comparação futura. Histórico completo de todas as suas simulações.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiZap />
              </div>
              <h3>Interface Veloz</h3>
              <p>Design otimizado para produtividade. Menos cliques, mais cotações fechadas por dia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section className="how-it-works">
        <div className="how-inner">
          <div className="section-header">
            <span className="section-tag">Como funciona</span>
            <h2>Três passos. Zero complicação.</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Escolha o plano</h3>
              <p>Navegue pelo catálogo de planos de saúde e encontre a opção ideal para seu cliente.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Configure a cotação</h3>
              <p>Defina acomodação, faixas etárias e quantidade de vidas. O cálculo é instantâneo.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Exporte e envie</h3>
              <p>Salve a cotação, exporte em PDF profissional e envie diretamente ao seu cliente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-bg-pattern" />
          <div className="cta-content">
            <h2>Pronto para agilizar suas cotações?</h2>
            <p>Crie sua conta gratuita e comece a cotar planos de saúde em segundos.</p>
            <Link to="/register" className="btn hero-btn-primary">
              Criar Conta Gratuita <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo">
              <div className="landing-logo-mark">S</div>
              <span>SWIFT</span>
            </div>
            <p>Plataforma inteligente de cotação de planos de saúde para corretores.</p>
          </div>
          <div className="footer-links">
            <Link to="/login">Entrar</Link>
            <Link to="/register">Criar Conta</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 SWIFT. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
