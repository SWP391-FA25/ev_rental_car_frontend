import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for form validation using Zod schemas
 * @param {Object} schema - Zod schema for validation
 * @returns {Object} Validation utilities and state
 */
export const useFormValidation = schema => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  /**
   * Validate form data using the provided schema
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result
   */
  const validate = useCallback(
    data => {
      try {
        const validatedData = schema.parse(data);
        setErrors({});
        return {
          success: true,
          data: validatedData,
          errors: null,
        };
      } catch (error) {
        if (error.name === 'ZodError' && error.issues) {
          const newErrors = {};
          error.issues.forEach(err => {
            const field = err.path.join('.');
            // Translate error message using i18n
            const translatedMessage = t(err.message, {
              defaultValue: err.message,
            });
            newErrors[field] = translatedMessage;
          });
          setErrors(newErrors);
          return {
            success: false,
            data: null,
            errors: newErrors,
          };
        }
        throw error;
      }
    },
    [schema, t]
  );

  /**
   * Validate a single field
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  const validateField = useCallback(
    (field, value) => {
      try {
        // Create a partial schema for the specific field
        const fieldSchema = schema.shape[field];
        if (!fieldSchema) return null;

        fieldSchema.parse(value);
        // Clear error for this field if validation passes
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return null;
      } catch (error) {
        if (error.name === 'ZodError' && error.issues) {
          const errorMessage = error.issues[0]?.message || 'validation.invalid';
          const translatedMessage = t(errorMessage, {
            defaultValue: errorMessage,
          });

          // Set error for this field
          setErrors(prev => ({
            ...prev,
            [field]: translatedMessage,
          }));
          return translatedMessage;
        }
        return t('validation.invalid', { defaultValue: 'Invalid value' });
      }
    },
    [schema, t]
  );

  /**
   * Clear error for a specific field
   * @param {string} field - Field name to clear error for
   */
  const clearError = useCallback(field => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Check if a field has an error
   * @param {string} field - Field name to check
   * @returns {boolean} True if field has error
   */
  const hasError = useCallback(
    field => {
      return !!errors[field];
    },
    [errors]
  );

  /**
   * Get error message for a field
   * @param {string} field - Field name
   * @returns {string|null} Error message or null
   */
  const getError = useCallback(
    field => {
      return errors[field] || null;
    },
    [errors]
  );

  /**
   * Check if form has any errors
   * @returns {boolean} True if form has errors
   */
  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  /**
   * Get all error messages
   * @returns {Object} All error messages
   */
  const getAllErrors = useCallback(() => {
    return errors;
  }, [errors]);

  return {
    // State
    errors,

    // Validation functions
    validate,
    validateField,

    // Error management
    clearError,
    clearErrors,
    hasError,
    getError,
    hasErrors,
    getAllErrors,
  };
};
