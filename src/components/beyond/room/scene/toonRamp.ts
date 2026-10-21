import * as THREE from "three";

const levels = new Uint8Array([
  124, 124, 124,
  198, 198, 198,
  255, 255, 255,
]);

export const toonRamp = new THREE.DataTexture(levels, 3, 1, THREE.RGBFormat);
toonRamp.magFilter = THREE.NearestFilter;
toonRamp.minFilter = THREE.NearestFilter;
toonRamp.generateMipmaps = false;
toonRamp.needsUpdate = true;
