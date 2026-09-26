export function AreaChart({ data, height = 220 }: { data: number[]; height?: number }) {
  const width = 600;
  const pad = 8;
  const max = Math.max(...data) * 1.1;
  const step = (width - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => [pad + i * step, height - pad - (v / max) * (height - pad * 2)]);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${points.at(-1)![0]},${height} L${points[0][0]},${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="area-stroke" x1="0" x2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={0}
          x2={width}
          y1={height * f}
          y2={height * f}
          stroke="rgba(255,255,255,0.06)"
        />
      ))}
      <path d={area} fill="url(#area-fill)" />
      <path d={line} fill="none" stroke="url(#area-stroke)" strokeWidth={3} strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#07070d" stroke="#a78bfa" strokeWidth={2} />
      ))}
    </svg>
  );
}

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-56 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs text-zinc-400">${(d.value / 1000).toFixed(1)}k</span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-400"
            style={{ height: `${(d.value / max) * 160}px` }}
          />
          <span className="text-xs text-zinc-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Meter({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full ${
          pct > 85 ? "bg-red-400" : "bg-gradient-to-r from-violet-500 to-cyan-400"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
