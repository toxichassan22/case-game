# 🔍 نظام التحقيق الموحد - Investigation Game

A multiplayer detective investigation game where players analyze evidence, interrogate suspects, and solve complex cases together.

## ✨ Features

- 🎮 **22 Implemented Cases / 59 Planned** - Current playable arc with room for the full mystery
- 👥 **Multiplayer Support** - Collaborate with friends in real-time
- 🔐 **Full Authentication** - Secure JWT-based login system
- 💬 **Real-time Chat** - WebSocket-powered communication
- 📊 **Evidence Collection** - Gather and analyze clues
- 🕐 **Timeline Board** - Visual case reconstruction
- ⚖️ **Tribunal Phase** - Present your accusations
- 🎯 **Progressive Hint System** - Get help when stuck
- 🌙 **Dark Mode** - Easy on the eyes
- 📱 **Mobile Responsive** - Play on any device
- ♿ **Accessible** - ARIA labels, keyboard navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd game

# Install dependencies
npm install
cd server && npm install && cd ..
cd frontend && npm install && cd ..
cd runtime && npm install && cd ..

# Setup environment (IMPORTANT!)
cp .env.example .env
# Edit .env and set secure values for JWT_SECRET and ENCRYPTION_KEY
```

### Development

```bash
# Start both server and frontend
npm start
```

- 🌐 Frontend: http://localhost:5173
- 🔧 Backend: http://localhost:3001

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📚 Documentation

- [📖 API Documentation](docs/API.md) - Complete API reference
- [👨‍💻 Developer Guide](docs/DEVELOPER_GUIDE.md) - Setup and development
- [🤝 Contributing](docs/CONTRIBUTING.md) - How to contribute
- [📝 Changelog](CHANGELOG.md) - Version history

## 🧪 Testing

```bash
# Run all smoke tests
npm run test:smoke

# Validate case files
node scripts/validate_case_schema.mjs

# Run runtime tests
cd runtime && npm test
```

## 🏗️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Zustand (state management)
- Vite (build tool)
- CSS3 (styling)

**Backend:**
- Fastify (Node.js framework)
- WebSocket (real-time communication)
- SQLite (database)
- bcrypt (password hashing)
- JWT (authentication)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Multi-stage builds

## 🔒 Security Features

- ✅ JWT authentication with bcrypt
- ✅ AES-256-GCM encryption
- ✅ CSRF protection
- ✅ Rate limiting (100 req/min)
- ✅ Content Security Policy
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Input validation (Zod)

## 📊 Project Status

- **Playable Content:** 22 implemented cases out of 59 planned
- **Critical Issues:** 100% Fixed ✅
- **High Priority:** 100% Fixed ✅
- **Security:** Hardened 🔒
- **Tests:** Passing ✅
- **Documentation:** Complete 📚

## 🎯 Gameplay

1. **Register/Login** - Create an account or play as guest
2. **Join/Create Room** - Play solo or with friends
3. **Investigate** - Collect evidence and review clues
4. **Interrogate** - Question suspects via chat
5. **Analyze** - Build your case on the timeline board
6. **Accuse** - Present your findings in tribunal
7. **Progress** - Unlock new cases and hints

## 🌟 Recent Updates

### v1.1.0 (Current)
- 🔐 Full authentication system
- 🎨 Toast notifications
- 💀 Skeleton loading states
- 📭 Empty state components
- 🐳 Docker support
- 🔄 CI/CD pipeline
- 📚 Complete documentation
- 🔒 Enhanced security
- ♿ Accessibility improvements
- 🌙 Dark mode support

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Private - All rights reserved

## 👥 Credits

Developed with ❤️ for detective game enthusiasts

---

**Ready to investigate?** Start the game and solve your first case! 🔍🎮
