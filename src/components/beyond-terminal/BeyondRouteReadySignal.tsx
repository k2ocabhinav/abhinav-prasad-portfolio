"use client";

import { useEffect } from "react";
import { usePortalTransitionContext } from "./PortalTransitionProvider";

interface BeyondRouteReadySignalProps {
  href: string;
  focusTargetId: string;
}

export default function BeyondRouteReadySignal({
  href,
  focusTargetId,
}: BeyondRouteReadySignalProps) {
  const {
    phase,
    shouldFocusDestination,
    signalDestinationReady,
    clearFocusRequest,
  } = usePortalTransitionContext();

  useEffect(() => {
    // This mount signal is the handshake point between the destination route and
    // the shared portal provider. It lets the overlay reveal only after the new
    // tree is actually present, while still allowing a provider-level timeout.
    signalDestinationReady(href);
  }, [href, signalDestinationReady]);

  useEffect(() => {
    if (phase !== "revealing" || !shouldFocusDestination) {
      return;
    }

    const focusTarget = document.getElementById(focusTargetId);

    if (focusTarget instanceof HTMLElement) {
      focusTarget.focus();
      clearFocusRequest();
    }
  }, [clearFocusRequest, focusTargetId, phase, shouldFocusDestination]);

  return null;
}
