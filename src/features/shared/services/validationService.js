/**
 * Validation service to handle client-side validation
 * Compatible with backend validation.js format
 */

/**
 * Common validation rules
 */
import React from 'react';
export const ValidationRules = {
  // Email validation
  email: {
    required: value => {
      if (!value || value.trim() === '') {
        return 'Email is required';
      }
      return null;
    },
    format: value => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
  },

  // Password validation
  password: {
    required: value => {
      if (!value || value.trim() === '') {
        return 'Password is required';
      }
      return null;
    },
    minLength: minLength => value => {
      if (value && value.length < minLength) {
        return `Password must be at least ${minLength} characters long`;
      }
      return null;
    },
    strength: value => {
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      if (value.length < 8) {
        return 'Password must be at least 8 characters long';
      }

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return 'Password must contain uppercase, lowercase, and numbers';
      }

      return null;
    },
  },

  // Name validation
  name: {
    required: value => {
      if (!value || value.trim() === '') {
        return 'Name is required';
      }
      return null;
    },
    minLength: minLength => value => {
      if (value && value.trim().length < minLength) {
        return `Name must be at least ${minLength} characters long`;
      }
      return null;
    },
    maxLength: maxLength => value => {
      if (value && value.length > maxLength) {
        return `Name must not exceed ${maxLength} characters`;
      }
      return null;
    },
    format: value => {
      if (value && !/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
        return 'Name can only contain letters and spaces';
      }
      return null;
    },
  },

  // Phone validation
  phone: {
    required: value => {
      if (!value || value.trim() === '') {
        return 'Phone number is required';
      }
      return null;
    },
    format: value => {
      // Vietnamese phone number format
      const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;
      if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid Vietnamese phone number';
      }
      return null;
    },
  },

  // Date validation
  date: {
    required: value => {
      if (!value) {
        return 'Date is required';
      }
      return null;
    },
    format: value => {
      if (value && isNaN(Date.parse(value))) {
        return 'Please enter a valid date';
      }
      return null;
    },
    minDate: minDate => value => {
      if (value && new Date(value) < new Date(minDate)) {
        return `Date must be after ${new Date(minDate).toLocaleDateString()}`;
      }
      return null;
    },
    maxDate: maxDate => value => {
      if (value && new Date(value) > new Date(maxDate)) {
        return `Date must be before ${new Date(maxDate).toLocaleDateString()}`;
      }
      return null;
    },
  },

  // Number validation
  number: {
    required: value => {
      if (value === null || value === undefined || value === '') {
        return 'This field is required';
      }
      return null;
    },
    min: minValue => value => {
      if (value !== null && value !== undefined && value < minValue) {
        return `Value must be at least ${minValue}`;
      }
      return null;
    },
    max: maxValue => value => {
      if (value !== null && value !== undefined && value > maxValue) {
        return `Value must not exceed ${maxValue}`;
      }
      return null;
    },
    integer: value => {
      if (
        value !== null &&
        value !== undefined &&
        !Number.isInteger(Number(value))
      ) {
        return 'Value must be a whole number';
      }
      return null;
    },
  },

  // Generic validation
  required: value => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  },

  minLength: minLength => value => {
    if (value && value.length < minLength) {
      return `Must be at least ${minLength} characters long`;
    }
    return null;
  },

  maxLength: maxLength => value => {
    if (value && value.length > maxLength) {
      return `Must not exceed ${maxLength} characters`;
    }
    return null;
  },

  pattern: (regex, message) => value => {
    if (value && !regex.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  },
};

/**
 * Validation schema class
 */
export class ValidationSchema {
  constructor(rules = {}) {
    this.rules = rules;
  }

  /**
   * Add validation rule for a field
   */
  field(fieldName, validators) {
    this.rules[fieldName] = Array.isArray(validators)
      ? validators
      : [validators];
    return this;
  }

  /**
   * Validate a single field
   */
  validateField(fieldName, value) {
    const fieldRules = this.rules[fieldName];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = typeof rule === 'function' ? rule(value) : rule;
      if (error) {
        return error;
      }
    }

    return null;
  }

  /**
   * Validate all fields in data object
   */
  validate(data) {
    const errors = {};
    let isValid = true;

    Object.keys(this.rules).forEach(fieldName => {
      const error = this.validateField(fieldName, data[fieldName]);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    return {
      isValid,
      errors,
    };
  }

  /**
   * Validate specific fields only
   */
  validateFields(data, fieldNames) {
    const errors = {};
    let isValid = true;

    fieldNames.forEach(fieldName => {
      if (this.rules[fieldName]) {
        const error = this.validateField(fieldName, data[fieldName]);
        if (error) {
          errors[fieldName] = error;
          isValid = false;
        }
      }
    });

    return {
      isValid,
      errors,
    };
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // Login form validation
  login: new ValidationSchema({
    email: [ValidationRules.email.required, ValidationRules.email.format],
    password: [ValidationRules.password.required],
  }),

  // Registration form validation
  register: new ValidationSchema({
    name: [
      ValidationRules.name.required,
      ValidationRules.name.minLength(2),
      ValidationRules.name.maxLength(50),
      ValidationRules.name.format,
    ],
    email: [ValidationRules.email.required, ValidationRules.email.format],
    password: [
      ValidationRules.password.required,
      ValidationRules.password.minLength(8),
      ValidationRules.password.strength,
    ],
    phone: [ValidationRules.phone.required, ValidationRules.phone.format],
  }),

  // Profile update validation
  profile: new ValidationSchema({
    name: [
      ValidationRules.name.required,
      ValidationRules.name.minLength(2),
      ValidationRules.name.maxLength(50),
      ValidationRules.name.format,
    ],
    phone: [ValidationRules.phone.format], // Phone is optional for profile update
  }),

  // Change password validation
  changePassword: new ValidationSchema({
    currentPassword: [ValidationRules.password.required],
    newPassword: [
      ValidationRules.password.required,
      ValidationRules.password.minLength(8),
      ValidationRules.password.strength,
    ],
    confirmPassword: [ValidationRules.password.required],
  }),

  // Booking validation
  booking: new ValidationSchema({
    pickupDate: [ValidationRules.date.required, ValidationRules.date.format],
    returnDate: [ValidationRules.date.required, ValidationRules.date.format],
    pickupTime: [ValidationRules.required],
    location: [ValidationRules.required],
  }),
};

/**
 * Utility functions
 */
export const ValidationUtils = {
  /**
   * Create a custom validator function
   */
  custom: (validatorFn, errorMessage) => value => {
    const isValid = validatorFn(value);
    return isValid ? null : errorMessage;
  },

  /**
   * Combine multiple validators
   */
  combine:
    (...validators) =>
    value => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return null;
    },

  /**
   * Conditional validator
   */
  when: (condition, validator) => (value, allData) => {
    if (condition(allData)) {
      return validator(value);
    }
    return null;
  },

  /**
   * Cross-field validation (e.g., confirm password)
   */
  matches: (otherField, errorMessage) => (value, allData) => {
    if (value !== allData[otherField]) {
      return errorMessage || `Must match ${otherField}`;
    }
    return null;
  },

  /**
   * Async validator wrapper
   */
  async: asyncValidator => async value => {
    try {
      const result = await asyncValidator(value);
      return result;
    } catch (error) {
      return error.message || 'Validation failed';
    }
  },
};

/**
 * React hook for form validation
 */
export const useFormValidation = (schema, initialData = {}) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouchedState] = React.useState({});

  const validateField = React.useCallback(
    (fieldName, value) => {
      const error = schema.validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
      return !error;
    },
    [schema]
  );

  const validateAll = React.useCallback(() => {
    const result = schema.validate(data);
    setErrors(result.errors);
    return result.isValid;
  }, [schema, data]);

  const setValue = React.useCallback(
    (fieldName, value) => {
      setData(prev => ({
        ...prev,
        [fieldName]: value,
      }));

      // Validate field if it has been touched
      if (touched[fieldName]) {
        validateField(fieldName, value);
      }
    },
    [touched, validateField]
  );

  const setTouched = React.useCallback(
    fieldName => {
      setTouchedState(prev => ({
        ...prev,
        [fieldName]: true,
      }));

      // Validate field when touched
      validateField(fieldName, data[fieldName]);
    },
    [data, validateField]
  );

  const clearErrors = React.useCallback(() => {
    setErrors({});
  }, []);

  const reset = React.useCallback(
    (newData = initialData) => {
      setData(newData);
      setErrors({});
      setTouchedState({});
    },
    [initialData]
  );

  return {
    data,
    errors,
    touched,
    setValue,
    setTouched,
    validateField,
    validateAll,
    clearErrors,
    reset,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
  };
};

export default ValidationSchema;
