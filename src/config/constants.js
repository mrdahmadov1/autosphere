// App Configuration
export const APP_CONFIG = {
  name: 'AutoSphere',
  description: 'Your trusted car marketplace',
  version: '1.0.0',
};

// Feature Flags
export const FEATURES = {
  enableSocialAuth: true,
  enableEmailVerification: true,
  enableAnalytics: true,
};

// API Configuration
export const API_CONFIG = {
  rateLimit: 100,
  timeout: 30000,
};

// Image Configuration
export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxDimension: 2048,
  compressionQuality: 0.8,
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 12,
  maxPageSize: 50,
};

// Cache Configuration
export const CACHE_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 50, // Maximum number of items
};

// Validation Rules
export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  email: {
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: 'Invalid email or password',
    emailInUse: 'Email is already in use',
    weakPassword: 'Password is too weak',
    userNotFound: 'User not found',
    tooManyRequests: 'Too many attempts. Please try again later',
  },
  image: {
    tooLarge: 'Image size must be less than 5MB',
    invalidType: 'Invalid image type. Please use JPEG, PNG, or WebP',
    uploadFailed: 'Failed to upload image',
  },
  form: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email',
    invalidPassword: 'Password must be at least 8 characters long',
    passwordsDoNotMatch: 'Passwords do not match',
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  auth: {
    login: 'Successfully logged in',
    logout: 'Successfully logged out',
    signup: 'Account created successfully',
    passwordReset: 'Password reset email sent',
    emailVerification: 'Verification email sent',
  },
  car: {
    add: 'Car added successfully',
    update: 'Car updated successfully',
    delete: 'Car deleted successfully',
  },
  profile: {
    update: 'Profile updated successfully',
  },
};

// Routes
export const ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contact',
  login: '/login',
  register: '/register',
  profile: '/profile',
  addCar: '/add-car',
  carDetails: '/cars/:id',
  admin: '/admin',
  notFound: '/404',
};

// Social Auth Providers
export const SOCIAL_AUTH_PROVIDERS = {
  google: {
    name: 'Google',
    icon: 'google',
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
  },
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
  },
};

// Car Categories
export const CAR_CATEGORIES = {
  new: {
    name: 'New Cars',
    icon: 'new',
  },
  used: {
    name: 'Used Cars',
    icon: 'used',
  },
  luxury: {
    name: 'Luxury Cars',
    icon: 'luxury',
  },
  sports: {
    name: 'Sports Cars',
    icon: 'sports',
  },
  suv: {
    name: 'SUVs',
    icon: 'suv',
  },
  electric: {
    name: 'Electric Cars',
    icon: 'electric',
  },
};

// Car Features
export const CAR_FEATURES = {
  transmission: {
    automatic: 'Automatic',
    manual: 'Manual',
  },
  fuel: {
    petrol: 'Petrol',
    diesel: 'Diesel',
    electric: 'Electric',
    hybrid: 'Hybrid',
  },
  condition: {
    new: 'New',
    used: 'Used',
    certified: 'Certified Pre-owned',
  },
};

// Price Ranges
export const PRICE_RANGES = [
  { min: 0, max: 10000, label: 'Under $10,000' },
  { min: 10000, max: 25000, label: '$10,000 - $25,000' },
  { min: 25000, max: 50000, label: '$25,000 - $50,000' },
  { min: 50000, max: 100000, label: '$50,000 - $100,000' },
  { min: 100000, max: Infinity, label: 'Over $100,000' },
];

// Sort Options
export const SORT_OPTIONS = {
  priceAsc: {
    label: 'Price: Low to High',
    value: 'price_asc',
  },
  priceDesc: {
    label: 'Price: High to Low',
    value: 'price_desc',
  },
  newest: {
    label: 'Newest First',
    value: 'newest',
  },
  oldest: {
    label: 'Oldest First',
    value: 'oldest',
  },
  mileageAsc: {
    label: 'Mileage: Low to High',
    value: 'mileage_asc',
  },
  mileageDesc: {
    label: 'Mileage: High to Low',
    value: 'mileage_desc',
  },
};
