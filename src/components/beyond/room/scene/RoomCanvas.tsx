"use client";

import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { CAMERA_FOV, CameraRig } from "./cameraRig";
import { roomAnchors } from "./roomAnchors";
import { RoomScene } from "./RoomScene";
import { RoomAnchorsContext } from "../contracts";

export default function RoomCanvas({ children }: { children?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    let inView = false;

    const update = () => {
      setRunning(inView && document.visibilityState === "visible" && !reducedMotion.matches);
      setMobile(mobileQuery.matches);
    };
    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => {
          inView = entry?.isIntersecting ?? false;
          update();
        });

    mobileQuery.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    if (observer) observer.observe(container);
    else inView = true;
    update();

    return () => {
      observer?.disconnect();
      mobileQuery.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Canvas
        dpr={[1, mobile ? 1.5 : 1.75]}
        flat
        camera={{ position: [8.2, 6.4, 10.5], fov: CAMERA_FOV, near: 0.1, far: 80 }}
        frameloop={running ? "always" : "demand"}
        gl={{ antialias: true, alpha: false, stencil: true, powerPreference: "high-performance" }}
      >
        <RoomAnchorsContext.Provider value={roomAnchors}>
          <CameraRig>
            <RoomScene />
            {children}
          </CameraRig>
        </RoomAnchorsContext.Provider>
      </Canvas>
    </div>
  );
}
