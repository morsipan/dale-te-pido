import fs from 'fs';

const OLD_URL = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';

const NEW_URL = 'https://odmwquntubniqbvkecna.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbXdxdW50dWJuaXFidmtlY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMDc3MTIsImV4cCI6MjExMDc4MzcxMn0.ufqUPmbLFEgHZSuSG7C-a4nOKvIhuTFZGliqBL0Srd4';

async function inspect(label, url, key) {
  console.log(`\n=== ${label} (${url}) ===`);
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  for (const tbl of ['company_settings', 'categories', 'products']) {
    try {
      const r = await fetch(`${url}/rest/v1/${tbl}?select=*&limit=5`, { headers });
      const text = await r.text();
      console.log(`Table ${tbl}: HTTP ${r.status}`);
      if (r.ok) {
        const data = JSON.parse(text);
        console.log(`  Count (limit 5): ${data.length}`);
        if (data.length > 0) {
          if (tbl === 'company_settings') {
            data.forEach(row => console.log(`  - store_id=${row.store_id}, logo_url=${row.logo_url}, emoji=${row.emoji}, banner1_img=${row.banner1_img}`));
          } else if (tbl === 'categories') {
            data.forEach(row => console.log(`  - store_id=${row.store_id}, name=${row.name}, emoji=${row.emoji}`));
          } else if (tbl === 'products') {
            data.forEach(row => console.log(`  - store_id=${row.store_id}, nombre=${row.nombre}, emoji=${row.emoji}, img=${(row.img || '').slice(0, 80)}`));
          }
        }
      } else {
        console.log(`  Error: ${text.slice(0, 200)}`);
      }
    } catch (e) {
      console.log(`  Fetch error on ${tbl}: ${e.message}`);
    }
  }
  try {
    const r = await fetch(`${url}/storage/v1/bucket`, { headers });
    console.log(`Storage buckets: HTTP ${r.status} -> ${(await r.text()).slice(0, 300)}`);
  } catch (e) {
    console.log(`Storage error: ${e.message}`);
  }
}

await inspect('NEW SUPABASE', NEW_URL, NEW_KEY);
await inspect('OLD SUPABASE', OLD_URL, OLD_KEY);
