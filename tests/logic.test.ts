import test from 'node:test';
import assert from 'node:assert/strict';
import { createError } from 'h3';
import { ServerError } from '../server/utils/error';
import { escapeXml, isAdsenseClientId, isEnabled } from '../shared/utils/site';
import { CheckoutInCartSchema } from '../shared/schemas/cart';

const config = {
  s3: { host: 'localhost', useSSL: 'false', accessKey: 'test', secretKey: 'test', bucketDefault: 'test' },
  mail: { host: 'localhost', port: '587', secure: false, auth: { user: 'test', pass: 'test' } },
  public: { siteUrl: 'https://3d2ds.com' },
};
Object.assign(globalThis, { useRuntimeConfig: () => config, ServerError, createError });
const { OrderService } = await import('../server/core/service/order');
const { CartService } = await import('../server/core/service/cart');
const { ProductService } = await import('../server/core/service/product');
const { S3 } = await import('../server/core/service/s3');
const { Mail } = await import('../server/core/service/mail');
const globals = globalThis as any;
function setDatabase(db: any) { globals.prisma = db; }

function freeDownloadDatabase(overrides: any = {}, existing: any = null) {
  const calls: any = {};
  const tx = {
    product: { findUnique: async () => ({ id: 4, plan: 'FREE', price: 0, status: 'ACTIVE', externalLink: 'https://example.com/download', ...overrides }) },
    $queryRaw: async () => { calls.locked = true; return []; },
    cart: { findFirst: async (args: any) => { calls.lookup = args; return existing; } },
    order: { create: async (args: any) => { calls.create = args; return { publicId: 'free-order' }; } },
  };
  setDatabase({ $transaction: async (fn: any) => fn(tx) });
  return calls;
}

test('direct free download rejects PRO, nonzero prices, inactive products and unsafe links', async () => {
  for (const overrides of [{ plan: 'PRO' }, { price: 10 }, { status: 'INACTIVE' }, { externalLink: null }, { externalLink: 'javascript:alert(1)' }]) {
    const calls = freeDownloadDatabase(overrides);
    await assert.rejects(OrderService.recordFreeDownload(7, 'product'));
    assert.equal(calls.create, undefined);
  }
});

test('direct free download records a zero-value paid order for the authenticated user', async () => {
  const calls = freeDownloadDatabase();
  assert.deepEqual(await OrderService.recordFreeDownload(7, 'product'), { orderId: 'free-order', created: true });
  assert.equal(calls.locked, true);
  assert.deepEqual(calls.create.data, {
    orderByUserId: 7, amount: 0, currency: 'USD', status: 'PAID',
    items: { create: { userId: 7, productId: 4, price: 0 } },
  });
  assert.equal(calls.lookup.where.order.orderByUserId, 7);
});

test('direct free download reuses an existing purchase without creating another order', async () => {
  const calls = freeDownloadDatabase({}, { order: { publicId: 'previous-order' } });
  assert.deepEqual(await OrderService.recordFreeDownload(7, 'product'), { orderId: 'previous-order', created: false });
  assert.equal(calls.create, undefined);
});

function cart(id = 'a', status = 'ACTIVE', price = 12) {
  return { id, price: 1, product: { status, price } };
}
function checkoutDatabase(items: any[], claimCount = 1) {
  const calls: any = {};
  const tx = {
    cart: {
      findMany: async (args: any) => { calls.query = args; return items; },
      updateMany: async (args: any) => { calls.claim = args; return { count: claimCount }; },
    },
    order: {
      create: async (args: any) => { calls.create = args; return { id: 1n }; },
      findUniqueOrThrow: async () => ({ id: 1n, publicId: 'order', items }),
    },
  };
  setDatabase({ $transaction: async (fn: any) => fn(tx) });
  return calls;
}

test('checkout rejects empty input before opening a transaction', async () => {
  setDatabase({ $transaction: () => assert.fail('must not create an empty order') });
  await assert.rejects(OrderService.create(7, []), { code: 400 });
});
test('checkout requires every selected row to belong to current unassigned cart', async () => {
  const calls = checkoutDatabase([]);
  await assert.rejects(OrderService.create(7, ['foreign']), { code: 409 });
  assert.deepEqual(calls.query.where, { id: { in: ['foreign'] }, userId: 7, orderId: null });
  assert.equal(calls.create, undefined);
});
test('checkout rejects inactive products', async () => {
  const calls = checkoutDatabase([cart('a', 'INACTIVE')]);
  await assert.rejects(OrderService.create(7, ['a']), { code: 409 });
  assert.equal(calls.create, undefined);
});
test('checkout deduplicates IDs and snapshots the current server price', async () => {
  const calls = checkoutDatabase([cart()]);
  await OrderService.create(7, ['a', 'a']);
  assert.equal(calls.create.data.amount, 12);
  assert.equal(calls.claim.data.price, 12);
  assert.deepEqual(calls.claim.where, { id: 'a', userId: 7, orderId: null });
});
test('checkout rejects a cart row claimed by a competing checkout', async () => {
  checkoutDatabase([cart()], 0);
  await assert.rejects(OrderService.create(7, ['a']), { code: 409 });
});
test('removing a cart product never removes historical order items', async () => {
  let args: any;
  setDatabase({ cart: { deleteMany: async (value: any) => { args = value; } } });
  await new CartService(7).removeProducts(['product']);
  assert.equal(args.where.orderId, null);
  assert.equal(args.where.userId, 7);
});
test('cancellation atomically accepts only pending orders', async () => {
  let args: any;
  setDatabase({ order: { updateMany: async (value: any) => { args = value; return { count: 0 }; } } });
  await assert.rejects(new OrderService({ id: 2n } as any).cancel(), { code: 409 });
  assert.deepEqual(args.where, { id: 2n, status: 'PENDING' });
});
test('unpaid order cannot trigger email delivery', async () => {
  setDatabase({ order: { findUniqueOrThrow: async () => ({ status: 'PENDING', items: [] }) } });
  await assert.rejects(OrderService.sendProduct('order'), { code: 409 });
});
test('failed mail never marks a paid order delivered', async () => {
  const original = Mail.client.sendMail;
  Mail.client.sendMail = (async () => { throw new Error('SMTP unavailable'); }) as any;
  setDatabase({ order: {
    findUniqueOrThrow: async () => ({ status: 'PAID', orderByUser: { name: 'Customer', email: 'test@example.com' }, items: [] }),
    update: () => assert.fail('must not mark failed email as delivered'),
  } });
  try { await assert.rejects(OrderService.sendProduct('order'), /SMTP unavailable/); }
  finally { Mail.client.sendMail = original; }
});
test('free external-link product delivery does not require a design file', async () => {
  const original = Mail.client.sendMail;
  let message: any;
  let delivered = false;
  Mail.client.sendMail = (async (args: any) => { message = args; }) as any;
  setDatabase({ order: {
    findUniqueOrThrow: async () => ({ status: 'PAID', orderByUser: { name: 'Customer', email: 'test@example.com' }, items: [{ product: { name: 'Chair', plan: 'FREE', externalLink: 'https://example.com/chair', files: [] } }] }),
    update: async () => { delivered = true; },
  } });
  try {
    await OrderService.sendProduct('order');
    assert.equal(delivered, true);
    assert.match(message.text, /https:\/\/example.com\/chair/);
    assert.match(message.text, /https:\/\/3d2ds.com\/library/);
  } finally { Mail.client.sendMail = original; }
});
test('design download rejects users who have not purchased', async () => {
  setDatabase({ objectStorage: { findFirstOrThrow: async () => ({ bucket: 'test', objectName: 'file', productId: 1 }) }, cart: { findFirst: async () => null } });
  await assert.rejects(ProductService.getFile('file', 'DESIGN', { id: 7, publicId: 'u', email: 'test@example.com' }), { code: 403 });
});
test('product category array can be cleared explicitly', async () => {
  let args: any;
  setDatabase({ category: { findMany: async () => [] }, product: { update: async (value: any) => { args = value; } } });
  await new ProductService({ id: 1 } as any).update(undefined, undefined, undefined, undefined, []);
  assert.deepEqual(args.data.categories, { set: [] });
});
test('activation validates the new plan, rather than the old one', async () => {
  setDatabase({ objectStorage: { findMany: async () => [{ type: 'IMAGE' }] } });
  await assert.rejects(new ProductService({ id: 1, plan: 'FREE', externalLink: 'https://example.com' } as any).update(undefined, undefined, undefined, 'ACTIVE', undefined, 'PRO'), { code: 409, message: 'Required product file' });
});
test('checkout schema rejects empty selection', () => {
  assert.equal(CheckoutInCartSchema.safeParse({ cardIds: [] }).success, false);
  assert.equal(CheckoutInCartSchema.safeParse({ cardIds: [''] }).success, false);
});
test('XML output escapes attributes and text', () => {
  assert.equal(escapeXml(`<a x="'">&`), '&lt;a x=&quot;&apos;&quot;&gt;&amp;');
});
test('AdSense accepts valid client IDs and explicit enabled values only', () => {
  assert.equal(isAdsenseClientId('ca-pub-1234567890123456'), true);
  for (const value of ['', 'pub-1234567890123456', '<script>', 'ca-pub-123']) assert.equal(isAdsenseClientId(value), false);
  assert.equal(isEnabled('false'), false);
  assert.equal(isEnabled(false), false);
  assert.equal(isEnabled('true'), true);
});

test('active product edits cannot switch to PRO without a design file', async () => {
  setDatabase({ objectStorage: { findMany: async () => [{ type: 'IMAGE' }] } });
  await assert.rejects(new ProductService({ id: 1, status: 'ACTIVE', plan: 'FREE', externalLink: 'https://example.com' } as any).update(undefined, undefined, undefined, undefined, undefined, 'PRO'), { code: 409 });
});
test('owned design file is accessible after purchase', async () => {
  const original = S3.CLIENT.statObject;
  S3.CLIENT.statObject = (async () => ({ metaData: { 'content-type': 'application/zip' } })) as any;
  setDatabase({ objectStorage: { findFirstOrThrow: async () => ({ bucket: 'test', objectName: 'file', productId: 1 }) }, cart: { findFirst: async () => ({ id: 'purchased' }) } });
  try { assert.equal((await ProductService.getFile('file', 'DESIGN', { id: 7, publicId: 'u', email: 'test@example.com' })).contentType, 'application/zip'); }
  finally { S3.CLIENT.statObject = original; }
});

Object.assign(globals, {
  defineEventHandler: (handler: any) => handler,
  setResponseStatus: (event: any, status: number) => { event.status = status; },
  getRequestURL: () => new URL('https://3d2ds.com/api/payment/free'),
  getQuery: (event: any) => event.query,
  readBody: (event: any) => event.body,
  sendRedirect: (_event: any, location: string) => ({ location }),
  setResponseHeader: (event: any, name: string, value: string) => { (event.headers ??= {})[name] = value; },
});
const { UserAuthContext } = await import('../server/utils/context-working');
const { zodValidateRequestOrThrow } = await import('../server/utils/helpers/validate-request');
const { validatePaymentRedirects } = await import('../server/utils/payment-redirects');
Object.assign(globals, { UserAuthContext, zodValidateRequestOrThrow, validatePaymentRedirects });
const wrappers = await import('../server/utils/event-wrapped');
Object.assign(globals, wrappers);
const freeHandler = (await import('../server/api/payment/free')).default;
const cancelHandler = (await import('../server/api/order/cancel')).default;
const sitemapHandler = (await import('../server/routes/sitemap.xml.get')).default;
const robotsHandler = (await import('../server/routes/robots.txt.get')).default;
const adsTxtHandler = (await import('../server/routes/ads.txt.get')).default;
const event = () => ({ context: { userAuth: { id: 7, publicId: 'u', email: 'test@example.com' } }, query: {
  order_id: 'order', success_url: 'https://3d2ds.com/payment?status=success', cancel_url: 'https://3d2ds.com/payment?status=cancel', error_url: 'https://3d2ds.com/payment?status=error',
} }) as any;

test('response wrapper preserves H3 404 errors', async () => {
  const request = event();
  const handler = wrappers.defineWrappedResponseHandler(() => { throw createError({ statusCode: 404, message: 'Not found' }); });
  const result = await handler(request) as any;
  assert.equal(request.status, 404);
  assert.equal(result.statusCode, 404);
});
test('free payment requires authentication', async () => {
  const request = event(); request.context.userAuth = undefined;
  await assert.rejects(freeHandler(request), { statusCode: 401 });
});
test('free payment does not access another user order', async () => {
  let args: any;
  setDatabase({ order: { findFirst: async (value: any) => { args = value; return null; } } });
  const request = event();
  await freeHandler(request);
  assert.equal(request.status, 404);
  assert.equal(args.where.orderByUserId, 7);
});
test('free payment rejects paid-price or cancelled orders', async () => {
  for (const order of [{ amount: 1, status: 'PENDING' }, { amount: 0, status: 'CANCELLED' }]) {
    setDatabase({ order: { findFirst: async () => order } });
    const request = event(); await freeHandler(request);
    assert.equal(request.status, order.amount ? 400 : 409);
  }
});
test('free payment idempotently returns existing completed order', async () => {
  setDatabase({ order: { findFirst: async () => ({ amount: 0, status: 'DELIVERED' }) } });
  assert.deepEqual(await freeHandler(event()), { location: 'https://3d2ds.com/payment?status=success' });
});
test('payment rejects external and non-HTTP redirects', () => {
  for (const value of ['https://attacker.example/', 'javascript:alert(1)', 'https://user:pass@3d2ds.com/']) {
    assert.throws(() => validatePaymentRedirects(event(), [value]), { statusCode: 400 });
  }
});
test('cancel rejects another user order and allows the owner', async () => {
  let cancelled = false;
  setDatabase({ order: { findUniqueOrThrow: async () => ({ id: 2n, orderByUserId: 8 }), updateMany: async () => { cancelled = true; return { count: 1 }; } } });
  const request = event(); request.body = { publicId: 'order' };
  await cancelHandler(request);
  assert.equal(request.status, 404);
  assert.equal(cancelled, false);
  request.context.userAuth.id = 8;
  await cancelHandler(request);
  assert.equal(request.status, 204);
  assert.equal(cancelled, true);
});
test('sitemap includes active products only and safely encodes aliases', async () => {
  let args: any;
  setDatabase({ product: { findMany: async (value: any) => { args = value; return [{ alias: 'chair&sofa', updatedAt: new Date('2026-10-06T00:00:00Z') }]; } } });
  const request = event(); const xml = await sitemapHandler(request);
  assert.equal(args.where.status, 'ACTIVE');
  assert.match(xml, /https:\/\/3d2ds.com\/model\/chair%26sofa/);
  assert.match(xml, /<lastmod>2026-10-06T00:00:00.000Z<\/lastmod>/);
  assert.equal(request.headers['Content-Type'], 'application/xml; charset=utf-8');
});
test('robots exposes canonical sitemap and excludes account routes', async () => {
  const robots = await robotsHandler(event());
  assert.match(robots, /Sitemap: https:\/\/3d2ds.com\/sitemap.xml/);
  assert.match(robots, /Disallow: \/payment/);
});
test('ads.txt requires a real configured publisher ID', async () => {
  (config.public as any).adsenseClientId = '';
  assert.throws(() => adsTxtHandler(event()), { statusCode: 404 });
  (config.public as any).adsenseClientId = 'ca-pub-1234567890123456';
  assert.equal(await adsTxtHandler(event()), 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
});

const ipnHandler = (await import('../server/api/payment/sepay/ipn.post')).default;
function ipnEvent() {
  return { ...event(), body: {
    notification_type: 'ORDER_PAID',
    order: { order_status: 'CAPTURED', order_currency: 'VND', order_invoice_number: 'order', order_description: 'Test' },
    transaction: { transaction_id: 'txn', payment_method: 'BANK_TRANSFER', transaction_type: 'PAYMENT', transaction_status: 'APPROVED', transaction_amount: '250000', transaction_currency: 'VND' },
  } };
}
globals.$fetch = async (_url: string, options: any) => {
  options.onResponse({ response: { ok: true, _data: { result: 'success', base_code: 'USD', time_last_update_unix: 1, rates: { USD: 1, VND: 25000 } } } });
};
test('duplicate simultaneous IPN callbacks record one payment and one delivery', async () => {
  let status = 'PENDING'; let payments = 0; let deliveries = 0;
  const original = OrderService.sendProduct;
  OrderService.sendProduct = async () => { deliveries++; };
  const tx = {
    order: { updateMany: async (args: any) => {
      if (status !== args.where.status) return { count: 0 };
      status = args.data.status; return { count: 1 };
    } },
    payment: { create: async (args: any) => { assert.equal(args.data.transactionId, 'txn'); payments++; } },
  };
  setDatabase({ order: { findFirstOrThrow: async () => ({ id: 1n, publicId: 'order', currency: 'USD', amount: 10, status }) }, $transaction: async (fn: any) => fn(tx) });
  try {
    await Promise.all([ipnHandler(ipnEvent()), ipnHandler(ipnEvent())]);
    assert.equal(payments, 1); assert.equal(deliveries, 1); assert.equal(status, 'PAID');
  } finally { OrderService.sendProduct = original; }
});
test('IPN persistence failure returns an error instead of a success acknowledgement', async () => {
  setDatabase({ order: { findFirstOrThrow: async () => ({ id: 1n, publicId: 'order', currency: 'USD', amount: 10, status: 'PENDING' }) }, $transaction: async () => { throw new Error('Database unavailable'); } });
  const request = ipnEvent(); const response = await ipnHandler(request) as any;
  assert.equal(request.status, 500); assert.equal(response.error, true);
});
test('declined IPN transaction never records a payment', async () => {
  setDatabase({ order: { findFirstOrThrow: async () => ({ id: 1n, publicId: 'order', currency: 'USD', amount: 10, status: 'PENDING' }) }, $transaction: () => assert.fail('declined transaction must not persist') });
  const request = ipnEvent(); request.body.transaction.transaction_status = 'DECLINED';
  await ipnHandler(request);
});
test('historical order displays purchased price, even after catalogue price changes', async () => {
  setDatabase({ order: { findUniqueOrThrow: async () => ({ publicId: 'order', status: 'PAID', amount: 10, orderAt: new Date(), items: [{ price: 10, product: { name: 'Chair', price: 99 } }] }) } });
  const response = await OrderService.getWithProducts('order');
  assert.equal(response.products[0]?.price, 10);
});

test('monthly revenue counts each paid order once while counting all cart products', async () => {
  const { readFileSync } = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const source = readFileSync(new URL('../server/api/summary/index.ts', import.meta.url), 'utf8');
  const sql = source.slice(source.indexOf('SELECT\n'), source.indexOf('\n`;'));
  // SQLite executes the aggregation against fixture rows; adapt only PostgreSQL date/cast syntax.
  const portableSql = sql.replace(/EXTRACT\(YEAR FROM o.order_at\)::int/g, "CAST(strftime('%Y', o.order_at) AS INTEGER)").replace(/EXTRACT\(MONTH FROM o.order_at\)::int/g, "CAST(strftime('%m', o.order_at) AS INTEGER)").replace(/::bigint/g, '');
  const result = spawnSync('python3', ['-c', `
import sqlite3, json, sys
connection = sqlite3.connect(':memory:')
connection.executescript('''
CREATE TABLE "order" (id INTEGER, order_at TEXT, order_by_user_id INTEGER, amount REAL, status TEXT);
CREATE TABLE cart (id INTEGER, order_id INTEGER);
INSERT INTO "order" VALUES (1, '2026-10-06', 7, 10, 'PAID'), (2, '2026-10-06', 8, 5, 'DELIVERED'), (3, '2026-10-06', 9, 100, 'PENDING');
INSERT INTO cart VALUES (1, 1), (2, 1), (3, 2), (4, 3);
''')
print(json.dumps(connection.execute(sys.stdin.read()).fetchall()))
`], { input: portableSql, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [[2026, 10, 2, 2, 3, 15]]);
});
