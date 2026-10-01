# Testing Setup Guide

## Running Tests

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Performance Tests
```bash
npm run test:performance
```

### Security Tests
```bash
npm run test:security
```

### All Tests
```bash
npm test
```

## Test Coverage

### Generate Coverage Report
```bash
npm run test:coverage
```

### View Coverage
Open `coverage/lcov-report/index.html` in your browser.

## Test Files Structure

```
scripts/
├── e2e/
│   └── auth.spec.ts          # Authentication E2E tests
├── integration/
│   └── api.spec.ts           # API integration tests
├── performance/
│   └── api.spec.ts           # Performance/load tests
├── security/
│   └── vulnerabilities.spec.ts  # Security vulnerability tests
└── *.mjs                     # Utility scripts
```

## Writing Tests

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="username"]', 'testuser');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Integration Test Example
```typescript
import { test, expect } from '@playwright/test';

test('API returns cases', async ({ request }) => {
  const response = await request.get('/api/cases');
  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
});
```

## Continuous Testing

Tests run automatically on:
- Push to main/develop
- Pull requests
- Scheduled daily runs

## Test Environment

- **Base URL**: http://localhost:5173 (frontend)
- **API URL**: http://localhost:3000 (backend)
- **Database**: SQLite (test instance)

## Troubleshooting

### Tests Failing
1. Ensure dev servers are running
2. Check database is initialized
3. Clear test data: `npm run test:clean`

### Slow Tests
1. Run specific test: `npm run test:e2e -- --grep "login"`
2. Increase timeout: `npm run test:e2e -- --timeout 60000`

### Coverage Low
1. Add more test cases
2. Test edge cases
3. Test error scenarios
