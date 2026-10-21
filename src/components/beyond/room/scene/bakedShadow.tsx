"use client";

import { useMemo } from "react";
import { DataTexture, LinearFilter, RGBAFormat } from "three";

function createShadowTexture(): DataTexture {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x / (size - 1) - 0.5) * 2;
      const dy = (y / (size - 1) - 0.5) * 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const alpha = Math.max(0, 1 - distance) ** 2 * 34;
      const offset = (y * size + x) * 4;
      pixels[offset] = 38;
      pixels[offset + 1] = 31;
      pixels[offset + 2] = 55;
      pixels[offset + 3] = Math.round(alpha);
    }
  }

  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function BakedShadow() {
  const texture = useMemo(() => createShadowTexture(), []);

  return (
    <mesh position={[0, 0.008, 0.35]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[6.8, 4.2]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
