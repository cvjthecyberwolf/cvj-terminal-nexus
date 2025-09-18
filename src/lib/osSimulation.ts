import { OSInstance } from './osManager';
import { ShellResult } from './nativeShell';

export interface OSCommand {
  command: string;
  args: string[];
  workingDirectory: string;
}

export interface OSEnvironment {
  variables: Record<string, string>;
  path: string[];
  user: string;
  hostname: string;
}

export class OSSimulation {
  private environments: Map<string, OSEnvironment> = new Map();

  constructor() {
    this.initializeEnvironments();
  }

  private initializeEnvironments(): void {
    // Default environments for each OS type
    this.environments.set('linux', {
      variables: {
        'HOME': '/root',
        'USER': 'root',
        'SHELL': '/bin/bash',
        'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        'TERM': 'xterm-256color'
      },
      path: ['/usr/local/sbin', '/usr/local/bin', '/usr/sbin', '/usr/bin', '/sbin', '/bin'],
      user: 'root',
      hostname: 'cvj-linux'
    });

    this.environments.set('windows', {
      variables: {
        'USERPROFILE': 'C:\\Users\\Administrator',
        'USERNAME': 'Administrator', 
        'PATH': 'C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem',
        'COMPUTERNAME': 'CVJ-WINDOWS',
        'OS': 'Windows_NT'
      },
      path: ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Windows\\System32\\Wbem'],
      user: 'Administrator',
      hostname: 'CVJ-WINDOWS'
    });

    this.environments.set('macos', {
      variables: {
        'HOME': '/var/root',
        'USER': 'root',
        'SHELL': '/bin/zsh',
        'PATH': '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
        'TERM': 'xterm-256color'
      },
      path: ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'],
      user: 'root',
      hostname: 'CVJ-macOS'
    });

    this.environments.set('android', {
      variables: {
        'HOME': '/data',
        'USER': 'shell',
        'SHELL': '/system/bin/sh',
        'PATH': '/system/bin:/system/xbin:/vendor/bin',
        'ANDROID_DATA': '/data',
        'ANDROID_ROOT': '/system'
      },
      path: ['/system/bin', '/system/xbin', '/vendor/bin'],
      user: 'shell',
      hostname: 'android'
    });
  }

  async executeCommand(instance: OSInstance, command: string, args: string[] = []): Promise<ShellResult> {
    const env = this.environments.get(instance.type);
    if (!env) {
      return {
        output: '',
        error: `Unsupported OS type: ${instance.type}`,
        exitCode: 1
      };
    }

    // Update last activity
    instance.lastActivity = new Date();

    switch (instance.type) {
      case 'linux':
        return this.executeLinuxCommand(instance, command, args, env);
      case 'windows':
        return this.executeWindowsCommand(instance, command, args, env);
      case 'macos':
        return this.executeMacOSCommand(instance, command, args, env);
      case 'android':
        return this.executeAndroidCommand(instance, command, args, env);
      default:
        return {
          output: '',
          error: `Command not supported on ${instance.type}`,
          exitCode: 1
        };
    }
  }

  private async executeLinuxCommand(instance: OSInstance, command: string, args: string[], env: OSEnvironment): Promise<ShellResult> {
    switch (command.toLowerCase()) {
      case 'ls':
        return this.simulateLinuxLs(instance, args);
      case 'pwd':
        return { output: instance.rootPath, error: '', exitCode: 0 };
      case 'whoami':
        return { output: env.user, error: '', exitCode: 0 };
      case 'uname':
        return this.simulateUname(args);
      case 'ps':
        return this.simulateLinuxPs();
      case 'free':
        return this.simulateFree(instance);
      case 'df':
        return this.simulateDf(instance);
      case 'ip':
      case 'ifconfig':
        return this.simulateNetworkInfo();
      case 'apt':
      case 'apt-get':
        return this.simulateAptGet(args);
      case 'systemctl':
        return this.simulateSystemctl(args);
      default:
        return { output: `${command}: command not found`, error: '', exitCode: 127 };
    }
  }

  private async executeWindowsCommand(instance: OSInstance, command: string, args: string[], env: OSEnvironment): Promise<ShellResult> {
    switch (command.toLowerCase()) {
      case 'dir':
        return this.simulateWindowsDir(instance);
      case 'cd':
        return { output: '', error: '', exitCode: 0 };
      case 'whoami':
        return { output: `${env.hostname}\\${env.user}`, error: '', exitCode: 0 };
      case 'systeminfo':
        return this.simulateSystemInfo(instance);
      case 'tasklist':
        return this.simulateTasklist();
      case 'ipconfig':
        return this.simulateIpconfig();
      case 'net':
        return this.simulateNetCommand(args);
      default:
        return { output: `'${command}' is not recognized as an internal or external command.`, error: '', exitCode: 1 };
    }
  }

  private async executeMacOSCommand(instance: OSInstance, command: string, args: string[], env: OSEnvironment): Promise<ShellResult> {
    switch (command.toLowerCase()) {
      case 'ls':
        return this.simulateMacOSLs(instance, args);
      case 'pwd':
        return { output: instance.rootPath, error: '', exitCode: 0 };
      case 'whoami':
        return { output: env.user, error: '', exitCode: 0 };
      case 'sw_vers':
        return this.simulateSwVers();
      case 'ps':
        return this.simulateMacOSPs();
      case 'top':
        return this.simulateTop(instance);
      case 'ifconfig':
        return this.simulateMacOSIfconfig();
      case 'brew':
        return this.simulateBrew(args);
      default:
        return { output: `${command}: command not found`, error: '', exitCode: 127 };
    }
  }

  private async executeAndroidCommand(instance: OSInstance, command: string, args: string[], env: OSEnvironment): Promise<ShellResult> {
    switch (command.toLowerCase()) {
      case 'ls':
        return this.simulateAndroidLs(instance);
      case 'pwd':
        return { output: '/data', error: '', exitCode: 0 };
      case 'whoami':
        return { output: env.user, error: '', exitCode: 0 };
      case 'getprop':
        return this.simulateGetprop(args);
      case 'ps':
        return this.simulateAndroidPs();
      case 'am':
        return this.simulateActivityManager(args);
      case 'pm':
        return this.simulatePackageManager(args);
      case 'dumpsys':
        return this.simulateDumpsys(args);
      default:
        return { output: `${command}: not found`, error: '', exitCode: 127 };
    }
  }

  // Linux command simulations
  private simulateLinuxLs(instance: OSInstance, args: string[]): ShellResult {
    const items = [
      'bin', 'boot', 'dev', 'etc', 'home', 'lib', 'media', 'mnt', 
      'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 
      'usr', 'var'
    ];
    
    if (args.includes('-la') || args.includes('-al')) {
      const detailed = items.map(item => 
        `drwxr-xr-x 2 root root 4096 ${new Date().toLocaleDateString()} ${item}`
      ).join('\n');
      return { output: `total ${items.length * 4}\n${detailed}`, error: '', exitCode: 0 };
    }
    
    return { output: items.join('  '), error: '', exitCode: 0 };
  }

  private simulateUname(args: string[]): ShellResult {
    if (args.includes('-a')) {
      return { 
        output: 'Linux cvj-linux 5.15.0-cvj #1 SMP x86_64 x86_64 x86_64 GNU/Linux', 
        error: '', 
        exitCode: 0 
      };
    }
    return { output: 'Linux', error: '', exitCode: 0 };
  }

  private simulateLinuxPs(): ShellResult {
    const processes = [
      '  PID TTY          TIME CMD',
      '    1 ?        00:00:01 systemd',
      '    2 ?        00:00:00 kthreadd',
      '   12 ?        00:00:00 bash',
      '   89 pts/0    00:00:00 ps'
    ];
    return { output: processes.join('\n'), error: '', exitCode: 0 };
  }

  private simulateFree(instance: OSInstance): ShellResult {
    const total = instance.resources.memory * 1024; // Convert to KB
    const used = Math.floor(total * 0.3);
    const free = total - used;
    
    return {
      output: `              total        used        free      shared  buff/cache   available
Mem:        ${total}      ${used}      ${free}         0        0      ${free}
Swap:             0           0           0`,
      error: '',
      exitCode: 0
    };
  }

  private simulateDf(instance: OSInstance): ShellResult {
    const diskSize = instance.resources.disk * 1024; // Convert to KB
    const used = Math.floor(diskSize * 0.2);
    const available = diskSize - used;
    
    return {
      output: `Filesystem     1K-blocks   Used Available Use% Mounted on
/dev/sda1        ${diskSize}   ${used}  ${available}  20% /
tmpfs              ${Math.floor(instance.resources.memory * 512)}      0   ${Math.floor(instance.resources.memory * 512)}   0% /dev/shm`,
      error: '',
      exitCode: 0
    };
  }

  private simulateNetworkInfo(): ShellResult {
    return {
      output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)`,
      error: '',
      exitCode: 0
    };
  }

  private simulateAptGet(args: string[]): ShellResult {
    if (args[0] === 'update') {
      return {
        output: `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Reading package lists... Done`,
        error: '',
        exitCode: 0
      };
    }
    return { output: 'E: Invalid operation', error: '', exitCode: 1 };
  }

  private simulateSystemctl(args: string[]): ShellResult {
    if (args[0] === 'status') {
      return {
        output: `● ${args[1] || 'system'} - System service
   Loaded: loaded (/lib/systemd/system/service)
   Active: active (running) since ${new Date().toLocaleString()}`,
        error: '',
        exitCode: 0
      };
    }
    return { output: 'Unknown operation', error: '', exitCode: 1 };
  }

  // Windows command simulations
  private simulateWindowsDir(instance: OSInstance): ShellResult {
    return {
      output: ` Volume in drive C has no label.
 Volume Serial Number is ABCD-1234

 Directory of C:\\

01/01/2024  12:00 AM    <DIR>          Program Files
01/01/2024  12:00 AM    <DIR>          Program Files (x86)
01/01/2024  12:00 AM    <DIR>          Windows
01/01/2024  12:00 AM    <DIR>          Users
               0 File(s)              0 bytes
               4 Dir(s)  ${instance.resources.disk - Math.floor(instance.resources.disk * 0.2)} MB free`,
      error: '',
      exitCode: 0
    };
  }

  private simulateSystemInfo(instance: OSInstance): ShellResult {
    return {
      output: `Host Name:                 CVJ-WINDOWS
OS Name:                   Microsoft Windows 10 Enterprise LTSC
OS Version:                10.0.19044 N/A Build 19044
System Manufacturer:       CVJ Systems
System Model:              Virtual Machine
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                          [01]: Intel64 Family 6 Model 142 Stepping 10 GenuineIntel ~2400 Mhz
Total Physical Memory:     ${instance.resources.memory} MB
Available Physical Memory: ${Math.floor(instance.resources.memory * 0.7)} MB`,
      error: '',
      exitCode: 0
    };
  }

  private simulateTasklist(): ShellResult {
    return {
      output: `Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ =========== ============
System Idle Process              0 Services                   0          8 K
System                           4 Services                   0        228 K
smss.exe                       368 Services                   0      1,024 K
csrss.exe                      584 Services                   0      4,096 K
winlogon.exe                   608 Console                    1      2,048 K`,
      error: '',
      exitCode: 0
    };
  }

  private simulateIpconfig(): ShellResult {
    return {
      output: `Windows IP Configuration

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : 
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
      error: '',
      exitCode: 0
    };
  }

  private simulateNetCommand(args: string[]): ShellResult {
    if (args[0] === 'user') {
      return {
        output: `User accounts for \\\\CVJ-WINDOWS

-------------------------------------------------------------------------------
Administrator            Guest                    
The command completed successfully.`,
        error: '',
        exitCode: 0
      };
    }
    return { output: 'The syntax of this command is:', error: '', exitCode: 1 };
  }

  // macOS command simulations
  private simulateMacOSLs(instance: OSInstance, args: string[]): ShellResult {
    const items = [
      'Applications', 'Library', 'System', 'Users', 'Volumes',
      'bin', 'cores', 'dev', 'etc', 'home', 'opt', 'private',
      'sbin', 'tmp', 'usr', 'var'
    ];
    
    if (args.includes('-la') || args.includes('-al')) {
      const detailed = items.map(item => 
        `drwxr-xr-x  10 root  wheel   320 ${new Date().toLocaleDateString()} ${item}`
      ).join('\n');
      return { output: `total ${items.length * 4}\n${detailed}`, error: '', exitCode: 0 };
    }
    
    return { output: items.join('  '), error: '', exitCode: 0 };
  }

  private simulateSwVers(): ShellResult {
    return {
      output: `ProductName:	macOS
ProductVersion:	13.0
BuildVersion:	22A380`,
      error: '',
      exitCode: 0
    };
  }

  private simulateMacOSPs(): ShellResult {
    const processes = [
      '  PID TTY           TIME CMD',
      '    1 ??         0:02.34 /sbin/launchd',
      '   50 ??         0:00.12 /usr/sbin/syslogd',
      '   89 ttys000     0:00.01 -bash',
      '  156 ttys000     0:00.00 ps'
    ];
    return { output: processes.join('\n'), error: '', exitCode: 0 };
  }

  private simulateTop(instance: OSInstance): ShellResult {
    return {
      output: `Processes: 245 total, 3 running, 242 sleeping, 1210 threads
Load Avg: 1.23, 1.45, 1.67  CPU usage: 12.34% user, 5.67% sys, 82.99% idle
SharedLibs: 245M resident, 67M data, 23M linkedit.
MemRegions: 65432 total, 4567M resident, 123M private, 890M shared.
PhysMem: ${instance.resources.memory}M used (1234M wired), 567M unused.
VM: 12G vsize, 1234M framework vsize, 0(0) swapins, 0(0) swapouts.`,
      error: '',
      exitCode: 0
    };
  }

  private simulateMacOSIfconfig(): ShellResult {
    return {
      output: `lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
	inet 127.0.0.1 netmask 0xff000000 
	inet6 ::1 prefixlen 128 
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	ether a4:83:e7:12:34:56 
	inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255`,
      error: '',
      exitCode: 0
    };
  }

  private simulateBrew(args: string[]): ShellResult {
    if (args[0] === 'list') {
      return {
        output: `git
node
python@3.9
wget`,
        error: '',
        exitCode: 0
      };
    }
    return { output: 'Unknown command', error: '', exitCode: 1 };
  }

  // Android command simulations
  private simulateAndroidLs(instance: OSInstance): ShellResult {
    const items = [
      'acct', 'cache', 'charger', 'config', 'data', 'dev',
      'etc', 'init', 'mnt', 'proc', 'root', 'sbin', 'sdcard',
      'storage', 'sys', 'system', 'vendor'
    ];
    return { output: items.join('  '), error: '', exitCode: 0 };
  }

  private simulateGetprop(args: string[]): ShellResult {
    const props: Record<string, string> = {
      'ro.build.version.release': '9.0',
      'ro.build.version.sdk': '28',
      'ro.product.model': 'CVJ Android x86',
      'ro.product.manufacturer': 'CVJ Systems',
      'ro.hardware': 'cvj_x86'
    };

    if (args.length === 0) {
      const output = Object.entries(props)
        .map(([key, value]) => `[${key}]: [${value}]`)
        .join('\n');
      return { output, error: '', exitCode: 0 };
    }

    const prop = props[args[0]];
    if (prop) {
      return { output: prop, error: '', exitCode: 0 };
    }

    return { output: '', error: '', exitCode: 0 };
  }

  private simulateAndroidPs(): ShellResult {
    const processes = [
      'USER     PID   PPID  VSIZE  RSS     WCHAN    PC        NAME',
      'root      1     0     1234   567   ffffffff 00000000 S /init',
      'root      2     0     0      0     ffffffff 00000000 S kthreadd',
      'system    89    1     12345  2345  ffffffff 00000000 S system_server',
      'shell     156   89    5678   1234  00000000 40001234 R ps'
    ];
    return { output: processes.join('\n'), error: '', exitCode: 0 };
  }

  private simulateActivityManager(args: string[]): ShellResult {
    if (args[0] === 'start') {
      return {
        output: 'Starting: Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] cmp=com.example/.MainActivity }',
        error: '',
        exitCode: 0
      };
    }
    return { output: 'Unknown command', error: '', exitCode: 1 };
  }

  private simulatePackageManager(args: string[]): ShellResult {
    if (args[0] === 'list') {
      return {
        output: `package:com.android.settings
package:com.android.browser
package:com.google.android.gms
package:com.cvj.terminal`,
        error: '',
        exitCode: 0
      };
    }
    return { output: 'Unknown command', error: '', exitCode: 1 };
  }

  private simulateDumpsys(args: string[]): ShellResult {
    if (args[0] === 'battery') {
      return {
        output: `Current Battery Service state:
  AC powered: true
  USB powered: false
  Wireless powered: false
  status: 2
  health: 2
  present: true
  level: 85
  scale: 100
  voltage: 4200
  temperature: 250`,
        error: '',
        exitCode: 0
      };
    }
    return { output: 'Service not found', error: '', exitCode: 1 };
  }

  getEnvironment(osType: string): OSEnvironment | undefined {
    return this.environments.get(osType);
  }
}

export const osSimulation = new OSSimulation();