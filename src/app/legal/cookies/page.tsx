// TODO-LEGAL: Revisar con abogado. Verificar categorías de cookies, base legal del consentimiento y panel de gestión antes de lanzar.

export const metadata = { title: 'Política de cookies — My Client' }

export default function CookiesPage() {
  return (
    <article className="prose prose-zinc max-w-none">
      <h1>Política de cookies</h1>
      <p className="text-zinc-500 text-sm">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p>
        Esta política explica qué cookies y tecnologías similares utiliza My Client y cómo
        puedes controlarlas.
      </p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que un sitio web almacena en tu dispositivo
        cuando lo visitas. Permiten que el sitio recuerde tus preferencias y mejore tu experiencia.
      </p>

      <h2>2. Cookies que utilizamos</h2>

      <h3>Cookies estrictamente necesarias</h3>
      <p>Esenciales para el funcionamiento del servicio. No requieren consentimiento.</p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Proveedor</th>
              <th>Finalidad</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>sb-*</code></td>
              <td>Supabase</td>
              <td>Sesión de autenticación</td>
              <td>Sesión / 1 semana</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TODO-LEGAL: Verificar con abogado si PostHog requiere consentimiento previo o vale interés legítimo */}
      <h3>Cookies analíticas</h3>
      <p>Utilizamos PostHog (servidores en la UE) para analizar el uso del servicio y mejorar el producto. Estos datos son anonimizados y no se comparten con terceros.</p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Proveedor</th>
              <th>Finalidad</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>ph_*</code></td>
              <td>PostHog EU</td>
              <td>Analítica de uso del producto</td>
              <td>1 año</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Cookies de pago</h3>
      <p>Stripe puede establecer cookies durante el proceso de pago para prevenir fraudes.</p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Proveedor</th>
              <th>Finalidad</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>__stripe_*</code></td>
              <td>Stripe</td>
              <td>Prevención de fraude en pagos</td>
              <td>Sesión / 2 años</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3. Cómo gestionar las cookies</h2>
      <p>
        Puedes configurar tu navegador para rechazar o eliminar cookies. Ten en cuenta que
        deshabilitar las cookies necesarias puede afectar al funcionamiento del servicio.
      </p>
      {/* TODO-LEGAL: Añadir panel de gestión de consentimiento (banner de cookies) antes de lanzar en producción */}
      <p>
        Instrucciones para los principales navegadores:
        Chrome · Firefox · Safari · Edge.
      </p>

      <h2>4. Actualizaciones</h2>
      <p>
        Podemos actualizar esta política cuando cambiemos las cookies que utilizamos.
        Te notificaremos si los cambios son significativos.
      </p>

      <p>
        Para cualquier consulta, escríbenos a <strong>[EMAIL DE CONTACTO]</strong>.
      </p>
    </article>
  )
}
