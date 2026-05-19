import { DashboardHeader }  from "@/components/dashboard/DashboardHeader";
import { AlertsBar }        from "@/components/dashboard/AlertsBar";
import { KPICards }         from "@/components/dashboard/KPICards";
import { MonthlyGoals }     from "@/components/dashboard/MonthlyGoals";
import { DailyProgress }    from "@/components/dashboard/DailyProgress";
import { BranchTable }      from "@/components/dashboard/BranchTable";
import { PaymentMix }       from "@/components/dashboard/PaymentMix";
import { ShrinkagePanel }   from "@/components/dashboard/ShrinkagePanel";
import { RRHHPanel }        from "@/components/dashboard/RRHHPanel";
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Header */}
      <DashboardHeader />

      {/* Alerts bar */}
      <AlertsBar />

      {/* Main content */}
      <main id="dashboard-content" className="flex-1 p-3 flex flex-col gap-3">

        {/* Row 1: KPI Cards MTD acumuladas */}
        <KPICards />

        {/* Row 2: Progresión diaria + Gauge Objetivos — mismo alto */}
        <div className="grid grid-cols-2 gap-3 items-stretch">
          <DailyProgress />
          <MonthlyGoals />
        </div>

        {/* Row 4: Tabla comparativa sucursales */}
        <BranchTable />

        {/* Row 5: Pagos | Merma | RRHH */}
        <div className="grid grid-cols-3 gap-3">
          <PaymentMix />
          <ShrinkagePanel />
          <RRHHPanel />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-2 flex items-center justify-between bg-card">
        <p className="text-[10px] text-muted-foreground">
          Datos reales al 14/05/2026 &mdash; preparado para integración con Supabase
        </p>
        <p className="text-[10px] text-muted-foreground">
          Reporte de Sucursales | v2.0
        </p>
      </footer>
    </div>
  );
}
