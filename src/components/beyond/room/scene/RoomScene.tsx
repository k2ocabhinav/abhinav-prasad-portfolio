"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, DirectionalLight, HemisphereLight, SRGBColorSpace } from "three";
import { useRoomState } from "../roomStore";
import { Backdrop } from "./Backdrop";
import { BakedShadow } from "./bakedShadow";
import { NightBlendContext, roomNightBlend } from "./dayNight";
import { RoomArchitecture } from "./RoomArchitecture";
import { useGradientTexture } from "./textures";
import { OutlineScaler } from "./toon";

interface ModeTransition {
  from: number;
  to: number;
  startedAt: number;
}

const TRANSITION_SECONDS = 0.6;

// Backdrop gradient stops (top, middle, bottom).
const SKY_DAY = ["#D3C6FF", "#FFD2E0", "#FFE6BE"];
const SKY_NIGHT = ["#0E0C33", "#241B58", "#4E3189"];

export function RoomScene() {
  const { mode } = useRoomState();
  const { clock, invalidate } = useThree();
  const transition = useRef<ModeTransition | null>(null);
  const hemisphereRef = useRef<HemisphereLight>(null);
  const keyRef = useRef<DirectionalLight>(null);
  const paintedBlend = useRef(-1);
  const { texture: background, paint } = useGradientTexture(256);
  const dayStops = useMemo(() => SKY_DAY.map((hex) => new Color(hex)), []);
  const nightStops = useMemo(() => SKY_NIGHT.map((hex) => new Color(hex)), []);
  const scratch = useMemo(() => new Color(), []);

  const dayHemisphere = useMemo(() => new Color("#FFFFFF"), []);
  const nightHemisphere = useMemo(() => new Color("#B7B7FF"), []);
  const dayGround = useMemo(() => new Color("#FFE0C4"), []);
  const nightGround = useMemo(() => new Color("#B58CEB"), []);
  const dayKey = useMemo(() => new Color("#FFF1DA"), []);
  const nightKey = useMemo(() => new Color("#A9B6FF"), []);

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
      const progress = Math.min(1, (state.clock.elapsedTime - activeTransition.startedAt) / TRANSITION_SECONDS);
      const eased = progress * progress * (3 - 2 * progress);
      roomNightBlend.set(activeTransition.from + (activeTransition.to - activeTransition.from) * eased);
      if (progress >= 1) transition.current = null;
      else state.invalidate();
    }

    const blend = roomNightBlend.get();
    if (Math.abs(blend - paintedBlend.current) > 0.002) {
      paintedBlend.current = blend;
      paint([0, 0.55, 1].map((stop, index) => {
        scratch.copy(dayStops[index]).lerp(nightStops[index], blend);
        return [stop, `#${scratch.getHexString(SRGBColorSpace)}`] as [number, string];
      }));
    }

    if (hemisphereRef.current) {
      hemisphereRef.current.intensity = 2.15 - blend * 0.65;
      hemisphereRef.current.color.lerpColors(dayHemisphere, nightHemisphere, blend);
      hemisphereRef.current.groundColor.lerpColors(dayGround, nightGround, blend);
    }
    if (keyRef.current) {
      keyRef.current.intensity = 1.1 - blend * 0.45;
      keyRef.current.color.lerpColors(dayKey, nightKey, blend);
    }
  });

  return (
    <NightBlendContext.Provider value={roomNightBlend}>
      <primitive object={background} attach="background" />
      <hemisphereLight ref={hemisphereRef} args={["#FFFFFF", "#FFE0C4", 2.15]} />
      <directionalLight ref={keyRef} position={[3.5, 8, 6]} color="#FFF1DA" intensity={1.1} />
      <OutlineScaler />
      <Backdrop />
      <BakedShadow />
      <RoomArchitecture />
    </NightBlendContext.Provider>
  );
}
