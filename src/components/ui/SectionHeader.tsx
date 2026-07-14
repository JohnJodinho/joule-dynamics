import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";

const { sections } = config as unknown as RootConfig;

interface SectionHeaderProps {
  sectionId: string;
  className?: string;
}

export function SectionHeader({ sectionId, className }: SectionHeaderProps) {
  const index = sections.findIndex((s) => s.id === sectionId);
  if (index === -1) {
    // Fallback if not found, though this shouldn't happen
    return null;
  }
  
  const section = sections[index];
  const numberStr = String(index + 1).padStart(2, "0");
  const defaultClassName = "font-mono text-xs text-primary tracking-widest whitespace-nowrap";

  return (
    <span className={className || defaultClassName}>
      // {numberStr}. {section.label}
    </span>
  );
}
