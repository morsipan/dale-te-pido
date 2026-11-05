const url = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';

async function testUnknownCol() {
  const payload = {
    store_id: 'bighouse',
    customer_name: 'Test Probe',
    non_existent_column_xyz: 'test'
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
  console.log('Status with non-existent column:', res.status);
  console.log('Body:', await res.text());
}
testUnknownCol().catch(e => console.error(e));
