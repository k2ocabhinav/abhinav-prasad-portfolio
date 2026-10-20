"use client";

import * as m from "motion/react-m";
import { useSpring, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ExplodedStack.module.css";

const stackSpring = { stiffness: 140, damping: 22, mass: 0.6 };

export default function ExplodedStack() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isPhone, setIsPhone] = useState(false);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end -50%"],
  });
  const collapse = useSpring(scrollYProgress, stackSpring);
  const staticStack = reduceMotion || isPhone;
  const interfaceDepth = useTransform(collapse, (progress) => staticStack ? 0 : -126 * progress);
  const backendDepth = useTransform(collapse, (progress) => staticStack ? 0 : -66 * progress);
  const dataDepth = useTransform(collapse, (progress) => staticStack ? 0 : -12 * progress);
  const tiltX = useSpring(0, stackSpring);
  const tiltY = useSpring(0, stackSpring);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => setIsPhone(mobileQuery.matches);
    updateMobile();
    mobileQuery.addEventListener("change", updateMobile);

    const stage = stageRef.current;
    if (!stage) {
      return () => mobileQuery.removeEventListener("change", updateMobile);
    }

    const frame = stage.closest<HTMLElement>("[data-home-hero-frame]");
    const visibilityTarget = frame ?? stage;
    let inView = false;
    const syncVisibility = () => {
      if (inView && document.visibilityState === "visible") {
        visibilityTarget.dataset.heroMotionVisible = "true";
      } else {
        delete visibilityTarget.dataset.heroMotionVisible;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      if (inView) {
        stage.dataset.motionReady = "true";
      }
      syncVisibility();
    }, { threshold: 0.01 });

    observer.observe(visibilityTarget);
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener("change", updateMobile);
      document.removeEventListener("visibilitychange", syncVisibility);
      delete visibilityTarget.dataset.heroMotionVisible;
    };
  }, []);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (staticStack || event.pointerType === "touch") return;
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;

    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    tiltX.set(-y * 12);
    tiltY.set(x * 12);
  }

  function resetTilt() {
    tiltX.set(0);
    tiltY.set(0);
  }

  return (
    <section
      className={styles.stackColumn}
      aria-labelledby="product-stack-title"
      data-product-stack="true"
    >
      <h2 id="product-stack-title" className={styles.srOnly}>
        Product layers, built with AI agents under review
      </h2>
      <p className={styles.srOnly}>
        An interface sits above backend services and APIs, with a data schema at
        the base. Three AI-agent lanes pass through review before work reaches
        each layer.
      </p>
      <div
        ref={stageRef}
        className={styles.stackStage}
        data-stack-stage="true"
        data-static={staticStack ? "true" : "false"}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <div className={styles.agentNote}>
          <span>AI agents, reviewed by me</span>
        </div>
        <svg
          className={styles.agentLanes}
          viewBox="0 0 640 420"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path className={styles.agentPath} d="M294 17v108" />
          <path className={styles.agentPath} d="M320 17v133" />
          <path className={styles.agentPath} d="M346 17v158" />
          <path className={styles.reviewTick} d="m288 125 6 6 11-12" />
          <path className={styles.reviewTick} d="m314 150 6 6 11-12" />
          <path className={styles.reviewTick} d="m340 175 6 6 11-12" />
          <circle className={`${styles.agentDot} ${styles.agentDotFirst}`} cx="294" cy="17" r="4" />
          <circle className={`${styles.agentDot} ${styles.agentDotSecond}`} cx="320" cy="17" r="4" />
          <circle className={`${styles.agentDot} ${styles.agentDotThird}`} cx="346" cy="17" r="4" />
        </svg>

        <svg
          className={styles.leaderLines}
          viewBox="0 0 640 420"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M462 105 524 78h80" />
          <circle cx="462" cy="105" r="3" />
          <path d="M485 208h119" />
          <circle cx="485" cy="208" r="3" />
          <path d="m188 300-69 42H28" />
          <circle cx="188" cy="300" r="3" />
        </svg>

        <m.div
          className={styles.tilt}
          style={{ rotateX: tiltX, rotateY: tiltY }}
          data-stack-tilt="true"
        >
          <div className={styles.assembly} aria-hidden="true">
            <m.div className={`${styles.sheetOffset} ${styles.dataOffset}`} style={{ z: reduceMotion ? 0 : dataDepth }}>
              <div className={`${styles.sheetFace} ${styles.dataFace}`}>
                <span className={styles.sheetCaption}>Data schema</span>
                <div className={styles.dataGrid}>
                  <span className={styles.dataHead}>field</span>
                  <span className={styles.dataHead}>type</span>
                  <span className={styles.dataHead}>key</span>
                  <span className={styles.dataKey}>id</span>
                  <span>uuid</span>
                  <span className={styles.dataKey}>PK</span>
                  <span>pickup</span>
                  <span>text</span>
                  <span>none</span>
                  <span>status</span>
                  <span>enum</span>
                  <span className={styles.dataKey}>IDX</span>
                  <span>created_at</span>
                  <span>time</span>
                  <span>none</span>
                </div>
              </div>
            </m.div>

            <m.div className={`${styles.sheetOffset} ${styles.backendOffset}`} style={{ z: reduceMotion ? 0 : backendDepth }}>
              <div className={`${styles.sheetFace} ${styles.backendFace}`}>
                <div className={styles.backendHeader}>
                  <span className={styles.sheetCaption}>Backend</span>
                  <span className={styles.backendSubtitle}>Services and APIs</span>
                  <span className={styles.authGuard}>Auth guard</span>
                </div>
                <div className={styles.backendFlow}>
                  <div className={styles.routes}>
                    <span className={styles.flowLabel}>Routes</span>
                    <code><b>POST</b> /bookings</code>
                    <code><b>GET</b> /trips/:id</code>
                  </div>
                  <div className={styles.serviceColumn}>
                    <div className={styles.serviceBox}>
                      <span className={styles.flowLabel}>Service</span>
                      <strong>Booking service</strong>
                    </div>
                    <div className={styles.serviceBox}>
                      <span className={styles.flowLabel}>Service</span>
                      <strong>Trip service</strong>
                    </div>
                  </div>
                  <div className={styles.queueBox}>
                    <span className={styles.flowLabel}>Queue</span>
                    <strong>Dispatch events</strong>
                  </div>
                </div>
                <svg className={styles.flowLines} viewBox="0 0 620 250" preserveAspectRatio="none">
                  <path d="M175 95h56m0 0v-35m0 35v62m0-62h70m95 0h68m-68 62h68" />
                  <circle cx="231" cy="95" r="3" />
                  <circle cx="464" cy="95" r="3" />
                </svg>
              </div>
            </m.div>

            <m.div className={`${styles.sheetOffset} ${styles.interfaceOffset}`} style={{ z: reduceMotion ? 0 : interfaceDepth }}>
              <div className={`${styles.sheetFace} ${styles.interfaceFace}`}>
                <span className={styles.sheetCaption}>Interface</span>
                <div className={styles.screenFrame}>
                  <aside className={styles.screenRail} aria-hidden="true">
                    <span className={styles.screenBrand} />
                    <span className={styles.screenNavActive} />
                    <span className={styles.screenNav} />
                    <span className={styles.screenNav} />
                  </aside>
                  <div className={styles.screenBody}>
                    <div className={styles.screenTopline}>
                      <strong>Trips</strong>
                      <span className={styles.screenAction}>New trip</span>
                    </div>
                    <div className={styles.screenTable}>
                      <div className={styles.screenTableHead}><span>Trip</span><span>Route</span><span>Status</span></div>
                      <div className={styles.screenRow}><span /><span /><i /></div>
                      <div className={styles.screenRow}><span /><span /><i /></div>
                      <div className={styles.screenRow}><span /><span /><i /></div>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </m.div>

        <nav className={styles.layerLinks} aria-label="Product stack layers">
          <a className={`${styles.layerLink} ${styles.interfaceLink}`} href="#work">Interface</a>
          <a className={`${styles.layerLink} ${styles.backendLink}`} href="#about">Backend</a>
          <a className={`${styles.layerLink} ${styles.dataLink}`} href="#experience">Data</a>
        </nav>
      </div>
      <nav className={styles.mobileLayerLinks} aria-label="Product stack layers">
        <a href="#work">Interface</a>
        <a href="#about">Backend</a>
        <a href="#experience">Data</a>
      </nav>
    </section>
  );
}
