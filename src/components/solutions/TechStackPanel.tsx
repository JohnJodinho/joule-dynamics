/**
 * TechStackPanel.tsx
 * Collapsed "Under the hood" panel showing tech stack tags.
 * Uses the native <details>/<summary> for zero-JS toggle.
 */
import { Badge } from "@/components/ui/badge";

interface TechStackPanelProps {
  tags: string[];
}

export default function TechStackPanel({ tags }: TechStackPanelProps) {
  if (!tags.length) return null;

  return (
    <details className="mt-4 group">
      <summary
        className="
          flex items-center gap-2 cursor-pointer list-none
          font-mono text-[11px] tracking-widest uppercase text-muted-foreground
          hover:text-foreground transition-colors select-none
        "
      >
        <span
          className="inline-block transition-transform duration-200 group-open:rotate-90"
          aria-hidden="true"
        >
          ▸
        </span>
        Under the hood
      </summary>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {tags.map((tech) => (
          <Badge
            key={tech}
            variant="secondary"
            className="rounded-sm font-mono text-[10px] tracking-wide"
          >
            {tech}
          </Badge>
        ))}
      </div>
    </details>
  );
}
