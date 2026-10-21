// =============================================================================
// Tag — Reusable skill/tech pill component
// =============================================================================

interface TagProps {
  label: string;
  variant?: "default" | "subtle";
}

export default function Tag({ label, variant = "default" }: TagProps) {
  return (
    <span className={`tag ${variant === "subtle" ? "tag-subtle" : ""}`}>
      {label}
    </span>
  );
}
