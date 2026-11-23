const url = 'https://odmwquntubniqbvkecna.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbXdxdW50dWJuaXFidmtlY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMDc3MTIsImV4cCI6MjExMDc4MzcxMn0.ufqUPmbLFEgHZSuSG7C-a4nOKvIhuTFZGliqBL0Srd4';

async function run() {
  const res = await fetch(`${url}/rest/v1/company_settings?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  console.log('Status:', res.status, res.statusText);
  const data = await res.json();
  if (Array.isArray(data)) {
    console.log('Stores count:', data.length);
    data.forEach(s => {
      console.log('=== STORE:', s.store_id || s.id, s.company_name, '===');
      console.log('banner_desktop_img:', s.banner_desktop_img);
      console.log('banner_mobile_img:', s.banner_mobile_img);
      console.log('banner1_img:', s.banner1_img);
      console.log('banner1_title:', s.banner1_title);
      console.log('banner2_img:', s.banner2_img);
      console.log('banner2_title:', s.banner2_title);
      console.log('banners_json:', s.banners_json);
      console.log('billing_info:', typeof s.billing_info === 'object' ? JSON.stringify(s.billing_info) : s.billing_info);
    });
  } else {
    console.log('Response body:', data);
  }
}
run().catch(console.error);
