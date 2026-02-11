import { BRAND, type Service } from "@/constants/brand";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, ShieldCheck, Layers, ArrowUpRight } from "lucide-react";

export function Services() {
  const getIcon = (id: string) => {
    switch (id) {
      case "rag": return <Cpu className="w-10 h-10 text-cyan-500 mb-4" />;
      case "scraping": return <ShieldCheck className="w-10 h-10 text-orange-500 mb-4" />;
      case "infra": return <Layers className="w-10 h-10 text-purple-500 mb-4" />;
      default: return <Cpu className="w-10 h-10 text-neutral-500 mb-4" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-neutral-900/50 border-y border-neutral-800">
      <div className="container mx-auto px-4">
        
        <div className="mb-16 md:flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Core Capabilities</h2>
            <p className="text-slate-400 max-w-xl">
              High-performance modules designed for enterprise integration. 
              Built for resilience, scale, and autonomous operation.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs font-mono text-neutral-500 mb-1">module_status</div>
            <div className="text-green-500 font-mono text-sm">ALL SYSTEMS NOMINAL</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BRAND.services.map((service: Service) => (
            <Card 
              key={service.id} 
              className="bg-neutral-950 border-neutral-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)] transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  {getIcon(service.id)}
                  <ArrowUpRight className="w-5 h-5 text-neutral-700 group-hover:text-cyan-500 transition-colors" />
                </div>
                <CardTitle className="text-xl text-neutral-100 font-bold tracking-wide">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-slate-400 leading-relaxed">
                  {service.desc}
                </CardDescription>
                
                <div className="mt-6 pt-6 border-t border-neutral-900 flex items-center gap-2 text-xs font-mono text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-cyan-500 transition-colors"></span>
                  API READY
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
