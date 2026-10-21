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
import FallbackPostcard from "./FallbackPostcard";
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

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

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

function getFocusLabel(focus: ReturnType<typeof roomStore.get>["focus"]): string | undefined {
  if (!focus) return undefined;
  return focus.type === "laptop" ? "laptop" : `moment:${focus.id}`;
}

export default function BeyondRoomExperience({ items, poster }: BeyondRoomExperienceProps) {
  const reduceMotion = useReducedMotion();
  const room = useRoomState();
  const { intent } = usePortalTransitionContext();
  const [canEnter, setCanEnter] = useState(false);
  const [sceneRequested, setSceneRequested] = useState(false);
  const [momentsOpen, setMomentsOpen] = useState(false);
  const [cameThroughPortal, setCameThroughPortal] = useState(false);
  const listRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
    if (!canUseRoom()) return;

    const idleWindow = window as IdleWindow;
    const enter = () => setSceneRequested(true);

    const canEnterTimerId = window.setTimeout(() => setCanEnter(true), 0);
    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(enter, { timeout: 1800 });
      return () => {
        window.clearTimeout(canEnterTimerId);
        idleWindow.cancelIdleCallback?.(idleId);
      };
    }

    const enterTimerId = window.setTimeout(enter, 450);
    return () => {
      window.clearTimeout(canEnterTimerId);
      window.clearTimeout(enterTimerId);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!sceneRequested || !stage) return;

    roomStore.set({ arrived: false });
    const observer = new MutationObserver(() => {
      if (!stage.querySelector("canvas")) return;
      observer.disconnect();
      roomStore.set({ arrived: true });
    });
    observer.observe(stage, { childList: true, subtree: true });
    if (stage.querySelector("canvas")) {
      observer.disconnect();
      roomStore.set({ arrived: true });
    }

    return () => observer.disconnect();
  }, [sceneRequested]);

  useEffect(() => {
    const openMoments = () => {
      setMomentsOpen(true);
      requestAnimationFrame(() => listRef.current?.focus({ preventScroll: true }));
    };

    window.addEventListener(OPEN_MOMENTS_EVENT, openMoments);
    return () => window.removeEventListener(OPEN_MOMENTS_EVENT, openMoments);
  }, [sceneRequested]);

  const shouldShowArrival =
    sceneRequested && room.arrived && cameThroughPortal && !reduceMotion;

  useEffect(() => {
    if (!shouldShowArrival) return;
    roomStore.set({ mode: "night" });
  }, [shouldShowArrival]);

  const selectMoment = useCallback((item: BeyondAlbumItem, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    roomStore.set({ focus: { type: "moment", id: item.id } });
    if (roomStore.get().soundOn) playRoomSound("paper");
  }, []);

  const handleSceneError = useCallback(() => {
    setSceneRequested(false);
    setCanEnter(false);
    roomStore.set({ arrived: false, focus: null });
  }, []);

  const toggleMoments = () => setMomentsOpen((open) => !open);
  const focusLabel = getFocusLabel(room.focus);

  return (
    <div
      className={styles.experience}
      data-mode={room.mode}
      data-room-focus={focusLabel}
      data-room-arrived={room.arrived ? "true" : "false"}
      data-arrival-origin={cameThroughPortal ? "portal" : "direct"}
      data-scene-active={sceneRequested ? "true" : "false"}
    >
      <section
        className={styles.stage}
        aria-label="The after-hours room"
        ref={(element) => { stageRef.current = element; }}
      >
        <div className={styles.posterLayer} aria-hidden={sceneRequested}>
          {poster}
        </div>
        {sceneRequested ? (
          <m.div
            className={styles.sceneLayer}
            data-room-scene
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <SceneErrorBoundary onError={handleSceneError}>
              <RoomCanvas>
                <MomentsLayer items={items} />
              </RoomCanvas>
            </SceneErrorBoundary>
            {shouldShowArrival ? (
              <m.span
                className={styles.arrivalSticker}
                aria-hidden="true"
                data-arrival-sticker
                initial={{ y: -210, rotate: -18, scale: 0.72 }}
                animate={{ y: [ -210, 20, -17, 0, -6, 0 ], rotate: [ -18, 5, -3, 1, 0 ] }}
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
        {canEnter && !sceneRequested ? (
          <button
            type="button"
            className={styles.enterButton}
            onClick={() => setSceneRequested(true)}
          >
            Enter the room
          </button>
        ) : null}
      </section>

      {!sceneRequested ? (
        <FallbackDeck items={items} onSelect={selectMoment} />
      ) : null}

      <section
        ref={(element) => { listRef.current = element; }}
        id="beyond-moments-list"
        className={`${styles.momentsList} ${sceneRequested && !momentsOpen ? styles.momentsListHidden : ""} ${momentsOpen ? styles.momentsListOpen : ""}`}
        aria-labelledby="beyond-moments-title"
        tabIndex={-1}
        data-moments-list
      >
          <div className={styles.listHeading}>
            <h2 id="beyond-moments-title">Everything in the room</h2>
            {momentsOpen ? (
              <button type="button" onClick={toggleMoments}>
                Close list
              </button>
            ) : null}
          </div>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={(event) => selectMoment(item, event.currentTarget)}
                >
                  <span>{item.kind}</span>
                  <strong>{item.title}</strong>
                </button>
              </li>
            ))}
          </ul>
      </section>

      <div className={styles.overlayMount}>
        <MomentsOverlay items={sceneRequested ? items : []} />
      </div>

      {!sceneRequested ? <FallbackPostcard items={items} triggerRef={triggerRef} /> : null}
    </div>
  );
}

const MomentsOverlay = dynamic(
  () => import("@/components/beyond/room/moments/MomentOverlays"),
  { ssr: false }
);
