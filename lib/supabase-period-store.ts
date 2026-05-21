import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

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

// ── Cargar datos de Supabase ──────────────────────────────────
export async function loadPeriodFromSupabase(
  periodType: "mes_anterior" | "mismo_mes_aa" | "acumulado_mtd",
  year: number,
  month: number
): Promise<PeriodSnapshot> {
  try {
    const { data, error } = await supabase
      .from("period_comparatives")
      .select("*")
      .eq("period_type", periodType)
      .eq("year", year)
      .eq("month", month);

    if (error) throw error;

    const result: PeriodSnapshot = {
      facturacion: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
      clientes: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
      producto: { colon: 0, serrano: 0, peron: 0, sanMartin: 0, virtual: 0, total: 0 },
    };

    if (data) {
      for (const row of data) {
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

// ── Guardar datos en Supabase ─────────────────────────────────
export async function savePeriodToSupabase(
  periodType: "mes_anterior" | "mismo_mes_aa" | "acumulado_mtd",
  year: number,
  month: number,
  data: PeriodSnapshot
): Promise<boolean> {
  try {
    const records = [
      {
        period_type: periodType,
        year,
        month,
        metric_type: "Facturacion",
        colon: data.facturacion.colon,
        serrano: data.facturacion.serrano,
        peron: data.facturacion.peron,
        san_martin: data.facturacion.sanMartin,
        virtual: data.facturacion.virtual,
        total: data.facturacion.total,
      },
      {
        period_type: periodType,
        year,
        month,
        metric_type: "Clientes",
        colon: data.clientes.colon,
        serrano: data.clientes.serrano,
        peron: data.clientes.peron,
        san_martin: data.clientes.sanMartin,
        virtual: data.clientes.virtual,
        total: data.clientes.total,
      },
      {
        period_type: periodType,
        year,
        month,
        metric_type: "Producto",
        colon: data.producto.colon,
        serrano: data.producto.serrano,
        peron: data.producto.peron,
        san_martin: data.producto.sanMartin,
        virtual: data.producto.virtual,
        total: data.producto.total,
      },
    ];

    const { error } = await supabase
      .from("period_comparatives")
      .upsert(records, { onConflict: "period_type,year,month,metric_type" });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving period to Supabase:", error);
    return false;
  }
}

// ── Cargar RRHH de Supabase ───────────────────────────────────
export async function loadRRHHFromSupabase(date: string): Promise<RRHHSnapshot> {
  try {
    const { data, error } = await supabase
      .from("rrhh_data")
      .select("*")
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

    if (!data) {
      return {
        colon: { programados: 0, presentes: 0 },
        serrano: { programados: 0, presentes: 0 },
        peron: { programados: 0, presentes: 0 },
        sanMartin: { programados: 0, presentes: 0 },
        virtual: { programados: 0, presentes: 0 },
      };
    }

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

// ── Guardar RRHH en Supabase ──────────────────────────────────
export async function saveRRHHToSupabase(date: string, data: RRHHSnapshot): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("rrhh_data")
      .upsert(
        {
          date,
          colon_programados: data.colon.programados,
          colon_presentes: data.colon.presentes,
          serrano_programados: data.serrano.programados,
          serrano_presentes: data.serrano.presentes,
          peron_programados: data.peron.programados,
          peron_presentes: data.peron.presentes,
          san_martin_programados: data.sanMartin.programados,
          san_martin_presentes: data.sanMartin.presentes,
          virtual_programados: data.virtual.programados,
          virtual_presentes: data.virtual.presentes,
        },
        { onConflict: "date" }
      );

    if (error) throw error;
    return true;
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
    const { data, error } = await supabase
      .from("period_comparatives")
      .select("id")
      .eq("period_type", periodType)
      .eq("year", year)
      .eq("month", month)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking period data in Supabase:", error);
    return false;
  }
}
