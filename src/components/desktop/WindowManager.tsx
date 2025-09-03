import { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef, useState } from "react";
import DesktopWindow from "./DesktopWindow";
import TerminalWindow from "@/components/TerminalWindow";
import BrowserWindow from "./BrowserWindow";
import { Terminal, Globe, Boxes } from "lucide-react";

export type WindowType = "terminal" | "browser" | "placeholder";

export interface WindowItem {
  id: string;
  type: WindowType;
  title: string;
  icon?: ReactNode;
  url?: string;
  z: number;
  maximized?: boolean;
  minimized?: boolean;
}

export interface WindowManagerHandle {
  openTerminal: () => void;
  openBrowser: (url: string, title?: string) => void;
  openPlaceholder: (title: string) => void;
  getWindows: () => WindowItem[];
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
}

const WindowManager = forwardRef<WindowManagerHandle>((_, ref) => {
  const [windows, setWindows] = useState<WindowItem[]>([]);
  const zCounter = useRef(30);

  const focus = (id: string) => {
    setWindows((prev) => {
      const maxZ = ++zCounter.current;
      return prev.map((w) => (w.id === id ? { ...w, z: maxZ } : w));
    });
  };

  const close = (id: string) => setWindows((prev) => prev.filter((w) => w.id !== id));
  const toggleMax = (id: string) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)));
  const minimize = (id: string) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  const restore = (id: string) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: false } : w)));

  useImperativeHandle(ref, () => ({
    openTerminal: () => {
      const id = `term-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setWindows((prev) => [...prev, { id, type: "terminal", title: "Terminal", icon: <Terminal className="w-4 h-4" />, z: ++zCounter.current }]);
    },
    openBrowser: (url: string, title = "Web Browser") => {
      const id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setWindows((prev) => [
        ...prev,
        {
          id,
          type: "browser",
          title,
          url,
          icon: <Globe className="w-4 h-4" />,
          z: ++zCounter.current,
        },
      ]);
    },
    openPlaceholder: (title: string) => {
      const id = `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setWindows((prev) => [
        ...prev,
        { id, type: "placeholder", title, icon: <Boxes className="w-4 h-4" />, z: ++zCounter.current },
      ]);
    },
    getWindows: () => windows,
    focusWindow: focus,
    minimizeWindow: minimize,
    restoreWindow: restore,
  }));

  const renderContent = (w: WindowItem) => {
    switch (w.type) {
      case "terminal":
        return <TerminalWindow onClose={() => close(w.id)} />;
      case "browser":
        return <BrowserWindow initialUrl={w.url || "https://example.com"} title={w.title} />;
      default:
        return (
          <div className="p-4 text-sm text-muted-foreground">
            {w.title} is coming soon. Use the Terminal for now to access these features.
          </div>
        );
    }
  };

  const ordered = useMemo(() => [...windows].sort((a, b) => a.z - b.z), [windows]);

  return (
    <div className="pointer-events-none">
      {ordered
        .filter((w) => !w.minimized)
        .map((w, i, filteredWindows) => (
          <div key={w.id} className="pointer-events-auto">
            <DesktopWindow
              id={w.id}
              title={w.title}
              icon={w.icon}
              zIndex={w.z}
              focused={i === filteredWindows.length - 1}
              isMaximized={w.maximized}
              onFocus={focus}
              onClose={close}
              onMaximize={toggleMax}
              onMinimize={minimize}
            >
              {renderContent(w)}
            </DesktopWindow>
          </div>
        ))}
    </div>
  );
});

export default WindowManager;
