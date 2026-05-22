<script>
  // ── Systemparameter (Kapitel 11.3: Referenzwerte m = 2 kg, k = 4 N/m) ────
  const T_MAX = 15;      // Zeitachse [s] – lang genug für langsame Schwingungen
  const Y_MAX = 12;      // Achsengrenze [mm]
  const Y0    = 5;       // Anfangsauslenkung [mm], fest

  // ── SVG-Geometrie (3:2, W=420 × H=280) ───────────────────────────────────
  const W  = 420;
  const H  = 280;
  const PL = 44;
  const PR = 412;
  const PT = 32;
  const PB = 248;
  const PH = PB - PT;           // 216
  const PW = PR - PL;           // 368
  const MY = PT + PH / 2;       // 140
  const BX0 = PL;               // Klammer-Startpunkt (immer t = 0)
  const BY  = 16;

  const tx = t => PL + (t / T_MAX) * PW;
  const ty = y => MY - (y / Y_MAX) * (PH / 2);

  // ── Achsen-Ticks ──────────────────────────────────────────────────────────
  const YTICKS = [-10, -5, 0, 5, 10];
  const XTICKS = [0, 5, 10, 15];

  // ── Farben (TikZ-Palette) ─────────────────────────────────────────────────
  const CB  = '#005a94';
  const CR  = '#e60000';
  const CO  = '#e87846';
  const CDG = '#484949';

  // ── Regler-Zustand ────────────────────────────────────────────────────────
  let k = 4;    // Federkonstante [N/m]
  let m = 2;    // Masse [kg]

  // ── Reaktive Größen ───────────────────────────────────────────────────────
  $: omega0    = Math.sqrt(k / m);
  $: T_PERIOD  = 2 * Math.PI / omega0;
  $: BX1       = tx(T_PERIOD);
  $: labelInside = (BX1 - BX0) > 95;   // Klammer breit genug für Label?
  $: curvePts  = mkCurve(omega0);
  $: zeroCrossings = mkZeroCrossings(T_PERIOD);

  function mkCurve(w0) {
    const pts = [];
    for (let i = 0; i <= 400; i++) {
      const t = (i / 400) * T_MAX;
      const y = Y0 * Math.cos(w0 * t);
      pts.push(`${tx(t).toFixed(1)},${ty(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  function mkZeroCrossings(T) {
    const zc = [];
    for (let n = 0; zc.length < 24; n++) {
      const t = T / 4 + n * T / 2;
      if (t > T_MAX) break;
      zc.push(t);
    }
    return zc;
  }
</script>


<!-- ══════════════════════════════════════════════════════════════════════════
     TEMPLATE
     ══════════════════════════════════════════════════════════════════════════ -->

<div class="applet">

  <!-- Header -->
  <header>
    <h1>Systemparameter und Schwingungsdauer</h1>
    <p>
      Verändern Sie Federkonstante <em>k</em> und Masse <em>m</em>:
      Perioden-Klammer und Nulldurchgänge passen sich sofort an –
      <em>ω</em><sub>0</sub> und <em>T</em> hängen ausschließlich von
      den Systemparametern ab.
    </p>
  </header>

  <!-- SVG-Plot -->
  <div class="chart-wrap">
    <svg viewBox="0 0 {W} {H}"
         preserveAspectRatio="xMidYMid meet"
         role="img"
         aria-label="Schwingungsplot y(t) = 5·cos(ω₀t) mit einstellbaren Systemparametern k und m">

      <!-- ── Perioden-Klammer (bewegt sich mit T) ────────────────────────── -->
      <line x1={BX0} y1={BY}     x2={BX1} y2={BY}
            stroke={CB} stroke-width="1.5"/>
      <line x1={BX0} y1={BY}     x2={BX0} y2={BY + 8}
            stroke={CB} stroke-width="1.5"/>
      <line x1={BX1} y1={BY}     x2={BX1} y2={BY + 8}
            stroke={CB} stroke-width="1.5"/>
      <!-- Label: mittig wenn Klammer breit genug, sonst rechts daneben -->
      {#if labelInside}
        <text x={(BX0 + BX1) / 2} y={BY - 3}
              font-family="Helvetica Neue,Arial,sans-serif"
              font-size="13" fill={CB} text-anchor="middle">
          T = {T_PERIOD.toFixed(2)} s
        </text>
      {:else}
        <text x={BX1 + 5} y={BY + 4}
              font-family="Helvetica Neue,Arial,sans-serif"
              font-size="13" fill={CB} text-anchor="start">
          T = {T_PERIOD.toFixed(2)} s
        </text>
      {/if}

      <!-- ── Achsen ──────────────────────────────────────────────────────── -->
      <line x1={PL} y1={MY} x2={PR} y2={MY}
            stroke={CDG} stroke-width="1.3"/>
      <line x1={PL} y1={PT} x2={PL} y2={PB}
            stroke={CDG} stroke-width="1.3"/>

      <!-- Y-Ticks und Beschriftungen -->
      {#each YTICKS as yv}
        <line x1={PL - 5} y1={ty(yv)} x2={PL} y2={ty(yv)}
              stroke={CDG} stroke-width="1.2"/>
        <text x={PL - 8} y={ty(yv)}
              font-family="Helvetica Neue,Arial,sans-serif"
              font-size="13" fill={CDG}
              text-anchor="end" dominant-baseline="middle">{yv}</text>
      {/each}

      <!-- X-Ticks und Beschriftungen -->
      {#each XTICKS as tv}
        <line x1={tx(tv)} y1={MY} x2={tx(tv)} y2={MY + 5}
              stroke={CDG} stroke-width="1.2"/>
        <text x={tx(tv)} y={MY + 16}
              font-family="Helvetica Neue,Arial,sans-serif"
              font-size="13" fill={CDG} text-anchor="middle">{tv}</text>
      {/each}

      <!-- Achsenbeschriftungen -->
      <text x={PL + PW / 2} y={PB + 28}
            font-family="Helvetica Neue,Arial,sans-serif"
            font-size="14" fill={CDG} font-style="italic"
            text-anchor="middle">t (s)</text>
      <text x={10} y={MY}
            font-family="Helvetica Neue,Arial,sans-serif"
            font-size="14" fill={CDG} font-style="italic"
            text-anchor="middle"
            transform="rotate(-90 10 {MY})">y (mm)</text>

      <!-- ── Amplituden-Indikator (konstant, rot) ───────────────────────── -->
      <line x1={PL} y1={ty(Y0)} x2={tx(T_PERIOD / 4)} y2={ty(Y0)}
            stroke={CR} stroke-width="1.6" stroke-dasharray="5 3"/>
      <text x={PL + 5} y={ty(Y0) - 5}
            font-family="Helvetica Neue,Arial,sans-serif"
            font-size="12" fill={CR}>
        ŷ = {Y0} mm
      </text>

      <!-- ── Schwingungskurve ────────────────────────────────────────────── -->
      <polyline points={curvePts} fill="none"
                stroke={CB} stroke-width="2.2"
                stroke-linejoin="round" stroke-linecap="round"/>

      <!-- ── Nulldurchgänge (orange, bewegen sich mit T) ───────────────── -->
      {#each zeroCrossings as tz}
        <circle cx={tx(tz)} cy={MY} r="4.5" fill={CO}/>
      {/each}

    </svg>
  </div>

  <!-- Regler (zwei Zeilen, gestapelt) -->
  <div class="controls">
    <div class="slider-row">
      <label for="sl-k"><em>k</em></label>
      <input id="sl-k" type="range"
             min="1" max="8" step="0.5"
             bind:value={k}/>
      <span class="sl-val">{k.toFixed(1)} N/m</span>
    </div>
    <div class="slider-row">
      <label for="sl-m"><em>m</em></label>
      <input id="sl-m" type="range"
             min="0.5" max="4" step="0.25"
             bind:value={m}/>
      <span class="sl-val">{m.toFixed(2)} kg</span>
    </div>
  </div>

  <!-- Info-Leiste -->
  <div class="info-bar">
    <div class="info-tile">
      <span class="info-lbl">k (N/m)</span>
      <span class="info-val">{k.toFixed(1)}</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">m (kg)</span>
      <span class="info-val">{m.toFixed(2)}</span>
    </div>
    <div class="info-tile tile-highlight">
      <span class="info-lbl">ω₀ = √(k/m)</span>
      <span class="info-val">{omega0.toFixed(3)}</span>
    </div>
    <div class="info-tile tile-highlight">
      <span class="info-lbl">T = 2π / ω₀</span>
      <span class="info-val">{T_PERIOD.toFixed(2)} s</span>
    </div>
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

  /* ── Chart ──────────────────────────────────────────────────────────────── */
  .chart-wrap { padding: 12px 16px 0; background: var(--surface); }
  .chart-wrap svg {
    width: 100%;
    max-width: 452px;   /* ~1:1-Skalierung auf Desktop */
    height: auto;
    display: block;
    margin: 0 auto;
  }

  /* ── Controls (zwei Regler, gestapelt) ───────────────────────────────────── */
  .controls {
    padding: 14px 24px 12px;
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
    min-width: 20px;
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
    min-width: 64px;
    font-weight: 700;
    font-size: .95rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: #333;
    font-family: var(--font-ui);
  }

  /* ── Info-Leiste ─────────────────────────────────────────────────────────── */
  .info-bar {
    display: flex;
    border-top: 1px solid var(--border);
    background: #f3f4f6;
  }
  .info-tile {
    flex: 1;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-right: 1px solid var(--border);
  }
  .info-tile:last-child { border-right: none; }

  /* ω₀ und T hervorheben: diese Größen ändern sich mit k und m */
  .tile-highlight { background: #ccdee9; }

  .info-lbl {
    font-family: var(--font-ui);
    font-size: .65rem;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--muted);
  }
  .info-val {
    font-family: var(--font-ui);
    font-size: 1.0rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
</style>
