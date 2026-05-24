import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SystemStatusBar } from "@/components/layout/SystemStatusBar";
import CredentialFooter from "@/components/layout/CredentialFooter";
import HeroEngine from "@/components/sections/HeroEngine";
import TechnicalMatrix from "@/components/sections/TechnicalMatrix";
import OperationalHistory from "@/components/sections/OperationalHistory";
import InteractiveLabs from "@/components/sections/InteractiveLabs";
import AuditPortal from "@/components/sections/AuditPortal";

/** Root portfolio path — the public-facing static layer */
function PortfolioRoot() {
  return (
    <>
      <SystemStatusBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-12">
        <HeroEngine />
        <TechnicalMatrix />
        <OperationalHistory />
        <InteractiveLabs />
      </main>
      <CredentialFooter />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="joule-ui-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
          <Routes>
            <Route path="/" element={<PortfolioRoot />} />
            <Route path="/audit" element={<AuditPortal />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
