// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'pro' | 'team' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  ownerId: string;
  framework: string;
  visibility: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

// AI Conversation Types
export type AIMode = 'agent' | 'ask' | 'edit' | 'composer';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIConversation {
  id: string;
  userId: string;
  projectId: string;
  mode: AIMode;
  messages: AIMessage[];
  createdAt: Date;
}

// Deployment Types
export type DeploymentProvider = 'vercel' | 'netlify' | 'aws' | 'gcp' | 'custom';
export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'success' | 'failed';

export interface Deployment {
  id: string;
  projectId: string;
  provider: DeploymentProvider;
  status: DeploymentStatus;
  url: string | null;
  error: string | null;
  createdAt: Date;
}

// File System Types
export interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

// MCP Types
export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface MCPServer {
  name: string;
  version: string;
  tools: MCPTool[];
}
