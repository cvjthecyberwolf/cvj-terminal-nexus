import { useState } from "react";
import { Terminal, Globe, Youtube, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicationsMenuProps {
  onOpenTerminal: () => void;
  onOpenBrowser: (url: string, title?: string) => void;
}

interface AppItem {
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

const ApplicationsMenu = ({ onOpenTerminal, onOpenBrowser }: ApplicationsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const applications: AppItem[] = [
    {
      name: "Terminal",
      icon: <Terminal className="w-4 h-4" />,
      action: onOpenTerminal,
    },
    {
      name: "Firefox",
      icon: <Globe className="w-4 h-4" />,
      action: () => onOpenBrowser("https://www.mozilla.org/firefox/", "Firefox"),
    },
    {
      name: "YouTube",
      icon: <Youtube className="w-4 h-4" />,
      action: () => onOpenBrowser("https://www.youtube.com", "YouTube"),
    },
  ];

  const handleAppClick = (app: AppItem) => {
    app.action();
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-background/90 backdrop-blur-sm"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        <span className="ml-1">Applications</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg min-w-48">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              Applications
            </div>
            {applications.map((app) => (
              <button
                key={app.name}
                onClick={() => handleAppClick(app)}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent rounded transition-colors"
              >
                {app.icon}
                {app.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsMenu;