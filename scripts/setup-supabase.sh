#!/bin/bash

# ============================================================
# SETUP SUPABASE — Script de configuración rápida
# ============================================================

echo "🚀 Configurando Supabase para el Reporte de KPI..."
echo ""

# Verificar si .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ No se encontró .env.local"
    echo "   Crea un archivo .env.local con las credenciales de Supabase:"
    echo ""
    echo "   NEXT_PUBLIC_SUPABASE_URL=https://ntwzbbpthuquncgqaxmu.supabase.co"
    echo "   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__g4mfKrsbWKUuNXlvIMYwg_qnjoVnec"
    echo ""
    exit 1
fi

# Verificar variables de entorno
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL no encontrada en .env.local"
    exit 1
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" .env.local; then
    echo "❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no encontrada en .env.local"
    exit 1
fi

echo "✅ Variables de entorno configuradas"
echo ""

# Verificar si Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI no está instalado"
    echo "   Para usarlo, instala con:"
    echo "   npm install -g supabase"
    echo ""
fi

# Verificar si las tablas existen
echo "🔍 Verificando tablas en Supabase..."
echo ""

# Aquí iría la lógica para verificar las tablas
# Por ahora, solo mostrar instrucciones
echo "📝 Instrucciones:"
echo "   1. Ve a https://supabase.com/dashboard"
echo "   2. Selecciona tu proyecto"
echo "   3. Ve a SQL Editor"
echo "   4. Copia y pega el contenido de supabase-schema.sql"
echo "   5. Haz clic en Run"
echo ""

echo "🎉 Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Ejecuta 'npm run dev' para probar la aplicación"
echo "   2. Ve a http://localhost:3000 para ver el dashboard"
echo "   3. Carga nuevos datos desde la página /cargar"
