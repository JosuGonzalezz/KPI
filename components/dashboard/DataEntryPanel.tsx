"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Save, RotateCcw, DatabaseZap,
  TrendingUp, Users, ShoppingCart, Package,
  Building2, BarChart2, CreditCard, AlertTriangle, UserCheck,
  ChevronRight, Calculator, CheckCircle2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────
type SucursalKey = "colon" | "falucho" | "peron" | "sanmartin" | "virtual";

interface SucursalInput {
  facturacion: string;   // raw input
  clientes:    string;
  productos:   string;
}

interface RRHHInput {
  programados: string;
  presentes:   string;
}

interface FormState {
  fecha:        string;
  hora:         string;
  periodo:      string;
  tempMax:      string;
  tempMin:      string;

  // Solo metas y variaciones manuales — los acumulados se calculan desde sucursales
  facMeta:      string;
  facVsMesAnt:  string;
  facVsAA:      string;

  cliMeta:      string;
  cliVsMesAnt:  string;
  cliVsAA:      string;

  changoMeta:   string;
  changoVsMesAnt: string;
  changoVsAA:   string;

  ticketMeta:   string;
  ticketVsMesAnt: string;
  ticketVsAA:   string;

  sucursales:   Record<SucursalKey, SucursalInput>;
  rrhh:         Record<SucursalKey, RRHHInput>;

  pagoEfectivo:   string;
  pagoDebito:     string;
  pagoCredito:    string;
  pagoBilleteras: string;
  pagoOtros:      string;

  mermaConociPct:  string;
  mermaDesconoPct: string;

  alerta1: string;
  alerta2: string;
  alerta3: string;
  alerta4: string;
}

const SUCURSALES: { key: SucursalKey; label: string; mts: number | null }[] = [
  { key: "colon",     label: "Colón",      mts: 950  },
  { key: "falucho",   label: "Falucho",    mts: 685  },
  { key: "peron",     label: "Perón",      mts: 600  },
  { key: "sanmartin", label: "San Martín", mts: 710  },
  { key: "virtual",   label: "Virtual",    mts: null },
];

const EMPTY_SUC:  SucursalInput = { facturacion: "", clientes: "", productos: "" };
const EMPTY_RRHH: RRHHInput     = { programados: "", presentes: "" };

const INITIAL: FormState = {
  fecha: "", hora: "", periodo: "", tempMax: "", tempMin: "",
  facMeta: "", facVsMesAnt: "", facVsAA: "",
  cliMeta: "", cliVsMesAnt: "", cliVsAA: "",
  changoMeta: "", changoVsMesAnt: "", changoVsAA: "",
  ticketMeta: "", ticketVsMesAnt: "", ticketVsAA: "",
  sucursales: Object.fromEntries(SUCURSALES.map(s => [s.key, { ...EMPTY_SUC }])) as Record<SucursalKey, SucursalInput>,
  rrhh:       Object.fromEntries(SUCURSALES.map(s => [s.key, { ...EMPTY_RRHH }])) as Record<SucursalKey, RRHHInput>,
  pagoEfectivo: "", pagoDebito: "", pagoCredito: "", pagoBilleteras: "", pagoOtros: "",
  mermaConociPct: "", mermaDesconoPct: "",
  alerta1: "", alerta2: "", alerta3: "", alerta4: "",
};

type Tab = "encabezado" | "sucursales" | "kpis" | "operativo" | "alertas";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "encabezado", label: "Encabezado",   icon: <DatabaseZap    className="w-4 h-4" /> },
  { key: "sucursales", label: "Sucursales",   icon: <Building2      className="w-4 h-4" /> },
  { key: "kpis",       label: "Metas y var.", icon: <TrendingUp     className="w-4 h-4" /> },
  { key: "operativo",  label: "Operativo",    icon: <BarChart2      className="w-4 h-4" /> },
  { key: "alertas",    label: "Alertas",      icon: <AlertTriangle  className="w-4 h-4" /> },
];

// ── Number helpers ────────────────────────────────────────────
function parseNum(s: string): number {
  // Accept both "1.234,56" (es-AR) and "198581228.33" or "198.581.228,33"
  const cleaned = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
function fmtARS(n: number): string {
  if (n === 0) return "—";
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(3).replace(".", ",") + " B";
  if (n >= 1_000_000)     return "$" + (n / 1_000_000).toFixed(2).replace(".", ",") + " M";
  return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fmtInt(n: number): string {
  if (n === 0) return "—";
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fmtPct(n: number): string {
  if (!isFinite(n) || n === 0) return "—";
  return n.toFixed(2).replace(".", ",") + " %";
}

// ── Sub-components ───────────────────────────────────────────
function Field({
  label, name, value, onChange, placeholder = "", type = "text", hint, readOnly = false,
}: {
  label: string; name: string; value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; hint?: string; readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        id={name} name={name} type={type} value={value}
        onChange={onChange}
        placeholder={placeholder} readOnly={readOnly}
        className={`h-9 rounded-lg border px-3 text-sm transition-all
          ${readOnly
            ? "bg-slate-100 border-border text-slate-500 cursor-not-allowed"
            : "bg-white border-border text-foreground placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:border-[#1d4ed8]"
          }`}
      />
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-border mb-5">
      <span className="text-[#1d4ed8]">{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function CalcBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-1">
        <Calculator className="w-3 h-3 text-[#1d4ed8]" />
        <span className="text-sm font-bold text-[#1d4ed8]">{value}</span>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export function DataEntryPanel() {
  const [tab,   setTab]   = useState<Tab>("sucursales");
  const [form,  setForm]  = useState<FormState>(INITIAL);
  const [saved, setSaved] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSucursal(key: SucursalKey, field: keyof SucursalInput, value: string) {
    setForm(prev => ({
      ...prev,
      sucursales: { ...prev.sucursales, [key]: { ...prev.sucursales[key], [field]: value } },
    }));
  }

  function handleRRHH(key: SucursalKey, field: keyof RRHHInput, value: string) {
    setForm(prev => ({
      ...prev,
      rrhh: { ...prev.rrhh, [key]: { ...prev.rrhh[key], [field]: value } },
    }));
  }

  // ── Derived / calculated values ──────────────────────────
  const derived = useMemo(() => {
    const rows = SUCURSALES.map(s => {
      const fac  = parseNum(form.sucursales[s.key].facturacion);
      const cli  = parseNum(form.sucursales[s.key].clientes);
      const prod = parseNum(form.sucursales[s.key].productos);
      return { key: s.key, label: s.label, mts: s.mts, fac, cli, prod };
    });

    const totalFac  = rows.reduce((a, r) => a + r.fac,  0);
    const totalCli  = rows.reduce((a, r) => a + r.cli,  0);
    const totalProd = rows.reduce((a, r) => a + r.prod, 0);

    const ticketGlobal = totalCli > 0 ? totalFac / totalCli : 0;
    const changoGlobal = totalCli > 0 ? totalProd / totalCli : 0;

    const withCalc = rows.map(r => ({
      ...r,
      pctFac:      totalFac  > 0 ? (r.fac  / totalFac)  * 100 : 0,
      pctCli:      totalCli  > 0 ? (r.cli  / totalCli)  * 100 : 0,
      ticket:      r.cli > 0 ? r.fac  / r.cli  : 0,
      chango:      r.cli > 0 ? r.prod / r.cli  : 0,
      factPorMt:   r.mts ? r.fac / r.mts : null,
    }));

    const rrhhRows = SUCURSALES.map(s => {
      const prog   = parseNum(form.rrhh[s.key].programados);
      const pres   = parseNum(form.rrhh[s.key].presentes);
      const ausent = prog > 0 ? ((prog - pres) / prog) * 100 : 0;
      return { key: s.key, label: s.label, prog, pres, ausent };
    });

    return { rows: withCalc, totalFac, totalCli, totalProd, ticketGlobal, changoGlobal, rrhhRows };
  }, [form.sucursales, form.rrhh]);

  const paySum = useMemo(() => {
    return ["pagoEfectivo","pagoDebito","pagoCredito","pagoBilleteras","pagoOtros"]
      .reduce((a, k) => a + parseNum((form as unknown as Record<string,string>)[k]), 0);
  }, [form.pagoEfectivo, form.pagoDebito, form.pagoCredito, form.pagoBilleteras, form.pagoOtros]);

  function handleSave() {
    console.log("[DataEntry] saved:", { form, derived });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() { setForm(INITIAL); }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top Bar ── */}
      <header className="flex items-center gap-4 px-5 py-3 border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="w-9 h-9 relative shrink-0">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium leading-none">
            Panel de carga de datos
          </p>
          <h1 className="text-base font-bold text-foreground leading-tight">Reporte de Sucursales</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-border
              text-muted-foreground hover:bg-slate-100 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all
              ${saved ? "bg-green-600 text-white" : "bg-[#1d4ed8] hover:bg-[#1e40af] text-white"}`}>
            {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Guardado" : "Guardar reporte"}
          </button>
          <Link href="/"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-border
              text-muted-foreground hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Ver dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar ── */}
        <nav className="w-52 shrink-0 border-r border-border bg-card py-4 flex flex-col gap-1 px-3">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors w-full
                ${tab === t.key
                  ? "bg-[#1d4ed8] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"}`}>
              {t.icon}
              {t.label}
              {tab === t.key && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-border px-1">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Los valores calculados (ticket, chango, % sobre total) se derivan automaticamente de los datos ingresados.
            </p>
          </div>
        </nav>

        {/* ── Content ── */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* ─────────────────────────────────────────────────── */}
          {/* Tab: Encabezado                                     */}
          {/* ─────────────────────────────────────────────────── */}
          {tab === "encabezado" && (
            <div className="max-w-2xl flex flex-col gap-6">
              <SectionTitle icon={<DatabaseZap className="w-5 h-5" />}
                title="Datos del encabezado"
                subtitle="Fecha, hora y condicion climatica del reporte" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha de cierre" name="fecha" value={form.fecha}
                  onChange={handleChange} placeholder="15/05/2026" hint="Formato DD/MM/AAAA" />
                <Field label="Hora de cierre" name="hora" value={form.hora}
                  onChange={handleChange} placeholder="17:03" hint="Formato HH:MM" />
              </div>
              <Field label="Periodo del reporte" name="periodo" value={form.periodo}
                onChange={handleChange} placeholder="Mayo 2026" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Temperatura maxima (°C)" name="tempMax" value={form.tempMax}
                  onChange={handleChange} placeholder="19" type="number" />
                <Field label="Temperatura minima (°C)" name="tempMin" value={form.tempMin}
                  onChange={handleChange} placeholder="9" type="number" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <DatabaseZap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-1">Integracion futura</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Estos campos estan preparados para conectarse a una API o base de datos.
                    Al guardar, los valores se podran propagar automaticamente al dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* Tab: Sucursales — ENTRADA PRINCIPAL                 */}
          {/* ─────────────────────────────────────────────────── */}
          {tab === "sucursales" && (
            <div className="flex flex-col gap-6 max-w-5xl">
              <SectionTitle icon={<Building2 className="w-5 h-5" />}
                title="Datos por sucursal"
                subtitle="Ingresa Facturacion, Clientes y Articulos. El resto se calcula automaticamente." />

              {/* Input cards */}
              <div className="flex flex-col gap-3">
                {SUCURSALES.map(s => {
                  const row = derived.rows.find(r => r.key === s.key)!;
                  const hasData = row.fac > 0 || row.cli > 0 || row.prod > 0;
                  return (
                    <div key={s.key} className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                      {/* Header row */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#1d4ed8]" />
                          <span className="text-xs font-bold text-foreground uppercase tracking-wide">{s.label}</span>
                          {s.mts && (
                            <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                              {s.mts} m²
                            </span>
                          )}
                          {!s.mts && (
                            <span className="text-[10px] bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                              Canal online
                            </span>
                          )}
                        </div>
                        {hasData && (
                          <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Con datos
                          </span>
                        )}
                      </div>

                      <div className="p-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Left: inputs */}
                        <div className="grid grid-cols-3 gap-3">
                          {/* Facturacion */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                              Facturacion ($)
                            </label>
                            <input
                              value={form.sucursales[s.key].facturacion}
                              onChange={e => handleSucursal(s.key, "facturacion", e.target.value)}
                              placeholder="198.581.228,33"
                              className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-slate-300
                                focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:border-[#1d4ed8] transition-all"
                            />
                            <p className="text-[10px] text-slate-400">Sin $ ni espacios</p>
                          </div>
                          {/* Clientes */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                              Clientes
                            </label>
                            <input
                              value={form.sucursales[s.key].clientes}
                              onChange={e => handleSucursal(s.key, "clientes", e.target.value)}
                              placeholder="5491"
                              className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-slate-300
                                focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:border-[#1d4ed8] transition-all"
                            />
                            <p className="text-[10px] text-slate-400">Transacciones</p>
                          </div>
                          {/* Articulos */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                              Articulos
                            </label>
                            <input
                              value={form.sucursales[s.key].productos}
                              onChange={e => handleSucursal(s.key, "productos", e.target.value)}
                              placeholder="58972"
                              className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-slate-300
                                focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:border-[#1d4ed8] transition-all"
                            />
                            <p className="text-[10px] text-slate-400">Unidades vendidas</p>
                          </div>
                        </div>

                        {/* Right: calculated */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                          <CalcBadge label="% Fact. cadena" value={hasData ? fmtPct(row.pctFac) : "—"} />
                          <CalcBadge label="% Clientes cadena" value={hasData ? fmtPct(row.pctCli) : "—"} />
                          <CalcBadge label="Ticket prom." value={hasData ? fmtARS(row.ticket) : "—"} />
                          <CalcBadge label="Chango prom." value={hasData ? row.chango.toFixed(2).replace(".", ",") + " item" : "—"} />
                          {s.mts && (
                            <>
                              <CalcBadge label="Fact. por m²" value={hasData ? fmtARS(row.factPorMt ?? 0) : "—"} />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totales cadena */}
              <div className="bg-[#0d1b35] border border-slate-700 rounded-xl p-4">
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-3">Total cadena (calculado)</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Facturacion</p>
                    <p className="text-sm font-bold text-white">{fmtARS(derived.totalFac)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Clientes</p>
                    <p className="text-sm font-bold text-white">{fmtInt(derived.totalCli)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Articulos</p>
                    <p className="text-sm font-bold text-white">{fmtInt(derived.totalProd)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Ticket prom.</p>
                    <p className="text-sm font-bold text-[#f97316]">{fmtARS(derived.ticketGlobal)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Chango prom.</p>
                    <p className="text-sm font-bold text-[#f97316]">
                      {derived.changoGlobal > 0 ? derived.changoGlobal.toFixed(2).replace(".", ",") + " item" : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview tabla */}
              {derived.totalFac > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#1d4ed8]" />
                    Preview — tabla comparativa calculada
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#0d1b35] text-white">
                          <th className="px-3 py-2 text-left font-semibold text-[11px]">Sucursal</th>
                          <th className="px-3 py-2 text-right font-semibold text-[11px]">Facturacion</th>
                          <th className="px-3 py-2 text-right font-semibold text-[11px]">% total</th>
                          <th className="px-3 py-2 text-right font-semibold text-[11px]">Clientes</th>
                          <th className="px-3 py-2 text-right font-semibold text-[11px]">% total</th>
                          <th className="px-3 py-2 text-right font-semibold text-[11px]">Articulos</th>
                          <th className="px-3 py-2 text-right font-semibold text-[11px]">Ticket prom.</th>
                          <th className="px-3 py-2 text-right font-semibold text-[11px]">Chango prom.</th>
                          <th className="px-3 py-2 text-right font-semibold text-[11px]">Fact./m²</th>
                        </tr>
                      </thead>
                      <tbody>
                        {derived.rows.map((r, i) => (
                          <tr key={r.key} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="px-3 py-2 font-semibold text-foreground">{r.label}</td>
                            <td className="px-3 py-2 text-right text-foreground">{r.fac > 0 ? fmtARS(r.fac) : "—"}</td>
                            <td className="px-3 py-2 text-right text-[#1d4ed8] font-semibold">{r.fac > 0 ? fmtPct(r.pctFac) : "—"}</td>
                            <td className="px-3 py-2 text-right text-foreground">{r.cli > 0 ? fmtInt(r.cli) : "—"}</td>
                            <td className="px-3 py-2 text-right text-[#1d4ed8] font-semibold">{r.cli > 0 ? fmtPct(r.pctCli) : "—"}</td>
                            <td className="px-3 py-2 text-right text-foreground">{r.prod > 0 ? fmtInt(r.prod) : "—"}</td>
                            <td className="px-3 py-2 text-right font-semibold text-[#0f766e]">{r.cli > 0 ? fmtARS(r.ticket) : "—"}</td>
                            <td className="px-3 py-2 text-right font-semibold text-[#f97316]">
                              {r.cli > 0 ? r.chango.toFixed(2).replace(".", ",") : "—"}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500">
                              {r.mts && r.fac > 0 ? fmtARS(r.factPorMt ?? 0) : "—"}
                            </td>
                          </tr>
                        ))}
                        {/* Total row */}
                        <tr className="bg-[#1d4ed8]/10 border-t-2 border-[#1d4ed8]">
                          <td className="px-3 py-2 font-bold text-[#1d4ed8]">TOTAL</td>
                          <td className="px-3 py-2 text-right font-bold text-[#1d4ed8]">{fmtARS(derived.totalFac)}</td>
                          <td className="px-3 py-2 text-right font-bold text-[#1d4ed8]">100 %</td>
                          <td className="px-3 py-2 text-right font-bold text-[#1d4ed8]">{fmtInt(derived.totalCli)}</td>
                          <td className="px-3 py-2 text-right font-bold text-[#1d4ed8]">100 %</td>
                          <td className="px-3 py-2 text-right font-bold text-[#1d4ed8]">{fmtInt(derived.totalProd)}</td>
                          <td className="px-3 py-2 text-right font-bold text-[#0f766e]">{fmtARS(derived.ticketGlobal)}</td>
                          <td className="px-3 py-2 text-right font-bold text-[#f97316]">
                            {derived.changoGlobal > 0 ? derived.changoGlobal.toFixed(2).replace(".", ",") : "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-400">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* Tab: KPIs — solo metas y variaciones manuales       */}
          {/* ─────────────────────────────────────────────────── */}
          {tab === "kpis" && (
            <div className="max-w-3xl flex flex-col gap-6">
              <SectionTitle icon={<TrendingUp className="w-5 h-5" />}
                title="Metas mensuales y variaciones"
                subtitle="Los acumulados se calculan desde los datos de sucursales. Solo ingresa metas y % de variacion." />

              {/* Acumulados auto - readonly summary */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 flex flex-col gap-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#1d4ed8]" /> Acumulados calculados desde sucursales
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Facturacion",   value: fmtARS(derived.totalFac)  },
                    { label: "Clientes",       value: fmtInt(derived.totalCli)  },
                    { label: "Articulos",      value: fmtInt(derived.totalProd) },
                    { label: "Ticket prom.",   value: fmtARS(derived.ticketGlobal) },
                    { label: "Chango prom.",   value: derived.changoGlobal > 0 ? derived.changoGlobal.toFixed(2).replace(".",",") + " item" : "—" },
                  ].map(f => (
                    <div key={f.label} className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{f.label}</span>
                      <div className="h-9 rounded-lg border border-border bg-slate-100 px-3 flex items-center">
                        <span className="text-sm font-bold text-[#1d4ed8]">{f.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facturacion — meta y variaciones */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#1d4ed8]" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Facturacion</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Meta mensual ($)" name="facMeta" value={form.facMeta}
                    onChange={handleChange} placeholder="2731600033" hint="Objetivo del mes completo" />
                  <Field label="% vs Mes Ant." name="facVsMesAnt" value={form.facVsMesAnt}
                    onChange={handleChange} placeholder="1.82" hint="Ej: -3.5 o 5.2" />
                  <Field label="% vs AA" name="facVsAA" value={form.facVsAA}
                    onChange={handleChange} placeholder="-1.9" />
                </div>
              </div>

              {/* Clientes */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#0891b2]" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Clientes (transacciones)</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Meta mensual" name="cliMeta" value={form.cliMeta}
                    onChange={handleChange} placeholder="84000" />
                  <Field label="% vs Mes Ant." name="cliVsMesAnt" value={form.cliVsMesAnt}
                    onChange={handleChange} placeholder="-3.57" />
                  <Field label="% vs AA" name="cliVsAA" value={form.cliVsAA}
                    onChange={handleChange} placeholder="-4.6" />
                </div>
              </div>

              {/* Ticket promedio */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-4 h-4 text-[#0f766e]" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                    Ticket Promedio
                    <span className="ml-2 text-[10px] font-normal text-slate-400 normal-case">= Facturacion / Clientes</span>
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Meta ($)" name="ticketMeta" value={form.ticketMeta}
                    onChange={handleChange} placeholder="38000" />
                  <Field label="% vs Mes Ant." name="ticketVsMesAnt" value={form.ticketVsMesAnt}
                    onChange={handleChange} placeholder="-3.68" />
                  <Field label="% vs AA" name="ticketVsAA" value={form.ticketVsAA}
                    onChange={handleChange} placeholder="2.85" />
                </div>
              </div>

              {/* Chango promedio */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-[#f97316]" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                    Chango Promedio
                    <span className="ml-2 text-[10px] font-normal text-slate-400 normal-case">= Articulos / Clientes</span>
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Meta (items)" name="changoMeta" value={form.changoMeta}
                    onChange={handleChange} placeholder="11.50" />
                  <Field label="% vs Mes Ant." name="changoVsMesAnt" value={form.changoVsMesAnt}
                    onChange={handleChange} placeholder="-3.61" />
                  <Field label="% vs AA" name="changoVsAA" value={form.changoVsAA}
                    onChange={handleChange} placeholder="0.5" />
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* Tab: Operativo                                       */}
          {/* ─────────────────────────────────────────────────── */}
          {tab === "operativo" && (
            <div className="max-w-2xl flex flex-col gap-6">
              <SectionTitle icon={<BarChart2 className="w-5 h-5" />}
                title="Datos operativos"
                subtitle="Medios de pago, merma y dotacion de personal" />

              {/* Medios de pago */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#1d4ed8]" />
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">Mix de medios de pago (%)</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border
                    ${Math.abs(paySum - 100) < 0.01
                      ? "bg-green-100 text-green-700 border-green-200"
                      : paySum > 0
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-500 border-border"
                    }`}>
                    Suma: {paySum > 0 ? paySum.toFixed(1).replace(".", ",") + " %" : "—"}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: "Efectivo",   name: "pagoEfectivo",   value: form.pagoEfectivo,   ph: "30" },
                    { label: "Debito",     name: "pagoDebito",     value: form.pagoDebito,     ph: "35" },
                    { label: "Credito",    name: "pagoCredito",    value: form.pagoCredito,    ph: "20" },
                    { label: "Billeteras", name: "pagoBilleteras", value: form.pagoBilleteras, ph: "14" },
                    { label: "Otros",      name: "pagoOtros",      value: form.pagoOtros,      ph: "1"  },
                  ].map(f => (
                    <div key={f.name} className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{f.label}</label>
                      <input name={f.name} value={f.value} onChange={handleChange} placeholder={f.ph}
                        className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-slate-300
                          focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:border-[#1d4ed8] transition-all text-center" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Merma */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Control de merma (%)</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Merma conocida (%)" name="mermaConociPct" value={form.mermaConociPct}
                    onChange={handleChange} placeholder="0.76" hint="Umbral recomendado: < 0.80%" />
                  <Field label="Merma desconocida (%)" name="mermaDesconoPct" value={form.mermaDesconoPct}
                    onChange={handleChange} placeholder="1.59" hint="Umbral recomendado: < 1.50%" />
                </div>
              </div>

              {/* RRHH con ausentismo calculado */}
              <div className="bg-slate-50 border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-4 h-4 text-[#0f766e]" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">RRHH / Dotacion</p>
                </div>
                <p className="text-[11px] text-muted-foreground -mt-1">
                  El % de ausentismo se calcula: (programados - presentes) / programados x 100
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">Sucursal</th>
                        <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Programados</th>
                        <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Presentes</th>
                        <th className="text-center py-2 px-3 font-semibold text-muted-foreground flex items-center justify-center gap-1">
                          <Calculator className="w-3 h-3 text-[#1d4ed8]" /> Ausentismo %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {derived.rrhhRows.map((r, i) => (
                        <tr key={r.key} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-slate-50/60"}`}>
                          <td className="py-2 pr-4 font-semibold text-foreground">{r.label}</td>
                          <td className="py-2 px-3">
                            <input
                              value={form.rrhh[r.key].programados}
                              onChange={e => handleRRHH(r.key as SucursalKey, "programados", e.target.value)}
                              placeholder="42"
                              className="h-8 w-full rounded-lg border border-border bg-white px-2 text-sm text-foreground text-center
                                focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:border-[#1d4ed8] transition-all"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              value={form.rrhh[r.key].presentes}
                              onChange={e => handleRRHH(r.key as SucursalKey, "presentes", e.target.value)}
                              placeholder="40"
                              className="h-8 w-full rounded-lg border border-border bg-white px-2 text-sm text-foreground text-center
                                focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:border-[#1d4ed8] transition-all"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            {r.prog > 0 ? (
                              <span className={`font-bold text-xs px-2 py-0.5 rounded-full
                                ${r.ausent < 8  ? "bg-green-100 text-green-700"
                                : r.ausent < 15 ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"}`}>
                                {r.ausent.toFixed(1).replace(".", ",")} %
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* Tab: Alertas                                         */}
          {/* ─────────────────────────────────────────────────── */}
          {tab === "alertas" && (
            <div className="max-w-2xl flex flex-col gap-6">
              <SectionTitle icon={<AlertTriangle className="w-5 h-5" />}
                title="Alertas del reporte"
                subtitle="Hasta 4 alertas criticas o advertencias que apareceran en la barra superior del dashboard" />

              {[
                { name: "alerta1", value: form.alerta1, sev: "Critica (rojo)",        ph: "Virtual cayo -19,41% en facturacion vs año anterior." },
                { name: "alerta2", value: form.alerta2, sev: "Critica (rojo)",        ph: "Clientes totales con caida acumulada del -4,6% vs AA."  },
                { name: "alerta3", value: form.alerta3, sev: "Advertencia (naranja)", ph: "Ticket promedio cadena -7,89% vs ano anterior."         },
                { name: "alerta4", value: form.alerta4, sev: "Advertencia (naranja)", ph: "Falucho: clientes +18,7% AA pero ticket -10,83%."        },
              ].map((a, i) => (
                <div key={a.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Alerta {i + 1}</label>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
                      ${i < 2 ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                      {a.sev}
                    </span>
                  </div>
                  <input name={a.name} value={a.value} onChange={handleChange} placeholder={a.ph}
                    className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-slate-300
                      focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/40 focus:border-[#1d4ed8] transition-all" />
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Deja un campo en blanco para que no aparezca esa alerta en el dashboard.
                  Las alertas se muestran en orden de mayor a menor severidad.
                </p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
