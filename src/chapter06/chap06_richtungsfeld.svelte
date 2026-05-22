<!--
  ═══════════════════════════════════════════════════════════════════════════════
  App.svelte  –  Interaktives Richtungsfeld
  Kapitel 6.2: ODE  v̇ = g − kv  mit k = 0,2 s⁻¹, g = 9,81 m/s²

  Klick in das Diagramm (oder Schieberegler) setzt den Startpunkt (t₀, v₀).
  Die exakte Lösungskurve v(t) = v∞ + C·e^{−k(t−t₀)} erscheint sofort.

  Design-System: identisch mit den übrigen Apps der Kursreihe.
  ═══════════════════════════════════════════════════════════════════════════════
-->

<script>
  // ── SVG-Viewport ─────────────────────────────────────────────────────────────
  const VW    = 600;
  const VH    = 360;
  const PAD   = { top: 24, right: 24, bottom: 50, left: 60 };
  const plotW = VW - PAD.left - PAD.right;
  const plotH = VH - PAD.top  - PAD.bottom;

  // ── Physikalische Konstanten (fest) ──────────────────────────────────────────
  const g    = 9.81;
  const k    = 0.20;
  const vInf = g / k;   // 49,05 m/s

  // ── Datenbereiche ─────────────────────────────────────────────────────────────
  const tMin = 0,  tMax = 30;
  const vMin = -8, vMax = 82;

  // ── Koordinatentransformationen (Daten ↔ SVG-Pixel) ──────────────────────────
  const toX = t => PAD.left + (t - tMin) / (tMax - tMin) * plotW;
  const toY = v => PAD.top  + (1 - (v - vMin) / (vMax - vMin)) * plotH;
  const toT = x => tMin + (x - PAD.left) / plotW * (tMax - tMin);
  const toV = y => vMax - (y - PAD.top)  / plotH * (vMax - vMin);

  // ── Pixelmaßstäbe für Pfeillängen-Normierung ──────────────────────────────────
  const sx = plotW / (tMax - tMin);   // px pro t-Einheit
  const sy = plotH / (vMax - vMin);   // px pro v-Einheit
  const L  = 10;                       // halbe Pfeillänge [px]
  const AS = 3.5;                      // Pfeilspitzengröße [px]

  // ── Richtungsfeld vorberechnen ────────────────────────────────────────────────
  // Alle Linien + Pfeilspitzen als je ein einziger SVG-Pfad-String.
  const tGrid = Array.from({ length: 11 }, (_, i) => i * 3);   // 0, 3, …, 30
  const vGrid = Array.from({ length: 12 }, (_, i) => i * 7);   // 0, 7, …, 77

  let fieldLines = '';
  let fieldHeads = '';

  for (const tv of tGrid) {
    for (const vv of vGrid) {
      const f    = g - k * vv;
      const sLen = Math.sqrt(sx * sx + f * f * sy * sy);
      const dt   = L / sLen;
      const dv   = f * dt;

      const ax1  = toX(tv - dt), ay1 = toY(vv - dv);
      const tipX = toX(tv + dt), tipY = toY(vv + dv);

      const ddx  = tipX - ax1, ddy = tipY - ay1;
      const dlen = Math.sqrt(ddx * ddx + ddy * ddy);
      const ux = ddx / dlen, uy = ddy / dlen;
      const px = -uy,        py = ux;

      const ax2 = tipX - AS * ux, ay2 = tipY - AS * uy;
      const w1x = ax2 + AS * 0.45 * px, w1y = ay2 + AS * 0.45 * py;
      const w2x = ax2 - AS * 0.45 * px, w2y = ay2 - AS * 0.45 * py;

      fieldLines += `M${ax1},${ay1} L${ax2},${ay2} `;
      fieldHeads += `M${tipX},${tipY} L${w1x},${w1y} L${w2x},${w2y} Z `;
    }
  }

  // ── Reaktiver Zustand ─────────────────────────────────────────────────────────
  let t0 = 0;
  let v0 = 0;

  // ── Reaktiv abgeleitete Größen ────────────────────────────────────────────────
  $: C   = v0 - vInf;
  $: v30 = vInf + C * Math.exp(-k * (30 - t0));

  $: solutionPts = (() => {
    if (t0 >= tMax - 0.1) return '';
    return Array.from({ length: 300 }, (_, i) => {
      const t = t0 + i * (tMax - t0) / 299;
      const v = vInf + C * Math.exp(-k * (t - t0));
      return `${toX(t)},${toY(v)}`;
    }).join(' ');
  })();

  $: dotX = toX(t0);
  $: dotY = toY(v0);

  // ── Klick- und Tastatur-Handler ──────────────────────────────────────────────
  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) * (VW / rect.width);
    const rawY = (e.clientY - rect.top)  * (VH / rect.height);
    if (rawX < PAD.left || rawX > PAD.left + plotW) return;
    if (rawY < PAD.top  || rawY > PAD.top  + plotH) return;
    t0 = Math.max(tMin, Math.min(tMax - 0.5, Math.round(toT(rawX) * 2) / 2));
    v0 = Math.max(vMin, Math.min(vMax,        Math.round(toV(rawY))));
  }

  // Tastatur-Fallback: Pfeiltasten verschieben v₀ / t₀ schrittweise
  function handleKeydown(e) {
    if (e.key === 'ArrowUp')    { v0 = Math.min(vMax, v0 + 2); e.preventDefault(); }
    if (e.key === 'ArrowDown')  { v0 = Math.max(vMin, v0 - 2); e.preventDefault(); }
    if (e.key === 'ArrowRight') { t0 = Math.min(tMax - 0.5, t0 + 0.5); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { t0 = Math.max(tMin, t0 - 0.5); e.preventDefault(); }
  }

  // ── Achsen-Ticks ──────────────────────────────────────────────────────────────
  const xTicks = [0, 5, 10, 15, 20, 25, 30];
  const yTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80];
</script>


<!-- ══════════════════════════════════════════════════════════════════════════
     TEMPLATE
     ══════════════════════════════════════════════════════════════════════════ -->

<div class="applet">

  <header>
    <h1>App – Interaktives Richtungsfeld</h1>
    <p>
      Richtungsfeld der ODE <em>v̇</em> = <em>g</em> − <em>kv</em>
      (<em>k</em> = 0,20 s⁻¹,&thinsp;<em>v</em><sub>∞</sub> = 49,05 m/s).
      <strong>Klicke in das Diagramm</strong>, um den Startpunkt
      (<em>t</em><sub>0</sub>,&thinsp;<em>v</em><sub>0</sub>) zu setzen –
      die blaue Lösungskurve folgt sofort den Linienelementen des Richtungsfelds.
      Die Schieberegler erlauben eine genaue Einstellung.
    </p>
  </header>

  <div class="chart-wrap">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="svg-wrapper"
         role="button"
         tabindex="0"
         aria-label="Diagramm anklicken, um den Startpunkt (t₀, v₀) zu setzen. Pfeiltasten: v₀ / t₀ anpassen."
         on:click={handleClick}
         on:keydown={handleKeydown}>
      <svg viewBox="0 0 {VW} {VH}" preserveAspectRatio="xMidYMid meet"
           role="img" aria-label="Interaktives Richtungsfeld der ODE v̇ = g − kv">

      <defs>
        <clipPath id="rf-clip">
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
        </clipPath>
      </defs>

      <!-- Gitternetz -->
      {#each xTicks as tx}
        <line x1={toX(tx)} y1={PAD.top}
              x2={toX(tx)} y2={PAD.top + plotH} class="grid-line" />
      {/each}
      {#each yTicks as ty}
        <line x1={PAD.left}         y1={toY(ty)}
              x2={PAD.left + plotW} y2={toY(ty)} class="grid-line" />
      {/each}

      <!-- Achsen -->
      <line x1={PAD.left}         y1={toY(0)}
            x2={PAD.left + plotW} y2={toY(0)} class="axis" />
      <line x1={toX(0)} y1={PAD.top}
            x2={toX(0)} y2={PAD.top + plotH} class="axis" />

      <!-- Tick-Beschriftungen -->
      {#each xTicks as tx}
        <text x={toX(tx)} y={PAD.top + plotH + 18}
              class="tick-label" text-anchor="middle">{tx}</text>
      {/each}
      {#each yTicks as ty}
        <text x={PAD.left - 8} y={toY(ty)}
              class="tick-label" text-anchor="end"
              dominant-baseline="middle">{ty}</text>
      {/each}

      <text x={PAD.left + plotW / 2} y={VH - 4}
            class="axis-title" text-anchor="middle">t (s)</text>
      <text x={14} y={PAD.top + plotH / 2}
            class="axis-title" text-anchor="middle"
            transform="rotate(-90,14,{PAD.top + plotH / 2})">v (m/s)</text>

      <!-- Geclippte Plotfläche -->
      <g clip-path="url(#rf-clip)">
        <path d={fieldLines} class="field-lines" />
        <path d={fieldHeads} class="field-heads" />
        <line x1={PAD.left}         y1={toY(vInf)}
              x2={PAD.left + plotW} y2={toY(vInf)}
              class="asym-line" />
        <polyline points={solutionPts} class="line-solution" />
      </g>

      <!-- Nullisokline-Label (außerhalb Clip) -->
      <text x={PAD.left + plotW + 5} y={toY(vInf) + 4}
            class="asym-lbl" dominant-baseline="middle">
        v<tspan dy="3" font-size="9">∞</tspan>
      </text>

      <!-- Startpunkt-Marker -->
      <circle cx={dotX} cy={dotY} r="5.5" class="dot-start" />
      <text x={dotX + 9} y={dotY - 9} class="point-lbl">
        ({t0.toFixed(1)}&thinsp;s,&nbsp;{v0.toFixed(0)}&thinsp;m/s)
      </text>

      <!-- Legende -->
      <g transform="translate({PAD.left + plotW - 205},{PAD.top + 8})">
        <line x1="0" y1="8"  x2="22" y2="8"  stroke="#b0b0a8" stroke-width="1.4" />
        <text x="28" y="12" class="legend-txt">Richtungsfeld</text>
        <line x1="0" y1="26" x2="22" y2="26" stroke="#005a94" stroke-width="2.5" />
        <text x="28" y="30" class="legend-txt">Lösungskurve zu (t₀, v₀)</text>
        <line x1="0" y1="44" x2="22" y2="44"
              stroke="#e87846" stroke-width="1.8" stroke-dasharray="6 3" />
        <text x="28" y="48" class="legend-txt">
          Nullisokline v<tspan dy="3" font-size="8">∞</tspan>
        </text>
      </g>

      </svg>
    </div><!-- end svg-wrapper -->
  </div>

  <!-- Schieberegler -->
  <div class="controls">
    <div class="slider-row">
      <label for="sl-t0"><em>t</em><sub>0</sub></label>
      <input id="sl-t0" type="range"
             min="0" max="29.5" step="0.5"
             bind:value={t0} />
      <span class="sl-val">{t0.toFixed(1)} s</span>
    </div>
    <div class="slider-row">
      <label for="sl-v0"><em>v</em><sub>0</sub></label>
      <input id="sl-v0" type="range"
             min="-8" max="80" step="1"
             bind:value={v0} />
      <span class="sl-val">{v0.toFixed(0)} m/s</span>
    </div>
  </div>

  <!-- Info-Kacheln -->
  <div class="info-bar">
    <div class="info-tile">
      <span class="info-lbl">t₀ (s)</span>
      <span class="info-val">{t0.toFixed(1)}</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">v₀ (m/s)</span>
      <span class="info-val">{v0.toFixed(1)}</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">C = v₀ − v<sub>∞</sub></span>
      <span class="info-val">{C.toFixed(2)}</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">v(30 s) (m/s)</span>
      <span class="info-val">{v30.toFixed(2)}</span>
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
    color: var(--text);
  }
  header p {
    margin-top: 5px;
    font-size: .82rem;
    font-family: var(--font-ui);
    color: var(--muted);
    line-height: 1.5;
  }

  .chart-wrap     { padding: 16px 20px 0; background: var(--surface); }
  .svg-wrapper {
    display: block;
    cursor: crosshair;
    outline-offset: 2px;
  }
  .svg-wrapper:focus-visible { outline: 2px solid #005a94; border-radius: 4px; }
  .svg-wrapper svg { width: 100%; height: auto; display: block; }

  .grid-line { stroke: #e8e8e0; stroke-width: 1; }
  .axis      { stroke: #aaa;    stroke-width: 1.5; }

  .field-lines {
    fill: none;
    stroke: #b0b0a8;
    stroke-width: 0.9;
    stroke-linecap: round;
  }
  .field-heads {
    fill: #b0b0a8;
    stroke: none;
  }
  .asym-line {
    stroke: #e87846;
    stroke-width: 1.8;
    stroke-dasharray: 7 4;
  }
  .line-solution {
    fill: none;
    stroke: #005a94;
    stroke-width: 2.6;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .dot-start  { fill: #005a94; pointer-events: none; }

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
    pointer-events: none;
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
