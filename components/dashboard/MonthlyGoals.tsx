"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Clock, AlertCircle } from "lucide-react";
import {
  loadAcumuladoMTD, loadMismoMesAA,
  hasMTDData,
  type BranchBreakdown,
} from "@/lib/report-session-store";

type Estado = "green" | "yellow" | "red";

const STATE = {
  green:  { arc: "#16a34a", glow: "#bbf7d0", needle: "#15803d", label: "En meta",   labelCls: "text-green-700 bg-green-50 border-green-200" },
  yellow: { arc: "#d97706", glow: "#fde68a", needle: "#b45309", label: "Cerca",     labelCls: "text-amber-700 bg-amber-50 border-amber-200" },
  red:    { arc: "#dc2626", glow: "#fecaca", needle: "#b91c1c", label: "Bajo meta", labelCls: "text-red-700 bg-red-50 border-red-200" },
};

// ── SVG Gauge ──────────────────────────────────────────────
const CX = 100;
const CY = 108;
const R  = 88;
const TRACK_W = 14;

function polarToXY(angleDeg: number, radius: number) {
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
  const fillEnd = clamped * 1.8;
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

      <path
        d={arcPath(0, 180, R)}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={TRACK_W}
        strokeLinecap="round"
      />

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

      <path
        d={arcPath(0, 180, R - TRACK_W / 2 - 2)}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="2 4"
        opacity="0.7"
      />

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

      <line
        x1={CX} y1={CY}
        x2={needleTip.x} y2={needleTip.y}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="4"
        strokeLinecap="round"
        transform="translate(1,2)"
      />

      <polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
        fill={c.needle}
        opacity="0.95"
      />

      <circle cx={CX} cy={CY} r="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r="6" fill={c.arc} />
    </svg>
  );
}

type GaugeProps = {
  label: string;
  actual: number;
  objetivo: number;
  formato: (n: number) => string;
  pctDias?: number;
};

function GaugeCard({ label, actual, objetivo, formato, pctDias }: GaugeProps) {
  const pct = objetivo > 0 ? (actual / objetivo) * 100 : 0;
  const estado: Estado = pct >= 100 ? "green" : pct >= 85 ? "yellow" : "red";
  const c = STATE[estado];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold text-center mb-1">
        {label}
      </p>

      <div className="w-full">
        <SemiGauge pct={pct} estado={estado} />
      </div>

      <p
        className="text-2xl font-black leading-none -mt-2 tabular-nums"
        style={{ color: c.arc }}
      >
        {pct.toFixed(1)}
        <span className="text-base font-bold">%</span>
      </p>

      <div className="w-10 h-px bg-slate-200 my-2.5" />

      <div className="w-full space-y-1">
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-[10px] text-slate-400 whitespace-nowrap">Actual</span>
          <span className="text-[11px] font-bold text-slate-700 text-right">
            {formato(actual)}
          </span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-[10px] text-slate-400">Objetivo AA</span>
          <span className="text-[10px] text-slate-500 text-right">{formato(objetivo)}</span>
        </div>
        {pctDias !== undefined && pctDias > 0 && (
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-[10px] text-slate-400">Ritmo esperado</span>
            <span className="text-[10px] text-slate-500 text-right">{formato(objetivo * pctDias / 100)}</span>
          </div>
        )}
      </div>

      <div
        className={`mt-2.5 w-full text-center py-1 rounded-lg text-[10px] font-bold border ${c.labelCls}`}
      >
        {c.label}
      </div>
    </div>
  );
}

// ── Number formatters ──────────────────────────────────────────
function sepMiles(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fmtShort(n: number) {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2).replace(".", ",") + " B";
  if (n >= 1_000_000)     return "$" + (n / 1_000_000).toFixed(1).replace(".", ",") + " M";
  return "$" + sepMiles(n);
}
function fmtNum(n: number) { return sepMiles(n); }
function deltaPct(actual: number, ref: number) {
  if (ref === 0) return 0;
  return ((actual - ref) / ref) * 100;
}

const BRANCH_KEYS = [
  { key: "colon"     as const, label: "Colón"     },
  { key: "serrano"   as const, label: "Serrano"   },
  { key: "peron"     as const, label: "Perón"     },
  { key: "sanMartin" as const, label: "San Martín"},
  { key: "virtual"   as const, label: "Virtual"   },
] as const;

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ── Branch progress row ────────────────────────────────────────
type BranchGoalRowProps = {
  label:     string;
  facActual: number;
  facGoal:   number;
  cliActual: number;
  cliGoal:   number;
  proActual: number;
  proGoal:   number;
};

function BranchGoalRow({ label, facActual, facGoal, cliActual, cliGoal, proActual, proGoal }: BranchGoalRowProps) {
  const pctFac = facGoal > 0 ? (facActual / facGoal) * 100 : 0;
  const pctCli = cliGoal > 0 ? (cliActual / cliGoal) * 100 : 0;
  const color  = pctFac >= 100 ? "#16a34a" : pctFac >= 85 ? "#d97706" : "#dc2626";

  return (
    <tr className="border-b border-border hover:bg-slate-50/60 transition-colors">
      <td className="px-3 py-2 text-xs font-semibold text-foreground whitespace-nowrap">{label}</td>

      {/* Facturación */}
      <td className="px-3 py-2 text-xs text-right tabular-nums font-semibold">{fmtShort(facActual)}</td>
      <td className="px-3 py-2 text-xs text-right tabular-nums text-muted-foreground">{fmtShort(facGoal)}</td>
      <td className="px-3 py-2 text-xs text-right">
        <div className="flex items-center justify-end gap-1.5">
          <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pctFac, 100)}%`, background: color }} />
          </div>
          <span className="tabular-nums text-[10px] font-bold" style={{ color }}>{pctFac.toFixed(0)}%</span>
        </div>
      </td>

      {/* Clientes */}
      <td className="px-3 py-2 text-xs text-right tabular-nums font-semibold border-l border-slate-100">{fmtNum(cliActual)}</td>
      <td className="px-3 py-2 text-xs text-right tabular-nums text-muted-foreground">{fmtNum(cliGoal)}</td>
      <td className="px-3 py-2 text-xs text-right">
        <div className="flex items-center justify-end gap-1.5">
          <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pctCli, 100)}%`, background: color }} />
          </div>
          <span className="tabular-nums text-[10px] font-bold" style={{ color }}>{pctCli.toFixed(0)}%</span>
        </div>
      </td>

      {/* Productos */}
      <td className="px-3 py-2 text-xs text-right tabular-nums font-semibold border-l border-slate-100">{fmtNum(proActual)}</td>
      <td className="px-3 py-2 text-xs text-right tabular-nums text-muted-foreground">{fmtNum(proGoal)}</td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────
interface MonthlyGoalsProps {
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  daysInMonth: number;
}

export function MonthlyGoals({
  currentDay,
  currentMonth,
  currentYear,
  daysInMonth,
}: MonthlyGoalsProps) {
  const [hasData, setHasData] = useState(false);
  const [acum,    setAcum]    = useState(() => loadAcumuladoMTD());
  const [aa,      setAa]      = useState(() => loadMismoMesAA());

  useEffect(() => {
    if (hasMTDData()) {
      setAcum(loadAcumuladoMTD());
      setAa(loadMismoMesAA());
      setHasData(true);
    }
  }, []);

  const pctDias = (currentDay / daysInMonth) * 100;
  const monthName = MONTH_NAMES[currentMonth - 1];

  // Totales cadena
  const facActual = acum.facturacion.total;
  const cliActual = acum.clientes.total;
  const proActual = acum.producto.total;
  const facGoal   = aa.facturacion.total;
  const cliGoal   = aa.clientes.total;
  const proGoal   = aa.producto.total;

  const pctFac = facGoal > 0 ? (facActual / facGoal) * 100 : 0;
  const pctCli = cliGoal > 0 ? (cliActual / cliGoal) * 100 : 0;
  const pctPro = proGoal > 0 ? (proActual / proGoal) * 100 : 0;

  // Componente sin datos cargados
  if (!hasData || (facGoal === 0 && cliGoal === 0)) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between" style={{ background: "#0d1b35" }}>
          <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Objetivos del Mes &mdash; {monthName}
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-amber-400" />
          <p className="text-sm font-semibold text-foreground">Sin datos de referencia</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Para ver el avance vs objetivo, carg&aacute; los datos del{" "}
            <strong>&quot;Mismo mes a&ntilde;o ant.&quot;</strong> y el{" "}
            <strong>&quot;Acumulado MTD actual&quot;</strong> en la secci&oacute;n{" "}
            <a href="/comandos" className="text-blue-600 underline font-semibold hover:text-blue-700">
              Comandos
            </a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between" style={{ background: "#0d1b35" }}>
        <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Objetivos del Mes &mdash; {monthName} {currentYear}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-amber-400/80 border border-amber-500/30 bg-amber-500/10 rounded-full px-2 py-0.5">
            sesi&oacute;n
          </span>
          <span className="text-[10px] text-slate-400">
            D&iacute;a {currentDay}/{daysInMonth} &mdash; {pctDias.toFixed(0)}% del mes
          </span>
        </div>
      </div>

      {/* Progress bar del mes */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Tiempo transcurrido del mes</span>
          <span className="text-[10px] font-semibold text-foreground tabular-nums">{pctDias.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pctDias}%` }} />
        </div>
      </div>

      {/* KPI gauge cards — total cadena */}
      <div className="grid grid-cols-3 gap-3 p-3">
        <GaugeCard label="Facturación" actual={facActual} objetivo={facGoal} formato={fmtShort} pctDias={pctDias} />
        <GaugeCard label="Clientes"    actual={cliActual} objetivo={cliGoal} formato={fmtNum}   pctDias={pctDias} />
        <GaugeCard label="Productos"   actual={proActual} objetivo={proGoal} formato={fmtNum}   pctDias={pctDias} />
      </div>

      {/* Detalle por sucursal */}
      <div className="border-t border-border px-3 pb-3 pt-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Avance por sucursal &mdash; Actual vs Mismo mes {currentYear - 1} (objetivo)
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="px-3 py-1.5 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-semibold whitespace-nowrap" />
                <th className="px-3 py-1.5 text-right text-[9px] uppercase tracking-wider font-semibold text-[#1d4ed8]" colSpan={3}>Factuaci&oacute;n</th>
                <th className="px-3 py-1.5 text-right text-[9px] uppercase tracking-wider font-semibold text-[#0891b2] border-l border-slate-200" colSpan={3}>Clientes</th>
                <th className="px-3 py-1.5 text-right text-[9px] uppercase tracking-wider font-semibold text-[#0f766e] border-l border-slate-200" colSpan={2}>Productos</th>
              </tr>
              <tr className="bg-slate-50 border-b border-border">
                <th className="px-3 py-1.5 text-left text-[9px] text-muted-foreground font-semibold">Sucursal</th>
                <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">Actual</th>
                <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">Objetivo</th>
                <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">Avance</th>
                <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground border-l border-slate-100">Actual</th>
                <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">Objetivo</th>
                <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">Avance</th>
                <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground border-l border-slate-100">Actual</th>
                <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">Objetivo</th>
              </tr>
            </thead>
            <tbody>
              {/* Total cadena */}
              <tr className="bg-blue-50/60 border-b-2 border-[#1d4ed8]/20">
                <td className="px-3 py-2 text-xs font-bold text-[#1d4ed8] uppercase tracking-wide whitespace-nowrap">Total Cadena</td>
                <td className="px-3 py-2 text-xs text-right tabular-nums font-bold text-foreground">{fmtShort(facActual)}</td>
                <td className="px-3 py-2 text-xs text-right tabular-nums text-muted-foreground">{fmtShort(facGoal)}</td>
                <td className="px-3 py-2 text-xs text-right">
                  <ProgressPill pct={pctFac} />
                </td>
                <td className="px-3 py-2 text-xs text-right tabular-nums font-bold text-foreground border-l border-slate-100">{fmtNum(cliActual)}</td>
                <td className="px-3 py-2 text-xs text-right tabular-nums text-muted-foreground">{fmtNum(cliGoal)}</td>
                <td className="px-3 py-2 text-xs text-right">
                  <ProgressPill pct={pctCli} />
                </td>
                <td className="px-3 py-2 text-xs text-right tabular-nums font-bold text-foreground border-l border-slate-100">{fmtNum(proActual)}</td>
                <td className="px-3 py-2 text-xs text-right tabular-nums text-muted-foreground">{fmtNum(proGoal)}</td>
              </tr>

              {/* Sucursales */}
              {BRANCH_KEYS.map(({ key, label }) => (
                <BranchGoalRow
                  key={key}
                  label={label}
                  facActual={acum.facturacion[key]}
                  facGoal={aa.facturacion[key]}
                  cliActual={acum.clientes[key]}
                  cliGoal={aa.clientes[key]}
                  proActual={acum.producto[key]}
                  proGoal={aa.producto[key]}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Progress pill ──────────────────────────────────────────────
function ProgressPill({ pct }: { pct: number }) {
  const color = pct >= 100 ? "#16a34a" : pct >= 85 ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="tabular-nums text-[10px] font-bold w-9 text-right" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}
