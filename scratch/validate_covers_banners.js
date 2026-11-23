import https from 'https';

const SUPABASE_URL = 'https://odmwquntubniqbvkecna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbXdxdW50dWJuaXFidmtlY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMDc3MTIsImV4cCI6MjExMDc4MzcxMn0.ufqUPmbLFEgHZSuSG7C-a4nOKvIhuTFZGliqBL0Srd4';

function optimizeImg(url, width = null) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();
  if (!url) return '';
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('q', '80');
      if (width) u.searchParams.set('w', width);
      return u.toString();
    } catch(e) { return url; }
  }
  return url;
}

async function testStore(storeId) {
  return new Promise((resolve, reject) => {
    https.get(`${SUPABASE_URL}/rest/v1/company_settings?store_id=eq.${encodeURIComponent(storeId)}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const rows = JSON.parse(data);
        if (!rows || rows.length === 0) {
          console.error(`Store ${storeId} not found!`);
          return resolve(false);
        }
        const cfg = rows[0];
        let parsedDesign = {};
        if (cfg.billing_info) {
          const bi = typeof cfg.billing_info === 'string' ? JSON.parse(cfg.billing_info) : cfg.billing_info;
          if (bi && bi.design) parsedDesign = bi.design;
        }

        const heroBg = cfg.bg != null ? cfg.bg : (parsedDesign.bg || '');
        const heroMobile = parsedDesign.banner_mobile_img || '';
        const b1Title = cfg.banner1_title || parsedDesign.banner1_title || '';
        const b1Img = cfg.banner1_img || parsedDesign.banner1_img || '';
        const b2Title = cfg.banner2_title || parsedDesign.banner2_title || '';
        const b2Img = cfg.banner2_img || parsedDesign.banner2_img || '';

        const heroOptimized = optimizeImg(heroBg, 1200);
        const mobileOptimized = optimizeImg(heroMobile, 800);
        const b1Optimized = optimizeImg(b1Img, 900);
        const b2Optimized = optimizeImg(b2Img, 900);

        console.log(`\n=== STORE: ${storeId} (${cfg.business_name}) ===`);
        console.log(`Hero Cover URL: ${heroOptimized ? 'OK (' + heroOptimized.slice(0, 60) + '...)' : 'MISSING'}`);
        console.log(`Hero Mobile Cover URL: ${mobileOptimized ? 'OK (' + mobileOptimized.slice(0, 60) + '...)' : 'MISSING'}`);
        console.log(`Banner 1: "${b1Title}" | Img: ${b1Optimized ? 'OK' : 'EMPTY'}`);
        console.log(`Banner 2: "${b2Title}" | Img: ${b2Optimized ? 'OK' : 'EMPTY'}`);

        const passed = Boolean(heroOptimized && b1Title && b2Title);
        resolve(passed);
      });
    }).on('error', reject);
  });
}

(async () => {
  const storesToTest = ['bighouse', 'ferre-now', 'kioscojulio', 'al-toque', 'biuti', 'todolisto', 'noutacc', 'tecnomont'];
  let allOk = true;
  for (const s of storesToTest) {
    const ok = await testStore(s);
    if (!ok) allOk = false;
  }
  console.log(`\n>>> VERIFICATION RESULT: ${allOk ? 'ALL PASSED (100%)' : 'SOME FAILED'} <<<`);
})();
