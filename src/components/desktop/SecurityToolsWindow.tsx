import { useState } from "react";
import { Shield, Scan, AlertTriangle, Activity, Lock, Eye, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SecurityToolsWindowProps {
  onClose?: () => void;
}

const SecurityToolsWindow = ({ onClose }: SecurityToolsWindowProps) => {
  const [scanTarget, setScanTarget] = useState("");
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  const securityTools = [
    {
      name: "Nmap Vulnerability Scan",
      description: "Comprehensive port and vulnerability scanning",
      icon: <Scan className="w-5 h-5" />,
      command: "nmap",
      category: "scanner",
      risk: "low"
    },
    {
      name: "Nikto Web Scanner",
      description: "Web server vulnerability scanner",
      icon: <Search className="w-5 h-5" />,
      command: "nikto",
      category: "web",
      risk: "medium"
    },
    {
      name: "SQL Injection Test",
      description: "Database vulnerability assessment",
      icon: <AlertTriangle className="w-5 h-5" />,
      command: "sqlmap",
      category: "web",
      risk: "high"
    },
    {
      name: "SSL/TLS Analysis",
      description: "Certificate and encryption analysis",
      icon: <Lock className="w-5 h-5" />,
      command: "sslscan",
      category: "crypto",
      risk: "low"
    },
    {
      name: "Directory Bruteforce",
      description: "Hidden directory and file discovery",
      icon: <Eye className="w-5 h-5" />,
      command: "gobuster",
      category: "web",
      risk: "medium"
    },
    {
      name: "Password Attack",
      description: "Brute force login attempts",
      icon: <Zap className="w-5 h-5" />,
      command: "hydra",
      category: "auth",
      risk: "high"
    }
  ];

  const runSecurityScan = async (tool: string, target: string) => {
    if (!target.trim()) {
      toast({
        title: "Error",
        description: "Please enter a target URL or IP address",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanResults([]);

    try {
      // Simulate scan progress
      const progressSteps = [10, 25, 40, 60, 80, 95, 100];
      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setScanProgress(step);
      }

      // Generate mock security scan results
      const mockResults = generateMockResults(tool, target);
      setScanResults(mockResults);
      
      toast({
        title: "Security Scan Complete",
        description: `${tool} scan finished. ${mockResults.length} findings detected.`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "An error occurred during the security scan",
        variant: "destructive",
      });
    }
    
    setIsScanning(false);
    setScanProgress(0);
  };

  const generateMockResults = (tool: string, target: string) => {
    const results = [];
    
    switch (tool) {
      case "nmap":
        results.push(
          {
            severity: "medium",
            title: "Open SSH Port",
            description: "SSH service detected on port 22",
            details: "Service: OpenSSH 8.9\nPort: 22/tcp\nState: open",
            recommendation: "Ensure SSH is properly configured with key-based authentication"
          },
          {
            severity: "low", 
            title: "HTTP Service",
            description: "Web server detected on port 80",
            details: "Service: nginx 1.25.3\nPort: 80/tcp\nState: open",
            recommendation: "Consider redirecting HTTP traffic to HTTPS"
          },
          {
            severity: "high",
            title: "MySQL Database Exposed",
            description: "MySQL database accessible on port 3306",
            details: "Service: MySQL 8.0.35\nPort: 3306/tcp\nState: open",
            recommendation: "Database should not be directly accessible from external networks"
          }
        );
        break;
      case "nikto":
        results.push(
          {
            severity: "medium",
            title: "Server Information Disclosure",
            description: "Server version information leaked in headers",
            details: "Header: Server: nginx/1.25.3",
            recommendation: "Configure server to hide version information"
          },
          {
            severity: "low",
            title: "Directory Listing Enabled",
            description: "Directory browsing is enabled",
            details: "Path: /uploads/\nStatus: 200",
            recommendation: "Disable directory listing in web server configuration"
          }
        );
        break;
      case "sqlmap":
        results.push(
          {
            severity: "critical",
            title: "SQL Injection Vulnerability",
            description: "SQL injection found in login form",
            details: "Parameter: username\nPayload: ' OR '1'='1\nDatabase: MySQL 8.0.35",
            recommendation: "Use prepared statements and input validation"
          }
        );
        break;
      case "sslscan":
        results.push(
          {
            severity: "medium",
            title: "Weak SSL/TLS Configuration",
            description: "Outdated TLS protocols supported",
            details: "TLS 1.0: Enabled\nTLS 1.1: Enabled\nTLS 1.2: Enabled\nTLS 1.3: Disabled",
            recommendation: "Disable TLS 1.0 and 1.1, enable TLS 1.3"
          },
          {
            severity: "low",
            title: "Certificate Chain",
            description: "Valid certificate chain detected",
            details: "Issuer: Let's Encrypt\nExpiry: 2024-12-15\nSAN: example.com, www.example.com",
            recommendation: "Certificate is valid and properly configured"
          }
        );
        break;
      default:
        results.push(
          {
            severity: "low",
            title: "Scan Complete",
            description: `${tool} scan completed successfully`,
            details: `Target: ${target}\nTool: ${tool}\nDuration: 3.2 seconds`,
            recommendation: "Review scan results and implement security recommendations"
          }
        );
    }
    
    return results;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 border-red-200 bg-red-50";
      case "high": return "text-red-500 border-red-200 bg-red-50";
      case "medium": return "text-yellow-600 border-yellow-200 bg-yellow-50";
      case "low": return "text-blue-600 border-blue-200 bg-blue-50";
      default: return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "destructive";
      case "medium": return "outline";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Security Tools</h2>
          <Badge variant="secondary">CVJ Security Suite</Badge>
        </div>
        
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            These are security testing tools. Only use on systems you own or have explicit permission to test.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter target URL or IP (e.g., https://example.com or 192.168.1.1)"
            value={scanTarget}
            onChange={(e) => setScanTarget(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => runSecurityScan("nmap", scanTarget)}
            disabled={isScanning}
          >
            <Scan className="w-4 h-4 mr-2" />
            Quick Scan
          </Button>
        </div>
        
        {isScanning && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Scanning in progress...</span>
              <span className="text-sm text-muted-foreground">{scanProgress}%</span>
            </div>
            <Progress value={scanProgress} className="w-full" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="tools" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">Security Tools</TabsTrigger>
            <TabsTrigger value="results">Scan Results ({scanResults.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="mt-4 h-full overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
              {securityTools.map((tool) => (
                <Card key={tool.name} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tool.icon}
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline">{tool.category}</Badge>
                        <Badge variant={getRiskColor(tool.risk) as any}>{tool.risk}</Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => runSecurityScan(tool.command, scanTarget)}
                      disabled={isScanning}
                      size="sm"
                      className="w-full"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Run Scan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="mt-4 h-full overflow-hidden">
            <div className="h-full overflow-y-auto space-y-3">
              {scanResults.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No security scan results yet. Run a security tool to see findings here.
                </div>
              ) : (
                scanResults.map((result, index) => (
                  <Card key={index} className={`border ${getSeverityColor(result.severity)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{result.title}</CardTitle>
                        <Badge 
                          variant={result.severity === 'critical' || result.severity === 'high' ? 'destructive' : 'secondary'}
                          className="capitalize"
                        >
                          {result.severity}
                        </Badge>
                      </div>
                      <CardDescription>{result.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium">Details:</h5>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded mt-1">
                            {result.details}
                          </pre>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">Recommendation:</h5>
                          <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-4 h-full overflow-hidden">
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Security Reports</h3>
                <p className="text-sm">
                  Detailed security reports and compliance assessments coming soon.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityToolsWindow;