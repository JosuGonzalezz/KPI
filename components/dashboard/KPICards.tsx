"use client";

import { useEffect, useState } from "react";
import { kpiMes } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, BarChart2 } from "lucide-react";
import {
  loadAcumuladoMTD, loadMismoMesAA,
  hasMTDData,
} from "@/lib/report-session-store";

function fmt(n: number) {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(3).replace(".", ",") + " B";
  if (n >= 1_000_000)     return "$" + (n / 1_000_000).toFixed(2).replace(".", ",") + " M";
  return "$" + n.toLocaleString("es-AR");
}
function fmtInt(n: number) {
  return n.toLocaleString("es-AR");
}
function pct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2).replace(".", ",") + "%";
}

type Delta = { value: number; label: string };

type KPICardProps = {
  label:      string;
  value:      string;
  subvalue?:  string;
  deltas:     Delta[];
  icon:       React.ReactNode;
  metaPct:    number;
};

function DeltaBadge({ value, label }: Delta) {
  const pos = value >= 0;
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border
      ${pos ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}
    >
      {pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {pct(value)}
      <span className="text-[9px] font-normal opacity-70">{label}</span>
    </div>
  );
}

function KPICard({ label, value, subvalue, deltas, icon, metaPct }: KPICardProps) {
  const estado = metaPct >= 100 ? "green" : metaPct >= 85 ? "yellow" : "red";
  const borderColor = { green: "border-l-green-500", yellow: "border-l-amber-500", red: "border-l-red-500" }[estado];
  const barColor    = { green: "bg-green-500",        yellow: "bg-amber-500",       red: "bg-red-500"       }[estado];
  const pctColor    = { green: "text-green-600",       yellow: "text-amber-600",      red: "text-red-600"      }[estado];

  return (
    <div className={`bg-card border border-border border-l-4 ${borderColor} rounded-xl p-4 flex flex-col gap-3 shadow-sm`}>
      {/* Top row */}
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-tight">{label}</span>
        <span className="text-muted-foreground/40 shrink-0">{icon}</span>
      </div>

      {/* Main value */}
      <div>
        <p className="text-2xl font-black text-foreground leading-none tabular-nums">{value}</p>
        {subvalue && <p className="text-[10px] text-muted-foreground mt-0.5">{subvalue}</p>}
      </div>

      {/* Delta badges */}
      <div className="flex flex-wrap gap-1.5">
        {deltas.map((d) => <DeltaBadge key={d.label} {...d} />)}
      </div>

      {/* Progress vs meta */}
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Avance vs meta</span>
          <span className={`font-bold ${pctColor}`}>{metaPct.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(metaPct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function KPICards() {
  // Session-aware KPI values
  const [facturacion,    setFacturacion]    = useState(kpiMes.facturacion);
  const [clientes,       setClientes]       = useState(kpiMes.clientes);
  const [ticketPromedio, setTicketPromedio] = useState(kpiMes.ticketPromedio);
  const [changoPromedio, setChangoPromedio] = useState(kpiMes.changoPromedio);
  const [usingSessionData, setUsingSessionData] = useState(false);

  useEffect(() => {
    if (!hasMTDData()) return;
    const acum = loadAcumuladoMTD();
    const aa   = loadMismoMesAA();

    // Override with session data if available
    const newFact = acum.facturacion.total > 0 ? acum.facturacion.total : kpiMes.facturacion.acumulado;
    const newCli  = acum.clientes.total > 0    ? acum.clientes.total    : kpiMes.clientes.acumulado;
    const newTicket = newCli > 0 ? newFact / newCli : kpiMes.ticketPromedio.acumulado;

    setFacturacion({
      ...kpiMes.facturacion,
      acumulado: newFact,
      vsAA: aa.facturacion.total > 0 ? ((newFact - aa.facturacion.total) / aa.facturacion.total) * 100 : 0,
    });
    setClientes({
      ...kpiMes.clientes,
      acumulado: newCli,
      vsAA: aa.clientes.total > 0 ? ((newCli - aa.clientes.total) / aa.clientes.total) * 100 : 0,
    });
    setTicketPromedio({
      ...kpiMes.ticketPromedio,
      acumulado: newTicket,
    });
    setUsingSessionData(true);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-3">
      <KPICard
        label="Facturación acumulada"
        value={fmt(facturacion.acumulado)}
        subvalue={`Meta: ${fmt(facturacion.metaMes)}`}
        deltas={[
          { value: facturacion.vsMesAnt, label: "vs M.Ant" },
          { value: facturacion.vsAA,     label: "vs AA"    },
        ]}
        icon={<TrendingUp className="w-4 h-4" />}
        metaPct={(facturacion.acumulado / facturacion.metaMes) * 100}
      />
      <KPICard
        label="Clientes (transacciones)"
        value={fmtInt(clientes.acumulado)}
        subvalue={`Meta: ${fmtInt(clientes.metaMes)}`}
        deltas={[
          { value: clientes.vsMesAnt, label: "vs M.Ant" },
          { value: clientes.vsAA,     label: "vs AA"    },
        ]}
        icon={<Users className="w-4 h-4" />}
        metaPct={(clientes.acumulado / clientes.metaMes) * 100}
      />
      <KPICard
        label="Ticket promedio"
        value={fmt(ticketPromedio.acumulado)}
        subvalue={`Meta: ${fmt(ticketPromedio.metaMes)}`}
        deltas={[
          { value: ticketPromedio.vsMesAnt, label: "vs M.Ant" },
          { value: ticketPromedio.vsAA,     label: "vs AA"    },
        ]}
        icon={<ShoppingCart className="w-4 h-4" />}
        metaPct={(ticketPromedio.acumulado / ticketPromedio.metaMes) * 100}
      />
      <KPICard
        label="Chango promedio (ítems)"
        value={changoPromedio.acumulado.toFixed(2).replace(".", ",")}
        subvalue={`Meta: ${changoPromedio.metaMes.toFixed(2).replace(".", ",")} ítems`}
        deltas={[
          { value: changoPromedio.vsMesAnt, label: "vs M.Ant" },
          { value: changoPromedio.vsAA,     label: "vs AA"    },
        ]}
        icon={<Package className="w-4 h-4" />}
        metaPct={(changoPromedio.acumulado / changoPromedio.metaMes) * 100}
      />
    </div>
  );
}
