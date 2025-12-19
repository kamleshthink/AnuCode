/**
 * Terminal MCP Server
 * Handles command execution for the AI agent
 */

import { spawn, exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { MCPServer, MCPToolCall, MCPToolResult } from './types';

interface RunningProcess {
  id: string;
  command: string;
  process: any;
  output: string[];
  exitCode: number | null;
  startTime: Date;
  endTime: Date | null;
}

export class TerminalMCP extends MCPServer {
  private workspaceRoot: string;
  private runningProcesses: Map<string, RunningProcess> = new Map();
  private commandHistory: Array<{ command: string; timestamp: Date; exitCode: number }> = [];

  constructor(workspaceRoot: string) {
    super('terminal', '1.0.0');
    this.workspaceRoot = workspaceRoot;
    this.initializeTools();
  }

  private initializeTools() {
    // Execute command (blocking)
    this.registerTool({
      name: 'terminal_execute',
      description: 'Execute a shell command and wait for completion',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' },
          timeout: { type: 'number', description: 'Timeout in milliseconds', default: 30000 },
          shell: { type: 'string', description: 'Shell to use', default: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh' }
        },
        required: ['command']
      }
    });

    // Execute command (non-blocking)
    this.registerTool({
      name: 'terminal_spawn',
      description: 'Spawn a command without waiting for completion',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' },
          args: {
            type: 'array',
            items: { type: 'string' },
            description: 'Command arguments',
            default: []
          }
        },
        required: ['command']
      }
    });

    // Get process output
    this.registerTool({
      name: 'terminal_get_output',
      description: 'Get output from a running or completed process',
      parameters: {
        type: 'object',
        properties: {
          processId: { type: 'string', description: 'Process ID from spawn' }
        },
        required: ['processId']
      }
    });

    // Kill process
    this.registerTool({
      name: 'terminal_kill',
      description: 'Kill a running process',
      parameters: {
        type: 'object',
        properties: {
          processId: { type: 'string', description: 'Process ID to kill' },
          signal: { type: 'string', description: 'Signal to send', default: 'SIGTERM' }
        },
        required: ['processId']
      }
    });

    // List running processes
    this.registerTool({
      name: 'terminal_list_processes',
      description: 'List all running processes managed by this terminal',
      parameters: {
        type: 'object',
        properties: {}
      }
    });

    // Get command history
    this.registerTool({
      name: 'terminal_history',
      description: 'Get command execution history',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of commands to return', default: 10 }
        }
      }
    });

    // Clear terminal history
    this.registerTool({
      name: 'terminal_clear_history',
      description: 'Clear command history',
      parameters: {
        type: 'object',
        properties: {}
      }
    });

    // Check if command exists
    this.registerTool({
      name: 'terminal_which',
      description: 'Check if a command exists in PATH',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command name to check' }
        },
        required: ['command']
      }
    });
  }

  async handleToolCall(toolCall: MCPToolCall): Promise<MCPToolResult> {
    try {
      switch (toolCall.name) {
        case 'terminal_execute':
          return await this.execute(toolCall.arguments);

        case 'terminal_spawn':
          return await this.spawnProcess(toolCall.arguments);

        case 'terminal_get_output':
          return await this.getOutput(toolCall.arguments);

        case 'terminal_kill':
          return await this.killProcess(toolCall.arguments);

        case 'terminal_list_processes':
          return await this.listProcesses();

        case 'terminal_history':
          return await this.getHistory(toolCall.arguments);

        case 'terminal_clear_history':
          return await this.clearHistory();

        case 'terminal_which':
          return await this.which(toolCall.arguments);

        default:
          return {
            success: false,
            error: `Unknown tool: ${toolCall.name}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Terminal operation failed'
      };
    }
  }

  private async execute(args: any): Promise<MCPToolResult> {
    return new Promise((resolve) => {
      const timeout = args.timeout || 30000;
      const shell = args.shell || (process.platform === 'win32' ? 'cmd.exe' : '/bin/sh');

      const execOptions = {
        cwd: this.workspaceRoot,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        shell
      };

      const startTime = new Date();

      exec(args.command, execOptions, (error, stdout, stderr) => {
        const endTime = new Date();
        const exitCode = error ? error.code || 1 : 0;

        // Add to history
        this.commandHistory.push({
          command: args.command,
          timestamp: startTime,
          exitCode
        });

        // Keep only last 100 commands
        if (this.commandHistory.length > 100) {
          this.commandHistory.shift();
        }

        resolve({
          success: exitCode === 0,
          data: {
            command: args.command,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode,
            duration: endTime.getTime() - startTime.getTime()
          },
          error: exitCode !== 0 ? `Command exited with code ${exitCode}` : undefined
        });
      });
    });
  }

  private async spawnProcess(args: any): Promise<MCPToolResult> {
    const processId = uuidv4();
    const commandArgs = args.args || [];

    // Parse command if it contains spaces and no explicit args
    let command = args.command;
    let finalArgs = commandArgs;

    if (commandArgs.length === 0 && command.includes(' ')) {
      const parts = command.split(' ');
      command = parts[0];
      finalArgs = parts.slice(1);
    }

    const child = spawn(command, finalArgs, {
      cwd: this.workspaceRoot,
      shell: true
    });

    const runningProcess: RunningProcess = {
      id: processId,
      command: args.command,
      process: child,
      output: [],
      exitCode: null,
      startTime: new Date(),
      endTime: null
    };

    // Capture stdout
    child.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      runningProcess.output.push(text);
    });

    // Capture stderr
    child.stderr?.on('data', (data: Buffer) => {
      const text = `[stderr] ${data.toString()}`;
      runningProcess.output.push(text);
    });

    // Handle exit
    child.on('exit', (code: number) => {
      runningProcess.exitCode = code;
      runningProcess.endTime = new Date();

      // Add to history
      this.commandHistory.push({
        command: args.command,
        timestamp: runningProcess.startTime,
        exitCode: code
      });

      // Clean up after 5 minutes
      setTimeout(() => {
        this.runningProcesses.delete(processId);
      }, 5 * 60 * 1000);
    });

    this.runningProcesses.set(processId, runningProcess);

    return {
      success: true,
      data: {
        processId,
        command: args.command,
        message: 'Process spawned successfully'
      }
    };
  }

  private async getOutput(args: any): Promise<MCPToolResult> {
    const process = this.runningProcesses.get(args.processId);

    if (!process) {
      return {
        success: false,
        error: `Process not found: ${args.processId}`
      };
    }

    return {
      success: true,
      data: {
        processId: args.processId,
        command: process.command,
        output: process.output.join(''),
        exitCode: process.exitCode,
        isRunning: process.exitCode === null,
        startTime: process.startTime,
        endTime: process.endTime,
        duration: process.endTime
          ? process.endTime.getTime() - process.startTime.getTime()
          : Date.now() - process.startTime.getTime()
      }
    };
  }

  private async killProcess(args: any): Promise<MCPToolResult> {
    const process = this.runningProcesses.get(args.processId);

    if (!process) {
      return {
        success: false,
        error: `Process not found: ${args.processId}`
      };
    }

    if (process.exitCode !== null) {
      return {
        success: false,
        error: 'Process already exited'
      };
    }

    const signal = args.signal || 'SIGTERM';
    process.process.kill(signal);

    return {
      success: true,
      data: {
        processId: args.processId,
        command: process.command,
        signal,
        message: 'Process killed successfully'
      }
    };
  }

  private async listProcesses(): Promise<MCPToolResult> {
    const processes = Array.from(this.runningProcesses.values())
      .filter(p => p.exitCode === null)
      .map(p => ({
        processId: p.id,
        command: p.command,
        startTime: p.startTime,
        duration: Date.now() - p.startTime.getTime()
      }));

    return {
      success: true,
      data: {
        processes,
        count: processes.length
      }
    };
  }

  private async getHistory(args: any): Promise<MCPToolResult> {
    const limit = args.limit || 10;
    const history = this.commandHistory.slice(-limit).reverse();

    return {
      success: true,
      data: {
        history: history.map(h => ({
          command: h.command,
          timestamp: h.timestamp,
          exitCode: h.exitCode
        })),
        total: this.commandHistory.length
      }
    };
  }

  private async clearHistory(): Promise<MCPToolResult> {
    const count = this.commandHistory.length;
    this.commandHistory = [];

    return {
      success: true,
      data: {
        message: `Cleared ${count} command(s) from history`
      }
    };
  }

  private async which(args: any): Promise<MCPToolResult> {
    const whichCommand = process.platform === 'win32' ? 'where' : 'which';

    return new Promise((resolve) => {
      exec(`${whichCommand} ${args.command}`, { cwd: this.workspaceRoot }, (error, stdout) => {
        const found = !error && stdout.trim().length > 0;

        resolve({
          success: true,
          data: {
            command: args.command,
            found,
            path: found ? stdout.trim() : null
          }
        });
      });
    });
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

  /**
   * Cleanup all running processes
   */
  async cleanup(): Promise<void> {
    for (const [processId, process] of this.runningProcesses) {
      if (process.exitCode === null) {
        try {
          process.process.kill('SIGTERM');
        } catch (error) {
          console.error(`Failed to kill process ${processId}:`, error);
        }
      }
    }
    this.runningProcesses.clear();
  }
}
