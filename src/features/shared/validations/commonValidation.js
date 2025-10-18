import { z } from 'zod';

// Common validation schemas that can be reused across different forms

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'staffForm.validation.emailRequired')
  .email('staffForm.validation.emailInvalid')
  .max(255, 'staffForm.validation.emailTooLong');

/**
 * Phone validation schema (Vietnamese format)
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    val => !val || /^0\d{9}$/.test(val),
    'staffForm.validation.phoneInvalid'
  );

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(1, 'staffForm.validation.passwordRequired')
  .min(8, 'staffForm.validation.passwordMinLength')
  .max(128, 'staffForm.validation.passwordTooLong');

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, 'staffForm.validation.nameRequired')
  .trim()
  .min(1, 'staffForm.validation.nameTooShort')
  .max(100, 'staffForm.validation.nameTooLong');

/**
 * Address validation schema
 */
export const addressSchema = z
  .string()
  .optional()
  .refine(
    val => !val || val.trim().length <= 255,
    'staffForm.validation.addressTooLong'
  );

/**
 * Account status enum schema
 */
export const accountStatusSchema = z
  .enum(['ACTIVE', 'SUSPENDED', 'BANNED'], {
    errorMap: () => ({ message: 'staffForm.validation.invalidAccountStatus' }),
  })
  .default('ACTIVE');

/**
 * Role enum schema
 */
export const roleSchema = z
  .enum(['STAFF', 'ADMIN'], {
    errorMap: () => ({ message: 'staffForm.validation.invalidRole' }),
  })
  .default('STAFF');

/**
 * Station status enum schema
 */
export const stationStatusSchema = z.enum(
  ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
  {
    errorMap: () => ({ message: 'staffForm.validation.invalidStationStatus' }),
  }
);

/**
 * Vehicle status enum schema
 */
export const vehicleStatusSchema = z.enum(
  ['AVAILABLE', 'RENTED', 'RESERVED', 'MAINTENANCE', 'OUT_OF_SERVICE'],
  {
    errorMap: () => ({ message: 'staffForm.validation.invalidVehicleStatus' }),
  }
);

/**
 * Fuel type enum schema
 */
export const fuelTypeSchema = z.enum(
  ['ELECTRIC', 'HYBRID', 'GASOLINE', 'DIESEL'],
  {
    errorMap: () => ({ message: 'staffForm.validation.invalidFuelType' }),
  }
);

/**
 * Positive number validation
 */
export const positiveNumberSchema = z
  .number()
  .positive('staffForm.validation.mustBePositive')
  .finite('staffForm.validation.mustBeFinite');

/**
 * Year validation (1900 to current year + 2)
 */
export const yearSchema = z
  .number()
  .int('staffForm.validation.mustBeInteger')
  .min(1900, 'staffForm.validation.yearTooOld')
  .max(new Date().getFullYear() + 2, 'staffForm.validation.yearTooFuture');

/**
 * Capacity validation (1 to 1000)
 */
export const capacitySchema = z
  .number()
  .int('staffForm.validation.mustBeInteger')
  .min(1, 'staffForm.validation.capacityTooSmall')
  .max(1000, 'staffForm.validation.capacityTooLarge');

/**
 * Battery level validation (0 to 100)
 */
export const batteryLevelSchema = z
  .number()
  .min(0, 'staffForm.validation.batteryLevelTooLow')
  .max(100, 'staffForm.validation.batteryLevelTooHigh');

/**
 * Seats validation (1 to 50)
 */
export const seatsSchema = z
  .number()
  .int('staffForm.validation.mustBeInteger')
  .min(1, 'staffForm.validation.seatsTooFew')
  .max(50, 'staffForm.validation.seatsTooMany');

/**
 * License plate validation (Vietnamese format)
 */
export const licensePlateSchema = z
  .string()
  .optional()
  .refine(
    val => !val || /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/.test(val),
    'staffForm.validation.licensePlateInvalid'
  );

/**
 * Location validation (GeoJSON Point or lat/lng object)
 */
export const locationSchema = z
  .object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  })
  .or(
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
  );

/**
 * Price validation (positive number with 2 decimal places)
 */
export const priceSchema = z
  .number()
  .positive('staffForm.validation.mustBePositive')
  .multipleOf(0.01, 'staffForm.validation.invalidPriceFormat')
  .max(999999.99, 'staffForm.validation.priceTooHigh');
