import styles from "./TimezoneMap.module.css";
import { HalftonePattern } from "./HalftonePattern";

export default function TimezoneMap() {
  return (
    <svg className={styles.plate} viewBox="0 0 800 400" aria-hidden="true" focusable="false">
      <defs><HalftonePattern id="timezone-map-dots" size={7} radius={.9} /></defs>
      <path d="M28 209c159-139 491-156 740-9M38 261c198 84 486 67 714-20M253 44c-42 86-47 210-2 299M533 40c43 83 50 214 8 300" fill="none" stroke="var(--plate-accent)" strokeWidth="1" strokeOpacity=".3" strokeDasharray="3 7" />
      <path d="m51 158 19-29 25-9c7-23 30-39 49-35l22 17 29-4 20 18-5 27 26 16-9 30-32 7-7 29-27 17-8 39-20 36-21-8-5-36-26-20-6-28-27-6-13-24-23-4z" fill="var(--plate-accent)" stroke="var(--plate-ink)" strokeWidth="1.8" />
      <path d="m68 164 25-23M79 188l39-34M104 202l37-32M118 231l37-33M132 257l20-19" stroke="var(--plate-paper)" strokeWidth="1.2" strokeOpacity=".5" />
      <path d="M290 94c16-9 35-32 55-27l14 14 29-10 30 17 5 26-19 12-5 30-20 10-9 31-15 12-20-20 4-30-24-9-1-25-23-12z" fill="var(--plate-paper)" stroke="var(--plate-accent)" strokeWidth="2" />
      <path d="m404 164 32-9 28 16 10 27-16 23-5 36-22 19-10 36-22-13-6-38-16-30 10-24-6-22z" fill="var(--plate-paper)" stroke="var(--plate-accent)" strokeWidth="2" />
      <path d="m404 164 32-9 28 16 10 27-16 23-5 36-22 19-10 36-22-13-6-38-16-30 10-24-6-22z" fill="url(#timezone-map-dots)" opacity=".3" />
      <path d="M466 110c22-8 29-25 53-19l23 14 25-14 25 10 12-11 29 15 21-1 18 22 28 7 16 30-22 16-7 28-31 3-23 24-28-8-23 15-21-21-29-2-8-23-25-15 4-24-22-9z" fill="var(--plate-paper)" stroke="var(--plate-accent)" strokeWidth="2" />
      <path d="m642 272 23-14 24 6 10 25-20 17-28-11z" fill="var(--plate-accent)" />
      <path d="M163 251c62-123 124-150 197-71M360 180c51-97 123-99 200-40M560 140c44-12 109 15 136 62" fill="none" stroke="var(--plate-ink)" strokeWidth="2.5" strokeDasharray="3 7" strokeLinecap="round" />
      <path d="M362 182c51-97 123-99 200-40" fill="none" stroke="var(--plate-second)" strokeWidth="1.4" strokeDasharray="3 7" strokeLinecap="round" />
      <g fill="var(--plate-paper)" stroke="var(--plate-accent)" strokeWidth="2">
        <circle cx="163" cy="251" r="5" />
        <circle cx="696" cy="202" r="5" />
        <circle cx="360" cy="180" r="12" />
        <circle cx="560" cy="140" r="12" />
      </g>
      <circle cx="712" cy="72" r="32" fill="var(--plate-paper)" stroke="var(--plate-accent)" strokeWidth="1.8" />
      <path d="M712 40a32 32 0 0 1 0 64z" fill="var(--plate-second)" stroke="var(--plate-accent)" strokeWidth="1.6" />
      <path d="M712 24v-10M712 130v-10M664 72h-10M758 72h-10" stroke="var(--plate-accent)" strokeWidth="1.4" />
      <path d="M50 345h129M62 337v16M85 341v8M108 337v16M131 341v8M154 337v16M610 335h128M624 327v16M647 331v8M670 327v16M693 331v8M716 327v16" stroke="var(--plate-accent)" strokeWidth="1.3" />
    </svg>
  );
}
