import { useState } from 'react';
import '@monaco-editor/react';
import Editor from '@monaco-editor/react';

export default function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Simple Title Bar */}
      <div style={{
        height: '35px',
        background: '#323233',
        color: '#cccccc',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '15px',
        fontSize: '13px',
        borderBottom: '1px solid #2d2d2d',
        flexShrink: 0
      }}>
        <span style={{ fontWeight: 500 }}>AnuCode - AI-Powered Code Editor</span>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="typescript"
          defaultValue={`// Welcome to AnuCode
// Your AI-Powered Code Editor

console.log("Hello from AnuCode!");

// This is a CLEAN build - no logo overlays
// Just pure Monaco Editor + AI features
`}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            automaticLayout: true,
          }}
        />
      </div>

      {/* Status Bar */}
      <div style={{
        height: '22px',
        background: '#007acc',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '10px',
        fontSize: '12px',
        flexShrink: 0
      }}>
        <span>AnuCode Ready | TypeScript | UTF-8</span>
      </div>
    </div>
  );
}
