import { ERROR_MESSAGES } from '../config/constants';

class AppError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  // Handle Firebase Auth errors
  if (error.code?.startsWith('auth/')) {
    const errorCode = error.code.replace('auth/', '');
    return {
      message: ERROR_MESSAGES.auth[errorCode] || error.message,
      code: error.code,
      details: error.details,
    };
  }

  // Handle Firebase Storage errors
  if (error.code?.startsWith('storage/')) {
    const errorCode = error.code.replace('storage/', '');
    return {
      message: ERROR_MESSAGES.image[errorCode] || error.message,
      code: error.code,
      details: error.details,
    };
  }

  // Handle Firebase Database errors
  if (error.code?.startsWith('database/')) {
    return {
      message: 'Database error occurred',
      code: error.code,
      details: error.details,
    };
  }

  // Handle network errors
  if (error.name === 'NetworkError' || error.message.includes('network')) {
    return {
      message: 'Network error occurred. Please check your connection.',
      code: 'NETWORK_ERROR',
      details: error.details,
    };
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: error.details,
    };
  }

  // Handle unknown errors
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error.details,
  };
};

export const createError = (message, code, details = null) => {
  return new AppError(message, code, details);
};

export const isAppError = (error) => {
  return error instanceof AppError;
};

export const handleAsyncError = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      throw createError(
        error.message || 'An error occurred',
        error.code || 'UNKNOWN_ERROR',
        error.details
      );
    }
  };
};
