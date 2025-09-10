import { useState, useEffect } from "react";
import { Bot, Play, Pause, Trash2, Plus, Settings, Activity, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Bot {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  template: string;
  progress: number;
  lastRun?: string;
  logs: string[];
  tasks: number;
  completedTasks: number;
}

interface BotManagerWindowProps {
  onClose?: () => void;
}

const BotManagerWindow = ({ onClose }: BotManagerWindowProps) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const [newBotTemplate, setNewBotTemplate] = useState("");
  const { toast } = useToast();

  const botTemplates = [
    {
      id: "network-scanner",
      name: "Network Scanner Bot",
      description: "Automated network discovery and port scanning",
      tasks: ["Network discovery", "Port scanning", "Service detection", "Report generation"]
    },
    {
      id: "vulnerability-scanner", 
      name: "Vulnerability Scanner Bot",
      description: "Continuous vulnerability assessment",
      tasks: ["CVE scanning", "Configuration analysis", "Weakness detection", "Risk assessment"]
    },
    {
      id: "log-analyzer",
      name: "Log Analyzer Bot",
      description: "Real-time log analysis and threat detection",
      tasks: ["Log parsing", "Anomaly detection", "Pattern matching", "Alert generation"]
    },
    {
      id: "backup-bot",
      name: "Backup Automation Bot",
      description: "Automated data backup and verification",
      tasks: ["Data backup", "Integrity check", "Compression", "Storage management"]
    },
    {
      id: "compliance-checker",
      name: "Compliance Checker Bot",
      description: "Security compliance monitoring",
      tasks: ["Policy verification", "Configuration audit", "Compliance reporting", "Remediation suggestions"]
    }
  ];

  useEffect(() => {
    // Initialize with some example bots
    const initialBots: Bot[] = [
      {
        id: "bot-1",
        name: "Network Monitor",
        description: "Continuous network monitoring and alerting",
        status: "running",
        template: "network-scanner",
        progress: 65,
        lastRun: "2 minutes ago",
        logs: [
          "Started network scan at 14:30:15",
          "Discovered 24 active hosts",
          "Scanning ports on 192.168.1.1-254",
          "Found 3 open services on 192.168.1.1"
        ],
        tasks: 4,
        completedTasks: 2
      },
      {
        id: "bot-2",
        name: "Security Audit",
        description: "Daily security posture assessment",
        status: "completed",
        template: "vulnerability-scanner",
        progress: 100,
        lastRun: "1 hour ago",
        logs: [
          "Security scan initiated",
          "Checking for known vulnerabilities",
          "Analyzing system configurations",
          "Report generated: 3 medium, 1 high severity issues found"
        ],
        tasks: 5,
        completedTasks: 5
      },
      {
        id: "bot-3",
        name: "Log Watcher",
        description: "Real-time log monitoring for suspicious activity",
        status: "idle",
        template: "log-analyzer",
        progress: 0,
        lastRun: "Never",
        logs: [],
        tasks: 3,
        completedTasks: 0
      }
    ];
    setBots(initialBots);
  }, []);

  const createBot = () => {
    if (!newBotName.trim() || !newBotTemplate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newBot: Bot = {
      id: `bot-${Date.now()}`,
      name: newBotName,
      description: newBotDescription || "Custom automation bot",
      status: "idle",
      template: newBotTemplate,
      progress: 0,
      lastRun: "Never",
      logs: [`Bot '${newBotName}' created successfully`],
      tasks: botTemplates.find(t => t.id === newBotTemplate)?.tasks.length || 1,
      completedTasks: 0
    };

    setBots(prev => [...prev, newBot]);
    setNewBotName("");
    setNewBotDescription("");
    setNewBotTemplate("");
    setIsCreating(false);

    toast({
      title: "Bot Created",
      description: `${newBotName} has been created successfully`,
    });
  };

  const startBot = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    setBots(prev => prev.map(b => 
      b.id === botId 
        ? { ...b, status: "running" as const, progress: 0 }
        : b
    ));

    // Simulate bot execution
    const template = botTemplates.find(t => t.id === bot.template);
    const tasks = template?.tasks || ["Task 1", "Task 2", "Task 3"];
    
    for (let i = 0; i < tasks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBots(prev => prev.map(b => 
        b.id === botId 
          ? { 
              ...b, 
              progress: Math.round(((i + 1) / tasks.length) * 100),
              completedTasks: i + 1,
              logs: [...b.logs, `Completed: ${tasks[i]}`]
            }
          : b
      ));
    }

    setBots(prev => prev.map(b => 
      b.id === botId 
        ? { 
            ...b, 
            status: "completed" as const, 
            lastRun: "Just now",
            logs: [...b.logs, "Bot execution completed successfully"]
          }
        : b
    ));

    toast({
      title: "Bot Completed",
      description: `${bot.name} has finished execution`,
    });
  };

  const pauseBot = (botId: string) => {
    setBots(prev => prev.map(b => 
      b.id === botId 
        ? { ...b, status: "paused" as const }
        : b
    ));
  };

  const deleteBot = (botId: string) => {
    setBots(prev => prev.filter(b => b.id !== botId));
    if (selectedBot?.id === botId) {
      setSelectedBot(null);
    }
    toast({
      title: "Bot Deleted",
      description: "Bot has been removed from the system",
    });
  };

  const getStatusIcon = (status: Bot['status']) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Bot['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Bot Manager</h2>
            <Badge variant="secondary">CVJ Automation</Badge>
          </div>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Bot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bot</DialogTitle>
                <DialogDescription>
                  Create an automated bot to handle repetitive tasks.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Bot Name</Label>
                  <Input
                    id="name"
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="Enter bot name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newBotDescription}
                    onChange={(e) => setNewBotDescription(e.target.value)}
                    placeholder="Describe what this bot does"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template">Bot Template</Label>
                  <Select value={newBotTemplate} onValueChange={setNewBotTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {botTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={createBot}>
                  Create Bot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">{bots.length}</div>
            <div className="text-muted-foreground">Total Bots</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{bots.filter(b => b.status === 'running').length}</div>
            <div className="text-muted-foreground">Running</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{bots.filter(b => b.status === 'completed').length}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{bots.filter(b => b.status === 'idle').length}</div>
            <div className="text-muted-foreground">Idle</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="bots" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bots">Active Bots ({bots.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bots" className="mt-4 h-full overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-y-auto">
              {bots.length === 0 ? (
                <div className="col-span-full flex items-center justify-center h-full text-muted-foreground">
                  No bots created yet. Click "Create Bot" to get started.
                </div>
              ) : (
                bots.map((bot) => (
                  <Card key={bot.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          <CardTitle className="text-base">{bot.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(bot.status)}
                          <Badge className={getStatusColor(bot.status)}>
                            {bot.status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{bot.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{bot.completedTasks}/{bot.tasks} tasks</span>
                        </div>
                        <Progress value={bot.progress} className="w-full" />
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Last run: {bot.lastRun}</span>
                          <span>Template: {bot.template}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {bot.status === 'idle' || bot.status === 'paused' || bot.status === 'completed' ? (
                            <Button
                              onClick={() => startBot(bot.id)}
                              size="sm"
                              className="flex-1"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          ) : (
                            <Button
                              onClick={() => pauseBot(bot.id)}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => setSelectedBot(bot)}
                            size="sm"
                            variant="outline"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            onClick={() => deleteBot(bot.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {bot.logs.length > 0 && (
                          <div className="bg-muted p-2 rounded text-xs">
                            <div className="font-medium mb-1">Recent Activity:</div>
                            <div className="text-muted-foreground">
                              {bot.logs.slice(-2).join('\n')}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="mt-4 h-full overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
              {botTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Tasks:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {template.tasks.map((task, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="mt-4 h-full overflow-hidden">
            <div className="h-full border border-border rounded-lg p-4 bg-black text-green-400 font-mono text-sm overflow-y-auto">
              <div className="whitespace-pre-wrap">
                {`[${new Date().toLocaleTimeString()}] Bot Manager initialized
[${new Date().toLocaleTimeString()}] System ready for automation tasks
[${new Date().toLocaleTimeString()}] ${bots.length} bots loaded
[${new Date().toLocaleTimeString()}] Monitoring ${bots.filter(b => b.status === 'running').length} active bots

System Status: Operational
Memory Usage: 234 MB
CPU Usage: 12%
Active Tasks: ${bots.reduce((acc, bot) => acc + bot.completedTasks, 0)}
`}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BotManagerWindow;