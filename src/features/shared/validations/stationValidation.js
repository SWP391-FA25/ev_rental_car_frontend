import { z } from 'zod';
import {
  capacitySchema,
  locationSchema,
  nameSchema,
  stationStatusSchema,
} from './commonValidation.js';

/**
 * Station creation validation schema
 */
export const stationCreateSchema = z.object({
  name: nameSchema,
  location: locationSchema,
  address: z
    .string()
    .min(1, 'validation.addressRequired')
    .max(255, 'validation.addressTooLong'),
  status: stationStatusSchema,
  capacity: z.coerce.number().pipe(capacitySchema),
  contact: z
    .string()
    .optional()
    .refine(
      val => !val || val.trim().length <= 100,
      'validation.contactTooLong'
    ),
});

/**
 * Station update validation schema (all fields optional)
 */
export const stationUpdateSchema = z.object({
  name: nameSchema.optional(),
  location: locationSchema.optional(),
  address: z
    .string()
    .min(1, 'validation.addressRequired')
    .max(255, 'validation.addressTooLong')
    .optional(),
  status: stationStatusSchema.optional(),
  capacity: z.coerce.number().pipe(capacitySchema).optional(),
  contact: z
    .string()
    .optional()
    .refine(
      val => !val || val.trim().length <= 100,
      'validation.contactTooLong'
    ),
});

export const validateStationCreate = data => {
  try {
    const validatedData = stationCreateSchema.parse(data);
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

export const validateStationUpdate = data => {
  try {
    const validatedData = stationUpdateSchema.parse(data);
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

export const validateStationField = (field, value) => {
  try {
    switch (field) {
      case 'name':
        nameSchema.parse(value);
        break;
      case 'location':
        locationSchema.parse(value);
        break;
      case 'address':
        if (!value) {
          return 'validation.addressRequired';
        }
        if (value.length > 255) {
          return 'validation.addressTooLong';
        }
        break;
      case 'status':
        stationStatusSchema.parse(value);
        break;
      case 'capacity': {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'validation.mustBeInteger';
        }
        capacitySchema.parse(numValue);
        break;
      }
      case 'contact':
        if (value && value.trim().length > 100) {
          return 'validation.contactTooLong';
        }
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
