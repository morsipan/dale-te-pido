import fs from 'fs';

const path = 'tienda.html';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync_order_create',
        store_id: STORE_ID,
        order: localOrder
      })
    }).catch(err => console.warn('Sync order vault warning:', err));`;

const replacementStr = `try {
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

// normalize CRLF
const idx = content.indexOf("action: 'sync_order_create'");
if (idx !== -1) {
  // Find start of fetch
  const fetchStart = content.lastIndexOf("fetch('/api/auth'", idx);
  const fetchEnd = content.indexOf("}).catch(err => console.warn('Sync order vault warning:', err));", idx);
  if (fetchStart !== -1 && fetchEnd !== -1) {
    const fullEnd = fetchEnd + "}).catch(err => console.warn('Sync order vault warning:', err));".length;
    content = content.substring(0, fetchStart) + replacementStr + content.substring(fullEnd);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully patched sync_order_create with await');
  } else {
    console.error('Could not find fetch bounds');
  }
} else {
  console.error('action: sync_order_create not found');
}
