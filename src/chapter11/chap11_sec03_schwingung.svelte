<script>
  // ── Systemparameter (Kapitel 11.3: m = 2 kg, k = 4 N/m) ─────────────────
  const OMEGA0    = Math.sqrt(2);               // √(k/m) ≈ 1.414 rad/s
  const T_PERIOD  = 2 * Math.PI / OMEGA0;       // ≈ 4.443 s
  const T_MAX     = 9.5;                        // Zeitachse [s]
  const Y_MAX     = 12;                         // Achsengrenze [mm]

  // ── SVG-Geometrie (3:2, W=420 × H=280) ───────────────────────────────────
  // max-width: 452px im CSS hält den Skalierungsfaktor auf Desktop bei ~1:1
  // und auf Smartphones (348 px verfügbar) bei ~0.83 → Schrift bleibt lesbar.
  const W  = 420;
  const H  = 280;
  const PL = 44;                // linker Plot-Rand (Platz für y-Labels)
  const PR = 412;               // rechter Plot-Rand
  const PT = 32;                // oberer Plot-Rand (Platz für Perioden-Klammer)
  const PB = 248;               // unterer Plot-Rand (Platz für x-Labels)
  const PH = PB - PT;           // Plothöhe [px] = 216
  const PW = PR - PL;           // Plotbreite [px] = 368
  const MY = PT + PH / 2;       // SVG-y der Nulllinie = 140

  const tx = t => PL + (t / T_MAX) * PW;
  const ty = y => MY - (y / Y_MAX) * (PH / 2);

  // ── Perioden-Klammer (konstante Koordinaten) ──────────────────────────────
  const BX0 = tx(0);            // = PL = 44
  const BX1 = tx(T_PERIOD);     // ≈ 215
  const BY  = 14;

  // ── Nulldurchgänge: cos(ω₀ t) = 0 bei t = T/4 + n·T/2 ───────────────────
  const zeroCrossings = [];
  for (let n = 0; ; n++) {
    const t = T_PERIOD / 4 + n * T_PERIOD / 2;
    if (t > T_MAX) break;
    zeroCrossings.push(t);
  }

  // ── Achsen-Ticks ──────────────────────────────────────────────────────────
  const YTICKS = [-10, -5, 0, 5, 10];
  const XTICKS = [0, 2, 4, 6, 8];

  // ── Farben (TikZ-Palette) ─────────────────────────────────────────────────
  const CB  = '#005a94';   // my_darkblue  – Kurve, Klammer
  const CR  = '#e60000';   // my_red       – Amplituden-Indikator
  const CO  = '#e87846';   // my_orange    – Nulldurchgänge
  const CDG = '#484949';   // my_darkgray  – Achsen, Gitter

  // ── Regler-Zustand ────────────────────────────────────────────────────────
  let y0 = 5;   // Anfangsauslenkung y(0) = C₁ [mm]; y'(0) = C₂ = 0 fest

  // ── Reaktive Größen ───────────────────────────────────────────────────────
  $: yhat     = Math.abs(y0);
  $: curvePts = mkCurve(y0);

  function mkCurve(y0mm) {
    const pts = [];
    for (let i = 0; i <= 400; i++) {
      const t = (i / 400) * T_MAX;
      const y = y0mm * Math.cos(OMEGA0 * t);
      pts.push(`${tx(t).toFixed(1)},${ty(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }
</script>


<!-- ══════════════════════════════════════════════════════════════════════════
     TEMPLATE
     ══════════════════════════════════════════════════════════════════════════ -->

<div class="applet">

  <!-- Header -->
  <header>
    <h1>Anfangsbedingung und Schwingungsdauer</h1>
    <p>
      Verschieben Sie den Regler: Die Amplitude <em>ŷ</em> wächst mit der
      Auslenkung <em>y</em>(0), aber die orangefarbenen Nulldurchgänge und
      die Klammer für <em>T</em> bewegen sich nicht.
    </p>
  </header>

  <!-- SVG-Plot -->
  <div class="chart-wrap">
    <svg viewBox="0 0 {W} {H}"
         preserveAspectRatio="xMidYMid meet"
         role="img"
         aria-label="Schwingungsplot y(t) = y₀·cos(ω₀t) mit einstellbarer Anfangsauslenkung">

      <!-- ── Perioden-Klammer ────────────────────────────────────────────── -->
      <line x1={BX0} y1={BY}     x2={BX1} y2={BY}
            stroke={CB} stroke-width="1.5"/>
      <line x1={BX0} y1={BY}     x2={BX0} y2={BY + 8}
            stroke={CB} stroke-width="1.5"/>
      <line x1={BX1} y1={BY}     x2={BX1} y2={BY + 8}
            stroke={CB} stroke-width="1.5"/>
      <text x={(BX0 + BX1) / 2} y={BY - 3}
            font-family="Helvetica Neue,Arial,sans-serif"
            font-size="13" fill={CB} text-anchor="middle">
        T = {T_PERIOD.toFixed(2)} s  (konstant)
      </text>

      <!-- ── Gestrichelte Markierungen bei t = T und t = 2T ────────────── -->
      {#each [T_PERIOD, 2 * T_PERIOD] as tm}
        {#if tm <= T_MAX}
          <line x1={tx(tm)} y1={PT} x2={tx(tm)} y2={PB}
                stroke={CDG} stroke-width="1"
                stroke-dasharray="4 3" opacity="0.25"/>
        {/if}
      {/each}

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

      <!-- ── Amplituden-Indikator (rot, gestrichelt bis zum ersten Nulldurchgang) -->
      <line x1={PL} y1={ty(y0)} x2={tx(T_PERIOD / 4)} y2={ty(y0)}
            stroke={CR} stroke-width="1.6" stroke-dasharray="5 3"/>
      <text x={PL + 5} y={ty(y0) - 5}
            font-family="Helvetica Neue,Arial,sans-serif"
            font-size="12" fill={CR}>
        ŷ = {yhat.toFixed(1)} mm
      </text>

      <!-- ── Schwingungskurve ────────────────────────────────────────────── -->
      <polyline points={curvePts} fill="none"
                stroke={CB} stroke-width="2.2"
                stroke-linejoin="round" stroke-linecap="round"/>

      <!-- ── Nulldurchgänge (orange, ortsfest) ─────────────────────────── -->
      {#each zeroCrossings as tz}
        <circle cx={tx(tz)} cy={MY} r="4.5" fill={CO}/>
      {/each}

    </svg>
  </div>

  <!-- Regler -->
  <div class="controls">
    <div class="slider-row">
      <label for="sl-y0"><em>y</em>(0)</label>
      <input id="sl-y0" type="range"
             min="1" max="10" step="0.5"
             bind:value={y0}/>
      <span class="sl-val">{y0.toFixed(1)} mm</span>
    </div>
  </div>

  <!-- Info-Leiste -->
  <div class="info-bar">
    <div class="info-tile">
      <span class="info-lbl">C₁ = y(0)</span>
      <span class="info-val">{y0.toFixed(1)} mm</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">C₂ = y′(0)/ω₀</span>
      <span class="info-val">0 mm</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">ŷ = |C₁|</span>
      <span class="info-val">{yhat.toFixed(1)} mm</span>
    </div>
    <div class="info-tile tile-highlight">
      <span class="info-lbl">T = 2π / ω₀</span>
      <span class="info-val">{T_PERIOD.toFixed(2)} s</span>
    </div>
    <div class="info-tile">
      <span class="info-lbl">ω₀ = √(k/m)</span>
      <span class="info-val">{OMEGA0.toFixed(3)}</span>
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
    max-width: 452px;   /* ~1:1-Skalierung auf Desktop; verhindert Aufblasen */
    height: auto;
    display: block;
    margin: 0 auto;
  }

  /* ── Controls ───────────────────────────────────────────────────────────── */
  .controls {
    padding: 14px 24px 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-top: 1px solid var(--border);
  }
  .slider-row {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-ui);
    font-size: .85rem;
  }
  .slider-row label {
    min-width: 30px;
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
    min-width: 52px;
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

  /* T-Kachel hervorheben: Schwingungsdauer ist konstant */
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
