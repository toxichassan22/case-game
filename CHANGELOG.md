# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- JWT-based authentication system with registration and login
- Password encryption using bcrypt
- AES-256-GCM encryption utility for sensitive data
- Toast notification system with success/error/warning/info types
- Skeleton loading components for better UX
- Empty state components for better user feedback
- Case schema validation script (`validate_case_schema.mjs`)
- Protected route wrapper for authentication
- Token refresh mechanism
- Guest login option
- Docker configuration for containerized deployment
- Docker Compose setup for multi-container orchestration
- CI/CD pipeline with GitHub Actions
- API documentation (`docs/API.md`)
- Developer guide (`docs/DEVELOPER_GUIDE.md`)
- Contributing guidelines (`docs/CONTRIBUTING.md`)
- Environment variables template (`.env.example`)
- Zustand stores for auth and toast state management
- Login page with form validation
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- CSRF protection for state-changing requests
- Rate limiting (100 requests/minute)
- Graceful shutdown handlers (SIGTERM, SIGINT)
- Health check endpoint (`/health`)

### Changed
- Enhanced Content Security Policy
- Improved CORS restrictions (localhost and local IPs only)
- Better error handling in WebSocket connections
- Optimized component rendering with useCallback and useMemo
- Split large CSS files for better performance
- Enhanced Zod validation schemas

### Fixed
- Memory leaks in event listeners
- State mutation issues in GameDesktop
- XSS vulnerabilities in user input
- SQL injection vulnerabilities
- Race conditions in interrogation chat
- WebSocket message queue issues
- JSON.parse error handling
- Dynamic import errors
- Persistent state cleanup between cases
- Console log cleanup for production

### Security
- Added authentication middleware
- Added authorization (role-based access control)
- Implemented password hashing with bcrypt
- Added data encryption utilities
- Enhanced CSP headers
- Added CSRF protection
- Implemented rate limiting
- Added secure token generation
- Improved input validation with Zod

## [1.0.0] - Initial Release

### Added
- Core game engine
- Case management system
- WebSocket real-time communication
- Multiplayer support
- Interrogation system
- Evidence collection mechanics
- Timeline board
- Tribunal phase
- PHS (Progressive Hint System)
- 59 investigation cases
- Basic UI components
- SQLite database integration
- Room management system
- Game state persistence

---

## Version Guidelines

### Semantic Versioning

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Examples

- `1.0.0` → Initial release
- `1.1.0` → New features added
- `1.1.1` → Bug fixes only
- `2.0.0` → Breaking changes

---

**Note:** This project is under active development. Check back regularly for updates.
