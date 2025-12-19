# Getting Started with NEXUS AI Development

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0
- **PostgreSQL** >= 15.0
- **Redis** >= 7.0
- **Git**

Optional:
- **Python** >= 3.11 (for AI service)
- **Docker** (for containerization)

## Project Structure

```
nexus-ai/
├── apps/
│   ├── desktop/          # Electron desktop app
│   ├── web/              # Next.js web app
│   └── api/              # Node.js backend API
├── packages/
│   └── shared/           # Shared TypeScript code
├── services/
│   └── ai-service/       # Python AI service (to be created)
└── infrastructure/       # Infrastructure as code (to be created)
```

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd "D:\NEXUS AI"

# Install all dependencies
npm install

# This will install dependencies for all apps and packages
```

### 2. Set Up Environment Variables

```bash
# Copy example env file for API
cd apps/api
cp .env.example .env

# Edit .env with your actual credentials
```

### 3. Set Up Database

```bash
# Create PostgreSQL database
createdb nexus_ai

# Run Prisma migrations
cd apps/api
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 4. Start Redis

```bash
# Using Docker (recommended)
docker run -d -p 6379:6379 redis:7-alpine

# Or install Redis locally and start it
redis-server
```

## Development

### Running All Apps (Recommended)

```bash
# From root directory
npm run dev

# This starts:
# - Desktop app (Electron) on http://localhost:5173
# - Web app (Next.js) on http://localhost:3000
# - API server on http://localhost:3001
```

### Running Individual Apps

```bash
# Desktop app only
cd apps/desktop
npm run dev

# Web app only
cd apps/web
npm run dev

# API server only
cd apps/api
npm run dev
```

## Testing

```bash
# Run all tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Building for Production

### Desktop App

```bash
cd apps/desktop
npm run build       # Build renderer and electron
npm run package     # Create distributable
```

### Web App

```bash
cd apps/web
npm run build
npm run start
```

### API

```bash
cd apps/api
npm run build
npm run start
```

## Key Features Implemented

### Desktop App (Electron)
- ✅ Basic window management (minimize, maximize, close)
- ✅ Monaco Editor integration
- ✅ Activity bar navigation
- ✅ Sidebar with explorer, search, git, AI views
- ✅ AI Panel with Agent/Ask/Edit modes
- ✅ Bottom panel with terminal, output, problems
- ✅ Status bar
- ✅ VS Code-like layout and styling

### Web App (Next.js)
- ✅ Landing page with hero section
- ✅ Features showcase
- ✅ Pricing preview
- ✅ TailwindCSS styling
- ✅ Next.js 14 App Router

### API (Node.js)
- ✅ Express server setup
- ✅ Socket.IO for real-time communication
- ✅ Prisma ORM with PostgreSQL schema
- ✅ Health check endpoint
- ✅ CORS and security (Helmet)

### Shared Package
- ✅ TypeScript types for User, Project, AI, Deployment
- ✅ Zod schemas for validation
- ✅ Shared constants

## Next Steps

Based on the roadmap, here's what to implement next:

### Week 3-4: Editor Core Enhancement
- [ ] File tree implementation with real file system
- [ ] Tab management with multiple files
- [ ] File operations (create, delete, rename)
- [ ] Syntax highlighting for all languages
- [ ] Search and replace functionality

### Week 5-6: Backend Enhancement
- [ ] User authentication (JWT)
- [ ] OAuth integration (Google, GitHub)
- [ ] Project CRUD operations
- [ ] File storage (AWS S3)
- [ ] Rate limiting

### Week 7-8: AI Integration
- [ ] Anthropic Claude integration
- [ ] Context management system
- [ ] Ask mode implementation
- [ ] Basic Edit mode

## Development Tips

1. **Use the monorepo structure**: All shared code goes in `packages/shared`
2. **Hot reload**: All apps support hot reload during development
3. **TypeScript**: Enable strict mode for better type safety
4. **Git workflow**: Create feature branches for each major feature
5. **Testing**: Write tests as you develop features

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 3001
npx kill-port 3001
```

### Prisma Issues

```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Electron Not Starting

```bash
# Clear Electron cache
cd apps/desktop
rm -rf dist out
npm run build
```

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/index.html)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the complete technical blueprint

---

Happy coding! 🚀
