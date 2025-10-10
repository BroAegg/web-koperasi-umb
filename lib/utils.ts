import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatter untuk Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Date formatter
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Time formatter (jam:menit saja)
export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // format 24 jam
  }).format(new Date(date));
}

// Date and time formatter 
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date));
}

// Number formatter
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Format currency input for display (with thousand separators)
export function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters except dots and commas
  const numericValue = value.replace(/[^\d]/g, '');
  
  // Convert to number and format with thousand separators
  if (numericValue === '') return '';
  
  const number = parseInt(numericValue);
  return new Intl.NumberFormat('id-ID').format(number);
}

// Parse formatted currency back to numeric string for API
export function parseCurrencyInput(formattedValue: string): string {
  return formattedValue.replace(/[^\d]/g, '');
}