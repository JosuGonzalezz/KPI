// ============================================================
// SUPABASE CONFIG — Configuración de entorno
// ============================================================

// Verificar que las variables de entorno estén definidas
export function checkSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn('⚠️  Supabase no está configurado. Usando persistencia local.');
    return false;
  }

  console.log('✅ Supabase configurado correctamente.');
  return true;
}

// Obtener la URL de Supabase
export function getSupabaseUrl(): string {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida');
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

// Obtener la clave de Supabase
export function getSupabaseKey(): string {
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no está definida');
  }
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}
