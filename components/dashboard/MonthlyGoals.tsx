"use client";

import { kpiMes, REPORT_PERIODO } from "@/lib/mock-data";

type Estado = "green" | "yellow" | "red";

const STATE = {
  green:  { arc: "#16a34a", glow: "#bbf7d0", needle: "#15803d", label: "En meta",   labelCls: "text-green-700 bg-green-50 border-green-200" },
  yellow: { arc: "#d97706", glow: "#fde68a", needle: "#b45309", label: "Cerca",     labelCls: "text-amber-700 bg-amber-50 border-amber-200" },
  red:    { arc: "#dc2626", glow: "#fecaca", needle: "#b91c1c", label: "Bajo meta", labelCls: "text-red-700 bg-red-50 border-red-200" },
};

// ── SVG Gauge ──────────────────────────────────────────────
// ViewBox 0 0 200 120 — semicircle centre (100, 108), r=88
const CX = 100;
const CY = 108;
const R  = 88;
const TRACK_W = 14;

function polarToXY(angleDeg: number, radius: number) {
  // 0° = left end, 180° = right end (clockwise along top)
  const rad = (Math.PI * angleDeg) / 180;
  return {
    x: CX - radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),
  };
}

function arcPath(startDeg: number, endDeg: number, r: number) {
  const s = polarToXY(startDeg, r);
  const e = polarToXY(endDeg, r);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// Tick labels at 0%, 25%, 50%, 75%, 100%
const TICKS = [
  { deg: 0,   label: "0%"   },
  { deg: 45,  label: "25%"  },
  { deg: 90,  label: "50%"  },
  { deg: 135, label: "75%"  },
  { deg: 180, label: "100%" },
];

function SemiGauge({ pct, estado }: { pct: number; estado: Estado }) {
  const c = STATE[estado];
  const clamped = Math.min(Math.max(pct, 0), 100);
  // Arc runs from 0° to 180°, fill = 0° to clamped*1.8°
  const fillEnd = clamped * 1.8; // maps 0-100% → 0-180°
  const needleDeg = clamped * 1.8;
  const needleTip = polarToXY(needleDeg, R - 8);
  const needleBase1 = polarToXY(needleDeg + 90, 7);
  const needleBase2 = polarToXY(needleDeg - 90, 7);

  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-hidden="true">
      <defs>
        <filter id={`glow-${estado}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track (full arc background) */}
      <path
        d={arcPath(0, 180, R)}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={TRACK_W}
        strokeLinecap="round"
      />

      {/* Fill arc */}
      {clamped > 0 && (
        <path
          d={arcPath(0, fillEnd, R)}
          fill="none"
          stroke={c.arc}
          strokeWidth={TRACK_W}
          strokeLinecap="round"
          filter={`url(#glow-${estado})`}
          opacity="0.9"
        />
      )}

      {/* Inner subtle track line */}
      <path
        d={arcPath(0, 180, R - TRACK_W / 2 - 2)}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="2 4"
        opacity="0.7"
      />

      {/* Tick marks */}
      {TICKS.map(({ deg }) => {
        const outer = polarToXY(deg, R + 6);
        const inner = polarToXY(deg, R - TRACK_W / 2 - 2);
        return (
          <line
            key={deg}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Tick labels */}
      {TICKS.map(({ deg, label }) => {
        const pos = polarToXY(deg, R + 18);
        return (
          <text
            key={deg}
            x={pos.x} y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fill="#94a3b8"
            fontFamily="system-ui, sans-serif"
          >
            {label}
          </text>
        );
      })}

      {/* Needle shadow */}
      <line
        x1={CX} y1={CY}
        x2={needleTip.x} y2={needleTip.y}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="4"
        strokeLinecap="round"
        transform="translate(1,2)"
      />

      {/* Needle */}
      <polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
        fill={c.needle}
        opacity="0.95"
      />

      {/* Hub outer ring */}
      <circle cx={CX} cy={CY} r="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
      {/* Hub inner */}
      <circle cx={CX} cy={CY} r="6" fill={c.arc} />
    </svg>
  );
}

// ── Gauge Card ─────────────────────────────────────────────
type GaugeProps = {
  label: string;
  valueLine1: string;
  valueLine2: string;
  objetivo: string;
  pct: number;
  estado: Estado;
};

function GaugeCard({ label, valueLine1, valueLine2, objetivo, pct, estado }: GaugeProps) {
  const c = STATE[estado];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
      {/* Label */}
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold text-center mb-1">
        {label}
      </p>

      {/* Gauge SVG */}
      <div className="w-full">
        <SemiGauge pct={pct} estado={estado} />
      </div>

      {/* Percentage — centred below gauge */}
      <p
        className="text-2xl font-black leading-none -mt-2 tabular-nums"
        style={{ color: c.arc }}
      >
        {pct.toFixed(1)}
        <span className="text-base font-bold">%</span>
      </p>

      {/* Divider */}
      <div className="w-10 h-px bg-slate-200 my-2.5" />

      {/* Values */}
      <div className="w-full space-y-1">
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-[10px] text-slate-400 whitespace-nowrap">Acumulado</span>
          <span className="text-[11px] font-bold text-slate-700 text-right leading-tight">
            {valueLine1}
            {valueLine2 && <span className="block text-[9px] font-normal text-slate-400">{valueLine2}</span>}
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-[10px] text-slate-400">Objetivo</span>
          <span className="text-[10px] text-slate-500 text-right">{objetivo}</span>
        </div>
      </div>

      {/* Status badge */}
      <div
        className={`mt-2.5 w-full text-center py-1 rounded-lg text-[10px] font-bold border ${c.labelCls}`}
      >
        {c.label}
      </div>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────
export function MonthlyGoals() {
  const { facturacion, clientes, changoPromedio } = kpiMes;

  const facPct    = (facturacion.acumulado    / facturacion.metaMes)    * 100;
  const cliPct    = (clientes.acumulado       / clientes.metaMes)       * 100;
  const changoPct = (changoPromedio.acumulado / changoPromedio.metaMes) * 100;

  const getEstado = (p: number): Estado =>
    p >= 100 ? "green" : p >= 85 ? "yellow" : "red";

  const fmtShort = (n: number) => {
    if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(3).replace(".", ",") + " B";
    if (n >= 1_000_000)     return "$" + (n / 1_000_000).toFixed(2).replace(".", ",") + " M";
    return "$" + n.toLocaleString("es-AR");
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div
        className="px-4 py-2.5 border-b border-border flex items-center justify-between"
        style={{ background: "#0d1b35" }}
      >
        <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
          Objetivos del Mes &mdash; {REPORT_PERIODO}
        </p>
        <span className="text-[10px] text-slate-400">Acumulado mensual</span>
      </div>

      <div className="flex-1 p-3 grid grid-cols-3 gap-3">
        <GaugeCard
          label="Meta Facturación"
          valueLine1={fmtShort(facturacion.acumulado)}
          valueLine2=""
          objetivo={fmtShort(facturacion.metaMes)}
          pct={facPct}
          estado={getEstado(facPct)}
        />
        <GaugeCard
          label="Meta Clientes"
          valueLine1={clientes.acumulado.toLocaleString("es-AR")}
          valueLine2="transacciones"
          objetivo={clientes.metaMes.toLocaleString("es-AR")}
          pct={cliPct}
          estado={getEstado(cliPct)}
        />
        <GaugeCard
          label="Chango Promedio"
          valueLine1={changoPromedio.acumulado.toFixed(2) + " ítem"}
          valueLine2=""
          objetivo={changoPromedio.metaMes.toFixed(2) + " ítem"}
          pct={changoPct}
          estado={getEstado(changoPct)}
        />
      </div>
    </div>
  );
}
