/* App: screens, navigation, progress, daily "dive", closet, stickers, parent corner */
(function () {
  const S = AX.store, U = AX.ui, M = AX.music;
  const $ = (s, r) => (r || document).querySelector(s);
  const screenEl = $('#screen');
  let cleanup = null, current = { name: 'home', params: {} };

  /* =============== progress =============== */
  const lessonDone = (l) => l.steps.every(st => (S.get().steps[st.id] || 0) >= 1);
  const isUnlocked = (i) => S.get().settings.unlockAll || i <= 0 || lessonDone(AX.lessons[i - 1]);
  const currentLessonIndex = () => AX.lessons.findIndex(l => !lessonDone(l));
  const lessonStars = (l) => l.steps.reduce((a, st) => a + (S.get().steps[st.id] || 0), 0);

  const STICKERS = [
    { id: 'first', emoji: '💦', name: 'First Splash', desc: 'Finish your first activity', test: s => Object.keys(s.steps).length >= 1 },
    { id: 'star3', emoji: '🌟', name: 'Three-Star Song', desc: 'Get 3 stars on a song', test: s => Object.values(s.songs).some(x => x.best >= 3) },
    { id: 'singer', emoji: '🎤', name: 'Songbird', desc: 'Sing a whole song', test: s => s.flags.sung >= 1 },
    { id: 'streak3', emoji: '🔥', name: '3-Day Streak', desc: 'Practice 3 days in a row', test: () => S.streak() >= 3 },
    { id: 'streak7', emoji: '🚀', name: '7-Day Streak', desc: 'Practice 7 days in a row', test: () => S.streak() >= 7 },
    { id: 'dive1', emoji: '🤿', name: 'First Dive', desc: "Finish Today's Dive", test: s => s.flags.dives >= 1 },
    { id: 'dive5', emoji: '🐙', name: 'Deep Diver', desc: 'Finish 5 dives', test: s => s.flags.dives >= 5 },
    { id: 'fashion', emoji: '👒', name: 'Fashionista', desc: 'Buy something for Axie', test: s => s.owned.length > 1 },
    { id: 'rich', emoji: '🫧', name: 'Bubble Collector', desc: 'Earn 200 pearls', test: s => s.totalPearls >= 200 }
  ].concat(AX.lessons.map(l => ({ id: 'les-' + l.id, emoji: l.emoji, name: l.title + ' Master', desc: 'Finish the "' + l.title + '" lesson', test: () => lessonDone(l) })));

  function checkStickers() {
    const out = [];
    STICKERS.forEach(st => { if (!S.get().stickers.includes(st.id) && st.test(S.get())) { S.awardSticker(st.id); out.push(st); } });
    return out;
  }
  const progress = {
    completeStep(step, stars, extra) {
      const st = S.get(); const prev = st.steps[step.id] || 0;
      st.steps[step.id] = Math.max(prev, stars);
      let pearls;
      if (step.type === 'learn' || step.type === 'warmup') pearls = 2;
      else pearls = stars * 3 + (stars === 3 ? 2 : 0) + (stars > prev && prev > 0 ? 2 : 0);
      if (step.type === 'song') { const o = st.songs[step.songId] || { best: 0, plays: 0 }; o.best = Math.max(o.best, stars); o.plays++; st.songs[step.songId] = o; }
      S.logActivity(); S.addPearls(pearls);
      return { pearls, stickers: checkStickers() };
    },
    sang(songId) {
      const k = 'sang-' + songId + S.dayKey(); const st = S.get();
      if (st.flags[k]) return; st.flags[k] = 1; st.flags.sung++; S.addPearls(2); S.save();
      U.toast('+2 🫧 for singing!'); checkStickers().forEach(s => U.toast(s.emoji + ' ' + s.name, '🎉'));
    }
  };

  /* =============== navigation =============== */
  const ACTIVITY = new Set(['step', 'dive', 'freeplay', 'song']);
  const practicing = () => document.visibilityState === 'visible' && !$('#overlay').classList.contains('open') && !screenEl.querySelector('[data-paused="true"]');
  function go(name, params) {
    U.close();
    document.querySelectorAll('.confetti').forEach(el => el.remove());
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    current = { name, params: params || {} };
    screenEl.innerHTML = ''; screenEl.className = 'screen s-' + name; document.body.dataset.screen = name;
    AX.Axie.setMood('idle'); AX.Axie.small(ACTIVITY.has(name));
    cleanup = screens[name](screenEl, current.params) || null;
    $('#btn-back').style.visibility = name === 'home' ? 'hidden' : 'visible';
    screenEl.scrollTop = 0;
  }
  const setTitle = (t, sub) => {
    $('#title').textContent = t;
    const subEl = $('.sub-tag');
    if (subEl) {
      if (sub !== undefined) {
        subEl.textContent = sub;
        subEl.style.display = sub ? 'block' : 'none';
      } else if (t.includes("Academy") || t === "Axie's Piano Academy") {
        subEl.textContent = 'Young Pianist Edition · Sheet Music & 24 Levels';
        subEl.style.display = 'block';
      } else {
        subEl.textContent = '';
        subEl.style.display = 'none';
      }
    }
  };
  function updatePills() {
    $('#pill-pearls b').textContent = S.get().pearls; $('#pill-streak b').textContent = S.streak();
  }
  S.onChange(updatePills);
  $('#btn-back').addEventListener('click', () => {
    const b = current.params && current.params.back;
    if (b) go(b.name, b.params); else go('home');
  });

  /* =============== step runner =============== */
  function runStep(root, step, ctx) {
    let inst = null;
    const finish = (stars, extra) => { const r = progress.completeStep(step, stars, extra); r.stars = stars; ctx.after(r, stars); updatePills(); };
    switch (step.type) {
      case 'learn': inst = U.learnCard(root, step, () => finish(3)); break;
      case 'warmup': inst = U.warmup(root, step.set, () => finish(3)); break;
      case 'hunt': inst = AX.games.hunt(root, step.cfg, finish); break;
      case 'fingers': inst = AX.games.fingers(root, step.cfg, finish); break;
      case 'echo': inst = AX.games.echo(root, step.cfg, finish); break;
      case 'read': inst = AX.games.read(root, step.cfg, finish); break;
      case 'rhythm': inst = AX.games.rhythm(root, step.cfg, finish); break;
      case 'echodetective': inst = AX.games.echodetective(root, step.cfg, finish); break;
      case 'contrary': inst = AX.games.contrary(root, step.cfg, finish); break;
      case 'cadence': inst = AX.games.cadence(root, step.cfg, finish); break;
      case 'transpose': inst = AX.games.transpose(root, step.cfg, finish); break;
      case 'peak': inst = AX.games.peak(root, step.cfg, finish); break;
      case 'song': inst = new AX.SongPlayer(root, AX.songs.byId[step.songId], { perform: step.perform, onDone: (stars, x) => finish(stars, x), onSing: () => progress.sang(step.songId) }); break;
      default: root.textContent = 'Unknown activity';
    }
    return inst;
  }

  /* =============== screens =============== */
  const screens = {};

  screens.home = (root) => {
    setTitle("Axie's Piano Academy", "Listen, sing, play · One little adventure at a time");
    const st = S.get(), td = S.todayInfo(), streak = S.streak();
    const hour = new Date().getHours();
    const hi = hour < 12 ? 'Good morning' : hour < 17 ? 'Hi' : 'Good evening';
    AX.Axie.say(`${hi}, <b>${U.escape(st.name)}</b>! ${td.acts > 0 ? 'You already practiced today - amazing! 🌟' : streak > 0 ? `You have a ${streak}-day streak! Keep it going! 🔥` : 'Ready to make some music? 🎶'}`);
    const doneToday = (td.dives || 0) > 0;
    const ci = currentLessonIndex();
    const curLesson = AX.lessons[ci >= 0 ? ci : AX.lessons.length - 1];
    const curNum = (ci >= 0 ? ci : AX.lessons.length - 1) + 1;
    const completed = curLesson.steps.filter(step => st.steps[step.id] >= 1).length;
    root.innerHTML = `<div class="home-banner">
      <div class="home-cur-badge">
        <span class="badge-num">Level ${curNum} of 24</span>
        <span class="badge-title"><b>${curLesson.emoji} ${curLesson.title}</b><small>${completed} of ${curLesson.steps.length} activities complete</small><progress max="${curLesson.steps.length}" value="${completed}" aria-label="Lesson progress"></progress></span>
      </div>
      <button class="btn small primary resume-btn" data-go="resume">${completed ? 'Continue' : 'Let’s begin'} ➡</button>
    </div>
    <div class="home-grid">
      <button class="tile big dive" data-go="dive"><span class="ti">🤿</span><b>${dive ? 'Continue your Dive' : "Today's Dive"}</b><small>${dive ? `${dive.i} of ${dive.plan.length} activities complete` : doneToday ? '✅ Dive complete! Want another splash?' : 'A little splash or a bigger adventure'}</small></button>
      <button class="tile" data-go="map"><span class="ti">🗺️</span><b>Adventure Map</b><small>24 musical places to explore</small></button>
      <button class="tile" data-go="songbook"><span class="ti">🎼</span><b>Songbook</b><small>${AX.songs.list.length} Pieces · Sheet Music & Sing</small></button>
      <button class="tile" data-go="freeplay"><span class="ti">🎹</span><b>Free Play</b><small>Make up a tiny musical story</small></button>
      <button class="tile" data-go="closet"><span class="ti">👒</span><b>Axie's Closet</b><small>Dress up Axie with pearls</small></button>
      <button class="tile" data-go="stickers"><span class="ti">🏅</span><b>Stickers</b><small>${st.stickers.length} / ${STICKERS.length} Unlocked</small></button>
    </div><button class="gear" id="gear" aria-label="Grown-ups">⚙️</button>`;
    root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      AX.audio.ensure();
      AX.audio.sfx.pop();
      if (b.dataset.go === 'dive') { if (dive) go('dive'); else go('divePlan'); }
      else if (b.dataset.go === 'resume') {
        const next = curLesson.steps.find(step => !st.steps[step.id]);
        if (next) go('step', { lessonId: curLesson.id, stepId: next.id, back: { name: 'lesson', params: { id: curLesson.id, back: { name: 'home' } } } });
        else go('lesson', { id: curLesson.id, back: { name: 'home' } });
      }
      else go(b.dataset.go);
    }));
    $('#gear', root).addEventListener('click', () => parentGate());
  };

  screens.map = (root) => {
    setTitle('Adventure Map');
    AX.Axie.say('Pick a lily pad! Each lesson has a little lesson and fun games. 🪷');
    const ci = currentLessonIndex();
    root.innerHTML = '<div class="map"></div>';
    const map = $('.map', root);
    AX.lessons.forEach((l, i) => {
      const open = isUnlocked(i), done = lessonDone(l), max = l.steps.length * 3;
      const b = document.createElement('button');
      b.className = 'pad ' + (open ? '' : 'locked ') + (done ? 'done ' : '') + (i === ci ? 'current ' : '') + (i % 2 ? 'r' : 'l');
      b.innerHTML = `<span class="pad-em">${open ? l.emoji : '🔒'}</span><span class="pad-tx"><b>${i + 1}. ${l.title}</b><small>${l.blurb}</small><em class="stars">${U.stars(Math.round(lessonStars(l) / max * 3))}</em></span>`;
      b.addEventListener('click', () => { if (open) go('lesson', { id: l.id, back: { name: 'map' } }); else { AX.audio.sfx.oops(); AX.Axie.say('Finish the lesson before this one first! 🔒'); } });
      map.appendChild(b);
    });
    const cur = $('.pad.current', root); if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 100);
  };

  screens.lesson = (root, p) => {
    const l = AX.lessons.find(x => x.id === p.id); setTitle(l.emoji + ' ' + l.title);
    AX.Axie.say(l.intro);
    root.innerHTML = `<div class="lesson"><div class="steps"></div></div>`;
    const box = $('.steps', root);
    l.steps.forEach(stp => {
      const stars = S.get().steps[stp.id] || 0;
      const b = document.createElement('button'); b.className = 'step-card' + (stars ? ' done' : '');
      const typeLabel = ({ learn: 'Learn', warmup: 'Warm-up', hunt: 'Note Hunt', fingers: 'Finger game', echo: 'Axie Says', read: 'Reading', rhythm: 'Rhythm', song: 'Song', echodetective: 'Echo Detective', contrary: 'Counterpoint', cadence: 'Harmony Story', transpose: 'Transposition', peak: 'La Grande Ligne' })[stp.type] || 'Activity';
      b.innerHTML = `<span class="si">${stp.icon || '⭐'}</span><span class="st"><b>${stp.title}</b><small>${typeLabel}</small></span><span class="stars">${stp.type === 'learn' || stp.type === 'warmup' ? (stars ? '✅' : '') : U.stars(stars)}</span>`;
      b.addEventListener('click', () => { AX.audio.ensure(); go('step', { lessonId: l.id, stepId: stp.id, back: { name: 'lesson', params: { id: l.id, back: { name: 'map' } } } }); });
      box.appendChild(b);
    });
  };

  screens.step = (root, p) => {
    const l = AX.lessons.find(x => x.id === p.lessonId), step = l.steps.find(x => x.id === p.stepId);
    setTitle(step.title);
    const inst = runStep(root, step, {
      after: (r) => {
        const next = l.steps.find(st => !S.get().steps[st.id]);
        U.results({ stars: r.stars, pearls: r.pearls, stickers: r.stickers,
        note: next ? `Up next: ${next.title}` : 'You finished this lesson! Take a stretch and celebrate. 🌟', buttons: [
        { label: '🔁 Again', fn: () => go('step', p) },
        { label: 'Lesson map', fn: () => go(p.back.name, p.back.params) },
        { label: next ? 'Next activity ➡' : 'Adventure Map 🗺️', cls: 'primary', fn: () => next ? go('step', { ...p, stepId: next.id }) : go('map') }] });
      }
    });
    // results need real stars
    return () => inst && inst.destroy && inst.destroy();
  };

  screens.songbook = (root) => {
    setTitle('Songbook'); AX.Axie.say('Pick a song to listen to, sing, and play! 🎶');
    root.innerHTML = '<div class="songs"></div>'; const box = $('.songs', root);
    AX.songs.list.forEach(sg => {
      const li = AX.lessons.findIndex(l => l.steps.some(s => s.songId === sg.id));
      const open = isUnlocked(li); const best = (S.get().songs[sg.id] || {}).best || 0;
      const b = document.createElement('button'); b.className = 'song-card' + (open ? '' : ' locked');
      b.innerHTML = `<span class="se">${open ? sg.emoji : '🔒'}</span><span class="stx"><b>${sg.title}</b><small>${sg.hand === 'L' ? 'Left hand' : 'Right hand'} · ${li >= 0 ? 'lesson ' + (li + 1) : 'bonus piece'}</small></span><span class="stars">${U.stars(best)}</span>`;
      b.addEventListener('click', () => { if (!open) { AX.audio.sfx.oops(); AX.Axie.say('Unlock this song by finishing earlier lessons! 🔒'); return; } AX.audio.ensure(); go('song', { songId: sg.id, back: { name: 'songbook' } }); });
      box.appendChild(b);
    });
  };
  screens.song = (root, p) => {
    const sg = AX.songs.byId[p.songId]; setTitle(sg.emoji + ' ' + sg.title);
    const step = { id: 'song:' + sg.id, type: 'song', songId: sg.id };
    const inst = runStep(root, step, { after: (r, stars) => U.results({ stars, pearls: r.pearls, stickers: r.stickers, buttons: [{ label: '🔁 Again', fn: () => go('song', p) }, { label: 'Songbook ➡', cls: 'primary', fn: () => go('songbook') }] }) });
    return () => inst.destroy();
  };

  screens.freeplay = (root) => {
    setTitle('Free Play'); AX.Axie.say('You are the composer! Try a story idea, or play anything you like. There are no wrong notes here. 🎹');
    root.innerHTML = `<div class="activity song"><div class="sp-bar"><div class="seg lbls"><button data-l="none">No labels</button><button data-l="c">Cs</button><button data-l="names">A B C</button><button data-l="solfege">Do Re Mi</button></div>
      <button class="chip" id="cantus">🎻 Play with Axie</button>
      <button class="chip" id="rec">⏺ Record</button><button class="chip" id="play" disabled>▶ Play it back</button></div>
      <div class="free-stage"><div class="story-card"><span class="story-emoji" aria-hidden="true"></span><h2 class="story-title"></h2><p class="story-prompt"></p><button class="btn small" id="story-next">✨ Another idea</button><small>Your music, your rules. Try recording your story!</small></div></div><div class="sp-piano"></div></div>`;
    const stories = [
      ['🐟', 'A little fish says hello', 'Play three notes for “hel-lo, friend!” Then answer with three different notes.'],
      ['🌧️', 'Raindrops on the pond', 'Try a few high notes like tiny raindrops. Leave quiet spaces between them.'],
      ['🐢', 'Turtle and butterfly', 'Make a slow tune for a turtle. Now play it faster for a butterfly!'],
      ['🌙', 'Axie’s sleepy song', 'Make a gentle tune with C, D and E. Finish on C and let it rest.'],
      ['🏔️', 'Up the bubble mountain', 'Let your tune climb higher, then float back down. Where is its highest note?']
    ];
    let story = 0;
    const showStory = () => { const [emoji, title, prompt] = stories[story]; $('.story-emoji', root).textContent = emoji; $('.story-title', root).textContent = title; $('.story-prompt', root).textContent = prompt; };
    $('#story-next', root).addEventListener('click', () => { story = (story + 1) % stories.length; showStory(); });
    showStory();
    const piano = new AX.Piano($('.sp-piano', root), { from: 48, to: 84, labels: 'c' });
    let rec = false, tape = [], t0 = 0, timers = [], lastBounce = 0;
    let cantusOn = false, cantusTimer = null, cantusStep = 0;
    const bassline = [48, 45, 41, 43]; // C3, A2, F2, G2 (Boulanger 4-measure walking bassline)
    function playCantusLoop() {
      if (!cantusOn) return;
      const m = bassline[cantusStep % bassline.length];
      cantusStep++;
      piano.playNote(m, { dur: 1.4, gain: 0.65 });
      cantusTimer = setTimeout(playCantusLoop, 1600);
    }
    const setL = (m) => { piano.setLabels(m); root.querySelectorAll('[data-l]').forEach(b => b.classList.toggle('on', b.dataset.l === m)); };
    root.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => setL(b.dataset.l))); setL('c');
    piano.onNote = (m) => {
      if (rec) tape.push([m, performance.now() - t0]);
      const t = performance.now(); if (t - lastBounce > 400) { lastBounce = t; AX.Axie.bounce(); AX.Axie.setMood('happy', 900); }
    };
    $('#cantus', root).addEventListener('click', () => {
      cantusOn = !cantusOn;
      $('#cantus', root).classList.toggle('on', cantusOn);
      if (cantusOn) {
        cantusStep = 0;
        AX.Axie.say("I'll play the low notes. You make up a tune above them! Try the white keys and listen to our music together. 🎻✨");
        playCantusLoop();
      } else {
        clearTimeout(cantusTimer);
        AX.Axie.say("Nice playing! Try another melody whenever you like. 🎹");
      }
    });
    $('#rec', root).addEventListener('click', () => {
      rec = !rec; $('#rec', root).textContent = rec ? '⏹ Stop' : '⏺ Record'; $('#rec', root).classList.toggle('on', rec);
      if (rec) { timers.forEach(clearTimeout); timers = []; $('#play', root).disabled = true; tape = []; t0 = performance.now(); AX.Axie.say('Recording... play your song! 🎙️'); }
      else { $('#play', root).disabled = !tape.length; if (tape.length) AX.Axie.say('Press <b>Play it back</b> and I\'ll play your song! 🎶'); }
    });
    $('#play', root).addEventListener('click', () => {
      timers.forEach(clearTimeout); timers = []; AX.Axie.say('What a beautiful song! 🎵'); AX.Axie.setMood('sing', (tape[tape.length - 1][1]) + 800);
      tape.forEach(([m, t]) => timers.push(setTimeout(() => piano.playNote(m, { dur: 0.6 }), t)));
    });
    return () => { clearTimeout(cantusTimer); timers.forEach(clearTimeout); piano.destroy(); };
  };

  screens.closet = (root, p) => {
    setTitle("Axie's Closet"); const tab = (p && p.tab) || 'skin';
    const st = S.get();
    AX.Axie.say(`You have <b>${st.pearls}</b> 🫧 pearls! What should I wear?`);
    const tabs = [['skin', '🎨 Colors'], ['head', '👑 Hats'], ['face', '😎 Face'], ['neck', '🎀 Neck']];
    root.innerHTML = `<div class="seg tabs">${tabs.map(([k, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}</div><div class="closet"></div>`;
    root.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => go('closet', { tab: b.dataset.t })));
    const box = $('.closet', root);
    const items = tab === 'skin' ? Object.keys(AX.skins).map(k => ({ key: 'skin:' + k, id: k, name: AX.skins[k].name, emoji: '🦎', price: AX.skins[k].price, color: AX.skins[k].skin })) :
      Object.keys(AX.items).filter(k => AX.items[k].slot === tab).map(k => ({ key: 'item:' + k, id: k, name: AX.items[k].name, emoji: AX.items[k].emoji, price: AX.items[k].price }));
    items.forEach(it => {
      const owned = st.owned.includes(it.key) || it.price === 0;
      const on = tab === 'skin' ? st.skin === it.id : st.equipped[tab] === it.id;
      const b = document.createElement('button'); b.className = 'cl-card' + (on ? ' on' : '') + (!owned && st.pearls < it.price ? ' poor' : '');
      b.innerHTML = `<span class="ce" ${it.color ? `style="background:${it.color}"` : ''}>${it.emoji}</span><b>${it.name}</b><small>${on ? 'Wearing ✓' : owned ? 'Tap to wear' : it.price + ' 🫧'}</small>`;
      b.addEventListener('click', () => {
        if (!owned) {
          if (!S.spend(it.price)) { AX.audio.sfx.oops(); AX.Axie.say(`You need ${it.price - st.pearls} more pearls. Keep practicing! 💪`); return; }
          st.owned.push(it.key); S.save(); AX.audio.sfx.chime(); U.confetti(20); checkStickers().forEach(s => U.toast(s.emoji + ' ' + s.name, '🎉'));
        }
        if (tab === 'skin') st.skin = it.id; else st.equipped[tab] = on ? null : it.id;
        S.save(); AX.Axie.refresh(); AX.Axie.cheer(on ? 'Okay!' : 'I love it!! 😍'); go('closet', { tab });
      });
      box.appendChild(b);
    });
  };

  screens.stickers = (root) => {
    setTitle('Sticker Book'); const st = S.get();
    AX.Axie.say(`You've earned <b>${st.stickers.length}</b> of ${STICKERS.length} stickers! 🏅`);
    root.innerHTML = '<div class="sticker-grid"></div>'; const box = $('.sticker-grid', root);
    STICKERS.forEach(s => {
      const got = st.stickers.includes(s.id);
      const d = document.createElement('div'); d.className = 'sticker' + (got ? ' got' : '');
      d.innerHTML = `<span class="se">${got ? s.emoji : '❔'}</span><b>${s.name}</b><small>${s.desc}</small>`; box.appendChild(d);
    });
  };

  /* =============== Today's Dive (the daily routine) =============== */
  let dive = null;
  const warmupStep = { id: 'warmup-daily', type: 'warmup', icon: '🙌', title: 'Wiggle Warm-Up', set: 'pond' };
  function buildDive() {
    const st = S.get(), ci = currentLessonIndex();
    const unlocked = AX.lessons.filter((l, i) => isUnlocked(i));
    const flat = []; unlocked.forEach(l => l.steps.forEach(s => flat.push(s)));
    const got = (s) => st.steps[s.id] || 0;
    const plan = [{ step: warmupStep, label: 'Wiggle Warm-Up' }]; const used = new Set(['warmup-daily']);
    const add = (s, label) => { if (s && !used.has(s.id)) { used.add(s.id); plan.push({ step: s, label }); } };
    const cur = ci >= 0 ? AX.lessons[ci] : null;
    if (cur) cur.steps.filter(s => got(s) === 0 && s.type !== 'song').slice(0, 2).forEach(s => add(s, s.type === 'learn' ? 'Learn something new' : 'Practice game'));
    const games = flat.filter(s => ['hunt', 'fingers', 'echo', 'read', 'rhythm', 'echodetective', 'contrary', 'cadence', 'transpose', 'peak'].includes(s.type) && !used.has(s.id));
    games.sort((a, b) => got(a) - got(b) || Math.random() - 0.5);
    if (plan.length < 3) add(games[0], 'Ear & finger gym');
    add(games[1], 'Ear detective / Brain game');
    const songSteps = flat.filter(s => s.type === 'song');
    add(cur && cur.steps.find(s => s.type === 'song' && got(s) < 3), 'Song time');
    const songsPlayed = songSteps.filter(s => got(s) >= 1 && !used.has(s.id)).sort(() => Math.random() - 0.5);
    if (!plan.some(p => p.step.type === 'song')) add(songsPlayed.shift(), 'Song time');
    add(songsPlayed[0], 'Sing & play a favorite');
    if (plan.length < 4) { const g = flat.filter(s => s.type !== 'learn' && !used.has(s.id)); add(g[0], 'Bonus round'); }
    return plan;
  }
  screens.divePlan = (root) => {
    setTitle('Choose your Dive'); AX.Axie.say('A small splash counts, too! Choose your adventure for today. 🫧');
    const full = buildDive(), short = full.slice(0, 3);
    const choices = [[short, '🫧', 'Little Splash', 'Three little activities, at your own pace.']];
    if (full.length > short.length) choices.push([full, '🤿', 'Deep Dive', 'A longer mix of learning and practice.']);
    root.innerHTML = `<div class="dive-choices">${choices.map(([plan, emoji, title, desc], i) => `<section class="card"><span class="choice-emoji">${emoji}</span><h2>${title}</h2><p>${desc}</p><ol>${plan.map(item => `<li>${item.step.title}</li>`).join('')}</ol><button class="btn primary" data-dive="${i}">Let’s dive! · ${plan.length} activities</button></section>`).join('')}</div><p class="dive-reassurance">Need a break? Go Home and continue your Dive during this visit.</p>`;
    root.querySelectorAll('[data-dive]').forEach(b => b.addEventListener('click', () => startDive(+b.dataset.dive === 0 ? short : full)));
  };
  function startDive(plan) { dive = { plan: plan || buildDive(), i: 0, secs: 0 }; AX.audio.ensure(); AX.audio.sfx.chime(); go('dive'); }
  screens.dive = (root) => {
    if (!dive) return startDive();
    if (dive.i >= dive.plan.length) return go('diveDone');
    const item = dive.plan[dive.i]; setTitle(`🤿 Dive: ${item.label}`);
    root.innerHTML = `<div class="dive-strip"><span>Activity ${dive.i + 1} of ${dive.plan.length}</span><div class="dive-dots" aria-hidden="true">${dive.plan.map((p, k) => `<i class="${k < dive.i ? 'done' : k === dive.i ? 'now' : ''}"></i>`).join('')}</div><span class="dive-time"></span></div><div class="dive-body"></div>`;
    const body = $('.dive-body', root);
    const showTime = () => { $('.dive-time', root).textContent = `⏱ ${Math.floor(dive.secs / 60)}:${String(dive.secs % 60).padStart(2, '0')}`; };
    showTime();
    const tm = setInterval(() => { if (practicing()) dive.secs++; showTime(); }, 1000);
    const inst = runStep(body, item.step, {
      after: (r, stars) => U.results({ stars, pearls: r.pearls, stickers: r.stickers, buttons: [
        { label: '🔁 Again', fn: () => go('dive') },
        { label: dive.i + 1 >= dive.plan.length ? 'Finish dive 🏁' : 'Next ➡', cls: 'primary', fn: () => { dive.i++; go('dive'); } }] })
    });
    return () => { clearInterval(tm); inst && inst.destroy && inst.destroy(); };
  };
  screens.diveDone = (root) => {
    if (!dive) return go('home');
    setTitle('Dive complete!'); const st = S.get();
    const mins = Math.max(1, Math.round(dive.secs / 60));
    st.flags.dives++; const today = S.todayInfo(); today.dives = (today.dives || 0) + 1;
    S.logActivity(); S.addPearls(15); const stk = checkStickers(); S.save(); updatePills();
    AX.audio.sfx.fanfare(); U.confetti(70); AX.Axie.setMood('happy', 6000); AX.Axie.bounce();
    AX.Axie.say(`You made music for about ${mins} minute${mins > 1 ? 's' : ''}! Time to stretch your fingers. +15 🫧 pearls!`);
    root.innerHTML = `<div class="card center"><h2>🎉 Dive Complete! 🎉</h2><p class="lead">Practice makes progress, ${U.escape(st.name)}!</p><p class="earn">+15 🫧 pearls</p>${stk.map(s => `<p class="earn">${s.emoji} New sticker: <b>${s.name}</b></p>`).join('')}<p>Tell a grown-up what your favorite part was!</p><button class="btn primary big" id="hm">Home 🏠</button></div>`;
    $('#hm', root).addEventListener('click', () => { dive = null; go('home'); });
    dive = null;
  };

  /* =============== Grown-ups corner =============== */
  function parentGate() {
    const a = 6 + Math.floor(Math.random() * 5), b = 6 + Math.floor(Math.random() * 5);
    U.modal(`<h2>Grown-ups only 🔐</h2><p>What is ${a} × ${b}?</p><input id="gate" type="number" inputmode="numeric" class="inp">`, [
      { label: 'Cancel' }, { label: 'Enter', cls: 'primary', fn: (box) => { if (+box.querySelector('#gate').value === a * b) go('parent'); else U.toast('Not quite!'); }, keep: false }]);
  }
  screens.parent = (root) => {
    setTitle('Grown-ups Corner'); AX.Axie.say('Shh, grown-up stuff! 🤫');
    const st = S.get();
    const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const e = st.log[S.dayKey(d)] || { acts: 0, secs: 0 }; days.push({ d, mins: Math.round(e.secs / 60), acts: e.acts }); }
    const maxm = Math.max(15, ...days.map(x => x.mins));
    const lessonRows = AX.lessons.map((l, i) => `<tr><td>${i + 1}. ${l.emoji} ${l.title}</td><td>${U.stars(Math.round(lessonStars(l) / (l.steps.length * 3) * 3))}</td></tr>`).join('');
    root.innerHTML = `<div class="parent">
      <section class="card"><h3>Practice - last 14 days</h3><div class="bars">${days.map(x => `<div class="bar-col"><div class="bar" style="height:${Math.max(3, x.mins / maxm * 100)}%" title="${x.mins} min"></div><small>${x.d.getDate()}</small><small>${x.mins}m</small></div>`).join('')}</div>
        <p>Streak: <b>${S.streak()}</b> days · Goal: 20 min, 5 days a week. Short, joyful focus beats long, robotic drilling!</p></section>

      <section class="card boulanger-guide">
        <h3>🏛️ The "Little Boulanger" Pedagogy</h3>
        <p>Adapted from legendary French pedagogue <b>Nadia Boulanger</b> (teacher of Copland, Glass, and Quincy Jones) for an 8-year-old:</p>
        <ol style="padding-left:18px;margin:8px 0;line-height:1.45;">
          <li><b>The Inner Ear First:</b> Sing on <i>Do-Re-Mi</i> before touching the keys. Prevents button-pushing!</li>
          <li><b>Horizontal over Vertical:</b> Left hand is an independent singer, not just background accompaniment.</li>
          <li><b>Keyboard Harmony:</b> Transpose tunes across 3 keys by ear; feel tension and arrival at Home (I).</li>
          <li><b>La Grande Ligne:</b> Feel the overarching momentum from the first note to the mountain peak!</li>
        </ol>
        <small style="color:#567">See <b>BOULANGER_METHOD.md</b> in the repository for the full 18–24 month curriculum guide.</small>
      </section>

      <section class="card"><h3>Lessons</h3><table>${lessonRows}</table></section>
      <section class="card"><h3>Settings</h3>
        <label>Her name <input class="inp" id="pn" value="${U.escape(st.name)}"></label>
        <label>Axolotl's name <input class="inp" id="an" value="${U.escape(st.axieName)}"></label>
        <label>Volume <input type="range" id="vol" min="0.1" max="1" step="0.05" value="${st.settings.volume}"></label>
        <label class="row"><input type="checkbox" id="unl" ${st.settings.unlockAll ? 'checked' : ''}> Unlock all lessons (skip ahead)</label>
        <div class="row"><button class="btn small" id="midi">🎹 Connect MIDI keyboard</button><button class="btn small" id="mic">🎤 Test real-piano listening</button></div>
        <small>MIDI and microphone need the page served over HTTPS (see README).</small>
      </section>
      <section class="card"><h3>Backup progress</h3><div class="row"><button class="btn small" id="exp">⬇ Download backup</button><button class="btn small" id="imp">⬆ Restore backup</button><button class="btn small danger" id="rst">Reset everything</button></div><input type="file" id="file" accept=".json" hidden></section>
      <section class="card tips"><h3>Practice buddy tips</h3><ul>
        <li>Sit with her for the first few weeks - 5 minutes of your attention is gold.</li>
        <li>Watch her hands: curved fingers (bubble hands), loose wrists, feet flat on the floor or footstool.</li>
        <li>Say the note name <b>out loud</b> before playing, and <b>sing</b> every song on Do-Re-Mi - it builds the inner ear.</li>
        <li>Ask: <i>"Where is the Mountain Peak of this song?"</i> to connect her to La Grande Ligne!</li>
        <li>End on a high note. Always finish with a favorite piece she loves to play.</li>
      </ul></section></div>`;
    $('#pn', root).addEventListener('change', e => { st.name = e.target.value.trim() || 'Ayana'; S.save(); });
    $('#an', root).addEventListener('change', e => { st.axieName = e.target.value.trim() || 'Axie'; S.save(); });
    $('#vol', root).addEventListener('input', e => { st.settings.volume = +e.target.value; AX.audio.setVolume(+e.target.value); S.save(); AX.audio.sfx.pop(); });
    $('#unl', root).addEventListener('change', e => { st.settings.unlockAll = e.target.checked; S.save(); });
    $('#midi', root).addEventListener('click', async () => { const r = await AX.input.enableMidi(); st.settings.midi = r.ok; S.save(); U.toast(r.msg); });
    $('#mic', root).addEventListener('click', async () => { const r = await AX.input.startMic(); U.toast(r.msg); if (r.ok) setTimeout(() => AX.input.stopMic(), 6000); });
    $('#exp', root).addEventListener('click', () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([S.exportJSON()], { type: 'application/json' })); a.download = 'axie-piano-backup-' + S.dayKey() + '.json'; a.click(); });
    $('#imp', root).addEventListener('click', () => $('#file', root).click());
    $('#file', root).addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { S.importJSON(t); AX.Axie.refresh(); U.toast('Backup restored!'); go('home'); } catch (x) { U.toast('That file did not work.'); } }); });
    $('#rst', root).addEventListener('click', () => U.modal('<h2>Reset everything?</h2><p>All stars, pearls and stickers will be erased.</p>', [{ label: 'Keep it' }, { label: 'Erase', cls: 'danger', fn: () => { S.reset(); AX.Axie.refresh(); go('home'); } }]));
  };

  /* =============== boot =============== */
  function firstRun() {
    const st = S.get();
    U.modal(`<h2>Welcome to the pond! 🦎</h2><p>Hi! I'm an axolotl and I'm going to learn piano with you!</p><label>What's your name?<input class="inp" id="n1" value="${U.escape(st.name)}"></label><label>What should you call me?<input class="inp" id="n2" value="${U.escape(st.axieName)}"></label>`,
      [{ label: "Let's go! 🎹", cls: 'primary', fn: (box) => { st.name = box.querySelector('#n1').value.trim() || 'Ayana'; st.axieName = box.querySelector('#n2').value.trim() || 'Axie'; st.firstRun = false; S.save(); AX.audio.ensure(); go('home'); } }], 'welcome');
  }
  function bubbles() { const b = $('.bubbles'); for (let i = 0; i < 14; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; const z = 10 + Math.random() * 40; s.style.width = s.style.height = z + 'px'; s.style.animationDuration = 12 + Math.random() * 18 + 's'; s.style.animationDelay = -Math.random() * 20 + 's'; b.appendChild(s); } }

  AX.Axie.mount($('#axie-pane'));
  bubbles(); updatePills();
  // practice-time tracking (only counts on activity screens while the page is visible)
  setInterval(() => { if (ACTIVITY.has(current.name) && practicing()) S.addSeconds(1); }, 1000);
  if (S.get().settings.midi) AX.input.enableMidi();
  go('home');
  // handy deep links, e.g. index.html#map  #freeplay  #step/L3-hunt  #song/hcb
  const hash = location.hash.slice(1).split('/');
  if (hash[0] === 'dive') go('divePlan');
  else if (hash[0] === 'step') { const l = AX.lessons.find(x => x.steps.some(s => s.id === hash[1])); if (l) go('step', { lessonId: l.id, stepId: hash[1], back: { name: 'home' } }); }
  else if (hash[0] === 'song' && AX.songs.byId[hash[1]]) go('song', { songId: hash[1], back: { name: 'home' } });
  else if (screens[hash[0]] && ['map', 'songbook', 'freeplay', 'closet', 'stickers'].includes(hash[0])) go(hash[0]);
  else if (S.get().firstRun) firstRun();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.update().catch(() => {});
    }).catch(() => { });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!window.__swReloaded) {
        window.__swReloaded = true;
        location.reload();
      }
    });
  }
  AX.app = { go };
})();
