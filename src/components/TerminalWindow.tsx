import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'system';
  content: string;
  timestamp: Date;
}

// Package database simulation
const PACKAGES_DB = {
  'curl': { version: '7.88.1', description: 'command line tool for transferring data', installed: true },
  'git': { version: '2.39.2', description: 'fast, scalable, distributed revision control system', installed: true },
  'vim': { version: '9.0.1000', description: 'Vi IMproved - enhanced vi editor', installed: true },
  'python3': { version: '3.11.7', description: 'interactive high-level object-oriented language', installed: true },
  'nodejs': { version: '18.19.0', description: 'evented I/O for V8 javascript', installed: false },
  'docker.io': { version: '24.0.7', description: 'Linux container runtime', installed: false },
  'nginx': { version: '1.22.1', description: 'small, powerful, scalable web/proxy server', installed: false },
  'postgresql': { version: '15.4', description: 'object-relational SQL database', installed: false },
  'redis': { version: '7.0.12', description: 'persistent key-value database', installed: false },
  'htop': { version: '3.2.2', description: 'interactive processes viewer', installed: true },
  'neofetch': { version: '7.1.0', description: 'fast, highly customizable system info script', installed: true },
  'tmux': { version: '3.3a', description: 'terminal multiplexer', installed: false },
  'zsh': { version: '5.9', description: 'shell designed for interactive use', installed: false },
};

const DEMO_COMMANDS = [
  { command: "neofetch", output: "CVJ Terminal OS v1.0\nKernel: Android 13\nCPU: Snapdragon 8 Gen 2\nMemory: 12GB LPDDR5\nStorage: 512GB UFS 4.0" },
  { command: "apt update", output: "Hit:1 http://deb.debian.org/debian bookworm InRelease\nReading package lists... Done\nBuilding dependency tree... Done" },
  { command: "apt search nodejs", output: "nodejs/stable 18.19.0-1 arm64\n  evented I/O for V8 javascript - runtime executable" },
  { command: "git clone https://github.com/user/repo", output: "Cloning into 'repo'...\nremote: Enumerating objects: 247, done.\nremote: Total 247 (delta 0), reused 0 (delta 0)\nReceiving objects: 100% (247/247), done." },
  { command: "ls -la", output: "drwxr-xr-x 8 cvj cvj  4096 Dec 18 14:30 .\ndrwxr-xr-x 3 cvj cvj  4096 Dec 18 14:30 ..\n-rw-r--r-- 1 cvj cvj   220 Dec 18 14:30 .bashrc\ndrwxr-xr-x 2 cvj cvj  4096 Dec 18 14:30 scripts\ndrwxr-xr-x 2 cvj cvj  4096 Dec 18 14:30 tools" },
  { command: "docker ps", output: "CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES" },
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
               '📦 PACKAGE MANAGERS:\n  apt, apt-get, dpkg, snap, flatpak, pip, npm, yarn, cargo\n' +
               '🔄 GITHUB INTEGRATION:\n  git clone, git pull, git push, gh repo clone, gh release download\n' +
               '📚 ARCHIVES:\n  tar, zip, unzip, gzip, gunzip, bzip2, bunzip2, 7z\n' +
               '👨‍💻 DEVELOPMENT:\n  git, python3, node, npm, pip, gcc, make, cmake, docker, kubernetes\n' +
               '✏️  EDITORS:\n  vim, nano, emacs, gedit\n' +
               '🛠️  UTILITIES:\n  echo, date, cal, bc, history, alias, which, type, man, info\n' +
               '🔒 SECURITY:\n  sudo, su, passwd, ssh, scp, rsync, gpg\n' +
               '📊 MONITORING:\n  watch, iostat, vmstat, sar, dmesg, journalctl\n' +
               '🎯 TERMINAL:\n  clear, exit, logout, screen, tmux, bash, zsh\n\n' +
               'PACKAGE MANAGEMENT EXAMPLES:\n' +
               '  apt update && apt upgrade\n' +
               '  apt install nodejs nginx docker.io\n' +
               '  apt search python\n' +
               '  git clone https://github.com/user/repo\n' +
               '  npm install -g create-react-app';
      
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
      // Package Management - APT
      case 'apt':
      case 'apt-get':
        const subCmd = args[0];
        if (subCmd === 'update') {
          return 'Hit:1 http://deb.debian.org/debian bookworm InRelease\nHit:2 http://deb.debian.org/debian bookworm-updates InRelease\nHit:3 http://security.debian.org/debian-security bookworm-security InRelease\nReading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nAll packages are up to date.';
        }
        if (subCmd === 'upgrade') {
          return 'Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nCalculating upgrade... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.';
        }
        if (subCmd === 'install') {
          const packages = args.slice(1);
          if (packages.length === 0) return 'apt: no packages specified for installation';
          let result = 'Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\n';
          packages.forEach(pkg => {
            if (PACKAGES_DB[pkg]) {
              const info = PACKAGES_DB[pkg];
              if (info.installed) {
                result += `${pkg} is already the newest version (${info.version}).\n`;
              } else {
                result += `The following NEW packages will be installed:\n  ${pkg}\n`;
                result += `Get:1 http://deb.debian.org/debian bookworm/main arm64 ${pkg} ${info.version} [2,345 kB]\n`;
                result += `Fetched 2,345 kB in 1s (2,345 kB/s)\nSelecting previously unselected package ${pkg}.\n`;
                result += `(Reading database ... 247891 files and directories currently installed.)\n`;
                result += `Preparing to unpack .../00-${pkg}_${info.version}_arm64.deb ...\n`;
                result += `Unpacking ${pkg} (${info.version}) ...\nSetting up ${pkg} (${info.version}) ...\n`;
                PACKAGES_DB[pkg].installed = true;
              }
            } else {
              result += `E: Unable to locate package ${pkg}\n`;
            }
          });
          return result;
        }
        if (subCmd === 'remove') {
          const packages = args.slice(1);
          if (packages.length === 0) return 'apt: no packages specified for removal';
          let result = 'Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\n';
          packages.forEach(pkg => {
            if (PACKAGES_DB[pkg] && PACKAGES_DB[pkg].installed) {
              result += `The following packages will be REMOVED:\n  ${pkg}\n`;
              result += `(Reading database ... 247891 files and directories currently installed.)\n`;
              result += `Removing ${pkg} (${PACKAGES_DB[pkg].version}) ...\n`;
              PACKAGES_DB[pkg].installed = false;
            } else {
              result += `Package '${pkg}' is not installed, so not removed\n`;
            }
          });
          return result;
        }
        if (subCmd === 'search') {
          const query = args[1];
          if (!query) return 'apt search: argument required';
          let result = 'Sorting... Done\nFull Text Search... Done\n';
          Object.entries(PACKAGES_DB).forEach(([pkg, info]) => {
            if (pkg.includes(query) || info.description.includes(query)) {
              const status = info.installed ? '[installed]' : '';
              result += `${pkg}/${info.version} arm64 ${status}\n  ${info.description}\n\n`;
            }
          });
          return result || `No packages found matching '${query}'`;
        }
        if (subCmd === 'list') {
          if (args[1] === '--installed') {
            let result = 'Listing... Done\n';
            Object.entries(PACKAGES_DB).forEach(([pkg, info]) => {
              if (info.installed) {
                result += `${pkg}/${info.version} arm64 [installed]\n`;
              }
            });
            return result;
          }
          return 'WARNING: apt does not have a stable CLI interface. Use with caution in scripts.\n\nNOTE: This is only a simulation of apt functionality.';
        }
        return 'Usage: apt <command> [options]\n\nCommands:\n  update - update package index\n  upgrade - upgrade installed packages\n  install <pkg> - install package\n  remove <pkg> - remove package\n  search <term> - search for packages\n  list [--installed] - list packages';

      // Package Management - DPKG
      case 'dpkg':
        if (args[0] === '-l' || args[0] === '--list') {
          let result = 'Desired=Unknown/Install/Remove/Purge/Hold\n| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend\n|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)\n||/ Name           Version      Architecture Description\n+++-==============-============-============-=================================\n';
          Object.entries(PACKAGES_DB).forEach(([pkg, info]) => {
            if (info.installed) {
              result += `ii  ${pkg.padEnd(14)} ${info.version.padEnd(12)} arm64        ${info.description}\n`;
            }
          });
          return result;
        }
        return 'dpkg: package management for CVJ Terminal OS\nUsage: dpkg [options] <command>\n\nCommands:\n  -l, --list                List packages\n  -s, --status <package>    Display package status';

      // GitHub Integration
      case 'git':
        if (args[0] === 'clone') {
          const repoUrl = args[1];
          if (!repoUrl) return 'fatal: You must specify a repository to clone.';
          
          // Extract repo name from URL
          const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repository';
          
          return `Cloning into '${repoName}'...\nremote: Enumerating objects: 247, done.\nremote: Counting objects: 100% (247/247), done.\nremote: Compressing objects: 100% (156/156), done.\nremote: Total 247 (delta 91), reused 123 (delta 45), pack-reused 0\nReceiving objects: 100% (247/247), 1.23 MiB | 2.45 MiB/s, done.\nResolving deltas: 100% (91/91), done.\n\n✓ Repository cloned successfully to ./${repoName}/`;
        }
        if (args[0] === 'status') return 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean';
        if (args[0] === '--version') return 'git version 2.39.2';
        if (args[0] === 'log') return 'commit abc123def456 (HEAD -> main, origin/main)\nAuthor: CVJ <cvj@terminal.os>\nDate:   Wed Dec 18 14:30:00 2024 +0000\n\n    Initial commit for CVJ Terminal OS\n\ncommit def456abc123\nAuthor: CVJ <cvj@terminal.os>\nDate:   Tue Dec 17 10:15:00 2024 +0000\n\n    Add package management system';
        if (args[0] === 'branch') return '* main\n  development\n  feature/terminal-enhancements\n  feature/package-manager';
        if (args[0] === 'pull') return 'Already up to date.';
        if (args[0] === 'push') return 'Everything up-to-date';
        return 'usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]\n           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]\n           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n           [--super-prefix=<path>] [--config-env=<name>=<envvar>]\n           <command> [<args>]';

      // Node Package Manager
      case 'npm':
        if (args[0] === '--version') return '9.2.0';
        if (args[0] === 'install') {
          const packages = args.slice(1);
          if (packages.length === 0) return 'npm: no packages specified';
          let result = '';
          packages.forEach(pkg => {
            if (pkg.startsWith('-g')) return;
            const isGlobal = args.includes('-g');
            result += `${isGlobal ? 'added' : 'added'} ${pkg}@latest\n`;
          });
          result += `\naudited 247 packages in 2.3s\n\n89 packages are looking for funding\n  run \`npm fund\` for details\n\nfound 0 vulnerabilities`;
          return result;
        }
        if (args[0] === 'list') return 'cvj-terminal@1.0.0 /data/data/com.cvj.terminal/files/home\n├── express@4.18.2\n├── lodash@4.17.21\n├── react@18.2.0\n└── typescript@5.0.4';
        if (args[0] === 'init') return 'This utility will walk you through creating a package.json file.\nPress ^C at any time to quit.\npackage name: (project) ';
        return 'Usage: npm <command>\n\nwhere <command> is one of:\n    access, adduser, audit, bin, bugs, c, cache, ci, cit,\n    clean-install, clean-install-test, completion, config,\n    create, ddp, dedupe, deprecate, dist-tag, docs, doctor,\n    edit, exec, explain, explore, find-dupes, fund, get, help,\n    hook, i, init, install, install-ci-test, install-test, it,\n    link, list, ln, login, logout, ls, outdated, owner, pack,\n    ping, prefix, profile, prune, publish, rebuild, repo,\n    restart, root, run, run-script, s, se, search, set, shrinkwrap,\n    star, stars, start, stop, t, team, test, token, tst, un,\n    uninstall, unpublish, unstar, up, update, v, version, view,\n    whoami';

      // Python Package Manager
      case 'pip':
      case 'pip3':
        if (args[0] === '--version') return 'pip 23.3.1 from /usr/lib/python3/dist-packages/pip (python 3.11)';
        if (args[0] === 'install') {
          const packages = args.slice(1);
          if (packages.length === 0) return 'ERROR: You must give at least one requirement to install';
          let result = 'Collecting packages...\n';
          packages.forEach(pkg => {
            result += `Collecting ${pkg}\n  Downloading ${pkg}-1.0.0-py3-none-any.whl (123 kB)\n`;
          });
          result += 'Installing collected packages: ' + packages.join(', ') + '\n';
          result += `Successfully installed ${packages.join('-1.0.0 ')}-1.0.0`;
          return result;
        }
        if (args[0] === 'list') return 'Package    Version\n---------- -------\nnumpy      1.24.3\npandas     2.0.3\nrequests   2.31.0\nFlask      2.3.3\nDjango     4.2.7\npillow     10.0.1\nscipy      1.11.4';
        if (args[0] === 'show') {
          const pkg = args[1];
          if (!pkg) return 'ERROR: Please provide package name';
          return `Name: ${pkg}\nVersion: 1.0.0\nSummary: Python package for CVJ Terminal OS\nHome-page: https://github.com/cvj/${pkg}\nAuthor: CVJ Terminal Team\nLicense: MIT\nLocation: /usr/lib/python3/dist-packages\nRequires: \nRequired-by: `;
        }
        return 'Usage: pip <command> [options]\n\nCommands:\n  install                     Install packages.\n  download                    Download packages.\n  uninstall                   Uninstall packages.\n  freeze                      Output installed packages in requirements format.\n  list                        List installed packages.\n  show                        Show information about installed packages.\n  check                       Verify installed packages have compatible dependencies.\n  search                      Search PyPI for packages.\n  wheel                       Build wheels from your requirements.\n  hash                        Compute hashes of package archives.\n  completion                  A helper command used for command completion.\n  debug                       Show information useful for debugging.\n  help                        Show help for commands.';

      // Snap Package Manager
      case 'snap':
        if (args[0] === 'list') {
          return 'Name    Version   Rev   Tracking       Publisher   Notes\ncore20  20231123  2105  latest/stable  canonical✓  base\ncore22  20231123  864   latest/stable  canonical✓  base\nsnapd   2.60.4    20092 latest/stable  canonical✓  snapd';
        }
        if (args[0] === 'find') {
          const query = args[1] || '';
          return `Name               Version    Publisher    Notes  Summary\ncode               1.84.2     microsoft✓   -      Visual Studio Code\nfirefox            119.0      mozilla✓     -      Mozilla Firefox\nvscode             1.84.2     microsoft✓   -      Visual Studio Code\ndiscord            0.0.30     snapcrafters -      Discord for Linux`;
        }
        if (args[0] === 'install') {
          const pkg = args[1];
          if (!pkg) return 'error: the required argument `<snap>` was not provided';
          return `Installing ${pkg}...\n${pkg} installed`;
        }
        return 'Usage: snap <command> [options]\n\nCommands:\n  list      List installed snaps\n  find      Find packages to install\n  install   Install snaps\n  remove    Remove snaps\n  refresh   Refresh snaps\n  info      Show detailed information about snaps';

      // Docker
      case 'docker':
        if (args[0] === '--version') return 'Docker version 24.0.7, build afdd53b';
        if (args[0] === 'ps') return 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES';
        if (args[0] === 'images') return 'REPOSITORY   TAG       IMAGE ID       CREATED       SIZE\nubuntu       latest    174c8c134b2a   2 weeks ago   77.8MB\nnginx        latest    605c77e624dd   3 weeks ago   141MB';
        if (args[0] === 'pull') {
          const image = args[1] || 'ubuntu';
          return `Using default tag: latest\nlatest: Pulling from library/${image}\n2d473b07cdd5: Pull complete\nDigest: sha256:20e1fc0a...\nStatus: Downloaded newer image for ${image}:latest\ndocker.io/library/${image}:latest`;
        }
        if (args[0] === 'run') {
          const image = args[args.length - 1];
          return `Unable to find image '${image}:latest' locally\nlatest: Pulling from library/${image}\nPull complete\nStarting container...`;
        }
        return 'Usage:  docker [OPTIONS] COMMAND\n\nA self-sufficient runtime for containers\n\nManagement Commands:\n  container   Manage containers\n  image       Manage images\n  network     Manage networks\n  volume      Manage volumes\n\nCommands:\n  attach      Attach local standard input, output, and error streams to a running container\n  build       Build an image from a Dockerfile\n  commit      Create a new image from a container\'s changes\n  cp          Copy files/folders between a container and the local filesystem\n  create      Create a new container\n  diff        Inspect changes to files or directories on a container\'s filesystem\n  events      Get real time events from the server\n  exec        Run a command in a running container\n  export      Export a container\'s filesystem as a tar archive\n  history     Show the history of an image\n  images      List images\n  import      Import the contents from a tarball to create a filesystem image\n  info        Display system-wide information\n  inspect     Return low-level information on Docker objects\n  kill        Kill one or more running containers\n  load        Load an image from a tar archive or STDIN\n  login       Log in to a Docker registry\n  logout      Log out from a Docker registry\n  logs        Fetch the logs of a container\n  pause       Pause all processes within one or more containers\n  port        List port mappings or a specific mapping for the container\n  ps          List containers\n  pull        Pull an image or a repository from a registry\n  push        Push an image or a repository to a registry\n  rename      Rename a container\n  restart     Restart one or more containers\n  rm          Remove one or more containers\n  rmi         Remove one or more images\n  run         Run a command in a new container\n  save        Save one or more images to a tar archive (streamed to STDOUT by default)\n  search      Search the Docker Hub for images\n  start       Start one or more stopped containers\n  stats       Display a live stream of container(s) resource usage statistics\n  stop        Stop one or more running containers\n  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE\n  top         Display the running processes of a container\n  unpause     Unpause all processes within one or more containers\n  update      Update configuration of one or more containers\n  version     Show the Docker version information\n  wait        Block until one or more containers stop, then print their exit codes';

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
