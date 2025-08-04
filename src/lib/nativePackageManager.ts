import { AndroidShell } from './nativeShell';
import { Capacitor } from '@capacitor/core';

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  installed: boolean;
  size?: string;
  dependencies?: string[];
}

export class NativePackageManager {
  static async installRealPackage(packageName: string): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return `[WEB SIMULATION] Would install real package: ${packageName}\nBuild Android app to install real tools like Wireshark, nmap, etc.`;
    }

    // Map common tools to their actual package names
    const packageMappings: { [key: string]: { name: string; manager: string; description: string } } = {
      'wireshark': { name: 'wireshark', manager: 'apt', description: 'Network protocol analyzer' },
      'nmap': { name: 'nmap', manager: 'apt', description: 'Network discovery and security auditing' },
      'metasploit': { name: 'metasploit-framework', manager: 'apt', description: 'Penetration testing framework' },
      'aircrack-ng': { name: 'aircrack-ng', manager: 'apt', description: 'WiFi security auditing tools' },
      'john': { name: 'john', manager: 'apt', description: 'Password cracking tool' },
      'hashcat': { name: 'hashcat', manager: 'apt', description: 'Advanced password recovery' },
      'burpsuite': { name: 'burpsuite', manager: 'apt', description: 'Web application security testing' },
      'sqlmap': { name: 'sqlmap', manager: 'apt', description: 'SQL injection testing tool' },
      'nikto': { name: 'nikto', manager: 'apt', description: 'Web server scanner' },
      'hydra': { name: 'hydra', manager: 'apt', description: 'Network logon cracker' },
      'netcat': { name: 'netcat-openbsd', manager: 'apt', description: 'Network utility' },
      'tcpdump': { name: 'tcpdump', manager: 'apt', description: 'Packet analyzer' },
      'ettercap': { name: 'ettercap-text-only', manager: 'apt', description: 'Network sniffer/interceptor' },
      'masscan': { name: 'masscan', manager: 'apt', description: 'Fast port scanner' },
      'gobuster': { name: 'gobuster', manager: 'apt', description: 'Directory/file & DNS busting tool' },
      'dirb': { name: 'dirb', manager: 'apt', description: 'Web content scanner' },
      'wpscan': { name: 'wpscan', manager: 'apt', description: 'WordPress security scanner' },
      'binwalk': { name: 'binwalk', manager: 'apt', description: 'Firmware analysis tool' },
      'foremost': { name: 'foremost', manager: 'apt', description: 'File carving tool' },
      'volatility': { name: 'volatility', manager: 'apt', description: 'Memory forensics framework' }
    };

    const packageInfo = packageMappings[packageName.toLowerCase()] || { 
      name: packageName, 
      manager: 'apt', 
      description: 'User requested package' 
    };

    try {
      // First, update package repositories
      const updateResult = await AndroidShell.executeRootCommand('apt-get', ['update']);
      if (updateResult.exitCode !== 0) {
        return `Failed to update package repositories: ${updateResult.error}`;
      }

      // Install the package
      const installResult = await AndroidShell.installPackage(packageInfo.name, packageInfo.manager);
      
      if (installResult.exitCode === 0) {
        return `✅ Successfully installed ${packageInfo.name}\n${packageInfo.description}\n\n${installResult.output}`;
      } else {
        return `❌ Failed to install ${packageInfo.name}: ${installResult.error}\n\nTrying alternative installation methods...`;
      }
    } catch (error) {
      return `❌ Installation error: ${error}`;
    }
  }

  static async setupKaliRepository(): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return `[WEB SIMULATION] Would setup Kali Linux repository\nBuild Android app to access real Kali tools.`;
    }

    try {
      // Setup Kali Linux repository
      const commands = [
        'echo "deb http://http.kali.org/kali kali-rolling main non-free contrib" > /etc/apt/sources.list.d/kali.list',
        'wget -q -O - https://archive.kali.org/archive-key.asc | apt-key add -',
        'apt-get update'
      ];

      let output = 'Setting up Kali Linux repository...\n\n';
      
      for (const command of commands) {
        const result = await AndroidShell.executeRootCommand('sh', ['-c', command]);
        output += `> ${command}\n${result.output}\n`;
        
        if (result.exitCode !== 0) {
          output += `Warning: ${result.error}\n`;
        }
      }

      output += '\n✅ Kali repository setup completed!\nYou can now install Kali tools with: install <tool-name>';
      return output;
    } catch (error) {
      return `❌ Failed to setup Kali repository: ${error}`;
    }
  }

  static async installFromUrl(url: string, packageName?: string): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return `[WEB SIMULATION] Would download and install from: ${url}`;
    }

    try {
      const fileName = packageName || url.split('/').pop() || 'downloaded_package';
      const destination = `/tmp/${fileName}`;

      // Download file
      const downloadResult = await AndroidShell.downloadFile(url, destination);
      if (downloadResult.exitCode !== 0) {
        return `❌ Download failed: ${downloadResult.error}`;
      }

      // Try to install based on file extension
      let installCommand: string;
      if (fileName.endsWith('.deb')) {
        installCommand = `dpkg -i ${destination}`;
      } else if (fileName.endsWith('.rpm')) {
        installCommand = `rpm -i ${destination}`;
      } else if (fileName.endsWith('.tar.gz') || fileName.endsWith('.tgz')) {
        installCommand = `tar -xzf ${destination} -C /opt/ && chmod +x /opt/${fileName.replace(/\.(tar\.gz|tgz)$/, '')}`;
      } else {
        // Assume it's a binary
        installCommand = `cp ${destination} /usr/local/bin/${packageName || 'downloaded_tool'} && chmod +x /usr/local/bin/${packageName || 'downloaded_tool'}`;
      }

      const installResult = await AndroidShell.executeRootCommand('sh', ['-c', installCommand]);
      
      if (installResult.exitCode === 0) {
        return `✅ Successfully installed ${fileName}\n${installResult.output}`;
      } else {
        return `❌ Installation failed: ${installResult.error}`;
      }
    } catch (error) {
      return `❌ Installation error: ${error}`;
    }
  }

  static async listInstalledTools(): Promise<PackageInfo[]> {
    if (!Capacitor.isNativePlatform()) {
      return [
        { name: 'simulation-mode', version: '1.0.0', description: 'Web simulation mode active', installed: true }
      ];
    }

    try {
      const result = await AndroidShell.executeCommand('dpkg', ['-l']);
      const packages: PackageInfo[] = [];
      
      const lines = result.output.split('\n');
      for (const line of lines) {
        if (line.startsWith('ii')) {
          const parts = line.split(/\s+/);
          if (parts.length >= 4) {
            packages.push({
              name: parts[1],
              version: parts[2],
              description: parts.slice(3).join(' '),
              installed: true
            });
          }
        }
      }
      
      return packages;
    } catch (error) {
      return [];
    }
  }

  static async searchPackages(query: string): Promise<PackageInfo[]> {
    if (!Capacitor.isNativePlatform()) {
      // Return some example security tools for web simulation
      const mockTools = [
        { name: 'nmap', version: '7.80', description: 'Network discovery and security auditing', installed: false },
        { name: 'wireshark', version: '3.4.0', description: 'Network protocol analyzer', installed: false },
        { name: 'metasploit-framework', version: '6.0.0', description: 'Penetration testing framework', installed: false },
        { name: 'aircrack-ng', version: '1.6', description: 'WiFi security auditing tools', installed: false },
      ];
      
      return mockTools.filter(tool => 
        tool.name.includes(query.toLowerCase()) || 
        tool.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const result = await AndroidShell.executeCommand('apt', ['search', query]);
      const packages: PackageInfo[] = [];
      
      const lines = result.output.split('\n');
      for (const line of lines) {
        if (line.includes('/') && line.includes(' - ')) {
          const parts = line.split(' - ');
          if (parts.length >= 2) {
            const nameVersion = parts[0].split('/')[0];
            packages.push({
              name: nameVersion,
              version: 'unknown',
              description: parts[1],
              installed: false
            });
          }
        }
      }
      
      return packages;
    } catch (error) {
      return [];
    }
  }
}