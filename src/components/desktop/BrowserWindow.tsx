import { useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

interface BrowserWindowProps {
  initialUrl: string;
  title?: string;
}

const isEmbeddable = (url: string) => {
  // Basic heuristic: YouTube supports embed via /embed, others may block via X-Frame-Options
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) return true;
  } catch {}
  return false;
};

const toYouTubeEmbed = (url: string) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
};

const BrowserWindow = ({ initialUrl }: BrowserWindowProps) => {
  const [url, setUrl] = useState(initialUrl);
  const [current, setCurrent] = useState(initialUrl);

  const open = () => setCurrent(url);
  const openNewTab = () => window.open(current, "_blank", "noopener,noreferrer");

  const frameSrc = current.includes("youtube") ? toYouTubeEmbed(current) : current;
  const canEmbed = isEmbeddable(current);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center gap-2 p-2 border-b border-border bg-background/80">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="flex-1 px-2 py-1 rounded-md bg-card border border-border text-sm"
        />
        <button type="button" onClick={open} className="px-2 py-1 rounded-md border border-border hover:bg-primary/10">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button type="button" onClick={openNewTab} className="px-2 py-1 rounded-md border border-border hover:bg-primary/10">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 bg-black/60">
        {canEmbed ? (
          <iframe
            key={frameSrc}
            src={frameSrc}
            className="w-full h-full bg-background"
            loading="lazy"
            referrerPolicy="no-referrer"
            title="Web Browser"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-center p-6 text-sm text-muted-foreground">
            This site may block embedding. Use the Open in new tab button.
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserWindow;
