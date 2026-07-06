/**
 * SolutionsGrid.tsx
 * Maps config.solutions → SolutionCard[].
 * Filters by isPublished, sorts by order — zero copy lives here.
 * Adding/removing/reordering solutions only requires editing config.json.
 */
import config from "@/data/config.json";
import type { RootConfig } from "@/types/data";
import SolutionCard from "./SolutionCard";

const { solutions } = config as unknown as RootConfig;

export default function SolutionsGrid() {
  const visible = [...solutions]
    .filter((s) => s.isPublished)
    .sort((a, b) => a.order - b.order);

  if (!visible.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {visible.map((solution) => (
        <SolutionCard key={solution.id} solution={solution} />
      ))}
    </div>
  );
}
