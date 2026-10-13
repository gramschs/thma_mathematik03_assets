<script>
  import 'katex/dist/katex.min.css';
  import katex from 'katex';

  const tex = s => katex.renderToString(s, { throwOnError: false });

  // ── Beispiel aus Kapitel 5.3 ─────────────────────────────────────────────
  // v1 = (2, 2, -1), v2 = (1, 4, 1), Projektion von v2 auf v1 ist v1 (λ = 1),
  // Rest w2 = v2 - v1 = (-1, 2, 2). |v1| = |w2| = 3, also bilden v1 und w2
  // ein Quadrat mit der Diagonalen v2.
  const V0 = [0, 0, 0];
  const V1 = [2, 2, -1];
  const V2 = [1, 4, 1];
  const W2 = [-1, 2, 2];
  const N  = [2 / 3, -1 / 3, 2 / 3];       // Normale der Ebene: (v1 × w2) / 9

  // ── Vektorrechnung ───────────────────────────────────────────────────────
  const add = (a, b) => a.map((x, i) => x + b[i]);
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  const mul = (s, a) => a.map(x => s * x);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const unit = a => mul(1 / Math.hypot(...a), a);
  const inPlane = (s, t) => add(mul(s, V1), mul(t, W2));

  // ── SVG-Geometrie (1:1, W = H = 340) ─────────────────────────────────────
  // Drehpunkt ist die Mitte des Ebenenstücks, damit die Szene beim Drehen
  // im Bild bleibt.
  const W = 340;
  const H = 340;
  const SCALE  = 44;                       // px pro Längeneinheit
  const CENTER = inPlane(0.55, 0.55);

  // ── Farben (TikZ-Palette) ────────────────────────────────────────────────
  const CB  = '#005a94';   // my_darkblue  – v1
  const CL  = '#ccdee9';   // my_lightblue – Ebene
  const CR  = '#e60000';   // my_red       – Rest w2
  const CO  = '#e87846';   // my_orange    – v2
  const CDG = '#484949';   // my_darkgray  – Achsen, rechte Winkel

  // ── Ansichten (Azimut und Höhe in Grad) ──────────────────────────────────
  const VIEWS = {
    schraeg:   { az: 15, el: 22 },
    senkrecht: {                           // Blick entlang der Normalen
      az: Math.atan2(N[1], N[0]) * 180 / Math.PI,
      el: Math.asin(N[2]) * 180 / Math.PI,
    },
  };

  let az   = VIEWS.schraeg.az;
  let el   = VIEWS.schraeg.el;
  let view = 'schraeg';

  // ── Kamera und Projektion ────────────────────────────────────────────────
  function camera(azDeg, elDeg) {
    const a = azDeg * Math.PI / 180;
    const e = elDeg * Math.PI / 180;
    const p  = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
    const up = unit(sub([0, 0, 1], mul(Math.sin(e), p)));
    return { p, up, right: cross(up, p) };
  }

  function geometry(azDeg, elDeg) {
    const cam = camera(azDeg, elDeg);
    const P = q => {
      const r = sub(q, CENTER);
      return [W / 2 + SCALE * dot(r, cam.right), H / 2 - SCALE * dot(r, cam.up)];
    };
    const pts = list => list.map(q => P(q).map(c => c.toFixed(1)).join(',')).join(' ');

    // Achsen: Die Ebene geht durch den Ursprung, jede Halbachse liegt also
    // ganz vor oder ganz hinter ihr.
    const viewSide = Math.sign(dot(N, cam.p));
    const axes = [
      { name: 'x', end: [3.5, 0, 0] },
      { name: 'y', end: [0, 5.5, 0] },
      { name: 'z', end: [0, 0, 3.5] },
    ].map(({ name, end }) => {
      const a = P(V0), b = P(end);
      const d = dir(a, b);
      return {
        name,
        a, b,
        front: Math.sign(dot(N, end)) === viewSide,
        label: [b[0] + 13 * d[0], b[1] + 13 * d[1]],
      };
    });

    const q = 0.35 / 3;                    // Kantenlänge der Winkelmarken
    return {
      axes,
      plane: pts([inPlane(-0.2, -0.2), inPlane(1.3, -0.2),
                  inPlane(1.3, 1.3), inPlane(-0.2, 1.3)]),
      angle0: pts([mul(q, V1), add(mul(q, V1), mul(q, W2)), mul(q, W2)]),
      angle1: pts([sub(V1, mul(q, V1)), add(sub(V1, mul(q, V1)), mul(q, W2)),
                   add(V1, mul(q, W2))]),
      w2shift: arrow(P(V1), P(V2), 6),
      v1: arrow(P(V0), P(V1), 9),
      w2: arrow(P(V0), P(W2), 9),
      v2: arrow(P(V0), P(V2), 9),
      lv1: label(P(V0), P(V1), 0.5, P(W2)),
      lw2: label(P(V0), P(W2), 0.5, P(V1)),
      lv2: label(P(V0), P(V2), 0.72, P(V1)),
    };
  }

  // Richtung von a nach b auf dem Bildschirm
  function dir(a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    return len < 1e-6 ? [1, 0] : [dx / len, dy / len];
  }

  // Pfeil als Linie plus Spitze; die Linie endet unter der Spitze
  function arrow(a, b, size) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const L = Math.min(1.6 * size, 0.6 * len);
    const d = dir(a, b), n = [-d[1], d[0]];
    const base = [b[0] - L * d[0], b[1] - L * d[1]];
    const w = 0.55 * L;
    return {
      x1: a[0], y1: a[1],
      x2: b[0] - 0.8 * L * d[0], y2: b[1] - 0.8 * L * d[1],
      head: [b, [base[0] + w * n[0], base[1] + w * n[1]],
                [base[0] - w * n[0], base[1] - w * n[1]]]
        .map(p => p.map(c => c.toFixed(1)).join(',')).join(' '),
    };
  }

  // Beschriftung neben dem Pfeil, auf der von `away` abgewandten Seite
  function label(a, b, t, away) {
    const m = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
    const d = dir(a, b);
    let n = [-d[1], d[0]];
    if (n[0] * (m[0] - away[0]) + n[1] * (m[1] - away[1]) < 0) n = [-n[0], -n[1]];
    return [m[0] + 16 * n[0], m[1] + 16 * n[1]];
  }

  $: g = geometry(az, el);

  // ── Drehen mit Maus oder Finger ──────────────────────────────────────────
  let dragging = false;
  let lastX = 0, lastY = 0;
  let frame = null;

  function pointerDown(e) {
    e.preventDefault();                    // keine Textauswahl beim Ziehen
    cancelAnimationFrame(frame);
    dragging = true;
    view = null;
    lastX = e.clientX;
    lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function pointerMove(e) {
    if (!dragging) return;
    az -= 0.5 * (e.clientX - lastX);
    el = Math.max(-85, Math.min(85, el + 0.5 * (e.clientY - lastY)));
    lastX = e.clientX;
    lastY = e.clientY;
  }

  function pointerUp() {
    dragging = false;
  }

  // ── Sanfter Übergang zu einer festen Ansicht ─────────────────────────────
  function goTo(name) {
    cancelAnimationFrame(frame);
    view = name;
    const a0 = az, e0 = el;
    const da = ((VIEWS[name].az - a0) % 360 + 540) % 360 - 180;
    const de = VIEWS[name].el - e0;
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / 700);
      const k = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      az = a0 + k * da;
      el = e0 + k * de;
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  // ── Beschriftungen (KaTeX) ───────────────────────────────────────────────
  const T = {
    v1: tex('\\vec{v}_1'),
    v2: tex('\\vec{v}_2'),
    w2: tex('\\vec{w}_2'),
    x: tex('x'), y: tex('y'), z: tex('z'),
  };

  const tiles = [
    { lbl: 'Faktor',
      val: tex('\\lambda = \\dfrac{\\vec{v}_2\\cdot\\vec{v}_1}{\\vec{v}_1\\cdot\\vec{v}_1} = \\dfrac{9}{9} = 1') },
    { lbl: 'Rest',
      val: tex('\\vec{w}_2 = \\vec{v}_2 - \\vec{v}_1 = (-1, 2, 2)^{\\top}') },
    { lbl: 'Probe',
      val: tex('\\vec{w}_2\\cdot\\vec{v}_1 = 0') },
    { lbl: 'Längen',
      val: tex('|\\vec{v}_1| = |\\vec{w}_2| = 3') },
  ];
</script>


<!-- ══════════════════════════════════════════════════════════════════════════
     TEMPLATE
     ══════════════════════════════════════════════════════════════════════════ -->

<div class="applet">

  <!-- Header -->
  <header>
    <h1>Zerlegung von {@html T.v2} in der Ebene</h1>
    <p>
      Ziehen Sie die Grafik mit der Maus oder dem Finger, um sie zu drehen.
      Von vorn sehen Sie die Ebene ohne Verzerrung. Drehen Sie die Grafik
      auch so, dass Sie genau auf die Kante der Ebene schauen: Dann liegen
      alle drei Vektoren auf einer Linie.
    </p>
  </header>

  <!-- SVG mit Beschriftungen -->
  <div class="chart-wrap">
    <div class="stage">
      <svg viewBox="0 0 {W} {H}"
           preserveAspectRatio="xMidYMid meet"
           role="img"
           aria-label="Drehbare räumliche Darstellung der Vektoren v1, v2 und w2 in ihrer Ebene"
           class:dragging
           on:pointerdown={pointerDown}
           on:pointermove={pointerMove}
           on:pointerup={pointerUp}
           on:pointercancel={pointerUp}>

        <!-- ── Halbachsen hinter der Ebene ──────────────────────────────── -->
        {#each g.axes.filter(a => !a.front) as a}
          <line x1={a.a[0]} y1={a.a[1]} x2={a.b[0]} y2={a.b[1]}
                stroke={CDG} stroke-width="1.3"/>
        {/each}

        <!-- ── Ebenenstück ──────────────────────────────────────────────── -->
        <polygon points={g.plane} fill={CL} fill-opacity="0.75"/>

        <!-- ── Rechte Winkel im Ursprung und an der Spitze von v1 ───────── -->
        <polyline points={g.angle0} fill="none" stroke={CDG} stroke-width="1.3"/>
        <polyline points={g.angle1} fill="none" stroke={CDG} stroke-width="1.3"/>

        <!-- ── w2 verschoben an die Spitze von v1 (gestrichelt) ─────────── -->
        <line x1={g.w2shift.x1} y1={g.w2shift.y1} x2={g.w2shift.x2} y2={g.w2shift.y2}
              stroke={CR} stroke-width="1.6" stroke-dasharray="5 3"/>
        <polygon points={g.w2shift.head} fill={CR}/>

        <!-- ── Vektoren v1, w2, v2 ──────────────────────────────────────── -->
        {#each [[g.v1, CB], [g.w2, CR], [g.v2, CO]] as [v, c]}
          <line x1={v.x1} y1={v.y1} x2={v.x2} y2={v.y2}
                stroke={c} stroke-width="3" stroke-linecap="round"/>
          <polygon points={v.head} fill={c}/>
        {/each}

        <!-- ── Halbachsen vor der Ebene ─────────────────────────────────── -->
        {#each g.axes.filter(a => a.front) as a}
          <line x1={a.a[0]} y1={a.a[1]} x2={a.b[0]} y2={a.b[1]}
                stroke={CDG} stroke-width="1.3"/>
        {/each}
      </svg>

      <!-- Beschriftungen als HTML über dem SVG (KaTeX) -->
      {#each g.axes as a}
        <span class="lbl" style="left:{a.label[0] / W * 100}%; top:{a.label[1] / H * 100}%; color:{CDG}">
          {@html T[a.name]}
        </span>
      {/each}
      <span class="lbl" style="left:{g.lv1[0] / W * 100}%; top:{g.lv1[1] / H * 100}%; color:{CB}">{@html T.v1}</span>
      <span class="lbl" style="left:{g.lw2[0] / W * 100}%; top:{g.lw2[1] / H * 100}%; color:{CR}">{@html T.w2}</span>
      <span class="lbl" style="left:{g.lv2[0] / W * 100}%; top:{g.lv2[1] / H * 100}%; color:{CO}">{@html T.v2}</span>
    </div>
  </div>

  <!-- Ansichten -->
  <div class="controls">
    <span class="ctl-lbl">Ansicht</span>
    <button class:active={view === 'schraeg'}   on:click={() => goTo('schraeg')}>schräg</button>
    <button class:active={view === 'senkrecht'} on:click={() => goTo('senkrecht')}>von vorn</button>
  </div>

  <!-- Info-Leiste -->
  <div class="info-bar">
    {#each tiles as tile}
      <div class="info-tile">
        <span class="info-lbl">{tile.lbl}</span>
        <span class="info-val">{@html tile.val}</span>
      </div>
    {/each}
  </div>

</div>


<!-- ══════════════════════════════════════════════════════════════════════════
     STYLES  –  Design-Tokens aus App.svelte
     ══════════════════════════════════════════════════════════════════════════ -->

<style>
  /* ── Design-Tokens ──────────────────────────────────────────────────────── */
  :root {
    --bg:        #fafaf7;
    --surface:   #ffffff;
    --border:    #ddddd0;
    --text:      #1c1c1a;
    --muted:     #666660;
    --radius:    10px;
    --shadow:    0 3px 16px rgba(0,0,0,.09);
    --font-body: 'Georgia', 'Times New Roman', serif;
    --font-ui:   'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Container ──────────────────────────────────────────────────────────── */
  .applet {
    color-scheme: light;
    font-family: var(--font-body);
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
    max-width: 720px;
    margin: 0 auto;
  }

  /* ── Header ─────────────────────────────────────────────────────────────── */
  header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
    background: #f3f4f6;
  }
  header h1 {
    font-size: 1.1rem;
    font-weight: normal;
    letter-spacing: .02em;
  }
  header p {
    margin-top: 5px;
    font-size: .82rem;
    font-family: var(--font-ui);
    color: var(--muted);
    line-height: 1.5;
  }

  /* ── Grafik ─────────────────────────────────────────────────────────────── */
  .chart-wrap { padding: 12px 16px 8px; background: var(--surface); }
  .stage {
    position: relative;
    max-width: 400px;   /* 1:1-Inhalt, siehe Anleitung „SVG-Größe“ */
    margin: 0 auto;
  }
  .stage svg {
    width: 100%;
    height: auto;
    display: block;
    touch-action: none;
    cursor: grab;
    user-select: none;
  }
  .stage svg.dragging { cursor: grabbing; }

  .lbl {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 15px;
    line-height: 1;
    pointer-events: none;
    white-space: nowrap;
  }

  /* ── Ansichten ──────────────────────────────────────────────────────────── */
  .controls {
    padding: 12px 24px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    border-top: 1px solid var(--border);
    font-family: var(--font-ui);
    font-size: .85rem;
  }
  .ctl-lbl {
    color: var(--muted);
    margin-right: 4px;
  }
  .controls button {
    padding: 6px 14px;
    border: 1px solid #005a94;
    border-radius: 6px;
    background: #fff;
    color: #005a94;
    font-family: var(--font-ui);
    font-size: .85rem;
    cursor: pointer;
  }
  .controls button.active {
    background: #005a94;
    color: #fff;
  }

  /* ── Info-Leiste ─────────────────────────────────────────────────────────── */
  .info-bar {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid var(--border);
    background: #f3f4f6;
  }
  .info-tile {
    flex: 1 1 50%;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .info-tile:nth-child(2n) { border-right: none; }

  .info-lbl {
    font-family: var(--font-ui);
    font-size: .65rem;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--muted);
  }
  .info-val { font-size: .95rem; white-space: nowrap; }

  /* Smartphone: die beiden langen Formeln bekommen eine eigene Zeile */
  @media (max-width: 500px) {
    .info-tile:nth-child(-n+2) { flex-basis: 100%; border-right: none; }
    .info-tile:nth-child(3)    { border-right: 1px solid var(--border); }
    .info-tile:nth-child(4)    { border-right: none; }
  }
</style>
