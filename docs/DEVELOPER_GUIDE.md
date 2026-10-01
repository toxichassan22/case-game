# Developer Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd game
```

2. **Install dependencies**
```bash
npm install
cd server && npm install && cd ..
cd frontend && npm install && cd ..
cd runtime && npm install && cd ..
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env and set secure values for JWT_SECRET and ENCRYPTION_KEY
```

4. **Start development servers**
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
game/
├── cases/              # Game case definitions (JSON)
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── stores/     # Zustand state stores
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API service layer
│   │   ├── utils/      # Utility functions
│   │   └── styles/     # CSS stylesheets
├── server/             # Fastify backend server
│   ├── src/
│   │   ├── db/         # Database configuration & schema
│   │   ├── managers/   # Game managers (rooms, engines)
│   │   ├── middleware/ # Express middleware
│   │   ├── routes/     # API route handlers
│   │   ├── utils/      # Server utilities
│   │   └── websocket/  # WebSocket handlers
├── runtime/            # Game engine runtime
│   ├── src/            # Engine source code
│   └── test/           # Engine tests
├── scripts/            # Automation & validation scripts
└── docs/               # Documentation
```

## Development Workflow

### Running Tests

```bash
# Run all smoke tests
npm run test:smoke

# Run specific test category
npm run test:smoke:core
npm run test:smoke:transitions-a
npm run test:smoke:multiplayer

# Validate case files
node scripts/validate_case_schema.mjs

# Run runtime engine tests
cd runtime && npm test
```

### Building for Production

```bash
# Build server
cd server && npm run build

# Build frontend
cd frontend && npm run build
```

### Docker Deployment

```bash
# Build Docker image
docker build -t investigation-game .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## Code Style

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Avoid `any` - use `unknown` when type is uncertain

### React Components
- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Use custom hooks for reusable logic
- Implement proper error boundaries

### Naming Conventions
- Components: PascalCase (`LoginPage`)
- Files: camelCase for utilities, PascalCase for components
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE

## Authentication

The system uses JWT-based authentication:

```typescript
import { useAuthStore } from './stores/authStore';

const { login, register, user, token } = useAuthStore();

// Login
await login('playerName', 'password');

// Register
await register('newPlayer', 'password123');

// Access user info
console.log(user?.playerName, user?.role);
```

## Adding New Cases

1. Create case directory: `cases/caseXX/`
2. Add case definition: `caseXX.json`
3. Add blueprint: `blueprints.json`
4. Validate: `node scripts/validate_case_schema.mjs`

## API Documentation

See [API.md](./API.md) for complete API reference.

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

**Database errors:**
```bash
# Reset database
rm server/database.sqlite*
# Restart server - it will recreate the database
```

**Build failures:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules server/node_modules frontend/node_modules
npm install
cd server && npm install && cd ..
cd frontend && npm install && cd ..
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## License

Private - All rights reserved
