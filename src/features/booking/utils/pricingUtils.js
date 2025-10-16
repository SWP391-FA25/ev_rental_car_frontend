// Helper function for rounding currency values
const round = num => Math.round(num * 100) / 100;

// Helper function for intelligent pricing calculation (matches backend logic)
export const calculatePricing = (pricing, durationHours) => {
  const durationDays = Math.ceil(durationHours / 24);
  const durationWeeks = Math.ceil(durationHours / (24 * 7));
  const durationMonths = Math.ceil(durationHours / (24 * 30));

  let basePrice = 0;
  let pricingType = 'hourly';
  let pricingDetails = {};

  // Smart pricing logic - choose the most cost-effective rate
  if (durationMonths >= 1 && pricing.monthlyRate > 0) {
    // Monthly rate (best value for long-term rentals)
    basePrice = durationMonths * pricing.monthlyRate;
    pricingType = 'monthly';
    pricingDetails = {
      rate: pricing.monthlyRate,
      quantity: durationMonths,
      unit: 'month(s)',
    };
  } else if (durationWeeks >= 1 && pricing.weeklyRate > 0) {
    // Weekly rate with daily calculation for remaining days
    const fullWeeks = Math.floor(durationDays / 7);
    const remainingDays = durationDays % 7;
    const weeklyCost = fullWeeks * pricing.weeklyRate;
    const dailyCost = remainingDays * pricing.baseRate;
    basePrice = weeklyCost + dailyCost;
    pricingType = 'weekly';
    pricingDetails = {
      weeklyRate: pricing.weeklyRate,
      weeklyQuantity: fullWeeks,
      weeklyCost: weeklyCost,
      dailyRate: pricing.baseRate,
      dailyQuantity: remainingDays,
      dailyCost: dailyCost,
    };
  } else if (durationDays >= 1 && pricing.baseRate > 0) {
    // Daily rate with hourly calculation for remaining hours
    const fullDays = Math.floor(durationHours / 24);
    const remainingHours = durationHours % 24;
    const dailyCost = fullDays * pricing.baseRate;
    const hourlyCost = remainingHours * pricing.hourlyRate;
    basePrice = dailyCost + hourlyCost;
    pricingType = 'daily';
    pricingDetails = {
      dailyRate: pricing.baseRate,
      dailyQuantity: fullDays,
      dailyCost: dailyCost,
      hourlyRate: pricing.hourlyRate,
      hourlyQuantity: remainingHours,
      hourlyCost: hourlyCost,
    };
  } else {
    // Hourly rate for short rentals
    basePrice = durationHours * pricing.hourlyRate;
    pricingType = 'hourly';
    pricingDetails = {
      rate: pricing.hourlyRate,
      quantity: durationHours,
      unit: 'hour(s)',
    };
  }

  return {
    basePrice: round(basePrice),
    pricingType,
    pricingDetails,
    durationBreakdown: {
      hours: durationHours,
      days: durationDays,
      weeks: durationWeeks,
      months: durationMonths,
    },
  };
};

// Calculate complete pricing breakdown (matches backend logic)
export const calculateCompletePricing = (
  pricing,
  durationHours,
  promotions = []
) => {
  // Constants matching backend
  const PRICING_RATES = {
    INSURANCE: 0.1, // 10% insurance
    TAX: 0.08, // 8% tax
  };

  // Calculate base pricing using intelligent pricing
  const pricingResult = calculatePricing(pricing, durationHours);
  console.log('calculateCompletePricing - pricingResult:', pricingResult);
  const basePrice = pricingResult.basePrice;
  const depositAmount = pricing.depositAmount || 0;
  const insuranceAmount = round(basePrice * PRICING_RATES.INSURANCE);
  const taxAmount = round(basePrice * PRICING_RATES.TAX);
  const subtotal = basePrice + insuranceAmount + taxAmount;

  // Calculate discount amount from promotions
  let totalDiscountAmount = 0;
  const appliedPromotions = [];

  if (promotions && promotions.length > 0) {
    // For frontend estimation, we'll use a simplified calculation
    // The actual validation and calculation will be done on the backend
    promotions.forEach(promotion => {
      if (promotion && promotion.discount) {
        let promotionDiscountAmount = 0;

        if (promotion.discountType === 'FIXED_AMOUNT') {
          // Fixed amount discount
          promotionDiscountAmount = promotion.discount;
        } else {
          // Percentage discount (default)
          promotionDiscountAmount = subtotal * (promotion.discount / 100);
        }

        // Apply maximum discount limit if specified
        if (
          promotion.maxDiscountAmount &&
          promotionDiscountAmount > promotion.maxDiscountAmount
        ) {
          promotionDiscountAmount = promotion.maxDiscountAmount;
        }

        appliedPromotions.push({
          ...promotion,
          appliedDiscountAmount: promotionDiscountAmount,
        });
        totalDiscountAmount += promotionDiscountAmount;
      }
    });
  }

  // Ensure discount doesn't exceed the total cost
  totalDiscountAmount = Math.min(totalDiscountAmount, subtotal);

  // Calculate final total amount (rental amount, not including deposit)
  const finalTotalAmount = subtotal - totalDiscountAmount;

  return {
    ...pricingResult,
    insuranceAmount,
    taxAmount,
    discountAmount: totalDiscountAmount,
    subtotal,
    totalAmount: finalTotalAmount,
    depositAmount,
    totalPayable: finalTotalAmount + depositAmount,
    appliedPromotions,
    breakdown: {
      base: basePrice,
      insurance: insuranceAmount,
      tax: taxAmount,
      subtotal: subtotal,
      discount: totalDiscountAmount,
      rental: finalTotalAmount,
      deposit: depositAmount,
      total: finalTotalAmount + depositAmount,
    },
  };
};

// Validation functions
export const validateBookingData = (selectedDates, car) => {
  const errors = [];

  // Check if dates are selected
  if (!selectedDates.startDate || !selectedDates.endDate) {
    errors.push('Please select pickup and return dates');
    return { valid: false, errors };
  }

  // Parse dates
  const startDateTime = new Date(selectedDates.startDate);
  startDateTime.setHours(
    parseInt(selectedDates.startTime.split(':')[0]),
    parseInt(selectedDates.startTime.split(':')[1])
  );

  const endDateTime = new Date(selectedDates.endDate);
  endDateTime.setHours(
    parseInt(selectedDates.endTime.split(':')[0]),
    parseInt(selectedDates.endTime.split(':')[1])
  );

  // Validate time logic
  if (endDateTime <= startDateTime) {
    errors.push('End time must be after start time');
  }

  // Check if start time is in the future
  const now = new Date();
  if (startDateTime <= now) {
    errors.push('Start time must be in the future');
  }

  // Check if car is available
  if (!car || !car.available) {
    errors.push('Vehicle is not available for booking');
  }

  // Check if car has pricing
  if (!car || !car.pricing) {
    errors.push('Vehicle pricing information is not available');
  } else {
    // Check if pricing has required fields
    const pricing = car.pricing;
    if (
      !pricing.hourlyRate &&
      !pricing.baseRate &&
      !pricing.weeklyRate &&
      !pricing.monthlyRate
    ) {
      errors.push('Vehicle pricing rates are not properly configured');
    }
    if (
      pricing.hourlyRate === 0 &&
      pricing.baseRate === 0 &&
      pricing.weeklyRate === 0 &&
      pricing.monthlyRate === 0
    ) {
      errors.push('All vehicle pricing rates are set to zero');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    startDateTime,
    endDateTime,
  };
};
