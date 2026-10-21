"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BeyondAlbumItem } from "@/types";
import { roomStore, useRoomState } from "../roomStore";
import { OPEN_MOMENTS_LIST_EVENT } from "./events";
import { useDialogBehavior } from "./dialogBehavior";
import MomentList from "./MomentList";
import PhotoDialog from "./PhotoDialog";
import PostcardDialog from "./PostcardDialog";
import TerminalDialog from "./TerminalDialog";

interface BeyondRoomProps {
  items: BeyondAlbumItem[];
}

export default function MomentOverlays({ items }: BeyondRoomProps) {
  const roomState = useRoomState();
  const [listExpanded, setListExpanded] = useState(false);
  const [photoForItemId, setPhotoForItemId] = useState<string | null>(null);
  const postcardRef = useRef<HTMLDivElement>(null);
  const postcardCloseRef = useRef<HTMLButtonElement>(null);
  const postcardReturnFocusRef = useRef<HTMLElement | null>(null);
  const photoDialogRef = useRef<HTMLDivElement>(null);
  const photoCloseRef = useRef<HTMLButtonElement>(null);
  const photoReturnFocusRef = useRef<HTMLElement | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalReturnFocusRef = useRef<HTMLElement | null>(null);

  const focusedMomentId = roomState.focus?.type === "moment" ? roomState.focus.id : null;
  const activeItem = focusedMomentId
    ? items.find((item) => item.id === focusedMomentId) ?? null
    : null;
  const terminalOpen = roomState.focus?.type === "laptop";
  const photoOpen = activeItem?.id === photoForItemId;

  const closePostcard = useCallback(() => {
    setPhotoForItemId(null);
    roomStore.set({ focus: null });
  }, []);
  const closePhoto = useCallback(() => setPhotoForItemId(null), []);
  const closeTerminal = useCallback(() => roomStore.set({ focus: null }), []);

  useEffect(() => {
    const openList = () => setListExpanded(true);
    window.addEventListener(OPEN_MOMENTS_LIST_EVENT, openList);
    return () => window.removeEventListener(OPEN_MOMENTS_LIST_EVENT, openList);
  }, []);

  useEffect(() => {
    if (terminalOpen && !terminalReturnFocusRef.current) {
      terminalReturnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    if (!terminalOpen) terminalReturnFocusRef.current = null;
  }, [terminalOpen]);

  useDialogBehavior({
    open: Boolean(activeItem),
    dialogRef: postcardRef,
    initialFocusRef: postcardCloseRef,
    restoreFocusRef: postcardReturnFocusRef,
    onEscape: closePostcard,
  });
  useDialogBehavior({
    open: Boolean(photoOpen),
    dialogRef: photoDialogRef,
    initialFocusRef: photoCloseRef,
    restoreFocusRef: photoReturnFocusRef,
    onEscape: closePhoto,
  });
  useDialogBehavior({
    open: terminalOpen,
    dialogRef: terminalRef,
    initialFocusRef: terminalInputRef,
    restoreFocusRef: terminalReturnFocusRef,
    onEscape: closeTerminal,
  });

  const openPhoto = () => {
    photoReturnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPhotoForItemId(activeItem?.id ?? null);
  };

  const openItemFromTerminal = (item: BeyondAlbumItem) => {
    postcardReturnFocusRef.current = terminalReturnFocusRef.current;
    roomStore.set({ focus: { type: "moment", id: item.id } });
  };

  return (
    <>
      <MomentList
        items={items}
        expanded={listExpanded}
        onToggle={() => setListExpanded((value) => !value)}
        onBodyFocus={() => setListExpanded(true)}
        onBodyBlur={(relatedTarget, currentTarget) => {
          if (!(relatedTarget instanceof Node) || !currentTarget.contains(relatedTarget)) {
            setListExpanded(false);
          }
        }}
      />
      {activeItem && typeof document !== "undefined"
        ? createPortal(
            <PostcardDialog
              key={activeItem.id}
              item={activeItem}
              onClose={closePostcard}
              onOpenPhoto={openPhoto}
              closeButtonRef={postcardCloseRef}
              dialogRef={postcardRef}
            />,
            document.body
          )
        : null}
      {activeItem && photoOpen && typeof document !== "undefined"
        ? createPortal(
            <PhotoDialog
              item={activeItem}
              onClose={closePhoto}
              closeButtonRef={photoCloseRef}
              dialogRef={photoDialogRef}
            />,
            document.body
          )
        : null}
      {terminalOpen && typeof document !== "undefined"
        ? createPortal(
            <TerminalDialog
              items={items}
              mode={roomState.mode}
              onClose={closeTerminal}
              onOpenItem={openItemFromTerminal}
              inputRef={terminalInputRef}
              dialogRef={terminalRef}
            />,
            document.body
          )
        : null}
    </>
  );
}
