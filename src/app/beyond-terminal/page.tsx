import Link from "next/link";
import BeyondRoomExperience from "@/components/beyond/shell/BeyondRoomExperience";
import RoomPoster from "@/components/beyond/shell/RoomPoster";
import BeyondRouteReadySignal from "@/components/beyond-terminal/BeyondRouteReadySignal";
import { getBeyondAlbumItems } from "@/lib/portfolioContent";
import styles from "./page.module.css";

const beyondIntro = "Photos, notes and people from the other side of the work.";

export default function BeyondTerminalPage() {
  return (
    <div className={styles.stack} data-beyond-landing>
      <BeyondRouteReadySignal
        href="/beyond-terminal"
        focusTargetId="beyond-hero-title"
      />
      <header className={styles.intro}>
        <h1 id="beyond-hero-title" tabIndex={-1}>
          Beyond the terminal
        </h1>
        <p>{beyondIntro}</p>
      </header>
      <BeyondRoomExperience items={getBeyondAlbumItems()} poster={<RoomPoster />} />
      <footer className={styles.footer}>
        <Link href="/" className={styles.homeLink}>
          Back to work
        </Link>
      </footer>
    </div>
  );
}
