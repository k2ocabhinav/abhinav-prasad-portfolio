"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type {
  PortalTransitionIntent,
  PortalTransitionPhase,
  PortalTransitionState,
} from "@/types";
import PortalTransitionLayer from "./PortalTransitionLayer";

const COVER_PUSH_DELAY_MS = 210;
const REDUCED_PUSH_DELAY_MS = 90;
const DESTINATION_FAIL_OPEN_MS = 1400;
const REVEAL_DURATION_MS = 620;
const REDUCED_REVEAL_DURATION_MS = 220;

interface BeginTransitionOptions {
  triggeredByKeyboard?: boolean;
}

interface PortalTransitionContextValue {
  phase: PortalTransitionPhase;
  intent: PortalTransitionIntent | null;
  isTransitioning: boolean;
  shouldFocusDestination: boolean;
  beginTransition: (
    intent: PortalTransitionIntent,
    options?: BeginTransitionOptions
  ) => boolean;
  signalDestinationReady: (href: string) => void;
  clearFocusRequest: () => void;
}

const initialState: PortalTransitionState = {
  phase: "idle",
  intent: null,
  isDestinationReady: false,
};

const PortalTransitionContext = createContext<PortalTransitionContextValue | null>(null);

type TimerKey = "push" | "readyFallback" | "reset";

export function usePortalTransitionContext() {
  const context = useContext(PortalTransitionContext);

  if (!context) {
    throw new Error("usePortalTransitionContext must be used inside PortalTransitionProvider");
  }

  return context;
}

interface PortalTransitionProviderProps {
  children: ReactNode;
}

export default function PortalTransitionProvider({
  children,
}: PortalTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [state, setState] = useState<PortalTransitionState>(initialState);
  const [shouldFocusDestination, setShouldFocusDestination] = useState(false);
  const [triggerMode, setTriggerMode] = useState<"pointer" | "keyboard" | null>(null);
  const stateRef = useRef(state);
  const timersRef = useRef<Record<TimerKey, number | null>>({
    push: null,
    readyFallback: null,
    reset: null,
  });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearTimer = useCallback((key: TimerKey) => {
    const timerId = timersRef.current[key];

    if (timerId !== null) {
      window.clearTimeout(timerId);
      timersRef.current[key] = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearTimer("push");
    clearTimer("readyFallback");
    clearTimer("reset");
  }, [clearTimer]);

  const resetTransition = useCallback(() => {
    clearAllTimers();
    setShouldFocusDestination(false);
    setTriggerMode(null);
    setState(initialState);
  }, [clearAllTimers]);

  const beginTransition = useCallback(
    (intent: PortalTransitionIntent, options?: BeginTransitionOptions) => {
      if (stateRef.current.phase !== "idle" || pathname === intent.href) {
        return false;
      }

      clearAllTimers();

      const resolvedIntent: PortalTransitionIntent = prefersReducedMotion
        ? { ...intent, variant: "accessible-fade" }
        : intent;

      document.documentElement.dataset.lastPortalTriggerMode = options?.triggeredByKeyboard
        ? "keyboard"
        : "pointer";
      document.documentElement.dataset.lastPortalVariant = resolvedIntent.variant;
      document.documentElement.dataset.lastPortalSkin = resolvedIntent.skin;

      setShouldFocusDestination(Boolean(options?.triggeredByKeyboard));
      setTriggerMode(options?.triggeredByKeyboard ? "keyboard" : "pointer");
      setState({
        phase: "covering",
        intent: resolvedIntent,
        isDestinationReady: false,
      });

      timersRef.current.push = window.setTimeout(() => {
        router.push(resolvedIntent.href);
        setState((currentState) => {
          if (currentState.intent?.href !== resolvedIntent.href) {
            return currentState;
          }

          return {
            ...currentState,
            phase: "navigating",
          };
        });
      }, prefersReducedMotion ? REDUCED_PUSH_DELAY_MS : COVER_PUSH_DELAY_MS);

      return true;
    },
    [clearAllTimers, pathname, prefersReducedMotion, router]
  );

  const signalDestinationReady = useCallback((href: string) => {
    setState((currentState) => {
      if (!currentState.intent || currentState.intent.href !== href) {
        return currentState;
      }

      return {
        ...currentState,
        isDestinationReady: true,
      };
    });
  }, []);

  useEffect(() => {
    // Keep the document frozen while the portal owns the viewport so there is
    // no scroll bleed or accidental interaction underneath the overlay.
    if (state.phase === "idle") {
      return;
    }

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [state.phase]);

  useEffect(() => {
    clearTimer("readyFallback");

    // The destination handshake waits for a real mount signal from the Beyond
    // route, then fails open after a short timeout so navigation cannot deadlock
    // if the boundary is removed or hydration is delayed.
    if (
      state.phase === "idle" ||
      !state.intent ||
      pathname !== state.intent.href ||
      state.isDestinationReady
    ) {
      return;
    }

    timersRef.current.readyFallback = window.setTimeout(() => {
      setState((currentState) => {
        if (!currentState.intent || currentState.intent.href !== pathname) {
          return currentState;
        }

        return {
          ...currentState,
          isDestinationReady: true,
        };
      });
    }, DESTINATION_FAIL_OPEN_MS);

    return () => {
      clearTimer("readyFallback");
    };
  }, [clearTimer, pathname, state.intent, state.isDestinationReady, state.phase]);

  useEffect(() => {
    if (
      state.phase === "idle" ||
      state.phase === "revealing" ||
      !state.intent ||
      pathname !== state.intent.href ||
      !state.isDestinationReady
    ) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setState((currentState) => {
        if (!currentState.intent || currentState.intent.href !== pathname) {
          return currentState;
        }

        return {
          ...currentState,
          phase: "revealing",
        };
      });
    });

    clearTimer("reset");
    timersRef.current.reset = window.setTimeout(
      resetTransition,
      prefersReducedMotion ? REDUCED_REVEAL_DURATION_MS : REVEAL_DURATION_MS
    );

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    clearTimer,
    pathname,
    prefersReducedMotion,
    resetTransition,
    state.intent,
    state.isDestinationReady,
    state.phase,
  ]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  useEffect(() => {
    if (!triggerMode || !state.intent) {
      return;
    }

    document.documentElement.dataset.lastPortalTriggerMode = triggerMode;
    document.documentElement.dataset.lastPortalVariant = state.intent.variant;
  }, [state.intent, triggerMode]);

  const contextValue = useMemo<PortalTransitionContextValue>(
    () => ({
      phase: state.phase,
      intent: state.intent,
      isTransitioning: state.phase !== "idle",
      shouldFocusDestination,
      beginTransition,
      signalDestinationReady,
      clearFocusRequest: () => setShouldFocusDestination(false),
    }),
    [
      beginTransition,
      shouldFocusDestination,
      signalDestinationReady,
      state.intent,
      state.phase,
    ]
  );

  return (
    <PortalTransitionContext.Provider value={contextValue}>
      {children}
      <PortalTransitionLayer
        intent={state.intent}
        phase={state.phase}
        reducedMotion={prefersReducedMotion}
        triggerMode={triggerMode}
      />
    </PortalTransitionContext.Provider>
  );
}
