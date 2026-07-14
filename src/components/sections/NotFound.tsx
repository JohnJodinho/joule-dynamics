import { Button } from "@/components/ui/button";
import { SystemStatusBar } from "@/components/layout/SystemStatusBar";
import CredentialFooter from "@/components/layout/CredentialFooter";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <SystemStatusBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="space-y-6">
          <code className="inline-flex items-center gap-2 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-1.5 font-mono text-[10px] tracking-widest text-destructive uppercase">
            <span className="animate-pulse">●</span>
            404 // SYSTEM FAULT
          </code>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
            Route Not Integrated
          </h1>
          
          <p className="max-w-md mx-auto text-muted-foreground text-lg leading-relaxed">
            The module you are attempting to access is currently offline or does not exist in this deployment.
          </p>
          
          <div className="pt-8">
            <Button
              size="lg"
              className="gap-2 font-mono text-xs tracking-wider"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="size-4" />
                RETURN TO SYSTEM ROOT
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <CredentialFooter />
    </>
  );
}
