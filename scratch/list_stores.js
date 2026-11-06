const url = 'https://iaylgsthwildjkiiwgfd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWxnc3Rod2lsZGpraWl3Z2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTQwODksImV4cCI6MjA5Mzg3MDA4OX0.4aysjORaQ_158r9CFgLSkcqmwpHFXsxZ9T18jEMF6z4';

async function listStores() {
  const res = await fetch(`${url}/rest/v1/company_settings?select=store_id,business_name`, {
    headers: { apikey: key, Authorization: 'Bearer ' + key }
  });
  console.log('Stores:', await res.json());
}
listStores().catch(e => console.error(e));

