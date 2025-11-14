import { randomUUID } from 'crypto';

/**
 * Generate unique invoice number for transactions
 * Format: INV-YYYYMMDD-XXXXX (e.g., INV-20251114-A1B2C)
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate 5 character random alphanumeric
  const uuid = randomUUID().replace(/-/g, '').toUpperCase();
  const random = uuid.substring(0, 5);
  
  return `INV-${year}${month}${day}-${random}`;
}
