"use client";

import { motion } from "motion/react";
import { useScrollLinkedIndex } from "@/hooks/useScrollLinkedIndex";
import { landingStories } from "@/data/landing";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { getLandingAccentStyle, renderIcon } from "@/lib/utils";
import Tag from "@/components/ui/Tag";
import WorkStackMeta from "./WorkStackMeta";
import WorkStackVisual from "./WorkStackVisual";
import styles from "./LandingFrame2WorkStack.module.css";

// =============================================================================
// LandingFrame2WorkStack — Story-vignette frame.
// Uses sticky scroll on motion-capable layouts and a static card grid fallback
// when reduced motion is requested.
// =============================================================================

interface LandingFrame2WorkStackProps {
  staticMode?: boolean;
}

function StoryCard({ story }: { story: (typeof landingStories)[number] }) {
  return (
    <>
      <span className={styles.mobileCaseLabel}>{story.eyebrow}</span>
      <div className={styles.mobileIcon}>
        {renderIcon(story.icon, { size: 44, strokeWidth: 0.9 })}
      </div>
      <h3 className={styles.mobileTitle}>{story.title}</h3>
      <p className={styles.mobileDescription}>{story.summary}</p>
      <div className={styles.mobileTags}>
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
  const { containerRef, activeIndex, progress } = useScrollLinkedIndex({
    itemCount: landingStories.length,
  });

  if (staticMode) {
    return (
      // Static mode preserves the same content and anchor target without any
      // sticky-scroll dependency, which keeps reduced-motion behavior reliable.
      <section
        id="story-vignettes"
        className={styles.staticSection}
        aria-label="Story vignettes"
      >
        <div className={styles.staticContainer}>
          <span className={styles.sectionLabel}>Story Vignettes</span>
          <div className={styles.staticGrid}>
            {landingStories.map((story) => (
              <article
                key={story.id}
                className={styles.mobileCard}
                style={getLandingAccentStyle(story.accent)}
              >
                <StoryCard story={story} />
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
      <div
        ref={containerRef}
        id="story-vignettes"
        className={styles.workStackOuter}
        style={{ height: `${landingStories.length * 100}vh` }}
        aria-label="Story vignettes"
      >
        <div className={styles.workStackSticky}>
          <span className={styles.sectionLabel}>Story Vignettes</span>
          <div className={styles.workStackGrid}>
            <WorkStackMeta activeIndex={activeIndex} stories={landingStories} />
            <WorkStackVisual activeIndex={activeIndex} stories={landingStories} />
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              style={{ scaleX: progress }}
            />
          </div>
        </div>
      </div>

      {/* Mobile keeps the same project content but avoids sticky scroll entirely. */}
      <motion.div
        id="story-vignettes-mobile"
        className={styles.mobileList}
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <span className={styles.sectionLabel}>Story Vignettes</span>
        {landingStories.map((story) => (
          <motion.div
            key={story.id}
            className={styles.mobileCard}
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
