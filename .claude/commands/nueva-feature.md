# Comando: Nueva Feature

Usa este comando cuando vayas a implementar una nueva funcionalidad.

## Pasos obligatorios

1. **Leer CLAUDE.md** para recordar convenciones y restricciones.

2. **Crear una rama** con el formato `feat/<descripcion-corta>`.

3. **Presentar el plan** al usuario antes de escribir código:
   - Archivos que se van a crear o modificar
   - Esquema de datos o interfaz nueva (si aplica)
   - Dependencias externas necesarias
   - Casos de test previstos
   - Puntos que requieren revisión legal o de seguridad (TODO-LEGAL)

4. **Esperar aprobación** explícita del usuario. No empezar hasta recibir "aprobado" o equivalente.

5. **Implementar** con cambios pequeños y verificables:
   - Primero tipos y validaciones Zod
   - Luego lógica de negocio con tests
   - Luego componentes de UI
   - Por último integración y tests e2e

6. **Ejecutar** `npm run verify` antes de hacer commit. Resolver todos los errores.

7. **Al terminar**, indicar al usuario:
   - Variables de entorno nuevas que hay que añadir
   - Migraciones SQL que hay que aplicar
   - Qué revisar manualmente
   - Siguiente acción recomendada
