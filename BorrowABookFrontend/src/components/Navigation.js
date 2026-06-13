import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isAdmin = user?.userRole === 'admin' || user?.userRole === 'localAdmin';

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📚 {t('navigation.brand')}
        </Link>
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            {t('navigation.home')}
          </Link>
          <Link to="/books" className="nav-link">
            {t('navigation.browseBooks')}
          </Link>
          {!isAuthenticated && (
            <>
              <Link to="/login" className="nav-link">{t('navigation.login')}</Link>
              <Link to="/register" className="nav-link">{t('navigation.register')}</Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/profile" className="nav-link">{t('navigation.profile')}</Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link to="/admin/users" className="nav-link nav-link-admin">
              👥 {t('navigation.users')}
            </Link>
          )}
          <div className="nav-language-switcher">
            <label htmlFor="language-switcher" className="nav-language-label">
              {t('navigation.language')}
            </label>
            <select
              id="language-switcher"
              className="nav-language-select"
              value={i18n.language}
              onChange={handleLanguageChange}
              aria-label={t('navigation.language')}
            >
              <option value="en">{t('navigation.english')}</option>
              <option value="ru">{t('navigation.russian')}</option>
            </select>
          </div>
          {isAuthenticated && (
            <button type="button" className="nav-link nav-link-logout" onClick={handleLogout}>
              {t('navigation.logout')}
            </button>
          )}
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
