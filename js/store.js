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
    compositions: [],   // locally saved performances; timing and duration in milliseconds
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
  const LIMITS = { songs: 50, notes: 1500, duration: 120000 };
  function validComposition(c) {
    return c && typeof c.id === 'string' && c.id.length <= 100 &&
      typeof c.title === 'string' && c.title.trim().length > 0 && c.title.length <= 60 &&
      Number.isFinite(c.created) && Array.isArray(c.notes) && c.notes.length > 0 && c.notes.length <= LIMITS.notes &&
      c.notes.every(n => Number.isInteger(n.m) && n.m >= 0 && n.m <= 127 &&
        Number.isFinite(n.t) && n.t >= 0 && n.t <= LIMITS.duration &&
        Number.isFinite(n.d) && n.d >= 30 && n.t + n.d <= LIMITS.duration + 30 &&
        Number.isFinite(n.vel) && n.vel > 0 && n.vel <= 1);
  }
  function commit(next) {
    // Keep the last good state if storage is full or unavailable.
    localStorage.setItem(KEY, JSON.stringify(next));
    s = next; listeners.forEach(f => f(s));
  }
  function saveComposition(composition) {
    if (!validComposition(composition)) throw new Error('This recording could not be saved.');
    if (s.compositions.some(c => c.id === composition.id)) throw new Error('This song is already saved.');
    if (s.compositions.length >= LIMITS.songs) throw new Error('Your music shelf is full. Download a backup, then remove a song to make room.');
    const copy = JSON.parse(JSON.stringify(composition));
    commit({ ...s, compositions: [...s.compositions, copy] });
    return copy.id;
  }

  return {
    get: () => s,
    save,
    onChange: (f) => listeners.push(f),
    reset() { s = defaults(); save(); },
    importJSON(txt) {
      const o = JSON.parse(txt);
      const object = v => v && typeof v === 'object' && !Array.isArray(v);
      if (!object(o) || o.v !== 1 || !object(o.steps) || !object(o.songs) || !object(o.log) ||
          !object(o.settings) || !Array.isArray(o.owned) || !Array.isArray(o.stickers) ||
          typeof o.name !== 'string' || typeof o.axieName !== 'string') throw new Error('Not an Axie backup.');
      const next = merge(defaults(), o);
      if (!Array.isArray(next.compositions) || next.compositions.length > LIMITS.songs ||
          !next.compositions.every(validComposition) || new Set(next.compositions.map(c => c.id)).size !== next.compositions.length) throw new Error('Invalid saved songs.');
      commit(next);
    },
    compositionLimits: LIMITS,
    saveComposition,
    renameComposition(id, title) {
      title = String(title).trim().slice(0, 60);
      if (!title) throw new Error('Give your song a name first.');
      commit({ ...s, compositions: s.compositions.map(c => c.id === id ? { ...c, title } : c) });
    },
    deleteComposition(id) { commit({ ...s, compositions: s.compositions.filter(c => c.id !== id) }); },
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
