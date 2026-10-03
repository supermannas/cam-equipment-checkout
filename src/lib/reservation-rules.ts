import { addDays, isFriday, isMonday, startOfDay, endOfDay, differenceInCalendarDays } from 'date-fns';

/**
 * Validate reservation rules for Catawba College Communication Arts and Media
 * Rules:
 * 1. Maximum 2 nights for regular checkout
 * 2. Weekend checkout: Friday to Monday only (max 3 nights)
 * 3. No mid-week weekend extensions
 */

export interface ReservationValidation {
  isValid: boolean;
  errors: string[];
}

export function validateReservationDates(
  startDate: Date,
  endDate: Date
): ReservationValidation {
  const errors: string[] = [];
  
  // Ensure start is before end
  if (startDate >= endDate) {
    errors.push('End date must be after start date');
    return { isValid: false, errors };
  }

  const nights = differenceInCalendarDays(endDate, startDate);
  
  // Check if it's a weekend checkout (Friday to Monday)
  const isFridayStart = isFriday(startDate);
  const isMondayEnd = isMonday(endDate);
  
  // Rule: Weekend checkout must be Friday to Monday
  if (isFridayStart && isMondayEnd) {
    // Weekend checkout: max 3 nights (Fri, Sat, Sun)
    if (nights > 3) {
      errors.push('Weekend checkout (Friday-Monday) is limited to 3 nights');
    }
  } 
  // Regular checkout: max 2 nights
  else if (nights > 2) {
    errors.push('Regular checkout is limited to 2 nights maximum');
  }
  
  // Rule: No mid-week extensions for weekend checkout
  if (isFridayStart && !isMondayEnd) {
    errors.push('Weekend checkout must end on Monday');
  }
  
  // Rule: Cannot start on Saturday or Sunday for weekend checkout
  if (!isFridayStart && (nights >= 3)) {
    // If trying to book 3+ nights and not starting Friday, it's invalid
    if (!isFridayStart) {
      errors.push('Weekend checkout must start on Friday');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if a date range is a valid weekend checkout
 */
export function isWeekendCheckout(startDate: Date, endDate: Date): boolean {
  return isFriday(startDate) && isMonday(endDate);
}

/**
 * Get maximum allowed nights for a given date range
 */
export function getMaxNights(startDate: Date): number {
  return isFriday(startDate) ? 3 : 2;
}

/**
 * Validate that a reservation doesn't conflict with existing ones
 */
export function checkAvailability(
  equipmentId: string,
  startDate: Date,
  endDate: Date,
  existingReservations: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>
): { isAvailable: boolean; conflicts: string[] } {
  const conflicts: string[] = [];
  
  const newStart = startOfDay(startDate);
  const newEnd = endOfDay(endDate);
  
  for (const reservation of existingReservations) {
    // Skip cancelled or rejected reservations
    if (reservation.status === 'CANCELLED' || reservation.status === 'REJECTED') {
      continue;
    }
    
    const existingStart = startOfDay(reservation.startDate);
    const existingEnd = endOfDay(reservation.endDate);
    
    // Check for overlap
    if (newStart < existingEnd && newEnd > existingStart) {
      conflicts.push(
        `Conflicts with reservation ${reservation.id} (${formatDateRange(reservation.startDate, reservation.endDate)})`
      );
    }
  }
  
  return {
    isAvailable: conflicts.length === 0,
    conflicts
  };
}

/**
 * Format date range for display
 */
function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  });
  const endStr = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  });
  return `${startStr} - ${endStr}`;
}
