import { useState, useEffect } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  Minus, Square, X, FileText, AlertCircle, Bug,
  Search, GitBranch, Settings, Code, Play
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('explorer');
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['apps']));

  // Terminal
  const terminalRef = useState<HTMLDivElement | null>(null);

  const fileTree = [
    {
      name: 'apps',
      type: 'folder',
      children: [
        { name: 'desktop', type: 'folder', children: [] },
        { name: 'api', type: 'folder', children: [] }
      ]
    },
    { name: 'packages', type: 'folder', children: [] },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'tsconfig.json', type: 'file' }
  ];

  const renderFileTree = (items: any[], depth = 0) => {
    return items.map((item, idx) => (
      <div key={`${item.name}-${idx}`}>
        <div
          style={{
            paddingLeft: `${depth * 16 + 8}px`,
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#cccccc'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2d2e'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          onClick={() => {
            if (item.type === 'folder') {
              const newExpanded = new Set(expandedFolders);
              if (newExpanded.has(item.name)) {
                newExpanded.delete(item.name);
              } else {
                newExpanded.add(item.name);
              }
              setExpandedFolders(newExpanded);
            }
          }}
        >
          {item.type === 'folder' && (
            expandedFolders.has(item.name)
              ? <ChevronDown size={14} color="#888" />
              : <ChevronRight size={14} color="#888" />
          )}
          {item.type === 'folder' ? (
            expandedFolders.has(item.name)
              ? <FolderOpen size={14} color="#dcb67a" />
              : <Folder size={14} color="#dcb67a" />
          ) : (
            <File size={14} color="#888" />
          )}
          <span>{item.name}</span>
        </div>
        {item.type === 'folder' && expandedFolders.has(item.name) && item.children && (
          renderFileTree(item.children, depth + 1)
        )}
      </div>
    ));
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      color: '#cccccc',
      overflow: 'hidden',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      {/* Title Bar */}
      <div style={{
        height: '35px',
        background: '#323233',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #2d2d2d',
        flexShrink: 0,
        userSelect: 'none'
      }}>
        {/* Left: Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <div style={{ padding: '0 12px', fontSize: '13px', fontWeight: 500 }}>AnuCode</div>
          {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(item => (
            <div
              key={item}
              style={{
                padding: '6px 10px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#3e3e42'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Right: Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={{
            width: '46px', height: '35px', border: 'none', background: 'transparent',
            color: '#cccccc', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#3e3e42'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Minus size={14} />
          </button>
          <button style={{
            width: '46px', height: '35px', border: 'none', background: 'transparent',
            color: '#cccccc', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#3e3e42'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Square size={12} />
          </button>
          <button style={{
            width: '46px', height: '35px', border: 'none', background: 'transparent',
            color: '#cccccc', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e81123'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Activity Bar */}
        <div style={{
          width: '48px',
          background: '#333333',
          borderRight: '1px solid #2d2d2d',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 0',
          flexShrink: 0
        }}>
          {[
            { icon: <File size={24} />, id: 'explorer', label: 'Explorer' },
            { icon: <Search size={24} />, id: 'search', label: 'Search' },
            { icon: <GitBranch size={24} />, id: 'git', label: 'Git' },
            { icon: <Code size={24} />, id: 'ai', label: 'AI' },
            { icon: <Settings size={24} />, id: 'settings', label: 'Settings' }
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderLeft: activeView === item.id ? '2px solid #007acc' : '2px solid transparent',
                background: activeView === item.id ? '#2a2d2e' : 'transparent',
                color: activeView === item.id ? '#ffffff' : '#858585'
              }}
              onMouseEnter={(e) => {
                if (activeView !== item.id) e.currentTarget.style.background = '#2a2d2e';
              }}
              onMouseLeave={(e) => {
                if (activeView !== item.id) e.currentTarget.style.background = 'transparent';
              }}
              title={item.label}
            >
              {item.icon}
            </div>
          ))}
        </div>

        {/* Resizable Panels */}
        <Group direction="horizontal" style={{ flex: 1 }}>
          {/* Sidebar */}
          <Panel defaultSize={20} minSize={15} maxSize={40}>
            <div style={{
              height: '100%',
              background: '#252526',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Sidebar Header */}
              <div style={{
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#888',
                borderBottom: '1px solid #2d2d2d',
                flexShrink: 0
              }}>
                {activeView === 'explorer' && 'Explorer'}
                {activeView === 'search' && 'Search'}
                {activeView === 'git' && 'Source Control'}
                {activeView === 'ai' && 'AI Assistant'}
              </div>

              {/* Sidebar Content */}
              <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
                {activeView === 'explorer' && (
                  <div>
                    <div style={{
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#888',
                      marginBottom: '4px'
                    }}>
                      NEXUS AI
                    </div>
                    {renderFileTree(fileTree)}
                  </div>
                )}

                {activeView === 'search' && (
                  <div style={{ padding: '8px' }}>
                    <input
                      type="text"
                      placeholder="Search..."
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: '#3c3c3c',
                        border: '1px solid #3e3e42',
                        borderRadius: '3px',
                        color: '#cccccc',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}

                {activeView === 'ai' && (
                  <div style={{ padding: '8px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>AI Modes</div>
                      {['Agent Mode', 'Ask Mode', 'Edit Mode'].map(mode => (
                        <div
                          key={mode}
                          style={{
                            padding: '8px',
                            background: '#2d2d2d',
                            marginBottom: '4px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#37373d'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#2d2d2d'}
                        >
                          {mode}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Separator style={{ width: '1px', background: '#2d2d2d' }} />

          {/* Editor + Bottom Panel */}
          <Panel defaultSize={aiPanelOpen ? 55 : 80} minSize={30}>
            <Group direction="vertical" style={{ height: '100%' }}>
              {/* Editor */}
              <Panel defaultSize={bottomPanelOpen ? 70 : 100} minSize={40}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
                  {/* Editor Tabs */}
                  <div style={{
                    height: '35px',
                    background: '#252526',
                    borderBottom: '1px solid #2d2d2d',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px',
                    gap: '4px',
                    flexShrink: 0
                  }}>
                    <div style={{
                      padding: '6px 12px',
                      background: '#1e1e1e',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>App.tsx</span>
                      <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} />
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Editor
                      height="100%"
                      defaultLanguage="typescript"
                      defaultValue={`// AnuCode - AI-Powered Code Editor
// Complete VS Code-like Interface

import { useState } from 'react';

function AnuCode() {
  const [code, setCode] = useState('');

  return (
    <div className="editor">
      <h1>Welcome to AnuCode!</h1>
      <p>Your AI-powered development environment</p>
    </div>
  );
}

export default AnuCode;

// Features:
// - File Explorer (Left)
// - Monaco Editor (Center)
// - Terminal (Bottom)
// - AI Assistant (Right)
// - Full VS Code experience!
`}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                        minimap: { enabled: true },
                        lineNumbers: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on'
                      }}
                    />
                  </div>
                </div>
              </Panel>

              {/* Bottom Panel */}
              {bottomPanelOpen && (
                <>
                  <Separator style={{ height: '1px', background: '#2d2d2d' }} />
                  <Panel defaultSize={30} minSize={15} maxSize={60}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
                      {/* Bottom Panel Tabs */}
                      <div style={{
                        height: '35px',
                        background: '#252526',
                        borderBottom: '1px solid #2d2d2d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 8px',
                        flexShrink: 0
                      }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {['Terminal', 'Output', 'Problems', 'Debug Console'].map(tab => (
                            <div
                              key={tab}
                              onClick={() => setActiveBottomTab(tab.toLowerCase().replace(' ', ''))}
                              style={{
                                padding: '8px 4px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                borderBottom: activeBottomTab === tab.toLowerCase().replace(' ', '')
                                  ? '2px solid #007acc'
                                  : '2px solid transparent',
                                color: activeBottomTab === tab.toLowerCase().replace(' ', '')
                                  ? '#ffffff'
                                  : '#888'
                              }}
                            >
                              {tab}
                            </div>
                          ))}
                        </div>
                        <X
                          size={16}
                          style={{ cursor: 'pointer', opacity: 0.7 }}
                          onClick={() => setBottomPanelOpen(false)}
                        />
                      </div>

                      {/* Bottom Panel Content */}
                      <div style={{ flex: 1, background: '#1e1e1e', padding: '8px', overflow: 'auto', fontFamily: 'monospace', fontSize: '13px' }}>
                        {activeBottomTab === 'terminal' && (
                          <div style={{ color: '#0dbc79' }}>
                            <div>AnuCode Terminal v1.0.0</div>
                            <div style={{ color: '#888', marginTop: '4px' }}>
                              PS D:\NEXUS AI&gt; npm run dev
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <span style={{ color: '#007acc' }}>info</span> Starting development server...
                            </div>
                            <div style={{ marginTop: '2px', color: '#0dbc79' }}>
                              <span style={{ color: '#007acc' }}>ready</span> Server running at http://localhost:5177
                            </div>
                          </div>
                        )}
                        {activeBottomTab === 'output' && (
                          <div style={{ color: '#cccccc' }}>
                            <div>[AnuCode] Starting...</div>
                            <div>[Extension Host] Activated</div>
                          </div>
                        )}
                        {activeBottomTab === 'problems' && (
                          <div style={{ color: '#888' }}>No problems detected</div>
                        )}
                      </div>
                    </div>
                  </Panel>
                </>
              )}
            </Group>
          </Panel>

          {/* AI Panel */}
          {aiPanelOpen && (
            <>
              <Separator style={{ width: '1px', background: '#2d2d2d' }} />
              <Panel defaultSize={25} minSize={20} maxSize={50}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#252526' }}>
                  {/* AI Panel Header */}
                  <div style={{
                    height: '35px',
                    background: '#333333',
                    borderBottom: '1px solid #2d2d2d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>AI Assistant</span>
                    <X
                      size={16}
                      style={{ cursor: 'pointer', opacity: 0.7 }}
                      onClick={() => setAiPanelOpen(false)}
                    />
                  </div>

                  {/* AI Chat Area */}
                  <div style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
                    <div style={{
                      background: '#1e1e1e',
                      padding: '12px',
                      borderRadius: '4px',
                      marginBottom: '12px',
                      fontSize: '13px'
                    }}>
                      <div style={{ fontWeight: 600, color: '#007acc', marginBottom: '8px' }}>AnuCode AI</div>
                      <div style={{ lineHeight: '1.6' }}>
                        Hello! I'm your AI-powered coding assistant. I can help you:
                        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                          <li>Build apps iteratively</li>
                          <li>Explain code</li>
                          <li>Refactor and optimize</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* AI Input */}
                  <div style={{
                    padding: '8px',
                    borderTop: '1px solid #2d2d2d',
                    flexShrink: 0
                  }}>
                    <input
                      type="text"
                      placeholder="Ask AI..."
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#3c3c3c',
                        border: '1px solid #3e3e42',
                        borderRadius: '3px',
                        color: '#cccccc',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </Panel>
            </>
          )}
        </Group>
      </div>

      {/* Status Bar */}
      <div style={{
        height: '22px',
        background: '#007acc',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        fontSize: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>main*</span>
          <span>TypeScript</span>
          <span>UTF-8</span>
          <span>Ln 15, Col 8</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span
            onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
            style={{ cursor: 'pointer' }}
          >
            {bottomPanelOpen ? '⬇ Hide' : '⬆ Show'} Terminal
          </span>
          <span
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            style={{ cursor: 'pointer' }}
          >
            🤖 AI: Ready
          </span>
        </div>
      </div>
    </div>
  );
}
