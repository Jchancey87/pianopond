/* Real Chromium smoke tests, with Node's built-in WebSocket; no npm dependencies.
   Run from the repository root: node deploy/ui-smoke.cjs
   Set CHROME_PATH if Chrome is installed somewhere else. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
let browser, socket;
const errors = [], pending = new Map();
let sequence = 0;
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 15000);
    pending.set(id, { resolve: r => { clearTimeout(timeout); resolve(r); }, reject: e => { clearTimeout(timeout); reject(e); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression) {
  for (let i = 0; i < 60; i++) { if (await evaluate(expression)) return; await wait(100); }
  throw new Error('Condition timed out: ' + expression);
}
async function click(selector) {
  await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el || el.disabled) throw new Error('Missing or disabled: ' + ${JSON.stringify(selector)}); el.click(); })()`);
}
async function go(name, params = {}) { await evaluate(`AX.app.go(${JSON.stringify(name)}, ${JSON.stringify(params)})`); }
async function screenshot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(os.tmpdir(), 'axie-' + name + '.png'), Buffer.from(data, 'base64'));
}
async function check(name, fn) { await fn(); console.log('PASS ' + name); }

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'axie-ui-'));
  browser = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Chrome did not start')), 15000);
    browser.on('error', reject);
    browser.stderr.on('data', data => {
      output += data;
      const match = output.match(/DevTools listening on ws:\/\/([^/]+)/);
      if (match) { clearTimeout(timeout); resolve('http://' + match[1]); }
    });
  });
  const targets = await (await fetch(endpoint + '/json/list')).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  socket.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    const task = pending.get(msg.id);
    if (task) { pending.delete(msg.id); msg.error ? task.reject(new Error(msg.error.message)) : task.resolve(msg.result); }
  });
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1180, height: 820, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await until('!!window.AX?.app && !!navigator.serviceWorker.controller');
  await wait(500);
  await until('!!window.AX?.app');

  await check('Welcome, focus containment, and literal profile names', async () => {
    assert.equal(await evaluate('document.querySelector(".modal").getAttribute("role")'), 'dialog');
    assert.equal(await evaluate('document.querySelector("#app").inert'), true);
    await evaluate('document.querySelector("#n1").value = \'Ayana <b>Star</b>\'');
    await click('.modal .primary');
    assert.equal(await evaluate('document.querySelector("#app").inert'), false);
    assert.ok(await evaluate('document.querySelector(".axie-bubble").textContent.includes("<b>Star</b>")'));
    await evaluate('AX.store.get().name = "Ayana"; AX.store.save(); AX.app.go("home")');
    await screenshot('home');
    await go('divePlan');
    assert.equal(await evaluate('document.querySelectorAll(".dive-choices .card").length'), 2);
    await screenshot('dive');
    await go('home');
  });
  await check('Resume opens the next lesson activity; slides can go backward', async () => {
    await click('[data-go="resume"]');
    assert.equal(await evaluate('document.body.dataset.screen'), 'step');
    await click('.next'); await click('.previous');
    assert.match(await evaluate('document.querySelector(".learn-card h2").textContent'), /Two & Three/);
    await click('.next'); await click('.next'); await click('.next');
    assert.match(await evaluate('document.querySelector(".results").textContent'), /Up next/);
    await click('.results .primary');
    assert.equal(await evaluate('document.querySelector("#title").textContent'), 'Target Practice: Find all the Cs');
  });
  await check('Activity count cannot claim a dive; short dive resumes and earns completion', async () => {
    await evaluate('AX.store.get().log[AX.store.dayKey()] = { acts: 3, secs: 0 }; AX.app.go("home")');
    assert.doesNotMatch(await evaluate('document.querySelector(".tile.dive").textContent'), /Dive complete/);
    await click('[data-go="dive"]');
    assert.equal(await evaluate('document.querySelectorAll(".dive-choices .card").length'), 1);
    await click('[data-dive="0"]');
    await evaluate('document.querySelectorAll(".check").forEach(b => b.click())');
    await click('.done'); await click('.results .primary');
    await go('home');
    assert.match(await evaluate('document.querySelector(".tile.dive").textContent'), /Continue your Dive/);
    await click('[data-go="dive"]');
    assert.match(await evaluate('document.querySelector(".dive-strip").textContent'), /Activity 2 of 3/);
    for (let activity = 0; activity < 2; activity++) {
      for (let round = 0; round < 20; round++) {
        if (await evaluate('document.querySelector("#overlay").classList.contains("open")')) break;
        await evaluate(`(() => {
          const target = document.querySelector('.big-letter').textContent;
          const midi = AX.music.parse(target + '4');
          const key = document.querySelector('[data-midi="' + midi + '"]');
          key.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
          key.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
        })()`);
        await wait(850);
      }
      await click('.results .primary');
    }
    assert.equal(await evaluate('document.body.dataset.screen'), 'diveDone');
    assert.equal(await evaluate('AX.store.todayInfo().dives'), 1);
    const pearls = await evaluate('AX.store.get().pearls');
    await go('diveDone');
    assert.equal(await evaluate('AX.store.get().pearls'), pearls);
    assert.match(await evaluate('document.querySelector(".tile.dive").textContent'), /Dive complete/);
  });
  await check('Song pause, hint, progress, restart, tempo changes and late callbacks', async () => {
    await go('song', { songId: 'hcb' });
    await click('[data-mode="play"]'); await click('.go');
    await click('[data-act="hint"]');
    assert.equal(await evaluate('document.querySelector(".song-progress progress").value'), 0);
    await evaluate('AX.input.active.onNote(64, "touch")');
    await click('[data-act="pause"]');
    const seconds = await evaluate('AX.store.todayInfo().secs');
    await wait(1100);
    assert.equal(await evaluate('AX.store.todayInfo().secs'), seconds);
    await evaluate('AX.input.active.onNote(62, "touch")');
    assert.equal(await evaluate('document.querySelector(".song-progress progress").value'), 1);
    await click('[data-act="pause"]');
    await evaluate('AX.input.active.onNote(62, "touch")');
    assert.equal(await evaluate('document.querySelector(".song-progress progress").value'), 2);
    await screenshot('song');
    await click('[data-act="restart"]');
    assert.equal(await evaluate('document.querySelector(".song-progress progress").value'), 0);
    await click('[data-mode="listen"]'); await click('.go');
    await wait(350); await click('[data-speed="0.6"]'); await click('[data-act="pause"]');
    const count = await evaluate('document.querySelector(".song-progress progress").value');
    await wait(300);
    assert.equal(await evaluate('document.querySelector(".song-progress progress").value'), count);
    await click('[data-mode="play"]'); await click('.go');
    await evaluate('AX.songs.byId.hcb.notes.forEach(n => AX.input.active.onNote(n.m, "touch")); AX.app.go("home")');
    await wait(650);
    assert.equal(await evaluate('document.querySelector("#overlay").classList.contains("open")'), false);
    await go('song', { songId: 'hcb' }); await click('[data-mode="play"]'); await click('.go');
    await evaluate('AX.songs.byId.hcb.notes.forEach(n => AX.input.active.onNote(n.m, "touch"))');
    await wait(650);
    assert.equal(await evaluate('AX.store.get().songs.hcb.best'), 3);
  });
  await check('All lesson activity types and every song can open', async () => {
    const steps = await evaluate('AX.lessons.flatMap(l => l.steps.map(s => ({ lessonId: l.id, stepId: s.id, type: s.type })))');
    const seen = new Set();
    for (const step of steps) {
      if (seen.has(step.type)) continue;
      seen.add(step.type);
      await go('step', { ...step, back: { name: 'home' } });
      assert.ok(await evaluate('document.querySelector("#screen").children.length > 0'));
    }
    const songs = await evaluate('AX.songs.list.map(s => s.id)');
    for (const songId of songs) await go('song', { songId });
    for (const name of ['map', 'songbook', 'closet', 'stickers', 'parent']) await go(name);
  });
  await check('Free Play story prompts and safe recording controls', async () => {
    await go('freeplay');
    const title = await evaluate('document.querySelector(".story-title").textContent');
    await click('#story-next');
    assert.notEqual(await evaluate('document.querySelector(".story-title").textContent'), title);
    await click('#rec'); await evaluate('AX.input.active.onNote(60, "touch")'); await click('#rec');
    assert.equal(await evaluate('document.querySelector("#play").disabled'), false);
    await click('#rec');
    assert.equal(await evaluate('document.querySelector("#play").disabled'), true);
    await click('#rec'); await screenshot('freeplay');
  });
  await check('Tablet and phone layouts fit horizontally', async () => {
    for (const [width, height] of [[768, 1024], [390, 844]]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      for (const name of ['home', 'divePlan', 'freeplay', 'parent', 'song']) {
        await go(name, name === 'song' ? { songId: 'hcb' } : {});
        const overflow = await evaluate('document.querySelector("#screen").scrollWidth - document.querySelector("#screen").clientWidth');
        assert.ok(overflow <= 2, name + ' overflow at ' + width + ': ' + overflow);
        if (width === 390 && name === 'song') await screenshot('phone-song');
      }
    }
  });
  await check('Updated assets work after an offline reload', async () => {
    await evaluate('AX.store.save()');
    await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await send('Page.reload'); await wait(500); await until('!!window.AX?.app');
    assert.ok(await evaluate('!!document.querySelector(".home-banner progress")'));
    await go('freeplay');
    assert.ok(await evaluate('!!document.querySelector(".story-card")'));
  });
  assert.deepEqual(errors, [], 'Browser exceptions');
  console.log('ALL BROWSER CHECKS PASSED. Screenshots: ' + path.join(os.tmpdir(), 'axie-*.png'));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (socket?.readyState === WebSocket.OPEN) { try { await send('Browser.close'); } catch {} socket.close(); }
  if (browser) browser.kill();
  server.close();
});
