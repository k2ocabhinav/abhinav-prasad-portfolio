import { STACK_ICONS, type StackIconName } from "./icons";

// =============================================================================
// StackIcon — a single monochrome glyph on the shared 24×24 grid.
// Purely presentational: decorative (aria-hidden) unless a title is supplied.
// =============================================================================

interface StackIconProps {
  name: StackIconName;
  size?: number;
  title?: string;
  className?: string;
}

export default function StackIcon({
  name,
  size = 20,
  title,
  className,
}: StackIconProps) {
  const { parts } = STACK_ICONS[name];
  const decorative = !title;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={title}
      focusable="false"
    >
      {parts.map((part, index) =>
        part.type === "fill" ? (
          <path key={index} d={part.d} fill="currentColor" />
        ) : (
          <path
            key={index}
            d={part.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={part.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      )}
    </svg>
  );
}
