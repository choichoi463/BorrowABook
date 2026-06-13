import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="error-message-container">
      <div className="error-message-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
        {onDismiss && (
          <button className="error-dismiss" onClick={onDismiss}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

