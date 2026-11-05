const url = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';

const candidates = [
  'id',
  'store_id',
  'merchant_id',
  'order_number',
  'customer_name',
  'customer_phone',
  'customer_address',
  'delivery_address',
  'delivery_type',
  'order_type',
  'items',
  'total_amount',
  'total_ars',
  'subtotal_ars',
  'delivery_fee_ars',
  'notes',
  'status',
  'notified_to_merchant',
  'created_at',
  'updated_at'
];

async function checkColumns() {
  const valid = [];
  const invalid = [];

  for (const col of candidates) {
    const payload = {
      store_id: 'bighouse',
      [col]: col === 'items' ? [] : (col.includes('total') || col.includes('subtotal') || col.includes('fee') ? 10 : (col === 'notified_to_merchant' ? false : (col === 'id' ? '00000000-0000-0000-0000-000000000000' : 'test')))
    };

    const res = await fetch(url + '/rest/v1/orders', {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (res.status === 201 || res.status === 409) {
      valid.push(col);
    } else {
      const txt = await res.text();
      if (txt.includes('Could not find')) {
        invalid.push(col);
      } else {
        valid.push(col); // type mismatch or other, but column exists
      }
    }
  }

  console.log('VALID COLUMNS IN SUPABASE orders:');
  console.log(valid);
  console.log('INVALID COLUMNS IN SUPABASE orders:');
  console.log(invalid);
}

checkColumns().catch(e => console.error(e));
