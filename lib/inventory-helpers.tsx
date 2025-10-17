// Inventory Helper Functions
// Extracted from inventory components for reusability and consistency

import React from 'react';

/**
 * Format number as Indonesian Rupiah currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format price input with Indonesian thousand separators
 */
export const formatPriceInput = (value: string): string => {
  const numbers = value.replace(/[^0-9]/g, '');
  return numbers ? parseInt(numbers).toLocaleString('id-ID') : '';
};

/**
 * Parse formatted price string to number
 */
export const parsePrice = (formatted: string): number => {
  return parseInt(formatted.replace(/\./g, '')) || 0;
};

/**
 * Calculate profit margin from buy and sell prices
 * Returns both absolute margin (Rp) and percentage (%)
 */
export const calculateMargin = (buyPrice: string | number, sellPrice: string | number): { margin: number; marginPercent: number } => {
  const buy = typeof buyPrice === 'string' ? parsePrice(buyPrice) : buyPrice;
  const sell = typeof sellPrice === 'string' ? parsePrice(sellPrice) : sellPrice;
  const margin = sell - buy;
  const marginPercent = buy > 0 ? ((margin / buy) * 100) : 0;
  return { margin, marginPercent };
};

/**
 * Calculate markup percentage (margin from buy price)
 * Formula: (Sell - Buy) / Buy × 100
 */
export const calculateMarkup = (buyPrice: string | number, sellPrice: string | number): number => {
  const buy = typeof buyPrice === 'string' ? parsePrice(buyPrice) : buyPrice;
  const sell = typeof sellPrice === 'string' ? parsePrice(sellPrice) : sellPrice;
  if (buy <= 0) return 0;
  return ((sell - buy) / buy) * 100;
};

/**
 * Calculate profit percentage (margin from sell price)
 * Formula: (Sell - Buy) / Sell × 100
 */
export const calculateProfit = (buyPrice: string | number, sellPrice: string | number): number => {
  const buy = typeof buyPrice === 'string' ? parsePrice(buyPrice) : buyPrice;
  const sell = typeof sellPrice === 'string' ? parsePrice(sellPrice) : sellPrice;
  if (sell <= 0) return 0;
  return ((sell - buy) / sell) * 100;
};

/**
 * Calculate sell price from buy price and markup percentage
 * Formula: Buy × (1 + Markup%)
 */
export const calculateSellFromMarkup = (buyPrice: string | number, markupPercent: number): number => {
  const buy = typeof buyPrice === 'string' ? parsePrice(buyPrice) : buyPrice;
  if (buy <= 0 || markupPercent < 0) return 0;
  return Math.round(buy * (1 + markupPercent / 100));
};

/**
 * Calculate sell price from buy price and profit percentage
 * Formula: Buy / (1 - Profit%)
 */
export const calculateSellFromProfit = (buyPrice: string | number, profitPercent: number): number => {
  const buy = typeof buyPrice === 'string' ? parsePrice(buyPrice) : buyPrice;
  if (buy <= 0 || profitPercent < 0 || profitPercent >= 100) return 0;
  return Math.round(buy / (1 - profitPercent / 100));
};

/**
 * Validate that sell price is greater than buy price
 */
export const validatePrices = (buyPrice: string, sellPrice: string): string => {
  const buy = parsePrice(buyPrice);
  const sell = parsePrice(sellPrice);
  
  if (buy > 0 && sell > 0 && sell <= buy) {
    return 'Harga jual harus lebih besar dari harga beli';
  }
  return '';
};

/**
 * Get badge color classes for ownership type
 */
export const getOwnershipBadgeColor = (type: string): string => {
  return type === 'TOKO' 
    ? 'bg-blue-50 text-blue-700 border border-blue-200'
    : 'bg-purple-50 text-purple-700 border border-purple-200';
};

/**
 * Get badge color classes for stock cycle
 */
export const getStockCycleBadgeColor = (cycle: string): string => {
  switch (cycle) {
    case 'HARIAN':
      return 'bg-orange-50 text-orange-700 border border-orange-200';
    case 'MINGGUAN':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'BULANAN':
      return 'bg-teal-50 text-teal-700 border border-teal-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
};

/**
 * Get readable label for ownership type
 */
export const getOwnershipLabel = (type: string): string => {
  return type === 'TOKO' ? 'Toko' : 'Titipan';
};

/**
 * Get readable label for stock cycle
 */
export const getStockCycleLabel = (cycle: string): string => {
  switch (cycle) {
    case 'HARIAN':
      return 'Harian';
    case 'MINGGUAN':
      return 'Mingguan';
    case 'BULANAN':
      return 'Bulanan';
    default:
      return cycle;
  }
};

/**
 * Get text color for stock status
 */
export const getStockStatusColor = (stock: number, minStock?: number): string => {
  if (stock === 0) return 'text-red-600';
  if (minStock && stock <= minStock) return 'text-yellow-600';
  return 'text-green-600';
};

/**
 * Check if product is out of stock
 */
export const isOutOfStock = (stock: number): boolean => {
  return stock === 0;
};

/**
 * Check if product is low stock
 */
export const isLowStock = (stock: number, minStock: number): boolean => {
  return stock > 0 && stock <= minStock;
};

/**
 * Check if stock movement is incoming (adds stock)
 */
export const isIncomingMovement = (movementType: string): boolean => {
  return movementType?.includes('_IN') || 
         movementType === 'PURCHASE' || 
         movementType === 'RETURN';
};

/**
 * Check if stock movement is outgoing (reduces stock)
 */
export const isOutgoingMovement = (movementType: string): boolean => {
  return movementType?.includes('_OUT') || 
         movementType === 'SALE' || 
         movementType === 'ADJUSTMENT';
};

/**
 * Get color class for movement type badge
 */
export const getMovementTypeBadgeColor = (movementType: string): string => {
  if (isIncomingMovement(movementType)) {
    return 'bg-green-50 text-green-700 border border-green-200';
  }
  if (isOutgoingMovement(movementType)) {
    return 'bg-red-50 text-red-700 border border-red-200';
  }
  return 'bg-gray-50 text-gray-700 border border-gray-200';
};

/**
 * Calculate profit per unit and margin percentage
 */
export const calculateProfitMetrics = (sellPrice: number, costPrice: number, quantity: number): {
  profitPerUnit: number;
  profitMargin: number;
  totalProfit: number;
} => {
  const profitPerUnit = sellPrice - costPrice;
  const profitMargin = costPrice > 0 ? (profitPerUnit / costPrice) * 100 : 0;
  const totalProfit = profitPerUnit * Math.abs(quantity);
  
  return { profitPerUnit, profitMargin, totalProfit };
};
