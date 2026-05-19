"use client";

import { may2026, LAST_DAY_2026, type DailyRecord } from "@/lib/report-data";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

// ── Formatters ─────────────────────────────────────────────────
function sepMiles(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fmtFact(n: number): string {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2).replace(".", ",") + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(0) + "M";
  return "$" + sepMiles(n);
}
function fmtInt(n: number): string { return sepMiles(n); }

// ── Compute daily series from real data ────────────────────────
function buildDailySeries(tipo: DailyRecord["tipo"]) {
  const byDay = new Map<number, number>();
  may2026
    .filter(r => r.tipo === tipo)
    .forEach(r => {
      byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.total);
    });

  const days = Array.from(byDay.entries())
    .sort((a, b) => a[0] - b[0]);

  const values = days.map(([, v]) => v);
  const avg = values.length > 0
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;

  return {
    series: days.map(([day, value]) => ({
      label: `${String(day).padStart(2, "0")}/05`,
      value,
      isLast: day === LAST_DAY_2026,
    })),
    avg,
    last: byDay.get(LAST_DAY_2026) ?? 0,
    prev: byDay.get(LAST_DAY_2026 - 1) ?? 0,
  };
}

const factData = buildDailySeries("Facturacion");
const cliData  = buildDailySeries("Clientes");
const prodData = buildDailySeries("Producto");

// ── Mini Bar Sparkline ─────────────────────────────────────────
function MiniBarChart({
  series,
  avg,
  color,
  fmt,
}: {
  series: { label: string; value: number; isLast: boolean }[];
  avg: number;
  color: string;
  fmt: (n: number) => string;
}) {
  return (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 8, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <ReferenceLine
            y={avg}
            stroke={color}
            strokeDasharray="4 3"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,.07)",
              padding: "4px 8px",
            }}
            formatter={(v: number) => [fmt(v), "Total"]}
            labelFormatter={(l) => `Día ${l}`}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {series.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.isLast ? color : color + "80"}
                stroke={entry.isLast ? color : "none"}
                strokeWidth={entry.isLast ? 1.5 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({
  label,
  lastDay,
  avg,
  avgRaw,
  delta,
  series,
  color,
  fmt,
}: {
  label:   string;
  lastDay: string;
  avg:     string;
  avgRaw:  number;
  delta:   number;
  series:  { label: string; value: number; isLast: boolean }[];
  color:   string;
  fmt:     (n: number) => string;
}) {
  const pos = delta >= 0;
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5 shadow-sm">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">
        {label}
      </p>

      {/* Last day value + delta */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[9px] text-muted-foreground mb-0.5">Día {LAST_DAY_2026}/05/2026</p>
          <p className="text-2xl font-black text-foreground leading-none tabular-nums">{lastDay}</p>
        </div>
        <span
          className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 mb-0.5
            ${pos
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
            }`}
        >
          {pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {(pos ? "+" : "") + delta.toFixed(1).replace(".", ",")}%
          <span className="font-normal opacity-70 ml-0.5">vs D-1</span>
        </span>
      </div>

      {/* Bar chart — avgRaw passed as prop for reference line */}
      <MiniBarChart series={series} avg={avgRaw} color={color} fmt={fmt} />

      {/* Average footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-1.5">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Prom. MTD ({series.length} días)
        </span>
        <span className="font-semibold text-foreground tabular-nums">{avg}</span>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export function DailyProgress() {
  // Delta day-over-day
  function delta(last: number, prev: number) {
    if (prev === 0) return 0;
    return ((last - prev) / prev) * 100;
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      <div
        className="px-4 py-2.5 border-b border-border flex items-center justify-between"
        style={{ background: "#0d1b35" }}
      >
        <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
          Progresión diaria &mdash; Mayo 2026 (días cargados)
        </p>
        <p className="text-[10px] text-slate-400">
          Barra destacada = &uacute;ltimo d&iacute;a &middot; L&iacute;nea punteada = promedio MTD
        </p>
      </div>

      <div className="flex-1 p-3 grid grid-cols-3 gap-3">
        <StatCard
          label="Facturación diaria"
          lastDay={fmtFact(factData.last)}
          avg={fmtFact(factData.avg)}
          avgRaw={factData.avg}
          delta={delta(factData.last, factData.prev)}
          series={factData.series}
          color="#1d4ed8"
          fmt={fmtFact}
        />
        <StatCard
          label="Clientes diarios"
          lastDay={fmtInt(cliData.last)}
          avg={fmtInt(cliData.avg)}
          avgRaw={cliData.avg}
          delta={delta(cliData.last, cliData.prev)}
          series={cliData.series}
          color="#0891b2"
          fmt={fmtInt}
        />
        <StatCard
          label="Productos diarios"
          lastDay={fmtInt(prodData.last)}
          avg={fmtInt(prodData.avg)}
          avgRaw={prodData.avg}
          delta={delta(prodData.last, prodData.prev)}
          series={prodData.series}
          color="#0f766e"
          fmt={fmtInt}
        />
      </div>
    </div>
  );
}
