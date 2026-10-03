import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isFriday, isMonday, differenceInDays, isWeekend } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function validateReservationDates(startDate: Date, endDate: Date): { valid: boolean; error?: string } {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' }
  }

  const days = differenceInDays(end, start) + 1

  // Rule 1: Max 2 nights for regular reservations
  if (!isFriday(start) && !isMonday(end)) {
    if (days > 2) {
      return { valid: false, error: 'Regular reservations limited to 2 nights maximum' }
    }
  }

  // Rule 2: Friday-Monday weekend reservations allowed (up to 3 nights)
  if (isFriday(start) && isMonday(end)) {
    if (days > 3) {
      return { valid: false, error: 'Weekend reservations limited to Friday-Monday (3 nights)' }
    }
  }

  // Prevent weekend-only reservations that aren't Fri-Mon
  if (isWeekend(start) || isWeekend(end)) {
    if (!(isFriday(start) && isMonday(end))) {
      return { valid: false, error: 'Weekend reservations must be Friday to Monday only' }
    }
  }

  return { valid: true }
}

export function generatePDFPath(reservationId: string): string {
  return `/waivers/${reservationId}.pdf`
}

export function sanitizeString(str: string | null | undefined): string {
  return str?.trim().replace(/\s+/g, ' ') || ''
}
