interface HalftonePatternProps {
  id: string;
  size?: number;
  radius?: number;
}

/** Dot-screen fill for illustration shadows; reference it as fill={`url(#${id})`}. */
export function HalftonePattern({ id, size = 7, radius = 1.6 }: HalftonePatternProps) {
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="var(--plate-ink)" />
    </pattern>
  );
}
