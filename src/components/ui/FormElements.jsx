import React from 'react';
import PropTypes from 'prop-types';

/**
 * Text input field with error handling
 */
export const TextField = React.memo(
  ({
    id,
    name,
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    error = null,
    touched = false,
    placeholder = '',
    className = '',
    ...props
  }) => {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="block text-neutral-dark mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg border ${
            error && touched ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary`}
          required={required}
          {...props}
        />
        {error && touched && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Textarea field with error handling
 */
export const TextArea = React.memo(
  ({
    id,
    name,
    label,
    value,
    onChange,
    required = false,
    error = null,
    touched = false,
    rows = 4,
    placeholder = '',
    className = '',
    ...props
  }) => {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="block text-neutral-dark mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg border ${
            error && touched ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary`}
          required={required}
          {...props}
        ></textarea>
        {error && touched && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

TextArea.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  rows: PropTypes.number,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Select dropdown with error handling
 */
export const SelectField = React.memo(
  ({
    id,
    name,
    label,
    value,
    onChange,
    options = [],
    required = false,
    error = null,
    touched = false,
    className = '',
    ...props
  }) => {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="block text-neutral-dark mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 rounded-lg border ${
            error && touched ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary`}
          required={required}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && touched && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

SelectField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * File input field with error handling
 */
export const FileField = React.memo(
  ({
    id,
    name,
    label,
    onChange,
    accept,
    required = false,
    error = null,
    touched = false,
    helpText = '',
    className = '',
    ...props
  }) => {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="block text-neutral-dark mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type="file"
          id={id}
          name={name}
          onChange={onChange}
          accept={accept}
          className="block w-full text-sm text-neutral-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          {...props}
        />
        {error && touched && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {helpText && <p className="text-neutral/70 text-sm mt-2">{helpText}</p>}
      </div>
    );
  }
);

FileField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  accept: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  helpText: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Form error alert component
 */
export const FormError = React.memo(({ error, onClose, className = '' }) => {
  if (!error) return null;

  return (
    <div
      className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center ${className}`}
    >
      <span>{error}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-700 hover:text-red-900 focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
});

FormError.propTypes = {
  error: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

/**
 * Button component
 */
export const Button = React.memo(
  ({
    type = 'button',
    variant = 'primary', // primary, secondary, outline, danger
    size = 'md', // sm, md, lg
    onClick,
    disabled = false,
    isLoading = false,
    className = '',
    children,
    ...props
  }) => {
    const baseClasses = 'rounded font-medium transition-colors focus:outline-none';

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-primary/70',
      secondary:
        'bg-neutral-light text-neutral-dark hover:bg-neutral-200 disabled:bg-neutral-light/70',
      outline:
        'border border-neutral hover:bg-neutral-50 text-neutral-dark disabled:bg-neutral-50/70',
      danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-500/70',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || isLoading}
        className={classes}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="inline-block h-4 w-4 border-t-2 border-current border-solid rounded-full animate-spin mr-2"></span>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.propTypes = {
  type: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Form group component for layout
 */
export const FormGroup = React.memo(({ columns = 1, gap = 6, className = '', children }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = `gap-${gap}`;

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses} ${className}`}>{children}</div>
  );
});

FormGroup.propTypes = {
  columns: PropTypes.oneOf([1, 2, 3, 4]),
  gap: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
};
