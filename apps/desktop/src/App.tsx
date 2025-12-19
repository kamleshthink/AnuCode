import { useState, useEffect } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import TitleBar from './components/TitleBar';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import EditorArea from './components/EditorArea';
import AIPanel from './components/AIPanel';
import BottomPanel from './components/BottomPanel';
import StatusBar from './components/StatusBar';
import { socketService } from './lib/socket';

function App() {
  const [activeView, setActiveView] = useState('explorer');
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to backend on mount
    const socket = socketService.connect();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      {/* Title Bar */}
      <TitleBar connected={connected} />

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />

        {/* Resizable Panels */}
        <Group direction="horizontal" className="flex-1">
          {/* Sidebar */}
          <Panel defaultSize={20} minSize={15} maxSize={40}>
            <Sidebar activeView={activeView} />
          </Panel>

          <Separator className="w-[1px] bg-[#2d2d2d] hover:bg-[#007acc] transition-colors" />

          {/* Editor + Bottom Panel */}
          <Panel defaultSize={aiPanelOpen ? 55 : 80} minSize={30}>
            <Group direction="vertical" className="h-full">
              {/* Editor Area */}
              <Panel defaultSize={bottomPanelOpen ? 70 : 100} minSize={40}>
                <EditorArea />
              </Panel>

              {/* Bottom Panel */}
              {bottomPanelOpen && (
                <>
                  <Separator className="h-[1px] bg-[#2d2d2d] hover:bg-[#007acc] transition-colors" />
                  <Panel defaultSize={30} minSize={10} maxSize={60}>
                    <BottomPanel onClose={() => setBottomPanelOpen(false)} />
                  </Panel>
                </>
              )}
            </Group>
          </Panel>

          {/* AI Panel */}
          {aiPanelOpen && (
            <>
              <Separator className="w-[1px] bg-[#2d2d2d] hover:bg-[#007acc] transition-colors" />
              <Panel defaultSize={25} minSize={20} maxSize={50}>
                <AIPanel onClose={() => setAiPanelOpen(false)} />
              </Panel>
            </>
          )}
        </Group>
      </div>

      {/* Status Bar */}
      <StatusBar
        bottomPanelOpen={bottomPanelOpen}
        onToggleBottomPanel={() => setBottomPanelOpen(!bottomPanelOpen)}
        aiPanelOpen={aiPanelOpen}
        onToggleAIPanel={() => setAiPanelOpen(!aiPanelOpen)}
      />
    </div>
  );
}

export default App;
