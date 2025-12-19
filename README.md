# AnuCode - AI-Powered Code Editor

<div align="center">
  <img src="apps/desktop/src/Assets/AnuCode Logo.png" alt="AnuCode Logo" width="200"/>

  **Next Generation AI-Powered Development Platform**

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
  [![Electron](https://img.shields.io/badge/Electron-28.1-brightgreen)](https://www.electronjs.org/)
  [![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
</div>

---

## 🚀 Overview

AnuCode is a professional, AI-powered code editor built with Electron, React, and TypeScript. Inspired by Visual Studio Code, it combines a sleek, modern interface with powerful AI capabilities to accelerate your development workflow.

### ✨ Key Features

- **🤖 AI-Powered Assistance** - Three intelligent modes:
  - **Agent Mode**: Build complete applications iteratively through conversation
  - **Ask Mode**: Get instant explanations and code insights
  - **Edit Mode**: AI-powered code modifications and refactoring

- **📁 Professional File Explorer** - VS Code-style file tree with real-time directory browsing

- **💻 Integrated Terminal** - Full-featured terminal powered by xterm.js

- **✏️ Monaco Editor** - Industry-standard code editor with syntax highlighting, IntelliSense, and more

- **🔌 MCP Protocol Support** - 32 built-in tools across:
  - File System Operations (10 tools)
  - Git Integration (14 tools)
  - Terminal Management (8 tools)

- **🎨 Modern UI/UX** - Dark theme with resizable panels, just like VS Code

---

## 🏗️ Architecture

### Tech Stack

**Frontend (Desktop App)**
- Electron 28.1
- React 18.2
- TypeScript 5.3
- Monaco Editor
- TailwindCSS
- Radix UI
- xterm.js

**Backend (API Server)**
- Node.js
- Express.js
- Socket.IO
- Anthropic API
- MongoDB

**Build Tools**
- Vite
- Turbo (Monorepo)
- electron-builder

### Project Structure

```
AnuCode/
├── apps/
│   ├── desktop/          # Electron desktop application
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities & services
│   │   │   └── Assets/       # Images & resources
│   │   └── electron/         # Electron main process
│   └── api/              # Backend API server
│       ├── src/
│       │   ├── services/     # MCP servers & AI
│       │   └── index.ts      # Express server
│       └── workspace/        # AI workspace
└── packages/             # Shared packages
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone repository
git clone https://github.com/kamleshthink/AnuCode.git
cd AnuCode

# Install dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Development

```bash
# Start all services (Desktop + API)
npm run dev

# Or start individually:

# Desktop app only
cd apps/desktop
npm run dev

# API server only
cd apps/api
npm run dev
```

The desktop app will be available at `http://localhost:5174`

---

## 📦 Building

### Build Desktop App

```bash
cd apps/desktop

# Build renderer (React app)
npm run build:renderer

# Build electron (main process)
npm run build:electron

# Create Windows installer
npm run package
```

Output: `apps/desktop/out/AnuCode-Setup-0.1.0.exe`

### Build API Server

```bash
cd apps/api
npm run build
```

---

## 🔧 Configuration

### Environment Variables

Create `apps/api/.env`:

```env
# Anthropic API
ANTHROPIC_API_KEY=your_api_key_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/anucode

# Server
PORT=3001
NODE_ENV=development

# Workspace
WORKSPACE_ROOT=./workspace
```

### Database Setup

AnuCode supports both MongoDB and PostgreSQL:

**MongoDB** (Recommended for development):
```bash
# Install MongoDB locally or use MongoDB Atlas
# Update MONGODB_URI in .env
```

**PostgreSQL** (For production):
```bash
# Install PostgreSQL
# Update DATABASE_URL in .env
```

---

## 🎯 Features in Detail

### AI Modes

#### 1. Agent Mode
Build complete applications through iterative conversation:
```
You: "Create a REST API for a todo app"
AI: [Generates files, writes code, explains architecture]
You: "Add authentication"
AI: [Implements JWT auth, updates endpoints]
```

#### 2. Ask Mode
Get instant code explanations:
```
You: "What does this function do?"
AI: [Provides detailed explanation with examples]
```

#### 3. Edit Mode
AI-powered code modifications:
```
You: "Refactor this to use async/await"
AI: [Refactors code while preserving functionality]
```

### MCP Tools

**File System (10 tools)**
- Read, write, create, delete files
- List directories
- Search files
- Move, copy operations

**Git (14 tools)**
- Status, diff, log
- Commit, push, pull
- Branch management
- Stash, reset operations

**Terminal (8 tools)**
- Execute commands
- Process management
- Command history
- Shell integration

---

## 🎨 UI Components

- **TitleBar**: Custom window controls with menu bar
- **ActivityBar**: Quick access to different views
- **FileExplorer**: Real-time file tree navigation
- **EditorArea**: Monaco-powered code editing
- **Terminal**: Full xterm.js terminal
- **AIPanel**: Intelligent assistant interface
- **StatusBar**: Git, language, and AI status

---

## 🛣️ Roadmap

- [ ] Multi-language support
- [ ] Plugin system
- [ ] Cloud sync
- [ ] Collaborative editing
- [ ] Integrated debugger
- [ ] Git visual interface
- [ ] Custom themes
- [ ] Extension marketplace
- [ ] Docker integration
- [ ] Remote development

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Terminal powered by [xterm.js](https://xtermjs.org/)
- AI capabilities powered by [Anthropic](https://www.anthropic.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)

---

## 📧 Contact

**Kamlesh Kumar**
- GitHub: [@kamleshthink](https://github.com/kamleshthink)
- Email: support@anucode.com

---

<div align="center">
  Made with ❤️ by the AnuCode Team

  **[Website](https://anucode.com)** • **[Documentation](https://docs.anucode.com)** • **[Discord](https://discord.gg/anucode)**
</div>
