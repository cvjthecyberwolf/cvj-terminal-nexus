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
    // Kali Linux repositories
    this.repositories = [
      {
        name: 'kali-main',
        url: 'http://http.kali.org/kali',
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
        name: 'ubuntu-main',
        url: 'http://archive.ubuntu.com/ubuntu',
        packages: [
          { name: 'firefox', version: '122.0', description: 'Mozilla Firefox web browser', dependencies: [], installed: false, size: 73400320 },
          { name: 'libreoffice', version: '7.6.4', description: 'Office productivity suite', dependencies: [], installed: false, size: 314572800 },
          { name: 'gimp', version: '2.10.36', description: 'GNU Image Manipulation Program', dependencies: [], installed: false, size: 41943040 },
          { name: 'vlc', version: '3.0.20', description: 'VLC media player', dependencies: [], installed: false, size: 20971520 },
          { name: 'git', version: '2.43.0', description: 'Distributed version control system', dependencies: [], installed: false, size: 10485760 },
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
    
    return output;
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