import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:4012';
const debuggerOrigin = process.env.CHROME_DEBUG_ORIGIN || 'http://127.0.0.1:9229';
const targets = await (await fetch(`${debuggerOrigin}/json`)).json();
const target = targets.find(target => target.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.id) {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    data.error ? request.reject(new Error(JSON.stringify(data.error))) : request.resolve(data.result);
  }
  if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text + ' ' + data.params.exceptionDetails.exception?.description);
});
function call(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function until(expression, timeout = 45000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out: ${expression}; body=${await evaluate('document.body.innerText.slice(0,1200)')}`);
}
await call('Page.enable');
await call('Runtime.enable');
await mkdir('/tmp/htl-browser-artifacts', { recursive: true });
const results = [];
try {
  for (const width of [360, 768, 1280, 1920]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    for (const [path, count] of [['/', 3], ['/model/fixture-60', 1], ['/model/fixture-1', 1], ['/model/fixture-0', 1]]) {
      await call('Page.navigate', { url: `${origin}${path}` });
      await until(`document.querySelectorAll('.product-gallery').length === ${count} && !!document.querySelector('.product-gallery [role="region"]') === ${path.endsWith('-0') ? 'false' : 'true'}`);
      await until(`document.querySelector('.product-gallery img')?.complete || ${path.endsWith('-0')}`);
      await new Promise(resolve => setTimeout(resolve, 800));
      const metrics = await evaluate(`JSON.stringify({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,galleries:[...document.querySelectorAll('.product-gallery')].map(el=>({width:el.clientWidth,scroll:el.scrollWidth})),thumbnails:document.querySelector('.product-thumbnails') ? {width:document.querySelector('.product-thumbnails').clientWidth,scroll:document.querySelector('.product-thumbnails').scrollWidth}:null})`);
      const value = JSON.parse(metrics);
      assert.ok(value.scroll <= value.width + 1, `${width} ${path} horizontal overflow: ${metrics}`);
      for (const gallery of value.galleries) assert.ok(gallery.scroll <= gallery.width + 1, `gallery overflow ${metrics}`);
      if (path.endsWith('-60')) {
        assert.ok(value.thumbnails.scroll > value.thumbnails.width, '60 thumbnails must have their own scroll area');
        await evaluate(`document.querySelectorAll('.product-thumbnails button')[59].click()`);
        await until(`document.querySelectorAll('.product-thumbnails button')[59]?.getAttribute('aria-pressed') === 'true'`);
        await until(`document.querySelector('.product-thumbnails').scrollLeft > 0`);
        await until(`Math.abs(document.querySelectorAll('.product-gallery [role=region] img')[59].getBoundingClientRect().left - document.querySelector('.product-gallery [role=region]').firstElementChild.getBoundingClientRect().left) < 1`);
        assert.equal(await evaluate(`document.querySelectorAll('.product-thumbnails button[aria-pressed="true"]').length`), 1);
      }
      if (path === '/') {
        await evaluate(`document.querySelectorAll('.product-gallery')[1].querySelector('button[aria-label="Next"]').click()`);
        await until(`document.querySelectorAll('.product-gallery')[1].innerText.includes('2 / 60')`);
        await until(`Math.abs(document.querySelectorAll('.product-gallery')[1].querySelectorAll('[role=region] img')[1].getBoundingClientRect().left - document.querySelectorAll('.product-gallery')[1].querySelector('[role=region]').firstElementChild.getBoundingClientRect().left) < 1`);
      }
      await new Promise(resolve => setTimeout(resolve, 600));
      results.push({ width, path, ...value });
      if (path.endsWith('-60') || path === '/') {
        const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        await writeFile(`/tmp/htl-browser-artifacts/${width}-${path === '/' ? 'index' : 'detail'}.png`, Buffer.from(screenshot.data, 'base64'));
      }
    }
  }
  await call('Page.navigate', { url: origin });
  await until("document.querySelectorAll('.product-gallery').length === 3");
  await until("document.querySelectorAll('.product-gallery')[1]?.querySelector('button[aria-label=\"Next\"]')?.disabled === false");
  await evaluate("document.querySelector('a[href=\"/model/fixture-60\"]').click()");
  await until("document.querySelectorAll('.product-thumbnails button').length === 60");
  assert.equal(await evaluate("document.querySelector('link[rel=canonical]').href"), 'https://3d2ds.com/model/fixture-60');
  await until("document.querySelector('.product-gallery button[aria-label=\"Next\"]')?.disabled === false");
  await evaluate("[...document.querySelectorAll('button')].find(el => el.textContent.trim() === 'Home').click()");
  await until("document.querySelectorAll('.product-gallery').length === 3");
  const html = await (await fetch(`${origin}/model/fixture-60`)).text();
  assert.match(html, /rel="canonical" href="https:\/\/3d2ds.com\/model\/fixture-60"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /property="og:image" content="https:\/\/3d2ds.com\/images\/logo.jpg\?preview=0"/);
  assert.equal((await fetch(`${origin}/model/missing`)).status, 404);
  assert.deepEqual(errors, [], `Browser exceptions: ${JSON.stringify(errors)}`);
  await writeFile('/tmp/htl-browser-artifacts/results.json', JSON.stringify(results, null, 2));
  console.log(`PASS: ${results.length} viewport/page checks, thumbnail navigation, card carousel, SPA navigation, canonical/OG/JSON-LD SSR, 404; no browser exceptions.`);
} finally { ws.close(); }
