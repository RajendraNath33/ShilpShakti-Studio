export function MountainBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-mountain-gradient dark:bg-mountain-gradient" />
      <div className="absolute inset-0 bg-mesh-radial" />

      {/* Sun / moon glow */}
      <div className="absolute right-[10%] top-[8%] h-40 w-40 rounded-full bg-sunrise-400/20 blur-3xl dark:bg-sunrise-400/10" />

      {/* Mountain silhouettes */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        {/* Back range */}
        <path
          d="M0 280 L120 200 L220 250 L340 160 L460 220 L580 140 L700 200 L820 120 L940 180 L1060 100 L1200 200 L1200 400 L0 400 Z"
          className="fill-dusk-700/30 dark:fill-dusk-800/40"
        />
        {/* Mid range */}
        <path
          d="M0 320 L80 260 L180 300 L300 220 L420 280 L540 200 L660 260 L780 180 L900 240 L1020 160 L1140 220 L1200 200 L1200 400 L0 400 Z"
          className="fill-dusk-700/40 dark:fill-dusk-800/60"
        />
        {/* Front range */}
        <path
          d="M0 360 L100 300 L220 340 L360 260 L500 320 L640 240 L780 300 L920 220 L1060 280 L1200 240 L1200 400 L0 400 Z"
          className="fill-dusk-800/50 dark:fill-dusk-950/70"
        />
        {/* Snow caps highlights */}
        <path
          d="M340 160 L360 180 L380 170 M580 140 L600 165 L620 150 M820 120 L840 145 L860 135 M1060 100 L1080 125 L1100 110"
          className="stroke-summit-300/20 dark:stroke-summit-300/10"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Stars (dark mode only) */}
      <div className="absolute inset-0 hidden dark:block">
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/40 animate-pulse-soft"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const STARS = [
  { x: 12, y: 8, size: 2, delay: 0 },
  { x: 25, y: 15, size: 1, delay: 1.2 },
  { x: 38, y: 6, size: 2, delay: 0.6 },
  { x: 52, y: 12, size: 1, delay: 2.1 },
  { x: 65, y: 4, size: 2, delay: 0.3 },
  { x: 78, y: 10, size: 1, delay: 1.8 },
  { x: 88, y: 18, size: 2, delay: 0.9 },
  { x: 18, y: 22, size: 1, delay: 1.5 },
  { x: 45, y: 25, size: 1, delay: 0.4 },
  { x: 72, y: 22, size: 1, delay: 2.3 },
];
