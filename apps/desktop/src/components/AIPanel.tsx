import { useState } from 'react';

interface AIPanelProps {
  onClose?: () => void;
}

export default function AIPanel({ onClose }: AIPanelProps) {
  const [mode, setMode] = useState<'agent' | 'ask' | 'edit'>('ask');
  const [input, setInput] = useState('');

  return (
    <div className="h-full w-full bg-vscode-sidebar flex flex-col">
      {/* Header */}
      <div className="h-9 bg-vscode-activitybar border-b border-vscode-border flex items-center justify-between px-3">
        <span className="text-sm font-semibold">AI Assistant</span>
        {onClose && (
          <button onClick={onClose} className="hover:bg-white/10 rounded p-1 text-lg leading-none">×</button>
        )}
      </div>

      {/* Mode Selector */}
      <div className="p-2 border-b border-vscode-border">
        <div className="flex space-x-1">
          <button
            onClick={() => setMode('agent')}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              mode === 'agent' ? 'bg-blue-600' : 'bg-vscode-bg hover:bg-vscode-hover'
            }`}
          >
            🤖 Agent
          </button>
          <button
            onClick={() => setMode('ask')}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              mode === 'ask' ? 'bg-blue-600' : 'bg-vscode-bg hover:bg-vscode-hover'
            }`}
          >
            💬 Ask
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              mode === 'edit' ? 'bg-blue-600' : 'bg-vscode-bg hover:bg-vscode-hover'
            }`}
          >
            ✏️ Edit
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="bg-vscode-bg rounded p-3 text-[13px]">
          <div className="font-semibold text-blue-400 mb-1.5">AnuCode AI</div>
          <div className="text-gray-300">
            Hello! I'm your AI-powered coding assistant. I can help you build apps iteratively, explain code, and make intelligent edits.
          </div>
          <div className="mt-3 text-[12px] text-gray-500">
            Select a mode above to get started.
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2 border-t border-vscode-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'agent'
                ? 'Describe what you want to build...'
                : mode === 'ask'
                ? 'Ask a question...'
                : 'Describe the edit...'
            }
            className="flex-1 bg-vscode-bg border border-vscode-border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
