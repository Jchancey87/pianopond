/* Real Musical Notation Engine: Single staff, Grand Staff, measures, time signatures,
   note durations (quarter, half, dotted half, whole), ledger lines, lyrics, and interactive highlighting. */
window.AX = window.AX || {};
AX.staff = (function () {
  const M = AX.music;

  // Vertical position on staff. E4 (treble bottom line) = 0. G2 (bass bottom line) = 0.
  function diatonicPos(midi, clef) {
    const dBottom = clef === 'treble' ? 4 * 7 + 2 : 2 * 7 + 4; // E4 or G2
    return M.diatonic(midi) - dBottom;
  }

  // Draw a standard single staff quiz card (flashcard mode)
  function svg(notes, opts) {
    opts = opts || {};
    const clef = opts.clef || 'treble';
    const W = 140 + notes.length * 68, H = 160;
    const yOf = (pos) => 102 - pos * 7;
    let s = `<svg class="staff-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    // Staff lines (5 lines)
    for (let i = 0; i < 5; i++) {
      const hot = (clef === 'treble' && i === 1) || (clef === 'bass' && i === 3); // G line or F line
      s += `<line x1="12" x2="${W - 12}" y1="${yOf(i * 2)}" y2="${yOf(i * 2)}" stroke="${hot ? '#ff6b8b' : '#37474f'}" stroke-width="${hot ? 2.8 : 1.8}"/>`;
    }
    // Bar line start
    s += `<line x1="12" x2="12" y1="${yOf(0)}" y2="${yOf(8)}" stroke="#37474f" stroke-width="3"/>`;
    // Clef symbol
    s += clef === 'treble'
      ? `<text x="18" y="${yOf(0) + 14}" font-size="94" fill="#2c3e50" font-family="'Noto Music','Segoe UI Symbol','Apple Symbols',serif">𝄞</text><text x="22" y="22" font-size="12" font-weight="800" fill="#ff6b8b">Treble · G Line</text>`
      : `<text x="20" y="${yOf(0) - 14}" font-size="68" fill="#2c3e50" font-family="'Noto Music','Segoe UI Symbol','Apple Symbols',serif">𝄢</text><text x="22" y="22" font-size="12" font-weight="800" fill="#ff6b8b">Bass · F Line</text>`;

    notes.forEach((m, i) => {
      const x = 130 + i * 68;
      const pos = diatonicPos(m, clef);
      const y = yOf(pos);
      // Ledger lines
      for (let p = -2; p >= pos; p -= 2) s += `<line x1="${x - 17}" x2="${x + 17}" y1="${yOf(p)}" y2="${yOf(p)}" stroke="#37474f" stroke-width="2.2"/>`;
      for (let p = 10; p <= pos; p += 2) s += `<line x1="${x - 17}" x2="${x + 17}" y1="${yOf(p)}" y2="${yOf(p)}" stroke="#37474f" stroke-width="2.2"/>`;
      const act = opts.active === i;
      const col = act ? '#ff4f7b' : '#263238';
      // Stem
      if (pos < 4) s += `<line x1="${x + 8.5}" x2="${x + 8.5}" y1="${y}" y2="${y - 36}" stroke="${col}" stroke-width="2.5"/>`;
      else s += `<line x1="${x - 8.5}" x2="${x - 8.5}" y1="${y}" y2="${y + 36}" stroke="${col}" stroke-width="2.5"/>`;
      // Notehead
      s += `<ellipse cx="${x}" cy="${y}" rx="10" ry="7.5" fill="${col}" transform="rotate(-20 ${x} ${y})"/>`;
      if (opts.labels) s += `<text x="${x}" y="${H - 8}" text-anchor="middle" font-size="20" font-weight="800" fill="#ff6b8b">${M.name(m)}</text>`;
    });
    return s + '</svg>';
  }

  // Draw full sheet music score for Song Player with real measures, time sig, note values, and lyrics
  function renderSongScore(song, activeIdx, opts) {
    opts = opts || {};
    const notes = song.notes;
    const clef = song.hand === 'L' ? 'bass' : 'treble';
    const timeSig = song.timeSig || [4, 4];
    const beatsPerMeasure = timeSig[0];
    const noteSpacing = 58;
    const startX = 130;
    const yOf = (pos) => 96 - pos * 6.5;

    // Calculate measure boundaries
    let totalBeats = 0;
    notes.forEach(n => { totalBeats += n.beats; });
    const numMeasures = Math.ceil(totalBeats / beatsPerMeasure);

    // Compute total width
    const totalW = Math.max(760, startX + notes.length * noteSpacing + 90);
    const H = 175;

    let s = `<svg class="sheet-score-svg" viewBox="0 0 ${totalW} ${H}" width="${totalW}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;

    // Background sheet paper tint
    s += `<rect width="${totalW}" height="${H}" fill="#ffffff" rx="14"/>`;

    // 5 Staff lines across entire score
    for (let i = 0; i < 5; i++) {
      const y = yOf(i * 2);
      s += `<line x1="20" x2="${totalW - 20}" y1="${y}" y2="${y}" stroke="#475569" stroke-width="1.8"/>`;
    }

    // Initial measure brace / bar
    s += `<line x1="20" x2="20" y1="${yOf(0)}" y2="${yOf(8)}" stroke="#1e293b" stroke-width="3"/>`;

    // Clef
    if (clef === 'treble') {
      s += `<text x="28" y="${yOf(0) + 14}" font-size="90" fill="#1e293b" font-family="'Noto Music','Segoe UI Symbol','Apple Symbols',serif">𝄞</text>`;
    } else {
      s += `<text x="28" y="${yOf(0) - 12}" font-size="64" fill="#1e293b" font-family="'Noto Music','Segoe UI Symbol','Apple Symbols',serif">𝄢</text>`;
    }

    // Time signature (e.g. 4/4 or 3/4)
    s += `<text x="88" y="${yOf(6) + 4}" font-size="28" font-weight="900" fill="#1e293b" text-anchor="middle" font-family="'Baloo 2',system-ui,serif">${timeSig[0]}</text>`;
    s += `<text x="88" y="${yOf(2) + 4}" font-size="28" font-weight="900" fill="#1e293b" text-anchor="middle" font-family="'Baloo 2',system-ui,serif">${timeSig[1]}</text>`;

    // Measure tracking
    let currentBeatCount = 0;
    let measureIndex = 1;
    const accidentals = new Map();

    // Draw notes
    notes.forEach((nt, i) => {
      const x = startX + i * noteSpacing;
      const pos = diatonicPos(nt.m, clef);
      const y = yOf(pos);
      const isActive = i === activeIdx;
      const isPast = activeIdx >= 0 && i < activeIdx;

      // Check if measure bar line should be placed before this note (if it crossed a bar)
      if (currentBeatCount > 0 && currentBeatCount % beatsPerMeasure === 0) {
        accidentals.clear();
        const barX = x - noteSpacing * 0.45;
        s += `<line x1="${barX}" x2="${barX}" y1="${yOf(0)}" y2="${yOf(8)}" stroke="#64748b" stroke-width="2"/>`;
        s += `<text x="${barX + 6}" y="${yOf(8) - 6}" font-size="11" font-weight="700" fill="#94a3b8">${++measureIndex}</text>`;
      }
      currentBeatCount += nt.beats;

      // With no key signature, show each sharp and cancel it when the same
      // staff position returns to a natural within this measure.
      const sharp = M.isBlack(nt.m);
      const previousSharp = accidentals.get(pos) || false;
      if (sharp !== previousSharp) {
        s += `<text class="score-accidental" x="${x - 24}" y="${y + 6}" font-size="22" fill="#1e293b">${sharp ? '♯' : '♮'}</text>`;
      }
      accidentals.set(pos, sharp);

      // Ledger lines
      for (let p = -2; p >= pos; p -= 2) s += `<line x1="${x - 16}" x2="${x + 16}" y1="${yOf(p)}" y2="${yOf(p)}" stroke="#475569" stroke-width="2"/>`;
      for (let p = 10; p <= pos; p += 2) s += `<line x1="${x - 16}" x2="${x + 16}" y1="${yOf(p)}" y2="${yOf(p)}" stroke="#475569" stroke-width="2"/>`;

      // Notehead styling based on beat duration
      const isQuarter = nt.beats <= 1.2 && nt.beats >= 0.8;
      const isEighth = nt.beats < 0.8;
      const isHalf = nt.beats > 1.2 && nt.beats <= 2.2;
      const isDottedHalf = nt.beats > 2.2 && nt.beats <= 3.2;
      const isWhole = nt.beats > 3.2;

      // Color scheme
      let noteColor = '#1e293b';
      if (isActive) noteColor = '#ff4f7b';
      else if (isPast) noteColor = '#94a3b8';

      // Active glow / highlight box
      if (isActive) {
        s += `<rect x="${x - 18}" y="${yOf(8) - 14}" width="36" height="${yOf(0) - yOf(8) + 40}" rx="10" fill="rgba(255, 107, 139, 0.16)"/>`;
        s += `<circle cx="${x}" cy="${y}" r="20" fill="none" stroke="#ff4f7b" stroke-width="3" opacity="0.8"><animate attributeName="r" values="16;24;16" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.2s" repeatCount="indefinite"/></circle>`;
      }

      // Notehead
      const rx = 9.5, ry = 7;
      if (isWhole || isHalf || isDottedHalf) {
        // Hollow notehead
        s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#ffffff" stroke="${noteColor}" stroke-width="3" transform="rotate(-20 ${x} ${y})"/>`;
      } else {
        // Solid filled notehead
        s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${noteColor}" transform="rotate(-20 ${x} ${y})"/>`;
      }

      // Dot for dotted notes
      if (isDottedHalf) {
        s += `<circle cx="${x + 15}" cy="${y}" r="3" fill="${noteColor}"/>`;
      }

      // Stem (Whole notes have no stem)
      if (!isWhole) {
        const stemUp = pos < 4;
        const stemX = stemUp ? x + 8 : x - 8;
        const stemY2 = stemUp ? y - 35 : y + 35;
        s += `<line x1="${stemX}" x2="${stemX}" y1="${y}" y2="${stemY2}" stroke="${noteColor}" stroke-width="2.4"/>`;
        // Eighth note flag
        if (isEighth) {
          if (stemUp) s += `<path d="M${stemX} ${stemY2} Q${stemX + 10} ${stemY2 + 10} ${stemX + 9} ${stemY2 + 20}" stroke="${noteColor}" stroke-width="2.6" fill="none"/>`;
          else s += `<path d="M${stemX} ${stemY2} Q${stemX + 10} ${stemY2 - 10} ${stemX + 9} ${stemY2 - 20}" stroke="${noteColor}" stroke-width="2.6" fill="none"/>`;
        }
      }

      // Finger number above staff (or below for left hand)
      if (opts.showFingers && nt.f) {
        const fY = clef === 'bass' ? yOf(0) + 32 : yOf(8) - 18;
        const fCol = M.fingerColor(nt.f);
        s += `<circle cx="${x}" cy="${fY}" r="9" fill="${fCol}"/>`;
        s += `<text x="${x}" y="${fY + 4.5}" text-anchor="middle" font-size="12" font-weight="900" fill="#ffffff">${nt.f}</text>`;
      }

      // Lyric syllable underneath
      const lyrY = yOf(0) + (clef === 'bass' ? 46 : 32);
      const lyrText = opts.lyrMode === 'solfege' ? M.solfege(nt.m) : (opts.lyrMode === 'names' ? M.name(nt.m) : (nt.lyr || M.name(nt.m)));
      s += `<text x="${x}" y="${lyrY}" text-anchor="middle" font-size="14" font-weight="${isActive ? '800' : '600'}" fill="${isActive ? '#ff4f7b' : '#334155'}">${lyrText}</text>`;
    });

    // Double bar line at the end
    const endX = startX + notes.length * noteSpacing;
    s += `<line x1="${endX}" x2="${endX}" y1="${yOf(0)}" y2="${yOf(8)}" stroke="#1e293b" stroke-width="2"/>`;
    s += `<line x1="${endX + 6}" x2="${endX + 6}" y1="${yOf(0)}" y2="${yOf(8)}" stroke="#1e293b" stroke-width="5"/>`;

    s += '</svg>';
    return { html: s, totalWidth: totalW, activeX: activeIdx >= 0 ? startX + activeIdx * noteSpacing : 0 };
  }

  return { svg, diatonicPos, renderSongScore };
})();
