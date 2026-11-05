const url = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';

async function testInsertSelect() {
  const payload = {
    order_number: 'TEST-9998',
    store_id: 'burger-house',
    customer_name: 'Test Customer',
    customer_phone: '1122334455',
    customer_address: 'Test Address 123',
    delivery_type: 'delivery',
    items: [{ id: '1', nombre: 'Test', cantidad: 1, precio_unitario: 100, subtotal: 100 }],
    total_amount: 100,
    notes: 'Test note',
    status: 'confirmar',
    created_at: new Date().toISOString()
  };

  const res = await fetch(url + '/rest/v1/orders', {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });
  console.log('Status with return=representation:', res.status);
  console.log('Body:', await res.text());
}
testInsertSelect().catch(e => console.error(e));
