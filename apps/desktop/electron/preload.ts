import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),

  // File system operations (will be implemented later with MCP)
  fs: {
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', path, content),
    readDir: (path: string) => ipcRenderer.invoke('fs:readDir', path),
  },

  // Terminal operations
  terminal: {
    spawn: (cwd: string) => ipcRenderer.invoke('terminal:spawn', cwd),
    write: (id: string, data: string) =>
      ipcRenderer.invoke('terminal:write', id, data),
    onData: (callback: (data: any) => void) =>
      ipcRenderer.on('terminal:data', (_, data) => callback(data)),
  },

  // Git operations
  git: {
    status: (path: string) => ipcRenderer.invoke('git:status', path),
    commit: (path: string, message: string) =>
      ipcRenderer.invoke('git:commit', path, message),
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      fs: {
        readFile: (path: string) => Promise<string>;
        writeFile: (path: string, content: string) => Promise<void>;
        readDir: (path: string) => Promise<string[]>;
      };
      terminal: {
        spawn: (cwd: string) => Promise<string>;
        write: (id: string, data: string) => Promise<void>;
        onData: (callback: (data: any) => void) => void;
      };
      git: {
        status: (path: string) => Promise<any>;
        commit: (path: string, message: string) => Promise<void>;
      };
    };
  }
}
