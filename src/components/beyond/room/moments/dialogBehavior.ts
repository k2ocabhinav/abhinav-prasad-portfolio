"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogBehaviorOptions {
  open: boolean;
  dialogRef: RefObject<HTMLDivElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
  restoreFocusRef: RefObject<HTMLElement | null>;
  onEscape: () => void;
}

export function useDialogBehavior({
  open,
  dialogRef,
  initialFocusRef,
  restoreFocusRef,
  onEscape,
}: DialogBehaviorOptions): void {
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const restoreTarget =
      restoreFocusRef.current ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    restoreFocusRef.current = null;

    const originalOverflow = document.body.style.overflow;
    const background: Array<{ element: HTMLElement; wasInert: boolean }> = [];
    let node: HTMLElement | null = dialog;

    while (node && node !== document.body) {
      const parent: HTMLElement | null = node.parentElement;
      if (!parent) break;
      Array.from(parent.children).forEach((child) => {
        if (child !== node && child instanceof HTMLElement) {
          background.push({ element: child, wasInert: child.inert });
          child.inert = true;
        }
      });
      node = parent;
    }

    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      initialFocusRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (element) =>
          element.tabIndex >= 0 && !element.closest('[aria-hidden="true"]')
      );
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      dialog.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      background.forEach(({ element, wasInert }) => {
        element.inert = wasInert;
      });
      if (restoreTarget?.isConnected && restoreTarget !== document.body) {
        restoreTarget.focus({ preventScroll: true });
      }
    };
  }, [dialogRef, initialFocusRef, onEscape, open, restoreFocusRef]);
}
