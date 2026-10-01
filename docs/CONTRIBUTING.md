# Contributing Guidelines

Thank you for your interest in contributing to the Investigation Game! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)

**Example:**
```
**Title:** Login fails with special characters in password

**Steps to Reproduce:**
1. Register with password containing @ symbol
2. Try to login
3. See error

**Expected:** Login succeeds
**Actual:** 500 error

**Environment:** 
- Node: 20.10.0
- Browser: Chrome 120
```

### Suggesting Enhancements

Enhancement suggestions should include:

- **Use case** - Why is this needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches
- **Additional context** - Screenshots, examples

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `develop`:
   ```bash
   git checkout -b feature/your-feature develop
   ```
3. **Make your changes** following our coding standards
4. **Test thoroughly** - all tests must pass
5. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add password strength meter"
   git commit -m "fix: resolve login redirect loop"
   git commit -m "docs: update API documentation"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature
   ```
7. **Open a Pull Request** to `develop` branch

## Development Standards

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality
fix(ui): resolve toast notification overlap
docs(api): update endpoint documentation
test(engine): add case validation tests
```

### Code Review Process

All submissions require review. Reviewers will check:

- ✅ Functionality works as expected
- ✅ Tests are included and passing
- ✅ Code follows style guidelines
- ✅ Documentation is updated
- ✅ No security vulnerabilities introduced
- ✅ Performance is not degraded

### Coding Standards

#### TypeScript/JavaScript

```typescript
// ✅ Good: Explicit types, clear naming
interface UserAuth {
  playerId: string;
  playerName: string;
  role: UserRole;
}

async function authenticateUser(credentials: UserCredentials): Promise<UserAuth> {
  // Implementation
}

// ❌ Bad: Implicit types, vague names
async function auth(c) {
  // Implementation
}
```

#### React Components

```tsx
// ✅ Good: Typed props, error handling, accessibility
interface LoginProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const LoginForm: React.FC<LoginProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    try {
      setLoading(true);
      // Login logic
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      {/* Form fields */}
    </form>
  );
};
```

#### Testing

```typescript
// ✅ Good: Descriptive tests, edge cases
describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    // Arrange
    const credentials = { playerName: 'test', password: 'password123' };
    
    // Act
    const result = await login(credentials);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });
  
  it('should reject invalid credentials', async () => {
    // Test implementation
  });
});
```

## Testing Requirements

- **Unit tests** for all new functions
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Minimum 80% code coverage**

Run tests before submitting:
```bash
npm run test:smoke
cd runtime && npm test
```

## Documentation

Update documentation when you:

- Add new API endpoints → Update `docs/API.md`
- Change authentication flow → Update `docs/DEVELOPER_GUIDE.md`
- Add new features → Update relevant guides
- Fix bugs → Add to `CHANGELOG.md`

## Getting Help

- **Questions?** Open a Discussion
- **Bugs?** Open an Issue
- **Chat?** Join our Discord (if applicable)

## Recognition

Contributors will be acknowledged in:
- `README.md` contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉
