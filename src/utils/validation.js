import { VALIDATION_RULES } from '../config/constants';
import { createError } from './errorHandler';

export const validateEmail = (email) => {
  if (!email) {
    throw createError('Email is required', 'VALIDATION_ERROR');
  }

  if (!VALIDATION_RULES.email.pattern.test(email)) {
    throw createError('Invalid email format', 'VALIDATION_ERROR');
  }

  return true;
};

export const validatePassword = (password) => {
  if (!password) {
    throw createError('Password is required', 'VALIDATION_ERROR');
  }

  const { minLength, requireUppercase, requireLowercase, requireNumber, requireSpecialChar } =
    VALIDATION_RULES.password;

  if (password.length < minLength) {
    throw createError(`Password must be at least ${minLength} characters long`, 'VALIDATION_ERROR');
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    throw createError('Password must contain at least one uppercase letter', 'VALIDATION_ERROR');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    throw createError('Password must contain at least one lowercase letter', 'VALIDATION_ERROR');
  }

  if (requireNumber && !/\d/.test(password)) {
    throw createError('Password must contain at least one number', 'VALIDATION_ERROR');
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw createError('Password must contain at least one special character', 'VALIDATION_ERROR');
  }

  return true;
};

export const validateUsername = (username) => {
  if (!username) {
    throw createError('Username is required', 'VALIDATION_ERROR');
  }

  const { minLength, maxLength, pattern } = VALIDATION_RULES.username;

  if (username.length < minLength || username.length > maxLength) {
    throw createError(
      `Username must be between ${minLength} and ${maxLength} characters`,
      'VALIDATION_ERROR'
    );
  }

  if (!pattern.test(username)) {
    throw createError(
      'Username can only contain letters, numbers, underscores, and hyphens',
      'VALIDATION_ERROR'
    );
  }

  return true;
};

export const validateImage = (file) => {
  if (!file) {
    throw createError('Image is required', 'VALIDATION_ERROR');
  }

  const { maxSize, allowedTypes } = VALIDATION_RULES.image;

  if (file.size > maxSize) {
    throw createError(
      `Image size must be less than ${maxSize / 1024 / 1024}MB`,
      'VALIDATION_ERROR'
    );
  }

  if (!allowedTypes.includes(file.type)) {
    throw createError(
      `Invalid image type. Allowed types: ${allowedTypes.join(', ')}`,
      'VALIDATION_ERROR'
    );
  }

  return true;
};

export const validateCarData = (carData) => {
  const requiredFields = [
    'brand',
    'model',
    'year',
    'price',
    'mileage',
    'transmission',
    'fuel',
    'condition',
  ];

  for (const field of requiredFields) {
    if (!carData[field]) {
      throw createError(`${field} is required`, 'VALIDATION_ERROR');
    }
  }

  if (carData.year < 1900 || carData.year > new Date().getFullYear()) {
    throw createError('Invalid year', 'VALIDATION_ERROR');
  }

  if (carData.price <= 0) {
    throw createError('Price must be greater than 0', 'VALIDATION_ERROR');
  }

  if (carData.mileage < 0) {
    throw createError('Mileage cannot be negative', 'VALIDATION_ERROR');
  }

  return true;
};

export const validateSearchParams = (params) => {
  const { minPrice, maxPrice, minYear, maxYear, minMileage, maxMileage } = params;

  if (minPrice && maxPrice && minPrice > maxPrice) {
    throw createError('Minimum price cannot be greater than maximum price', 'VALIDATION_ERROR');
  }

  if (minYear && maxYear && minYear > maxYear) {
    throw createError('Minimum year cannot be greater than maximum year', 'VALIDATION_ERROR');
  }

  if (minMileage && maxMileage && minMileage > maxMileage) {
    throw createError('Minimum mileage cannot be greater than maximum mileage', 'VALIDATION_ERROR');
  }

  return true;
};
