import { useState, useCallback } from 'react';

/**
 * Custom hook for managing async operations
 * @param {Function} asyncFunction - The async function to execute
 * @returns {Object} - { execute, data, loading, error }
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...params) => {
      setStatus('pending');
      setData(null);
      setError(null);

      try {
        const response = await asyncFunction(...params);
        setData(response);
        setStatus('success');
        return response;
      } catch (err) {
        setError(err);
        setStatus('error');
        throw err;
      }
    },
    [asyncFunction]
  );

  return {
    execute,
    status,
    data,
    error,
    loading: status === 'pending',
    isError: status === 'error',
    isSuccess: status === 'success',
  };
};

/**
 * Custom hook for form handling
 * @param {Object} initialState - Initial form values
 * @param {Function} onSubmit - Submit handler
 * @returns {Object} - { values, handleChange, handleSubmit, reset, errors, setFieldValue }
 */
export const useForm = (initialState, onSubmit) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await onSubmit(values);
      } catch (err) {
        console.error('Form submission error:', err);
      }
    },
    [values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
  };
};

/**
 * Custom hook for managing local storage
 * @param {String} key - Storage key
 * @param {*} initialValue - Initial value
 * @returns {Array} - [value, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

/**
 * Custom hook for debouncing values
 * @param {*} value - Value to debounce
 * @param {Number} delay - Debounce delay in ms
 * @returns {*} - Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for pagination
 * @param {Array} items - Items to paginate
 * @param {Number} itemsPerPage - Items per page
 * @returns {Object} - { currentItems, pageCount, goToPage, currentPage, nextPage, prevPage }
 */
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const pageCount = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(page, pageCount));
    setCurrentPage(pageNumber);
  }, [pageCount]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentItems,
    currentPage,
    pageCount,
    goToPage,
    nextPage,
    prevPage,
  };
};

