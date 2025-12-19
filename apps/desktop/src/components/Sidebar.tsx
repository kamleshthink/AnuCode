import FileExplorer from './FileExplorer';
import { Search, GitBranch, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: string;
}

export default function Sidebar({ activeView }: SidebarProps) {
  const renderContent = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />;
      case 'search':
        return (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Search size={16} className="text-gray-400" />
              <h2 className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">Search</h2>
            </div>
            <input
              type="text"
              placeholder="Search files..."
              className="w-full bg-vscode-bg border border-vscode-border rounded px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 text-gray-300"
            />
            <div className="mt-3 text-[12px] text-gray-500">
              Search across all files in workspace
            </div>
          </div>
        );
      case 'git':
        return (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch size={16} className="text-gray-400" />
              <h2 className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">Source Control</h2>
            </div>
            <div className="space-y-2 text-[13px]">
              <div className="text-gray-400">
                <div className="font-semibold mb-1">Changes</div>
                <div className="text-gray-500 text-[12px]">No changes detected</div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[12px]">
                Commit
              </button>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="p-3">
            <h2 className="text-xs font-semibold uppercase text-gray-400 mb-3">
              AI Assistant
            </h2>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded">
                🤖 Agent Mode
              </button>
              <button className="w-full text-left px-3 py-2 bg-vscode-bg hover:bg-vscode-hover rounded">
                💬 Ask Mode
              </button>
              <button className="w-full text-left px-3 py-2 bg-vscode-bg hover:bg-vscode-hover rounded">
                ✏️ Edit Mode
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-gray-400" />
              <h2 className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">Settings</h2>
            </div>
            <div className="space-y-2 text-[13px]">
              <div className="text-gray-400">
                <div className="font-semibold mb-1">User Settings</div>
                <div className="text-gray-500 text-[12px]">Configure AnuCode</div>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-3 text-[13px] text-gray-400">Select a view</div>;
    }
  };

  return (
    <div className="h-full w-full bg-vscode-sidebar overflow-y-auto">
      {renderContent()}
    </div>
  );
}
