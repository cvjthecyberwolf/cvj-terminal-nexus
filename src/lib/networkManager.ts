import { OSInstance } from './osManager';
import { Capacitor } from '@capacitor/core';

export interface NetworkInterface {
  name: string;
  type: 'ethernet' | 'wifi' | 'loopback' | 'virtual';
  status: 'up' | 'down';
  ipv4?: string;
  ipv6?: string;
  mac: string;
  mtu: number;
  speed?: number; // Mbps
}

export interface NetworkConnection {
  id: string;
  sourceInstance: string;
  targetInstance: string;
  protocol: 'tcp' | 'udp' | 'icmp';
  sourcePort?: number;
  targetPort?: number;
  status: 'established' | 'listening' | 'closed';
  bytesTransferred: number;
  createdAt: Date;
}

export interface ConnectivityStatus {
  online: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
}

export class NetworkManager {
  private interfaces: Map<string, NetworkInterface[]> = new Map();
  private connections: NetworkConnection[] = [];
  private virtualNetwork = '192.168.100';
  private onlineListeners: ((status: ConnectivityStatus) => void)[] = [];

  constructor() {
    this.initializeDefaultInterfaces();
    this.setupConnectivityListeners();
  }

  private initializeDefaultInterfaces(): void {
    // Host network interface
    this.interfaces.set('cvj-host', [
      {
        name: 'eth0',
        type: 'ethernet',
        status: 'up',
        ipv4: '192.168.1.100',
        ipv6: 'fe80::a00:27ff:fe4e:66a1',
        mac: '08:00:27:4e:66:a1',
        mtu: 1500,
        speed: 1000
      },
      {
        name: 'lo',
        type: 'loopback',
        status: 'up',
        ipv4: '127.0.0.1',
        ipv6: '::1',
        mac: '00:00:00:00:00:00',
        mtu: 65536
      }
    ]);
  }

  private setupConnectivityListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notifyConnectivityChange();
      });
      window.addEventListener('offline', () => {
        this.notifyConnectivityChange();
      });
    }
  }

  private notifyConnectivityChange(): void {
    const status = this.getConnectivityStatus();
    this.onlineListeners.forEach(listener => listener(status));
  }

  // Get real network connectivity status
  getConnectivityStatus(): ConnectivityStatus {
    if (typeof navigator === 'undefined') {
      return { online: false, type: 'none' };
    }

    const online = navigator.onLine;
    
    // Get connection info if available
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    if (connection) {
      return {
        online,
        type: this.mapConnectionType(connection.type),
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }

    return {
      online,
      type: online ? 'unknown' : 'none'
    };
  }

  private mapConnectionType(type: string): ConnectivityStatus['type'] {
    switch (type) {
      case 'wifi': return 'wifi';
      case 'cellular': return 'cellular';
      case 'ethernet': return 'ethernet';
      case 'none': return 'none';
      default: return 'unknown';
    }
  }

  // Check if online with actual network request
  async checkRealConnectivity(): Promise<boolean> {
    try {
      // Try to fetch a small resource to verify real connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  }

  onConnectivityChange(callback: (status: ConnectivityStatus) => void): () => void {
    this.onlineListeners.push(callback);
    return () => {
      this.onlineListeners = this.onlineListeners.filter(l => l !== callback);
    };
  }

  createInstanceNetwork(instance: OSInstance): NetworkInterface[] {
    const ip = this.generateInstanceIP(instance.id);
    const mac = this.generateMAC(instance.id);

    const interfaces: NetworkInterface[] = [
      {
        name: this.getInterfaceName(instance.type, 'loopback'),
        type: 'loopback',
        status: 'up',
        ipv4: '127.0.0.1',
        ipv6: '::1',
        mac: '00:00:00:00:00:00',
        mtu: 65536
      },
      {
        name: this.getInterfaceName(instance.type, 'ethernet'),
        type: 'virtual',
        status: 'up',
        ipv4: ip,
        mac: mac,
        mtu: 1500,
        speed: 1000
      }
    ];

    this.interfaces.set(instance.id, interfaces);
    return interfaces;
  }

  private generateInstanceIP(instanceId: string): string {
    const hash = instanceId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const lastOctet = Math.abs(hash % 254) + 2;
    return `${this.virtualNetwork}.${lastOctet}`;
  }

  private generateMAC(instanceId: string): string {
    const hash = instanceId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const mac = Math.abs(hash).toString(16).padStart(12, '0').substr(-12);
    return mac.match(/.{2}/g)?.join(':') || '02:00:00:00:00:01';
  }

  private getInterfaceName(osType: string, type: string): string {
    switch (osType) {
      case 'linux':
        return type === 'ethernet' ? 'eth0' : 'lo';
      case 'windows':
        return type === 'ethernet' ? 'Ethernet' : 'Loopback';
      case 'macos':
        return type === 'ethernet' ? 'en0' : 'lo0';
      case 'android':
        return type === 'ethernet' ? 'wlan0' : 'lo';
      default:
        return type === 'ethernet' ? 'eth0' : 'lo';
    }
  }

  getInstanceInterfaces(instanceId: string): NetworkInterface[] {
    return this.interfaces.get(instanceId) || [];
  }

  // Real ping using fetch timing for web, or native for Android
  async ping(sourceId: string, targetIP: string, count: number = 4): Promise<{
    success: boolean;
    times: number[];
    output: string;
  }> {
    // First check if we're online at all
    const connectivity = this.getConnectivityStatus();
    if (!connectivity.online) {
      return {
        success: false,
        times: [],
        output: `ping: ${targetIP}: Network is unreachable`
      };
    }

    // Determine target URL for ping simulation
    let targetUrl = this.resolveTargetUrl(targetIP);
    
    const times: number[] = [];
    const results: string[] = [];
    let successCount = 0;

    results.push(`PING ${targetIP} (${targetIP}): 56 data bytes`);

    for (let i = 0; i < count; i++) {
      const pingResult = await this.performSinglePing(targetUrl, i + 1);
      if (pingResult.success) {
        times.push(pingResult.time);
        successCount++;
        results.push(`64 bytes from ${targetIP}: icmp_seq=${i + 1} ttl=64 time=${pingResult.time.toFixed(1)} ms`);
      } else {
        results.push(`Request timeout for icmp_seq ${i + 1}`);
      }
      
      // Small delay between pings
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const packetLoss = Math.round(((count - successCount) / count) * 100);
    results.push('');
    results.push(`--- ${targetIP} ping statistics ---`);
    results.push(`${count} packets transmitted, ${successCount} received, ${packetLoss}% packet loss`);

    if (times.length > 0) {
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const variance = times.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / times.length;
      const stddev = Math.sqrt(variance);
      results.push(`round-trip min/avg/max/stddev = ${minTime.toFixed(3)}/${avgTime.toFixed(3)}/${maxTime.toFixed(3)}/${stddev.toFixed(3)} ms`);
    }

    return {
      success: successCount > 0,
      times,
      output: results.join('\n')
    };
  }

  private resolveTargetUrl(target: string): string {
    // Handle common domain names
    const domainMappings: Record<string, string> = {
      'google.com': 'https://www.google.com/favicon.ico',
      'www.google.com': 'https://www.google.com/favicon.ico',
      '8.8.8.8': 'https://dns.google/',
      '8.8.4.4': 'https://dns.google/',
      '1.1.1.1': 'https://1.1.1.1/',
      'cloudflare.com': 'https://www.cloudflare.com/favicon.ico',
      'github.com': 'https://github.com/favicon.ico',
      'stackoverflow.com': 'https://stackoverflow.com/favicon.ico',
      'amazon.com': 'https://www.amazon.com/favicon.ico',
      'facebook.com': 'https://www.facebook.com/favicon.ico',
      'twitter.com': 'https://twitter.com/favicon.ico',
      'x.com': 'https://x.com/favicon.ico',
    };

    // Check for direct mapping
    const lowerTarget = target.toLowerCase();
    if (domainMappings[lowerTarget]) {
      return domainMappings[lowerTarget];
    }

    // If it looks like a domain, try to construct a URL
    if (target.includes('.') && !target.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return `https://${target}/favicon.ico`;
    }

    // For IP addresses, try common HTTP
    return `http://${target}/`;
  }

  private async performSinglePing(url: string, seq: number): Promise<{ success: boolean; time: number }> {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      return { success: true, time: endTime - startTime };
    } catch (error) {
      return { success: false, time: 0 };
    }
  }

  async establishConnection(sourceId: string, targetId: string, protocol: 'tcp' | 'udp', port: number): Promise<NetworkConnection> {
    const connection: NetworkConnection = {
      id: `${sourceId}-${targetId}-${Date.now()}`,
      sourceInstance: sourceId,
      targetInstance: targetId,
      protocol,
      sourcePort: Math.floor(Math.random() * 60000) + 1024,
      targetPort: port,
      status: 'established',
      bytesTransferred: 0,
      createdAt: new Date()
    };

    this.connections.push(connection);
    return connection;
  }

  getActiveConnections(instanceId?: string): NetworkConnection[] {
    if (instanceId) {
      return this.connections.filter(conn => 
        conn.sourceInstance === instanceId || conn.targetInstance === instanceId
      );
    }
    return [...this.connections];
  }

  async scanPort(sourceId: string, targetIP: string, port: number): Promise<{
    open: boolean;
    service?: string;
    version?: string;
  }> {
    // First check connectivity
    const connectivity = this.getConnectivityStatus();
    if (!connectivity.online) {
      return { open: false };
    }

    const commonPorts: Record<number, { service: string; version?: string }> = {
      22: { service: 'ssh', version: 'OpenSSH 8.9' },
      80: { service: 'http', version: 'nginx/1.18.0' },
      443: { service: 'https', version: 'nginx/1.18.0' },
      3306: { service: 'mysql', version: 'MySQL 8.0' },
      5432: { service: 'postgresql', version: 'PostgreSQL 14.2' },
      6379: { service: 'redis', version: 'Redis 7.0' },
      8080: { service: 'http-alt', version: 'Jetty 9.4' }
    };

    // Try to actually connect for common web ports
    if (port === 80 || port === 443 || port === 8080) {
      try {
        const protocol = port === 443 ? 'https' : 'http';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        await fetch(`${protocol}://${targetIP}:${port}/`, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const serviceInfo = commonPorts[port];
        return { open: true, ...serviceInfo };
      } catch {
        return { open: false };
      }
    }

    // For other ports, simulate based on common ports
    const serviceInfo = commonPorts[port];
    const isOpen = Math.random() > 0.7;

    return {
      open: isOpen && !!serviceInfo,
      ...(isOpen && serviceInfo ? serviceInfo : {})
    };
  }

  getNetworkTopology(): {
    instances: Array<{
      id: string;
      name: string;
      ip: string;
      status: string;
    }>;
    connections: NetworkConnection[];
  } {
    const instances = Array.from(this.interfaces.entries()).map(([id, interfaces]) => {
      const primaryInterface = interfaces.find(i => i.type === 'virtual' || i.type === 'ethernet');
      return {
        id,
        name: id,
        ip: primaryInterface?.ipv4 || 'Unknown',
        status: primaryInterface?.status || 'down'
      };
    });

    return {
      instances,
      connections: this.connections
    };
  }
}

export const networkManager = new NetworkManager();