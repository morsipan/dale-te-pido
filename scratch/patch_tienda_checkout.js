import fs from 'fs';

const path = 'tienda.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Add formatWhatsAppNumber before enviarWhatsApp
const targetFn = 'function confirmNightGuardOrder() {';
const replacementFn = `// ── Sanitización y Normalización Robusta de WhatsApp (Pre-Lanzamiento Producción) ──
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
}

function confirmNightGuardOrder() {`;

content = content.replace(targetFn, replacementFn);

// 2. Harden sync_order_create with await and robust error handling
const oldSync = `    // ── 3.1 Sincronización Cloud Cifrada para Tablero Kanban & Tracking Multi-Dispositivo ──
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_order_create',
        store_id: STORE_ID,
        order: localOrder
      })
    }).catch(err => console.warn('Sync order vault warning:', err));`;

const newSync = `    // ── 3.1 Sincronización Cloud Cifrada Obligatoria (AWAIT) antes de WhatsApp ──
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_order_create',
          store_id: STORE_ID,
          order: localOrder
        })
      });
    } catch(vaultErr) {
      console.warn('Sync order vault warning (non-fatal):', vaultErr);
    }`;

// Replace ignoring \r
const normalize = s => s.replace(/\r\n/g, '\n');
if (normalize(content).includes(normalize(oldSync))) {
  // perform replacement preserving original line endings
  const isCrlf = content.includes('\r\n');
  const targetToReplace = isCrlf ? oldSync.replace(/\n/g, '\r\n') : oldSync;
  const repText = isCrlf ? newSync.replace(/\n/g, '\r\n') : newSync;
  content = content.replace(targetToReplace, repText);
} else {
  console.error('oldSync target not found');
}

// 3. Harden WhatsApp redirection and phone number formatting
const oldRedir = `    const wappUrl = \`https://wa.me/\${WHATSAPP_NUMBER}?text=\${encodeURIComponent(msg)}\`;
    const opened = window.open(wappUrl, '_blank');
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      window.location.href = wappUrl;
    }`;

const newRedir = `    const cleanWappNumber = formatWhatsAppNumber(WHATSAPP_NUMBER);
    const wappUrl = \`https://wa.me/\${cleanWappNumber}?text=\${encodeURIComponent(msg)}\`;

    // Micro-pausa de 120ms para asegurar vaciado de sockets de red y almacenamiento
    await new Promise(r => setTimeout(r, 120));

    // Redirección blindada para mobile y desktop sin bloqueo de popups
    const isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    if (isMobileDevice) {
      window.location.href = wappUrl;
    } else {
      const opened = window.open(wappUrl, '_blank');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        window.location.href = wappUrl;
      }
    }`;

if (normalize(content).includes(normalize(oldRedir))) {
  const isCrlf = content.includes('\r\n');
  const targetToReplace = isCrlf ? oldRedir.replace(/\n/g, '\r\n') : oldRedir;
  const repText = isCrlf ? newRedir.replace(/\n/g, '\r\n') : newRedir;
  content = content.replace(targetToReplace, repText);
} else {
  console.error('oldRedir target not found');
}

fs.writeFileSync(path, content, 'utf8');
console.log('tienda.html updated successfully');
