/**
 * AI Service
 * Main export for AI-related services
 */

export * from './anthropic';
export * from './context-manager';

import { AnthropicService } from './anthropic';
import { ContextManager } from './context-manager';
import { MCPManager } from '../mcp';

/**
 * Initialize AI services
 */
export async function initializeAIServices(
  workspaceRoot: string,
  anthropicApiKey: string
): Promise<{
  aiService: AnthropicService;
  contextManager: ContextManager;
  mcpManager: MCPManager;
}> {
  console.log('🚀 Initializing AI services...');

  // Initialize MCP Manager
  const mcpManager = new MCPManager(workspaceRoot);
  await mcpManager.initialize();

  // Initialize Context Manager
  const contextManager = new ContextManager();
  await contextManager.initialize();
  await contextManager.loadFromDisk();

  // Initialize Anthropic Service
  const aiService = new AnthropicService(anthropicApiKey, mcpManager);

  console.log('✅ AI services initialized successfully');

  return {
    aiService,
    contextManager,
    mcpManager
  };
}
