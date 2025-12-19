/**
 * MCP Manager
 * Coordinates all MCP servers and provides unified interface
 */

export * from './types';
export * from './filesystem';
export * from './git';
export * from './terminal';

import { MCPServer, MCPToolCall, MCPToolResult, MCPTool } from './types';
import { FileSystemMCP } from './filesystem';
import { GitMCP } from './git';
import { TerminalMCP } from './terminal';

export class MCPManager {
  private servers: Map<string, MCPServer> = new Map();
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Initialize all MCP servers
   */
  async initialize(): Promise<void> {
    // Initialize File System MCP
    const fsMCP = new FileSystemMCP(this.workspaceRoot);
    await fsMCP.initialize();
    this.servers.set('filesystem', fsMCP);

    // Initialize Git MCP
    const gitMCP = new GitMCP(this.workspaceRoot);
    await gitMCP.initialize();
    this.servers.set('git', gitMCP);

    // Initialize Terminal MCP
    const terminalMCP = new TerminalMCP(this.workspaceRoot);
    await terminalMCP.initialize();
    this.servers.set('terminal', terminalMCP);

    console.log(`✅ Initialized ${this.servers.size} MCP servers`);
  }

  /**
   * Get all available tools from all servers
   */
  getAllTools(): Array<MCPTool & { server: string }> {
    const tools: Array<MCPTool & { server: string }> = [];

    for (const [serverName, server] of this.servers) {
      const serverTools = server.getTools();
      for (const tool of serverTools) {
        tools.push({
          ...tool,
          server: serverName
        });
      }
    }

    return tools;
  }

  /**
   * Get tools formatted for AI API
   */
  getAITools() {
    return this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters
    }));
  }

  /**
   * Execute a tool call
   */
  async executeTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    // Find which server handles this tool
    for (const [serverName, server] of this.servers) {
      const tool = server.getTool(toolCall.name);
      if (tool) {
        console.log(`🔧 Executing ${toolCall.name} on ${serverName} server`);
        return await server.handleToolCall(toolCall);
      }
    }

    return {
      success: false,
      error: `Tool not found: ${toolCall.name}`
    };
  }

  /**
   * Execute multiple tool calls in sequence
   */
  async executeTools(toolCalls: MCPToolCall[]): Promise<MCPToolResult[]> {
    const results: MCPToolResult[] = [];

    for (const toolCall of toolCalls) {
      const result = await this.executeTool(toolCall);
      results.push(result);

      // Stop if any tool fails
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Get a specific server
   */
  getServer<T extends MCPServer>(name: string): T | undefined {
    return this.servers.get(name) as T | undefined;
  }

  /**
   * Set workspace root for all servers
   */
  setWorkspaceRoot(newRoot: string) {
    this.workspaceRoot = newRoot;

    for (const server of this.servers.values()) {
      if ('setWorkspaceRoot' in server) {
        (server as any).setWorkspaceRoot(newRoot);
      }
    }
  }

  /**
   * Get current workspace root
   */
  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }

  /**
   * Get server information
   */
  getInfo() {
    const servers: any = {};

    for (const [name, server] of this.servers) {
      servers[name] = server.getInfo();
    }

    return {
      workspaceRoot: this.workspaceRoot,
      serverCount: this.servers.size,
      toolCount: this.getAllTools().length,
      servers
    };
  }

  /**
   * Cleanup all servers
   */
  async cleanup(): Promise<void> {
    for (const server of this.servers.values()) {
      await server.cleanup();
    }
    this.servers.clear();
  }
}
