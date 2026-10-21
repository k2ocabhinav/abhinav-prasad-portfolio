"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Euler, PerspectiveCamera, Vector3 } from "three";
import type { CameraRig as CameraRigApi } from "../contracts";
import { CameraRigContext } from "../contracts";
import { outlineFocus } from "./toon";

export const CAMERA_FOV = 36;
const HOME_DIRECTION = new Vector3(7.6, 4.5, 10.2).normalize();
const HOME_FLAT = new Vector3(HOME_DIRECTION.x, 0, HOME_DIRECTION.z).normalize();
const GLIDE_SECONDS = 0.9;

// Points that bound the room on screen (plinth corners and wall tops).
const ROOM_POINTS: [number, number, number][] = [
  [-4.5, -0.64, -3.25], [4.5, -0.64, -3.25], [-4.5, -0.64, 2.85], [4.5, -0.64, 2.85],
  [-4.25, 5.5, -3.0], [4.25, 5.5, -3.0], [-4.25, 5.5, 2.6],
];

let desktopQuery: MediaQueryList | null = null;

export type HomeLayout = "wide" | "square" | "portrait";

/**
 * Wide stages (desktop) leave the left third to the page title and intro, so the
 * room is framed into the right part of the stage. Portrait stages show the whole
 * room, width first.
 */
export function homeLayout(width: number, height: number): HomeLayout {
  const aspect = width / Math.max(height, 1);
  if (aspect < 0.9) return "portrait";
  // The same breakpoint as the page CSS, which lays the title over the stage from 1024px.
  desktopQuery ??= window.matchMedia("(min-width: 1024px)");
  return desktopQuery.matches && aspect >= 1.1 ? "wide" : "square";
}

const HOME_FRAMING: Record<HomeLayout, { fillX: number; fillY: number; centerX: number; centerY: number }> = {
  // The room spans about 35% to 95% of the stage width.
  wide: { fillX: 0.61, fillY: 0.94, centerX: 0.325, centerY: -0.02 },
  square: { fillX: 0.84, fillY: 0.94, centerX: 0, centerY: 0 },
  portrait: { fillX: 0.97, fillY: 0.94, centerX: 0, centerY: 0.02 },
};

/**
 * Finds the camera position along the establishing direction that makes the room
 * fill its share of the frame (see HOME_FRAMING), slid sideways so it sits where
 * the layout wants it.
 */
export function fitHome(aspect: number, fov: number, layout: HomeLayout): { position: Vector3; target: Vector3 } {
  const points = ROOM_POINTS.map((point) => new Vector3(...point));
  const { fillX, fillY, centerX, centerY } = HOME_FRAMING[layout];
  const camera = new PerspectiveCamera(fov, aspect, 0.1, 100);
  const target = new Vector3(0, 2.2, 0);
  const projected = new Vector3();
  const right = new Vector3();
  const up = new Vector3();
  let distance = 16;

  for (let step = 0; step < 16; step += 1) {
    camera.position.copy(target).addScaledVector(HOME_DIRECTION, distance);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const point of points) {
      projected.copy(point).project(camera);
      minX = Math.min(minX, projected.x);
      maxX = Math.max(maxX, projected.x);
      minY = Math.min(minY, projected.y);
      maxY = Math.max(maxY, projected.y);
    }
    const need = Math.max((maxX - minX) / (2 * fillX), (maxY - minY) / (2 * fillY));
    distance *= Math.min(1.5, Math.max(0.6, need));
    const halfHeight = distance * Math.tan((fov * Math.PI) / 360);
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    target.addScaledVector(right, ((minX + maxX) / 2 - centerX) * halfHeight * aspect);
    target.addScaledVector(up, ((minY + maxY) / 2 - centerY) * halfHeight);
  }

  return { position: target.clone().addScaledVector(HOME_DIRECTION, distance), target };
}
const POINTER_LIMIT_YAW = (4 * Math.PI) / 180;
const POINTER_LIMIT_PITCH = (2 * Math.PI) / 180;

interface Glide {
  startedAt: number;
  fromPosition: Vector3;
  toPosition: Vector3;
  fromTarget: Vector3;
  toTarget: Vector3;
}

export function CameraRig({ children }: { children: ReactNode }) {
  const { camera, gl, invalidate, clock, size, get } = useThree();
  const cameraRef = useRef(camera);
  const glideRef = useRef<Glide | null>(null);
  const reducedMotionRef = useRef(false);
  const isFocused = useRef(false);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerSpring = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const pointerRect = useRef<DOMRect | null>(null);
  const [initialHome] = useState(() =>
    fitHome(size.width / Math.max(size.height, 1), CAMERA_FOV, homeLayout(size.width, size.height)),
  );
  const home = useRef(initialHome);
  const homeAspect = useRef(size.width / Math.max(size.height, 1));
  const homeKind = useRef(homeLayout(size.width, size.height));
  const currentLookTarget = useMemo(() => initialHome.target.clone(), [initialHome]);
  const desiredPosition = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);
  const pointerRotation = useMemo(() => new Euler(), []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const canvas = gl.domElement;
    const refreshRect = () => {
      pointerRect.current = canvas.getBoundingClientRect();
    };
    const handlePointerMove = (event: PointerEvent) => {
      const rect = pointerRect.current;
      if (!rect || rect.width <= 0 || rect.height <= 0 || !finePointer.matches || reducedMotion.matches) return;
      pointerTarget.current.x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      pointerTarget.current.y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
    };
    const clearPointer = () => {
      pointerTarget.current.x = 0;
      pointerTarget.current.y = 0;
    };
    const handleReducedMotion = () => {
      reducedMotionRef.current = reducedMotion.matches;
      if (reducedMotion.matches) clearPointer();
    };
    const handleFinePointer = () => {
      if (!finePointer.matches) clearPointer();
    };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(refreshRect);

    reducedMotionRef.current = reducedMotion.matches;
    refreshRect();
    observer?.observe(canvas);
    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", clearPointer);
    reducedMotion.addEventListener("change", handleReducedMotion);
    finePointer.addEventListener("change", handleFinePointer);

    return () => {
      observer?.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", clearPointer);
      reducedMotion.removeEventListener("change", handleReducedMotion);
      finePointer.removeEventListener("change", handleFinePointer);
    };
  }, [gl]);

  useEffect(() => {
    camera.position.copy(home.current.position);
    camera.lookAt(home.current.target);
    currentLookTarget.copy(home.current.target);
    invalidate();
  }, [camera, currentLookTarget, invalidate]);

  const api = useMemo<CameraRigApi>(() => ({
    focus({ position, normal, size }) {
      isFocused.current = true;
      const target = new Vector3(...position);
      const face = new Vector3(...normal).normalize();
      const fov = "fov" in camera ? camera.fov : CAMERA_FOV;
      const halfTan = Math.tan((fov * Math.PI) / 360);
      const stage = get().size;
      const aspect = stage.width / Math.max(stage.height, 1);
      // Fit the object's height and width (the narrower of the two limits the distance)
      // with some air around it, then stand back along its normal.
      const fitted = Math.max(size[1] / (2 * halfTan), size[0] / (2 * halfTan * Math.min(aspect, 1.6)));
      const distance = Math.max(1.7, Math.min(6.5, fitted * 1.55));
      // Stand off along the normal, turned a little towards the establishing side so a
      // wall print is seen with the wall behind it, not past the end of the wall.
      const approach = face.clone().addScaledVector(HOME_FLAT, 0.6).normalize();
      const toPosition = target.clone().addScaledVector(approach, distance);
      toPosition.y += distance * 0.16;

      if (reducedMotionRef.current) {
        camera.position.copy(toPosition);
        camera.lookAt(target);
        currentLookTarget.copy(target);
        glideRef.current = null;
        invalidate();
        return;
      }

      glideRef.current = {
        startedAt: clock.elapsedTime,
        fromPosition: camera.position.clone(),
        toPosition,
        fromTarget: currentLookTarget.clone(),
        toTarget: target,
      };
      invalidate();
    },
    reset() {
      isFocused.current = false;
      if (reducedMotionRef.current) {
        camera.position.copy(home.current.position);
        camera.lookAt(home.current.target);
        currentLookTarget.copy(home.current.target);
        glideRef.current = null;
        invalidate();
        return;
      }

      glideRef.current = {
        startedAt: clock.elapsedTime,
        fromPosition: camera.position.clone(),
        toPosition: home.current.position.clone(),
        fromTarget: currentLookTarget.clone(),
        toTarget: home.current.target.clone(),
      };
      invalidate();
    },
  }), [camera, clock, currentLookTarget, get, invalidate]);

  useFrame((state, delta) => {
    const activeCamera = cameraRef.current;
    outlineFocus.copy(currentLookTarget);
    const aspect = size.width / Math.max(size.height, 1);
    const layout = homeLayout(size.width, size.height);
    if (Math.abs(aspect - homeAspect.current) > 0.001 || layout !== homeKind.current) {
      homeAspect.current = aspect;
      homeKind.current = layout;
      home.current = fitHome(aspect, CAMERA_FOV, layout);
      if (!isFocused.current && !glideRef.current) {
        activeCamera.position.copy(home.current.position);
        currentLookTarget.copy(home.current.target);
        activeCamera.lookAt(currentLookTarget);
      }
    }

    const glide = glideRef.current;
    if (glide) {
      const progress = Math.min(1, Math.max(0, (state.clock.elapsedTime - glide.startedAt) / GLIDE_SECONDS));
      const eased = 1 - (1 - progress) ** 3;
      activeCamera.position.lerpVectors(glide.fromPosition, glide.toPosition, eased);
      currentLookTarget.lerpVectors(glide.fromTarget, glide.toTarget, eased);
      activeCamera.lookAt(currentLookTarget);
      if (progress === 1) glideRef.current = null;
      else invalidate();
      return;
    }

    if (isFocused.current) return;
    if (reducedMotionRef.current) {
      activeCamera.position.copy(home.current.position);
      activeCamera.lookAt(home.current.target);
      return;
    }

    const spring = pointerSpring.current;
    const targetX = pointerTarget.current.x * POINTER_LIMIT_YAW;
    const targetY = -pointerTarget.current.y * POINTER_LIMIT_PITCH;
    const step = Math.min(delta, 0.05);
    const stiffness = 56;
    const damping = 15;
    spring.vx += ((targetX - spring.x) * stiffness - spring.vx * damping) * step;
    spring.vy += ((targetY - spring.y) * stiffness - spring.vy * damping) * step;
    spring.x += spring.vx * step;
    spring.y += spring.vy * step;

    direction.copy(home.current.position).sub(home.current.target);
    pointerRotation.set(spring.y, spring.x, 0);
    desiredPosition.copy(direction).applyEuler(pointerRotation).add(home.current.target);
    activeCamera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 11));
    currentLookTarget.copy(home.current.target);
    activeCamera.lookAt(currentLookTarget);
  });

  return (
    <CameraRigContext.Provider value={api}>
      {children}
    </CameraRigContext.Provider>
  );
}
