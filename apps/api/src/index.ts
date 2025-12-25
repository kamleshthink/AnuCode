import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { initializeAIServices, AnthropicService, ContextManager } from './services/ai';
import { MCPManager } from './services/mcp';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global AI services
let aiService: AnthropicService;
let contextManager: ContextManager;
let mcpManager: MCPManager;

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      ai: aiService ? 'initialized' : 'not initialized',
      mcp: mcpManager ? 'initialized' : 'not initialized',
      context: contextManager ? 'initialized' : 'not initialized'
    }
  });
});

// API Routes
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    name: 'NEXUS AI API',
    version: '0.1.0',
    status: 'running',
  });
});

// Get MCP tools info
app.get('/api/v1/mcp/tools', (req: Request, res: Response) => {
  if (!mcpManager) {
    return res.status(503).json({ error: 'MCP Manager not initialized' });
  }

  res.json({
    tools: mcpManager.getAllTools(),
    info: mcpManager.getInfo()
  });
});

// Socket.IO for real-time communication
io.on('connection', (socket: Socket) => {
  console.log('✅ Client connected:', socket.id);

  // Create conversation
  socket.on('ai:create-conversation', async (data: {
    conversationId: string;
    userId: string;
    projectPath?: string;
    systemPrompt?: string;
  }) => {
    try {
      console.log('📝 Creating conversation:', data.conversationId);

      // Analyze project if path provided
      let projectId: string | undefined;
      if (data.projectPath) {
        projectId = data.conversationId; // Use conversation ID as project ID
        await contextManager.analyzeProject(projectId, data.projectPath);

        // Update MCP workspace root
        mcpManager.setWorkspaceRoot(data.projectPath);
      }

      // Create conversation context
      const context = aiService.createConversation(data.conversationId, data.userId, {
        projectId,
        systemPrompt: data.systemPrompt
      });

      // Create conversation memory
      if (projectId) {
        contextManager.createConversationMemory(data.conversationId, projectId);
      }

      socket.emit('ai:conversation-created', {
        success: true,
        conversationId: data.conversationId,
        context
      });
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      socket.emit('ai:error', {
        error: error.message || 'Failed to create conversation'
      });
    }
  });

  // Send message to AI
  socket.on('ai:message', async (data: {
    conversationId: string;
    message: string;
  }) => {
    try {
      console.log(`💬 Message from ${socket.id}:`, data.message);

      // Get context summary if available
      const contextSummary = contextManager.generateContextSummary(data.conversationId);
      let enhancedMessage = data.message;

      if (contextSummary) {
        enhancedMessage = `${contextSummary}\n\n---\n\nUser: ${data.message}`;
      }

      // Send to AI service
      const response = await aiService.sendMessage(data.conversationId, enhancedMessage);

      if (response.success) {
        socket.emit('ai:response', {
          conversationId: data.conversationId,
          message: response.message,
          toolCalls: response.toolCalls,
          usage: response.usage
        });
      } else {
        socket.emit('ai:error', {
          conversationId: data.conversationId,
          error: response.error
        });
      }
    } catch (error: any) {
      console.error('Error processing message:', error);
      socket.emit('ai:error', {
        error: error.message || 'Failed to process message'
      });
    }
  });

  // Execute MCP tool directly
  socket.on('mcp:execute-tool', async (data: {
    toolName: string;
    arguments: any;
  }) => {
    try {
      console.log(`🔧 Executing tool: ${data.toolName}`);

      const result = await mcpManager.executeTool({
        name: data.toolName,
        arguments: data.arguments
      });

      socket.emit('mcp:tool-result', {
        toolName: data.toolName,
        result
      });
    } catch (error: any) {
      console.error('Error executing tool:', error);
      socket.emit('mcp:error', {
        error: error.message || 'Failed to execute tool'
      });
    }
  });

  // Get project context
  socket.on('context:get-project', (data: { projectId: string }) => {
    const project = contextManager.getProject(data.projectId);

    if (project) {
      socket.emit('context:project', { project });
    } else {
      socket.emit('context:error', {
        error: 'Project not found'
      });
    }
  });

  // Get user preferences
  socket.on('context:get-preferences', (data: { userId: string }) => {
    const preferences = contextManager.getUserPreferences(data.userId);
    socket.emit('context:preferences', { preferences });
  });

  // Update user preferences
  socket.on('context:update-preferences', (data: {
    userId: string;
    updates: any;
  }) => {
    contextManager.updateUserPreferences(data.userId, data.updates);
    socket.emit('context:preferences-updated', { success: true });
  });

  // Record decision
  socket.on('context:record-decision', (data: {
    conversationId: string;
    question: string;
    answer: string;
  }) => {
    contextManager.addDecision(data.conversationId, data.question, data.answer);
    socket.emit('context:decision-recorded', { success: true });
  });

  // Get conversation stats
  socket.on('ai:get-stats', (data: { conversationId: string }) => {
    const stats = aiService.getStats(data.conversationId);

    if (stats) {
      socket.emit('ai:stats', { stats });
    } else {
      socket.emit('ai:error', {
        error: 'Conversation not found'
      });
    }
  });

  // Clear conversation history
  socket.on('ai:clear-history', (data: { conversationId: string }) => {
    const success = aiService.clearHistory(data.conversationId);
    socket.emit('ai:history-cleared', { success });
  });

  // Delete conversation
  socket.on('ai:delete-conversation', (data: { conversationId: string }) => {
    const success = aiService.deleteConversation(data.conversationId);
    socket.emit('ai:conversation-deleted', { success });
  });

  // Set workspace root
  socket.on('mcp:set-workspace', (data: { path: string }) => {
    mcpManager.setWorkspaceRoot(data.path);
    socket.emit('mcp:workspace-set', {
      success: true,
      path: data.path
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.join(process.cwd(), 'workspace');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize services and start server
async function start() {
  try {
    if (!ANTHROPIC_API_KEY) {
      console.warn('⚠️  Warning: ANTHROPIC_API_KEY not set. AI features will not work.');
      console.warn('   Set ANTHROPIC_API_KEY in your .env file');
    } else {
      // Initialize AI services
      const services = await initializeAIServices(WORKSPACE_ROOT, ANTHROPIC_API_KEY);
      aiService = services.aiService;
      contextManager = services.contextManager;
      mcpManager = services.mcpManager;
    }

    // Start server
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════╗');
      console.log('║                                            ║');
      console.log('║          🚀 NEXUS AI API SERVER          ║');
      console.log('║                                            ║');
      console.log('╠════════════════════════════════════════════╣');
      console.log(`║  Port:           ${PORT.toString().padEnd(26)}║`);
      console.log(`║  Health:         http://localhost:${PORT}/health     ║`);
      console.log(`║  Workspace:      ${WORKSPACE_ROOT.length > 20 ? '...' + WORKSPACE_ROOT.slice(-17) : WORKSPACE_ROOT.padEnd(20)}║`);
      console.log(`║  AI Status:      ${(aiService ? 'Ready ✅' : 'Not configured ⚠️').padEnd(26)}║`);
      console.log('║                                            ║');
      console.log('╚════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');

  if (mcpManager) {
    await mcpManager.cleanup();
  }

  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');

  if (mcpManager) {
    await mcpManager.cleanup();
  }

  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start the server
start();
