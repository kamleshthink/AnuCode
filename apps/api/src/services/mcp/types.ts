/**
 * MCP (Model Context Protocol) Server Types
 * These types define the interface for all MCP servers
 */

export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class MCPServer {
  protected name: string;
  protected version: string;
  protected tools: Map<string, MCPTool>;

  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
    this.tools = new Map();
  }

  /**
   * Get all available tools from this MCP server
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Register a new tool with this MCP server
   */
  protected registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Handle a tool call - must be implemented by concrete servers
   */
  abstract handleToolCall(toolCall: MCPToolCall): Promise<MCPToolResult>;

  /**
   * Initialize the MCP server - can be overridden for setup logic
   */
  async initialize(): Promise<void> {
    // Default: no initialization needed
  }

  /**
   * Cleanup resources - can be overridden for cleanup logic
   */
  async cleanup(): Promise<void> {
    // Default: no cleanup needed
  }

  /**
   * Get server information
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      toolCount: this.tools.size,
    };
  }
}
