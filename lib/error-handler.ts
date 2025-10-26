/**
 * Centralized Error Handler
 * Prevents sensitive data leaks in production
 */

export interface APIError {
  success: false;
  error: string;
  details?: string;
}

export interface APISuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Handle API errors safely
 * - In production: Hide sensitive error details
 * - In development: Show full error stack for debugging
 */
export function handleAPIError(error: unknown): APIError {
  // Log full error server-side for debugging (all environments)
  console.error('[API Error]', error);

  // Production: Hide sensitive details
  if (process.env.NODE_ENV === 'production') {
    // Determine user-friendly error message
    let userMessage = 'Terjadi kesalahan pada server. Silakan coba lagi.';

    if (error instanceof Error) {
      // Only show safe error messages
      if (error.message.includes('unique constraint')) {
        userMessage = 'Data sudah ada. Gunakan data yang berbeda.';
      } else if (error.message.includes('foreign key constraint')) {
        userMessage = 'Data terkait tidak ditemukan.';
      } else if (error.message.includes('not found')) {
        userMessage = 'Data tidak ditemukan.';
      } else if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
        userMessage = 'Anda tidak memiliki akses.';
      }
    }

    return {
      success: false,
      error: userMessage,
    };
  }

  // Development: Show full details for debugging
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      details: error.stack,
    };
  }

  return {
    success: false,
    error: String(error),
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(data: T, message?: string): APISuccess<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Create error response
 */
export function createErrorResponse(message: string, details?: string): APIError {
  return {
    success: false,
    error: message,
    ...(details && process.env.NODE_ENV === 'development' && { details }),
  };
}

/**
 * Validate required fields
 * Returns error if any field is missing
 */
export function validateRequiredFields(
  fields: Record<string, any>,
  requiredFieldNames: string[]
): APIError | null {
  const missingFields = requiredFieldNames.filter(
    (field) => !fields[field] || fields[field] === ''
  );

  if (missingFields.length > 0) {
    return createErrorResponse(
      `Field wajib diisi: ${missingFields.join(', ')}`,
      `Missing: ${missingFields.join(', ')}`
    );
  }

  return null;
}

/**
 * Safe database operation wrapper
 * Catches and handles database errors properly
 */
export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T | APIError> {
  try {
    return await operation();
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Check if response is an error
 * Useful for type guards
 */
export function isAPIError(response: any): response is APIError {
  return response && response.success === false;
}
