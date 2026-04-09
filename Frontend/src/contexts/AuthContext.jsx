import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        loadProfile();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function loadProfile() {
    try {
      const res = await userApi.getProfile();
      const token = localStorage.getItem('token');
      const payload = parseJwt(token);
      setUser({
        ...res.data.data,
        role: payload?.role || 'USER',
      });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await authApi.login({ email, password });
    const { token, refreshToken } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    setLoggingOut(false);
    await loadProfile();
    return res.data;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setLoggingOut(true);
    setUser(null);
  }

  async function register(name, email, password) {
    const res = await authApi.register({ name, email, password });
    return res.data;
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, loggingOut, login, logout, register, loadProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
