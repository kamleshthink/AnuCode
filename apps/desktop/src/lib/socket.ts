import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string = 'http://localhost:3001';

  connect() {
    if (this.socket?.connected) return this.socket;

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to AnuCode Backend');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Backend');
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Backend not connected:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  // AI Operations
  createConversation(conversationId: string, userId: string, projectPath?: string) {
    this.getSocket().emit('ai:create-conversation', {
      conversationId,
      userId,
      projectPath
    });
  }

  sendMessage(conversationId: string, message: string) {
    this.getSocket().emit('ai:message', {
      conversationId,
      message
    });
  }

  // MCP Operations
  executeTool(toolName: string, args: any) {
    this.getSocket().emit('mcp:execute-tool', {
      toolName,
      arguments: args
    });
  }

  // Event Listeners
  onAIResponse(callback: (data: any) => void) {
    this.getSocket().on('ai:response', callback);
  }

  onToolResult(callback: (data: any) => void) {
    this.getSocket().on('mcp:tool-result', callback);
  }

  onError(callback: (data: any) => void) {
    this.getSocket().on('ai:error', callback);
    this.getSocket().on('mcp:error', callback);
  }
}

export const socketService = new SocketService();
