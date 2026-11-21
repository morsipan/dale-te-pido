const OLD_URL = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';
const NEW_URL = 'https://odmwquntubniqbvkecna.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbXdxdW50dWJuaXFidmtlY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMDc3MTIsImV4cCI6MjExMDc4MzcxMn0.ufqUPmbLFEgHZSuSG7C-a4nOKvIhuTFZGliqBL0Srd4';

const hOld = { apikey: OLD_KEY, Authorization: 'Bearer ' + OLD_KEY };
const hNew = { apikey: NEW_KEY, Authorization: 'Bearer ' + NEW_KEY };

// 1. Get OpenAPI spec with proper header
const specOld = await (await fetch(OLD_URL + '/rest/v1/', { headers: { ...hOld, Accept: 'application/openapi+json' } })).json();
const specNew = await (await fetch(NEW_URL + '/rest/v1/', { headers: { ...hNew, Accept: 'application/openapi+json' } })).json();

for (const t of ['company_settings', 'categories', 'products']) {
  const oldCols = specOld.definitions?.[t]?.properties ? Object.keys(specOld.definitions[t].properties) : [];
  const newCols = specNew.definitions?.[t]?.properties ? Object.keys(specNew.definitions[t].properties) : [];
  const missingInNew = oldCols.filter(c => !newCols.includes(c));
  console.log(`\nTABLE ${t}:`);
  console.log(`  OLD (${oldCols.length}): ${oldCols.join(', ')}`);
  console.log(`  NEW (${newCols.length}): ${newCols.join(', ')}`);
  console.log(`  MISSING IN NEW (${missingInNew.length}): ${missingInNew.join(', ')}`);
}

// 2. Check active stores in OLD Supabase for logo_url, emoji, banner images
const stores = await (await fetch(OLD_URL + '/rest/v1/company_settings?status=neq.DELETED&select=store_id,business_name,logo_url,emoji,banner1_img,banner2_img&limit=15', { headers: hOld })).json();
console.log('\nACTIVE STORES IN OLD SUPABASE:');
if (Array.isArray(stores)) {
  for (const s of stores) {
    const logoPreview = s.logo_url ? (s.logo_url.startsWith('data:') ? 'data:image...(' + s.logo_url.length + 'b)' : s.logo_url) : 'NULL';
    console.log(`  ${s.store_id}: emoji=${s.emoji}, logo=${logoPreview}`);
  }
} else {
  console.log('  Error:', stores);
}
