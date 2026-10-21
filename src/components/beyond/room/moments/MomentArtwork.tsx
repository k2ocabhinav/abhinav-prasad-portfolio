"use client";

import { useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import { SRGBColorSpace, TextureLoader } from "three";
import type { BeyondAlbumItem } from "@/types";
import type { RoomAnchor, Vec3 } from "../contracts";
import { roomPalette } from "../contracts";
import { requestMomentsList } from "./events";
import { toonRamp } from "../scene/toonRamp";
import { InkBox } from "./InkBox";
import { getBeyondImageSrc, getMomentColor, getMomentPlaceholderColor } from "./media";
import { useTextTexture } from "./textTexture";

const INK = roomPalette.ink;
const PAPER = roomPalette.paper;

interface MomentShapeProps {
  item: BeyondAlbumItem;
  width: number;
  height: number;
  outlineThickness: number;
}

/** Text on a transparent plane; replaces the old SDF text component. */
function TextPlane({
  text,
  width,
  height,
  size,
  position,
  lineHeight,
  color = INK,
}: {
  text: string;
  width: number;
  height: number;
  size: number;
  position: Vec3;
  lineHeight?: number;
  color?: string;
}) {
  const texture = useTextTexture({ text, width, height, size, lineHeight, color });
  return (
    <mesh position={position} renderOrder={5}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function isEmphasised(outlineThickness: number): boolean {
  return outlineThickness > 0.03;
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
          <CoverPhoto src={imageSrc} width={photoWidth} height={photoHeight} />
        </Suspense>
      ) : (
        <PosterMarks item={item} width={photoWidth} height={photoHeight} />
      )}
      {showCaption ? (
        <TextPlane
          text={item.title}
          width={width - 0.15}
          height={0.1}
          size={0.047}
          position={[0, -height / 2 + 0.082, 0.055]}
        />
      ) : null}
    </>
  );
}

/** A loaded photo texture on a plane, cropped to fill it. */
function CoverPhoto({ src, width, height }: { src: string; width: number; height: number }) {
  const sourceTexture = useLoader(TextureLoader, src);
  const texture = useMemo(() => {
    const prepared = sourceTexture.clone();
    prepared.colorSpace = SRGBColorSpace;
    const image = sourceTexture.image as { width: number; height: number };
    const imageAspect = image.width / image.height;
    const planeAspect = width / height;
    if (imageAspect > planeAspect) {
      prepared.repeat.set(planeAspect / imageAspect, 1);
      prepared.offset.set((1 - prepared.repeat.x) / 2, 0);
    } else {
      prepared.repeat.set(1, imageAspect / planeAspect);
      prepared.offset.set(0, (1 - prepared.repeat.y) / 2);
    }
    prepared.needsUpdate = true;
    return prepared;
  }, [height, sourceTexture, width]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 0.055, 0.052]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/**
 * The primary photo slot: a thin framed print hung on the wall. The picture keeps
 * its own aspect ratio inside the mat. `width` and `height` are the outer frame.
 */
export function FramedPrint({
  item,
  width,
  height,
  outlineThickness,
}: MomentShapeProps) {
  const src = getBeyondImageSrc(item, 480);
  const border = 0.07;
  const matWidth = width - border * 2;
  const matHeight = height - border * 2;

  return (
    <>
      <InkBox size={[width, height, 0.1]} color={roomPalette.lemon} radius={0.035} emphasis={isEmphasised(outlineThickness)} />
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[matWidth, matHeight]} />
        <meshToonMaterial color={PAPER} gradientMap={toonRamp} />
      </mesh>
      {src ? (
        <Suspense fallback={null}>
          <FittedPhoto src={src} width={matWidth - 0.12} height={matHeight - 0.12} />
        </Suspense>
      ) : null}
    </>
  );
}

/** A loaded photo texture, shown whole at its own aspect ratio inside the box. */
function FittedPhoto({ src, width, height }: { src: string; width: number; height: number }) {
  const sourceTexture = useLoader(TextureLoader, src);
  const texture = useMemo(() => {
    const prepared = sourceTexture.clone();
    prepared.colorSpace = SRGBColorSpace;
    prepared.needsUpdate = true;
    return prepared;
  }, [sourceTexture]);
  useEffect(() => () => texture.dispose(), [texture]);

  const image = sourceTexture.image as { width: number; height: number };
  const imageAspect = image.width / image.height;
  const fitWidth = Math.min(width, height * imageAspect);
  const fitHeight = fitWidth / imageAspect;

  return (
    <>
      <mesh position={[0, 0, 0.056]}>
        <planeGeometry args={[fitWidth + 0.03, fitHeight + 0.03]} />
        <meshBasicMaterial color={INK} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.058]}>
        <planeGeometry args={[fitWidth, fitHeight]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </>
  );
}

function PosterMarks({ item, width, height }: { item: BeyondAlbumItem; width: number; height: number }) {
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
        <meshToonMaterial color={PAPER} />
      </mesh>
      <TextPlane text={initials || "BT"} width={width} height={0.3} size={0.18} position={[0, 0, 0.06]} />
    </>
  );
}

export function StickyNote({ item, width, height, outlineThickness }: MomentShapeProps) {
  return (
    <>
      <PlateBody width={width} height={height} color={getMomentColor(item)} outlineThickness={outlineThickness} />
      <mesh position={[0, height * 0.37, 0.048]}>
        <planeGeometry args={[width * 0.2, 0.022]} />
        <meshBasicMaterial color={PAPER} />
      </mesh>
      <TextPlane
        text={item.quote ?? item.title}
        width={width * 0.78}
        height={height * 0.7}
        size={0.086}
        lineHeight={1.25}
        position={[0, 0.02, 0.06]}
      />
    </>
  );
}

export function EventTicket({ item, width, height, outlineThickness }: MomentShapeProps) {
  return (
    <>
      <PlateBody width={width} height={height} color={getMomentColor(item)} outlineThickness={outlineThickness} />
      <mesh position={[-width * 0.32, 0, 0.048]}>
        <planeGeometry args={[width * 0.22, height * 0.74]} />
        <meshToonMaterial color={PAPER} />
      </mesh>
      {[-0.12, 0, 0.12].map((y) => (
        <mesh key={y} position={[-width * 0.32, y, 0.058]}>
          <circleGeometry args={[0.018, 10]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      ))}
      <TextPlane
        text={item.title}
        width={width * 0.48}
        height={height * 0.7}
        size={0.071}
        position={[width * 0.1, 0, 0.06]}
      />
    </>
  );
}

export function ProjectSticker({ item, width, height, outlineThickness }: MomentShapeProps) {
  return (
    <>
      <PlateBody width={width} height={height} color={getMomentColor(item)} outlineThickness={outlineThickness} />
      <TextPlane text="BUILD" width={width * 0.85} height={0.14} size={0.095} position={[0, 0.05, 0.06]} />
      <TextPlane
        text={item.title}
        width={width * 0.85}
        height={0.2}
        size={0.045}
        position={[0, -0.12, 0.06]}
      />
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
    <InkBox
      size={[width, height, 0.07]}
      color={color}
      radius={0.045}
      emphasis={isEmphasised(outlineThickness)}
    />
  );
}

export function MomentNameTab({ item, width, height }: { item: BeyondAlbumItem; width: number; height: number }) {
  const y = -height / 2 + 0.09;
  return (
    <>
      <mesh position={[0, y, 0.06]}>
        <planeGeometry args={[width * 0.72, 0.11]} />
        <meshToonMaterial color={roomPalette.lemon} />
      </mesh>
      <TextPlane text={item.title} width={width * 0.68} height={0.1} size={0.045} position={[0, y, 0.07]} />
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
      <InkBox size={[0.7, 0.42, 0.28]} color="#FFC24B" radius={0.05} />
      <mesh position={[0, 0.24, 0.02]}>
        <planeGeometry args={[0.52, 0.16]} />
        <meshBasicMaterial color={PAPER} />
      </mesh>
      <TextPlane text={`+${count} notes`} width={0.5} height={0.14} size={0.065} position={[0, 0.24, 0.04]} />
    </group>
  );
}
