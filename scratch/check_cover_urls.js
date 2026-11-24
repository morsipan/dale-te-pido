import https from 'https';

const SUPABASE_URL = 'https://odmwquntubniqbvkecna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbXdxdW50dWJuaXFidmtlY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMDc3MTIsImV4cCI6MjExMDc4MzcxMn0.ufqUPmbLFEgHZSuSG7C-a4nOKvIhuTFZGliqBL0Srd4';

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve({ ok: false, status: 'EMPTY' });
    try {
      const u = new URL(url);
      const req = https.request(u, { method: 'HEAD', timeout: 7000 }, (res) => {
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
      });
      req.on('error', (e) => resolve({ ok: false, status: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 'TIMEOUT' }); });
      req.end();
    } catch (e) {
      resolve({ ok: false, status: 'MALFORMED' });
    }
  });
}

(async () => {
  https.get(SUPABASE_URL + '/rest/v1/company_settings?select=store_id,business_name,billing_info', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const list = JSON.parse(data);
      console.log(`Checking ${list.length} stores...`);
      let allCoversValid = true;

      for (const item of list) {
        if (['test-ping-store', 'bigmount', 'cocostore'].includes(item.store_id)) continue;
        const design = (item.billing_info && item.billing_info.design) || {};
        const bg = design.bg;
        const mobile = design.banner_mobile_img;

        const bgRes = await checkUrl(bg);
        const mobileRes = await checkUrl(mobile);

        const statusStr = (bgRes.ok && mobileRes.ok) ? '✓ OK' : '✕ FAIL';
        if (!bgRes.ok || !mobileRes.ok) allCoversValid = false;

        console.log(
          statusStr.padEnd(8),
          item.store_id.padEnd(25),
          '| Desktop:', String(bgRes.status).padEnd(6),
          '| Mobile:', String(mobileRes.status).padEnd(6),
          '| Bg:', bg ? bg.slice(0, 50) + '...' : 'NONE'
        );
      }

      console.log('\nAudit Result:', allCoversValid ? 'ALL ACTIVE STORE COVERS VALID (100%)' : 'SOME COVERS BROKEN');
    });
  });
})();
