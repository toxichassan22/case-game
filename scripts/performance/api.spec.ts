import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('Performance Tests', () => {
  test('GET /health should respond within 100ms', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE}/health`);
    const endTime = Date.now();
    
    expect(response.ok()).toBeTruthy();
    expect(endTime - startTime).toBeLessThan(100);
  });

  test('POST /api/auth/login should respond within 500ms', async ({ request }) => {
    const startTime = Date.now();
    const _response = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        playerName: 'testuser_e2e',
        password: 'testpassword123'
      }
    });
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(500);
  });

  test('GET /rooms should respond within 200ms', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE}/rooms`);
    const endTime = Date.now();
    
    expect(response.ok()).toBeTruthy();
    expect(endTime - startTime).toBeLessThan(200);
  });

  test('should handle 10 concurrent requests', async ({ request }) => {
    const startTime = Date.now();
    
    const requests = Array(10).fill(null).map(() => 
      request.get(`${API_BASE}/health`)
    );
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    // All should succeed
    responses.forEach(r => expect(r.ok()).toBeTruthy());
    
    // Should complete within 500ms
    expect(endTime - startTime).toBeLessThan(500);
  });

  test('should handle 50 concurrent requests', async ({ request }) => {
    const startTime = Date.now();
    
    const requests = Array(50).fill(null).map(() => 
      request.get(`${API_BASE}/health`)
    );
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    // Most should succeed (some might be rate limited)
    const successCount = responses.filter(r => r.ok() || r.status() === 429).length;
    expect(successCount).toBe(responses.length);
    
    // Should complete within 2 seconds
    expect(endTime - startTime).toBeLessThan(2000);
  });
});
