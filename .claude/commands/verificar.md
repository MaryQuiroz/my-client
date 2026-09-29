# Comando: Verificar

Ejecuta `npm run verify` y repara todos los errores hasta que pase.

## Proceso

1. Ejecutar `npm run verify` (lint + typecheck + test + build).
2. Si hay errores:
   - Leer el mensaje de error completo.
   - Identificar la causa raíz (no el síntoma).
   - Aplicar la corrección mínima necesaria.
   - Volver al paso 1.
3. No marcar como completado hasta que `npm run verify` pase sin errores.

## Reglas
- No usar `// @ts-ignore` ni `// eslint-disable` para ocultar errores.
- No cambiar la configuración de TypeScript o ESLint para hacer pasar los tests.
- Si un error requiere un cambio de diseño, presentar opciones al usuario antes de proceder.
- Si después de 3 intentos el error no se resuelve, describir el problema al usuario y pedir orientación.
