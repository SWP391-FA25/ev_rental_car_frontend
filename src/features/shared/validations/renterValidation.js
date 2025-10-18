import { z } from 'zod';
import {
  addressSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
} from './commonValidation.js';

/**
 * Renter creation validation schema
 */
export const renterCreateSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'validation.confirmPasswordRequired'),
    phone: z
      .string()
      .min(1, 'validation.phoneRequired')
      .refine(val => /^0\d{9}$/.test(val), 'validation.phoneInvalid'),
    address: addressSchema,
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'validation.passwordMismatch',
    path: ['confirmPassword'],
  });

/**
 * Renter update validation schema (password is optional)
 */
export const renterUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: z
    .string()
    .min(1, 'validation.phoneRequired')
    .refine(val => /^0\d{9}$/.test(val), 'validation.phoneInvalid')
    .optional(),
  address: addressSchema,
});

/**
 * Renter password update validation schema
 */
export const renterPasswordUpdateSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'validation.confirmPasswordRequired'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'validation.passwordMismatch',
    path: ['confirmPassword'],
  });

/**
 * Validate renter creation data
 * @param {Object} data - Renter data to validate
 * @returns {Object} Validation result with success, data, and errors
 */
export const validateRenterCreate = data => {
  try {
    const validatedData = renterCreateSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.issues.forEach(err => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return {
        success: false,
        data: null,
        errors,
      };
    }
    throw error;
  }
};

/**
 * Validate renter update data
 * @param {Object} data - Renter data to validate
 * @returns {Object} Validation result with success, data, and errors
 */
export const validateRenterUpdate = data => {
  try {
    const validatedData = renterUpdateSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.issues.forEach(err => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return {
        success: false,
        data: null,
        errors,
      };
    }
    throw error;
  }
};

/**
 * Validate renter password update data
 * @param {Object} data - Password data to validate
 * @returns {Object} Validation result with success, data, and errors
 */
export const validateRenterPasswordUpdate = data => {
  try {
    const validatedData = renterPasswordUpdateSchema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.issues.forEach(err => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return {
        success: false,
        data: null,
        errors,
      };
    }
    throw error;
  }
};

/**
 * Get field-specific validation for real-time validation
 * @param {string} field - Field name to validate
 * @param {*} value - Value to validate
 * @param {Object} formData - Full form data for cross-field validation
 * @returns {string|null} Error message or null if valid
 */
export const validateRenterField = (field, value, formData = {}) => {
  try {
    switch (field) {
      case 'name':
        nameSchema.parse(value);
        break;
      case 'email':
        emailSchema.parse(value);
        break;
      case 'password':
        passwordSchema.parse(value);
        break;
      case 'confirmPassword':
        if (!value) {
          return 'validation.confirmPasswordRequired';
        }
        if (formData.password && value !== formData.password) {
          return 'validation.passwordMismatch';
        }
        break;
      case 'phone':
        if (!value) {
          return 'validation.phoneRequired';
        }
        if (!/^0\d{9}$/.test(value)) {
          return 'validation.phoneInvalid';
        }
        break;
      case 'address':
        addressSchema.parse(value);
        break;
      default:
        return null;
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'validation.invalid';
    }
    return 'validation.invalid';
  }
};
