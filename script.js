/* Concursul de Crăciun — Panait Cerna Brăila */
document.documentElement.classList.add('js');
document.title = 'Concursul de Crăciun | Panait Cerna Brăila';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= ZĂPADĂ ================= */
(function snow() {
  const canvas = document.getElementById('snow');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let w, h, flakes = [], raf, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    const count = Math.round(Math.min(70, Math.max(28, innerWidth / 9)));
    flakes = Array.from({ length: count }, () => makeFlake(true));
  }
  function makeFlake(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10 * dpr,
      r: (Math.random() * 2.4 + 0.8) * dpr,
      v: (Math.random() * 0.9 + 0.4) * dpr,
      s: Math.random() * Math.PI * 2,
      a: Math.random() * 0.5 + 0.35
    };
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.v; f.s += 0.012; f.x += Math.sin(f.s) * 0.45 * dpr;
      if (f.y > h + 10) Object.assign(f, makeFlake(false), { x: Math.random() * w });
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,' + f.a + ')';
      ctx.arc(f.x, f.y, f.r, 0, 6.2832);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else draw();
  });
  resize(); draw();
})();

/* ================= APARIȚIE LA SCROLL ================= */
(function reveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(e => io.observe(e));
})();

/* ================= CALENDAR + NUMĂRĂTOARE ================= */
(function calendar() {
  const events = [...document.querySelectorAll('.event')].map(el => {
    const [sy, sm, sd] = el.dataset.start.split('-').map(Number);
    const [ey, em, ed] = el.dataset.end.split('-').map(Number);
    return {
      el, name: el.dataset.name,
      start: new Date(sy, sm - 1, sd, 0, 0, 0),
      end: new Date(ey, em - 1, ed, 23, 59, 59)
    };
  });
  const label = document.getElementById('cd-label');
  const name = document.getElementById('cd-name');
  const box = document.querySelector('.countdown');
  const nd = document.getElementById('cd-d'), nh = document.getElementById('cd-h'),
        nm = document.getElementById('cd-m'), ns = document.getElementById('cd-s');
  const pad = n => String(n).padStart(2, '0');

  function tick() {
    const now = new Date();
    let target = null, mode = '';
    events.forEach(e => e.el.classList.remove('active', 'next', 'done'));
    let nextMarked = false;
    for (const e of events) {
      if (now > e.end) e.el.classList.add('done');
      else if (now >= e.start) { e.el.classList.add('active'); if (!target) { target = e; mode = 'end'; } }
      else if (!nextMarked) { e.el.classList.add('next'); nextMarked = true; if (!target) { target = e; mode = 'start'; } }
    }
    if (!target) {
      box.classList.add('done');
      label.textContent = 'Concursul s-a încheiat';
      name.textContent = 'Mulțumim tuturor claselor participante! 🎄';
      return;
    }
    box.classList.remove('done');
    label.textContent = mode === 'start' ? 'Următoarea etapă începe în' : 'Etapa curentă se încheie în';
    name.textContent = target.name;
    const diff = Math.max(0, (mode === 'start' ? target.start : target.end) - now);
    const s = Math.floor(diff / 1000);
    nd.textContent = Math.floor(s / 86400);
    nh.textContent = pad(Math.floor(s % 86400 / 3600));
    nm.textContent = pad(Math.floor(s % 3600 / 60));
    ns.textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);
})();

/* ================= DISTRIBUIE ================= */
(function share() {
  const btn = document.getElementById('share');
  if (!btn) return;
  const original = btn.innerHTML;
  btn.addEventListener('click', async () => {
    const data = { title: 'Concursul de Crăciun – Panait Cerna Brăila', text: 'Decorăm. Creăm. Câștigăm! Vezi calendarul, regulile și premiile.', url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(location.href);
      btn.textContent = 'Link copiat! ✓';
    } catch (e) { btn.textContent = 'Copiază linkul din bara de adrese'; }
    setTimeout(() => { btn.innerHTML = original; }, 2200);
  });
})();

/* ================= MUZICĂ DE CRĂCIUN (sintetizată, fără fișiere) =================
   Melodii tradiționale (domeniu public): „Jingle Bells” și „We Wish You a Merry Christmas”.
   Sunt generate direct în browser cu Web Audio, așa că nu e nevoie de niciun fișier audio. */
(function music() {
  const btn = document.getElementById('music-btn');
  const text = document.getElementById('music-text');
  const hint = document.getElementById('music-hint');
  if (!btn) return;

  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { document.getElementById('music').style.display = 'none'; return; }

  // [notă MIDI, durată în timpi]; 0 = pauză
  const m = { C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A4: 69, B4: 71, G4: 67, A5: 81 };
  const jingle = (() => {
    const E = m.E5, F = m.F5, G = m.G5, C = m.C5, D = m.D5;
    const l1 = [[E,1],[E,1],[E,2],[E,1],[E,1],[E,2],[E,1],[G,1],[C,1.5],[D,.5],[E,4]];
    const l2 = [[F,1],[F,1],[F,1.5],[F,.5],[F,1],[E,1],[E,1],[E,.5],[E,.5],[E,1],[D,1],[D,1],[E,1],[D,2],[G,2]];
    const l3 = [[F,1],[F,1],[F,1.5],[F,.5],[F,1],[E,1],[E,1],[E,.5],[E,.5],[G,1],[G,1],[F,1],[D,1],[C,4]];
    return { bpm: 150, notes: [].concat(l1, l2, l1, l3) };
  })();
  const wish = (() => {
    const { G4, C5, D5, E5, F5, A4, B4 } = m;
    const n = [[G4,1],
      [C5,1],[C5,.5],[D5,.5],[C5,.5],[B4,.5],
      [A4,1],[A4,1],[A4,1],
      [D5,1],[D5,.5],[E5,.5],[D5,.5],[C5,.5],
      [B4,1],[G4,1],[G4,1],
      [E5,1],[E5,.5],[F5,.5],[E5,.5],[D5,.5],
      [C5,1],[A4,1],[G4,.5],[G4,.5],
      [A4,1],[D5,1],[B4,1],
      [C5,3]];
    return { bpm: 132, notes: n };
  })();
  const songs = [jingle, wish];

  let ctx = null, master = null, playing = false, timer = null;
  let songIdx = 0, noteIdx = 0, nextTime = 0;

  const hz = midi => 440 * Math.pow(2, (midi - 69) / 12);

  function bell(freq, t, dur, vel) {
    // „cutie muzicală” / clopoțel: fundamentală + armonici scurte
    const partials = [[1, 1], [2.01, .35], [3.99, .12]];
    partials.forEach(([mul, amp]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq * mul;
      const peak = vel * amp;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(.35, dur * (mul === 1 ? 1.5 : .7)));
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + Math.max(.4, dur * 1.6) + .05);
    });
  }
  function jingleTick(t) { // „zurgălăi” discreți
    const len = 0.05, buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(); s.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6500;
    const g = ctx.createGain(); g.gain.value = 0.05;
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }

  function schedule() {
    if (!playing) return;
    const song = songs[songIdx], beat = 60 / song.bpm;
    while (nextTime < ctx.currentTime + 0.6) {
      const [note, beats] = song.notes[noteIdx];
      const dur = beats * beat;
      bell(hz(note), nextTime, dur, 0.28);
      if (beats >= 1) bell(hz(note - 12), nextTime, dur, 0.10);   // octavă joasă, pentru plinătate
      if (noteIdx % 2 === 0) jingleTick(nextTime);
      nextTime += dur;
      noteIdx++;
      if (noteIdx >= song.notes.length) {
        noteIdx = 0; songIdx = (songIdx + 1) % songs.length; nextTime += beat * 2;
        break;
      }
    }
    timer = setTimeout(schedule, 120);
  }

  function setUI(on) {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Oprește muzica' : 'Pornește muzica de Crăciun');
    text.textContent = on ? 'Oprește' : 'Muzică';
  }
  function hideHint() { hint.classList.add('hide'); }

  async function start() {
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (e) {} }
    playing = true; setUI(true); hideHint();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.8);
    nextTime = ctx.currentTime + 0.15; noteIdx = 0;
    clearTimeout(timer); schedule();
    try { localStorage.setItem('craciun-muzica', 'on'); } catch (e) {}
  }
  function stop() {
    playing = false; setUI(false); clearTimeout(timer);
    if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
      setTimeout(() => { if (!playing && ctx.state === 'running') ctx.suspend(); }, 450);
    }
    try { localStorage.setItem('craciun-muzica', 'off'); } catch (e) {}
  }

  btn.addEventListener('click', () => playing ? stop() : start());

  // Oprește muzica când fila nu e vizibilă, reia când te întorci
  let wasPlaying = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { wasPlaying = playing; if (playing) stop(); }
    else if (wasPlaying) { start(); wasPlaying = false; }
  });

  // Textul de invitație dispare singur după câteva secunde
  setTimeout(hideHint, 9000);
})();
