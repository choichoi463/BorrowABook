import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './AuthForm.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email.trim());
      setMessage(t('forgotPassword.success'));
    } catch (err) {
      setError(getApiErrorMessage(err, t('forgotPassword.failed')));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>{t('forgotPassword.title')}</h1>
        <p className="form-footer" style={{ marginBottom: '20px', marginTop: 0, textAlign: 'left' }}>
          {t('forgotPassword.description')}
        </p>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('forgotPassword.emailLabel')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('forgotPassword.emailPlaceholder')}
            />
          </div>
          <button type="submit" className="btn btn-submit" disabled={isLoading}>
            {isLoading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
          </button>
        </form>
        <p className="form-footer">
          {t('forgotPassword.remembered')} <Link to="/login">{t('forgotPassword.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

