const https = require('https');
const SUPABASE_URL = 'https://odmwquntubniqbvkecna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbXdxdW50dWJuaXFidmtlY25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyMDc3MTIsImV4cCI6MjExMDc4MzcxMn0.ufqUPmbLFEgHZSuSG7C-a4nOKvIhuTFZGliqBL0Srd4';

const storePresets = {
  'al-toque': {
    bg: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=85',
    mobile: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=85',
    h1: 'AL TOQUE BEBIDAS',
    h2: 'DELIVERY EXPRESS & PACKS',
    desc: 'Cervezas heladas, vinos boutique, destilados premium y hielo directo a tu puerta.',
    h1Color: '#FFFFFF',
    h2Color: '#F59E0B',
    descColor: '#E0E0E0',
    b1_label: 'PROMO CERVECERA',
    b1_title: 'Pack Corona 6x710ml + Balde',
    b1_img: 'https://images.unsplash.com/photo-1608270192799-59e8f8d83efe?w=1200',
    b1_cat: '',
    b2_label: 'DESTILADOS',
    b2_title: 'Gin Bombay Sapphire + Tónica',
    b2_img: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=1200',
    b2_cat: ''
  },
  'ferreteria-el-rafa': {
    bg: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1600&q=85',
    mobile: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&q=85',
    h1: 'FERRETERÍA EL RAFA',
    h2: 'HERRAMIENTAS & CONSTRUCCIÓN',
    desc: 'Todo para el profesional y el hogar. Máquinas, sanitarios, fijaciones y electricidad.',
    h1Color: '#FFFFFF',
    h2Color: '#D72638',
    descColor: '#E0E0E0',
    b1_label: 'LÍNEA ELÉCTRICA',
    b1_title: 'Taladros Percutores & Amoladoras',
    b1_img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200',
    b1_cat: '',
    b2_label: 'FIJACIONES',
    b2_title: 'Tarugos, Tornillos & Brocas Especiales',
    b2_img: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1200',
    b2_cat: ''
  },
  'larebardie': {
    bg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85',
    mobile: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=85',
    h1: 'LA REBARDIE',
    h2: 'MODA URBANA & INDUMENTARIA',
    desc: 'Prendas esenciales de diseño independiente con calce perfecto y textiles de primera calidad.',
    h1Color: '#FFFFFF',
    h2Color: '#E11D48',
    descColor: '#E0E0E0',
    b1_label: 'NUEVA COLECCIÓN',
    b1_title: 'Oversize Streetwear & Hoodies',
    b1_img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200',
    b1_cat: '',
    b2_label: 'DENIM PREMIUM',
    b2_title: 'Jeans & Camperas Relaxed Fit',
    b2_img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200',
    b2_cat: ''
  },
  'licalic': {
    bg: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&q=85',
    mobile: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=85',
    h1: 'LICALIC STORE',
    h2: 'ECOMMERCE & TENDENCIAS',
    desc: 'Los mejores productos para tu estilo de vida, hogar y tecnología con envíos a todo el país.',
    h1Color: '#FFFFFF',
    h2Color: '#3B82F6',
    descColor: '#E0E0E0',
    b1_label: 'DESTACADOS',
    b1_title: 'Lo Más Vendido del Mes',
    b1_img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200',
    b1_cat: '',
    b2_label: 'LANZAMIENTOS',
    b2_title: 'Novedades & Accesorios',
    b2_img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
    b2_cat: ''
  },
  'elquesabepoco': {
    bg: 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?w=1600&q=85',
    mobile: 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?w=800&q=85',
    h1: 'KIOSCO EL QUE SABE POCO',
    h2: 'SNACKS, GOLOSINAS & BEBIDAS',
    desc: 'Parada obligatoria para tus antojos del día. Chocolates, alfajores, bebidas heladas y tabaco.',
    h1Color: '#FFFFFF',
    h2Color: '#10B981',
    descColor: '#E0E0E0',
    b1_label: 'PROMO COMBO',
    b1_title: 'Alfajor Triple + Café Caliente',
    b1_img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200',
    b1_cat: '',
    b2_label: 'REFRIGERADOS',
    b2_title: 'Energizantes & Bebidas Frías',
    b2_img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200',
    b2_cat: ''
  },
  'starsound': {
    bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=85',
    mobile: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=85',
    h1: 'STARSOUND PRO',
    h2: 'AUDIO, LUCES & DJ GEAR',
    desc: 'Equipamiento profesional para eventos, streaming, producción musical e iluminación de alta potencia.',
    h1Color: '#FFFFFF',
    h2Color: '#8B5CF6',
    descColor: '#E0E0E0',
    b1_label: 'AUDIO PRO',
    b1_title: 'Monitores de Estudio & Auriculares',
    b1_img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200',
    b1_cat: '',
    b2_label: 'ILUMINACIÓN',
    b2_title: 'Cabezales Móviles LED & Efectos DMX',
    b2_img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
    b2_cat: ''
  },
  'royal-prestige-monte-grande': {
    bg: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&q=85',
    mobile: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=85',
    h1: 'ROYAL PRESTIGE',
    h2: 'SISTEMAS DE COCINA DE ALTA GAMA',
    desc: 'Tecnología en acero quirúrgico 316L para cocinar sin aceite ni agua conservando nutrientes y sabor.',
    h1Color: '#FFFFFF',
    h2Color: '#D97706',
    descColor: '#E0E0E0',
    b1_label: 'SETS DE COCINA',
    b1_title: 'Baterías de Cocina 5 y 7 Piezas',
    b1_img: 'https://images.unsplash.com/photo-1584990347449-39906f3661eb?w=1200',
    b1_cat: '',
    b2_label: 'ACCESORIOS',
    b2_title: 'Cuchillos Profesionales & Filtros de Agua',
    b2_img: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=1200',
    b2_cat: ''
  },
  'polo': {
    bg: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1600&q=85',
    mobile: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&q=85',
    h1: 'FERRETERÍA POLO',
    h2: 'EL CORAZÓN DE TU PROYECTO',
    desc: 'Artículos de ferretería en general, bulonería, pinturas, cerrajería y asesoramiento técnico directo.',
    h1Color: '#FFFFFF',
    h2Color: '#DC2626',
    descColor: '#E0E0E0',
    b1_label: 'PINTURERÍA',
    b1_title: 'Látex Interior/Exterior & Esmaltes',
    b1_img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200',
    b1_cat: '',
    b2_label: 'MÁQUINAS',
    b2_title: 'Herramientas Eléctricas & Inalámbricas',
    b2_img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200',
    b2_cat: ''
  }
};

async function patchStore(storeId, preset) {
  return new Promise((resolve, reject) => {
    https.get(`${SUPABASE_URL}/rest/v1/company_settings?store_id=eq.${encodeURIComponent(storeId)}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const rows = JSON.parse(data);
        if (!rows || rows.length === 0) return resolve();
        const row = rows[0];
        const bi = (typeof row.billing_info === 'object' && row.billing_info !== null) ? row.billing_info : {};
        const design = {
          ...(bi.design || {}),
          bg: preset.bg,
          banner_mobile_img: preset.mobile,
          h1: preset.h1,
          h2: preset.h2,
          desc: preset.desc,
          h1Color: preset.h1Color,
          h2Color: preset.h2Color,
          descColor: preset.descColor,
          heroBgColor: '#0E0E0E',
          heroImgOpacity: 70,
          banner_mode: 'double',
          banner1_bg: '#1C1C1E',
          banner2_bg: '#1C1C1E',
          banner1_active: true,
          banner2_active: true
        };
        const updatedBi = { ...bi, design };

        const payload = JSON.stringify({
          billing_info: updatedBi,
          banner1_label: preset.b1_label,
          banner1_title: preset.b1_title,
          banner1_img: preset.b1_img,
          banner1_cat: preset.b1_cat,
          banner2_label: preset.b2_label,
          banner2_title: preset.b2_title,
          banner2_img: preset.b2_img,
          banner2_cat: preset.b2_cat
        });

        const req = https.request(`${SUPABASE_URL}/rest/v1/company_settings?id=eq.${row.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: 'Bearer ' + SUPABASE_KEY,
            'Prefer': 'return=minimal'
          }
        }, (pRes) => {
          pRes.on('data', () => {});
          pRes.on('end', () => {
            console.log(`[PATCH] ${storeId} -> status ${pRes.statusCode}`);
            resolve();
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    });
  });
}

(async () => {
  for (const [storeId, preset] of Object.entries(storePresets)) {
    await patchStore(storeId, preset);
  }
  console.log('All remaining active stores populated successfully!');
})();
