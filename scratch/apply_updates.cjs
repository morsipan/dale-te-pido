const fs = require('fs');

// 1. Update .gitignore
let gitignore = fs.readFileSync('.gitignore', 'utf8');
if (!gitignore.includes('.env*')) {
  gitignore = gitignore.replace('.env\n.env.local', '.env*\n.env\n.env.local');
  fs.writeFileSync('.gitignore', gitignore);
  console.log('Updated .gitignore');
}

// 2. Update terminos.html
let terminos = fs.readFileSync('terminos.html', 'utf8');
terminos = terminos.replace(/Última actualización: \d+ de \w+ de \d{4}/g, 'Última actualización: 20 de Noviembre de 2026');
fs.writeFileSync('terminos.html', terminos);
console.log('Updated terminos.html');

// 3. Update privacidad.html
let privacidad = fs.readFileSync('privacidad.html', 'utf8');
privacidad = privacidad.replace(/Última actualización: \d+ de \w+ de \d{4}/g, 'Última actualización: 20 de Noviembre de 2026');
fs.writeFileSync('privacidad.html', privacidad);
console.log('Updated privacidad.html');

// 4. Update presentacion-evolucion-clickapp.html
let presHtml = fs.readFileSync('presentacion-evolucion-clickapp.html', 'utf8');

const slide41Html = `
          <!-- SLIDE 41: CONSOLIDACIÓN DE ARQUITECTURA DE DATOS & SCRIPT SQL MAESTRO -->
      <section class="slide" id="slide-41">
        <span class="slide-badge" style="background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.4);color:#6366F1;"><i class="bi bi-database-check"></i> Etapa 41 · Release 20 de Noviembre 2026</span>
        <h2 class="slide-title">Consolidación de Arquitectura de Datos: Script SQL Maestro & Políticas RLS de Seguridad</h2>
        <p class="slide-desc">Unificación exhaustiva de 25 migraciones previas en un único script SQL maestro (<code>schema_maestro_clickapp.sql</code>) idempotente, con aislamiento estricto de credenciales en <code>store_auth</code>, RLS blindado contra BOLA/IDOR y pausa estratégica de Dale!QueVoy.</p>

        <div class="grid-2" style="margin-top:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          <div class="card">
            <div class="card-title" style="color:#6366F1;"><i class="bi bi-diagram-3-fill"></i> Unificación & Normalización Multirubro</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Consolidación de tablas operativas: <code>stores</code>, <code>company_settings</code>, <code>categories</code>, <code>products</code>, <code>pickups</code>, <code>orders</code>, <code>order_items</code>, <code>faqs</code>, <code>reviews</code> y <code>email_templates</code> con claves foráneas e integridad referencial en cascada.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#10B981;"><i class="bi bi-shield-shaded"></i> Políticas RLS Granulares & Zero-Read Insert</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Catálogo de lectura pública para storefront sin fricción. En <code>orders</code>, permiso de inserción anónima con restricción estricta de lectura (Zero-Read Insert / <code>Prefer: return=minimal</code>), eliminando scraping de clientes y vulnerabilidades BOLA/IDOR.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#F59E0B;"><i class="bi bi-key-fill"></i> Aislamiento Criptográfico de Credenciales</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Separación física de contraseñas y tokens en <code>store_auth</code> y <code>store_credentials</code>. Hash <code>salt:sha256</code> gestionado por funciones RPC seguras (<code>verify_store_login</code>, <code>reset_store_password</code>) y revocación total a roles anónimos.
            </p>
          </div>

          <div class="card">
            <div class="card-title" style="color:#EF4444;"><i class="bi bi-pause-circle-fill"></i> Delimitación Estratégica Dale!QueVoy</div>
            <p style="font-size:12px; color:var(--text-muted); line-height:1.6; margin-top:6px;">
              Demarcación formal de tablas de cadetería y logística compartida (<code>merchants</code>, <code>deliveries</code>) como infraestructura en pausa técnica, asegurando que el despliegue del catálogo y comanda de Dale!TePido opere de forma limpia y desacoplada.
            </p>
          </div>
        </div>
      </section>
`;

if (!presHtml.includes('id="slide-41"')) {
  presHtml = presHtml.replace('    </main>', slide41Html + '\n    </main>');
  presHtml = presHtml.replace('const totalSlides = 40;', 'const totalSlides = 41;');
  presHtml = presHtml.replace(
    /Versión 4\.\d+.*· Actualizado \d+\/\d+\/\d+/g,
    'Versión 4.24 Schema Maestro Consolidado & RLS · Actualizado 20/11/2026'
  );
  fs.writeFileSync('presentacion-evolucion-clickapp.html', presHtml);
  console.log('Updated presentacion-evolucion-clickapp.html with Slide 41');
}

// 5. Update presentacion-evolucion-clickapp.md
let presMd = fs.readFileSync('presentacion-evolucion-clickapp.md', 'utf8');
const slide41Md = `
---

## Diapositiva 41: Consolidación de Arquitectura de Datos: Script SQL Maestro & Políticas RLS de Seguridad

> **Hito / Estado:** Etapa 41 · Release 20 de Noviembre 2026

Unificación exhaustiva de 25 migraciones previas en un único script SQL maestro (\`schema_maestro_clickapp.sql\`) idempotente, con aislamiento estricto de credenciales en \`store_auth\`, RLS blindado contra BOLA/IDOR y pausa estratégica de Dale!QueVoy.

### Componentes e Innovaciones Implementadas:

#### Unificación & Normalización Multirubro
Consolidación de tablas operativas: \`stores\`, \`company_settings\`, \`categories\`, \`products\`, \`pickups\`, \`orders\`, \`order_items\`, \`faqs\`, \`reviews\` y \`email_templates\` con claves foráneas e integridad referencial en cascada (\`ON DELETE CASCADE\`).

#### Políticas RLS Granulares & Zero-Read Insert
Catálogo de lectura pública para storefront sin fricción de login para el cliente. En \`orders\`, permiso de inserción anónima con restricción estricta de lectura (\`Prefer: return=minimal\`), eliminando scraping de clientes y vulnerabilidades BOLA/IDOR.

#### Aislamiento Criptográfico de Credenciales
Separación física de contraseñas y tokens en \`store_auth\` y \`store_credentials\`. Hash \`salt:sha256\` gestionado por funciones RPC seguras (\`verify_store_login\`, \`reset_store_password\`, \`verify_store_token\`) y revocación total (\`REVOKE ALL\`) a roles anónimos.

#### Delimitación Estratégica Dale!QueVoy
Demarcación formal de tablas de cadetería y logística compartida (\`merchants\`, \`deliveries\`) como infraestructura en pausa técnica, asegurando que el despliegue del catálogo y comanda de Dale!TePido opere de forma limpia y desacoplada.

---
`;

if (!presMd.includes('Diapositiva 41')) {
  presMd = presMd.trimEnd() + '\n' + slide41Md;
  fs.writeFileSync('presentacion-evolucion-clickapp.md', presMd);
  console.log('Updated presentacion-evolucion-clickapp.md with Diapositiva 41');
}

// 6. Update scratch/sync_folders.js
let syncJs = fs.readFileSync('scratch/sync_folders.js', 'utf8');
if (!syncJs.includes('schema_maestro_clickapp.sql')) {
  syncJs = syncJs.replace(
    "'supabase_multirubro_schema.sql',",
    "'supabase_multirubro_schema.sql',\n  'schema_maestro_clickapp.sql',\n  'presentacion-evolucion-clickapp.md',"
  );
  fs.writeFileSync('scratch/sync_folders.js', syncJs);
  console.log('Updated scratch/sync_folders.js with schema_maestro_clickapp.sql');
}
