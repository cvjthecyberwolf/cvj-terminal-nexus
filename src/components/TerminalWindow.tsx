import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'system';
  content: string;
  timestamp: Date;
}

const DEMO_COMMANDS = [
  { command: "neofetch", output: "CVJ Terminal OS v1.0\nKernel: Android 13\nCPU: Snapdragon 8 Gen 2\nMemory: 12GB LPDDR5\nStorage: 512GB UFS 4.0" },
  { command: "ls -la", output: "drwxr-xr-x 8 cvj cvj  4096 Dec 18 14:30 .\ndrwxr-xr-x 3 cvj cvj  4096 Dec 18 14:30 ..\n-rw-r--r-- 1 cvj cvj   220 Dec 18 14:30 .bashrc\ndrwxr-xr-x 2 cvj cvj  4096 Dec 18 14:30 scripts\ndrwxr-xr-x 2 cvj cvj  4096 Dec 18 14:30 tools" },
  { command: "python3 --version", output: "Python 3.11.7" },
  { command: "git status", output: "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean" },
];

export function TerminalWindow() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 0,
      type: 'system',
      content: 'Welcome to CVJ Terminal OS v1.0 - Hybrid Android Terminal',
      timestamp: new Date()
    },
    {
      id: 1,
      type: 'system',
      content: 'Type "help" for available commands or try the demo...',
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (content: string, type: TerminalLine['type'] = 'output') => {
    setLines(prev => [...prev, {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    }]);
  };

  const simulateTyping = async (text: string, callback: () => void) => {
    setIsTyping(true);
    setCurrentInput('');
    
    for (let i = 0; i <= text.length; i++) {
      setCurrentInput(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
    }
    
    setTimeout(() => {
      callback();
      setCurrentInput('');
      setIsTyping(false);
    }, 500);
  };

  const runDemo = async () => {
    if (isDemoRunning || demoIndex >= DEMO_COMMANDS.length) return;
    
    setIsDemoRunning(true);
    const demo = DEMO_COMMANDS[demoIndex];
    
    await simulateTyping(demo.command, () => {
      addLine(`cvj@terminal:~$ ${demo.command}`, 'input');
      setTimeout(() => {
        addLine(demo.output, 'output');
        setDemoIndex(prev => prev + 1);
        setIsDemoRunning(false);
      }, 800);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTyping) {
      const command = currentInput.trim();
      if (command) {
        addLine(`cvj@terminal:~$ ${command}`, 'input');
        
        // Simple command responses
        if (command === 'help') {
          addLine('Available commands:\n  help - Show this help\n  clear - Clear terminal\n  demo - Run demo sequence\n  neofetch - System information\n  ls - List files', 'output');
        } else if (command === 'clear') {
          setLines([]);
        } else if (command === 'demo') {
          setDemoIndex(0);
          setTimeout(runDemo, 500);
        } else {
          addLine(`Command not found: ${command}`, 'output');
        }
        
        setCurrentInput('');
      }
    }
  };

  const getLineClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input':
        return 'text-terminal-cyan';
      case 'system':
        return 'text-terminal-yellow';
      default:
        return 'text-terminal-green';
    }
  };

  return (
    <Card className="bg-gradient-terminal terminal-glow p-6 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-muted-foreground font-cyber">CVJ Terminal OS</span>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto font-mono text-sm space-y-1 mb-4 scrollbar-thin scrollbar-thumb-primary/30"
      >
        {lines.map((line) => (
          <div key={line.id} className={`${getLineClass(line.type)} whitespace-pre-wrap`}>
            {line.content}
          </div>
        ))}
        
        {(isTyping || !isDemoRunning) && (
          <div className="flex items-center text-terminal-cyan">
            <span>cvj@terminal:~$ </span>
            <span>{currentInput}</span>
            <span className="animate-pulse ml-1">|</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          className="flex-1 bg-transparent border border-primary/30 rounded px-3 py-2 font-mono text-sm text-terminal-green focus:border-primary focus:outline-none focus:glow-primary"
          placeholder="Type a command..."
        />
        <button
          onClick={runDemo}
          disabled={isDemoRunning || demoIndex >= DEMO_COMMANDS.length}
          className="px-4 py-2 bg-primary/20 border border-primary/50 rounded text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed neon-glow transition-all"
        >
          Demo
        </button>
      </div>
    </Card>
  );
}