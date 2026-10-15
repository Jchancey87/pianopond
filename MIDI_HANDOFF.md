# MIDI Keyboard Integration — Project Handoff & Implementation Guide

> **Project:** Axie's Piano Academy (Young Pianist Edition)  
> **Target User:** Ayana (Age 8, complete beginner)  
> **Status:** Curriculum (24 levels, 8 chapters, 18 songs) & Sheet Music Notation complete.  
> **Objective of Next Phase:** Enhance physical USB/Bluetooth MIDI keyboard input with velocity sensitivity, sustain pedal support, live status indicator, and plug-and-play auto-discovery.

---

## 1. Current Architecture & What Already Works

The app already has a functional Web MIDI foundation:

1. **Permission & Initialization (`js/audio.js` line 100):**
   - `AX.input.enableMidi()` requests `navigator.requestMIDIAccess()`.
   - Listens on all available MIDI input ports (`access.inputs.forEach`).
   - Handles `access.onstatechange` when devices are plugged or unplugged.
   - Parses Note On (`0x90`, `velocity > 0`) and Note Off (`0x80`, or `0x90` with `velocity = 0`).

2. **Virtual Keyboard Integration (`js/piano.js` line 71):**
   - Active screen registers its piano instance with `AX.input.active = self`.
   - When a physical key is pressed, `self.external(midiNote, 'midi')` fires:
     - Visually highlights the on-screen key (`down(m)`).
     - Triggers synthesizer voice allocation (`midiVoices[m] = AX.audio.noteOn(m, { vel: 0.8 })`).
     - Fires `self.onNote(m, 'midi')` which feeds into:
       - **Song Player:** Wait-mode progression for all 18 songs in repertoire.
       - **Note Hunt:** Pitch identification game.
       - **Read the Reef:** Real staff note reading flashcard quiz.
       - **Axie Says:** Simon-style musical ear training.
       - **Bubble Beat:** Rhythm highway timing check.
   - When key is released, `self.externalOff(midiNote)` cleanly releases the synth envelope.

3. **Storage & Persistence (`js/store.js` & `js/app.js`):**
   - `S.get().settings.midi` boolean remembers if MIDI was enabled.
   - Auto-calls `AX.input.enableMidi()` on startup if previously enabled.
   - Grown-ups Corner (⚙️) has a "🎹 Connect MIDI keyboard" trigger button.

---

## 2. Technical Roadmap for Next Session

### Feature A: Velocity Sensitivity (Touch Dynamics)
* **Current Behavior:** Notes triggered via MIDI play with a fixed velocity `vel: 0.8`.
* **Goal:** Map the 7-bit MIDI velocity (0–127) to synthesizer gain so Ayana learns *piano* (soft) vs *forte* (loud).
* **Implementation Formula:**
  ```javascript
  const velocityNormalized = v / 127;
  const gain = Math.pow(velocityNormalized, 1.8); // natural acoustic curve
  ```
* **Files to touch:**
  - `js/audio.js`: pass `v` in `api.active.external(n, 'midi', v)`
  - `js/piano.js`: in `self.external(m, src, vel)`, use `vel` in `AX.audio.noteOn(m, { vel })`

### Feature B: Sustain / Damper Pedal Support (CC #64)
* **Goal:** Allow an external sustain pedal to sustain notes until the pedal is released.
* **MIDI Specification:**
  - Status byte: `0xB0` (Control Change on Channel 1).
  - Controller: `64` (`0x40` Damper / Sustain Pedal).
  - Value: `>= 64` (Pedal Down), `< 64` (Pedal Up).
* **Implementation Plan:**
  - Track `isPedalDown` in `AX.Piano`.
  - When a note-off occurs while `isPedalDown === true`, defer releasing the synth voice and mark it `sustainedNotes.add(m)`.
  - When pedal goes up (`val < 64`), release all voices in `sustainedNotes`.

### Feature C: Top-Bar Connection Status Pill
* **Goal:** Immediate visual confidence for parent and child that the keyboard is detected without opening the settings menu.
* **UI Design:**
  - Add a pill next to Streak & Pearls in `#topbar`:
    ```html
    <span class="pill midi-pill" id="pill-midi" title="MIDI Keyboard">🎹 <b id="midi-name">No Keyboard</b></span>
    ```
  - States:
    - 🔴 Grey / Dimmed: No MIDI keyboard connected.
    - 🟢 Glowing Teal: `🎹 Connected: [Device Name]` (e.g. "Yamaha P-45").
* **Files to touch:**
  - `index.html` (markup in `#topbar`)
  - `css/style.css` (styling for `.midi-pill.connected`)
  - `js/audio.js` (publish connection event with device name)

### Feature D: Octave Auto-Centering / Transposition Warning
* **Context:** An 88-key or 61-key keyboard has notes outside the on-screen 2-octave / 3-octave view.
* **Goal:** If Ayana plays in the wrong octave (e.g. Middle C is note 60, but she presses C3 note 48 or C5 note 72):
  - In beginner levels, provide helpful Axie feedback: *"Almost! That's a C, but try one octave higher!"*
  - Alternatively, add an optional auto-octave snap toggle in Grown-ups Corner for compact mini-keyboards (e.g. 25-key controllers).

---

## 3. HTTPS & Tablet Setup Requirements (Self-Hosting)

> [!IMPORTANT]
> **Web MIDI API Security Restrictions:**
> Modern mobile and desktop browsers (Chrome, Edge, Samsung Internet) **strictly require HTTPS** to allow MIDI device access. The only exception is `http://localhost`.
> When serving to Ayana's tablet from your Proxmox server, you must serve over HTTPS.

### Recommended Proxmox Setup (Caddy Internal CA)
The repository includes a ready-to-run [deploy/Caddyfile](file:///F:/Ayanas%20Piano%20Lessons/deploy/Caddyfile):
```caddy
ayana-piano.local {
    root * /srv/ayana-piano
    file_server
    tls internal
}
```
1. Run Caddy inside an LXC or Docker container on Proxmox.
2. `tls internal` generates a trusted local SSL certificate automatically.
3. Install the root CA certificate on the tablet once, or use Tailscale (`*.ts.net` with automatic Let's Encrypt HTTPS).

---

## 4. Key File References for Quick Start

| Component | Primary File | Key Functions / Elements |
|---|---|---|
| **MIDI Dispatcher** | [js/audio.js](file:///F:/Ayanas%20Piano%20Lessons/js/audio.js#L100-L124) | `AX.input.enableMidi()`, `inp.onmidimessage` |
| **Piano Input Consumer** | [js/piano.js](file:///F:/Ayanas%20Piano%20Lessons/js/piano.js#L71-L78) | `self.external(m, src)`, `self.externalOff(m)` |
| **Grown-ups Corner** | [js/app.js](file:///F:/Ayanas%20Piano%20Lessons/js/app.js#L338-L355) | `#midi` button listener, settings toggle |
| **Test Suite** | [deploy/validate.js](file:///F:/Ayanas%20Piano%20Lessons/deploy/validate.js) | Run with `node deploy/validate.js` |

---

## 5. Quick Verification Steps for the Next Agent / Pair

When you resume to implement MIDI keyboard improvements:
1. Verify integrity first:
   ```bash
   node deploy/validate.js
   ```
2. Test browser MIDI support in DevTools Console:
   ```javascript
   navigator.requestMIDIAccess().then(m => console.log('Inputs:', Array.from(m.inputs.values())));
   ```
3. Use a virtual MIDI loopback tool (such as **loopMIDI** on Windows) or plug any class-compliant USB keyboard into the computer to test live note events.
