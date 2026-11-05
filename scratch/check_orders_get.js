const url = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';

async function testFetchOrders() {
  const res = await fetch(`${url}/rest/v1/orders?store_id=eq.burger-house&order=created_at.desc`, {
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key
    }
  });
  console.log('GET orders status:', res.status);
  console.log('GET orders body:', await res.text());
}
testFetchOrders().catch(e => console.error(e));
