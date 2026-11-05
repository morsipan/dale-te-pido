import handler from '../api/auth.js';

async function runDirectTest() {
  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: {
      action: 'sync_order_create',
      store_id: 'bighouse',
      order: {
        id: 'TP-9911',
        order_number: 'TP-9911',
        store_id: 'bighouse',
        customer_name: 'Juan Perez',
        customer_phone: '1122334455',
        total_amount: 5000,
        estado: 'confirmar'
      }
    }
  };

  let statusCode = 200;
  let responseData = null;
  const res = {
    status(c) {
      statusCode = c;
      return this;
    },
    json(data) {
      responseData = data;
      console.log('Response status:', statusCode, 'Data:', data);
      return this;
    },
    setHeader() {},
    end() {}
  };

  await handler(req, res);
}

runDirectTest().catch(e => console.error('Error running direct test:', e));
