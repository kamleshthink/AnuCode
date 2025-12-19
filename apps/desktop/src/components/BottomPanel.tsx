import { useState } from 'react';
import Terminal from './Terminal';
import { AlertCircle, FileText, Bug } from 'lucide-react';

interface BottomPanelProps {
  onClose?: () => void;
}

export default function BottomPanel({ onClose }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState('terminal');

  return (
    <div className="h-full w-full bg-vscode-panel flex flex-col">
      {/* Tabs */}
      <div className="h-9 bg-vscode-sidebar border-b border-vscode-border flex items-center justify-between px-2">
        <div className="flex space-x-4 text-sm">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-2 py-1 ${
              activeTab === 'terminal' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`px-2 py-1 ${
              activeTab === 'output' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'
            }`}
          >
            Output
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-2 py-1 ${
              activeTab === 'problems' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'
            }`}
          >
            Problems
          </button>
          <button
            onClick={() => setActiveTab('debug')}
            className={`px-2 py-1 ${
              activeTab === 'debug' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'
            }`}
          >
            Debug Console
          </button>
        </div>
        {onClose && (
          <button onClick={onClose} className="hover:bg-white/10 rounded p-1 text-lg leading-none">×</button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'terminal' && <Terminal />}

        {activeTab === 'output' && (
          <div className="p-3 font-mono text-[12px] text-gray-300 h-full overflow-y-auto">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <FileText size={14} />
              <span>Output Logs</span>
            </div>
            <div className="text-gray-500">[AnuCode] Ready</div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="p-3 font-mono text-[12px] text-gray-300 h-full overflow-y-auto">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <AlertCircle size={14} />
              <span>No problems detected</span>
            </div>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="p-3 font-mono text-[12px] text-gray-300 h-full overflow-y-auto">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Bug size={14} />
              <span>Debug Console</span>
            </div>
            <div className="text-gray-500">Debug session not started</div>
          </div>
        )}
      </div>
    </div>
  );
}
