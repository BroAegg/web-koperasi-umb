import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from './auth';
import { logActivity, extractRequestMetadata } from './activity-logger';

/**
 * HOF wrapper for API routes with automatic activity logging
 * 
 * Usage:
 * export const POST = withActivityLog({
 *   module: 'INVENTORY',
 *   action: 'CREATE_PRODUCT',
 *   getDescription: (req, result) => `Created product: ${result.product.name}`,
 *   getMetadata: (req, result) => ({ productId: result.product.id }),
 * })(async (req) => {
 *   // Your existing handler code
 *   return NextResponse.json({ product: newProduct });
 * });
 */

interface ActivityLogConfig {
  module: string; // AUTH, INVENTORY, POS, MEMBER, FINANCIAL, SUPPLIER
  action: string; // CREATE_PRODUCT, UPDATE_MEMBER, LOGIN, etc
  getDescription: (req: NextRequest, result?: any) => string;
  getMetadata?: (req: NextRequest, result?: any) => any;
  skipLogging?: (req: NextRequest) => boolean; // Optional condition to skip logging
}

export function withActivityLog(config: ActivityLogConfig) {
  return function wrapper(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async function wrappedHandler(
      req: NextRequest,
      context?: any
    ): Promise<NextResponse> {
      let result: NextResponse | null = null;
      let logSuccess = false;

      try {
        // Execute the actual handler
        result = await handler(req, context);
        logSuccess = result.ok;

        // Skip logging if condition met
        if (config.skipLogging && config.skipLogging(req)) {
          return result;
        }

        // Extract user from token
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
          console.warn('[Activity Log] No token found, skipping log');
          return result;
        }

        const user = await getUserFromToken(token);
        if (!user) {
          console.warn('[Activity Log] No user found from token, skipping log');
          return result;
        }

        // Parse response to get result data (if needed for description/metadata)
        let responseData: any = null;
        if (result && config.getMetadata) {
          try {
            const clone = result.clone();
            responseData = await clone.json();
          } catch (e) {
            // Response not JSON, skip
          }
        }

        // Extract request metadata
        const { ipAddress, userAgent } = extractRequestMetadata(req);

        // Get description and metadata
        const description = config.getDescription(req, responseData);
        const metadata = config.getMetadata
          ? config.getMetadata(req, responseData)
          : undefined;

        // Log the activity
        await logActivity({
          userId: user.id,
          userRole: user.role,
          action: config.action,
          module: config.module,
          description,
          metadata,
          ipAddress,
          userAgent,
        }).catch((err) => {
          console.error('[Activity Log] Failed to log:', err);
        });

        return result;
      } catch (error) {
        // Log error activity
        try {
          const authHeader = req.headers.get('authorization');
          const token = authHeader?.replace('Bearer ', '');

          if (token) {
            const user = await getUserFromToken(token);
            if (user) {
              const { ipAddress, userAgent } = extractRequestMetadata(req);
              
              await logActivity({
                userId: user.id,
                userRole: user.role,
                action: `${config.action}_ERROR`,
                module: config.module,
                description: `Error during ${config.action}: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`,
                metadata: {
                  error: error instanceof Error ? error.message : String(error),
                  stack: error instanceof Error ? error.stack : undefined,
                },
                ipAddress,
                userAgent,
              }).catch((logErr) => {
                console.error('[Activity Log] Failed to log error:', logErr);
              });
            }
          }
        } catch (logError) {
          console.error('[Activity Log] Failed to log error activity:', logError);
        }

        // Re-throw the original error
        throw error;
      }
    };
  };
}

/**
 * Simplified version for routes that don't need response data
 * 
 * Usage:
 * export const DELETE = withSimpleActivityLog(
 *   'INVENTORY',
 *   'DELETE_PRODUCT',
 *   'Deleted product'
 * )(async (req) => {
 *   // Your handler
 * });
 */
export function withSimpleActivityLog(
  module: string,
  action: string,
  description: string,
  metadata?: any
) {
  return withActivityLog({
    module,
    action,
    getDescription: () => description,
    getMetadata: () => metadata,
  });
}
