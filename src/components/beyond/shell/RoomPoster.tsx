import Image from "next/image";
import styles from "./RoomPoster.module.css";

export default function RoomPoster() {
  return (
    <picture className={styles.posterPicture}>
      <source
        media="(max-width: 700px)"
        type="image/avif"
        srcSet="/beyond-terminal/poster/room-390x844.fc4f4d5c12.avif"
      />
      <source
        media="(max-width: 700px)"
        type="image/webp"
        srcSet="/beyond-terminal/poster/room-390x844.e8b9bd8952.webp"
      />
      <source
        type="image/avif"
        srcSet="/beyond-terminal/poster/room-1440x900.3a6e2a1254.avif"
      />
      <Image
        className={styles.poster}
        src="/beyond-terminal/poster/room-1440x900.1d5a52b68b.webp"
        alt="A colourful lilac room with a desk, a laptop and a wide window over green hills."
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        unoptimized
        data-room-poster="true"
      />
    </picture>
  );
}
