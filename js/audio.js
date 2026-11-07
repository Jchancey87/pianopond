/* Audio: a sampled grand piano (Salamander, with synth fallback), sound effects, MIDI keyboard input, and optional microphone pitch detection. */
window.AX = window.AX || {};
AX.audio = (function () {
  let ctx = null, master = null, room = null, hammer = null;
  const voices = new Set();
  const MAX_VOICES = 24;
  const vol = () => AX.store.get().settings.volume;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC({ latencyHint: 'interactive' });
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12; comp.knee.value = 12; comp.ratio.value = 3;
      master = ctx.createGain(); master.gain.value = vol();
      master.connect(comp); comp.connect(ctx.destination);
      // A small, shared soundboard/room tail. Generated locally, so it works offline.
      room = ctx.createConvolver();
      const impulse = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * 0.65), ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
      }
      room.buffer = impulse;
      const wet = ctx.createGain(); wet.gain.value = 0.14;
      room.connect(wet); wet.connect(master);
      hammer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.018), ctx.sampleRate);
      const data = hammer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.003));
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    loadSamples();
    return ctx;
  }
  function setVolume(v) { if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.015); }
  const now = () => (ctx ? ctx.currentTime : 0);

  // Decaying partials, a quiet hammer attack and velocity-dependent brightness.
  // No sample downloads; one shared room and at most 24 held/scheduled voices.
  function synthNote(midi, opt) {
    opt = opt || {};
    const c = ensure(); if (!c) return { release() {} };
    if (voices.size >= MAX_VOICES) voices.values().next().value.release(true);
    const t0 = Math.max(c.currentTime, opt.when || 0);
    const vel = Math.max(0.01, Math.min(1, opt.vel == null ? 0.8 : opt.vel));
    const gain = Math.max(0, opt.gain == null ? 1 : opt.gain);
    const f = AX.music.freq(midi);
    const decay = Math.max(1.1, Math.min(6, 4.8 * Math.pow(2, (48 - midi) / 36)));
    const duration = opt.dur == null ? decay : Math.max(0.03, opt.dur);
    const releaseTime = Math.max(0.10, Math.min(0.25, 0.22 - (midi - 48) * 0.001));
    const end = t0 + duration + releaseTime;
    const out = c.createGain(), lp = c.createBiquadFilter(), pan = c.createStereoPanner();
    lp.type = 'lowpass'; lp.Q.value = 0.45;
    lp.frequency.setValueAtTime(Math.min(c.sampleRate * 0.45, f * (3 + vel * 7) + 600), t0);
    lp.frequency.exponentialRampToValueAtTime(Math.min(c.sampleRate * 0.4, f * 2.5 + 400), t0 + decay);
    pan.pan.value = Math.max(-0.35, Math.min(0.35, (midi - 60) / 90));
    lp.connect(out); out.connect(pan); pan.connect(master); pan.connect(room);
    const peak = Math.max(0.0001, 0.19 * Math.pow(vel, 1.5) * gain);
    const attack = 0.004 + (1 - vel) * 0.006;
    const levelAt = t => {
      const age = Math.max(0, t - t0);
      if (age < attack) return 0.0001 + (peak - 0.0001) * age / attack;
      if (age > duration) {
        const heldLevel = Math.max(0.0001, peak * Math.exp(-3.5 * (duration - attack) / decay));
        return heldLevel * Math.pow(0.0001 / heldLevel, Math.min(1, (age - duration) / releaseTime));
      }
      return Math.max(0.0001, peak * Math.exp(-3.5 * (age - attack) / decay));
    };
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.linearRampToValueAtTime(peak, t0 + attack);
    out.gain.exponentialRampToValueAtTime(levelAt(t0 + duration), t0 + duration);
    out.gain.exponentialRampToValueAtTime(0.0001, end);
    const sources = [], nodes = [lp, out, pan];
    const partials = [1, 0.48, 0.23, 0.12, 0.065, 0.03];
    partials.forEach((amplitude, i) => {
      const harmonic = i + 1;
      const frequency = f * harmonic * Math.sqrt(1 + 0.000035 * i * i);
      if (frequency >= c.sampleRate * 0.45) return;
      const osc = c.createOscillator(), envelope = c.createGain();
      osc.frequency.value = frequency;
      const a = amplitude * (i ? 0.45 + 0.55 * vel : 1);
      envelope.gain.setValueAtTime(a, t0);
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, a * 0.015), t0 + decay / (1 + i * 0.65));
      osc.connect(envelope); envelope.connect(lp); osc.start(t0); osc.stop(end + 0.03);
      sources.push(osc); nodes.push(envelope);
    });
    const strike = c.createBufferSource(), strikeGain = c.createGain();
    strike.buffer = hammer; strikeGain.gain.value = 0.09 * vel * vel;
    strike.connect(strikeGain); strikeGain.connect(lp); strike.start(t0);
    sources.push(strike); nodes.push(strikeGain);
    let released = false;
    const voice = { release(steal) {
      if (released) return; released = true; voices.delete(voice);
      const t = c.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(t < t0 ? 0.0001 : levelAt(t), t);
      out.gain.exponentialRampToValueAtTime(0.0001, t + (steal ? 0.025 : releaseTime));
      sources.forEach(source => { try { source.stop(t + (steal ? 0.03 : releaseTime + 0.03)); } catch {} });
    } };
    sources[0].onended = () => {
      voices.delete(voice);
      sources.forEach(source => source.disconnect()); nodes.forEach(node => node.disconnect());
    };
    voices.add(voice);
    return voice;
  }

  /* ---- Sampled piano: Salamander Grand Piano (Alexander Holm, CC-BY 3.0), a sample every minor third ---- */
  const SAMPLE_NAMES = ['A0','C1','Ds1','Fs1','A1','C2','Ds2','Fs2','A2','C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4','C5','Ds5','Fs5','A5','C6','Ds6','Fs6','A6','C7','Ds7','Fs7','A7','C8'];
  const SEMI = { C: 0, Ds: 3, Fs: 6, A: 9 };
  const samples = []; // { midi, buf }
  let loading = false;
  function loadSamples() {
    if (loading || !ctx) return; loading = true;
    SAMPLE_NAMES.forEach(name => {
      const midi = 12 * (Number(name.slice(-1)) + 1) + SEMI[name.slice(0, -1)];
      fetch('audio/piano/' + name + '.mp3').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(ab => new Promise((ok, no) => ctx.decodeAudioData(ab, ok, no)))
        .then(buf => { samples.push({ midi, buf }); samples.sort((a, b) => a.midi - b.midi); })
        .catch(() => {});
    });
  }
  function nearestSample(midi) {
    let best = null;
    for (const s of samples) if (!best || Math.abs(s.midi - midi) < Math.abs(best.midi - midi)) best = s;
    return best;
  }
  // Plays the nearest recorded note pitch-shifted into place. Falls back to the synth until samples are ready.
  function noteOn(midi, opt) {
    opt = opt || {};
    const c = ensure(); if (!c) return { release() {} };
    const s = samples.length >= 20 ? nearestSample(midi) : null;
    if (!s || Math.abs(s.midi - midi) > 3) return synthNote(midi, opt);
    if (voices.size >= MAX_VOICES) voices.values().next().value.release(true);
    const t0 = Math.max(c.currentTime, opt.when || 0);
    const vel = Math.max(0.01, Math.min(1, opt.vel == null ? 0.8 : opt.vel));
    const gain = Math.max(0, opt.gain == null ? 1 : opt.gain);
    const f = AX.music.freq(midi);
    const decay = Math.max(1.5, Math.min(8, 6 * Math.pow(2, (48 - midi) / 36)));
    const timed = opt.dur != null;
    const duration = timed ? Math.max(0.05, opt.dur) : decay * 1.6;
    const releaseTime = Math.max(0.12, Math.min(0.35, 0.3 - (midi - 48) * 0.002));
    const src = c.createBufferSource(); src.buffer = s.buf;
    src.playbackRate.value = Math.pow(2, (midi - s.midi) / 12);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.3;
    lp.frequency.value = Math.min(c.sampleRate * 0.45, f * (4 + vel * 14) + 1200); // softer touch = mellower tone
    const out = c.createGain(), pan = c.createStereoPanner();
    pan.pan.value = Math.max(-0.35, Math.min(0.35, (midi - 60) / 90));
    const peak = Math.max(0.0001, 0.8 * Math.pow(vel, 1.2) * gain);
    out.gain.setValueAtTime(peak, t0);
    // Held keys keep ringing but fade slowly, like a real string.
    out.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * (timed ? 0.5 : 0.04)), t0 + duration);
    const end = t0 + duration + releaseTime;
    out.gain.exponentialRampToValueAtTime(0.0001, end);
    src.connect(lp); lp.connect(out); out.connect(pan); pan.connect(master); pan.connect(room);
    src.start(t0); src.stop(end + 0.05);
    let released = false;
    const voice = { release(steal) {
      if (released) return; released = true; voices.delete(voice);
      const t = c.currentTime, r = steal ? 0.025 : releaseTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), t);
      out.gain.exponentialRampToValueAtTime(0.0001, t + r);
      try { src.stop(t + r + 0.03); } catch {}
    } };
    src.onended = () => { voices.delete(voice); src.disconnect(); lp.disconnect(); out.disconnect(); pan.disconnect(); };
    voices.add(voice);
    return voice;
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
    osc.onended = () => { osc.disconnect(); g.disconnect(); };
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
            if (cmd === 0x90 && v > 0) api.active.external(n, 'midi', v / 127);
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
