export default function LogoSVG({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#ff9a9e" />
          <stop offset="1" stopColor="#fad0c4" />
        </linearGradient>
      </defs>
      <rect rx="12" width="64" height="64" fill="url(#g1)" />
      <g transform="translate(8,8)">
        <rect x="0" y="0" width="48" height="48" rx="8" fill="#fff" />
        <circle cx="24" cy="20" r="9" fill="#528bad" />
        <rect x="12" y="34" width="24" height="6" rx="2" fill="#528bad" />
      </g>
    </svg>
  );
}
