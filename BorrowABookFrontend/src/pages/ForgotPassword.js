import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, getApiErrorMessage } from '../services/api';
import './AuthForm.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email.trim());
      setMessage('If the email exists, a password reset message has been sent.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to process forgot-password request.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Forgot Password</h1>
        <p className="form-footer" style={{ marginBottom: '20px', marginTop: 0, textAlign: 'left' }}>
          Enter the email you registered with and we will send you a temporary password.
        </p>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your registration email"
            />
          </div>
          <button type="submit" className="btn btn-submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset email'}
          </button>
        </form>
        <p className="form-footer">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

