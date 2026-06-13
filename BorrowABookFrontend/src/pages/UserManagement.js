import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminUserAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './UserManagement.css';

const UserManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const isAdmin = user?.userRole === 'admin' || user?.userRole === 'localAdmin';

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await adminUserAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, t('userManagement.failedLoad')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (user) => {
    const confirmed = window.confirm(t('userManagement.activateConfirm', { name: `${user.name} ${user.surname}`.trim(), login: user.login }));
    if (!confirmed) return;
    try {
      const response = await adminUserAPI.activate(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? response.data : u)));
    } catch (err) {
      alert(getApiErrorMessage(err, t('userManagement.activateFailed')));
    }
  };

  const handleDeactivate = async (user) => {
    const confirmed = window.confirm(t('userManagement.deactivateConfirm', { name: `${user.name} ${user.surname}`.trim(), login: user.login }));
    if (!confirmed) return;
    try {
      const response = await adminUserAPI.deactivate(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? response.data : u)));
    } catch (err) {
      alert(getApiErrorMessage(err, t('userManagement.deactivateFailed')));
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.surname.toLowerCase().includes(term) ||
      u.login.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.contact || '').toLowerCase().includes(term);

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && u.isActive) ||
      (filterActive === 'inactive' && !u.isActive);

    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="user-management-container">
      <h1>{t('userManagement.title')}</h1>

      <div className="um-toolbar">
        <input
          type="text"
          className="um-search"
          placeholder={t('userManagement.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="um-filter"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        >
          <option value="all">{t('userManagement.allUsers')}</option>
          <option value="active">{t('userManagement.activeOnly')}</option>
          <option value="inactive">{t('userManagement.inactiveOnly')}</option>
        </select>
        <button className="btn btn-refresh" onClick={loadUsers}>
          {t('userManagement.refresh')}
        </button>
      </div>

      {error && <p className="um-error">{error}</p>}

      {isLoading ? (
        <p className="um-loading">{t('userManagement.loading')}</p>
      ) : (
        <>
          <p className="um-count">
            {t('userManagement.showingOf', { shown: filteredUsers.length, total: users.length })}
            {users.filter((u) => !u.isActive).length > 0 && (
              <span className="um-pending-badge">
                {t('userManagement.pendingActivation', { count: users.filter((u) => !u.isActive).length })}
              </span>
            )}
          </p>
          <div className="um-table-container">
            <table className="um-table">
              <thead>
                <tr>
                  <th>{t('userManagement.id')}</th>
                  <th>{t('userManagement.name')}</th>
                  <th>{t('userManagement.login')}</th>
                  <th>{t('userManagement.email')}</th>
                  <th>{t('userManagement.contact')}</th>
                  <th>{t('userManagement.role')}</th>
                  <th>{t('userManagement.status')}</th>
                  <th>{t('userManagement.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#7f8c8d', padding: '24px' }}>
                      {t('userManagement.noUsers')}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className={u.isActive ? '' : 'um-row-inactive'}>
                      <td className="um-id">{u.id}</td>
                      <td className="um-name">{u.name} {u.surname}</td>
                      <td>{u.login}</td>
                      <td>{u.email}</td>
                      <td>{u.contact || '-'}</td>
                      <td>
                        <span className={`um-role um-role-${u.userRole}`}>{u.userRole}</span>
                      </td>
                      <td>
                        <span className={`um-status ${u.isActive ? 'um-status-active' : 'um-status-inactive'}`}>
                          {u.isActive ? t('userManagement.active') : t('userManagement.pending')}
                        </span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <button
                            className="btn-um btn-um-deactivate"
                            onClick={() => handleDeactivate(u)}
                          >
                            {t('userManagement.deactivate')}
                          </button>
                        ) : (
                          <button
                            className="btn-um btn-um-activate"
                            onClick={() => handleActivate(u)}
                          >
                            {t('userManagement.activate')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;

