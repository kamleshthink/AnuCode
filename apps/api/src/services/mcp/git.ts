/**
 * Git MCP Server
 * Handles all Git operations for the AI agent
 */

import { simpleGit, SimpleGit, StatusResult, DiffResult, LogResult } from 'simple-git';
import path from 'path';
import { MCPServer, MCPToolCall, MCPToolResult } from './types';

export class GitMCP extends MCPServer {
  private git: SimpleGit;
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    super('git', '1.0.0');
    this.workspaceRoot = workspaceRoot;
    this.git = simpleGit(workspaceRoot);
    this.initializeTools();
  }

  private initializeTools() {
    // Git status
    this.registerTool({
      name: 'git_status',
      description: 'Get the current git status',
      parameters: {
        type: 'object',
        properties: {}
      }
    });

    // Git init
    this.registerTool({
      name: 'git_init',
      description: 'Initialize a new git repository',
      parameters: {
        type: 'object',
        properties: {
          bare: { type: 'boolean', description: 'Initialize bare repository', default: false }
        }
      }
    });

    // Git add
    this.registerTool({
      name: 'git_add',
      description: 'Add files to staging area',
      parameters: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'Files to add (use "." for all)'
          }
        },
        required: ['files']
      }
    });

    // Git commit
    this.registerTool({
      name: 'git_commit',
      description: 'Commit staged changes',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Commit message' },
          amend: { type: 'boolean', description: 'Amend previous commit', default: false }
        },
        required: ['message']
      }
    });

    // Git push
    this.registerTool({
      name: 'git_push',
      description: 'Push commits to remote',
      parameters: {
        type: 'object',
        properties: {
          remote: { type: 'string', description: 'Remote name', default: 'origin' },
          branch: { type: 'string', description: 'Branch name (current if not specified)' },
          force: { type: 'boolean', description: 'Force push', default: false }
        }
      }
    });

    // Git pull
    this.registerTool({
      name: 'git_pull',
      description: 'Pull changes from remote',
      parameters: {
        type: 'object',
        properties: {
          remote: { type: 'string', description: 'Remote name', default: 'origin' },
          branch: { type: 'string', description: 'Branch name (current if not specified)' }
        }
      }
    });

    // Git diff
    this.registerTool({
      name: 'git_diff',
      description: 'Show differences between commits, working tree, etc.',
      parameters: {
        type: 'object',
        properties: {
          from: { type: 'string', description: 'From commit/branch' },
          to: { type: 'string', description: 'To commit/branch' },
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific files to diff'
          },
          staged: { type: 'boolean', description: 'Show staged changes only', default: false }
        }
      }
    });

    // Git log
    this.registerTool({
      name: 'git_log',
      description: 'Show commit history',
      parameters: {
        type: 'object',
        properties: {
          maxCount: { type: 'number', description: 'Maximum number of commits', default: 10 },
          file: { type: 'string', description: 'Show log for specific file' }
        }
      }
    });

    // Git branch
    this.registerTool({
      name: 'git_branch',
      description: 'List, create, or delete branches',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'create', 'delete'],
            description: 'Branch action',
            default: 'list'
          },
          name: { type: 'string', description: 'Branch name (for create/delete)' },
          force: { type: 'boolean', description: 'Force delete', default: false }
        }
      }
    });

    // Git checkout
    this.registerTool({
      name: 'git_checkout',
      description: 'Switch branches or restore files',
      parameters: {
        type: 'object',
        properties: {
          branch: { type: 'string', description: 'Branch name to checkout' },
          create: { type: 'boolean', description: 'Create new branch', default: false },
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'Files to checkout (restore)'
          }
        }
      }
    });

    // Git clone
    this.registerTool({
      name: 'git_clone',
      description: 'Clone a repository',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Repository URL' },
          directory: { type: 'string', description: 'Target directory' }
        },
        required: ['url']
      }
    });

    // Git remote
    this.registerTool({
      name: 'git_remote',
      description: 'Manage remote repositories',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'add', 'remove'],
            description: 'Remote action',
            default: 'list'
          },
          name: { type: 'string', description: 'Remote name' },
          url: { type: 'string', description: 'Remote URL (for add)' }
        }
      }
    });

    // Git stash
    this.registerTool({
      name: 'git_stash',
      description: 'Stash changes in working directory',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['save', 'pop', 'list', 'clear'],
            description: 'Stash action',
            default: 'save'
          },
          message: { type: 'string', description: 'Stash message (for save)' }
        }
      }
    });

    // Git reset
    this.registerTool({
      name: 'git_reset',
      description: 'Reset current HEAD to specified state',
      parameters: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['soft', 'mixed', 'hard'],
            description: 'Reset mode',
            default: 'mixed'
          },
          commit: { type: 'string', description: 'Commit to reset to', default: 'HEAD' },
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific files to reset'
          }
        }
      }
    });
  }

  async handleToolCall(toolCall: MCPToolCall): Promise<MCPToolResult> {
    try {
      switch (toolCall.name) {
        case 'git_status':
          return await this.status();

        case 'git_init':
          return await this.init(toolCall.arguments);

        case 'git_add':
          return await this.add(toolCall.arguments);

        case 'git_commit':
          return await this.commit(toolCall.arguments);

        case 'git_push':
          return await this.push(toolCall.arguments);

        case 'git_pull':
          return await this.pull(toolCall.arguments);

        case 'git_diff':
          return await this.diff(toolCall.arguments);

        case 'git_log':
          return await this.log(toolCall.arguments);

        case 'git_branch':
          return await this.branch(toolCall.arguments);

        case 'git_checkout':
          return await this.checkout(toolCall.arguments);

        case 'git_clone':
          return await this.clone(toolCall.arguments);

        case 'git_remote':
          return await this.remote(toolCall.arguments);

        case 'git_stash':
          return await this.stash(toolCall.arguments);

        case 'git_reset':
          return await this.reset(toolCall.arguments);

        default:
          return {
            success: false,
            error: `Unknown tool: ${toolCall.name}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Git operation failed'
      };
    }
  }

  private async status(): Promise<MCPToolResult> {
    const status = await this.git.status();

    return {
      success: true,
      data: {
        current: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        staged: status.staged,
        modified: status.modified,
        deleted: status.deleted,
        not_added: status.not_added,
        conflicted: status.conflicted,
        isClean: status.isClean()
      }
    };
  }

  private async init(args: any): Promise<MCPToolResult> {
    await this.git.init(args.bare || false);

    return {
      success: true,
      data: {
        message: 'Git repository initialized',
        bare: args.bare || false
      }
    };
  }

  private async add(args: any): Promise<MCPToolResult> {
    await this.git.add(args.files);

    return {
      success: true,
      data: {
        files: args.files,
        message: `Added ${args.files.length} file(s) to staging`
      }
    };
  }

  private async commit(args: any): Promise<MCPToolResult> {
    const options: any = {};
    if (args.amend) {
      options['--amend'] = null;
    }

    const result = await this.git.commit(args.message, undefined, options);

    return {
      success: true,
      data: {
        commit: result.commit,
        summary: result.summary,
        message: args.message,
        branch: result.branch
      }
    };
  }

  private async push(args: any): Promise<MCPToolResult> {
    const remote = args.remote || 'origin';
    const branch = args.branch || (await this.git.status()).current;

    const options: any = {};
    if (args.force) {
      options['--force'] = null;
    }

    await this.git.push(remote, branch, options);

    return {
      success: true,
      data: {
        remote,
        branch,
        message: `Pushed to ${remote}/${branch}`
      }
    };
  }

  private async pull(args: any): Promise<MCPToolResult> {
    const remote = args.remote || 'origin';
    const branch = args.branch || (await this.git.status()).current;

    const result = await this.git.pull(remote, branch);

    return {
      success: true,
      data: {
        remote,
        branch,
        summary: result.summary,
        files: result.files
      }
    };
  }

  private async diff(args: any): Promise<MCPToolResult> {
    let diffResult: string;

    if (args.staged) {
      diffResult = await this.git.diff(['--cached', ...(args.files || [])]);
    } else if (args.from && args.to) {
      diffResult = await this.git.diff([args.from, args.to, ...(args.files || [])]);
    } else {
      diffResult = await this.git.diff(args.files);
    }

    return {
      success: true,
      data: {
        diff: diffResult,
        files: args.files || null
      }
    };
  }

  private async log(args: any): Promise<MCPToolResult> {
    const options: any = {
      maxCount: args.maxCount || 10
    };

    if (args.file) {
      options.file = args.file;
    }

    const log = await this.git.log(options);

    return {
      success: true,
      data: {
        total: log.total,
        latest: log.latest,
        commits: log.all.map(commit => ({
          hash: commit.hash,
          date: commit.date,
          message: commit.message,
          author_name: commit.author_name,
          author_email: commit.author_email
        }))
      }
    };
  }

  private async branch(args: any): Promise<MCPToolResult> {
    const action = args.action || 'list';

    switch (action) {
      case 'list': {
        const branches = await this.git.branch();
        return {
          success: true,
          data: {
            all: branches.all,
            current: branches.current,
            branches: branches.branches
          }
        };
      }

      case 'create': {
        if (!args.name) {
          throw new Error('Branch name required for create action');
        }
        await this.git.branch([args.name]);
        return {
          success: true,
          data: {
            name: args.name,
            message: `Created branch ${args.name}`
          }
        };
      }

      case 'delete': {
        if (!args.name) {
          throw new Error('Branch name required for delete action');
        }
        const deleteFlag = args.force ? '-D' : '-d';
        await this.git.branch([deleteFlag, args.name]);
        return {
          success: true,
          data: {
            name: args.name,
            message: `Deleted branch ${args.name}`
          }
        };
      }

      default:
        throw new Error(`Unknown branch action: ${action}`);
    }
  }

  private async checkout(args: any): Promise<MCPToolResult> {
    if (args.files && args.files.length > 0) {
      // Checkout specific files
      await this.git.checkout(args.files);
      return {
        success: true,
        data: {
          files: args.files,
          message: `Restored ${args.files.length} file(s)`
        }
      };
    } else if (args.branch) {
      // Checkout branch
      const options: string[] = [];
      if (args.create) {
        options.push('-b');
      }
      options.push(args.branch);

      await this.git.checkout(options);
      return {
        success: true,
        data: {
          branch: args.branch,
          created: args.create || false,
          message: args.create ? `Created and switched to ${args.branch}` : `Switched to ${args.branch}`
        }
      };
    } else {
      throw new Error('Either branch or files must be specified');
    }
  }

  private async clone(args: any): Promise<MCPToolResult> {
    const targetDir = args.directory || path.basename(args.url, '.git');
    const targetPath = path.join(this.workspaceRoot, targetDir);

    await this.git.clone(args.url, targetPath);

    return {
      success: true,
      data: {
        url: args.url,
        directory: targetDir,
        path: targetPath,
        message: `Cloned repository to ${targetDir}`
      }
    };
  }

  private async remote(args: any): Promise<MCPToolResult> {
    const action = args.action || 'list';

    switch (action) {
      case 'list': {
        const remotes = await this.git.getRemotes(true);
        return {
          success: true,
          data: {
            remotes: remotes.map(r => ({
              name: r.name,
              fetch: r.refs.fetch,
              push: r.refs.push
            }))
          }
        };
      }

      case 'add': {
        if (!args.name || !args.url) {
          throw new Error('Name and URL required for add action');
        }
        await this.git.addRemote(args.name, args.url);
        return {
          success: true,
          data: {
            name: args.name,
            url: args.url,
            message: `Added remote ${args.name}`
          }
        };
      }

      case 'remove': {
        if (!args.name) {
          throw new Error('Name required for remove action');
        }
        await this.git.removeRemote(args.name);
        return {
          success: true,
          data: {
            name: args.name,
            message: `Removed remote ${args.name}`
          }
        };
      }

      default:
        throw new Error(`Unknown remote action: ${action}`);
    }
  }

  private async stash(args: any): Promise<MCPToolResult> {
    const action = args.action || 'save';

    switch (action) {
      case 'save': {
        await this.git.stash(['save', args.message || 'WIP']);
        return {
          success: true,
          data: {
            message: args.message || 'WIP',
            action: 'Stashed changes'
          }
        };
      }

      case 'pop': {
        await this.git.stash(['pop']);
        return {
          success: true,
          data: {
            action: 'Popped latest stash'
          }
        };
      }

      case 'list': {
        const stashList = await this.git.stashList();
        return {
          success: true,
          data: {
            stashes: stashList.all
          }
        };
      }

      case 'clear': {
        await this.git.stash(['clear']);
        return {
          success: true,
          data: {
            action: 'Cleared all stashes'
          }
        };
      }

      default:
        throw new Error(`Unknown stash action: ${action}`);
    }
  }

  private async reset(args: any): Promise<MCPToolResult> {
    const mode = args.mode || 'mixed';
    const commit = args.commit || 'HEAD';

    if (args.files && args.files.length > 0) {
      // Reset specific files
      await this.git.reset(['HEAD', '--', ...args.files]);
      return {
        success: true,
        data: {
          files: args.files,
          message: `Reset ${args.files.length} file(s)`
        }
      };
    } else {
      // Reset to commit
      const resetMode = `--${mode}`;
      await this.git.reset([resetMode, commit]);
      return {
        success: true,
        data: {
          mode,
          commit,
          message: `Reset to ${commit} (${mode})`
        }
      };
    }
  }

  /**
   * Set workspace root (useful for changing projects)
   */
  setWorkspaceRoot(newRoot: string) {
    this.workspaceRoot = newRoot;
    this.git = simpleGit(newRoot);
  }

  /**
   * Get current workspace root
   */
  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }
}
