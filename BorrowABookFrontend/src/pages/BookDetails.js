import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, ratingAPI, getApiErrorMessage } from '../services/api';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
        setError(getApiErrorMessage(err, 'Failed to load book details.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleBorrow = async () => {
    if (!user?.id) {
      alert('Please log in to borrow this book.');
      return;
    }

    const borrowerLabel = [user.name, user.surname].filter(Boolean).join(' ') || user.login;
    const confirmed = window.confirm(
      book.borrowedByUserName
        ? `"${book.title}" is currently borrowed by ${book.borrowedByUserName}. Replace with your borrow as ${borrowerLabel}?`
        : `Confirm borrow: Do you want to borrow "${book.title}" as ${borrowerLabel}?`
    );
    if (!confirmed) return;

    setIsBorrowing(true);
    try {
      const response = await bookAPI.borrow(id, user.id);
      setBook(response.data);
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to borrow book.'));
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleAddRating = async () => {
    if (!ratingForm.comment.trim()) {
      alert('Please enter a review comment.');
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
      alert(getApiErrorMessage(err, 'Failed to submit rating.'));
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) return <div className="loading">Loading book details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!book) return <div className="error">Book not found</div>;

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
          ← Back
        </button>
        {canEdit && (
          <Link
            to={`/books/${id}/edit`}
            className="back-button"
            style={{ textDecoration: 'none', backgroundColor: '#3498db', color: 'white' }}
          >
            ✏️ Edit Book
          </Link>
        )}
      </div>

      <div className="book-details">
        <div className="book-cover-section">
          <div className="book-cover-large">📚</div>
          <div className="availability-badge">
            <span className={`badge ${book.borrowedByUserName ? 'unavailable' : 'available'}`}>
              {book.borrowedByUserName ? <>✗ Borrowed by {renderBorrowerLink()}</> : '✓ Available'}
            </span>
          </div>
        </div>

        <div className="book-content">
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          <p className="author">Owner: {book.ownerName || '-'}</p>
          <p className="author">Genre: {book.genre || '-'}</p>
          <p className="author">Language: {book.language || '-'}</p>

          <div className="rating-section">
            <span className="rating-stars">⭐ {ratingSummary.averageRating.toFixed(1)}</span>
            <span className="review-count">({ratingSummary.ratingsCount} reviews)</span>
          </div>

          <div className="book-info-grid">
            <div className="info-item">
              <span className="label">Added</span>
              <span className="value">{book.dateAdded}</span>
            </div>
            <div className="info-item">
              <span className="label">Owner Contact</span>
              <span className="value">{book.ownerContact || '-'}</span>
            </div>
            <div className="info-item">
              <span className="label">Last Reader</span>
              <span className="value">{[book.lastReaderUserName, book.lastReaderUserSurname].filter(Boolean).join(' ') || '-'}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{book.description}</p>
          </div>

          <div className="borrow-section">
            <h3>
              {book.borrowedByUserName ? (
                <>Borrow / Replace Current Borrower ({renderBorrowerLink()})</>
              ) : (
                'Borrow This Book'
              )}
            </h3>
            {user?.id ? (
              <div className="borrow-form">
                <p style={{ marginBottom: '12px', color: '#555' }}>
                  Borrowing as: <strong>{[user.name, user.surname].filter(Boolean).join(' ') || user.login}</strong>
                </p>
                <button
                  className="btn btn-borrow"
                  onClick={handleBorrow}
                  disabled={isBorrowing}
                >
                  {isBorrowing ? 'Processing...' : (book.borrowedByUserName ? 'Borrow Anyway' : 'Borrow Now')}
                </button>
              </div>
            ) : (
              <p style={{ color: '#888' }}>Please <Link to="/login">log in</Link> to borrow this book.</p>
            )}
          </div>

          <div className="borrow-section">
            <h3>Add Your Rating</h3>
            <div className="borrow-form">
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
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
                <label htmlFor="comment">Comment</label>
                <input
                  id="comment"
                  type="text"
                  value={ratingForm.comment}
                  onChange={(e) => setRatingForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Write a short review"
                />
              </div>
              <button className="btn btn-borrow" onClick={handleAddRating} disabled={isSubmittingRating}>
                {isSubmittingRating ? 'Saving...' : 'Submit Rating'}
              </button>
            </div>
          </div>

          <div className="description-section">
            <h3>Borrowing History</h3>
            <button
              className="btn btn-edit"
              onClick={() => setShowHistory(!showHistory)}
              style={{ marginBottom: '12px' }}
            >
              {showHistory ? '▼ Hide Readers History' : '▶ View Readers History'}
            </button>
            {showHistory && (
              <div style={{ marginTop: '16px' }}>
                {history.length === 0 ? (
                  <p style={{ color: '#666' }}>No borrowing history yet.</p>
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
                            {entry.action === 'BORROWED' && '📖 Borrowed'}
                            {entry.action === 'RETURNED' && '📗 Returned'}
                            {entry.action === 'CREATED' && '📚 Created'}
                            {entry.action === 'DELETED' && '🗑️ Deleted'}
                          </div>
                          {entry.previousBorrowedBy && (
                            <div style={{ color: '#555', fontSize: '14px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '500' }}>Borrowed by:</span> {[entry.previousBorrowedBy, entry.previousBorrowedBySurname].filter(Boolean).join(' ')}
                            </div>
                          )}
                          {entry.previousDateBorrowed && (
                            <div style={{ color: '#555', fontSize: '14px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '500' }}>Date Borrowed:</span> {new Date(entry.previousDateBorrowed).toLocaleDateString()}
                            </div>
                          )}
                          {entry.previousDateReturned && (
                            <div style={{ color: '#555', fontSize: '14px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '500' }}>Date Returned:</span> {new Date(entry.previousDateReturned).toLocaleDateString()}
                            </div>
                          )}
                          {entry.previousLastReader && (
                            <div style={{ color: '#555', fontSize: '14px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '500' }}>Last Reader:</span> {entry.previousLastReader}
                            </div>
                          )}
                          <div style={{ color: '#888', fontSize: '12px', marginTop: '6px' }}>
                            Changed by: {entry.changedBy || 'System'} on{' '}
                            {new Date(entry.changedAt).toLocaleDateString()} at{' '}
                            {new Date(entry.changedAt).toLocaleTimeString()}
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
        <h2>Reviews</h2>
        {ratingSummary.ratings.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="reviews-list">
            {ratingSummary.ratings.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-user">{review.ratedBy || 'Anonymous'}</span>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{new Date(review.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
