interface StatusBarProps {
  bottomPanelOpen?: boolean;
  onToggleBottomPanel?: () => void;
  aiPanelOpen?: boolean;
  onToggleAIPanel?: () => void;
}

export default function StatusBar({ bottomPanelOpen, onToggleBottomPanel, aiPanelOpen, onToggleAIPanel }: StatusBarProps) {
  return (
    <div className="h-6 bg-vscode-statusbar text-white text-xs flex items-center justify-between px-2">
      {/* Left */}
      <div className="flex items-center space-x-3">
        <span>🌿 main*</span>
        <span>TypeScript</span>
        <span>UTF-8</span>
        <span>Ln 45, Col 12</span>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-3">
        <span>🤖 AI: Ready</span>
        <span className="bg-blue-700 px-2 py-0.5 rounded">Pro</span>
      </div>
    </div>
  );
}
