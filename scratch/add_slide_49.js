import fs from 'fs';

let content = fs.readFileSync('presentacion-evolucion-clickapp.html', 'utf8');

const newSlide = `      <!-- SLIDE 49: AUDITORÍA INTEGRAL Y VALIDACIÓN 100% DE PORTADAS HERO MULTI-TIENDA -->
      <section class="slide" id="slide-49">
        <span class="slide-badge" style="background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.4);color:#60A5FA;"><i class="bi bi-camera-fill"></i> Etapa 49 · Release 23 de Noviembre 2026</span>
        <h2 class="slide-title">Auditoría Exhaustiva &amp; Certificación 100% de Portadas Hero en las 16 Tiendas</h2>
        <p class="slide-desc">Inspección individual de endpoints de imágenes en alta resolución, reemplazo preventivo de activos 404 (Nout Accesorios) y validación en vivo con <code>agent-browser</code> del renderizado de fondo (Desktop y Mobile).</p>

        <div class="grid-2" style="margin-top:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          <div class="card">
            <div class="card-title" style="color:#10B981;"><i class="bi bi-check2-all"></i> Cobertura 16/16 Tiendas Activas (100% OK)</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Auditoría HTTP HEAD sobre cada URL desktop y mobile de la base de datos de producción. Todas las tiendas activas (comerciales y demos) responden con código <code>200 OK</code> y dimensiones optimizadas (1600px y 800px).
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#F59E0B;"><i class="bi bi-wrench-adjustable"></i> Reparación Inmediata de Activos (Nout Accesorios)</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Detección y subsanación de un enlace Unsplash con 404 en <code>noutacc</code>. Se actualizó en Supabase con una imagen premium de gadgets y electrónica de alta disponibilidad con respuesta 200 garantizada.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#3B82F6;"><i class="bi bi-browser-chrome"></i> Verificación en Vivo con agent-browser</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Navegación e inspección real de propiedades computadas en el storefront en vivo (<code>background-image</code>, <code>background-size: cover</code>, <code>opacity</code> y variable CSS <code>--hero-bg-mobile</code>).
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#8B5CF6;"><i class="bi bi-rocket-takeoff-fill"></i> Lista para Altas Comerciales Inmediatas</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Plataforma consolidada y homogénea con total estabilidad para la reactivación y altas de comercios tras la migración de repositorio.
            </p>
          </div>
        </div>
      </section>

`;

const targetFooter = 'Dale! Te Pido © 2026 · Versión 4.30 CSP Hardening & Storefront Syntax Fix · Actualizado 22/11/2026';
const replacementFooter = 'Dale! Te Pido © 2026 · Versión 4.31 100% Hero Covers Audited & Certified · Actualizado 23/11/2026';

const targetTotalSlides = 'const totalSlides = 48;';
const replacementTotalSlides = 'const totalSlides = 49;';

if (content.includes('</main>') && content.includes(targetTotalSlides)) {
  content = content.replace('    </main>', newSlide + '    </main>');
  content = content.replace(targetFooter, replacementFooter);
  content = content.replace(targetTotalSlides, replacementTotalSlides);
  fs.writeFileSync('presentacion-evolucion-clickapp.html', content, 'utf8');
  console.log('Successfully updated presentacion-evolucion-clickapp.html with Etapa 49');
} else {
  console.error('Target tags not found');
  process.exit(1);
}
