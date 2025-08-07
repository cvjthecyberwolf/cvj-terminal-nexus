import { fileSystem } from './fileSystem';
import { unixCommands } from './unixCommands';

interface Package {
  name: string;
  version: string;
  description: string;
  url?: string;
  dependencies: string[];
  installed: boolean;
  size: number;
}

interface Repository {
  name: string;
  url: string;
  packages: Package[];
}

export class RealPackageManager {
  private repositories: Repository[] = [];
  private installedPackages: Map<string, Package> = new Map();
  
  constructor() {
    this.initializeRepositories();
  }

  private initializeRepositories(): void {
    // CVJ Terminal OS Mirror Repositories
    this.repositories = [
      {
        name: 'cvj-main',
        url: 'https://mirrors.cvj-os.org/main',
        packages: [
          { name: 'nmap', version: '7.94', description: 'Network exploration tool and security scanner', dependencies: [], installed: false, size: 2048000 },
          { name: 'metasploit-framework', version: '6.3.57', description: 'Advanced penetration testing platform', dependencies: ['ruby', 'postgresql'], installed: false, size: 104857600 },
          { name: 'burpsuite', version: '2024.1.1', description: 'Web application security testing', dependencies: ['java'], installed: false, size: 52428800 },
          { name: 'wireshark', version: '4.2.2', description: 'Network protocol analyzer', dependencies: ['libpcap'], installed: false, size: 31457280 },
          { name: 'aircrack-ng', version: '1.7', description: 'WiFi security auditing tools suite', dependencies: [], installed: false, size: 5242880 },
          { name: 'hashcat', version: '6.2.6', description: 'Advanced password recovery utility', dependencies: [], installed: false, size: 15728640 },
          { name: 'john', version: '1.9.0', description: 'John the Ripper password cracker', dependencies: [], installed: false, size: 10485760 },
          { name: 'hydra', version: '9.5', description: 'Very fast network logon cracker', dependencies: [], installed: false, size: 3145728 },
          { name: 'sqlmap', version: '1.8.2', description: 'Automatic SQL injection tool', dependencies: ['python3'], installed: false, size: 7340032 },
          { name: 'gobuster', version: '3.6.0', description: 'Directory/File, DNS and VHost busting tool', dependencies: [], installed: false, size: 4194304 },
        ]
      },
      {
        name: 'cvj-security',
        url: 'https://security.cvj-os.org/kali',
        packages: [
          { name: 'nmap', version: '7.94', description: 'Network discovery and security auditing tool', dependencies: [], installed: false, size: 12582912 },
          { name: 'nikto', version: '2.5.0', description: 'Web server vulnerability scanner', dependencies: [], installed: false, size: 8388608 },
          { name: 'metasploit', version: '6.3.42', description: 'Penetration testing framework', dependencies: ['ruby', 'postgresql'], installed: false, size: 473741824 },
          { name: 'burpsuite', version: '2023.10.3', description: 'Web application security testing platform', dependencies: ['java'], installed: false, size: 537919488 },
          { name: 'wireshark', version: '4.2.0', description: 'Network protocol analyzer', dependencies: ['libpcap'], installed: false, size: 94371840 },
          { name: 'aircrack-ng', version: '1.7', description: 'WiFi security auditing tools suite', dependencies: [], installed: false, size: 16252928 },
          { name: 'hashcat', version: '6.2.6', description: 'Advanced password recovery utility', dependencies: ['opencl'], installed: false, size: 70778880 },
          { name: 'sqlmap', version: '1.7.11', description: 'Automatic SQL injection and database takeover tool', dependencies: ['python3'], installed: false, size: 24117248 },
          { name: 'hydra', version: '9.5', description: 'Very fast network logon cracker', dependencies: [], installed: false, size: 19660800 },
          { name: 'dirb', version: '2.22', description: 'Web content scanner', dependencies: [], installed: false, size: 5570560 },
          { name: 'gobuster', version: '3.6', description: 'Directory/file, DNS and VHost busting tool', dependencies: [], installed: false, size: 9437184 },
          { name: 'john', version: '1.9.0', description: 'John the Ripper password cracker', dependencies: [], installed: false, size: 25165824 },
          { name: 'masscan', version: '1.3.2', description: 'TCP port scanner', dependencies: [], installed: false, size: 13421772 },
          { name: 'zap-proxy', version: '2.14.0', description: 'OWASP ZAP web application security scanner', dependencies: ['java'], installed: false, size: 164626432 },
          { name: 'maltego', version: '4.6.0', description: 'Link analysis and data mining platform', dependencies: ['java'], installed: false, size: 209715200 },
          { name: 'beef-xss', version: '0.5.4.0', description: 'Browser Exploitation Framework', dependencies: ['ruby'], installed: false, size: 26214400 },
          { name: 'responder', version: '3.1.4.0', description: 'LLMNR, NBT-NS and MDNS poisoner', dependencies: ['python3'], installed: false, size: 1048576 },
          { name: 'whois', version: '5.5.17', description: 'Client for the whois directory service', dependencies: [], installed: false, size: 1048576 },
          { name: 'recon-ng', version: '5.1.2', description: 'Web reconnaissance framework', dependencies: ['python3'], installed: false, size: 15728640 },
          { name: 'enum4linux', version: '0.9.1', description: 'Tool for enumerating data from Windows and Samba hosts', dependencies: [], installed: false, size: 1572864 },
          { name: 'smbclient', version: '4.19.4', description: 'SMB/CIFS client for Unix systems', dependencies: [], installed: false, size: 5242880 },
          { name: 'netcat', version: '1.10', description: 'Network swiss army knife', dependencies: [], installed: false, size: 524288 },
          { name: 'dnsrecon', version: '1.1.4', description: 'DNS enumeration script', dependencies: ['python3'], installed: false, size: 2097152 },
          { name: 'fierce', version: '1.5.0', description: 'Domain scanner', dependencies: ['python3'], installed: false, size: 1048576 },
          { name: 'theharvester', version: '4.5.1', description: 'E-mails, subdomains and names harvester', dependencies: ['python3'], installed: false, size: 10485760 },
          { name: 'sublist3r', version: '1.0', description: 'Subdomain enumeration tool', dependencies: ['python3'], installed: false, size: 3145728 },
          { name: 'amass', version: '4.2.0', description: 'In-depth attack surface mapping', dependencies: [], installed: false, size: 52428800 },
          { name: 'ffuf', version: '2.1.0', description: 'Fast web fuzzer written in Go', dependencies: [], installed: false, size: 8388608 },
          { name: 'wfuzz', version: '3.1.0', description: 'Web application fuzzer', dependencies: ['python3'], installed: false, size: 4194304 },
          { name: 'nuclei', version: '3.1.0', description: 'Fast and customizable vulnerability scanner', dependencies: [], installed: false, size: 31457280 },
          { name: 'searchsploit', version: '4.50.3', description: 'Command line search tool for Exploit-DB', dependencies: [], installed: false, size: 157286400 },
          { name: 'crackmapexec', version: '5.4.0', description: 'Network service exploitation tool', dependencies: ['python3'], installed: false, size: 20971520 },
          { name: 'impacket', version: '0.11.0', description: 'Collection of Python classes for working with network protocols', dependencies: ['python3'], installed: false, size: 15728640 },
          { name: 'bloodhound', version: '4.3.1', description: 'Active Directory attack path analysis', dependencies: [], installed: false, size: 104857600 },
          { name: 'dirsearch', version: '0.4.3', description: 'Web path scanner', dependencies: ['python3'], installed: false, size: 5242880 },
          { name: 'feroxbuster', version: '2.10.1', description: 'Fast, simple, recursive content discovery tool', dependencies: [], installed: false, size: 12582912 },
          { name: 'whatweb', version: '0.5.5', description: 'Web technology identifier', dependencies: ['ruby'], installed: false, size: 8388608 },
          { name: 'wafw00f', version: '2.2.0', description: 'Web Application Firewall detection tool', dependencies: ['python3'], installed: false, size: 2097152 },
          { name: 'lynis', version: '3.0.9', description: 'Security auditing tool for Unix-based systems', dependencies: [], installed: false, size: 10485760 },
          { name: 'chkrootkit', version: '0.57', description: 'Rootkit detection tool', dependencies: [], installed: false, size: 3145728 },
          { name: 'rkhunter', version: '1.4.6', description: 'Rootkit hunter', dependencies: [], installed: false, size: 5242880 },
          { name: 'all-pentesting-tools', version: '1.0.0', description: 'Meta-package to install all penetration testing tools', dependencies: [], installed: false, size: 2147483648 }
        ]
      },
      {
        name: 'cvj-utils',
        url: 'https://utils.cvj-os.org/main',
        packages: [
          { name: 'firefox', version: '122.0', description: 'Mozilla Firefox web browser', dependencies: [], installed: false, size: 73400320 },
          { name: 'libreoffice', version: '7.6.4', description: 'Office productivity suite', dependencies: [], installed: false, size: 314572800 },
          { name: 'gimp', version: '2.10.36', description: 'GNU Image Manipulation Program', dependencies: [], installed: false, size: 41943040 },
          { name: 'vlc', version: '3.0.20', description: 'VLC media player', dependencies: [], installed: false, size: 20971520 },
          { name: 'git', version: '2.43.0', description: 'Distributed version control system', dependencies: [], installed: false, size: 10485760 },
          { name: 'curl', version: '8.6.0', description: 'Command line tool for transferring data', dependencies: [], installed: false, size: 1572864 },
          { name: 'wget', version: '1.21.4', description: 'Network downloader', dependencies: [], installed: false, size: 2097152 },
          { name: 'htop', version: '3.3.0', description: 'Interactive process viewer', dependencies: [], installed: false, size: 524288 },
          { name: 'tmux', version: '3.4', description: 'Terminal multiplexer', dependencies: [], installed: false, size: 1048576 },
        ]
      },
      {
        name: 'cvj-dev',
        url: 'https://dev.cvj-os.org/packages',
        packages: [
          { name: 'python3', version: '3.12.2', description: 'Python 3 programming language', dependencies: [], installed: false, size: 52428800 },
          { name: 'nodejs', version: '20.11.1', description: 'JavaScript runtime built on Chrome V8', dependencies: [], installed: false, size: 31457280 },
          { name: 'gcc', version: '13.2.0', description: 'GNU Compiler Collection', dependencies: [], installed: false, size: 104857600 },
          { name: 'make', version: '4.4.1', description: 'Build automation tool', dependencies: [], installed: false, size: 1048576 },
          { name: 'cmake', version: '3.28.3', description: 'Cross-platform build system', dependencies: [], installed: false, size: 10485760 },
          { name: 'vim', version: '9.1', description: 'Vi IMproved text editor', dependencies: [], installed: false, size: 3145728 },
          { name: 'nano', version: '7.2', description: 'Simple text editor', dependencies: [], installed: false, size: 524288 },
        ]
      }
    ];
  }

  async updateRepositories(): Promise<string> {
    let output = 'Updating package repositories...\n\n';
    
    for (const repo of this.repositories) {
      output += `Hit:1 ${repo.url} ${repo.name} InRelease\n`;
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    output += '\nReading package lists... Done\n';
    output += `Fetched ${this.getAllPackages().length} packages from ${this.repositories.length} repositories`;
    
    return output;
  }

  async searchPackages(query: string): Promise<Package[]> {
    const allPackages = this.getAllPackages();
    return allPackages.filter(pkg => 
      pkg.name.includes(query.toLowerCase()) || 
      pkg.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async installPackage(packageName: string): Promise<string> {
    // Handle special "all-pentesting-tools" meta-package
    if (packageName === 'all-pentesting-tools') {
      return await this.installAllPenTestingTools();
    }

    const pkg = this.findPackage(packageName);
    
    if (!pkg) {
      throw new Error(`Package '${packageName}' not found in repositories`);
    }
    
    if (pkg.installed) {
      return `Package '${packageName}' is already installed`;
    }

    let output = `Installing ${packageName}...\n`;
    
    // Install dependencies first
    for (const dep of pkg.dependencies) {
      if (!this.installedPackages.has(dep)) {
        output += await this.installPackage(dep);
      }
    }
    
    // Simulate installation process
    output += `Downloading ${packageName}... `;
    await new Promise(resolve => setTimeout(resolve, 200));
    output += 'Done\n';
    
    // Create actual files for the package
    await this.createPackageFiles(pkg);
    
    output += `Unpacking ${packageName}... Done\n`;
    output += `Setting up ${packageName}... Done\n`;
    
    // Mark as installed
    pkg.installed = true;
    this.installedPackages.set(packageName, pkg);
    
    // Mark security tool as installed if it's a security package
    if (this.isSecurityTool(packageName)) {
      const { securityTools } = await import('./securityTools');
      securityTools.markToolAsInstalled(packageName);
    }
    
    return output;
  }

  private async installAllPenTestingTools(): Promise<string> {
    const securityPackages = [
      'nmap', 'nikto', 'metasploit', 'burpsuite', 'wireshark', 
      'aircrack-ng', 'hashcat', 'sqlmap', 'hydra', 'dirb', 
      'gobuster', 'john', 'masscan', 'zap-proxy', 'whois',
      'recon-ng', 'enum4linux', 'smbclient', 'netcat', 'dnsrecon',
      'fierce', 'theharvester', 'sublist3r', 'amass', 'ffuf',
      'wfuzz', 'nuclei', 'searchsploit', 'crackmapexec', 'impacket',
      'bloodhound', 'dirsearch', 'feroxbuster', 'whatweb', 'wafw00f',
      'lynis', 'chkrootkit', 'rkhunter'
    ];

    let output = '🔧 Installing all penetration testing tools...\n\n';
    let successCount = 0;
    let failCount = 0;

    for (const tool of securityPackages) {
      try {
        const result = await this.installPackage(tool);
        if (result.includes('Done')) {
          output += `✅ ${tool} - installed\n`;
          successCount++;
        } else {
          output += `⚠️ ${tool} - ${result}\n`;
          failCount++;
        }
      } catch (error) {
        output += `❌ ${tool} - failed: ${error}\n`;
        failCount++;
      }
    }

    output += `\n📊 Installation Summary:\n`;
    output += `✅ Successfully installed: ${successCount}\n`;
    output += `❌ Failed: ${failCount}\n\n`;
    output += `🚀 All available penetration testing tools are now ready!\n`;
    output += `Use 'cvj scan --help' to see scanning options.\n`;
    output += `Use 'cvj list' to see all installed tools.`;

    return output;
  }

  private isSecurityTool(packageName: string): boolean {
    const securityTools = [
      'nmap', 'nikto', 'metasploit', 'burpsuite', 'wireshark', 
      'aircrack-ng', 'hashcat', 'sqlmap', 'hydra', 'dirb', 
      'gobuster', 'john', 'masscan', 'zap-proxy', 'whois',
      'recon-ng', 'enum4linux', 'smbclient', 'netcat', 'dnsrecon',
      'fierce', 'theharvester', 'sublist3r', 'amass', 'ffuf',
      'wfuzz', 'nuclei', 'searchsploit', 'crackmapexec', 'impacket',
      'bloodhound', 'dirsearch', 'feroxbuster', 'whatweb', 'wafw00f',
      'lynis', 'chkrootkit', 'rkhunter'
    ];
    return securityTools.includes(packageName);
  }

  async removePackage(packageName: string): Promise<string> {
    const pkg = this.installedPackages.get(packageName);
    
    if (!pkg) {
      throw new Error(`Package '${packageName}' is not installed`);
    }
    
    // Remove package files
    try {
      await fileSystem.deleteFile(`/usr/bin/${packageName}`);
      await fileSystem.deleteFile(`/usr/share/doc/${packageName}`);
    } catch (error) {
      // Files might not exist, that's okay
    }
    
    pkg.installed = false;
    this.installedPackages.delete(packageName);
    
    return `Package '${packageName}' removed successfully`;
  }

  async listInstalledPackages(): Promise<Package[]> {
    return Array.from(this.installedPackages.values());
  }

  async downloadAndInstallFromUrl(url: string, packageName?: string): Promise<string> {
    try {
      const name = packageName || url.split('/').pop()?.split('.')[0] || 'package';
      const filename = `/tmp/${name}.tar.gz`;
      
      // Download the package
      await fileSystem.downloadFromUrl(url, filename);
      
      // Extract and install
      const targetDir = `/opt/${name}`;
      await fileSystem.createDirectory(targetDir);
      
      try {
        await fileSystem.extractArchive(filename, targetDir);
      } catch (error) {
        // If it's not an archive, just copy the file
        const content = await fileSystem.readFile(filename);
        await fileSystem.writeFile(`${targetDir}/${name}`, content);
      }
      
      // Create executable link
      const binPath = `/usr/local/bin/${name}`;
      const script = `#!/bin/bash\ncd ${targetDir}\n./${name} "$@"`;
      await fileSystem.writeTextFile(binPath, script);
      
      // Mark as installed
      const pkg: Package = {
        name,
        version: '1.0.0',
        description: `Custom package from ${url}`,
        url,
        dependencies: [],
        installed: true,
        size: (await fileSystem.readFile(filename)).byteLength
      };
      
      this.installedPackages.set(name, pkg);
      
      return `Successfully installed ${name} from ${url}`;
    } catch (error) {
      throw new Error(`Failed to install from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createPackageFiles(pkg: Package): Promise<void> {
    // Create binary file
    const binPath = `/usr/bin/${pkg.name}`;
    const binContent = `#!/bin/bash
# ${pkg.name} v${pkg.version} - ${pkg.description}
echo "Running ${pkg.name} v${pkg.version}"
echo "Description: ${pkg.description}"

case "$1" in
  --version|-v)
    echo "${pkg.name} version ${pkg.version}"
    ;;
  --help|-h)
    echo "Usage: ${pkg.name} [options]"
    echo "  --version, -v    Show version"
    echo "  --help, -h       Show this help"
    ;;
  *)
    echo "${pkg.name} is ready to use!"
    echo "Type '${pkg.name} --help' for usage information"
    ;;
esac`;

    await fileSystem.writeTextFile(binPath, binContent);
    
    // Create documentation
    const docDir = `/usr/share/doc/${pkg.name}`;
    await fileSystem.createDirectory(docDir);
    const docContent = `${pkg.name} v${pkg.version}

${pkg.description}

This package was installed via CVJ Terminal package manager.
`;
    await fileSystem.writeTextFile(`${docDir}/README`, docContent);
  }

  private findPackage(name: string): Package | null {
    for (const repo of this.repositories) {
      const pkg = repo.packages.find(p => p.name === name);
      if (pkg) return pkg;
    }
    return null;
  }

  private getAllPackages(): Package[] {
    return this.repositories.flatMap(repo => repo.packages);
  }

  async getPackageInfo(packageName: string): Promise<string> {
    const pkg = this.findPackage(packageName);
    
    if (!pkg) {
      throw new Error(`Package '${packageName}' not found`);
    }
    
    const sizeInMB = (pkg.size / 1024 / 1024).toFixed(2);
    const status = pkg.installed ? 'installed' : 'not installed';
    
    return `Package: ${pkg.name}
Version: ${pkg.version}
Status: ${status}
Size: ${sizeInMB} MB
Description: ${pkg.description}
Dependencies: ${pkg.dependencies.length > 0 ? pkg.dependencies.join(', ') : 'none'}`;
  }
}

export const packageManager = new RealPackageManager();