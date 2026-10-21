import { useCallback, useState } from "react";
import { CanvasTexture, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace } from "three";
import { roomPalette } from "../contracts";

// Every texture is drawn once on a canvas at runtime and cached.
const cache = new Map<string, CanvasTexture>();

function remember(key: string, build: () => CanvasTexture): CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;
  const texture = build();
  texture.colorSpace = SRGBColorSpace;
  cache.set(key, texture);
  return texture;
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  return [canvas, context];
}

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

/** Soft white radial blob, used for glows, stars and steam. */
export function glowTexture(): CanvasTexture {
  return remember("glow", () => {
    const [canvas, context] = makeCanvas(128, 128);
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.55)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0.14)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  });
}

/** A puff of steam: a soft blob with a hint of ink at the rim to read on pale walls. */
export function puffTexture(): CanvasTexture {
  return remember("puff", () => {
    const [canvas, context] = makeCanvas(96, 96);
    const gradient = context.createRadialGradient(48, 48, 2, 48, 48, 46);
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.75)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 96, 96);
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  });
}

/** Soft rounded-rectangle shadow, computed per pixel so the edges fade to nothing. */
export function shadowTexture(): CanvasTexture {
  return remember("shadow", () => {
    const width = 128;
    const height = 96;
    const [canvas, context] = makeCanvas(width, height);
    const image = context.createImageData(width, height);
    const halfX = 34;
    const halfY = 22;
    const corner = 14;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const px = Math.abs(x - width / 2 + 0.5) - (halfX - corner);
        const py = Math.abs(y - height / 2 + 0.5) - (halfY - corner);
        const distance = Math.hypot(Math.max(px, 0), Math.max(py, 0)) + Math.min(Math.max(px, py), 0) - corner;
        const t = Math.min(1, Math.max(0, 1 - distance / 28));
        const alpha = t * t * (3 - 2 * t);
        const offset = (y * width + x) * 4;
        image.data[offset] = 34;
        image.data[offset + 1] = 20;
        image.data[offset + 2] = 70;
        image.data[offset + 3] = Math.round(alpha * 255);
      }
    }
    context.putImageData(image, 0, 0);
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  });
}

/** A drifting fog band: wraps horizontally so it can scroll forever. */
export function fogTexture(seed: number): CanvasTexture {
  return remember(`fog-${seed}`, () => {
    const width = 512;
    const height = 128;
    const [canvas, context] = makeCanvas(width, height);
    const random = seeded(seed * 7919 + 13);
    const blobs = 30;
    for (let index = 0; index < blobs; index += 1) {
      const x = random() * width;
      const y = height * (0.42 + random() * 0.32);
      const radius = 26 + random() * 46;
      const alpha = 0.3 + random() * 0.32;
      for (const offset of [-width, 0, width]) {
        const gradient = context.createRadialGradient(x + offset, y, 0, x + offset, y, radius);
        gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = gradient;
        context.fillRect(x + offset - radius, y - radius, radius * 2, radius * 2);
      }
    }
    // Fade the top and bottom edges so the band has no hard seam.
    context.globalCompositeOperation = "destination-in";
    const fade = context.createLinearGradient(0, 0, 0, height);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(0.35, "rgba(0,0,0,1)");
    fade.addColorStop(0.7, "rgba(0,0,0,1)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = fade;
    context.fillRect(0, 0, width, height);
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.minFilter = LinearMipmapLinearFilter;
    return texture;
  });
}

function shade(hex: string, amount: number): string {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const base = (value >> shift) & 255;
    const next = amount >= 0 ? base + (255 - base) * amount : base * (1 + amount);
    return Math.round(Math.max(0, Math.min(255, next)));
  };
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
}

export const FLOOR_WIDTH = 8.4;
export const FLOOR_DEPTH = 5.5;
export const FLOOR_CENTER_Z = -0.2;

/** Floorboards and the round patterned rug, one texture for the whole floor. */
export function floorTexture(): CanvasTexture {
  return remember("floor", () => {
    const scale = 190;
    const [canvas, context] = makeCanvas(Math.round(FLOOR_WIDTH * scale), Math.round(FLOOR_DEPTH * scale));
    const random = seeded(77);
    const plankHeight = 0.42 * scale;
    context.fillStyle = roomPalette.tangerine;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const rows = Math.ceil(canvas.height / plankHeight);
    for (let row = 0; row < rows; row += 1) {
      const y = row * plankHeight;
      let x = -random() * 400;
      while (x < canvas.width) {
        const length = 340 + random() * 420;
        context.fillStyle = shade(roomPalette.tangerine, (random() - 0.5) * 0.1);
        context.fillRect(x, y, length, plankHeight);
        context.fillStyle = "rgba(120,40,0,0.2)";
        context.fillRect(x + length - 2, y, 3, plankHeight);
        for (let grain = 0; grain < 3; grain += 1) {
          context.fillStyle = "rgba(255,255,255,0.09)";
          context.fillRect(x + random() * length * 0.7, y + 8 + random() * (plankHeight - 16), 40 + random() * 120, 2);
        }
        x += length;
      }
      context.fillStyle = "rgba(120,40,0,0.26)";
      context.fillRect(0, y, canvas.width, 3);
    }

    // Rug
    const cx = (FLOOR_WIDTH / 2) * scale;
    const cz = (0.28 - FLOOR_CENTER_Z + FLOOR_DEPTH / 2) * scale;
    const rx = 2.55 * scale;
    const ry = 1.78 * scale;
    const rings: [number, string][] = [
      [1, roomPalette.poolBlue],
      [0.88, roomPalette.paper],
      [0.76, roomPalette.mint],
      [0.6, roomPalette.lilac],
      [0.44, roomPalette.paper],
      [0.3, roomPalette.lemon],
    ];
    context.lineWidth = 7;
    context.strokeStyle = roomPalette.ink;
    context.fillStyle = "rgba(60,20,0,0.22)";
    context.beginPath();
    context.ellipse(cx + 8, cz + 10, rx, ry, 0, 0, Math.PI * 2);
    context.fill();
    for (const [factor, color] of rings) {
      context.fillStyle = color;
      context.beginPath();
      context.ellipse(cx, cz, rx * factor, ry * factor, 0, 0, Math.PI * 2);
      context.fill();
      context.lineWidth = factor === 1 ? 8 : 4;
      context.stroke();
    }
    // Stitching on the paper ring and fringe dots on the rim.
    context.fillStyle = roomPalette.ink;
    for (let index = 0; index < 64; index += 1) {
      const angle = (index / 64) * Math.PI * 2;
      const factor = 0.94;
      context.beginPath();
      context.arc(cx + Math.cos(angle) * rx * factor, cz + Math.sin(angle) * ry * factor, 3.4, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = roomPalette.tangerine;
    for (let index = 0; index < 28; index += 1) {
      const angle = (index / 28) * Math.PI * 2 + 0.05;
      const factor = 0.52;
      context.beginPath();
      context.arc(cx + Math.cos(angle) * rx * factor, cz + Math.sin(angle) * ry * factor, 5, 0, Math.PI * 2);
      context.fill();
    }
    const texture = new CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.minFilter = LinearMipmapLinearFilter;
    return texture;
  });
}

export const WALL_WIDTH = 8.4;
export const WALL_HEIGHT = 5.4;

/** Lilac wallpaper with dots and a wainscot; the back wall variant punches the window out. */
export function wallTexture(kind: "back" | "side"): CanvasTexture {
  return remember(`wall-${kind}`, () => {
    const scale = 150;
    const worldWidth = kind === "back" ? WALL_WIDTH : FLOOR_DEPTH;
    const [canvas, context] = makeCanvas(Math.round(worldWidth * scale), Math.round(WALL_HEIGHT * scale));
    const h = canvas.height;
    context.fillStyle = roomPalette.lilac;
    context.fillRect(0, 0, canvas.width, h);
    // Polka dots, staggered.
    const spacing = 0.52 * scale;
    for (let row = 0; row * spacing < h; row += 1) {
      for (let column = -1; column * spacing < canvas.width + spacing; column += 1) {
        const x = column * spacing + (row % 2 === 0 ? 0 : spacing / 2);
        context.fillStyle = "rgba(255,255,255,0.2)";
        context.beginPath();
        context.arc(x, row * spacing * 0.9 + spacing * 0.3, 0.07 * scale, 0, Math.PI * 2);
        context.fill();
      }
    }
    // Wainscot: deeper lilac band with vertical grooves and a paper rail.
    const railY = h - 1.25 * scale;
    context.fillStyle = "#A68CF7";
    context.fillRect(0, railY, canvas.width, h - railY);
    context.fillStyle = "rgba(60,30,140,0.16)";
    for (let x = 0.3 * scale; x < canvas.width; x += 0.6 * scale) context.fillRect(x, railY + 0.14 * scale, 5, h - railY);
    context.fillStyle = roomPalette.paper;
    context.fillRect(0, railY - 0.07 * scale, canvas.width, 0.14 * scale);
    context.fillStyle = roomPalette.ink;
    context.fillRect(0, railY - 0.07 * scale - 2, canvas.width, 3);
    context.fillRect(0, railY + 0.07 * scale - 1, canvas.width, 3);
    // Baseboard
    context.fillStyle = roomPalette.paper;
    context.fillRect(0, h - 0.24 * scale, canvas.width, 0.24 * scale);
    context.fillStyle = roomPalette.ink;
    context.fillRect(0, h - 0.24 * scale - 2, canvas.width, 4);

    if (kind === "back") {
      // Punch the window opening (x -2.35..2.05, y 2.15..4.45) out of the wallpaper.
      const left = (-2.35 + WALL_WIDTH / 2) * scale;
      const right = (2.05 + WALL_WIDTH / 2) * scale;
      const top = (WALL_HEIGHT - 4.45) * scale;
      const bottom = (WALL_HEIGHT - 2.15) * scale;
      context.globalCompositeOperation = "destination-out";
      context.beginPath();
      context.roundRect(left, top, right - left, bottom - top, 0.14 * scale);
      context.fill();
    }
    const texture = new CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.minFilter = LinearMipmapLinearFilter;
    return texture;
  });
}

/** The framed print: a sunrise over layered hills, a nod to Shillong. */
export function posterTexture(): CanvasTexture {
  return remember("poster", () => {
    const [canvas, context] = makeCanvas(300, 400);
    const sky = context.createLinearGradient(0, 0, 0, 400);
    sky.addColorStop(0, "#FFB59A");
    sky.addColorStop(0.55, "#FFE3A8");
    sky.addColorStop(1, "#FFF3D6");
    context.fillStyle = sky;
    context.fillRect(0, 0, 300, 400);
    context.fillStyle = "#FF7A3D";
    context.beginPath();
    context.arc(150, 190, 62, 0, Math.PI * 2);
    context.fill();
    const hills: [string, number, number][] = [
      ["#8EC5F0", 250, 30],
      ["#63B995", 292, 26],
      ["#3C9A74", 334, 34],
      ["#27775A", 372, 20],
    ];
    hills.forEach(([color, base, amplitude], index) => {
      context.fillStyle = color;
      context.beginPath();
      context.moveTo(0, 400);
      for (let x = 0; x <= 300; x += 10) {
        context.lineTo(x, base - Math.sin(x * 0.018 + index * 1.7) * amplitude - Math.sin(x * 0.047 + index) * amplitude * 0.4);
      }
      context.lineTo(300, 400);
      context.fill();
    });
    context.fillStyle = "rgba(255,255,255,0.5)";
    for (const [x, y, w] of [[40, 270, 110], [150, 312, 140], [20, 350, 120]] as const) {
      context.beginPath();
      context.ellipse(x + w / 2, y, w / 2, 9, 0, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = roomPalette.ink;
    context.font = '700 24px "Bricolage Grotesque", system-ui, sans-serif';
    context.textAlign = "center";
    context.fillText("SHILLONG", 150, 62);
    context.font = '600 12px "Plus Jakarta Sans", system-ui, sans-serif';
    context.fillText("OFFICE WITH A VIEW", 150, 82);
    const texture = new CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  });
}

/** What the laptop is showing: a tiny terminal. */
export function screenTexture(): CanvasTexture {
  return remember("screen", () => {
    const [canvas, context] = makeCanvas(512, 320);
    const background = context.createLinearGradient(0, 0, 0, 320);
    background.addColorStop(0, "#2A2A5A");
    background.addColorStop(1, "#1B1838");
    context.fillStyle = background;
    context.fillRect(0, 0, 512, 320);
    context.fillStyle = "rgba(255,255,255,0.08)";
    context.fillRect(0, 0, 512, 34);
    for (const [index, color] of [roomPalette.tangerine, roomPalette.lemon, roomPalette.mint].entries()) {
      context.fillStyle = color;
      context.beginPath();
      context.arc(24 + index * 24, 17, 7, 0, Math.PI * 2);
      context.fill();
    }
    context.font = '700 25px "Space Mono", ui-monospace, monospace';
    const lines: [string, string, number, number][] = [
      [roomPalette.mint, "$ whoami", 24, 80],
      [roomPalette.paper, "abhinav. builds backends.", 24, 118],
      [roomPalette.lemon, "$ ls ~/after-hours", 24, 170],
      [roomPalette.poolBlue, "chai/  hills/  fog/", 24, 208],
      [roomPalette.mint, "$ _", 24, 262],
    ];
    for (const [color, text, x, y] of lines) {
      context.fillStyle = color;
      context.fillText(text, x, y);
    }
    const texture = new CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  });
}

/** Faint diagonal glass streaks laid over the window view. */
export function glassTexture(): CanvasTexture {
  return remember("glass", () => {
    const [canvas, context] = makeCanvas(256, 128);
    context.translate(128, 64);
    context.rotate(-0.6);
    for (const [x, width, alpha] of [[-60, 26, 0.22], [-18, 8, 0.2], [14, 44, 0.12], [64, 10, 0.16]] as const) {
      const gradient = context.createLinearGradient(x, 0, x + width, 0);
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.fillRect(x, -240, width, 480);
    }
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  });
}

/** Crescent moon with a halo, for the night window. */
export function moonTexture(): CanvasTexture {
  return remember("moon", () => {
    const [canvas, context] = makeCanvas(160, 160);
    const halo = context.createRadialGradient(80, 80, 20, 80, 80, 80);
    halo.addColorStop(0, "rgba(255,240,190,0.5)");
    halo.addColorStop(1, "rgba(255,240,190,0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, 160, 160);
    context.fillStyle = "#FFF1C2";
    context.beginPath();
    context.arc(80, 80, 30, 0, Math.PI * 2);
    context.fill();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(94, 72, 27, 0, Math.PI * 2);
    context.fill();
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  });
}

/** A flat cartoon cloud for the backdrop. */
export function cloudTexture(): CanvasTexture {
  return remember("cloud", () => {
    const [canvas, context] = makeCanvas(256, 112);
    context.fillStyle = "#FFFFFF";
    context.beginPath();
    context.roundRect(24, 58, 208, 34, 17);
    context.fill();
    for (const [x, y, radius] of [[88, 56, 32], [136, 46, 40], [184, 62, 26]] as const) {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  });
}

/** A tiny vertical gradient texture that can be repainted as the room blends day to night. */
export class GradientTexture extends CanvasTexture {
  private readonly context: CanvasRenderingContext2D;

  constructor(height: number) {
    const [canvas, context] = makeCanvas(4, height);
    super(canvas);
    this.context = context;
    this.colorSpace = SRGBColorSpace;
  }

  paint(stops: [number, string][]): void {
    const { width, height } = this.context.canvas;
    const gradient = this.context.createLinearGradient(0, 0, 0, height);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, width, height);
    this.needsUpdate = true;
  }
}

export function useGradientTexture(height: number): { texture: GradientTexture; paint: (stops: [number, string][]) => void } {
  const [texture] = useState(() => new GradientTexture(height));
  const paint = useCallback((stops: [number, string][]) => texture.paint(stops), [texture]);
  return { texture, paint };
}
