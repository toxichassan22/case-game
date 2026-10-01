/**
 * E2E Test: Authentication Flow
 * Tests complete user authentication journey
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Wait for login page to load
    await expect(page.locator('h1')).toContainText(/Welcome Back|Create Account/);
    
    // Switch to registration
    const toggleBtn = page.locator('button.toggle-button');
    await toggleBtn.click();
    
    // Fill registration form
    await page.fill('#playerName', 'testuser_e2e');
    await page.fill('#password', 'testpassword123');
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Wait for successful registration (should redirect or show success)
    await page.waitForTimeout(1000);
    
    // Check if user is authenticated (token in localStorage)
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();
  });

  test('should login with existing credentials', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Fill login form
    await page.fill('#playerName', 'testuser_e2e');
    await page.fill('#password', 'testpassword123');
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Wait for successful login
    await page.waitForTimeout(1000);
    
    // Verify token exists
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Fill with wrong credentials
    await page.fill('#playerName', 'nonexistent_user');
    await page.fill('#password', 'wrongpassword');
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Check for error message
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Try to submit empty form
    await page.locator('button[type="submit"]').click();
    
    // Should show validation error
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should allow guest access', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Click guest button
    await page.locator('.guest-button').click();
    
    // Wait for guest login
    await page.waitForTimeout(500);
    
    // Check if authenticated as guest
    const authState = await page.evaluate(() => {
      const storage = localStorage.getItem('auth-storage');
      return storage ? JSON.parse(storage) : null;
    });
    
    expect(authState.state.isAuthenticated).toBe(true);
  });
});
