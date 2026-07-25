// ==========================================
// RUKYA PRO - Date Utilities
// ==========================================

import { format, formatDistanceToNow, parseISO, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { ru } from 'date-fns/locale';

// Format date in Russian
export function formatRU(date: string | Date, pattern: string = 'dd.MM.yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: ru });
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  return formatRU(date, 'dd.MM.yyyy HH:mm');
}

// Format time only
export function formatTime(date: string | Date): string {
  return formatRU(date, 'HH:mm');
}

// Relative date (e.g., "2 часа назад")
export function relativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ru });
}

// Smart date format
export function smartDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) {
    return `Сегодня, ${format(d, 'HH:mm')}`;
  }
  
  if (isYesterday(d)) {
    return `Вчера, ${format(d, 'HH:mm')}`;
  }
  
  if (isThisWeek(d)) {
    return format(d, 'EEEE, HH:mm', { locale: ru });
  }
  
  if (isThisYear(d)) {
    return format(d, 'd MMMM', { locale: ru });
  }
  
  return format(d, 'dd.MM.yyyy', { locale: ru });
}

// Session date format
export function sessionDate(date: string | Date): string {
  return formatRU(date, 'd MMMM yyyy, HH:mm');
}

// Get current date ISO string
export function nowISO(): string {
  return new Date().toISOString();
}

// Get date range for filter
export function getDateRange(period: 'today' | 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { start, end: now };
}

// Calculate age from birthdate
export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  
  try {
    const birth = parseISO(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return null;
  }
}

// Format duration (minutes to human readable)
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} ч`;
  }
  
  return `${hours} ч ${mins} мин`;
}

// Get days between dates
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get day of treatment (for plans)
export function getTreatmentDay(startDate: string): number {
  const start = parseISO(startDate);
  const today = new Date();
  return daysBetween(start, today) + 1;
}
