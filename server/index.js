const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const db = require('./db');
const { callSupplier } = require('./suppliers');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const listProducts = db.prepare('SELECT * FROM products');
const getProduct = db.prepare('SELECT * FROM products WHERE sku = ?');
const getPromo = db.prepare('SELECT * FROM promo_codes WHERE code = ?');
const claimPromoUsage = db.prepare('UPDATE promo_codes SET used_count = used_count + 1 WHERE code = ? AND used_count < max_uses');
const releasePromoUsage = db.prepare('UPDATE promo_codes SET used_count = used_count - 1 WHERE code = ? AND used_count > 0');

const insertOrder = db.prepare(
  `INSERT INTO orders (id, sku, promo_code, amount, currency, status, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, 'created', ?, ?)`
);
const getOrder = db.prepare('SELECT * FROM orders WHERE id = ?');
const setOrderStatus = db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?');
const setOrderDelivered = db.prepare("UPDATE orders SET status = 'delivered', delivered_code = ?, updated_at = ? WHERE id = ?");
const listUndelivered = db.prepare("SELECT * FROM orders WHERE status IN ('out_of_stock', 'delivery_failed') ORDER BY created_at");

const insertWebhookEvent = db.prepare('INSERT INTO webhook_events (event_id, order_id, received_at) VALUES (?, ?, ?)');

function isUniqueViolation(err) {
  return typeof err.message === 'string' && err.message.includes('UNIQUE constraint failed');
}

function computeAmount(product, promo) {
  if (!promo) return product.price;
  if (promo.type === 'percent') return Math.round(product.price * (1 - promo.value / 100));
  return Math.max(0, product.price - promo.value);
}

app.get('/api/products', (req, res) => {
  res.json(listProducts.all());
});

app.post('/api/orders', (req, res) => {
  const { sku, promo_code } = req.body || {};
  const product = getProduct.get(sku);
  if (!product) return res.status(404).json({ error: 'product_not_found' });

  let promo = null;
  if (promo_code) {
    promo = getPromo.get(promo_code);
    if (!promo) return res.status(400).json({ error: 'invalid_promo_code' });
    const claim = claimPromoUsage.run(promo_code);
    if (claim.changes === 0) return res.status(409).json({ error: 'promo_limit_reached' });
  }

  const amount = computeAmount(product, promo);
  const orderId = req.body.id || 'ord_' + crypto.randomBytes(6).toString('hex');
  const now = Date.now();
  try {
    insertOrder.run(orderId, sku, promo_code || null, amount, product.currency, now, now);
  } catch (err) {
    if (promo_code) releasePromoUsage.run(promo_code);
    throw err;
  }

  res.status(201).json({ order_id: orderId, sku, amount, currency: product.currency, promo_code: promo_code || null, status: 'created' });
});

app.get('/api/orders/:id', (req, res) => {
  const order = getOrder.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'order_not_found' });
  res.json(order);
});

const SUPPLIER_TIMEOUT_MS = Number(process.env.SUPPLIER_CALL_TIMEOUT_MS ?? 1500);

async function attemptSupplier(supplier, order, force) {
  const requestId = `${order.id}:${supplier}`;
  const supplierPromise = callSupplier(supplier, { requestId, sku: order.sku, orderId: order.id, force });

  const raced = await Promise.race([
    supplierPromise.then((result) => ({ timedOut: false, result })),
    new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), SUPPLIER_TIMEOUT_MS)),
  ]);

  if (!raced.timedOut) return raced.result;

  supplierPromise.then((result) => handleLateSupplierResponse(order.id, supplier, result)).catch(() => {});
  return { status: 'timeout' };
}

function finalizeDelivered(orderId, code) {
  const order = getOrder.get(orderId);
  if (!order || order.status === 'delivered') return;
  setOrderDelivered.run(code, Date.now(), orderId);
}

function handleLateSupplierResponse(orderId, supplier, result) {
  const order = getOrder.get(orderId);
  if (!order || order.status === 'delivered') return;
  if (result.status === 'ok') {
    finalizeDelivered(orderId, result.code);
    return;
  }
  if (supplier === 'A' && order.status === 'delivering') {
    runDelivery(orderId);
  } else if (order.status === 'delivering') {
    setOrderStatus.run(result.reason === 'out_of_stock' ? 'out_of_stock' : 'delivery_failed', Date.now(), orderId);
  }
}

async function runDelivery(orderId, options = {}) {
  const order = getOrder.get(orderId);
  if (!order || order.status !== 'delivering') return;

  const resultA = await attemptSupplier('A', order, options.forceA);
  if (resultA.status === 'ok') return finalizeDelivered(orderId, resultA.code);
  if (resultA.status === 'timeout') return;

  const resultB = await attemptSupplier('B', order, options.forceB);
  if (resultB.status === 'ok') return finalizeDelivered(orderId, resultB.code);
  if (resultB.status === 'timeout') return;

  const bothOutOfStock = resultA.reason === 'out_of_stock' && resultB.reason === 'out_of_stock';
  setOrderStatus.run(bothOutOfStock ? 'out_of_stock' : 'delivery_failed', Date.now(), orderId);
}

app.post('/api/webhooks/payment', async (req, res) => {
  const { event_id, order_id, status } = req.body || {};
  if (!event_id || !order_id || !['paid', 'failed'].includes(status)) {
    return res.status(400).json({ error: 'bad_request' });
  }

  const order = getOrder.get(order_id);
  if (!order) {
    return res.status(503).json({ error: 'order_not_found_yet' });
  }

  try {
    insertWebhookEvent.run(event_id, order_id, Date.now());
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.json({ result: 'duplicate_event', order: getOrder.get(order_id) });
    }
    throw err;
  }

  if (status === 'failed') {
    if (order.status === 'created') {
      setOrderStatus.run('payment_failed', Date.now(), order_id);
    }
    return res.json({ result: 'payment_failed', order: getOrder.get(order_id) });
  }

  if (order.status !== 'created') {
    return res.json({ result: 'already_processed', order: getOrder.get(order_id) });
  }

  setOrderStatus.run('delivering', Date.now(), order_id);
  res.json({ result: 'accepted', order: getOrder.get(order_id) });

  runDelivery(order_id).catch((err) => console.error('delivery error', order_id, err));
});

app.get('/api/admin/undelivered-orders', (req, res) => {
  res.json(listUndelivered.all());
});

app.post('/api/admin/orders/:id/retry', async (req, res) => {
  const order = getOrder.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'order_not_found' });
  if (order.status === 'delivered') return res.json({ result: 'already_delivered', order });
  if (!['out_of_stock', 'delivery_failed'].includes(order.status)) {
    return res.status(409).json({ error: 'order_not_recoverable', status: order.status });
  }

  setOrderStatus.run('delivering', Date.now(), order.id);
  await runDelivery(order.id);
  res.json({ result: 'retried', order: getOrder.get(order.id) });
});

app.post('/api/admin/restock', (req, res) => {
  const { count } = req.body || {};
  const n = Number(count) || 1;
  const insertKey = db.prepare("INSERT INTO keys (code, status) VALUES (?, 'available')");
  for (let i = 0; i < n; i++) {
    insertKey.run('RESTOCK-' + crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  res.json({ restocked: n });
});

app.post('/api/test/force-delivery', async (req, res) => {
  const { order_id, forceA, forceB } = req.body || {};
  const order = getOrder.get(order_id);
  if (!order) return res.status(404).json({ error: 'order_not_found' });
  setOrderStatus.run('delivering', Date.now(), order_id);
  await runDelivery(order_id, { forceA, forceB });
  res.json({ order: getOrder.get(order_id) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`gamekeys-store listening on http://localhost:${PORT}`);
});
