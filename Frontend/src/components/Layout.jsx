import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiFileText, FiUser, FiLogOut, FiUsers, FiGrid, FiMapPin } from 'react-icons/fi';
import './Layout.css';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();

  async function handleLogout() {
    await logout();
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">S</div>
            <div>
              <h2>SWIFT</h2>
              <div className="brand-sub">Cotações Inteligentes</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-link">
            <FiHome /> Planos
          </NavLink>
          <NavLink to="/quotations" className="nav-link">
            <FiFileText /> Minhas Cotações
          </NavLink>
          <NavLink to="/profile" className="nav-link">
            <FiUser /> Perfil
          </NavLink>
          {isAdmin && (
            <>
              <div className="nav-divider">Administração</div>
              <NavLink to="/admin/users" className="nav-link">
                <FiUsers /> Usuários
              </NavLink>
              <NavLink to="/admin/plans" className="nav-link">
                <FiGrid /> Gerenciar Planos
              </NavLink>
              <NavLink to="/admin/networks" className="nav-link">
                <FiMapPin /> Redes Credenciadas
              </NavLink>
              <NavLink to="/admin/cities" className="nav-link">
                <FiMapPin /> Cidades
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <span className="user-name">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
