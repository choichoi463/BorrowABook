import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminUserAPI, getApiErrorMessage } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
      setError(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (user) => {
    const confirmed = window.confirm(`Activate account for "${user.name} ${user.surname}" (${user.login})?`);
    if (!confirmed) return;
    try {
      const response = await adminUserAPI.activate(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? response.data : u)));
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to activate user.'));
    }
  };

  const handleDeactivate = async (user) => {
    const confirmed = window.confirm(`Deactivate account for "${user.name} ${user.surname}" (${user.login})? They will not be able to log in.`);
    if (!confirmed) return;
    try {
      const response = await adminUserAPI.deactivate(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? response.data : u)));
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to deactivate user.'));
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
      <h1>User Management</h1>

      <div className="um-toolbar">
        <input
          type="text"
          className="um-search"
          placeholder="Search by name, login, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="um-filter"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <button className="btn btn-refresh" onClick={loadUsers}>
          ↻ Refresh
        </button>
      </div>

      {error && <p className="um-error">{error}</p>}

      {isLoading ? (
        <p className="um-loading">Loading users...</p>
      ) : (
        <>
          <p className="um-count">
            Showing {filteredUsers.length} of {users.length} users
            {users.filter((u) => !u.isActive).length > 0 && (
              <span className="um-pending-badge">
                {users.filter((u) => !u.isActive).length} pending activation
              </span>
            )}
          </p>
          <div className="um-table-container">
            <table className="um-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Login</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#7f8c8d', padding: '24px' }}>
                      No users found.
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
                          {u.isActive ? '✓ Active' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <button
                            className="btn-um btn-um-deactivate"
                            onClick={() => handleDeactivate(u)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn-um btn-um-activate"
                            onClick={() => handleActivate(u)}
                          >
                            Activate
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

