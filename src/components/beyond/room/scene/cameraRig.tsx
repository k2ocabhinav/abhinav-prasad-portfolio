"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Euler, PerspectiveCamera, Vector3 } from "three";
import type { CameraRig as CameraRigApi } from "../contracts";
import { CameraRigContext } from "../contracts";

const HOME_POSITION = new Vector3(8.2, 6.4, 10.5);
const HOME_TARGET = new Vector3(0, 2.15, 0);
const GLIDE_SECONDS = 0.9;
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
  const { camera, gl, invalidate, clock, size } = useThree();
  const cameraRef = useRef(camera);
  const glideRef = useRef<Glide | null>(null);
  const reducedMotionRef = useRef(false);
  const isFocused = useRef(false);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointerSpring = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const pointerRect = useRef<DOMRect | null>(null);
  const currentLookTarget = useMemo(() => HOME_TARGET.clone(), []);
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
    camera.position.copy(HOME_POSITION);
    camera.lookAt(HOME_TARGET);
    currentLookTarget.copy(HOME_TARGET);
    camera.updateProjectionMatrix();
  }, [camera, currentLookTarget]);

  const api = useMemo<CameraRigApi>(() => ({
    focus({ position, normal, size }) {
      isFocused.current = true;
      const target = new Vector3(...position);
      const face = new Vector3(...normal).normalize();
      const fov = "fov" in camera ? camera.fov : 38;
      const distance = Math.max(2.8, Math.min(6, size[1] / (2 * Math.tan((fov * Math.PI) / 360)) * 1.65));
      const toPosition = target.clone().addScaledVector(face, distance);
      toPosition.y += distance * 0.45;

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
        camera.position.copy(HOME_POSITION);
        camera.lookAt(HOME_TARGET);
        currentLookTarget.copy(HOME_TARGET);
        glideRef.current = null;
        invalidate();
        return;
      }

      glideRef.current = {
        startedAt: clock.elapsedTime,
        fromPosition: camera.position.clone(),
        toPosition: HOME_POSITION.clone(),
        fromTarget: currentLookTarget.clone(),
        toTarget: HOME_TARGET.clone(),
      };
      invalidate();
    },
  }), [camera, clock, currentLookTarget, invalidate]);

  useFrame((state, delta) => {
    const activeCamera = cameraRef.current;
    if (activeCamera instanceof PerspectiveCamera) {
      const responsiveFov = size.width / Math.max(size.height, 1) < 0.8 ? 80 : 40;
      if (activeCamera.fov !== responsiveFov) {
        activeCamera.fov = responsiveFov;
        activeCamera.updateProjectionMatrix();
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
      return;
    }

    if (reducedMotionRef.current || isFocused.current) return;

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

    direction.copy(HOME_POSITION).sub(HOME_TARGET);
    pointerRotation.set(spring.y, spring.x, 0);
    desiredPosition.copy(direction).applyEuler(pointerRotation).add(HOME_TARGET);
    activeCamera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 11));
    currentLookTarget.copy(HOME_TARGET);
    activeCamera.lookAt(currentLookTarget);
  });

  return (
    <CameraRigContext.Provider value={api}>
      {children}
    </CameraRigContext.Provider>
  );
}
