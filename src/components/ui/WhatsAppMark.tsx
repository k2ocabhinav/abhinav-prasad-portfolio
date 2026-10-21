interface WhatsAppMarkProps {
  size?: number;
}

export default function WhatsAppMark({ size = 18 }: WhatsAppMarkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.25 11.7a8.2 8.2 0 0 1-12.1 7.2l-4.4 1.15 1.18-4.3a8.2 8.2 0 1 1 15.32-4.05Z" />
      <path d="M8.8 7.8c.2-.45.45-.48.7-.48h.55c.2 0 .4.08.5.35l.75 1.8c.1.22.08.4-.08.6l-.56.68c-.16.18-.24.34-.1.58.55.96 1.26 1.65 2.25 2.16.24.12.42.1.58-.1l.74-.9c.18-.2.35-.25.6-.14l1.62.77c.24.12.38.2.4.38.03.18-.03.82-.4 1.28-.4.48-1.03.72-1.67.72-.55 0-1.25-.18-2.32-.65-1.48-.64-2.48-1.5-3.4-2.78-.76-1.05-1.14-2.12-1.14-2.76 0-.62.22-1.06.48-1.4Z" />
    </svg>
  );
}
