import { fileSystem } from './fileSystem';
import { AndroidShell, FileInfo } from './nativeShell';
import { Capacitor } from '@capacitor/core';
import { osManager } from './osManager';
import { networkManager } from './networkManager';

export interface CommandResult {
  output: string;
  error?: string;
  exitCode: number;
}

// Real Unix command implementations with native Android integration
export class UnixCommands {
  private currentUser = 'cvj';
  private nativeCurrentDir: string = '/home/cvj';
  private environment: Record<string, string> = {
    PATH: '/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin',
    HOME: '/home/cvj',
    USER: 'cvj',
    SHELL: '/bin/bash',
    TERM: 'xterm-256color',
    LANG: 'en_US.UTF-8',
  };

  private isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes.toString();
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'K';
    if (bytes < 1024 * 1024 * 1024) return Math.round(bytes / (1024 * 1024)) + 'M';
    return Math.round(bytes / (1024 * 1024 * 1024)) + 'G';
  }

  private formatPermissions(file: FileInfo): string {
    const type = file.isDirectory ? 'd' : '-';
    const r = file.readable ? 'r' : '-';
    const w = file.writable ? 'w' : '-';
    const x = file.executable ? 'x' : '-';
    return `${type}${r}${w}${x}${r}-${x}${r}-${x}`;
  }

  async ls(args: string[] = []): Promise<CommandResult> {
    const flags = args.filter(arg => arg.startsWith('-'));
    const paths = args.filter(arg => !arg.startsWith('-'));
    const targetPath = paths[0] || '.';
    const showAll = flags.some(f => f.includes('a'));
    const longFormat = flags.some(f => f.includes('l'));
    const humanReadable = flags.some(f => f.includes('h'));

    // Use native shell when available
    if (this.isNative()) {
      try {
        const result = await AndroidShell.listDirectory(targetPath === '.' ? undefined : targetPath);
        
        if (result.error) {
          return { output: '', error: `ls: ${result.error}`, exitCode: 1 };
        }

        let files = result.files;
        if (!showAll) {
          files = files.filter(f => !f.name.startsWith('.'));
        }

        if (longFormat) {
          const output = files.map(file => {
            const perms = this.formatPermissions(file);
            const size = humanReadable ? this.formatFileSize(file.size) : file.size.toString().padStart(8);
            const date = file.modified.split(' ').slice(0, 2).join(' ');
            return `${perms} 1 ${this.currentUser} ${this.currentUser} ${size} ${date} ${file.name}`;
          }).join('\n');
          return { output: output || '', exitCode: 0 };
        } else {
          const output = files.map(f => f.name).join('  ');
          return { output, exitCode: 0 };
        }
      } catch (error) {
        return { output: '', error: `ls: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
      }
    }
    
    // Web fallback - existing simulation code
    try {
      const files = await fileSystem.listDirectory(targetPath);
      let filteredFiles = showAll ? files : files.filter(f => !f.name.startsWith('.'));

      if (longFormat) {
        const output = filteredFiles.map(file => {
          const date = file.modified.toLocaleDateString();
          const time = file.modified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `${file.permissions} 1 ${this.currentUser} ${this.currentUser} ${file.size.toString().padStart(8)} ${date} ${time} ${file.name}`;
        }).join('\n');
        return { output, exitCode: 0 };
      } else {
        const output = filteredFiles.map(f => f.name).join('  ');
        return { output, exitCode: 0 };
      }
    } catch (error) {
      return { output: '', error: `ls: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async pwd(): Promise<CommandResult> {
    if (this.isNative()) {
      try {
        const result = await AndroidShell.getCurrentDirectory();
        this.nativeCurrentDir = result.path;
        return { output: result.path, exitCode: 0 };
      } catch (error) {
        return { output: this.nativeCurrentDir, exitCode: 0 };
      }
    }
    return { output: fileSystem.getCurrentDirectory(), exitCode: 0 };
  }

  async cd(args: string[]): Promise<CommandResult> {
    const path = args[0] || this.environment.HOME;

    if (this.isNative()) {
      try {
        const result = await AndroidShell.changeDirectory(path);
        if (result) {
          this.nativeCurrentDir = result.path;
          this.environment.PWD = result.path;
          return { output: '', exitCode: 0 };
        }
        return { output: '', error: `cd: ${path}: No such file or directory`, exitCode: 1 };
      } catch (error) {
        return { output: '', error: `cd: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
      }
    }

    try {
      const newPath = fileSystem.changeDirectory(path);
      this.environment.PWD = newPath;
      return { output: '', exitCode: 0 };
    } catch (error) {
      return { output: '', error: `cd: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async cat(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'cat: missing file operand', exitCode: 1 };
    }

    if (this.isNative()) {
      try {
        const results: string[] = [];
        for (const file of args) {
          const result = await AndroidShell.readFile(file);
          if (result) {
            results.push(result.content);
          } else {
            return { output: '', error: `cat: ${file}: No such file or directory`, exitCode: 1 };
          }
        }
        return { output: results.join('\n'), exitCode: 0 };
      } catch (error) {
        return { output: '', error: `cat: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
      }
    }

    try {
      const results: string[] = [];
      for (const file of args) {
        const content = await fileSystem.readTextFile(file);
        results.push(content);
      }
      return { output: results.join('\n'), exitCode: 0 };
    } catch (error) {
      return { output: '', error: `cat: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async echo(args: string[]): Promise<CommandResult> {
    const output = args.join(' ').replace(/\$(\w+)/g, (match, varName) => {
      return this.environment[varName] || '';
    });
    return { output, exitCode: 0 };
  }

  async mkdir(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'mkdir: missing operand', exitCode: 1 };
    }

    const flags = args.filter(arg => arg.startsWith('-'));
    const dirs = args.filter(arg => !arg.startsWith('-'));
    const recursive = flags.some(f => f.includes('p'));

    if (this.isNative()) {
      try {
        for (const dir of dirs) {
          const result = await AndroidShell.createDirectory(dir, recursive);
          if (!result.success) {
            return { output: '', error: `mkdir: cannot create directory '${dir}'`, exitCode: 1 };
          }
        }
        return { output: '', exitCode: 0 };
      } catch (error) {
        return { output: '', error: `mkdir: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
      }
    }

    try {
      for (const dir of dirs) {
        await fileSystem.createDirectory(dir);
      }
      return { output: '', exitCode: 0 };
    } catch (error) {
      return { output: '', error: `mkdir: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async rm(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'rm: missing operand', exitCode: 1 };
    }

    const flags = args.filter(arg => arg.startsWith('-'));
    const files = args.filter(arg => !arg.startsWith('-'));
    const recursive = flags.some(f => f.includes('r') || f.includes('R'));
    const force = flags.some(f => f.includes('f'));

    if (this.isNative()) {
      try {
        for (const file of files) {
          const result = await AndroidShell.deleteFile(file, recursive);
          if (!result.success && !force) {
            return { output: '', error: `rm: cannot remove '${file}'`, exitCode: 1 };
          }
        }
        return { output: '', exitCode: 0 };
      } catch (error) {
        if (!force) {
          return { output: '', error: `rm: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
        }
        return { output: '', exitCode: 0 };
      }
    }

    try {
      for (const file of files) {
        await fileSystem.deleteFile(file);
      }
      return { output: '', exitCode: 0 };
    } catch (error) {
      return { output: '', error: `rm: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async cp(args: string[]): Promise<CommandResult> {
    if (args.length < 2) {
      return { output: '', error: 'cp: missing file operand', exitCode: 1 };
    }

    const flags = args.filter(arg => arg.startsWith('-'));
    const paths = args.filter(arg => !arg.startsWith('-'));
    const source = paths[0];
    const destination = paths[1];

    if (this.isNative()) {
      try {
        const result = await AndroidShell.copyFile(source, destination);
        if (!result.success) {
          return { output: '', error: `cp: cannot copy '${source}' to '${destination}'`, exitCode: 1 };
        }
        return { output: '', exitCode: 0 };
      } catch (error) {
        return { output: '', error: `cp: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
      }
    }

    return { output: '', error: 'cp: not supported in web mode', exitCode: 1 };
  }

  async mv(args: string[]): Promise<CommandResult> {
    if (args.length < 2) {
      return { output: '', error: 'mv: missing file operand', exitCode: 1 };
    }

    const paths = args.filter(arg => !arg.startsWith('-'));
    const source = paths[0];
    const destination = paths[1];

    if (this.isNative()) {
      try {
        const result = await AndroidShell.moveFile(source, destination);
        if (!result.success) {
          return { output: '', error: `mv: cannot move '${source}' to '${destination}'`, exitCode: 1 };
        }
        return { output: '', exitCode: 0 };
      } catch (error) {
        return { output: '', error: `mv: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
      }
    }

    return { output: '', error: 'mv: not supported in web mode', exitCode: 1 };
  }

  async grep(args: string[]): Promise<CommandResult> {
    if (args.length < 2) {
      return { output: '', error: 'grep: usage: grep pattern file', exitCode: 1 };
    }

    const pattern = args[0];
    const filename = args[1];

    if (this.isNative()) {
      try {
        const result = await AndroidShell.readFile(filename);
        if (result) {
          const lines = result.content.split('\n');
          const regex = new RegExp(pattern, 'g');
          const matches = lines.filter(line => regex.test(line));
          return { output: matches.join('\n'), exitCode: matches.length > 0 ? 0 : 1 };
        }
        return { output: '', error: `grep: ${filename}: No such file or directory`, exitCode: 2 };
      } catch (error) {
        return { output: '', error: `grep: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 2 };
      }
    }

    try {
      const content = await fileSystem.readTextFile(filename);
      const lines = content.split('\n');
      const regex = new RegExp(pattern, 'g');
      const matches = lines.filter(line => regex.test(line));
      return { output: matches.join('\n'), exitCode: 0 };
    } catch (error) {
      return { output: '', error: `grep: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async wget(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'wget: missing URL', exitCode: 1 };
    }

    const url = args[0];
    const filename = args.find(arg => arg.startsWith('-O'))?.split('=')[1] || url.split('/').pop() || 'index.html';

    if (this.isNative()) {
      try {
        const result = await AndroidShell.downloadFile(url, filename);
        if (result.exitCode === 0) {
          return { output: `'${filename}' saved [${result.size || 0}]`, exitCode: 0 };
        }
        return { output: '', error: result.error || 'Download failed', exitCode: 1 };
      } catch (error) {
        return { output: '', error: `wget: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
      }
    }

    try {
      await fileSystem.downloadFromUrl(url, filename);
      return { output: `${filename} saved`, exitCode: 0 };
    } catch (error) {
      return { output: '', error: `wget: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async touch(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'touch: missing file operand', exitCode: 1 };
    }

    if (this.isNative()) {
      try {
        for (const file of args) {
          await AndroidShell.writeFile(file, '', false);
        }
        return { output: '', exitCode: 0 };
      } catch (error) {
        return { output: '', error: `touch: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
      }
    }

    try {
      for (const file of args) {
        const exists = await fileSystem.exists(file);
        if (!exists) {
          await fileSystem.writeTextFile(file, '');
        }
      }
      return { output: '', exitCode: 0 };
    } catch (error) {
      return { output: '', error: `touch: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async uname(args: string[]): Promise<CommandResult> {
    const flags = args.filter(arg => arg.startsWith('-'));
    const all = flags.some(f => f.includes('a'));

    if (this.isNative()) {
      try {
        const info = await AndroidShell.getSystemInfo();
        if (info) {
          if (all) {
            return { 
              output: `Linux ${info.device} ${info.androidVersion} #1 SMP ${info.supportedAbis} Android`, 
              exitCode: 0 
            };
          }
          return { output: 'Linux', exitCode: 0 };
        }
      } catch (error) {
        // Fall through to default
      }
    }
    
    if (all) {
      return { 
        output: 'Linux terminalos 6.6.15-amd64 #1 SMP PREEMPT_DYNAMIC CVJ 6.6.15-2terminalos1 (2024-01-11) x86_64 GNU/Linux', 
        exitCode: 0 
      };
    }
    return { output: 'Linux', exitCode: 0 };
  }

  async whoami(): Promise<CommandResult> {
    return { output: this.currentUser, exitCode: 0 };
  }

  async id(): Promise<CommandResult> {
    return { output: `uid=1000(${this.currentUser}) gid=1000(${this.currentUser}) groups=1000(${this.currentUser}),27(sudo)`, exitCode: 0 };
  }

  async ps(args: string[]): Promise<CommandResult> {
    if (this.isNative()) {
      return await AndroidShell.executeCommand('ps', args);
    }
    
    const processes = [
      'PID TTY          TIME CMD',
      '  1 ?        00:00:01 systemd',
      '  2 ?        00:00:00 kthreadd',
      '123 pts/0    00:00:00 bash',
      '456 pts/0    00:00:00 cvj-terminal',
    ];
    return { output: processes.join('\n'), exitCode: 0 };
  }

  async df(args: string[]): Promise<CommandResult> {
    const humanReadable = args.some(f => f.includes('h'));

    if (this.isNative()) {
      try {
        const storage = await AndroidShell.getStorageInfo();
        if (storage) {
          const formatSize = (bytes: number) => {
            if (humanReadable) {
              return this.formatFileSize(bytes);
            }
            return Math.round(bytes / 1024).toString();
          };

          const lines = ['Filesystem     Size   Used  Avail Use% Mounted on'];
          
          if (storage.internal) {
            const usePct = Math.round((storage.internal.used / storage.internal.total) * 100);
            lines.push(`/dev/block/data  ${formatSize(storage.internal.total)}  ${formatSize(storage.internal.used)}  ${formatSize(storage.internal.free)}  ${usePct}% /data`);
          }
          
          if (storage.external) {
            const usePct = Math.round((storage.external.used / storage.external.total) * 100);
            lines.push(`/dev/block/sdcard  ${formatSize(storage.external.total)}  ${formatSize(storage.external.used)}  ${formatSize(storage.external.free)}  ${usePct}% /sdcard`);
          }
          
          return { output: lines.join('\n'), exitCode: 0 };
        }
      } catch (error) {
        // Fall through to default
      }
    }

    const output = `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       20971520 8388608  12582912  41% /
tmpfs            2097152       0   2097152   0% /dev/shm
tmpfs            2097152    1024   2096128   1% /run`;
    return { output, exitCode: 0 };
  }

  async free(args: string[]): Promise<CommandResult> {
    const humanReadable = args.some(f => f.includes('h'));

    if (this.isNative()) {
      try {
        const info = await AndroidShell.getSystemInfo();
        if (info) {
          const formatMem = (bytes: number) => {
            if (humanReadable) {
              return this.formatFileSize(bytes);
            }
            return Math.round(bytes / 1024).toString();
          };

          const output = `               total        used        free      shared  buff/cache   available
Mem:        ${formatMem(info.totalMemory).padStart(8)}  ${formatMem(info.totalMemory - info.freeMemory).padStart(8)}  ${formatMem(info.freeMemory).padStart(8)}           0           0  ${formatMem(info.maxMemory).padStart(8)}`;
          return { output, exitCode: 0 };
        }
      } catch (error) {
        // Fall through to default
      }
    }

    const output = `               total        used        free      shared  buff/cache   available
Mem:         4194304     1048576     2097152           0     1048576     3145728
Swap:        2097152           0     2097152`;
    return { output, exitCode: 0 };
  }

  // Package management commands
  async apt(args: string[]): Promise<CommandResult> {
    const subcommand = args[0];
    const packages = args.slice(1);

    switch (subcommand) {
      case 'update':
        return { output: 'Reading package lists... Done\nBuilding dependency tree... Done', exitCode: 0 };
      
      case 'install':
        if (packages.length === 0) {
          return { output: '', error: 'apt install: missing package names', exitCode: 1 };
        }
        
        try {
          for (const pkg of packages) {
            // Simulate package installation by creating relevant files
            await this.installPackage(pkg);
          }
          return { output: `Installing ${packages.join(', ')}...\nDone.`, exitCode: 0 };
        } catch (error) {
          return { output: '', error: `apt install: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
        }

      case 'search':
        return { output: `Searching for ${packages.join(' ')}...\nFound matching packages in repository.`, exitCode: 0 };
      
      default:
        return { output: '', error: `apt: unknown subcommand '${subcommand}'`, exitCode: 1 };
    }
  }

  private async installPackage(packageName: string): Promise<void> {
    // Create package-specific files and binaries
    const binPath = `/usr/bin/${packageName}`;
    const content = `#!/bin/bash\n# ${packageName} - installed via CVJ Terminal\necho "${packageName} is installed and ready to use"`;
    await fileSystem.writeTextFile(binPath, content);
  }

  async gitClone(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'git clone: missing repository URL', exitCode: 1 };
    }

    try {
      const url = args[0];
      const targetDir = args[1] || url.split('/').pop()?.replace('.git', '') || 'repo';
      
      // Check if directory already exists
      if (await fileSystem.exists(targetDir)) {
        return { output: '', error: `git clone: destination path '${targetDir}' already exists`, exitCode: 1 };
      }

      // Handle popular penetration testing tool repositories
      const penTestConfig = this.getPenTestRepoConfig(url, targetDir);
      if (penTestConfig) {
        await this.installPenTestTool(penTestConfig);
        return { 
          output: `Cloning into '${targetDir}'...\n${penTestConfig.name} installed successfully!\nUse 'cvj scan ${penTestConfig.tool}' to run scans.`, 
          exitCode: 0 
        };
      }
      
      // For demonstration, create a mock git repository structure
      await fileSystem.createDirectory(targetDir);
      await fileSystem.createDirectory(`${targetDir}/.git`);
      await fileSystem.writeTextFile(`${targetDir}/README.md`, `# ${targetDir}\n\nCloned from ${url}`);
      
      return { output: `Cloning into '${targetDir}'...\nDone.`, exitCode: 0 };
    } catch (error) {
      return { output: '', error: `git clone: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  private getPenTestRepoConfig(url: string, targetDir: string) {
    const repoConfigs = {
      'nmap': {
        urls: ['https://github.com/nmap/nmap', 'https://github.com/nmap/nmap.git'],
        name: 'Nmap Network Scanner',
        tool: 'nmap',
        files: ['nmap', 'nse_main.lua', 'docs/nmap.1']
      },
      'metasploit-framework': {
        urls: ['https://github.com/rapid7/metasploit-framework', 'https://github.com/rapid7/metasploit-framework.git'],
        name: 'Metasploit Framework',
        tool: 'metasploit',
        files: ['msfconsole', 'lib/msf/core.rb', 'modules/exploits/', 'modules/payloads/']
      },
      'sqlmap': {
        urls: ['https://github.com/sqlmapproject/sqlmap', 'https://github.com/sqlmapproject/sqlmap.git'],
        name: 'SQLMap SQL Injection Tool',
        tool: 'sqlmap',
        files: ['sqlmap.py', 'lib/core/common.py', 'txt/user-agents.txt']
      },
      'nikto': {
        urls: ['https://github.com/sullo/nikto', 'https://github.com/sullo/nikto.git'],
        name: 'Nikto Web Scanner',
        tool: 'nikto',
        files: ['program/nikto.pl', 'program/databases/', 'program/plugins/']
      },
      'aircrack-ng': {
        urls: ['https://github.com/aircrack-ng/aircrack-ng', 'https://github.com/aircrack-ng/aircrack-ng.git'],
        name: 'Aircrack-ng WiFi Security Suite',
        tool: 'aircrack-ng',
        files: ['src/aircrack-ng.c', 'src/airodump-ng.c', 'manpages/']
      },
      'hashcat': {
        urls: ['https://github.com/hashcat/hashcat', 'https://github.com/hashcat/hashcat.git'],
        name: 'Hashcat Password Recovery',
        tool: 'hashcat',
        files: ['src/hashcat.c', 'OpenCL/', 'rules/', 'masks/']
      },
      'burpsuite': {
        urls: ['https://github.com/PortSwigger/burp-extender-api', 'https://github.com/PortSwigger/burp-extender-api.git'],
        name: 'Burp Suite Extensions API',
        tool: 'burpsuite',
        files: ['burp/', 'examples/', 'javadoc/']
      },
      'wireshark': {
        urls: ['https://github.com/wireshark/wireshark', 'https://github.com/wireshark/wireshark.git'],
        name: 'Wireshark Network Analyzer',
        tool: 'wireshark',
        files: ['wireshark', 'epan/', 'ui/', 'capture/']
      }
    };

    for (const [toolName, config] of Object.entries(repoConfigs)) {
      if (config.urls.some(repoUrl => url.includes(repoUrl.replace('https://github.com/', '').replace('.git', ''))) || 
          targetDir.toLowerCase().includes(toolName.toLowerCase())) {
        return { ...config, targetDir };
      }
    }
    return null;
  }

  private async installPenTestTool(config: any) {
    const { targetDir, files, tool } = config;
    
    // Create directory structure for the tool
    await fileSystem.createDirectory(targetDir);
    await fileSystem.createDirectory(`${targetDir}/.git`);
    
    // Create realistic file structure for the tool
    for (const file of files) {
      if (file.endsWith('/')) {
        await fileSystem.createDirectory(`${targetDir}/${file}`);
        // Add some sample files in directories
        if (file.includes('modules') || file.includes('plugins') || file.includes('rules')) {
          await fileSystem.writeTextFile(`${targetDir}/${file}sample.txt`, `Sample ${tool} module/plugin`);
        }
      } else {
        const dir = file.includes('/') ? `${targetDir}/${file.substring(0, file.lastIndexOf('/'))}` : targetDir;
        if (file.includes('/')) {
          await fileSystem.createDirectory(dir);
        }
        await fileSystem.writeTextFile(`${targetDir}/${file}`, `#!/bin/bash\n# ${tool} - ${file}\necho "Running ${tool}..."`);
      }
    }

    // Create installation script
    await fileSystem.writeTextFile(`${targetDir}/install.sh`, 
      `#!/bin/bash\necho "Installing ${config.name}..."\necho "Installation completed!"\necho "Use 'cvj scan ${tool}' to run scans."`);

    // Mark tool as installed in security tools
    const { securityTools } = await import('./securityTools');
    securityTools.markToolAsInstalled(tool);
  }

  // Environment variable management
  setEnv(key: string, value: string): void {
    this.environment[key] = value;
  }

  getEnv(key: string): string | undefined {
    return this.environment[key];
  }

  async env(): Promise<CommandResult> {
    const output = Object.entries(this.environment)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    return { output, exitCode: 0 };
  }

  async man(args: string[] = []): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: 'What manual page do you want?', error: '', exitCode: 1 };
    }

    const command = args[0];
    const manPages: Record<string, string> = {
      'ls': 'LS(1)\n\nNAME\n  ls - list directory contents\n\nSYNOPSIS\n  ls [OPTION]... [FILE]...\n\nDESCRIPTION\n  List information about the FILEs (the current directory by default).\n\n  -a, --all\n    do not ignore entries starting with .\n  -l  use a long listing format',
      'cd': 'CD(1)\n\nNAME\n  cd - change the shell working directory\n\nSYNOPSIS\n  cd [dir]\n\nDESCRIPTION\n  Change the current directory to DIR.  The default DIR is the value of the HOME variable.',
      'cat': 'CAT(1)\n\nNAME\n  cat - concatenate files and print on the standard output\n\nSYNOPSIS\n  cat [OPTION]... [FILE]...\n\nDESCRIPTION\n  Concatenate FILE(s) to standard output.',
      'nmap': 'NMAP(1)\n\nNAME\n  nmap - Network exploration tool and security / port scanner\n\nSYNOPSIS\n  nmap [Scan Type...] [Options] {target specification}\n\nDESCRIPTION\n  Nmap ("Network Mapper") is an open source tool for network exploration and security auditing.',
      'vm': 'VM(1)\n\nNAME\n  vm - virtual machine management utility\n\nSYNOPSIS\n  vm <command> [options]\n\nCOMMANDS\n  list                 - List all virtual machine instances\n  create <template>    - Create new VM from template\n  start <id>          - Start a virtual machine\n  stop <id>           - Stop a virtual machine\n  connect <id>        - Connect to a running VM\n  delete <id>         - Delete a virtual machine\n  templates           - List available OS templates'
    };

    const manPage = manPages[command] || `No manual entry for ${command}`;
    return { output: manPage, error: '', exitCode: 0 };
  }

  // Virtual Machine Management Commands
  async vm(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { 
        output: '', 
        error: 'vm: missing subcommand\nUsage: vm <list|create|start|stop|connect|delete|templates> [args...]', 
        exitCode: 1 
      };
    }

    const subcommand = args[0];
    const vmArgs = args.slice(1);

    try {
      switch (subcommand) {
        case 'list':
          return await this.vmList();
        
        case 'templates':
          return await this.vmTemplates();
        
        case 'create':
          if (vmArgs.length === 0) {
            return { output: '', error: 'vm create: missing template ID\nUse "vm templates" to see available templates', exitCode: 1 };
          }
          return await this.vmCreate(vmArgs[0], vmArgs[1]);
        
        case 'start':
          if (vmArgs.length === 0) {
            return { output: '', error: 'vm start: missing instance ID\nUse "vm list" to see available instances', exitCode: 1 };
          }
          return await this.vmStart(vmArgs[0]);
        
        case 'stop':
          if (vmArgs.length === 0) {
            return { output: '', error: 'vm stop: missing instance ID\nUse "vm list" to see running instances', exitCode: 1 };
          }
          return await this.vmStop(vmArgs[0]);
        
        case 'connect':
          if (vmArgs.length === 0) {
            return { output: '', error: 'vm connect: missing instance ID\nUse "vm list" to see running instances', exitCode: 1 };
          }
          return await this.vmConnect(vmArgs[0]);
        
        case 'delete':
          if (vmArgs.length === 0) {
            return { output: '', error: 'vm delete: missing instance ID\nUse "vm list" to see available instances', exitCode: 1 };
          }
          return await this.vmDelete(vmArgs[0]);
        
        default:
          return { 
            output: '', 
            error: `vm: unknown subcommand '${subcommand}'\nUsage: vm <list|create|start|stop|connect|delete|templates> [args...]`, 
            exitCode: 1 
          };
      }
    } catch (error) {
      return { 
        output: '', 
        error: `vm: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        exitCode: 1 
      };
    }
  }

  private async vmList(): Promise<CommandResult> {
    const instances = osManager.getRunningInstances();
    const stats = osManager.getSystemStats();
    
    if (instances.length === 0) {
      return {
        output: 'No virtual machines found.\nUse "vm create <template>" to create your first VM.',
        exitCode: 0
      };
    }

    const header = 'ID                    NAME                TYPE      STATUS     ARCH      MEMORY    DISK';
    const separator = '─'.repeat(header.length);
    
    const rows = instances.map(instance => {
      const id = instance.id.padEnd(20);
      const name = instance.name.substring(0, 18).padEnd(18);
      const type = instance.type.padEnd(8);
      const status = instance.status.padEnd(9);
      const arch = instance.architecture.substring(0, 8).padEnd(8);
      const memory = `${instance.resources.memory}MB`.padEnd(8);
      const disk = `${instance.resources.disk}MB`;
      
      return `${id} ${name} ${type} ${status} ${arch} ${memory} ${disk}`;
    });

    const footer = `\nSystem Resources:
Memory: ${stats.usedMemory}MB / ${stats.totalMemory}MB (${Math.round((stats.usedMemory / stats.totalMemory) * 100)}% used)
Disk:   ${stats.usedDisk}MB / ${stats.totalDisk}MB (${Math.round((stats.usedDisk / stats.totalDisk) * 100)}% used)
Running: ${stats.runningInstances} / ${stats.totalInstances} instances`;

    return {
      output: [header, separator, ...rows, footer].join('\n'),
      exitCode: 0
    };
  }

  private async vmTemplates(): Promise<CommandResult> {
    const templates = osManager.getAvailableTemplates();
    
    const header = 'TEMPLATE ID         NAME                  TYPE      VERSION    ARCH      MIN RAM   DISK SIZE';
    const separator = '─'.repeat(header.length);
    
    const rows = templates.map(template => {
      const id = template.id.padEnd(18);
      const name = template.name.substring(0, 20).padEnd(20);
      const type = template.type.padEnd(8);
      const version = template.version.substring(0, 9).padEnd(9);
      const arch = template.architecture.substring(0, 8).padEnd(8);
      const minRam = `${template.minMemory}MB`.padEnd(8);
      const diskSize = `${template.diskSize}MB`;
      
      return `${id} ${name} ${type} ${version} ${arch} ${minRam} ${diskSize}`;
    });

    const footer = `\nUsage: vm create <template-id> [custom-name]
Example: vm create kali-linux "My Kali VM"`;

    return {
      output: [header, separator, ...rows, footer].join('\n'),
      exitCode: 0
    };
  }

  private async vmCreate(templateId: string, customName?: string): Promise<CommandResult> {
    try {
      const instance = await osManager.createInstance(templateId, customName);
      return {
        output: `Creating virtual machine...
Instance ID: ${instance.id}
Name: ${instance.name}
Type: ${instance.type} ${instance.version}
Architecture: ${instance.architecture}
Resources: ${instance.resources.memory}MB RAM, ${instance.resources.disk}MB Disk

VM created successfully! Use "vm start ${instance.id}" to boot it.`,
        exitCode: 0
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Failed to create VM',
        exitCode: 1
      };
    }
  }

  private async vmStart(instanceId: string): Promise<CommandResult> {
    const result = await osManager.startInstance(instanceId);
    return {
      output: result.output,
      error: result.error,
      exitCode: result.exitCode
    };
  }

  private async vmStop(instanceId: string): Promise<CommandResult> {
    const result = await osManager.stopInstance(instanceId);
    return {
      output: result.output,
      error: result.error,
      exitCode: result.exitCode
    };
  }

  private async vmConnect(instanceId: string): Promise<CommandResult> {
    const result = await osManager.connectToInstance(instanceId);
    return {
      output: result.output,
      error: result.error,
      exitCode: result.exitCode
    };
  }

  private async vmDelete(instanceId: string): Promise<CommandResult> {
    const result = await osManager.deleteInstance(instanceId);
    return {
      output: result.output,
      error: result.error,
      exitCode: result.exitCode
    };
  }

  // Network commands
  async ping(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'ping: missing destination address', exitCode: 1 };
    }

    const target = args[0];
    const result = await networkManager.ping('cvj-host', target);
    
    return {
      output: result.output,
      error: '',
      exitCode: result.success ? 0 : 1
    };
  }

  async nslookup(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'nslookup: missing domain name', exitCode: 1 };
    }

    const domain = args[0];
    // Simulate DNS lookup
    const commonDomains: Record<string, string> = {
      'google.com': '142.250.191.14',
      'github.com': '140.82.112.3',
      'stackoverflow.com': '151.101.1.69',
      'reddit.com': '151.101.65.140'
    };

    const ip = commonDomains[domain] || `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    return {
      output: `Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	${domain}
Address: ${ip}`,
      exitCode: 0
    };
  }

  async netstat(args: string[]): Promise<CommandResult> {
    const connections = networkManager.getActiveConnections();
    
    if (connections.length === 0) {
      return {
        output: 'Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State',
        exitCode: 0
      };
    }

    const header = 'Proto Recv-Q Send-Q Local Address           Foreign Address         State';
    const rows = connections.map(conn => {
      const proto = conn.protocol.toUpperCase().padEnd(5);
      const recvQ = '0'.padStart(6);
      const sendQ = '0'.padStart(6);
      const local = `${conn.sourceInstance}:${conn.sourcePort || 'unknown'}`.padEnd(23);
      const foreign = `${conn.targetInstance}:${conn.targetPort || 'unknown'}`.padEnd(23);
      const state = conn.status.toUpperCase();
      
      return `${proto} ${recvQ} ${sendQ} ${local} ${foreign} ${state}`;
    });

    return {
      output: [header, ...rows].join('\n'),
      exitCode: 0
    };
  }

  async ifconfig(args: string[]): Promise<CommandResult> {
    const interfaces = networkManager.getInstanceInterfaces('cvj-host');
    
    const output = interfaces.map(iface => {
      const flags = iface.status === 'up' ? 'UP,BROADCAST,RUNNING,MULTICAST' : 'BROADCAST,MULTICAST';
      return `${iface.name}: flags=4163<${flags}> mtu ${iface.mtu}
        inet ${iface.ipv4 || 'none'}  netmask 255.255.255.0  broadcast ${iface.ipv4?.replace(/\.\d+$/, '.255') || 'none'}
        ${iface.ipv6 ? `inet6 ${iface.ipv6}  prefixlen 64  scopeid 0x20<link>` : ''}
        ether ${iface.mac}  txqueuelen 1000  (Ethernet)
        ${iface.speed ? `Speed: ${iface.speed}Mbps` : ''}`;
    }).join('\n\n');

    return { output, exitCode: 0 };
  }

  async nmap(args: string[]): Promise<CommandResult> {
    const { securityTools } = await import('./securityTools');
    
    if (args.length === 0) {
      return { output: '', error: 'nmap: missing target specification', exitCode: 1 };
    }

    const target = args[0];
    const flags = args.filter(arg => arg.startsWith('-'));
    const portScan = flags.includes('-p') || flags.includes('--port');
    const serviceScan = flags.includes('-sV');
    
    // Simulate port scanning
    const commonPorts = [22, 80, 443, 21, 25, 53, 110, 143, 993, 995];
    const scanResults = [];
    
    for (const port of commonPorts) {
      const result = await networkManager.scanPort('cvj-host', target, port);
      if (result.open) {
        const service = serviceScan && result.service ? ` ${result.service}` : '';
        const version = serviceScan && result.version ? ` ${result.version}` : '';
        scanResults.push(`${port}/tcp   open ${service}${version}`);
      }
    }

    const output = `Starting Nmap scan against ${target}...
Nmap scan report for ${target}
Host is up (0.001s latency).

PORT      STATE SERVICE${serviceScan ? ' VERSION' : ''}
${scanResults.join('\n')}

Nmap done: 1 IP address (1 host up) scanned in 2.34 seconds`;

    // Track tool usage - nmap scan completed

    return { output, exitCode: 0 };
  }

  async ssh(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      return { output: '', error: 'ssh: missing destination', exitCode: 1 };
    }

    const destination = args[0];
    
    // Check if it's a VM instance ID
    const instance = osManager.getInstance(destination);
    if (instance) {
      if (instance.status !== 'running') {
        return {
          output: '',
          error: `ssh: VM instance '${destination}' is not running. Start it with: vm start ${destination}`,
          exitCode: 1
        };
      }
      
      const result = await osManager.connectToInstance(destination);
      return {
        output: result.output,
        error: result.error,
        exitCode: result.exitCode
      };
    }

    // Simulate SSH connection to external host
    return {
      output: `ssh: connect to host ${destination} port 22: Connection refused`,
      error: '',
      exitCode: 255
    };
  }
}

export const unixCommands = new UnixCommands();