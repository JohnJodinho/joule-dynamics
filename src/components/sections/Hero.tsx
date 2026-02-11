import { Button } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-neutral-950">
      
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{
          backgroundImage: `linear-gradient(#27272a 1px, transparent 1px), linear-gradient(to right, #27272a 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* Radial Vignette */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/50 pointer-events-none" />

      <div className="container relative z-20 px-4 text-center max-w-4xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-900/50 text-cyan-400 text-xs font-mono tracking-wider"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          SYSTEM ONLINE // V2.0
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
        >
          {BRAND.tagline.split(" ").map((word, i) => (
            <span key={i} className={i < 2 ? "text-white" : "text-neutral-400"}>
              {word}{" "}
            </span>
          ))}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {BRAND.description}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-semibold tracking-wide"
          >
            DEPLOY AGENTIC RAG
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <FileText className="mr-2 w-4 h-4" />
            VIEW LAB DOCS
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
