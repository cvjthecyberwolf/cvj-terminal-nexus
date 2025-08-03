import { openDB, DBSchema, IDBPDatabase } from 'idb';
import JSZip from 'jszip';

// File system interface
interface FileSystemDB extends DBSchema {
  files: {
    key: string;
    value: {
      path: string;
      content: ArrayBuffer;
      type: 'file' | 'directory';
      permissions: string;
      size: number;
      created: Date;
      modified: Date;
      parent: string;
    };
  };
  metadata: {
    key: string;
    value: any;
  };
}

class RealFileSystem {
  private db: IDBPDatabase<FileSystemDB> | null = null;
  private currentDir = '/';

  async init(): Promise<void> {
    this.db = await openDB<FileSystemDB>('CVJTerminalFS', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'path' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });

    // Initialize root directory if it doesn't exist
    const rootExists = await this.db.get('files', '/');
    if (!rootExists) {
      await this.createInitialFileSystem();
    }
  }

  private async createInitialFileSystem(): Promise<void> {
    if (!this.db) return;

    const now = new Date();
    const rootDir = {
      path: '/',
      content: new ArrayBuffer(0),
      type: 'directory' as const,
      permissions: 'drwxr-xr-x',
      size: 4096,
      created: now,
      modified: now,
      parent: '',
    };

    // Create basic directory structure
    const dirs = [
      '/',
      '/bin',
      '/etc',
      '/home',
      '/home/kali',
      '/opt',
      '/usr',
      '/usr/bin',
      '/usr/local',
      '/var',
      '/tmp',
      '/root',
    ];

    for (const dir of dirs) {
      await this.db.put('files', {
        path: dir,
        content: new ArrayBuffer(0),
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        created: now,
        modified: now,
        parent: dir === '/' ? '' : dir.substring(0, dir.lastIndexOf('/')) || '/',
      });
    }

    // Create basic files
    const encoder = new TextEncoder();
    await this.writeFile('/etc/os-release', encoder.encode(`PRETTY_NAME="Kali GNU/Linux Rolling"
NAME="Kali GNU/Linux"
VERSION_ID="2024.1"
VERSION="2024.1"
VERSION_CODENAME=kali-rolling
ID=kali
ID_LIKE=debian
HOME_URL="https://www.kali.org/"
SUPPORT_URL="https://forums.kali.org/"
BUG_REPORT_URL="https://bugs.kali.org/"
ANSI_COLOR="1;31"`));

    await this.writeFile('/etc/passwd', encoder.encode(`root:x:0:0:root:/root:/bin/bash
kali:x:1000:1000:Kali,,,:/home/kali:/bin/bash`));
  }

  async writeFile(path: string, content: ArrayBuffer): Promise<void> {
    if (!this.db) throw new Error('File system not initialized');

    const now = new Date();
    await this.db.put('files', {
      path: this.resolvePath(path),
      content,
      type: 'file',
      permissions: '-rw-r--r--',
      size: content.byteLength,
      created: now,
      modified: now,
      parent: path.substring(0, path.lastIndexOf('/')) || '/',
    });
  }

  async readFile(path: string): Promise<ArrayBuffer> {
    if (!this.db) throw new Error('File system not initialized');

    const file = await this.db.get('files', this.resolvePath(path));
    if (!file) {
      throw new Error(`No such file or directory: ${path}`);
    }
    if (file.type === 'directory') {
      throw new Error(`${path} is a directory`);
    }
    return file.content;
  }

  async readTextFile(path: string): Promise<string> {
    const buffer = await this.readFile(path);
    return new TextDecoder().decode(buffer);
  }

  async writeTextFile(path: string, content: string): Promise<void> {
    const encoder = new TextEncoder();
    await this.writeFile(path, encoder.encode(content));
  }

  async listDirectory(path?: string): Promise<Array<{ name: string; type: 'file' | 'directory'; size: number; permissions: string; modified: Date }>> {
    if (!this.db) throw new Error('File system not initialized');

    const dirPath = this.resolvePath(path || this.currentDir);
    const tx = this.db.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const files = await store.getAll();

    return files
      .filter(file => file.parent === dirPath && file.path !== dirPath)
      .map(file => ({
        name: file.path.split('/').pop() || '',
        type: file.type,
        size: file.size,
        permissions: file.permissions,
        modified: file.modified,
      }));
  }

  async exists(path: string): Promise<boolean> {
    if (!this.db) throw new Error('File system not initialized');

    const file = await this.db.get('files', this.resolvePath(path));
    return !!file;
  }

  async createDirectory(path: string): Promise<void> {
    if (!this.db) throw new Error('File system not initialized');

    const resolvedPath = this.resolvePath(path);
    const now = new Date();

    await this.db.put('files', {
      path: resolvedPath,
      content: new ArrayBuffer(0),
      type: 'directory',
      permissions: 'drwxr-xr-x',
      size: 4096,
      created: now,
      modified: now,
      parent: resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/',
    });
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.db) throw new Error('File system not initialized');

    const resolvedPath = this.resolvePath(path);
    const file = await this.db.get('files', resolvedPath);
    
    if (!file) {
      throw new Error(`No such file or directory: ${path}`);
    }

    // If it's a directory, check if it's empty
    if (file.type === 'directory') {
      const children = await this.listDirectory(resolvedPath);
      if (children.length > 0) {
        throw new Error(`Directory not empty: ${path}`);
      }
    }

    await this.db.delete('files', resolvedPath);
  }

  async downloadFromUrl(url: string, localPath: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      await this.writeFile(localPath, buffer);
    } catch (error) {
      throw new Error(`Failed to download ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractArchive(archivePath: string, targetDir: string): Promise<void> {
    const archiveBuffer = await this.readFile(archivePath);
    const zip = new JSZip();
    const contents = await zip.loadAsync(archiveBuffer);

    for (const [filename, file] of Object.entries(contents.files)) {
      const fullPath = `${targetDir}/${filename}`;
      
      if (file.dir) {
        await this.createDirectory(fullPath);
      } else {
        const content = await file.async('arraybuffer');
        await this.writeFile(fullPath, content);
      }
    }
  }

  changeDirectory(path: string): string {
    const newPath = this.resolvePath(path);
    this.currentDir = newPath;
    return this.currentDir;
  }

  getCurrentDirectory(): string {
    return this.currentDir;
  }

  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    
    const segments = [...this.currentDir.split('/'), ...path.split('/')];
    const resolved: string[] = [];
    
    for (const segment of segments) {
      if (segment === '' || segment === '.') continue;
      if (segment === '..') {
        resolved.pop();
      } else {
        resolved.push(segment);
      }
    }
    
    return '/' + resolved.join('/').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }
}

export const fileSystem = new RealFileSystem();