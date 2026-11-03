<!--
  ═══════════════════════════════════════════════════════════════════════════════
  Interaktives Richtungsfeld
  Kapitel 8.3: DGL  y' = x·y

  Klick in das Diagramm (oder Schieberegler) setzt den Startpunkt (x₀, y₀).
  Die Lösungskurve y = y₀·e^{(x² − x₀²)/2} erscheint sofort.
  Ein Schalter blendet die Isoklinen x·y = c ein (Nullisokline: beide Achsen).

  Design-System: identisch mit den übrigen Apps der Kursreihe.
  ═══════════════════════════════════════════════════════════════════════════════
-->

<script>
  import 'katex/dist/katex.min.css';
  import katex from 'katex';

  const tex = s => katex.renderToString(s, { throwOnError: false });

  // ── SVG-Viewport ─────────────────────────────────────────────────────────────
  const W  = 420;
  const H  = 300;
  const PL = 40;    // links  – Platz für y-Tick-Labels
  const PR = 410;   // rechts
  const PT = 10;    // oben
  const PB = 270;   // unten  – Platz für x-Tick-Labels
  const plotW = PR - PL;
  const plotH = PB - PT;

  // ── Datenbereich ─────────────────────────────────────────────────────────────
  const xMin = -2.5, xMax = 2.5;
  const yMin = -4,   yMax = 4;

  const toX = x => PL + (x - xMin) / (xMax - xMin) * plotW;
  const toY = y => PT + (yMax - y) / (yMax - yMin) * plotH;
  const toXData = px => xMin + (px - PL) / plotW * (xMax - xMin);
  const toYData = py => yMax - (py - PT) / plotH * (yMax - yMin);

  // ── Rechte Seite der DGL ─────────────────────────────────────────────────────
  const F = (x, y) => x * y;

  // ── Richtungsfeld vorberechnen (Linienelemente ohne Pfeilspitze) ─────────────
  const sx = plotW / (xMax - xMin);   // px pro x-Einheit
  const sy = plotH / (yMax - yMin);   // px pro y-Einheit
  const L  = 6.5;                      // halbe Länge eines Linienelements [px]

  const xGrid = Array.from({ length: 21 }, (_, i) => -2.5 + i * 0.25);
  const yGrid = Array.from({ length: 17 }, (_, i) => -4 + i * 0.5);

  let fieldPath = '';
  for (const xv of xGrid) {
    for (const yv of yGrid) {
      const m   = F(xv, yv);
      const len = Math.hypot(sx, m * sy);
      const dx  = L * sx / len;
      const dy  = L * m * sy / len;
      const cx  = toX(xv), cy = toY(yv);
      fieldPath += `M${cx - dx},${cy + dy} L${cx + dx},${cy - dy} `;
    }
  }

  // ── Isoklinen x·y = c (Hyperbeln) vorberechnen ───────────────────────────────
  const cValues = [-2, -1, 1, 2];
  const clampY  = y => Math.max(yMin - 1, Math.min(yMax + 1, y));
  const isoPaths = cValues.map(c => {
    const branch = (a, b) => Array.from({ length: 120 }, (_, i) => {
      const x = a + i * (b - a) / 119;
      return `${toX(x)},${toY(clampY(c / x))}`;
    }).join(' ');
    return { c, left: branch(xMin, -0.2), right: branch(0.2, xMax) };
  });

  // ── Reaktiver Zustand ────────────────────────────────────────────────────────
  let x0 = 0;
  let y0 = 2;
  let showIso = false;

  // ── Abgeleitete Größen ───────────────────────────────────────────────────────
  $: A     = y0 * Math.exp(-x0 * x0 / 2);
  $: slope = F(x0, y0);

  $: solutionPts = Array.from({ length: 400 }, (_, i) => {
    const x = xMin + i * (xMax - xMin) / 399;
    const y = clampY(A * Math.exp(x * x / 2));
    return `${toX(x)},${toY(y)}`;
  }).join(' ');

  // Tangente im Startpunkt (zeigt das Linienelement dort hervorgehoben)
  $: tangent = (() => {
    const len = Math.hypot(sx, slope * sy);
    const dx  = 14 * sx / len;
    const dy  = 14 * slope * sy / len;
    const cx  = toX(x0), cy = toY(y0);
    return { x1: cx - dx, y1: cy + dy, x2: cx + dx, y2: cy - dy };
  })();

  const fmt = v => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

  // ── Klick- und Tastatur-Handler ──────────────────────────────────────────────
  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) * (W / rect.width);
    const rawY = (e.clientY - rect.top)  * (H / rect.height);
    if (rawX < PL || rawX > PR || rawY < PT || rawY > PB) return;
    x0 = Math.round(toXData(rawX) * 10) / 10;
    y0 = Math.round(toYData(rawY) * 10) / 10;
  }

  function handleKeydown(e) {
    const step = 0.1;
    if (e.key === 'ArrowUp')    { y0 = Math.min(yMax, +(y0 + step).toFixed(1)); e.preventDefault(); }
    if (e.key === 'ArrowDown')  { y0 = Math.max(yMin, +(y0 - step).toFixed(1)); e.preventDefault(); }
    if (e.key === 'ArrowRight') { x0 = Math.min(xMax, +(x0 + step).toFixed(1)); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { x0 = Math.max(xMin, +(x0 - step).toFixed(1)); e.preventDefault(); }
  }

  // ── Achsen-Ticks ─────────────────────────────────────────────────────────────
  const xTicks = [-2, -1, 1, 2];
  const yTicks = [-4, -2, 2, 4];
  const xGridLines = [-2, -1, 0, 1, 2];
  const yGridLines = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
</script>


<div class="applet">

  <header>
    <h1>Richtungsfeld von {@html tex("y' = xy")}</h1>
    <p>
      Klicken Sie in das Diagramm, um einen Startpunkt zu setzen. Die blaue
      Lösungskurve durch diesen Punkt folgt überall den Linienelementen. Mit
      den Schiebereglern stellen Sie den Startpunkt genau ein, mit dem
      Schalter blenden Sie die Isoklinen ein.
    </p>
  </header>

  <div class="chart-wrap">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="svg-wrapper"
         role="button"
         tabindex="0"
         aria-label="Diagramm anklicken, um den Startpunkt zu setzen. Pfeiltasten verschieben den Startpunkt."
         on:click={handleClick}
         on:keydown={handleKeydown}>
      <svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet"
           role="img" aria-label="Richtungsfeld der DGL y' = xy mit Lösungskurve">

        <defs>
          <clipPath id="rf8-clip">
            <rect x={PL} y={PT} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        <!-- Gitternetz -->
        {#each xGridLines as gx}
          <line x1={toX(gx)} y1={PT} x2={toX(gx)} y2={PB} class="grid-line" />
        {/each}
        {#each yGridLines as gy}
          <line x1={PL} y1={toY(gy)} x2={PR} y2={toY(gy)} class="grid-line" />
        {/each}

        <!-- Achsen -->
        <line x1={PL} y1={toY(0)} x2={PR} y2={toY(0)} class="axis" />
        <line x1={toX(0)} y1={PT} x2={toX(0)} y2={PB} class="axis" />

        <!-- Tick-Beschriftungen am Plotrand, damit sie das Feld nicht verdecken -->
        {#each xTicks as tx}
          <text x={toX(tx)} y={PB + 17} class="tick-label"
                text-anchor="middle">{tx}</text>
        {/each}
        {#each yTicks as ty}
          <text x={PL - 7} y={toY(ty)} class="tick-label"
                text-anchor="end" dominant-baseline="middle">{ty}</text>
        {/each}
        <text x={PR} y={PB + 17} class="axis-title" text-anchor="end">x</text>
        <text x={PL - 7} y={toY(0)} class="axis-title" text-anchor="end"
              dominant-baseline="middle">y</text>

        <!-- Geclippte Plotfläche -->
        <g clip-path="url(#rf8-clip)">
          <path d={fieldPath} class="field" />

          {#if showIso}
            {#each isoPaths as iso}
              <polyline points={iso.left}  class="iso" />
              <polyline points={iso.right} class="iso" />
            {/each}
            <line x1={PL} y1={toY(0)} x2={PR} y2={toY(0)} class="iso-null" />
            <line x1={toX(0)} y1={PT} x2={toX(0)} y2={PB} class="iso-null" />
          {/if}

          <polyline points={solutionPts} class="solution" />
          <line x1={tangent.x1} y1={tangent.y1} x2={tangent.x2} y2={tangent.y2}
                class="tangent" />
        </g>

        <!-- Startpunkt -->
        <circle cx={toX(x0)} cy={toY(y0)} r="5" class="dot-start" />
      </svg>
    </div>

    <!-- Legende -->
    <div class="legend">
      <span class="lg-item"><span class="sw sw-field"></span>Linienelemente</span>
      <span class="lg-item"><span class="sw sw-solution"></span>Lösungskurve</span>
      {#if showIso}
        <span class="lg-item"><span class="sw sw-iso"></span>Isoklinen {@html tex('xy = c')}</span>
      {/if}
    </div>
  </div>

  <!-- Bedienelemente -->
  <div class="controls">
    <div class="slider-row">
      <label for="sl-x0">{@html tex('x_0')}</label>
      <input id="sl-x0" type="range" min={xMin} max={xMax} step="0.1"
             bind:value={x0} />
      <span class="sl-val">{x0.toFixed(1)}</span>
    </div>
    <div class="slider-row">
      <label for="sl-y0">{@html tex('y_0')}</label>
      <input id="sl-y0" type="range" min={yMin} max={yMax} step="0.1"
             bind:value={y0} />
      <span class="sl-val">{y0.toFixed(1)}</span>
    </div>
    <label class="toggle">
      <input type="checkbox" bind:checked={showIso} />
      Isoklinen anzeigen (gestrichelt, Nullisokline auf den Achsen)
    </label>
  </div>

  <!-- Info-Leiste -->
  <div class="info-bar">
    <div class="info-tile">
      <span class="info-lbl">Startpunkt</span>
      <span class="info-val">({x0.toFixed(1)}, {y0.toFixed(1)})</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">Steigung {@html tex('x_0\\,y_0')}</span>
      <span class="info-val">{fmt(slope)}</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">Konstante {@html tex('A = y_0\\,e^{-x_0^2/2}')}</span>
      <span class="info-val">{fmt(A)}</span>
    </div>
  </div>

</div>


<style>
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

  .applet {
    color-scheme: light;
    font-family: var(--font-body);
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
    max-width: 680px;
    margin: 0 auto;
  }

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

  .chart-wrap { padding: 16px 20px 8px; }
  .svg-wrapper {
    display: block;
    cursor: crosshair;
    outline-offset: 2px;
  }
  .svg-wrapper:focus-visible { outline: 2px solid #005a94; border-radius: 4px; }
  .svg-wrapper svg {
    width: 100%;
    max-width: 452px;
    height: auto;
    display: block;
    margin: 0 auto;
  }

  .grid-line { stroke: #ecece4; stroke-width: 1; }
  .axis      { stroke: #aaa;    stroke-width: 1.4; }

  .field {
    fill: none;
    stroke: #9a9a92;
    stroke-width: 1.2;
    stroke-linecap: round;
  }
  .iso {
    fill: none;
    stroke: #e87846;
    stroke-width: 1.6;
    stroke-dasharray: 6 4;
  }
  .iso-null {
    stroke: #e87846;
    stroke-width: 2;
    stroke-dasharray: 6 4;
  }
  .solution {
    fill: none;
    stroke: #005a94;
    stroke-width: 2.6;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .tangent {
    stroke: #e60000;
    stroke-width: 2.4;
    stroke-linecap: round;
  }
  .dot-start { fill: #e60000; pointer-events: none; }

  .tick-label {
    font-family: var(--font-ui);
    font-size: 13px;
    fill: var(--muted);
  }
  .axis-title {
    font-family: var(--font-ui);
    font-size: 14px;
    fill: var(--muted);
    font-style: italic;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px 18px;
    padding: 8px 0 4px;
    font-family: var(--font-ui);
    font-size: .8rem;
    color: var(--text);
  }
  .lg-item { display: inline-flex; align-items: center; gap: 6px; }
  .sw { display: inline-block; width: 22px; height: 0; }
  .sw-field    { border-top: 1.5px solid #9a9a92; }
  .sw-solution { border-top: 2.6px solid #005a94; }
  .sw-iso      { border-top: 2px dashed #e87846; }

  .controls {
    padding: 14px 24px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-top: 1px solid var(--border);
  }
  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-ui);
    font-size: .85rem;
  }
  .slider-row label { min-width: 28px; }
  .slider-row input[type=range] {
    flex: 1;
    accent-color: #005a94;
    cursor: pointer;
  }
  .sl-val {
    min-width: 44px;
    font-weight: 700;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-ui);
    font-size: .85rem;
    cursor: pointer;
  }
  .toggle input { accent-color: #005a94; width: 16px; height: 16px; }

  .info-bar {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid var(--border);
    background: #f3f4f6;
  }
  .info-tile {
    flex: 1 1 30%;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-right: 1px solid var(--border);
  }
  .info-tile:last-child { border-right: none; }
  .info-lbl {
    font-family: var(--font-ui);
    font-size: .7rem;
    letter-spacing: .03em;
    color: var(--muted);
  }
  .info-val {
    font-family: var(--font-ui);
    font-size: 1rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* Smartphone: Kacheln bleiben nebeneinander, damit die Höhe gleich bleibt */
  @media (max-width: 500px) {
    header { padding: 14px 16px 12px; }
    .controls { padding: 12px 16px; }
    .info-tile { padding: 8px 8px; }
    .info-lbl { font-size: .62rem; }
    .info-val { font-size: .9rem; }
  }
</style>
