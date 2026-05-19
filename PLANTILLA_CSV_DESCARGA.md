# Descarga de Plantillas CSV - Guía de uso

## ¿Qué es?

La funcionalidad de descarga de plantillas permite descargar un CSV de ejemplo con la estructura exacta que espera el sistema, para que puedas llenarla con tus datos y cargarla nuevamente.

## ¿Dónde está?

En el **Panel de Comandos** → Sección **"Cargar datos de meses cerrados"**

Hay dos botones de descarga:
- **Mes anterior**: Descarga plantilla para el mes anterior
- **Mismo mes año anterior**: Descarga plantilla para el mismo mes del año anterior

## ¿Cómo funciona?

### 1. Descargar la plantilla
```
1. Ve al Panel de Comandos (/comandos)
2. Busca la sección "Cargar datos de meses cerrados"
3. Haz clic en "Descargar plantilla" (botón gris)
4. Se descargará un archivo CSV con nombre: Plantilla_[Mes]_[Año].csv
```

### 2. Llenar la plantilla
```
Abre el archivo en Excel o Google Sheets y completa los datos:

Fecha | Colón | Serrano | Perón | San Martín | Virtual | Total | Tipo
------|-------|---------|-------|-----------|---------|-------|-----
14.05.2025 | 57761896 | 43244684 | 33078680 | 44123726 | 23994968 | 202203955 | Facturacion
14.05.2025 | 18315 | 12826 | 10712 | 14487 | 6949 | 63289 | Producto
14.05.2025 | 1558 | 1223 | 1186 | 1790 | 313 | 6070 | Clientes
```

### 3. Cargar el archivo
```
1. Haz clic en "Cargar CSV" (botón azul o verde)
2. Selecciona el archivo que completaste
3. Verifica la vista previa
4. Haz clic en "Confirmar carga"
```

## Estructura de la plantilla

### Columnas
| Columna | Descripción | Formato | Ejemplo |
|---------|-------------|---------|---------|
| **Fecha** | Día del mes | DD.MM.YYYY | 14.05.2025 |
| **Colón** | Sucursal Colón | Número | 57761896 |
| **Serrano** | Sucursal Serrano | Número | 43244684 |
| **Perón** | Sucursal Perón | Número | 33078680 |
| **San Martín** | Sucursal San Martín | Número | 44123726 |
| **Virtual** | Sucursal Virtual | Número | 23994968 |
| **Total** | Suma de todas las sucursales | Número | 202203955 |
| **Tipo** | Tipo de métrica | Facturacion / Clientes / Producto | Facturacion |

### Tipos de métricas
- **Facturacion**: Valores en pesos (ej: 57761896)
- **Clientes**: Cantidad de clientes (ej: 1558)
- **Producto**: Cantidad de productos (ej: 18315)

### Formato de números
- **Separador de miles**: Punto (.)
- **Separador decimal**: Coma (,)
- **Ejemplos**:
  - 57.761.896,2 → 57 millones 761 mil 896 con 2 decimales
  - 1.558 → 1 mil 558
  - 18.315 → 18 mil 315

## Ejemplo completo

```
Fecha	Colón	Serrano	Perón	San Martín	Virtual	Total	Tipo
14.05.2025	57761896	43244684	33078680	44123726	23994968	202203955	Facturacion
14.05.2025	18315	12826	10712	14487	6949	63289	Producto
14.05.2025	1558	1223	1186	1790	313	6070	Clientes
15.05.2025	58000000	43500000	33500000	44500000	24000000	203500000	Facturacion
15.05.2025	18400	12900	10800	14600	7000	63700	Producto
15.05.2025	1600	1250	1200	1800	320	6170	Clientes
```

## Notas importantes

### ✅ Lo que SÍ puedes hacer
- Descargar múltiples plantillas
- Llenar los datos en Excel o Google Sheets
- Cambiar los valores de ejemplo
- Cargar el archivo varias veces
- Actualizar datos si cometes errores

### ❌ Lo que NO debes hacer
- Cambiar la estructura (columnas, orden)
- Cambiar el separador (debe ser tabulación)
- Cambiar el formato de fecha (debe ser DD.MM.YYYY)
- Agregar o eliminar columnas
- Cambiar los nombres de las sucursales

## Troubleshooting

### "Error al parsear CSV"
- Verifica que el separador sea tabulación (no comas)
- Verifica que la fecha esté en formato DD.MM.YYYY
- Verifica que no haya espacios en blanco al inicio/final

### "Columnas insuficientes"
- Asegúrate de que todas las columnas estén presentes
- Verifica que no falten datos en alguna columna

### "Tipo desconocido"
- Verifica que el tipo sea exactamente: Facturacion, Clientes o Producto
- Revisa que no haya espacios en blanco

### "Fecha inválida"
- Verifica el formato: DD.MM.YYYY
- Verifica que el día esté entre 01-31
- Verifica que el mes esté entre 01-12

## Flujo completo

```
┌─ Panel de Comandos
│
├─ Sección: "Cargar datos de meses cerrados"
│
├─ Mes anterior
│  ├─ Botón: "Descargar plantilla" → Plantilla_Abril_2025.csv
│  ├─ Llenar datos en Excel
│  └─ Botón: "Cargar CSV" → Seleccionar archivo → Confirmar
│
└─ Mismo mes año anterior
   ├─ Botón: "Descargar plantilla" → Plantilla_Mayo_2024.csv
   ├─ Llenar datos en Excel
   └─ Botón: "Cargar CSV" → Seleccionar archivo → Confirmar
```

## API

Si necesitas generar plantillas programáticamente:

```
GET /api/export-template?year=2025&month=4

Parámetros:
- year: Año (ej: 2025)
- month: Mes (1-12, ej: 4 para abril)

Respuesta:
- Content-Type: text/csv
- Content-Disposition: attachment; filename="Plantilla_Abril_2025.csv"
```

---

**Última actualización**: Mayo 2026
**Estado**: Producción en Vercel
