import { z } from 'zod';

/**
 * Promotion creation validation schema
 */
export const promotionCreateSchema = z
  .object({
    code: z
      .string()
      .min(1, 'validation.codeRequired')
      .min(3, 'validation.codeMinLength')
      .max(20, 'validation.codeMaxLength')
      .regex(/^[A-Z0-9]+$/, 'validation.codeInvalidFormat'),
    description: z
      .string()
      .optional()
      .refine(
        val => !val || val.trim().length <= 500,
        'validation.descriptionTooLong'
      ),
    discount: z.coerce
      .number()
      .positive('validation.discountPositive')
      .max(100, 'validation.discountMax')
      .multipleOf(0.01, 'validation.discountInvalidFormat'),
    validFrom: z.date({
      required_error: 'validation.validFromRequired',
      invalid_type_error: 'validation.validFromInvalid',
    }),
    validUntil: z.date({
      required_error: 'validation.validUntilRequired',
      invalid_type_error: 'validation.validUntilInvalid',
    }),
  })
  .refine(data => data.validFrom < data.validUntil, {
    message: 'validation.dateRangeInvalid',
    path: ['validUntil'],
  });

/**
 * Promotion update validation schema (same as create)
 */
export const promotionUpdateSchema = promotionCreateSchema;

export const validatePromotionCreate = data => {
  try {
    const validatedData = promotionCreateSchema.parse(data);
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

export const validatePromotionUpdate = data => {
  try {
    const validatedData = promotionUpdateSchema.parse(data);
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
export const validatePromotionField = (field, value, formData = {}) => {
  try {
    switch (field) {
      case 'code':
        if (!value) {
          return 'validation.codeRequired';
        }
        if (value.length < 3) {
          return 'validation.codeMinLength';
        }
        if (value.length > 20) {
          return 'validation.codeMaxLength';
        }
        if (!/^[A-Z0-9]+$/.test(value)) {
          return 'validation.codeInvalidFormat';
        }
        break;
      case 'description':
        if (value && value.trim().length > 500) {
          return 'validation.descriptionTooLong';
        }
        break;
      case 'discount': {
        if (value === '' || value === null || value === undefined) {
          return 'validation.discountRequired';
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'validation.discountInvalid';
        }
        if (numValue <= 0) {
          return 'validation.discountPositive';
        }
        if (numValue > 100) {
          return 'validation.discountMax';
        }
        break;
      }
      case 'validFrom':
        if (!value) {
          return 'validation.validFromRequired';
        }
        if (!(value instanceof Date) || isNaN(value.getTime())) {
          return 'validation.validFromInvalid';
        }
        break;
      case 'validUntil':
        if (!value) {
          return 'validation.validUntilRequired';
        }
        if (!(value instanceof Date) || isNaN(value.getTime())) {
          return 'validation.validUntilInvalid';
        }
        if (formData.validFrom && value <= formData.validFrom) {
          return 'validation.dateRangeInvalid';
        }
        break;
      default:
        return null;
    }
    return null;
  } catch {
    return 'validation.invalid';
  }
};
