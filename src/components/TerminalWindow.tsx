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

  const executeCommand = (command: string): string => {
    const [cmd, ...args] = command.split(' ');
    
    switch (cmd) {
      case 'help':
        return 'Available commands:\n  help, clear, demo, neofetch, ls, pwd, whoami, date, uname\n  cat, echo, mkdir, rmdir, touch, rm, cp, mv\n  ps, top, htop, df, free, lscpu, lsusb\n  ping, wget, curl, nmap, ssh, git\n  python3, node, npm, pip, vim, nano';
      
      case 'clear':
        setLines([]);
        return '';
      
      case 'demo':
        setDemoIndex(0);
        setTimeout(runDemo, 500);
        return 'Running demo sequence...';
      
      case 'neofetch':
        return 'CVJ Terminal OS v1.0\nKernel: Android 13\nCPU: Snapdragon 8 Gen 2\nMemory: 12GB LPDDR5\nStorage: 512GB UFS 4.0\nShell: bash 5.1.16\nTerminal: CVJ Terminal\nPackages: 247 (apt), 89 (pip), 156 (npm)';
      
      case 'ls':
        const hasLa = args.includes('-la') || args.includes('-l');
        return hasLa ? 
          'drwxr-xr-x 8 cvj cvj  4096 Dec 18 14:30 .\ndrwxr-xr-x 3 cvj cvj  4096 Dec 18 14:30 ..\n-rw-r--r-- 1 cvj cvj   220 Dec 18 14:30 .bashrc\n-rw-r--r-- 1 cvj cvj    23 Dec 18 14:30 .profile\ndrwxr-xr-x 2 cvj cvj  4096 Dec 18 14:30 scripts\ndrwxr-xr-x 2 cvj cvj  4096 Dec 18 14:30 tools\ndrwxr-xr-x 2 cvj cvj  4096 Dec 18 14:30 projects' :
          '.bashrc  .profile  scripts  tools  projects';
      
      case 'pwd':
        return '/data/data/com.cvj.terminal/files/home';
      
      case 'whoami':
        return 'cvj';
      
      case 'date':
        return new Date().toString();
      
      case 'uname':
        return args.includes('-a') ? 'Linux cvj-terminal 5.15.74-android13 #1 SMP PREEMPT aarch64 Android' : 'Linux';
      
      case 'ps':
        return 'PID TTY          TIME CMD\n1234 pts/0    00:00:01 bash\n5678 pts/0    00:00:00 ps';
      
      case 'df':
        return 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/block/sda1  131072000 98304000  32768000  76% /\ntmpfs             6291456    12288   6279168   1% /tmp';
      
      case 'free':
        return '               total        used        free      shared  buff/cache   available\nMem:        12582912     4194304     6291456      102400     2097152     8388608\nSwap:        2097152      524288     1572864';
      
      case 'lscpu':
        return 'Architecture:        aarch64\nCPU(s):              8\nModel name:          Snapdragon 8 Gen 2\nCPU MHz:             3200.000\nL1d cache:           64K\nL1i cache:           64K\nL2 cache:            512K\nL3 cache:            8192K';
      
      case 'ping':
        const target = args[0] || 'google.com';
        return `PING ${target} (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=64 time=12.3 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=64 time=11.8 ms\n--- ${target} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
      
      case 'nmap':
        return 'Starting Nmap scan...\nNmap scan report for 192.168.1.1\nHost is up (0.0012s latency).\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https';
      
      case 'git':
        if (args[0] === 'status') return 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean';
        if (args[0] === '--version') return 'git version 2.39.2';
        return 'usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]';
      
      case 'python3':
        if (args[0] === '--version') return 'Python 3.11.7';
        return 'Python 3.11.7 (main, Dec  4 2023, 18:10:11)\nType "help", "copyright", "credits" or "license" for more information.\n>>> ';
      
      case 'node':
        if (args[0] === '--version') return 'v18.19.0';
        return 'Welcome to Node.js v18.19.0.\nType ".help" for more information.\n> ';
      
      case 'npm':
        if (args[0] === '--version') return '9.2.0';
        return 'Usage: npm <command>';
      
      case 'cat':
        const file = args[0];
        if (file === '.bashrc') return '# CVJ Terminal Configuration\nexport PS1="cvj@terminal:\\w$ "\nalias ll="ls -la"\nalias la="ls -A"';
        return `cat: ${file}: No such file or directory`;
      
      case 'echo':
        return args.join(' ');
      
      case 'mkdir':
        return args[0] ? `Directory '${args[0]}' created` : 'mkdir: missing operand';
      
      case 'touch':
        return args[0] ? `File '${args[0]}' created` : 'touch: missing file operand';
      
      case 'htop':
        return 'htop - 14:30:15   up 2 days,  4:20,  1 user,  load average: 0.52, 0.58, 0.59\nTasks:  89 total,   2 running,  87 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  12.5 us,  3.1 sy,  0.0 ni, 84.4 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\nKiB Mem : 12582912 total,  6291456 free,  4194304 used,  2097152 buff/cache';
      
      case 'vim':
      case 'nano':
        return `${cmd} editor would open here in the full app`;
      
      case 'curl':
      case 'wget':
        return `${cmd}: command would download from ${args[0] || 'URL'} in the full app`;
      
      case 'ssh':
        return 'ssh: connect to host ' + (args[0] || 'hostname') + ' port 22: Connection would be established in full app';
      
      default:
        return `Command not found: ${cmd}. Type 'help' for available commands.`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTyping) {
      const command = currentInput.trim();
      if (command) {
        addLine(`cvj@terminal:~$ ${command}`, 'input');
        const output = executeCommand(command);
        if (output) {
          addLine(output, 'output');
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