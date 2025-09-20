import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Laptop,
  Camera,
  RotateCcw,
  PlayCircle,
  Settings,
  Network,
  Terminal,
  Maximize,
  Minimize
} from 'lucide-react';
import { realVirtualization, RealVMInstance, RealOSTemplate } from "@/lib/realVirtualization";
import { toast } from "sonner";

interface RealVMWindowProps {
  onClose?: () => void;
}

const getOSIcon = (type: string) => {
  switch (type) {
    case 'linux': return <Server className="w-4 h-4 text-blue-500" />;
    case 'freebsd': return <Server className="w-4 h-4 text-red-500" />;
    case 'kolibrios': return <Smartphone className="w-4 h-4 text-green-500" />;
    case 'windows': return <Laptop className="w-4 h-4 text-indigo-500" />;
    default: return <Server className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'bg-green-500';
    case 'stopped': return 'bg-red-500';
    case 'suspended': return 'bg-yellow-500';
    case 'booting': return 'bg-blue-500 animate-pulse';
    case 'installing': return 'bg-purple-500 animate-pulse';
    default: return 'bg-gray-500';
  }
};

const getStatusBadge = (status: string) => {
  const colors = {
    running: 'bg-green-100 text-green-800 border-green-200',
    stopped: 'bg-red-100 text-red-800 border-red-200',
    suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    booting: 'bg-blue-100 text-blue-800 border-blue-200',
    installing: 'bg-purple-100 text-purple-800 border-purple-200'
  };
  
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function RealVMWindow({ onClose }: RealVMWindowProps) {
  const [instances, setInstances] = useState<RealVMInstance[]>([]);
  const [templates, setTemplates] = useState<RealOSTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [snapshotName, setSnapshotName] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalInstances: 0,
    runningInstances: 0,
    suspendedInstances: 0,
    totalMemory: 0,
    usedMemory: 0,
    totalDisk: 0,
    usedDisk: 0,
    totalSnapshots: 0
  });

  const vmDisplayRef = useRef<HTMLDivElement>(null);
  const serialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setInstances(realVirtualization.getRunningInstances());
    setTemplates(realVirtualization.getAvailableTemplates());
    setSystemStats(realVirtualization.getSystemStats());
  };

  const createInstance = async () => {
    if (!selectedTemplate) {
      toast.error("Please select an OS template");
      return;
    }

    setIsCreating(true);
    try {
      const instance = await realVirtualization.createInstance(selectedTemplate, customName || undefined);
      toast.success(`Created ${instance.name} with real emulation`);
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
      const result = await realVirtualization.startInstance(id);
      if (result.exitCode === 0) {
        toast.success("Virtual machine started with real emulation");
        loadData();
        
        // Mount VM display
        setTimeout(() => mountVMDisplay(id), 1000);
      } else {
        toast.error(result.error || "Failed to start instance");
      }
    } catch (error) {
      toast.error(`Failed to start instance: ${error}`);
    }
  };

  const stopInstance = async (id: string) => {
    try {
      const result = await realVirtualization.stopInstance(id);
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

  const suspendInstance = async (id: string) => {
    try {
      const result = await realVirtualization.suspendInstance(id);
      if (result.exitCode === 0) {
        toast.success("Virtual machine suspended");
        loadData();
      } else {
        toast.error(result.error || "Failed to suspend instance");
      }
    } catch (error) {
      toast.error(`Failed to suspend instance: ${error}`);
    }
  };

  const resumeInstance = async (id: string) => {
    try {
      const result = await realVirtualization.resumeInstance(id);
      if (result.exitCode === 0) {
        toast.success("Virtual machine resumed");
        loadData();
        setTimeout(() => mountVMDisplay(id), 1000);
      } else {
        toast.error(result.error || "Failed to resume instance");
      }
    } catch (error) {
      toast.error(`Failed to resume instance: ${error}`);
    }
  };

  const createSnapshot = async (id: string) => {
    if (!snapshotName.trim()) {
      toast.error("Please enter a snapshot name");
      return;
    }

    try {
      const result = await realVirtualization.createSnapshot(id, snapshotName.trim());
      if (result.exitCode === 0) {
        toast.success(`Snapshot '${snapshotName}' created`);
        setSnapshotName('');
        loadData();
      } else {
        toast.error(result.error || "Failed to create snapshot");
      }
    } catch (error) {
      toast.error(`Failed to create snapshot: ${error}`);
    }
  };

  const deleteInstance = async (id: string) => {
    if (!confirm("Are you sure you want to delete this virtual machine? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await realVirtualization.deleteInstance(id);
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

  const mountVMDisplay = (id: string) => {
    const display = realVirtualization.getVMDisplay(id);
    
    if (display.canvas && vmDisplayRef.current) {
      vmDisplayRef.current.innerHTML = '';
      display.canvas.style.width = '100%';
      display.canvas.style.height = 'auto';
      display.canvas.style.border = '1px solid #ccc';
      vmDisplayRef.current.appendChild(display.canvas);
    }
    
    if (display.serial && serialRef.current) {
      serialRef.current.innerHTML = '';
      display.serial.style.width = '100%';
      display.serial.style.height = '200px';
      serialRef.current.appendChild(display.serial);
    }
  };

  const sendCommand = async (id: string, command: string) => {
    try {
      await realVirtualization.sendKeystrokes(id, command + '\n');
      toast.success(`Sent: ${command}`);
    } catch (error) {
      toast.error(`Failed to send command: ${error}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with System Stats */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Real Virtual Machine Manager
          </h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Cpu className="w-4 h-4" />
              <span>{systemStats.runningInstances}/{systemStats.totalInstances} Running</span>
            </div>
            <div className="flex items-center gap-1">
              <Pause className="w-4 h-4" />
              <span>{systemStats.suspendedInstances} Suspended</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera className="w-4 h-4" />
              <span>{systemStats.totalSnapshots} Snapshots</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Memory Usage</span>
              <span>{systemStats.usedMemory}MB / {systemStats.totalMemory}MB</span>
            </div>
            <Progress 
              value={systemStats.totalMemory > 0 ? (systemStats.usedMemory / systemStats.totalMemory) * 100 : 0} 
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Allocation</span>
              <span>{systemStats.usedDisk}MB / {systemStats.totalDisk}MB</span>
            </div>
            <Progress 
              value={systemStats.totalDisk > 0 ? (systemStats.usedDisk / systemStats.totalDisk) * 100 : 0}
              className="h-2"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="instances" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="instances">Virtual Machines</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="display">VM Display</TabsTrigger>
            <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
          </TabsList>

          {/* Running Instances */}
          <TabsContent value="instances" className="space-y-4 p-4">
            {instances.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Virtual Machines</h3>
                <p className="text-muted-foreground mb-4">Create your first real virtual machine with v86 emulation</p>
                <Button onClick={() => {
                  const createTab = document.querySelector('[value="create"]') as HTMLElement;
                  createTab?.click();
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Real VM
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {instances.map((instance) => (
                  <Card key={instance.id} className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getOSIcon(instance.type)}
                          <div>
                            <CardTitle className="text-lg">{instance.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {instance.type}
                              </Badge>
                              <span>•</span>
                              <span>{instance.version} • {instance.architecture}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(instance.status)}`} />
                          <Badge className={getStatusBadge(instance.status)}>
                            {instance.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4 text-blue-500" />
                          <span>{instance.resources.memory}MB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-green-500" />
                          <span>{instance.resources.disk}MB</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-purple-500" />
                          <span>{instance.displayConfig.width}x{instance.displayConfig.height}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-orange-500" />
                          <span>{instance.networkConfig.adapter}</span>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex flex-wrap gap-2">
                        {instance.status === 'running' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedInstance(instance.id);
                                const displayTab = document.querySelector('[value="display"]') as HTMLElement;
                                displayTab?.click();
                                setTimeout(() => mountVMDisplay(instance.id), 100);
                              }}
                            >
                              <Monitor className="w-4 h-4 mr-2" />
                              Display
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => suspendInstance(instance.id)}
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Suspend
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
                        ) : instance.status === 'suspended' ? (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => resumeInstance(instance.id)}
                            >
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Resume
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => startInstance(instance.id)}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Restart
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

                        <div className="ml-auto">
                          <Badge variant="secondary" className="text-xs">
                            {instance.snapshots.length} snapshots
                          </Badge>
                        </div>
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
                <label className="text-sm font-medium">Select Real OS Template</label>
                <div className="grid gap-3">
                  {templates.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id ? 'ring-2 ring-primary shadow-md' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getOSIcon(template.type)}
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {template.name}
                                {template.bootable && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    Bootable
                                  </Badge>
                                )}
                              </h4>
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
                          <span>RAM: {template.minMemory}-{template.maxMemory}MB</span>
                          <span>Features: {template.supportedFeatures.length}</span>
                        </div>
                        {template.isoUrl && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Download className="w-3 h-3 mr-1" />
                              ISO Available
                            </Badge>
                          </div>
                        )}
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
                    Creating Real Virtual Machine...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Real Virtual Machine
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* VM Display */}
          <TabsContent value="display" className="p-4">
            {selectedInstance ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    VM Display - {instances.find(i => i.id === selectedInstance)?.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => sendCommand(selectedInstance, 'ls -la')}
                    >
                      <Terminal className="w-4 h-4 mr-2" />
                      Send ls
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => sendCommand(selectedInstance, 'uname -a')}
                    >
                      <Terminal className="w-4 h-4 mr-2" />
                      Send uname
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Virtual Display
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      ref={vmDisplayRef} 
                      className="bg-black border rounded-lg min-h-[400px] flex items-center justify-center"
                    >
                      <div className="text-white text-center">
                        <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>VM Display will appear here when VM is running</p>
                        <p className="text-sm opacity-75 mt-2">Start a virtual machine to see its display</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      Serial Console
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      ref={serialRef}
                      className="bg-black border rounded-lg min-h-[200px] p-4 font-mono text-green-400"
                    >
                      Serial console output will appear here...
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No VM Selected</h3>
                <p className="text-muted-foreground">Select a running virtual machine to view its display</p>
              </div>
            )}
          </TabsContent>

          {/* Snapshots */}
          <TabsContent value="snapshots" className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">VM Snapshots</h3>
                {selectedInstance && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Snapshot name..."
                      value={snapshotName}
                      onChange={(e) => setSnapshotName(e.target.value)}
                      className="w-48"
                    />
                    <Button 
                      size="sm"
                      onClick={() => createSnapshot(selectedInstance)}
                      disabled={!snapshotName.trim()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                {instances.map((instance) => (
                  instance.snapshots.length > 0 && (
                    <Card key={instance.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{instance.name}</CardTitle>
                        <CardDescription>{instance.snapshots.length} snapshots</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {instance.snapshots.map((snapshot) => (
                            <div key={snapshot.id} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <div className="font-medium">{snapshot.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {snapshot.timestamp.toLocaleString()} • 
                                  {Math.round(snapshot.data.byteLength / 1024 / 1024)}MB
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  if (confirm(`Restore to snapshot '${snapshot.name}'?`)) {
                                    realVirtualization.restoreSnapshot(instance.id, snapshot.id);
                                  }
                                }}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>

              {instances.every(i => i.snapshots.length === 0) && (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Snapshots</h3>
                  <p className="text-muted-foreground">Create snapshots to save VM states</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}