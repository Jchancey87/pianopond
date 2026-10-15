/* Song library for young pianists. Includes early benchmarks, folk classics, and famous classical themes.
   Formatted with time signatures, fingerings, lyrics, and measure division for real sheet music display. */
window.AX = window.AX || {};
(function () {
  const M = AX.music;
  const split = (s) => (s || '').trim().split(/\s+/).filter(Boolean);

  function mk(o) {
    const notes = split(o.notes);
    const beats = split(o.beats).map(Number);
    const fingers = split(o.fingers).map(Number);
    const lyr = split(o.lyrics);
    let t = 0;
    const list = notes.map((n, i) => {
      const b = beats[i] || 1;
      const note = { m: M.parse(n), beats: b, start: t, f: fingers[i] || 0, lyr: lyr[i] || '' };
      t += b; return note;
    });
    const lines = o.lines && o.lines.length ? o.lines : [list.length];
    let li = 0, used = 0;
    list.forEach((nt, i) => {
      if (used >= lines[li] && li < lines.length - 1) { li++; used = 0; }
      nt.line = li; nt.idx = i; used++;
    });
    const lo = Math.min.apply(null, list.map(n => n.m));
    const hi = Math.max.apply(null, list.map(n => n.m));
    const from = Math.floor(lo / 12) * 12;
    return Object.assign({}, o, {
      timeSig: o.timeSig || [4, 4],
      notes: list,
      lines,
      total: t,
      from,
      to: Math.max(from + 19, (Math.ceil((hi + 1) / 12) * 12) + 4),
      lowest: lo,
      highest: hi
    });
  }
  const rep = (s, n) => Array(n).fill(s).join(' ');

  const songs = [
    // 1. Warm-up scale & Solfege
    mk({
      id: 'scale', title: 'Pond Scale (Do Re Mi)', emoji: '🪷', hand: 'R', tempo: 84, timeSig: [4, 4],
      tip: 'Sing Do Re Mi Fa Sol out loud! Connect voice and fingers.',
      notes: 'C4 D4 E4 F4 G4 F4 E4 D4 C4',
      beats: '1 1 1 1 1 1 1 1 4',
      fingers: '1 2 3 4 5 4 3 2 1',
      lyrics: 'Do Re Mi Fa Sol Fa Mi Re Do',
      lines: [5, 4]
    }),

    // 2. Hot Cross Buns (3-note foundation)
    mk({
      id: 'hcb', title: 'Hot Cross Buns', emoji: '🥐', hand: 'R', tempo: 84, timeSig: [4, 4],
      tip: 'The 3-note classic! Steps down: fingers 3 - 2 - 1.',
      notes: 'E4 D4 C4 E4 D4 C4 C4 C4 C4 C4 D4 D4 D4 D4 E4 D4 C4',
      beats: '1 1 2 1 1 2 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 1 1 2',
      fingers: '3 2 1 3 2 1 1 1 1 1 2 2 2 2 3 2 1',
      lyrics: 'Hot cross buns Hot cross buns One a pen- ny Two a pen- ny Hot cross buns',
      lines: [3, 3, 4, 4, 3]
    }),

    // 3. Au Clair de la Lune (French classic)
    mk({
      id: 'claire', title: 'Au Clair de la Lune', emoji: '🌙', hand: 'R', tempo: 88, timeSig: [4, 4],
      tip: 'Step between C, D, and E with a smooth singing tone.',
      notes: 'C4 C4 C4 D4 E4 D4 C4 E4 D4 D4 C4',
      beats: '1 1 1 1 2 2 1 1 1 1 4',
      fingers: '1 1 1 2 3 2 1 3 2 2 1',
      lyrics: 'By the sil- ver moon- light In the qui- et night',
      lines: [6, 5]
    }),

    // 4. The Axolotl Song (Aqua Quest)
    mk({
      id: 'axolotl', title: 'The Axolotl Song', emoji: '🦎', hand: 'R', tempo: 88, timeSig: [4, 4],
      tip: 'Fingers 1 - 3 - 5 skip like bubbles (C - E - G)!',
      notes: 'C4 E4 G4 C4 E4 G4 G4 F4 E4 D4 C4',
      beats: '1 1 2 1 1 2 1 1 1 1 4',
      fingers: '1 3 5 1 3 5 5 4 3 2 1',
      lyrics: 'Ax- o- lotl Ax- o- lotl Swim- ming in the pond',
      lines: [3, 3, 5]
    }),

    // 5. Mary Had a Little Lamb
    mk({
      id: 'mary', title: 'Mary Had a Little Lamb', emoji: '🐑', hand: 'R', tempo: 96, timeSig: [4, 4],
      tip: 'Watch the skip from finger 3 up to 5 on the word "snow"!',
      notes: 'E4 D4 C4 D4 E4 E4 E4 D4 D4 D4 E4 G4 G4 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4',
      beats: '1 1 1 1 1 1 2 1 1 2 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 4',
      fingers: '3 2 1 2 3 3 3 2 2 2 3 5 5 3 2 1 2 3 3 3 3 2 2 3 2 1',
      lyrics: 'Ma- ry had a lit- tle lamb lit- tle lamb lit- tle lamb Ma- ry had a lit- tle lamb its fleece was white as snow',
      lines: [7, 6, 8, 5]
    }),

    // 6. Ode to Joy (Beethoven)
    mk({
      id: 'ode', title: 'Ode to Joy', emoji: '🌻', hand: 'R', tempo: 96, timeSig: [4, 4],
      tip: 'Beethoven’s famous 9th Symphony melody in 5-finger position!',
      notes: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4',
      beats: rep('1', 8) + ' 1 1 1 1 1.5 0.5 2 ' + rep('1', 8) + ' 1 1 1 1 1.5 0.5 2',
      fingers: '3 3 4 5 5 4 3 2 1 1 2 3 3 2 2 3 3 4 5 5 4 3 2 1 1 2 3 2 1 1',
      lyrics: "Joy- ful joy- ful we a- dore thee God of glo- ry Lord of love Hearts un- fold like flow'rs be- fore thee Op- ning to the sun a- bove",
      lines: [8, 7, 8, 7]
    }),

    // 7. Twinkle, Twinkle, Little Star (Stretch to A)
    mk({
      id: 'twinkle', title: 'Twinkle, Twinkle, Little Star', emoji: '⭐', hand: 'R', tempo: 92, timeSig: [4, 4],
      tip: 'Gently stretch pinky (5) from G up to A on "star"!',
      notes: 'C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4 G4 G4 F4 F4 E4 E4 D4 G4 G4 F4 F4 E4 E4 D4 C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4',
      beats: rep('1 1 1 1 1 1 2', 6),
      fingers: '1 1 5 5 5 5 5 4 4 3 3 2 2 1 5 5 4 4 3 3 2 5 5 4 4 3 3 2 1 1 5 5 5 5 5 4 4 3 3 2 2 1',
      lyrics: 'Twin- kle twin- kle lit- tle star How I won- der what you are Up a- bove the world so high Like a dia- mond in the sky Twin- kle twin- kle lit- tle star How I won- der what you are',
      lines: [7, 7, 7, 7, 7, 7]
    }),

    // 8. Jingle Bells
    mk({
      id: 'jingle', title: 'Jingle Bells', emoji: '🔔', hand: 'R', tempo: 104, timeSig: [4, 4],
      tip: 'Crisp repeated notes on E with finger 3!',
      notes: 'E4 E4 E4 E4 E4 E4 E4 G4 C4 D4 E4 F4 F4 F4 F4 F4 E4 E4 E4 E4 G4 G4 F4 D4 C4',
      beats: '1 1 2 1 1 2 1 1 1 1 4 1 1 1 1 1 1 1 1 1 1 1 1 1 4',
      fingers: '3 3 3 3 3 3 3 5 1 2 3 4 4 4 4 4 3 3 3 3 5 5 4 2 1',
      lyrics: 'Jin- gle bells jin- gle bells jin- gle all the way Oh what fun it is to ride in a one horse o- pen sleigh',
      lines: [3, 3, 5, 7, 7]
    }),

    // 9. When the Saints Go Marching In
    mk({
      id: 'saints', title: 'When the Saints Go Marching In', emoji: '🎺', hand: 'R', tempo: 100, timeSig: [4, 4],
      tip: 'A lively jazz & gospel standard! Feel the upbeat march rhythm.',
      notes: 'C4 E4 F4 G4 C4 E4 F4 G4 C4 E4 F4 G4 E4 C4 E4 D4 E4 E4 D4 C4 C4 E4 G4 G4 F4 E4 F4 G4 E4 C4 D4 C4',
      beats: '1 1 1 3 1 1 1 3 1 1 1 2 2 1 2 3 1 1 1 2 2 1 2 1 2 1 1 2 2 1 2 3',
      fingers: '1 3 4 5 1 3 4 5 1 3 4 5 3 1 3 2 3 3 2 1 1 3 5 5 4 3 4 5 3 1 2 1',
      lyrics: 'Oh when the saints go march- ing in Oh when the saints go march- ing in Lord I want to be in that num- ber When the saints go march- ing in',
      lines: [8, 8, 8, 8]
    }),

    // 10. Canon in D Theme (Pachelbel)
    mk({
      id: 'canon', title: 'Canon in D Theme', emoji: '🎻', hand: 'R', tempo: 80, timeSig: [4, 4],
      tip: 'Pachelbel’s world-famous theme. Smooth, flowing legato steps.',
      notes: 'E4 D4 C4 B3 C4 D4 E4 D4 C4 B3 A3 G3 A3 B3 C4 D4 E4',
      beats: '2 2 2 2 2 2 4 2 2 2 2 2 2 2 2 2 4',
      fingers: '3 2 1 1 1 2 3 2 1 1 1 1 1 2 1 2 3',
      lyrics: 'Peace- ful ca- non float- ing down Gen- tle wa- ter through our town Hear the mel- o- dy so sweet',
      lines: [7, 6, 4]
    }),

    // 11. Minuet in G Theme (Bach / Petzold - 3/4 Time!)
    mk({
      id: 'minuet', title: 'Minuet in G Theme', emoji: '🏰', hand: 'R', tempo: 96, timeSig: [3, 4],
      tip: 'Our first piece in 3/4 WALTZ time! Count: 1-2-3, 1-2-3.',
      notes: 'D4 G4 A4 B4 C5 D5 G4 G4 E4 C5 D5 E5 F#5 G5 G4 G4',
      beats: '1 0.5 0.5 0.5 0.5 1 1 1 1 0.5 0.5 0.5 0.5 1 1 1',
      fingers: '1 1 2 3 4 5 1 1 1 3 4 5 5 5 1 1',
      lyrics: 'Come dance to- ge- ther in the grand hall Waltz round the bal- con- y so tall',
      lines: [8, 8]
    }),

    // 12. Für Elise Theme (Beethoven)
    mk({
      id: 'elise', title: 'Für Elise (Theme)', emoji: '🎼', hand: 'R', tempo: 92, timeSig: [3, 4],
      tip: 'The iconic E - D# - E theme! Play with a mysterious, delicate touch.',
      notes: 'E5 D#5 E5 D#5 E5 B4 D5 C5 A4 C4 E4 A4 B4 E4 G#4 B4 C5',
      beats: '0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 2 0.5 0.5 0.5 2 0.5 0.5 0.5 2',
      fingers: '5 4 5 4 5 2 4 3 1 1 2 4 5 1 3 5 5',
      lyrics: 'Beet- ho- ven wrote this love- ly se- cret tune A song of beau- ty for E- lise',
      lines: [9, 8]
    }),

    // 13. Scarborough Fair (English Folk Ballad)
    mk({
      id: 'scarborough', title: 'Scarborough Fair', emoji: '🌿', hand: 'R', tempo: 84, timeSig: [3, 4],
      tip: 'An ancient haunting melody. Feel the 3/4 gentle sway.',
      notes: 'A4 A4 E5 E5 E5 B4 C5 B4 A4 E5 G5 A5 G5 E5 F5 E5 D5 E5',
      beats: '1 2 1 1 1 1 1 1 3 1 1 1 1 1 1 1 1 3',
      fingers: '1 1 5 5 5 2 3 2 1 3 4 5 4 2 3 2 1 2',
      lyrics: 'Are you go- ing to Scar- bo- rough Fair Pars- ley and sage rose- ma- ry and thyme',
      lines: [9, 9]
    }),

    // 14. The Entertainer (Scott Joplin)
    mk({
      id: 'entertainer', title: 'The Entertainer', emoji: '🎩', hand: 'R', tempo: 100, timeSig: [4, 4],
      tip: 'Scott Joplin’s ragtime masterpiece! Crisp chromatic notes (D - D# - E).',
      notes: 'D4 D#4 E4 C5 E4 C5 E4 C5 C5 D5 D#5 E5 C5 D5 E5 C5 D5 C5',
      beats: '0.5 0.5 0.5 1 0.5 1 0.5 2 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 1 2',
      fingers: '1 2 3 5 3 5 3 5 1 2 3 4 1 2 3 1 2 1',
      lyrics: 'Step step bounce to the rag- time beat Ev- ery- bo- dy clap your hands and tap your feet',
      lines: [8, 10]
    }),

    // 15. Frère Jacques (Boulanger Canon & Solfège Benchmark)
    mk({
      id: 'frere', title: 'Frère Jacques (Canon)', emoji: '🔔', hand: 'R', tempo: 92, timeSig: [4, 4],
      tip: "Nadia Boulanger's favorite canon! Sing on Do-Re-Mi before playing, then sing as a round!",
      notes: 'C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4 E4 F4 G4 G4 A4 G4 F4 E4 C4 G4 A4 G4 F4 E4 C4 C4 G3 C4 C4 G3 C4',
      beats: '1 1 1 1 1 1 1 1 1 1 2 1 1 2 0.5 0.5 0.5 0.5 1 1 0.5 0.5 0.5 0.5 1 1 1 1 2 1 1 2',
      fingers: '1 2 3 1 1 2 3 1 3 4 5 3 4 5 5 5 5 4 3 1 5 5 5 4 3 1 1 1 1 1 1 1',
      lyrics: 'Frè- re Jac- ques Frè- re Jac- ques Dor- mez- vous? Dor- mez- vous? Son- nez les ma- ti- nes Son- nez les ma- ti- nes Ding dang dong Ding dang dong',
      lines: [4, 4, 3, 3, 6, 6, 3, 3]
    }),

    // 16. Mikrokosmos Steps (Béla Bartók - Vol. 1 Linear Study)
    mk({
      id: 'bartok', title: 'Mikrokosmos Steps (Bartók)', emoji: '🎼', hand: 'R', tempo: 88, timeSig: [4, 4],
      tip: "From Béla Bartók's Mikrokosmos Vol. 1. Pure linear melody — hear each voice's horizontal path!",
      notes: 'C4 D4 E4 F4 G4 F4 E4 D4 C4 E4 D4 F4 E4 D4 C4',
      beats: '1 1 1 1 2 1 1 1 2 1 1 1 1 1 2',
      fingers: '1 2 3 4 5 4 3 2 1 3 2 4 3 2 1',
      lyrics: 'Step up step down sing- ing voice Hear the steps re- joice and sing',
      lines: [5, 4, 6]
    }),

    // 17. Musette in D (J.S. Bach - Anna Magdalena Notebook)
    mk({
      id: 'musette', title: 'Musette in D (Bach)', emoji: '🎻', hand: 'R', tempo: 104, timeSig: [4, 4],
      tip: "J.S. Bach's joyful Baroque dance from the Anna Magdalena Notebook. Notice the bright F#!",
      notes: 'D4 F#4 A4 F#4 D4 F#4 A4 F#4 D4 E4 F#4 G4 A4 A4 A4 D4 F#4 A4 F#4 D4',
      beats: '1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 4',
      fingers: '1 2 4 2 1 2 4 2 1 2 3 4 5 5 5 1 2 4 2 1',
      lyrics: 'From the grand note- book of An- na Mag- da- le- na Bach Hear the bag- pipe dance!',
      lines: [4, 4, 7, 5]
    }),

    // 18. Melody (Robert Schumann - Album for the Young Op. 68)
    mk({
      id: 'schumann', title: 'Melody (Schumann)', emoji: '🌸', hand: 'R', tempo: 80, timeSig: [4, 4],
      tip: "Robert Schumann's Album for the Young Op. 68 No. 1. Feel La Grande Ligne — the long phrase arc to the high note!",
      notes: 'C4 E4 G4 C5 B4 A4 G4 F4 E4 G4 C4 D4 E4 D4 C4',
      beats: '1 1 1 2 1 1 2 1 1 1 1 1 2 1 3',
      fingers: '1 2 3 5 4 3 2 1 1 3 1 2 3 2 1',
      lyrics: 'Gen- tle bree- zes sing a long sweet song Mel- o- dy of child- hood days',
      lines: [4, 3, 4, 4]
    }),

    // 19. Sonatina Theme (Muzio Clementi Op. 36 No. 1)
    mk({
      id: 'clementi', title: 'Sonatina Theme (Clementi)', emoji: '🏛️', hand: 'R', tempo: 96, timeSig: [4, 4],
      tip: 'Muzio Clementi’s classical showpiece! Sparkling arpeggios outline the harmony.',
      notes: 'C4 E4 G4 C5 G4 E4 C4 D4 G4 D4 B3 G3 C4',
      beats: '1 1 1 2 1 1 2 1 1 1 1 2 3',
      fingers: '1 2 3 5 3 2 1 2 5 2 1 1 1',
      lyrics: 'Bright and spar- kling cla- ssi- cal so- na- ti- na tune!',
      lines: [4, 3, 3, 3]
    }),

    // 20. Little Prelude in C (J.S. Bach BWV 939 Theme)
    mk({
      id: 'bach-prelude', title: 'Little Prelude in C (Bach)', emoji: '📜', hand: 'R', tempo: 84, timeSig: [4, 4],
      tip: 'Flowing Baroque keyboard harmony. Every chord outlines tension and home arrival.',
      notes: 'C4 E4 G4 C5 G4 E4 C4 E4 G4 C5 G4 E4 B3 D4 G4 B4 G4 D4 C4',
      beats: '0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 2',
      fingers: '1 2 3 5 3 2 1 2 3 5 3 2 1 2 4 5 4 2 1',
      lyrics: 'Flow- ing bro- ken chords in the beau- ti- ful Ba- roque style of Bach Little Pre- lude',
      lines: [6, 6, 6, 1]
    })
  ];

  // Left hand versions: one octave lower, mirrored finger numbers (pinky on C!)
  function leftHand(src, id, title) {
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = id;
    copy.title = title;
    copy.hand = 'L';
    copy.emoji = '🤚';
    copy.tip = 'Left hand mastery! Pinky (5) on Bass C, thumb (1) on Bass G.';
    copy.notes.forEach(n => { n.m -= 12; n.f = 6 - n.f; });
    copy.from = 48;
    copy.to = 67;
    copy.lowest -= 12;
    copy.highest -= 12;
    return copy;
  }

  const byId = {};
  songs.forEach(s => { byId[s.id] = s; });

  // Add Left Hand versions
  songs.push(leftHand(byId.hcb, 'hcb-lh', 'Hot Cross Buns (Left Hand)'));
  songs.push(leftHand(byId.claire, 'claire-lh', 'Au Clair de la Lune (Left Hand)'));
  songs.push(leftHand(byId.mary, 'mary-lh', 'Mary Had a Little Lamb (Left Hand)'));
  songs.push(leftHand(byId.ode, 'ode-lh', 'Ode to Joy (Left Hand)'));
  songs.push(leftHand(byId.frere, 'frere-lh', 'Frère Jacques (Left Hand)'));
  songs.push(leftHand(byId.bartok, 'bartok-lh', 'Mikrokosmos (Left Hand)'));
  songs.push(leftHand(byId.musette, 'musette-lh', 'Musette in D (Left Hand)'));
  songs.push(leftHand(byId.schumann, 'schumann-lh', 'Melody (Left Hand)'));

  songs.forEach(s => { byId[s.id] = s; });

  AX.songs = { list: songs, byId: byId };
})();
