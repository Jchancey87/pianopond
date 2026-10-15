/* Song player: Listen -> Sing -> Play, with dual display:
   1. Authentic Sheet Music Score view (real measures, clefs, note values, stems, lyrics, and glowing active note)
   2. Gamified falling-notes Highway view
   "Play" is wait-mode: the score/highway waits for her to find each note, encouraging calm accuracy. */
window.AX = window.AX || {};
AX.SongPlayer = function (root, song, opts) {
  opts = opts || {};
  const M = AX.music, S = AX.store.get().settings;
  let mode = opts.perform ? 'play' : (opts.mode || 'listen');
  let viewMode = S.viewMode || 'sheet'; // 'sheet' or 'highway'
  let speed = 1, lyrMode = S.lyrics || 'words', showFingers = opts.perform ? false : S.fingers !== false;
  let running = false, raf = 0, dead = false, idx = 0, mistakes = 0, wrong = 0, nextIdx = 0, t0 = 0, scroll = -4, curTok = -1, lastBeat = -99, countText = '', done = false;
  const notes = song.notes, n = notes.length;
  const beatsPerBar = (song.timeSig || [4, 4])[0];
  let paused = false, pausedAt = 0;
  let hintUntil = 0;
  const timers = new Set();
  function later(fn, ms) {
    const timer = setTimeout(() => { timers.delete(timer); if (!dead) fn(); }, ms);
    timers.add(timer);
  }
  function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }

  root.innerHTML = `<div class="activity song">
    <div class="sp-bar">
      <div class="seg modes"><button data-mode="listen">👂 Listen</button><button data-mode="sing">🎤 Sing</button><button data-mode="play">🎹 Play</button></div>
      <details class="practice-tools" ${window.matchMedia('(min-width: 761px)').matches ? 'open' : ''}><summary>⚙️ Practice tools</summary><div class="practice-options">
      <div class="seg view-modes"><button data-view="sheet">🎼 Sheet Music</button><button data-view="highway">🎹 Highway</button></div>
      <div class="seg speed"><button data-speed="0.6" title="Practice tempo">🐢 Slow</button><button data-speed="0.8" title="Moderate">🐟 Med</button><button data-speed="1" title="Performance tempo">🐬 Normal</button></div>
      <div class="seg lyr"><button data-lyr="words">Words</button><button data-lyr="solfege">Do Re Mi</button><button data-lyr="names">A B C</button></div>
      <button class="chip" data-act="fingers"></button>
      <button class="chip" data-act="mic">🎤 Real piano</button>
      </div></details>
    </div>
    <div class="sp-transport"><button class="chip" data-act="pause" disabled>⏸ Pause</button><button class="chip" data-act="restart">↻ Start over</button><button class="chip" data-act="hint" hidden>👂 Hear this note</button><label class="song-progress"><span></span><progress max="${n}" value="0" aria-label="Song progress"></progress></label></div>
    <div class="sp-lyrics"></div>
    <div class="sp-stage">
      <div class="sp-sheet"><div class="score-container"></div></div>
      <div class="sp-hw"><canvas></canvas></div>
      <div class="sp-count"></div>
      <button class="btn primary big go">▶ Let's go!</button>
    </div>
    <div class="sp-piano"></div></div>`;

  const $ = (s) => root.querySelector(s);
  const canvas = $('canvas'), g = canvas.getContext('2d'), goBtn = $('.go'), lyricsEl = $('.sp-lyrics'), countEl = $('.sp-count');
  const sheetWrap = $('.sp-sheet'), scoreBox = $('.score-container'), hwWrap = $('.sp-hw');
  const piano = new AX.Piano($('.sp-piano'), { from: song.from, to: song.to, labels: 'c' });
  const beatSec = () => 60 / (song.tempo * speed);

  /* ---- lyrics bar ---- */
  const tokText = (nt) => (lyrMode === 'solfege' ? M.solfege(nt.m) : lyrMode === 'names' || !nt.lyr ? M.name(nt.m) : nt.lyr);
  let shownLine = -1;
  function renderLyrics(force) {
    const cur = Math.max(0, Math.min(n - 1, curTok < 0 ? 0 : curTok)); const li = notes[cur].line;
    if (li !== shownLine || force) {
      shownLine = li; let h = '';
      [li, li + 1].forEach((L, k) => {
        if (L >= song.lines.length) return;
        h += `<div class="ly ${k ? 'next' : 'now'}">` + notes.filter(x => x.line === L).map(x => `<span class="tok" data-i="${x.idx}">${tokText(x)}</span>`).join(' ') + '</div>';
      });
      lyricsEl.innerHTML = h;
    }
    lyricsEl.querySelectorAll('.tok').forEach(t => { const i = +t.dataset.i; t.classList.toggle('on', i === curTok); t.classList.toggle('past', i < curTok); });
  }

  /* ---- sheet music score rendering ---- */
  function updateScore() {
    if (viewMode !== 'sheet') return;
    const activeIndex = mode === 'play' ? idx : curTok;
    const rendered = AX.staff.renderSongScore(song, activeIndex, { showFingers, lyrMode });
    scoreBox.innerHTML = rendered.html;
    // Auto-scroll score smoothly so active note is centered
    if (rendered.activeX > 0) {
      const containerW = sheetWrap.clientWidth;
      const svg = scoreBox.querySelector('svg');
      const scale = svg ? svg.getBoundingClientRect().width / rendered.totalWidth : 1;
      const targetScroll = Math.max(0, rendered.activeX * scale - containerW * 0.45);
      sheetWrap.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }

  /* ---- highway canvas rendering ---- */
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight, d = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * d) || canvas.height !== Math.round(h * d)) {
      canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
      g.setTransform(d, 0, 0, d, 0, 0);
    }
  }
  function rr(x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function drawHighway() {
    if (viewMode !== 'highway') return;
    resize();
    const W = canvas.clientWidth, H = canvas.clientHeight, ppb = H / 4.2, hitY = H - 10;
    g.clearRect(0, 0, W, H);
    // Piano key lanes
    piano.whites.forEach((m, i) => {
      if (i % 2 === 0) {
        g.fillStyle = 'rgba(255,255,255,.28)';
        const r = piano.keyRect(m);
        if (r) g.fillRect(r.x * W, 0, r.w * W, H);
      }
    });
    notes.forEach((nt, i) => {
      const r = piano.keyRect(nt.m); if (!r) return;
      const bottom = hitY - (nt.start - scroll) * ppb, h = Math.max(18, nt.beats * ppb - 8), top = bottom - h;
      if (bottom < -4 || top > H) return;
      const past = mode === 'play' ? i < idx : nt.start + nt.beats <= scroll;
      const active = mode === 'play' && i === idx;
      const x = r.x * W + 3, w = r.w * W - 6;
      g.globalAlpha = past ? 0.22 : 1;
      g.fillStyle = nt.f ? M.fingerColor(nt.f) : '#2bc4b4';
      if (active) { g.shadowColor = '#fff'; g.shadowBlur = 18; }
      rr(x, top, w, h, 10); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.stroke();
      if (showFingers && nt.f && w > 20) {
        g.fillStyle = '#fff';
        g.font = '900 ' + Math.min(26, w * 0.7) + 'px system-ui,sans-serif';
        g.textAlign = 'center';
        g.fillText(nt.f, x + w / 2, bottom - Math.min(12, h / 2 - 4));
      }
      g.globalAlpha = 1;
    });
    g.fillStyle = '#ff6b8b'; g.fillRect(0, hitY + 2, W, 4);
  }

  /* ---- player state & loop ---- */
  function stopAll() {
    running = false; paused = false; cancelAnimationFrame(raf); clearTimers(); done = false; piano.silence(); piano.clearMarks();
    AX.Axie.setMood('idle'); countEl.textContent = '';
  }
  function reset() {
    stopAll(); idx = 0; mistakes = 0; wrong = 0; nextIdx = 0; curTok = -1; scroll = mode === 'play' ? notes[0].start : -beatsPerBar; shownLine = -1;
    goBtn.style.display = ''; goBtn.textContent = mode === 'play' ? "▶ Let's play!" : "▶ Let's go!";
    renderLyrics(true); updateScore(); updateUI(); drawHighway();
    const t = {
      listen: `Listen closely to <b>${song.title}</b>! Follow the notes on the staff. 🎼`,
      sing: 'Warm up your voice! Sing the lyrics out loud as the notes play. 🎤',
      play: 'Your turn to play! Find the glowing note on the keys. Take your time! 🎹'
    }[mode];
    AX.Axie.say(song.tip ? t + '<br><small>' + song.tip + '</small>' : t);
    if (mode === 'play') markTarget();
  }
  function updateUI() {
    $('.activity.song').dataset.paused = String(paused);
    const count = mode === 'play' ? idx : nextIdx;
    $('.song-progress progress').value = count;
    $('.song-progress span').textContent = `${count} / ${n} notes`;
    $('[data-act="pause"]').disabled = !running && !paused;
    $('[data-act="pause"]').textContent = paused ? '▶ Continue' : '⏸ Pause';
    $('[data-act="pause"]').setAttribute('aria-pressed', String(paused));
    $('[data-act="hint"]').hidden = mode !== 'play';
    $('[data-act="hint"]').disabled = done;
    root.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
    root.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === viewMode));
    root.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('on', +b.dataset.speed === speed));
    root.querySelectorAll('[data-lyr]').forEach(b => b.classList.toggle('on', b.dataset.lyr === lyrMode));
    $('[data-act="fingers"]').textContent = '🖐 Finger #' + (showFingers ? ': ON' : ': OFF');
    $('[data-act="fingers"]').classList.toggle('on', showFingers);
    $('[data-act="mic"]').classList.toggle('on', AX.input.micOn);
    $('.speed').style.display = mode === 'play' ? 'none' : '';
    // Switch between sheet music view and highway canvas
    sheetWrap.style.display = viewMode === 'sheet' ? 'block' : 'none';
    hwWrap.style.display = viewMode === 'highway' ? 'block' : 'none';
  }
  function markTarget() {
    piano.clearMarks(); if (idx >= n) return; const t = notes[idx];
    piano.mark(t.m, { cls: 'target', finger: showFingers ? t.f : 0 });
    updateScore();
  }
  function start() {
    AX.audio.ensure(); goBtn.style.display = 'none';
    if (mode === 'play') {
      running = true; updateUI(); AX.Axie.say('Read the note on the staff and play it on the keys! ✨'); loop(); return;
    }
    running = true; nextIdx = 0; lastBeat = -99; t0 = performance.now(); updateUI(); loop();
  }
  function pause() {
    if (!running) return;
    paused = true; running = false; pausedAt = performance.now();
    cancelAnimationFrame(raf); clearTimers(); piano.silence();
    countEl.textContent = ''; AX.Axie.say('Take a breath. Your place is saved right here. 🫧'); updateUI();
  }
  function resume() {
    if (!paused) return;
    AX.audio.ensure(); t0 += performance.now() - pausedAt;
    paused = false; running = true;
    AX.Axie.say(mode === 'play' ? 'Ready when you are! Find the next glowing note. 🎹' : 'Let’s carry on from where we paused. 🎶');
    updateUI(); loop();
  }
  function loop() {
    if (dead || !running) return;
    if (mode === 'play') {
      scroll += ((idx < n ? notes[idx].start : notes[n - 1].start + notes[n - 1].beats) - scroll) * 0.18;
    } else if (running) {
      const b = (performance.now() - t0) / 1000 / beatSec() - beatsPerBar; scroll = b;
      const ib = Math.floor(b);
      if (ib !== lastBeat && ib < 0) {
        lastBeat = ib; AX.audio.sfx.click(ib === -beatsPerBar); countEl.textContent = String(ib + beatsPerBar + 1);
      }
      if (b >= 0) countEl.textContent = '';
      if (mode === 'sing' && ib >= 0 && ib !== lastBeat) {
        lastBeat = ib; AX.audio.sfx.click(ib % beatsPerBar === 0);
      }
      while (nextIdx < n && b >= notes[nextIdx].start) {
        const nt = notes[nextIdx];
        piano.mark(nt.m, { cls: 'target', finger: showFingers ? nt.f : 0 });
        piano.playNote(nt.m, { dur: nt.beats * beatSec() * 0.92, gain: mode === 'sing' ? 0.55 : 1 });
        later(() => piano.clearMarks(), Math.max(150, nt.beats * beatSec() * 900));
        curTok = nt.idx; renderLyrics(); updateScore(); AX.Axie.setMood('sing'); nextIdx++; updateUI();
      }
      if (b > notes[n - 1].start + notes[n - 1].beats + 0.3) { finishTimed(); }
    }
    drawHighway(); if (running) raf = requestAnimationFrame(loop);
  }
  function finishTimed() {
    running = false; AX.Axie.setMood('happy', 2500); AX.Axie.bounce(); piano.clearMarks();
    if (mode === 'sing') {
      AX.Axie.say('Great singing! 🎤✨ Now select <b>Play</b> to try it with your fingers!');
      AX.audio.sfx.chime(); if (opts.onSing) opts.onSing();
    } else {
      AX.Axie.say('Nice listening! Now tap <b>Sing</b> or <b>Play</b>! 🎶');
    }
    goBtn.style.display = ''; goBtn.textContent = '↻ Play Again';
    updateUI();
  }
  const hints = ['Check the sheet music and glowing key!', 'Take your time — accuracy builds speed. 🐢', 'Look at the staff line and finger number.', 'Almost there! Try the glowing key.'];
  piano.onNote = (m, src) => {
    if (mode !== 'play' || !running || done || dead) return;
    if (src === 'mic' && performance.now() < hintUntil) return;
    const t = notes[idx];
    const ok = src === 'mic' ? M.pc(m) === M.pc(t.m) : m === t.m;
    if (ok) {
      piano.flash(m, 'good', 350); wrong = 0; curTok = idx; idx++;
      renderLyrics(); updateScore(); AX.Axie.setMood('happy', 600);
      if (idx >= n) { running = false; done = true; cancelAnimationFrame(raf); later(finishPlay, 500); } else markTarget();
      updateUI();
    } else {
      mistakes++; wrong++; piano.flash(m, 'bad', 400);
      AX.Axie.say(wrong >= 2 ? `Look for note <b>${M.name(t.m)}</b> (Finger <b>${t.f}</b>)!` : hints[Math.floor(Math.random() * hints.length)]);
    }
  };
  function finishPlay() {
    if (dead || !done) return;
    const allow = Math.max(2, Math.round(n * 0.08));
    const stars = mistakes <= allow ? 3 : mistakes <= allow * 3 ? 2 : 1;
    piano.clearMarks(); goBtn.style.display = ''; goBtn.textContent = '↻ Play Again';
    if (opts.onDone) opts.onDone(stars, { mistakes });
  }

  /* ---- wiring ---- */
  root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; reset(); }));
  root.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
    viewMode = b.dataset.view; S.viewMode = viewMode; AX.store.save(); updateUI(); updateScore(); drawHighway();
  }));
  root.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => {
    const now = paused ? pausedAt : performance.now();
    const elapsedBeats = (now - t0) / 1000 / beatSec();
    speed = +b.dataset.speed;
    if (running || paused) t0 = now - elapsedBeats * beatSec() * 1000;
    updateUI();
  }));
  root.querySelectorAll('[data-lyr]').forEach(b => b.addEventListener('click', () => { lyrMode = b.dataset.lyr; S.lyrics = lyrMode; AX.store.save(); shownLine = -1; renderLyrics(true); updateScore(); updateUI(); }));
  $('[data-act="fingers"]').addEventListener('click', () => { showFingers = !showFingers; S.fingers = showFingers; AX.store.save(); updateUI(); updateScore(); if (mode === 'play' && running) markTarget(); });
  $('[data-act="mic"]').addEventListener('click', async () => {
    if (AX.input.micOn) { AX.input.stopMic(); } else { const r = await AX.input.startMic(); AX.ui.toast(r.msg); }
    updateUI();
  });
  goBtn.addEventListener('click', () => { if (goBtn.textContent.indexOf('Again') >= 0 || running) reset(); start(); });
  $('[data-act="pause"]').addEventListener('click', () => paused ? resume() : pause());
  $('[data-act="restart"]').addEventListener('click', reset);
  $('[data-act="hint"]').addEventListener('click', () => {
    if (idx >= n || dead) return;
    hintUntil = performance.now() + 1200;
    piano.playNote(notes[idx].m, { dur: 0.7 });
    AX.Axie.say('Listen, hum it, then find it on the piano. Asking for help keeps all your stars! 👂');
  });
  const visibility = () => { if (document.hidden) pause(); };
  document.addEventListener('visibilitychange', visibility);

  reset();
  this.destroy = function () { dead = true; clearTimers(); cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', visibility); piano.destroy(); AX.Axie.setMood('idle'); if (AX.input.micOn && !opts.keepMic) AX.input.stopMic(); };
};
