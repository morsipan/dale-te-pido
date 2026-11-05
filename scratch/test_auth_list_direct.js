import handler from '../api/auth.js';

async function testListOrders() {
  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: {
      action: 'sync_orders_list',
      store_id: 'bighouse'
    }
  };

  let statusCode = 200;
  const res = {
    status(c) {
      statusCode = c;
      return this;
    },
    json(data) {
      console.log('List status:', statusCode, 'Orders count:', data.orders?.length);
      console.log('First order:', data.orders?.[0]);
      return this;
    },
    setHeader() {},
    end() {}
  };

  await handler(req, res);
}

testListOrders().catch(e => console.error(e));
