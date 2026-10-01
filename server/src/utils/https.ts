/**
 * HTTPS Configuration
 * Security headers and HTTPS enforcement
 */

import { FastifyInstance } from 'fastify';
import fs from 'fs';

export function setupSecurityHeaders(fastify: FastifyInstance) {
  // Security headers
  fastify.addHook('onSend', async (_request, reply) => {
    // Strict Transport Security
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Content Security Policy
    reply.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
    );
    
    // X-Content-Type-Options
    reply.header('X-Content-Type-Options', 'nosniff');
    
    // X-Frame-Options
    reply.header('X-Frame-Options', 'DENY');
    
    // X-XSS-Protection
    reply.header('X-XSS-Protection', '1; mode=block');
    
    // Referrer-Policy
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions-Policy
    reply.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
    
    // Cache-Control for sensitive data
    if (_request.url.startsWith('/api/')) {
      reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
    }
  });
}

/**
 * Redirect HTTP to HTTPS
 */
export function enforceHTTPS(fastify: FastifyInstance) {
  if (process.env.NODE_ENV === 'production') {
    fastify.addHook('onRequest', async (request, reply) => {
      const protocol = request.headers['x-forwarded-proto'] || request.protocol;
      
      if (protocol === 'http') {
        const httpsUrl = `https://${request.hostname}${request.url}`;
        return reply.redirect(httpsUrl);
      }
    });
  }
}

/**
 * HTTPS server options
 */
export const httpsOptions = {
  key: process.env.HTTPS_KEY_PATH 
    ? fs.readFileSync(process.env.HTTPS_KEY_PATH)
    : undefined,
  cert: process.env.HTTPS_CERT_PATH
    ? fs.readFileSync(process.env.HTTPS_CERT_PATH)
    : undefined,
};
