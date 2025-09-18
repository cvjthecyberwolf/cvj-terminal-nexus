import { OSInstance } from './osManager';

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

export class NetworkManager {
  private interfaces: Map<string, NetworkInterface[]> = new Map();
  private connections: NetworkConnection[] = [];
  private virtualNetwork = '192.168.100';

  constructor() {
    this.initializeDefaultInterfaces();
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
    // Generate IP based on instance ID hash
    const hash = instanceId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const lastOctet = Math.abs(hash % 254) + 2; // 2-255
    return `${this.virtualNetwork}.${lastOctet}`;
  }

  private generateMAC(instanceId: string): string {
    // Generate MAC based on instance ID
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

  async ping(sourceId: string, targetIP: string): Promise<{
    success: boolean;
    time: number;
    output: string;
  }> {
    const sourceInterfaces = this.interfaces.get(sourceId);
    if (!sourceInterfaces || sourceInterfaces.length === 0) {
      return {
        success: false,
        time: 0,
        output: 'Network unreachable: No network interface'
      };
    }

    // Simulate ping
    const time = Math.random() * 50 + 1; // 1-51ms
    const success = Math.random() > 0.05; // 95% success rate

    if (success) {
      return {
        success: true,
        time: Math.round(time * 100) / 100,
        output: `PING ${targetIP}: 56 data bytes
64 bytes from ${targetIP}: icmp_seq=1 ttl=64 time=${time.toFixed(1)} ms
64 bytes from ${targetIP}: icmp_seq=2 ttl=64 time=${(time + Math.random() * 2).toFixed(1)} ms
64 bytes from ${targetIP}: icmp_seq=3 ttl=64 time=${(time + Math.random() * 3).toFixed(1)} ms

--- ${targetIP} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
round-trip min/avg/max/stddev = ${(time - 1).toFixed(1)}/${time.toFixed(1)}/${(time + 3).toFixed(1)}/1.247 ms`
      };
    } else {
      return {
        success: false,
        time: 0,
        output: `PING ${targetIP}: 56 data bytes
Request timeout for icmp_seq 1
Request timeout for icmp_seq 2
Request timeout for icmp_seq 3

--- ${targetIP} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`
      };
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
    // Simulate port scanning
    const commonPorts: Record<number, { service: string; version?: string }> = {
      22: { service: 'ssh', version: 'OpenSSH 8.9' },
      80: { service: 'http', version: 'nginx/1.18.0' },
      443: { service: 'https', version: 'nginx/1.18.0' },
      3306: { service: 'mysql', version: 'MySQL 8.0' },
      5432: { service: 'postgresql', version: 'PostgreSQL 14.2' },
      6379: { service: 'redis', version: 'Redis 7.0' },
      8080: { service: 'http-alt', version: 'Jetty 9.4' }
    };

    const isOpen = Math.random() > 0.7; // 30% chance port is open
    const serviceInfo = commonPorts[port];

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