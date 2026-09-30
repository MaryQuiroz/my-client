// TODO-LEGAL: Revisar con abogado antes de publicar. Completar datos del titular y verificar cumplimiento LSSI.

export const metadata = { title: 'Aviso legal — My Client' }

export default function AvisoLegalPage() {
  return (
    <article className="prose prose-zinc max-w-none">
      <h1>Aviso legal</h1>
      <p className="text-zinc-500 text-sm">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      {/* TODO-LEGAL: Completar con datos reales del titular (art. 10 LSSI) */}
      <h2>1. Datos identificativos del titular</h2>
      <p>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos:</p>
      <ul>
        <li><strong>Titular:</strong> [NOMBRE / RAZÓN SOCIAL]</li>
        <li><strong>NIF:</strong> [NIF]</li>
        <li><strong>Domicilio:</strong> [DIRECCIÓN COMPLETA], España</li>
        <li><strong>Email:</strong> [EMAIL DE CONTACTO]</li>
        <li><strong>Web:</strong> {process.env.NEXT_PUBLIC_APP_URL ?? 'https://myclient.app'}</li>
      </ul>

      <h2>2. Objeto y ámbito de aplicación</h2>
      <p>
        My Client es una aplicación SaaS dirigida a freelancers y agencias que ofrecen servicios
        de diseño y desarrollo web a negocios locales en España. El servicio facilita la prospección
        de clientes potenciales, la generación de auditorías web y la gestión del proceso de venta.
      </p>

      <h2>3. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del servicio —incluyendo textos, gráficos, logotipos, código fuente e
        interfaces— son propiedad del titular o de sus licenciantes, y están protegidos por la
        normativa española e internacional de propiedad intelectual e industrial. Queda prohibida
        su reproducción, distribución o comunicación pública sin autorización expresa.
      </p>

      <h2>4. Uso del servicio</h2>
      <p>
        El usuario se compromete a utilizar el servicio de conformidad con la ley, la moral y el
        orden público. Queda expresamente prohibido el uso del servicio para actividades ilícitas o
        que puedan lesionar derechos de terceros.
      </p>
      <p>
        El servicio utiliza únicamente APIs oficiales para la obtención de información sobre negocios
        locales. Queda prohibido el scraping o cualquier técnica de extracción masiva de datos.
      </p>

      {/* TODO-LEGAL: Revisar limitación de responsabilidad con abogado */}
      <h2>5. Limitación de responsabilidad</h2>
      <p>
        El titular no se hace responsable de los daños derivados del uso del servicio, de la
        exactitud de los datos obtenidos de terceros (Google Places API) ni del resultado de las
        acciones comerciales emprendidas por el usuario basándose en la información proporcionada.
      </p>

      <h2>6. Legislación aplicable</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier controversia derivada
        del uso del servicio, las partes se someten, con renuncia expresa a cualquier otro fuero,
        a los juzgados y tribunales de <strong>[CIUDAD]</strong>.
      </p>
    </article>
  )
}
