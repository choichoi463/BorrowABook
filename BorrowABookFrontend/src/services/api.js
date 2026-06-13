import axios from 'axios';

// API base URL - Update this when integrating with backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.statusText) {
    return error.response.statusText;
  }
  return fallbackMessage;
};

// Auth APIs
export const authAPI = {
  login: (login, password) => api.post('/users/login', { login, password }),
  register: (payload) => api.post('/users/register', payload),
  forgotPassword: (email) => api.post('/users/forgot-password', { email }),
  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// User APIs
export const userAPI = {
  // There is no dedicated profile endpoint in backend yet.
  // Keep profile in local storage and derive borrowed books via books endpoint.
  getBorrowedBooks: (borrowedBy) => api.get('/books', { params: { borrowedBy } }),
  updateProfile: (userId, payload) => api.put(`/users/${userId}`, payload),
};

// Admin User APIs
export const adminUserAPI = {
  getAll: () => api.get('/admin/users'),
  getById: (userId) => api.get(`/admin/users/${userId}`),
  activate: (userId) => api.put(`/admin/users/${userId}/activate`),
  deactivate: (userId) => api.put(`/admin/users/${userId}/deactivate`),
};

// Book APIs
export const bookAPI = {
  getAll: (params) => api.get('/books', { params }),
  getAllIncludeInactive: (params) => api.get('/books', { params: { ...params, includeInactive: true } }),
  getById: async (id) => {
    const response = await api.get('/books');
    return {
      ...response,
      data: response.data.find((book) => Number(book.id) === Number(id)) || null,
    };
  },
  // payload: { ownerId, title, author, genre, language, description }
  add: (payload) => api.post('/books', payload),
  // payload: { title, author, genre, language, description }
  update: (bookId, payload) => api.put(`/books/${bookId}`, payload),
  delete: (bookId, deletedBy) => api.delete(`/books/${bookId}`, { params: { deletedBy } }),
  // borrowedByUserId: Long (FK to user)
  borrow: (bookId, borrowedByUserId) => api.post(`/books/${bookId}/borrow`, { borrowedByUserId }),
  return: (bookId, returnedBy) => api.post(`/books/${bookId}/return`, { returnedBy }),
  history: (bookId) => api.get(`/books/${bookId}/history`),
   // deactivate: { userId, userRole, deactivatedBy }
   deactivate: (bookId, userId, userRole, deactivatedBy) =>
     api.post(`/books/${bookId}/deactivate`, { userId, userRole, deactivatedBy }),
   // activate: { userId, userRole, activatedBy }
   activate: (bookId, userId, userRole, activatedBy) =>
     api.post(`/books/${bookId}/activate`, { userId, userRole, activatedBy }),
};

// Rating APIs
export const ratingAPI = {
  getBookRatings: (bookId) => api.get(`/books/${bookId}/ratings`),
  addRating: (bookId, rating, comment, ratedBy) =>
    api.post(`/books/${bookId}/ratings`, { rating, comment, ratedBy }),
};

export default api;
