"use client";

import { rrhhData } from "@/lib/mock-data";

const estadoBadge = {
  green:  "bg-green-100 text-green-700 border border-green-200",
  yellow: "bg-amber-100 text-amber-700 border border-amber-200",
  red:    "bg-red-100 text-red-700 border border-red-200",
};
const estadoLabel = { green: "OK", yellow: "ATENC.", red: "CRÍTICO" };

export function RRHHPanel() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border" style={{ background: "#0d1b35" }}>
        <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
          Dotaci&oacute;n y Ausentismo &mdash; Ayer
        </p>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="px-3 py-2 text-left font-semibold">Sucursal</th>
              <th className="px-3 py-2 text-right font-semibold">Prog.</th>
              <th className="px-3 py-2 text-right font-semibold">Pres.</th>
              <th className="px-3 py-2 text-right font-semibold">Aus. %</th>
              <th className="px-3 py-2 text-center font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rrhhData.map((row) => (
              <tr key={row.branch} className="border-b border-border hover:bg-slate-50/60 transition-colors">
                <td className="px-3 py-2 text-xs text-foreground">{row.branch}</td>
                <td className="px-3 py-2 text-xs text-right text-foreground tabular-nums">{row.programados}</td>
                <td className="px-3 py-2 text-xs text-right text-foreground tabular-nums">{row.presentes}</td>
                <td className={`px-3 py-2 text-xs text-right font-bold tabular-nums ${
                  row.ausentismo >= 15 ? "text-red-600" : row.ausentismo >= 10 ? "text-amber-600" : "text-green-600"
                }`}>
                  {row.ausentismo.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold ${estadoBadge[row.estado]}`}>
                    {estadoLabel[row.estado]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
