// TODO-LEGAL: Revisar con abogado antes de publicar. Especialmente: precios, IVA, condiciones de cancelación y limitación de responsabilidad.

export const metadata = { title: 'Términos y condiciones — My Client' }

export default function TerminosPage() {
  return (
    <article className="prose prose-zinc max-w-none">
      <h1>Términos y condiciones</h1>
      <p className="text-zinc-500 text-sm">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p>
        Estos términos regulan el acceso y uso de My Client. Al crear una cuenta aceptas estos
        términos. Si no estás de acuerdo, no uses el servicio.
      </p>

      {/* TODO-LEGAL: Completar datos del titular */}
      <h2>1. El servicio</h2>
      <p>
        My Client es una plataforma SaaS que ayuda a freelancers y agencias a identificar
        negocios locales con oportunidades de mejora web, generar auditorías y gestionar
        el proceso de prospección comercial. El servicio es operado por <strong>[NOMBRE / RAZÓN SOCIAL]</strong>.
      </p>

      <h2>2. Cuenta de usuario</h2>
      <p>
        Para usar el servicio debes crear una cuenta con un email válido. Eres responsable de
        mantener la confidencialidad de tus credenciales y de todas las actividades realizadas
        desde tu cuenta.
      </p>

      {/* TODO-LEGAL: Revisar precios definitivos, IVA y condiciones de suscripción con gestor/abogado */}
      <h2>3. Planes y facturación</h2>
      <p>
        My Client ofrece un plan gratuito con funcionalidades limitadas y planes de pago con
        cuotas ampliadas. Los precios se muestran en la página de planes e incluyen IVA
        cuando aplique según la legislación vigente.
      </p>
      <p>
        Las suscripciones se renuevan automáticamente cada mes. Puedes cancelar en cualquier
        momento desde el portal de Stripe; el acceso se mantiene hasta el final del período
        facturado. No se realizan reembolsos por períodos parciales.
      </p>

      <h2>4. Uso aceptable</h2>
      <p>Te comprometes a:</p>
      <ul>
        <li>No usar el servicio para actividades ilegales o que infrinjan derechos de terceros.</li>
        <li>No intentar acceder a cuentas de otros usuarios ni a sistemas no autorizados.</li>
        <li>No realizar scraping ni sobrecargar los sistemas del servicio.</li>
        {/* TODO-LEGAL: Revisar con abogado el uso de datos de negocios locales y el email en frío (LSSI art. 21) */}
        <li>Cumplir con la LSSI y el RGPD en tus comunicaciones comerciales con los negocios prospectados.</li>
        <li>Obtener las autorizaciones necesarias antes de realizar comunicaciones comerciales no solicitadas.</li>
      </ul>

      <h2>5. Propiedad intelectual</h2>
      <p>
        El servicio y sus componentes son propiedad de <strong>[NOMBRE / RAZÓN SOCIAL]</strong>.
        Los contenidos generados por ti (mensajes, notas, datos de clientes) son de tu propiedad.
        Nos concedes una licencia para procesarlos y almacenarlos con el fin de prestar el servicio.
      </p>

      <h2>6. Privacidad y datos</h2>
      <p>
        El tratamiento de datos personales se rige por nuestra{' '}
        <a href="/legal/privacidad">Política de privacidad</a>.
      </p>

      {/* TODO-LEGAL: Revisar limitación de responsabilidad y garantías con abogado */}
      <h2>7. Limitación de responsabilidad</h2>
      <p>
        El servicio se presta «tal cual». No garantizamos resultados comerciales específicos
        derivados del uso de la plataforma. Nuestra responsabilidad máxima estará limitada al
        importe abonado en los últimos 3 meses.
      </p>

      <h2>8. Modificaciones</h2>
      <p>
        Podemos modificar estos términos con previo aviso por email. El uso continuado del
        servicio tras la notificación implica la aceptación de los nuevos términos.
      </p>

      <h2>9. Legislación aplicable</h2>
      <p>
        Estos términos se rigen por la ley española. Para cualquier controversia, las partes
        se someten a los juzgados de <strong>[CIUDAD]</strong>.
      </p>

      <p>
        Contacto: <strong>[EMAIL DE CONTACTO]</strong>
      </p>
    </article>
  )
}
