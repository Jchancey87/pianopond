/* Small music-theory helpers */
window.AX = window.AX || {};
AX.music = (function () {
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const SOLFEGE = { C: 'Do', 'C#': 'Di', D: 'Re', 'D#': 'Ri', E: 'Mi', F: 'Fa', 'F#': 'Fi', G: 'Sol', 'G#': 'Si', A: 'La', 'A#': 'Li', B: 'Ti' };
  const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const LETTER_IDX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const FINGER_COLORS = ['#ff6b8b', '#ff9f43', '#ffd23f', '#4cd97b', '#4aa3ff'];

  function parse(s) {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(s);
    if (!m) throw new Error('Bad note: ' + s);
    let pc = LETTER_PC[m[1]];
    if (m[2] === '#') pc++;
    if (m[2] === 'b') pc--;
    return (parseInt(m[3], 10) + 1) * 12 + pc;
  }
  const pc = (m) => ((m % 12) + 12) % 12;
  return {
    NAMES, parse, pc,
    isBlack: (m) => [1, 3, 6, 8, 10].includes(pc(m)),
    name: (m) => NAMES[pc(m)],
    octave: (m) => Math.floor(m / 12) - 1,
    full: (m) => NAMES[pc(m)] + (Math.floor(m / 12) - 1),
    solfege: (m) => SOLFEGE[NAMES[pc(m)]],
    fingerColor: (f) => FINGER_COLORS[f - 1] || '#cfd8dc',
    diatonic: (m) => (Math.floor(m / 12) - 1) * 7 + LETTER_IDX[NAMES[pc(m)][0]],
    freq: (m) => 440 * Math.pow(2, (m - 69) / 12)
  };
})();
