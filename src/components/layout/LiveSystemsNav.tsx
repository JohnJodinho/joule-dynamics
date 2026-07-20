/**
 * LiveSystemsNav.tsx
 * Sticky section nav for /live-systems.
 * Uses IntersectionObserver to highlight the active section as the user scrolls.
 * Clicking a label smooth-scrolls to the section and updates the URL hash.
 */
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

const SECTIONS = [
  { id: "pricing",     label: "PRICING" },
  { id: "real-estate", label: "REAL ESTATE" },
  { id: "assistant",   label: "SUPPORT" },
  { id: "leads",       label: "LEADS" },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export default function LiveSystemsNav() {
  const [active, setActive] = useState<SectionId>("pricing");
  const location = useLocation();

  // Sync active tab with URL hash on mount / hash change
  useEffect(() => {
    const hash = location.hash.replace("#", "") as SectionId;
    if (SECTIONS.some((s) => s.id === hash)) {
      setActive(hash);
    }
  }, [location.hash]);

  // IntersectionObserver — fire when a section is >= 30% visible
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(id);
            // Silently update hash without pushing to history
            window.history.replaceState(null, "", `#${id}`);
          }
        },
        { threshold: 0.25, rootMargin: "-80px 0px -30% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleClick = useCallback((id: SectionId) => {
      setActive(id);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", `#${id}`);
      }
    },
    []
  );

  return (
    <div className="sticky top-12 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {SECTIONS.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => handleClick(id)}
                className={`
                  relative shrink-0 px-4 py-3 font-mono text-[10px] tracking-widest uppercase
                  transition-colors duration-150 whitespace-nowrap border-b-2
                  ${isActive
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                  }
                `}
                aria-current={isActive ? "location" : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
