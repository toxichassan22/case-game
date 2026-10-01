/**
 * Security Test: Vulnerability Scanning
 * Tests for common security vulnerabilities
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('Security Tests', () => {
  test('should prevent SQL injection in playerId', async ({ request }) => {
    const maliciousPlayerId = "'; DROP TABLE rooms; --";
    
    const response = await request.get(`${API_BASE}/rooms/lobby/${encodeURIComponent(maliciousPlayerId)}`);
    
    // Should reject invalid format
    expect(response.status()).toBe(400);
  });

  test('should prevent XSS in user input', async ({ request }) => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const response = await request.post(`${API_BASE}/api/auth/register`, {
      data: {
        playerName: xssPayload,
        password: 'testpassword123'
      }
    });
    
    // Should reject or sanitize
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should reject requests without CSRF token for POST', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/auth/register`, {
      data: {
        playerName: 'testuser',
        password: 'password123'
      },
      headers: {
        'Origin': 'http://malicious-site.com'
      }
    });
    
    // Should reject cross-origin requests
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should enforce rate limiting', async ({ request }) => {
    // Send requests rapidly
    const requests = Array(150).fill(null).map((_, _i) => 
      request.get(`${API_BASE}/health`)
    );
    
    const responses = await Promise.all(requests);
    
    // Should have rate limited some requests
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('should not expose sensitive data in errors', async ({ request }) => {
    const response = await request.get(`${API_BASE}/nonexistent-endpoint`);
    
    const body = await response.json();
    
    // Should not expose stack traces or internal details
    expect(body.stack).toBeUndefined();
    expect(body.internalError).toBeUndefined();
  });

  test('should validate JWT tokens', async ({ request }) => {
    const invalidToken = 'invalid-jwt-token';
    
    const response = await request.get(`${API_BASE}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${invalidToken}`
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('should reject expired tokens', async ({ request }) => {
    // Create a token that's already expired (would need server cooperation)
    // For now, test with obviously malformed token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired';
    
    const response = await request.get(`${API_BASE}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should have CORS restrictions', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`, {
      headers: {
        'Origin': 'http://evil-site.com'
      }
    });
    
    // Should not allow evil origin
    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).not.toBe('http://evil-site.com');
  });

  test('should use HTTPS in production headers', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    
    const headers = response.headers();
    expect(headers['strict-transport-security']).toBeDefined();
  });

  test('should prevent directory traversal', async ({ request }) => {
    const response = await request.get(`${API_BASE}/../../etc/passwd`);
    
    // Should reject
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
