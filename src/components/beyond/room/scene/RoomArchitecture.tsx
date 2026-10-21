"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, Color, Group, InstancedMesh, MeshBasicMaterial, MeshToonMaterial, Object3D, PointLight, SphereGeometry } from "three";
import { roomPalette } from "../contracts";
import { roomStore } from "../roomStore";
import { useNightBlend } from "./dayNight";
import { InstancedBoxes, InkBox } from "./primitives";
import type { BoxInstance } from "./primitives";
import { BakedShadow } from "./bakedShadow";
import { toonRamp } from "./toonRamp";
import { WindowView } from "./WindowView";

function LampSwitch() {
  const { gl } = useThree();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blend = useNightBlend();
  const ref = useRef<MeshToonMaterial>(null);
  const dayColor = useMemo(() => new Color(roomPalette.paper), []);
  const nightColor = useMemo(() => new Color(roomPalette.lemon), []);

  useFrame(() => {
    ref.current?.color.copy(dayColor).lerp(nightColor, blend.get());
  });

  const toggle = () => roomStore.set({ mode: roomStore.get().mode === "day" ? "night" : "day" });
  useEffect(() => {
    canvasRef.current = gl.domElement;
    return () => { canvasRef.current = null; };
  }, [gl]);
  const enter = () => { if (canvasRef.current) canvasRef.current.style.cursor = "pointer"; };
  const leave = () => { if (canvasRef.current) canvasRef.current.style.cursor = "default"; };

  return (
    <mesh
      position={[1.72, 1.72, 0.08]}
      onClick={(event) => { event.stopPropagation(); toggle(); }}
      onPointerOver={(event) => { event.stopPropagation(); enter(); }}
      onPointerOut={leave}
    >
      <sphereGeometry args={[0.115, 12, 8]} />
      <meshToonMaterial ref={ref} color={roomPalette.paper} gradientMap={toonRamp} />
    </mesh>
  );
}

function Lamp() {
  const blend = useNightBlend();
  const lightRef = useRef<PointLight>(null);

  useFrame(() => {
    if (lightRef.current) lightRef.current.intensity = blend.get() * 30;
  });

  return (
    <group>
      <mesh position={[1.28, 1.72, -0.28]}>
        <cylinderGeometry args={[0.32, 0.38, 0.12, 10]} />
        <meshToonMaterial color={roomPalette.poolBlue} gradientMap={toonRamp} />
      </mesh>
      <mesh position={[1.28, 2.08, -0.28]}>
        <cylinderGeometry args={[0.075, 0.095, 0.65, 8]} />
        <meshToonMaterial color={roomPalette.ink} gradientMap={toonRamp} />
      </mesh>
      <mesh position={[1.28, 2.47, -0.28]} rotation={[0.16, 0, 0]}>
        <cylinderGeometry args={[0.27, 0.46, 0.5, 10, 1, true]} />
        <meshToonMaterial color={roomPalette.lemon} gradientMap={toonRamp} side={2} />
      </mesh>
      <LampBulb />
      <pointLight ref={lightRef} position={[1.28, 2.2, 0.08]} color="#FFC36B" intensity={0} distance={6.5} decay={2} />
      <LampSwitch />
    </group>
  );
}

function LampBulb() {
  const blend = useNightBlend();
  const materialRef = useRef<MeshBasicMaterial>(null);
  const dayColor = useMemo(() => new Color("#A88F53"), []);
  const nightColor = useMemo(() => new Color("#FFF0B4"), []);

  useFrame(() => {
    materialRef.current?.color.copy(dayColor).lerp(nightColor, blend.get());
  });

  return (
    <mesh position={[1.28, 2.23, 0.02]}>
      <sphereGeometry args={[0.1, 10, 8]} />
      <meshBasicMaterial ref={materialRef} color="#A88F53" toneMapped={false} />
    </mesh>
  );
}

function Steam() {
  const meshRef = useRef<InstancedMesh>(null);
  const object = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => new SphereGeometry(0.045, 7, 5), []);
  const material = useMemo(() => new MeshToonMaterial({
    color: roomPalette.paper,
    gradientMap: toonRamp,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const time = clock.elapsedTime;
    for (let index = 0; index < 4; index += 1) {
      const phase = (time * 0.42 + index * 0.25) % 1;
      object.position.set(
        Math.sin(time * 0.85 + index * 1.7) * (0.07 + phase * 0.11),
        phase * 0.66,
        Math.cos(time * 0.65 + index) * 0.035,
      );
      object.scale.setScalar(0.45 + phase * 0.7);
      object.updateMatrix();
      mesh.setMatrixAt(index, object.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, 4]} position={[-1.24, 1.86, 0.12]}>
    </instancedMesh>
  );
}

function Plant() {
  const leavesRef = useRef<Group>(null);
  const leafPositions = useMemo<BoxInstance[]>(() => [
    { position: [-0.11, 1.02, 0.03], size: [0.2, 0.78, 0.13], rotation: [0, 0, -0.54] },
    { position: [0.2, 1.04, 0.03], size: [0.2, 0.84, 0.13], rotation: [0, 0, 0.44] },
    { position: [-0.01, 1.22, 0.04], size: [0.18, 0.72, 0.12], rotation: [0, 0, -0.1] },
    { position: [-0.19, 1.19, -0.03], size: [0.17, 0.67, 0.12], rotation: [0, 0, -0.82] },
    { position: [0.25, 1.2, -0.03], size: [0.17, 0.7, 0.12], rotation: [0, 0, 0.84] },
    { position: [-0.01, 1.48, -0.05], size: [0.16, 0.65, 0.1], rotation: [0, 0, 0.05] },
  ], []);

  useFrame(({ clock }) => {
    if (leavesRef.current) leavesRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.65) * 0.035;
  });

  return (
    <group>
      <mesh position={[-3.23, 0.39, 1.3]}>
        <cylinderGeometry args={[0.38, 0.28, 0.67, 9]} />
        <meshToonMaterial color={roomPalette.lemon} gradientMap={toonRamp} />
      </mesh>
      <mesh position={[-3.23, 0.74, 1.3]}>
        <cylinderGeometry args={[0.29, 0.29, 0.07, 9]} />
        <meshToonMaterial color={roomPalette.ink} gradientMap={toonRamp} />
      </mesh>
      <group ref={leavesRef} position={[-3.23, 0, 1.3]}>
        <InstancedBoxes instances={[...leafPositions]} color={roomPalette.mint} outlined />
      </group>
    </group>
  );
}

function CursorLight() {
  const lightRef = useRef<PointLight>(null);
  const activeRef = useRef(false);
  const position = useMemo(() => new Object3D(), []);
  const { pointer } = useThree();

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
    light.intensity = activeRef.current ? 0.24 : 0;
    position.position.set(pointer.x * 3.35, 2.6 + pointer.y * 1.2, 0.75);
    light.position.lerp(position.position, 0.12);
  });

  return <pointLight ref={lightRef} color={roomPalette.poolBlue} intensity={0} distance={2.8} decay={2} />;
}

function Laptop() {
  const { gl } = useThree();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    canvasRef.current = gl.domElement;
    return () => { canvasRef.current = null; };
  }, [gl]);
  const hover = (active: boolean) => {
    if (canvasRef.current) canvasRef.current.style.cursor = active ? "pointer" : "default";
  };

  return (
    <group
      onClick={(event) => { event.stopPropagation(); roomStore.set({ focus: { type: "laptop" } }); }}
      onPointerOver={(event) => { event.stopPropagation(); hover(true); }}
      onPointerOut={() => hover(false)}
    >
      <InkBox position={[0, 1.69, -0.25]} size={[1.72, 0.1, 0.96]} color={roomPalette.ink} />
      <InkBox position={[0, 1.755, -0.19]} size={[1.4, 0.025, 0.69]} color="#343245" radius={0.025} />
      <InstancedBoxes
        color={roomPalette.poolBlue}
        instances={Array.from({ length: 21 }, (_, index) => ({
          position: [-0.57 + (index % 7) * 0.19, 1.777, -0.42 + Math.floor(index / 7) * 0.16],
          size: [0.12, 0.018, 0.09],
        }))}
      />
      <InkBox position={[0, 2.2, -0.64]} size={[1.6, 1.05, 0.09]} color={roomPalette.ink} rotation={[-0.15, 0, 0]} outlined />
      <InkBox position={[0, 2.2, -0.575]} size={[1.37, 0.83, 0.02]} color="#263449" rotation={[-0.15, 0, 0]} radius={0.018} />
      <group position={[0, 2.2, -0.55]} rotation={[-0.15, 0, 0]}>
        <InstancedBoxes
          color={roomPalette.mint}
          instances={[
            { position: [-0.45, 0.27, 0], size: [0.56, 0.025, 0.012] },
            { position: [-0.26, 0.14, 0], size: [0.94, 0.025, 0.012] },
            { position: [-0.36, 0.01, 0], size: [0.74, 0.025, 0.012] },
            { position: [-0.23, -0.12, 0], size: [1, 0.025, 0.012] },
            { position: [-0.36, -0.25, 0], size: [0.74, 0.025, 0.012] },
          ]}
        />
      </group>
    </group>
  );
}

function Mug() {
  return (
    <group>
      <mesh position={[-1.24, 1.88, 0.12]}>
        <cylinderGeometry args={[0.2, 0.24, 0.36, 10]} />
        <meshToonMaterial color={roomPalette.paper} gradientMap={toonRamp} />
      </mesh>
      <mesh position={[-1.02, 1.89, 0.12]}>
        <torusGeometry args={[0.15, 0.04, 7, 12]} />
        <meshToonMaterial color={roomPalette.paper} gradientMap={toonRamp} />
      </mesh>
      <Steam />
    </group>
  );
}

function Door() {
  const router = useRouter();
  const { gl } = useThree();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signMaterialRef = useRef<MeshBasicMaterial>(null);
  const signTextureRef = useRef<CanvasTexture | null>(null);

  useEffect(() => {
    canvasRef.current = gl.domElement;
    return () => { canvasRef.current = null; };
  }, [gl]);

  useEffect(() => {
    let disposed = false;
    const renderSign = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 176;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = roomPalette.paper;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = roomPalette.ink;
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
      onClick={(event) => { event.stopPropagation(); router.push("/"); }}
      onPointerOver={(event) => {
        event.stopPropagation();
        if (canvasRef.current) canvasRef.current.style.cursor = "pointer";
      }}
      onPointerOut={() => { if (canvasRef.current) canvasRef.current.style.cursor = "default"; }}
    >
      <InkBox position={[3.28, 1.94, -2.65]} size={[1.48, 3.78, 0.18]} color={roomPalette.mint} outlined />
      <InkBox position={[3.28, 1.95, -2.53]} size={[1.22, 3.5, 0.1]} color={roomPalette.lilac} />
      <mesh position={[3.78, 1.93, -2.44]}>
        <sphereGeometry args={[0.085, 10, 8]} />
        <meshToonMaterial color={roomPalette.lemon} gradientMap={toonRamp} />
      </mesh>
      <InkBox position={[3.28, 3.4, -2.48]} size={[1.26, 0.42, 0.08]} color={roomPalette.paper} outlined />
      <mesh position={[3.28, 3.4, -2.427]}>
        <planeGeometry args={[1.17, 0.36]} />
        <meshBasicMaterial ref={signMaterialRef} color={roomPalette.paper} toneMapped={false} />
      </mesh>
    </group>
  );
}

function RoomObjects() {
  const boardFrame = useMemo<BoxInstance[]>(() => [
    { position: [-3.3, 4.03, -2.5], size: [1.62, 0.12, 0.14] },
    { position: [-3.3, 2.27, -2.5], size: [1.62, 0.12, 0.14] },
    { position: [-4.11, 3.15, -2.5], size: [0.12, 1.88, 0.14] },
    { position: [-2.49, 3.15, -2.5], size: [0.12, 1.88, 0.14] },
  ], []);
  const deskLegs = useMemo<BoxInstance[]>(() => [-1.55, 1.55].flatMap((x) => [-0.62, 0.62].map((z) => ({
    position: [x, 0.76, z],
    size: [0.16, 1.52, 0.16],
  }))), []);
  const chairLegs = useMemo<BoxInstance[]>(() => [-0.42, 0.42].flatMap((x) => [1.08, 1.88].map((z) => ({
    position: [x, 0.45, z],
    size: [0.12, 0.9, 0.12],
  }))), []);
  const shelfBrackets = useMemo<BoxInstance[]>(() => [-0.88, 0.88].map((z) => ({
    position: [-3.93, 3.9, z - 0.1],
    size: [0.38, 0.16, 0.14],
    rotation: [0, Math.PI / 2, 0],
  })), []);
  const doorFrame = useMemo<BoxInstance[]>(() => [
    { position: [2.48, 1.94, -2.49], size: [0.14, 3.96, 0.14] },
    { position: [4.08, 1.94, -2.49], size: [0.14, 3.96, 0.14] },
    { position: [3.28, 3.93, -2.49], size: [1.74, 0.14, 0.14] },
  ], []);

  return (
    <group>
      <InkBox position={[0, -0.15, 0]} size={[8.4, 0.3, 5.9]} color={roomPalette.tangerine} radius={0.07} />
      <InkBox position={[0, 2.7, -2.87]} size={[8.4, 5.4, 0.2]} color={roomPalette.lilac} />
      <InkBox position={[-4.13, 2.7, 0]} size={[0.2, 5.4, 5.9]} color={roomPalette.lilac} />
      <BakedShadow />

      <WindowView />

      <mesh position={[0, 0.02, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.26, 28]} />
        <meshToonMaterial color={roomPalette.poolBlue} gradientMap={toonRamp} />
      </mesh>

      <InkBox position={[0, 1.57, 0]} size={[3.72, 0.2, 1.65]} color={roomPalette.poolBlue} outlined radius={0.08} />
      <InstancedBoxes instances={deskLegs} color={roomPalette.ink} />
      <InkBox position={[0, 1.32, 0.73]} size={[1.2, 0.39, 0.16]} color="#318DD0" radius={0.035} />

      <InkBox position={[0, 0.94, 1.52]} size={[1.2, 0.2, 1.05]} color={roomPalette.lemon} />
      <InkBox position={[0, 1.62, 2.0]} size={[1.2, 1.28, 0.18]} color={roomPalette.lemon} outlined radius={0.07} />
      <InstancedBoxes instances={chairLegs} color={roomPalette.ink} />

      <Laptop />
      <Lamp />
      <Mug />

      <InkBox position={[-3.3, 3.15, -2.65]} size={[1.5, 1.68, 0.12]} color="#D86C45" outlined />
      <InstancedBoxes instances={boardFrame} color={roomPalette.ink} outlined />

      <InkBox position={[-3.72, 4.12, -0.25]} size={[0.7, 0.16, 2.08]} color={roomPalette.poolBlue} outlined />
      <InstancedBoxes instances={shelfBrackets} color={roomPalette.ink} />
      <InkBox position={[-3.72, 4.3, -0.78]} size={[0.32, 0.48, 0.42]} color={roomPalette.lemon} radius={0.025} />
      <InkBox position={[-3.72, 4.34, 0.02]} size={[0.32, 0.55, 0.44]} color={roomPalette.mint} radius={0.025} />

      <Plant />
      <Door />
      <InstancedBoxes instances={doorFrame} color={roomPalette.ink} />
      <CursorLight />
    </group>
  );
}

export function RoomArchitecture() {
  return <RoomObjects />;
}
