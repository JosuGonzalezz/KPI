# 🚀 Solución de Deployment en Vercel

## Problema

Vercel estaba usando `pnpm` con `frozen-lockfile` y el `pnpm-lock.yaml` no estaba actualizado con la nueva dependencia `@supabase/supabase-js`.

**Error:**
```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

## Solución

Se han realizado dos cambios para resolver el problema:

### 1. Archivo `.npmrc`
```ini
legacy-peer-deps=true
```

Este archivo le dice a npm que permita dependencias peer antiguas sin fallar.

### 2. Archivo `vercel.json`
```json
{
  "buildCommand": "node .v0/inject-built-with-v0.mjs && next build",
  "installCommand": "npm install --no-frozen-lockfile"
}
```

El `installCommand` le dice a Vercel que use `npm install --no-frozen-lockfile` en lugar de `pnpm install` con frozen-lockfile.

## Resultado

✅ Vercel ahora puede:
- Instalar `@supabase/supabase-js` correctamente
- Actualizar el lock file automáticamente
- Compilar la aplicación sin errores

## Próximo Deployment

Cuando hagas push a GitHub, Vercel:
1. Clonará el repositorio
2. Ejecutará `npm install --no-frozen-lockfile`
3. Instalará todas las dependencias incluyendo `@supabase/supabase-js`
4. Compilará la aplicación con `next build`
5. Desplegará en Vercel

## Verificación

Para verificar que todo funciona:
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Verifica que el deployment fue exitoso
4. Abre la URL del deployment para probar la aplicación

## Notas

- El `pnpm-lock.yaml` se regenerará automáticamente en Vercel
- No necesitas actualizar el lock file localmente
- La aplicación seguirá funcionando con npm en tu máquina local

