"use client";

import { useState } from "react";
import { trendData } from "@/lib/mock-data";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

type Metric = "facturacion" | "clientes" | "ticketProm";

const metricConfig: Record<Metric, {
  key: string;
  keyAA: string;
  formatter: (v: number) => string;
  yFormatter: (v: number) => string;
  refLineY?: number;
}> = {
  facturacion: {
    key: "facturacion",
    keyAA: "facturacionAA",
    formatter: (v) => "$" + (v / 1_000_000).toFixed(2) + "M",
    yFormatter: (v) => "$" + (v / 1_000_000).toFixed(1) + "M",
    refLineY: 12_000_000,
  },
  clientes: {
    key: "clientes",
    keyAA: "clientesAA",
    formatter: (v) => v.toLocaleString("es-AR") + " clientes",
    yFormatter: (v) => v.toLocaleString("es-AR"),
  },
  ticketProm: {
    key: "ticketProm",
    keyAA: "ticketPromAA",
    formatter: (v) => "$" + v.toLocaleString("es-AR"),
    yFormatter: (v) => "$" + (v / 1000).toFixed(1) + "k",
  },
};

const BUTTONS: { key: Metric; label: string }[] = [
  { key: "facturacion", label: "Facturación" },
  { key: "clientes",    label: "Clientes" },
  { key: "ticketProm",  label: "Ticket Prom." },
];

export function TrendChart() {
  const [metric, setMetric] = useState<Metric>("facturacion");
  const cfg = metricConfig[metric];

  const ticksToShow = trendData
    .filter((_, i) => i % 7 === 0 || i === trendData.length - 1)
    .map((d) => d.date);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div
        className="px-4 py-2.5 border-b border-border flex items-center justify-between"
        style={{ background: "#0d1b35" }}
      >
        <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
          Tendencia 35 d&iacute;as &mdash; {BUTTONS.find((b) => b.key === metric)?.label}
        </p>
        <div className="flex gap-1">
          {BUTTONS.map((b) => (
            <button
              key={b.key}
              onClick={() => setMetric(b.key)}
              className={`text-[10px] px-2.5 py-0.5 rounded-md font-semibold transition-colors ${
                metric === b.key
                  ? "bg-[#1d4ed8] text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart — explicit pixel height so ResponsiveContainer resolves */}
      <div className="px-3 pt-3 pb-1" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              ticks={ticksToShow}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={cfg.yFormatter}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 11,
                boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
              }}
              itemStyle={{ color: "#334155" }}
              labelStyle={{ color: "#64748b", fontSize: 10, fontWeight: 600 }}
              formatter={(value: number, name: string) => [cfg.formatter(value), name]}
            />
            {cfg.refLineY && (
              <ReferenceLine
                y={cfg.refLineY}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "Meta",
                  fill: "#94a3b8",
                  fontSize: 9,
                  position: "insideTopRight",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey={cfg.keyAA}
              name="Año anterior"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 3, fill: "#94a3b8" }}
            />
            <Line
              type="monotone"
              dataKey={cfg.key}
              name="2025"
              stroke="#1d4ed8"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#1d4ed8", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-5 justify-center pb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-[2.5px] bg-[#1d4ed8] rounded-full" />
          <span className="text-[10px] text-muted-foreground font-medium">2025</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="2" className="overflow-visible">
            <line x1="0" y1="1" x2="20" y2="1" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          <span className="text-[10px] text-muted-foreground font-medium">A&ntilde;o anterior</span>
        </div>
        {cfg.refLineY && (
          <div className="flex items-center gap-1.5">
            <svg width="20" height="2" className="overflow-visible">
              <line x1="0" y1="1" x2="20" y2="1" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
            <span className="text-[10px] text-muted-foreground font-medium">Meta diaria</span>
          </div>
        )}
      </div>
    </div>
  );
}
