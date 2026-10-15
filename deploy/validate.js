const fs = require('fs'), vm = require('vm');
const ctx = { window: {}, localStorage: { getItem() { return null; }, setItem() {} }, console };
ctx.window = ctx; vm.createContext(ctx);
['store', 'music', 'songs', 'curriculum', 'staff'].forEach(f => vm.runInContext(fs.readFileSync('js/' + f + '.js', 'utf8'), ctx));
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
// F# carries within a measure, a return to F needs a natural, and the next
// measure must explicitly spell F# again (these scores have no key signature).
const accidentalScore = AX.staff.renderSongScore({ hand: 'R', timeSig: [4, 4], notes: [66, 66, 65, 65, 66].map(m => ({ m, beats: 1 })) }, -1).html;
const accidentalSigns = [...accidentalScore.matchAll(/class="score-accidental"[^>]*>([^<]+)/g)].map(m => m[1]).join('');
if (accidentalSigns !== '♯♮♯') { bad++; console.log('incorrect accidental carry/cancellation:', accidentalSigns); }
console.log(bad ? 'PROBLEMS: ' + bad : 'ALL GOOD', ids.length, 'steps');
process.exitCode = bad ? 1 : 0;
