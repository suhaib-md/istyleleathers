import { isPlaceholder } from "@/content/site";

/**
 * Renders a business fact. If the value is still a [placeholder], it shows in a
 * dashed "fill me in" style so it's obvious what needs real information.
 * Edit values in src/content/site.ts.
 */
export default function Ph({ v, className = "" }: { v: string; className?: string }) {
  if (!isPlaceholder(v)) return <>{v}</>;
  return (
    <span className={`ph ${className}`} title="Placeholder — edit in src/content/site.ts">
      {v}
    </span>
  );
}
