// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    LOGOUT: '/users/logout',
  },
  USERS: {
    BORROWED_BOOKS: '/books?borrowedBy={value}',
  },
  BOOKS: {
    LIST: '/books',
    DETAILS: (id) => `/books/${id}`,
    BORROW: (id) => `/books/${id}/borrow`,
    RETURN: (id) => `/books/${id}/return`,
    HISTORY: (id) => `/books/${id}/history`,
  },
  RATINGS: {
    GET: (bookId) => `/books/${bookId}/ratings`,
    ADD: (bookId) => `/books/${bookId}/ratings`,
  },
};

// Book Categories
export const BOOK_CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Mystery', 'Romance'];

// Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTER_FAILED: 'Registration failed. Please try again.',
  BORROW_FAILED: 'Failed to borrow book. Please try again.',
  RETURN_FAILED: 'Failed to return book. Please try again.',
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful! Please login.',
  BORROW_SUCCESS: 'Book borrowed successfully!',
  RETURN_SUCCESS: 'Book returned successfully!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50],
};

