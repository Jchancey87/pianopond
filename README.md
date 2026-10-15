# 🦎 Axie's Piano Academy (The "Little Boulanger" Edition)

See [the app walkthrough and improvements](APP_REVIEW.md) for the latest child-focused changes, verification, and follow-up ideas. Run the dependency-free Chrome walkthrough with `node deploy/ui-smoke.cjs` (Node 22+; set `CHROME_PATH` if needed).

> **A Conservatory-Inspired, Gamified Piano Academy for Young Beginners**  
> *Target Student: Ayana (Age 8, Complete Beginner to Intermediate)*  
> *Mascot & Guide: Axie the Axolotl*  
> *Stack: 100% Vanilla Web Standards (HTML5, CSS3, ES6 JavaScript, Web Audio API, Web MIDI API, SVG, Service Worker)*  
> *Architecture: Zero Build Tools • Zero External Dependencies • Zero Databases • 100% Offline PWA*

---

## 📑 Table of Contents
1. [Project Mission & Design Philosophy](#-project-mission--design-philosophy)
2. [Pedagogical Framework: The Nadia Boulanger Method](#-pedagogical-framework-the-nadia-boulanger-method)
3. [Core Feature Engines](#-core-feature-engines)
   - [Authentic Sheet Music Engine](#1-authentic-sheet-music-engine)
   - [Audio & Polyphonic Synthesis Engine](#2-audio--polyphonic-synthesis-engine)
   - [Hardware Integration: Web MIDI & Acoustic Pitch Detection](#3-hardware-integration-web-midi--acoustic-pitch-detection)
   - [The Practice & Game Suite](#4-the-practice--game-suite)
   - [Grown-ups Corner (Parental Dashboard)](#5-grown-ups-corner-parental-dashboard)
4. [Codebase Architecture & File Map](#-codebase-architecture--file-map)
5. [Hosting & Deployment Guide](#-hosting--deployment-guide)
   - [Local Quick Start](#a-local-quick-start)
   - [Proxmox LXC + Native Caddy (Recommended Home Server Setup)](#b-proxmox-lxc--native-caddy-recommended-home-server-setup)
   - [Docker Compose Alternative](#c-docker-compose-alternative)
   - [Cloud Hosting (GitHub Pages / Cloudflare Pages)](#d-cloud-hosting-github-pages--cloudflare-pages)
6. [Testing & Data Integrity](#-testing--data-integrity)
7. [Agent Review & Critique Guide (Target Areas for Assessment)](#-agent-review--critique-guide-target-areas-for-assessment)

---

## 🎯 Project Mission & Design Philosophy

Most commercial piano apps for young children fall into one of two traps:
1. **Mechanical "Synthesia" falling-bar rhythm games** that produce finger memory without ear training, score literacy, or musical audiation.
2. **Dry, paper-bound conservatory theory drills** that overwhelm an 8-year-old with abstract symbols before she connects sound to emotion.

**Axie's Piano Academy** bridges this gap. It pairs the high-standard classical pedagogy of **Nadia Boulanger** with friendly, underwater gamification featuring **Axie the Axolotl**.

### Technical Pillars:
* **Zero Build Pipeline:** No Vite, Webpack, Babel, or npm compilation. Every file is pure native browser ES6 and CSS3. What you read is what the browser executes.
* **Zero External Dependencies:** No external sound libraries, no third-party CDNs, and no tracking scripts. Runs indefinitely without an internet connection.
* **Deterministic Local State:** All progress, stars, pearls, and custom settings live in the browser's `localStorage` with full JSON export/import backups.
* **Installable Progressive Web App (PWA):** Equipped with a service worker (`sw.js`) and manifest (`manifest.webmanifest`) for full-screen offline execution on iPads, Android tablets, and PCs.

---

## 🏛️ Pedagogical Framework: The Nadia Boulanger Method

The curriculum adapts the Fontainebleau conservatory philosophy of **Nadia Boulanger (1887–1979)** — teacher of Aaron Copland, Philip Glass, Quincy Jones, and Burt Bacharach:

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

1. **The Inner Ear First (*Audiation & Solfège*):**
   * *Rule:* Never touch a key until you have sung the note.
   * Every note is linked to movable-Do Solfège (**Do - Re - Mi - Fa - Sol**).
   * Ear training games (**Echo Detective**) train interval recognition before notation reading.
2. **Horizontal Over Vertical (*Counterpoint & Active Bass*):**
   * Left hand is treated as a melodic singing partner, not passive "pancake" accompaniment chords.
   * Exercises train singing one hand while playing the other hand.
3. **The Living Keyboard (*Harmony & Transposition*):**
   * Melodies are transposed across C Major, G Major, and F Major by ear, naturally discovering black keys ($B\flat$ and $F\sharp$) through interval hearing.
   * Harmonic storytelling: Home ($I$), Exploring ($IV$), and The Cliffhanger ($V7$).
4. **La Grande Ligne (*Architectural Long Line*):**
   * Identifying the phrase's expressive peak (🏔️) and understanding structural form.

> 📖 **Full Pedagogy Specification:** See [BOULANGER_METHOD.md](file:///F:/Ayanas%20Piano%20Lessons/BOULANGER_METHOD.md) for detailed monthly benchmarks and pedagogical rubrics.

---

## 🎼 Core Feature Engines

### 1. Authentic Sheet Music Engine (`js/staff.js`)
Instead of displaying simplified graphics, the engine renders true classical musical notation directly into pure responsive SVG:
* Real 5-line musical staves with Treble (𝄞) and Bass (𝄢) clefs.
* Proper time signatures ($4/4$ Common Time and $3/4$ Waltz Time).
* Standard note durations: Quarter notes (♩), Half notes (𝅗𝅥), Dotted half notes (𝅗𝅥.), Whole notes (𝅝), and Eighth notes (♫).
* Measure barlines with auto-calculated horizontal measure spacing and measure numbers.
* Syllable-by-syllable Solfège and lyric alignment under each notehead.
* Dynamic color-coded finger number badges (1 through 5) above noteheads.
* Active real-time glowing playback cursor with auto-scrolling score progression.
* Instant toggle between Traditional Sheet Music and Gamified Falling Note Highway.

### 2. Audio & Polyphonic Synthesis Engine (`js/audio.js`)
* Built on the native Web Audio API (`AudioContext`).
* Multi-voice additive synthesizer simulating acoustic piano resonance with customized attack, decay, sustain, and release (ADSR) envelope dynamics.
* Real-time sound effect generator for game feedback (success chimes, pearl collection, error buzzes, star fanfare).
* Pitch math utilities in `js/music.js` calculating exact frequencies ($f = 440 \times 2^{(m-69)/12}$), MIDI numbers, and scientific pitch notation.

### 3. Hardware Integration: Web MIDI & Acoustic Pitch Detection
* **Physical USB & Bluetooth MIDI:**
  * Uses the browser `navigator.requestMIDIAccess()` API.
  * Direct event hooks in `js/audio.js` routing `0x90` Note On and `0x80` Note Off events straight into the virtual keyboard and game engine.
  * Automatically detects device plugging and unplugging via `onstatechange`.
* **Acoustic Real-Piano Detection (Microphone Mode):**
  * Built-in time-domain autocorrelation pitch detector in `js/audio.js`.
  * Enables wire-free play by setting the tablet on an upright acoustic piano or unattached keyboard; the tablet's microphone listens, estimates fundamental frequency ($f_0$), and converts sound to MIDI notes in real time.

### 4. The Practice & Game Suite (`js/games.js`, `js/songplayer.js`)
* **Interactive Song Player:**
  * **Listen Mode:** Demonstrates the song with pristine tempo while notes scroll.
  * **Sing Mode:** Metronome count-in with karaoke solfege lyrics to sing along.
  * **Wait Mode:** Zero-anxiety practice where the score halts and waits indefinitely for the student to press the correct key.
* **Mini-Games:**
  * 🎯 **Note Hunt:** Pitch identification gym.
  * 📖 **Read the Reef:** Staff flashcard sight-reading challenge.
  * 👂 **Axie Says:** Simon-style musical audiation memory game.
  * 🫧 **Bubble Beat:** Rhythm highway timing drill.
  * 🎨 **Free Play:** Improvise over looping *Cantus Firmus* basslines.

### 5. Grown-ups Corner (Parental Dashboard)
Accessible via the gear icon ⚙️ on the home screen behind a multiplication child-lock:
* 14-day daily practice tracker (minutes practiced per day).
* "Unlock All Lessons" developer/parent override toggle.
* Global audio volume, MIDI hardware toggle, and microphone sensitivity switches.
* Instant single-click JSON backup and restore of student profile, stars, and pearls.

---

## 📂 Codebase Architecture & File Map

```
F:\Ayanas Piano Lessons/
├── index.html               # Semantic single-page application markup & screen containers
├── manifest.webmanifest     # PWA metadata, color scheme, and orientation lock
├── sw.js                    # Service Worker caching all assets for 100% offline usage
├── icon.svg                 # Vector brand icon (Axolotl + Piano)
├── BOULANGER_METHOD.md      # Detailed pedagogical curriculum & conservatory rubric
├── MIDI_HANDOFF.md          # Technical roadmap for MIDI enhancements & velocity
├── README.md                # Comprehensive documentation & architectural review guide
├── css/
│   └── style.css            # Responsive styles, underwater design system, animations
├── js/
│   ├── app.js               # Application router, screen switching, initialization
│   ├── audio.js             # Web Audio synth, Web MIDI dispatcher, autocorrelation mic
│   ├── axolotl.js           # Animated Axie character renderer, mood states, dialog bubbles
│   ├── curriculum.js        # 24 levels, 8 chapters, step definitions, and milestones
│   ├── games.js             # Logic for Note Hunt, Read the Reef, Axie Says, Bubble Beat
│   ├── music.js             # Music theory constants, interval math, frequency calculators
│   ├── piano.js             # Responsive 88/61/25 key virtual piano renderer & touch handler
│   ├── songplayer.js        # Repertoire engine, wait-mode scoring, audio synchronization
│   ├── songs.js             # Database of 18 classical/folk songs (notes, fingers, lyrics)
│   ├── staff.js             # Dynamic SVG musical notation & sheet music generator
│   ├── store.js             # LocalStorage state management, star/pearl ledger, backup
│   └── ui.js                # Top-bar counters, toast notifications, particle confettis
└── deploy/
    ├── Caddyfile            # Production Caddy server configuration with local TLS
    ├── Dockerfile           # Minimal Nginx Alpine image for containerized hosting
    ├── docker-compose.yml   # Multi-container orchestration (Piano + Caddy reverse proxy)
    ├── nginx.conf           # Static file serving headers & MIME types
    └── validate.js          # Node.js consistency test suite for curriculum & music data
```

---

## 🚀 Hosting & Deployment Guide

> [!IMPORTANT]
> **Web MIDI Security Requirement:**
> Browsers strictly require a **Secure Context (`https://` or `http://localhost`)** to allow MIDI device access. Plain HTTP over a local network IP (`http://192.168.x.x`) will block MIDI access on tablets.

### A. Local Quick Start (Testing on PC)
To run directly on this PC with a MIDI keyboard plugged into USB:
```powershell
python -m http.server 8080 --directory "F:\Ayanas Piano Lessons"
# or
npx serve "F:\Ayanas Piano Lessons"
```
Open `http://localhost:8080` in Chrome or Edge.

---

### B. Proxmox LXC + Native Caddy (Recommended Home Server Setup)
This is the cleanest, lowest-overhead option (~40MB RAM, instant boot, zero Docker overhead):

1. **Create Container:** Create an unprivileged **Debian 12 LXC** in Proxmox (512MB RAM, 8GB Disk).
2. **Install Caddy & Git:**
   ```bash
   apt update && apt install -y debian-keyring debian-archive-keyring apt-transport-https curl git
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
   apt update && apt install -y caddy
   ```
3. **Clone Repo:**
   ```bash
   git clone <YOUR_GIT_REPO_URL> /var/www/ayana-piano
   chown -R caddy:caddy /var/www/ayana-piano
   ```
4. **Configure `/etc/caddy/Caddyfile`:**
   ```caddy
   # Replace with your LXC's static IP or local DNS name:
   192.168.1.50 {
       tls internal
       root * /var/www/ayana-piano
       file_server
   }
   ```
5. **Start Caddy:** `systemctl restart caddy`
6. **Trust Root CA on Ayana's Tablet:**
   * Copy `/var/lib/caddy/.local/share/caddy/pki/authorities/local/root.crt` to the tablet.
   * Install it in Android Settings (*Security > Encryption & Credentials > Install CA Certificate*) or iPad (*Settings > General > VPN & Device Management > Certificate Trust*).

---

### C. Docker Compose Alternative
If you prefer Docker containers:
```bash
cd deploy
docker compose --profile https up -d --build
```

---

### D. Cloud Hosting (GitHub Pages / Cloudflare Pages)
Because the app has zero server-side code, you can also push the repository to **GitHub Pages** or **Cloudflare Pages**. You immediately receive a public, free `https://your-domain.pages.dev` URL with zero certificate configuration needed on the tablet.

---

## 🧪 Testing & Data Integrity

The project includes an automated consistency validator in [deploy/validate.js](file:///F:/Ayanas%20Piano%20Lessons/deploy/validate.js) that checks:
* All 18 songs have balanced lines and lyrics.
* All note ranges fall within designated keyboard bounds.
* Every lesson step references a valid song ID without broken links.
* Step IDs are strictly unique.

Run the test suite with:
```bash
node deploy/validate.js
```

---

## 🔍 Agent Review & Critique Guide (Target Areas for Assessment)

When reviewing this codebase for potential improvements, critique, or refactoring, focus your evaluation on these six key areas:

### 1. Audio Synthesis & Timbre Quality (`js/audio.js`)
* **Current State:** Basic oscillator synthesis with custom envelope decay.
* **Evaluation Questions:**
  * Can we introduce realistic piano harmonics (e.g. slight detuned secondary oscillator, subtle key-strike noise burst, or soundfont sample playback) while keeping memory usage under 5MB?
  * How well does polyphonic voice-stealing behave during fast glissandos or heavy pedal usage?

### 2. Web MIDI Hardware Support (`js/audio.js`, `js/piano.js`, `MIDI_HANDOFF.md`)
* **Current State:** Notes trigger on/off at fixed velocity `0.8`.
* **Evaluation Questions:**
  * How should 7-bit velocity ($0$–$127$) be dynamically mapped to gain curves to teach an 8-year-old soft (*piano*) vs. loud (*forte*) dynamics?
  * What is the cleanest implementation for Sustain Pedal (CC #64 damper pedal) deferring note-offs?
  * Should we add a top-bar connection indicator badge showing the connected device model (e.g., "🎹 Yamaha P-45")?

### 3. Notation & Score Visuals (`js/staff.js`)
* **Current State:** Procedural SVG generator rendering staves, single clefs, quarter/half/whole notes, measures, and lyrics.
* **Evaluation Questions:**
  * How cleanly does the engine handle grand staves (simultaneous Treble and Bass staves for two hands)?
  * Are note stems, flags, and accidentals positioned according to standard engraving conventions (e.g. Gould's *Behind Bars*)?
  * Does the score scale gracefully across different aspect ratios (4:3 iPad vs 16:9 Android tablet vs desktop ultrawide)?

### 4. Pedagogical Pacing & Gamification Ergonomics (`js/curriculum.js`, `BOULANGER_METHOD.md`)
* **Current State:** 24 levels across 8 chapters following Nadia Boulanger principles.
* **Evaluation Questions:**
  * Is the learning curve between Level 4 (5-finger static position) and Level 8 (hand shifts and finger crossings) too steep for an 8-year-old?
  * Does the app over-rely on visual falling bars (Highway Mode) vs. score reading? What nudges can encourage visual score reading over button matching?

### 5. Architectural Cleanliness & Maintainability
* **Current State:** Modular vanilla ES6 files sharing the global `window.AX` namespace.
* **Evaluation Questions:**
  * Would modern native ES Modules (`import` / `export`) improve modularity without introducing a bundler?
  * Are DOM manipulation and state mutations cleanly separated, or is UI logic tightly coupled with audio callbacks?

### 6. Accessibility, Touch Latency & Child UX (`css/style.css`, `index.html`)
* **Current State:** Custom underwater theme, large buttons, child math lock.
* **Evaluation Questions:**
  * Is audio output latency minimized on lower-end mobile tablets (`latencyHint: 'interactive'`)?
  * Are hit targets on the virtual piano keys wide enough for small fingers without causing accidental adjacent note touches?
