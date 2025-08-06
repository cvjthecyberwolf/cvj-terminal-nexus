interface Bot {
  id: string;
  name: string;
  type: 'exploitation' | 'reconnaissance' | 'scanning' | 'automation';
  description: string;
  status: 'idle' | 'running' | 'stopped' | 'error';
  created: string;
  lastRun?: string;
  config: Record<string, any>;
  tasks: BotTask[];
}

interface BotTask {
  id: string;
  name: string;
  command: string;
  schedule?: string;
  lastRun?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: any;
}

interface BotTemplate {
  name: string;
  type: Bot['type'];
  description: string;
  defaultConfig: Record<string, any>;
  commands: string[];
}

export class BotManager {
  private bots: Map<string, Bot> = new Map();
  private templates: BotTemplate[] = [];
  private taskQueue: BotTask[] = [];

  constructor() {
    this.initializeTemplates();
    this.initializeSampleBots();
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        name: 'Port Scanner Bot',
        type: 'scanning',
        description: 'Automated port scanning of target networks',
        defaultConfig: {
          targets: ['192.168.1.0/24'],
          ports: '1-1000',
          interval: '3600', // seconds
          threading: '10'
        },
        commands: ['nmap -sS -p {ports} {targets}']
      },
      {
        name: 'Web Vulnerability Bot',
        type: 'scanning',
        description: 'Automated web application vulnerability scanning',
        defaultConfig: {
          targets: ['http://example.com'],
          depth: '3',
          threads: '5',
          interval: '7200'
        },
        commands: ['nikto -h {targets}', 'dirb {targets}']
      },
      {
        name: 'Recon Bot',
        type: 'reconnaissance',
        description: 'Automated reconnaissance and information gathering',
        defaultConfig: {
          domain: 'example.com',
          subdomains: true,
          whois: true,
          dns: true
        },
        commands: ['dig {domain}', 'whois {domain}', 'subfinder -d {domain}']
      },
      {
        name: 'Exploit Bot',
        type: 'exploitation',
        description: 'Automated exploitation framework integration',
        defaultConfig: {
          targets: [],
          exploits: [],
          payloads: [],
          automated: false
        },
        commands: ['msfconsole -r exploit_script.rc']
      },
      {
        name: 'Log Monitor Bot',
        type: 'automation',
        description: 'Automated log monitoring and alerting',
        defaultConfig: {
          logFiles: ['/var/log/auth.log', '/var/log/apache2/access.log'],
          keywords: ['failed', 'error', 'attack'],
          alertThreshold: '5'
        },
        commands: ['tail -f {logFiles}', 'grep -i {keywords}']
      }
    ];
  }

  private initializeSampleBots(): void {
    // Create a sample scanning bot
    const scanBot: Bot = {
      id: 'bot-001',
      name: 'Network Scanner',
      type: 'scanning',
      description: 'Continuous network scanning bot',
      status: 'idle',
      created: new Date().toISOString(),
      config: {
        targets: ['192.168.1.0/24'],
        interval: 3600,
        ports: '22,80,443,3389'
      },
      tasks: []
    };

    this.bots.set(scanBot.id, scanBot);
  }

  async listBots(): Promise<Bot[]> {
    return Array.from(this.bots.values());
  }

  async getBotInfo(botId: string): Promise<Bot | null> {
    return this.bots.get(botId) || null;
  }

  async createBot(name: string, templateName: string, config?: Record<string, any>): Promise<string> {
    const template = this.templates.find(t => t.name === templateName);
    if (!template) {
      throw new Error(`Bot template '${templateName}' not found`);
    }

    const botId = `bot-${Date.now().toString(36)}`;
    const bot: Bot = {
      id: botId,
      name,
      type: template.type,
      description: template.description,
      status: 'idle',
      created: new Date().toISOString(),
      config: { ...template.defaultConfig, ...config },
      tasks: []
    };

    this.bots.set(botId, bot);
    return `✅ Bot '${name}' created with ID: ${botId}`;
  }

  async startBot(botId: string): Promise<string> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot '${botId}' not found`);
    }

    if (bot.status === 'running') {
      return `❌ Bot '${bot.name}' is already running`;
    }

    bot.status = 'running';
    bot.lastRun = new Date().toISOString();

    // Simulate bot starting
    setTimeout(() => {
      this.createBotTasks(bot);
    }, 1000);

    return `🤖 Bot '${bot.name}' started successfully`;
  }

  async stopBot(botId: string): Promise<string> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot '${botId}' not found`);
    }

    bot.status = 'stopped';
    
    // Stop all running tasks for this bot
    bot.tasks.forEach(task => {
      if (task.status === 'running') {
        task.status = 'completed';
      }
    });

    return `🛑 Bot '${bot.name}' stopped successfully`;
  }

  async deleteBot(botId: string): Promise<string> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot '${botId}' not found`);
    }

    this.bots.delete(botId);
    return `🗑️ Bot '${bot.name}' deleted successfully`;
  }

  async listTemplates(): Promise<BotTemplate[]> {
    return this.templates;
  }

  async getBotLogs(botId: string): Promise<string> {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error(`Bot '${botId}' not found`);
    }

    let logs = `🤖 Bot Logs: ${bot.name}\n`;
    logs += `Status: ${bot.status}\n`;
    logs += `Created: ${new Date(bot.created).toLocaleString()}\n`;
    if (bot.lastRun) {
      logs += `Last Run: ${new Date(bot.lastRun).toLocaleString()}\n`;
    }
    logs += `\n📋 Tasks (${bot.tasks.length}):\n`;

    bot.tasks.forEach((task, index) => {
      logs += `\n${index + 1}. ${task.name}\n`;
      logs += `   Command: ${task.command}\n`;
      logs += `   Status: ${task.status}\n`;
      if (task.lastRun) {
        logs += `   Last Run: ${new Date(task.lastRun).toLocaleString()}\n`;
      }
      if (task.results) {
        logs += `   Results: ${JSON.stringify(task.results, null, 2)}\n`;
      }
    });

    return logs;
  }

  async getBotStatus(): Promise<string> {
    const bots = Array.from(this.bots.values());
    const running = bots.filter(b => b.status === 'running').length;
    const idle = bots.filter(b => b.status === 'idle').length;
    const stopped = bots.filter(b => b.status === 'stopped').length;
    const error = bots.filter(b => b.status === 'error').length;

    let status = `🤖 Bot Manager Status\n`;
    status += `==================\n\n`;
    status += `📊 Overview:\n`;
    status += `  Total Bots: ${bots.length}\n`;
    status += `  Running: ${running}\n`;
    status += `  Idle: ${idle}\n`;
    status += `  Stopped: ${stopped}\n`;
    status += `  Error: ${error}\n\n`;

    if (bots.length > 0) {
      status += `📋 Bot List:\n`;
      bots.forEach(bot => {
        const statusIcon = bot.status === 'running' ? '🟢' : 
                          bot.status === 'error' ? '🔴' : 
                          bot.status === 'stopped' ? '🟡' : '⚪';
        status += `  ${statusIcon} ${bot.name} (${bot.id}) - ${bot.type}\n`;
      });
    }

    return status;
  }

  private createBotTasks(bot: Bot): void {
    const template = this.templates.find(t => t.type === bot.type);
    if (!template) return;

    template.commands.forEach((cmd, index) => {
      const task: BotTask = {
        id: `task-${bot.id}-${index}`,
        name: `Task ${index + 1}`,
        command: this.interpolateCommand(cmd, bot.config),
        status: 'pending',
        lastRun: new Date().toISOString()
      };

      bot.tasks.push(task);
      
      // Simulate task execution
      setTimeout(() => {
        task.status = 'running';
        setTimeout(() => {
          task.status = 'completed';
          task.results = { success: true, output: `Mock results for ${cmd}` };
        }, 2000);
      }, 1000 * index);
    });
  }

  private interpolateCommand(command: string, config: Record<string, any>): string {
    let interpolated = command;
    Object.entries(config).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      interpolated = interpolated.replace(new RegExp(placeholder, 'g'), String(value));
    });
    return interpolated;
  }
}

export const botManager = new BotManager();