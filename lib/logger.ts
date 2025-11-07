/**
 * Backend Logger (Pino)
 * 
 * Structured logging for API routes and server-side operations
 * Logs to console in development, JSON files in production
 */

import pino from 'pino'

// Determine log level based on environment
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

// Configure Pino logger
export const logger = pino({
  level,
  // Format logs nicely in development
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        }
      }
    : undefined,
  
  // Base fields (always included)
  base: {
    env: process.env.NODE_ENV,
    app: 'koperasi-umb'
  },

  // Timestamp format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  // Serializers for common objects
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
})

/**
 * Log levels:
 * - trace: Very detailed, for debugging
 * - debug: Debugging information
 * - info: General informational messages
 * - warn: Warning messages (non-critical issues)
 * - error: Error messages (critical issues)
 * - fatal: Fatal errors (app crash)
 */

// Convenience wrappers
export const logInfo = (message: string, data?: any) => {
  logger.info(data || {}, message)
}

export const logWarn = (message: string, data?: any) => {
  logger.warn(data || {}, message)
}

export const logError = (message: string, error?: Error | any, data?: any) => {
  logger.error({
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error,
    ...data
  }, message)
}

export const logDebug = (message: string, data?: any) => {
  logger.debug(data || {}, message)
}

// API request logging
export const logRequest = (
  method: string,
  url: string,
  userId?: string,
  duration?: number,
  status?: number
) => {
  logger.info({
    type: 'request',
    method,
    url,
    userId,
    duration,
    status
  }, `${method} ${url} - ${status || 'pending'}`)
}

// Database query logging (for slow queries)
export const logSlowQuery = (
  query: string,
  duration: number,
  threshold: number = 1000
) => {
  if (duration > threshold) {
    logger.warn({
      type: 'slow_query',
      query,
      duration,
      threshold
    }, `Slow query detected: ${duration}ms`)
  }
}

// Authentication logging
export const logAuth = (
  action: 'login' | 'logout' | 'failed_login',
  userId?: string,
  email?: string,
  reason?: string
) => {
  logger.info({
    type: 'auth',
    action,
    userId,
    email,
    reason
  }, `Auth: ${action} ${email || userId || 'unknown'}`)
}

// Business logic logging
export const logBusiness = (
  event: string,
  userId: string,
  data?: any
) => {
  logger.info({
    type: 'business',
    event,
    userId,
    ...data
  }, `Business Event: ${event}`)
}

// Performance monitoring
export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: any
) => {
  const level = duration > 5000 ? 'warn' : 'info'
  
  logger[level]({
    type: 'performance',
    operation,
    duration,
    ...metadata
  }, `Performance: ${operation} took ${duration}ms`)
}

// Create child logger for specific context
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context)
}

// Export default logger
export default logger
