"use client";

import Link from "next/link";
import { useRoomState, roomStore } from "@/components/beyond/room/roomStore";
import { OPEN_MOMENTS_EVENT } from "@/components/beyond/shell/events";
import { playRoomSound } from "@/components/beyond/shell/audio";
import styles from "./MinimalChrome.module.css";

export default function MinimalChrome() {
  const room = useRoomState();

  const toggleSound = () => {
    const soundOn = !room.soundOn;
    roomStore.set({ soundOn });
    playRoomSound(soundOn ? "paper" : "thud");
  };

  const toggleMode = () => {
    const mode = room.mode === "day" ? "night" : "day";
    roomStore.set({ mode });
    if (room.soundOn) playRoomSound("thud");
  };

  const openMoments = () => {
    window.dispatchEvent(new CustomEvent(OPEN_MOMENTS_EVENT));
  };

  return (
    <header className={styles.chrome} data-beyond-chrome>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Abhinav, back to work">
          Abhinav
        </Link>
        <nav className={styles.actions} aria-label="Room controls">
          <button
            type="button"
            aria-pressed={room.soundOn}
            onClick={toggleSound}
          >
            Sound {room.soundOn ? "on" : "off"}
          </button>
          <button
            type="button"
            aria-pressed={room.mode === "night"}
            onClick={toggleMode}
          >
            {room.mode === "night" ? "Day mode" : "Night mode"}
          </button>
          <button
            type="button"
            aria-controls="beyond-moments-list"
            onClick={openMoments}
          >
            Everything in the room
          </button>
        </nav>
      </div>
    </header>
  );
}
