/* Progress + settings, saved in the tablet's localStorage (no backend needed). */
window.AX = window.AX || {};
AX.store = (function () {
  const KEY = 'axie-piano-v1';
  const defaults = () => ({
    v: 1,
    name: 'Ayana',
    axieName: 'Axie',
    pearls: 0,
    totalPearls: 0,
    skin: 'pink',
    owned: ['skin:pink'],
    equipped: { head: null, face: null, neck: null },
    stickers: [],
    steps: {},          // stepId -> best stars
    songs: {},          // songId -> {best, plays}
    flags: { sung: 0, dives: 0 },
    log: {},            // 'YYYY-MM-DD' -> {acts, secs}
    settings: { unlockAll: false, volume: 0.8, lyrics: 'words', fingers: true, midi: false },
    firstRun: true,
    created: Date.now()
  });

  function merge(base, saved) {
    const out = Object.assign({}, base, saved);
    ['settings', 'equipped', 'flags'].forEach(k => { out[k] = Object.assign({}, base[k], (saved && saved[k]) || {}); });
    return out;
  }
  let s;
  try { const raw = JSON.parse(localStorage.getItem(KEY)); s = raw ? merge(defaults(), raw) : defaults(); }
  catch (e) { s = defaults(); }

  const listeners = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } listeners.forEach(f => f(s)); }
  const dayKey = (d) => (d || new Date()).toLocaleDateString('en-CA');
  function today() { const k = dayKey(); if (!s.log[k]) s.log[k] = { acts: 0, secs: 0 }; return s.log[k]; }

  return {
    get: () => s,
    save,
    onChange: (f) => listeners.push(f),
    reset() { s = defaults(); save(); },
    importJSON(txt) { const o = JSON.parse(txt); s = merge(defaults(), o); save(); },
    exportJSON: () => JSON.stringify(s, null, 2),
    addPearls(n) { s.pearls += n; if (n > 0) s.totalPearls += n; save(); },
    spend(n) { if (s.pearls < n) return false; s.pearls -= n; save(); return true; },
    logActivity() { today().acts++; save(); },
    addSeconds(n) { today().secs += n; if (today().secs % 10 === 0) save(); },
    todayInfo() { return today(); },
    dayKey,
    streak() {
      // consecutive days with at least one finished activity (today may still be pending)
      let d = new Date(); let count = 0;
      const has = (dt) => { const e = s.log[dayKey(dt)]; return e && e.acts > 0; };
      if (!has(d)) d.setDate(d.getDate() - 1);
      while (has(d)) { count++; d.setDate(d.getDate() - 1); }
      return count;
    },
    awardSticker(id) { if (s.stickers.includes(id)) return false; s.stickers.push(id); save(); return true; }
  };
})();
