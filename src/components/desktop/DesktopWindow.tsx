import { useEffect, useRef, useState } from "react";
import { X, Minus, Maximize2 } from "lucide-react";

export interface DesktopWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialW?: number;
  initialH?: number;
  zIndex: number;
  focused?: boolean;
  isMaximized?: boolean;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize?: (id: string) => void;
  onMaximize?: (id: string) => void;
  children: React.ReactNode;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const DesktopWindow = ({
  id,
  title,
  icon,
  initialX = 80,
  initialY = 120,
  initialW = 640,
  initialH = 420,
  zIndex,
  focused,
  isMaximized,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  children,
}: DesktopWindowProps) => {
  const winRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: initialW, h: initialH });
  const dragData = useRef<{ dx: number; dy: number; dragging: boolean }>({ dx: 0, dy: 0, dragging: false });

  useEffect(() => {
    if (isMaximized) return; // don't override when maximized
    setSize({ w: initialW, h: initialH });
    setPos({ x: initialX, y: initialY });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialX, initialY]);

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if (isMaximized) return;
    const rect = winRef.current?.getBoundingClientRect();
    dragData.current.dragging = true;
    dragData.current.dx = e.clientX - (rect?.left ?? 0);
    dragData.current.dy = e.clientY - (rect?.top ?? 0);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onHeaderPointerMove = (e: React.PointerEvent) => {
    if (!dragData.current.dragging || isMaximized) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = clamp(e.clientX - dragData.current.dx, 0, vw - 80);
    const y = clamp(e.clientY - dragData.current.dy, 40, vh - 80);
    setPos({ x, y });
  };

  const onHeaderPointerUp = (e: React.PointerEvent) => {
    dragData.current.dragging = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Sync size after CSS resize (best-effort on mouseup)
  useEffect(() => {
    const handler = () => {
      if (!winRef.current) return;
      const rect = winRef.current.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    window.addEventListener("mouseup", handler);
    return () => window.removeEventListener("mouseup", handler);
  }, []);

  const containerStyle: React.CSSProperties = isMaximized
    ? { zIndex }
    : { left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex };

  return (
    <div
      ref={winRef}
      className={`$${""} ${
        isMaximized ? "fixed inset-16 md:inset-12 bottom-28" : "absolute"
      } bg-card/95 border border-border rounded-lg shadow-[var(--shadow-elegant)] overflow-hidden select-none`}
      style={containerStyle}
      onMouseDown={() => onFocus(id)}
      role="dialog"
      aria-label={title}
      data-window-id={id}
    >
      <header
        className={`flex items-center justify-between px-3 py-2 cursor-move border-b border-border ${
          focused ? "bg-primary/10" : "bg-background/60"
        }`}
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-cyber text-sm text-primary">{title}</h4>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              type="button"
              className="inline-flex p-1 rounded hover:bg-primary/10"
              onClick={() => onMinimize(id)}
              aria-label="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          {onMaximize && (
            <button
              type="button"
              className="inline-flex p-1 rounded hover:bg-primary/10"
              onClick={() => onMaximize(id)}
              aria-label="Maximize"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            className="inline-flex p-1 rounded hover:bg-destructive/10"
            onClick={() => onClose(id)}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>
      <div className="w-full h-full min-h-[200px] min-w-[280px] bg-background resize overflow-hidden">
        {/* content area */}
        <div className="w-full h-full overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default DesktopWindow;
