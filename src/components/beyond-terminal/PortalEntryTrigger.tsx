"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { usePortalNavigation } from "@/hooks/usePortalNavigation";
import type { PortalTransitionIntent } from "@/types";

interface PortalEntryTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  children: ReactNode;
  href: string;
  source: PortalTransitionIntent["source"];
  variant?: PortalTransitionIntent["variant"];
  skin?: PortalTransitionIntent["skin"];
}

export default function PortalEntryTrigger({
  children,
  href,
  source,
  variant = "portal-bloom",
  skin = "beyond-pastel-mist",
  disabled,
  ...buttonProps
}: PortalEntryTriggerProps) {
  const { getTriggerProps, isTransitioning } = usePortalNavigation();
  const triggerProps = getTriggerProps({ href, source, variant, skin });
  const { onClick, onKeyDown, onPointerDown, ...restButtonProps } = buttonProps;

  return (
    <button
      type="button"
      {...restButtonProps}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        triggerProps.onPointerDown(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        triggerProps.onKeyDown(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        triggerProps.onClick(event);
      }}
      disabled={Boolean(disabled) || isTransitioning}
    >
      {children}
    </button>
  );
}
