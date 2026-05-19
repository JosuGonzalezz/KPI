"use client";

import { paymentMix, paymentByBranch } from "@/lib/mock-data";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";

export function PaymentMix() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border" style={{ background: "#0d1b35" }}>
        <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
          Mix Medios de Pago &mdash; Ayer
        </p>
      </div>

      <div className="p-3 flex flex-col gap-3 flex-1">
        <div className="flex gap-3 items-center">
          {/* Donut */}
          <div className="w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={52}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {paymentMix.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 11,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(v: number) => [`${v}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-1.5 justify-center flex-1">
            {paymentMix.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-[11px] font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini stacked bar by branch */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">Por sucursal</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentByBranch} barSize={14} layout="horizontal">
                <XAxis dataKey="branch" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="efectivo"   stackId="a" fill="#1d4ed8" />
                <Bar dataKey="debito"     stackId="a" fill="#0891b2" />
                <Bar dataKey="credito"    stackId="a" fill="#0f766e" />
                <Bar dataKey="billeteras" stackId="a" fill="#f97316" />
                <Bar dataKey="otros"      stackId="a" fill="#94a3b8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
