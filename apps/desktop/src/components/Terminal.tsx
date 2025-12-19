import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { socketService } from '../lib/socket';
import 'xterm/css/xterm.css';

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    if (!terminalRef.current) {
      console.warn('Terminal container not ready');
      return;
    }

    // Wait for container to be fully mounted
    const initTimer = setTimeout(() => {
      if (!terminalRef.current) return;

      // Initialize XTerm
      const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#cccccc',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      scrollback: 1000,
      allowTransparency: false,
    });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      try {
        term.open(terminalRef.current!);

        // Wait a bit before fitting to ensure proper rendering
        setTimeout(() => {
          try {
            fitAddon.fit();
          } catch (err) {
            console.warn('FitAddon error:', err);
          }
        }, 100);
      } catch (err) {
        console.error('Terminal initialization error:', err);
        return;
      }

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Handle terminal input
      term.onData((data) => {
        try {
          const socket = socketService.getSocket();
          if (sessionId) {
            socket.emit('terminal:input', { sessionId, data });
          }
        } catch (err) {
          console.warn('Terminal input error:', err);
        }
      });

      // Connect to backend terminal
      try {
        const socket = socketService.getSocket();

        // Show initial message
        term.writeln('\x1b[1;32mAnuCode Terminal\x1b[0m');
        term.writeln('\x1b[90mConnecting to backend...\x1b[0m');
        term.writeln('');

        // Create terminal session
        socket.emit('terminal:create', { shell: 'powershell.exe', cwd: 'D:\\NEXUS AI' });

        socket.on('terminal:created', (data: { sessionId: string }) => {
          setSessionId(data.sessionId);
          term.writeln('\x1b[32m✓ Connected to backend terminal\x1b[0m');
          term.writeln('');
        });

        socket.on('terminal:output', (data: { sessionId: string; output: string }) => {
          if (data.sessionId === sessionId) {
            term.write(data.output);
          }
        });

        socket.on('terminal:exit', (data: { sessionId: string; code: number }) => {
          if (data.sessionId === sessionId) {
            term.writeln(`\r\n\x1b[33mProcess exited with code ${data.code}\x1b[0m`);
          }
        });

        // Handle resize
        const handleResize = () => {
          try {
            if (fitAddonRef.current) {
              fitAddonRef.current.fit();
            }
            if (sessionId) {
              socket.emit('terminal:resize', {
                sessionId,
                cols: term.cols,
                rows: term.rows,
              });
            }
          } catch (err) {
            console.warn('Resize error:', err);
          }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          if (sessionId) {
            try {
              socket.emit('terminal:destroy', { sessionId });
            } catch (err) {
              console.warn('Terminal cleanup error:', err);
            }
          }
          term.dispose();
        };
      } catch (err) {
        console.error('Backend connection error:', err);
        term.writeln('\x1b[31m✗ Failed to connect to backend\x1b[0m');
        term.writeln('\x1b[90mMake sure the API server is running\x1b[0m');
        term.writeln('');
      }
    }, 50); // Small delay to ensure DOM is ready

    // Cleanup timer
    return () => clearTimeout(initTimer);
  }, []);

  // Fit terminal when container resizes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="h-full w-full bg-[#1e1e1e]" ref={terminalRef} />
  );
}
