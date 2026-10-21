"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { roomStore } from "../room/roomStore";

export default function RoomFirstFrameSignal() {
  const hasSignaled = useRef(false);
  const readyFrame = useRef<number | null>(null);

  useFrame(() => {
    if (hasSignaled.current) return;

    hasSignaled.current = true;
    readyFrame.current = window.requestAnimationFrame(() => {
      readyFrame.current = null;
      roomStore.set({ arrived: true });
    });
  });

  useEffect(
    () => () => {
      if (readyFrame.current !== null) {
        window.cancelAnimationFrame(readyFrame.current);
      }
    },
    []
  );

  return null;
}
