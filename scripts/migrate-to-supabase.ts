// ============================================================
// MIGRATION SCRIPT — Migrar datos locales a Supabase
// ============================================================

import { readFileSync } from 'fs';
import { join } from 'path';
import { parseCSV } from '../lib/store';
import { supabase } from '../lib/supabase';

// Cargar datos de ejemplo
const may2026Data = readFileSync(
  join(process.cwd(), 'lib', 'report-data.ts'),
  'utf-8'
);

// Extraer los datos de may2026 del archivo TypeScript
// (Esta es una solución simple, en producción usarías un parser más robusto)
function extractMay2026Data(): any[] {
  // Buscar la sección may2026 en el archivo
  const start = may2026Data.indexOf('export const may2026: DailyRecord[] = [');
  const end = may2026Data.indexOf('];', start);
  
  if (start === -1 || end === -1) {
    throw new Error('No se encontró la sección may2026');
  }
  
  // Extraer el array y parsearlo
  const arrayStr = may2026Data.substring(start + 38, end + 2);
  
  // Convertir el formato TypeScript a JSON
  let jsonStr = arrayStr
    .replace(/'/g, '"') // Comillas simples a dobles
    .replace(/null/g, '"null"') // null a string para parsear
    .replace(/:\s*null/g, ': null'); // null sin comillas
  
  // Reemplazar null en valores específicos
  jsonStr = jsonStr.replace(/virtual:\s*"null"/g, 'virtual: null');
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Error parsing may2026 data:', e);
    throw e;
  }
}

async function migrate() {
  console.log('🚀 Iniciando migración a Supabase...\n');

  // Verificar configuración
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL no está definida');
    console.log('   Crea un archivo .env.local con las credenciales de Supabase');
    return;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no está definida');
    console.log('   Crea un archivo .env.local con las credenciales de Supabase');
    return;
  }

  try {
    // 1. Cargar datos de ejemplo
    console.log('📁 Cargando datos de ejemplo...');
    const records = extractMay2026Data();
    console.log(`   ✅ Cargados ${records.length} registros\n`);

    // 2. Migrar registros
    console.log('💾 Migrando registros a Supabase...');
    const { inserted, updated } = await supabase.upsertRecords(records);
    console.log(`   ✅ Insertados: ${inserted}`);
    console.log(`   ✅ Actualizados: ${updated}\n`);

    // 3. Configurar el mes actual
    console.log('📅 Configurando mes actual...');
    await supabase.saveConfig({
      currentYear: 2026,
      currentMonth: 5,
      currentDay: 14,
    });
    console.log('   ✅ Configuración guardada\n');

    // 4. Verificar
    console.log('🔍 Verificando migración...');
    const allRecords = await supabase.getAllRecords();
    console.log(`   ✅ Total registros en Supabase: ${allRecords.length}\n`);

    console.log('🎉 Migración completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Ejecuta "npm run dev" para probar la aplicación');
    console.log('   2. Ve a http://localhost:3000 para ver el dashboard');
    console.log('   3. Carga nuevos datos desde la página /cargar');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    console.log('\n💡 Soluciones:');
    console.log('   - Verifica que las tablas existan en Supabase');
    console.log('   - Ejecuta el schema SQL: supabase-schema.sql');
    console.log('   - Verifica tus credenciales en .env.local');
  }
}

// Ejecutar la migración
migrate();
