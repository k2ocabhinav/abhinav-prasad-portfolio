"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, DirectionalLight, HemisphereLight } from "three";
import { useRoomState } from "../roomStore";
import { NightBlendContext, roomNightBlend } from "./dayNight";
import { RoomArchitecture } from "./RoomArchitecture";

interface ModeTransition {
  from: number;
  to: number;
  startedAt: number;
}

export function RoomScene() {
  const { mode } = useRoomState();
  const { clock, invalidate, scene } = useThree();
  const transition = useRef<ModeTransition | null>(null);
  const hemisphereRef = useRef<HemisphereLight>(null);
  const sunRef = useRef<DirectionalLight>(null);
  const dayBackground = useMemo(() => new Color("#93CEE0"), []);
  const nightBackground = useMemo(() => new Color("#1B1838"), []);
  const backgroundScratch = useMemo(() => new Color(), []);
  const dayHemisphere = useMemo(() => new Color("#FFF8EC"), []);
  const nightHemisphere = useMemo(() => new Color("#A0A9E7"), []);
  const dayGround = useMemo(() => new Color("#7B563F"), []);
  const nightGround = useMemo(() => new Color("#292744"), []);
  const daySun = useMemo(() => new Color("#FFF0D1"), []);
  const nightSun = useMemo(() => new Color("#9BAEFF"), []);

  useEffect(() => {
    const target = mode === "night" ? 1 : 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      roomNightBlend.set(target);
      transition.current = null;
    } else {
      transition.current = {
        from: roomNightBlend.get(),
        to: target,
        startedAt: clock.elapsedTime,
      };
    }
    invalidate();
  }, [clock, invalidate, mode]);

  useFrame((state) => {
    const activeTransition = transition.current;
    if (activeTransition) {
      const progress = Math.min(1, (state.clock.elapsedTime - activeTransition.startedAt) / 0.6);
      const eased = progress * progress * (3 - 2 * progress);
      roomNightBlend.set(activeTransition.from + (activeTransition.to - activeTransition.from) * eased);
      if (progress >= 1) transition.current = null;
    }

    const blend = roomNightBlend.get();
    if (scene.background instanceof Color) {
      scene.background.copy(backgroundScratch.lerpColors(dayBackground, nightBackground, blend));
    }
    if (hemisphereRef.current) {
      hemisphereRef.current.intensity = 1.1 - blend * 0.4;
      hemisphereRef.current.color.lerpColors(dayHemisphere, nightHemisphere, blend);
      hemisphereRef.current.groundColor.lerpColors(dayGround, nightGround, blend);
    }
    if (sunRef.current) {
      sunRef.current.intensity = 2.15 - blend * 1.45;
      sunRef.current.color.lerpColors(daySun, nightSun, blend);
    }
  });

  return (
    <NightBlendContext.Provider value={roomNightBlend}>
      <color attach="background" args={["#93CEE0"]} />
      <hemisphereLight ref={hemisphereRef} args={["#FFF8EC", "#7B563F", 0.8]} />
      <directionalLight ref={sunRef} position={[-3, 7, 5]} color="#FFF0D1" intensity={1.85} />
      <RoomArchitecture />
    </NightBlendContext.Provider>
  );
}
