"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, TrendingUp } from "lucide-react";
import type { MonthlyTotals } from "@/lib/supabase-store";

interface MonthlyGoalsPanelProps {
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  daysInMonth: number;
  onGoalsCalculated?: (goals: any) => void;
}

export function MonthlyGoalsPanel({
  currentDay,
  currentMonth,
  currentYear,
  daysInMonth,
  onGoalsCalculated,
}: MonthlyGoalsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<any>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualTotals, setManualTotals] = useState<Partial<MonthlyTotals>>({
    facturacion: 0,
    clientes: 0,
    producto: 0,
  });

  const percentageTranscurred = (currentDay / daysInMonth) * 100;

  useEffect(() => {
    loadGoals();
  }, [currentDay, currentMonth, currentYear, daysInMonth]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/monthly-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentYear,
          currentMonth,
          currentDay,
          daysInMonth,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data);
        onGoalsCalculated?.(data);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/monthly-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: currentYear,
          month: currentMonth,
          totals: manualTotals,
        }),
      });

      if (response.ok) {
        setManualMode(false);
        await loadGoals();
      }
    } catch (error) {
      console.error("Error saving manual totals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Objetivos del Mes
          </CardTitle>
          <CardDescription>
            Progreso: {currentDay} de {daysInMonth} días ({percentageTranscurred.toFixed(1)}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${percentageTranscurred}%` }}
            />
          </div>

          {/* Botones de control */}
          <div className="flex gap-2">
            <Button
              onClick={loadGoals}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Cargar Datos Automáticos
            </Button>
            <Button
              onClick={() => setManualMode(!manualMode)}
              variant="outline"
              size="sm"
            >
              {manualMode ? "Cancelar" : "Cargar Manual"}
            </Button>
          </div>

          {/* Modo manual */}
          {manualMode && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm">Cargar Totales Mensuales</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Facturación</Label>
                  <Input
                    type="number"
                    value={manualTotals.facturacion || 0}
                    onChange={(e) =>
                      setManualTotals({
                        ...manualTotals,
                        facturacion: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Clientes</Label>
                  <Input
                    type="number"
                    value={manualTotals.clientes || 0}
                    onChange={(e) =>
                      setManualTotals({
                        ...manualTotals,
                        clientes: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Producto</Label>
                  <Input
                    type="number"
                    value={manualTotals.producto || 0}
                    onChange={(e) =>
                      setManualTotals({
                        ...manualTotals,
                        producto: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
              </div>
              <Button
                onClick={handleManualSave}
                disabled={loading}
                size="sm"
                className="w-full"
              >
                Guardar Totales
              </Button>
            </div>
          )}

          {/* Resultados */}
          {goals && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Mes Anterior */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">
                    Objetivo (Mes Anterior)
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-gray-600">Facturación:</span>
                      <span className="font-semibold ml-1">
                        ${goals.prevMonthGoals.facturacion.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Clientes:</span>
                      <span className="font-semibold ml-1">
                        {goals.prevMonthGoals.clientes.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Producto:</span>
                      <span className="font-semibold ml-1">
                        {goals.prevMonthGoals.producto.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mismo Mes Año Anterior */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-green-900 mb-2">
                    Objetivo (Año Anterior)
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-gray-600">Facturación:</span>
                      <span className="font-semibold ml-1">
                        ${goals.sameMonthLastYearGoals.facturacion.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Clientes:</span>
                      <span className="font-semibold ml-1">
                        {goals.sameMonthLastYearGoals.clientes.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Producto:</span>
                      <span className="font-semibold ml-1">
                        {goals.sameMonthLastYearGoals.producto.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mes Actual */}
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-purple-900 mb-2">
                    Mes Actual (Proyectado)
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-gray-600">Facturación:</span>
                      <span className="font-semibold ml-1">
                        ${goals.currentMonthActual?.facturacion?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Clientes:</span>
                      <span className="font-semibold ml-1">
                        {goals.currentMonthActual?.clientes?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Producto:</span>
                      <span className="font-semibold ml-1">
                        {goals.currentMonthActual?.producto?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Sucursales */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Detalle por Sucursal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                  {["colon", "serrano", "peron", "san_martin", "virtual"].map((branch) => (
                    <BranchCard
                      key={branch}
                      branch={branch}
                      goals={goals}
                      percentageTranscurred={percentageTranscurred}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BranchCard({ branch, goals, percentageTranscurred }: any) {
  const branchNames: Record<string, string> = {
    colon: "Colón",
    serrano: "Serrano",
    peron: "Perón",
    san_martin: "San Martín",
    virtual: "Virtual",
  };

  const branchKey = branch as keyof typeof goals.prevMonthGoals.byBranch;

  return (
    <div className="p-2 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-1 mb-2">
        <Clock className="w-3 h-3 text-gray-500" />
        <h5 className="text-xs font-semibold">{branchNames[branch]}</h5>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Fact:</span>
          <span className="font-semibold">
            ${goals.prevMonthGoals.byBranch[branchKey].facturacion.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Clientes:</span>
          <span className="font-semibold">
            {goals.prevMonthGoals.byBranch[branchKey].clientes.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Prod:</span>
          <span className="font-semibold">
            {goals.prevMonthGoals.byBranch[branchKey].producto.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
