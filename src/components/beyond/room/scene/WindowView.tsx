"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Group, InstancedMesh, MeshBasicMaterial, Object3D, PlaneGeometry, Shape, ShapeGeometry } from "three";
import { roomPalette } from "../contracts";
import type { BoxInstance } from "./primitives";
import { useNightBlend } from "./dayNight";
import { InstancedBoxes, InkBox } from "./primitives";

const WINDOW_WIDTH = 4.4;
const WINDOW_HEIGHT = 2.35;
const WINDOW_Z = -2.56;

function hillGeometry(width: number, height: number, peak: number): ShapeGeometry {
  const shape = new Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(-width / 2, -height * 0.05);
  shape.quadraticCurveTo(-width * 0.3, height * 0.18, -width * 0.08, height * 0.05);
  shape.quadraticCurveTo(width * 0.12, -height * 0.06, peak, height * 0.32);
  shape.quadraticCurveTo(width * 0.31, height * 0.12, width / 2, height * 0.04);
  shape.lineTo(width / 2, -height / 2);
  shape.closePath();
  return new ShapeGeometry(shape, 1);
}

function cloudGeometry(width: number, height: number): ShapeGeometry {
  const shape = new Shape();
  shape.moveTo(-width / 2, -height * 0.12);
  shape.quadraticCurveTo(-width * 0.42, height * 0.22, -width * 0.28, height * 0.24);
  shape.quadraticCurveTo(-width * 0.18, height * 0.53, width * 0.02, height * 0.28);
  shape.quadraticCurveTo(width * 0.23, height * 0.43, width * 0.31, height * 0.14);
  shape.quadraticCurveTo(width * 0.53, height * 0.12, width / 2, -height * 0.12);
  shape.lineTo(-width / 2, -height * 0.12);
  shape.closePath();
  return new ShapeGeometry(shape, 1);
}

function WindowSky() {
  const blend = useNightBlend();
  const materialRef = useRef<MeshBasicMaterial>(null);
  const dayColor = useMemo(() => new Color("#9AD8E8"), []);
  const nightColor = useMemo(() => new Color(roomPalette.night), []);
  const materialColor = useMemo(() => new Color(), []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.color.copy(materialColor.lerpColors(dayColor, nightColor, blend.get()));
    }
  });

  return (
    <mesh position={[-0.15, 3.3, WINDOW_Z]}>
      <planeGeometry args={[WINDOW_WIDTH, WINDOW_HEIGHT]} />
      <meshBasicMaterial ref={materialRef} color="#9AD8E8" toneMapped={false} />
    </mesh>
  );
}

function Hills() {
  const blend = useNightBlend();
  const frontRef = useRef<MeshBasicMaterial>(null);
  const rearRef = useRef<MeshBasicMaterial>(null);
  const frontDay = useMemo(() => new Color("#557C78"), []);
  const rearDay = useMemo(() => new Color("#73978A"), []);
  const night = useMemo(() => new Color("#292744"), []);
  const scratch = useMemo(() => new Color(), []);
  const frontGeometry = useMemo(() => hillGeometry(4.4, 1.7, -0.35), []);
  const rearGeometry = useMemo(() => hillGeometry(4.4, 1.15, 0.62), []);

  useFrame(() => {
    if (frontRef.current) frontRef.current.color.copy(scratch.lerpColors(frontDay, night, blend.get()));
    if (rearRef.current) rearRef.current.color.copy(scratch.lerpColors(rearDay, night, blend.get()));
  });

  return (
    <group position={[-0.15, 3.12, WINDOW_Z + 0.018]}>
      <mesh position={[0, 0.08, -0.008]} geometry={rearGeometry}>
        <meshBasicMaterial ref={rearRef} color="#73978A" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.14, 0.002]} geometry={frontGeometry}>
        <meshBasicMaterial ref={frontRef} color="#557C78" toneMapped={false} />
      </mesh>
    </group>
  );
}

function FogLayer({
  position,
  width,
  height,
  speed,
  offset,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  speed: number;
  offset: number;
}) {
  const groupRef = useRef<Group>(null);
  const geometry = useMemo(() => cloudGeometry(width, height), [height, width]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const travel = (clock.elapsedTime * speed + offset) % 1;
    groupRef.current.position.x = position[0] - width * 0.34 + travel * width * 0.68;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={roomPalette.paper} transparent opacity={0.34} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function NightWindows() {
  const blend = useNightBlend();
  const meshRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);
  const geometry = useMemo(() => new PlaneGeometry(0.11, 0.08), []);
  const object = useMemo(() => new Object3D(), []);
  const lights = useMemo(() => [
    [-1.82, 2.7, 0], [-1.36, 2.52, 0], [-0.44, 2.68, 0], [0.65, 2.49, 0],
    [1.21, 2.77, 0], [1.82, 2.58, 0], [-0.91, 2.82, 0], [0.16, 2.86, 0],
  ] as const, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    lights.forEach((position, index) => {
      object.position.set(position[0], position[1], position[2]);
      object.updateMatrix();
      mesh.setMatrixAt(index, object.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [lights, object]);

  useFrame(() => {
    if (materialRef.current) materialRef.current.opacity = blend.get() * 0.94;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, lights.length]} position={[-0.15, 0, WINDOW_Z + 0.035]}>
      <meshBasicMaterial ref={materialRef} color={roomPalette.lemon} transparent opacity={0} toneMapped={false} />
    </instancedMesh>
  );
}

export function WindowView() {
  const frame = useMemo<BoxInstance[]>(() => [
    { position: [-0.15, 4.48, -2.5], size: [4.66, 0.12, 0.14] },
    { position: [-0.15, 2.12, -2.5], size: [4.66, 0.16, 0.18] },
    { position: [-2.44, 3.3, -2.5], size: [0.13, 2.5, 0.14] },
    { position: [2.14, 3.3, -2.5], size: [0.13, 2.5, 0.14] },
    { position: [-0.15, 3.3, -2.48], size: [0.09, 2.34, 0.13] },
  ], []);

  return (
    <group>
      <WindowSky />
      <Hills />
      <FogLayer position={[-0.35, 3.4, WINDOW_Z + 0.025]} width={3.2} height={0.58} speed={0.023} offset={0.1} />
      <FogLayer position={[0.55, 2.95, WINDOW_Z + 0.03]} width={3.8} height={0.44} speed={0.017} offset={0.62} />
      <NightWindows />
      <InstancedBoxes instances={[...frame]} color={roomPalette.poolBlue} outlined />
      <InkBox position={[-0.15, 2.06, -2.43]} size={[4.9, 0.16, 0.32]} color={roomPalette.poolBlue} outlined />
    </group>
  );
}
