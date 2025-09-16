import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Square, 
  Pause, 
  Trash2, 
  Plus, 
  Monitor, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  Download,
  Server,
  Smartphone,
  Laptop
} from 'lucide-react';
import { osManager, OSInstance, OSTemplate } from "@/lib/osManager";
import { toast } from "sonner";

interface VirtualMachineWindowProps {
  onClose?: () => void;
}

const getOSIcon = (type: string) => {
  switch (type) {
    case 'linux': return <Server className="w-4 h-4" />;
    case 'android': return <Smartphone className="w-4 h-4" />;
    case 'windows': return <Laptop className="w-4 h-4" />;
    case 'macos': return <Monitor className="w-4 h-4" />;
    default: return <Server className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'bg-green-500';
    case 'stopped': return 'bg-red-500';
    case 'suspended': return 'bg-yellow-500';
    case 'installing': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

export default function VirtualMachineWindow({ onClose }: VirtualMachineWindowProps) {
  const [instances, setInstances] = useState<OSInstance[]>([]);
  const [templates, setTemplates] = useState<OSTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalInstances: 0,
    runningInstances: 0,
    totalMemory: 0,
    usedMemory: 0,
    totalDisk: 0,
    usedDisk: 0
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setInstances(osManager.getRunningInstances());
    setTemplates(osManager.getAvailableTemplates());
    setSystemStats(osManager.getSystemStats());
  };

  const createInstance = async () => {
    if (!selectedTemplate) {
      toast.error("Please select an OS template");
      return;
    }

    setIsCreating(true);
    try {
      const instance = await osManager.createInstance(selectedTemplate, customName || undefined);
      toast.success(`Creating ${instance.name}...`);
      setCustomName('');
      setSelectedTemplate('');
      loadData();
    } catch (error) {
      toast.error(`Failed to create instance: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const startInstance = async (id: string) => {
    try {
      const result = await osManager.startInstance(id);
      if (result.exitCode === 0) {
        toast.success("Virtual machine started");
        loadData();
      } else {
        toast.error(result.error || "Failed to start instance");
      }
    } catch (error) {
      toast.error(`Failed to start instance: ${error}`);
    }
  };

  const stopInstance = async (id: string) => {
    try {
      const result = await osManager.stopInstance(id);
      if (result.exitCode === 0) {
        toast.success("Virtual machine stopped");
        loadData();
      } else {
        toast.error(result.error || "Failed to stop instance");
      }
    } catch (error) {
      toast.error(`Failed to stop instance: ${error}`);
    }
  };

  const deleteInstance = async (id: string) => {
    if (!confirm("Are you sure you want to delete this virtual machine? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await osManager.deleteInstance(id);
      if (result.exitCode === 0) {
        toast.success("Virtual machine deleted");
        loadData();
      } else {
        toast.error(result.error || "Failed to delete instance");
      }
    } catch (error) {
      toast.error(`Failed to delete instance: ${error}`);
    }
  };

  const connectToInstance = async (id: string) => {
    try {
      const result = await osManager.connectToInstance(id);
      if (result.exitCode === 0) {
        // In a real implementation, this would open a new terminal connected to the VM
        toast.success("Connected to virtual machine (terminal integration pending)");
      } else {
        toast.error(result.error || "Failed to connect to instance");
      }
    } catch (error) {
      toast.error(`Failed to connect to instance: ${error}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with System Stats */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Virtual Machine Manager</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cpu className="w-4 h-4" />
            <span>{systemStats.runningInstances}/{systemStats.totalInstances} Running</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Memory</span>
              <span>{systemStats.usedMemory}MB / {systemStats.totalMemory}MB</span>
            </div>
            <Progress value={(systemStats.usedMemory / systemStats.totalMemory) * 100} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage</span>
              <span>{systemStats.usedDisk}MB / {systemStats.totalDisk}MB</span>
            </div>
            <Progress value={(systemStats.usedDisk / systemStats.totalDisk) * 100} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="instances" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instances">Virtual Machines</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          {/* Running Instances */}
          <TabsContent value="instances" className="space-y-4 p-4">
            {instances.length === 0 ? (
              <div className="text-center py-8">
                <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Virtual Machines</h3>
                <p className="text-muted-foreground mb-4">Create your first virtual machine to get started</p>
                <Button onClick={() => {
                  const createTab = document.querySelector('[value="create"]') as HTMLElement;
                  createTab?.click();
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create VM
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {instances.map((instance) => (
                  <Card key={instance.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getOSIcon(instance.type)}
                          <CardTitle className="text-lg">{instance.name}</CardTitle>
                          <Badge variant="secondary" className="capitalize">
                            {instance.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(instance.status)}`} />
                          <span className="text-sm capitalize">{instance.status}</span>
                        </div>
                      </div>
                      <CardDescription>
                        {instance.version} • {instance.architecture}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4" />
                          <span>{instance.resources.memory}MB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          <span>{instance.resources.disk}MB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          <span>{instance.resources.cpu}%</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {instance.status === 'running' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => connectToInstance(instance.id)}
                            >
                              <Monitor className="w-4 h-4 mr-2" />
                              Connect
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => stopInstance(instance.id)}
                            >
                              <Square className="w-4 h-4 mr-2" />
                              Stop
                            </Button>
                          </>
                        ) : instance.status === 'stopped' ? (
                          <Button 
                            size="sm" 
                            onClick={() => startInstance(instance.id)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                        ) : null}
                        
                        {instance.status !== 'running' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteInstance(instance.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Create New Instance */}
          <TabsContent value="create" className="space-y-4 p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Name (optional)</label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter a custom name for your VM..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select OS Template</label>
                <div className="grid gap-3">
                  {templates.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getOSIcon(template.type)}
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{template.version}</div>
                            <div>{template.architecture}</div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                          <span>Disk: {template.diskSize}MB</span>
                          <span>Min RAM: {template.minMemory}MB</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                onClick={createInstance}
                disabled={!selectedTemplate || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Download className="w-4 h-4 mr-2 animate-spin" />
                    Creating Virtual Machine...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Virtual Machine
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}