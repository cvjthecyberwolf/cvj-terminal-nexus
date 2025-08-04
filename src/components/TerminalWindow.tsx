import { useState, useRef, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { fileSystem } from "@/lib/fileSystem";
import { unixCommands, CommandResult } from "@/lib/unixCommands";
import { packageManager } from "@/lib/packageManager";

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error';
}

const TerminalWindow = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: "CVJ Terminal Nexus v2.1.0 - Real Unix Terminal Environment", type: 'output' },
    { text: "Built with real file system, package management, and command execution", type: 'output' },
    { text: "Initializing real file system...", type: 'output' },
    { text: "", type: 'output' }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDir, setCurrentDir] = useState("/home/kali");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Initialize the real file system
  useEffect(() => {
    const initFileSystem = async () => {
      try {
        await fileSystem.init();
        setIsInitialized(true);
        addLine("✅ Real file system initialized successfully!", 'output');
        addLine("✅ Real Unix commands available with persistent storage", 'output');
        addLine("✅ Real package management system ready", 'output');
        addLine("Type 'help' for available commands", 'output');
        addLine("", 'output');
      } catch (error) {
        addLine(`❌ Failed to initialize file system: ${error}`, 'error');
      }
    };
    initFileSystem();
  }, []);

  const addLine = useCallback((text: string, type: 'input' | 'output' | 'error' = 'output') => {
    setLines(prev => [...prev, { text, type }]);
  }, []);

  const executeRealCommand = async (command: string): Promise<CommandResult> => {
    const [cmd, ...args] = command.trim().split(/\s+/);
    
    // Handle real Unix commands
    switch (cmd) {
      case 'ls': return await unixCommands.ls(args);
      case 'pwd': return await unixCommands.pwd();
      case 'cd': 
        const result = await unixCommands.cd(args);
        if (result.exitCode === 0) {
          setCurrentDir(fileSystem.getCurrentDirectory());
        }
        return result;
      case 'cat': return await unixCommands.cat(args);
      case 'echo': return await unixCommands.echo(args);
      case 'mkdir': return await unixCommands.mkdir(args);
      case 'rm': return await unixCommands.rm(args);
      case 'grep': return await unixCommands.grep(args);
      case 'wget': return await unixCommands.wget(args);
      case 'touch': return await unixCommands.touch(args);
      case 'uname': return await unixCommands.uname(args);
      case 'whoami': return await unixCommands.whoami();
      case 'id': return await unixCommands.id();
      case 'ps': return await unixCommands.ps(args);
      case 'df': return await unixCommands.df(args);
      case 'free': return await unixCommands.free(args);
      case 'env': return await unixCommands.env();
      case 'apt': return await unixCommands.apt(args);
      default:
        return { output: '', error: `${cmd}: command not found`, exitCode: 127 };
    }
  };

  const executeCommand = useCallback(async (command: string) => {
    if (!isInitialized) {
      addLine("⚠️ File system not initialized yet. Please wait...", 'error');
      return;
    }

    const [cmd, ...args] = command.trim().split(/\s+/);
    
    // Handle special CVJ Terminal commands
    switch (cmd) {
      case 'help':
        addLine("CVJ Terminal Nexus - Real Unix Environment Commands:", 'output');
        addLine("", 'output');
        addLine("🔧 Real Unix Commands (with persistent file system):", 'output');
        addLine("  ls [-la] [path]   - List directory contents", 'output');
        addLine("  cd [path]         - Change directory", 'output');
        addLine("  pwd               - Print working directory", 'output');
        addLine("  mkdir <dir>       - Create directory", 'output');
        addLine("  rm <file>         - Remove files", 'output');
        addLine("  cat <file>        - Display file contents", 'output');
        addLine("  echo <text>       - Display text", 'output');
        addLine("  touch <file>      - Create/update file", 'output');
        addLine("  grep <pattern> <file> - Search in files", 'output');
        addLine("  wget <url>        - Download files from internet", 'output');
        addLine("", 'output');
        addLine("📦 Real Package Management:", 'output');
        addLine("  apt update        - Update package repositories", 'output');
        addLine("  apt install <pkg> - Install packages (nmap, metasploit, etc.)", 'output');
        addLine("  apt search <term> - Search available packages", 'output');
        addLine("  pkg-info <name>   - Show package information", 'output');
        addLine("  pkg-list          - List installed packages", 'output');
        addLine("  install-url <url> - Install from direct URL", 'output');
        addLine("", 'output');
        addLine("ℹ️ System Information:", 'output');
        addLine("  uname -a          - Show system details", 'output');
        addLine("  whoami            - Current user", 'output');
        addLine("  ps, free, df, env - System monitoring", 'output');
        addLine("", 'output');
        addLine("🧹 Utility Commands:", 'output');
        addLine("  clear             - Clear terminal", 'output');
        addLine("  history           - Command history", 'output');
        break;

      case 'clear':
        setLines([]);
        break;

      case 'pkg-search':
        if (args.length === 0) {
          addLine("Usage: pkg-search <query>", 'error');
          break;
        }
        try {
          const packages = await packageManager.searchPackages(args[0]);
          if (packages.length === 0) {
            addLine(`No packages found matching '${args[0]}'`, 'output');
          } else {
            addLine(`Found ${packages.length} packages:`, 'output');
            packages.forEach(pkg => {
              const status = pkg.installed ? '[INSTALLED]' : '[AVAILABLE]';
              addLine(`  ${pkg.name} - ${pkg.description} ${status}`, 'output');
            });
          }
        } catch (error) {
          addLine(`Error searching packages: ${error}`, 'error');
        }
        break;

      case 'pkg-install':
        if (args.length === 0) {
          addLine("Usage: pkg-install <package-name>", 'error');
          break;
        }
        try {
          const result = await packageManager.installPackage(args[0]);
          addLine(result, 'output');
        } catch (error) {
          addLine(`Error installing package: ${error}`, 'error');
        }
        break;

      case 'pkg-list':
        try {
          const packages = await packageManager.listInstalledPackages();
          if (packages.length === 0) {
            addLine("No packages installed", 'output');
          } else {
            addLine("Installed packages:", 'output');
            packages.forEach(pkg => {
              addLine(`  ${pkg.name} v${pkg.version} - ${pkg.description}`, 'output');
            });
          }
        } catch (error) {
          addLine(`Error listing packages: ${error}`, 'error');
        }
        break;

      case 'pkg-info':
        if (args.length === 0) {
          addLine("Usage: pkg-info <package-name>", 'error');
          break;
        }
        try {
          const info = await packageManager.getPackageInfo(args[0]);
          addLine(info, 'output');
        } catch (error) {
          addLine(`Error getting package info: ${error}`, 'error');
        }
        break;

      case 'install-url':
        if (args.length === 0) {
          addLine("Usage: install-url <url> [package-name]", 'error');
          break;
        }
        try {
          addLine(`📥 Downloading and installing from ${args[0]}...`, 'output');
          const result = await packageManager.downloadAndInstallFromUrl(args[0], args[1]);
          addLine(`✅ ${result}`, 'output');
        } catch (error) {
          addLine(`❌ Error installing from URL: ${error}`, 'error');
        }
        break;

      case 'history':
        commandHistory.forEach((cmd, index) => {
          addLine(`${index + 1}  ${cmd}`, 'output');
        });
        break;

      // Handle all other commands through the real Unix command system
      default:
        try {
          const result = await executeRealCommand(command);
          if (result.output) {
            addLine(result.output, 'output');
          }
          if (result.error) {
            addLine(result.error, 'error');
          }
        } catch (error) {
          addLine(`Error executing command: ${error}`, 'error');
        }
        break;
    }
  }, [isInitialized, commandHistory]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const input = currentInput.trim();
    addLine(`${getPrompt()}${input}`, 'input');
    setCommandHistory(prev => [...prev, input]);
    setCurrentInput("");
    setHistoryIndex(-1);

    await executeCommand(input);
  }, [currentInput, executeCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    }
  }, [historyIndex, commandHistory]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [lines, isMobile]);

  const getPrompt = () => {
    const user = "kali";
    const hostname = "terminal";
    const dir = currentDir === "/home/kali" ? "~" : currentDir;
    return `${user}@${hostname}:${dir}$ `;
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono">
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-green-600"
      >
        {lines.map((line, index) => (
          <div 
            key={index} 
            className={`whitespace-pre-wrap break-words ${
              line.type === 'input' 
                ? 'text-white' 
                : line.type === 'error' 
                  ? 'text-red-400' 
                  : 'text-green-400'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-green-600">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 whitespace-nowrap">
            {getPrompt()}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none font-mono"
            placeholder={isInitialized ? "Enter command..." : "Initializing..."}
            disabled={!isInitialized}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </form>
    </div>
  );
};

export default TerminalWindow;
// Fixed export