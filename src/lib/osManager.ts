import { AndroidShell, ShellResult } from './nativeShell';
import { osSimulation } from './osSimulation';

export interface OSInstance {
  id: string;
  name: string;
  type: 'linux' | 'android' | 'windows' | 'macos';
  status: 'running' | 'stopped' | 'suspended' | 'installing';
  version: string;
  architecture: 'x86_64' | 'arm64' | 'x86';
  resources: {
    memory: number; // MB
    disk: number; // MB
    cpu: number; // percentage
  };
  rootPath: string;
  bootTime?: Date;
  lastActivity?: Date;
}

export interface OSTemplate {
  id: string;
  name: string;
  type: 'linux' | 'android' | 'windows' | 'macos';
  description: string;
  version: string;
  architecture: 'x86_64' | 'arm64' | 'x86';
  downloadUrl?: string;
  diskSize: number; // MB
  minMemory: number; // MB
}

export class OSManager {
  private instances: Map<string, OSInstance> = new Map();
  private templates: OSTemplate[] = [
    {
      id: 'kali-linux',
      name: 'Kali Linux',
      type: 'linux',
      description: 'Penetration testing and security auditing platform',
      version: '2024.1',
      architecture: 'x86_64',
      diskSize: 4096,
      minMemory: 1024
    },
    {
      id: 'ubuntu-server',
      name: 'Ubuntu Server',
      type: 'linux', 
      description: 'Popular server distribution',
      version: '22.04 LTS',
      architecture: 'x86_64',
      diskSize: 2048,
      minMemory: 512
    },
    {
      id: 'alpine-linux',
      name: 'Alpine Linux',
      type: 'linux',
      description: 'Lightweight security-focused distribution',
      version: '3.19',
      architecture: 'x86_64',
      diskSize: 512,
      minMemory: 256
    },
    {
      id: 'android-x86',
      name: 'Android x86',
      type: 'android',
      description: 'Android for PC platforms',
      version: '9.0',
      architecture: 'x86_64',
      diskSize: 3072,
      minMemory: 1024
    },
    {
      id: 'windows-10',
      name: 'Windows 10 LTSC',
      type: 'windows',
      description: 'Windows 10 Long Term Support',
      version: '2021',
      architecture: 'x86_64',
      diskSize: 8192,
      minMemory: 2048
    },
    {
      id: 'macos-ventura',
      name: 'macOS Ventura',
      type: 'macos',
      description: 'macOS 13 Virtual Machine',
      version: '13.0',
      architecture: 'x86_64',
      diskSize: 6144,
      minMemory: 4096
    }
  ];

  constructor() {
    this.initializeDefaultOS();
  }

  private async initializeDefaultOS(): Promise<void> {
    // Create the host CVJ-OS instance
    const hostOS: OSInstance = {
      id: 'cvj-host',
      name: 'CVJ Terminal Nexus',
      type: 'linux',
      status: 'running',
      version: '1.0.0',
      architecture: 'x86_64',
      resources: {
        memory: 4096,
        disk: 16384,
        cpu: 100
      },
      rootPath: '/host',
      bootTime: new Date(),
      lastActivity: new Date()
    };
    
    this.instances.set(hostOS.id, hostOS);
  }

  getAvailableTemplates(): OSTemplate[] {
    return [...this.templates];
  }

  getRunningInstances(): OSInstance[] {
    return Array.from(this.instances.values());
  }

  getInstance(id: string): OSInstance | undefined {
    return this.instances.get(id);
  }

  async createInstance(templateId: string, customName?: string): Promise<OSInstance> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const instanceId = `${templateId}-${Date.now()}`;
    const instance: OSInstance = {
      id: instanceId,
      name: customName || template.name,
      type: template.type,
      status: 'installing',
      version: template.version,
      architecture: template.architecture,
      resources: {
        memory: template.minMemory,
        disk: template.diskSize,
        cpu: 0
      },
      rootPath: `/vms/${instanceId}`,
      lastActivity: new Date()
    };

    this.instances.set(instanceId, instance);

    // Simulate installation process
    setTimeout(() => {
      instance.status = 'stopped';
      instance.lastActivity = new Date();
    }, 3000);

    return instance;
  }

  async startInstance(id: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance) {
      return {
        output: '',
        error: `Instance ${id} not found`,
        exitCode: 1
      };
    }

    if (instance.status === 'running') {
      return {
        output: `Instance ${instance.name} is already running`,
        error: '',
        exitCode: 0
      };
    }

    instance.status = 'running';
    instance.bootTime = new Date();
    instance.lastActivity = new Date();

    // Setup virtual environment and network
    await this.setupVirtualEnvironment(instance);
    const { networkManager } = await import('./networkManager');
    networkManager.createInstanceNetwork(instance);

    return {
      output: `Started ${instance.name} (${instance.type}) on ${instance.architecture}
Boot time: ${instance.bootTime.toLocaleTimeString()}
Memory: ${instance.resources.memory}MB
Disk: ${instance.resources.disk}MB
Root: ${instance.rootPath}

${instance.name} is now running and ready for connections.`,
      error: '',
      exitCode: 0
    };
  }

  async stopInstance(id: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance) {
      return {
        output: '',
        error: `Instance ${id} not found`,
        exitCode: 1
      };
    }

    if (instance.status !== 'running') {
      return {
        output: `Instance ${instance.name} is not running`,
        error: '',
        exitCode: 0
      };
    }

    instance.status = 'stopped';
    instance.lastActivity = new Date();

    return {
      output: `Stopped ${instance.name}
Shutdown time: ${new Date().toLocaleTimeString()}
Uptime: ${this.calculateUptime(instance)}

Instance saved successfully.`,
      error: '',
      exitCode: 0
    };
  }

  async connectToInstance(id: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance) {
      return {
        output: '',
        error: `Instance ${id} not found`,
        exitCode: 1
      };
    }

    if (instance.status !== 'running') {
      return {
        output: '',
        error: `Instance ${instance.name} is not running. Start it first with: vm start ${id}`,
        exitCode: 1
      };
    }

    instance.lastActivity = new Date();

    return {
      output: `Connecting to ${instance.name}...
Connected to ${instance.type} ${instance.version} (${instance.architecture})
Welcome to ${instance.name}

Last login: ${instance.lastActivity.toLocaleString()}
${this.getOSPrompt(instance)}`,
      error: '',
      exitCode: 0
    };
  }

  async executeCommandInInstance(instanceId: string, command: string, args: string[] = []): Promise<ShellResult> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return {
        output: '',
        error: `Instance ${instanceId} not found`,
        exitCode: 1
      };
    }

    if (instance.status !== 'running') {
      return {
        output: '',
        error: `Instance ${instance.name} is not running`,
        exitCode: 1
      };
    }

    return await osSimulation.executeCommand(instance, command, args);
  }

  async deleteInstance(id: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance) {
      return {
        output: '',
        error: `Instance ${id} not found`,
        exitCode: 1
      };
    }

    if (instance.status === 'running') {
      return {
        output: '',
        error: `Cannot delete running instance. Stop it first: vm stop ${id}`,
        exitCode: 1
      };
    }

    this.instances.delete(id);

    return {
      output: `Deleted instance ${instance.name}
Freed ${instance.resources.disk}MB disk space
Freed ${instance.resources.memory}MB memory`,
      error: '',
      exitCode: 0
    };
  }

  private async setupVirtualEnvironment(instance: OSInstance): Promise<void> {
    // Setup virtual file system structure based on OS type
    const setupCommands = this.getSetupCommands(instance);
    
    for (const command of setupCommands) {
      await AndroidShell.executeCommand(command.cmd, command.args);
    }
  }

  private getSetupCommands(instance: OSInstance): Array<{cmd: string, args: string[]}> {
    const baseCommands = [
      { cmd: 'mkdir', args: ['-p', instance.rootPath] },
      { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/bin`] },
      { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/etc`] },
      { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/home`] },
      { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/tmp`] },
      { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/var`] }
    ];

    switch (instance.type) {
      case 'linux':
        return [
          ...baseCommands,
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/usr/bin`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/usr/local`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/opt`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/proc`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/sys`] }
        ];
      case 'android':
        return [
          ...baseCommands,
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/system`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/data`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/sdcard`] }
        ];
      case 'windows':
        return [
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/Windows`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/Program Files`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/Users`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/System32`] }
        ];
      case 'macos':
        return [
          ...baseCommands,
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/Applications`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/System`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/Users`] },
          { cmd: 'mkdir', args: ['-p', `${instance.rootPath}/Library`] }
        ];
      default:
        return baseCommands;
    }
  }

  private getOSPrompt(instance: OSInstance): string {
    switch (instance.type) {
      case 'linux':
        return `root@${instance.name.toLowerCase().replace(/\s+/g, '-')}:~#`;
      case 'android':
        return `shell@android:/ $`;
      case 'windows':
        return `C:\\Windows\\system32>`;
      case 'macos':
        return `${instance.name}:~ root#`;
      default:
        return `${instance.name}> `;
    }
  }

  private calculateUptime(instance: OSInstance): string {
    if (!instance.bootTime) return 'Unknown';
    
    const uptime = Date.now() - instance.bootTime.getTime();
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getSystemStats(): {
    totalInstances: number;
    runningInstances: number;
    totalMemory: number;
    usedMemory: number;
    totalDisk: number;
    usedDisk: number;
  } {
    const instances = Array.from(this.instances.values());
    const running = instances.filter(i => i.status === 'running');
    
    return {
      totalInstances: instances.length,
      runningInstances: running.length,
      totalMemory: 16384, // 16GB total
      usedMemory: running.reduce((sum, i) => sum + i.resources.memory, 0),
      totalDisk: 102400, // 100GB total
      usedDisk: instances.reduce((sum, i) => sum + i.resources.disk, 0)
    };
  }
}

export const osManager = new OSManager();