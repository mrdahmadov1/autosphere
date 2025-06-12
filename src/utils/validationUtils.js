/**
 * Validates that a field is not empty
 * @param {string} value - The value to validate
 * @param {string} fieldName - Name of the field
 * @returns {string|null} - Error message or null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validates that a value is a positive number
 * @param {string|number} value - The value to validate
 * @param {string} fieldName - Name of the field
 * @returns {string|null} - Error message or null if valid
 */
export const validatePositiveNumber = (value, fieldName) => {
  if (!value) {
    return `${fieldName} is required`;
  }

  const num = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }

  if (num <= 0) {
    return `${fieldName} must be greater than 0`;
  }

  return null;
};

/**
 * Validates that a value is a non-negative number
 * @param {string|number} value - The value to validate
 * @param {string} fieldName - Name of the field
 * @returns {string|null} - Error message or null if valid
 */
export const validateNonNegativeNumber = (value, fieldName) => {
  if (!value && value !== 0) {
    return `${fieldName} is required`;
  }

  const num = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }

  if (num < 0) {
    return `${fieldName} cannot be negative`;
  }

  return null;
};

/**
 * Validates a year value
 * @param {string|number} value - The year to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum valid year (default: 1900)
 * @param {number} options.max - Maximum valid year (default: current year + 1)
 * @returns {string|null} - Error message or null if valid
 */
export const validateYear = (value, { min = 1900, max = new Date().getFullYear() + 1 } = {}) => {
  if (!value) {
    return 'Year is required';
  }

  const yearNum = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(yearNum)) {
    return 'Year must be a number';
  }

  if (yearNum < min || yearNum > max) {
    return `Year must be between ${min} and ${max}`;
  }

  return null;
};

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 8)
 * @returns {string|null} - Error message or null if valid
 */
export const validatePassword = (password, { minLength = 8 } = {}) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }

  return null;
};

/**
 * Validates that two passwords match
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {string|null} - Error message or null if valid
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

/**
 * Validates a car listing form
 * @param {Object} formData - Form data
 * @param {boolean} requireImage - Whether image is required
 * @returns {Object} - Object with error messages keyed by field name
 */
export const validateCarForm = (formData, requireImage = true) => {
  const errors = {};

  // Required text fields
  ['brand', 'model', 'color'].forEach((field) => {
    if (!formData[field] || formData[field].trim() === '') {
      const fieldNames = {
        brand: 'Marka',
        model: 'Model',
        color: 'Rəng',
      };
      errors[field] = `${fieldNames[field]} seçilməlidir`;
    }
  });

  // Description
  if (!formData.description || formData.description.trim().length < 10) {
    errors.description = 'Ətraflı təsvir daxil edin (ən azı 10 simvol)';
  }

  // Year
  if (!formData.year || isNaN(formData.year)) {
    errors.year = 'Düzgün il seçin';
  } else {
    const year = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      errors.year = `İl 1900 və ${currentYear} arasında olmalıdır`;
    }
  }

  // Price
  if (!formData.price || isNaN(formData.price)) {
    errors.price = 'Düzgün qiymət daxil edin';
  } else {
    const price = parseInt(formData.price);
    if (price <= 0) {
      errors.price = 'Qiymət 0-dan böyük olmalıdır';
    }
  }

  // Mileage
  if (!formData.mileage || isNaN(formData.mileage)) {
    errors.mileage = 'Düzgün yürüş daxil edin';
  } else {
    const mileage = parseInt(formData.mileage);
    if (mileage < 0) {
      errors.mileage = 'Yürüş mənfi ola bilməz';
    }
  }

  // Image validation - only check if we have images array
  if (requireImage && (!formData.images || formData.images.length === 0)) {
    errors.image = 'Ən azı bir şəkil yükləyin';
  }

  return errors;
};

/**
 * Helper to check if form has errors
 * @param {Object} errors - Error object
 * @returns {boolean} - True if there are errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
