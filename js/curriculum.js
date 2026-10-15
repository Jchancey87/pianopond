/* Progressive Piano Curriculum for Young Musicians (Age 8+).
   Structured around Nadia Boulanger's Conservatory Pedagogy (The "Little Boulanger" Method):
   Phase 1: The Singing Ear (Months 1-4) — Solfège & Rythme
   Phase 2: Two Voices Talking (Months 5-9) — Counterpoint & Linearity
   Phase 3: The Living Keyboard (Months 10-15) — Harmony & Transposition
   Phase 4: La Grande Ligne & Composition (Months 16-24) — Form, The Long Line & Inventions */
window.AX = window.AX || {};

AX.warmups = {
  pond: {
    title: 'Ready, steady, splash!',
    items: [
      ['🪑', 'Sit comfortably, with your feet resting on the floor or a stool.'],
      ['🫧', 'Let your shoulders relax. Wiggle your fingers, then make a soft, round bubble with each hand.'],
      ['🎤', 'Sing a tiny tune, then clap its rhythm. Your ears and hands are ready!']
    ]
  },
  default: {
    title: "Concert Pianist Pre-Flight Check",
    items: [
      ['🪑', 'Posture Check: Sit tall on the front half of the bench, feet flat on the floor or footstool.'],
      ['🌊', 'Shoulder Drop: Roll your shoulders back and let your arms hang relaxed like heavy ropes.'],
      ['🎾', 'Hand Arch: Curve your fingers into a natural dome, like holding a tennis ball or round orange.'],
      ['🎹', 'Fingertip Tap: Tap fingers 1-2-3-4-5 on the table using the firm pads of your fingertips.'],
      ['🎶', 'Vocal Pitch Match: Hum "Mmmm" and sing Do - Re - Mi - Fa - Sol to tune your inner ear.']
    ]
  },
  boulanger: {
    title: "Fontainebleau Ear & Pulse Check",
    items: [
      ['🪑', 'Posture Check: Sit tall on the front half of the bench, relaxed shoulders and grounded feet.'],
      ['🎤', 'Inner Ear First: Sing Do - Re - Mi - Fa - Sol out loud before touching a single key!'],
      ['🦶', 'Stravinsky Pulse: Tap a steady quarter-note pulse with your foot or left hand.'],
      ['↔️', 'Contrary Motion: Move both index fingers outward from Middle C — hear the harmony bloom.'],
      ['🏔️', 'La Grande Ligne: Take a deep breath and feel the long musical line from first note to last.']
    ]
  },
  dexterity: {
    title: "Finger Independence & Agility",
    items: [
      ['🖐', 'Right Hand: Tap 1-2-3-4-5, then reverse 5-4-3-2-1 with steady, even tempo.'],
      ['🤚', 'Left Hand: Tap 5-4-3-2-1, then reverse 1-2-3-4-5 with steady arm weight.'],
      ['⚡', 'Lightning Numbers: Have someone call out random finger numbers (e.g. "4! 2! 5!") — move instantly!'],
      ['🫧', 'Silent Cushion: Play five keys silently without making a sound — test your fine muscle control.']
    ]
  },
  stravinsky: {
    title: "Stravinsky Rhythmic Precision",
    items: [
      ['🦶', 'Left Foot / Hand: Tap a rock-steady pulse (1 - 2 - 3 - 4) like a ticking grandfather clock.'],
      ['👏', 'Right Hand: Clap syncopations on the "and" between the beats (1 & 2 & 3 & 4 &).'],
      ['🗣️', 'Voice & Rhythm: Recite a favorite poem while keeping your tapping hand perfectly steady.'],
      ['⚡', 'Lightning Stop: Freeze instantly on beat 4 with zero wobble — conservatory precision!']
    ]
  }
};

AX.lessons = [
  // =========================================================================
  // PHASE 1: THE SINGING EAR (Months 1–4: Solfège & Rythme)
  // Connect voice to fingers, internalize pulse, audiation, and basic intervals.
  // =========================================================================
  {
    id: 'L1', title: 'The Keyboard Blueprint', emoji: '🎹', blurb: 'Black key patterns & finding Middle C',
    intro: "Welcome to the Piano Pond! Today we learn the blueprint of the 88 keys. Music uses a repeating pattern — master this and you can navigate any piano in the world.",
    phase: 1, phaseTitle: 'The Singing Ear',
    steps: [
      { id: 'L1-learn', type: 'learn', icon: '📖', title: 'Black Key Architecture', slides: [
        { title: 'The Two & Three Pattern', html: 'Look across the piano. The black keys are arranged in repeating groups of <b>2 black keys</b> and <b>3 black keys</b>. Tap the colored keys to hear them!',
          piano: { from: 60, to: 79, labels: 'none', marks: [['C#4', 'g2'], ['D#4', 'g2'], ['F#4', 'g3'], ['G#4', 'g3'], ['A#4', 'g3'], ['C#5', 'g2'], ['D#5', 'g2'], ['F#5', 'g3'], ['G#5', 'g3'], ['A#5', 'g3']] } },
        { title: 'Locating Note C', html: 'Find any group of <b>2 black keys</b>. The white key directly to the <b>left</b> is always <b>C</b>! The C in the center of the piano is called <b>Middle C</b> ⭐',
          piano: { from: 60, to: 79, labels: 'c', marks: [['C4', 'target'], ['C5', 'target']] } },
        { title: 'The 7 Musical Alphabet Letters', html: 'Music only uses 7 letters: <b>A B C D E F G</b>, then it repeats! Moving right climbs higher; moving left goes lower.',
          piano: { from: 60, to: 79, labels: 'names', marks: [] } }
      ] },
      { id: 'L1-hunt1', type: 'hunt', icon: '🔎', title: 'Target Practice: Find all the Cs', cfg: { pool: ['C'], rounds: 6, from: 60, to: 84, labels: 'none' } },
      { id: 'L1-hunt2', type: 'hunt', icon: '🔎', title: 'Target Practice: C, D & E', cfg: { pool: ['C', 'D', 'E'], rounds: 8, from: 60, to: 84, labels: 'c' } }
    ]
  },

  {
    id: 'L2', title: 'Finger Dexterity & Numbers', emoji: '🖐', blurb: 'Finger numbers 1-5 and arched hand posture',
    intro: "Pianists number every finger 1 through 5. Sheet music uses these numbers so you always know which finger to use without guessing.",
    phase: 1, phaseTitle: 'The Singing Ear',
    steps: [
      { id: 'L2-learn', type: 'learn', icon: '📖', title: 'The Number System', slides: [
        { title: 'Fingers 1 to 5', html: '<b>1 = Thumb</b>, <b>2 = Index</b>, <b>3 = Middle</b>, <b>4 = Ring</b>, <b>5 = Pinky</b>. Both your right and left hands share this exact numbering!', hand: { hand: 'R', play: true } },
        { title: 'Curved Hand Dome', html: 'Never play with flat fingers. Keep your knuckles elevated and your fingertips curved, as if gently holding a round tennis ball.', hand: { hand: 'L', play: true } }
      ] },
      { id: 'L2-f1', type: 'fingers', icon: '🖐', title: 'Right Hand Finger Drill', cfg: { hand: 'R', mode: 'single', rounds: 8 } },
      { id: 'L2-f2', type: 'fingers', icon: '🖐', title: 'Left Hand Finger Drill', cfg: { hand: 'L', mode: 'single', rounds: 8 } },
      { id: 'L2-f3', type: 'fingers', icon: '🧠', title: 'Memory Sequences', cfg: { hand: 'R', mode: 'seq', rounds: 5, len: 3 } },
      { id: 'L2-warm', type: 'warmup', icon: '🥁', title: 'Independence Check', set: 'dexterity' }
    ]
  },

  {
    id: 'L3', title: 'The Three-Note Launch', emoji: '🥐', blurb: 'C-D-E navigation & Hot Cross Buns',
    intro: "Time for your first real song! Nadia Boulanger's Golden Rule: 'Sing Before You Play.' Sing C - D - E on solfège first!",
    phase: 1, phaseTitle: 'The Singing Ear',
    steps: [
      { id: 'L3-learn', type: 'learn', icon: '📖', title: 'Right Hand Home Position', slides: [
        { title: 'Thumb on Middle C', html: 'Place your <b>Right Thumb (1)</b> on <b>Middle C</b>. Finger 2 rests on <b>D</b>, and Finger 3 rests on <b>E</b>. Sing their solfège names: <b>Do - Re - Mi</b>!',
          piano: { from: 60, to: 76, labels: 'names', marks: [['C4', 'target', 1], ['D4', 'target', 2], ['E4', 'target', 3]] } }
      ] },
      { id: 'L3-hunt', type: 'hunt', icon: '🔎', title: 'Sprint: C, D, E', cfg: { pool: ['C', 'D', 'E'], rounds: 8, from: 60, to: 84, labels: 'none' } },
      { id: 'L3-echo', type: 'echodetective', icon: '👂', title: 'Echo Detective: 3-Note Ear Dictation', cfg: { pool: [['C4', 'D4', 'E4'], ['E4', 'D4', 'C4'], ['C4', 'E4', 'C4']], rounds: 4, from: 60, to: 76 } },
      { id: 'L3-song', type: 'song', icon: '🥐', title: 'Song: Hot Cross Buns', songId: 'hcb' }
    ]
  },

  {
    id: 'L4', title: 'The C 5-Finger Pattern & Solfège', emoji: '🪷', blurb: 'C-D-E-F-G & singing Do-Re-Mi',
    intro: "Now all FIVE fingers get their own keys: C, D, E, F, G. In music, this is the C Major 5-Finger Pattern. Sing Do - Re - Mi - Fa - Sol!",
    phase: 1, phaseTitle: 'The Singing Ear',
    steps: [
      { id: 'L4-learn', type: 'learn', icon: '📖', title: 'C Major Position', slides: [
        { title: 'Five Keys, Five Fingers', html: 'Keep thumb on C, finger 2 on D, 3 on E, 4 on F, and 5 on G. Sing <b>Do - Re - Mi - Fa - Sol</b> as you play up and down!',
          piano: { from: 60, to: 76, labels: 'solfege', marks: [['C4', 'target', 1], ['D4', 'target', 2], ['E4', 'target', 3], ['F4', 'target', 4], ['G4', 'target', 5]] } }
      ] },
      { id: 'L4-hunt', type: 'hunt', icon: '🔎', title: 'Five-Note Radar', cfg: { pool: ['C', 'D', 'E', 'F', 'G'], rounds: 10, from: 60, to: 84, labels: 'none' } },
      { id: 'L4-scale', type: 'song', icon: '🪷', title: 'Song: Pond Scale (Do Re Mi)', songId: 'scale' },
      { id: 'L4-echo', type: 'echodetective', icon: '👂', title: 'Echo Detective: 5-Note Ear Training', cfg: { pool: [['C4', 'D4', 'E4'], ['C4', 'E4', 'G4'], ['G4', 'F4', 'E4'], ['C4', 'D4', 'E4', 'F4', 'G4']], rounds: 5, from: 60, to: 76 } }
    ]
  },

  {
    id: 'L5', title: 'Step-Wise Phrasing & Bartók', emoji: '🌙', blurb: 'Smooth melodies & Au Clair de la Lune',
    intro: "Legato means smooth and connected — like singing a long sentence in one breath. We also study Béla Bartók's linear steps from Mikrokosmos!",
    phase: 1, phaseTitle: 'The Singing Ear',
    steps: [
      { id: 'L5-learn', type: 'learn', icon: '📖', title: 'Legato Touch & Linear Motion', slides: [
        { title: 'Transferring Arm Weight', html: 'Do not lift a finger until the next one plays! This creates a smooth <b>legato</b> singing tone. Listen to how the melody flows horizontally.' }
      ] },
      { id: 'L5-song', type: 'song', icon: '🌙', title: 'Song: Au Clair de la Lune', songId: 'claire' },
      { id: 'L5-bartok', type: 'song', icon: '🎼', title: 'Song: Mikrokosmos Steps (Bartók)', songId: 'bartok' },
      { id: 'L5-f', type: 'fingers', icon: '🖐', title: 'Finger Agility: Pattern 1-2-3-2-1', cfg: { hand: 'R', mode: 'seq', rounds: 5, len: 4 } }
    ]
  },

  {
    id: 'L6', title: 'The Canon & Solfège Benchmark', emoji: '🔔', blurb: 'Frère Jacques & Stravinsky pulse',
    intro: "Frère Jacques is the world's most famous canon! Nadia Boulanger loved teaching this to build the inner ear. Sing it on Do-Re-Mi!",
    phase: 1, phaseTitle: 'The Singing Ear',
    steps: [
      { id: 'L6-warm', type: 'warmup', icon: '🥁', title: 'Stravinsky Precision Check', set: 'stravinsky' },
      { id: 'L6-frere', type: 'song', icon: '🔔', title: 'Song: Frère Jacques (Canon)', songId: 'frere' },
      { id: 'L6-echo', type: 'echodetective', icon: '👂', title: 'Echo Detective: Advanced Ear Dictation', cfg: { pool: [['C4', 'D4', 'E4', 'C4'], ['E4', 'F4', 'G4'], ['G4', 'E4', 'C4']], rounds: 4, from: 60, to: 76 } }
    ]
  },

  // =========================================================================
  // PHASE 2: TWO VOICES TALKING (Months 5–9: Counterpoint / Linearity)
  // Hear two independent lines at once; Left Hand as a singer, not accompaniment.
  // =========================================================================
  {
    id: 'L7', title: 'The Treble Staff Code', emoji: '📜', blurb: 'Lines & spaces on the music staff',
    intro: "Sheet music is written on a staff of 5 lines and 4 spaces. Higher on the staff = higher pitch on the piano!",
    phase: 2, phaseTitle: 'Two Voices Talking',
    steps: [
      { id: 'L7-learn', type: 'learn', icon: '📖', title: 'Lines and Spaces', slides: [
        { title: 'The 5 Lines of Treble Clef', html: 'The <b>Treble Clef (𝄞)</b> circles around line 2: note <b>G</b>. The lines from bottom to top are: <b>E - G - B - D - F</b> (Every Good Boy Does Fine).',
          staff: { notes: ['E4', 'G4', 'B4', 'D5', 'F5'], clef: 'treble', labels: true } },
        { title: 'Middle C on its Ledger Line', html: '<b>Middle C</b> sits below the staff on its own personal mini-line (a <b>ledger line</b>). D hangs just under line 1, E sits on line 1, and G is on line 2.',
          staff: { notes: ['C4', 'D4', 'E4', 'G4'], clef: 'treble', labels: true } }
      ] },
      { id: 'L7-read1', type: 'read', icon: '👀', title: 'Staff Reading: C - D - E', cfg: { pool: ['C4', 'D4', 'E4'], rounds: 6, clef: 'treble', from: 60, to: 76 } },
      { id: 'L7-read2', type: 'read', icon: '👀', title: 'Staff Reading: C through G', cfg: { pool: ['C4', 'D4', 'E4', 'F4', 'G4'], rounds: 8, clef: 'treble', from: 60, to: 76 } }
    ]
  },

  {
    id: 'L8', title: 'Pinky Control & Broken Chords', emoji: '🐑', blurb: 'Skipping notes (1-3-5) & Mary',
    intro: "Music steps and skips! Skipping from 1 to 3 to 5 forms a chord triad. Your 5th finger gets confidence today!",
    phase: 2, phaseTitle: 'Two Voices Talking',
    steps: [
      { id: 'L8-song1', type: 'song', icon: '🦎', title: 'Song: The Axolotl Song', songId: 'axolotl' },
      { id: 'L8-song2', type: 'song', icon: '🐑', title: 'Song: Mary Had a Little Lamb', songId: 'mary' },
      { id: 'L8-read', type: 'read', icon: '👀', title: 'Speed Sight-Reading', cfg: { pool: ['C4', 'D4', 'E4', 'F4', 'G4'], rounds: 8, clef: 'treble', from: 60, to: 76 } }
    ]
  },

  {
    id: 'L9', title: 'Note Values & Stravinsky Rhythm', emoji: '🥁', blurb: 'Quarter, Half, and Whole notes',
    intro: "Pianists must master WHEN to play, not just WHICH keys. Igor Stravinsky taught Boulanger that rhythmic precision is the bedrock of expression.",
    phase: 2, phaseTitle: 'Two Voices Talking',
    steps: [
      { id: 'L9-learn', type: 'learn', icon: '📖', title: 'Rhythm Math', slides: [
        { title: 'The Note Family', html: '<b>Quarter Note (♩)</b> = 1 beat (say "ta")<br><b>Half Note (𝅗𝅥)</b> = 2 beats (say "ta-a")<br><b>Whole Note (𝅝)</b> = 4 beats (say "ta-a-a-a")<br><b>Eighth Notes (♫)</b> = 1/2 beat each (say "ti-ti").',
          html2: '<div class="rhythm-demo"><span>♩ ta</span><span class="long">𝅗𝅥 ta-a</span><span class="long" style="background:#8e6bff">𝅝 4 beats</span><span class="quick">♫ ti-ti</span></div>' }
      ] },
      { id: 'L9-r1', type: 'rhythm', icon: '🥁', title: 'Rhythm Drill: Steady Quarter Beats', cfg: { bpm: 76, patterns: [[1, 1, 1, 1], [1, 1, 2], [2, 1, 1], [2, 2]] } },
      { id: 'L9-r2', type: 'rhythm', icon: '🥁', title: 'Rhythm Drill: Eighth Note Pulses', cfg: { bpm: 76, patterns: [[0.5, 0.5, 1, 1, 1], [1, 0.5, 0.5, 2], [1, 1, 0.5, 0.5, 1], [0.5, 0.5, 0.5, 0.5, 2]] } }
    ]
  },

  {
    id: 'L10', title: 'Beethoven’s Anthem: Ode to Joy', emoji: '🌻', blurb: 'Reading full measures with repeated notes',
    intro: "Ludwig van Beethoven wrote this anthem to celebrate joy and friendship. Notice how notes step gently up and down.",
    phase: 2, phaseTitle: 'Two Voices Talking',
    steps: [
      { id: 'L10-learn', type: 'learn', icon: '📖', title: 'Measure Divisions', slides: [
        { title: 'Bar Lines and Measures', html: 'Music is divided into small boxes called <b>measures</b> by vertical <b>bar lines</b>. In 4/4 time, every measure holds exactly 4 beats!' }
      ] },
      { id: 'L10-song', type: 'song', icon: '🌻', title: 'Song: Ode to Joy', songId: 'ode' }
    ]
  },

  {
    id: 'L11', title: 'Bass Clef & Left Hand Singer', emoji: '🤚', blurb: 'Bass F line, Great C, and Left Hand power',
    intro: "Awaken your left hand! In Boulanger's method, the left hand is never just an accompaniment; it is a full, singing contrapuntal voice.",
    phase: 2, phaseTitle: 'Two Voices Talking',
    steps: [
      { id: 'L11-learn', type: 'learn', icon: '📖', title: 'The Bass Clef', slides: [
        { title: 'The F Clef', html: 'The <b>Bass Clef (𝄢)</b> has two dots wrapping around line 4: the note <b>F</b>. Notes here have a deep, rich resonance.',
          staff: { notes: ['C3', 'D3', 'E3', 'F3', 'G3'], clef: 'bass', labels: true } },
        { title: 'Left Hand C Position', html: 'Put your <b>Left Pinky (5)</b> on the C below Middle C. Fingers 4, 3, 2, and 1 rest on D, E, F, and G. It is the mirror of your right hand!',
          piano: { from: 48, to: 67, labels: 'names', marks: [['C3', 'target', 5], ['D3', 'target', 4], ['E3', 'target', 3], ['F3', 'target', 2], ['G3', 'target', 1]] } }
      ] },
      { id: 'L11-hunt', type: 'hunt', icon: '🔎', title: 'Bass Key Radar', cfg: { pool: ['C3', 'D3', 'E3', 'F3', 'G3'], rounds: 8, from: 48, to: 67, labels: 'none' } },
      { id: 'L11-read', type: 'read', icon: '👀', title: 'Bass Clef Sight-Reading', cfg: { pool: ['C3', 'D3', 'E3', 'F3', 'G3'], rounds: 8, clef: 'bass', from: 48, to: 67 } }
    ]
  },

  {
    id: 'L12', title: 'Contrapuntal Mastery & Contrary Motion', emoji: '🏰', blurb: 'Contrary motion & Bach’s Anna Magdalena',
    intro: "Two voices talking at once! Practice the famous Contrary Motion Game (sweet 3rds vs crunchy 2nds), then play Bach's Musette in D!",
    phase: 2, phaseTitle: 'Two Voices Talking',
    steps: [
      { id: 'L12-contrary', type: 'contrary', icon: '↔️', title: 'The Contrary Motion Game', cfg: { rounds: 5, from: 48, to: 76 } },
      { id: 'L12-musette', type: 'song', icon: '🎻', title: 'Song: Musette in D (Bach)', songId: 'musette' },
      { id: 'L12-s1', type: 'song', icon: '🤚', title: 'Song: Hot Cross Buns (Left Hand)', songId: 'hcb-lh' },
      { id: 'L12-s2', type: 'song', icon: '🌻', title: 'Play One, Sing the Other: Ode to Joy LH', songId: 'ode-lh' }
    ]
  },

  // =========================================================================
  // PHASE 3: THE LIVING KEYBOARD (Months 10–15: Harmony & Transposition)
  // Tension & release, transposition across 3 keys, cadence storytelling.
  // =========================================================================
  {
    id: 'L13', title: 'Expanding the Span to A', emoji: '⭐', blurb: 'Pinky stretch to A & Twinkle Star',
    intro: "Until now we stayed in a 5-note position. Now we gently stretch Finger 5 up to note A!",
    phase: 3, phaseTitle: 'The Living Keyboard',
    steps: [
      { id: 'L13-learn', type: 'learn', icon: '📖', title: 'The Note A', slides: [
        { title: 'Gentle Pinky Reach', html: 'Keep your thumb on C. Reach your pinky one key higher to <b>A</b>. Keep your wrist flexible — never stretch with tension!',
          piano: { from: 60, to: 76, labels: 'names', marks: [['G4', 'target', 5], ['A4', 'target', 5]] } }
      ] },
      { id: 'L13-song', type: 'song', icon: '⭐', title: 'Song: Twinkle, Twinkle, Little Star', songId: 'twinkle' },
      { id: 'L13-read', type: 'read', icon: '👀', title: 'Sight-Reading: C through A', cfg: { pool: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'], rounds: 8, clef: 'treble', from: 60, to: 76 } }
    ]
  },

  {
    id: 'L14', title: 'The 3-Key Transposition Challenge', emoji: '🧭', blurb: 'Shift melodies to G and F by ear',
    intro: "Boulanger hated paper-only theory. Today we transpose Hot Cross Buns across C Major, G Major, and F Major completely by ear!",
    phase: 3, phaseTitle: 'The Living Keyboard',
    steps: [
      { id: 'L14-trans', type: 'transpose', icon: '🧭', title: 'The 3-Key Transposition Challenge', cfg: { rounds: 3, from: 53, to: 77 } },
      { id: 'L14-song', type: 'song', icon: '🔔', title: 'Song: Jingle Bells', songId: 'jingle' }
    ]
  },

  {
    id: 'L15', title: 'Cadence Storytelling: Tension & Home', emoji: '🧗', blurb: 'Home (I), Exploring (IV), Cliffhanger (V7)',
    intro: "Where does this note want to go? Experience the 3 basic harmonic feelings: Home (I), Exploring (IV), and the Cliffhanger (V7)!",
    phase: 3, phaseTitle: 'The Living Keyboard',
    steps: [
      { id: 'L15-cadence', type: 'cadence', icon: '🧗', title: 'Cadence Story: Where Does It Go?', cfg: { rounds: 3, from: 48, to: 76 } },
      { id: 'L15-song', type: 'song', icon: '🎺', title: 'Song: When the Saints Go Marching In', songId: 'saints' }
    ]
  },

  {
    id: 'L16', title: 'Canon in D & Figured Bass', emoji: '🎻', blurb: 'Pachelbel’s timeless baroque progression',
    intro: "Johann Pachelbel wrote this piece around the year 1680. Notice how the bass steps down while the melody sings smoothly above it.",
    phase: 3, phaseTitle: 'The Living Keyboard',
    steps: [
      { id: 'L16-song', type: 'song', icon: '🎻', title: 'Song: Canon in D Theme', songId: 'canon' }
    ]
  },

  {
    id: 'L17', title: 'Waltz Time: 3/4 Meter', emoji: '🌿', blurb: '3 beats per measure & Scarborough Fair',
    intro: "Not all music counts in 4! In a waltz, we count: 1 - 2 - 3, 1 - 2 - 3. Dotted half notes get 3 beats.",
    phase: 3, phaseTitle: 'The Living Keyboard',
    steps: [
      { id: 'L17-learn', type: 'learn', icon: '📖', title: 'The Dotted Half Note', slides: [
        { title: 'The Dot Adds Half', html: 'A regular half note is 2 beats. A <b>dot</b> adds half its value (1 beat), making a <b>dotted half note (𝅗𝅥.)</b> worth exactly 3 beats!' }
      ] },
      { id: 'L17-song', type: 'song', icon: '🌿', title: 'Song: Scarborough Fair', songId: 'scarborough' }
    ]
  },

  {
    id: 'L18', title: 'The Black Key: F-Sharp (F#)', emoji: '🏰', blurb: 'Bach’s Minuet in G & first accidental',
    intro: "A sharp (#) raises a note by one half-step. F# is the first black key in the group of 3! Bach used F# in his famous Minuet in G.",
    phase: 3, phaseTitle: 'The Living Keyboard',
    steps: [
      { id: 'L18-learn', type: 'learn', icon: '📖', title: 'Meeting F-Sharp', slides: [
        { title: 'F vs F#', html: 'Find the white key F. Move one key to the right onto the black key: that is <b>F-Sharp (F#)</b>! Bach used F# to create the bright sound of G Major.',
          piano: { from: 60, to: 79, labels: 'names', marks: [['F#4', 'target'], ['F#5', 'target']] } }
      ] },
      { id: 'L18-song', type: 'song', icon: '🏰', title: 'Song: Minuet in G Theme (Bach)', songId: 'minuet' }
    ]
  },

  // =========================================================================
  // PHASE 4: LA GRANDE LIGNE & FORM (Months 16–24: Architecture & Composition)
  // Structural form, finding the mountain peak, score reading away from keys.
  // =========================================================================
  {
    id: 'L19', title: 'La Grande Ligne: Finding the Peak', emoji: '🏔️', blurb: 'The Long Line & Robert Schumann’s Melody',
    intro: "Boulanger's signature concept: La Grande Ligne! Music isn't individual measures — it is an emotional wave with a Mountain Peak.",
    phase: 4, phaseTitle: 'La Grande Ligne & Composition',
    steps: [
      { id: 'L19-peak', type: 'peak', icon: '🏔️', title: 'Finding the Mountain Peak', cfg: { rounds: 3 } },
      { id: 'L19-schumann', type: 'song', icon: '🌸', title: 'Song: Melody (Schumann)', songId: 'schumann' }
    ]
  },

  {
    id: 'L20', title: 'Classical Architecture: Clementi & Bach', emoji: '🏛️', blurb: 'Sonatina form & Bach’s Little Prelude',
    intro: "Muzio Clementi and J.S. Bach crafted pieces with brilliant structural balance. Feel the architecture unfold!",
    phase: 4, phaseTitle: 'La Grande Ligne & Composition',
    steps: [
      { id: 'L20-clementi', type: 'song', icon: '🏛️', title: 'Song: Sonatina Theme (Clementi)', songId: 'clementi' },
      { id: 'L20-prelude', type: 'song', icon: '📜', title: 'Song: Little Prelude in C (Bach)', songId: 'bach-prelude' }
    ]
  },

  {
    id: 'L21', title: 'Beethoven’s Secret: Für Elise', emoji: '🎼', blurb: 'The iconic E - D# - E motif',
    intro: "Ludwig van Beethoven wrote this world-famous piece for a girl named Elise. Listen to the haunting back-and-forth semitones.",
    phase: 4, phaseTitle: 'La Grande Ligne & Composition',
    steps: [
      { id: 'L21-song', type: 'song', icon: '🎼', title: 'Song: Für Elise (Theme)', songId: 'elise' },
      { id: 'L21-peak', type: 'peak', icon: '🏔️', title: 'Peak Phrasing: Für Elise & Minuet', cfg: { rounds: 2 } }
    ]
  },

  {
    id: 'L22', title: 'Ragtime Swagger: The Entertainer', emoji: '🎩', blurb: 'Scott Joplin’s syncopated classic',
    intro: "Scott Joplin was known as the 'King of Ragtime'. This piece features playful bounces and chromatic slides.",
    phase: 4, phaseTitle: 'La Grande Ligne & Composition',
    steps: [
      { id: 'L22-song', type: 'song', icon: '🎩', title: 'Song: The Entertainer', songId: 'entertainer' }
    ]
  },

  {
    id: 'L23', title: 'The Virtuoso Recital & Inventions', emoji: '🌟', blurb: 'Perform Bach & Schumann without hints',
    intro: "Recital Mode: Visual aids dimmed! Rely on your inner ear, your fingers, and your feeling of La Grande Ligne.",
    phase: 4, phaseTitle: 'La Grande Ligne & Composition',
    steps: [
      { id: 'L23-s1', type: 'song', icon: '🌸', title: 'Recital: Melody (Schumann)', songId: 'schumann', perform: true },
      { id: 'L23-s2', type: 'song', icon: '🏰', title: 'Recital: Minuet in G (Bach)', songId: 'minuet', perform: true }
    ]
  },

  {
    id: 'L24', title: 'Grand Academy Recital & Graduation', emoji: '🏆', blurb: 'The ultimate graduation showcase!',
    intro: "Congratulations! You have completed the Little Boulanger Academy. Perform your favorite pieces for your family and earn the Master Pianist Trophy!",
    phase: 4, phaseTitle: 'La Grande Ligne & Composition',
    steps: [
      { id: 'L24-learn', type: 'learn', icon: '🎓', title: 'Graduation Day', slides: [
        { title: 'The Musician’s Journey', html: 'You know solfège, inner ear audiation, counterpoint linearity, keyboard harmony, and La Grande Ligne! You have conservatory-grade foundations. Keep playing, singing, and composing!' }
      ] },
      { id: 'L24-s1', type: 'song', icon: '🎺', title: 'Grand Finale: When the Saints', songId: 'saints', perform: true },
      { id: 'L24-s2', type: 'song', icon: '🔔', title: 'Grand Finale: Frère Jacques Canon', songId: 'frere', perform: true }
    ]
  }
];
