// ============================================================
// VERIFICATION SCRIPT — Validar cálculos de KPI
// ============================================================

import { 
  may2026, may2025, 
  calcMTD, calcMTDByBranch, 
  BRANCH_KEYS, LAST_DAY_2026,
  MTD_2026, MTD_2025,
  MTD_BRANCH_2026_FACT, MTD_BRANCH_2025_FACT,
  MTD_BRANCH_2026_CLI, MTD_BRANCH_2025_CLI
} from '../lib/report-data';

import { kpiMes, branchRows, totalRow } from '../lib/mock-data';

// ── Helpers de formateo ──────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('es-AR');
}

function pct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2).replace('.', ',') + '%';
}

// ── Validación de cálculos MTD ───────────────────────────────
console.log('═══════════════════════════════════════════════════════════');
console.log('VERIFICACIÓN DE CÁLCULOS MTD — MAYO 2026');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Validar MTD total 2026
console.log('1. MTD Total 2026 (días 2-14):');
const calcFact2026 = calcMTD(may2026, 'Facturacion', LAST_DAY_2026);
const calcCli2026 = calcMTD(may2026, 'Clientes', LAST_DAY_2026);
const calcPro2026 = calcMTD(may2026, 'Producto', LAST_DAY_2026);

console.log(`   Facturación: ${fmt(calcFact2026)} (esperado: ${fmt(MTD_2026.facturacion)}) ${calcFact2026 === MTD_2026.facturacion ? '✅' : '❌'}`);
console.log(`   Clientes:    ${fmt(calcCli2026)} (esperado: ${fmt(MTD_2026.clientes)}) ${calcCli2026 === MTD_2026.clientes ? '✅' : '❌'}`);
console.log(`   Producto:    ${fmt(calcPro2026)} (esperado: ${fmt(MTD_2026.producto)}) ${calcPro2026 === MTD_2026.producto ? '✅' : '❌'}`);

// 2. Validar MTD total 2025
console.log('\n2. MTD Total 2025 (días 1-14):');
const calcFact2025 = calcMTD(may2025, 'Facturacion', LAST_DAY_2026);
const calcCli2025 = calcMTD(may2025, 'Clientes', LAST_DAY_2026);
const calcPro2025 = calcMTD(may2025, 'Producto', LAST_DAY_2026);

console.log(`   Facturación: ${fmt(calcFact2025)} (esperado: ${fmt(MTD_2025.facturacion)}) ${calcFact2025 === MTD_2025.facturacion ? '✅' : '❌'}`);
console.log(`   Clientes:    ${fmt(calcCli2025)} (esperado: ${fmt(MTD_2025.clientes)}) ${calcCli2025 === MTD_2025.clientes ? '✅' : '❌'}`);
console.log(`   Producto:    ${fmt(calcPro2025)} (esperado: ${fmt(MTD_2025.producto)}) ${calcPro2025 === MTD_2025.producto ? '✅' : '❌'}`);

// 3. Validar MTD por sucursal 2026
console.log('\n3. MTD por Sucursal 2026 (Facturación):');
let branchFactOk = true;
BRANCH_KEYS.forEach(key => {
  const expected = MTD_BRANCH_2026_FACT[key];
  const calc = calcMTDByBranch(may2026, 'Facturacion', LAST_DAY_2026)[key];
  const ok = expected === calc;
  branchFactOk = branchFactOk && ok;
  console.log(`   ${key}: ${fmt(calc)} (esperado: ${fmt(expected)}) ${ok ? '✅' : '❌'}`);
});
console.log(`   Total sucursales: ${fmt(BRANCH_KEYS.reduce((sum, k) => sum + MTD_BRANCH_2026_FACT[k], 0))} (esperado: ${fmt(MTD_2026.facturacion)}) ${branchFactOk ? '✅' : '❌'}`);

// 4. Validar porcentajes de total
console.log('\n4. Porcentajes sobre total (Facturación):');
const totalFact = branchRows.reduce((sum, r) => sum + r.facturacion, 0);
branchRows.forEach(row => {
  const calcPct = (row.facturacion / totalFact) * 100;
  const diff = Math.abs(calcPct - row.pctTotal);
  const ok = diff < 0.01; // tolerance 0.01%
  console.log(`   ${row.name}: ${calcPct.toFixed(2)}% (esperado: ${row.pctTotal}%) ${ok ? '✅' : '❌'} (diff: ${diff.toFixed(4)}%)`);
});

// 5. Validar ticket promedio
console.log('\n5. Ticket Promedio (Facturación / Clientes):');
const ticketCalc = MTD_2026.facturacion / MTD_2026.clientes;
const ticketExpected = kpiMes.ticketPromedio.acumulado;
const diffTicket = Math.abs(ticketCalc - ticketExpected);
const okTicket = diffTicket < 100; // tolerance 100
console.log(`   Calculado: ${fmt(Math.round(ticketCalc))} (esperado: ${fmt(ticketExpected)}) ${okTicket ? '✅' : '❌'} (diff: ${fmt(Math.round(diffTicket))})`);

// 6. Validar chango promedio
console.log('\n6. Chango Promedio (Productos / Clientes):');
const changoCalc = MTD_2026.producto / MTD_2026.clientes;
const changoExpected = kpiMes.changoPromedio.acumulado;
const diffChango = Math.abs(changoCalc - changoExpected);
const okChango = diffChango < 0.01;
console.log(`   Calculado: ${changoCalc.toFixed(2)} (esperado: ${changoExpected}) ${okChango ? '✅' : '❌'} (diff: ${diffChango.toFixed(4)})`);

// 7. Validar variaciones porcentuales
console.log('\n7. Variaciones Porcentuales (vs Mes Anterior):');
const factVsMesAnt = ((MTD_2026.facturacion - MTD_2025.facturacion) / MTD_2025.facturacion) * 100;
const cliVsMesAnt = ((MTD_2026.clientes - MTD_2025.clientes) / MTD_2025.clientes) * 100;
console.log(`   Facturación: ${factVsMesAnt.toFixed(2)}% (esperado: ${kpiMes.facturacion.vsMesAnt}%) ${Math.abs(factVsMesAnt - kpiMes.facturacion.vsMesAnt) < 0.01 ? '✅' : '❌'}`);
console.log(`   Clientes:    ${cliVsMesAnt.toFixed(2)}% (esperado: ${kpiMes.clientes.vsMesAnt}%) ${Math.abs(cliVsMesAnt - kpiMes.clientes.vsMesAnt) < 0.01 ? '✅' : '❌'}`);

// 8. Validar variaciones año anterior
console.log('\n8. Variaciones Porcentuales (vs Año Anterior):');
const factVsAA = ((MTD_2026.facturacion - MTD_2025.facturacion) / MTD_2025.facturacion) * 100;
const cliVsAA = ((MTD_2026.clientes - MTD_2025.clientes) / MTD_2025.clientes) * 100;
console.log(`   Facturación: ${factVsAA.toFixed(2)}% (esperado: ${kpiMes.facturacion.vsAA}%) ${Math.abs(factVsAA - kpiMes.facturacion.vsAA) < 0.01 ? '✅' : '❌'}`);
console.log(`   Clientes:    ${cliVsAA.toFixed(2)}% (esperado: ${kpiMes.clientes.vsAA}%) ${Math.abs(cliVsAA - kpiMes.clientes.vsAA) < 0.01 ? '✅' : '❌'}`);

// 9. Validar totalRow
console.log('\n9. Validación totalRow:');
const sumBranchFact = branchRows.reduce((sum, r) => sum + r.facturacion, 0);
const sumBranchCli = branchRows.reduce((sum, r) => sum + r.clientes, 0);
const sumBranchProd = branchRows.reduce((sum, r) => sum + r.productos, 0);
console.log(`   Facturación: ${fmt(sumBranchFact)} (esperado: ${fmt(totalRow.facturacion)}) ${sumBranchFact === totalRow.facturacion ? '✅' : '❌'}`);
console.log(`   Clientes:    ${fmt(sumBranchCli)} (esperado: ${fmt(totalRow.clientes)}) ${sumBranchCli === totalRow.clientes ? '✅' : '❌'}`);
console.log(`   Productos:   ${fmt(sumBranchProd)} (esperado: ${fmt(totalRow.productos)}) ${sumBranchProd === totalRow.productos ? '✅' : '❌'}`);

// 10. Validar ticket y chango en totalRow
const totalTicket = totalRow.facturacion / totalRow.clientes;
const totalChango = totalRow.productos / totalRow.clientes;
console.log(`   Ticket:      ${Math.round(totalTicket)} (esperado: ${totalRow.ticketProm}) ${Math.abs(totalTicket - totalRow.ticketProm) < 100 ? '✅' : '❌'}`);
console.log(`   Chango:      ${totalChango.toFixed(2)} (esperado: ${totalRow.changoProm}) ${Math.abs(totalChango - totalRow.changoProm) < 0.01 ? '✅' : '❌'}`);

// 11. Validar porcentajes de sucursales
console.log('\n10. Validación porcentajes sucursales:');
const sumPct = branchRows.reduce((sum, r) => sum + r.pctTotal, 0);
const sumPctCli = branchRows.reduce((sum, r) => sum + r.pctTotalCli, 0);
console.log(`   Suma % Facturación: ${sumPct.toFixed(2)}% (esperado: 100%) ${Math.abs(sumPct - 100) < 0.1 ? '✅' : '❌'}`);
console.log(`   Suma % Clientes:    ${sumPctCli.toFixed(2)}% (esperado: 100%) ${Math.abs(sumPctCli - 100) < 0.1 ? '✅' : '❌'}`);

// 12. Validar facturación por metro cuadrado
console.log('\n11. Validación Facturación por m²:');
branchRows.forEach(row => {
  if (row.mts && row.factPorMt) {
    const calc = Math.round(row.facturacion / row.mts);
    const ok = calc === row.factPorMt;
    console.log(`   ${row.name}: ${fmt(calc)} (esperado: ${fmt(row.factPorMt)}) ${ok ? '✅' : '❌'}`);
  }
});

// 13. Validar KPI del día
console.log('\n12. Validación KPI del día (14/05/2026):');
const day14Fact = may2026.filter(r => r.tipo === 'Facturacion' && r.day === 14).reduce((sum, r) => sum + r.total, 0);
const day14Cli = may2026.filter(r => r.tipo === 'Clientes' && r.day === 14).reduce((sum, r) => sum + r.total, 0);
const day14Pro = may2026.filter(r => r.tipo === 'Producto' && r.day === 14).reduce((sum, r) => sum + r.total, 0);
const day13Fact = may2026.filter(r => r.tipo === 'Facturacion' && r.day === 13).reduce((sum, r) => sum + r.total, 0);
const day13Cli = may2026.filter(r => r.tipo === 'Clientes' && r.day === 13).reduce((sum, r) => sum + r.total, 0);

const day14Ticket = day14Fact / day14Cli;
const day14Chango = day14Pro / day14Cli;
const factVsDiaAnt = ((day14Fact - day13Fact) / day13Fact) * 100;
const cliVsDiaAnt = ((day14Cli - day13Cli) / day13Cli) * 100;

console.log(`   Facturación: ${fmt(day14Fact)} (esperado: ${fmt(kpiDia.facturacion.value)}) ${day14Fact === kpiDia.facturacion.value ? '✅' : '❌'}`);
console.log(`   Clientes:    ${fmt(day14Cli)} (esperado: ${fmt(kpiDia.clientes.value)}) ${day14Cli === kpiDia.clientes.value ? '✅' : '❌'}`);
console.log(`   Ticket:      ${Math.round(day14Ticket)} (esperado: ${fmt(kpiDia.ticketProm.value)}) ${Math.round(day14Ticket) === kpiDia.ticketProm.value ? '✅' : '❌'}`);
console.log(`   Chango:      ${day14Chango.toFixed(2)} (esperado: ${kpiDia.changoProm}) ${Math.abs(day14Chango - kpiDia.changoProm) < 0.01 ? '✅' : '❌'}`);
console.log(`   Fact vs Día Ant: ${factVsDiaAnt.toFixed(2)}% (esperado: ${kpiDia.facturacion.vsDiaAnt}%) ${Math.abs(factVsDiaAnt - kpiDia.facturacion.vsDiaAnt) < 0.01 ? '✅' : '❌'}`);
console.log(`   Cli vs Día Ant:  ${cliVsDiaAnt.toFixed(2)}% (esperado: ${kpiDia.clientes.vsDiaAnt}%) ${Math.abs(cliVsDiaAnt - kpiDia.clientes.vsDiaAnt) < 0.01 ? '✅' : '❌'}`);

// 14. Validar meta mensual
console.log('\n13. Validación Meta Mensual:');
const daysInMay = 31;
const avgDailyFact = MTD_2026.facturacion / 13; // días 2-14 = 13 días
const projectedMonthly = avgDailyFact * daysInMay;
const meta = kpiMes.facturacion.metaMes;
console.log(`   Promedio diario: ${fmt(Math.round(avgDailyFact))}`);
console.log(`   Proyección mensual: ${fmt(Math.round(projectedMonthly))} (meta: ${fmt(meta)})`);
console.log(`   Avance: ${(MTD_2026.facturacion / meta * 100).toFixed(2)}% (esperado: ${(MTD_2026.facturacion / meta * 100).toFixed(2)}%)`);

// Resumen final
console.log('\n═══════════════════════════════════════════════════════════');
console.log('RESUMEN');
console.log('═══════════════════════════════════════════════════════════');
console.log('Si todos los ítems tienen ✅, los cálculos son coherentes.');
console.log('Si hay ❌, hay inconsistencias que deben revisarse.');
console.log('\nNota: Algunas pequeñas diferencias pueden ser por redondeo.');
