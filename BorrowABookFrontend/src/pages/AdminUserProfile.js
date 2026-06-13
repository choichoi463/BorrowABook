import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminUserAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './AdminUserProfile.css';

const AdminUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

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
        setError(getApiErrorMessage(err, t('adminUserProfile.failed')));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, isAdmin, navigate, userId, t]);

  if (!isAuthenticated || !isAdmin) return null;
  if (isLoading) return <div className="loading">{t('adminUserProfile.loading')}</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">{t('adminUserProfile.notFound')}</div>;

  const fullName = [profile.name, profile.surname].filter(Boolean).join(' ') || '-';

  return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-header">
        <button className="back-button" onClick={() => navigate(-1)}>{t('common.back')}</button>
        <Link to="/admin/users" className="admin-users-link">{t('adminUserProfile.openUsersPanel')}</Link>
      </div>

      <div className="admin-user-profile-card">
        <h1>{t('adminUserProfile.title')}</h1>
        <div className="admin-user-grid">
          <div className="admin-user-item">
            <span className="label">{t('adminUserProfile.name')}</span>
            <span className="value">{fullName}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">{t('adminUserProfile.login')}</span>
            <span className="value">{profile.login || '-'}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">{t('adminUserProfile.email')}</span>
            <span className="value">{profile.email || '-'}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">{t('adminUserProfile.contact')}</span>
            <span className="value">{profile.contact || '-'}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">{t('adminUserProfile.role')}</span>
            <span className="value">{profile.userRole || '-'}</span>
          </div>
          <div className="admin-user-item">
            <span className="label">{t('adminUserProfile.status')}</span>
            <span className="value">{profile.isActive ? t('adminUserProfile.active') : t('adminUserProfile.inactive')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;

