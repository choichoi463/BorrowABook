import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, userAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const UserProfile = () => {
  const { user: authUser, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState({
    firstName: authUser?.name || '',
    lastName: authUser?.surname || '',
    email: authUser?.email || '',
    contact: authUser?.contact || '',
    login: authUser?.login || '',
    memberSince: new Date().toISOString().split('T')[0],
  });

  const [ownedBooks, setOwnedBooks] = useState([]);
  const [isLoadingOwnedBooks, setIsLoadingOwnedBooks] = useState(false);
  const [error, setError] = useState('');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isAddBookExpanded, setIsAddBookExpanded] = useState(false);
  const [bookForm, setBookForm] = useState({
    author: '',
    title: '',
    genre: '',
    language: '',
    description: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editData, setEditData] = useState(user);

  useEffect(() => {
    const mappedUser = {
      firstName: authUser?.name || '',
      lastName: authUser?.surname || '',
      email: authUser?.email || '',
      contact: authUser?.contact || '',
      login: authUser?.login || '',
      memberSince: new Date().toISOString().split('T')[0],
    };
    setUser(mappedUser);
    setEditData(mappedUser);
  }, [authUser]);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(i18n.language);
  };

  useEffect(() => {
    const loadOwnedBooks = async () => {
      if (!isAuthenticated || !authUser?.id) {
        setOwnedBooks([]);
        return;
      }

      setIsLoadingOwnedBooks(true);
      setError('');
      try {
        const allBooksResponse = await bookAPI.getAllIncludeInactive();
        const filtered = allBooksResponse.data.filter(
          (book) => book.ownerId != null && Number(book.ownerId) === Number(authUser.id)
        );
        setOwnedBooks(filtered);
      } catch (err) {
        setError(getApiErrorMessage(err, t('userProfile.failedLoad')));
      } finally {
        setIsLoadingOwnedBooks(false);
      }
    };

    loadOwnedBooks();
  }, [authUser, isAuthenticated, t]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!authUser?.id) {
      alert(t('userProfile.missingIdentifier'));
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload = {
        email: editData.email,
        contact: editData.contact,
        name: editData.firstName,
        surname: editData.lastName,
      };
      const response = await userAPI.updateProfile(authUser.id, payload);

      const updatedUser = { ...authUser, ...response.data };
      const mapped = {
        firstName: updatedUser.name || '',
        lastName: updatedUser.surname || '',
        email: updatedUser.email || '',
        contact: updatedUser.contact || '',
        login: updatedUser.login || '',
        memberSince: user.memberSince,
      };

      setUser(mapped);
      setEditData(mapped);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      alert(getApiErrorMessage(err, t('userProfile.failedUpdateProfile')));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddBookFieldChange = (e) => {
    const { name, value } = e.target;
    setBookForm((prev) => ({ ...prev, [name]: value }));
  };

  const refreshOwnedBooks = async () => {
    if (!authUser?.id) return;
    const allBooksResponse = await bookAPI.getAllIncludeInactive();
    const filtered = allBooksResponse.data.filter(
      (book) => book.ownerId != null && Number(book.ownerId) === Number(authUser.id)
    );
    setOwnedBooks(filtered);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!authUser?.id) {
      setError(t('userProfile.cannotAddBook'));
      return;
    }

    setIsAddingBook(true);
    setError('');
    try {
      await bookAPI.add({
        ownerId: authUser.id,
        author: bookForm.author.trim(),
        title: bookForm.title.trim(),
        genre: bookForm.genre.trim() || null,
        language: bookForm.language.trim() || null,
        description: bookForm.description.trim(),
      });
      setBookForm({ author: '', title: '', genre: '', language: '', description: '' });
      await refreshOwnedBooks();
    } catch (err) {
      setError(getApiErrorMessage(err, t('userProfile.failedAdd')));
    } finally {
      setIsAddingBook(false);
    }
  };

  const handleReturnBook = async (book) => {
    const returnedBy = authUser.login || authUser.name;
    if (!returnedBy) {
      alert(t('userProfile.pleaseLogin'));
      return;
    }

    const confirmed = window.confirm(t('userProfile.returnConfirm', { title: book.title }));
    if (!confirmed) return;

    try {
      await bookAPI.return(book.id, returnedBy);
      await refreshOwnedBooks();
    } catch (err) {
      alert(getApiErrorMessage(err, t('userProfile.failedReturn')));
    }
  };

  const handleDeactivateBook = async (book) => {
    // Check if user is book owner or admin
    const isOwner = Number(book.ownerId) === Number(authUser.id);
    const isAdmin = authUser.userRole === 'admin' || authUser.userRole === 'localAdmin';

    if (!isOwner && !isAdmin) {
      alert(t('userProfile.noPermission'));
      return;
    }

    const confirmed = window.confirm(t('userProfile.deactivateConfirm', { title: book.title }));
    if (!confirmed) return;

    try {
      await bookAPI.deactivate(
        book.id,
        authUser.id,
        authUser.userRole,
        authUser.login || authUser.name
      );
      await refreshOwnedBooks();
    } catch (err) {
      alert(getApiErrorMessage(err, t('userProfile.failedDeactivate')));
    }
  };

  const handleActivateBook = async (book) => {
    // Check if user is book owner or admin
    const isOwner = Number(book.ownerId) === Number(authUser.id);
    const isAdmin = authUser.userRole === 'admin' || authUser.userRole === 'localAdmin';

    if (!isOwner && !isAdmin) {
      alert(t('userProfile.noPermission'));
      return;
    }

    const confirmed = window.confirm(t('userProfile.activateConfirm', { title: book.title }));
    if (!confirmed) return;

    try {
      await bookAPI.activate(
        book.id,
        authUser.id,
        authUser.userRole,
        authUser.login || authUser.name
      );
      await refreshOwnedBooks();
    } catch (err) {
      alert(getApiErrorMessage(err, t('userProfile.failedActivate')));
    }
  };

  if (!isAuthenticated || !authUser) {
    return (
      <div className="profile-container">
        <h1>{t('userProfile.title')}</h1>
        <div className="section">
          <p className="empty-message">
            {t('userProfile.loginRequiredPrefix')} <Link to="/login">{t('userProfile.loginRequiredLink')}</Link> {t('userProfile.loginRequiredSuffix')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>{t('userProfile.title')}</h1>

      <div className="profile-layout">
        <div className="profile-card">
          <h2>{t('userProfile.personalInformation')}</h2>
          {!isEditing ? (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">{t('userProfile.firstName')}:</span>
                <span className="value">{user.firstName}</span>
              </div>
              <div className="info-row">
                <span className="label">{t('userProfile.lastName')}:</span>
                <span className="value">{user.lastName}</span>
              </div>
              <div className="info-row">
                <span className="label">{t('userProfile.email')}:</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="label">{t('userProfile.contact')}:</span>
                <span className="value">{user.contact || '-'}</span>
              </div>
              <div className="info-row">
                <span className="label">{t('userProfile.username')}:</span>
                <span className="value">{user.login || '-'}</span>
              </div>
              <div className="info-row">
                <span className="label">{t('userProfile.memberSince')}:</span>
                <span className="value">{formatDate(user.memberSince)}</span>
              </div>
              <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                {t('userProfile.editProfile')}
              </button>
            </div>
          ) : (
            <div className="profile-edit-form">
              <div className="form-group">
                <label htmlFor="firstName">{t('userProfile.firstName')}</label>
                <input type="text" id="firstName" name="firstName" value={editData.firstName} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">{t('userProfile.lastName')}</label>
                <input type="text" id="lastName" name="lastName" value={editData.lastName} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="email">{t('userProfile.email')}</label>
                <input type="email" id="email" name="email" value={editData.email} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="contact">{t('userProfile.contact')}</label>
                <input type="text" id="contact" name="contact" value={editData.contact} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="login">{t('userProfile.username')}</label>
                <input type="text" id="login" name="login" value={editData.login} disabled />
              </div>
              <div className="edit-buttons">
                <button className="btn btn-save" onClick={handleSaveChanges} disabled={isSavingProfile}>
                  {isSavingProfile ? t('userProfile.saving') : t('userProfile.saveChanges')}
                </button>
                <button className="btn btn-cancel" onClick={() => { setIsEditing(false); setEditData(user); }}>
                  {t('userProfile.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{ownedBooks.length}</h3>
              <p>{t('userProfile.booksOwned')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0 }}>{t('userProfile.addNewBook')}</h2>
          <button
            type="button"
            className="btn btn-edit"
            aria-expanded={isAddBookExpanded}
            aria-controls="add-book-form"
            onClick={() => setIsAddBookExpanded((prev) => !prev)}
          >
            {isAddBookExpanded ? t('userProfile.hideForm') : t('userProfile.showForm')}
          </button>
        </div>
        {isAddBookExpanded && (
        <form id="add-book-form" className="profile-edit-form" onSubmit={handleAddBook}>
          <div className="form-group">
            <label htmlFor="author">{t('userProfile.author')}</label>
            <input
              type="text"
              id="author"
              name="author"
              value={bookForm.author}
              onChange={handleAddBookFieldChange}
              required
              maxLength={255}
            />
          </div>
          <div className="form-group">
            <label htmlFor="title">{t('userProfile.title')}</label>
            <input
              type="text"
              id="title"
              name="title"
              value={bookForm.title}
              onChange={handleAddBookFieldChange}
              required
              maxLength={255}
            />
          </div>
          <div className="form-group">
            <label htmlFor="genre">{t('userProfile.genre')}</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={bookForm.genre}
              onChange={handleAddBookFieldChange}
              maxLength={255}
            />
          </div>
          <div className="form-group">
            <label htmlFor="language">{t('userProfile.language')}</label>
            <input
              type="text"
              id="language"
              name="language"
              value={bookForm.language}
              onChange={handleAddBookFieldChange}
              maxLength={255}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">{t('userProfile.description')}</label>
            <input
              type="text"
              id="description"
              name="description"
              value={bookForm.description}
              onChange={handleAddBookFieldChange}
              required
              maxLength={2000}
            />
          </div>
          <div className="edit-buttons">
            <button type="submit" className="btn btn-save" disabled={isAddingBook}>
              {isAddingBook ? t('userProfile.adding') : t('userProfile.addBook')}
            </button>
          </div>
        </form>
        )}
      </div>

      <div className="section">
        <h2>{t('userProfile.booksOwned')}</h2>
        {isLoadingOwnedBooks && <p>{t('userProfile.loadingOwnedBooks')}</p>}
        {error && <p className="empty-message">{error}</p>}
        {ownedBooks.length === 0 && !isLoadingOwnedBooks ? (
          <p className="empty-message">{t('userProfile.noBooks')}</p>
        ) : (
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>{t('userProfile.title')}</th>
                  <th>{t('userProfile.author')}</th>
                  <th>{t('userProfile.genre')}</th>
                  <th>{t('userProfile.language')}</th>
                  <th>{t('userProfile.borrowedBy')}</th>
                  <th>{t('userProfile.borrowerContact')}</th>
                  <th>{t('userProfile.borrowedDate')}</th>
                  <th>{t('userProfile.returnDate')}</th>
                  <th>{t('userProfile.edit')}</th>
                  <th>{t('userProfile.return')}</th>
                  <th>{t('userProfile.deactivate')}</th>
                </tr>
              </thead>
              <tbody>
                {ownedBooks.map((book) => {
                  const hasActiveBorrower = Boolean(book.borrowedByUserName);
                  const borrowerFullName = hasActiveBorrower
                    ? [book.borrowedByUserName, book.borrowedByUserSurname].filter(Boolean).join(' ')
                    : '-';
                  const borrowerContact = hasActiveBorrower && book.borrowedByUserContact
                    ? book.borrowedByUserContact
                    : '-';
                  const isInactive = book.isInactive === true;
                  const ownerAllowed = Number(book.ownerId) === Number(authUser.id) ||
                    authUser.userRole === 'admin' ||
                    authUser.userRole === 'localAdmin';

                  return (
                    <tr key={book.id} className={isInactive ? 'inactive-row' : ''}>
                      <td className="book-title">{book.title}</td>
                      <td>{book.author || '-'}</td>
                      <td>{book.genre || '-'}</td>
                      <td>{book.language || '-'}</td>
                      <td>{borrowerFullName}</td>
                      <td>{borrowerContact}</td>
                      <td>{book.dateBorrowed ? formatDate(book.dateBorrowed) : '-'}</td>
                      <td>{book.dateReturned ? formatDate(book.dateReturned) : '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() => navigate(`/books/${book.id}/edit`)}
                          disabled={isInactive}
                        >
                          {t('userProfile.edit')}
                        </button>
                      </td>
                      <td>
                        {hasActiveBorrower && !isInactive ? (
                          <button className="btn btn-return" onClick={() => handleReturnBook(book)}>
                            {t('userProfile.return')}
                          </button>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td>
                        {ownerAllowed ? (
                          isInactive ? (
                            <button
                              className="btn btn-activate"
                              onClick={() => handleActivateBook(book)}
                              title={t('userProfile.activateTitle')}
                            >
                              {t('userProfile.activate')}
                            </button>
                          ) : (
                            <button
                              className="btn btn-deactivate"
                              onClick={() => handleDeactivateBook(book)}
                              title={t('userProfile.deactivateTitle')}
                            >
                              {t('userProfile.deactivate')}
                            </button>
                          )
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
