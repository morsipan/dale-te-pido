import handler from '../api/auth.js';

const url = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';

async function testCircuit() {
  console.log('--- 1. Testing Supabase Direct Insert ---');
  const pedidoId = `TP-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderPayload = {
    order_number: pedidoId,
    store_id: 'bighouse',
    customer_name: 'Cliente Real Pre-Lanzamiento',
    customer_phone: '5491141819344',
    customer_address: 'Av. Corrientes 1234',
    delivery_type: 'delivery',
    items: [
      { id: 'bh-01', nombre: 'Smash Burger Doble Bacon', cantidad: 2, precio_unitario: 7500, subtotal: 15000 }
    ],
    total_amount: 15000,
    notes: 'DNI: 35123456 | Pago: Efectivo | PIN: 4812 | Opt-in Wapp: Sí',
    status: 'confirmar',
    created_at: new Date().toISOString()
  };

  const sbRes = await fetch(`${url}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(orderPayload)
  });

  console.log('Supabase orders HTTP Status:', sbRes.status, sbRes.statusText);
  if (sbRes.status !== 201) {
    console.error('Supabase error:', await sbRes.text());
  }

  console.log('\n--- 2. Testing Vault Cloud AES-256-GCM Sync (/api/auth) ---');
  const localOrder = {
    id: pedidoId,
    store_id: 'bighouse',
    fecha: '05/11/2026 19:50',
    cliente: 'Cliente Real Pre-Lanzamiento',
    dni: '35123456',
    productos: 'Smash Burger Doble Bacon ×2',
    pago: 'Efectivo',
    logistica: 'Envío a domicilio',
    direccion: 'Av. Corrientes 1234',
    total: 15000,
    estado: 'confirmar',
    opt_in_whatsapp: true,
    pin_code: '4812'
  };

  let vaultResCode = 200;
  let vaultResBody = null;
  const mockRes = {
    status(c) { vaultResCode = c; return this; },
    json(data) { vaultResBody = data; return this; },
    setHeader() {},
    end() {}
  };

  await handler({
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: {
      action: 'sync_order_create',
      store_id: 'bighouse',
      order: localOrder
    }
  }, mockRes);

  console.log('Vault sync_order_create status:', vaultResCode, 'Result:', vaultResBody?.success);

  console.log('\n--- 3. Testing Merchant Reception (sync_orders_list) ---');
  let listCode = 200;
  let listBody = null;
  const mockListRes = {
    status(c) { listCode = c; return this; },
    json(data) { listBody = data; return this; },
    setHeader() {},
    end() {}
  };

  await handler({
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: {
      action: 'sync_orders_list',
      store_id: 'bighouse'
    }
  }, mockListRes);

  console.log('Vault sync_orders_list count:', listBody?.orders?.length);
  const foundOrder = listBody?.orders?.find(o => o.id === pedidoId || o.order_number === pedidoId);
  console.log('Found newly created order in merchant list:', !!foundOrder, foundOrder?.id);
}

testCircuit().catch(e => console.error(e));
