import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './AuthForm.css';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setSession } = useAuth();
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
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData.login.trim(), formData.password);
      const pseudoToken = `session-${response.data.id}-${Date.now()}`;
      setSession(response.data, pseudoToken);
      navigate('/books');
    } catch (err) {
      setError(getApiErrorMessage(err, t('login.loginFailed')));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>{t('login.title')}</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login">{t('login.loginLabel')}</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              placeholder={t('login.loginPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('login.passwordLabel')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>
          <button type="submit" className="btn btn-submit" disabled={isLoading}>
            {isLoading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
        <p className="form-footer">
          {t('login.noAccount')} <Link to="/register">{t('login.registerLink')}</Link>
        </p>
        <p className="form-footer">
          <Link to="/forgot-password">{t('login.forgotPassword')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

