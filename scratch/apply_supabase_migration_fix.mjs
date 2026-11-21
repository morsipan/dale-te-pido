import fs from 'fs';
import path from 'path';

const OLD_URL = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';

const NEW_URL = 'https://odmwquntubniqbvkecna.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbXdxdW50dWJuaXFidmtlY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMDc3MTIsImV4cCI6MjExMDc4MzcxMn0.ufqUPmbLFEgHZSuSG7C-a4nOKvIhuTFZGliqBL0Srd4';

function replaceFlex(content, target, replacement, label) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normReplacement = replacement.replace(/\r\n/g, '\n');
  if (!normContent.includes(normTarget)) {
    throw new Error(`Target not found for: ${label}`);
  }
  const updated = normContent.replace(normTarget, normReplacement);
  return eol === '\r\n' ? updated.replace(/\n/g, '\r\n') : updated;
}

// 1. Patch tienda.html
let tienda = fs.readFileSync('tienda.html', 'utf8');

// 1a. Head preconnects + Bootstrap Icons direct stylesheet
tienda = replaceFlex(
  tienda,
`<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://iaylgsthwildjkiiwgfd.supabase.co" crossorigin />
<link rel="preconnect" href="https://res.cloudinary.com" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://iaylgsthwildjkiiwgfd.supabase.co" crossorigin />
<link rel="preconnect" href="https://res.cloudinary.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Josefin+Sans:ital,wght@0,300..700;1,300..700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" media="print" onload="this.media='all'"/>
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet" media="print" onload="this.media='all'"/>`,
`<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="${NEW_URL}" crossorigin />
<link rel="preconnect" href="https://res.cloudinary.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Josefin+Sans:ital,wght@0,300..700;1,300..700&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet"/>`,
  'tienda.html head links'
);

// 1b. Supabase URL/Key + stale localStorage purge
tienda = replaceFlex(
  tienda,
`const DEFAULT_SUPABASE_URL = '${OLD_URL}';
const DEFAULT_SUPABASE_KEY = '${OLD_KEY}';

let rawSupabaseUrl = localStorage.getItem('storeapp_supabase_url');
if (rawSupabaseUrl && !rawSupabaseUrl.startsWith('http')) {
  localStorage.removeItem('storeapp_supabase_url');
  rawSupabaseUrl = null;
}`,
`const DEFAULT_SUPABASE_URL = '${NEW_URL}';
const DEFAULT_SUPABASE_KEY = '${NEW_KEY}';

let rawSupabaseUrl = localStorage.getItem('storeapp_supabase_url');
if (rawSupabaseUrl && (!rawSupabaseUrl.startsWith('http') || rawSupabaseUrl.includes('iaylgsthwildjkiiwgfd.supabase.co'))) {
  localStorage.removeItem('storeapp_supabase_url');
  localStorage.removeItem('storeapp_supabase_key');
  rawSupabaseUrl = null;
}`,
  'tienda.html supabase config'
);

// 1c. optimizeImg: do not rewrite /object/public/ to /render/image/public/ (breaks on Free tier)
tienda = replaceFlex(
  tienda,
`  // 3. Supabase Storage (renderizado optimizado de imágenes si está disponible)
  if (url.includes('.supabase.co/storage/v1/object/public/')) {
    if (!url.includes('?width=') && width) {
      return url.replace('/object/public/', '/render/image/public/') + \`?width=\${width}&quality=80&format=webp\`;
    }
  }`,
`  // 3. Supabase Storage: servir directamente /object/public/ (evita 403/404 en plan Free sin Image Transformations)
  if (url.includes('.supabase.co/storage/v1/object/public/')) {
    return url;
  }`,
  'tienda.html optimizeImg'
);

// 1d. applyConfig logo fallback
tienda = replaceFlex(
  tienda,
`  if (CFG.logo) {
    if (logoImg) {
      logoImg.src = optimizeImg(CFG.logo, 80, 80);
      logoImg.style.display = 'block';
    }
    if (logoIcon) logoIcon.style.display = 'none';
  } else {
    if (logoIcon) {
      logoIcon.textContent = CFG.emoji || '🍔';
      logoIcon.style.display = 'flex';
    }
    if (logoImg) logoImg.style.display = 'none';
  }`,
`  if (CFG.logo) {
    if (logoImg) {
      logoImg.onerror = function() {
        this.style.display = 'none';
        if (logoIcon) {
          logoIcon.textContent = CFG.emoji || '🏪';
          logoIcon.style.display = 'flex';
        }
      };
      logoImg.src = optimizeImg(CFG.logo, 80, 80);
      logoImg.style.display = 'block';
    }
    if (logoIcon) logoIcon.style.display = 'none';
  } else {
    if (logoIcon) {
      logoIcon.textContent = CFG.emoji || '🏪';
      logoIcon.style.display = 'flex';
    }
    if (logoImg) logoImg.style.display = 'none';
  }`,
  'tienda.html applyConfig logo'
);

// 1e. Category rail with emojis from public.categories + guessEmoji fallback
tienda = replaceFlex(
  tienda,
`    // Build category rail
    const cats = [...new Set(products.map(p => p.cat).filter(Boolean))];
    const rail = document.getElementById('cat-rail');
    rail.innerHTML = \`<button class="cat-btn active" data-cat="all" onclick="filterCat(this,'all')">
      <i class="bi bi-grid-3x3-gap"></i> Todos</button>\` +
      cats.map(c => \`<button class="cat-btn" data-cat="\${c}" onclick="filterCat(this,'\${c}')">\${c}</button>\`).join('');`,
`    // Build category rail (con íconos/emojis desde tabla categories + fallback inteligente)
    const catEmojiMap = {};
    try {
      const catRes = await fetchSupabase(\`/rest/v1/categories?store_id=eq.\${encodeURIComponent(STORE_ID)}&active=eq.true&order=display_order.asc\`);
      if (catRes.ok) {
        const fetchedCats = await catRes.json();
        if (Array.isArray(fetchedCats)) {
          fetchedCats.forEach(item => {
            if (item && item.name && item.emoji) {
              catEmojiMap[String(item.name).trim().toLowerCase()] = item.emoji;
            }
          });
        }
      }
    } catch (e) {
      console.warn('Advertencia al obtener íconos de categorías:', e);
    }

    const cats = [...new Set(products.map(p => p.cat).filter(Boolean))];
    const rail = document.getElementById('cat-rail');
    rail.innerHTML = \`<button class="cat-btn active" data-cat="all" onclick="filterCat(this,'all')">
      <i class="bi bi-grid-3x3-gap"></i> Todos</button>\` +
      cats.map(c => {
        const cEmoji = catEmojiMap[String(c).trim().toLowerCase()] || guessEmoji(c, c) || '';
        const label = cEmoji && !String(c).startsWith(cEmoji) ? \`\${cEmoji} \${escapeHTML(c)}\` : escapeHTML(c);
        return \`<button class="cat-btn" data-cat="\${escapeHTML(c)}" onclick='filterCat(this,\${JSON.stringify(c)})'>\${label}</button>\`;
      }).join('');`,
  'tienda.html category rail'
);

// 1f. Second logo handler fallback
tienda = replaceFlex(
  tienda,
`    if (logoImg) {
      logoImgEl.src = optimizeImg(logoImg, 80, 80);
      logoImgEl.style.display = 'block';
      if (logoIconEl) logoIconEl.style.display = 'none';
    } else {
      logoImgEl.style.display = 'none';
      if (logoIconEl) {
        logoIconEl.textContent = cfg.emoji || '🍔';
        logoIconEl.style.display = 'flex';
      }
    }`,
`    if (logoImg) {
      logoImgEl.onerror = function() {
        this.style.display = 'none';
        if (logoIconEl) {
          logoIconEl.textContent = cfg.emoji || '🏪';
          logoIconEl.style.display = 'flex';
        }
      };
      logoImgEl.src = optimizeImg(logoImg, 80, 80);
      logoImgEl.style.display = 'block';
      if (logoIconEl) logoIconEl.style.display = 'none';
    } else {
      logoImgEl.style.display = 'none';
      if (logoIconEl) {
        logoIconEl.textContent = cfg.emoji || '🏪';
        logoIconEl.style.display = 'flex';
      }
    }`,
  'tienda.html second logo handler'
);

fs.writeFileSync('tienda.html', tienda, 'utf8');
console.log('✓ Patched tienda.html');

// 2. Patch dashboard.html (Supabase URL/Key + stale localStorage purge)
let dash = fs.readFileSync('dashboard.html', 'utf8');
dash = replaceFlex(
  dash,
`    const VALID_ANON_KEY = '${OLD_KEY}';

    let rawSupabaseUrl = window.localStorage.getItem('storeapp_supabase_url');
    if (rawSupabaseUrl && !rawSupabaseUrl.startsWith('http')) {
      window.localStorage.removeItem('storeapp_supabase_url');
      rawSupabaseUrl = null;
    }`,
`    const VALID_ANON_KEY = '${NEW_KEY}';

    let rawSupabaseUrl = window.localStorage.getItem('storeapp_supabase_url');
    if (rawSupabaseUrl && (!rawSupabaseUrl.startsWith('http') || rawSupabaseUrl.includes('iaylgsthwildjkiiwgfd.supabase.co'))) {
      window.localStorage.removeItem('storeapp_supabase_url');
      window.localStorage.removeItem('storeapp_supabase_key');
      rawSupabaseUrl = null;
    }`,
  'dashboard.html supabase config'
);
dash = dash.split(OLD_URL).join(NEW_URL).split(OLD_KEY).join(NEW_KEY);
fs.writeFileSync('dashboard.html', dash, 'utf8');
console.log('✓ Patched dashboard.html');

// 3. Patch all other active HTML files + .env
const activeFiles = [
  'alta-usuario.html',
  'landing.html',
  'kit-imprimible.html',
  'dejar-resena.html',
  'tracking.html',
  'super-admin-config.html',
  'super-admin-secret-dashboard.html',
  '.env'
];

for (const file of activeFiles) {
  if (!fs.existsSync(file)) continue;
  const orig = fs.readFileSync(file, 'utf8');
  const next = orig.split(OLD_URL).join(NEW_URL).split(OLD_KEY).join(NEW_KEY);
  if (next !== orig) {
    fs.writeFileSync(file, next, 'utf8');
    console.log(`✓ Migrated Supabase URL/Key in ${file}`);
  }
}

// 4. Update scratch/sync_folders.js to sync img/logos/* and supabase_fix_icons_and_schema.sql
let syncJs = fs.readFileSync('scratch/sync_folders.js', 'utf8');
if (!syncJs.includes('supabase_fix_icons_and_schema.sql')) {
  syncJs = syncJs.replace(
    "'schema_maestro_clickapp.sql',",
    "'schema_maestro_clickapp.sql',\n  'supabase_fix_icons_and_schema.sql',"
  );
}
if (!syncJs.includes('img/logos/ferrenow-logo.jpg') && fs.existsSync('img/logos')) {
  const logos = fs.readdirSync('img/logos').filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
  const logoEntries = logos.map(f => `  'img/logos/${f}',`).join('\n');
  syncJs = syncJs.replace(
    "  'img/banner1-bg.jpg',",
    `${logoEntries}\n  'img/banner1-bg.jpg',`
  );
}
fs.writeFileSync('scratch/sync_folders.js', syncJs, 'utf8');
console.log('✓ Updated scratch/sync_folders.js');

// 5. Append fix SQL section to schema_maestro_clickapp.sql if not already included
let masterSql = fs.readFileSync('schema_maestro_clickapp.sql', 'utf8');
if (!masterSql.includes('store-assets')) {
  const fixSql = fs.readFileSync('supabase_fix_icons_and_schema.sql', 'utf8');
  masterSql = masterSql.trimEnd() + '\n\n' + fixSql;
  fs.writeFileSync('schema_maestro_clickapp.sql', masterSql, 'utf8');
  console.log('✓ Appended icon/column/storage fixes to schema_maestro_clickapp.sql');
}

// 6. Update presentacion-evolucion-clickapp.html & .md with Etapa 42
let presHtml = fs.readFileSync('presentacion-evolucion-clickapp.html', 'utf8');
const slide42Html = `
          <!-- SLIDE 42: FIX DE ÍCONOS & MIGRACIÓN INTEGRAL AL NUEVO SUPABASE -->
      <section class="slide" id="slide-42">
        <span class="slide-badge" style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.4);color:#10B981;"><i class="bi bi-stars"></i> Etapa 42 · Release 20 de Noviembre 2026</span>
        <h2 class="slide-title">Fix Integral de Íconos, Migración de Endpoints Supabase & Bucket Público de Assets</h2>
        <p class="slide-desc">Diagnóstico y resolución definitiva de la carga de íconos en tiendas tras migrar a la nueva cuenta de Supabase (<code>odmwquntubniqbvkecna</code>): eliminación de referencias residuales, carga síncrona de Bootstrap Icons, íconos de categorías y esquema completo.</p>

        <div class="grid-2" style="margin-top:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          <div class="card">
            <div class="card-title" style="color:#6366F1;"><i class="bi bi-database-fill-gear"></i> Migración Total de Endpoints & Auto-Limpieza</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Actualización de <code>api/store.js</code>, <code>api/auth.js</code>, <code>api/super-admin.js</code>, <code>api/security.js</code>, <code>tienda.html</code>, <code>dashboard.html</code> y páginas públicas al nuevo proyecto Supabase, con purga automática de <code>localStorage</code> antiguo y bump de Service Worker (<code>v19</code>).
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#10B981;"><i class="bi bi-bootstrap-fill"></i> Carga Garantizada de Bootstrap Icons & Categorías</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Eliminación del atributo <code>media="print"</code> en <code>bootstrap-icons.min.css</code> de <code>tienda.html</code>, integración de emojis desde <code>public.categories</code> en el carril de categorías y fallback <code>onerror</code> automático en logos de tienda.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#F59E0B;"><i class="bi bi-images"></i> Compatibilidad Supabase Storage Plan Free</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Corrección de <code>optimizeImg()</code> para servir directamente <code>/storage/v1/object/public/</code> sin reescribir a <code>/render/image/public/</code> (exclusivo Pro), evitando errores 403/404 en logos y fotos.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#EF4444;"><i class="bi bi-file-earmark-code-fill"></i> Script SQL <code>supabase_fix_icons_and_schema.sql</code></div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Incorporación de columnas faltantes (<code>emoji</code>, branding, redes, banners, pagos) en <code>company_settings</code>, normalización de íconos por defecto y creación del bucket público <code>store-assets</code> con políticas RLS.
            </p>
          </div>
        </div>
      </section>
`;

if (!presHtml.includes('id="slide-42"')) {
  presHtml = presHtml.replace('    </main>', slide42Html + '\n    </main>');
  presHtml = presHtml.replace('const totalSlides = 41;', 'const totalSlides = 42;');
  presHtml = presHtml.replace(
    /Versión 4\.\d+.*· Actualizado \d+\/\d+\/\d+/g,
    'Versión 4.25 Fix Íconos & Migración Supabase · Actualizado 20/11/2026'
  );
  fs.writeFileSync('presentacion-evolucion-clickapp.html', presHtml, 'utf8');
  console.log('✓ Updated presentacion-evolucion-clickapp.html with Slide 42');
}

let presMd = fs.readFileSync('presentacion-evolucion-clickapp.md', 'utf8');
const slide42Md = `
---

## Diapositiva 42: Fix Integral de Íconos, Migración de Endpoints Supabase & Bucket Público de Assets

> **Hito / Estado:** Etapa 42 · Release 20 de Noviembre 2026

Diagnóstico y resolución definitiva de la carga de íconos en tiendas tras migrar a la nueva cuenta de Supabase (\`odmwquntubniqbvkecna\`): eliminación de referencias residuales, carga síncrona de Bootstrap Icons, íconos de categorías y esquema completo.

### Componentes e Innovaciones Implementadas:

#### Migración Total de Endpoints & Auto-Limpieza
Actualización de \`api/store.js\`, \`api/auth.js\`, \`api/super-admin.js\`, \`api/security.js\`, \`tienda.html\`, \`dashboard.html\` y páginas públicas al nuevo proyecto Supabase, con purga automática de \`localStorage\` antiguo y bump de Service Worker (\`v19\`).

#### Carga Garantizada de Bootstrap Icons & Categorías
Eliminación del atributo \`media="print"\` en \`bootstrap-icons.min.css\` de \`tienda.html\`, integración de emojis desde \`public.categories\` en el carril de categorías y fallback \`onerror\` automático en logos de tienda.

#### Compatibilidad Supabase Storage Plan Free
Corrección de \`optimizeImg()\` para servir directamente \`/storage/v1/object/public/\` sin reescribir a \`/render/image/public/\` (exclusivo Pro), evitando errores 403/404 en logos y fotos.

#### Script SQL \`supabase_fix_icons_and_schema.sql\`
Incorporación de columnas faltantes (\`emoji\`, branding, redes, banners, pagos) en \`company_settings\`, normalización de íconos por defecto y creación del bucket público \`store-assets\` con políticas RLS.

---
`;
if (!presMd.includes('Diapositiva 42')) {
  presMd = presMd.trimEnd() + '\n' + slide42Md;
  fs.writeFileSync('presentacion-evolucion-clickapp.md', presMd, 'utf8');
  console.log('✓ Updated presentacion-evolucion-clickapp.md with Diapositiva 42');
}
