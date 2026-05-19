"use client";

import { alerts } from "@/lib/mock-data";
import { AlertTriangle, XCircle } from "lucide-react";

export function AlertsBar() {
  return (
    <div className="bg-slate-50 border-b border-border px-4 py-1.5 flex items-center gap-2 overflow-x-auto">
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold shrink-0 mr-1">
        Alertas
      </span>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
            alert.severity === "red"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          {alert.severity === "red" ? (
            <XCircle className="w-3 h-3 shrink-0" />
          ) : (
            <AlertTriangle className="w-3 h-3 shrink-0" />
          )}
          {alert.text}
        </div>
      ))}
    </div>
  );
}
