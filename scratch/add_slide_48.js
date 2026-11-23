import fs from 'fs';

let content = fs.readFileSync('presentacion-evolucion-clickapp.html', 'utf8');

const newSlide = `      <!-- SLIDE 48: CORRECCIÓN DE SYNTAXERROR EN TIENDA & AMPLIACIÓN CSP CONNECT-SRC (SERVICE WORKER & CDNs) -->
      <section class="slide" id="slide-48">
        <span class="slide-badge" style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.4);color:#10B981;"><i class="bi bi-shield-check"></i> Etapa 48 · Release 22 de Noviembre 2026</span>
        <h2 class="slide-title">Resolución de Sintaxis en Tienda &amp; Desbloqueo CSP para Service Worker y CDNs</h2>
        <p class="slide-desc">Corrección del SyntaxError en <code>tienda.html</code> en la persistencia de portadas y ampliación de la directiva <code>connect-src</code> en la Content Security Policy de <code>vercel.json</code> y caché v20 del Service Worker.</p>

        <div class="grid-2" style="margin-top:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          <div class="card">
            <div class="card-title" style="color:#10B981;"><i class="bi bi-code-slash"></i> Corrección de SyntaxError en tienda.html</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Corrección del escape de barras invertidas en la invocación a <code>localStorage.setItem('storeapp_hero_img_' + STORE_ID, CFG.bg)</code> y versión móvil. Los scripts de <code>tienda.html</code> ahora compilan sin errores sintácticos (100% validados).
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#3B82F6;"><i class="bi bi-shield-lock-fill"></i> Ampliación de CSP <code>connect-src</code></div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Inclusión de <code>https://fonts.googleapis.com</code>, <code>https://fonts.gstatic.com</code>, <code>https://cdn.jsdelivr.net</code>, <code>https://cdnjs.cloudflare.com</code> y <code>https://unpkg.com</code> dentro de la directiva <code>connect-src</code> en <code>vercel.json</code>.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#F59E0B;"><i class="bi bi-cpu-fill"></i> Service Worker v20 &amp; Revalidación Segura</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Incremento del caché del Service Worker a <code>daletepido-v20</code>. Se permite que las peticiones de fetch a CDNs estáticos se ejecuten y revaliden sin violar las políticas de seguridad del navegador.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#8B5CF6;"><i class="bi bi-check-circle-fill"></i> Carga Fluida de Tiendas (Lugones Silva y Catálogo)</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Eliminación de mensajes de bloqueo en consola y resolución completa de la inicialización del catálogo en vivo para todas las tiendas.
            </p>
          </div>
        </div>
      </section>

`;

const targetFooter = 'Dale! Te Pido © 2026 · Versión 4.29 Hero Cover & Promo Banners Architecture · Actualizado 22/11/2026';
const replacementFooter = 'Dale! Te Pido © 2026 · Versión 4.30 CSP Hardening & Storefront Syntax Fix · Actualizado 22/11/2026';

const targetTotalSlides = 'const totalSlides = 47;';
const replacementTotalSlides = 'const totalSlides = 48;';

if (content.includes('</main>') && content.includes(targetTotalSlides)) {
  content = content.replace('    </main>', newSlide + '    </main>');
  content = content.replace(targetFooter, replacementFooter);
  content = content.replace(targetTotalSlides, replacementTotalSlides);
  fs.writeFileSync('presentacion-evolucion-clickapp.html', content, 'utf8');
  console.log('Successfully updated presentacion-evolucion-clickapp.html with Etapa 48');
} else {
  console.error('Target tags not found');
  process.exit(1);
}
