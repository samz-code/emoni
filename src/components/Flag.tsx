// src/components/Flag.tsx
// Real flag images (emoji flags show as "US", "GB" letters on Windows, so they are not reliable).
// Source: flagcdn.com. To avoid a third-party dependency, download the PNGs into /public/flags/
// and change the two URLs below to `/flags/${code}.png`.

interface FlagProps {
  code: string; // ISO 3166-1 alpha-2, lowercase: "us", "gb", "ke"
  size?: number; // width in px
}

export const Flag = ({ code, size = 32 }: FlagProps) => (
  <img
    src={`https://flagcdn.com/w80/${code}.png`}
    srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
    width={size}
    height={Math.round(size * 0.75)}
    alt=""
    aria-hidden="true"
    loading="lazy"
    className="shrink-0 rounded-[2px] object-cover ring-1 ring-black/10"
  />
);

// Renders one flag, or several side by side (used for East Africa).
export const MarketFlags = ({ codes, size = 32 }: { codes: string[]; size?: number }) => (
  <span className="inline-flex items-center gap-1">
    {codes.map((c) => (
      <Flag key={c} code={c} size={size} />
    ))}
  </span>
);

export default Flag;