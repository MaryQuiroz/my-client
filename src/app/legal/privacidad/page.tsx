// TODO-LEGAL: Revisar con abogado antes de publicar. Verificar datos del responsable, bases legales y plazos de retención.

export const metadata = { title: 'Política de privacidad — My Client' }

export default function PrivacidadPage() {
  return (
    <article className="prose prose-zinc max-w-none">
      <h1>Política de privacidad</h1>
      <p className="text-zinc-500 text-sm">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      {/* TODO-LEGAL: Sustituir con datos reales del responsable (nombre, NIF, domicilio, email de contacto) */}
      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos personales es <strong>[NOMBRE / RAZÓN SOCIAL]</strong>,
        con NIF <strong>[NIF]</strong>, domicilio en <strong>[DIRECCIÓN]</strong>,
        y dirección de contacto <strong>[EMAIL]</strong>.
      </p>

      <h2>2. Datos que recogemos</h2>
      <p>Recogemos únicamente los datos estrictamente necesarios para prestar el servicio:</p>
      <ul>
        <li><strong>Cuenta:</strong> dirección de email para autenticación.</li>
        <li><strong>Perfil profesional:</strong> descripción del servicio, tono de comunicación y nombre de negocio, proporcionados voluntariamente durante el alta.</li>
        <li><strong>Uso del servicio:</strong> registros de acciones (búsquedas, auditorías, mensajes generados) para control de cuotas y mejora del producto.</li>
        <li><strong>Datos de negocios locales:</strong> información pública de establecimientos obtenida a través de la API oficial de Google Places.</li>
        <li><strong>Datos de facturación:</strong> gestionados directamente por Stripe. No almacenamos datos de tarjeta.</li>
      </ul>

      <h2>3. Finalidades y bases legales</h2>
      {/* TODO-LEGAL: Revisar bases legales con abogado (art. 6 RGPD) */}
      <ul>
        <li><strong>Prestación del servicio:</strong> ejecución del contrato (art. 6.1.b RGPD).</li>
        <li><strong>Mejora del producto y analítica:</strong> interés legítimo (art. 6.1.f RGPD). Usamos PostHog EU para analítica de uso.</li>
        <li><strong>Facturación y gestión de suscripciones:</strong> cumplimiento de obligación legal y ejecución del contrato.</li>
        <li><strong>Comunicaciones sobre el servicio:</strong> interés legítimo o consentimiento, según el tipo de comunicación.</li>
      </ul>

      <h2>4. Conservación de datos</h2>
      {/* TODO-LEGAL: Definir plazos exactos con abogado */}
      <p>
        Los datos de cuenta se conservan mientras la cuenta esté activa y durante <strong>[X años]</strong>
        tras su cancelación para cumplir obligaciones legales. Los registros de uso se conservan
        durante <strong>[X meses]</strong>.
      </p>

      <h2>5. Destinatarios</h2>
      <p>Compartimos datos únicamente con los siguientes encargados del tratamiento, todos con garantías adecuadas:</p>
      <ul>
        <li><strong>Supabase</strong> (base de datos y autenticación) — servidores en UE.</li>
        <li><strong>Stripe</strong> (pagos) — con cláusulas contractuales tipo.</li>
        <li><strong>PostHog</strong> (analítica) — servidores en UE (eu.i.posthog.com).</li>
        <li><strong>Anthropic</strong> (generación de mensajes IA) — con garantías adecuadas.</li>
        <li><strong>Google</strong> (búsqueda de negocios vía Places API) — con cláusulas contractuales tipo.</li>
        <li><strong>Vercel</strong> (infraestructura) — con cláusulas contractuales tipo.</li>
      </ul>

      <h2>6. Derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, portabilidad y
        limitación del tratamiento escribiendo a <strong>[EMAIL]</strong>. También puedes reclamar
        ante la Agencia Española de Protección de Datos (aepd.es).
      </p>

      <h2>7. Cookies</h2>
      <p>
        Consulta nuestra <a href="/legal/cookies">Política de cookies</a> para más información
        sobre las cookies que utilizamos.
      </p>
    </article>
  )
}
