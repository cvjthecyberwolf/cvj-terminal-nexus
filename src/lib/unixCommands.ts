import { fileSystem } from './fileSystem';

export interface CommandResult {
  output: string;
  error?: string;
  exitCode: number;
}

// Real Unix command implementations
export class UnixCommands {
  private currentUser = 'kali';
  private environment: Record<string, string> = {
    PATH: '/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin',
    HOME: '/home/kali',
    USER: 'kali',
    SHELL: '/bin/bash',
    TERM: 'xterm-256color',
    LANG: 'en_US.UTF-8',
  };

  async ls(args: string[] = []): Promise<CommandResult> {
    try {
      const flags = args.filter(arg => arg.startsWith('-'));
      const paths = args.filter(arg => !arg.startsWith('-'));
      const targetPath = paths[0] || '.';

      const files = await fileSystem.listDirectory(targetPath);
      const showAll = flags.some(f => f.includes('a'));
      const longFormat = flags.some(f => f.includes('l'));

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
    return { output: fileSystem.getCurrentDirectory(), exitCode: 0 };
  }

  async cd(args: string[]): Promise<CommandResult> {
    try {
      const path = args[0] || this.environment.HOME;
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

    try {
      for (const dir of args) {
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

    try {
      const flags = args.filter(arg => arg.startsWith('-'));
      const files = args.filter(arg => !arg.startsWith('-'));
      
      for (const file of files) {
        await fileSystem.deleteFile(file);
      }
      return { output: '', exitCode: 0 };
    } catch (error) {
      return { output: '', error: `rm: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
  }

  async grep(args: string[]): Promise<CommandResult> {
    if (args.length < 2) {
      return { output: '', error: 'grep: usage: grep pattern file', exitCode: 1 };
    }

    try {
      const pattern = args[0];
      const filename = args[1];
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

    try {
      const url = args[0];
      const filename = args.find(arg => arg.startsWith('-O'))?.split('=')[1] || url.split('/').pop() || 'index.html';
      
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
    
    if (all) {
      return { 
        output: 'Linux kali-terminal 6.6.15-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.6.15-2kali1 (2024-01-11) x86_64 GNU/Linux', 
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
    const output = `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       20971520 8388608  12582912  41% /
tmpfs            2097152       0   2097152   0% /dev/shm
tmpfs            2097152    1024   2096128   1% /run`;
    return { output, exitCode: 0 };
  }

  async free(args: string[]): Promise<CommandResult> {
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
      
      // For demonstration, create a mock git repository structure
      await fileSystem.createDirectory(targetDir);
      await fileSystem.createDirectory(`${targetDir}/.git`);
      await fileSystem.writeTextFile(`${targetDir}/README.md`, `# ${targetDir}\n\nCloned from ${url}`);
      
      return { output: `Cloning into '${targetDir}'...\nDone.`, exitCode: 0 };
    } catch (error) {
      return { output: '', error: `git clone: ${error instanceof Error ? error.message : 'Unknown error'}`, exitCode: 1 };
    }
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
}

export const unixCommands = new UnixCommands();