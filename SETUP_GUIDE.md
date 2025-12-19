# 🎯 NEXUS AI - Quick Setup Guide

**आपका AI Agentic Platform तैयार है!** ✅

---

## 🌟 क्या Complete हो गया (Today)

### ✅ Backend Infrastructure (100% Complete)

1. **MCP Servers** - AI Agent के लिए Tools
   - File System Operations (10 tools)
   - Git Operations (14 tools)
   - Terminal Operations (8 tools)
   - Total: **32 powerful tools**

2. **AI Integration**
   - Anthropic Claude API integration
   - Multi-conversation support
   - Context-aware messaging
   - Automatic tool execution
   - Token usage tracking

3. **Context Management**
   - Project analysis (auto-detect framework)
   - User preferences storage
   - Conversation memory
   - Decision tracking
   - File change tracking

4. **Real-time API**
   - Socket.IO server
   - 15+ event handlers
   - Error handling
   - Graceful shutdown

---

## 🚀 Kaise Use Karein (Step-by-Step)

### Step 1: Anthropic API Key Setup

```bash
# 1. Get free API key
Open: https://console.anthropic.com/

# 2. Sign up / Login

# 3. Go to "API Keys"

# 4. Create new key

# 5. Copy key

# 6. Add to .env file
cd apps/api
cp .env.example .env
# Edit .env and add:
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
```

**Free Credits:** $5 free credit = ~5000 AI messages!

### Step 2: Start the Server

```bash
# From root directory
npm run dev
```

**Ye start hoga:**
- ✅ API Server: http://localhost:3001
- ✅ Web App: http://localhost:3000
- ✅ Desktop App: http://localhost:5173

### Step 3: Test Karo

```bash
# Health check
curl http://localhost:3001/health

# Should return:
# {
#   "status": "ok",
#   "services": {
#     "ai": "initialized",
#     "mcp": "initialized",
#     "context": "initialized"
#   }
# }

# Get all available tools
curl http://localhost:3001/api/v1/mcp/tools
```

---

## 💻 Code Examples

### Example 1: Create Conversation & Send Message

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// 1. Create conversation
socket.emit('ai:create-conversation', {
  conversationId: 'my-conv-123',
  userId: 'user-456',
  projectPath: 'D:/MyProjects/test-app'
});

// 2. Listen for response
socket.on('ai:conversation-created', ({ success }) => {
  console.log('Conversation created!', success);

  // 3. Send message
  socket.emit('ai:message', {
    conversationId: 'my-conv-123',
    message: 'Help me create a simple Express.js API with one GET endpoint'
  });
});

// 4. Get AI response
socket.on('ai:response', ({ message, toolCalls }) => {
  console.log('AI says:', message);
  console.log('Tools used:', toolCalls);
});
```

### Example 2: Direct MCP Tool Execution

```typescript
// Read a file
socket.emit('mcp:execute-tool', {
  toolName: 'fs_read_file',
  arguments: {
    path: 'package.json'
  }
});

socket.on('mcp:tool-result', ({ result }) => {
  console.log('File content:', result.data.content);
});

// Execute git status
socket.emit('mcp:execute-tool', {
  toolName: 'git_status',
  arguments: {}
});

// Run npm install
socket.emit('mcp:execute-tool', {
  toolName: 'terminal_execute',
  arguments: {
    command: 'npm install',
    timeout: 60000
  }
});
```

---

## 🏗️ Project Structure

```
apps/
├── api/
│   └── src/
│       ├── index.ts              ← Main server
│       └── services/
│           ├── mcp/              ← MCP Servers
│           │   ├── types.ts      ← Base types
│           │   ├── filesystem.ts ← File operations (10 tools)
│           │   ├── git.ts        ← Git operations (14 tools)
│           │   ├── terminal.ts   ← Terminal operations (8 tools)
│           │   └── index.ts      ← MCP Manager
│           └── ai/               ← AI Services
│               ├── anthropic.ts  ← Claude integration
│               ├── context-manager.ts ← Context & memory
│               └── index.ts      ← AI initialization
├── desktop/                      ← Electron app
└── web/                          ← Next.js web app
```

---

## 📋 Available MCP Tools

### File System (10 tools)
- `fs_read_file` - Read file content
- `fs_write_file` - Write/create file
- `fs_create_directory` - Create directory
- `fs_delete` - Delete file/directory
- `fs_list_directory` - List directory contents
- `fs_exists` - Check if file exists
- `fs_stat` - Get file stats
- `fs_search` - Search files (glob)
- `fs_move` - Move/rename file
- `fs_copy` - Copy file/directory

### Git (14 tools)
- `git_status` - Get git status
- `git_init` - Initialize repository
- `git_add` - Stage files
- `git_commit` - Create commit
- `git_push` - Push to remote
- `git_pull` - Pull from remote
- `git_diff` - Show differences
- `git_log` - Show commit history
- `git_branch` - Manage branches
- `git_checkout` - Switch branch/restore files
- `git_clone` - Clone repository
- `git_remote` - Manage remotes
- `git_stash` - Stash changes
- `git_reset` - Reset changes

### Terminal (8 tools)
- `terminal_execute` - Run command (blocking)
- `terminal_spawn` - Start process (non-blocking)
- `terminal_get_output` - Get process output
- `terminal_kill` - Kill process
- `terminal_list_processes` - List running processes
- `terminal_history` - Get command history
- `terminal_clear_history` - Clear history
- `terminal_which` - Check if command exists

---

## 🎨 AI System Prompt

Hamara AI aise kaam karta hai:

### ✅ DOES:
- Have iterative conversations
- Ask clarifying questions
- Build projects step-by-step
- Explain what it's doing
- Request confirmation for destructive actions
- Write production-quality code
- Generate proper documentation (README, comments)

### ❌ DOES NOT:
- Give fake one-prompt solutions
- Build apps without understanding requirements
- Skip important questions
- Make destructive changes without asking

---

## 🔥 Real-World Example

**User:** "I want to create a todo app"

**AI Response:**
```
Great! Let me ask a few questions to build exactly what you need:

1. Which framework do you prefer?
   - React
   - Next.js
   - Vue
   - Plain HTML/JS

2. Do you need:
   - Backend API or just frontend?
   - Database (which one)?
   - User authentication?
   - Deployment setup?

3. UI preferences:
   - Material UI
   - Tailwind CSS
   - Bootstrap
   - Custom CSS

Please answer these, and I'll start building your todo app step by step!
```

---

## 🚨 Important Notes

### Security
- ✅ Path traversal protection
- ✅ Workspace isolation
- ✅ Graceful error handling
- ✅ Process cleanup on exit

### Performance
- ✅ Real-time Socket.IO communication
- ✅ Efficient context management
- ✅ Disk persistence for memory
- ✅ Token usage tracking

### Extensibility
- ✅ Easy to add new MCP tools
- ✅ Pluggable AI providers
- ✅ Configurable system prompts
- ✅ Custom workspace roots

---

## 📚 Next Steps

### 1. Frontend Integration (Week 1)
```bash
# Update desktop app to connect to Socket.IO
# File: apps/desktop/src/services/socket.ts
```

### 2. AI Chat Panel (Week 1)
```bash
# Create chat interface
# File: apps/desktop/src/components/AIChat.tsx
```

### 3. Agent Mode MVP (Week 2)
```bash
# Autonomous task execution with confirmations
```

### 4. Project Templates (Week 2)
```bash
# React, Next.js, Express templates
```

---

## 🐛 Troubleshooting

### Issue: "ANTHROPIC_API_KEY not set"
**Solution:**
```bash
cd apps/api
cp .env.example .env
# Add your key to .env
```

### Issue: "Cannot connect to server"
**Solution:**
```bash
# Check if server is running
curl http://localhost:3001/health

# If not, restart:
npm run dev
```

### Issue: "esbuild error"
**Solution:**
```bash
npm rebuild esbuild
# or
npm install -D @esbuild/win32-x64
```

---

## 💰 Cost Estimate

### Development (with free Anthropic credits)
- **First month:** $0 (using $5 free credit)
- **After free credit:** ~$50-100/month

### What $5 gets you:
- ~5,000 AI messages
- ~100,000 tokens
- Enough for full development phase!

---

## 📊 What We Built Today

### Lines of Code
- **MCP Servers:** ~1500 lines
- **AI Integration:** ~600 lines
- **Context Manager:** ~400 lines
- **API Integration:** ~300 lines
- **Total:** ~2800 lines of production-ready TypeScript

### Features
- ✅ 32 MCP tools
- ✅ 15+ Socket.IO events
- ✅ Full Git integration
- ✅ File system operations
- ✅ Terminal command execution
- ✅ Context-aware AI conversations
- ✅ Project analysis
- ✅ Memory persistence

---

## 🎉 Success!

**Your AI Agentic Platform is READY!**

Next step: Get your Anthropic API key and start building! 🚀

---

**Questions?**
Check:
- `IMPLEMENTATION_GUIDE.md` - Detailed technical docs
- `IMPLEMENTATION_STATUS.md` - Current status
- `NEXUS_AI_Complete_Platform_Plan.md` - Full roadmap

**Happy Coding!** 💻✨
