import { useState } from "react";
import { Network, Play, Activity, Wifi, Shield, Search, Terminal as TerminalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface NetworkToolsWindowProps {
  onClose?: () => void;
}

const NetworkToolsWindow = ({ onClose }: NetworkToolsWindowProps) => {
  const [scanTarget, setScanTarget] = useState("");
  const [scanResults, setScanResults] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const networkTools = [
    {
      name: "Nmap",
      description: "Network discovery and security auditing",
      icon: <Search className="w-5 h-5" />,
      command: "nmap",
      category: "scanner"
    },
    {
      name: "Netstat",
      description: "Display network connections",
      icon: <Network className="w-5 h-5" />,
      command: "netstat",
      category: "monitor"
    },
    {
      name: "Ping",
      description: "Test network connectivity",
      icon: <Activity className="w-5 h-5" />,
      command: "ping",
      category: "connectivity"
    },
    {
      name: "Wireshark",
      description: "Network protocol analyzer",
      icon: <Shield className="w-5 h-5" />,
      command: "wireshark",
      category: "analyzer"
    },
    {
      name: "Aircrack-ng",
      description: "WiFi security auditing tools",
      icon: <Wifi className="w-5 h-5" />,
      command: "aircrack-ng",
      category: "wifi"
    },
    {
      name: "Masscan",
      description: "Fast TCP port scanner",
      icon: <Search className="w-5 h-5" />,
      command: "masscan",
      category: "scanner"
    }
  ];

  const runNetworkScan = async (tool: string, target: string) => {
    if (!target.trim()) {
      toast({
        title: "Error",
        description: "Please enter a target IP or hostname",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanResults("");

    // Simulate network scan
    const scanCommands = {
      nmap: `nmap -sV -Pn ${target}`,
      ping: `ping -c 4 ${target}`,
      netstat: `netstat -tuln`,
      masscan: `masscan ${target} -p1-1000 --rate=1000`
    };

    const command = scanCommands[tool as keyof typeof scanCommands] || `${tool} ${target}`;
    
    try {
      // Simulate scan progress
      setScanResults(`Running: ${command}\n\nStarting scan...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setScanResults(prev => prev + "\nScanning target...");
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate results based on tool
      let results = "";
      switch (tool) {
        case "nmap":
          results = `
Starting Nmap 7.95 ( https://nmap.org )
Host is up (0.041s latency).
Not shown: 993 closed ports
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.9 (protocol 2.0)
80/tcp   open  http     nginx 1.25.3
139/tcp  open  netbios-ssn Samba smbd 4.17
445/tcp  open  microsoft-ds Samba smbd 4.17
3306/tcp open  mysql    MySQL 8.0.35
8080/tcp open  http-proxy Apache Tomcat 9.0

Nmap done: 1 IP address (1 host up) scanned in 6.83 seconds`;
          break;
        case "ping":
          results = `
PING ${target} (93.184.216.34): 56 data bytes
64 bytes from 93.184.216.34: icmp_seq=0 ttl=56 time=14.123 ms
64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=13.891 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=56 time=14.234 ms
64 bytes from 93.184.216.34: icmp_seq=3 ttl=56 time=13.967 ms

--- ${target} ping statistics ---
4 packets transmitted, 4 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 13.891/14.054/14.234/0.139 ms`;
          break;
        case "netstat":
          results = `
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
tcp6       0      0 :::22                   :::*                    LISTEN
tcp6       0      0 :::80                   :::*                    LISTEN
tcp6       0      0 :::443                  :::*                    LISTEN
udp        0      0 0.0.0.0:68              0.0.0.0:*
udp        0      0 0.0.0.0:53              0.0.0.0:*`;
          break;
        default:
          results = `
Scan completed successfully.
Target: ${target}
Tool: ${tool}
Status: Host appears to be up and responsive
Scan duration: 2.3 seconds`;
      }
      
      setScanResults(prev => prev + "\n" + results);
      
      toast({
        title: "Scan Complete",
        description: `${tool} scan finished successfully`,
      });
    } catch (error) {
      setScanResults(prev => prev + `\nError: ${error}`);
      toast({
        title: "Scan Failed",
        description: "An error occurred during the scan",
        variant: "destructive",
      });
    }
    
    setIsScanning(false);
  };

  const quickScans = [
    { name: "Local Network", target: "192.168.1.1/24", tool: "nmap" },
    { name: "Localhost", target: "127.0.0.1", tool: "nmap" },
    { name: "Google DNS", target: "8.8.8.8", tool: "ping" },
    { name: "Network Connections", target: "", tool: "netstat" },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Network className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Network Tools</h2>
          <Badge variant="secondary">CVJ Security Suite</Badge>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter IP address or hostname (e.g., 192.168.1.1)"
            value={scanTarget}
            onChange={(e) => setScanTarget(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => runNetworkScan("nmap", scanTarget)}
            disabled={isScanning}
          >
            <Play className="w-4 h-4 mr-2" />
            Scan
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="tools" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">Network Tools</TabsTrigger>
            <TabsTrigger value="results">Scan Results</TabsTrigger>
            <TabsTrigger value="quick">Quick Scans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="mt-4 h-full overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
              {networkTools.map((tool) => (
                <Card key={tool.name} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tool.icon}
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{tool.category}</Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => runNetworkScan(tool.command, scanTarget)}
                      disabled={isScanning}
                      size="sm"
                      className="w-full"
                    >
                      <TerminalIcon className="w-4 h-4 mr-2" />
                      Run {tool.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="mt-4 h-full overflow-hidden">
            <div className="h-full border border-border rounded-lg p-4 bg-black text-green-400 font-mono text-sm overflow-y-auto">
              {scanResults ? (
                <pre className="whitespace-pre-wrap">{scanResults}</pre>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No scan results yet. Run a network tool to see results here.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="quick" className="mt-4 h-full overflow-hidden">
            <div className="space-y-3 h-full overflow-y-auto">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Quick Network Scans
              </h3>
              {quickScans.map((scan) => (
                <Card key={scan.name} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{scan.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {scan.target || "System information"}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {scan.tool}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => runNetworkScan(scan.tool, scan.target)}
                        disabled={isScanning}
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Run
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NetworkToolsWindow;