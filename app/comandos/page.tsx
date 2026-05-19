"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Trash2,
  Settings2, CalendarDays, ChevronLeft, Database, RefreshCw,
} from "lucide-react";
import { BRANCH_LABELS } from "@/lib/report-data";
import type { DailyRecord, TipoMetrica } from "@/lib/report-data";
import { ExportDataPDF } from "@/components/ExportDataPDF";

// ── Constantes ────────────────────────────────────────────────
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const TIPO_COLORS: Record<TipoMetrica, string> = {
  Clientes:    "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Producto:    "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Facturacion: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

// ── Helpers ───────────────────────────────────────────────────
function fmtNum(n: number | null | undefined, tipo: TipoMetrica): string {
  if (n === null || n === undefined) return "—";
  if (tipo === "Facturacion") {
    return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  }
  return n.toLocaleString("es-AR");
}

type AppConfig = {
  currentYear:  number;
  currentMonth: number;
  currentDay:   number;
  updatedAt:    string;
};

type StoreStats = {
  year: number; month: number;
  clientes: number; producto: number; facturacion: number; days: number;
};

// ── Componente principal ──────────────────────────────────────
export default function ComandosPage() {

  // ── Config state ──────────────────────────────────────────
  const [config, setConfig] = useState<AppConfig>({
    currentYear: 2026, currentMonth: 5, currentDay: 14, updatedAt: "",
  });
  const [configSaved, setConfigSaved] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);

  // ── CSV Upload state ───────────────────────────────────────
  const [dragging, setDragging]   = useState(false);
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<DailyRecord[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    ok: boolean; inserted: number; updated: number; errors: string[]; total: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Store overview state ───────────────────────────────────
  const [storeStats, setStoreStats]   = useState<StoreStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [allRecords, setAllRecords] = useState<DailyRecord[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Monthly totals upload state ────────────────────────────
  const [monthlyFile, setMonthlyFile] = useState<File | null>(null);
  const [monthlyUploading, setMonthlyUploading] = useState(false);
  const [monthlyResult, setMonthlyResult] = useState<{
    ok: boolean; inserted?: number; errors?: string[];
  } | null>(null);
  const [uploadingFor, setUploadingFor] = useState<'prev' | 'same' | null>(null);

  // ── Load config on mount ───────────────────────────────────
  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then((c: AppConfig) => setConfig(c))
      .catch(() => null);
    loadStoreStats();
  }, []);

  // ── Store stats ────────────────────────────────────────────
  async function loadStoreStats() {
    setStatsLoading(true);
    try {
      const res  = await fetch("/api/data");
      const data = await res.json() as { records: DailyRecord[] };
      setAllRecords(data.records);
      const map  = new Map<string, StoreStats>();

      for (const r of data.records) {
        const key = `${r.year}-${r.month}`;
        if (!map.has(key)) map.set(key, { year: r.year, month: r.month, clientes: 0, producto: 0, facturacion: 0, days: 0 });
        const s = map.get(key)!;
        if (r.tipo === "Clientes")    s.clientes    += r.total;
        if (r.tipo === "Producto")    s.producto     += r.total;
        if (r.tipo === "Facturacion") s.facturacion  += r.total;
        // Count unique days per month
      }

      // Count unique days
      const daySet = new Map<string, Set<number>>();
      for (const r of data.records) {
        const key = `${r.year}-${r.month}`;
        if (!daySet.has(key)) daySet.set(key, new Set());
        daySet.get(key)!.add(r.day);
      }
      for (const [key, s] of map) {
        s.days = daySet.get(key)?.size ?? 0;
      }

      const sorted = Array.from(map.values()).sort((a, b) =>
        b.year !== a.year ? b.year - a.year : b.month - a.month
      );
      setStoreStats(sorted);
    } catch { /* ignore */ }
    setStatsLoading(false);
  }

  // ── Save config ────────────────────────────────────────────
  async function handleSaveConfig() {
    setConfigLoading(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2500);
    } catch { /* ignore */ }
    setConfigLoading(false);
  }

  // ── CSV Parsing (client-side preview) ─────────────────────
  function parseCSVClient(raw: string): DailyRecord[] {
    // Eliminar BOM UTF-8 si está presente
    const clean = raw.replace(/^\uFEFF/, "").trim();
    const lines = clean.split(/\r?\n/);
    const errors: string[] = [];
    const records: DailyRecord[] = [];

    if (lines.length < 2) { setParseErrors(["Archivo vacío o sin datos"]); return []; }

    // Detectar separador: tab > punto y coma > coma
    const headerLine = lines[0];
    const sep = headerLine.includes("\t") ? "\t" : headerLine.includes(";") ? ";" : ",";

    // Parsear fecha: acepta D/M/YYYY, DD/MM/YYYY, D.M.YYYY, DD.MM.YYYY, DD-MM-YYYY
    const parseFecha = (s: string) => {
      const t = s?.trim() ?? "";
      const m = t.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
      if (!m) return null;
      const day = parseInt(m[1], 10), month = parseInt(m[2], 10), year = parseInt(m[3], 10);
      if (!day || !month || !year || month > 12 || day > 31) return null;
      const fechaNorm = `${String(day).padStart(2,"0")}/${String(month).padStart(2,"0")}/${year}`;
      return { day, month, year, fechaNorm };
    };

    // Parsear número con formato europeo mixto:
    //   57761896,19  → coma decimal
    //   54.585.034   → puntos de miles
    //   57.761.896,2 → puntos de miles + coma decimal
    const pn = (s: string): number | null => {
      const t = s?.trim() ?? "";
      if (!t) return null;
      let c = t;
      const hasDot = c.includes("."), hasComma = c.includes(",");
      if (hasDot && hasComma) {
        c = c.replace(/\./g, "").replace(",", ".");
      } else if (hasComma && !hasDot) {
        const parts = c.split(",");
        c = (parts.length === 2 && parts[1].length <= 3)
          ? c.replace(",", ".")
          : c.replace(/,/g, "");
      } else if (hasDot && !hasComma && c.split(".").length > 2) {
        c = c.replace(/\./g, "");
      }
      const n = parseFloat(c);
      return isNaN(n) ? null : Math.round(n);
    };

    // Normalizar tipo: aceptar "Producto" y "Productos", "Clientes", "Facturacion"
    const normalizarTipo = (t: string): TipoMetrica | null => {
      const clean = t?.trim().toLowerCase() ?? "";
      if (clean === "clientes") return "Clientes";
      if (clean === "producto" || clean === "productos") return "Producto";
      if (clean === "facturacion") return "Facturacion";
      return null;
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Para CSV separado por punto y coma: split directo (los números usan coma decimal
      // pero el separador de campos es ";", así que no hay ambigüedad)
      const cols = line.split(sep);

      if (cols.length < 8) {
        errors.push(`Línea ${i + 1}: columnas insuficientes (${cols.length})`);
        continue;
      }

      const [rawFecha, rawColon, rawSerrano, rawPeron, rawSanMartin, rawVirtual, rawTotal, rawTipo] = cols;

      const fecha = parseFecha(rawFecha);
      if (!fecha) { errors.push(`Línea ${i + 1}: fecha inválida "${rawFecha.trim()}"`); continue; }

      const tipo = normalizarTipo(rawTipo);
      if (!tipo) { errors.push(`Línea ${i + 1}: tipo inválido "${rawTipo?.trim()}"`); continue; }

      records.push({
        fecha:     fecha.fechaNorm,
        year:      fecha.year,
        month:     fecha.month,
        day:       fecha.day,
        colon:     pn(rawColon),
        serrano:   pn(rawSerrano),
        peron:     pn(rawPeron),
        sanMartin: pn(rawSanMartin),
        virtual:   pn(rawVirtual),
        total:     pn(rawTotal) ?? 0,
        tipo,
      });
    }

    setParseErrors(errors);
    return records;
  }

  function handleFileSelect(f: File) {
    setFile(f);
    setUploadResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const records = parseCSVClient(text);
      setPreview(records);
    };
    reader.readAsText(f, "UTF-8");
  }

  // ── Drag & drop ────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, []);

  // ── Upload ─────────────────────────────────────────────────
  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const res  = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: text }),
      });
      const data = await res.json();
      setUploadResult(data);
      if (data.ok) {
        loadStoreStats();
        setFile(null);
        setPreview([]);
      }
    } catch (e) {
      setUploadResult({ ok: false, inserted: 0, updated: 0, errors: [String(e)], total: 0 });
    }
    setUploading(false);
  }

  // ── Delete month ───────────────────────────────────────────
  async function handleDeleteMonth(year: number, month: number) {
    if (!confirm(`¿Eliminar todos los datos de ${MONTHS[month - 1]} ${year}?`)) return;
    await fetch(`/api/data?year=${year}&month=${month}`, { method: "DELETE" });
    loadStoreStats();
  }

  // ── Delete all data ────────────────────────────────────────
  async function handleDeleteAllData() {
    if (!confirm("¿Estás seguro? Esto eliminará TODOS los datos de la base de datos. Esta acción no se puede deshacer.")) return;
    if (!confirm("Confirmar: ¿Eliminar TODOS los datos?")) return;
    
    try {
      // Eliminar cada mes
      for (const stat of storeStats) {
        await fetch(`/api/data?year=${stat.year}&month=${stat.month}`, { method: "DELETE" });
      }
      setShowDeleteConfirm(false);
      loadStoreStats();
    } catch (e) {
      console.error("Error deleting all data:", e);
    }
  }

  // ── Upload monthly totals ──────────────────────────────────
  async function handleUploadMonthlyTotals(type: 'prev' | 'same') {
    if (!monthlyFile) return;
    
    setMonthlyUploading(true);
    setUploadingFor(type);
    
    try {
      const text = await monthlyFile.text();
      
      // Determinar año y mes según el tipo
      let year: number, month: number;
      if (type === 'prev') {
        const prevMonth = config.currentMonth === 1 ? 12 : config.currentMonth - 1;
        const prevYear = config.currentMonth === 1 ? config.currentYear - 1 : config.currentYear;
        year = prevYear;
        month = prevMonth;
      } else {
        year = config.currentYear - 1;
        month = config.currentMonth;
      }
      
      const res = await fetch("/api/monthly-totals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: text, year, month }),
      });
      
      const data = await res.json();
      setMonthlyResult(data);
      
      if (data.ok) {
        setMonthlyFile(null);
        loadStoreStats();
      }
    } catch (e) {
      setMonthlyResult({ ok: false, errors: [String(e)] });
    }
    
    setMonthlyUploading(false);
    setUploadingFor(null);
  }

  // ── Preview agrupado ───────────────────────────────────────
  const previewByTipo = (tipo: TipoMetrica) => preview.filter(r => r.tipo === tipo);
  const previewMonths = [...new Set(preview.map(r => `${MONTHS[r.month - 1]} ${r.year}`))];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ background: "#080f1e" }}>

      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-white/10" style={{ background: "#0d1b35" }}>
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>
        <div className="w-px h-5 bg-white/10" />
        <Settings2 className="w-4 h-4 text-blue-300" />
        <h1 className="text-lg font-bold text-white">Panel de Comandos</h1>
        <span className="ml-auto text-[11px] text-slate-500">
          Preparado para Supabase &mdash; almacenamiento local activo
        </span>
        {storeStats.length > 0 && (
          <ExportDataPDF year={config.currentYear} month={config.currentMonth} day={config.currentDay} />
        )}
      </header>

      <main className="max-w-6xl mx-auto p-6 flex flex-col gap-6">

        {/* ── Fila superior: Configuración + Resumen del store ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Configuración del período activo */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-blue-300" />
              <h2 className="text-sm font-semibold text-white">Período activo del dashboard</h2>
            </div>
            <p className="text-[11px] text-slate-400 -mt-2">
              El dashboard usa estos valores para calcular MTD, comparar con el mes anterior y con el mismo mes del año anterior automáticamente.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Año */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400">Año</label>
                <select
                  value={config.currentYear}
                  onChange={e => setConfig(c => ({ ...c, currentYear: Number(e.target.value) }))}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer hover:bg-white/15 transition-colors"
                >
                  {[2023, 2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y} className="bg-[#0d1b35]">{y}</option>
                  ))}
                </select>
              </div>

              {/* Mes */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400">Mes en curso</label>
                <select
                  value={config.currentMonth}
                  onChange={e => setConfig(c => ({ ...c, currentMonth: Number(e.target.value) }))}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer hover:bg-white/15 transition-colors"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i + 1} value={i + 1} className="bg-[#0d1b35]">{m}</option>
                  ))}
                </select>
              </div>

              {/* Día */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400">Hasta el día</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={config.currentDay}
                  onChange={e => setConfig(c => ({ ...c, currentDay: Number(e.target.value) }))}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white w-full"
                />
              </div>
            </div>

            {/* Períodos derivados */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(() => {
                const prevMonth = config.currentMonth === 1 ? 12 : config.currentMonth - 1;
                const prevYear = config.currentMonth === 1 ? config.currentYear - 1 : config.currentYear;
                const lastYear = config.currentYear - 1;
                
                return [
                  { label: "Mes en curso",       val: `${MONTHS[config.currentMonth - 1]} ${config.currentYear}`, color: "border-blue-500/40 bg-blue-500/10 text-blue-300" },
                  { label: "Mes anterior",        val: `${MONTHS[prevMonth - 1]} ${prevYear}`, color: "border-slate-500/40 bg-slate-500/10 text-slate-300" },
                  { label: "Mismo mes año ant.",  val: `${MONTHS[config.currentMonth - 1]} ${lastYear}`, color: "border-slate-500/40 bg-slate-500/10 text-slate-300" },
                ].map(({ label, val, color }) => (
                  <div key={label} className={`border rounded-lg p-2.5 ${color}`}>
                    <p className="text-[9px] uppercase tracking-wider opacity-70">{label}</p>
                    <p className="text-xs font-semibold mt-0.5">{val || "—"}</p>
                  </div>
                ));
              })()}
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={configLoading}
              className="mt-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              {configSaved
                ? <><CheckCircle2 className="w-4 h-4 text-green-300" /> Configuración guardada</>
                : configLoading
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
                : <><Settings2 className="w-3.5 h-3.5" /> Aplicar configuración</>
              }
            </button>
          </section>

          {/* Resumen del store */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-300" />
                <h2 className="text-sm font-semibold text-white">Base de datos local</h2>
              </div>
              <button
                onClick={loadStoreStats}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {storeStats.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-slate-500">
                <Database className="w-8 h-8 opacity-30" />
                <p className="text-sm">Sin datos cargados aún</p>
                <p className="text-[11px]">Cargá un CSV para comenzar</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-60">
                {storeStats.map(s => (
                  <div
                    key={`${s.year}-${s.month}`}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5"
                  >
                    <div className="shrink-0 w-20">
                      <p className="text-xs font-semibold text-white">{MONTHS[s.month - 1]}</p>
                      <p className="text-[10px] text-slate-400">{s.year} &middot; {s.days} días</p>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2 text-right">
                      <div>
                        <p className="text-[9px] text-blue-400 uppercase">Clientes</p>
                        <p className="text-[11px] text-white font-medium">{s.clientes.toLocaleString("es-AR")}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-teal-400 uppercase">Productos</p>
                        <p className="text-[11px] text-white font-medium">{s.producto.toLocaleString("es-AR")}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-violet-400 uppercase">Facturación</p>
                        <p className="text-[11px] text-white font-medium">
                          {"$" + Math.round(s.facturacion / 1_000_000).toLocaleString("es-AR") + "M"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMonth(s.year, s.month)}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                      title="Eliminar mes"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Cargar datos de meses cerrados */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-4 col-span-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-300" />
              <h2 className="text-sm font-semibold text-white">Cargar totales de meses cerrados</h2>
              <span className="ml-auto text-[10px] text-slate-500">Solo 3 filas por mes</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Descargá la plantilla, completá los 3 totales (Facturacion, Clientes, Productos) y cargá el archivo.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Mes anterior */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Mes anterior</p>
                </div>
                <p className="text-sm text-white font-semibold mb-1">
                  {(() => {
                    const prevMonth = config.currentMonth === 1 ? 12 : config.currentMonth - 1;
                    const prevYear = config.currentMonth === 1 ? config.currentYear - 1 : config.currentYear;
                    return `${MONTHS[prevMonth - 1]} ${prevYear}`;
                  })()}
                </p>
                <p className="text-[10px] text-slate-400 mb-3">
                  Totales del mes completo (3 filas)
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const prevMonth = config.currentMonth === 1 ? 12 : config.currentMonth - 1;
                      const prevYear = config.currentMonth === 1 ? config.currentYear - 1 : config.currentYear;
                      const monthName = MONTHS[prevMonth - 1];
                      const url = `/api/export-monthly-template?year=${prevYear}&month=${prevMonth}&monthName=${monthName}`;
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Totales_${monthName}_${prevYear}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Descargar plantilla
                  </button>
                  <label className="w-full">
                    <input
                      type="file"
                      accept=".csv,.tsv,.txt"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setMonthlyFile(f);
                          setMonthlyResult(null);
                        }
                      }}
                    />
                    <div className="w-full text-sm bg-slate-600 hover:bg-slate-700 text-white font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {monthlyFile && uploadingFor === 'prev' ? monthlyFile.name : 'Seleccionar CSV'}
                    </div>
                  </label>
                  {monthlyFile && (
                    <button
                      onClick={() => handleUploadMonthlyTotals('prev')}
                      disabled={monthlyUploading}
                      className="w-full text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {monthlyUploading && uploadingFor === 'prev' ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Cargando...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Confirmar carga</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Mismo mes año anterior */}
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <p className="text-xs font-semibold text-green-300 uppercase tracking-wider">Mismo mes año anterior</p>
                </div>
                <p className="text-sm text-white font-semibold mb-1">
                  {`${MONTHS[config.currentMonth - 1]} ${config.currentYear - 1}`}
                </p>
                <p className="text-[10px] text-slate-400 mb-3">
                  Totales del mes completo (3 filas)
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const lastYear = config.currentYear - 1;
                      const monthName = MONTHS[config.currentMonth - 1];
                      const url = `/api/export-monthly-template?year=${lastYear}&month=${config.currentMonth}&monthName=${monthName}`;
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Totales_${monthName}_${lastYear}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="w-full text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Descargar plantilla
                  </button>
                  <label className="w-full">
                    <input
                      type="file"
                      accept=".csv,.tsv,.txt"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setMonthlyFile(f);
                          setMonthlyResult(null);
                        }
                      }}
                    />
                    <div className="w-full text-sm bg-slate-600 hover:bg-slate-700 text-white font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {monthlyFile && uploadingFor === 'same' ? monthlyFile.name : 'Seleccionar CSV'}
                    </div>
                  </label>
                  {monthlyFile && (
                    <button
                      onClick={() => handleUploadMonthlyTotals('same')}
                      disabled={monthlyUploading}
                      className="w-full text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-3 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {monthlyUploading && uploadingFor === 'same' ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Cargando...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Confirmar carga</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Upload result */}
            {monthlyResult && (
              <div className={`border rounded-lg p-3 flex items-start gap-2 ${monthlyResult.ok ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                {monthlyResult.ok
                  ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  : <AlertCircle  className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                }
                <div>
                  {monthlyResult.ok ? (
                    <p className="text-sm text-green-300 font-semibold">
                      ✅ Totales cargados exitosamente ({monthlyResult.inserted} registros)
                    </p>
                  ) : (
                    <p className="text-sm text-red-300 font-semibold">❌ Error al cargar</p>
                  )}
                  {monthlyResult.errors && monthlyResult.errors.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{monthlyResult.errors.join(" · ")}</p>
                  )}
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-3">
              <p className="text-[10px] text-slate-300">
                <span className="font-semibold">💡 Formato:</span> Fecha (nombre del mes) | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo (Facturacion/Clientes/Productos)
              </p>
            </div>
          </section>

          {/* Gestión de base de datos */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3 col-span-2">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-300" />
              <h2 className="text-sm font-semibold text-white">Gestión de base de datos</h2>
            </div>
            
            {showDeleteConfirm ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex flex-col gap-3">
                <p className="text-sm text-red-300 font-semibold">⚠️ Confirmar eliminación de TODOS los datos</p>
                <p className="text-[11px] text-red-200/70">
                  Esta acción eliminará permanentemente todos los registros de la base de datos. No se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAllData}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    Sí, eliminar todo
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar toda la base de datos
              </button>
            )}
          </section>
        </div>

        {/* ── Carga de CSV ─────────────────────────────────────── */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Upload className="w-4 h-4 text-blue-300" />
            <h2 className="text-sm font-semibold text-white">Cargar archivo CSV</h2>
            <span className="ml-auto text-[10px] text-slate-500 font-mono">
              Fecha · Colón · Serrano · Perón · San Martín · Virtual · Total · Tipo
            </span>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer
              transition-all
              ${dragging
                ? "border-blue-400 bg-blue-500/10"
                : file
                ? "border-green-500/40 bg-green-500/5"
                : "border-white/15 hover:border-white/30 hover:bg-white/5"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
            {file ? (
              <>
                <FileText className="w-8 h-8 text-green-400" />
                <p className="text-sm font-semibold text-green-300">{file.name}</p>
                <p className="text-[11px] text-slate-400">
                  {preview.length} registros detectados
                  {parseErrors.length > 0 && ` · ${parseErrors.length} errores de parseo`}
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-500" />
                <p className="text-sm text-slate-300">Arrastrá o hacé clic para seleccionar</p>
                <p className="text-[11px] text-slate-500">CSV con tabulación o punto y coma &middot; Formato DD.MM.YYYY</p>
              </>
            )}
          </div>

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex flex-col gap-1">
              <p className="text-xs font-semibold text-yellow-300">Advertencias de parseo ({parseErrors.length})</p>
              {parseErrors.slice(0, 5).map((e, i) => (
                <p key={i} className="text-[11px] text-yellow-200/70">{e}</p>
              ))}
              {parseErrors.length > 5 && <p className="text-[11px] text-yellow-400">...y {parseErrors.length - 5} más</p>}
            </div>
          )}

          {/* Upload result */}
          {uploadResult && (
            <div className={`border rounded-lg p-3 flex items-start gap-2 ${uploadResult.ok ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              {uploadResult.ok
                ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                : <AlertCircle  className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              }
              <div>
                {uploadResult.ok ? (
                  <p className="text-sm text-green-300 font-semibold">
                    Carga exitosa &mdash; {uploadResult.inserted} nuevos, {uploadResult.updated} actualizados ({uploadResult.total} total)
                  </p>
                ) : (
                  <p className="text-sm text-red-300 font-semibold">Error al cargar</p>
                )}
                {uploadResult.errors?.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{uploadResult.errors.join(" · ")}</p>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {file && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading || preview.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {uploading
                  ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Subiendo...</>
                  : <><Upload className="w-3.5 h-3.5" /> Confirmar carga ({preview.length} registros)</>
                }
              </button>
              <button
                onClick={() => { setFile(null); setPreview([]); setParseErrors([]); setUploadResult(null); }}
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2.5"
              >
                Cancelar
              </button>
            </div>
          )}
        </section>

        {/* ── Preview de datos parseados ──────────────────────── */}
        {preview.length > 0 && (
          <section className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between" style={{ background: "#0d1b35" }}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-300" />
                <h2 className="text-sm font-semibold text-white">Vista previa del archivo</h2>
              </div>
              <div className="flex items-center gap-2">
                {previewMonths.map(m => (
                  <span key={m} className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">{m}</span>
                ))}
                <span className="text-[11px] text-slate-500">{preview.length} registros</span>
              </div>
            </div>

            {/* Tabs por tipo */}
            {(["Facturacion", "Clientes", "Producto"] as TipoMetrica[]).map(tipo => {
              const rows = previewByTipo(tipo);
              if (rows.length === 0) return null;
              return (
                <div key={tipo}>
                  <div className={`px-5 py-1.5 flex items-center gap-2 border-b border-white/5`}>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TIPO_COLORS[tipo]}`}>{tipo}</span>
                    <span className="text-[10px] text-slate-500">{rows.length} filas</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-4 py-2 text-left text-slate-500 font-medium">Fecha</th>
                          {Object.entries(BRANCH_LABELS).map(([k, label]) => (
                            <th key={k} className="px-3 py-2 text-right text-slate-500 font-medium">{label}</th>
                          ))}
                          <th className="px-4 py-2 text-right font-semibold text-slate-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 10).map((r, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-1.5 text-slate-300 font-mono">{r.fecha}</td>
                            <td className="px-3 py-1.5 text-right text-white">{fmtNum(r.colon,     tipo)}</td>
                            <td className="px-3 py-1.5 text-right text-white">{fmtNum(r.serrano,   tipo)}</td>
                            <td className="px-3 py-1.5 text-right text-white">{fmtNum(r.peron,     tipo)}</td>
                            <td className="px-3 py-1.5 text-right text-white">{fmtNum(r.sanMartin, tipo)}</td>
                            <td className="px-3 py-1.5 text-right text-white">{fmtNum(r.virtual,   tipo)}</td>
                            <td className="px-4 py-1.5 text-right font-semibold text-white">{fmtNum(r.total, tipo)}</td>
                          </tr>
                        ))}
                        {rows.length > 10 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-2 text-[10px] text-slate-500 text-center">
                              ...y {rows.length - 10} filas más
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ── Historial de cargas ─────────────────────────────── */}
        {allRecords.length > 0 && (
          <section className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between" style={{ background: "#0d1b35" }}>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-300" />
                <h2 className="text-sm font-semibold text-white">Historial de cargas</h2>
              </div>
              <span className="text-[11px] text-slate-500">{allRecords.length} registros totales</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-white/10" style={{ background: "#0d1b35" }}>
                    <th className="px-4 py-2 text-left text-slate-500 font-medium">Fecha</th>
                    <th className="px-4 py-2 text-left text-slate-500 font-medium">Mes</th>
                    <th className="px-4 py-2 text-left text-slate-500 font-medium">Tipo</th>
                    <th className="px-4 py-2 text-right text-slate-500 font-medium">Colón</th>
                    <th className="px-4 py-2 text-right text-slate-500 font-medium">Serrano</th>
                    <th className="px-4 py-2 text-right text-slate-500 font-medium">Perón</th>
                    <th className="px-4 py-2 text-right text-slate-500 font-medium">San Martín</th>
                    <th className="px-4 py-2 text-right text-slate-500 font-medium">Virtual</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allRecords.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-1.5 text-slate-300 font-mono">{r.fecha}</td>
                      <td className="px-4 py-1.5 text-slate-300">{MONTHS[r.month - 1]} {r.year}</td>
                      <td className="px-4 py-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TIPO_COLORS[r.tipo]}`}>
                          {r.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-right text-white">{fmtNum(r.colon, r.tipo)}</td>
                      <td className="px-4 py-1.5 text-right text-white">{fmtNum(r.serrano, r.tipo)}</td>
                      <td className="px-4 py-1.5 text-right text-white">{fmtNum(r.peron, r.tipo)}</td>
                      <td className="px-4 py-1.5 text-right text-white">{fmtNum(r.san_martin, r.tipo)}</td>
                      <td className="px-4 py-1.5 text-right text-white">{fmtNum(r.virtual, r.tipo)}</td>
                      <td className="px-4 py-1.5 text-right font-semibold text-white">{fmtNum(r.total, r.tipo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {allRecords.length > 50 && (
              <div className="px-5 py-2 border-t border-white/10 text-center text-[11px] text-slate-500">
                Mostrando 50 de {allRecords.length} registros
              </div>
            )}
          </section>
        )}

        {/* ── Formato de referencia ───────────────────────────── */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Formato esperado del CSV</h2>
          <div className="bg-black/40 rounded-lg p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
            <p className="text-slate-500 mb-1"># Separador: tabulación. Fecha: DD.MM.AAAA. Números: punto para miles, coma para decimales.</p>
            <p className="text-blue-300">Fecha{"	"}Colón{"	"}Serrano{"	"}Perón{"	"}San Martín{"	"}Virtual{"	"}Total{"	"}Tipo</p>
            <p>14.05.2026{"	"}57761896,2{"	"}43244684,4{"	"}33078680,2{"	"}44123726{"	"}23994968,6{"	"}202203955{"	"}Facturacion</p>
            <p>14.05.2026{"	"}18315{"	"}12826{"	"}10712{"	"}14487{"	"}6949{"	"}63289{"	"}Producto</p>
            <p>14.05.2026{"	"}1558{"	"}1223{"	"}1186{"	"}1790{"	"}313{"	"}6070{"	"}Clientes</p>
            <p className="text-slate-500 mt-1"># Virtual en blanco (celda vacía) cuando no tiene dato ese día.</p>
            <p className="text-slate-500"># Podés cargar una base histórica completa — el sistema selecciona los períodos automáticamente.</p>
          </div>
        </section>

      </main>
    </div>
  );
}
