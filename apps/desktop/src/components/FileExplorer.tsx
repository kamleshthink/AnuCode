import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { socketService } from '../lib/socket';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  expanded?: boolean;
}

export default function FileExplorer() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspacePath] = useState('D:\\NEXUS AI');

  useEffect(() => {
    loadWorkspaceFiles();
  }, []);

  const loadWorkspaceFiles = async () => {
    setLoading(true);

    // Set timeout to fallback to static structure
    const fallbackTimer = setTimeout(() => {
      setFiles([
        {
          name: 'apps',
          path: 'D:\\NEXUS AI\\apps',
          type: 'directory',
          expanded: false,
          children: [
            { name: 'desktop', path: 'D:\\NEXUS AI\\apps\\desktop', type: 'directory', children: [] },
            { name: 'api', path: 'D:\\NEXUS AI\\apps\\api', type: 'directory', children: [] }
          ]
        },
        {
          name: 'packages',
          path: 'D:\\NEXUS AI\\packages',
          type: 'directory',
          expanded: false,
          children: []
        },
        { name: 'package.json', path: 'D:\\NEXUS AI\\package.json', type: 'file' },
        { name: 'README.md', path: 'D:\\NEXUS AI\\README.md', type: 'file' },
        { name: 'HOW_TO_RUN.md', path: 'D:\\NEXUS AI\\HOW_TO_RUN.md', type: 'file' }
      ]);
      setLoading(false);
    }, 1000);

    try {
      const socket = socketService.getSocket();

      // Request file list from backend via MCP
      socket.emit('mcp:execute-tool', {
        server: 'filesystem',
        tool: 'fs_list_directory',
        args: { path: workspacePath, recursive: false }
      });

      socket.once('mcp:tool-result', (result: any) => {
        clearTimeout(fallbackTimer);
        if (result.success && result.data) {
          const fileList = result.data.map((item: any) => ({
            name: item.name,
            path: item.path,
            type: item.type,
            children: item.type === 'directory' ? [] : undefined,
            expanded: false
          }));
          setFiles(fileList);
        }
        setLoading(false);
      });
    } catch (error) {
      console.warn('Backend connection not available, using static file tree');
    }
  };

  const toggleDirectory = async (node: FileNode, index: number) => {
    if (node.type !== 'directory') return;

    const newFiles = [...files];
    const updateNode = (nodes: FileNode[], path: string): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].path === path) {
          nodes[i].expanded = !nodes[i].expanded;

          // Load children if not loaded
          if (nodes[i].expanded && (!nodes[i].children || nodes[i].children!.length === 0)) {
            const socket = socketService.getSocket();
            socket.emit('mcp:execute-tool', {
              server: 'filesystem',
              tool: 'fs_list_directory',
              args: { path: nodes[i].path, recursive: false }
            });

            socket.once('mcp:tool-result', (result: any) => {
              if (result.success && result.data) {
                nodes[i].children = result.data.map((item: any) => ({
                  name: item.name,
                  path: item.path,
                  type: item.type,
                  children: item.type === 'directory' ? [] : undefined,
                  expanded: false
                }));
                setFiles([...newFiles]);
              }
            });
          }
          return true;
        }
        if (nodes[i].children && updateNode(nodes[i].children!, path)) {
          return true;
        }
      }
      return false;
    };

    updateNode(newFiles, node.path);
    setFiles(newFiles);
  };

  const openFile = (filePath: string) => {
    // Emit event to open file in editor
    const socket = socketService.getSocket();
    socket.emit('file:open', { path: filePath });
  };

  const renderFileTree = (nodes: FileNode[], depth = 0): JSX.Element[] => {
    return nodes.map((node, index) => (
      <div key={node.path}>
        <div
          className="flex items-center gap-1 px-2 py-0.5 hover:bg-[#2a2d2e] cursor-pointer text-[13px]"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => node.type === 'directory' ? toggleDirectory(node, index) : openFile(node.path)}
          title={node.name}
        >
          {node.type === 'directory' ? (
            <>
              {node.expanded ? (
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              )}
              {node.expanded ? (
                <FolderOpen size={14} className="text-yellow-500 flex-shrink-0" />
              ) : (
                <Folder size={14} className="text-yellow-500 flex-shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-[14px] flex-shrink-0" />
              <File size={14} className="text-gray-400 flex-shrink-0" />
            </>
          )}
          <span className="text-[#cccccc] truncate flex-1 min-w-0">{node.name}</span>
        </div>
        {node.type === 'directory' && node.expanded && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full w-full bg-vscode-sidebar overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-vscode-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">Explorer</h2>
          <div className="flex space-x-1">
            <button className="hover:bg-white/10 p-1 rounded" title="New File">
              <File size={14} className="text-gray-400" />
            </button>
            <button className="hover:bg-white/10 p-1 rounded" title="New Folder">
              <Folder size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
        <div className="text-[11px] text-gray-500 font-mono truncate" title={workspacePath}>
          {workspacePath.split('\\').pop()}
        </div>
      </div>

      {/* File Tree */}
      <div className="py-1">
        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">Loading workspace...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No files found</div>
        ) : (
          renderFileTree(files)
        )}
      </div>
    </div>
  );
}
