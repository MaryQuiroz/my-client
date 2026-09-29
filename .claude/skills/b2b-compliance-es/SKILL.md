---
name: b2b-compliance-es
description: Usar cuando se implementa cualquier funcionalidad de captación (mensajes, email, exportación de datos) o antes de lanzar. Checklist RGPD/LSSI para prospección B2B en España.
---

# Skill: Cumplimiento B2B España (RGPD / LSSI)

> **AVISO**: Esta skill es una guía de referencia técnica, no asesoramiento legal.
> Marca los puntos con `TODO-LEGAL` y consúltalos con un abogado antes del lanzamiento.

## Mensajes de prospección

### WhatsApp y llamadas
- No hay regulación específica que prohíba el contacto B2B por WhatsApp o teléfono, pero aplica el principio de buena fe.
- TODO-LEGAL: revisar si el número de teléfono del negocio es datos personales del autónomo.

### Email en frío B2B
- La LSSI (art. 21) prohíbe el email comercial sin consentimiento previo.
- **Excepción**: relación preexistente o dato obtenido en el ejercicio de la actividad profesional.
- TODO-LEGAL: evaluar si el email del negocio local (ej. `info@restaurante.es`) cumple la excepción B2B de la LSSI.
- **Obligatorio en todo email**: asunto claro, identificación del remitente, enlace de baja/opt-out funcional.

## Datos de negocios

### Datos personales de autónomos
- Los datos de un autónomo (nombre, teléfono, email) son datos personales bajo RGPD.
- TODO-LEGAL: ¿cuál es la base jurídica para tratar datos de autónomos en prospección?

### Datos de sociedades
- Nombre de la empresa, CIF, dirección comercial → no son datos personales en sentido estricto.
- Los empleados responsables sí son personas físicas.

## Obligaciones de la plataforma

### Registro de actividades (art. 30 RGPD)
- Documentar qué datos se tratan, con qué fin, durante cuánto tiempo y quién los procesa.
- TODO-LEGAL: preparar el registro de actividades antes del lanzamiento.

### Derechos del interesado
- La app debe permitir borrar los datos de un negocio/contacto a petición del usuario.
- Implementado en: `DELETE /api/prospects/:id` y `DELETE /api/businesses/:id`.

### Retención de datos
- No conservar datos más tiempo del necesario.
- TODO-LEGAL: definir periodo de retención para negocios no contactados.

### Transferencias internacionales
- Supabase (UE), Anthropic (EE.UU.), Stripe (EE.UU.), PostHog (UE servidor EU).
- TODO-LEGAL: revisar cláusulas contractuales tipo (CCT) para proveedores fuera de la UE.

## Documentos legales necesarios antes del lanzamiento
- [ ] Política de privacidad (quién trata datos, con qué fin, derechos del usuario)
- [ ] Aviso legal (titular, domicilio, NIF)
- [ ] Política de cookies (si se usan cookies no esenciales)
- [ ] Términos y condiciones del servicio (incluye limitación de responsabilidad)
- [ ] TODO-LEGAL: todos estos documentos requieren revisión de un abogado

## Google Maps Platform
- TODO-LEGAL: verificar sección 3.2.4 de los TOS de Google Maps Platform sobre prohibición de almacenamiento de datos de Places fuera de caché temporal.
- Solo `place_id` es seguro de persistir a largo plazo según guías públicas.

## Facturación e IVA
- TODO-LEGAL: revisar obligaciones de facturación electrónica (Ley Crea y Crece) y aplicación de IVA en suscripciones SaaS B2B en España.
