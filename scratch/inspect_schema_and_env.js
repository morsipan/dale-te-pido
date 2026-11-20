import fs from 'fs';

const envLocal = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
console.log('--- .env.local vars ---');
envLocal.split('\n').forEach(l => {
  const parts = l.split('=');
  if (parts[0] && !parts[0].startsWith('#')) console.log(parts[0].trim());
});

const files = [
  'tienda.html',
  'dashboard.html',
  'alta-usuario.html',
  'tracking.html',
  'super-admin-config.html',
  'super-admin-email-cms.html',
  'super-admin-prospectos.html',
  'api/auth.js',
  'api/store.js',
  'api/super-admin.js',
  'api/helper.js',
  'api/welcome-email.js'
];

const tables = new Set();
const restMatches = new Set();

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const fromMatches = content.matchAll(/\.from\(['"]([a-zA-Z0-9_]+)['"]\)/g);
  for (const m of fromMatches) tables.add(m[1]);

  const rMatches = content.matchAll(/\/rest\/v1\/([a-zA-Z0-9_]+)/g);
  for (const m of rMatches) restMatches.add(m[1]);
});

console.log('--- Tables found from .from(...) ---', Array.from(tables));
console.log('--- Tables found from /rest/v1/ ---', Array.from(restMatches));

const allTables = new Set([...tables, ...restMatches]);
console.log('--- ALL TABLES USED IN APP ---', Array.from(allTables));
