/* Shared UI helpers: toasts, modals, results, confetti, learn cards, warm-up checklist */
window.AX = window.AX || {};
AX.ui = (function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const overlay = () => $('#overlay');
  const stars = (n, max) => { max = max || 3; let s = ''; for (let i = 0; i < max; i++) s += `<span class="${i < n ? 'on' : ''}">★</span>`; return s; };

  function toast(msg, emoji) {
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = (emoji ? `<span>${emoji}</span> ` : '') + msg;
    $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3100);
  }

  function modal(html, buttons, cls) {
    const o = overlay(); o.innerHTML = '';
    const box = document.createElement('div'); box.className = 'modal ' + (cls || '');
    box.innerHTML = html + '<div class="btns"></div>';
    const bw = box.querySelector('.btns');
    (buttons || []).forEach(b => {
      const bt = document.createElement('button'); bt.className = 'btn ' + (b.cls || ''); bt.innerHTML = b.label;
      bt.addEventListener('click', () => { if (b.keep !== true) close(); if (b.fn) b.fn(box); });
      bw.appendChild(bt);
    });
    o.appendChild(box); o.classList.add('open');
    return box;
  }
  function close() { const o = overlay(); o.classList.remove('open'); o.innerHTML = ''; }

  function confetti(n) {
    const em = ['🫧', '⭐', '🌸', '💖', '🎵', '✨'];
    for (let i = 0; i < (n || 36); i++) {
      const s = document.createElement('span'); s.className = 'confetti'; s.textContent = em[Math.floor(Math.random() * em.length)];
      s.style.left = Math.random() * 100 + 'vw'; s.style.animationDuration = 2 + Math.random() * 2 + 's';
      s.style.animationDelay = Math.random() * 0.6 + 's'; s.style.fontSize = 18 + Math.random() * 22 + 'px';
      document.body.appendChild(s); setTimeout(() => s.remove(), 4800);
    }
  }

  // results: {title, stars, pearls, stickers:[], buttons:[{label,fn,cls}]}
  function results(r) {
    const msgs = ['Splashtastic!', 'Fin-tastic!', 'Bubble-ful!', 'You rock!', 'Amazing!'];
    const title = r.title || (r.stars >= 3 ? msgs[Math.floor(Math.random() * msgs.length)] : r.stars === 2 ? 'Great job!' : 'Nice try - you did it!');
    let html = `<h2>${title}</h2><div class="stars big">${stars(r.stars)}</div>`;
    if (r.pearls) html += `<p class="earn">+${r.pearls} 🫧 pearls</p>`;
    (r.stickers || []).forEach(s => { html += `<p class="earn sticker-earn">${s.emoji} New sticker: <b>${s.name}</b>!</p>`; });
    if (r.note) html += `<p>${r.note}</p>`;
    modal(html, r.buttons || [{ label: 'Yay!', cls: 'primary' }], 'results');
    const spans = overlay().querySelectorAll('.stars span');
    spans.forEach((sp, i) => { sp.style.animationDelay = (0.25 + i * 0.3) + 's'; if (sp.classList.contains('on')) setTimeout(() => AX.audio.sfx.star(i), 250 + i * 300); });
    if (r.stars >= 2) { AX.audio.sfx.chime(); confetti(r.stars === 3 ? 50 : 24); AX.Axie.cheer(r.stars === 3 ? 'Wow, 3 stars!! 🌟' : 'Great work!'); }
    else AX.Axie.cheer('You finished it - that\'s what counts! 💕');
  }

  // a stack of friendly slides: {title, html, html2, piano:{from,to,labels,marks}, staff:{...}, hand:{hand,play}}
  function learnCard(root, step, onDone) {
    let i = 0, piano = null;
    const slides = step.slides;
    root.innerHTML = '<div class="activity learn"><div class="card learn-card"></div></div>';
    const card = $('.learn-card', root);
    function show() {
      if (piano) { piano.destroy(); piano = null; }
      const s = slides[i];
      card.innerHTML = `<h2>${s.title}</h2><p class="lead">${s.html}</p>${s.html2 || ''}<div class="visual"></div>` +
        `<div class="learn-nav"><div class="dots">${slides.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>` +
        `<button class="btn primary big next">${i === slides.length - 1 ? 'Got it! ✅' : 'Next ➡'}</button></div>`;
      const vis = $('.visual', card);
      if (s.staff) vis.insertAdjacentHTML('beforeend', `<div class="staff-wrap">${AX.staff.svg(s.staff.notes.map(AX.music.parse), s.staff)}</div>`);
      if (s.hand) {
        vis.insertAdjacentHTML('beforeend', `<div class="hand-wrap">${AX.hand.svg({ hand: s.hand.hand })}</div>`);
        AX.hand.attach($('.hand-wrap', vis), s.hand.hand, (f) => { AX.audio.noteOn(AX.hand.midiFor(s.hand.hand, f), { dur: 0.6 }); });
      }
      if (s.piano) {
        vis.insertAdjacentHTML('beforeend', '<div class="learn-piano"></div>');
        piano = new AX.Piano($('.learn-piano', vis), { from: s.piano.from, to: s.piano.to, labels: s.piano.labels });
        (s.piano.marks || []).forEach(([n, cls, f]) => piano.mark(AX.music.parse(n), { cls, finger: f }));
      }
      AX.Axie.say(s.axie || 'Take your time - tap anything you like! 🎹');
      $('.next', card).addEventListener('click', () => { AX.audio.ensure(); if (i < slides.length - 1) { i++; show(); } else onDone(); });
    }
    show();
    return { destroy() { if (piano) piano.destroy(); } };
  }

  // checklist of off-the-bench activities
  function warmup(root, set, onDone) {
    const w = AX.warmups[set || 'default'];
    root.innerHTML = `<div class="activity learn"><div class="card"><h2>${w.title}</h2><p class="lead">Tap each one when you've done it!</p><div class="checklist"></div><button class="btn primary big done" disabled>All done! 🎉</button></div></div>`;
    const list = $('.checklist', root); let left = w.items.length;
    w.items.forEach(([e, t]) => {
      const b = document.createElement('button'); b.className = 'check'; b.innerHTML = `<span class="em">${e}</span><span class="tx">${t}</span><span class="tick">✔</span>`;
      b.addEventListener('click', () => { if (b.classList.contains('on')) return; b.classList.add('on'); AX.audio.sfx.pop(); AX.Axie.bounce(); if (--left === 0) { $('.done', root).disabled = false; AX.Axie.cheer('Warmed up and ready to swim! 🐟'); } });
      list.appendChild(b);
    });
    $('.done', root).addEventListener('click', onDone);
    AX.Axie.say('Warm hands play happy music! 🙌');
    return { destroy() {} };
  }

  return { $, stars, toast, modal, close, confetti, results, learnCard, warmup };
})();
