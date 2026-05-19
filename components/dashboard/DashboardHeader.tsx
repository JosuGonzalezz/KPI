"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { REPORT_TIME, TEMP_MAX, TEMP_MIN } from "@/lib/mock-data";
import { Thermometer, Clock, Settings2 } from "lucide-react";
import { ExportPDF } from "./ExportPDF";

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

type AppConfig = {
  currentYear: number;
  currentMonth: number;
  currentDay: number;
};

export function DashboardHeader() {
  const [config, setConfig] = useState<AppConfig>({ currentYear: 2026, currentMonth: 5, currentDay: 14 });

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then((c: AppConfig) => setConfig(c))
      .catch(() => null);
  }, []);

  const mesLabel    = MONTHS[config.currentMonth - 1];
  const reportDate  = `${String(config.currentDay).padStart(2, "0")}/${String(config.currentMonth).padStart(2, "0")}/${config.currentYear}`;
  const periodo     = `${mesLabel} ${config.currentYear}`;

  return (
    <header
      className="text-white px-5 py-3 flex items-center gap-5"
      style={{ background: "#0d1b35" }}
    >
      {/* Logo + Title */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-11 h-11 relative shrink-0 rounded-lg overflow-hidden bg-white/10 p-1">
          <Image
            src="/logo.png"
            alt="Logo empresa"
            fill
            className="object-contain p-0.5"
            priority
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-blue-300 font-medium leading-none mb-0.5">
            Cadena de Supermercados
          </p>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-white">
            Reporte de Sucursales
          </h1>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">
            {periodo} &middot; Todas las sucursales
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-white/10 shrink-0" />

      {/* Fecha + Hora */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock className="w-3.5 h-3.5 text-blue-300" />
        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-400 leading-none">Cierre</p>
          <p className="text-sm font-semibold text-white leading-tight">{reportDate}</p>
          <p className="text-[10px] text-blue-300">{REPORT_TIME} hs</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-white/10 shrink-0" />

      {/* Temperatura */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Thermometer className="w-3.5 h-3.5 text-orange-400" />
        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-400 leading-none">Temperatura</p>
          <p className="text-sm font-semibold text-white leading-tight">
            <span className="text-orange-400">{TEMP_MAX}°</span>
            <span className="text-slate-400 text-xs mx-1">/</span>
            <span className="text-blue-300">{TEMP_MIN}°</span>
          </p>
          <p className="text-[10px] text-slate-400">máx / mín</p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/comandos"
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm border border-white/20"
        >
          <Settings2 className="w-3.5 h-3.5 text-blue-300" />
          Comandos
        </Link>
        <ExportPDF
          elementId="dashboard-content"
          filename={`reporte-sucursales-${config.currentDay}-${config.currentMonth}-${config.currentYear}`}
          buttonLabel="Exportar PDF"
          title="Descargar dashboard como PDF"
        />
      </div>
    </header>
  );
}
