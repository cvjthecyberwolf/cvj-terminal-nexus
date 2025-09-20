import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Monitor, Terminal, Home, Shield, Network, Cpu, Bot, Globe, Youtube, HardDrive } from "lucide-react";
import wallpaper from "@/assets/wallpapers/alpha-wolf-cyber-room.jpg";
import WindowManager, { WindowManagerHandle } from "@/components/desktop/WindowManager";
import Taskbar from "@/components/desktop/Taskbar";
import ApplicationsMenu from "@/components/desktop/ApplicationsMenu";

const setSEO = () => {
  document.title = "CVJ Desktop GUI - Cyber Wolf Terminal";

  const descText =
    "Explore CVJ Desktop: cyberpunk GUI with alpha wolf wallpaper, cmatrix, nmap, Metasploit, and Wireshark visuals.";
  let desc = document.querySelector('meta[name="description"]');
  if (!desc) {
    desc = document.createElement("meta");
    desc.setAttribute("name", "description");
    document.head.appendChild(desc);
  }
  desc.setAttribute("content", descText);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + "/desktop");
};

const ScreenPanel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="backdrop-blur-md bg-background/50 border border-primary/20 rounded-lg shadow-[var(--shadow-elegant)] p-4 md:p-5 hover-scale max-w-full">
    <header className="flex items-center justify-between mb-3">
      <h3 className="font-cyber text-sm md:text-base text-primary">{title}</h3>
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Monitor className="w-3.5 h-3.5" /> LIVE
      </span>
    </header>
    <article className="relative">
      {children}
    </article>
  </section>
);

const MatrixStream = () => (
  <pre className="text-[10px] leading-tight md:text-xs lg:text-sm text-terminal-green overflow-hidden max-h-44 md:max-h-56 lg:max-h-64 scanline">
{`1010100110010101010011  0100101 010101001
01100110100100110101010  1010101 001101010
00110011010100101001010  0101101 011010011
01010101010101010101010  1010101 010101010
`}  </pre>
);

const NmapPanel = () => (
  <pre className="text-[10px] leading-tight md:text-xs text-terminal-cyan overflow-auto max-h-56">
{`# nmap -sV -Pn 10.10.10.10
Starting Nmap 7.95 ( https://nmap.org )
Host is up (0.041s latency).
Not shown: 993 closed ports
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.9 (protocol 2.0)
80/tcp   open  http     nginx 1.25.3
139/tcp  open  netbios-ssn Samba smbd 4.17
445/tcp  open  microsoft-ds Samba smbd 4.17
3306/tcp open  mysql    MySQL 8.0.35
8080/tcp open  http-proxyApache Tomcat/Coyote JSP engine 9.0
Nmap done: 1 IP address (1 host up) scanned in 6.83 seconds`}
  </pre>
);

const MetasploitPanel = () => (
  <pre className="text-[10px] leading-tight md:text-xs text-accent overflow-auto max-h-56">
{`msf6 > use exploit/multi/http/struts2_content_type_ognl
msf6 exploit(struts2_content_type_ognl) > set RHOSTS 10.10.10.10
RHOSTS => 10.10.10.10
msf6 exploit(struts2_content_type_ognl) > set RPORT 8080
RPORT => 8080
msf6 exploit(struts2_content_type_ognl) > run
[*] Started reverse TCP handler on 10.10.14.2:4444
[+] Target appears to be vulnerable
[*] Sending payload...
[+] Command shell session 1 opened`}
  </pre>
);

const WiresharkPanel = () => (
  <div className="grid grid-cols-5 gap-2 text-[10px] md:text-xs text-muted-foreground">
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} className="h-20 md:h-24 bg-card/40 border border-border rounded-sm" />
    ))}
    <p className="col-span-5 text-center text-[10px] md:text-xs mt-1">Packet graph preview (simulated)</p>
  </div>
);

const Desktop = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [typedTitle, setTypedTitle] = useState("");
  const [typedSubtitle, setTypedSubtitle] = useState("");
  const [windows, setWindows] = useState<any[]>([]);
  const managerRef = useRef<WindowManagerHandle>(null);
  const hasAutoOpenedTerminal = useRef(false);

  useEffect(() => {
    setSEO();
  }, []);

  useEffect(() => {
    const titleFull = "CVJ The Cyber Wolf";
    const subtitleFull = "\"You'reThe Next Cyber Alpha Dominate\"";
    let ti = 0;
    let si = 0;
    const tId = window.setInterval(() => {
      if (ti < titleFull.length) {
        setTypedTitle(titleFull.slice(0, ++ti));
      } else {
        if (si < subtitleFull.length) {
          setTypedSubtitle(subtitleFull.slice(0, ++si));
        } else {
          window.clearInterval(tId);
          setTimeout(() => setShowIntro(false), 900);
        }
      }
    }, 50);
    return () => window.clearInterval(tId);
  }, []);

  useEffect(() => {
    const updateWindows = () => {
      if (managerRef.current) {
        setWindows(managerRef.current.getWindows());
      }
    };
    
    const interval = setInterval(updateWindows, 100);
    return () => clearInterval(interval);
  }, []);

// Auto-open Terminal once the intro finishes to ensure immediate accessibility (only once)
useEffect(() => {
  if (!showIntro && managerRef.current && !hasAutoOpenedTerminal.current) {
    hasAutoOpenedTerminal.current = true;
    managerRef.current.openTerminal();
  }
}, [showIntro]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background">
      <img
        src={wallpaper}
        alt="Alpha wolf typing in a neon cyber room with large screens showing cmatrix, nmap, Metasploit, and Wireshark"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/70" />

      {/* Branding overlay */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 text-center animate-fade-in">
        <h2 className="font-cyber text-2xl md:text-3xl text-primary drop-shadow">CVJ The Cyber Wolf</h2>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">"You'reThe Next Cyber Alpha Dominate"</p>
      </div>

      {/* Desktop icons (shortcuts) */}
      <div className="absolute left-4 bottom-24 z-10 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => managerRef.current?.openBrowser("https://www.mozilla.org/firefox/new/", "Firefox")}
          className="group inline-flex flex-col items-center gap-1 px-2 py-2 rounded-md bg-background/40 border border-border hover:bg-primary/10 transition-colors"
          aria-label="Open Firefox"
        >
          <Globe className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground group-hover:text-primary">Firefox</span>
        </button>
        <button
          type="button"
          onClick={() => managerRef.current?.openBrowser("https://www.youtube.com/", "YouTube")}
          className="group inline-flex flex-col items-center gap-1 px-2 py-2 rounded-md bg-background/40 border border-border hover:bg-primary/10 transition-colors"
          aria-label="Open YouTube"
        >
          <Youtube className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground group-hover:text-primary">YouTube</span>
        </button>
      </div>

      {/* Intro overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center border border-primary/20 bg-card/60 rounded-xl p-6 animate-enter shadow-[var(--shadow-elegant)]">
              <div className="mx-auto mb-4 w-24 h-24 rounded-full overflow-hidden shadow-[var(--shadow-glow)]">
                <img src={wallpaper} alt="Alpha wolf typing at keyboard" className="w-full h-full object-cover animate-pulse" />
              </div>
              <h2 className="font-cyber text-2xl md:text-3xl text-primary">{typedTitle}</h2>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">{typedSubtitle}</p>
              <button
                type="button"
                onClick={() => setShowIntro(false)}
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-primary/10 transition-colors"
                aria-label="Skip intro"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="relative z-10 border-b border-primary/20 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-cyber text-lg md:text-xl text-terminal-green">CVJ Desktop</h1>
          <nav className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-primary/10 transition-colors">
              <Home className="w-4 h-4" /> Home
            </Link>
            <button type="button" onClick={() => managerRef.current?.openTerminal()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-primary/10 transition-colors">
              <Terminal className="w-4 h-4" /> Open Terminal
            </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <ScreenPanel title="cmatrix">
            <MatrixStream />
          </ScreenPanel>
          <ScreenPanel title="nmap scan">
            <NmapPanel />
          </ScreenPanel>
          <ScreenPanel title="Metasploit">
            <MetasploitPanel />
          </ScreenPanel>
          <div className="lg:col-span-3">
            <ScreenPanel title="Wireshark">
              <WiresharkPanel />
            </ScreenPanel>
          </div>
        </div>
      </main>

      {/* App Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-background/60 border border-border backdrop-blur rounded-xl px-3 py-2 shadow-[var(--shadow-elegant)]">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => managerRef.current?.openTerminal()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors" aria-label="Open Terminal">
            <Terminal className="w-4 h-4" /> <span className="hidden sm:inline">Terminal</span>
          </button>
          <button type="button" onClick={() => managerRef.current?.openPackageManager()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors" aria-label="Open Package Manager">
            <Cpu className="w-4 h-4" /> <span className="hidden sm:inline">Packages</span>
          </button>
          <button type="button" onClick={() => managerRef.current?.openNetworkTools()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors" aria-label="Open Network Tools">
            <Network className="w-4 h-4" /> <span className="hidden sm:inline">Network</span>
          </button>
          <button type="button" onClick={() => managerRef.current?.openSecurityTools()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors" aria-label="Open Security Tools">
            <Shield className="w-4 h-4" /> <span className="hidden sm:inline">Security</span>
          </button>
          <button type="button" onClick={() => managerRef.current?.openBotManager()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors" aria-label="Open Bot Manager">
            <Bot className="w-4 h-4" /> <span className="hidden sm:inline">Bots</span>
          </button>
          <button type="button" onClick={() => managerRef.current?.openVirtualMachine()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors" aria-label="Open Virtual Machines">
            <Monitor className="w-4 h-4" /> <span className="hidden sm:inline">VMs</span>
          </button>
          <button type="button" onClick={() => managerRef.current?.openRealVirtualMachine()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors bg-primary/20 border border-primary/50" aria-label="Open Real VM Manager">
            <HardDrive className="w-4 h-4" /> <span className="hidden sm:inline">Real VMs</span>
          </button>
          <button type="button" onClick={() => managerRef.current?.openOSLauncher()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors" aria-label="Open OS Launcher">
            <HardDrive className="w-4 h-4" /> <span className="hidden sm:inline">OS</span>
          </button>
        </div>
      </div>

      {/* Applications Menu */}
      <ApplicationsMenu
        onOpenTerminal={() => managerRef.current?.openTerminal()}
        onOpenBrowser={(url, title) => managerRef.current?.openBrowser(url, title)}
        onOpenVirtualMachine={() => managerRef.current?.openVirtualMachine()}
        onOpenRealVirtualMachine={() => managerRef.current?.openRealVirtualMachine()}
        onOpenOSLauncher={() => managerRef.current?.openOSLauncher()}
      />

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        onFocusWindow={(id) => managerRef.current?.focusWindow(id)}
        onRestoreWindow={(id) => managerRef.current?.restoreWindow(id)}
        onCloseWindow={(id) => {
          const closeButton = document.querySelector(`[data-window-id="${id}"] button[aria-label="Close"]`) as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        }}
      />

      {/* Window Manager */}
      <WindowManager ref={managerRef} />

      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground">
        © 2025 CVJ Technologies • CVJ Desktop GUI
      </footer>
    </div>
  );
};

export default Desktop;
