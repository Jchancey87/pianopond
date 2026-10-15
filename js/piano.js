/* On-screen piano with multi-touch, finger-number badges, and MIDI/mic hooks. */
window.AX = window.AX || {};
AX.Piano = function (container, opt) {
  const M = AX.music;
  opt = Object.assign({ from: 60, to: 76, labels: 'names', sound: true }, opt || {});
  const self = this;
  self.onNote = null;
  self.onNoteOff = null;
  self.opt = opt;

  const whites = [];
  for (let m = opt.from; m <= opt.to; m++) if (!M.isBlack(m)) whites.push(m);
  const wW = 100 / whites.length;
  const el = document.createElement('div'); el.className = 'piano';
  const keys = {}, rects = {}, held = {}, midiVoices = {};
  const demoVoices = new Set();

  function mkKey(m, cls, left, width) {
    const k = document.createElement('div');
    k.className = 'key ' + cls; k.dataset.midi = m;
    k.style.left = left + '%'; k.style.width = width + '%';
    k.innerHTML = '<span class="badge"></span><span class="lbl"></span>';
    keys[m] = k; rects[m] = { x: left / 100, w: width / 100 };
    return k;
  }
  whites.forEach((m, i) => el.appendChild(mkKey(m, 'white', i * wW, wW)));
  for (let m = opt.from; m <= opt.to; m++) {
    if (!M.isBlack(m)) continue;
    const wi = whites.indexOf(m - 1); if (wi < 0) continue;
    const bw = wW * 0.62;
    el.appendChild(mkKey(m, 'black', (wi + 1) * wW - bw / 2, bw));
  }
  container.innerHTML = ''; container.appendChild(el);

  const down = (m) => { const k = keys[m]; if (k) k.classList.add('down'); };
  const up = (m) => { const k = keys[m]; if (k) k.classList.remove('down'); };

  self.setLabels = function (mode) {
    opt.labels = mode;
    Object.keys(keys).forEach(m => {
      m = +m; const k = keys[m]; const l = k.querySelector('.lbl'); l.textContent = '';
      if (M.isBlack(m)) return;
      if (mode === 'names') l.textContent = M.name(m) + (m === 60 ? '⭐' : '');
      else if (mode === 'solfege') l.textContent = M.solfege(m);
      else if (mode === 'c' && M.pc(m) === 0) l.textContent = 'C' + (m === 60 ? '⭐' : '');
    });
  };
  self.mark = function (m, o) {
    const k = keys[m]; if (!k) return; o = o || {};
    if (o.cls) k.classList.add(o.cls);
    if (o.finger) { const b = k.querySelector('.badge'); b.textContent = o.finger; b.style.background = M.fingerColor(o.finger); b.classList.add('on'); }
    if (o.label != null) k.querySelector('.lbl').textContent = o.label;
  };
  self.clearMarks = function () {
    Object.keys(keys).forEach(m => {
      const k = keys[m]; k.classList.remove('target', 'hint', 'g2', 'g3', 'good', 'bad', 'ghost');
      const b = k.querySelector('.badge'); b.textContent = ''; b.classList.remove('on');
    });
    self.setLabels(opt.labels);
  };
  self.flash = function (m, cls, ms) { const k = keys[m]; if (!k) return; k.classList.add(cls); setTimeout(() => k.classList.remove(cls), ms || 450); };
  self.has = (m) => !!keys[m];
  self.keyRect = (m) => rects[m];
  self.whites = whites;
  self.range = () => [opt.from, opt.to];

  // programmatic note (demo playback): visual + sound for a fixed length
  self.playNote = function (m, o) {
    o = o || {}; down(m);
    if (opt.sound && !o.silent) {
      const voice = AX.audio.noteOn(m, { dur: o.dur || 0.5, gain: o.gain == null ? 1 : o.gain, vel: o.vel == null ? 0.75 : o.vel });
      demoVoices.add(voice);
      setTimeout(() => demoVoices.delete(voice), (o.dur || 0.5) * 1000 + 300);
    }
    setTimeout(() => up(m), Math.max(120, (o.dur || 0.5) * 1000));
  };
  // MIDI keyboard / microphone events
  self.external = function (m, src, velocity) {
    if (src === 'mic') { self.flash(m, 'ghost', 350); if (self.onNote) self.onNote(m, 'mic'); return; }
    if (midiVoices[m]) self.externalOff(m);
    const vel = velocity == null ? 0.8 : velocity;
    down(m); midiVoices[m] = opt.sound ? AX.audio.noteOn(m, { vel }) : { release() {} };
    if (self.onNote) self.onNote(m, src, { id: 'midi:' + m, vel });
  };
  self.externalOff = function (m) {
    up(m);
    if (midiVoices[m]) {
      midiVoices[m].release(); delete midiVoices[m];
      if (self.onNoteOff) self.onNoteOff(m, 'midi', { id: 'midi:' + m });
    }
  };

  el.addEventListener('pointerdown', (e) => {
    const k = e.target.closest('.key'); if (!k) return;
    e.preventDefault(); AX.audio.ensure();
    const m = +k.dataset.midi; down(m);
    held[e.pointerId] = { m, v: opt.sound ? AX.audio.noteOn(m, { vel: 0.8 }) : null };
    if (el.setPointerCapture && e.isTrusted) el.setPointerCapture(e.pointerId);
    if (self.onNote) self.onNote(m, 'touch', { id: 'touch:' + e.pointerId, vel: 0.8 });
  });
  const release = (e) => {
    const h = held[e.pointerId]; if (!h) return;
    delete held[e.pointerId]; up(h.m); if (h.v) h.v.release();
    if (self.onNoteOff) self.onNoteOff(h.m, 'touch', { id: 'touch:' + e.pointerId });
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  el.addEventListener('contextmenu', (e) => e.preventDefault());

  self.setLabels(opt.labels);
  AX.input.active = self;
  self.silence = function () {
    demoVoices.forEach(v => v.release()); demoVoices.clear();
    Object.keys(midiVoices).forEach(m => self.externalOff(+m));
    Object.keys(held).forEach(id => release({ pointerId: id }));
    Object.keys(keys).forEach(up);
  };
  const blur = () => self.silence();
  window.addEventListener('blur', blur);
  self.destroy = function () {
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    window.removeEventListener('blur', blur);
    if (AX.input.active === self) AX.input.active = null;
    self.silence();
  };
};
