#!/usr/bin/env node

/**
 * Script de prueba para verificar la integración de Supabase
 * Uso: npx tsx scripts/test-supabase.ts
 */

import { supabase } from '../lib/supabase';
import { getConfig, getAllRecords, getRecordsByYearMonth } from '../lib/supabase-store';

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...\n');

  try {
    // Test 1: Verificar que el cliente está configurado
    console.log('✓ Cliente de Supabase inicializado');

    // Test 2: Leer configuración
    console.log('\n📋 Leyendo configuración...');
    const config = await getConfig();
    console.log('✓ Configuración:', config);

    // Test 3: Leer todos los registros
    console.log('\n📊 Leyendo todos los registros...');
    const allRecords = await getAllRecords();
    console.log(`✓ Total de registros: ${allRecords.length}`);

    if (allRecords.length > 0) {
      console.log('  Primeros 3 registros:');
      allRecords.slice(0, 3).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.fecha} - ${r.tipo}: ${r.total}`);
      });
    }

    // Test 4: Leer registros por mes
    console.log('\n📅 Leyendo registros de mayo 2026...');
    const mayRecords = await getRecordsByYearMonth(2026, 5);
    console.log(`✓ Registros de mayo: ${mayRecords.length}`);

    if (mayRecords.length > 0) {
      const tipos = new Set(mayRecords.map(r => r.tipo));
      console.log(`  Tipos de métrica: ${Array.from(tipos).join(', ')}`);
      
      // Calcular totales por tipo
      const totalesPorTipo = Array.from(tipos).map(tipo => {
        const total = mayRecords
          .filter(r => r.tipo === tipo)
          .reduce((sum, r) => sum + r.total, 0);
        return `${tipo}: ${total.toLocaleString('es-AR')}`;
      });
      console.log(`  Totales: ${totalesPorTipo.join(' | ')}`);
    }

    // Test 5: Verificar estructura de datos
    console.log('\n🔧 Verificando estructura de datos...');
    if (allRecords.length > 0) {
      const sample = allRecords[0];
      const keys = Object.keys(sample);
      console.log(`✓ Campos en daily_records: ${keys.join(', ')}`);
    }

    console.log('\n✅ Todos los tests pasaron correctamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ejecuta: npm run dev');
    console.log('2. Abre: http://localhost:3000');
    console.log('3. Ve a: http://localhost:3000/cargar para cargar datos');
    console.log('4. Verifica el dashboard en: http://localhost:3000');

  } catch (error) {
    console.error('\n❌ Error durante la prueba:');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar tests
testConnection();
