import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createAppServer } from '../server.js';

test('serve the application, modules and health endpoint with safe routing', async t => {
  const server = createAppServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}`;
  const health = await fetch(`${base}/health`);
  assert.deepEqual(await health.json(), { status: 'ok' });
  const index = await fetch(base);
  assert.equal(index.status, 200);
  assert.match(index.headers.get('content-type'), /text\/html/);
  assert.match(await index.text(), /我的任务/);
  for (const path of ['/app.js', '/tasks.js', '/styles.css']) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).length > 0);
  }
  assert.match(index.headers.get('content-security-policy'), /script-src 'self'/);
  assert.equal((await fetch(`${base}/package.json`)).status, 404);
  assert.equal((await fetch(`${base}/.git/config`)).status, 404);
  assert.equal((await fetch(`${base}/%2e%2e/server.js`)).status, 404);
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  const head = await fetch(base, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});
