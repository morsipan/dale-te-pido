import fs from 'fs';

const path = 'dashboard.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new order audio/toast detection inside syncOrdersFromCloudAndStorage
const targetSyncEnd = `      // Actualizar vistas del dashboard
      if (typeof renderAllOrders === 'function') renderAllOrders(allOrders);`;

const newSyncDetection = `      // Detección proactiva de nuevos pedidos entrantes (alerta sonora y visual en mostrador)
      if (typeof window._prevOrdersSyncedCount === 'number' && allOrders.length > window._prevOrdersSyncedCount) {
        const newCount = allOrders.length - window._prevOrdersSyncedCount;
        try {
          if (typeof NotificationCenter !== 'undefined' && typeof NotificationCenter.playChime === 'function') {
            NotificationCenter.playChime();
          }
        } catch(e) {}
        if (typeof showToastDash === 'function') {
          showToastDash(\`🔔 ¡\${newCount} nuevo\${newCount > 1 ? 's' : ''} pedido\${newCount > 1 ? 's' : ''} recibido\${newCount > 1 ? 's' : ''}!\`);
        }
      }
      window._prevOrdersSyncedCount = allOrders.length;

      // Actualizar vistas del dashboard
      if (typeof renderAllOrders === 'function') renderAllOrders(allOrders);`;

if (content.includes(targetSyncEnd)) {
  content = content.replace(targetSyncEnd, newSyncDetection);
} else {
  console.error('targetSyncEnd not found in dashboard.html');
}

// 2. Add polling interval after focus event listener
const targetFocus = `    // Sincronizar al volver a enfocar la ventana/pestaña
    window.addEventListener('focus', () => {
      syncOrdersFromCloudAndStorage();
    });`;

const newPolling = `    // Sincronizar al volver a enfocar la ventana/pestaña
    window.addEventListener('focus', () => {
      syncOrdersFromCloudAndStorage();
    });

    // Polling de respaldo cada 15s para recepción en vivo garantizada en tablets y pantallas de mostrador
    if (!window._ordersSyncInterval) {
      window._ordersSyncInterval = setInterval(() => {
        if (!document.hidden) {
          syncOrdersFromCloudAndStorage();
        }
      }, 15000);
    }`;

if (content.includes(targetFocus)) {
  content = content.replace(targetFocus, newPolling);
} else {
  console.error('targetFocus not found in dashboard.html');
}

fs.writeFileSync(path, content, 'utf8');
console.log('dashboard.html patched successfully');

