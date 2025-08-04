import { Capacitor } from '@capacitor/core';

export interface ShellResult {
  output: string;
  error: string;
  exitCode: number;
}

export interface NativeShellPlugin {
  executeCommand(options: { command: string; args?: string[] }): Promise<ShellResult>;
  executeRootCommand(options: { command: string; args?: string[] }): Promise<ShellResult>;
  installPackage(options: { packageName: string; source?: string }): Promise<ShellResult>;
  checkRootAccess(): Promise<{ hasRoot: boolean }>;
  setupLinuxEnvironment(): Promise<ShellResult>;
  downloadFile(options: { url: string; destination: string }): Promise<ShellResult>;
}

// Native Android implementation
const NativeShell = Capacitor.registerPlugin<NativeShellPlugin>('NativeShell');

export class AndroidShell {
  static async executeCommand(command: string, args: string[] = []): Promise<ShellResult> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.executeCommand({ command, args });
      } catch (error) {
        return {
          output: '',
          error: `Native execution failed: ${error}`,
          exitCode: 1
        };
      }
    } else {
      // Fallback for web - return simulation message
      return {
        output: `[WEB SIMULATION] Would execute: ${command} ${args.join(' ')}\nTo run real commands, build and install the Android app.`,
        error: '',
        exitCode: 0
      };
    }
  }

  static async executeRootCommand(command: string, args: string[] = []): Promise<ShellResult> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.executeRootCommand({ command, args });
      } catch (error) {
        return {
          output: '',
          error: `Root execution failed: ${error}`,
          exitCode: 1
        };
      }
    } else {
      return {
        output: `[WEB SIMULATION] Would execute as root: ${command} ${args.join(' ')}\nRoot access requires Android app.`,
        error: '',
        exitCode: 0
      };
    }
  }

  static async installPackage(packageName: string, source: string = 'auto'): Promise<ShellResult> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.installPackage({ packageName, source });
      } catch (error) {
        return {
          output: '',
          error: `Package installation failed: ${error}`,
          exitCode: 1
        };
      }
    } else {
      return {
        output: `[WEB SIMULATION] Would install package: ${packageName}\nReal package installation requires Android app.`,
        error: '',
        exitCode: 0
      };
    }
  }

  static async checkRootAccess(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await NativeShell.checkRootAccess();
        return result.hasRoot;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  static async setupLinuxEnvironment(): Promise<ShellResult> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.setupLinuxEnvironment();
      } catch (error) {
        return {
          output: '',
          error: `Linux environment setup failed: ${error}`,
          exitCode: 1
        };
      }
    } else {
      return {
        output: `[WEB SIMULATION] Would setup Linux environment with:\n- PRoot for chroot\n- Essential Linux packages\n- Package managers (apt, pacman)\n\nRequires Android app for real implementation.`,
        error: '',
        exitCode: 0
      };
    }
  }

  static async downloadFile(url: string, destination: string): Promise<ShellResult> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.downloadFile({ url, destination });
      } catch (error) {
        return {
          output: '',
          error: `Download failed: ${error}`,
          exitCode: 1
        };
      }
    } else {
      return {
        output: `[WEB SIMULATION] Would download: ${url} to ${destination}`,
        error: '',
        exitCode: 0
      };
    }
  }
}