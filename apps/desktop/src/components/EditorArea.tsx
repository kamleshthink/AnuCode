import { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function EditorArea() {
  const [isLoading, setIsLoading] = useState(true);

  const defaultCode = `// Welcome to AnuCode
// Your AI-Powered Code Editor

function greet(name: string): string {
  return \`Hello, \${name}! 👋\`;
}

console.log(greet('Developer'));

// AI Features:
// - Agent Mode: Build apps iteratively with AI
// - Ask Mode: Get instant code explanations
// - Edit Mode: AI-powered code modifications
//
// Start coding and let AI assist you!
`;

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      {/* Tabs */}
      <div className="h-9 bg-[#252526] border-b border-[#3e3e42] flex items-center px-2 flex-shrink-0">
        <div className="flex space-x-1">
          <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1 text-[13px] text-[#cccccc]">
            <span>App.tsx</span>
            <button className="hover:bg-white/10 rounded px-1 text-lg leading-none">×</button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] text-[#cccccc] text-sm">
            Loading Monaco Editor...
          </div>
        )}
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="typescript"
          defaultValue={defaultCode}
          theme="vs-dark"
          loading={<div className="flex items-center justify-center h-full text-[#cccccc]">Loading...</div>}
          onMount={() => setIsLoading(false)}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            minimap: { enabled: true },
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
}
