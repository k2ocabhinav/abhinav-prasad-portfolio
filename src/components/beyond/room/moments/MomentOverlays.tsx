"use client";
// STUB (track T2 replaces this file): DOM overlays outside the canvas:
// the postcard, the accessible "Everything in the room" list and the terminal toy.
import type { BeyondRoomProps } from "../contracts";

export default function MomentOverlays({ items }: BeyondRoomProps) {
  return (
    <section aria-label="Everything in the room">
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </section>
  );
}
