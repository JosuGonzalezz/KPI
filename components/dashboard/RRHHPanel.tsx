"use client";

import { useEffect, useState } from "react";
import { rrhhData, type RRHHRow } from "@/lib/mock-data";
import {
  loadRRHHAyer, hasRRHHData,
  type RRHHSnapshot,
} from "@/lib/report-session-store";
import { BRANCH_LABELS } from "@/lib/report-data";

const estadoBadge = {
  green:  "bg-green-100 text-green-700 border border-green-200",
  yellow: "bg-amber-100 text-amber-700 border border-amber-200",
  red:    "bg-red-100 text-red-700 border border-red-200",
};
const estadoLabel = { green: "OK", yellow: "ATENC.", red: "CRÍTICO" };

function deriveEstado(ausentismo: number): RRHHRow["estado"] {
  if (ausentismo >= 15) return "red";
  if (ausentismo >= 8)  return "yellow";
  return "green";
}

function snapshotToRows(snapshot: RRHHSnapshot): RRHHRow[] {
  return (Object.entries(BRANCH_LABELS) as [keyof RRHHSnapshot, string][]).map(
    ([key, label]) => {
      const entry = snapshot[key];
      const ausentismo = entry.programados > 0
        ? ((entry.programados - entry.presentes) / entry.programados) * 100
        : 0;
      return {
        branch:      label,
        programados: entry.programados,
        presentes:   entry.presentes,
        ausentismo:  Math.round(ausentismo * 10) / 10,
        estado:      deriveEstado(ausentismo),
      };
    }
  );
}

export function RRHHPanel() {
  const [rows, setRows] = useState<RRHHRow[]>(rrhhData);
  const [usingSessionData, setUsingSessionData] = useState(false);

  useEffect(() => {
    if (!hasRRHHData()) return;
    const snapshot = loadRRHHAyer();
    const derived  = snapshotToRows(snapshot);
    // Only override if at least one branch has data entered
    const hasAny = derived.some(r => r.programados > 0);
    if (hasAny) {
      setRows(derived);
      setUsingSessionData(true);
    }
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border" style={{ background: "#0d1b35" }}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
            Dotaci&oacute;n y Ausentismo &mdash; Ayer
          </p>
          {usingSessionData && (
            <span className="text-[9px] text-amber-400/80 border border-amber-500/30 bg-amber-500/10 rounded-full px-2 py-0.5">
              sesi&oacute;n
            </span>
          )}
        </div>
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
            {rows.map((row) => (
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
