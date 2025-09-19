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
    // Latest Windows Versions
    {
      id: 'windows-13',
      name: 'Windows 13 Pro',
      type: 'windows',
      description: 'Latest Windows with enhanced AI integration',
      version: '25398',
      architecture: 'x86_64',
      diskSize: 12288,
      minMemory: 4096
    },
    {
      id: 'windows-11-24h2',
      name: 'Windows 11 24H2',
      type: 'windows', 
      description: 'Windows 11 with latest feature updates',
      version: '24H2',
      architecture: 'x86_64',
      diskSize: 10240,
      minMemory: 3072
    },
    {
      id: 'windows-server-2025',
      name: 'Windows Server 2025',
      type: 'windows',
      description: 'Latest Windows Server with advanced containerization',
      version: '2025',
      architecture: 'x86_64',
      diskSize: 16384,
      minMemory: 6144
    },
    
    // Latest Linux Distributions
    {
      id: 'blackarch-2024',
      name: 'BlackArch Linux',
      type: 'linux',
      description: 'Penetration testing distribution with 2800+ tools',
      version: '2024.12.01',
      architecture: 'x86_64',
      diskSize: 8192,
      minMemory: 2048
    },
    {
      id: 'kali-rolling',
      name: 'Kali Linux Rolling',
      type: 'linux',
      description: 'Latest Kali with rolling release updates',
      version: '2024.4',
      architecture: 'x86_64',
      diskSize: 6144,
      minMemory: 2048
    },
    {
      id: 'parrot-os',
      name: 'Parrot Security OS',
      type: 'linux',
      description: 'Security-focused distribution with anonymity tools',
      version: '6.2',
      architecture: 'x86_64',
      diskSize: 5120,
      minMemory: 1536
    },
    {
      id: 'ubuntu-24-10',
      name: 'Ubuntu 24.10',
      type: 'linux',
      description: 'Latest Ubuntu with enhanced performance',
      version: '24.10',
      architecture: 'x86_64',
      diskSize: 3072,
      minMemory: 1024
    },
    {
      id: 'arch-rolling',
      name: 'Arch Linux',
      type: 'linux',
      description: 'Bleeding-edge rolling release distribution',
      version: 'rolling',
      architecture: 'x86_64',
      diskSize: 2048,
      minMemory: 768
    },
    {
      id: 'fedora-40',
      name: 'Fedora 40',
      type: 'linux',
      description: 'Latest Fedora with cutting-edge features',
      version: '40',
      architecture: 'x86_64',
      diskSize: 4096,
      minMemory: 1536
    },
    {
      id: 'rocky-linux-9',
      name: 'Rocky Linux 9',
      type: 'linux',
      description: 'Enterprise-class Linux distribution',
      version: '9.5',
      architecture: 'x86_64',
      diskSize: 3072,
      minMemory: 1024
    },
    {
      id: 'alpine-edge',
      name: 'Alpine Linux Edge',
      type: 'linux',
      description: 'Ultra-lightweight security-focused distribution',
      version: 'edge',
      architecture: 'x86_64',
      diskSize: 256,
      minMemory: 128
    },
    
    // Latest macOS
    {
      id: 'macos-sequoia',
      name: 'macOS Sequoia',
      type: 'macos',
      description: 'macOS 15 with enhanced Apple Intelligence',
      version: '15.1',
      architecture: 'x86_64',
      diskSize: 8192,
      minMemory: 6144
    },
    {
      id: 'macos-sonoma',
      name: 'macOS Sonoma',
      type: 'macos',
      description: 'macOS 14 with interactive widgets',
      version: '14.7',
      architecture: 'x86_64',
      diskSize: 7168,
      minMemory: 5120
    },
    
    // Latest Mobile/Specialized OS
    {
      id: 'android-15',
      name: 'Android 15',
      type: 'android',
      description: 'Android 15 with enhanced privacy controls',
      version: '15.0',
      architecture: 'x86_64',
      diskSize: 4096,
      minMemory: 2048
    },
    {
      id: 'lineage-21',
      name: 'LineageOS 21',
      type: 'android',
      description: 'Privacy-focused Android distribution',
      version: '21.0',
      architecture: 'x86_64',
      diskSize: 3584,
      minMemory: 1536
    },
    
    // Specialized Security & Forensics
    {
      id: 'caine-12',
      name: 'CAINE Linux',
      type: 'linux',
      description: 'Computer Aided Investigative Environment',
      version: '12.0',
      architecture: 'x86_64',
      diskSize: 4096,
      minMemory: 1536
    },
    {
      id: 'tsurugi-2024',
      name: 'TSURUGI Linux',
      type: 'linux',
      description: 'DFIR (Digital Forensics and Incident Response)',
      version: '2024.1',
      architecture: 'x86_64',
      diskSize: 6144,
      minMemory: 2048
    },
    
    // Container & Cloud OS
    {
      id: 'talos-linux',
      name: 'Talos Linux',
      type: 'linux',
      description: 'Immutable Kubernetes OS',
      version: '1.8.1',
      architecture: 'x86_64',
      diskSize: 1024,
      minMemory: 512
    },
    {
      id: 'bottlerocket',
      name: 'Bottlerocket OS',
      type: 'linux',
      description: 'Container-optimized Linux by AWS',
      version: '1.21.0',
      architecture: 'x86_64',
      diskSize: 2048,
      minMemory: 1024
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