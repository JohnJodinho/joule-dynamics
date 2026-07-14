import { Badge } from "@/components/ui/badge";
import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";

const { about } = config as unknown as RootConfig;

export default function AboutSection() {
  return (
    <section id="about" className="pt-16 pb-24 border-t border-border mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">{about.headline}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
            {about.bio}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">
            CREDENTIALS
          </p>
          {about.credentials.map((cred) => (
            <Badge
              key={cred}
              variant="outline"
              className="rounded-sm font-mono text-[10px] tracking-wide px-2.5 py-1.5 border-border text-muted-foreground w-fit whitespace-normal text-left h-auto leading-snug"
            >
              {cred}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
