import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: 'available' | 'coming-soon' | 'beta';
  gradient?: boolean;
}

export function FeatureCard({ icon: Icon, title, description, status, gradient = false }: FeatureCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'text-terminal-green';
      case 'beta':
        return 'text-terminal-yellow';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'beta':
        return 'Beta';
      default:
        return 'Coming Soon';
    }
  };

  return (
    <Card className={`p-6 group hover:scale-105 transition-all duration-300 cursor-pointer scanline ${
      gradient ? 'bg-gradient-primary neon-glow' : 'bg-card/50 border-primary/20 hover:border-primary/50'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${gradient ? 'bg-black/20' : 'bg-primary/10'}`}>
          <Icon className={`w-6 h-6 ${gradient ? 'text-white' : 'text-primary'}`} />
        </div>
        <span className={`text-xs font-cyber ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <h3 className={`text-lg font-bold mb-2 font-cyber ${gradient ? 'text-white' : 'text-foreground'}`}>
        {title}
      </h3>
      
      <p className={`text-sm ${gradient ? 'text-white/80' : 'text-muted-foreground'}`}>
        {description}
      </p>
      
      {status === 'available' && (
        <div className="mt-4 text-xs text-terminal-green">
          ● Ready to use
        </div>
      )}
    </Card>
  );
}