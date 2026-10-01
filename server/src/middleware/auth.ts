import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthPayload {
  playerId: string;
  playerName: string;
  role: 'player' | 'admin' | 'moderator';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthPayload;
  }
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (_error) {
    return null;
  }
}

/**
 * Authentication middleware - validates JWT token
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ 
      error: 'Authentication required',
      code: 'MISSING_TOKEN'
    });
    return;
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);

  if (!user) {
    reply.status(401).send({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
    return;
  }

  request.user = user;
}

/**
 * Authorization middleware - checks user role
 */
export function requireRole(...roles: AuthPayload['role'][]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({ 
        error: 'Authentication required',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    if (!roles.includes(request.user.role)) {
      reply.status(403).send({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_ROLE'
      });
      return;
    }
  };
}

/**
 * Optional auth - adds user to request if token is valid, but doesn't require it
 */
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (user) {
      request.user = user;
    }
  }
}

/**
 * WebSocket authentication helper
 */
export function authenticateWebSocket(token: string): AuthPayload | null {
  return verifyToken(token);
}
