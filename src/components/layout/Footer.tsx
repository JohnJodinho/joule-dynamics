import { BRAND } from "@/constants/brand";
import { Linkedin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left: Copyright */}
        <div className="text-neutral-500 text-sm">
          <span className="font-semibold text-neutral-300">{BRAND.name}</span> © 2026 | Built on Industrial Logic.
        </div>

        {/* Center: Credentials */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-cyan-500/80">
            {BRAND.founder.credentials.split(",")[0]}
          </div>
          <div className="text-xs text-neutral-600">
            {BRAND.founder.credentials.split(",")[1]}
          </div>
        </div>

        {/* Right: Socials */}
        <div className="flex items-center gap-4">
          <a
            href={BRAND.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-cyan-400 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <a
            href={BRAND.contact.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-green-400 transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
