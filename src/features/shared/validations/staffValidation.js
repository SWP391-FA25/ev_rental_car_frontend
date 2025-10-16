import { z } from 'zod';
import {
  accountStatusSchema,
  addressSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  phoneSchema,
  roleSchema,
} from './commonValidation.js';

/**
 * Staff creation validation schema
 */
export const staffCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  address: addressSchema,
  accountStatus: accountStatusSchema,
  role: roleSchema.optional(),
});

/**
 * Staff update validation schema (password is optional)
 */
export const staffUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  address: addressSchema,
  accountStatus: accountStatusSchema.optional(),
  role: roleSchema.optional(),
});

/**
 * Staff password update validation schema
 */
export const staffPasswordUpdateSchema = z.object({
  password: passwordSchema,
});

/**
 * Validate staff creation data
 * @param {Object} data - Staff data to validate
 * @returns {Object} Validation result with success, data, and errors
 */
export const validateStaffCreate = data => {
  try {
    const validatedData = staffCreateSchema.parse(data);
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
 * Validate staff update data
 * @param {Object} data - Staff data to validate
 * @returns {Object} Validation result with success, data, and errors
 */
export const validateStaffUpdate = data => {
  try {
    const validatedData = staffUpdateSchema.parse(data);
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
 * Validate staff password update data
 * @param {Object} data - Password data to validate
 * @returns {Object} Validation result with success, data, and errors
 */
export const validateStaffPasswordUpdate = data => {
  try {
    const validatedData = staffPasswordUpdateSchema.parse(data);
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
 * @returns {string|null} Error message or null if valid
 */
export const validateStaffField = (field, value) => {
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
      case 'phone':
        phoneSchema.parse(value);
        break;
      case 'address':
        addressSchema.parse(value);
        break;
      case 'accountStatus':
        accountStatusSchema.parse(value);
        break;
      case 'role':
        roleSchema.parse(value);
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
