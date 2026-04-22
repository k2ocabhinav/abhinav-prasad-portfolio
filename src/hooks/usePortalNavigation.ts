"use client";

import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { usePortalTransitionContext } from "@/components/beyond-terminal/PortalTransitionProvider";
import type { PortalTransitionIntent } from "@/types";

interface PortalTriggerOptions {
  href: string;
  source: PortalTransitionIntent["source"];
  variant?: PortalTransitionIntent["variant"];
  skin?: PortalTransitionIntent["skin"];
}

export function usePortalNavigation() {
  const { beginTransition, isTransitioning } = usePortalTransitionContext();
  const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);
  const keyboardIntentRef = useRef(false);
  const ignoreNextClickRef = useRef(false);

  const rememberPointerOrigin = useCallback((event: PointerEvent<HTMLElement>) => {
    keyboardIntentRef.current = false;
    pointerOriginRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const buildIntent = useCallback(
    (options: PortalTriggerOptions, triggeredByKeyboard: boolean) => {
      const origin =
        triggeredByKeyboard || pointerOriginRef.current === null
          ? {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            }
          : pointerOriginRef.current;

      pointerOriginRef.current = null;
      keyboardIntentRef.current = false;

      return {
        intent: {
          href: options.href,
          originX: origin.x,
          originY: origin.y,
          source: options.source,
          variant: options.variant ?? "portal-bloom",
          skin: options.skin ?? "beyond-pastel-mist",
        } satisfies PortalTransitionIntent,
        triggeredByKeyboard,
      };
    },
    []
  );

  const beginPortalNavigation = useCallback(
    (event: MouseEvent<HTMLElement>, options: PortalTriggerOptions) => {
      if (ignoreNextClickRef.current) {
        ignoreNextClickRef.current = false;
        event.preventDefault();
        return Promise.resolve(false);
      }

      event.preventDefault();

      const triggeredByKeyboard =
        keyboardIntentRef.current ||
        (event.detail === 0 && pointerOriginRef.current === null);
      const { intent } = buildIntent(options, triggeredByKeyboard);
      document.documentElement.dataset.lastPortalTriggerMode = triggeredByKeyboard
        ? "keyboard"
        : "pointer";
      return beginTransition(intent, { triggeredByKeyboard });
    },
    [beginTransition, buildIntent]
  );

  const beginKeyboardPortalNavigation = useCallback(
    (event: KeyboardEvent<HTMLElement>, options: PortalTriggerOptions) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();

      if (isTransitioning) {
        return;
      }

      ignoreNextClickRef.current = true;
      document.documentElement.dataset.lastPortalTriggerMode = "keyboard";

      const { intent } = buildIntent(options, true);
      void beginTransition(intent, { triggeredByKeyboard: true });
    },
    [beginTransition, buildIntent, isTransitioning]
  );

  const getTriggerProps = useCallback(
    (options: PortalTriggerOptions) => ({
      onPointerDown: rememberPointerOrigin,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        keyboardIntentRef.current = event.key === "Enter" || event.key === " ";
        beginKeyboardPortalNavigation(event, options);
      },
      onClick: (event: MouseEvent<HTMLElement>) =>
        beginPortalNavigation(event, options),
      disabled: isTransitioning,
    }),
    [beginKeyboardPortalNavigation, beginPortalNavigation, isTransitioning, rememberPointerOrigin]
  );

  return {
    beginPortalNavigation,
    getTriggerProps,
    isTransitioning,
  };
}
