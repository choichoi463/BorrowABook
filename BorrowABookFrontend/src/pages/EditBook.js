import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './UserProfile.css';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

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
          setError(t('editBook.notFound'));
          return;
        }

        // Access check: must be admin or the book's owner (by FK user ID)
        const isOwner =
          user?.id != null && book.ownerId != null && Number(book.ownerId) === Number(user.id);

        if (!isAdmin && !isOwner) {
          setError(t('editBook.noPermission'));
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
        setError(getApiErrorMessage(err, t('editBook.failedLoad')));
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [id, user, isAdmin, t]);

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
      setSuccessMessage(t('editBook.saved'));
      setTimeout(() => navigate(`/books/${id}`), 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, t('editBook.failedSave')));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading">{t('editBook.loading')}</div>;
  }

  if (error && !form) {
    return (
      <div className="profile-container">
        <button className="btn btn-cancel" onClick={() => navigate(-1)}>{t('editBook.back')}</button>
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
        {t('editBook.back')}
      </button>

      <div className="section">
        <h2>{t('editBook.title')}</h2>
        {form?.ownerName && (
          <p style={{ color: '#555', marginBottom: '12px' }}>
            {t('editBook.owner')}: <strong>{form.ownerName}</strong>
            {form.ownerContact ? ` — ${t('editBook.contact')}: ${form.ownerContact}` : ''}
          </p>
        )}
        {error && <p className="empty-message" style={{ color: '#e74c3c' }}>{error}</p>}
        {successMessage && <p className="empty-message" style={{ color: '#27ae60' }}>{successMessage}</p>}
        {form && (
          <form className="profile-edit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">{t('editBook.titleLabel')}</label>
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
              <label htmlFor="author">{t('editBook.author')}</label>
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
              <label htmlFor="genre">{t('editBook.genre')}</label>
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
              <label htmlFor="language">{t('editBook.language')}</label>
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
              <label htmlFor="description">{t('editBook.description')}</label>
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
                {isSaving ? t('userProfile.saving') : t('editBook.saveChanges')}
              </button>
              <button type="button" className="btn btn-cancel" onClick={() => navigate(-1)}>
                {t('editBook.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBook;

