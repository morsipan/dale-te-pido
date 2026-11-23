import fs from 'fs';

let content = fs.readFileSync('presentacion-evolucion-clickapp.html', 'utf8');

const newSlide = `      <!-- SLIDE 47: RESTAURACIÓN Y ARQUITECTURA ROBUSTA DE PORTADAS HERO Y BANNERS PROMOCIONALES -->
      <section class="slide" id="slide-47">
        <span class="slide-badge" style="background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4);color:#F87171;"><i class="bi bi-image-fill"></i> Etapa 47 · Release 22 de Noviembre 2026</span>
        <h2 class="slide-title">Restauración Integral de Portadas Hero &amp; Banners Promocionales Multi-Tienda</h2>
        <p class="slide-desc">Alineación arquitectónica de almacenamiento en PostgreSQL (<code>billing_info.design</code>), sanitización de payloads PATCH en el Dashboard y renderizado reactivo de alta resolución en el Catálogo Storefront.</p>

        <div class="grid-2" style="margin-top:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          <div class="card">
            <div class="card-title" style="color:#F59E0B;"><i class="bi bi-palette2"></i> Portadas Hero Duales (Desktop 1600px &amp; Mobile 800px)</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Restauración del pipeline de imagen de portada en <code>tienda.html</code>. Se sincronizan en vivo la imagen desktop, la versión optimizada mobile (<code>--hero-bg-mobile</code>), el color de fondo <code>heroBgColor</code> y la opacidad regulable sin borrado prematuro de LocalStorage.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#10B981;"><i class="bi bi-grid-1x2-fill"></i> Banners Promocionales 50/50 y Modo Single</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Población de títulos, etiquetas y fotografías de alta resolución en las 16 tiendas activas (comerciales y demos). Visualización garantizada en Desktop (<code>1fr 1fr</code>) y Mobile (<code>1fr</code>) con redirección inteligente a categorías.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#3B82F6;"><i class="bi bi-shield-check"></i> Sanitización de Payloads PATCH en Dashboard</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Resolución definitiva del error PostgreSQL 400 (<code>PGRST204</code>) al guardar desde el Dashboard. Las propiedades visuales se persisten exclusivamente dentro del JSONB <code>billing_info.design</code>, y las columnas de banners válidas van a nivel raíz.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#8B5CF6;"><i class="bi bi-lightning-charge-fill"></i> Optimización LCP con Fetchpriority High</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Inyección dinámica de preload LCP (<code>&lt;link rel="preload" fetchpriority="high"&gt;</code>) y optimización de URLs en tiempo de ejecución (Unsplash auto-format WebP/AVIF y resize inteligente según viewport).
            </p>
          </div>
        </div>
      </section>

`;

const targetFooter = 'Dale! Te Pido © 2026 · Versión 4.28 Super Admin Credential Hardening · Actualizado 22/11/2026';
const replacementFooter = 'Dale! Te Pido © 2026 · Versión 4.29 Hero Cover & Promo Banners Architecture · Actualizado 22/11/2026';

const targetTotalSlides = 'const totalSlides = 46;';
const replacementTotalSlides = 'const totalSlides = 47;';

if (content.includes('</main>') && content.includes(targetTotalSlides)) {
  content = content.replace('    </main>', newSlide + '    </main>');
  content = content.replace(targetFooter, replacementFooter);
  content = content.replace(targetTotalSlides, replacementTotalSlides);
  fs.writeFileSync('presentacion-evolucion-clickapp.html', content, 'utf8');
  console.log('Successfully updated presentacion-evolucion-clickapp.html with Etapa 47');
} else {
  console.error('Target tags not found');
  process.exit(1);
}
