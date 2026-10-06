import assert from 'node:assert/strict';
const base = process.env.SMOKE_ORIGIN || 'http://127.0.0.1:4013';
const robots = await fetch(`${base}/robots.txt`);
assert.equal(robots.status, 200);
assert.match(await robots.text(), /Sitemap: https:\/\/3d2ds.com\/sitemap.xml/);
const ads = await fetch(`${base}/ads.txt`);
assert.equal(ads.status, 200);
assert.equal(await ads.text(), 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
for (const [path, method] of [['/console', 'GET'], ['/api/shopping/cart/data/count', 'GET'], ['/api/order/cancel', 'POST'], ['/api/payment/free', 'GET'], ['/api/payment/sepay/bank', 'GET'], ['/api/product/file/design/test', 'GET']]) {
 const response = await fetch(`${base}${path}`, { method });
 assert.equal(response.status, 401, `${path} must require auth`);
 console.log(`PASS ${method} ${path}: 401`);
}
console.log('PASS robots.txt, ads.txt from production Nitro build');
