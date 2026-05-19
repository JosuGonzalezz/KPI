"use client";

import { branchRows, totalRow, REPORT_DATE, type BranchRow } from "@/lib/mock-data";

/** Locale-free number formatting to avoid SSR/client hydration mismatch */
function sepMiles(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fmtM(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2).replace(".", ",") + "M";
  if (n >= 1_000)     return "$" + sepMiles(Math.round(n / 1_000)) + "K";
  return "$" + sepMiles(n);
}
function fmtNum(n: number) { return sepMiles(n); }
function pct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(2).replace(".", ",") + "%";
}

function Delta({ v, bold }: { v: number; bold?: boolean }) {
  return (
    <span className={`tabular-nums ${bold ? "font-bold text-xs" : "text-[11px]"} ${v >= 0 ? "text-green-600" : "text-red-600"}`}>
      {pct(v)}
    </span>
  );
}

const estadoBadge = {
  green:  "bg-green-100 text-green-700 border-green-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  red:    "bg-red-100   text-red-700   border-red-200",
};
const estadoLabel = { green: "OK", yellow: "Alerta", red: "Crítico" };

function Row({ row, isTotal }: { row: BranchRow; isTotal?: boolean }) {
  const base = isTotal
    ? "bg-blue-50/60 border-t-2 border-[#1d4ed8]/30"
    : "border-b border-border hover:bg-slate-50/70 transition-colors";

  return (
    <tr className={base}>
      {/* Sucursal */}
      <td className="px-3 py-2 text-xs whitespace-nowrap font-semibold sticky left-0 bg-inherit border-r border-slate-100">
        {isTotal
          ? <span className="text-[#1d4ed8] font-bold uppercase tracking-wide">{row.name}</span>
          : <span className="text-foreground">{row.name}</span>
        }
      </td>

      {/* ── Facturación ── */}
      <td className="px-3 py-2 text-xs text-right tabular-nums font-semibold text-foreground">
        {fmtM(row.facturacion)}
      </td>
      <td className="px-2 py-2 text-[10px] text-right text-slate-500 tabular-nums">
        {row.pctTotal.toFixed(1)}%
      </td>
      <td className="px-2 py-2 text-xs text-right"><Delta v={row.vsMesAnt} /></td>
      <td className="px-2 py-2 text-xs text-right border-r border-slate-100"><Delta v={row.vsAA} /></td>

      {/* ── Clientes ── */}
      <td className="px-3 py-2 text-xs text-right tabular-nums font-semibold text-foreground">
        {fmtNum(row.clientes)}
      </td>
      <td className="px-2 py-2 text-[10px] text-right text-slate-500 tabular-nums">
        {row.pctTotalCli.toFixed(1)}%
      </td>
      <td className="px-2 py-2 text-xs text-right"><Delta v={row.vsMesAntCli} /></td>
      <td className="px-2 py-2 text-xs text-right border-r border-slate-100"><Delta v={row.vsAACli} /></td>

      {/* ── Ticket prom. ── */}
      <td className="px-3 py-2 text-xs text-right tabular-nums text-foreground">
        {fmtM(row.ticketProm)}
      </td>
      <td className="px-2 py-2 text-xs text-right border-r border-slate-100"><Delta v={row.vsAATicket} /></td>

      {/* ── Chango ── */}
      <td className="px-3 py-2 text-xs text-right tabular-nums text-foreground">
        {row.changoProm.toFixed(2)}
      </td>
      <td className="px-2 py-2 text-xs text-right border-r border-slate-100"><Delta v={row.vsMesAntChango} /></td>

      {/* ── Superficie ── */}
      <td className="px-3 py-2 text-xs text-right tabular-nums text-foreground">
        {row.mts !== null ? fmtNum(row.mts) : <span className="text-slate-300">—</span>}
      </td>
      <td className="px-3 py-2 text-xs text-right tabular-nums text-foreground border-r border-slate-100">
        {row.factPorMt !== null ? fmtM(row.factPorMt) : <span className="text-slate-300">—</span>}
      </td>

      {/* ── Estado ── */}
      <td className="px-3 py-2 text-center">
        <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold border ${estadoBadge[row.estado]}`}>
          {estadoLabel[row.estado]}
        </span>
      </td>
    </tr>
  );
}

function Th({ children, right, border }: { children: React.ReactNode; right?: boolean; border?: boolean }) {
  return (
    <th
      className={`px-2 py-1.5 text-[9px] uppercase tracking-wider font-semibold text-muted-foreground whitespace-nowrap
        ${right ? "text-right" : "text-left"}
        ${border ? "border-r border-slate-200" : ""}
      `}
    >
      {children}
    </th>
  );
}

function GroupTh({ children, span, color }: { children: React.ReactNode; span: number; color: string }) {
  return (
    <th
      colSpan={span}
      className="px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold text-center border-l border-slate-200 border-b border-slate-200"
      style={{ color }}
    >
      {children}
    </th>
  );
}

export function BranchTable() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-2.5 border-b border-border flex items-center justify-between"
        style={{ background: "#0d1b35" }}
      >
        <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
          Comparativo de Sucursales &mdash; acumulado al {REPORT_DATE}
        </p>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />OK</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Alerta</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Crítico</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            {/* ── Grupo de columnas ── */}
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-1.5 sticky left-0 bg-slate-50 border-r border-slate-200" />
              <GroupTh span={4} color="#1d4ed8">Facturación</GroupTh>
              <GroupTh span={4} color="#0891b2">Clientes</GroupTh>
              <GroupTh span={2} color="#0f766e">Ticket Prom.</GroupTh>
              <GroupTh span={2} color="#ca8a04">Chango</GroupTh>
              <GroupTh span={2} color="#7c3aed">Superficie</GroupTh>
              <th className="px-3 py-1.5 border-l border-slate-200" />
            </tr>
            {/* ── Columnas individuales ── */}
            <tr className="bg-slate-50 border-b border-border">
              <Th border>Sucursal</Th>
              <Th right>Monto</Th>
              <Th right>%</Th>
              <Th right>M.Ant</Th>
              <Th right border>AA</Th>
              <Th right>Cant.</Th>
              <Th right>%</Th>
              <Th right>M.Ant</Th>
              <Th right border>AA</Th>
              <Th right>Valor</Th>
              <Th right border>AA</Th>
              <Th right>Prom.</Th>
              <Th right border>M.Ant</Th>
              <Th right>Mts (ap.)</Th>
              <Th right border>$/mt.</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {branchRows.map((row) => <Row key={row.name} row={row} />)}
            <Row row={totalRow} isTotal />
          </tbody>
        </table>
      </div>
    </div>
  );
}
