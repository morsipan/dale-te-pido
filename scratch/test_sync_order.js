async function testSyncOrder() {
  const localOrder = {
    id: 'TEST-1234',
    store_id: 'burger-house',
    fecha: '05/11/2026 19:40',
    cliente: 'Prueba Local',
    dni: '12345678',
    productos: 'Hamburguesa Doble ×1',
    pago: 'Efectivo',
    logistica: 'Retiro en local',
    total: 8500,
    estado: 'confirmar'
  };

  const res = await fetch('http://localhost:3000/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sync_order_create',
      store_id: 'burger-house',
      order: localOrder
    })
  });

  console.log('Localhost status:', res.status);
  console.log('Localhost body:', await res.text());
}

testSyncOrder().catch(e => console.log('Fetch error:', e.message));

