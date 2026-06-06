"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useScrollLinkedIndex } from "@/hooks/useScrollLinkedIndex";
import { landingStories } from "@/data/landing";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { getLandingAccentStyle, renderIcon } from "@/lib/utils";
import Tag from "@/components/ui/Tag";
import WorkStackMeta from "./WorkStackMeta";
import WorkStackVisual from "./WorkStackVisual";
import styles from "./LandingFrame2WorkStack.module.css";

// =============================================================================
// LandingFrame2WorkStack — Featured project story frame.
// Uses sticky scroll on motion-capable layouts and a static card grid fallback
// when reduced motion is requested.
// =============================================================================

interface LandingFrame2WorkStackProps {
  staticMode?: boolean;
}

function MobileStoryVisual({ story }: { story: (typeof landingStories)[number] }) {
  if (story.visual.kind === "screenshot" && story.visual.src) {
    return (
      <figure className={styles.mobileVisual}>
        <Image
          src={story.visual.src}
          alt={story.visual.alt}
          fill
          sizes="92vw"
          className={styles.mobileVisualImage}
        />
      </figure>
    );
  }

  return (
    <div className={styles.mobileVisual} role="img" aria-label={story.visual.alt}>
      <div className={styles.mobileSystemIcon}>
        {renderIcon(story.icon, { size: 54, strokeWidth: 0.8 })}
      </div>
      <span className={styles.mobileSystemLine} />
      <span className={styles.mobileSystemLineAlt} />
    </div>
  );
}

function StoryCard({
  story,
  showAllProof = false,
}: {
  story: (typeof landingStories)[number];
  showAllProof?: boolean;
}) {
  const primaryBeat = story.proofBeats[0];

  return (
    <>
      <div className={styles.mobileCardHeader}>
        <span className={styles.mobileCaseLabel}>{story.eyebrow}</span>
        <strong>{story.id}</strong>
      </div>
      <h3 className={styles.mobileTitle}>{story.claim}</h3>
      <p className={styles.mobileProjectName}>{story.title}</p>
      <MobileStoryVisual story={story} />
      <p className={styles.mobileDescription}>{story.summary}</p>
      <dl className={showAllProof ? styles.mobileProofRows : styles.mobileProofSpotlight}>
        {showAllProof ? (
          story.proofBeats.map((beat) => (
            <div key={beat.label} className={styles.mobileProofRow}>
              <dt>{beat.label}</dt>
              <dd>{beat.short}</dd>
            </div>
          ))
        ) : (
          <div className={styles.mobileProofRow}>
            <dt>{primaryBeat.label}</dt>
            <dd>{primaryBeat.short}</dd>
          </div>
        )}
      </dl>
      <div className={styles.mobileTags}>
        <span className={styles.mobileTechLabel}>Tech</span>
        {story.tags.map((tag) => (
          <Tag key={tag} label={tag} variant="subtle" />
        ))}
      </div>
      <p className={styles.mobileNote}>{story.note}</p>
    </>
  );
}

export default function LandingFrame2WorkStack({
  staticMode = false,
}: LandingFrame2WorkStackProps) {
  const { containerRef, activeIndex, activeProgress, progress } = useScrollLinkedIndex({
    itemCount: landingStories.length,
    disabled: staticMode,
  });
  const [isSectionActive, setIsSectionActive] = useState(!staticMode);
  const activeStory = landingStories[activeIndex];
  const activeStoryProgress = Math.max(
    0,
    Math.min(0.999, activeProgress * landingStories.length - activeIndex)
  );
  const activeBeatIndex = staticMode
    ? 0
    : Math.min(
        Math.floor(activeStoryProgress * activeStory.proofBeats.length),
        activeStory.proofBeats.length - 1
      );

  useEffect(() => {
    if (staticMode) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSectionActive(entry.isIntersecting),
      { threshold: [0, 0.08, 0.2] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef, staticMode]);

  if (staticMode) {
    return (
      // Static mode preserves the same content and anchor target without any
      // sticky-scroll dependency, which keeps reduced-motion behavior reliable.
      <section
        id="story-vignettes"
        className={styles.staticSection}
        aria-label="Featured project stories"
      >
        <div className={styles.staticContainer}>
          <span className={styles.sectionLabel}>Featured Work</span>
          <div className={styles.staticGrid}>
            {landingStories.map((story) => (
              <article
                key={story.id}
                className={styles.mobileCard}
                data-code-tone={story.projectCodeTone}
                style={getLandingAccentStyle(story.accent)}
              >
                <StoryCard story={story} showAllProof />
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Desktop/tablet sticky experience. The outer height creates scroll room. */}
      <section
        ref={containerRef}
        id="story-vignettes"
        className={styles.workStackOuter}
        data-case-active={isSectionActive ? "true" : "false"}
        style={{
          minHeight: `${(landingStories.length + 1) * 100}vh`,
          height: `${(landingStories.length + 1) * 100}svh`,
        }}
        aria-label="Featured project stories"
      >
        <div className={styles.workStackSticky}>
          <span className={styles.sectionLabel}>Featured Work</span>
          <div className={styles.workStackGrid}>
            <WorkStackMeta
              activeIndex={activeIndex}
              activeBeatIndex={activeBeatIndex}
              stories={landingStories}
            />
            <WorkStackVisual
              activeIndex={activeIndex}
              activeBeatIndex={activeBeatIndex}
              stories={landingStories}
            />
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              style={{ scaleX: progress }}
            />
          </div>
        </div>
      </section>

      {/* Mobile keeps the same project content but avoids sticky scroll entirely. */}
      <motion.div
        id="story-vignettes-mobile"
        className={styles.mobileList}
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <span className={styles.sectionLabel}>Featured Work</span>
        {landingStories.map((story) => (
          <motion.div
            key={story.id}
            className={styles.mobileCard}
            data-code-tone={story.projectCodeTone}
            variants={staggerItem}
            style={getLandingAccentStyle(story.accent)}
          >
            <StoryCard story={story} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
