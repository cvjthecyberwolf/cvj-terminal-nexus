import { WindowItem } from "./WindowManager";

interface TaskbarProps {
  windows: WindowItem[];
  onFocusWindow: (id: string) => void;
  onRestoreWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
}

const Taskbar = ({ windows, onFocusWindow, onRestoreWindow, onCloseWindow }: TaskbarProps) => {
  const handleWindowClick = (window: WindowItem) => {
    if (window.minimized) {
      onRestoreWindow(window.id);
    } else {
      onFocusWindow(window.id);
    }
  };

  if (windows.length === 0) return null;

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-2 py-1 flex gap-1 z-40">
      {windows.map((window) => (
        <div
          key={window.id}
          className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${
            window.minimized
              ? "bg-muted/50 text-muted-foreground"
              : "bg-accent/50 hover:bg-accent"
          }`}
          onClick={() => handleWindowClick(window)}
          onContextMenu={(e) => {
            e.preventDefault();
            onCloseWindow(window.id);
          }}
          title={`${window.title}${window.minimized ? " (minimized)" : ""} - Right click to close`}
        >
          {window.icon}
          <span className="text-xs max-w-20 truncate">{window.title}</span>
        </div>
      ))}
    </div>
  );
};

export default Taskbar;