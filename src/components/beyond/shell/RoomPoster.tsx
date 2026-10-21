import Image from "next/image";
import styles from "./RoomPoster.module.css";

export default function RoomPoster() {
  return (
    <picture className={styles.posterPicture}>
      <source
        media="(max-width: 700px)"
        type="image/avif"
        srcSet="/beyond-terminal/poster/room-390x844.3e5d846a60.avif"
      />
      <source
        media="(max-width: 700px)"
        type="image/webp"
        srcSet="/beyond-terminal/poster/room-390x844.42cffce8c7.webp"
      />
      <source
        type="image/avif"
        srcSet="/beyond-terminal/poster/room-1440x900.f3fe8f4b44.avif"
      />
      <Image
        className={styles.poster}
        src="/beyond-terminal/poster/room-1440x900.4a09c748d4.webp"
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
