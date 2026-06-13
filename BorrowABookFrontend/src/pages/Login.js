import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, getApiErrorMessage } from '../services/api';
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
      setError(getApiErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              placeholder="Enter your login"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="form-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="form-footer">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

