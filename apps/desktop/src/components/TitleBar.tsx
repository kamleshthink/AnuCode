import { useState } from 'react';
import { Minus, Square, X } from 'lucide-react';

interface TitleBarProps {
  connected?: boolean;
}

export default function TitleBar({ connected = false }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximize();
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  return (
    <div className="h-[30px] bg-[#323233] flex items-center justify-between px-2 border-b border-[#2d2d2d] select-none" style={{ WebkitAppRegion: 'drag' } as any}>
      {/* Left: Logo + Menu */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="flex items-center gap-1.5 px-2">
          <span className="text-[13px] font-medium text-[#cccccc]">AnuCode</span>
        </div>

        {/* Menu Items */}
        <div className="flex items-center">
          {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((item) => (
            <button
              key={item}
              className="px-3 h-[30px] text-[12px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors flex items-center"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Connection Status */}
      <div className="flex-1 flex items-center justify-center">
        {connected && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#888888]">
            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span>Backend Connected</span>
          </div>
        )}
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={handleMinimize}
          className="h-[30px] w-[46px] flex items-center justify-center hover:bg-[#3f3f3f] transition-colors"
          title="Minimize"
        >
          <Minus size={14} className="text-[#cccccc]" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-[30px] w-[46px] flex items-center justify-center hover:bg-[#3f3f3f] transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          <Square size={12} className="text-[#cccccc]" />
        </button>
        <button
          onClick={handleClose}
          className="h-[30px] w-[46px] flex items-center justify-center hover:bg-red-600 transition-colors group"
          title="Close"
        >
          <X size={16} className="text-[#cccccc] group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}
