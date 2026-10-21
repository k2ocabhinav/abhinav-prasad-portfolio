"use client";

// A slim replacement for fiber's <Canvas>. The stock component registers the
// whole three namespace with the reconciler (`extend(THREE)`), which makes every
// class in three ship to the browser. This one registers only what the room
// renders, so the bundler can drop the rest.
import {
  createRoot,
  events,
  extend,
  type RenderProps,
  type ReconcilerRoot,
} from "@react-three/fiber";
import type { ReactNode } from "react";
import { Component, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
} from "three";

extend({
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
});

type CanvasOptions = Pick<
  RenderProps<HTMLCanvasElement>,
  "gl" | "flat" | "dpr" | "camera" | "frameloop"
>;

class ThreeErrorBoundary extends Component<
  { children: ReactNode; onError: (error: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function ThreeCanvas({
  children,
  gl,
  flat,
  dpr,
  camera,
  frameloop,
}: CanvasOptions & { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<ReconcilerRoot<HTMLCanvasElement> | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0, top: 0, left: 0 });
  const [error, setError] = useState<unknown>(null);

  if (error) throw error;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      setSize((previous) =>
        previous.width === rect.width &&
        previous.height === rect.height &&
        previous.top === rect.top &&
        previous.left === rect.left
          ? previous
          : { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width <= 0 || size.height <= 0) return;
    rootRef.current ??= createRoot(canvas);
    const root = rootRef.current;
    root
      .configure({
        gl,
        flat,
        dpr,
        camera,
        frameloop,
        events,
        size,
        onCreated: (state) => {
          state.events.connect?.(wrapperRef.current ?? canvas);
        },
      })
      .then(() => {
        if (rootRef.current !== root) return;
        root.render(
          <ThreeErrorBoundary onError={setError}>
            <Suspense fallback={null}>{children}</Suspense>
          </ThreeErrorBoundary>,
        );
      })
      .catch(setError);
  }, [camera, children, dpr, flat, frameloop, gl, size]);

  useEffect(
    () => () => {
      const root = rootRef.current;
      rootRef.current = null;
      root?.unmount();
    },
    [],
  );

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
