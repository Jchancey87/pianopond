# Piano app walkthrough and improvements

Reviewed October 15, 2026, with an eight-year-old beginner in mind.

The strongest parts are the friendly pond setting, Axie's presence beside the activity, generous cards, and patient song practice. The changes keep that visual language and focus on helping Ayana know what to do next, experiment with sound, and take breaks comfortably.

## Walkthrough

| Area | What I found | What changed |
| --- | --- | --- |
| Welcome and home | The home screen had a useful lesson banner, but Resume opened another menu. Its daily completion message was based on any three activities and claimed 20 minutes of practice. | The banner shows completed activities and a progress bar. Continue opens the next unfinished activity. Daily completion now requires finishing a dive. The introductory copy is simpler. |
| Today's Dive | A fixed “20-minute” label did not reflect the actual activities or time needed. Returning home discarded the practical route back into an unfinished dive. | A preview offers a three-activity Little Splash and, when more activities are available, a Deep Dive. Both list their activities before starting. Home resumes a dive during the same visit. Activity numbers make the endpoint visible. |
| Warm-up | The daily checklist introduced advanced vocabulary even before the first lesson. | A short pond warm-up covers comfortable sitting, relaxed hands, singing, and clapping. Existing specialist warm-ups remain in the curriculum. |
| Lessons | Reading slides only allowed moving forward. Finishing an activity required navigating back through the lesson menu. | Slides have a Back button. Results name the next unfinished activity and offer a direct Next activity button. Completing a lesson celebrates progress and suggests a stretch. |
| Song practice | Wait mode was encouraging, but there was no pause, note counter, or way to hear the target note independently. Many controls competed for space on a phone. | Added Pause/Continue, Start over, a note counter and progress bar, and Hear this note. Hints do not deduct stars. Extra options fold into Practice tools on narrow screens. Switching away from the browser pauses playback. |
| Songbook and notation | Some bonus songs could fail their unlock check. One left-hand arrangement included a note below the displayed piano. Sharp and natural signs were absent from song scores. | Fixed bonus-song access, derived left-hand keyboard ranges from their source songs, and added accidental carry and cancellation within measures. Score scrolling now accounts for the rendered SVG scale. |
| Song data and timing | Several lyric counts did not match their notes. Listening and singing always counted in four, including 3/4 songs. Changing tempo mid-song could jump the playback position. | Corrected the affected practice lyrics, made the count-in and singing pulse follow the time signature, and preserved the musical position when changing speed. |
| Free Play | The blank area offered little direction to a child unsure what to invent. Starting a new recording could leave playback available for an empty tape. | Added five rotating musical story prompts: a fish greeting, raindrops, turtle and butterfly, a sleepy tune, and a mountain melody. Recording controls now reset safely. “Play with Axie” describes the accompaniment more plainly. |
| Closet and stickers | These already give practice a playful reward without changing the central lesson layout. | Preserved the existing system. Celebration particles now clear when moving to another screen. |
| Grown-ups Corner | Practice time included results dialogs. Pausing a song also needs to pause its practice clock. | Results and paused songs no longer add practice seconds. Displayed profile names are escaped so typed angle brackets or quotation marks cannot become page markup. |
| Accessibility and offline use | Zoom was disabled; dialogs lacked focus containment; some narrow grids could overflow. | Enabled zoom, added dialog semantics and focus handling, visible focus outlines, toast announcements, larger song-control targets, and responsive grids. Updated the offline asset cache to v2.2. |

## Reliability details

Leaving a completed song during its half-second celebration delay could open results on the next screen and award progress after departure. Song timers now cancel on reset and destruction. Demo notes are released when pausing or leaving a piano. Reopening the dive completion route cannot award the finish bonus twice. A microphone input arriving immediately after an audible hint is ignored briefly, reducing the chance of the helper answering itself.

## Verification

- `node deploy/validate.js` passes for all 28 songs and 65 lesson activities. It also checks accidental carry and cancellation, and now exits with an error status when validation fails.
- `node deploy/ui-smoke.cjs` passes in real headless Chrome using an isolated temporary profile. It requires Node with built-in WebSocket support; the verified runtime was Node 24. Set `CHROME_PATH` for a different Chrome installation.
- Browser checks cover onboarding, literal profile names, lesson continuation, backward slides, completing and resuming a short dive, duplicate completion protection, song hints/pause/restart, paused time accounting, navigation during song completion, recording controls, opening every activity type and every song, and an offline reload.
- Layout checks use 1180×820, 768×1024, and 390×844 viewports. Screenshots of home, dive choices, song practice, Free Play, and the phone song screen were visually inspected.
- JavaScript syntax checks and `git diff --check` pass.

Physical MIDI keyboards, acoustic microphone recognition, and Safari/iPad audio behavior were not tested. The browser checks simulate note input; they do not judge sound quality or prove that every musical arrangement is pedagogically correct.

## Best next improvements

1. **Keep her own compositions.** Save a named recording and give it a small “My music” card. Current recordings last only while Free Play stays open and use a fixed duration for each played note. Capturing note releases would make playback sound more like her performance.
2. **Practice one small phrase.** Offer a two-bar loop with Listen → Hum → Play. This would be particularly useful as the songs get longer. It needs a deliberate definition of phrase boundaries and how phrase practice earns progress.
3. **Make advanced lessons easier to read.** The later curriculum still uses terms such as “counterpoint linearity” and “conservatory precision.” Short demonstrations and child-facing explanations would help. The score renderer also needs ties and proper handling of notes spanning barlines before claiming full engraving accuracy. The solfège helper currently maps pitch names directly; it is not a complete movable-Do system.
4. **Strengthen progress backups.** Import currently merges parsed JSON without validating the full schema. Validate the entire candidate before replacing progress, and show a preview of the student and saved progress. Persistent dive checkpoints would also allow resuming after closing the browser; current dive continuity is only within the same visit.
5. **Make real-piano expression visible.** MIDI currently discards key velocity and does not handle sustain pedal messages. A soft/loud musical game would be a useful reason to add those capabilities, with a physical-keyboard test alongside it.

Practice time remains an estimate of time spent on visible activity screens, rather than a measurement of continuous playing. A quiet learner reading or thinking can still be practicing; inactivity detection should be introduced carefully.
