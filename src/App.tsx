import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SystemStatusBar } from "@/components/layout/SystemStatusBar";
import CredentialFooter from "@/components/layout/CredentialFooter";
import HeroEngine from "@/components/sections/HeroEngine";
import SolutionsShowcase from "@/components/sections/SolutionsShowcase";
import OperationalHistory from "@/components/sections/OperationalHistory";
import AuditPortal from "@/components/sections/AuditPortal";
import NotFound from "@/components/sections/NotFound";
import LiveSystems from "@/pages/LiveSystems";

/**
 * Root page — single-page layout, section-only composition.
 * Render order: Dev Hub badge (SystemStatusBar) → Hero → Solutions Showcase
 *   → How It Works (OperationalHistory) → Interactive Labs → Audit/Contact → Footer
 * No copy or literals belong in this file — all section components are pure composition.
 */
function PortfolioRoot() {
  return (
    <>
      <SystemStatusBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-0">
        <HeroEngine />
        <SolutionsShowcase />
        <OperationalHistory />
        <AuditPortal />
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
            <Route path="/live-systems" element={<LiveSystems />} />
            {/* /audit redirects to the inline contact section on the main page */}
            <Route path="/audit" element={<PortfolioRoot />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
