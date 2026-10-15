# 🦎 Axie's Piano Academy (The "Little Boulanger" Edition)

A gamified, interactive piano academy and conservatory-inspired practice regimen designed specifically for an 8-year-old beginner. Axie the axolotl is her supportive practice partner and musical guide.

Built with **pure Web Standards** (HTML5, CSS3, Vanilla JS, Web Audio API, Web MIDI, Service Worker). **No build steps, no external dependencies, and no database required.** Works completely offline on tablets, phones, and PCs, with full self-hosting instructions for your Proxmox server.

---

## 🏛️ The Nadia Boulanger Pedagogical Framework

This curriculum adapts the philosophy of **Nadia Boulanger (1887–1979)** — the legendary French pedagogue who trained Aaron Copland, Philip Glass, Elliott Carter, Quincy Jones, and Burt Bacharach. Her Fontainebleau conservatory method is scaled into playful, ear-first daily habits for an 8-year-old child:

```
               ┌────────────────────────────────────────────────────────┐
               │           THE "LITTLE BOULANGER" FRAMEWORK             │
               └────────────────────────────────────────────────────────┘
                                           │
         ┌──────────────────┬──────────────┴─────┬──────────────────┐
         ▼                  ▼                    ▼                  ▼
   1. INNER EAR       2. HORIZONTAL        3. THE LIVING      4. LA GRANDE
      FIRST              OVER VERTICAL        KEYBOARD           LIGNE
  (Solfège & Ear)    (Contrapuntal Line)   (Harmony/Transpose)  (Arc & Form)
```

1. **The Inner Ear First (Solfège & Audiation):**
   - *"Sing Before You Play."* Before touching a key, sing the phrase using Solfège (**Do - Re - Mi - Fa - Sol**).
   - **Echo Detective Game:** Ear dictation where Axie plays motifs while keys are dimmed; Ayana sings them back on Do-Re-Mi and finds them on the piano.
   - **Stravinsky Rhythm Drills:** Steady foot/hand quarter-note pulse while vocalizing or clapping syncopations.
2. **Horizontal over Vertical (Counterpoint & Independent Voices):**
   - The left hand is an expressive, singing voice — not passive accompaniment or "pancake chords."
   - **Play One, Sing the Other:** Play the left-hand bassline on the piano while singing the right-hand melody aloud (then switch!).
   - **The Contrary Motion Game:** Starting from Middle C, hands move in opposite directions, training the ear to recognize sweet consonances (3rds, 6ths) versus spicy dissonances (2nds, 7ths).
3. **Keyboard Harmony as a Playground (Living Theory & Transposition):**
   - Music theory is never dry paper; every concept is immediately played and transposed at the piano.
   - **The 3-Key Transposition Challenge:** Shift tunes (*Hot Cross Buns*, *Ode to Joy*) across **C Major**, **G Major**, and **F Major** completely by ear, discovering why F Major needs a black key ($B\flat$).
   - **Cadence Storytelling:** Feel harmonic pull — 🏡 **Home ($I$)**, ⛵ **Exploring ($IV$)**, and 🧗 **The Cliffhanger ($V7$)** ("*Where does this note want to go?*").
4. **La Grande Ligne (The Long Line & Architectural Form):**
   - Feel the overarching forward momentum and emotional arc from the first note to the last.
   - **Finding the Mountain Peak (🏔️):** Locate the highest expressive summit of each piece before playing; build energy toward it and let it gently resolve.
   - **Weekly Mini-Inventions:** Improvise original two-part melodies over Axie's looping 4-bar *Cantus Firmus* walking bassline in Free Play.

> 📖 **Full Pedagogy Guide:** For detailed teaching notes and monthly benchmarks, read [BOULANGER_METHOD.md](BOULANGER_METHOD.md).

---

## 🗺️ The 4-Phase 18-to-24 Month Roadmap (24 Levels)

| Phase | Months | Boulanger Pillar & Goal | Core Repertoire & Exercises |
|---|---|---|---|
| **Phase 1: The Singing Ear** | Months 1–4 | **Solfège & Rythme:** Connect voice to fingers; internalize pulse and basic intervals. | *Pond Scale (Do-Re-Mi)*, *Hot Cross Buns*, *Au Clair de la Lune*, *Frère Jacques* (Canon), Béla Bartók's *Mikrokosmos Vol. 1*, Echo Detective. |
| **Phase 2: Two Voices Talking** | Months 5–9 | **Counterpoint (Linearity):** Hear two independent lines at once; Left Hand as a singer. | *Mary Had a Little Lamb LH*, *Ode to Joy LH*, J.S. Bach's *Minuet in G*, Bach's *Musette in D* (*Anna Magdalena Notebook*), Contrary Motion Game. |
| **Phase 3: The Living Keyboard** | Months 10–15 | **Keyboard Harmony & Transposition:** Tension vs release; transpose tunes by ear; master $I$, $IV$, $V7$ cadences. | Bach *Little Prelude in C* (BWV 939), Clementi *Sonatina in C* Op. 36 No. 1, Pachelbel's *Canon in D*, *Scarborough Fair*, 3-Key Transposition, Cadence Story. |
| **Phase 4: La Grande Ligne & Form** | Months 16–24 | **Architecture, Expression & Composition:** Shape complete musical stories; write original two-part pieces. | Robert Schumann's *Melody* (*Album for the Young* Op. 68), Beethoven's *Für Elise*, Scott Joplin's *The Entertainer*, Finding the Peak, Cantus Firmus Inventions. |

---

## 🎼 Authentic Sheet Music Notation Engine

- **Real 5-Line Musical Staves:**
  - Proper Clefs (Treble 𝄞 and Bass 𝄢)
  - Time Signatures (4/4 Common Time and 3/4 Waltz Time)
  - Real Note Durations: **Quarter notes (♩)**, **Half notes (𝅗𝅥)**, **Dotted half notes (𝅗𝅥.)**, **Whole notes (𝅝)**, and **Eighth notes (♫)**
  - Vertical Measure Bar Lines with measure numbers
  - Color-coded finger number badges above noteheads
  - Syllable-by-syllable lyric and Solfège alignment directly below the notes
  - Active glowing noteheads and smooth auto-scrolling that tracks playback in real time!
- **Highway Mode Toggle:** Switch instantly between traditional sheet music and gamified falling notes.

---

## 🎤 The "Sing & Play" Practice Cycle

Research proves that singing the melody builds the inner ear faster than mechanical button-mashing:
1. 👂 **Listen Mode:** Axie demonstrates the song with full tone while the score scrolls.
2. 🎤 **Sing Mode:** Soft piano backing track with count-in metronome. Karaoke lyrics light up so she can sing the words, solfege (*Do Re Mi*), or note names (*C D E*).
3. 🎹 **Play Mode (Wait Mode):** Zero-pressure learning. The sheet music notes glow and wait indefinitely for her to press the correct key with the correct finger.

---

## 🤿 Today's Dive (20-Minute Daily Conservatory Routine)

1. **Minutes 0–4:** Posture alignment & Solfège vocal warm-up.
2. **Minutes 4–8:** Ear & Counterpoint gym (Echo Detective, Contrary Motion, or Cadence Story).
3. **Minutes 8–15:** Repertoire study (Listen → Sing on Solfège → Play in Wait Mode).
4. **Minutes 15–20:** Creative Playground (Free Play improvisation over *Cantus Firmus* bassline, Transposition challenge, or review favorite).

---

## 🎹 Hardware Support

- **Touchscreen Piano:** Multi-touch on-screen keyboard with responsive audio synthesis.
- **USB / Bluetooth MIDI:** Plug in any digital piano or keyboard; notes trigger instantly via Web MIDI. See [MIDI_HANDOFF.md](MIDI_HANDOFF.md) for velocity curves and hardware setup.
- **🎤 Acoustic Piano Pitch Detection:** Built-in autocorrelation pitch tracker. Prop the tablet on an acoustic piano and tap "Real piano" to play along without wires!

---

## 🚀 Testing & Self-Hosting

### Quick Run Locally
Open in any browser:
```text
file:///F:/Ayanas%20Piano%20Lessons/index.html
```
Or with a local server:
```powershell
npx serve "F:\Ayanas Piano Lessons"
# or
python -m http.server 8080 --directory "F:\Ayanas Piano Lessons"
```

### Proxmox Deployment (Docker & Caddy)
Located in `deploy/`:
- **Plain HTTP (Port 8080):**
  ```bash
  cd deploy && docker compose up -d --build
  ```
- **Recommended HTTPS (Caddy internal CA for Mic/MIDI permissions):**
  ```bash
  cd deploy && docker compose --profile https up -d --build
  ```
- On her tablet, navigate to the server and tap **"Add to Home Screen"** to install as a full-screen offline PWA!

---

## 🔐 Grown-ups Corner

Access via the gear ⚙️ icon on the home screen (pass the multiplication math lock):
- **🏛️ The "Little Boulanger" Pedagogy Guide** (Fontainebleau framework & practice tips)
- 14-day practice tracker (minutes per day)
- Unlock all lessons toggle (skip ahead if desired)
- Name customization, audio volume, and MIDI/Mic toggles
- Instant JSON backup and restore of all stars and pearls
