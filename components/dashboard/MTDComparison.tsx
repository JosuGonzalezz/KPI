"use client";

import {
  LAST_DAY_2026,
  MTD_2026, MTD_2025,
  MTD_BRANCH_2026_FACT, MTD_BRANCH_2025_FACT,
  MTD_BRANCH_2026_CLI,  MTD_BRANCH_2025_CLI,
  CUMUL_FACT_2026, CUMUL_FACT_2025,
  CUMUL_CLI_2026,  CUMUL_CLI_2025,
  CUMUL_PRO_2026,  CUMUL_PRO_2025,
  BRANCH_KEYS, BRANCH_LABELS,
  type BranchKey,
} from "@/lib/report-data";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ── Formatters ────────────────────────────────────────────────
function sepMiles(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fmtFact(n: number): string {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(3).replace(".", ",") + " B";
  if (n >= 1_000_000)     return "$" + (n / 1_000_000).toFixed(1).replace(".", ",") + " M";
  return "$" + sepMiles(n);
}
function fmtFactShort(n: number): string {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2).replace(".", ",") + "B";
  if (n >= 1_000_000)     return "$" + (n / 1_000_000).toFixed(0) + "M";
  return "$" + sepMiles(n);
}
function fmtNum(n: number): string { return sepMiles(n); }
function deltaPct(a: number, b: number): number {
  if (b === 0) return 0;
  return ((a - b) / b) * 100;
}

// ── KPI Comparison Card ───────────────────────────────────────
type KPICompCardProps = {
  label:   string;
  val2026: string;
  val2025: string;
  delta:   number;       // % change 2026 vs 2025
  accent:  string;       // border + icon colour
};

function KPICompCard({ label, val2026, val2025, delta, accent }: KPICompCardProps) {
  const up = delta >= 0;
  return (
    <div
      className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm border-t-4"
      style={{ borderTopColor: accent }}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">
        {label}
      </p>

      {/* 2026 big value */}
      <div>
        <p className="text-[9px] text-muted-foreground mb-0.5">Mayo 2026 MTD (día 1–{LAST_DAY_2026})</p>
        <p className="text-2xl font-black text-foreground leading-none tabular-nums">{val2026}</p>
      </div>

      {/* Delta badge */}
      <div className={`inline-flex items-center gap-1 self-start px-2.5 py-1 rounded-full text-[11px] font-bold border
        ${up ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {(up ? "+" : "") + delta.toFixed(2).replace(".", ",")}%
        <span className="font-normal opacity-70 ml-0.5">vs igual período 2025</span>
      </div>

      {/* 2025 reference value */}
      <div className="pt-1 border-t border-border flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Mayo 2025 (día 1–{LAST_DAY_2026})</span>
        <span className="font-semibold text-muted-foreground tabular-nums">{val2025}</span>
      </div>
    </div>
  );
}

// ── Dual cumulative chart ─────────────────────────────────────
type ChartTab = 'Facturacion' | 'Clientes' | 'Producto';

const CHART_CONFIGS: Record<ChartTab, {
  data2026: { day: number; cumul: number }[];
  data2025: { day: number; cumul: number }[];
  color2026: string;
  color2025: string;
  fmt:       (n: number) => string;
  label:     string;
}> = {
  Facturacion: {
    data2026: CUMUL_FACT_2026, data2025: CUMUL_FACT_2025,
    color2026: "#1d4ed8", color2025: "#93c5fd",
    fmt: fmtFactShort, label: "Facturación acumulada",
  },
  Clientes: {
    data2026: CUMUL_CLI_2026, data2025: CUMUL_CLI_2025,
    color2026: "#0891b2", color2025: "#67e8f9",
    fmt: fmtNum, label: "Clientes acumulados",
  },
  Producto: {
    data2026: CUMUL_PRO_2026, data2025: CUMUL_PRO_2025,
    color2026: "#0f766e", color2025: "#5eead4",
    fmt: fmtNum, label: "Productos acumulados",
  },
};

function CumulChart({ tab }: { tab: ChartTab }) {
  const cfg = CHART_CONFIGS[tab];
  // Merge into one series for recharts
  const series = cfg.data2026.map((d, i) => ({
    day: `D${d.day}`,
    "2026": d.cumul,
    "2025": cfg.data2025[i]?.cumul ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="grad26" x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor={cfg.color2026} stopOpacity={0.25} />
            <stop offset="90%" stopColor={cfg.color2026} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="grad25" x1="0" y1="0" x2="0" y2="1">
            <stop offset="10%" stopColor={cfg.color2025} stopOpacity={0.20} />
            <stop offset="90%" stopColor={cfg.color2025} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={cfg.fmt}
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}
          formatter={(value: number, name: string) => [cfg.fmt(value), name === "2026" ? "Mayo 2026" : "Mayo 2025"]}
        />
        <Legend
          formatter={(value) => value === "2026" ? "Mayo 2026" : "Mayo 2025"}
          wrapperStyle={{ fontSize: 11 }}
        />
        <Area type="monotone" dataKey="2025" stroke={cfg.color2025} strokeWidth={1.5} fill="url(#grad25)" dot={false} isAnimationActive={false} strokeDasharray="5 3" />
        <Area type="monotone" dataKey="2026" stroke={cfg.color2026} strokeWidth={2}   fill="url(#grad26)" dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Branch Comparison Table ────────────────────────────────────
function BranchCompTable() {
  const branches = BRANCH_KEYS.filter(k => k !== 'virtual' || true);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-3 py-2 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-semibold border-r border-slate-200 whitespace-nowrap">
              Sucursal
            </th>
            <th className="px-3 py-2 text-right text-[9px] uppercase tracking-wider text-[#1d4ed8] font-semibold whitespace-nowrap" colSpan={3}>
              Facturación MTD
            </th>
            <th className="px-3 py-2 text-right text-[9px] uppercase tracking-wider text-[#0891b2] font-semibold whitespace-nowrap border-l border-slate-200" colSpan={3}>
              Clientes MTD
            </th>
          </tr>
          <tr className="bg-slate-50 border-b border-border">
            <th className="px-3 py-1.5 text-left text-[9px] text-muted-foreground border-r border-slate-100" />
            <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">2026</th>
            <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">2025</th>
            <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">Var %</th>
            <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground border-l border-slate-100">2026</th>
            <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">2025</th>
            <th className="px-3 py-1.5 text-right text-[9px] text-muted-foreground">Var %</th>
          </tr>
        </thead>
        <tbody>
          {(branches as BranchKey[]).map(branch => {
            const f26 = MTD_BRANCH_2026_FACT[branch];
            const f25 = MTD_BRANCH_2025_FACT[branch];
            const c26 = MTD_BRANCH_2026_CLI[branch];
            const c25 = MTD_BRANCH_2025_CLI[branch];
            const deltaF = deltaPct(f26, f25);
            const deltaC = deltaPct(c26, c25);
            return (
              <tr key={branch} className="border-b border-border hover:bg-slate-50/70 transition-colors">
                <td className="px-3 py-2 font-semibold text-foreground border-r border-slate-100 whitespace-nowrap">
                  {BRANCH_LABELS[branch]}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmtFact(f26)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground text-[11px]">{fmtFact(f25)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <span className={`font-bold text-[11px] ${deltaF >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {(deltaF >= 0 ? "+" : "") + deltaF.toFixed(1).replace(".", ",")}%
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold border-l border-slate-100">{fmtNum(c26)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground text-[11px]">{fmtNum(c25)}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <span className={`font-bold text-[11px] ${deltaC >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {(deltaC >= 0 ? "+" : "") + deltaC.toFixed(1).replace(".", ",")}%
                  </span>
                </td>
              </tr>
            );
          })}
          {/* Total row */}
          {(() => {
            const totalF26 = Object.values(MTD_BRANCH_2026_FACT).reduce((a, b) => a + b, 0);
            const totalF25 = Object.values(MTD_BRANCH_2025_FACT).reduce((a, b) => a + b, 0);
            const totalC26 = Object.values(MTD_BRANCH_2026_CLI).reduce((a, b) => a + b, 0);
            const totalC25 = Object.values(MTD_BRANCH_2025_CLI).reduce((a, b) => a + b, 0);
            const dF = deltaPct(totalF26, totalF25);
            const dC = deltaPct(totalC26, totalC25);
            return (
              <tr className="bg-blue-50/60 border-t-2 border-[#1d4ed8]/20">
                <td className="px-3 py-2 font-bold text-[#1d4ed8] uppercase text-[10px] tracking-wide border-r border-slate-100">
                  Total Cadena
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-bold text-foreground">{fmtFact(totalF26)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground text-[11px]">{fmtFact(totalF25)}</td>
                <td className="px-3 py-2 text-right">
                  <span className={`font-bold text-[11px] ${dF >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {(dF >= 0 ? "+" : "") + dF.toFixed(1).replace(".", ",")}%
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-bold text-foreground border-l border-slate-100">{fmtNum(totalC26)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground text-[11px]">{fmtNum(totalC25)}</td>
                <td className="px-3 py-2 text-right">
                  <span className={`font-bold text-[11px] ${dC >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {(dC >= 0 ? "+" : "") + dC.toFixed(1).replace(".", ",")}%
                  </span>
                </td>
              </tr>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function MTDComparison() {
  const [chartTab, setChartTab] = useState<ChartTab>("Facturacion");

  const deltaFact = deltaPct(MTD_2026.facturacion, MTD_2025.facturacion);
  const deltaCli  = deltaPct(MTD_2026.clientes,    MTD_2025.clientes);
  const deltaProd = deltaPct(MTD_2026.producto,     MTD_2025.producto);

  const tabs: { key: ChartTab; label: string; color: string }[] = [
    { key: "Facturacion", label: "Facturación",  color: "#1d4ed8" },
    { key: "Clientes",    label: "Clientes",     color: "#0891b2" },
    { key: "Producto",    label: "Productos",    color: "#0f766e" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-2.5 border-b border-border flex items-center justify-between"
        style={{ background: "#0d1b35" }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold leading-none">
            Avance del Mes a la Fecha &mdash; Mayo 2026 vs Mayo 2025
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Comparativo proporcional &middot; D&iacute;as 1&ndash;{LAST_DAY_2026} de cada mes
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="inline-block w-6 h-0.5 rounded bg-[#1d4ed8]" />
            Mayo 2026
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="inline-block w-6 h-0.5 rounded bg-[#93c5fd] border-dashed" style={{ borderTop: "1.5px dashed #93c5fd", height: 0 }} />
            Mayo 2025
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {/* KPI Comparison Cards */}
        <div className="grid grid-cols-3 gap-3">
          <KPICompCard
            label="Facturación acumulada MTD"
            val2026={fmtFact(MTD_2026.facturacion)}
            val2025={fmtFact(MTD_2025.facturacion)}
            delta={deltaFact}
            accent="#1d4ed8"
          />
          <KPICompCard
            label="Clientes (transacciones) MTD"
            val2026={fmtNum(MTD_2026.clientes)}
            val2025={fmtNum(MTD_2025.clientes)}
            delta={deltaCli}
            accent="#0891b2"
          />
          <KPICompCard
            label="Productos vendidos MTD"
            val2026={fmtNum(MTD_2026.producto)}
            val2025={fmtNum(MTD_2025.producto)}
            delta={deltaProd}
            accent="#0f766e"
          />
        </div>

        {/* Chart + Table row */}
        <div className="grid grid-cols-5 gap-3">
          {/* Cumulative chart */}
          <div className="col-span-3 bg-slate-50/50 border border-border rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Progresión diaria acumulada
              </p>
              {/* Tab switcher */}
              <div className="flex gap-1">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setChartTab(t.key)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors border
                      ${chartTab === t.key
                        ? "text-white border-transparent"
                        : "bg-white text-muted-foreground border-slate-200 hover:border-slate-300"
                      }`}
                    style={chartTab === t.key ? { background: t.color, borderColor: t.color } : {}}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground -mt-1">
              {CHART_CONFIGS[chartTab].label} &mdash; línea continua = 2026 &middot; línea punteada = 2025
            </p>
            <CumulChart tab={chartTab} />
          </div>

          {/* Branch comparison table */}
          <div className="col-span-2 bg-slate-50/50 border border-border rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Por Sucursal &mdash; MTD días 1&ndash;{LAST_DAY_2026}
              </p>
            </div>
            <BranchCompTable />
          </div>
        </div>
      </div>
    </div>
  );
}
