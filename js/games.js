/* Mini-games: Note Hunt, Finger Friends, Axie Says (echo), Read the Reef, Bubble Beat (rhythm) */
window.AX = window.AX || {};

/* ---------- Hand picture (finger numbers) ---------- */
AX.hand = (function () {
  const POS = [
    { cx: 52, cy: 158, len: 78, a: -42 }, { cx: 100, cy: 92, len: 104, a: -8 }, { cx: 152, cy: 72, len: 118, a: 0 },
    { cx: 204, cy: 88, len: 106, a: 7 }, { cx: 252, cy: 128, len: 82, a: 16 }];
  const RH = [60, 62, 64, 65, 67], LH = [55, 53, 52, 50, 48];
  const midiFor = (hand, f) => (hand === 'L' ? LH : RH)[f - 1];
  function svg(o) {
    const L = o.hand === 'L'; const mx = (x) => (L ? 300 - x : x);
    let s = '<svg class="hand-svg" viewBox="0 0 300 270" xmlns="http://www.w3.org/2000/svg">';
    s += '<path class="h-skin" d="M62 150 L248 150 L250 215 Q248 262 150 262 Q70 262 62 215 Z"/>';
    POS.forEach((p, i) => {
      const f = i + 1; const a = L ? -p.a : p.a; const cx = mx(p.cx);
      const tipx = cx + Math.sin(a * Math.PI / 180) * (p.len / 2 - 26), tipy = p.cy - Math.cos(a * Math.PI / 180) * (p.len / 2 - 26);
      s += `<g class="finger" data-f="${f}"><rect class="h-skin" x="${cx - 21}" y="${p.cy - p.len / 2}" width="42" height="${p.len}" rx="21" transform="rotate(${a} ${cx} ${p.cy})"/>` +
        `<circle cx="${tipx}" cy="${tipy}" r="17" fill="${AX.music.fingerColor(f)}" stroke="#fff" stroke-width="3"/><text x="${tipx}" y="${tipy + 7}" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" style="paint-order:stroke" stroke="rgba(0,0,0,.25)" stroke-width="2">${f}</text></g>`;
    });
    return s + '</svg>';
  }
  function attach(wrap, hand, cb) {
    wrap.querySelectorAll('.finger').forEach(g => g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); AX.audio.ensure(); const f = +g.dataset.f; g.classList.add('pressed'); setTimeout(() => g.classList.remove('pressed'), 280); cb(f);
    }));
  }
  function glow(wrap, f, on) { const g = wrap.querySelector(`.finger[data-f="${f}"]`); if (g) g.classList.toggle('glow', on); }
  return { svg, attach, glow, midiFor };
})();

AX.games = (function () {
  const M = AX.music;
  const shuffle = (a) => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const pickOf = (arr, not) => { let v; do { v = arr[Math.floor(Math.random() * arr.length)]; } while (arr.length > 1 && v === not); return v; };
  const cheers = ['Yes! 🎉', 'You got it!', 'Perfect!', 'Splash! 💦', 'Nailed it!', 'Wow! ⭐'];
  const cheer = () => cheers[Math.floor(Math.random() * cheers.length)];

  /* ---------------- Note Hunt ---------------- */
  function hunt(root, cfg, done) {
    cfg = Object.assign({ rounds: 8, from: 60, to: 76, labels: 'none' }, cfg);
    root.innerHTML = '<div class="activity game"><div class="g-hud"><span class="g-round"></span><span class="g-streak"></span></div><div class="g-stage"><div class="g-card staffcard"><div class="g-prompt"></div><div class="staff-wrap hunt-staff"></div></div></div><div class="g-piano"></div></div>';
    const piano = new AX.Piano(root.querySelector('.g-piano'), { from: cfg.from, to: cfg.to, labels: cfg.labels });
    const prompt = root.querySelector('.g-prompt');
    const staffEl = root.querySelector('.hunt-staff');
    let r = 0, mistakes = 0, wrong = 0, target = null, last = null, streak = 0, lock = false, dead = false;
    const exact = () => /\d/.test(target);
    const isTarget = (m) => (exact() ? m === M.parse(target) : M.name(m) === target);

    function getStaffTarget() {
      if (exact()) {
        const m = M.parse(target);
        const clef = cfg.clef || (m < 60 ? 'bass' : 'treble');
        return { midi: m, clef };
      }
      const isBass = cfg.clef === 'bass' || (cfg.from < 60 && cfg.to <= 60);
      const clef = cfg.clef || (isBass ? 'bass' : 'treble');
      const letter = target.replace(/\d/, '');
      const midi = M.parse(letter + (isBass ? '3' : '4'));
      return { midi, clef };
    }

    function renderStaff(active = false) {
      if (!staffEl || !target) return;
      const st = getStaffTarget();
      staffEl.innerHTML = AX.staff.svg([st.midi], { clef: st.clef, labels: true, active: active ? 0 : undefined });
    }

    function next() {
      if (dead) return; r++;
      if (r > cfg.rounds) return finish();
      root.querySelector('.g-round').textContent = `Round ${r} / ${cfg.rounds}`;
      target = pickOf(cfg.pool, last); last = target; wrong = 0; lock = false; piano.clearMarks();
      const letter = target.replace(/\d/, '');
      prompt.innerHTML = `Find <span class="big-letter">${letter}</span>`;
      renderStaff(false);
      AX.Axie.say(`Can you find <b>${letter}</b>? ${exact() ? '(Look low on the piano!)' : ''}`);
      AX.Axie.setMood('idle');
    }
    function finish() {
      const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;
      done(stars, { mistakes });
    }
    piano.onNote = (m, src) => {
      if (lock || dead) return;
      if (src === 'mic' ? M.pc(m) === M.pc(M.parse(exact() ? target : target + '4')) : isTarget(m)) {
        lock = true; streak++; piano.flash(m, 'good', 600); AX.audio.sfx.pop(); AX.Axie.cheer(cheer());
        renderStaff(true);
        root.querySelector('.g-streak').textContent = streak >= 3 ? `🔥 ${streak} in a row!` : '';
        setTimeout(next, 800);
      } else {
        streak = 0; mistakes++; wrong++; piano.flash(m, 'bad', 500); root.querySelector('.g-streak').textContent = '';
        AX.Axie.say(`That was <b>${M.name(m)}</b>. Look again for <b>${target.replace(/\d/, '')}</b>!`);
        if (wrong >= 2) for (let k = cfg.from; k <= cfg.to; k++) if (isTarget(k)) piano.mark(k, { cls: 'hint' });
        if (wrong >= 4) { lock = true; piano.clearMarks(); for (let k = cfg.from; k <= cfg.to; k++) if (isTarget(k)) piano.mark(k, { cls: 'target' }); setTimeout(next, 1400); }
      }
    };
    next();
    return { destroy() { dead = true; piano.destroy(); } };
  }

  /* ---------------- Finger Friends ---------------- */
  function fingers(root, cfg, done) {
    cfg = Object.assign({ hand: 'R', mode: 'single', rounds: 8, len: 3 }, cfg);
    root.innerHTML = `<div class="activity game"><div class="g-hud"><span class="g-round"></span><span class="g-streak"></span></div><div class="g-stage"><div class="g-card"><div class="g-prompt"></div></div><div class="hand-wrap big">${AX.hand.svg({ hand: cfg.hand })}</div></div></div>`;
    const wrap = root.querySelector('.hand-wrap'), prompt = root.querySelector('.g-prompt');
    let r = 0, mistakes = 0, target = 0, seq = [], pos = 0, lock = true, dead = false;
    const hname = cfg.hand === 'R' ? 'right' : 'left';
    const timers = [];
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    function next() {
      if (dead) return; r++;
      if (r > cfg.rounds) return done(mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);
      root.querySelector('.g-round').textContent = `Round ${r} / ${cfg.rounds}`;
      if (cfg.mode === 'single') {
        target = pickOf([1, 2, 3, 4, 5], target); lock = false;
        prompt.innerHTML = `Tap finger <span class="big-letter" style="background:${M.fingerColor(target)}">${target}</span>`;
        AX.Axie.say(`Tap finger <b>${target}</b> on your ${hname} hand!`);
      } else {
        seq = []; for (let i = 0; i < cfg.len; i++) seq.push(pickOf([1, 2, 3, 4, 5], seq[i - 1])); pos = 0; lock = true;
        prompt.innerHTML = 'Watch Axie...'; AX.Axie.say('Watch closely, then copy me! 👀'); AX.Axie.setMood('sing', cfg.len * 800);
        seq.forEach((f, i) => {
          later(() => { AX.hand.glow(wrap, f, true); AX.audio.noteOn(AX.hand.midiFor(cfg.hand, f), { dur: 0.5 }); }, 900 + i * 800);
          later(() => AX.hand.glow(wrap, f, false), 900 + i * 800 + 550);
        });
        later(() => { lock = false; prompt.innerHTML = 'Your turn!'; AX.Axie.say('Your turn! Tap the same fingers in order.'); }, 900 + seq.length * 800);
      }
    }
    AX.hand.attach(wrap, cfg.hand, (f) => {
      if (lock || dead) return;
      AX.audio.noteOn(AX.hand.midiFor(cfg.hand, f), { dur: 0.6 });
      if (cfg.mode === 'single') {
        if (f === target) { lock = true; AX.audio.sfx.pop(); AX.Axie.cheer(cheer()); later(next, 800); }
        else { mistakes++; AX.audio.sfx.oops(); AX.Axie.say(`That's finger ${f}. Look for <b>${target}</b>!`); }
      } else if (f === seq[pos]) {
        pos++; AX.audio.sfx.pop();
        if (pos >= seq.length) { lock = true; AX.Axie.cheer(cheer()); later(next, 900); }
      } else {
        mistakes++; AX.audio.sfx.oops(); AX.Axie.say('Oops! Let\'s watch again.'); lock = true; pos = 0;
        later(() => { r--; next(); }, 900);
      }
    });
    next();
    return { destroy() { dead = true; timers.forEach(clearTimeout); } };
  }

  /* ---------------- Axie Says (echo) ---------------- */
  function echo(root, cfg, done) {
    cfg = Object.assign({ pool: ['C4', 'D4', 'E4'], startLen: 2, maxLen: 5, rounds: 6, from: 60, to: 76, labels: 'names', lives: 3 }, cfg);
    root.innerHTML = '<div class="activity game"><div class="g-hud"><span class="g-round"></span><span class="g-lives"></span></div><div class="g-stage"><div class="g-card"><div class="g-prompt"></div></div></div><div class="g-piano"></div></div>';
    const piano = new AX.Piano(root.querySelector('.g-piano'), { from: cfg.from, to: cfg.to, labels: cfg.labels });
    const pool = cfg.pool.map(M.parse), prompt = root.querySelector('.g-prompt');
    let r = 0, lives = cfg.lives, seq = [], pos = 0, lock = true, dead = false, retried = false;
    const timers = []; const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    const hearts = () => { root.querySelector('.g-lives').textContent = '❤'.repeat(lives) + '🤍'.repeat(cfg.lives - lives); };
    function play(newPattern) {
      lock = true; pos = 0; piano.clearMarks();
      const len = Math.min(cfg.maxLen, cfg.startLen + Math.floor((r - 1) / 2));
      if (newPattern) { seq = []; for (let i = 0; i < len; i++) seq.push(pickOf(pool, seq[i - 1])); retried = false; }
      prompt.innerHTML = 'Listen...'; AX.Axie.say('Listen to my notes! 🎶'); AX.Axie.setMood('sing', seq.length * 700 + 800);
      seq.forEach((m, i) => {
        later(() => { piano.mark(m, { cls: 'target' }); piano.playNote(m, { dur: 0.5 }); }, 900 + i * 700);
        later(() => piano.clearMarks(), 900 + i * 700 + 480);
      });
      later(() => { lock = false; prompt.innerHTML = 'Your turn! 🎹'; AX.Axie.setMood('idle'); AX.Axie.say('Now you play them in the same order!'); }, 900 + seq.length * 700);
    }
    function next() {
      if (dead) return; r++;
      if (r > cfg.rounds) return done(lives >= 3 ? 3 : lives === 2 ? 2 : 1);
      root.querySelector('.g-round').textContent = `Round ${r} / ${cfg.rounds}`; hearts(); play(true);
    }
    piano.onNote = (m, src) => {
      if (lock || dead) return;
      const ok = src === 'mic' ? M.pc(m) === M.pc(seq[pos]) : m === seq[pos];
      if (ok) {
        piano.flash(m, 'good', 400); pos++;
        if (pos >= seq.length) { lock = true; AX.audio.sfx.pop(); AX.Axie.cheer(cheer()); later(next, 1000); }
      } else {
        piano.flash(m, 'bad', 400); AX.audio.sfx.oops(); lock = true;
        if (!retried) { retried = true; AX.Axie.say('Almost! Listen once more. 👂'); later(() => play(false), 1000); }
        else { lives--; hearts(); AX.Axie.say('That one was tricky! Here\'s a new one.'); if (lives <= 0) { later(() => done(1), 1200); } else later(() => { r--; next(); }, 1200); }
      }
    };
    next();
    return { destroy() { dead = true; timers.forEach(clearTimeout); piano.destroy(); } };
  }

  /* ---------------- Read the Reef (staff reading) ---------------- */
  function read(root, cfg, done) {
    cfg = Object.assign({ pool: ['C4', 'D4', 'E4'], rounds: 8, clef: 'treble', from: 60, to: 76 }, cfg);
    root.innerHTML = '<div class="activity game"><div class="g-hud"><span class="g-round"></span><span class="g-streak"></span></div><div class="g-stage"><div class="g-card staffcard"><div class="g-prompt">Which key is this note?</div><div class="staff-wrap big"></div><button class="btn small peek">👀 Peek at the name</button></div></div><div class="g-piano"></div></div>';
    const piano = new AX.Piano(root.querySelector('.g-piano'), { from: cfg.from, to: cfg.to, labels: 'c' });
    const staffEl = root.querySelector('.staff-wrap'); const peek = root.querySelector('.peek');
    let r = 0, mistakes = 0, wrong = 0, target = null, last = null, lock = false, dead = false;
    function next() {
      if (dead) return; r++;
      if (r > cfg.rounds) return done(mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1);
      root.querySelector('.g-round').textContent = `Round ${r} / ${cfg.rounds}`;
      target = pickOf(cfg.pool, last); last = target; wrong = 0; lock = false; piano.clearMarks();
      staffEl.innerHTML = AX.staff.svg([M.parse(target)], { clef: cfg.clef, labels: false });
      AX.Axie.say('Say the note name <b>out loud</b>, then find it on the piano! 🎹');
    }
    peek.addEventListener('click', () => { if (lock) return; mistakes++; AX.Axie.say(`That note is <b>${target.replace(/\d/, '')}</b>!`); });
    piano.onNote = (m, src) => {
      if (lock || dead) return; const t = M.parse(target);
      if (src === 'mic' ? M.pc(m) === M.pc(t) : m === t) {
        lock = true; piano.flash(m, 'good', 600); staffEl.innerHTML = AX.staff.svg([t], { clef: cfg.clef, labels: true, active: 0 });
        AX.audio.sfx.pop(); AX.Axie.cheer(cheer()); setTimeout(next, 1100);
      } else {
        mistakes++; wrong++; piano.flash(m, 'bad', 500); AX.Axie.say(`That was ${M.name(m)}. Look at where the note sits!`);
        if (wrong >= 2) piano.mark(t, { cls: 'hint' });
      }
    };
    next();
    return { destroy() { dead = true; piano.destroy(); } };
  }

  /* ---------------- Bubble Beat (rhythm) ---------------- */
  function rhythm(root, cfg, done) {
    cfg = Object.assign({ bpm: 76, patterns: [[1, 1, 1, 1]] }, cfg);
    root.innerHTML = '<div class="activity game rhythm"><div class="g-hud"><span class="g-round"></span><span class="g-streak"></span></div><div class="g-stage"><div class="g-card"><div class="g-prompt"></div></div><div class="lane"><canvas></canvas></div><button class="tap-btn">TAP!</button></div></div>';
    const canvas = root.querySelector('canvas'), g = canvas.getContext('2d'), prompt = root.querySelector('.g-prompt'), btn = root.querySelector('.tap-btn');
    const sec = 60 / cfg.bpm; const names = { 0.5: 'ti', 1: 'ta', 2: 'ta-a' };
    let r = 0, hits = 0, total = 0, t0 = 0, raf = 0, dead = false, onsets = [], taken = [], marks = [], lastBeat = -99, phase = '', started = false;
    const fired = {};
    function startRound() {
      if (dead) return; r++;
      if (r > cfg.patterns.length) { return done(total ? (hits / total >= 0.85 ? 3 : hits / total >= 0.6 ? 2 : 1) : 1); }
      root.querySelector('.g-round').textContent = `Pattern ${r} / ${cfg.patterns.length}`;
      const pat = cfg.patterns[r - 1]; onsets = []; let t = 0;
      pat.forEach(d => { onsets.push({ t, d }); t += d; });
      taken = onsets.map(() => 0); marks = []; Object.keys(fired).forEach(k => delete fired[k]);
      t0 = performance.now() + 600; lastBeat = -99; phase = '';
    }
    const beatNow = () => (performance.now() - t0) / 1000 / sec;
    function sound(key, fn) { if (!fired[key]) { fired[key] = 1; fn(); } }
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight, d = window.devicePixelRatio || 1;
      if (canvas.width !== w * d || canvas.height !== h * d) { canvas.width = w * d; canvas.height = h * d; g.setTransform(d, 0, 0, d, 0, 0); }
    }
    function frame() {
      if (dead) return; resize();
      const W = canvas.clientWidth, H = canvas.clientHeight, b = beatNow(), hitX = W * 0.22, ppb = (W - hitX - 20) / 6;
      // metronome + phases
      const ib = Math.floor(b);
      if (b >= 0 && ib !== lastBeat) { lastBeat = ib; if (ib < 16 && (ib < 4 || ib >= 8 && ib < 12 || (ib >= 4 && ib < 8) || ib >= 12)) AX.audio.sfx.click(ib % 4 === 0); }
      const np = phase === 'wait' ? 'wait' : b < 4 ? 'count' : b < 8 ? 'demo' : b < 12 ? 'count2' : b < 16.4 ? 'play' : 'end';
      if (np !== phase) {
        phase = np;
        if (np === 'count') { prompt.innerHTML = 'Get ready... 🎧'; AX.Axie.say('Feel the beat! Count with me: 1 2 3 4'); }
        if (np === 'demo') { prompt.innerHTML = 'Listen to Axie 👂'; AX.Axie.setMood('sing', 4 * sec * 1000); AX.Axie.say('Listen to this rhythm!'); }
        if (np === 'count2') { prompt.innerHTML = 'Get ready... 🎧'; AX.Axie.setMood('idle'); AX.Axie.say('Your turn soon! Count: 1 2 3 4'); }
        if (np === 'play') { prompt.innerHTML = 'Your turn! TAP! 👆'; AX.Axie.say('Tap the bubbles when they hit the line!'); }
        if (np === 'end') { evaluate(); }
      }
      if (np === 'demo') onsets.forEach((o, i) => { if (b >= 4 + o.t) sound('d' + i, () => { AX.audio.sfx.drum(); AX.Axie.bounce(); }); });
      // draw
      g.clearRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#ff6b8b'; g.lineWidth = 4; g.beginPath(); g.moveTo(hitX, 6); g.lineTo(hitX, H - 6); g.stroke();
      for (let k = 0; k <= 16; k++) { const x = hitX + (k - b) * ppb; if (x > 0 && x < W) { g.fillStyle = k % 4 === 0 ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.07)'; g.fillRect(x - 1, H * 0.15, 2, H * 0.7); } }
      const drawSet = (base, col, set) => onsets.forEach((o, i) => {
        const x = hitX + (base + o.t - b) * ppb; if (x < -40 || x > W + 40) return;
        let c = col, rr = 24, a = 1;
        if (set === 'play') { if (taken[i] === 1) { c = '#4cd97b'; rr = 24 + Math.max(0, 8 - (b - base - o.t) * 20); } else if (taken[i] === -1) { c = '#b0bec5'; a = 0.5; } }
        g.globalAlpha = a; g.fillStyle = c; g.beginPath(); g.arc(x, H / 2, rr, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x - 7, H / 2 - 8, 6, 0, 7); g.fill();
        g.fillStyle = '#37474f'; g.font = '800 20px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(names[o.d] || '', x, H / 2 + 52); g.globalAlpha = 1;
      });
      drawSet(4, '#2bc4b4', 'demo'); drawSet(12, '#ff7aa2', 'play');
      if (np === 'play') onsets.forEach((o, i) => { if (!taken[i] && b > 12 + o.t + 0.32) { taken[i] = -1; } });
      if (np === 'count' || np === 'count2') { g.fillStyle = '#ff6b8b'; g.font = '900 90px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(String((Math.max(0, ib) % 4) + 1), W / 2, H / 2 + 30); }
      raf = requestAnimationFrame(frame);
    }
    function evaluate() {
      const h = taken.filter(x => x === 1).length; hits += h; total += onsets.length;
      AX.Axie.cheer(h === onsets.length ? 'Perfect rhythm! 🥁' : h >= onsets.length / 2 ? 'Nice beat!' : 'Let\'s feel it again. You\'ll get it!');
      prompt.innerHTML = `${h} / ${onsets.length} bubbles popped!`;
      phase = 'wait'; setTimeout(startRound, 1400);
    }
    function tap() {
      if (dead) return; AX.audio.ensure(); AX.audio.sfx.drum(); btn.classList.add('hit'); setTimeout(() => btn.classList.remove('hit'), 90);
      if (phase !== 'play') return; const b = beatNow() - 12;
      let best = -1, bd = 0.34;
      onsets.forEach((o, i) => { const d = Math.abs(o.t - b); if (taken[i] === 0 && d < bd) { bd = d; best = i; } });
      if (best >= 0) { taken[best] = 1; AX.audio.sfx.pop(); }
    }
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(); });
    const key = (e) => { if (e.code === 'Space') { e.preventDefault(); tap(); } };
    window.addEventListener('keydown', key);
    startRound(); raf = requestAnimationFrame(frame);
    return { destroy() { dead = true; cancelAnimationFrame(raf); window.removeEventListener('keydown', key); } };
  }

  /* ---------------- Echo Detective (Boulanger Ear Dictation) ---------------- */
  function echodetective(root, cfg, done) {
    cfg = Object.assign({ pool: [['C4', 'D4', 'E4'], ['E4', 'D4', 'C4'], ['C4', 'E4', 'G4'], ['G4', 'E4', 'C4'], ['C4', 'D4', 'E4', 'G4'], ['E4', 'F4', 'G4']], rounds: 5, from: 60, to: 76 }, cfg);
    root.innerHTML = '<div class="activity game echodetective"><div class="g-hud"><span class="g-round"></span><span class="g-lives"></span></div><div class="g-stage"><div class="g-card"><div class="g-prompt"></div><div class="solfege-clue" style="font-size:24px;color:#8e6bff;margin-top:8px;font-weight:800"></div></div></div><div class="g-piano"></div></div>';
    const piano = new AX.Piano(root.querySelector('.g-piano'), { from: cfg.from, to: cfg.to, labels: 'c' });
    const prompt = root.querySelector('.g-prompt');
    const clue = root.querySelector('.solfege-clue');
    let r = 0, mistakes = 0, seq = [], pos = 0, lock = true, dead = false;
    const timers = []; const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    function playPattern() {
      lock = true; pos = 0; piano.clearMarks();
      const patternNotes = cfg.pool[(r - 1) % cfg.pool.length];
      seq = patternNotes.map(M.parse);
      const solfStr = seq.map(M.solfege).join(' - ');
      prompt.innerHTML = 'Listen with your inner ear... 👂';
      clue.innerHTML = '';
      AX.Axie.say('Close your eyes and listen to the melody! 🎶');
      AX.Axie.setMood('sing', seq.length * 750 + 600);
      seq.forEach((m, i) => {
        later(() => {
          AX.audio.noteOn(m, { dur: 0.55 });
          AX.Axie.bounce();
        }, 800 + i * 750);
      });
      later(() => {
        lock = false;
        prompt.innerHTML = 'Your turn! Sing & Play 🎹';
        clue.innerHTML = `Axie sang: <b>${solfStr}</b>`;
        AX.Axie.setMood('idle');
        AX.Axie.say(`Sing it back: <b>${solfStr}</b>! Then play those notes on the keys!`);
      }, 800 + seq.length * 750 + 200);
    }
    function next() {
      if (dead) return; r++;
      if (r > cfg.rounds) return done(mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1);
      root.querySelector('.g-round').textContent = `Detective Round ${r} / ${cfg.rounds}`;
      playPattern();
    }
    piano.onNote = (m, src) => {
      if (lock || dead) return;
      const ok = src === 'mic' ? M.pc(m) === M.pc(seq[pos]) : m === seq[pos];
      if (ok) {
        piano.flash(m, 'good', 350); pos++;
        if (pos >= seq.length) {
          lock = true; AX.audio.sfx.pop(); AX.Axie.cheer(cheer());
          prompt.innerHTML = '✨ Detective Match! ✨';
          later(next, 1000);
        }
      } else {
        piano.flash(m, 'bad', 400); mistakes++; AX.audio.sfx.oops();
        AX.Axie.say(`That was ${M.name(m)}. Listen again to: <b>${seq.map(M.solfege).join(' - ')}</b>!`);
        lock = true;
        later(playPattern, 1200);
      }
    };
    next();
    return { destroy() { dead = true; timers.forEach(clearTimeout); piano.destroy(); } };
  }

  /* ---------------- The Contrary Motion Game (Boulanger Pillar 2) ---------------- */
  function contrary(root, cfg, done) {
    cfg = Object.assign({ rounds: 5, from: 48, to: 76 }, cfg);
    const pairs = [
      { rh: 'C4', lh: 'C4', interval: 'Unison', sensation: 'Home Base! Pure Unison 🪷', type: 'pure' },
      { rh: 'D4', lh: 'B3', interval: '3rd', sensation: 'Sweet & Sunny 3rd 🍯 (Consonant)', type: 'sweet' },
      { rh: 'E4', lh: 'A3', interval: '5th', sensation: 'Hollow & Open 5th 🏰 (Pure)', type: 'pure' },
      { rh: 'F4', lh: 'G3', interval: '7th', sensation: 'Spicy & Crunchy 7th 🌶️ (Tension!)', type: 'crunchy' },
      { rh: 'G4', lh: 'F3', interval: '9th / 2nd', sensation: 'Full & Expansive 🌊', type: 'sweet' }
    ];
    root.innerHTML = `<div class="activity game contrary">
      <div class="g-hud"><span class="g-round"></span><span class="g-streak"></span></div>
      <div class="g-stage">
        <div class="g-card">
          <div class="g-prompt"></div>
          <div class="contrary-sensation" style="font-size:22px;color:#2bc4b4;margin-top:10px;font-weight:800"></div>
          <div class="contrary-voices" style="display:flex;gap:18px;justify-content:center;margin-top:12px;">
            <div class="voice-badge rh" style="background:#ff6b8b;color:#fff;padding:6px 16px;border-radius:999px;font-size:18px;font-weight:900">RH: <span></span></div>
            <div class="voice-badge lh" style="background:#4aa3ff;color:#fff;padding:6px 16px;border-radius:999px;font-size:18px;font-weight:900">LH: <span></span></div>
          </div>
        </div>
      </div>
      <div class="g-piano"></div>
    </div>`;
    const piano = new AX.Piano(root.querySelector('.g-piano'), { from: cfg.from, to: cfg.to, labels: 'names' });
    const prompt = root.querySelector('.g-prompt');
    const sensEl = root.querySelector('.contrary-sensation');
    const rhVal = root.querySelector('.voice-badge.rh span');
    const lhVal = root.querySelector('.voice-badge.lh span');
    let r = 0, mistakes = 0, lock = true, dead = false;
    let targetRH = null, targetLH = null, gotRH = false, gotLH = false;
    const timers = []; const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    function next() {
      if (dead) return; r++;
      if (r > cfg.rounds) return done(mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1);
      root.querySelector('.g-round').textContent = `Contrary Round ${r} / ${cfg.rounds}`;
      const pair = pairs[(r - 1) % pairs.length];
      targetRH = M.parse(pair.rh);
      targetLH = M.parse(pair.lh);
      gotRH = false; gotLH = false;
      rhVal.textContent = pair.rh;
      lhVal.textContent = pair.lh;
      sensEl.textContent = pair.sensation;
      prompt.innerHTML = `Contrary Motion: <b style="color:#ff6b8b">${pair.rh}</b> &amp; <b style="color:#4aa3ff">${pair.lh}</b>`;
      AX.Axie.say(`Hands move in opposite directions! Play <b>${pair.rh}</b> and <b>${pair.lh}</b>!`);
      piano.clearMarks();
      piano.mark(targetRH, { cls: 'target', label: 'RH' });
      piano.mark(targetLH, { cls: 'target', label: 'LH' });
      lock = false;
    }
    piano.onNote = (m) => {
      if (lock || dead) return;
      if (m === targetRH && !gotRH) {
        gotRH = true; piano.flash(m, 'good', 500);
      } else if (m === targetLH && !gotLH) {
        gotLH = true; piano.flash(m, 'good', 500);
      } else if (m !== targetRH && m !== targetLH) {
        mistakes++; piano.flash(m, 'bad', 400); AX.audio.sfx.oops();
        return;
      }
      if (gotRH && gotLH) {
        lock = true;
        later(() => {
          AX.audio.noteOn(targetRH, { dur: 1.2, vel: 0.85 });
          AX.audio.noteOn(targetLH, { dur: 1.2, vel: 0.85 });
          AX.Axie.cheer(pairs[(r - 1) % pairs.length].sensation);
        }, 150);
        later(next, 1400);
      }
    };
    next();
    return { destroy() { dead = true; timers.forEach(clearTimeout); piano.destroy(); } };
  }

  /* ---------------- Cadence Storytelling ("Where Does This Note Want to Go?") ---------------- */
  function cadence(root, cfg, done) {
    cfg = Object.assign({ rounds: 3, from: 48, to: 76 }, cfg);
    root.innerHTML = `<div class="activity game cadence">
      <div class="g-hud"><span class="g-round"></span><span class="g-streak"></span></div>
      <div class="g-stage">
        <div class="g-card">
          <div class="g-prompt">Where does this note want to go? 🧗</div>
          <div class="cadence-stage" style="display:flex;gap:10px;justify-content:center;margin:14px 0;flex-wrap:wrap;">
            <button class="cadence-card card-home" data-c="home" style="border:3px solid #4cd97b;border-radius:18px;padding:8px 16px;background:#fff;font-weight:900;font-size:18px;">🏡 Home (I Chord)</button>
            <button class="cadence-card card-explore" data-c="explore" style="border:3px solid #4aa3ff;border-radius:18px;padding:8px 16px;background:#fff;font-weight:900;font-size:18px;">⛵ Exploring (IV Chord)</button>
            <button class="cadence-card card-cliff" data-c="cliff" style="border:3px solid #ff6b8b;border-radius:18px;padding:8px 16px;background:#fff;font-weight:900;font-size:18px;">🧗 Cliffhanger (V7 Chord)</button>
          </div>
          <div class="cadence-feedback" style="font-size:20px;color:#8e6bff;font-weight:800;min-height:30px;"></div>
        </div>
      </div>
      <div class="g-piano"></div>
    </div>`;
    const piano = new AX.Piano(root.querySelector('.g-piano'), { from: cfg.from, to: cfg.to, labels: 'names' });
    const prompt = root.querySelector('.g-prompt');
    const feed = root.querySelector('.cadence-feedback');
    let r = 0, mistakes = 0, lock = true, dead = false;
    const timers = []; const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    function playChord(notes, dur) {
      notes.forEach(n => AX.audio.noteOn(M.parse(n), { dur: dur || 0.9, gain: 0.7 }));
    }
    function runRound() {
      if (dead) return; r++;
      if (r > cfg.rounds) return done(mistakes <= 1 ? 3 : 2);
      root.querySelector('.g-round').textContent = `Cadence ${r} / ${cfg.rounds}`;
      lock = true; feed.textContent = 'Listening to the story...';
      prompt.innerHTML = 'Listen to the musical journey... 🎶';
      later(() => {
        playChord(['C4', 'E4', 'G4'], 0.8);
        feed.innerHTML = '🏡 <b>Home</b> (I chord) — safe and peaceful!';
        AX.Axie.say('We start at <b>Home</b> (C Major)!');
      }, 500);
      later(() => {
        playChord(['F4', 'A4', 'C5'], 0.8);
        feed.innerHTML = '⛵ <b>Exploring</b> (IV chord) — off on an adventure!';
        AX.Axie.say('Now we set sail: <b>Exploring</b> (F Major)!');
      }, 1600);
      later(() => {
        playChord(['G3', 'B3', 'D4', 'F4'], 1.4);
        feed.innerHTML = '🧗 <b>The Cliffhanger</b> (V7 chord) — Tension in mid-air!';
        prompt.innerHTML = '<span style="color:#ff6b8b">Cliffhanger! Where does this note want to go?!</span>';
        AX.Axie.say('Nadia Boulanger’s big question: <b>"Where does this note want to go?"</b>');
        piano.clearMarks();
        piano.mark(60, { cls: 'target', label: 'Home C' });
        lock = false;
      }, 2800);
    }
    function resolveHome() {
      if (lock || dead) return; lock = true;
      feed.innerHTML = '🎉 <b>Safely Home to C!</b> 🎉';
      piano.flash(60, 'good', 800);
      playChord(['C4', 'E4', 'G4', 'C5'], 1.6);
      AX.audio.sfx.chime();
      AX.Axie.cheer('Ahhh, sweet resolution! Back Home safe! 🏡✨');
      later(runRound, 1800);
    }
    root.querySelectorAll('.cadence-card').forEach(btn => {
      btn.addEventListener('click', () => {
        if (lock || dead) return;
        if (btn.dataset.c === 'home') resolveHome();
        else {
          mistakes++; AX.audio.sfx.oops();
          feed.innerHTML = 'Still tension in the air! It wants to go <b>Home</b>! 🏡';
          AX.Axie.say('The tension pulls towards <b>Home</b>! Tap Home or Middle C!');
        }
      });
    });
    piano.onNote = (m) => {
      if (lock || dead) return;
      if (m === 60 || m === 72 || m === 48) resolveHome();
      else {
        mistakes++; piano.flash(m, 'bad', 400); AX.audio.sfx.oops();
        feed.innerHTML = 'Not quite resting yet! Play Middle C to bring us <b>Home</b>! 🏡';
      }
    };
    runRound();
    return { destroy() { dead = true; timers.forEach(clearTimeout); piano.destroy(); } };
  }

  /* ---------------- The 3-Key Transposition Challenge (Boulanger Pillar 3) ---------------- */
  function transpose(root, cfg, done) {
    cfg = Object.assign({ rounds: 3, from: 53, to: 77 }, cfg);
    const challenges = [
      { key: 'C Major', notes: ['E4', 'D4', 'C4'], intro: 'Play Hot Cross Buns in <b>C Major</b> (E - D - C)!' },
      { key: 'G Major', notes: ['B4', 'A4', 'G4'], intro: 'Now transpose to <b>G Major</b>! Start on finger 3 on note B (B - A - G)!' },
      { key: 'F Major', notes: ['A4', 'G4', 'F4'], intro: 'Now transpose to <b>F Major</b>! Start on finger 3 on note A (A - G - F)!' }
    ];
    root.innerHTML = `<div class="activity game transpose">
      <div class="g-hud"><span class="g-round"></span><span class="g-streak"></span></div>
      <div class="g-stage">
        <div class="g-card">
          <div class="g-prompt"></div>
          <div class="trans-key" style="font-size:24px;color:#ff6b8b;margin-top:8px;font-weight:900"></div>
          <div class="trans-tip" style="font-size:17px;color:#556;margin-top:4px;"></div>
        </div>
      </div>
      <div class="g-piano"></div>
    </div>`;
    const piano = new AX.Piano(root.querySelector('.g-piano'), { from: cfg.from, to: cfg.to, labels: 'names' });
    const prompt = root.querySelector('.g-prompt');
    const keyEl = root.querySelector('.trans-key');
    const tipEl = root.querySelector('.trans-tip');
    let r = 0, mistakes = 0, pos = 0, seq = [], lock = true, dead = false;
    const timers = []; const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    function next() {
      if (dead) return; r++;
      if (r > cfg.rounds) return done(mistakes <= 1 ? 3 : 2);
      root.querySelector('.g-round').textContent = `Transposition ${r} / 3`;
      const item = challenges[r - 1];
      seq = item.notes.map(M.parse);
      pos = 0; lock = false;
      keyEl.textContent = `Key: ${item.key}`;
      tipEl.innerHTML = item.intro;
      prompt.innerHTML = `Play: <b>${item.notes.map(n => n.slice(0, -1)).join(' - ')}</b>`;
      AX.Axie.say(item.intro);
      piano.clearMarks();
      piano.mark(seq[0], { cls: 'target', label: item.notes[0].slice(0, -1) });
    }
    piano.onNote = (m) => {
      if (lock || dead) return;
      if (m === seq[pos]) {
        piano.flash(m, 'good', 350); pos++;
        if (pos >= seq.length) {
          lock = true; AX.audio.sfx.pop();
          if (r === 3) {
            AX.Axie.cheer("Bravo! You transposed across 3 keys by ear! That's true musicianship! 🌟");
          } else {
            AX.Axie.cheer("Transposed perfectly! Onto the next key! 🎹");
          }
          later(next, 1200);
        } else {
          piano.clearMarks();
          piano.mark(seq[pos], { cls: 'target', label: challenges[r - 1].notes[pos].slice(0, -1) });
        }
      } else {
        mistakes++; piano.flash(m, 'bad', 400); AX.audio.sfx.oops();
        AX.Axie.say(`Look for note <b>${challenges[r - 1].notes[pos].slice(0, -1)}</b>!`);
      }
    };
    next();
    return { destroy() { dead = true; timers.forEach(clearTimeout); piano.destroy(); } };
  }

  /* ---------------- La Grande Ligne: Finding the Mountain Peak (Boulanger Pillar 4) ---------------- */
  function peak(root, cfg, done) {
    cfg = Object.assign({ rounds: 3 }, cfg);
    const phrases = [
      {
        title: 'Robert Schumann — Melody',
        notes: ['C4', 'E4', 'G4', 'C5', 'B4', 'A4', 'G4'],
        peakIdx: 3,
        peakNote: 'C5',
        story: 'The phrase leaps all the way to High C before gently floating down!'
      },
      {
        title: 'Beethoven — Ode to Joy',
        notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4'],
        peakIdx: 3,
        peakNote: 'G4',
        story: 'The melody climbs step by step to the peak note G, bursting with joy!'
      },
      {
        title: 'Bach — Minuet in G',
        notes: ['D4', 'G4', 'A4', 'B4', 'C5', 'D5', 'G4'],
        peakIdx: 5,
        peakNote: 'D5',
        story: 'Bach ascends up the staircase to High D — the summit of the dance!'
      }
    ];
    root.innerHTML = `<div class="activity game peak">
      <div class="g-hud"><span class="g-round"></span><span class="g-streak"></span></div>
      <div class="g-stage">
        <div class="g-card">
          <div class="g-prompt">Find the Mountain Peak 🏔️</div>
          <div class="peak-piece" style="font-size:20px;color:#8e6bff;font-weight:900;margin-top:6px;"></div>
          <div class="peak-story" style="font-size:16px;color:#556;margin:8px 0;">Which note is the highest, most exciting peak of La Grande Ligne?</div>
          <div class="peak-notes" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:16px 0;"></div>
          <div class="peak-feedback" style="font-size:20px;color:#2bc4b4;font-weight:900;min-height:30px;"></div>
        </div>
      </div>
      <div class="g-piano" style="display:none"></div>
    </div>`;
    const pieceEl = root.querySelector('.peak-piece');
    const notesBox = root.querySelector('.peak-notes');
    const feed = root.querySelector('.peak-feedback');
    let r = 0, mistakes = 0, lock = false, dead = false;
    const timers = []; const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    function playMelody(notes, peakIdx) {
      notes.forEach((n, i) => {
        later(() => {
          AX.audio.noteOn(M.parse(n), { dur: 0.55, gain: i === peakIdx ? 1.0 : 0.65 });
          const btn = notesBox.querySelectorAll('.peak-note-btn')[i];
          if (btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 450); }
        }, 300 + i * 500);
      });
    }
    function next() {
      if (dead) return; r++;
      if (r > cfg.rounds) return done(mistakes <= 1 ? 3 : 2);
      root.querySelector('.g-round').textContent = `Mountain Peak ${r} / ${cfg.rounds}`;
      const item = phrases[(r - 1) % phrases.length];
      pieceEl.textContent = item.title;
      feed.textContent = '';
      notesBox.innerHTML = '';
      item.notes.forEach((n, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn peak-note-btn';
        btn.style.minHeight = '50px';
        btn.style.fontSize = '22px';
        btn.style.padding = '8px 16px';
        btn.textContent = n.slice(0, -1);
        btn.addEventListener('click', () => {
          if (lock || dead) return;
          if (i === item.peakIdx) {
            lock = true; btn.style.background = '#4cd97b'; btn.style.color = '#fff';
            feed.innerHTML = `🏔️ <b>You found the Peak (${item.peakNote})!</b><br><small style="color:#2c3e50;font-size:15px">${item.story}</small>`;
            AX.audio.sfx.fanfare();
            AX.Axie.cheer("That's La Grande Ligne! Every note builds toward that summit! 🏔️✨");
            later(next, 2400);
          } else {
            mistakes++; btn.style.background = '#ffb3b3';
            feed.textContent = 'Keep climbing! Look for the highest pitch!';
            AX.audio.sfx.oops();
            AX.Axie.say('Look for the highest note in the melody!');
          }
        });
        notesBox.appendChild(btn);
      });
      lock = false;
      playMelody(item.notes, item.peakIdx);
      AX.Axie.say('Listen to the phrase: which note is the <b>Mountain Peak</b>?');
    }
    next();
    return { destroy() { dead = true; timers.forEach(clearTimeout); } };
  }

  return { hunt, fingers, echo, read, rhythm, echodetective, contrary, cadence, transpose, peak };
})();
