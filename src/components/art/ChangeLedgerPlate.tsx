import styles from "./ChangeLedgerPlate.module.css";
import { HalftonePattern } from "./HalftonePattern";

interface ChangeLedgerPlateProps {
  id: string;
}

export default function ChangeLedgerPlate({ id }: ChangeLedgerPlateProps) {
  const patternId = `change-ledger-dots-${id}`;

  return (
    <svg className={styles.plate} viewBox="0 0 320 350" aria-hidden="true" focusable="false">
      <defs><HalftonePattern id={patternId} size={6} radius={1.1} /></defs>
      <path d="m46 39 237 10-7 281-237-9z" fill="var(--plate-second)" />
      <path d="M54 59h237v279H54z" fill={`url(#${patternId})`} opacity=".45" />
      <path d="M30 52V27h76l11 13h42V24h65l10 16h38v282H30z" fill="var(--plate-paper)" stroke="var(--plate-ink)" strokeWidth="1.8" />
      <path d="M30 52V27h76l11 13h42V24h65l10 16h38v29H30z" fill="var(--plate-accent)" />
      <path d="M44 42h34M171 40h24M208 40h12M44 58h102" stroke="var(--plate-paper)" strokeWidth="1.8" />
      <path d="M45 77h211M45 300h199" stroke="var(--plate-ink)" strokeWidth="1" />
      <path d="M68 101v150" stroke="var(--plate-second)" strokeWidth="7" />
      <path d="M65 99v151" stroke="var(--plate-accent)" strokeWidth="2" />
      {[99, 149, 199, 249].map((y, index) => (
        <g key={y}>
          <circle cx="65" cy={y} r="7" fill={index === 3 ? "var(--plate-accent)" : "var(--plate-paper)"} stroke="var(--plate-accent)" strokeWidth="2" />
          <text x="83" y={y + 4} fill="var(--plate-accent)" fontFamily="var(--font-label, monospace)" fontSize="10">0{index + 1}</text>
          <path d={`M108 ${y - 2}h133M108 ${y + 10}h107M108 ${y + 21}h77`} stroke="var(--plate-ink)" strokeWidth="1.3" strokeOpacity=".55" />
        </g>
      ))}
      <path d="M239 322v-26h33" fill="var(--plate-second)" stroke="var(--plate-ink)" strokeWidth="1.5" />
      <path d="m239 296 33 26" stroke="var(--plate-ink)" strokeWidth="1.5" />
      <path d="M25 333h175M31 341h43M81 341h24" stroke="var(--plate-accent)" strokeWidth="2" />
      <path d="M292 28v19M283 37h18" stroke="var(--plate-ink)" strokeWidth="1.2" />
    </svg>
  );
}
