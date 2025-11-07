/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse with configurable rate limits.
 * Uses in-memory LRU cache for tracking requests.
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  /**
   * Maximum requests allowed within the window
   */
  max: number;
  
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  
  /**
   * Custom message for rate limit exceeded
   */
  message?: string;
  
  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (req: NextRequest) => boolean;
}

interface RequestLog {
  count: number;
  resetTime: number;
}

// Simple LRU cache for rate limiting
class RateLimitCache {
  private cache = new Map<string, RequestLog>();
  private maxSize = 10000; // Maximum entries before cleanup

  get(key: string): RequestLog | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: RequestLog): void {
    // Cleanup old entries if cache is too large
    if (this.cache.size >= this.maxSize) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (v.resetTime < now) {
          this.cache.delete(k);
        }
      }
    }
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new RateLimitCache();

/**
 * Create a rate limiter middleware
 * 
 * @example
 * ```typescript
 * // In API route
 * const limiter = rateLimit({
 *   max: 100,
 *   windowMs: 60 * 1000, // 1 minute
 * });
 * 
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await limiter(req);
 *   if (rateLimitResult) return rateLimitResult;
 *   
 *   // Continue with request handling
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    max,
    windowMs,
    message = 'Too many requests, please try again later.',
    skip,
  } = config;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Skip if condition met
    if (skip && skip(req)) {
      return null;
    }

    // Get identifier (IP or user-agent as fallback)
    const identifier = getIdentifier(req);
    const now = Date.now();
    
    // Get or create request log
    let requestLog = cache.get(identifier);
    
    if (!requestLog || requestLog.resetTime < now) {
      // Create new log entry
      requestLog = {
        count: 1,
        resetTime: now + windowMs,
      };
      cache.set(identifier, requestLog);
      
      return null; // Allow request
    }

    // Check if limit exceeded
    if (requestLog.count >= max) {
      const retryAfter = Math.ceil((requestLog.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          error: message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(requestLog.resetTime).toISOString(),
          },
        }
      );
    }

    // Increment count
    requestLog.count += 1;
    cache.set(identifier, requestLog);

    return null; // Allow request
  };
}

/**
 * Get unique identifier for rate limiting
 */
function getIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (behind proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown';
  
  // Fallback to user-agent if IP not available
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return `${ip}-${userAgent}`;
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limiter for authentication endpoints
   * 5 requests per 15 minutes
   */
  auth: rateLimit({
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  }),

  /**
   * Standard rate limiter for API endpoints
   * 100 requests per minute
   */
  api: rateLimit({
    max: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'API rate limit exceeded. Please slow down.',
  }),

  /**
   * Lenient rate limiter for read-only endpoints
   * 300 requests per minute
   */
  read: rateLimit({
    max: 300,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please try again later.',
  }),

  /**
   * Strict rate limiter for write operations
   * 30 requests per minute
   */
  write: rateLimit({
    max: 30,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many write operations. Please slow down.',
  }),

  /**
   * Very strict rate limiter for sensitive operations
   * 3 requests per hour
   */
  sensitive: rateLimit({
    max: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'This operation is rate limited. Please try again later.',
  }),
};

/**
 * Clear rate limit cache for testing
 */
export function clearRateLimitCache(): void {
  cache.clear();
}
