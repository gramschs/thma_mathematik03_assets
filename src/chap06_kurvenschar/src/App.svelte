<!--
  ═══════════════════════════════════════════════════════════════════════════════
  App.svelte  –  Kurvenschar und Anfangswertproblem
  Zeigt die allgemeine Lösung v(t) = v∞ + C·e^{−kt} der ODE v̇ = g − kv.
  Feste Parameter: k = 0,2 s⁻¹, g = 9,81 m/s², v∞ = g/k = 49,05 m/s.
  Hintergrundkurven: äquidistante Startwerte v(0) ∈ {−60, −50, …, 80} m/s.
  Ein Slider wählt den Anfangswert v(0) und hebt die zugehörige Lösung hervor.
  ═══════════════════════════════════════════════════════════════════════════════
-->

<script>
  // ── SVG-Viewport ────────────────────────────────────────────────────────────
  const VW    = 600;
  const VH    = 370;
  const PAD   = { top: 28, right: 24, bottom: 52, left: 62 };
  const plotW = VW - PAD.left - PAD.right;
  const plotH = VH - PAD.top  - PAD.bottom;

  // ── Physikalische Konstanten (fest) ─────────────────────────────────────────
  const g    = 9.81;          // m/s²
  const k    = 0.20;          // s⁻¹  (k = b/m)
  const vInf = g / k;         // Grenzgeschwindigkeit = 49,05 m/s

  // ── Zeitbereich ─────────────────────────────────────────────────────────────
  const tMin = 0;
  const tMax = 30;            // s

  // ── Wertebereich v-Achse ────────────────────────────────────────────────────
  const yMin = -75;
  const yMax = 110;

  // ── Koordinatentransformation (Mathe → SVG-Pixel) ───────────────────────────
  const toX = t => PAD.left + (t - tMin) / (tMax - tMin) * plotW;
  const toY = v => PAD.top  + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  // ── Stützstellen für glatte Kurven ──────────────────────────────────────────
  const N  = 400;
  const ts = Array.from({ length: N }, (_, i) => tMin + i * (tMax - tMin) / (N - 1));

  // ── Achsen-Ticks ────────────────────────────────────────────────────────────
  const xTicks = [0, 5, 10, 15, 20, 25, 30];
  const yTicks = [-60, -40, -20, 0, 20, 40, 60, 80, 100];

  // ── Hintergrundkurven: äquidistante Startwerte ─────────────────────────────
  const bgStarts = Array.from({ length: 15 }, (_, i) => -60 + i * 10); // −60…80

  function curvePoints(v0) {
    const C = v0 - vInf;
    return ts.map(t => `${toX(t)},${toY(vInf + C * Math.exp(-k * t))}`).join(' ');
  }

  // ── Reaktiver Slider-Zustand ─────────────────────────────────────────────────
  let v0 = 0;   // Anfangsgeschwindigkeit in m/s

  // ── Reaktiv abgeleitete Größen ───────────────────────────────────────────────
  $: C        = v0 - vInf;
  $: v30      = vInf + C * Math.exp(-k * 30);
  $: hilightPts = curvePoints(v0);
  $: ptDot    = { x: toX(0), y: toY(v0) };

  // Asymptoten-Linie bei v = v∞
  const asymY = toY(vInf);
</script>


<!-- ══════════════════════════════════════════════════════════════════════════
     TEMPLATE
     ══════════════════════════════════════════════════════════════════════════ -->

<div class="applet">

  <!-- Header -->
  <header>
    <h1>App – Kurvenschar und Anfangswertproblem</h1>
    <p>
      Allgemeine Lösung <em>v</em>(<em>t</em>) = <em>v</em><sub>∞</sub> +
      <em>C</em>&thinsp;e<sup>−<em>kt</em></sup> der ODE
      <em>v̇</em> = <em>g</em> − <em>kv</em>
      (feste Parameter: <em>k</em> = 0,20 s⁻¹,&nbsp;
      <em>v</em><sub>∞</sub> = <em>g</em>/<em>k</em> = 49,05 m/s).
      Die grauen Kurven zeigen die Kurvenschar für verschiedene Startwerte.
      Der Schieberegler wählt den Anfangswert <em>v</em>(0) und bestimmt
      damit eindeutig die hervorgehobene blaue Lösung.
    </p>
  </header>

  <!-- SVG-Diagramm -->
  <div class="chart-wrap">
    <svg viewBox="0 0 {VW} {VH}" preserveAspectRatio="xMidYMid meet"
         role="img" aria-label="Interaktive Kurvenschar der ODE v̇ = g − kv">

      <defs>
        <clipPath id="plot-area-kv">
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
        </clipPath>
      </defs>

      <!-- ── Gitternetz ────────────────────────────────────────────────────── -->
      {#each xTicks as tx}
        <line x1={toX(tx)} y1={PAD.top}
              x2={toX(tx)} y2={PAD.top + plotH} class="grid-line" />
      {/each}
      {#each yTicks as ty}
        <line x1={PAD.left}         y1={toY(ty)}
              x2={PAD.left + plotW} y2={toY(ty)} class="grid-line" />
      {/each}

      <!-- ── Achsen ────────────────────────────────────────────────────────── -->
      <line x1={PAD.left}         y1={toY(0)}
            x2={PAD.left + plotW} y2={toY(0)} class="axis" />
      <line x1={toX(0)} y1={PAD.top}
            x2={toX(0)} y2={PAD.top + plotH} class="axis" />

      <!-- ── Tick-Beschriftungen ───────────────────────────────────────────── -->
      {#each xTicks as tx}
        <text x={toX(tx)} y={PAD.top + plotH + 18}
              class="tick-label" text-anchor="middle">{tx}</text>
      {/each}
      {#each yTicks as ty}
        <text x={PAD.left - 8} y={toY(ty)}
              class="tick-label" text-anchor="end"
              dominant-baseline="middle">{ty}</text>
      {/each}

      <!-- Achsenbeschriftungen -->
      <text x={PAD.left + plotW / 2} y={VH - 4}
            class="axis-title" text-anchor="middle">t (s)</text>
      <text x={14} y={PAD.top + plotH / 2}
            class="axis-title" text-anchor="middle"
            transform="rotate(-90,14,{PAD.top + plotH / 2})">v (m/s)</text>

      <!-- ══ Geclippte Plotfläche ══════════════════════════════════════════ -->
      <g clip-path="url(#plot-area-kv)">

        <!-- Grenzgeschwindigkeit v∞ (orange, gestrichelt) -->
        <line x1={PAD.left} y1={asymY}
              x2={PAD.left + plotW} y2={asymY}
              class="line-asym" />

        <!-- Hintergrundkurven (Kurvenschar, hellgrau) -->
        {#each bgStarts as v0bg}
          <polyline points={curvePoints(v0bg)} class="line-bg" />
        {/each}

        <!-- Hervorgehobene Lösung passend zu v(0) (dunkelblau) -->
        <polyline points={hilightPts} class="line-hilight" />

      </g>
      <!-- ══ Ende geclippte Fläche ═════════════════════════════════════════ -->

      <!-- v∞-Beschriftung (außerhalb Clip, rechts) -->
      <text x={PAD.left + plotW + 4} y={asymY + 4}
            class="asym-lbl" dominant-baseline="middle">v<tspan dy="3" font-size="9">∞</tspan></text>

      <!-- Anfangsbedingungspunkt bei (t = 0, v = v0) -->
      <circle cx={ptDot.x} cy={ptDot.y} r="5.5" class="dot-init" />
      <text x={ptDot.x + 10} y={ptDot.y - 9} class="point-lbl">
        v(0) = {v0.toFixed(1)} m/s
      </text>

      <!-- Legende -->
      <g transform="translate({PAD.left + plotW -180},{PAD.top + 8})">
        <line x1="0" y1="8"  x2="22" y2="8"  stroke="#b0b0a8" stroke-width="1.5" />
        <text x="28" y="12" class="legend-txt">Kurvenschar (alle Lösungen)</text>
        <line x1="0" y1="26" x2="22" y2="26" stroke="#005a94" stroke-width="2.5" />
        <text x="28" y="30" class="legend-txt">Spezielle Lösung zu v(0)</text>
        <line x1="0" y1="44" x2="22" y2="44"
              stroke="#e87846" stroke-width="1.8" stroke-dasharray="6 3" />
        <text x="28" y="48" class="legend-txt">Grenzgeschwindigkeit v<tspan dy="3" font-size="8">∞</tspan></text>
      </g>

    </svg>
  </div>

  <!-- ── Steuerung ──────────────────────────────────────────────────────────── -->
  <div class="controls">
    <div class="slider-row">
      <label for="sl-v0"><em>v</em>(0)</label>
      <input id="sl-v0" type="range"
             min="-60" max="80" step="1"
             bind:value={v0} />
      <span class="sl-val">{v0.toFixed(1)} m/s</span>
    </div>
  </div>

  <!-- ── Info-Kacheln ───────────────────────────────────────────────────────── -->
  <div class="info-bar">

    <div class="info-tile">
      <span class="info-lbl">v(0) (m/s)</span>
      <span class="info-val">{v0.toFixed(1)}</span>
    </div>

    <div class="info-tile">
      <span class="info-lbl">C = v(0) − v<sub>∞</sub></span>
      <span class="info-val">{C.toFixed(2)}</span>
    </div>

    <div class="info-tile">
      <span class="info-lbl">v<sub>∞</sub> = g/k (m/s)</span>
      <span class="info-val">{vInf.toFixed(2)}</span>
    </div>

    <div class="info-tile">
      <span class="info-lbl">v(30 s) (m/s)</span>
      <span class="info-val">{v30.toFixed(2)}</span>
    </div>

  </div>

</div>


<!-- ══════════════════════════════════════════════════════════════════════════
     STYLES  –  scoped zu dieser Komponente
     ══════════════════════════════════════════════════════════════════════════ -->

<style>
  /* ── Design-Tokens ─────────────────────────────────────────────────────── */
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

  /* ── Container ─────────────────────────────────────────────────────────── */
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

  /* ── Header ────────────────────────────────────────────────────────────── */
  header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
    background: #f3f4f6;
  }
  header h1 {
    font-size: 1.1rem;
    font-weight: normal;
    letter-spacing: .02em;
    color: var(--text);
  }
  header p {
    margin-top: 5px;
    font-size: .82rem;
    font-family: var(--font-ui);
    color: var(--muted);
    line-height: 1.5;
  }

  /* ── Diagramm ──────────────────────────────────────────────────────────── */
  .chart-wrap     { padding: 16px 20px 0; background: var(--surface); }
  .chart-wrap svg { width: 100%; height: auto; display: block; }

  .grid-line { stroke: #e8e8e0; stroke-width: 1; }
  .axis      { stroke: #aaa;    stroke-width: 1.5; }

  .tick-label {
    font-family: var(--font-ui);
    font-size: 10px;
    fill: var(--muted);
  }
  .axis-title {
    font-family: var(--font-ui);
    font-size: 12px;
    fill: var(--muted);
    font-style: italic;
  }
  .point-lbl {
    font-family: var(--font-ui);
    font-size: 11px;
    fill: #1c1c1a;
    font-weight: 700;
  }
  .asym-lbl {
    font-family: var(--font-ui);
    font-size: 11px;
    fill: #e87846;
    font-style: italic;
  }
  .legend-txt {
    font-family: var(--font-ui);
    font-size: 11px;
    fill: var(--text);
    dominant-baseline: middle;
  }

  /* Kurven-Stile */
  .line-bg {
    fill: none;
    stroke: #b8b8b0;
    stroke-width: 1.2;
    stroke-linejoin: round;
    opacity: 0.7;
  }
  .line-hilight {
    fill: none;
    stroke: #005a94;
    stroke-width: 2.8;
    stroke-linejoin: round;
  }
  .line-asym {
    fill: none;
    stroke: #e87846;
    stroke-width: 1.8;
    stroke-dasharray: 7 4;
  }
  .dot-init {
    fill: #005a94;
  }

  /* ── Steuerung ─────────────────────────────────────────────────────────── */
  .controls {
    padding: 16px 24px 14px;
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
  .slider-row label {
    min-width: 32px;
    color: var(--muted);
    font-style: italic;
  }
  .slider-row input[type=range] {
    flex: 1;
    accent-color: #005a94;
    cursor: pointer;
    height: 6px;
  }
  .sl-val {
    min-width: 80px;
    font-weight: 700;
    font-size: .95rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: #333;
  }

  /* ── Info-Leiste ───────────────────────────────────────────────────────── */
  .info-bar {
    display: flex;
    border-top: 1px solid var(--border);
    background: #f3f4f6;
  }
  .info-tile {
    flex: 1;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-right: 1px solid var(--border);
  }
  .info-tile:last-child { border-right: none; }

  .info-lbl {
    font-family: var(--font-ui);
    font-size: .7rem;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--muted);
  }
  .info-val {
    font-family: var(--font-ui);
    font-size: 1.1rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
</style>
