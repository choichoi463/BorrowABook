import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, getApiErrorMessage } from '../services/api';
import './UserProfile.css';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin =
    user?.userRole === 'admin' || user?.userRole === 'localAdmin';

  useEffect(() => {
    const loadBook = async () => {
      try {
        const response = await bookAPI.getById(id);
        const book = response.data;
        if (!book) {
          setError('Book not found.');
          return;
        }

        // Access check: must be admin or the book's owner (by FK user ID)
        const isOwner =
          user?.id != null && book.ownerId != null && Number(book.ownerId) === Number(user.id);

        if (!isAdmin && !isOwner) {
          setError('You do not have permission to edit this book.');
          return;
        }

        setForm({
          title: book.title || '',
          author: book.author || '',
          genre: book.genre || '',
          language: book.language || '',
          description: book.description || '',
          // Display-only fields (not sent to backend)
          ownerName: book.ownerName || '',
          ownerContact: book.ownerContact || '',
        });
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load book.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [id, user, isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // BookUpdateRequest: only title, author, description
      await bookAPI.update(id, {
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre.trim() || null,
        language: form.language.trim() || null,
        description: form.description.trim(),
      });
      setSuccessMessage('Book updated successfully.');
      setTimeout(() => navigate(`/books/${id}`), 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save book.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading book...</div>;
  }

  if (error && !form) {
    return (
      <div className="profile-container">
        <button className="btn btn-cancel" onClick={() => navigate(-1)}>← Back</button>
        <p className="empty-message" style={{ color: '#e74c3c', marginTop: '20px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <button
        type="button"
        className="btn btn-cancel"
        style={{ marginBottom: '20px', width: 'auto' }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="section">
        <h2>Edit Book</h2>
        {form?.ownerName && (
          <p style={{ color: '#555', marginBottom: '12px' }}>
            Owner: <strong>{form.ownerName}</strong>
            {form.ownerContact ? ` — Contact: ${form.ownerContact}` : ''}
          </p>
        )}
        {error && <p className="empty-message" style={{ color: '#e74c3c' }}>{error}</p>}
        {successMessage && <p className="empty-message" style={{ color: '#27ae60' }}>{successMessage}</p>}
        {form && (
          <form className="profile-edit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={255}
              />
            </div>
            <div className="form-group">
              <label htmlFor="author">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
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
                value={form.genre}
                onChange={handleChange}
                maxLength={255}
              />
            </div>
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={form.language}
                onChange={handleChange}
                maxLength={255}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={4}
                style={{ padding: '12px', border: '1px solid #bdc3c7', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
            <div className="edit-buttons">
              <button type="submit" className="btn btn-save" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-cancel" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBook;

