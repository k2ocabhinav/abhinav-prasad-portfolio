import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";

/** Texture pixels per world unit: crisp at the closest focus, light in memory. */
const PIXELS_PER_UNIT = 640;

interface TextTextureOptions {
  text: string;
  /** Plane size in world units. */
  width: number;
  height: number;
  /** Font size in world units. Shrinks automatically when the text does not fit. */
  size: number;
  color?: string;
  lineHeight?: number;
}

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paintText(canvas: HTMLCanvasElement, family: string, options: TextTextureOptions): void {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { text, size, color = "#16131A", lineHeight = 1.2 } = options;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;

  let pixels = size * PIXELS_PER_UNIT;
  let lines: string[] = [];
  for (let attempt = 0; attempt < 14; attempt += 1) {
    context.font = `400 ${pixels}px ${family}`;
    lines = wrapLines(context, text, canvas.width * 0.97);
    const fits =
      lines.length * pixels * lineHeight <= canvas.height * 0.98 &&
      lines.every((line) => context.measureText(line).width <= canvas.width * 0.99);
    if (fits || pixels < 12) break;
    pixels *= 0.9;
  }

  const step = pixels * lineHeight;
  lines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, canvas.height / 2 + (index - (lines.length - 1) / 2) * step);
  });
}

function refreshTexture(texture: CanvasTexture): void {
  texture.needsUpdate = true;
}

/**
 * Text drawn into a canvas texture. This replaces an SDF text renderer (and its
 * font worker), which was the heaviest dependency of the room.
 */
export function useTextTexture(options: TextTextureOptions): CanvasTexture {
  const canvasElement = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const { text, width, height, size, color, lineHeight } = options;

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(16, Math.round(width * PIXELS_PER_UNIT));
    canvas.height = Math.max(16, Math.round(height * PIXELS_PER_UNIT));
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
  }, [width, height]);

  useEffect(() => {
    let cancelled = false;
    const family = getComputedStyle(canvasElement).getPropertyValue("--font-beyond-mono").trim() || "monospace";
    const render = () => {
      paintText(texture.image as HTMLCanvasElement, family, { text, width, height, size, color, lineHeight });
      refreshTexture(texture);
      invalidate();
    };
    render();
    // The mono face is only fetched once something draws with it.
    void document.fonts
      .load(`400 24px ${family}`, text)
      .then(() => {
        if (!cancelled) render();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [canvasElement, color, height, invalidate, lineHeight, size, text, texture, width]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}
