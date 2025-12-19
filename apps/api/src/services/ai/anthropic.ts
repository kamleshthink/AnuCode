/**
 * Anthropic AI Service
 * Handles all AI interactions with context management
 */

import Anthropic from '@anthropic-ai/sdk';
import { MCPManager } from '../mcp';

export interface Message {
  role: 'user' | 'assistant';
  content: string | any[];
}

export interface ConversationContext {
  conversationId: string;
  projectId?: string;
  userId: string;
  messages: Message[];
  systemPrompt: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    input: any;
  }>;
  stopReason?: 'end_turn' | 'tool_use' | 'max_tokens';
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: string;
}

export class AnthropicService {
  private client: Anthropic;
  private mcpManager: MCPManager;
  private conversations: Map<string, ConversationContext> = new Map();

  constructor(apiKey: string, mcpManager: MCPManager) {
    this.client = new Anthropic({ apiKey });
    this.mcpManager = mcpManager;
  }

  /**
   * Create a new conversation context
   */
  createConversation(
    conversationId: string,
    userId: string,
    options?: {
      projectId?: string;
      systemPrompt?: string;
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): ConversationContext {
    const context: ConversationContext = {
      conversationId,
      userId,
      projectId: options?.projectId,
      messages: [],
      systemPrompt: options?.systemPrompt || this.getDefaultSystemPrompt(),
      model: options?.model || 'claude-3-5-sonnet-20241022',
      maxTokens: options?.maxTokens || 4096,
      temperature: options?.temperature || 0.7
    };

    this.conversations.set(conversationId, context);
    return context;
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    conversationId: string,
    userMessage: string,
    options?: {
      stream?: boolean;
      onChunk?: (text: string) => void;
    }
  ): Promise<AIResponse> {
    const context = this.conversations.get(conversationId);
    if (!context) {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }

    // Add user message to context
    context.messages.push({
      role: 'user',
      content: userMessage
    });

    try {
      // Get available tools from MCP
      const tools = this.mcpManager.getAITools();

      // Create AI API request
      const response = await this.client.messages.create({
        model: context.model,
        max_tokens: context.maxTokens,
        temperature: context.temperature,
        system: context.systemPrompt,
        messages: context.messages as any,
        tools: tools.length > 0 ? tools : undefined
      });

      // Handle response
      const result = await this.processResponse(context, response);

      return result;
    } catch (error: any) {
      console.error('AI API error:', error);
      return {
        success: false,
        error: error.message || 'AI service error'
      };
    }
  }

  /**
   * Process AI response and handle tool calls
   */
  private async processResponse(
    context: ConversationContext,
    response: any
  ): Promise<AIResponse> {
    const { content, stop_reason, usage } = response;

    // Extract text and tool calls
    let textContent = '';
    const toolCalls: Array<{ id: string; name: string; input: any }> = [];

    for (const block of content) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input
        });
      }
    }

    // Add assistant response to context
    context.messages.push({
      role: 'assistant',
      content
    });

    // If there are tool calls, execute them
    if (toolCalls.length > 0) {
      const toolResults = await this.executeToolCalls(toolCalls);

      // Add tool results to context
      const toolResultContent = toolResults.map((result, index) => ({
        type: 'tool_result',
        tool_use_id: toolCalls[index].id,
        content: JSON.stringify(result)
      }));

      context.messages.push({
        role: 'user',
        content: toolResultContent
      });

      // Continue conversation with tool results
      const followUpResponse = await this.client.messages.create({
        model: context.model,
        max_tokens: context.maxTokens,
        temperature: context.temperature,
        system: context.systemPrompt,
        messages: context.messages as any,
        tools: this.mcpManager.getAITools()
      });

      // Process follow-up response
      return await this.processResponse(context, followUpResponse);
    }

    return {
      success: true,
      message: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      stopReason: stop_reason,
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens
      }
    };
  }

  /**
   * Execute tool calls through MCP Manager
   */
  private async executeToolCalls(
    toolCalls: Array<{ id: string; name: string; input: any }>
  ): Promise<any[]> {
    const results: any[] = [];

    for (const toolCall of toolCalls) {
      console.log(`🔧 Executing tool: ${toolCall.name}`);

      const result = await this.mcpManager.executeTool({
        name: toolCall.name,
        arguments: toolCall.input
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Get conversation context
   */
  getConversation(conversationId: string): ConversationContext | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }

  /**
   * Clear conversation history but keep context
   */
  clearHistory(conversationId: string): boolean {
    const context = this.conversations.get(conversationId);
    if (context) {
      context.messages = [];
      return true;
    }
    return false;
  }

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(): string {
    return `You are NEXUS AI, an intelligent AI coding assistant integrated into a powerful code editor.

Your capabilities:
- You can read, write, create, and delete files using the filesystem tools
- You can execute Git operations (status, commit, push, pull, branch, etc.)
- You can run terminal commands to install packages, run tests, build projects
- You have access to the entire project structure and can analyze code

Your approach:
- When a user asks you to build something, don't give fake one-prompt solutions
- Instead, have a conversation with them to understand:
  * What exactly they want to build
  * What features are needed
  * What tech stack they prefer
  * UI/UX preferences
  * Any specific requirements or constraints

- Build projects iteratively:
  1. First, discuss and clarify requirements
  2. Create a proper project structure
  3. Implement features step by step
  4. Test and fix issues as you go
  5. Generate proper documentation (README, comments, etc.)

- Always explain what you're doing and why
- Ask for confirmation before:
  * Deleting files
  * Force pushing to git
  * Running potentially destructive commands
  * Making major architectural changes

- Write production-quality code:
  * Proper error handling
  * Clean, readable code with comments
  * Follow best practices for the chosen tech stack
  * Include tests where appropriate

- For each project, create:
  * Detailed README.md with setup instructions
  * Project structure documentation
  * Comments explaining complex logic
  * Environment variable templates (.env.example)

Your goal is to help users build real, production-ready applications through intelligent collaboration, not magic one-shot generations.`;
  }

  /**
   * Update system prompt for a conversation
   */
  updateSystemPrompt(conversationId: string, systemPrompt: string): boolean {
    const context = this.conversations.get(conversationId);
    if (context) {
      context.systemPrompt = systemPrompt;
      return true;
    }
    return false;
  }

  /**
   * Get conversation statistics
   */
  getStats(conversationId: string) {
    const context = this.conversations.get(conversationId);
    if (!context) {
      return null;
    }

    return {
      conversationId,
      messageCount: context.messages.length,
      model: context.model,
      projectId: context.projectId
    };
  }

  /**
   * List all active conversations
   */
  listConversations() {
    return Array.from(this.conversations.keys());
  }
}
