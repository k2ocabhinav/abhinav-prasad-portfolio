"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import type { ProjectDetail } from "@/types";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { landingFadeInUp, landingStagger, staggerItem } from "@/lib/animations";
import styles from "./ProjectDetailPage.module.css";

interface ProjectDetailPageProps {
  detail: ProjectDetail;
}

const GALLERY_TILE_CLASSES = [
  "galleryTile01",
  "galleryTile02",
  "galleryTile03",
  "galleryTile04",
  "galleryTile05",
  "galleryTile06",
] as const;

export default function ProjectDetailPage({ detail }: ProjectDetailPageProps) {
  return (
    <div className={styles.pageShell}>
      <header className={styles.chrome}>
        <div className={`content-container ${styles.chromeInner}`}>
          <Link href="/#work" className={styles.backLink}>
            ← Back to Works
          </Link>
          <span className={styles.chromeLabel}>Case Study</span>
        </div>
      </header>

      <main className={`content-container ${styles.main}`}>
        <motion.section
          variants={landingFadeInUp}
          initial="hidden"
          animate="visible"
          className={styles.hero}
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{detail.eyebrow}</p>
            <h1 className={styles.title}>{detail.title}</h1>
            <p className={styles.subtitle}>{detail.subtitle}</p>
            <p className={styles.scopeSummary}>{detail.scopeSummary}</p>
          </div>

          <div className={styles.heroMedia}>
            <Image
              src={detail.heroImage.src}
              alt={detail.heroImage.alt}
              fill
              priority
              className={styles.heroImage}
              sizes="(max-width: 1024px) 100vw, 56vw"
            />
            <span className={styles.heroCaption}>{detail.heroImage.caption}</span>
          </div>
        </motion.section>

        <motion.section
          variants={landingStagger(0.08)}
          initial="hidden"
          animate="visible"
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Gallery</h2>
          <div className={styles.galleryShell}>
            <div className={styles.galleryGrid}>
              {detail.gallery.map((shot, index) => (
                <motion.figure
                  key={`${shot.src}-${index}`}
                  variants={staggerItem}
                  className={cn(styles.galleryTile, styles[GALLERY_TILE_CLASSES[index] ?? ""])}
                >
                  <div className={styles.galleryImageWrap}>
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      className={styles.galleryImage}
                      sizes={
                        index === 0
                          ? "(max-width: 767px) 100vw, (max-width: 1199px) 100vw, 60vw"
                          : "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                      }
                    />
                    <figcaption className={styles.galleryCaption}>{shot.caption}</figcaption>
                  </div>
                </motion.figure>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={landingStagger(0.07)}
          initial="hidden"
          animate="visible"
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Architecture Deep Dive</h2>
          <div className={styles.architectureGrid}>
            {detail.architectureSections.map((section) => (
              <motion.article key={section.title} variants={staggerItem} className={styles.architectureCard}>
                <h3 className={styles.cardTitle}>{section.title}</h3>
                <p className={styles.cardDescription}>{section.description}</p>
                <ul className={styles.cardList}>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={landingStagger(0.07)}
          initial="hidden"
          animate="visible"
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Stack + Quality Gates</h2>
          <div className={styles.stackGrid}>
            {detail.stackBuckets.map((bucket) => (
              <motion.article key={bucket.label} variants={staggerItem} className={styles.stackCard}>
                <h3 className={styles.cardTitle}>{bucket.label}</h3>
                <div className={styles.chipList}>
                  {bucket.items.map((item) => (
                    <span key={item} className={styles.chip}>
                      {item}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>

          <motion.article variants={staggerItem} className={styles.qualityCard}>
            <h3 className={styles.cardTitle}>Reliability Highlights</h3>
            <ul className={styles.cardList}>
              {detail.qualityHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.article>
        </motion.section>

        {detail.references?.length ? (
          <motion.section
            variants={landingFadeInUp}
            initial="hidden"
            animate="visible"
            className={styles.section}
          >
            <h2 className={styles.sectionTitle}>References</h2>
            <div className={styles.referenceLinks}>
              {detail.references.map((link) =>
                link.href ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.referenceLink}
                  >
                    {link.label}
                  </a>
                ) : (
                  <span key={link.label} className={cn(styles.referenceLink, styles.referenceLinkDisabled)}>
                    {link.label}
                  </span>
                ),
              )}
            </div>
          </motion.section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
