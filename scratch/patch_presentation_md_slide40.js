import fs from 'fs';

const path = 'presentacion-evolucion-clickapp.md';
let content = fs.readFileSync(path, 'utf8');

const slide40Md = `
## Diapositiva 40: Directiva Técnica Maestra: Blindaje Integral Pre-Lanzamiento Primer Cliente Real

> **Hito / Estado:** Etapa 40 · Release 5 de Noviembre 2026

Resolución y verificación exhaustiva de los puntos críticos de checkout móvil, persistencia transaccional en Supabase, sincronización obligatoria en Vault Cloud AES-256-GCM y recepción auditiva/visual en vivo en el Kanban del comercio.

### Componentes e Innovaciones Implementadas:

#### Eliminación Total del "Efecto Pedido Fantasma"
Bloqueo inmediato del botón de checkout con spinner y texto \`"Procesando pedido..."\`. Doble persistencia asíncrona garantizada con \`await\` obligatorio antes de la redirección externa a WhatsApp.

#### Doble Persistencia Cloud (Supabase + Vault AES-256-GCM)
Inserción directa en \`public.orders\` con \`Prefer: return=minimal\` (zero-read insert) y sincronización con \`await fetch('/api/auth', { action: 'sync_order_create' })\`, asegurando persistencia multi-dispositivo inmediata.

#### Sanitización Telefónica E.164 & Redirección Móvil Directa
Normalización automática de números argentinos (\`+549...\`, remoción de \`0\` y \`15\`) y salto directo mediante \`window.location.href\` con micro-pausa de 120ms para evitar bloqueos de popups en iOS Safari y Android Chrome.

#### Polling en Mostrador & Alerta Sonora de Comanda
Polling continuo cada 15s en \`dashboard.html\` con reproducción de chime polifónico Web Audio API y aviso toast al detectar nuevos pedidos entrantes, eliminando la necesidad de recargas manuales por parte del comerciante.

---
`;

content = content.trimEnd() + '\n' + slide40Md;
fs.writeFileSync(path, content, 'utf8');
console.log('presentacion-evolucion-clickapp.md updated with slide 40');
