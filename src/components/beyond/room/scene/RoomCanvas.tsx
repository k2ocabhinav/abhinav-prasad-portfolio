"use client";
// STUB (track T1 replaces this file): the room canvas. Renders the moments
// layer as children inside a <Canvas> and provides the room contexts.
import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import { CameraRigContext, RoomAnchorsContext } from "../contracts";

export default function RoomCanvas({ children }: { children?: ReactNode }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [6, 5, 8], fov: 35 }} frameloop="demand">
      <RoomAnchorsContext.Provider value={[]}>
        <CameraRigContext.Provider value={{ focus: () => {}, reset: () => {} }}>
          <ambientLight intensity={1} />
          {children}
        </CameraRigContext.Provider>
      </RoomAnchorsContext.Provider>
    </Canvas>
  );
}
