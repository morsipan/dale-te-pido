import fs from 'fs';

// 1. Update presentacion-evolucion-clickapp.html
let presHtml = fs.readFileSync('presentacion-evolucion-clickapp.html', 'utf8');

const slide43Html = `
          <!-- SLIDE 43: STEPPER PERSISTENTE & MICRO-INTERACCIONES EN CATÁLOGO -->
      <section class="slide" id="slide-43">
        <span class="slide-badge" style="background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4);color:#EF4444;"><i class="bi bi-cart-plus-fill"></i> Etapa 43 · Release 20 de Noviembre 2026</span>
        <h2 class="slide-title">Optimización UX/UI del Selector de Cantidades: Stepper Persistente en Catálogo</h2>
        <p class="slide-desc">Reemplazo del botón tradicional de compra por una cápsula horizontal de alto contraste que permanece activa en pantalla, permitiendo sumar, restar o eliminar productos en 1 toque con feedback háptico y sincronización bidireccional inmediata con el carrito.</p>

        <div class="grid-2" style="margin-top:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          <div class="card">
            <div class="card-title" style="color:#EF4444;"><i class="bi bi-capsule"></i> Cápsula Stepper Persistente (Zero Auto-Cierre)</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Al tocar <code>+ Agregar</code>, muta a una cápsula compacta de 36px de alto con bordes redondeados y sombra luminosa. El control permanece visible en todo momento mientras <code>cantidad >= 1</code>, eliminando clics redundantes.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#10B981;"><i class="bi bi-trash3-fill"></i> Transición Inteligente a Papelera</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Cuando la cantidad es <code>1</code>, el botón izquierdo cambia al ícono de papelera (<code>bi-trash</code>) con hover en rojo (#DC2626). Al presionar, remueve el ítem del carrito y restaura el botón al estado inicial <code>+ Agregar</code>.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#3B82F6;"><i class="bi bi-badge-ad-fill"></i> Borde Activo & Badge Flotante en Tarjeta</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Toda tarjeta con productos en el carrito adquiere la clase <code>.in-cart</code> con borde activo de acento y un badge superior redondeado (<code><i class="bi bi-bag-check-fill"></i> X en carrito</code>), permitiendo identificar las compras al hacer scroll.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#F59E0B;"><i class="bi bi-phone-vibrate-fill"></i> Micro-Animación Tabular & Háptica Móvil</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Efecto de salto elástico (<code>scale(1.22)</code>) sobre los números centrales en tipografía tabular (<code>tabular-nums</code>) junto a pulsos hápticos ligeros (<code>vibrate(15ms)</code>), garantizando respuesta táctil instantánea y táctil en Android e iOS.
            </p>
          </div>
        </div>
      </section>
`;

if (!presHtml.includes('id="slide-43"')) {
  presHtml = presHtml.replace('    </main>', slide43Html + '\n    </main>');
  presHtml = presHtml.replace('const totalSlides = 42;', 'const totalSlides = 43;');
  presHtml = presHtml.replace(
    /Versión 4\.\d+.*· Actualizado \d+\/\d+\/\d+/g,
    'Versión 4.26 Stepper Persistente Catálogo · Actualizado 20/11/2026'
  );
  fs.writeFileSync('presentacion-evolucion-clickapp.html', presHtml, 'utf8');
  console.log('✓ Updated presentacion-evolucion-clickapp.html with Slide 43');
}

// 2. Update presentacion-evolucion-clickapp.md
let presMd = fs.readFileSync('presentacion-evolucion-clickapp.md', 'utf8');
const slide43Md = `
---

## Diapositiva 43: Optimización UX/UI del Selector de Cantidades: Stepper Persistente en Catálogo

> **Hito / Estado:** Etapa 43 · Release 20 de Noviembre 2026

Reemplazo del botón tradicional de compra por una cápsula horizontal de alto contraste que permanece activa en pantalla, permitiendo sumar, restar o eliminar productos en 1 toque con feedback háptico y sincronización bidireccional inmediata con el carrito.

### Componentes e Innovaciones Implementadas:

#### Cápsula Stepper Persistente (Zero Auto-Cierre)
Al tocar \`+ Agregar\`, muta a una cápsula compacta de 36px de alto con bordes redondeados y sombra luminosa. El control permanece visible en todo momento mientras \`cantidad >= 1\`, eliminando clics redundantes.

#### Transición Inteligente a Papelera
Cuando la cantidad es \`1\`, el botón izquierdo cambia al ícono de papelera (\`bi-trash\`) con hover en rojo (#DC2626). Al presionar, remueve el ítem del carrito y restaura el botón al estado inicial \`+ Agregar\`.

#### Borde Activo & Badge Flotante en Tarjeta
Toda tarjeta con productos en el carrito adquiere la clase \`.in-cart\` con borde activo de acento y un badge superior redondeado (\`🛒 X en carrito\`), permitiendo identificar las compras al hacer scroll.

#### Micro-Animación Tabular & Háptica Móvil
Efecto de salto elástico (\`scale(1.22)\`) sobre los números centrales en tipografía tabular (\`tabular-nums\`) junto a pulsos hápticos ligeros (\`vibrate(15ms)\`), garantizando respuesta táctil instantánea y táctil en Android e iOS.

---
`;

if (!presMd.includes('Diapositiva 43')) {
  presMd = presMd.trimEnd() + '\n' + slide43Md;
  fs.writeFileSync('presentacion-evolucion-clickapp.md', presMd, 'utf8');
  console.log('✓ Updated presentacion-evolucion-clickapp.md with Diapositiva 43');
}
