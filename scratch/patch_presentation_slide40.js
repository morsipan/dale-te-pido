import fs from 'fs';

const path = 'presentacion-evolucion-clickapp.html';
let content = fs.readFileSync(path, 'utf8');

const slide40Html = `      <!-- SLIDE 40: BLINDAJE PRE-LANZAMIENTO PRIMER CLIENTE REAL -->
      <section class="slide" id="slide-40">
        <span class="slide-badge" style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.4);color:#10B981;"><i class="bi bi-shield-check"></i> Etapa 40 · Release 5 de Noviembre 2026</span>
        <h2 class="slide-title">Directiva Técnica Maestra: Blindaje Integral Pre-Lanzamiento Primer Cliente Real</h2>
        <p class="slide-desc">Resolución y verificación exhaustiva de los puntos críticos de checkout móvil, persistencia transaccional en Supabase, sincronización obligatoria en Vault Cloud AES-256-GCM y recepción auditiva/visual en vivo en el Kanban del comercio.</p>

        <div class="grid-2" style="margin-top:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          <div class="card">
            <div class="card-title" style="color:#10B981;"><i class="bi bi-shield-lock-fill"></i> Eliminación Total del "Efecto Pedido Fantasma"</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Bloqueo inmediato del botón de checkout con spinner y texto <code>"Procesando pedido..."</code>. Doble persistencia asíncrona garantizada con <code>await</code> obligatorio antes de la redirección externa a WhatsApp.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#3B82F6;"><i class="bi bi-cloud-arrow-up-fill"></i> Doble Persistencia Cloud (Supabase + Vault AES-256-GCM)</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Inserción directa en <code>public.orders</code> con <code>Prefer: return=minimal</code> (zero-read insert) y sincronización con <code>await fetch('/api/auth', { action: 'sync_order_create' })</code>, asegurando persistencia multi-dispositivo inmediata.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#F59E0B;"><i class="bi bi-whatsapp"></i> Sanitización Telefónica E.164 & Redirección Móvil Directa</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Normalización automática de números argentinos (<code>+549...</code>, quita de <code>0</code> y <code>15</code>) y salto directo mediante <code>window.location.href</code> con micro-pausa de 120ms para evitar bloqueos de popups en iOS Safari y Android Chrome.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:var(--red);"><i class="bi bi-bell-fill"></i> Polling en Mostrador & Alerta Sonora de Comanda</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Polling continuo cada 15s en <code>dashboard.html</code> con reproducción de chime polifónico Web Audio API y aviso toast al detectar nuevos pedidos entrantes, eliminando la necesidad de recargas manuales por parte del comerciante.
            </p>
          </div>
        </div>
      </section>
`;

// Insert slide 40 before </main>
const mainEndIdx = content.indexOf('</main>');
if (mainEndIdx !== -1) {
  content = content.substring(0, mainEndIdx) + slide40Html + '\n    ' + content.substring(mainEndIdx);
} else {
  console.error('</main> not found');
}

// Update totalSlides and footer
content = content.replace('const totalSlides = 39;', 'const totalSlides = 40;');
content = content.replace(
  'Dale! Te Pido © 2026 · Versión 4.22 Sistema Anti-Pérdida de Prospectos & Setup Opal DM · Actualizado 30/10/2026',
  'Dale! Te Pido © 2026 · Versión 4.23 Blindaje Pre-Lanzamiento Primer Cliente Real · Actualizado 05/11/2026'
);

fs.writeFileSync(path, content, 'utf8');
console.log('presentacion-evolucion-clickapp.html updated to slide 40');
