/* Audio: a soft synth piano, sound effects, MIDI keyboard input, and optional microphone pitch detection. */
window.AX = window.AX || {};
AX.audio = (function () {
  let ctx = null, master = null;
  const vol = () => AX.store.get().settings.volume;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain();
      master.gain.value = vol();
      master.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function setVolume(v) { if (master) master.gain.value = v; }
  const now = () => (ctx ? ctx.currentTime : 0);

  // Additive "piano-ish" voice. opt: {when, vel, gain, dur}. Without dur the note rings and decays like a real piano.
  function noteOn(midi, opt) {
    opt = opt || {};
    const c = ensure(); if (!c) return { release() {} };
    const t0 = Math.max(c.currentTime, opt.when || 0);
    const vel = opt.vel == null ? 0.8 : opt.vel;
    const g = opt.gain == null ? 1 : opt.gain;
    const f = AX.music.freq(midi);
    const out = c.createGain(); out.gain.value = 0.0001;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.value = Math.min(12000, f * 6 + 1200); lp.Q.value = 0.4;
    lp.connect(out); out.connect(master);
    const oscs = [];
    [[1, 1], [2, 0.5], [3, 0.28], [4, 0.14], [5, 0.08], [6, 0.04]].forEach(([n, a]) => {
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.value = f * n * (1 + 0.0004 * n * n);
      const pg = c.createGain(); pg.gain.value = a;
      o.connect(pg); pg.connect(lp); o.start(t0); oscs.push(o);
    });
    const peak = 0.22 * vel * g;
    let end;
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.linearRampToValueAtTime(peak, t0 + 0.008);
    if (opt.dur) {
      out.gain.exponentialRampToValueAtTime(peak * 0.55, t0 + Math.max(0.05, opt.dur * 0.75));
      end = t0 + opt.dur + 0.15;
      out.gain.exponentialRampToValueAtTime(0.0003, end);
    } else {
      const dec = Math.max(1.4, 4.2 - (midi - 48) * 0.045);
      out.gain.exponentialRampToValueAtTime(peak * 0.4, t0 + 0.35);
      end = t0 + dec;
      out.gain.exponentialRampToValueAtTime(0.0003, end);
    }
    oscs.forEach(o => o.stop(end + 0.1));
    let released = false;
    return {
      release() {
        if (released) return; released = true;
        const t = c.currentTime;
        try {
          out.gain.cancelScheduledValues(t);
          out.gain.setValueAtTime(Math.max(out.gain.value, 0.0003), t);
          out.gain.exponentialRampToValueAtTime(0.0003, t + 0.22);
        } catch (e) { /* ignore */ }
        oscs.forEach(o => { try { o.stop(t + 0.3); } catch (e) { /* ignore */ } });
      }
    };
  }

  function tone(f, dur, o) {
    o = o || {};
    const c = ensure(); if (!c) return;
    const t0 = Math.max(c.currentTime, o.when || 0);
    const osc = c.createOscillator(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const g = c.createGain(); const peak = o.gain == null ? 0.15 : o.gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master); osc.start(t0); osc.stop(t0 + dur + 0.05);
  }
  const sfx = {
    chime() { [72, 76, 79, 84].forEach((m, i) => tone(AX.music.freq(m), 0.4, { when: now() + i * 0.09, type: 'triangle', gain: 0.14 })); },
    oops() { tone(260, 0.2, { to: 170, type: 'sine', gain: 0.12 }); },
    pop() { tone(500, 0.09, { to: 950, gain: 0.14 }); },
    star(i) { tone(AX.music.freq(76 + (i || 0) * 3), 0.35, { type: 'triangle', gain: 0.16 }); },
    drum() { tone(190, 0.16, { to: 55, gain: 0.5 }); },
    click(accent) { tone(accent ? 1600 : 1050, 0.05, { type: 'square', gain: 0.05 }); },
    talk() { for (let i = 0; i < 3; i++) tone(520 + Math.random() * 420, 0.07, { when: now() + i * 0.075, type: 'triangle', gain: 0.05 }); },
    fanfare() { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(AX.music.freq(m), 0.35, { when: now() + i * 0.08, type: 'triangle', gain: 0.13 })); }
  };

  return { ensure, setVolume, noteOn, tone, sfx, now };
})();

/* ---- Input from a real keyboard (Web MIDI) or a real piano (microphone) ---- */
AX.input = (function () {
  const api = { active: null, midiInputs: 0, micOn: false };
  let micStream = null, micTimer = null, micCtx = null;

  api.enableMidi = async function () {
    if (!navigator.requestMIDIAccess) return { ok: false, msg: 'This browser has no MIDI support (needs Chrome/Edge + HTTPS).' };
    try {
      const access = await navigator.requestMIDIAccess();
      const hook = () => {
        api.midiInputs = 0;
        access.inputs.forEach(inp => {
          api.midiInputs++;
          inp.onmidimessage = (e) => {
            const [st, n, v] = e.data; const cmd = st & 0xf0;
            if (!api.active) return;
            if (cmd === 0x90 && v > 0) api.active.external(n, 'midi');
            else if (cmd === 0x80 || (cmd === 0x90 && v === 0)) api.active.externalOff(n);
          };
        });
      };
      hook(); access.onstatechange = hook;
      return { ok: true, msg: api.midiInputs ? 'MIDI keyboard connected! 🎹' : 'MIDI is ready - plug in a keyboard.' };
    } catch (e) { return { ok: false, msg: 'MIDI permission was blocked.' }; }
  };

  function autoCorrelate(buf, sr) {
    const SIZE = buf.length; let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.012) return { f: -1, rms };
    let r1 = 0, r2 = SIZE - 1; const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    const b = buf.slice(r1, r2); const n = b.length;
    if (n < 64) return { f: -1, rms };
    const c = new Float32Array(n);
    for (let i = 0; i < n; i++) { let sum = 0; for (let j = 0; j < n - i; j++) sum += b[j] * b[j + i]; c[i] = sum; }
    let d = 0; while (d < n - 1 && c[d] > c[d + 1]) d++;
    let maxv = -1, maxp = -1;
    for (let i = d; i < n; i++) if (c[i] > maxv) { maxv = c[i]; maxp = i; }
    if (maxp < 1 || maxp >= n - 1) return { f: -1, rms };
    const x1 = c[maxp - 1], x2 = c[maxp], x3 = c[maxp + 1];
    const a = (x1 + x3 - 2 * x2) / 2, bb = (x3 - x1) / 2;
    const T0 = a ? maxp - bb / (2 * a) : maxp;
    return { f: sr / T0, rms };
  }

  api.startMic = async function () {
    if (api.micOn) return { ok: true, msg: 'Listening already!' };
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return { ok: false, msg: 'Microphone needs HTTPS (or localhost).' };
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) { return { ok: false, msg: 'Microphone permission was blocked.' }; }
    const AC = window.AudioContext || window.webkitAudioContext;
    micCtx = new AC();
    const src = micCtx.createMediaStreamSource(micStream);
    const an = micCtx.createAnalyser(); an.fftSize = 1024; src.connect(an);
    const buf = new Float32Array(an.fftSize);
    let lastMidi = -1, stable = 0, fired = false, prevRms = 0, quiet = 0;
    micTimer = setInterval(() => {
      an.getFloatTimeDomainData(buf);
      const r = autoCorrelate(buf, micCtx.sampleRate);
      if (r.f < 0 || r.f < 100 || r.f > 2200) { quiet++; if (quiet > 3) { fired = false; lastMidi = -1; stable = 0; } prevRms = r.rms; return; }
      quiet = 0;
      const midi = Math.round(69 + 12 * Math.log2(r.f / 440));
      if (r.rms > prevRms * 1.8) fired = false; // fresh attack of the same note
      prevRms = r.rms;
      if (midi === lastMidi) stable++; else { lastMidi = midi; stable = 1; fired = false; }
      if (stable >= 3 && !fired) { fired = true; if (api.active) api.active.external(midi, 'mic'); }
    }, 40);
    api.micOn = true;
    return { ok: true, msg: 'Listening to your real piano! 🎤' };
  };
  api.stopMic = function () {
    clearInterval(micTimer); micTimer = null;
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    micStream = null; if (micCtx) { micCtx.close(); micCtx = null; }
    api.micOn = false;
  };
  return api;
})();
