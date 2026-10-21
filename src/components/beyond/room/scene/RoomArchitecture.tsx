"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  Object3D,
  Points,
  PointLight,
  SphereGeometry,
  TorusGeometry,
} from "three";
import type { Vec3 } from "../contracts";
import { RoomExitContext, roomPalette } from "../contracts";
import { roomStore } from "../roomStore";
import { useNightBlend } from "./dayNight";
import { ball, block, box, leafRotation, monsteraLeaf, peg, post, rod, slab } from "./partsKit";
import { fairyBulbPositions, RoomShell } from "./RoomShell";
import { glowTexture, puffTexture, screenTexture } from "./textures";
import type { Part } from "./toon";
import { Toon, lathe } from "./toon";
import { toonRamp } from "./toonRamp";
import { WindowView } from "./WindowView";

const PAPER = roomPalette.paper;
const LEMON = roomPalette.lemon;
const BLUE = roomPalette.poolBlue;
const MINT = roomPalette.mint;
const TANGERINE = roomPalette.tangerine;
const LILAC = roomPalette.lilac;
const INK = roomPalette.ink;
const WHITE = "#FFFFFF";

function toonMaterial(color: string): MeshToonMaterial {
  return new MeshToonMaterial({ color, vertexColors: true, gradientMap: toonRamp });
}

function usePointerCursor() {
  const gl = useThree((state) => state.gl);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    canvasRef.current = gl.domElement;
    return () => { canvasRef.current = null; };
  }, [gl]);
  return (active: boolean) => {
    if (canvasRef.current) canvasRef.current.style.cursor = active ? "pointer" : "default";
  };
}

// ---------------------------------------------------------------------------
// Desk dressing: mug, headphones, sticky notes

function deskItemParts(): Part[] {
  const parts: Part[] = [];
  // Mug at (-1.4, 1.67, -0.45)
  const mug: Vec3 = [-1.4, 1.67, -0.45];
  parts.push({
    geometry: lathe([
      [0, 0], [0.17, 0], [0.22, 0.03], [0.23, 0.12], [0.22, 0.34], [0.2, 0.37],
      [0.17, 0.37], [0.17, 0.08], [0, 0.08],
    ], 14),
    position: mug,
    color: PAPER,
  });
  parts.push({
    geometry: lathe([[0, 0], [0.171, 0], [0.171, 0.012], [0, 0.012]], 14),
    position: [mug[0], mug[1] + 0.27, mug[2]],
    color: "#7B4B2A",
    outline: false,
  });
  parts.push({
    geometry: new TorusGeometry(0.1, 0.034, 5, 10),
    position: [mug[0] + 0.25, mug[1] + 0.19, mug[2]],
    color: PAPER,
  });
  parts.push(post(0.225, 0.225, 0.07, [mug[0], mug[1] + 0.1, mug[2]], TANGERINE, { round: 0.02, outline: false, segments: 14 }));

  // Headphones at (-1.52, 1.67, 0.02), standing on their cups
  const hp: Vec3 = [-1.52, 1.67, 0.02];
  parts.push({ geometry: new TorusGeometry(0.2, 0.035, 5, 12, Math.PI), position: [hp[0], hp[1] + 0.12, hp[2]], color: LEMON });
  for (const side of [-1, 1]) {
    parts.push(post(0.1, 0.1, 0.09, [hp[0] + side * 0.17, hp[1] + 0.02, hp[2]], TANGERINE, { round: 0.03, rotation: [0, 0, side * Math.PI / 2], segments: 10 }));
    parts.push(post(0.075, 0.075, 0.03, [hp[0] + side * 0.255, hp[1] + 0.02, hp[2]], PAPER, { round: 0.01, rotation: [0, 0, side * Math.PI / 2], segments: 10, outline: false }));
  }

  // Sticky notes cluster
  const notes: [string, number, number, number, number][] = [
    [LEMON, 1.68, -0.68, 0.12, 0],
    ["#FFB08A", 1.62, -0.5, -0.3, 0.006],
    [LILAC, 1.74, -0.46, 0.6, 0.012],
  ];
  for (const [color, x, z, yaw, lift] of notes) {
    parts.push(block([0.21, 0.012, 0.21], [x, 1.673 + lift, z], color, [0, yaw, 0]));
  }
  return parts;
}

function ChairParts(): Part[] {
  const seat = "#FFD93E";
  const legColor = "#5B4B86";
  const parts: Part[] = [
    box([1.1, 0.22, 1.0], [0, 0.98, 0], LEMON, { radius: 0.09 }),
    box([0.96, 0.11, 0.86], [0, 1.15, -0.01], TANGERINE, { radius: 0.05 }),
    box([1.1, 0.86, 0.16], [0, 1.53, 0.46], seat, { radius: 0.08 }),
    ball(1, [0, 1.6, 0.575], TANGERINE, { scale: [0.34, 0.27, 0.06], detail: 10 }),
  ];
  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.36, 0.36]) {
      parts.push(peg(0.075, 0.055, 0.88, [x, 0, z], legColor, 7));
    }
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Laptop

function laptopBaseParts(): Part[] {
  const parts: Part[] = [
    box([1.72, 0.1, 0.96], [0, 0.05, 0], PAPER, { radius: 0.045 }),
    slab([1.5, 0.02, 0.74], [0, 0.105, -0.04], "#D6CBFF"),
    slab([0.42, 0.012, 0.2], [0, 0.118, 0.28], "#EDE7FF"),
  ];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      parts.push(slab([0.145, 0.03, 0.11], [-0.63 + column * 0.18, 0.125, -0.26 + row * 0.15], column % 7 === 0 && row === 2 ? MINT : PAPER));
    }
  }
  return parts;
}

function Laptop() {
  const blend = useNightBlend();
  const setCursor = usePointerCursor();
  const screen = useMemo(() => screenTexture(), []);
  const glow = useMemo(() => glowTexture(), []);
  const baseParts = useMemo(() => laptopBaseParts(), []);
  const lidParts = useMemo<Part[]>(() => [box([1.6, 1.05, 0.09], [0, 0, 0], PAPER, { radius: 0.045 })], []);
  const screenMaterial = useRef<MeshBasicMaterial>(null);
  const glowMaterial = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    const night = blend.get();
    if (screenMaterial.current) screenMaterial.current.color.setScalar(0.82 + night * 0.18);
    if (glowMaterial.current) glowMaterial.current.opacity = 0.16 + night * 0.5;
  });

  return (
    <group
      onClick={(event) => { event.stopPropagation(); roomStore.set({ focus: { type: "laptop" } }); }}
      onPointerOver={(event) => { event.stopPropagation(); setCursor(true); }}
      onPointerOut={() => setCursor(false)}
    >
      <Toon parts={baseParts} position={[0, 1.67, -0.25]} />
      <group position={[0, 2.2, -0.64]} rotation={[-0.15, 0, 0]}>
        <Toon parts={lidParts} />
        <mesh position={[0, 0, 0.047]}>
          <planeGeometry args={[1.42, 0.89]} />
          <meshBasicMaterial ref={screenMaterial} map={screen} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.02, 0.2]} renderOrder={3}>
          <planeGeometry args={[2.7, 2.0]} />
          <meshBasicMaterial
            ref={glowMaterial}
            map={glow}
            color="#8FE8FF"
            transparent
            opacity={0.16}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lamp

function Lamp() {
  const blend = useNightBlend();
  const setCursor = usePointerCursor();
  const glow = useMemo(() => glowTexture(), []);
  const lightRef = useRef<PointLight>(null);
  const bulbMaterial = useRef<MeshBasicMaterial>(null);
  const haloMaterial = useRef<MeshBasicMaterial>(null);
  const poolMaterial = useRef<MeshBasicMaterial>(null);
  const dayBulb = useMemo(() => new Color("#C9A24A"), []);
  const nightBulb = useMemo(() => new Color("#FFF1B8"), []);
  const dayShade = useMemo(() => new Color(LEMON), []);
  const nightShade = useMemo(() => new Color("#FFD66E"), []);
  const nightEmissive = useMemo(() => new Color("#FFA640"), []);
  const dayButton = useMemo(() => new Color(PAPER), []);
  const nightButton = useMemo(() => new Color(LEMON), []);

  const shadeMaterial = useMemo(() => toonMaterial(LEMON), []);
  const buttonMaterial = useMemo(() => toonMaterial(PAPER), []);
  const baseParts = useMemo<Part[]>(() => [
    post(0.34, 0.3, 0.1, [0, 0, 0], MINT, { round: 0.04, segments: 12 }),
    peg(0.055, 0.05, 0.64, [0, 0.08, 0], MINT, 8),
    ball(0.075, [0, 0.72, 0], MINT, { detail: 8 }),
  ], []);
  const shadeParts = useMemo<Part[]>(() => [{
    geometry: lathe([[0.48, 0], [0.25, 0.46], [0.19, 0.46], [0.44, 0.03], [0.48, 0]], 16),
    color: WHITE,
  }], []);
  const buttonParts = useMemo<Part[]>(() => [post(0.13, 0.12, 0.08, [0, 0, 0], WHITE, { round: 0.03, segments: 12 })], []);

  useFrame(() => {
    const night = blend.get();
    if (lightRef.current) lightRef.current.intensity = night * 12;
    if (bulbMaterial.current) bulbMaterial.current.color.copy(dayBulb).lerp(nightBulb, night);
    if (haloMaterial.current) haloMaterial.current.opacity = night * 0.7;
    if (poolMaterial.current) poolMaterial.current.opacity = night * 0.5;
    shadeMaterial.color.copy(dayShade).lerp(nightShade, night);
    shadeMaterial.emissive.copy(nightEmissive).multiplyScalar(night * 0.32);
    buttonMaterial.color.copy(dayButton).lerp(nightButton, night);
    buttonMaterial.emissive.copy(nightEmissive).multiplyScalar(night * 0.3);
  });

  const toggle = () => roomStore.set({ mode: roomStore.get().mode === "day" ? "night" : "day" });

  return (
    <group position={[1.28, 1.67, -0.28]}>
      <Toon parts={baseParts} />
      <group position={[0, 0.62, 0]} rotation={[0.14, 0, 0]}>
        <Toon parts={shadeParts} material={shadeMaterial} />
      </group>
      <mesh position={[0, 0.7, 0.02]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshBasicMaterial ref={bulbMaterial} color="#C9A24A" toneMapped={false} />
      </mesh>
      <sprite position={[0, 0.8, 0.14]} scale={[2.7, 2.7, 1]} renderOrder={4}>
        <spriteMaterial
          ref={haloMaterial}
          map={glow}
          color="#FFC36B"
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      <mesh position={[0.05, 0.012, 0.35]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[3.0, 2.0]} />
        <meshBasicMaterial
          ref={poolMaterial}
          map={glow}
          color="#FFB560"
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.05, 0.95]} color="#FFC36B" intensity={0} distance={7} decay={2} />
      <group
        position={[0.44, 0, 0.36]}
        onClick={(event) => { event.stopPropagation(); toggle(); }}
        onPointerOver={(event) => { event.stopPropagation(); setCursor(true); }}
        onPointerOut={() => setCursor(false)}
      >
        <Toon parts={buttonParts} material={buttonMaterial} />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Steam: a few curling puffs above the mug

function Steam() {
  const pointsRef = useRef<Points>(null);
  const texture = useMemo(() => puffTexture(), []);
  const count = 5;
  const geometry = useMemo(() => {
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    result.setAttribute("color", new BufferAttribute(new Float32Array(count * 4).fill(1), 4));
    return result;
  }, []);

  useFrame(({ clock }) => {
    const position = geometry.getAttribute("position") as BufferAttribute;
    const color = geometry.getAttribute("color") as BufferAttribute;
    const time = clock.elapsedTime;
    for (let index = 0; index < count; index += 1) {
      const phase = (time * 0.3 + index / count) % 1;
      const curl = Math.sin(time * 1.1 + index * 1.9 + phase * 5.5);
      position.setXYZ(index, curl * (0.04 + phase * 0.1), phase * 0.78, Math.cos(time * 0.8 + index) * 0.03);
      color.setXYZW(index, 1, 1, 1, Math.sin(phase * Math.PI) * 0.8);
    }
    position.needsUpdate = true;
    color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} position={[-1.4, 2.06, -0.45]} frustumCulled={false} renderOrder={3}>
      <pointsMaterial map={texture} size={0.62} sizeAttenuation vertexColors transparent depthWrite={false} toneMapped={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Plant

function plantPotParts(): Part[] {
  return [
    {
      geometry: lathe([[0, 0], [0.24, 0], [0.3, 0.05], [0.41, 0.58], [0.45, 0.62], [0.45, 0.72], [0.41, 0.74], [0.38, 0.74], [0.38, 0.66], [0, 0.66]], 16),
      color: LEMON,
    },
    {
      geometry: lathe([[0, 0], [0.37, 0], [0.37, 0.012], [0, 0.012]], 14),
      position: [0, 0.6, 0],
      color: "#6B4630",
      outline: false,
    },
  ];
}

function plantLeafParts(): Part[] {
  const parts: Part[] = [];
  const base: Vec3 = [0, 0.64, 0];
  const leaves: { tip: Vec3; yaw: number; tilt: number; size: number; roll: number; color: string }[] = [
    { tip: [-0.2, 1.3, 0.1], yaw: -0.5, tilt: 0.45, size: 1, roll: 0.1, color: MINT },
    { tip: [0.32, 1.5, 0.12], yaw: 0.6, tilt: 0.4, size: 1.05, roll: -0.1, color: "#5CD0A0" },
    { tip: [0.0, 1.85, -0.04], yaw: 0.1, tilt: 0.25, size: 1.0, roll: 0, color: MINT },
    { tip: [-0.44, 1.62, -0.08], yaw: -1.0, tilt: 0.5, size: 0.9, roll: 0.15, color: "#5CD0A0" },
    { tip: [0.5, 1.22, -0.06], yaw: 1.1, tilt: 0.5, size: 0.9, roll: -0.12, color: MINT },
    { tip: [0.12, 1.06, 0.3], yaw: 0.2, tilt: 0.7, size: 0.8, roll: 0, color: "#5CD0A0" },
    { tip: [-0.3, 1.02, 0.25], yaw: -0.5, tilt: 0.6, size: 0.8, roll: 0.1, color: MINT },
  ];
  const leafGeometry = monsteraLeaf(0.62, 0.58);
  for (const leaf of leaves) {
    parts.push(rod(base, leaf.tip, 0.028, "#4FC795"));
    parts.push({
      geometry: leafGeometry,
      position: leaf.tip,
      rotation: leafRotation(leaf.yaw, leaf.tilt, leaf.roll),
      scale: [leaf.size, leaf.size, leaf.size],
      color: leaf.color,
    });
  }
  return parts;
}

function Plant() {
  const leavesRef = useRef<Group>(null);
  const potParts = useMemo(() => plantPotParts(), []);
  const leafParts = useMemo(() => plantLeafParts(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (leavesRef.current) {
      leavesRef.current.rotation.z = Math.sin(t * 0.7) * 0.03;
      leavesRef.current.rotation.x = Math.sin(t * 0.52 + 1.3) * 0.02;
    }
  });

  return (
    <group position={[-3.23, 0, 1.3]}>
      <Toon parts={potParts} />
      <group ref={leavesRef}>
        <Toon parts={leafParts} />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Sleeping cat on the rug

function catParts(): Part[] {
  const fur = "#FFAF6B";
  const dark = TANGERINE;
  const cream = PAPER;
  return [
    { geometry: new SphereGeometry(1, 12, 8), position: [0, 0.22, 0], scale: [0.52, 0.25, 0.33], color: fur },
    { geometry: new SphereGeometry(1, 10, 7), position: [0.48, 0.25, 0], scale: [0.22, 0.2, 0.21], color: fur },
    { geometry: new SphereGeometry(1, 8, 6), position: [0.64, 0.19, 0], scale: [0.1, 0.07, 0.1], color: cream, outline: false },
    { geometry: new SphereGeometry(1, 6, 5), position: [0.725, 0.215, 0], scale: [0.025, 0.02, 0.03], color: roomPalette.ink, outline: false },
    { geometry: new SphereGeometry(1, 6, 5), position: [0.66, 0.285, 0.085], scale: [0.02, 0.026, 0.026], color: roomPalette.ink, outline: false },
    { geometry: new SphereGeometry(1, 6, 5), position: [0.66, 0.285, -0.085], scale: [0.02, 0.026, 0.026], color: roomPalette.ink, outline: false },
    { geometry: new ConeGeometry(0.07, 0.15, 4), position: [0.46, 0.46, 0.13], rotation: [0.2, 0, -0.1], color: dark },
    { geometry: new ConeGeometry(0.07, 0.15, 4), position: [0.46, 0.46, -0.13], rotation: [-0.2, 0, -0.1], color: dark },
    { geometry: new SphereGeometry(1, 10, 6), position: [0.1, 0.3, 0], scale: [0.34, 0.12, 0.3], color: dark, outline: false },
    {
      geometry: new TorusGeometry(0.3, 0.055, 5, 10, Math.PI * 1.1),
      position: [-0.42, 0.075, 0.06],
      rotation: [-Math.PI / 2, 0, 0.2],
      color: fur,
    },
  ];
}

function Cat() {
  const parts = useMemo(() => catParts(), []);
  const groupRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 1.7) * 0.035;
  });
  return (
    <group ref={groupRef} position={[1.5, 0.004, 1.3]} rotation={[0, -0.75, 0]}>
      <Toon parts={parts} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Fairy lights: instanced bulbs + soft additive halos that twinkle at night

function FairyLights() {
  const blend = useNightBlend();
  const meshRef = useRef<InstancedMesh>(null);
  const haloRef = useRef<BufferGeometry>(null);
  const glow = useMemo(() => glowTexture(), []);
  const positions = useMemo(() => fairyBulbPositions(), []);
  const palette = useMemo(() => [TANGERINE, LEMON, BLUE, MINT, LILAC, "#FF8FB8"].map((hex) => new Color(hex)), []);
  const geometry = useMemo(() => new IcosahedronGeometry(0.06, 0), []);
  const object = useMemo(() => new Object3D(), []);
  const scratch = useMemo(() => new Color(), []);
  const white = useMemo(() => new Color("#FFF6DA"), []);
  const haloColors = useMemo(() => new Float32Array(positions.length * 4), [positions]);
  const haloPositions = useMemo(() => new Float32Array(positions.flat()), [positions]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    positions.forEach((position, index) => {
      object.position.set(...position);
      object.updateMatrix();
      mesh.setMatrixAt(index, object.matrix);
      mesh.setColorAt(index, palette[index % palette.length]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [object, palette, positions]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const halo = haloRef.current?.getAttribute("color") as BufferAttribute | undefined;
    if (!mesh) return;
    const night = blend.get();
    const t = clock.elapsedTime;
    positions.forEach((_, index) => {
      const twinkle = 0.78 + 0.22 * Math.sin(t * (1.3 + (index % 5) * 0.23) + index * 1.9);
      scratch.copy(palette[index % palette.length]).multiplyScalar(0.88).lerp(white, night * 0.38 * twinkle);
      mesh.setColorAt(index, scratch);
      const base = palette[index % palette.length];
      haloColors[index * 4] = base.r;
      haloColors[index * 4 + 1] = base.g;
      haloColors[index * 4 + 2] = base.b;
      haloColors[index * 4 + 3] = night * 0.8 * twinkle;
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (halo) {
      (halo.array as Float32Array).set(haloColors);
      halo.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geometry, undefined, positions.length]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <points frustumCulled={false} renderOrder={4}>
        <bufferGeometry ref={haloRef}>
          <bufferAttribute attach="attributes-position" args={[haloPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[haloColors, 4]} />
        </bufferGeometry>
        <pointsMaterial map={glow} size={0.8} sizeAttenuation vertexColors transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </points>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Door

function Door() {
  const exitRoom = useContext(RoomExitContext);
  const setCursor = usePointerCursor();
  const signMaterialRef = useRef<MeshBasicMaterial>(null);
  const signTextureRef = useRef<CanvasTexture | null>(null);
  const parts = useMemo<Part[]>(() => {
    const doorMint = "#6FD9AB";
    return [
      box([0.16, 3.98, 0.16], [2.5, 1.99, -2.67], PAPER, { radius: 0.05 }),
      box([0.16, 3.98, 0.16], [4.06, 1.99, -2.67], PAPER, { radius: 0.05 }),
      box([1.72, 0.16, 0.16], [3.28, 4.0, -2.67], PAPER, { radius: 0.05 }),
      box([1.4, 3.84, 0.1], [3.28, 1.96, -2.71], doorMint, { radius: 0.05, bevel: 2 }),
      block([1.04, 1.4, 0.04], [3.28, 2.78, -2.64], "#8BE6BE"),
      block([1.04, 1.1, 0.04], [3.28, 1.12, -2.64], "#8BE6BE"),
      ball(0.1, [3.86, 1.9, -2.6], LEMON, { detail: 10 }),
    ];
  }, []);
  const signParts = useMemo<Part[]>(() => [
    box([1.18, 0.4, 0.06], [3.28, 3.3, -2.58], LEMON, { radius: 0.05 }),
  ], []);

  useEffect(() => {
    let disposed = false;
    const renderSign = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 176;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = PAPER;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = INK;
      context.font = '700 62px "Bricolage Grotesque", sans-serif';
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Back to work", canvas.width / 2, canvas.height / 2 + 2);
      const texture = new CanvasTexture(canvas);
      signTextureRef.current = texture;
      if (signMaterialRef.current) {
        signMaterialRef.current.map = texture;
        signMaterialRef.current.needsUpdate = true;
      }
    };
    void document.fonts.ready.then(renderSign);
    return () => {
      disposed = true;
      signTextureRef.current?.dispose();
      signTextureRef.current = null;
    };
  }, []);

  return (
    <group
      onClick={(event) => { event.stopPropagation(); exitRoom(); }}
      onPointerOver={(event) => { event.stopPropagation(); setCursor(true); }}
      onPointerOut={() => setCursor(false)}
    >
      <Toon parts={parts} />
      <Toon parts={signParts} />
      <mesh position={[3.28, 3.3, -2.546]}>
        <planeGeometry args={[1.08, 0.32]} />
        <meshBasicMaterial ref={signMaterialRef} color={PAPER} toneMapped={false} side={DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------

function CursorLight() {
  const lightRef = useRef<PointLight>(null);
  const activeRef = useRef(false);
  const position = useMemo(() => new Object3D(), []);
  const pointer = useThree((state) => state.pointer);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { activeRef.current = fine.matches && !reduced.matches; };
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useFrame(() => {
    const light = lightRef.current;
    if (!light) return;
    light.intensity = activeRef.current ? 1.4 : 0;
    position.position.set(pointer.x * 3.35, 2.6 + pointer.y * 1.2, 0.75);
    light.position.lerp(position.position, 0.12);
  });

  return <pointLight ref={lightRef} color={BLUE} intensity={0} distance={3.2} decay={2} />;
}

export function RoomArchitecture() {
  const deskParts = useMemo(() => deskItemParts(), []);
  const chairParts = useMemo(() => ChairParts(), []);

  return (
    <group>
      <RoomShell />
      <WindowView />
      <Toon parts={deskParts} />
      <Toon parts={chairParts} position={[-0.55, 0, 1.35]} rotation={[0, 0.3, 0]} />
      <Laptop />
      <Lamp />
      <Steam />
      <Plant />
      <Cat />
      <FairyLights />
      <Door />
      <CursorLight />
    </group>
  );
}
