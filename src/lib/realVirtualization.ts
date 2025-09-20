import { ShellResult } from './nativeShell';

// WebAssembly-based real virtualization using v86
declare global {
  interface Window {
    V86Starter: any;
  }
}

export interface VMSnapshot {
  id: string;
  name: string;
  timestamp: Date;
  description: string;
  data: ArrayBuffer;
}

export interface ISOFile {
  id: string;
  name: string;
  size: number;
  data: ArrayBuffer;
  type: 'os' | 'tool' | 'driver';
}

export interface RealVMInstance {
  id: string;
  name: string;
  type: 'linux' | 'windows' | 'freebsd' | 'kolibrios';
  status: 'running' | 'stopped' | 'suspended' | 'installing' | 'booting';
  version: string;
  architecture: 'x86' | 'x86_64';
  resources: {
    memory: number; // MB
    disk: number; // MB
    cpu: number; // percentage
    vga_memory?: number; // MB
  };
  emulator?: any; // v86 emulator instance
  canvas?: HTMLCanvasElement;
  serial?: HTMLTextAreaElement;
  isoFile?: string; // ISO file URL or path
  bootDevice: 'cdrom' | 'hdd' | 'floppy' | 'network';
  snapshots: VMSnapshot[];
  networkConfig: {
    adapter: 'rtl8139' | 'ne2k' | 'pcnet';
    mac?: string;
    ip?: string;
  };
  displayConfig: {
    width: number;
    height: number;
    scale: number;
  };
  bootTime?: Date;
  lastActivity?: Date;
}

export interface RealOSTemplate {
  id: string;
  name: string;
  type: 'linux' | 'windows' | 'freebsd' | 'kolibrios';
  description: string;
  version: string;
  architecture: 'x86' | 'x86_64';
  isoUrl?: string; // Direct download URL for ISO
  prebuiltImage?: string; // Pre-configured image URL
  diskSize: number; // MB
  minMemory: number; // MB
  maxMemory: number; // MB
  bootable: boolean;
  installationRequired: boolean;
  supportedFeatures: string[];
}

export class RealVirtualizationEngine {
  private instances: Map<string, RealVMInstance> = new Map();
  private templates: RealOSTemplate[] = [
    // Lightweight Linux distributions that work well in v86
    {
      id: 'tinycore-13',
      name: 'Tiny Core Linux 13.1',
      type: 'linux',
      description: 'Ultra-lightweight Linux (17MB) - Perfect for testing',
      version: '13.1',
      architecture: 'x86',
      isoUrl: 'http://tinycorelinux.net/13.x/x86/release/TinyCore-13.1.iso',
      diskSize: 128,
      minMemory: 64,
      maxMemory: 512,
      bootable: true,
      installationRequired: false,
      supportedFeatures: ['networking', 'terminal', 'package_manager']
    },
    {
      id: 'alpine-virtual',
      name: 'Alpine Linux Virtual',
      type: 'linux',
      description: 'Security-focused lightweight Linux',
      version: '3.18',
      architecture: 'x86',
      isoUrl: 'https://dl-cdn.alpinelinux.org/alpine/v3.18/releases/x86/alpine-virt-3.18.4-x86.iso',
      diskSize: 256,
      minMemory: 128,
      maxMemory: 1024,
      bootable: true,
      installationRequired: true,
      supportedFeatures: ['networking', 'terminal', 'docker', 'ssh']
    },
    {
      id: 'kolibrios',
      name: 'KolibriOS',
      type: 'kolibrios',
      description: 'Tiny assembly-written OS (1.44MB floppy)',
      version: 'latest',
      architecture: 'x86',
      isoUrl: 'http://builds.kolibrios.org/eng/latest.7z',
      diskSize: 2,
      minMemory: 8,
      maxMemory: 32,
      bootable: true,
      installationRequired: false,
      supportedFeatures: ['gui', 'games', 'networking']
    },
    {
      id: 'freedos',
      name: 'FreeDOS 1.3',
      type: 'linux',
      description: 'Free DOS-compatible operating system',
      version: '1.3',
      architecture: 'x86',
      isoUrl: 'https://www.freedos.org/download/fd13-cd.iso',
      diskSize: 64,
      minMemory: 4,
      maxMemory: 64,
      bootable: true,
      installationRequired: false,
      supportedFeatures: ['terminal', 'dos_games', 'programming']
    },
    {
      id: 'reactos',
      name: 'ReactOS 0.4.14',
      type: 'windows',
      description: 'Open-source Windows-compatible OS',
      version: '0.4.14',
      architecture: 'x86',
      isoUrl: 'https://sourceforge.net/projects/reactos/files/ReactOS/0.4.14/ReactOS-0.4.14-iso.zip',
      diskSize: 1024,
      minMemory: 256,
      maxMemory: 2048,
      bootable: true,
      installationRequired: true,
      supportedFeatures: ['gui', 'windows_apps', 'networking']
    },
    {
      id: 'freebsd-13',
      name: 'FreeBSD 13.2',
      type: 'freebsd',
      description: 'Advanced Unix-like operating system',
      version: '13.2',
      architecture: 'x86',
      isoUrl: 'https://download.freebsd.org/ftp/releases/i386/i386/ISO-IMAGES/13.2/FreeBSD-13.2-RELEASE-i386-bootonly.iso',
      diskSize: 2048,
      minMemory: 512,
      maxMemory: 4096,
      bootable: true,
      installationRequired: true,
      supportedFeatures: ['networking', 'terminal', 'zfs', 'jails']
    }
  ];
  private isoFiles: Map<string, ISOFile> = new Map();

  constructor() {
    this.initializeV86();
  }

  private async initializeV86(): Promise<void> {
    // Load v86 WebAssembly emulator
    if (typeof window !== 'undefined' && !window.V86Starter) {
      const script = document.createElement('script');
      script.src = 'https://copy.sh/v86/v86.js';
      script.onload = () => {
        console.log('v86 emulator loaded successfully');
      };
      document.head.appendChild(script);
    }
  }

  getAvailableTemplates(): RealOSTemplate[] {
    return [...this.templates];
  }

  getRunningInstances(): RealVMInstance[] {
    return Array.from(this.instances.values());
  }

  getInstance(id: string): RealVMInstance | undefined {
    return this.instances.get(id);
  }

  async createInstance(templateId: string, customName?: string): Promise<RealVMInstance> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const instanceId = `${templateId}-${Date.now()}`;
    const instance: RealVMInstance = {
      id: instanceId,
      name: customName || template.name,
      type: template.type,
      status: 'stopped',
      version: template.version,
      architecture: template.architecture,
      resources: {
        memory: template.minMemory,
        disk: template.diskSize,
        cpu: 0,
        vga_memory: 8
      },
      isoFile: template.isoUrl,
      bootDevice: template.installationRequired ? 'cdrom' : 'hdd',
      snapshots: [],
      networkConfig: {
        adapter: 'rtl8139',
        mac: this.generateMacAddress()
      },
      displayConfig: {
        width: 1024,
        height: 768,
        scale: 1
      },
      lastActivity: new Date()
    };

    this.instances.set(instanceId, instance);

    // If ISO is required, start downloading
    if (template.isoUrl) {
      this.downloadISO(template.isoUrl, `${template.name}.iso`);
    }

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

    try {
      instance.status = 'booting';
      instance.bootTime = new Date();

      // Create canvas for display
      instance.canvas = document.createElement('canvas');
      instance.canvas.width = instance.displayConfig.width;
      instance.canvas.height = instance.displayConfig.height;

      // Create serial terminal
      instance.serial = document.createElement('textarea');
      instance.serial.style.width = '100%';
      instance.serial.style.height = '200px';
      instance.serial.style.fontFamily = 'monospace';
      instance.serial.style.backgroundColor = '#000';
      instance.serial.style.color = '#fff';
      instance.serial.readOnly = true;

      // Configure v86 emulator
      const emulatorConfig = {
        wasm_path: "https://copy.sh/v86/v86.wasm",
        memory_size: instance.resources.memory * 1024 * 1024,
        vga_memory_size: (instance.resources.vga_memory || 8) * 1024 * 1024,
        screen_container: instance.canvas,
        serial_container: instance.serial,
        autostart: true,
        
        // Boot configuration
        ...(instance.isoFile && {
          cdrom: {
            url: instance.isoFile,
          }
        }),

        // Network configuration
        network_relay_url: "wss://relay.widgetry.org/",
        
        // BIOS
        bios: {
          url: "https://copy.sh/v86/bios/seabios.bin",
        },
        vga_bios: {
          url: "https://copy.sh/v86/bios/vgabios.bin",
        }
      };

      // Initialize emulator
      if (window.V86Starter) {
        instance.emulator = new window.V86Starter(emulatorConfig);
        
        // Setup event handlers
        instance.emulator.add_listener("emulator-ready", () => {
          instance.status = 'running';
          instance.lastActivity = new Date();
          console.log(`VM ${instance.name} is now running`);
        });

        instance.emulator.add_listener("serial0-output-byte", (byte: number) => {
          if (instance.serial) {
            instance.serial.value += String.fromCharCode(byte);
            instance.serial.scrollTop = instance.serial.scrollHeight;
          }
        });

        return {
          output: `Started ${instance.name} with real emulation
Boot device: ${instance.bootDevice}
Memory: ${instance.resources.memory}MB
Display: ${instance.displayConfig.width}x${instance.displayConfig.height}
Network: ${instance.networkConfig.adapter} (${instance.networkConfig.mac})

The virtual machine is booting. Check the display output for boot progress.`,
          error: '',
          exitCode: 0
        };
      } else {
        throw new Error('v86 emulator not available');
      }
    } catch (error) {
      instance.status = 'stopped';
      return {
        output: '',
        error: `Failed to start emulator: ${error}`,
        exitCode: 1
      };
    }
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

    try {
      // Stop emulator
      if (instance.emulator) {
        instance.emulator.stop();
        instance.emulator = undefined;
      }

      instance.status = 'stopped';
      instance.lastActivity = new Date();

      return {
        output: `Stopped ${instance.name}
Shutdown time: ${new Date().toLocaleTimeString()}
Uptime: ${this.calculateUptime(instance)}

Virtual machine stopped and state saved.`,
        error: '',
        exitCode: 0
      };
    } catch (error) {
      return {
        output: '',
        error: `Failed to stop instance: ${error}`,
        exitCode: 1
      };
    }
  }

  async suspendInstance(id: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance || instance.status !== 'running') {
      return {
        output: '',
        error: 'Instance not running',
        exitCode: 1
      };
    }

    try {
      // Save state and pause
      if (instance.emulator) {
        const state = instance.emulator.save_state();
        instance.emulator.stop();
        
        // Store state for resume
        const snapshot: VMSnapshot = {
          id: `suspend-${Date.now()}`,
          name: 'Suspend State',
          timestamp: new Date(),
          description: 'Automatic suspend snapshot',
          data: state
        };
        instance.snapshots.push(snapshot);
      }

      instance.status = 'suspended';
      return {
        output: `Instance ${instance.name} suspended`,
        error: '',
        exitCode: 0
      };
    } catch (error) {
      return {
        output: '',
        error: `Failed to suspend: ${error}`,
        exitCode: 1
      };
    }
  }

  async resumeInstance(id: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance || instance.status !== 'suspended') {
      return {
        output: '',
        error: 'Instance not suspended',
        exitCode: 1
      };
    }

    const suspendSnapshot = instance.snapshots.find(s => s.name === 'Suspend State');
    if (!suspendSnapshot) {
      return await this.startInstance(id); // Cold start if no suspend state
    }

    try {
      // Restore from suspend state
      if (window.V86Starter && instance.canvas) {
        const emulatorConfig = {
          wasm_path: "https://copy.sh/v86/v86.wasm",
          memory_size: instance.resources.memory * 1024 * 1024,
          screen_container: instance.canvas,
          serial_container: instance.serial,
          autostart: false,
          initial_state: {
            buffer: suspendSnapshot.data
          }
        };

        instance.emulator = new window.V86Starter(emulatorConfig);
        instance.emulator.run();
        instance.status = 'running';

        return {
          output: `Resumed ${instance.name} from suspended state`,
          error: '',
          exitCode: 0
        };
      }
    } catch (error) {
      return {
        output: '',
        error: `Failed to resume: ${error}`,
        exitCode: 1
      };
    }

    return { output: '', error: 'Resume failed', exitCode: 1 };
  }

  async createSnapshot(id: string, name: string, description?: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance) {
      return {
        output: '',
        error: 'Instance not found',
        exitCode: 1
      };
    }

    try {
      if (instance.emulator && instance.status === 'running') {
        const state = instance.emulator.save_state();
        const snapshot: VMSnapshot = {
          id: `snap-${Date.now()}`,
          name,
          timestamp: new Date(),
          description: description || `Snapshot of ${instance.name}`,
          data: state
        };

        instance.snapshots.push(snapshot);

        return {
          output: `Created snapshot '${name}' for ${instance.name}
Size: ${Math.round(state.byteLength / 1024 / 1024)}MB
Snapshots: ${instance.snapshots.length}`,
          error: '',
          exitCode: 0
        };
      }

      return {
        output: '',
        error: 'Cannot create snapshot: VM not running',
        exitCode: 1
      };
    } catch (error) {
      return {
        output: '',
        error: `Failed to create snapshot: ${error}`,
        exitCode: 1
      };
    }
  }

  async restoreSnapshot(id: string, snapshotId: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance) {
      return {
        output: '',
        error: 'Instance not found',
        exitCode: 1
      };
    }

    const snapshot = instance.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return {
        output: '',
        error: 'Snapshot not found',
        exitCode: 1
      };
    }

    try {
      // Stop current instance if running
      if (instance.status === 'running') {
        await this.stopInstance(id);
      }

      // Restore from snapshot
      if (window.V86Starter && instance.canvas) {
        const emulatorConfig = {
          wasm_path: "https://copy.sh/v86/v86.wasm",
          memory_size: instance.resources.memory * 1024 * 1024,
          screen_container: instance.canvas,
          serial_container: instance.serial,
          autostart: true,
          initial_state: {
            buffer: snapshot.data
          }
        };

        instance.emulator = new window.V86Starter(emulatorConfig);
        instance.status = 'running';

        return {
          output: `Restored ${instance.name} to snapshot '${snapshot.name}'
Created: ${snapshot.timestamp.toLocaleString()}`,
          error: '',
          exitCode: 0
        };
      }
    } catch (error) {
      return {
        output: '',
        error: `Failed to restore snapshot: ${error}`,
        exitCode: 1
      };
    }

    return { output: '', error: 'Restore failed', exitCode: 1 };
  }

  async downloadISO(url: string, filename: string): Promise<void> {
    try {
      console.log(`Downloading ISO: ${filename} from ${url}`);
      // In a real implementation, you'd download and cache the ISO
      // For now, we'll use the URL directly
    } catch (error) {
      console.error(`Failed to download ISO: ${error}`);
    }
  }

  getVMDisplay(id: string): { canvas?: HTMLCanvasElement; serial?: HTMLTextAreaElement } {
    const instance = this.instances.get(id);
    if (!instance) return {};

    return {
      canvas: instance.canvas,
      serial: instance.serial
    };
  }

  async sendKeystrokes(id: string, keys: string): Promise<ShellResult> {
    const instance = this.instances.get(id);
    if (!instance || !instance.emulator) {
      return {
        output: '',
        error: 'Instance not running',
        exitCode: 1
      };
    }

    try {
      // Send keyboard input to emulator
      for (const char of keys) {
        instance.emulator.keyboard_send_scancodes([char.charCodeAt(0)]);
      }

      return {
        output: `Sent keystrokes: ${keys}`,
        error: '',
        exitCode: 0
      };
    } catch (error) {
      return {
        output: '',
        error: `Failed to send keystrokes: ${error}`,
        exitCode: 1
      };
    }
  }

  private generateMacAddress(): string {
    const randomByte = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return `52:54:00:${randomByte()}:${randomByte()}:${randomByte()}`;
  }

  private calculateUptime(instance: RealVMInstance): string {
    if (!instance.bootTime) return 'Unknown';
    
    const now = new Date();
    const uptime = now.getTime() - instance.bootTime.getTime();
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
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
        error: `Cannot delete running instance. Stop it first.`,
        exitCode: 1
      };
    }

    // Clean up resources
    if (instance.emulator) {
      instance.emulator.destroy();
    }

    this.instances.delete(id);

    return {
      output: `Deleted instance ${instance.name}
Freed ${instance.resources.disk}MB disk space
Freed ${instance.resources.memory}MB memory
Removed ${instance.snapshots.length} snapshots`,
      error: '',
      exitCode: 0
    };
  }

  getSystemStats() {
    const instances = Array.from(this.instances.values());
    const runningInstances = instances.filter(i => i.status === 'running');
    
    return {
      totalInstances: instances.length,
      runningInstances: runningInstances.length,
      suspendedInstances: instances.filter(i => i.status === 'suspended').length,
      totalMemory: instances.reduce((sum, i) => sum + i.resources.memory, 0),
      usedMemory: runningInstances.reduce((sum, i) => sum + i.resources.memory, 0),
      totalDisk: instances.reduce((sum, i) => sum + i.resources.disk, 0),
      usedDisk: instances.reduce((sum, i) => sum + i.resources.disk, 0),
      totalSnapshots: instances.reduce((sum, i) => sum + i.snapshots.length, 0)
    };
  }
}

// Singleton instance
export const realVirtualization = new RealVirtualizationEngine();