const fs = require('fs'), vm = require('vm');
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, console };
ctx.window = ctx; vm.createContext(ctx);
['store', 'music', 'songs', 'curriculum'].forEach(f => vm.runInContext(fs.readFileSync('js/' + f + '.js', 'utf8'), ctx));
const AX = ctx.AX; let bad = 0;
const sp = (s) => s.trim().split(/\s+/);
AX.songs.list.forEach(s => {
  const lyrN = s.notes.filter(n => n.lyr).length;
  const lineSum = s.lines.reduce((a, b) => a + b, 0);
  const noF = s.notes.filter(n => !n.f).length;
  const white = !AX.music.isBlack(s.to) && !AX.music.isBlack(s.from);
  const inRange = s.notes.every(n => n.m >= s.from && n.m <= s.to);
  console.log(s.id.padEnd(10), 'notes', s.notes.length, 'lyr', lyrN, 'lines', lineSum, 'nofinger', noF, 'range', s.from, s.to, white && inRange ? 'ok' : 'BAD RANGE');
  if (lyrN !== s.notes.length && s.id.indexOf('-lh') < 0 || lineSum !== s.notes.length || noF || !white || !inRange) { bad++; console.log('  ^^ PROBLEM'); }
});
AX.lessons.forEach(l => l.steps.forEach(st => { if (st.type === 'song' && !AX.songs.byId[st.songId]) { bad++; console.log('missing song', st.songId); } }));
const ids = []; AX.lessons.forEach(l => l.steps.forEach(st => ids.push(st.id)));
if (new Set(ids).size !== ids.length) { bad++; console.log('dup step ids'); }
console.log(bad ? 'PROBLEMS: ' + bad : 'ALL GOOD', ids.length, 'steps');
