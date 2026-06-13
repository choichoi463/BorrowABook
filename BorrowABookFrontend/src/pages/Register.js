import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './AuthForm.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    contact: '',
    login: '',
    userRole: 'bookOwner',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActivation, setPendingActivation] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        email: formData.email.trim(),
        contact: formData.contact.trim() || null,
        login: formData.login.trim(),
        password: formData.password,
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        userRole: formData.userRole,
      });
      // If account was created but needs admin activation, show info message instead of navigating
      if (response.data?.isActive === false) {
        setPendingActivation(true);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t('register.registrationFailed')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>{t('register.title')}</h1>
        {pendingActivation ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#27ae60', marginBottom: '12px' }}>{t('register.created')}</h2>
            <p style={{ color: '#555', marginBottom: '8px', lineHeight: '1.6' }}>
              {t('register.pendingActivationTitle')}
            </p>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
              {t('register.pendingActivationBody')}
            </p>
            <Link to="/login" className="btn btn-submit" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
              {t('register.goToLogin')}
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('register.firstName')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('register.firstNamePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="surname">{t('register.lastName')}</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                placeholder={t('register.lastNamePlaceholder')}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('register.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={t('register.emailPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact">{t('register.contact')}</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder={t('register.contactPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login">{t('register.login')}</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              minLength={3}
              placeholder={t('register.loginPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="userRole">{t('register.role')}</label>
            <select
              id="userRole"
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
            >
              <option value="bookOwner">{t('register.bookOwner')}</option>
              <option value="localAdmin">{t('register.localAdmin')}</option>
              <option value="admin">{t('register.admin')}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('register.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder={t('register.passwordPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder={t('register.confirmPasswordPlaceholder')}
            />
          </div>
          <button type="submit" className="btn btn-submit" disabled={isLoading}>
            {isLoading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>
        <p className="form-footer">
          {t('register.noAccount')} <Link to="/login">{t('register.loginLink')}</Link>
        </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;

