import Link from "next/link";
import BeyondPhotoWall from "@/components/beyond-terminal/BeyondPhotoWall";
import BeyondRouteReadySignal from "@/components/beyond-terminal/BeyondRouteReadySignal";
import { getBeyondAlbumItems } from "@/lib/portfolioContent";
import styles from "./page.module.css";

const beyondPhotoWallIntro = {
  eyebrow: "Beyond the Build",
  title: "Beyond The Terminal",
  deck: "Photos, people, notes, and the parts that don't fit inside a resume.",
};

export default function BeyondTerminalPage() {
  return (
    <div className={styles.stack} data-beyond-landing>
      <BeyondRouteReadySignal href="/beyond-terminal" focusTargetId="beyond-hero-title" />
      <BeyondPhotoWall items={getBeyondAlbumItems()} intro={beyondPhotoWallIntro} />
      <footer className={styles.footer}>
        <span>End of album seed</span>
        <Link href="/" className={styles.homeLink}>
          Return home
        </Link>
      </footer>
    </div>
  );
}
