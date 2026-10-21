"use client";

import dynamic from "next/dynamic";
import * as m from "motion/react-m";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { BeyondAlbumItem } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePortalTransitionContext } from "@/components/beyond-terminal/PortalTransitionProvider";
import { roomStore, useRoomState } from "../room/roomStore";
import FallbackDeck from "./FallbackDeck";
import { OPEN_MOMENTS_EVENT } from "./events";
import { playRoomSound } from "./audio";
import styles from "./BeyondRoomExperience.module.css";

const RoomCanvas = dynamic(
  () => import("@/components/beyond/room/scene/RoomCanvas"),
  {
    ssr: false,
    loading: () => <div className={styles.loading} role="status">Preparing the room</div>,
  }
);

const MomentsLayer = dynamic(
  () => import("@/components/beyond/room/moments/MomentsLayer"),
  { ssr: false }
);

const MomentsOverlay = dynamic(
  () => import("@/components/beyond/room/moments/MomentOverlays"),
  { ssr: false }
);

const RoomFirstFrameSignal = dynamic(() => import("./RoomFirstFrameSignal"), {
  ssr: false,
});

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type RoomGate = "pending" | "room" | "fallback";

interface BeyondRoomExperienceProps {
  items: BeyondAlbumItem[];
  poster: ReactNode;
}

interface SceneErrorBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function canUseRoom(): boolean {
  const browser = navigator as NavigatorHints;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = browser.connection?.saveData === true;
  const lowMemory = typeof browser.deviceMemory === "number" && browser.deviceMemory < 4;
  const fewCores = browser.hardwareConcurrency > 0 && browser.hardwareConcurrency < 4;

  if (reducedMotion || saveData || lowMemory || fewCores) return false;

  const canvas = document.createElement("canvas");
  canvas.dataset.roomCapabilityProbe = "true";
  const context = canvas.getContext("webgl2");
  if (!context) return false;
  context.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
}

function requestsFallback(): boolean {
  if (new URLSearchParams(window.location.search).get("lowfx") === "1") return true;

  try {
    return window.localStorage.getItem("beyondLowFx") === "1";
  } catch {
    return false;
  }
}

function getFocusLabel(focus: ReturnType<typeof roomStore.get>["focus"]): string | undefined {
  if (!focus) return undefined;
  return focus.type === "laptop" ? "laptop" : `moment:${focus.id}`;
}

export default function BeyondRoomExperience({ items, poster }: BeyondRoomExperienceProps) {
  const reduceMotion = useReducedMotion();
  const room = useRoomState();
  const { intent } = usePortalTransitionContext();
  const [gate, setGate] = useState<RoomGate>("pending");
  const [canEnter, setCanEnter] = useState(false);
  const [sceneRequested, setSceneRequested] = useState(false);
  const [listRequest, setListRequest] = useState(0);
  const [cameThroughPortal, setCameThroughPortal] = useState(false);
  const listRef = useRef<HTMLElement | null>(null);

  const requestScene = useCallback(() => {
    roomStore.set({ arrived: false });
    setSceneRequested(true);
  }, []);

  useEffect(() => {
    const reachedByWordmark =
      document.documentElement.dataset.lastPortalSkin === "beyond-room" &&
      document.documentElement.dataset.lastPortalVariant === "portal-bloom";
    const reachedByIntent =
      intent?.href === "/beyond-terminal" && intent.source === "easter-egg";
    if (!reachedByWordmark && !reachedByIntent) return;

    const frameId = window.requestAnimationFrame(() => setCameThroughPortal(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [intent]);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    let idleId: number | null = null;
    let enterTimerId: number | null = null;
    const gateFrameId = window.requestAnimationFrame(() => {
      if (requestsFallback() || !canUseRoom()) {
        setGate("fallback");
        return;
      }

      setGate("room");
      setCanEnter(true);
      if (idleWindow.requestIdleCallback) {
        idleId = idleWindow.requestIdleCallback(requestScene, { timeout: 1800 });
      } else {
        enterTimerId = window.setTimeout(requestScene, 450);
      }
    });

    return () => {
      window.cancelAnimationFrame(gateFrameId);
      if (idleId !== null) idleWindow.cancelIdleCallback?.(idleId);
      if (enterTimerId !== null) window.clearTimeout(enterTimerId);
    };
  }, [requestScene]);

  useEffect(() => {
    const onOpenMoments = () => setListRequest((current) => current + 1);
    window.addEventListener(OPEN_MOMENTS_EVENT, onOpenMoments);
    return () => window.removeEventListener(OPEN_MOMENTS_EVENT, onOpenMoments);
  }, []);

  const shouldShowArrival =
    sceneRequested && room.arrived && cameThroughPortal && !reduceMotion;

  useEffect(() => {
    if (!shouldShowArrival) return;
    roomStore.set({ mode: "night" });
  }, [shouldShowArrival]);

  const selectMoment = useCallback((item: BeyondAlbumItem) => {
    roomStore.set({ focus: { type: "moment", id: item.id } });
    if (roomStore.get().soundOn) playRoomSound("paper");
  }, []);

  const handleSceneError = useCallback(() => {
    setSceneRequested(false);
    setGate("fallback");
    setCanEnter(false);
    roomStore.set({ arrived: false, focus: null });
  }, []);

  const openTerminal = () => roomStore.set({ focus: { type: "laptop" } });
  const focusLabel = getFocusLabel(room.focus);

  return (
    <div
      className={styles.experience}
      data-beyond-room
      data-mode={room.mode}
      data-room-focus={focusLabel}
      data-room-arrived={room.arrived ? "true" : "false"}
      data-arrival-origin={cameThroughPortal ? "portal" : "direct"}
      data-scene-active={sceneRequested ? "true" : "false"}
    >
      <section
        className={styles.stage}
        aria-label="The after-hours room"
        data-beyond-stage
        data-room-ready={sceneRequested && room.arrived ? "true" : undefined}
      >
        <div
          className={styles.posterLayer}
          aria-hidden={sceneRequested && room.arrived}
        >
          {poster}
        </div>

        {sceneRequested ? (
          <m.div
            className={styles.sceneLayer}
            data-room-canvas
            data-room-scene
            initial={{ opacity: 0 }}
            animate={{ opacity: room.arrived ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <SceneErrorBoundary onError={handleSceneError}>
              <RoomCanvas>
                <>
                  <MomentsLayer items={items} />
                  <RoomFirstFrameSignal />
                </>
              </RoomCanvas>
            </SceneErrorBoundary>
            {shouldShowArrival ? (
              <m.span
                className={styles.arrivalSticker}
                aria-hidden="true"
                data-arrival-sticker
                initial={{ y: -210, rotate: -18, scale: 0.72 }}
                animate={{ y: [-210, 20, -17, 0, -6, 0], rotate: [-18, 5, -3, 1, 0] }}
                transition={{
                  y: { type: "spring", stiffness: 220, damping: 11, mass: 0.8 },
                  rotate: { type: "spring", stiffness: 220, damping: 12 },
                }}
              >
                v
              </m.span>
            ) : null}
          </m.div>
        ) : null}

        {gate === "fallback" ? (
          <FallbackDeck items={items} onSelect={selectMoment} />
        ) : null}

        {canEnter && !sceneRequested ? (
          <button
            type="button"
            className={styles.enterButton}
            onClick={requestScene}
          >
            Enter the room
          </button>
        ) : null}

        {gate !== "pending" ? (
          <button
            type="button"
            className={styles.terminalButton}
            onClick={openTerminal}
            data-beyond-terminal-open
            aria-label="Open laptop terminal"
          >
            Open the terminal
          </button>
        ) : null}
      </section>

      <div data-beyond-overlays>
        <MomentsOverlay
          items={items}
          listRequest={listRequest}
          listRef={listRef}
          showListToggle={false}
        />
      </div>
    </div>
  );
}
