import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, userAPI, getApiErrorMessage } from '../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const { user: authUser, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
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
        setError(getApiErrorMessage(err, 'Failed to load owned books.'));
      } finally {
        setIsLoadingOwnedBooks(false);
      }
    };

    loadOwnedBooks();
  }, [authUser, isAuthenticated]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!authUser?.id) {
      alert('Unable to update profile: missing user identifier.');
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
      alert(getApiErrorMessage(err, 'Failed to update profile.'));
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
      setError('Cannot add book: you must be logged in.');
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
      setError(getApiErrorMessage(err, 'Failed to add book.'));
    } finally {
      setIsAddingBook(false);
    }
  };

  const handleReturnBook = async (book) => {
    const returnedBy = authUser.login || authUser.name;
    if (!returnedBy) {
      alert('Please login first.');
      return;
    }

    const confirmed = window.confirm(`Confirm return: Mark "${book.title}" as returned?`);
    if (!confirmed) return;

    try {
      await bookAPI.return(book.id, returnedBy);
      await refreshOwnedBooks();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to return book.'));
    }
  };

  const handleDeactivateBook = async (book) => {
    // Check if user is book owner or admin
    const isOwner = Number(book.ownerId) === Number(authUser.id);
    const isAdmin = authUser.userRole === 'admin' || authUser.userRole === 'localAdmin';

    if (!isOwner && !isAdmin) {
      alert('You do not have permission to deactivate this book.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to deactivate "${book.title}"?`);
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
      alert(getApiErrorMessage(err, 'Failed to deactivate book.'));
    }
  };

  const handleActivateBook = async (book) => {
    // Check if user is book owner or admin
    const isOwner = Number(book.ownerId) === Number(authUser.id);
    const isAdmin = authUser.userRole === 'admin' || authUser.userRole === 'localAdmin';

    if (!isOwner && !isAdmin) {
      alert('You do not have permission to activate this book.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to activate "${book.title}"?`);
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
      alert(getApiErrorMessage(err, 'Failed to activate book.'));
    }
  };

  if (!isAuthenticated || !authUser) {
    return (
      <div className="profile-container">
        <h1>My Profile</h1>
        <div className="section">
          <p className="empty-message">
            Please <Link to="/login">log in</Link> to manage your books and profile details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-layout">
        <div className="profile-card">
          <h2>Personal Information</h2>
          {!isEditing ? (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">First Name:</span>
                <span className="value">{user.firstName}</span>
              </div>
              <div className="info-row">
                <span className="label">Last Name:</span>
                <span className="value">{user.lastName}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Contact:</span>
                <span className="value">{user.contact || '-'}</span>
              </div>
              <div className="info-row">
                <span className="label">Username (login):</span>
                <span className="value">{user.login || '-'}</span>
              </div>
              <div className="info-row">
                <span className="label">Member Since:</span>
                <span className="value">{new Date(user.memberSince).toLocaleDateString()}</span>
              </div>
              <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="profile-edit-form">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" value={editData.firstName} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" value={editData.lastName} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={editData.email} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="contact">Contact Number</label>
                <input type="text" id="contact" name="contact" value={editData.contact} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label htmlFor="login">Username (login)</label>
                <input type="text" id="login" name="login" value={editData.login} disabled />
              </div>
              <div className="edit-buttons">
                <button className="btn btn-save" onClick={handleSaveChanges} disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn btn-cancel" onClick={() => { setIsEditing(false); setEditData(user); }}>
                  Cancel
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
              <p>Books Owned</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0 }}>Add New Book</h2>
          <button
            type="button"
            className="btn btn-edit"
            aria-expanded={isAddBookExpanded}
            aria-controls="add-book-form"
            onClick={() => setIsAddBookExpanded((prev) => !prev)}
          >
            {isAddBookExpanded ? 'Hide Form' : 'Show Form'}
          </button>
        </div>
        {isAddBookExpanded && (
        <form id="add-book-form" className="profile-edit-form" onSubmit={handleAddBook}>
          <div className="form-group">
            <label htmlFor="author">Author</label>
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
            <label htmlFor="title">Title</label>
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
            <label htmlFor="genre">Genre</label>
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
            <label htmlFor="language">Language</label>
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
            <label htmlFor="description">Description</label>
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
              {isAddingBook ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
        )}
      </div>

      <div className="section">
        <h2>My Owned Books</h2>
        {isLoadingOwnedBooks && <p>Loading owned books...</p>}
        {error && <p className="empty-message">{error}</p>}
        {ownedBooks.length === 0 && !isLoadingOwnedBooks ? (
          <p className="empty-message">You do not own any books yet.</p>
        ) : (
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Language</th>
                  <th>Borrowed By</th>
                  <th>Borrower Contact</th>
                  <th>Borrowed Date</th>
                  <th>Return Date</th>
                  <th>Edit</th>
                  <th>Return</th>
                  <th>Deactivate</th>
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

                  return (
                    <tr key={book.id} className={isInactive ? 'inactive-row' : ''}>
                      <td className="book-title">{book.title}</td>
                      <td>{book.author || '-'}</td>
                      <td>{book.genre || '-'}</td>
                      <td>{book.language || '-'}</td>
                      <td>{borrowerFullName}</td>
                      <td>{borrowerContact}</td>
                      <td>{book.dateBorrowed ? new Date(book.dateBorrowed).toLocaleDateString() : '-'}</td>
                      <td>{book.dateReturned ? new Date(book.dateReturned).toLocaleDateString() : '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() => navigate(`/books/${book.id}/edit`)}
                          disabled={isInactive}
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        {hasActiveBorrower && !isInactive ? (
                          <button className="btn btn-return" onClick={() => handleReturnBook(book)}>
                            Mark Returned
                          </button>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td>
                        {(Number(book.ownerId) === Number(authUser.id) ||
                          authUser.userRole === 'admin' ||
                          authUser.userRole === 'localAdmin') ? (
                          isInactive ? (
                            <button
                              className="btn btn-activate"
                              onClick={() => handleActivateBook(book)}
                              title="Activate this book"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              className="btn btn-deactivate"
                              onClick={() => handleDeactivateBook(book)}
                              title="Deactivate this book"
                            >
                              Deactivate
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
