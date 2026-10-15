/* Axie the axolotl: SVG mascot, speech bubble, moods, skins and accessories. */
window.AX = window.AX || {};

AX.skins = {
  pink:     { name: 'Classic Pink', skin: '#ffc2d4', belly: '#ffe5ee', gill: '#ff5c8a', price: 0 },
  gold:     { name: 'Golden',       skin: '#ffe08a', belly: '#fff4c9', gill: '#ff9b3d', price: 30 },
  mint:     { name: 'Minty',        skin: '#9ee6c9', belly: '#d9f8ec', gill: '#1fb5a3', price: 40 },
  lavender: { name: 'Lavender',     skin: '#d3b8ff', belly: '#efe4ff', gill: '#9b5de5', price: 40 },
  midnight: { name: 'Midnight',     skin: '#7b8aa6', belly: '#a9b6cf', gill: '#ff6f9c', price: 50 }
};

AX.items = {
  crown:   { slot: 'head', name: 'Crown', emoji: '👑', price: 40, svg: '<path d="M88 64 L92 36 L106 52 L120 30 L134 52 L148 36 L152 64 Q120 72 88 64Z" fill="#ffd23f" stroke="#e0a800" stroke-width="3" stroke-linejoin="round"/><circle cx="120" cy="48" r="5" fill="#ff4f7b"/><circle cx="98" cy="54" r="3.5" fill="#4aa3ff"/><circle cx="142" cy="54" r="3.5" fill="#4cd97b"/>' },
  party:   { slot: 'head', name: 'Party Hat', emoji: '🎉', price: 25, svg: '<path d="M100 64 L120 10 L140 64 Q120 72 100 64Z" fill="#8e6bff"/><path d="M107 46 L133 46 L136 56 L104 56Z" fill="#ffd23f"/><circle cx="120" cy="10" r="7" fill="#ff6b8b"/><circle cx="116" cy="32" r="3" fill="#fff"/>' },
  flowers: { slot: 'head', name: 'Flower Crown', emoji: '🌸', price: 35, svg: '<g transform="translate(86 66)"><circle cx="0" cy="-9" r="7" fill="#ff8fb1"/><circle cx="9" cy="-3" r="7" fill="#ff8fb1"/><circle cx="5" cy="8" r="7" fill="#ff8fb1"/><circle cx="-5" cy="8" r="7" fill="#ff8fb1"/><circle cx="-9" cy="-3" r="7" fill="#ff8fb1"/><circle r="5" fill="#ffd23f"/></g><g transform="translate(154 66)"><circle cx="0" cy="-8" r="6" fill="#fff"/><circle cx="8" cy="-2" r="6" fill="#fff"/><circle cx="5" cy="7" r="6" fill="#fff"/><circle cx="-5" cy="7" r="6" fill="#fff"/><circle cx="-8" cy="-2" r="6" fill="#fff"/><circle r="4.5" fill="#ff9f43"/></g><path d="M90 70 Q120 58 150 70" stroke="#4cd97b" stroke-width="5" fill="none" stroke-linecap="round"/>' },
  bow:     { slot: 'head', name: 'Big Bow', emoji: '🎀', price: 20, svg: '<g transform="translate(154 64)"><path d="M0 0 L-24 -15 L-24 15Z" fill="#ff4f7b"/><path d="M0 0 L24 -15 L24 15Z" fill="#ff4f7b"/><circle r="6.5" fill="#d62c5e"/></g>' },
  wizard:  { slot: 'head', name: 'Wizard Hat', emoji: '🧙', price: 60, svg: '<path d="M84 68 Q108 62 120 -10 Q134 62 156 68 Q120 80 84 68Z" fill="#3b4cca"/><ellipse cx="120" cy="68" rx="50" ry="9" fill="#2f3db0"/><circle cx="114" cy="34" r="4" fill="#ffd23f"/><circle cx="130" cy="52" r="3" fill="#ffd23f"/><circle cx="122" cy="14" r="2.5" fill="#fff"/>' },
  shades:  { slot: 'face', name: 'Cool Shades', emoji: '😎', price: 30, svg: '<rect x="72" y="88" width="38" height="25" rx="10" fill="#1d1d2b"/><rect x="130" y="88" width="38" height="25" rx="10" fill="#1d1d2b"/><rect x="108" y="95" width="24" height="5" fill="#1d1d2b"/><path d="M79 95 l11 -3" stroke="#fff" opacity=".5" stroke-width="3" stroke-linecap="round"/><path d="M137 95 l11 -3" stroke="#fff" opacity=".5" stroke-width="3" stroke-linecap="round"/>' },
  glasses: { slot: 'face', name: 'Smart Specs', emoji: '🤓', price: 20, svg: '<circle cx="92" cy="101" r="18" fill="rgba(255,255,255,.25)" stroke="#7a4fd6" stroke-width="4"/><circle cx="148" cy="101" r="18" fill="rgba(255,255,255,.25)" stroke="#7a4fd6" stroke-width="4"/><path d="M110 101 L130 101" stroke="#7a4fd6" stroke-width="4"/>' },
  bowtie:  { slot: 'neck', name: 'Bow Tie', emoji: '🎩', price: 20, svg: '<g transform="translate(120 152)"><path d="M0 0 L-25 -14 L-25 14Z" fill="#4aa3ff"/><path d="M0 0 L25 -14 L25 14Z" fill="#4aa3ff"/><circle r="6.5" fill="#2a74d1"/></g>' },
  scarf:   { slot: 'neck', name: 'Cozy Scarf', emoji: '🧣', price: 30, svg: '<path d="M72 148 Q120 172 168 148 L170 164 Q120 188 70 164Z" fill="#ff6b6b"/><path d="M146 166 L160 202 L140 204 L132 172Z" fill="#e64c4c"/><path d="M78 156 Q120 176 162 156" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>' }
};

AX.Axie = (function () {
  let pane, wrap, bubble, bubbleText, moodTimer, hideTimer;

  // feathery gills: three stalks per side, little branches sampled along a curve
  function gills(side) {
    const stalks = [
      [[62, 88], [34, 66], [20, 48]],
      [[56, 106], [30, 100], [10, 94]],
      [[60, 124], [34, 134], [16, 146]]
    ];
    const mx = (x) => (side === 'R' ? 240 - x : x);
    let out = '';
    stalks.forEach(([p0, c, p1]) => {
      const B = (t) => [
        (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
        (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]];
      out += `<path class="a-gillc" d="M${mx(p0[0])} ${p0[1]} Q${mx(c[0])} ${c[1]} ${mx(p1[0])} ${p1[1]}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      [0.3, 0.5, 0.7, 0.92].forEach((t) => {
        const [x, y] = B(t); const [x2, y2] = B(t + 0.05);
        let dx = x2 - x, dy = y2 - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        const nx = -dy, ny = dx; const len = 12 - t * 4;
        out += `<path class="a-gillc" d="M${mx(x)} ${y} L${mx(x + nx * len + dx * 4)} ${y + ny * len + dy * 4} M${mx(x)} ${y} L${mx(x - nx * len + dx * 4)} ${y - ny * len + dy * 4}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      });
    });
    return `<g class="gill gill${side}" style="transform-origin:${side === 'L' ? 60 : 180}px 106px">${out}</g>`;
  }

  function markup() {
    return `<svg class="axie-svg" viewBox="0 -20 240 250" xmlns="http://www.w3.org/2000/svg" aria-label="Axie the axolotl">
 <g class="a-bob"><g class="a-jump">
  <path class="a-skin" d="M168 190 C 222 200 236 150 218 124 C 214 150 194 166 160 168 Z"/>
  <ellipse class="a-skin" cx="120" cy="174" rx="56" ry="44"/>
  <ellipse class="a-belly" cx="120" cy="186" rx="36" ry="28"/>
  <g class="a-arm armL"><ellipse class="a-skin" cx="72" cy="196" rx="15" ry="10" transform="rotate(-25 72 196)"/><circle class="a-skin" cx="60" cy="200" r="5"/><circle class="a-skin" cx="64" cy="206" r="5"/><circle class="a-skin" cx="72" cy="209" r="5"/></g>
  <g class="a-arm armR"><ellipse class="a-skin" cx="168" cy="196" rx="15" ry="10" transform="rotate(25 168 196)"/><circle class="a-skin" cx="180" cy="200" r="5"/><circle class="a-skin" cx="176" cy="206" r="5"/><circle class="a-skin" cx="168" cy="209" r="5"/></g>
  ${gills('L')}${gills('R')}
  <ellipse class="a-skin" cx="120" cy="106" rx="72" ry="55"/>
  <ellipse cx="70" cy="122" rx="10" ry="6.5" fill="#ff7a9a" opacity=".55"/><ellipse cx="170" cy="122" rx="10" ry="6.5" fill="#ff7a9a" opacity=".55"/>
  <g class="eyes eyes-open"><g class="blink"><circle cx="92" cy="102" r="8" fill="#2b1b2e"/><circle cx="148" cy="102" r="8" fill="#2b1b2e"/><circle cx="95" cy="99" r="3" fill="#fff"/><circle cx="151" cy="99" r="3" fill="#fff"/></g></g>
  <g class="eyes eyes-happy"><path d="M82 106 Q92 92 102 106" stroke="#2b1b2e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M138 106 Q148 92 158 106" stroke="#2b1b2e" stroke-width="5" fill="none" stroke-linecap="round"/></g>
  <circle cx="115" cy="114" r="1.6" fill="#c76b86"/><circle cx="125" cy="114" r="1.6" fill="#c76b86"/>
  <path class="mouth-smile" d="M100 120 Q120 140 140 120" stroke="#2b1b2e" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <g class="mouth-open"><path d="M104 120 Q120 156 136 120 Z" fill="#8a2c4a"/><ellipse cx="120" cy="136" rx="9" ry="5" fill="#ff8fa8"/></g>
  <g class="slot slot-face"></g><g class="slot slot-head"></g><g class="slot slot-neck"></g>
 </g></g></svg>`;
  }

  function mount(el) {
    pane = el;
    pane.innerHTML = '<div class="axie-bubble"><span></span></div><div class="axie-wrap">' + markup() + '</div>';
    bubble = pane.querySelector('.axie-bubble'); bubbleText = bubble.querySelector('span');
    wrap = pane.querySelector('.axie-wrap');
    wrap.addEventListener('pointerdown', () => { AX.audio.ensure(); AX.audio.sfx.talk(); bounce(); say(poke()); });
    refresh();
  }
  const pokes = ['Hee hee, that tickles! 💕', 'Blub blub! Ready to play?', 'Did you know axolotls can regrow their tails? 🦎', 'I love it when you sing! 🎶', 'Bubbles! 🫧🫧🫧', 'Curvy fingers, like holding a bubble!'];
  const poke = () => pokes[Math.floor(Math.random() * pokes.length)];

  function refresh() {
    if (!wrap) return;
    const st = AX.store.get(); const sk = AX.skins[st.skin] || AX.skins.pink;
    wrap.style.setProperty('--skin', sk.skin); wrap.style.setProperty('--belly', sk.belly); wrap.style.setProperty('--gill', sk.gill);
    ['head', 'face', 'neck'].forEach(slot => {
      const it = AX.items[st.equipped[slot]];
      const g = wrap.querySelector('.slot-' + slot); if (g) g.innerHTML = it ? it.svg : '';
    });
  }
  function say(html, ms) {
    if (!bubble) return;
    bubbleText.innerHTML = html; bubble.classList.add('show'); bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    clearTimeout(hideTimer); if (ms) hideTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  function setMood(m, ms) {
    if (!wrap) return;
    wrap.classList.remove('m-happy', 'm-sing', 'm-wow');
    if (m && m !== 'idle') wrap.classList.add('m-' + m);
    clearTimeout(moodTimer); if (ms) moodTimer = setTimeout(() => setMood('idle'), ms);
  }
  function bounce() {
    if (!wrap) return; const j = wrap.querySelector('.a-jump'); if (!j) return;
    j.classList.remove('jump'); void j.getBoundingClientRect(); j.classList.add('jump');
  }
  function cheer(text) { setMood('happy', 2500); bounce(); if (text) say(text); }
  function small(on) { if (pane) pane.classList.toggle('small', !!on); }
  return { mount, refresh, say, setMood, bounce, cheer, small, markup };
})();
