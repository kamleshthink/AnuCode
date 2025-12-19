interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const views = [
    { id: 'explorer', icon: '📁', label: 'Explorer' },
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'git', icon: '🌿', label: 'Source Control' },
    { id: 'ai', icon: '🤖', label: 'AI Assistant' },
    { id: 'deploy', icon: '🚀', label: 'Deploy' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="w-12 h-full bg-vscode-activitybar flex flex-col items-center py-2 space-y-2 border-r border-vscode-border">
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 transition-colors ${
            activeView === view.id ? 'bg-white/20 border-l-2 border-blue-500' : ''
          }`}
          title={view.label}
        >
          <span className="text-xl">{view.icon}</span>
        </button>
      ))}
    </div>
  );
}
