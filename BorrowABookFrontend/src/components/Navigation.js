import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📚 Borrow A Book
        </Link>
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/books" className="nav-link">
            Browse Books
          </Link>
          {!isAuthenticated && (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/profile" className="nav-link">Profile</Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link to="/admin/users" className="nav-link nav-link-admin">
              👥 Users
            </Link>
          )}
          {isAuthenticated && (
            <button className="nav-link nav-link-logout" onClick={handleLogout}>
              Logout
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
