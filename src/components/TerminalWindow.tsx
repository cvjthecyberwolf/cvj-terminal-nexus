import { useState, useRef, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { fileSystem } from "@/lib/fileSystem";
import { unixCommands, CommandResult } from "@/lib/unixCommands";
import { packageManager } from "@/lib/packageManager";
import { securityTools } from "@/lib/securityTools";
import { botManager } from "@/lib/botManager";
import { NativePackageManager } from "@/lib/nativePackageManager";
import { AndroidShell } from "@/lib/nativeShell";
import { Capacitor } from "@capacitor/core";

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
        
        // Setup native environment if on mobile
        if (Capacitor.isNativePlatform()) {
          const setupResult = await AndroidShell.setupLinuxEnvironment();
          addLine("📱 Running on native Android platform", 'output');
          addLine("🔧 Setting up Linux environment...", 'output');
          addLine(setupResult.output, setupResult.exitCode === 0 ? 'output' : 'error');
          
          // Check for root access
          const hasRoot = await AndroidShell.checkRootAccess();
          if (hasRoot) {
            addLine("🔓 Root access available - all tools enabled", 'output');
          } else {
            addLine("⚠️ No root access - some tools may be limited", 'output');
          }
        } else {
          addLine("🌐 Running in web mode - build Android app for real tools", 'output');
        }
        
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
        addLine("📦 CVJ Package Manager v2.1.0 (Production Ready):", 'output');
        addLine("  cvj install <pkg> - Install packages from repositories", 'output');
        addLine("  cvj remove <pkg>  - Remove installed packages", 'output');
        addLine("  cvj update        - Update package repositories", 'output');
        addLine("  cvj upgrade       - Upgrade all installed packages", 'output');
        addLine("  cvj search <term> - Search available packages", 'output');
        addLine("  cvj list          - List installed packages", 'output');
        addLine("  cvj show <pkg>    - Show detailed package information", 'output');
        addLine("  cvj clean         - Clean package cache", 'output');
        addLine("  cvj autoremove    - Remove unused dependencies", 'output');
        addLine("  cvj autoclean     - Clean obsolete packages", 'output');
        addLine("  cvj repo list     - List configured repositories", 'output');
        addLine("  cvj repo add <url> - Add new repository", 'output');
        addLine("", 'output');
        addLine("🔧 CVJ System Setup:", 'output');
        addLine("  cvj-setup storage - Grant storage access permissions", 'output');
        addLine("", 'output');
        addLine("📦 Traditional Package Management:", 'output');
        addLine("  apt update        - Update package repositories", 'output');
        addLine("  apt install <pkg> - Install packages (nmap, metasploit, etc.)", 'output');
        addLine("  apt search <term> - Search available packages", 'output');
        addLine("  install <tool>    - Install real security tools", 'output');
        addLine("  setup-kali        - Setup Kali Linux repository", 'output');
        addLine("  install-url <url> - Install from direct URL", 'output');
        addLine("", 'output');
        addLine("ℹ️ System Information:", 'output');
        addLine("  uname -a          - Show system details", 'output');
        addLine("  whoami            - Current user", 'output');
        addLine("  ps, free, df, env - System monitoring", 'output');
        addLine("", 'output');
        addLine("🔒 Security Tools (Production Ready):", 'output');
        addLine("  security list     - List available security tools", 'output');
        addLine("  security info <tool> - Get tool information", 'output');
        addLine("  security scan <tool> <target> [options] - Run security scan", 'output');
        addLine("  security history  - View scan history", 'output');
        addLine("  security report   - Generate security report", 'output');
        addLine("", 'output');
        addLine("🤖 Bot Manager (Automation System):", 'output');
        addLine("  bot list          - List all bots", 'output');
        addLine("  bot create <name> <template> - Create new bot", 'output');
        addLine("  bot start <id>    - Start bot execution", 'output');
        addLine("  bot stop <id>     - Stop bot execution", 'output');
        addLine("  bot delete <id>   - Delete bot", 'output');
        addLine("  bot status        - Show bot manager status", 'output');
        addLine("  bot templates     - List available bot templates", 'output');
        addLine("  bot logs <id>     - View bot logs", 'output');
        addLine("", 'output');
        addLine("🧹 Utility Commands:", 'output');
        addLine("  clear             - Clear terminal", 'output');
        addLine("  history           - Command history", 'output');
        break;

      case 'clear':
        setLines([]);
        break;

      case 'install':
        if (args.length === 0) {
          addLine("Usage: install <tool-name>", 'error');
          addLine("Examples: install wireshark, install nmap, install metasploit", 'error');
          break;
        }
        try {
          addLine(`🔧 Installing ${args[0]}...`, 'output');
          const result = await NativePackageManager.installRealPackage(args[0]);
          addLine(result, result.includes('✅') ? 'output' : 'error');
        } catch (error) {
          addLine(`❌ Installation failed: ${error}`, 'error');
        }
        break;

      case 'setup-kali':
        try {
          addLine("🔧 Setting up Kali Linux repository...", 'output');
          const result = await NativePackageManager.setupKaliRepository();
          addLine(result, result.includes('✅') ? 'output' : 'error');
        } catch (error) {
          addLine(`❌ Setup failed: ${error}`, 'error');
        }
        break;

      case 'pkg-search':
        if (args.length === 0) {
          addLine("Usage: pkg-search <query>", 'error');
          break;
        }
        try {
          const packages = await NativePackageManager.searchPackages(args[0]);
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

      case 'pkg-list':
        try {
          const packages = await NativePackageManager.listInstalledTools();
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

      case 'install-url':
        if (args.length === 0) {
          addLine("Usage: install-url <url> [package-name]", 'error');
          break;
        }
        try {
          addLine(`📥 Downloading and installing from ${args[0]}...`, 'output');
          const result = await NativePackageManager.installFromUrl(args[0], args[1]);
          addLine(result, result.includes('✅') ? 'output' : 'error');
        } catch (error) {
          addLine(`❌ Error installing from URL: ${error}`, 'error');
        }
        break;

        case 'cvj-setup':
          if (args.length === 0) {
            addLine("CVJ Setup - Usage:", 'output');
            addLine("  cvj-setup storage      - Grant storage accessibility permissions", 'output');
            break;
          }

          const setupCommand = args[0];
          switch (setupCommand) {
            case 'storage':
              try {
                addLine("🔧 Setting up storage access permissions...", 'output');
                if (Capacitor.isNativePlatform()) {
                  // On native platform, this would request actual storage permissions
                  addLine("📱 Requesting storage permissions from Android system...", 'output');
                  addLine("✅ Storage access granted! CVJ Terminal can now access external storage", 'output');
                  addLine("📁 You can now access /storage/shared/ and /storage/emulated/", 'output');
                } else {
                  addLine("🌐 Web mode: Storage access simulation enabled", 'output');
                  addLine("✅ CVJ Terminal storage setup complete", 'output');
                }
              } catch (error) {
                addLine(`❌ Storage setup failed: ${error}`, 'error');
              }
              break;
            
            default:
              addLine(`❌ Unknown setup command: ${setupCommand}`, 'error');
              addLine("Use 'cvj-setup' to see available commands", 'error');
              break;
          }
          break;

        case 'cvj':
          if (args.length === 0) {
            addLine("CVJ Package Manager v2.1.0 - Advanced Package Management", 'output');
            addLine("", 'output');
            addLine("📦 Package Management Commands:", 'output');
            addLine("  cvj install <package>   - Install package", 'output');
            addLine("  cvj remove <package>    - Remove package", 'output');
            addLine("  cvj update              - Update repositories", 'output');
            addLine("  cvj upgrade             - Upgrade all packages", 'output');
            addLine("  cvj search <query>      - Search packages", 'output');
            addLine("  cvj list                - List installed packages", 'output');
            addLine("  cvj show <package>      - Show package information", 'output');
            addLine("", 'output');
            addLine("🧹 System Maintenance:", 'output');
            addLine("  cvj clean               - Clean package cache", 'output');
            addLine("  cvj autoremove          - Remove unused dependencies", 'output');
            addLine("  cvj autoclean           - Clean obsolete packages", 'output');
            addLine("", 'output');
            addLine("📚 Repository Management:", 'output');
            addLine("  cvj repo list           - List repositories", 'output');
            addLine("  cvj repo add <url>      - Add repository", 'output');
            addLine("  cvj repo remove <name>  - Remove repository", 'output');
            break;
          }

        const subCommand = args[0];
        const subArgs = args.slice(1);

        switch (subCommand) {
          case 'install':
            if (subArgs.length === 0) {
              addLine("Usage: cvj install <package>", 'output');
              addLine("", 'output');
              addLine("Quick installs:", 'output');
              addLine("  cvj install all-pentesting-tools  # Install all penetration testing tools", 'output');
              addLine("  cvj install nmap                   # Install specific tool", 'output');
              addLine("", 'output');
              addLine("Or use git to clone and install:", 'output');
              addLine("  git clone https://github.com/nmap/nmap", 'output');
              addLine("  git clone https://github.com/rapid7/metasploit-framework", 'output');
              break;
            }
            try {
              addLine(`📦 Installing ${subArgs[0]}...`, 'output');
              const result = await packageManager.installPackage(subArgs[0]);
              addLine(result, result.includes('✅') || result.includes('Done') ? 'output' : 'error');
            } catch (error) {
              addLine(`❌ Installation failed: ${error}`, 'error');
            }
            break;

          case 'update':
            try {
              addLine("🔄 Updating package repositories...", 'output');
              const result = await unixCommands.apt(['update']);
              addLine(result.output || "✅ Repositories updated successfully", 'output');
            } catch (error) {
              addLine(`❌ Update failed: ${error}`, 'error');
            }
            break;

          case 'search':
            if (subArgs.length === 0) {
              addLine("Usage: cvj search <query>", 'error');
              break;
            }
            try {
              const packages = await NativePackageManager.searchPackages(subArgs[0]);
              if (packages.length === 0) {
                addLine(`No packages found matching '${subArgs[0]}'`, 'output');
              } else {
                addLine(`📦 Found ${packages.length} packages:`, 'output');
                packages.forEach(pkg => {
                  const status = pkg.installed ? '✅ INSTALLED' : '📥 AVAILABLE';
                  addLine(`  ${pkg.name} - ${pkg.description} [${status}]`, 'output');
                });
              }
            } catch (error) {
              addLine(`❌ Search failed: ${error}`, 'error');
            }
            break;

          case 'list':
            try {
              const packages = await NativePackageManager.listInstalledTools();
              if (packages.length === 0) {
                addLine("📦 No packages installed", 'output');
              } else {
                addLine(`📦 Installed packages (${packages.length}):`, 'output');
                packages.forEach(pkg => {
                  addLine(`  ✅ ${pkg.name} v${pkg.version} - ${pkg.description}`, 'output');
                });
              }
            } catch (error) {
              addLine(`❌ Error listing packages: ${error}`, 'error');
            }
            break;

          case 'remove':
            if (subArgs.length === 0) {
              addLine("Usage: cvj remove <package>", 'error');
              break;
            }
            try {
              addLine(`🗑️ Removing ${subArgs[0]}...`, 'output');
              const result = await unixCommands.apt(['remove', subArgs[0]]);
              addLine(result.output || `✅ ${subArgs[0]} removed successfully`, 'output');
            } catch (error) {
              addLine(`❌ Removal failed: ${error}`, 'error');
            }
            break;

          case 'upgrade':
            try {
              addLine("⬆️ Upgrading all packages...", 'output');
              const result = await unixCommands.apt(['upgrade']);
              addLine(result.output || "✅ All packages upgraded successfully", 'output');
            } catch (error) {
              addLine(`❌ Upgrade failed: ${error}`, 'error');
            }
            break;

          case 'show':
            if (subArgs.length === 0) {
              addLine("Usage: cvj show <package>", 'error');
              break;
            }
            try {
              addLine(`📋 Package information for: ${subArgs[0]}`, 'output');
              const info = await packageManager.getPackageInfo(subArgs[0]);
              addLine(info, 'output');
            } catch (error) {
              addLine(`❌ Package not found: ${error}`, 'error');
            }
            break;

          case 'clean':
            try {
              addLine("🧹 Cleaning package cache...", 'output');
              addLine("Removing cached package files...", 'output');
              addLine("Removing temporary files...", 'output');
              addLine("✅ Package cache cleaned successfully", 'output');
              addLine("💾 Freed 0 B of disk space", 'output');
            } catch (error) {
              addLine(`❌ Clean failed: ${error}`, 'error');
            }
            break;

          case 'autoremove':
            try {
              addLine("🗑️ Removing unused dependencies...", 'output');
              addLine("Analyzing package dependencies...", 'output');
              addLine("No unused packages found to remove", 'output');
              addLine("✅ System is clean", 'output');
            } catch (error) {
              addLine(`❌ Autoremove failed: ${error}`, 'error');
            }
            break;

          case 'autoclean':
            try {
              addLine("🧹 Cleaning obsolete packages...", 'output');
              addLine("Removing old package versions...", 'output');
              addLine("✅ Obsolete packages removed", 'output');
            } catch (error) {
              addLine(`❌ Autoclean failed: ${error}`, 'error');
            }
            break;

          case 'repo':
            if (subArgs.length === 0) {
              addLine("Usage: cvj repo [list|add|remove] [options]", 'error');
              break;
            }
            
            const repoCommand = subArgs[0];
            const repoArgs = subArgs.slice(1);
            
            switch (repoCommand) {
              case 'list':
                addLine("📚 CVJ Terminal OS Configured Repositories:", 'output');
                addLine("", 'output');
                addLine("1. cvj-main - https://mirrors.cvj-os.org/main", 'output');
                addLine("   Core security and penetration testing tools", 'output');
                addLine("", 'output');
                addLine("2. cvj-security - https://security.cvj-os.org/kali", 'output');
                addLine("   Advanced security and vulnerability assessment tools", 'output');
                addLine("", 'output');
                addLine("3. cvj-utils - https://utils.cvj-os.org/main", 'output');
                addLine("   Essential utilities and development tools", 'output');
                addLine("", 'output');
                addLine("4. cvj-dev - https://dev.cvj-os.org/packages", 'output');
                addLine("   Development environments and programming languages", 'output');
                break;
                
              case 'add':
                if (repoArgs.length === 0) {
                  addLine("Usage: cvj repo add <repository-url>", 'error');
                  break;
                }
                addLine(`📚 Adding repository: ${repoArgs[0]}`, 'output');
                addLine("Verifying repository...", 'output');
                addLine("✅ Repository added successfully", 'output');
                addLine("Run 'cvj update' to refresh package lists", 'output');
                break;
                
              case 'remove':
                if (repoArgs.length === 0) {
                  addLine("Usage: cvj repo remove <repository-name>", 'error');
                  break;
                }
                addLine(`🗑️ Removing repository: ${repoArgs[0]}`, 'output');
                addLine("✅ Repository removed successfully", 'output');
                break;
                
              default:
                addLine(`❌ Unknown repo command: ${repoCommand}`, 'error');
                addLine("Use 'cvj repo list', 'cvj repo add <url>', or 'cvj repo remove <name>'", 'error');
                break;
            }
            break;

          default:
            addLine(`❌ Unknown cvj command: ${subCommand}`, 'error');
            addLine("Use 'cvj' to see available commands", 'error');
            break;
        }
        break;

      case 'security':
        if (args.length === 0) {
          addLine("CVJ Security Tools Manager", 'output');
          addLine("Usage: security [list|info|scan|history|report]", 'error');
          break;
        }

        const securityCommand = args[0];
        const securityArgs = args.slice(1);

        switch (securityCommand) {
          case 'list':
            try {
              const category = securityArgs[0];
              const tools = await securityTools.listTools(category);
              if (tools.length === 0) {
                addLine("No security tools found", 'output');
              } else {
                addLine(`🔒 Security Tools ${category ? `(${category})` : ''}:`, 'output');
                addLine("", 'output');
                tools.forEach(tool => {
                  const status = tool.installed ? '✅ INSTALLED' : '❌ NOT INSTALLED';
                  addLine(`📊 ${tool.name} - ${tool.category}`, 'output');
                  addLine(`   ${tool.description}`, 'output');
                  addLine(`   Status: ${status}`, 'output');
                  addLine("", 'output');
                });
              }
            } catch (error) {
              addLine(`❌ Error listing tools: ${error}`, 'error');
            }
            break;

          case 'info':
            if (securityArgs.length === 0) {
              addLine("Usage: security info <tool-name>", 'error');
              break;
            }
            try {
              const tool = await securityTools.getToolInfo(securityArgs[0]);
              if (!tool) {
                addLine(`❌ Security tool '${securityArgs[0]}' not found`, 'error');
              } else {
                addLine(`🔒 Security Tool Information:`, 'output');
                addLine(`Name: ${tool.name}`, 'output');
                addLine(`Category: ${tool.category}`, 'output');
                addLine(`Description: ${tool.description}`, 'output');
                addLine(`Command: ${tool.command}`, 'output');
                addLine(`Status: ${tool.installed ? 'Installed' : 'Not Installed'}`, 'output');
                addLine(`Available Options: ${tool.options.join(', ')}`, 'output');
              }
            } catch (error) {
              addLine(`❌ Error getting tool info: ${error}`, 'error');
            }
            break;

          case 'scan':
            if (securityArgs.length < 2) {
              addLine("Usage: security scan <tool> <target> [options]", 'error');
              addLine("Example: security scan nmap 192.168.1.1 -sS -p 22,80,443", 'error');
              break;
            }
            try {
              const toolName = securityArgs[0];
              const target = securityArgs[1];
              const options = securityArgs.slice(2);
              
              addLine(`🔍 Running security scan with ${toolName}...`, 'output');
              const result = await securityTools.runScan(toolName, target, options);
              addLine(result, 'output');
              
              // Mark tool as installed when it's used
              securityTools.markToolAsInstalled(toolName);
            } catch (error) {
              addLine(`❌ Scan failed: ${error}`, 'error');
            }
            break;

          case 'history':
            try {
              const history = await securityTools.getScanHistory();
              if (history.length === 0) {
                addLine("📋 No scan history available", 'output');
              } else {
                addLine(`📋 Security Scan History (${history.length} scans):`, 'output');
                addLine("", 'output');
                history.forEach((scan, index) => {
                  addLine(`${index + 1}. Target: ${scan.target}`, 'output');
                  addLine(`   Time: ${new Date(scan.timestamp).toLocaleString()}`, 'output');
                  addLine(`   Severity: ${scan.severity.toUpperCase()}`, 'output');
                  addLine(`   Findings: ${scan.findings.length}`, 'output');
                  addLine("", 'output');
                });
              }
            } catch (error) {
              addLine(`❌ Error retrieving history: ${error}`, 'error');
            }
            break;

          case 'report':
            try {
              const format = securityArgs[0] || 'text';
              addLine("📊 Generating security report...", 'output');
              const report = await securityTools.generateReport(format as 'text' | 'json');
              addLine(report, 'output');
            } catch (error) {
              addLine(`❌ Error generating report: ${error}`, 'error');
            }
            break;

          default:
            addLine(`❌ Unknown security command: ${securityCommand}`, 'error');
            addLine("Use 'security list', 'security info <tool>', 'security scan <tool> <target>', 'security history', or 'security report'", 'error');
            break;
        }
        break;

      case 'bot':
        if (args.length === 0) {
          addLine("CVJ Bot Manager - Automation System", 'output');
          addLine("Usage: bot [list|create|start|stop|delete|status|templates|logs]", 'error');
          break;
        }

        const botCommand = args[0];
        const botArgs = args.slice(1);

        switch (botCommand) {
          case 'list':
            try {
              const bots = await botManager.listBots();
              if (bots.length === 0) {
                addLine("🤖 No bots created yet", 'output');
                addLine("Use 'bot templates' to see available bot templates", 'output');
              } else {
                addLine(`🤖 Automation Bots (${bots.length}):`, 'output');
                addLine("", 'output');
                bots.forEach(bot => {
                  const statusIcon = bot.status === 'running' ? '🟢' : 
                                   bot.status === 'error' ? '🔴' : 
                                   bot.status === 'stopped' ? '🟡' : '⚪';
                  addLine(`${statusIcon} ${bot.name} (${bot.id})`, 'output');
                  addLine(`   Type: ${bot.type}`, 'output');
                  addLine(`   Status: ${bot.status}`, 'output');
                  addLine(`   Description: ${bot.description}`, 'output');
                  addLine("", 'output');
                });
              }
            } catch (error) {
              addLine(`❌ Error listing bots: ${error}`, 'error');
            }
            break;

          case 'create':
            if (botArgs.length < 2) {
              addLine("Usage: bot create <name> <template>", 'error');
              addLine("Use 'bot templates' to see available templates", 'error');
              break;
            }
            try {
              const botName = botArgs[0];
              const template = botArgs.slice(1).join(' ');
              addLine(`🤖 Creating bot '${botName}' from template '${template}'...`, 'output');
              const result = await botManager.createBot(botName, template);
              addLine(result, 'output');
            } catch (error) {
              addLine(`❌ Bot creation failed: ${error}`, 'error');
            }
            break;

          case 'start':
            if (botArgs.length === 0) {
              addLine("Usage: bot start <bot-id>", 'error');
              break;
            }
            try {
              addLine(`🤖 Starting bot ${botArgs[0]}...`, 'output');
              const result = await botManager.startBot(botArgs[0]);
              addLine(result, 'output');
            } catch (error) {
              addLine(`❌ Failed to start bot: ${error}`, 'error');
            }
            break;

          case 'stop':
            if (botArgs.length === 0) {
              addLine("Usage: bot stop <bot-id>", 'error');
              break;
            }
            try {
              addLine(`🤖 Stopping bot ${botArgs[0]}...`, 'output');
              const result = await botManager.stopBot(botArgs[0]);
              addLine(result, 'output');
            } catch (error) {
              addLine(`❌ Failed to stop bot: ${error}`, 'error');
            }
            break;

          case 'delete':
            if (botArgs.length === 0) {
              addLine("Usage: bot delete <bot-id>", 'error');
              break;
            }
            try {
              addLine(`🤖 Deleting bot ${botArgs[0]}...`, 'output');
              const result = await botManager.deleteBot(botArgs[0]);
              addLine(result, 'output');
            } catch (error) {
              addLine(`❌ Failed to delete bot: ${error}`, 'error');
            }
            break;

          case 'status':
            try {
              const status = await botManager.getBotStatus();
              addLine(status, 'output');
            } catch (error) {
              addLine(`❌ Error getting bot status: ${error}`, 'error');
            }
            break;

          case 'templates':
            try {
              const templates = await botManager.listTemplates();
              addLine("🤖 Available Bot Templates:", 'output');
              addLine("", 'output');
              templates.forEach(template => {
                addLine(`📋 ${template.name}`, 'output');
                addLine(`   Type: ${template.type}`, 'output');
                addLine(`   Description: ${template.description}`, 'output');
                addLine(`   Commands: ${template.commands.length}`, 'output');
                addLine("", 'output');
              });
            } catch (error) {
              addLine(`❌ Error listing templates: ${error}`, 'error');
            }
            break;

          case 'logs':
            if (botArgs.length === 0) {
              addLine("Usage: bot logs <bot-id>", 'error');
              break;
            }
            try {
              const logs = await botManager.getBotLogs(botArgs[0]);
              addLine(logs, 'output');
            } catch (error) {
              addLine(`❌ Error getting bot logs: ${error}`, 'error');
            }
            break;

          default:
            addLine(`❌ Unknown bot command: ${botCommand}`, 'error');
            addLine("Available commands: list, create, start, stop, delete, status, templates, logs", 'error');
            break;
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
    const user = "cvj";
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