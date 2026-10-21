import { DataTexture, NearestFilter, RedFormat, UnsignedByteType } from "three";

// Three gentle steps: a mid shade, a soft shade and the full colour. The lit
// step is 1.0 so a surface in the key light renders as its palette colour.
const levels = new Uint8Array([168, 214, 255, 255]);

export const toonRamp = new DataTexture(levels, 4, 1, RedFormat, UnsignedByteType);
toonRamp.magFilter = NearestFilter;
toonRamp.minFilter = NearestFilter;
toonRamp.generateMipmaps = false;
toonRamp.needsUpdate = true;
