import Link from "next/link";
import BeyondRouteReadySignal from "@/components/beyond-terminal/BeyondRouteReadySignal";
import BeyondSceneShell from "@/components/beyond-terminal/BeyondSceneShell";
import FeatureMediaCard from "@/components/beyond-terminal/FeatureMediaCard";
import FieldNoteCard from "@/components/beyond-terminal/FieldNoteCard";
import HeroStatementCard from "@/components/beyond-terminal/HeroStatementCard";
import JournalFeatureCard from "@/components/beyond-terminal/JournalFeatureCard";
import MotionBridge from "@/components/beyond-terminal/MotionBridge";
import SplitArtifactCard from "@/components/beyond-terminal/SplitArtifactCard";
import { getFeaturedBeyondPosts } from "@/content/beyond-terminal/journal";
import {
  beyondActs,
  beyondExitCopy,
  beyondRouteIntro,
} from "@/data/beyondTerminal";
import styles from "./page.module.css";

export default function BeyondTerminalPage() {
  const featuredPosts = getFeaturedBeyondPosts();
  const [leadPost, ...supportingPosts] = featuredPosts;
  const [signalAct, artifactAct, fieldNotesAct] = beyondActs;
  const [statementCard, signalVisualCard] = signalAct.cards;
  const [disciplineCard, observationCard] = artifactAct.cards;
  const [journalCard] = fieldNotesAct.cards;

  return (
    <div className={styles.stack} data-beyond-landing>
      <BeyondRouteReadySignal href="/beyond-terminal" focusTargetId="beyond-hero-title" />
      <MotionBridge />

      <BeyondSceneShell
        id={signalAct.id}
        eyebrow={beyondRouteIntro.eyebrow}
        title={beyondRouteIntro.title}
        deck={beyondRouteIntro.deck}
        variant="hero"
      >
        <div className={styles.heroGrid}>
          <HeroStatementCard card={statementCard} />
          <FeatureMediaCard card={signalVisualCard} />
        </div>
      </BeyondSceneShell>

      <BeyondSceneShell
        id={artifactAct.id}
        eyebrow="Act II / Artifacts"
        title={artifactAct.title}
        deck={artifactAct.deck}
      >
        <div className={styles.artifactStack}>
          <SplitArtifactCard card={disciplineCard} />
          <SplitArtifactCard card={observationCard} />
        </div>
      </BeyondSceneShell>

      <BeyondSceneShell
        id={fieldNotesAct.id}
        eyebrow="Act III / Field Notes"
        title={fieldNotesAct.title}
        deck={fieldNotesAct.deck}
        variant="journal"
      >
        {leadPost ? <JournalFeatureCard card={journalCard} post={leadPost} /> : null}

        {supportingPosts.length ? (
          <div className={styles.archiveRail}>
            {supportingPosts.map((post) => (
              <FieldNoteCard key={post.slug} post={post} />
            ))}
          </div>
        ) : null}
      </BeyondSceneShell>

      <section className={styles.exitCard} data-beyond-reveal>
        <div className={styles.exitCopy}>
          <span className={styles.exitEyebrow}>{beyondExitCopy.eyebrow}</span>
          <h2 className={styles.exitTitle}>{beyondExitCopy.title}</h2>
          <p className={styles.exitDeck}>{beyondExitCopy.deck}</p>
        </div>
        <div className={styles.exitActions}>
          <Link href="/beyond-terminal/journal" className={styles.exitPrimary}>
            Read the archive
          </Link>
          <Link href="/" className={styles.exitSecondary}>
            Return home
          </Link>
        </div>
      </section>
    </div>
  );
}
