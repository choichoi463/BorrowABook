import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminUserAPI, getApiErrorMessage } from '../services/api';
import './AdminUserProfile.css';

const AdminUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.userRole === 'admin' || user?.userRole === 'localAdmin';

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await adminUserAPI.getById(userId);
        setProfile(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load user profile.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, isAdmin, navigate, userId]);

  if (!isAuthenticated || !isAdmin) return null;
  if (isLoading) return <div className="loading">Loading user profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">User not found.</div>;

  const fullName = [profile.name, profile.surname].filter(Boolean).join(' ') || '-';

  return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-header">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        <Link to="/admin/users" className="admin-users-link">Open Users Panel</Link>
      </div>

      <div className="admin-user-profile-card">
        <h1>User Profile</h1>
        <div className="admin-user-grid">
          <div className="admin-user-item">
            <span className="label">Name</span>
            <span className="value">{fullName}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">Login</span>
            <span className="value">{profile.login || '-'}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">Email</span>
            <span className="value">{profile.email || '-'}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">Contact</span>
            <span className="value">{profile.contact || '-'}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">Role</span>
            <span className="value">{profile.userRole || '-'}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">Status</span>
            <span className="value">{profile.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;

