import React from 'react';
import '../styles/header.css';
import { useAuthStore } from '../hooks/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../services/api';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="container header-content">
        <div className="header-brand">
          <h1 className="logo">GençBizz</h1>
          <p className="tagline">Haber & Komunite Platformu</p>
        </div>

        <nav className="nav-menu">
          <a href="/" className={location.pathname === '/' ? 'active' : ''}>
            Haberler
          </a>
          <a href="/forum" className={location.pathname === '/forum' ? 'active' : ''}>
            Forum
          </a>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <span>{user.name}</span>
              <button
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                ▼
              </button>

              {isMenuOpen && (
                <div className="dropdown-menu">
                  <a href="/profile">Profil</a>
                  {user.role === 'admin' && <a href="/admin">Admin Panel</a>}
                  {(user.role === 'admin' || user.role === 'editor') && (
                    <a href="/editor">Editör Paneli</a>
                  )}
                  <button onClick={handleLogout} className="logout-btn">
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <a href="/login" className="btn-secondary">
                Giriş Yap
              </a>
              <a href="/register" className="btn-primary">
                Kayıt Ol
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
