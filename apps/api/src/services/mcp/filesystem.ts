/**
 * File System MCP Server
 * Handles all file system operations for the AI agent
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync, statSync, watch } from 'fs';
import { glob as globCallback } from 'glob';
import { promisify } from 'util';
import { MCPServer, MCPToolCall, MCPToolResult } from './types';

const glob = promisify(globCallback);

export class FileSystemMCP extends MCPServer {
  private workspaceRoot: string;
  private watchers: Map<string, any> = new Map();

  constructor(workspaceRoot: string) {
    super('filesystem', '1.0.0');
    this.workspaceRoot = workspaceRoot;
    this.initializeTools();
  }

  private initializeTools() {
    // Read file tool
    this.registerTool({
      name: 'fs_read_file',
      description: 'Read contents of a file',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to the file' },
          encoding: { type: 'string', description: 'File encoding (default: utf-8)', default: 'utf-8' }
        },
        required: ['path']
      }
    });

    // Write file tool
    this.registerTool({
      name: 'fs_write_file',
      description: 'Write content to a file (creates if doesn\'t exist)',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to the file' },
          content: { type: 'string', description: 'Content to write' },
          encoding: { type: 'string', description: 'File encoding (default: utf-8)', default: 'utf-8' }
        },
        required: ['path', 'content']
      }
    });

    // Create directory tool
    this.registerTool({
      name: 'fs_create_directory',
      description: 'Create a new directory (recursive)',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to the directory' }
        },
        required: ['path']
      }
    });

    // Delete file/directory tool
    this.registerTool({
      name: 'fs_delete',
      description: 'Delete a file or directory',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to delete' },
          recursive: { type: 'boolean', description: 'Delete recursively (for directories)', default: false }
        },
        required: ['path']
      }
    });

    // List directory tool
    this.registerTool({
      name: 'fs_list_directory',
      description: 'List contents of a directory',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to the directory', default: '.' },
          recursive: { type: 'boolean', description: 'List recursively', default: false }
        }
      }
    });

    // File exists tool
    this.registerTool({
      name: 'fs_exists',
      description: 'Check if a file or directory exists',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to check' }
        },
        required: ['path']
      }
    });

    // File stats tool
    this.registerTool({
      name: 'fs_stat',
      description: 'Get file or directory statistics',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path' }
        },
        required: ['path']
      }
    });

    // Search files tool
    this.registerTool({
      name: 'fs_search',
      description: 'Search for files matching a pattern (glob)',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Glob pattern (e.g., **/*.ts)' },
          cwd: { type: 'string', description: 'Current working directory', default: '.' }
        },
        required: ['pattern']
      }
    });

    // Move/rename file tool
    this.registerTool({
      name: 'fs_move',
      description: 'Move or rename a file/directory',
      parameters: {
        type: 'object',
        properties: {
          from: { type: 'string', description: 'Source path' },
          to: { type: 'string', description: 'Destination path' }
        },
        required: ['from', 'to']
      }
    });

    // Copy file tool
    this.registerTool({
      name: 'fs_copy',
      description: 'Copy a file or directory',
      parameters: {
        type: 'object',
        properties: {
          from: { type: 'string', description: 'Source path' },
          to: { type: 'string', description: 'Destination path' },
          recursive: { type: 'boolean', description: 'Copy recursively', default: false }
        },
        required: ['from', 'to']
      }
    });
  }

  private resolvePath(relativePath: string): string {
    const resolved = path.resolve(this.workspaceRoot, relativePath);
    // Security check: ensure path is within workspace
    if (!resolved.startsWith(this.workspaceRoot)) {
      throw new Error('Path traversal detected - access denied');
    }
    return resolved;
  }

  async handleToolCall(toolCall: MCPToolCall): Promise<MCPToolResult> {
    try {
      switch (toolCall.name) {
        case 'fs_read_file':
          return await this.readFile(toolCall.arguments);

        case 'fs_write_file':
          return await this.writeFile(toolCall.arguments);

        case 'fs_create_directory':
          return await this.createDirectory(toolCall.arguments);

        case 'fs_delete':
          return await this.delete(toolCall.arguments);

        case 'fs_list_directory':
          return await this.listDirectory(toolCall.arguments);

        case 'fs_exists':
          return await this.exists(toolCall.arguments);

        case 'fs_stat':
          return await this.stat(toolCall.arguments);

        case 'fs_search':
          return await this.search(toolCall.arguments);

        case 'fs_move':
          return await this.move(toolCall.arguments);

        case 'fs_copy':
          return await this.copy(toolCall.arguments);

        default:
          return {
            success: false,
            error: `Unknown tool: ${toolCall.name}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  private async readFile(args: any): Promise<MCPToolResult> {
    const filePath = this.resolvePath(args.path);
    const encoding = args.encoding || 'utf-8';

    const content = await fs.readFile(filePath, encoding);

    return {
      success: true,
      data: {
        content,
        path: args.path,
        size: content.length
      }
    };
  }

  private async writeFile(args: any): Promise<MCPToolResult> {
    const filePath = this.resolvePath(args.path);
    const encoding = args.encoding || 'utf-8';

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, args.content, encoding);

    return {
      success: true,
      data: {
        path: args.path,
        size: args.content.length
      }
    };
  }

  private async createDirectory(args: any): Promise<MCPToolResult> {
    const dirPath = this.resolvePath(args.path);

    await fs.mkdir(dirPath, { recursive: true });

    return {
      success: true,
      data: {
        path: args.path
      }
    };
  }

  private async delete(args: any): Promise<MCPToolResult> {
    const targetPath = this.resolvePath(args.path);

    const stats = await fs.stat(targetPath);

    if (stats.isDirectory()) {
      await fs.rm(targetPath, { recursive: args.recursive || false, force: true });
    } else {
      await fs.unlink(targetPath);
    }

    return {
      success: true,
      data: {
        path: args.path,
        type: stats.isDirectory() ? 'directory' : 'file'
      }
    };
  }

  private async listDirectory(args: any): Promise<MCPToolResult> {
    const dirPath = this.resolvePath(args.path || '.');

    if (args.recursive) {
      // Recursive listing using glob
      const files = await glob('**/*', {
        cwd: dirPath,
        dot: true,
        nodir: false
      });

      const items = await Promise.all(
        files.map(async (file) => {
          const fullPath = path.join(dirPath, file);
          const stats = await fs.stat(fullPath);
          return {
            name: file,
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime
          };
        })
      );

      return {
        success: true,
        data: {
          path: args.path || '.',
          items,
          count: items.length
        }
      };
    } else {
      // Non-recursive listing
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      const items = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          const stats = await fs.stat(fullPath);
          return {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime
          };
        })
      );

      return {
        success: true,
        data: {
          path: args.path || '.',
          items,
          count: items.length
        }
      };
    }
  }

  private async exists(args: any): Promise<MCPToolResult> {
    const targetPath = this.resolvePath(args.path);
    const exists = existsSync(targetPath);

    return {
      success: true,
      data: {
        path: args.path,
        exists
      }
    };
  }

  private async stat(args: any): Promise<MCPToolResult> {
    const targetPath = this.resolvePath(args.path);
    const stats = await fs.stat(targetPath);

    return {
      success: true,
      data: {
        path: args.path,
        size: stats.size,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime
      }
    };
  }

  private async search(args: any): Promise<MCPToolResult> {
    const searchPath = this.resolvePath(args.cwd || '.');

    const files = await glob(args.pattern, {
      cwd: searchPath,
      absolute: false,
      dot: true
    });

    return {
      success: true,
      data: {
        pattern: args.pattern,
        matches: files,
        count: files.length
      }
    };
  }

  private async move(args: any): Promise<MCPToolResult> {
    const fromPath = this.resolvePath(args.from);
    const toPath = this.resolvePath(args.to);

    // Ensure destination directory exists
    const destDir = path.dirname(toPath);
    await fs.mkdir(destDir, { recursive: true });

    await fs.rename(fromPath, toPath);

    return {
      success: true,
      data: {
        from: args.from,
        to: args.to
      }
    };
  }

  private async copy(args: any): Promise<MCPToolResult> {
    const fromPath = this.resolvePath(args.from);
    const toPath = this.resolvePath(args.to);

    // Ensure destination directory exists
    const destDir = path.dirname(toPath);
    await fs.mkdir(destDir, { recursive: true });

    const stats = await fs.stat(fromPath);

    if (stats.isDirectory()) {
      if (!args.recursive) {
        throw new Error('Cannot copy directory without recursive flag');
      }
      await this.copyDirectory(fromPath, toPath);
    } else {
      await fs.copyFile(fromPath, toPath);
    }

    return {
      success: true,
      data: {
        from: args.from,
        to: args.to,
        type: stats.isDirectory() ? 'directory' : 'file'
      }
    };
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Set workspace root (useful for changing projects)
   */
  setWorkspaceRoot(newRoot: string) {
    this.workspaceRoot = newRoot;
  }

  /**
   * Get current workspace root
   */
  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }
}
