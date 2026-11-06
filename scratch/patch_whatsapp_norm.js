import fs from 'fs';

const path = 'tienda.html';
let content = fs.readFileSync(path, 'utf8');

const targetFn = `// ── Sanitización y Normalización Robusta de WhatsApp (Pre-Lanzamiento Producción) ──
function formatWhatsAppNumber(phone) {
  if (!phone) return '5491141819344';
  let clean = String(phone).replace(/\\D+/g, '');
  if (!clean) return '5491141819344';
  if (clean.startsWith('549')) return clean;
  if (clean.startsWith('54')) return '549' + clean.slice(2);
  if (clean.startsWith('0')) clean = clean.slice(1);
  if (clean.startsWith('15') && clean.length === 10) clean = '11' + clean.slice(2);
  if (clean.length === 10) return '549' + clean;
  if (clean.length >= 8 && !clean.startsWith('54')) return '549' + clean;
  return clean;
}`;

const replacementFn = `// ── Sanitización y Normalización Robusta de WhatsApp (Pre-Lanzamiento Producción) ──
function formatWhatsAppNumber(phone) {
  if (!phone) return '5491141819344';
  let clean = String(phone).replace(/\\D+/g, '');
  if (!clean) return '5491141819344';

  // 1. Quitar prefijo interurbano '0'
  if (clean.startsWith('0')) clean = clean.slice(1);

  // 2. Resolver prefijo celular '15'
  // Si empieza con 15 y tiene 10 dígitos (asume código de área 11 de AMBA)
  if (clean.startsWith('15') && clean.length === 10) {
    clean = '11' + clean.slice(2);
  }
  // Si el 15 está después del código de área (ej: 011 15-4982-1133 -> 11 15 49821133)
  clean = clean.replace(/^(\\d{2,4})15(\\d{6,8})$/, (m, a, b) => a + b);

  // 3. Manejar prefijo de país 54
  if (clean.startsWith('54')) {
    if (clean.startsWith('549')) {
      let sub = clean.slice(3);
      sub = sub.replace(/^(\\d{2,4})15(\\d{6,8})$/, (m, a, b) => a + b);
      return '549' + sub;
    }
    let sub = clean.slice(2);
    sub = sub.replace(/^(\\d{2,4})15(\\d{6,8})$/, (m, a, b) => a + b);
    return '549' + sub;
  }

  // 4. Si tiene 10 dígitos (número nacional estándar argentino sin prefijo internacional)
  if (clean.length === 10) {
    return '549' + clean;
  }

  // 5. Fallback general: si tiene al menos 8 dígitos y no tiene prefijo 54
  if (clean.length >= 8 && !clean.startsWith('54')) {
    return '549' + clean;
  }

  return clean;
}`;

if (content.includes(targetFn)) {
  content = content.replace(targetFn, replacementFn);
  fs.writeFileSync(path, content, 'utf8');
  console.log('tienda.html formatWhatsAppNumber updated successfully');
} else {
  console.error('targetFn not found in tienda.html');
}
