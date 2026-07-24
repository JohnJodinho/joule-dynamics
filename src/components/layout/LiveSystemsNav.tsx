/**
 * LiveSystemsNav.tsx
 * Sticky section nav for /live-systems.
 * Uses IntersectionObserver to highlight the active section as the user scrolls.
 * Clicking a label smooth-scrolls to the section and updates the URL hash.
 */
import { useEffect, useState, useCallback, useRef } from "react";
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
  const isScrollingToHash = useRef(false);

  // Initial scroll and hash sync
  useEffect(() => {
    const hash = location.hash.replace("#", "") as SectionId;
    if (SECTIONS.some((s) => s.id === hash)) {
      setActive(hash);
      // Wait for layout to settle, then scroll to the correct section
      // We do this in a few cascading timeouts to handle React's render cycles and async data loading layout shifts.
      isScrollingToHash.current = true;
      const scrollIt = () => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      };
      
      scrollIt();
      const t1 = setTimeout(scrollIt, 500);
      const t2 = setTimeout(() => {
        scrollIt();
        isScrollingToHash.current = false;
      }, 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [location.hash]);

  // Robust scroll spy
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingToHash.current) return; // Don't override while auto-scrolling

      // Trigger line is slightly below the sticky nav (approx 120px + some padding)
      const triggerY = 200; 
      
      let currentSection = active;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the element is above our trigger line, and its bottom is below it, it's currently intersecting.
          // We also include elements whose top is very close to the trigger line.
          if (rect.top <= triggerY && rect.bottom > triggerY) {
            currentSection = section.id;
            break;
          }
        }
      }
      
      if (currentSection !== active) {
         setActive(currentSection);
         window.history.replaceState(null, "", `#${currentSection}`);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [active]);

  const handleClick = useCallback((id: SectionId) => {
      isScrollingToHash.current = true;
      setActive(id);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", `#${id}`);
      }
      
      // Release the lock after smooth scroll is likely finished
      setTimeout(() => {
        isScrollingToHash.current = false;
      }, 1000);
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
