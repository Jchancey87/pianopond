/* Personal compositions: note lengths, chords and velocity, stored on this device. */
window.AX = window.AX || {};
AX.composer = (function () {
  const S = AX.store, U = AX.ui, limits = S.compositionLimits;
  let unsaved = null;
  const seconds = notes => Math.max(...notes.map(n => n.t + n.d), 0) / 1000;
  const stamp = () => Math.round(performance.now());
  const newId = () => 'music-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);

  // Explicit note releases preserve long notes, short notes and overlapping chords.
  function recorder() {
    const start = stamp(), notes = [], held = new Map();
    const elapsed = () => Math.min(limits.duration, stamp() - start);
    const off = id => {
      const note = held.get(id); if (!note) return;
      note.d = Math.max(30, elapsed() - note.t); held.delete(id);
    };
    return {
      elapsed,
      on(m, detail) {
        if (notes.length >= limits.notes || elapsed() >= limits.duration) return false;
        const id = detail.id || 'note:' + m;
        off(id);
        const note = { m, t: elapsed(), d: 30, vel: detail.vel == null ? 0.8 : detail.vel };
        notes.push(note); held.set(id, note); return true;
      },
      off,
      finish() {
        [...held.keys()].forEach(off);
        const lead = notes.length ? notes[0].t : 0;
        return notes.map(n => ({ ...n, t: n.t - lead }));
      }
    };
  }

  // Schedule a small window ahead on the audio clock, so long recordings do not
  // exhaust the voice budget or inherit setTimeout jitter for every note.
  function playback(notes, piano, onStop) {
    const sorted = [...notes].sort((a, b) => a.t - b.t);
    AX.audio.ensure();
    const start = AX.audio.now() + 0.05, end = seconds(sorted);
    const voices = new Set(), timers = new Set();
    let i = 0, stopped = false, interval;
    function stop() {
      if (stopped) return; stopped = true;
      clearInterval(interval); timers.forEach(clearTimeout); voices.forEach(v => v.release());
      if (piano) piano.silence();
      if (onStop) onStop();
    }
    function tick() {
      const now = AX.audio.now();
      while (i < sorted.length && start + sorted[i].t / 1000 <= now + 0.12) {
        const note = sorted[i++], when = start + note.t / 1000;
        const voice = AX.audio.noteOn(note.m, { when, dur: note.d / 1000, vel: note.vel });
        voices.add(voice);
        const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!stopped) fn(); }, ms); timers.add(id); };
        if (piano) later(() => piano.playNote(note.m, { dur: note.d / 1000, silent: true }), Math.max(0, (when - now) * 1000));
        later(() => voices.delete(voice), Math.max(0, (when - now) * 1000) + note.d + 350);
      }
      if (now >= start + end + 0.35) stop();
    }
    interval = setInterval(tick, 30); tick();
    return { stop };
  }

  function nameSong(composition, onSaved) {
    const exists = S.get().compositions.some(c => c.id === composition.id);
    U.modal(`<h2>Name your song 🎵</h2><label>Song name<input class="inp" id="song-name" maxlength="60" value="${U.escape(composition.title)}"></label><p class="save-error" role="alert"></p>`, [
      { label: 'Cancel' },
      { label: exists ? 'Save name' : 'Save my song', cls: 'primary', keep: true, fn: box => {
        const title = box.querySelector('#song-name').value.trim();
        if (!title) { box.querySelector('.save-error').textContent = 'Give your song a name first.'; return; }
        try {
          if (exists) S.renameComposition(composition.id, title);
          else S.saveComposition({ ...composition, title });
          composition.title = title; unsaved = null;
          U.close(); onSaved();
        } catch (error) { box.querySelector('.save-error').textContent = storageMessage(error); }
      } }
    ]);
  }
  function storageMessage(error) {
    return error.name === 'QuotaExceededError' || error.name === 'SecurityError'
      ? 'This browser could not save your song. Keep this page open and ask a grown-up to check storage.'
      : error.message;
  }

  function freeplay(root, openLibrary) {
    root.innerHTML = `<div class="activity song composer"><div class="sp-bar"><div class="seg lbls"><button data-l="none">No labels</button><button data-l="c">Cs</button><button data-l="names">A B C</button><button data-l="solfege">Do Re Mi</button></div>
      <button class="chip" id="cantus">🎻 Play with Axie</button><button class="chip" id="my-music">🎵 My Music</button></div>
      <div class="record-bar"><button class="chip" id="rec">⏺ Record</button><button class="chip" id="play" disabled>▶ Play it back</button><button class="chip" id="name-song" disabled>✏️ Name my song</button><span class="record-status" role="status">Record a little tune. It saves when you stop.</span></div>
      <div class="free-stage"><div class="story-card"><span class="story-emoji" aria-hidden="true"></span><h2 class="story-title"></h2><p class="story-prompt"></p><button class="btn small" id="story-next">✨ Another idea</button><small>Your music, your rules. Record up to 2 minutes.</small></div></div><div class="sp-piano"></div></div>`;
    const $ = selector => root.querySelector(selector);
    const piano = new AX.Piano($('.sp-piano'), { from: 48, to: 84, labels: 'c' });
    const stories = [
      ['🐟', 'A little fish says hello', 'Play three notes for “hel-lo, friend!” Then answer with three different notes.'],
      ['🌧️', 'Raindrops on the pond', 'Try a few high notes like tiny raindrops. Leave quiet spaces between them.'],
      ['🐢', 'Turtle and butterfly', 'Make a slow tune for a turtle. Now play it faster for a butterfly!'],
      ['🌙', 'Axie’s sleepy song', 'Make a gentle tune with C, D and E. Finish on C and let it rest.'],
      ['🏔️', 'Up the bubble mountain', 'Let your tune climb higher, then float back down. Where is its highest note?']
    ];
    let story = 0, recording = null, composition = unsaved, player = null, timer = null;
    let cantusOn = false, cantusTimer = null, cantusStep = 0, lastBounce = 0;
    const bassline = [48, 45, 41, 43];
    function update() {
      $('#rec').textContent = recording ? '⏹ Stop & save' : '⏺ Record';
      $('#rec').classList.toggle('on', !!recording);
      $('#play').disabled = !!recording || !composition;
      $('#play').textContent = player ? '⏹ Stop playback' : '▶ Play it back';
      $('#name-song').disabled = !!recording || !composition;
      $('#name-song').textContent = unsaved ? '💾 Save my song' : '✏️ Name my song';
      $('#my-music').textContent = `🎵 My Music (${S.get().compositions.length})`;
      if (!recording && composition) $('.record-status').textContent = unsaved ? 'Not saved yet. Tap Save my song to try again.' : `Saved on this device: ${composition.title}`;
    }
    function stopPlayback() { if (player) { player.stop(); player = null; } }
    function stopCantus() { cantusOn = false; clearTimeout(cantusTimer); $('#cantus').classList.remove('on'); }
    function playCantus() {
      if (!cantusOn) return;
      piano.playNote(bassline[cantusStep++ % bassline.length], { dur: 1.4, gain: 0.65 });
      cantusTimer = setTimeout(playCantus, 1600);
    }
    function stopRecording() {
      if (!recording) return;
      const notes = recording.finish(); recording = null; clearInterval(timer);
      if (notes.length) {
        composition = { id: newId(), title: `My pond song ${S.get().compositions.length + 1}`, created: Date.now(), notes };
        unsaved = composition;
        try { S.saveComposition(composition); unsaved = null; AX.Axie.say('Your song is saved! Give it a name, or listen to it again. 🎵'); }
        catch (error) { U.toast(U.escape(storageMessage(error))); }
      } else { $('.record-status').textContent = 'No notes yet. Tap Record and play a few keys!'; AX.Axie.say('Ready when you are. Tap Record, then play your tune! 🎹'); }
      update();
    }
    function startRecording() {
      if (unsaved) { U.toast('Save your last song before recording another one.'); return; }
      stopPlayback(); piano.silence();
      composition = null; recording = recorder();
      const tick = () => {
        const elapsed = recording.elapsed();
        $('.record-status').textContent = `Recording · ${Math.floor(elapsed / 60000)}:${String(Math.floor(elapsed / 1000) % 60).padStart(2, '0')} / 2:00`;
        if (elapsed >= limits.duration) { stopRecording(); U.toast('Two minutes of music! Your recording is ready.'); }
      };
      timer = setInterval(tick, 200); tick(); update();
      AX.Axie.say('Recording your keys! Long notes, short notes, or chords — make it yours. 🎙️');
    }
    const showStory = () => { const [emoji, title, prompt] = stories[story]; $('.story-emoji').textContent = emoji; $('.story-title').textContent = title; $('.story-prompt').textContent = prompt; };
    $('#story-next').addEventListener('click', () => { story = (story + 1) % stories.length; showStory(); });
    showStory();
    const setLabels = value => { piano.setLabels(value); root.querySelectorAll('[data-l]').forEach(b => b.classList.toggle('on', b.dataset.l === value)); };
    root.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => setLabels(b.dataset.l))); setLabels('c');
    piano.onNote = (m, src, detail = {}) => {
      if (recording && src !== 'mic' && !recording.on(m, detail)) { stopRecording(); U.toast('Your tune is full of notes! Ready for another song?'); }
      const now = stamp(); if (now - lastBounce > 400) { lastBounce = now; AX.Axie.bounce(); AX.Axie.setMood('happy', 900); }
    };
    piano.onNoteOff = (m, src, detail = {}) => { if (recording) recording.off(detail.id || 'note:' + m); };
    $('#cantus').addEventListener('click', () => {
      if (cantusOn) stopCantus();
      else { stopPlayback(); cantusOn = true; cantusStep = 0; $('#cantus').classList.add('on'); playCantus(); AX.Axie.say('I’ll play the low notes. Your recording keeps just the notes you play. 🎻'); }
    });
    $('#rec').addEventListener('click', () => recording ? stopRecording() : startRecording());
    $('#play').addEventListener('click', () => {
      if (player) { stopPlayback(); return; }
      if (!composition || recording) return;
      stopCantus(); piano.silence();
      player = playback(composition.notes, piano, () => { player = null; update(); AX.Axie.setMood('idle'); });
      AX.Axie.setMood('sing'); update();
    });
    $('#name-song').addEventListener('click', () => { stopPlayback(); nameSong(composition, update); });
    $('#my-music').addEventListener('click', () => { stopRecording(); openLibrary(); });
    const visibility = () => { if (document.hidden) { stopRecording(); stopPlayback(); stopCantus(); piano.silence(); } };
    document.addEventListener('visibilitychange', visibility);
    update();
    return () => { stopRecording(); stopPlayback(); stopCantus(); clearInterval(timer); document.removeEventListener('visibilitychange', visibility); piano.destroy(); };
  }

  function library(root, openFreeplay) {
    let player = null, playing = null;
    function stop() { if (player) player.stop(); player = null; playing = null; }
    function render() {
      const songs = [...S.get().compositions].reverse();
      root.innerHTML = `<div class="music-intro card"><h2>Your own little songbook 🎵</h2><p>Saved on this device. A grown-up can include your songs in a progress backup.</p><button class="btn primary" id="make-song">⏺ Make a new song</button></div><div class="my-songs">${songs.length ? songs.map(c => `<article class="card composition" data-id="${U.escape(c.id)}"><span class="composition-icon" aria-hidden="true">🎶</span><h3>${U.escape(c.title)}</h3><p>${c.notes.length} notes · ${Math.ceil(seconds(c.notes))} seconds · ${new Date(c.created).toLocaleDateString()}</p><div class="composition-actions"><button class="chip" data-action="play">${playing === c.id ? '⏹ Stop' : '▶ Listen'}</button><button class="chip" data-action="rename">✏️ Rename</button><button class="chip" data-action="delete">Remove</button></div></article>`).join('') : '<div class="card empty-music"><span>🫧</span><h3>Your first song belongs here!</h3><p>Play a few notes in Free Play and tap Stop & save.</p></div>'}</div>`;
      root.querySelector('#make-song').addEventListener('click', openFreeplay);
      root.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => {
        const id = b.closest('[data-id]').dataset.id;
        const song = S.get().compositions.find(c => c.id === id);
        const wasPlaying = playing === id; stop();
        if (b.dataset.action === 'play') {
          if (!wasPlaying) { playing = id; player = playback(song.notes, null, () => { player = null; playing = null; render(); }); }
          render();
        } else if (b.dataset.action === 'rename') nameSong(song, render);
        else U.modal(`<h2>Remove this song?</h2><p>${U.escape(song.title)} will leave your music shelf.</p>`, [
          { label: 'Keep it', fn: render }, { label: 'Remove', cls: 'danger', fn: () => { try { S.deleteComposition(id); } catch (error) { U.toast(U.escape(storageMessage(error))); } render(); } }
        ]);
      }));
    }
    const visibility = () => { if (document.hidden) { stop(); render(); } };
    document.addEventListener('visibilitychange', visibility);
    render();
    return () => { stop(); document.removeEventListener('visibilitychange', visibility); };
  }
  return { freeplay, library, recorder, playback };
})();
