import { z } from 'zod';
import {
  batteryLevelSchema,
  fuelTypeSchema,
  licensePlateSchema,
  priceSchema,
  seatsSchema,
  vehicleStatusSchema,
  yearSchema,
} from './commonValidation.js';

/**
 * Vehicle type enum schema
 */
export const vehicleTypeSchema = z.enum(
  ['SEDAN', 'SUV', 'HATCHBACK', 'COUPE'],
  {
    errorMap: () => ({ message: 'validation.invalidVehicleType' }),
  }
);

/**
 * Vehicle creation validation schema
 */
export const vehicleCreateSchema = z.object({
  stationId: z.string().min(1, 'validation.stationIdRequired'),
  type: vehicleTypeSchema,
  brand: z
    .string()
    .min(1, 'validation.brandRequired')
    .max(50, 'validation.brandTooLong'),
  model: z
    .string()
    .min(1, 'validation.modelRequired')
    .max(50, 'validation.modelTooLong'),
  year: z.coerce.number().pipe(yearSchema),
  color: z
    .string()
    .optional()
    .refine(val => !val || val.trim().length <= 30, 'validation.colorTooLong'),
  seats: z.coerce.number().pipe(seatsSchema).optional().default(5),
  licensePlate: licensePlateSchema,
  batteryLevel: z.coerce.number().pipe(batteryLevelSchema).optional(),
  fuelType: fuelTypeSchema,
  status: vehicleStatusSchema.optional().default('AVAILABLE'),
  // Pricing fields
  baseRate: z.coerce.number().pipe(priceSchema),
  hourlyRate: z.coerce.number().pipe(priceSchema),
  weeklyRate: z.coerce.number().pipe(priceSchema).optional(),
  monthlyRate: z.coerce.number().pipe(priceSchema).optional(),
  depositAmount: z.coerce.number().pipe(priceSchema),
  insuranceRate: z.coerce
    .number()
    .min(0, 'validation.insuranceRateMin')
    .max(1, 'validation.insuranceRateMax')
    .optional()
    .default(0.1),
});

/**
 * Vehicle update validation schema (all fields optional except ID)
 */
export const vehicleUpdateSchema = z.object({
  stationId: z.string().optional(),
  type: vehicleTypeSchema.optional(),
  brand: z
    .string()
    .min(1, 'validation.brandRequired')
    .max(50, 'validation.brandTooLong')
    .optional(),
  model: z
    .string()
    .min(1, 'validation.modelRequired')
    .max(50, 'validation.modelTooLong')
    .optional(),
  year: z.coerce.number().pipe(yearSchema).optional(),
  color: z
    .string()
    .optional()
    .refine(val => !val || val.trim().length <= 30, 'validation.colorTooLong'),
  seats: z.coerce.number().pipe(seatsSchema).optional(),
  licensePlate: licensePlateSchema,
  batteryLevel: z.coerce.number().pipe(batteryLevelSchema).optional(),
  fuelType: fuelTypeSchema.optional(),
  status: vehicleStatusSchema.optional(),
  // Pricing fields
  baseRate: z.coerce.number().pipe(priceSchema).optional(),
  hourlyRate: z.coerce.number().pipe(priceSchema).optional(),
  weeklyRate: z.coerce.number().pipe(priceSchema).optional(),
  monthlyRate: z.coerce.number().pipe(priceSchema).optional(),
  depositAmount: z.coerce.number().pipe(priceSchema).optional(),
  insuranceRate: z.coerce
    .number()
    .min(0, 'validation.insuranceRateMin')
    .max(1, 'validation.insuranceRateMax')
    .optional(),
});

export const validateVehicleCreate = data => {
  try {
    const validatedData = vehicleCreateSchema.parse(data);
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

export const validateVehicleUpdate = data => {
  try {
    const validatedData = vehicleUpdateSchema.parse(data);
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

export const validateVehicleField = (field, value) => {
  try {
    switch (field) {
      case 'stationId':
        if (!value) {
          return 'validation.stationIdRequired';
        }
        break;
      case 'type':
        vehicleTypeSchema.parse(value);
        break;
      case 'brand':
        if (!value) {
          return 'validation.brandRequired';
        }
        if (value.length > 50) {
          return 'validation.brandTooLong';
        }
        break;
      case 'model':
        if (!value) {
          return 'validation.modelRequired';
        }
        if (value.length > 50) {
          return 'validation.modelTooLong';
        }
        break;
      case 'year': {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'validation.mustBeInteger';
        }
        yearSchema.parse(numValue);
        break;
      }
      case 'color':
        if (value && value.trim().length > 30) {
          return 'validation.colorTooLong';
        }
        break;
      case 'seats': {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'validation.mustBeInteger';
        }
        seatsSchema.parse(numValue);
        break;
      }
      case 'licensePlate':
        licensePlateSchema.parse(value);
        break;
      case 'batteryLevel': {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'validation.mustBeInteger';
        }
        batteryLevelSchema.parse(numValue);
        break;
      }
      case 'fuelType':
        fuelTypeSchema.parse(value);
        break;
      case 'status':
        vehicleStatusSchema.parse(value);
        break;
      case 'baseRate':
      case 'hourlyRate':
      case 'weeklyRate':
      case 'monthlyRate':
      case 'depositAmount': {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'validation.mustBePositive';
        }
        priceSchema.parse(numValue);
        break;
      }
      case 'insuranceRate': {
        if (value !== undefined && value !== null && value !== '') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            return 'validation.mustBePositive';
          }
          if (numValue < 0) {
            return 'validation.insuranceRateMin';
          }
          if (numValue > 1) {
            return 'validation.insuranceRateMax';
          }
        }
        break;
      }
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
