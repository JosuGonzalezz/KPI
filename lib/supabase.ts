// ============================================================
// SUPABASE CLIENT — Configuración y conexión
// ============================================================

import { createClient } from '@supabase/supabase-js';

// Verificar que las variables de entorno estén definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
}

// Crear cliente de Supabase
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// Exportar tipos para uso en todo el proyecto
export type DailyRecord = {
  id: number;
  fecha: string;
  year: number;
  month: number;
  day: number;
  colon: number | null;
  serrano: number | null;
  peron: number | null;
  san_martin: number | null;
  virtual: number | null;
  total: number;
  tipo: 'Clientes' | 'Producto' | 'Facturacion';
  created_at: string;
};

export type AppConfig = {
  id: number;
  current_year: number;
  current_month: number;
  current_day: number;
  updated_at: string;
};
