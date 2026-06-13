import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, ratingAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [book, setBook] = useState(null);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, ratingsCount: 0, ratings: [] });
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: '' });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const [bookResponse, ratingResponse, historyResponse] = await Promise.all([
          bookAPI.getById(id),
          ratingAPI.getBookRatings(id),
          bookAPI.history(id),
        ]);

        setBook(bookResponse.data);
        setRatingSummary(ratingResponse.data);
        setHistory(historyResponse.data);
      } catch (err) {
        setError(getApiErrorMessage(err, t('bookDetails.failedLoad')));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, t]);

  const handleBorrow = async () => {
    if (!user?.id) {
      alert(t('bookDetails.pleaseLogin'));
      return;
    }

    const borrowerLabel = [user.name, user.surname].filter(Boolean).join(' ') || user.login;
    const confirmed = window.confirm(
      book.borrowedByUserName
        ? t('bookDetails.borrowConfirmWithCurrent', {
          title: book.title,
          currentBorrower: book.borrowedByUserName,
          borrower: borrowerLabel,
        })
        : t('bookDetails.borrowConfirm', { title: book.title, borrower: borrowerLabel })
    );
    if (!confirmed) return;

    setIsBorrowing(true);
    try {
      const response = await bookAPI.borrow(id, user.id);
      setBook(response.data);
    } catch (err) {
      alert(getApiErrorMessage(err, t('bookDetails.failedBorrow')));
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleAddRating = async () => {
    if (!ratingForm.comment.trim()) {
      alert(t('bookDetails.commentRequired'));
      return;
    }

    setIsSubmittingRating(true);
    try {
      const raterName = [user?.name, user?.surname].filter(Boolean).join(' ') || user?.login || null;
      await ratingAPI.addRating(
        id,
        Number(ratingForm.rating),
        ratingForm.comment.trim(),
        raterName
      );
      const refreshed = await ratingAPI.getBookRatings(id);
      setRatingSummary(refreshed.data);
      setRatingForm({ rating: 5, comment: '' });
    } catch (err) {
      alert(getApiErrorMessage(err, t('bookDetails.failedSubmitRating')));
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) return <div className="loading">{t('bookDetails.loading')}</div>;
  if (error) return <div className="error">{error}</div>;
  if (!book) return <div className="error">{t('bookDetails.notFound')}</div>;

  // Permission check: admin roles OR the book's owner (by user ID)
  const isAdmin = user?.userRole === 'admin' || user?.userRole === 'localAdmin';
  const isBookOwner = user?.id != null && book.ownerId != null && Number(book.ownerId) === Number(user.id);
  const canEdit = isAdmin || isBookOwner;
  const currentBorrowerFullName = [book.borrowedByUserName, book.borrowedByUserSurname].filter(Boolean).join(' ');

  const renderBorrowerLink = () => {
    if (!currentBorrowerFullName) {
      return null;
    }
    if (isAdmin && book.borrowedByUserId != null) {
      return (
        <Link to={`/admin/users/${book.borrowedByUserId}`} className="borrower-profile-link">
          {currentBorrowerFullName}
        </Link>
      );
    }
    return currentBorrowerFullName;
  };

  return (
    <div className="book-details-container">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', alignItems: 'center' }}>
        <button className="back-button" style={{ marginBottom: 0 }} onClick={() => navigate(-1)}>
          {t('common.back')}
        </button>
        {canEdit && (
          <Link
            to={`/books/${id}/edit`}
            className="back-button"
            style={{ textDecoration: 'none', backgroundColor: '#3498db', color: 'white' }}
          >
            ✏️ {t('bookDetails.editBook')}
          </Link>
        )}
      </div>

      <div className="book-details">
        <div className="book-cover-section">
          <div className="book-cover-large">📚</div>
          <div className="availability-badge">
            <span className={`badge ${book.borrowedByUserName ? 'unavailable' : 'available'}`}>
              {book.borrowedByUserName ? <>{`✗ ${t('booksList.borrowedByPrefix')} `}{renderBorrowerLink()}</> : `✓ ${t('booksList.available')}`}
            </span>
          </div>
        </div>

        <div className="book-content">
          <h1>{book.title}</h1>
          <p className="author">{t('bookDetails.by')} {book.author}</p>
          <p className="author">{t('bookDetails.owner')}: {book.ownerName || '-'}</p>
          <p className="author">{t('bookDetails.genre')}: {book.genre || '-'}</p>
          <p className="author">{t('bookDetails.language')}: {book.language || '-'}</p>

          <div className="rating-section">
            <span className="rating-stars">⭐ {ratingSummary.averageRating.toFixed(1)}</span>
            <span className="review-count">({t('bookDetails.reviewsCount', { count: ratingSummary.ratingsCount })})</span>
          </div>

          <div className="book-info-grid">
            <div className="info-item">
              <span className="label">{t('bookDetails.added')}</span>
              <span className="value">{new Date(book.dateAdded).toLocaleDateString(i18n.language)}</span>
            </div>
            <div className="info-item">
              <span className="label">{t('bookDetails.ownerContact')}</span>
              <span className="value">{book.ownerContact || '-'}</span>
            </div>
            <div className="info-item">
              <span className="label">{t('bookDetails.lastReader')}</span>
              <span className="value">{[book.lastReaderUserName, book.lastReaderUserSurname].filter(Boolean).join(' ') || '-'}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>{t('bookDetails.description')}</h3>
            <p>{book.description}</p>
          </div>

          <div className="borrow-section">
            <h3>
              {book.borrowedByUserName ? (
                <>
                  {t('bookDetails.borrowReplaceCurrentBorrowerPrefix')}
                  {renderBorrowerLink()}
                  {t('bookDetails.borrowReplaceCurrentBorrowerSuffix')}
                </>
              ) : (
                t('bookDetails.borrowThisBook')
              )}
            </h3>
            {user?.id ? (
              <div className="borrow-form">
                <p style={{ marginBottom: '12px', color: '#555' }}>
                  {t('bookDetails.borrowingAs')} <strong>{[user.name, user.surname].filter(Boolean).join(' ') || user.login}</strong>
                </p>
                <button
                  className="btn btn-borrow"
                  onClick={handleBorrow}
                  disabled={isBorrowing}
                >
                  {isBorrowing ? t('bookDetails.processing') : (book.borrowedByUserName ? t('bookDetails.borrowAnyway') : t('bookDetails.borrowNow'))}
                </button>
              </div>
            ) : (
              <p style={{ color: '#888' }}>{t('bookDetails.pleaseLoginPrefix')} <Link to="/login">{t('bookDetails.pleaseLoginLink')}</Link> {t('bookDetails.pleaseLoginSuffix')}</p>
            )}
          </div>

          <div className="borrow-section">
            <h3>{t('bookDetails.addYourRating')}</h3>
            <div className="borrow-form">
              <div className="form-group">
                <label htmlFor="rating">{t('bookDetails.rating')}</label>
                <select
                  id="rating"
                  value={ratingForm.rating}
                  onChange={(e) => setRatingForm((prev) => ({ ...prev, rating: e.target.value }))}
                >
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">{t('bookDetails.comment')}</label>
                <input
                  id="comment"
                  type="text"
                  value={ratingForm.comment}
                  onChange={(e) => setRatingForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder={t('bookDetails.reviewPlaceholder')}
                />
              </div>
              <button className="btn btn-borrow" onClick={handleAddRating} disabled={isSubmittingRating}>
                {isSubmittingRating ? t('bookDetails.saving') : t('bookDetails.submitRating')}
              </button>
            </div>
          </div>

          <div className="description-section">
            <h3>{t('bookDetails.borrowingHistory')}</h3>
            <button
              className="btn btn-edit"
              onClick={() => setShowHistory(!showHistory)}
              style={{ marginBottom: '12px' }}
            >
              {showHistory ? t('bookDetails.hideReadersHistory') : t('bookDetails.viewReadersHistory')}
            </button>
            {showHistory && (
              <div style={{ marginTop: '16px' }}>
                {history.length === 0 ? (
                  <p style={{ color: '#666' }}>{t('bookDetails.noBorrowingHistory')}</p>
                ) : (
                  <div style={{
                    border: '1px solid #ecf0f1',
                    borderRadius: '4px',
                    padding: '12px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {history.map((entry, idx) => (
                        <div
                          key={entry.id || idx}
                          style={{
                            paddingBottom: '12px',
                            marginBottom: '12px',
                            borderBottom: idx < history.length - 1 ? '1px solid #ecf0f1' : 'none'
                          }}
                        >
                          <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>
                            {entry.action === 'BORROWED' && `📖 ${t('bookDetails.actionBorrowed')}`}
                            {entry.action === 'RETURNED' && `📗 ${t('bookDetails.actionReturned')}`}
                            {entry.action === 'CREATED' && `📚 ${t('bookDetails.actionCreated')}`}
                            {entry.action === 'DELETED' && `🗑️ ${t('bookDetails.actionDeleted')}`}
                          </div>
                          {entry.previousBorrowedBy && (
                            <div style={{ color: '#555', fontSize: '14px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '500' }}>{t('bookDetails.borrowedByLabel')}</span> {[entry.previousBorrowedBy, entry.previousBorrowedBySurname].filter(Boolean).join(' ')}
                            </div>
                          )}
                          {entry.previousDateBorrowed && (
                            <div style={{ color: '#555', fontSize: '14px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '500' }}>{t('bookDetails.dateBorrowed')}</span> {new Date(entry.previousDateBorrowed).toLocaleDateString(i18n.language)}
                            </div>
                          )}
                          {entry.previousDateReturned && (
                            <div style={{ color: '#555', fontSize: '14px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '500' }}>{t('bookDetails.dateReturned')}</span> {new Date(entry.previousDateReturned).toLocaleDateString(i18n.language)}
                            </div>
                          )}
                          {entry.previousLastReader && (
                            <div style={{ color: '#555', fontSize: '14px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '500' }}>{t('bookDetails.lastReader')}:</span> {entry.previousLastReader}
                            </div>
                          )}
                          <div style={{ color: '#888', fontSize: '12px', marginTop: '6px' }}>
                            {t('bookDetails.changedBy')} {entry.changedBy || t('bookDetails.systemUser')} {t('bookDetails.on')}{' '}
                            {new Date(entry.changedAt).toLocaleDateString(i18n.language)} {t('bookDetails.at')}{' '}
                            {new Date(entry.changedAt).toLocaleTimeString(i18n.language)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>{t('bookDetails.reviews')}</h2>
        {ratingSummary.ratings.length === 0 ? (
          <p className="no-reviews">{t('bookDetails.noReviews')}</p>
        ) : (
          <div className="reviews-list">
            {ratingSummary.ratings.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-user">{review.ratedBy || t('bookDetails.anonymous')}</span>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{new Date(review.createdAt).toLocaleString(i18n.language)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
