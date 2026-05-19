"use client";

import { shrinkage } from "@/lib/mock-data";

type Estado = "green" | "yellow" | "red";

type MiniBarProps = {
  pct: number;
  threshold: number;
  estado: Estado;
};

function MiniBar({ pct, threshold, estado }: MiniBarProps) {
  const barColor = { green: "bg-green-500", yellow: "bg-amber-500", red: "bg-red-500" }[estado];
  const maxPct = threshold * 2;
  const width = Math.min((pct / maxPct) * 100, 100);
  const markerLeft = (threshold / maxPct) * 100;
  return (
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden relative border border-border">
      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${width}%` }} />
      <div
        className="absolute top-0 h-full w-px bg-slate-400/60"
        style={{ left: `${markerLeft}%` }}
      />
    </div>
  );
}

const stateColors: Record<Estado, { text: string; bg: string }> = {
  green:  { text: "text-green-600",  bg: "bg-green-50 text-green-700 border border-green-200" },
  yellow: { text: "text-amber-600",  bg: "bg-amber-50 text-amber-700 border border-amber-200" },
  red:    { text: "text-red-600",    bg: "bg-red-50 text-red-700 border border-red-200" },
};

export function ShrinkagePanel() {
  const { conocida, desconocida } = shrinkage;
  const unkEstado: Estado = desconocida.pct >= 1.5 ? "red" : desconocida.pct >= 1 ? "yellow" : "green";
  const knEstado: Estado  = conocida.pct >= 1 ? "yellow" : "green";

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border" style={{ background: "#0d1b35" }}>
        <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
          Control de Merma
        </p>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Merma Conocida */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-foreground font-medium">Conocida (Roturas / Vencidos)</span>
            <span className={`text-sm font-bold ${stateColors[knEstado].text}`}>{conocida.pct.toFixed(2)}%</span>
          </div>
          <MiniBar pct={conocida.pct} threshold={1} estado={knEstado} />
          <div className="flex justify-between mt-1">
            <p className="text-[10px] text-muted-foreground">${conocida.monto.toLocaleString("es-AR")} sobre venta</p>
            <p className="text-[10px] text-muted-foreground">Umbral: 1,0%</p>
          </div>
        </div>

        {/* Merma Desconocida */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-foreground font-medium">Desconocida (Stock)</span>
            <span className={`text-sm font-bold ${stateColors[unkEstado].text}`}>{desconocida.pct.toFixed(2)}%</span>
          </div>
          <MiniBar pct={desconocida.pct} threshold={1.5} estado={unkEstado} />
          <div className="flex justify-between mt-1">
            <p className="text-[10px] text-muted-foreground">${desconocida.monto.toLocaleString("es-AR")} sobre venta</p>
            <p className="text-[10px] text-muted-foreground">Umbral: 1,5%</p>
          </div>
          {unkEstado === "red" && (
            <div className={`mt-2 text-center py-1 rounded-md text-[10px] font-bold ${stateColors.red.bg}`}>
              SUPERA UMBRAL 1,5%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
