import Link from "next/link";
import BeyondPhotoWall from "@/components/beyond-terminal/BeyondPhotoWall";
import BeyondRouteReadySignal from "@/components/beyond-terminal/BeyondRouteReadySignal";
import { beyondAlbumItems, beyondPhotoWallIntro } from "@/data/beyondTerminal";
import styles from "./page.module.css";

export default function BeyondTerminalPage() {
  return (
    <div className={styles.stack} data-beyond-landing>
      <BeyondRouteReadySignal href="/beyond-terminal" focusTargetId="beyond-hero-title" />
      <BeyondPhotoWall items={beyondAlbumItems} intro={beyondPhotoWallIntro} />
      <footer className={styles.footer}>
        <span>End of album seed</span>
        <Link href="/" className={styles.homeLink}>
          Return home
        </Link>
      </footer>
    </div>
  );
}
