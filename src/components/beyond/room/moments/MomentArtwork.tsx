"use client";

import { Outlines } from "@react-three/drei/core/Outlines.js";
import { RoundedBox } from "@react-three/drei/core/RoundedBox.js";
import { Text } from "@react-three/drei/core/Text.js";
import { useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import { SRGBColorSpace, TextureLoader } from "three";
import type { BeyondAlbumItem } from "@/types";
import type { RoomAnchor, Vec3 } from "../contracts";
import { requestMomentsList } from "./events";
import { getBeyondImageSrc, getMomentColor, getMomentPlaceholderColor } from "./media";

const MOMENT_FONT = "/beyond-terminal/fonts/space-mono-subset.woff";
const FONT_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?'+-:/()";

interface MomentShapeProps {
  item: BeyondAlbumItem;
  width: number;
  height: number;
  outlineThickness: number;
}

export function MomentPhoto({
  item,
  width,
  height,
  showCaption = true,
}: {
  item: BeyondAlbumItem;
  width: number;
  height: number;
  showCaption?: boolean;
}) {
  const imageSrc = getBeyondImageSrc(item, 480);
  const photoWidth = width - 0.11;
  const photoHeight = height - 0.24;
  const placeholderColor = getMomentPlaceholderColor(item);

  return (
    <>
      <mesh position={[0, 0.055, 0.042]}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        <meshToonMaterial color={placeholderColor} />
      </mesh>
      {imageSrc ? (
        <Suspense fallback={null}>
          <LoadedMomentPhoto src={imageSrc} width={photoWidth} height={photoHeight} />
        </Suspense>
      ) : (
        <PosterMarks item={item} width={photoWidth} height={photoHeight} />
      )}
      {showCaption ? (
        <Suspense fallback={null}>
          <Text
            position={[0, -height / 2 + 0.082, 0.055]}
            font={MOMENT_FONT}
            characters={FONT_CHARACTERS}
            fontSize={0.047}
            maxWidth={width - 0.15}
            color="#16131A"
            anchorX="center"
            anchorY="middle"
            textAlign="center"
          >
            {item.title}
          </Text>
        </Suspense>
      ) : null}
    </>
  );
}

function LoadedMomentPhoto({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) {
  const sourceTexture = useLoader(TextureLoader, src);
  const texture = useMemo(() => {
    const prepared = sourceTexture.clone();
    prepared.colorSpace = SRGBColorSpace;
    prepared.needsUpdate = true;
    return prepared;
  }, [sourceTexture]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 0.055, 0.052]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function PosterMarks({
  item,
  width,
  height,
}: {
  item: BeyondAlbumItem;
  width: number;
  height: number;
}) {
  const initials = item.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <mesh position={[-width * 0.23, height * 0.19, 0.052]}>
        <circleGeometry args={[width * 0.12, 18]} />
        <meshToonMaterial color={getMomentColor(item)} />
      </mesh>
      <mesh position={[width * 0.2, -height * 0.2, 0.052]}>
        <planeGeometry args={[width * 0.52, 0.045]} />
        <meshToonMaterial color="#FFF8EC" />
      </mesh>
      <Suspense fallback={null}>
        <Text
          position={[0, 0, 0.06]}
          font={MOMENT_FONT}
          characters={FONT_CHARACTERS}
          fontSize={0.18}
          color="#16131A"
          anchorX="center"
          anchorY="middle"
        >
          {initials || "BT"}
        </Text>
      </Suspense>
    </>
  );
}

export function StickyNote({ item, width, height, outlineThickness }: MomentShapeProps) {
  return (
    <>
      <PlateBody width={width} height={height} color={getMomentColor(item)} outlineThickness={outlineThickness} />
      <mesh position={[0, height * 0.37, 0.048]}>
        <planeGeometry args={[width * 0.2, 0.022]} />
        <meshBasicMaterial color="#FFF8EC" />
      </mesh>
      <Suspense fallback={null}>
        <Text
          position={[0, 0.02, 0.06]}
          font={MOMENT_FONT}
          characters={FONT_CHARACTERS}
          fontSize={0.086}
          lineHeight={1.25}
          maxWidth={width * 0.78}
          color="#16131A"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {item.quote ?? item.title}
        </Text>
      </Suspense>
    </>
  );
}

export function EventTicket({ item, width, height, outlineThickness }: MomentShapeProps) {
  return (
    <>
      <PlateBody width={width} height={height} color={getMomentColor(item)} outlineThickness={outlineThickness} />
      <mesh position={[-width * 0.32, 0, 0.048]}>
        <planeGeometry args={[width * 0.22, height * 0.74]} />
        <meshToonMaterial color="#FFF8EC" />
      </mesh>
      {[-0.12, 0, 0.12].map((y) => (
        <mesh key={y} position={[-width * 0.32, y, 0.058]}>
          <circleGeometry args={[0.018, 10]} />
          <meshBasicMaterial color="#16131A" />
        </mesh>
      ))}
      <Suspense fallback={null}>
        <Text
          position={[width * 0.1, 0, 0.06]}
          font={MOMENT_FONT}
          characters={FONT_CHARACTERS}
          fontSize={0.071}
          maxWidth={width * 0.48}
          color="#16131A"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {item.title}
        </Text>
      </Suspense>
    </>
  );
}

export function ProjectSticker({ item, width, height, outlineThickness }: MomentShapeProps) {
  return (
    <>
      <PlateBody width={width} height={height} color={getMomentColor(item)} outlineThickness={outlineThickness} />
      <Suspense fallback={null}>
        <Text
          position={[0, 0.05, 0.06]}
          font={MOMENT_FONT}
          characters={FONT_CHARACTERS}
          fontSize={0.095}
          color="#16131A"
          anchorX="center"
          anchorY="middle"
        >
          BUILD
        </Text>
        <Text
          position={[0, -0.12, 0.06]}
          font={MOMENT_FONT}
          characters={FONT_CHARACTERS}
          fontSize={0.045}
          maxWidth={width * 0.85}
          color="#16131A"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {item.title}
        </Text>
      </Suspense>
    </>
  );
}

export function PlateBody({
  width,
  height,
  color,
  outlineThickness = 0.018,
}: {
  width: number;
  height: number;
  color: string;
  outlineThickness?: number;
}) {
  return (
    <RoundedBox args={[width, height, 0.07]} radius={0.045} smoothness={3} position={[0, 0, 0]}>
      <meshToonMaterial color={color} />
      <Outlines
        color="#16131A"
        thickness={outlineThickness}
        angle={Math.PI}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </RoundedBox>
  );
}

export function MomentNameTab({ item, width }: { item: BeyondAlbumItem; width: number }) {
  return (
    <>
      <mesh position={[0, -0.47, 0.06]}>
        <planeGeometry args={[width * 0.72, 0.12]} />
        <meshToonMaterial color="#FFE05A" />
      </mesh>
      <Suspense fallback={null}>
        <Text
          position={[0, -0.47, 0.07]}
          font={MOMENT_FONT}
          characters={FONT_CHARACTERS}
          fontSize={0.045}
          maxWidth={width * 0.68}
          color="#16131A"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {item.title}
        </Text>
      </Suspense>
    </>
  );
}

export function Shoebox({ anchor, count }: { anchor?: RoomAnchor; count: number }) {
  const position: Vec3 = anchor?.position ?? [2.8, -1.4, 0];

  return (
    <group
      position={position}
      rotation={anchor?.rotation ?? [0, 0, 0]}
      onClick={(event) => {
        event.stopPropagation();
        requestMomentsList();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <RoundedBox args={[0.7, 0.42, 0.28]} radius={0.05} smoothness={3}>
        <meshToonMaterial color="#FFC24B" />
        <Outlines color="#16131A" thickness={0.024} angle={Math.PI} />
      </RoundedBox>
      <mesh position={[0, 0.24, 0.02]}>
        <planeGeometry args={[0.52, 0.16]} />
        <meshBasicMaterial color="#FFF8EC" />
      </mesh>
      <Suspense fallback={null}>
        <Text
          position={[0, 0.24, 0.04]}
          font={MOMENT_FONT}
          characters={FONT_CHARACTERS}
          fontSize={0.065}
          color="#16131A"
          anchorX="center"
          anchorY="middle"
        >
          {`+${count} notes`}
        </Text>
      </Suspense>
    </group>
  );
}
