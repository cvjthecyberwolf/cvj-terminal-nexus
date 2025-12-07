import { Capacitor } from '@capacitor/core';

export interface ShellResult {
  output: string;
  error: string;
  exitCode: number;
}

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modified: string;
  readable: boolean;
  writable: boolean;
  executable: boolean;
}

export interface StorageInfo {
  internal: {
    path: string;
    total: number;
    free: number;
    used: number;
  };
  external?: {
    path: string;
    total: number;
    free: number;
    used: number;
  };
  app: {
    files: string;
    cache: string;
    home: string;
    cwd: string;
  };
  sdcard: string;
}

export interface SystemInfo {
  manufacturer: string;
  model: string;
  device: string;
  brand: string;
  hardware: string;
  androidVersion: string;
  sdkVersion: number;
  supportedAbis: string;
  maxMemory: number;
  totalMemory: number;
  freeMemory: number;
  homeDirectory: string;
  currentDirectory: string;
  externalStorage: string;
}

export interface NativeShellPlugin {
  executeCommand(options: { command: string; args?: string[] }): Promise<ShellResult>;
  executeRootCommand(options: { command: string; args?: string[] }): Promise<ShellResult>;
  installPackage(options: { packageName: string; source?: string }): Promise<ShellResult>;
  checkRootAccess(): Promise<{ hasRoot: boolean }>;
  setupLinuxEnvironment(): Promise<ShellResult & { linuxRoot?: string; home?: string }>;
  downloadFile(options: { url: string; destination: string }): Promise<ShellResult & { path?: string; size?: number }>;
  
  // Storage & File System
  getStorageInfo(): Promise<StorageInfo>;
  listDirectory(options: { path?: string }): Promise<{ path: string; files: FileInfo[]; count: number; error?: string }>;
  readFile(options: { path: string }): Promise<{ content: string; path: string; size: number }>;
  writeFile(options: { path: string; content: string; append?: boolean }): Promise<{ success: boolean; path: string; size: number }>;
  deleteFile(options: { path: string; recursive?: boolean }): Promise<{ success: boolean; path: string }>;
  createDirectory(options: { path: string; recursive?: boolean }): Promise<{ success: boolean; path: string }>;
  copyFile(options: { source: string; destination: string }): Promise<{ success: boolean; source: string; destination: string }>;
  moveFile(options: { source: string; destination: string }): Promise<{ success: boolean; source: string; destination: string }>;
  changeDirectory(options: { path: string }): Promise<{ path: string }>;
  getCurrentDirectory(): Promise<{ path: string; home: string }>;
  getSystemInfo(): Promise<SystemInfo>;
  requestStoragePermission(): Promise<{ granted: boolean }>;
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

  static async setupLinuxEnvironment(): Promise<ShellResult & { linuxRoot?: string; home?: string }> {
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
        exitCode: 0,
        linuxRoot: '/data/data/app.lovable.cvj_terminal_nexus/files/linux',
        home: '/data/data/app.lovable.cvj_terminal_nexus/files/linux/home/cvj'
      };
    }
  }

  static async downloadFile(url: string, destination: string): Promise<ShellResult & { path?: string; size?: number }> {
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

  // Storage & File System Methods
  static async getStorageInfo(): Promise<StorageInfo | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.getStorageInfo();
      } catch (error) {
        console.error('Failed to get storage info:', error);
        return null;
      }
    } else {
      // Web simulation
      return {
        internal: { path: '/data', total: 64000000000, free: 32000000000, used: 32000000000 },
        external: { path: '/sdcard', total: 128000000000, free: 64000000000, used: 64000000000 },
        app: { 
          files: '/data/data/app.lovable.cvj_terminal_nexus/files',
          cache: '/data/data/app.lovable.cvj_terminal_nexus/cache',
          home: '/data/data/app.lovable.cvj_terminal_nexus/files/home',
          cwd: '/data/data/app.lovable.cvj_terminal_nexus/files/home'
        },
        sdcard: '/sdcard'
      };
    }
  }

  static async listDirectory(path?: string): Promise<{ path: string; files: FileInfo[]; count: number; error?: string }> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.listDirectory({ path });
      } catch (error) {
        return { path: path || '.', files: [], count: 0, error: String(error) };
      }
    } else {
      // Web simulation
      return {
        path: path || '/home/cvj',
        files: [
          { name: 'downloads', path: '/home/cvj/downloads', isDirectory: true, isFile: false, size: 4096, modified: new Date().toISOString(), readable: true, writable: true, executable: true },
          { name: 'documents', path: '/home/cvj/documents', isDirectory: true, isFile: false, size: 4096, modified: new Date().toISOString(), readable: true, writable: true, executable: true },
          { name: '.bashrc', path: '/home/cvj/.bashrc', isDirectory: false, isFile: true, size: 512, modified: new Date().toISOString(), readable: true, writable: true, executable: false },
        ],
        count: 3
      };
    }
  }

  static async readFile(path: string): Promise<{ content: string; path: string; size: number } | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.readFile({ path });
      } catch (error) {
        console.error('Failed to read file:', error);
        return null;
      }
    } else {
      return {
        content: `[WEB SIMULATION] Would read file: ${path}`,
        path,
        size: 0
      };
    }
  }

  static async writeFile(path: string, content: string, append: boolean = false): Promise<{ success: boolean; path: string; size: number }> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.writeFile({ path, content, append });
      } catch (error) {
        console.error('Failed to write file:', error);
        return { success: false, path, size: 0 };
      }
    } else {
      console.log(`[WEB SIMULATION] Would write to: ${path}`);
      return { success: true, path, size: content.length };
    }
  }

  static async deleteFile(path: string, recursive: boolean = false): Promise<{ success: boolean; path: string }> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.deleteFile({ path, recursive });
      } catch (error) {
        console.error('Failed to delete file:', error);
        return { success: false, path };
      }
    } else {
      console.log(`[WEB SIMULATION] Would delete: ${path}`);
      return { success: true, path };
    }
  }

  static async createDirectory(path: string, recursive: boolean = true): Promise<{ success: boolean; path: string }> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.createDirectory({ path, recursive });
      } catch (error) {
        console.error('Failed to create directory:', error);
        return { success: false, path };
      }
    } else {
      console.log(`[WEB SIMULATION] Would create directory: ${path}`);
      return { success: true, path };
    }
  }

  static async copyFile(source: string, destination: string): Promise<{ success: boolean; source: string; destination: string }> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.copyFile({ source, destination });
      } catch (error) {
        console.error('Failed to copy file:', error);
        return { success: false, source, destination };
      }
    } else {
      console.log(`[WEB SIMULATION] Would copy: ${source} -> ${destination}`);
      return { success: true, source, destination };
    }
  }

  static async moveFile(source: string, destination: string): Promise<{ success: boolean; source: string; destination: string }> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.moveFile({ source, destination });
      } catch (error) {
        console.error('Failed to move file:', error);
        return { success: false, source, destination };
      }
    } else {
      console.log(`[WEB SIMULATION] Would move: ${source} -> ${destination}`);
      return { success: true, source, destination };
    }
  }

  static async changeDirectory(path: string): Promise<{ path: string } | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.changeDirectory({ path });
      } catch (error) {
        console.error('Failed to change directory:', error);
        return null;
      }
    } else {
      console.log(`[WEB SIMULATION] Would cd to: ${path}`);
      return { path };
    }
  }

  static async getCurrentDirectory(): Promise<{ path: string; home: string }> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.getCurrentDirectory();
      } catch (error) {
        console.error('Failed to get current directory:', error);
        return { path: '/home/cvj', home: '/home/cvj' };
      }
    } else {
      return { path: '/home/cvj', home: '/home/cvj' };
    }
  }

  static async getSystemInfo(): Promise<SystemInfo | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        return await NativeShell.getSystemInfo();
      } catch (error) {
        console.error('Failed to get system info:', error);
        return null;
      }
    } else {
      return {
        manufacturer: 'Web Simulation',
        model: 'Browser',
        device: 'web',
        brand: 'Lovable',
        hardware: 'virtual',
        androidVersion: 'N/A',
        sdkVersion: 0,
        supportedAbis: '[x86_64]',
        maxMemory: 4294967296,
        totalMemory: 2147483648,
        freeMemory: 1073741824,
        homeDirectory: '/home/cvj',
        currentDirectory: '/home/cvj',
        externalStorage: '/sdcard'
      };
    }
  }

  static async requestStoragePermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await NativeShell.requestStoragePermission();
        return result.granted;
      } catch (error) {
        console.error('Failed to request storage permission:', error);
        return false;
      }
    }
    return true; // Web always has access
  }

  static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }
}
