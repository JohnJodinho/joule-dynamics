/**
 * DemoEmbed.tsx
 * Switches on demo.kind to render video / screenshot / interactive.
 * Falls back gracefully when media isn't available yet.
 */
import type { DemoAsset } from "@/types/data";

interface DemoEmbedProps {
  demo: DemoAsset;
  /** When kind="interactive", render this slot component instead of an iframe */
  interactiveSlot?: React.ReactNode;
}

export default function DemoEmbed({ demo, interactiveSlot }: DemoEmbedProps) {
  const wrapperClass =
    "relative w-full rounded-lg overflow-hidden bg-card border border-border aspect-video flex items-center justify-center";

  if (demo.kind === "video" && demo.url) {
    return (
      <div className={wrapperClass}>
        <video
          src={demo.url}
          poster={demo.posterImage}
          controls
          preload="none"
          className="w-full h-full object-cover"
          aria-label={demo.altText}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (demo.kind === "interactive") {
    return (
      <div className={wrapperClass}>
        {interactiveSlot ?? (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-muted-foreground">
              {demo.fallbackNote ?? "Interactive demo coming soon — ask for a live walkthrough."}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default: screenshot / fallback
  return (
    <div className={wrapperClass + " bg-secondary/30"}>
      {demo.url ? (
        <img
          src={demo.url}
          alt={demo.altText}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <span className="text-3xl opacity-40">▶</span>
          <p className="text-sm text-muted-foreground">
            {demo.fallbackNote ?? "Demo preview coming soon — ask for a live walkthrough."}
          </p>
        </div>
      )}
      {demo.fallbackNote && demo.url && (
        <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm px-4 py-2">
          <p className="text-xs text-muted-foreground text-center">{demo.fallbackNote}</p>
        </div>
      )}
    </div>
  );
}
