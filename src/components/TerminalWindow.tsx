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
  { command: "docker ps", output: "CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES" },
  { command: "htop", output: "CVJ Terminal OS - Real-time system monitor loaded" },
];

export function TerminalWindow() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 0,
      type: 'system',
      content: 'Welcome to CVJ Terminal OS v1.0 - Full Linux Environment',
      timestamp: new Date()
    },
    {
      id: 1,
      type: 'system',
      content: 'Complete Linux command suite available. Type "help" for commands...',
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
        return 'CVJ Terminal OS - Complete Linux Command Suite:\n\n' +
               '📁 FILES & DIRECTORIES:\n  ls, pwd, cd, mkdir, rmdir, rm, cp, mv, ln, find, locate, du, tree\n' +
               '📄 FILE OPERATIONS:\n  cat, head, tail, less, more, grep, awk, sed, sort, uniq, wc, diff\n' +
               '🔐 PERMISSIONS:\n  chmod, chown, chgrp, umask, getfacl, setfacl\n' +
               '⚡ PROCESSES:\n  ps, top, htop, kill, killall, jobs, nohup, bg, fg, pgrep, pkill\n' +
               '💾 SYSTEM INFO:\n  neofetch, uname, whoami, id, uptime, hostname, lscpu, lsmem, free, df\n' +
               '🔧 HARDWARE:\n  lsblk, fdisk, lsusb, lspci, dmidecode, sensors, lshw\n' +
               '🌐 NETWORKING:\n  ping, wget, curl, netstat, ss, iptables, nmap, traceroute, dig, nslookup\n' +
               '📦 ARCHIVES:\n  tar, zip, unzip, gzip, gunzip, bzip2, bunzip2, 7z\n' +
               '👨‍💻 DEVELOPMENT:\n  git, python3, node, npm, pip, gcc, make, cmake, docker, kubernetes\n' +
               '✏️  EDITORS:\n  vim, nano, emacs, gedit\n' +
               '🛠️  UTILITIES:\n  echo, date, cal, bc, history, alias, which, type, man, info\n' +
               '🔒 SECURITY:\n  sudo, su, passwd, ssh, scp, rsync, gpg\n' +
               '📊 MONITORING:\n  watch, iostat, vmstat, sar, dmesg, journalctl\n' +
               '🎯 TERMINAL:\n  clear, exit, logout, screen, tmux, bash, zsh';
      
      case 'clear':
        setLines([]);
        return '';
      
      case 'demo':
        setDemoIndex(0);
        setTimeout(runDemo, 500);
        return 'Running CVJ Terminal OS demo sequence...';
      
      case 'neofetch':
        return '       ╭──────────────────────╮         cvj@cvj-terminal\n' +
               '       │   CVJ Terminal OS    │         ─────────────────\n' +
               '       │    █████████████     │         OS: CVJ Terminal OS v1.0\n' +
               '       │  ███████████████████ │         Kernel: 5.15.74-android13\n' +
               '       │ █████████████████████│         Host: Snapdragon 8 Gen 2\n' +
               '       │ █████████████████████│         Uptime: 2 days, 4 hours, 20 mins\n' +
               '       │ █████████████████████│         Packages: 247 (apt), 89 (pip), 156 (npm)\n' +
               '       │ █████████████████████│         Shell: bash 5.1.16\n' +
               '       │  ███████████████████ │         Resolution: 1080x2400\n' +
               '       │    █████████████     │         Terminal: CVJ Terminal\n' +
               '       ╰──────────────────────╯         CPU: Snapdragon 8 Gen 2 (8) @ 3.2GHz\n' +
               '                                        GPU: Adreno 740\n' +
               '                                        Memory: 4194MB / 12288MB\n' +
               '                                        Disk (/): 94G / 125G (76%)\n' +
               '                                        Battery: 87% [Charging]';

      case 'ls':
        if (args.includes('-la') || args.includes('-l')) {
          return 'total 64\ndrwxr-xr-x  8 cvj  cvj   4096 Dec 18 14:30 .\ndrwxr-xr-x  3 root root  4096 Dec 18 14:30 ..\n-rw-r--r--  1 cvj  cvj    220 Dec 18 14:30 .bashrc\n-rw-r--r--  1 cvj  cvj    807 Dec 18 14:30 .profile\n-rw-------  1 cvj  cvj     33 Dec 18 14:30 .lesshst\n-rw-r--r--  1 cvj  cvj    123 Dec 18 14:30 .vimrc\ndrwxr-xr-x  2 cvj  cvj   4096 Dec 18 14:30 scripts\ndrwxr-xr-x  2 cvj  cvj   4096 Dec 18 14:30 tools\ndrwxr-xr-x  2 cvj  cvj   4096 Dec 18 14:30 projects\ndrwxr-xr-x  2 cvj  cvj   4096 Dec 18 14:30 Documents\ndrwxr-xr-x  2 cvj  cvj   4096 Dec 18 14:30 Downloads\ndrwxr-xr-x  2 cvj  cvj   4096 Dec 18 14:30 bin\ndrwxr-xr-x  2 cvj  cvj   4096 Dec 18 14:30 .ssh';
        }
        if (args.includes('-a')) {
          return '.  ..  .bashrc  .profile  .lesshst  .vimrc  .ssh  scripts  tools  projects  Documents  Downloads  bin';
        }
        return 'scripts  tools  projects  Documents  Downloads  bin';
      
      case 'tree':
        return '. \n├── scripts\n│   ├── backup.sh\n│   ├── monitor.py\n│   └── deploy.sh\n├── tools\n│   ├── network_scanner.py\n│   ├── system_info.sh\n│   └── log_analyzer.py\n├── projects\n│   ├── cvj-terminal\n│   ├── android-tools\n│   └── README.md\n├── Documents\n│   ├── notes.txt\n│   └── manual.pdf\n├── Downloads\n│   └── installer.deb\n└── bin\n    ├── custom_cmd\n    └── utilities\n\n6 directories, 11 files';
      
      case 'pwd':
        return '/data/data/com.cvj.terminal/files/home';
      
      case 'cd':
        const targetDir = args[0] || '~';
        return `Changed directory to: ${targetDir === '~' ? '/data/data/com.cvj.terminal/files/home' : targetDir}`;
      
      case 'whoami':
        return 'cvj';
      
      case 'id':
        return 'uid=1000(cvj) gid=1000(cvj) groups=1000(cvj),4(adm),20(dialout),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),108(netdev),112(bluetooth)';
      
      case 'date':
        return new Date().toString();
      
      case 'cal':
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();
        return `    ${month} ${year}\nSu Mo Tu We Th Fr Sa\n 1  2  3  4  5  6  7\n 8  9 10 11 12 13 14\n15 16 17 18 19 20 21\n22 23 24 25 26 27 28\n29 30 31`;
      
      case 'uptime':
        return ' 14:30:15 up 2 days,  4:20,  1 user,  load average: 0.52, 0.58, 0.59';
      
      case 'hostname':
        return 'cvj-terminal';
      
      case 'uname':
        if (args.includes('-a')) return 'Linux cvj-terminal 5.15.74-android13 #1 SMP PREEMPT Thu Dec 14 14:30:00 UTC 2023 aarch64 aarch64 aarch64 GNU/Linux';
        if (args.includes('-r')) return '5.15.74-android13';
        if (args.includes('-m')) return 'aarch64';
        if (args.includes('-p')) return 'aarch64';
        if (args.includes('-i')) return 'aarch64';
        if (args.includes('-o')) return 'GNU/Linux';
        return 'Linux';

      // Process Management
      case 'ps':
        if (args.includes('aux') || args.includes('-ef')) {
          return 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1   8892  3456 ?        Ss   12:30   0:01 /sbin/init\ncvj       1234  0.1  0.2  12345  5678 pts/0    Ss   12:30   0:01 -bash\ncvj       2345  0.3  1.5  45678 12345 pts/0    S+   14:29   0:02 cvj-terminal\ncvj       3456  2.1  0.8  23456  7890 pts/0    S+   14:30   0:01 node server.js\ncvj       4567  0.0  0.1   7236   892 pts/0    R+   14:30   0:00 ps aux';
        }
        return 'PID TTY          TIME CMD\n1234 pts/0    00:00:01 bash\n2345 pts/0    00:00:02 cvj-terminal\n3456 pts/0    00:00:01 node\n4567 pts/0    00:00:00 ps';
      
      case 'top':
        return 'top - 14:30:15 up 2 days,  4:20,  1 user,  load average: 0.52, 0.58, 0.59\nTasks: 127 total,   2 running, 125 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  12.5 us,  3.1 sy,  0.0 ni, 84.4 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\nMiB Mem :  12288.0 total,   6144.0 free,   4096.0 used,   2048.0 buff/cache\nMiB Swap:   2048.0 total,   1536.0 free,    512.0 used.   8192.0 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1234 cvj       20   0    8892   3456   2890 S   0.1   0.0   0:01.23 bash\n 2345 cvj       20   0   45678  12345   8901 S   2.3   0.1   0:02.45 cvj-terminal\n 3456 cvj       20   0   67890  23456  15678 S   1.8   0.2   0:01.67 node';
      
      case 'htop':
        return 'htop 3.2.1 - CVJ Terminal OS\n┌─ 1  [███████████████████████████████████████████████████████████ 63.2%]─┐\n│  2  [████████████████████████████████████████ 40.1%]                      │\n│  3  [██████████████████████████████████████████████████████████████ 66.7%]│\n│  4  [██████████████████████ 22.3%]                                        │\n│  5  [███████████████████████████████████████████████████████ 59.8%]      │\n│  6  [█████████████████████████ 25.1%]                                     │\n│  7  [██████████████████████████████████████████████████████████ 62.4%]   │\n│  8  [███████████████ 15.2%]                                               │\n├─────────────────────────────────────────────────────────────────────────┤\n│ Mem[████████████████████████████████████████████ 4.00G/12.0G]            │\n│ Swp[████████████████████ 512M/2.00G]                                      │\n└─────────────────────────────────────────────────────────────────────────┘\n\n  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command\n 1234 cvj        20   0  8892  3456  2890 S  0.1  0.0  0:01.23 bash\n 2345 cvj        20   0 45678 12345  8901 R  2.3  0.1  0:02.45 cvj-terminal\n 3456 cvj        20   0 67890 23456 15678 S  1.8  0.2  0:01.67 node server.js\n\nF1Help F2Setup F3Search F4Filter F5Tree F6SortBy F7Nice F8Nice+ F9Kill F10Quit';

      // System Information
      case 'df':
        if (args.includes('-h')) {
          return 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/block/sda1  125G   94G   31G  76% /\n/dev/block/sda2  2.0G  512M  1.5G  25% /boot\ntmpfs           6.0G   12M  6.0G   1% /tmp\n/dev/shm        6.0G     0  6.0G   0% /dev/shm\n/dev/block/sdb1  500G  123G  377G  25% /data';
        }
        return 'Filesystem     1K-blocks      Used Available Use% Mounted on\n/dev/block/sda1  131072000  98304000  32768000  76% /\n/dev/block/sda2    2097152    524288   1572864  25% /boot\ntmpfs             6291456     12288   6279168   1% /tmp\n/dev/block/sdb1  524288000 129024000 395264000  25% /data';
      
      case 'free':
        if (args.includes('-h')) {
          return '               total        used        free      shared  buff/cache   available\nMem:            12G         4.0G        6.0G        100M        2.0G        8.0G\nSwap:          2.0G        512M        1.5G';
        }
        return '               total        used        free      shared  buff/cache   available\nMem:        12582912     4194304     6291456      102400     2097152     8388608\nSwap:        2097152      524288     1572864';
      
      case 'lscpu':
        return 'Architecture:          aarch64\nByte Order:            Little Endian\nCPU(s):                8\nOn-line CPU(s) list:   0-7\nThread(s) per core:    1\nCore(s) per socket:    8\nSocket(s):             1\nStepping:              r1p0\nCPU max MHz:           3200.0000\nCPU min MHz:           300.0000\nBogoMIPS:              38.40\nFlags:                 fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp ssbs\nModel name:            Snapdragon 8 Gen 2\nL1d cache:             64 KiB\nL1i cache:             64 KiB\nL2 cache:              512 KiB\nL3 cache:              8 MiB\nVulnerability Itlb multihit:     Not affected\nVulnerability L1tf:              Not affected\nVulnerability Mds:               Not affected\nVulnerability Meltdown:          Not affected\nVulnerability Spec store bypass: Mitigation; Speculative Store Bypass disabled\nVulnerability Spectre v1:        Mitigation; __user pointer sanitization\nVulnerability Spectre v2:        Mitigation; Branch predictor hardening';

      
      default:
        // Check if it looks like a common command with typo
        const suggestions = ['ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'ps', 'top', 'git', 'vim', 'nano', 'docker', 'python3', 'node'];
        const suggestion = suggestions.find(s => 
          Math.abs(s.length - cmd.length) <= 2 && 
          (s.includes(cmd.slice(0, 2)) || cmd.includes(s.slice(0, 2)))
        );
        
        return `bash: ${cmd}: command not found${suggestion ? `\n\nDid you mean: ${suggestion}?` : ''}\n\nType 'help' for the complete CVJ Terminal OS command reference.`;
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
        return 'text-terminal-cyan font-bold';
      case 'system':
        return 'text-terminal-yellow font-semibold';
      default:
        return 'text-terminal-green';
    }
  };

  return (
    <Card className="bg-gradient-terminal terminal-glow p-6 h-96 flex flex-col border border-primary/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-terminal-green font-cyber">CVJ Terminal OS</span>
          <span className="text-xs text-muted-foreground">v1.0</span>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto font-mono text-sm space-y-1 mb-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
      >
        {lines.map((line) => (
          <div key={line.id} className={`${getLineClass(line.type)} whitespace-pre-wrap leading-relaxed`}>
            {line.content}
          </div>
        ))}
        
        {(isTyping || !isDemoRunning) && (
          <div className="flex items-center text-terminal-cyan font-bold">
            <span>cvj@terminal:~$ </span>
            <span>{currentInput}</span>
            <span className="animate-pulse ml-1 text-primary">█</span>
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
          className="flex-1 bg-black/20 border border-primary/30 rounded px-3 py-2 font-mono text-sm text-terminal-green focus:border-primary focus:outline-none focus:glow-primary placeholder:text-muted-foreground/50"
          placeholder="Enter Linux command..."
          autoFocus
        />
        <button
          onClick={runDemo}
          disabled={isDemoRunning || demoIndex >= DEMO_COMMANDS.length}
          className="px-4 py-2 bg-primary/20 border border-primary/50 rounded text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed neon-glow transition-all font-cyber text-sm"
        >
          {isDemoRunning ? 'Running...' : 'Demo'}
        </button>
      </div>
    </Card>
  );
}
