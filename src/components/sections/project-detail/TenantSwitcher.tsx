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
          <div className={styles.frame}>
            <Image
              key={visual.id}
              src={visual.src}
              alt={visual.alt}
              fill
              sizes="(max-width: 767px) 100vw, 1200px"
              className={styles.image}
            />
          </div>
          <figcaption className={styles.caption}>{visual.caption}</figcaption>
        </figure>
      ) : null}
    </div>
  );
}
