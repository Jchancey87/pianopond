/* Deterministic recording/storage boundary tests. Run: node deploy/composer-tests.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let clock = 0, disk = null, full = false;
const ctx = { console, performance: { now: () => clock }, localStorage: {
  getItem: () => disk,
  setItem: (key, value) => { if (full) throw new Error('Storage unavailable'); disk = value; }
} };
ctx.window = ctx; vm.createContext(ctx);
for (const file of ['store', 'composer']) vm.runInContext(fs.readFileSync(`js/${file}.js`, 'utf8'), ctx);
const S = ctx.AX.store, C = ctx.AX.composer;
const copy = value => JSON.parse(JSON.stringify(value));

const recording = C.recorder();
clock = 800; recording.on(60, { id: 'finger:1', vel: 0.4 });
clock = 850; recording.on(64, { id: 'finger:2', vel: 0.9 });
clock = 950; recording.off('finger:1');
clock = 1250;
assert.deepEqual(copy(recording.finish()), [
  { m: 60, t: 0, d: 150, vel: 0.4 },
  { m: 64, t: 50, d: 400, vel: 0.9 }
]);
console.log('PASS lead-in trimming, overlap, note release and held-note finish');

const bounded = C.recorder();
clock += 119990; bounded.on(67, { id: 'last' });
clock += 10000;
assert.equal(bounded.on(69, { id: 'too-late' }), false);
assert.equal(bounded.elapsed(), 120000);
assert.equal(bounded.finish()[0].d, 30);
const crowded = C.recorder();
for (let i = 0; i < 1500; i++) assert.equal(crowded.on(60, { id: 'same' }), true);
assert.equal(crowded.on(60, { id: 'extra' }), false);
console.log('PASS duration and note-count limits');

const old = copy(S.get()); delete old.compositions;
old.steps['L1-learn'] = 3; old.pearls = 24;
S.importJSON(JSON.stringify(old));
assert.equal(S.get().compositions.length, 0);
assert.equal(S.get().pearls, 24);
const song = { id: 'test', title: 'My song', created: 1, notes: copy(recording.finish()) };
S.saveComposition(song);
song.notes[0].d = 999;
assert.equal(S.get().compositions[0].notes[0].d, 150);
assert.throws(() => S.saveComposition(song), /already saved/);
const backup = S.exportJSON();
full = true;
assert.throws(() => S.deleteComposition('test'));
assert.equal(S.exportJSON(), backup);
full = false;
for (const change of [s => { s.compositions[0].notes[0].vel = 2; }, s => { s.compositions[0].notes[0].m = 128; }, s => { s.compositions[0].notes[0].t = -1; }, s => { s.compositions.push(s.compositions[0]); }]) {
  const invalid = JSON.parse(backup); change(invalid);
  assert.throws(() => S.importJSON(JSON.stringify(invalid)));
  assert.equal(S.exportJSON(), backup);
}
S.deleteComposition('test'); S.importJSON(backup);
assert.equal(S.get().compositions[0].title, 'My song');
assert.equal(S.get().steps['L1-learn'], 3);
assert.equal(S.get().pearls, 24);
console.log('PASS legacy backups, defensive copies, atomic writes and validated restore');
console.log('ALL COMPOSER CHECKS PASSED');
