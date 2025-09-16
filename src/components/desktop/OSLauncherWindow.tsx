import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Play,
  Download,
  Cpu,
  HardDrive,
  MemoryStick,
  Zap
} from 'lucide-react';
import { osManager, OSTemplate } from "@/lib/osManager";
import { toast } from "sonner";

interface OSLauncherWindowProps {
  onClose?: () => void;
  onOpenVM?: () => void;
}

const getOSIcon = (type: string) => {
  switch (type) {
    case 'linux': return <Server className="w-8 h-8" />;
    case 'android': return <Smartphone className="w-8 h-8" />;
    case 'windows': return <Laptop className="w-8 h-8" />;
    case 'macos': return <Monitor className="w-8 h-8" />;
    default: return <Server className="w-8 h-8" />;
  }
};

const getOSColor = (type: string) => {
  switch (type) {
    case 'linux': return 'from-green-500 to-emerald-600';
    case 'android': return 'from-green-600 to-lime-500';
    case 'windows': return 'from-blue-500 to-cyan-600';
    case 'macos': return 'from-gray-600 to-slate-700';
    default: return 'from-gray-500 to-gray-600';
  }
};

export default function OSLauncherWindow({ onClose, onOpenVM }: OSLauncherWindowProps) {
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [templates] = useState<OSTemplate[]>(osManager.getAvailableTemplates());

  const quickLaunch = async (templateId: string) => {
    setIsCreating(templateId);
    try {
      const instance = await osManager.createInstance(templateId);
      toast.success(`Creating ${instance.name}...`);
      
      // Auto-start the instance after a brief delay
      setTimeout(async () => {
        const result = await osManager.startInstance(instance.id);
        if (result.exitCode === 0) {
          toast.success(`${instance.name} started successfully!`);
          // Open VM manager to show running instances
          if (onOpenVM) {
            onOpenVM();
          }
        }
      }, 2000);
    } catch (error) {
      toast.error(`Failed to create OS: ${error}`);
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">CVJ Hybrid OS Launcher</h2>
            <p className="text-muted-foreground">The world's first truly hybrid operating system</p>
          </div>
          <Zap className="w-8 h-8 text-primary animate-pulse" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Supported Platforms</div>
            <div className="text-muted-foreground">Linux • Windows • macOS • Android</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Virtualization</div>
            <div className="text-muted-foreground">Native • Container • Emulation</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Cross-Platform</div>
            <div className="text-muted-foreground">Web • Mobile • Desktop</div>
          </div>
        </div>
      </div>

      {/* OS Templates Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template) => {
            const isCreatingThis = isCreating === template.id;
            
            return (
              <Card 
                key={template.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isCreatingThis ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${getOSColor(template.type)} opacity-5`} />
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getOSIcon(template.type)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {template.type}
                          </Badge>
                          <span>{template.version}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      <span>{template.architecture}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MemoryStick className="w-3 h-3" />
                      <span>{template.minMemory}MB</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      <span>{template.diskSize}MB</span>
                    </div>
                  </div>

                  {isCreatingThis && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Creating virtual machine...</div>
                      <Progress value={66} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => quickLaunch(template.id)}
                      disabled={isCreatingThis}
                      className="flex-1"
                    >
                      {isCreatingThis ? (
                        <>
                          <Download className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Quick Launch
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={onOpenVM}
                      disabled={isCreatingThis}
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            CVJ Hybrid OS Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <div className="font-medium">🚀 Instant Boot</div>
              <div>Virtual machines start in seconds, not minutes</div>
            </div>
            <div>
              <div className="font-medium">🔒 Security First</div>
              <div>Built-in penetration testing and security tools</div>
            </div>
            <div>
              <div className="font-medium">🌐 Cross-Platform</div>
              <div>Run any OS on any device via web browser</div>
            </div>
            <div>
              <div className="font-medium">⚡ Native Performance</div>
              <div>Hardware acceleration when available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}