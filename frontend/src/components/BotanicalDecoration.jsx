// Elegant botanical / leaf line-art decorations
// Uses champagne (#D8C3A5), light gold (#C8A96B), and warm beige (#E7D8C5)
// Opacity is kept subtle (15% - 35%) so it never competes with content.

export function BotanicalBranch({ className = "", flip = false, rotate = 0, style = {} }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      width="280"
      height="280"
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        transform: `${flip ? "scaleX(-1) " : ""}${rotate ? `rotate(${rotate}deg)` : ""}`,
        ...style,
      }}
    >
      <g opacity="0.32">
        {/* Main stem curve */}
        <path
          d="M20 260 C 60 210, 110 150, 240 30"
          stroke="#C8A96B"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Secondary gentle flourish curve */}
        <path
          d="M80 190 C 130 180, 180 140, 220 90"
          stroke="#D8C3A5"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />

        {/* Delicate leaves along stem */}
        {[
          { cx: 50, cy: 225, rx: 14, ry: 7, rot: -45 },
          { cx: 75, cy: 200, rx: 16, ry: 8, rot: -30 },
          { cx: 85, cy: 220, rx: 15, ry: 7.5, rot: 25 },
          { cx: 110, cy: 170, rx: 18, ry: 8.5, rot: -40 },
          { cx: 125, cy: 190, rx: 17, ry: 8, rot: 35 },
          { cx: 145, cy: 135, rx: 19, ry: 9, rot: -35 },
          { cx: 160, cy: 155, rx: 18, ry: 8.5, rot: 40 },
          { cx: 180, cy: 100, rx: 17, ry: 8, rot: -30 },
          { cx: 195, cy: 120, rx: 16, ry: 7.5, rot: 45 },
          { cx: 215, cy: 65, rx: 15, ry: 7, rot: -25 },
          { cx: 235, cy: 40, rx: 13, ry: 6, rot: -45 },
        ].map((leaf, idx) => (
          <g key={idx} transform={`translate(${leaf.cx}, ${leaf.cy}) rotate(${leaf.rot})`}>
            {/* Leaf shape */}
            <path
              d={`M -${leaf.rx} 0 C -${leaf.rx * 0.5} -${leaf.ry * 1.5}, ${leaf.rx * 0.5} -${leaf.ry * 1.5}, ${leaf.rx} 0 C ${leaf.rx * 0.5} ${leaf.ry * 1.5}, -${leaf.rx * 0.5} ${leaf.ry * 1.5}, -${leaf.rx} 0 Z`}
              fill="#E7D8C5"
              fillOpacity="0.35"
              stroke="#D8C3A5"
              strokeWidth="0.9"
            />
            {/* Center vein */}
            <line
              x1={`-${leaf.rx * 0.85}`}
              y1="0"
              x2={`${leaf.rx * 0.85}`}
              y2="0"
              stroke="#C8A96B"
              strokeWidth="0.6"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Small budding berries / accents */}
        {[
          [100, 160],
          [135, 125],
          [170, 90],
          [205, 55],
        ].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r="2" fill="#C8A96B" opacity="0.6" />
        ))}
      </g>
    </svg>
  );
}

export function BotanicalCorner({ className = "", flip = false, rotate = 0 }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        transform: `${flip ? "scaleX(-1) " : ""}${rotate ? `rotate(${rotate}deg)` : ""}`,
      }}
    >
      <g opacity="0.28">
        {/* Soft curving vine */}
        <path
          d="M10 10 C 60 15, 110 50, 150 110 C 180 155, 200 195, 210 215"
          stroke="#C8A96B"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M10 40 C 40 45, 80 80, 105 130"
          stroke="#D8C3A5"
          strokeWidth="0.75"
          strokeLinecap="round"
        />

        {/* Leaf pairs */}
        {[
          { cx: 35, cy: 22, rx: 12, ry: 6, rot: 15 },
          { cx: 65, cy: 35, rx: 14, ry: 6.5, rot: 35 },
          { cx: 95, cy: 60, rx: 15, ry: 7, rot: 50 },
          { cx: 125, cy: 95, rx: 16, ry: 7.5, rot: 60 },
          { cx: 155, cy: 140, rx: 15, ry: 7, rot: 70 },
          { cx: 185, cy: 185, rx: 13, ry: 6, rot: 75 },
        ].map((leaf, idx) => (
          <g key={idx} transform={`translate(${leaf.cx}, ${leaf.cy}) rotate(${leaf.rot})`}>
            <path
              d={`M -${leaf.rx} 0 C -${leaf.rx * 0.5} -${leaf.ry * 1.4}, ${leaf.rx * 0.5} -${leaf.ry * 1.4}, ${leaf.rx} 0 C ${leaf.rx * 0.5} ${leaf.ry * 1.4}, -${leaf.rx * 0.5} ${leaf.ry * 1.4}, -${leaf.rx} 0 Z`}
              fill="#E7D8C5"
              fillOpacity="0.3"
              stroke="#D8C3A5"
              strokeWidth="0.8"
            />
          </g>
        ))}

        {/* Minimal ornamental circular dot */}
        <circle cx="20" cy="18" r="2.5" fill="#C8A96B" opacity="0.5" />
      </g>
    </svg>
  );
}

export function BotanicalSprig({ className = "", flip = false }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <g opacity="0.25">
        <path
          d="M20 160 Q 60 110, 150 30"
          stroke="#C8A96B"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        {[
          { cx: 50, cy: 125, rx: 11, ry: 5, rot: -30 },
          { cx: 65, cy: 135, rx: 10, ry: 4.5, rot: 40 },
          { cx: 90, cy: 85, rx: 12, ry: 5.5, rot: -35 },
          { cx: 105, cy: 95, rx: 11, ry: 5, rot: 35 },
          { cx: 130, cy: 45, rx: 11, ry: 5, rot: -40 },
        ].map((leaf, idx) => (
          <g key={idx} transform={`translate(${leaf.cx}, ${leaf.cy}) rotate(${leaf.rot})`}>
            <path
              d={`M -${leaf.rx} 0 C -${leaf.rx * 0.5} -${leaf.ry * 1.3}, ${leaf.rx * 0.5} -${leaf.ry * 1.3}, ${leaf.rx} 0 C ${leaf.rx * 0.5} ${leaf.ry * 1.3}, -${leaf.rx * 0.5} ${leaf.ry * 1.3}, -${leaf.rx} 0 Z`}
              fill="#E7D8C5"
              fillOpacity="0.3"
              stroke="#D8C3A5"
              strokeWidth="0.75"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
