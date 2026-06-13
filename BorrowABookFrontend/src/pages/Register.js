import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, getApiErrorMessage } from '../services/api';
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
      setError('Passwords do not match');
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
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Register</h1>
        {pendingActivation ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#27ae60', marginBottom: '12px' }}>Account Created!</h2>
            <p style={{ color: '#555', marginBottom: '8px', lineHeight: '1.6' }}>
              Your account has been created successfully, but it requires admin approval before you can log in.
            </p>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
              Please contact your administrator to activate your account. Once activated, you'll be able to log in with your credentials.
            </p>
            <Link to="/login" className="btn btn-submit" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">First Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="First name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="surname">Last Name</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact (optional)</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone or contact"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              minLength={3}
              placeholder="Choose a login"
            />
          </div>
          <div className="form-group">
            <label htmlFor="userRole">Role</label>
            <select
              id="userRole"
              name="userRole"
              value={formData.userRole}
              onChange={handleChange}
            >
              <option value="bookOwner">bookOwner</option>
              <option value="localAdmin">localAdmin</option>
              <option value="admin">admin</option>
            </select>
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
              minLength={8}
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" className="btn btn-submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;

