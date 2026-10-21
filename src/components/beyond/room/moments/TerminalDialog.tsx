"use client";

import { useState, type FormEvent, type RefObject } from "react";
import type { BeyondAlbumItem } from "@/types";
import { roomStore } from "../roomStore";
import styles from "./MomentOverlays.module.css";

type TerminalLine = { kind: "command" | "output"; text: string };

export default function TerminalDialog({
  items,
  mode,
  onClose,
  onOpenItem,
  inputRef,
  dialogRef,
}: {
  items: BeyondAlbumItem[];
  mode: "day" | "night";
  onClose: () => void;
  onOpenItem: (item: BeyondAlbumItem) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
}) {
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: "output", text: "Type help to see what this little terminal can do." },
  ]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = command.trim();
    if (!raw) return;

    const [verb, ...argumentParts] = raw.split(/\s+/);
    const argument = argumentParts.join(" ");
    const normalized = verb.toLowerCase();
    let output = "";

    if (normalized === "help") {
      output = "help, whoami, ls, open <id>, coffee, chai, lights, exit";
    } else if (normalized === "whoami") {
      output = "A full-stack engineer, saving the good bits for after hours.";
    } else if (normalized === "ls") {
      output = items.map((item) => `${item.id}  ${item.title}`).join("\n") || "The room is still empty.";
    } else if (normalized === "open") {
      const found = items.find(
        (item) =>
          item.id.toLowerCase() === argument.toLowerCase() ||
          item.title.toLowerCase() === argument.toLowerCase()
      );
      if (found) {
        onOpenItem(found);
        setCommand("");
        return;
      }
      output = `No moment found for ${argument || "that name"}.`;
    } else if (normalized === "coffee") {
      output = "Coffee break noted. The mug is ready.";
    } else if (normalized === "chai") {
      output = "Chai break noted. Let the kettle take its time.";
    } else if (normalized === "lights") {
      roomStore.set({ mode: mode === "day" ? "night" : "day" });
      output = `The room is in ${mode === "day" ? "night" : "day"} mode.`;
    } else if (normalized === "exit") {
      onClose();
      return;
    } else if (normalized === "sudo") {
      output = "Permission denied. The mug has admin rights.";
    } else if (normalized === "dance") {
      output = "No dance engine installed. Two steps still count.";
    } else if (normalized === "42") {
      output = "A good answer. Still waiting for the question.";
    } else {
      output = `Command not found: ${verb}. Try help.`;
    }

    setLines((current) => [
      ...current,
      { kind: "command", text: `› ${raw}` },
      { kind: "output", text: output },
    ]);
    setCommand("");
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.terminalDialog}
        role="dialog"
        aria-modal="true"
        aria-label="Laptop terminal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close terminal"
        >
          Close
        </button>
        <div className={styles.terminalFrame}>
          <header className={styles.terminalHeader}>
            <span>After-hours terminal</span>
            <span>{mode}</span>
          </header>
          <div className={styles.terminalOutput} aria-live="polite" aria-relevant="additions text">
            {lines.map((line, index) => (
              <p className={line.kind === "command" ? styles.commandLine : ""} key={`${index}-${line.text}`}>
                {line.text}
              </p>
            ))}
          </div>
          <form className={styles.terminalForm} onSubmit={submit}>
            <label htmlFor="beyond-terminal-command">$</label>
            <input
              ref={inputRef}
              id="beyond-terminal-command"
              value={command}
              onChange={(event) => setCommand(event.currentTarget.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            <button type="submit">Run</button>
          </form>
        </div>
      </div>
    </div>
  );
}
