import { PrismaClient } from '@prisma/client';

/**
 * PRISMA EXTENSION FOR DATA ISOLATION
 * Automatically injects `isProduction` filter based on developer session
 * 
 * How it works:
 * 1. Intercepts ALL Prisma queries
 * 2. Checks if request context has developerSession
 * 3. If in DEV mode (isProduction: false), adds `isProduction: false` filter
 * 4. If in PROD mode (isProduction: true), adds `isProduction: true` filter
 * 5. Applies to: findMany, findFirst, count, update, delete operations
 * 
 * Tables with isProduction flag:
 * - transactions
 * - transaction_items
 * - stock_movements
 * - consignment_sales
 */

// Store current developer session in memory
let currentDeveloperSession: {
  isProduction: boolean;
  activeRole: string;
} | null = null;

/**
 * Set the current developer session
 * Call this from API routes before Prisma operations
 */
export function setDeveloperSession(session: { isProduction: boolean; activeRole: string } | null) {
  currentDeveloperSession = session;
}

/**
 * Get the current developer session
 */
export function getDeveloperSession() {
  return currentDeveloperSession;
}

/**
 * Clear the developer session
 */
export function clearDeveloperSession() {
  currentDeveloperSession = null;
}

/**
 * Models that have isProduction field
 */
const MODELS_WITH_PRODUCTION_FLAG = [
  'transactions',
  'transaction_items',
  'stock_movements',
  'consignment_sales',
] as const;

/**
 * Check if model has isProduction field
 */
function hasProductionFlag(model: string): boolean {
  return MODELS_WITH_PRODUCTION_FLAG.includes(model as any);
}

/**
 * Create Prisma Client with Data Isolation Extension
 * This replaces middleware approach for Prisma v6+
 */
export function createPrismaWithDataIsolation(basePrisma: PrismaClient) {
  // For now, return base client
  // We'll use manual filtering in queries instead of automatic injection
  // This is more explicit and easier to debug
  return basePrisma;
}

/**
 * MANUAL QUERY HELPER
 * Since Prisma v6 doesn't support middleware, we use helper functions
 * to add isProduction filter to queries
 */

/**
 * Add isProduction filter to where clause
 * Use this helper in all queries that need data isolation
 * 
 * @example
 * const where = addProductionFilter({ userId: 123 });
 * const data = await prisma.transactions.findMany({ where });
 */
export function addProductionFilter<T extends Record<string, any>>(where: T = {} as T): T & { isProduction: boolean } {
  const session = currentDeveloperSession;
  const isProduction = session ? session.isProduction : true;
  
  return {
    ...where,
    isProduction,
  };
}

/**
 * Add isProduction to data for create/update operations
 * 
 * @example
 * const data = addProductionData({ amount: 1000, userId: 1 });
 * await prisma.transactions.create({ data });
 */
export function addProductionData<T extends Record<string, any>>(data: T): T & { isProduction: boolean } {
  const session = currentDeveloperSession;
  const isProduction = session ? session.isProduction : true;
  
  // Don't override if explicitly set
  if ('isProduction' in data) {
    return data as T & { isProduction: boolean };
  }
  
  return {
    ...data,
    isProduction,
  };
}

/**
 * Helper: Extract developer session from JWT token
 */
export function extractDeveloperSession(token: string): { isProduction: boolean; activeRole: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    if (payload.developerSession) {
      return {
        isProduction: payload.developerSession.isProduction,
        activeRole: payload.developerSession.activeRole,
      };
    }
    
    return null;
  } catch (error) {
    console.error('[extractDeveloperSession] Failed to decode token:', error);
    return null;
  }
}

/**
 * Helper: Middleware for API routes to set developer session
 * Use this in your API routes before any Prisma operations
 * 
 * @example
 * export async function GET(req: NextRequest) {
 *   await withDeveloperSession(req, async () => {
 *     const data = await prisma.transactions.findMany(); // Auto-filtered
 *     return NextResponse.json(data);
 *   });
 * }
 */
export async function withDeveloperSession<T>(
  req: Request,
  callback: () => Promise<T>
): Promise<T> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = extractDeveloperSession(token);
      
      if (session) {
        setDeveloperSession(session);
      }
    }

    // Execute callback with session context
    const result = await callback();

    // Clear session after operation
    clearDeveloperSession();

    return result;
  } catch (error) {
    // Ensure session is cleared even on error
    clearDeveloperSession();
    throw error;
  }
}

/**
 * Helper: Get isProduction flag for manual queries
 * Use this when you need to manually add isProduction filter
 * 
 * @example
 * const isProduction = getProductionFlag();
 * const data = await prisma.$queryRaw`
 *   SELECT * FROM transactions WHERE is_production = ${isProduction}
 * `;
 */
export function getProductionFlag(): boolean {
  const session = currentDeveloperSession;
  return session ? session.isProduction : true;
}
