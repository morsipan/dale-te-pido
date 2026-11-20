import fs from 'fs';

const files = [
  'tienda.html',
  'dashboard.html',
  'alta-usuario.html',
  'tracking.html',
  'api/auth.js',
  'api/store.js',
  'api/super-admin.js'
];

const patterns = [
  /company_settings\?([^"'\s`]+)/g,
  /products\?([^"'\s`]+)/g,
  /categories\?([^"'\s`]+)/g,
  /orders\?([^"'\s`]+)/g,
  /faqs\?([^"'\s`]+)/g,
  /pickups\?([^"'\s`]+)/g,
  /store_credentials\?([^"'\s`]+)/g,
  /store_auth\?([^"'\s`]+)/g
];

console.log('--- REST API Query Params ---');
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  patterns.forEach(p => {
    const matches = content.matchAll(p);
    for (const m of matches) {
      console.log(`${f} -> ${m[0]}`);
    }
  });
});
