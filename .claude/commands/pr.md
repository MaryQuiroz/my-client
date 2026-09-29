# Comando: Preparar PR

Usa este comando cuando el trabajo en una rama esté listo para revisión.

## Pasos

1. **Verificar**: ejecutar `npm run verify` y confirmar que pasa.

2. **Revisar cambios**: `git diff main...HEAD` para entender el alcance.

3. **Redactar el resumen del PR** con este checklist:

### Checklist obligatorio del PR
- [ ] `npm run verify` pasa sin errores
- [ ] Tests nuevos para la lógica añadida o modificada
- [ ] Variables de entorno nuevas añadidas a `.env.example`
- [ ] Migraciones SQL en `supabase/migrations/` si aplica
- [ ] RLS habilitado en tablas nuevas
- [ ] Sin claves ni secretos en el código
- [ ] TODO-LEGAL marcados los puntos legales pendientes
- [ ] CLAUDE.md actualizado si cambian convenciones

### Formato del título del PR
`<tipo>(<ámbito>): <descripción corta>`
Ejemplo: `feat(scoring): cálculo explicable de puntuación 0-100`

### Cuerpo del PR
```
## Qué hace este PR
[1-3 frases]

## Cambios principales
- [archivo/módulo]: [qué cambió]

## Cómo probar
[pasos mínimos para verificar que funciona]

## TODO-LEGAL pendientes
[lista o "ninguno"]
```

4. **Crear el PR** con `gh pr create` tras confirmación del usuario.
