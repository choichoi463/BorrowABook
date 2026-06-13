/**
 * Utility functions for the BorrowABook Frontend
 */

/**
 * Format date to readable string
 * @param {Date|String} date - Date to format
 * @param {String} format - Format style ('short', 'long', 'medium')
 * @returns {String} - Formatted date
 */
export const formatDate = (date, format = 'short') => {
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'long', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  };

  return new Date(date).toLocaleDateString('en-US', options[format]);
};

/**
 * Calculate days remaining
 * @param {Date|String} targetDate - Target date
 * @returns {Number} - Days remaining
 */
export const getDaysRemaining = (targetDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const timeDiff = target - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return daysDiff;
};

/**
 * Truncate text
 * @param {String} text - Text to truncate
 * @param {Number} maxLength - Max length
 * @param {String} suffix - Suffix to add
 * @returns {String} - Truncated text
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Validate email
 * @param {String} email - Email to validate
 * @returns {Boolean} - Valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password
 * @param {String} password - Password to validate
 * @returns {Object} - Validation result with message
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format rating
 * @param {Number} rating - Rating value
 * @returns {String} - Formatted rating
 */
export const formatRating = (rating) => {
  return rating.toFixed(1);
};

/**
 * Generate star rating display
 * @param {Number} rating - Rating value
 * @param {Number} maxRating - Max rating
 * @returns {String} - Star string
 */
export const generateStarRating = (rating, maxRating = 5) => {
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - filledStars - (hasHalfStar ? 1 : 0);

  let stars = '⭐'.repeat(filledStars);
  if (hasHalfStar) stars += '⭐';
  stars += '☆'.repeat(emptyStars);

  return stars;
};

/**
 * Get initials from name
 * @param {String} firstName - First name
 * @param {String} lastName - Last name
 * @returns {String} - Initials
 */
export const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Format book status
 * @param {Boolean} isAvailable - Availability status
 * @returns {Object} - Status object with label and class
 */
export const formatBookStatus = (isAvailable) => {
  return {
    label: isAvailable ? 'Available' : 'Borrowed',
    className: isAvailable ? 'available' : 'unavailable',
    icon: isAvailable ? '✓' : '✗',
  };
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {Number} delay - Debounce delay in ms
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {Number} delay - Throttle delay in ms
 * @returns {Function} - Throttled function
 */
export const throttle = (func, delay = 300) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

/**
 * Parse API error response
 * @param {Error} error - Error object
 * @returns {String} - Error message
 */
export const parseError = (error) => {
  if (error.response) {
    return error.response.data?.message || 'An error occurred';
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {Boolean} - Is empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Sort array of objects
 * @param {Array} array - Array to sort
 * @param {String} key - Sort key
 * @param {String} order - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted array
 */
export const sortArrayByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
};

