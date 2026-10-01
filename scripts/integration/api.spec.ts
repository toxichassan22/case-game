/**
 * Integration Test: API Endpoints
 * Tests server API endpoints
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('API Integration Tests', () => {
  test('GET /health should return server status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.uptime).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  test('GET /api/server-info should return server information', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/server-info`);
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.address).toBeDefined();
    expect(body.port).toBeDefined();
  });

  test('POST /api/auth/register should create new user', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/auth/register`, {
      data: {
        playerName: 'integration_test_user',
        password: 'testpassword123'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    expect(body.player).toBeDefined();
    expect(body.player.name).toBe('integration_test_user');
  });

  test('POST /api/auth/login should authenticate user', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        playerName: 'integration_test_user',
        password: 'testpassword123'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
  });

  test('POST /api/auth/login should reject wrong password', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        playerName: 'integration_test_user',
        password: 'wrongpassword'
      }
    });
    
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('GET /rooms should return rooms list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/rooms`);
    expect(response.ok()).toBeTruthy();
  });

  test('should enforce rate limiting', async ({ request }) => {
    // Send many requests quickly
    const requests = Array(110).fill(null).map(() => 
      request.get(`${API_BASE}/health`)
    );
    
    const responses = await Promise.all(requests);
    
    // At least one should be rate limited
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('should have security headers', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
  });
});
