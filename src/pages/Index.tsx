import { TerminalWindow } from "@/components/TerminalWindow";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Terminal, 
  Shield, 
  Cpu, 
  Network, 
  Code2, 
  Bot, 
  Download,
  Smartphone,
  Server,
  GitBranch
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Terminal,
      title: "Linux Terminal",
      description: "Full-featured terminal with bash, zsh, and essential Linux tools. Complete CLI experience on Android.",
      status: 'available' as const,
      gradient: true
    },
    {
      icon: Cpu,
      title: "Package Manager",
      description: "Install and manage packages with apt, pip, npm. GUI interface for easy package discovery.",
      status: 'beta' as const
    },
    {
      icon: Network,
      title: "Network Tools",
      description: "nmap, netcat, ping, curl, tcpdump - all your networking essentials in one place.",
      status: 'available' as const
    },
    {
      icon: Code2,
      title: "Development Suite",
      description: "Python3, Node.js, Git, Vim, GCC - complete development environment for mobile coding.",
      status: 'available' as const
    },
    {
      icon: Shield,
      title: "Security Tools",
      description: "Penetration testing tools including hydra, sqlmap, whois, and recon-ng for security professionals.",
      status: 'coming-soon' as const
    },
    {
      icon: Bot,
      title: "Bot Manager",
      description: "Integrated CVJ bot ecosystem including CVJ Alpha, Eternal Eye, and custom automation scripts.",
      status: 'coming-soon' as const
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="absolute inset-0">
          <div className="scanline"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 pulse-neon">
              <Smartphone className="w-4 h-4 mr-2" />
              Working Title - In Development
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 font-cyber">
              <span className="cyber-text">CVJ</span>
              <br />
              <span className="text-terminal-green">Terminal OS</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Hybrid Android app combining powerful <span className="text-terminal-cyan">Linux CLI</span> with 
              modern <span className="text-accent">GUI dashboard</span> for the ultimate mobile terminal experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary hover:scale-105 transition-transform neon-glow">
                <Download className="w-5 h-5 mr-2" />
                Get Early Access
              </Button>
              
              <Button variant="outline" size="lg" className="border-primary/50 hover:bg-primary/10">
                <GitBranch className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Demo Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-cyber">
              Interactive <span className="text-terminal-green">Terminal</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the full Linux terminal on your Android device. Try the demo below or type your own commands.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <TerminalWindow />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-cyber">
              Powerful <span className="text-accent">Features</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for development, networking, security, and automation - all in your pocket.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-20 bg-card/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-cyber">
              Hybrid <span className="text-primary">Architecture</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="border border-primary/20 rounded-lg p-6 bg-gradient-terminal">
                <h3 className="text-xl font-bold mb-3 text-terminal-cyan font-cyber">CLI Layer</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• PRoot/Toybox Linux environment</li>
                  <li>• Bash/Zsh shell with full scripting</li>
                  <li>• Package managers (apt, pip, npm)</li>
                  <li>• Development tools (git, vim, gcc)</li>
                  <li>• Network utilities (nmap, curl, ssh)</li>
                </ul>
              </div>
              
              <div className="border border-accent/20 rounded-lg p-6 bg-gradient-accent/10">
                <h3 className="text-xl font-bold mb-3 text-accent font-cyber">GUI Layer</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Modern Android interface</li>
                  <li>• Visual package management</li>
                  <li>• Integrated file explorer</li>
                  <li>• Network monitoring dashboards</li>
                  <li>• Script editor with syntax highlighting</li>
                </ul>
              </div>
            </div>
            
            <div className="border border-primary/30 rounded-lg p-6 neon-glow">
              <h3 className="text-xl font-bold mb-4 text-primary font-cyber">
                <Server className="w-6 h-6 inline mr-2" />
                Integration Features
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-terminal-green mb-1">Security & Privacy</h4>
                  <p className="text-muted-foreground">App sandboxing, no root required, explicit permissions</p>
                </div>
                <div>
                  <h4 className="font-semibold text-terminal-cyan mb-1">Cloud Sync</h4>
                  <p className="text-muted-foreground">Scripts, settings, and environment synchronization</p>
                </div>
                <div>
                  <h4 className="font-semibold text-accent mb-1">CVJ Ecosystem</h4>
                  <p className="text-muted-foreground">Integrated bots, automation, and custom tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold font-cyber cyber-text mb-2">CVJ Terminal OS</h3>
            <p className="text-muted-foreground">The future of mobile terminal computing</p>
          </div>
          
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>© 2024 CVJ Technologies</span>
            <span>•</span>
            <span>Working Title - In Development</span>
            <span>•</span>
            <span className="text-terminal-green">v1.0.0-alpha</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
