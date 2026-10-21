interface DownloadMarkProps {
  size?: number;
}

export default function DownloadMark({ size = 16 }: DownloadMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3v12m-4-4 4 4 4-4" />
      <path d="M4 17v4h16v-4" />
    </svg>
  );
}
