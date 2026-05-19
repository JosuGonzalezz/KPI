# ============================================================
# SETUP SUPABASE — Script de configuración rápida (Windows)
# ============================================================

Write-Host "🚀 Configurando Supabase para el Reporte de KPI..." -ForegroundColor Cyan
Write-Host ""

# Verificar si .env.local existe
if (-not (Test-Path .env.local)) {
    Write-Host "❌ No se encontró .env.local" -ForegroundColor Red
    Write-Host "   Crea un archivo .env.local con las credenciales de Supabase:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL=https://ntwzbbpthuquncgqaxmu.supabase.co" -ForegroundColor Gray
    Write-Host "   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__g4mfKrsbWKUuNXlvIMYwg_qnjoVnec" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Verificar variables de entorno
if (-not (Get-Content .env.local | Select-String "NEXT_PUBLIC_SUPABASE_URL")) {
    Write-Host "❌ NEXT_PUBLIC_SUPABASE_URL no encontrada en .env.local" -ForegroundColor Red
    exit 1
}

if (-not (Get-Content .env.local | Select-String "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")) {
    Write-Host "❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no encontrada en .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Variables de entorno configuradas" -ForegroundColor Green
Write-Host ""

# Verificar si Supabase CLI está instalado
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Supabase CLI no está instalado" -ForegroundColor Yellow
    Write-Host "   Para usarlo, instala con:" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase" -ForegroundColor Gray
    Write-Host ""
}

# Verificar si las tablas existen
Write-Host "🔍 Verificando tablas en Supabase..." -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Instrucciones:" -ForegroundColor Yellow
Write-Host "   1. Ve a https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "   2. Selecciona tu proyecto" -ForegroundColor Gray
Write-Host "   3. Ve a SQL Editor" -ForegroundColor Gray
Write-Host "   4. Copia y pega el contenido de supabase-schema.sql" -ForegroundColor Gray
Write-Host "   5. Haz clic en Run" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Ejecuta 'npm run dev' para probar la aplicación" -ForegroundColor Gray
Write-Host "   2. Ve a http://localhost:3000 para ver el dashboard" -ForegroundColor Gray
Write-Host "   3. Carga nuevos datos desde la página /cargar" -ForegroundColor Gray
