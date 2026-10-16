"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProjectStoryVisual, ProjectTenantId, ProjectTenantOption } from "@/types";
import styles from "./TenantSwitcher.module.css";

interface TenantSwitcherProps {
  label: string;
  defaultId: ProjectTenantId;
  options: ProjectTenantOption[];
  visuals: ProjectStoryVisual[];
}

export default function TenantSwitcher({ label, defaultId, options, visuals }: TenantSwitcherProps) {
  const [selectedId, setSelectedId] = useState(defaultId);
  const visualById = new Map(visuals.map((visual) => [visual.id, visual]));
  const selected = options.find((option) => option.id === selectedId) ?? options[0];
  const visual = selected ? visualById.get(selected.visualId) : undefined;

  return (
    <div className={styles.switcher}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{label}</legend>
        <div className={styles.options}>
          {options.map((option) => (
            <label className={styles.option} key={option.id}>
              <input
                type="radio"
                name="velo-tenant"
                value={option.id}
                checked={selectedId === option.id}
                onChange={() => setSelectedId(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {visual && selected ? (
        <figure className={styles.figure}>
          {/* One frame, one ratio: both tenants share it exactly, so switching
              compares like for like. Desktop shows the whole 1440x750 desk;
              phones pan out to the fleet map at the centre of the screen. */}
          <div className={styles.frame}>
            <div className={styles.frameInner}>
              <Image
                key={visual.id}
                src={visual.src}
                alt={visual.alt}
                fill
                sizes="(max-width: 767px) 360px, 1104px"
                className={styles.image}
              />
            </div>
          </div>
          <figcaption className={styles.caption}>{visual.caption}</figcaption>
        </figure>
      ) : null}
    </div>
  );
}
