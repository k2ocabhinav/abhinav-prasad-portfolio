"use client";

import { useFrame } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import type { ShaderMaterial } from "three";
import { toonRamp } from "../scene/toonRamp";
import { getOutlineMaterial, outlineUniforms, roundedBox } from "../scene/toon";

const noRaycast = () => null;
/** How much heavier the ink gets while an object is hovered or focused. */
const EMPHASIS = 2.4;

let emphasisMaterial: ShaderMaterial | null = null;

/** A second copy of the shared ink material whose line weight is driven here. */
function getEmphasisMaterial(): ShaderMaterial {
  emphasisMaterial ??= getOutlineMaterial().clone();
  return emphasisMaterial;
}

interface InkBoxProps {
  size: [number, number, number];
  color: string;
  radius?: number;
  /** Heavier ink, used for hover and focus. */
  emphasis?: boolean;
  position?: [number, number, number];
  children?: ReactNode;
}

/** A rounded toon box with an inverted-hull ink outline. Local replacement for drei's RoundedBox plus Outlines. */
export function InkBox({ size, color, radius = 0.045, emphasis = false, position, children }: InkBoxProps) {
  const [width, height, depth] = size;
  const geometry = useMemo(() => {
    const body = roundedBox(width, height, depth, radius, 2);
    const hull = body.clone();
    hull.setAttribute("outlineNormal", body.getAttribute("normal"));
    return { body, hull };
  }, [depth, height, radius, width]);

  useEffect(
    () => () => {
      geometry.body.dispose();
      geometry.hull.dispose();
    },
    [geometry],
  );

  useFrame(() => {
    if (emphasis) getEmphasisMaterial().uniforms.uThickness.value = outlineUniforms.uThickness.value * EMPHASIS;
  });

  return (
    <group position={position}>
      <mesh geometry={geometry.body}>
        <meshToonMaterial color={color} gradientMap={toonRamp} />
      </mesh>
      <mesh
        geometry={geometry.hull}
        material={emphasis ? getEmphasisMaterial() : getOutlineMaterial()}
        raycast={noRaycast}
      />
      {children}
    </group>
  );
}
