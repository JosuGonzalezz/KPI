export type BranchBreakdown = {
  colon: number;
  serrano: number;
  peron: number;
  sanMartin: number;
  virtual: number;
  total: number;
};

export type PeriodSnapshot = {
  facturacion: BranchBreakdown;
  clientes: BranchBreakdown;
  producto: BranchBreakdown;
};

export type RRHHSnapshot = {
  colon: { programados: number; presentes: number };
  serrano: { programados: number; presentes: number };
  peron: { programados: number; presentes: number };
  sanMartin: { programados: number; presentes: number };
  virtual: { programados: number; presentes: number };
};

// ── Cargar datos de Supabase vía API ──────────────────────────
export async function loadPeriodFromSupabase(
  periodType: "mes_anterior" | "mismo_mes_aa" | "acumulado_mtd",
  year: number,
  month: number
): Promise<PeriodSnapshot> {
  try {
    const res = await fetch(
      `/api/period-comparatives?periodType=${periodType}&year=${year}&month=${month}`
    );
    const json = await res.json();

    const result: PeriodSnapshot = {
      facturacion: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
      clientes: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
      producto: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
    };

    if (json.data) {
      for (const row of json.data) {
        const metric = row.metric_type.toLowerCase() as keyof PeriodSnapshot;
        if (metric in result) {
          result[metric] = {
            colon: row.colon || 0,
            serrano: row.serrano || 0,
            peron: row.peron || 0,
            sanMartin: row.san_martin || 0,
            virtual: row.virtual || 0,
            total: row.total || 0,
          };
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error loading period from Supabase:", error);
    return {
      facturacion: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
      clientes: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
      producto: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
    };
  }
}

// ── Guardar datos en Supabase vía API ─────────────────────────
export async function savePeriodToSupabase(
  periodType: "mes_anterior" | "mismo_mes_aa" | "acumulado_mtd",
  year: number,
  month: number,
  data: PeriodSnapshot
): Promise<boolean> {
  try {
    const res = await fetch("/api/period-comparatives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodType, year, month, data }),
    });

    const json = await res.json();
    return json.ok === true;
  } catch (error) {
    console.error("Error saving period to Supabase:", error);
    return false;
  }
}

// ── Cargar RRHH de Supabase vía API ───────────────────────────
export async function loadRRHHFromSupabase(date: string): Promise<RRHHSnapshot> {
  try {
    const res = await fetch(`/api/rrhh?date=${date}`);
    const json = await res.json();

    if (!json.data) {
      return {
        colon: { programados: 0, presentes: 0 },
        serrano: { programados: 0, presentes: 0 },
        peron: { programados: 0, presentes: 0 },
        sanMartin: { programados: 0, presentes: 0 },
        virtual: { programados: 0, presentes: 0 },
      };
    }

    const data = json.data;
    return {
      colon: { programados: data.colon_programados, presentes: data.colon_presentes },
      serrano: { programados: data.serrano_programados, presentes: data.serrano_presentes },
      peron: { programados: data.peron_programados, presentes: data.peron_presentes },
      sanMartin: { programados: data.san_martin_programados, presentes: data.san_martin_presentes },
      virtual: { programados: data.virtual_programados, presentes: data.virtual_presentes },
    };
  } catch (error) {
    console.error("Error loading RRHH from Supabase:", error);
    return {
      colon: { programados: 0, presentes: 0 },
      serrano: { programados: 0, presentes: 0 },
      peron: { programados: 0, presentes: 0 },
      sanMartin: { programados: 0, presentes: 0 },
      virtual: { programados: 0, presentes: 0 },
    };
  }
}

// ── Guardar RRHH en Supabase vía API ──────────────────────────
export async function saveRRHHToSupabase(date: string, data: RRHHSnapshot): Promise<boolean> {
  try {
    const res = await fetch("/api/rrhh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, data }),
    });

    const json = await res.json();
    return json.ok === true;
  } catch (error) {
    console.error("Error saving RRHH to Supabase:", error);
    return false;
  }
}

// ── Verificar si hay datos en Supabase ────────────────────────
export async function hasPeriodDataInSupabase(
  periodType: "mes_anterior" | "mismo_mes_aa" | "acumulado_mtd",
  year: number,
  month: number
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/period-comparatives?periodType=${periodType}&year=${year}&month=${month}`
    );
    const json = await res.json();
    return json.data && json.data.length > 0;
  } catch (error) {
    console.error("Error checking period data in Supabase:", error);
    return false;
  }
}
