import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, getApiErrorMessage } from '../services/api';
import { useTranslation } from 'react-i18next';
import './BooksList.css';

const BooksList = () => {
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(i18n.language);
  };

  const getOwnerFullName = (book) => [book.ownerName, book.ownerSurname].filter(Boolean).join(' ') || '-';

  const getBorrowerFullName = (book) =>
    [book.borrowedByUserName, book.borrowedByUserSurname].filter(Boolean).join(' ');

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setBooks([]);
      setFilteredBooks([]);
      setIsLoading(false);
      setError('');
      return;
    }

    const fetchBooks = async () => {
      try {
        const response = await bookAPI.getAll();
        setBooks(response.data);
        setFilteredBooks(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err, t('booksList.failedLoad')));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [isAuthenticated, isAuthLoading, t]);

  useEffect(() => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getOwnerFullName(book).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getBorrowerFullName(book).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (book.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (book.genre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (book.language || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const getStatusLabel = (book) =>
    getBorrowerFullName(book)
      ? t('booksList.borrowedBy', { name: getBorrowerFullName(book) })
      : t('booksList.available');

  const isAdmin = user?.userRole === 'admin' || user?.userRole === 'localAdmin';

  const renderStatusContent = (book) => {
    const borrowerFullName = getBorrowerFullName(book);
    if (!borrowerFullName) {
      return t('booksList.available');
    }

    if (isAdmin && book.borrowedByUserId != null) {
      return (
        <>
          {t('booksList.borrowedByPrefix')}{' '}
          <Link to={`/admin/users/${book.borrowedByUserId}`} className="borrower-link">
            {borrowerFullName}
          </Link>
        </>
      );
    }

    return t('booksList.borrowedBy', { name: borrowerFullName });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key: null, direction: 'asc' };
    });
  };

  const displayedBooks = [...filteredBooks].sort((a, b) => {
    if (!sortConfig.key) {
      return 0;
    }

    const getComparable = (book) => {
      switch (sortConfig.key) {
        case 'title':
          return (book.title || '').toLowerCase();
        case 'ownerName':
          return getOwnerFullName(book).toLowerCase();
        case 'author':
          return (book.author || '').toLowerCase();
        case 'genre':
          return (book.genre || '').toLowerCase();
        case 'language':
          return (book.language || '').toLowerCase();
        case 'dateAdded':
          {
            const time = new Date(book.dateAdded || 0).getTime();
            return Number.isNaN(time) ? 0 : time;
          }
        case 'status':
          return getStatusLabel(book).toLowerCase();
        default:
          return '';
      }
    };

    const left = getComparable(a);
    const right = getComparable(b);
    const comparison = left > right ? 1 : left < right ? -1 : 0;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return '↕';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getAriaSort = (key) => {
    if (sortConfig.key !== key) {
      return 'none';
    }
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  if (isAuthLoading || isLoading) {
    return <div className="loading">{t('booksList.loading')}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="books-container">
        <h1>{t('booksList.pageTitle')}</h1>
        <div className="no-results">
          <p>
            {t('booksList.loginRequiredPrefix')} <Link to="/login">{t('booksList.loginRequiredLink')}</Link>{' '}
            {t('booksList.loginRequiredSuffix')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="books-container">
      <h1>{t('booksList.pageTitle')}</h1>

      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('booksList.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="view-toggle" role="group" aria-label="Book list view mode">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
          >
            {t('booksList.grid')}
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            aria-pressed={viewMode === 'table'}
          >
            {t('booksList.table')}
          </button>
        </div>
      </div>

      <div className="books-count">
        {displayedBooks.length === 1
          ? t('booksList.showing', { count: displayedBooks.length })
          : t('booksList.showingPlural', { count: displayedBooks.length })}
      </div>

      {displayedBooks.length === 0 ? (
        <div className="no-results">
          <p>{t('booksList.noResults')}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="books-grid">
          {displayedBooks.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-cover">📚</div>
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">{t('booksList.author')}: {book.author || '-'}</p>
                <p className="author">{t('booksList.genre')}: {book.genre || '-'}</p>
                <p className="author">{t('booksList.language')}: {book.language || '-'}</p>
                <p className="author">{t('booksList.owner')}: {getOwnerFullName(book)}</p>
                <div className="book-footer">
                  <span className="rating">{t('booksList.added')}: {formatDate(book.dateAdded)}</span>
                  <span className={`availability ${book.borrowedByUserName ? 'unavailable' : 'available'}`}>
                    {renderStatusContent(book)}
                  </span>
                </div>
                <Link to={`/books/${book.id}`} className="btn btn-view">
                  {t('booksList.viewDetails')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="books-table-container">
          <table className="books-table books-table-compact">
            <thead>
              <tr>
                <th aria-sort={getAriaSort('title')}>
                  <button type="button" className="sort-btn" onClick={() => handleSort('title')}>
                    {t('booksList.titleColumn')} <span className="sort-indicator">{getSortIndicator('title')}</span>
                  </button>
                </th>

                <th aria-sort={getAriaSort('author')}>
                  <button type="button" className="sort-btn" onClick={() => handleSort('author')}>
                    {t('booksList.author')} <span className="sort-indicator">{getSortIndicator('author')}</span>
                  </button>
                </th>
                <th aria-sort={getAriaSort('ownerName')}>
                  <button type="button" className="sort-btn" onClick={() => handleSort('ownerName')}>
                    {t('booksList.owner')} <span className="sort-indicator">{getSortIndicator('ownerName')}</span>
                  </button>
                </th>
                <th aria-sort={getAriaSort('genre')}>
                  <button type="button" className="sort-btn" onClick={() => handleSort('genre')}>
                    {t('booksList.genre')} <span className="sort-indicator">{getSortIndicator('genre')}</span>
                  </button>
                </th>
                <th aria-sort={getAriaSort('language')}>
                  <button type="button" className="sort-btn" onClick={() => handleSort('language')}>
                    {t('booksList.language')} <span className="sort-indicator">{getSortIndicator('language')}</span>
                  </button>
                </th>
                <th aria-sort={getAriaSort('dateAdded')}>
                  <button type="button" className="sort-btn" onClick={() => handleSort('dateAdded')}>
                    {t('booksList.added')} <span className="sort-indicator">{getSortIndicator('dateAdded')}</span>
                  </button>
                </th>
                <th aria-sort={getAriaSort('status')}>
                  <button type="button" className="sort-btn" onClick={() => handleSort('status')}>
                    {t('booksList.status')} <span className="sort-indicator">{getSortIndicator('status')}</span>
                  </button>
                </th>
                <th>{t('booksList.action')}</th>
              </tr>
            </thead>
            <tbody>
              {displayedBooks.map((book) => (
                <tr key={book.id}>
                  <td className="book-title-cell">{book.title}</td>
                  <td>{book.author || '-'}</td>
                  <td>{getOwnerFullName(book)}</td>
                  <td>{book.genre || '-'}</td>
                  <td>{book.language || '-'}</td>
                  <td>{formatDate(book.dateAdded)}</td>
                  <td>
                    <span className={`availability ${book.borrowedByUserName ? 'unavailable' : 'available'}`}>
                      {renderStatusContent(book)}
                    </span>
                  </td>
                  <td>
                    <Link to={`/books/${book.id}`} className="btn btn-view btn-view-compact">
                      {t('booksList.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BooksList;
