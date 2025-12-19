/**
 * Context Manager
 * Manages project context, user preferences, and conversation memory
 */

import fs from 'fs/promises';
import path from 'path';

export interface ProjectContext {
  projectId: string;
  name: string;
  path: string;
  framework?: string;
  language?: string;
  packageManager?: string;
  structure?: {
    files: string[];
    directories: string[];
  };
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  lastAnalyzed?: Date;
}

export interface UserPreferences {
  userId: string;
  preferredLanguage?: string;
  preferredFramework?: string;
  codeStyle?: {
    indentation?: 'tabs' | 'spaces';
    indentSize?: number;
    quotes?: 'single' | 'double';
    semicolons?: boolean;
  };
  aiSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ConversationMemory {
  conversationId: string;
  projectId: string;
  decisions: Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>;
  fileChanges: Array<{
    file: string;
    action: 'created' | 'modified' | 'deleted';
    timestamp: Date;
  }>;
  commands: Array<{
    command: string;
    success: boolean;
    timestamp: Date;
  }>;
}

export class ContextManager {
  private projects: Map<string, ProjectContext> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();
  private conversationMemory: Map<string, ConversationMemory> = new Map();
  private cacheDir: string;

  constructor(cacheDir: string = '.nexus-cache') {
    this.cacheDir = cacheDir;
  }

  /**
   * Initialize context manager
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    console.log('✅ Context Manager initialized');
  }

  /**
   * Analyze project and extract context
   */
  async analyzeProject(projectId: string, projectPath: string): Promise<ProjectContext> {
    console.log(`🔍 Analyzing project at ${projectPath}`);

    const context: ProjectContext = {
      projectId,
      name: path.basename(projectPath),
      path: projectPath
    };

    try {
      // Detect framework and language
      await this.detectFramework(projectPath, context);

      // Get project structure
      await this.analyzeStructure(projectPath, context);

      // Store context
      this.projects.set(projectId, context);

      // Cache to disk
      await this.saveToDisk();

      console.log(`✅ Project analysis complete for ${context.name}`);

      return context;
    } catch (error: any) {
      console.error('Project analysis error:', error);
      throw error;
    }
  }

  /**
   * Detect project framework and language
   */
  private async detectFramework(projectPath: string, context: ProjectContext): Promise<void> {
    // Check for package.json (Node.js projects)
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      context.packageManager = 'npm'; // Default
      context.dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      context.scripts = packageJson.scripts || {};

      // Detect framework
      if (packageJson.dependencies?.['next'] || packageJson.devDependencies?.['next']) {
        context.framework = 'nextjs';
        context.language = 'typescript';
      } else if (packageJson.dependencies?.['react']) {
        context.framework = 'react';
        context.language = 'typescript';
      } else if (packageJson.dependencies?.['vue']) {
        context.framework = 'vue';
        context.language = 'typescript';
      } else if (packageJson.dependencies?.['express']) {
        context.framework = 'express';
        context.language = 'typescript';
      }

      // Check for TypeScript
      if (await this.fileExists(path.join(projectPath, 'tsconfig.json'))) {
        context.language = 'typescript';
      } else if (context.language === undefined) {
        context.language = 'javascript';
      }

      // Detect package manager
      if (await this.fileExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
        context.packageManager = 'pnpm';
      } else if (await this.fileExists(path.join(projectPath, 'yarn.lock'))) {
        context.packageManager = 'yarn';
      }
    } catch (error) {
      // Not a Node.js project, check for other types
      if (await this.fileExists(path.join(projectPath, 'requirements.txt'))) {
        context.language = 'python';
      } else if (await this.fileExists(path.join(projectPath, 'Cargo.toml'))) {
        context.language = 'rust';
      } else if (await this.fileExists(path.join(projectPath, 'go.mod'))) {
        context.language = 'go';
      }
    }

    context.lastAnalyzed = new Date();
  }

  /**
   * Analyze project structure
   */
  private async analyzeStructure(projectPath: string, context: ProjectContext): Promise<void> {
    const files: string[] = [];
    const directories: string[] = [];

    const walk = async (dir: string, relativePath: string = '') => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip node_modules, .git, etc.
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          directories.push(relPath);
          await walk(fullPath, relPath);
        } else {
          files.push(relPath);
        }
      }
    };

    await walk(projectPath);

    context.structure = {
      files: files.slice(0, 1000), // Limit to 1000 files
      directories: directories.slice(0, 500) // Limit to 500 directories
    };
  }

  /**
   * Get project context
   */
  getProject(projectId: string): ProjectContext | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Update project context
   */
  updateProject(projectId: string, updates: Partial<ProjectContext>): void {
    const context = this.projects.get(projectId);
    if (context) {
      Object.assign(context, updates);
      this.saveToDisk();
    }
  }

  /**
   * Get or create user preferences
   */
  getUserPreferences(userId: string): UserPreferences {
    let prefs = this.userPreferences.get(userId);
    if (!prefs) {
      prefs = {
        userId,
        codeStyle: {
          indentation: 'spaces',
          indentSize: 2,
          quotes: 'single',
          semicolons: true
        },
        aiSettings: {
          model: 'claude-3-5-sonnet-20241022',
          temperature: 0.7,
          maxTokens: 4096
        }
      };
      this.userPreferences.set(userId, prefs);
      this.saveToDisk();
    }
    return prefs;
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, updates: Partial<UserPreferences>): void {
    const prefs = this.getUserPreferences(userId);
    Object.assign(prefs, updates);
    this.saveToDisk();
  }

  /**
   * Create conversation memory
   */
  createConversationMemory(conversationId: string, projectId: string): ConversationMemory {
    const memory: ConversationMemory = {
      conversationId,
      projectId,
      decisions: [],
      fileChanges: [],
      commands: []
    };
    this.conversationMemory.set(conversationId, memory);
    return memory;
  }

  /**
   * Get conversation memory
   */
  getConversationMemory(conversationId: string): ConversationMemory | undefined {
    return this.conversationMemory.get(conversationId);
  }

  /**
   * Add decision to conversation memory
   */
  addDecision(conversationId: string, question: string, answer: string): void {
    const memory = this.conversationMemory.get(conversationId);
    if (memory) {
      memory.decisions.push({
        question,
        answer,
        timestamp: new Date()
      });
      this.saveToDisk();
    }
  }

  /**
   * Record file change
   */
  recordFileChange(conversationId: string, file: string, action: 'created' | 'modified' | 'deleted'): void {
    const memory = this.conversationMemory.get(conversationId);
    if (memory) {
      memory.fileChanges.push({
        file,
        action,
        timestamp: new Date()
      });
      this.saveToDisk();
    }
  }

  /**
   * Record command execution
   */
  recordCommand(conversationId: string, command: string, success: boolean): void {
    const memory = this.conversationMemory.get(conversationId);
    if (memory) {
      memory.commands.push({
        command,
        success,
        timestamp: new Date()
      });
      this.saveToDisk();
    }
  }

  /**
   * Generate context summary for AI
   */
  generateContextSummary(conversationId: string): string {
    const memory = this.conversationMemory.get(conversationId);
    if (!memory) {
      return '';
    }

    const project = this.projects.get(memory.projectId);
    if (!project) {
      return '';
    }

    let summary = `## Project Context\n\n`;
    summary += `**Name:** ${project.name}\n`;
    summary += `**Framework:** ${project.framework || 'Unknown'}\n`;
    summary += `**Language:** ${project.language || 'Unknown'}\n`;
    summary += `**Package Manager:** ${project.packageManager || 'Unknown'}\n\n`;

    if (memory.decisions.length > 0) {
      summary += `## Previous Decisions\n\n`;
      memory.decisions.slice(-5).forEach(d => {
        summary += `- **Q:** ${d.question}\n  **A:** ${d.answer}\n`;
      });
      summary += '\n';
    }

    if (memory.fileChanges.length > 0) {
      summary += `## Recent File Changes\n\n`;
      memory.fileChanges.slice(-10).forEach(fc => {
        summary += `- ${fc.action}: ${fc.file}\n`;
      });
      summary += '\n';
    }

    return summary;
  }

  /**
   * Save data to disk
   */
  private async saveToDisk(): Promise<void> {
    try {
      const data = {
        projects: Array.from(this.projects.entries()),
        userPreferences: Array.from(this.userPreferences.entries()),
        conversationMemory: Array.from(this.conversationMemory.entries())
      };

      await fs.writeFile(
        path.join(this.cacheDir, 'context.json'),
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.error('Failed to save context to disk:', error);
    }
  }

  /**
   * Load data from disk
   */
  async loadFromDisk(): Promise<void> {
    try {
      const dataPath = path.join(this.cacheDir, 'context.json');
      const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));

      this.projects = new Map(data.projects);
      this.userPreferences = new Map(data.userPreferences);
      this.conversationMemory = new Map(data.conversationMemory);

      console.log('✅ Loaded context from disk');
    } catch (error) {
      // File doesn't exist yet or parse error
      console.log('No cached context found, starting fresh');
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.projects.clear();
    this.userPreferences.clear();
    this.conversationMemory.clear();
    this.saveToDisk();
  }
}
