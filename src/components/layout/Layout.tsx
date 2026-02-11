import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/constants/brand";
import { Footer } from "./Footer";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [time, setTime] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().split("T")[1].split(".")[0] + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: "SERVICES", id: "01" },
    { label: "LABS", id: "02" },
    { label: "CONTACT", id: "03" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-slate-400">
      {/* Sticky Status Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Brand & Status */}
          <div className="flex items-center gap-4">
            <div className="font-bold text-lg tracking-wider text-neutral-100">
              {BRAND.name.toUpperCase()}
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-950/30 border border-green-900/50">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-[10px] font-mono text-green-500 font-bold tracking-tight">
                SYSTEM: ACTIVE
              </span>
            </div>
          </div>

          {/* Clock & Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="font-mono text-xs text-neutral-500 tabular-nums">
              {time}
            </div>
            
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="text-xs font-medium text-neutral-400 hover:text-cyan-400 hover:bg-cyan-950/20 data-[state=active]:text-cyan-400 transition-colors"
                >
                  <span className="opacity-50 mr-1">[{item.id}]</span>
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-neutral-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-white/5 bg-neutral-950">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-neutral-600 font-mono mb-2">
                <span>STATUS: ONLINE</span>
                <span>{time}</span>
              </div>
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="justify-start text-sm text-neutral-300 hover:text-cyan-400 hover:bg-neutral-900"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="opacity-50 mr-2">[{item.id}]</span>
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}
