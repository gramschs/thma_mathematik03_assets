<!--
  ═══════════════════════════════════════════════════════════════════════════════
  Quiz_11_1.svelte  –  Lernkontrolle 11.1: Ansatz vom Typ der rechten Seite
  ─ KaTeX für Formeln (npm-Package, kein CDN-Konflikt mit Jupyter Book)
  ─ Fragen- und Antwortreihenfolge werden bei jedem Reset neu gemischt
  ─ Kein Info-Bar, kompakter Header mit integriertem Zähler
  ─ Vollständig responsiv (Smartphone bis Desktop, auch als iframe)
  ═══════════════════════════════════════════════════════════════════════════════
-->

<svelte:head>
  <!-- KaTeX CSS vom CDN – kein Konflikt mit Jupyter Book, da separates Hosting -->
  <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
</svelte:head>

<script>
  import { onMount } from 'svelte';
  import katex from 'katex';

  // ── KaTeX-Hilfsfunktion ───────────────────────────────────────────────────
  // Rendert einen LaTeX-String zu einem HTML-String (inline).
  function tex(str) {
    return katex.renderToString(str, { throwOnError: false });
  }

  // ── Fragenpool ────────────────────────────────────────────────────────────
  // Alle Fragen zu 11.1. Beim Reset werden n_show davon zufällig gewählt
  // und die Antwortoptionen innerhalb jeder Frage neu gemischt.
  // correct: Index der richtigen Antwort im options-Array (vor dem Mischen).
  const POOL = [
    {
      text: `Welcher Ansatz ${tex('y_p')} ist für die Störfunktion
             ${tex('g(t) = 4e^{-3t}')} geeignet?`,
      options: [
        tex('y_p = A\\,e^{-3t}'),
        tex('y_p = A + Bt + Ct^2'),
        tex('y_p = A\\sin(3t)+B\\cos(3t)'),
        tex('y_p = At\\,e^{-3t}'),
      ],
      correct: 0,
      explanation: `Da ${tex('g(t)')} eine Exponentialfunktion ${tex('e^{\\alpha t}')}
        mit ${tex('\\alpha = -3')} ist, wählen wir ${tex('y_p')} vom selben Typ:
        ${tex('A\\,e^{-3t}')}. Der Faktor ${tex('t')} in Option D wird nur im
        Resonanzfall gebraucht.`,
    },
    {
      text: `Die homogene ODE ${tex("y''+3y'+2y=0")} hat die Eigenwerte
             ${tex('\\lambda_1=-1')} und ${tex('\\lambda_2=-2')}.
             Für welche Störfunktion tritt der <em>Resonanzfall</em> auf?`,
      options: [
        tex('g(t) = e^{-3t}'),
        tex('g(t) = e^{-t}'),
        tex('g(t) = \\sin(t)'),
        tex('g(t) = 5'),
      ],
      correct: 1,
      explanation: `Der Exponent ${tex('\\alpha=-1')} von ${tex('e^{-t}')}
        stimmt mit dem Eigenwert ${tex('\\lambda_1=-1')} überein.
        Damit ist ${tex('e^{-t}')} bereits eine Lösung der homogenen ODE –
        der Standardansatz ${tex('y_p = A\\,e^{-t}')} liefert beim Einsetzen
        identisch null.`,
    },
    {
      text: `Gegeben: ${tex("y'' + 3y' + 2y = 5e^{-3t}")} und Ansatz
             ${tex('y_p = A\\,e^{-3t}')}. Einsetzen liefert auf der linken Seite
             ${tex('2A\\,e^{-3t}')}. Welchen Wert ergibt der Koeffizientenvergleich
             für ${tex('A')}?`,
      options: [
        tex('A = 5'),
        tex('A = \\tfrac{5}{3}'),
        tex('A = \\tfrac{5}{2}'),
        tex('A = \\tfrac{2}{5}'),
      ],
      correct: 2,
      explanation: `Koeffizientenvergleich: ${tex('2A = 5')}, also
        ${tex('A = \\tfrac{5}{2}')}. Die partikuläre Lösung lautet
        ${tex('y_p(t) = \\tfrac{5}{2}\\,e^{-3t}')}.`,
    },
    {
      text: `Welche Aussage zur allgemeinen Lösung
             ${tex('y_{\\text{allg}} = y_h + y_p')} ist richtig?`,
      options: [
        `${tex('y_p')} hängt nur von den Anfangsbedingungen ab.`,
        `${tex('y_h')} enthält zwei freie Konstanten ${tex('C_1, C_2')}.`,
        `${tex('y_h')} ist eine partikuläre Lösung der inhomogenen ODE.`,
        `${tex('y_p')} enthält alle freien Konstanten.`,
      ],
      correct: 1,
      explanation: `Die homogene Lösung ${tex('y_h = C_1 y_1 + C_2 y_2')} enthält
        genau zwei freie Konstanten, die durch Anfangsbedingungen festgelegt
        werden. ${tex('y_p')} ist eine feste partikuläre Lösung der inhomogenen
        ODE ohne freie Konstanten.`,
    },
  ];

  // Anzahl Fragen pro Durchlauf
  const N_SHOW = 3;

  // ── Misch-Hilfsfunktionen ─────────────────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Wählt N_SHOW Fragen aus dem Pool, mischt Antwortoptionen
  // und passt den correct-Index an.
  function buildRound() {
    return shuffle(POOL).slice(0, N_SHOW).map(q => {
      const indexed = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correct }));
      const shuffled = shuffle(indexed);
      return {
        text:        q.text,
        options:     shuffled.map(o => o.opt),
        correct:     shuffled.findIndex(o => o.isCorrect),
        explanation: q.explanation,
      };
    });
  }

  // ── Reaktiver Zustand ─────────────────────────────────────────────────────
  let questions  = buildRound();
  let current    = 0;
  let selected   = null;   // gewählter Antwort-Index
  let submitted  = false;
  let score      = 0;
  let completed  = false;

  const LABELS = ['A', 'B', 'C', 'D'];

  // ── Aktionen ──────────────────────────────────────────────────────────────
  function select(i)  { if (!submitted) selected = i; }

  function submit() {
    if (selected === null || submitted) return;
    submitted = true;
    if (selected === questions[current].correct) score += 1;
  }

  function next() {
    if (current < questions.length - 1) {
      current++;  selected = null;  submitted = false;
    } else {
      completed = true;
    }
  }

  function reset() {
    questions = buildRound();   // neue Auswahl + neue Reihenfolge
    current = 0;  selected = null;  submitted = false;
    score = 0;    completed = false;
  }

  // ── Abgeleitete Größen ────────────────────────────────────────────────────
  $: q          = questions[current];
  $: isCorrect  = submitted && selected === q.correct;
  $: resultMsg  = score === questions.length
    ? 'Alle Konzepte sitzen – sehr gut!'
    : score >= 2
      ? 'Gut! Schau dir die falsche Antwort nochmals an.'
      : 'Lies Abschnitt 11.1 nochmals durch und versuche es erneut.';
</script>


<!-- ══════════════════════════════════════════════════════════════════════════
     TEMPLATE
     ══════════════════════════════════════════════════════════════════════════ -->

<div class="applet">

  <!-- Kompakter Header mit integriertem Zähler -->
  <header>
    <span class="header-title">Lernkontrolle 11.1</span>
    {#if !completed}
      <span class="header-counter">{current + 1}&thinsp;/&thinsp;{questions.length}</span>
    {:else}
      <span class="header-counter">{score}&thinsp;/&thinsp;{questions.length} richtig</span>
    {/if}
  </header>

  <!-- Fortschrittsbalken -->
  {#if !completed}
    <div class="progress-wrap">
      <div class="progress-fill"
           style="width: {Math.round((current / questions.length) * 100)}%">
      </div>
    </div>
  {:else}
    <div class="progress-wrap">
      <div class="progress-fill progress-done" style="width: 100%"></div>
    </div>
  {/if}

  <!-- ── Quiz ─────────────────────────────────────────────────────────── -->
  {#if !completed}
    <div class="quiz-body">

      <p class="q-text">{@html q.text}</p>

      <div class="options">
        {#each q.options as opt, i}
          <button
            class="option"
            class:sel={selected === i && !submitted}
            class:correct={submitted && i === q.correct}
            class:wrong={submitted && selected === i && i !== q.correct}
            class:dimmed={submitted && i !== q.correct && selected !== i}
            on:click={() => select(i)}
            disabled={submitted}
          >
            <span class="opt-label">{LABELS[i]}</span>
            <span class="opt-text">{@html opt}</span>
          </button>
        {/each}
      </div>

      {#if submitted}
        <div class="feedback" class:fb-ok={isCorrect} class:fb-err={!isCorrect}>
          <span class="fb-icon">{isCorrect ? '✓' : '✗'}</span>
          <div class="fb-content">
            <strong>{isCorrect ? 'Richtig.' : 'Nicht ganz.'}</strong>
            <span>{@html q.explanation}</span>
          </div>
        </div>
      {/if}

      <div class="actions">
        {#if !submitted}
          <button class="btn-primary" on:click={submit} disabled={selected === null}>
            Prüfen
          </button>
        {:else}
          <button class="btn-primary" on:click={next}>
            {current < questions.length - 1 ? 'Weiter →' : 'Auswertung'}
          </button>
        {/if}
      </div>

    </div>

  <!-- ── Ergebnis ──────────────────────────────────────────────────────── -->
  {:else}
    <div class="result-body">
      <p class="score-display">
        <span class="score-num">{score}</span><span class="score-denom">&thinsp;/ {questions.length}</span>
      </p>
      <p class="result-msg">{resultMsg}</p>
      <button class="btn-secondary" on:click={reset}>Nochmal – neue Reihenfolge</button>
    </div>
  {/if}

</div>


<!-- ══════════════════════════════════════════════════════════════════════════
     STYLES
     ══════════════════════════════════════════════════════════════════════════ -->

<style>
  /* ── Design-Token (identisch mit App.svelte) ────────────────────────────── */
  :root {
    --surface: #ffffff;
    --border:  #ddddd0;
    --text:    #1c1c1a;
    --muted:   #666660;
    --radius:  10px;
    --shadow:  0 3px 16px rgba(0,0,0,.09);
    --blue:    #005a94;
    --blue-lt: #eef4fa;
    --green:   #2a7a38;
    --green-lt:#edf7ef;
    --red:     #c0392b;
    --red-lt:  #fdf0ef;
    --font-b:  'Georgia', 'Times New Roman', serif;
    --font-ui: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Container ──────────────────────────────────────────────────────────── */
  .applet {
    color-scheme: light;
    font-family: var(--font-b);
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
    width: 100%;
    max-width: 680px;
    margin: 0 auto;
  }

  /* ── Header (kompakt, einspaltig) ───────────────────────────────────────── */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px 13px;
    background: #f3f4f6;
    border-bottom: 1px solid var(--border);
  }
  .header-title {
    font-family: var(--font-ui);
    font-size: .95rem;
    font-weight: 600;
    letter-spacing: .01em;
    color: var(--text);
  }
  .header-counter {
    font-family: var(--font-ui);
    font-size: .8rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  /* ── Fortschrittsbalken ─────────────────────────────────────────────────── */
  .progress-wrap { height: 3px; background: var(--border); }
  .progress-fill {
    height: 100%;
    background: var(--blue);
    transition: width .3s ease;
  }
  .progress-done { background: var(--green); }

  /* ── Quiz-Körper ─────────────────────────────────────────────────────────── */
  .quiz-body {
    padding: 20px 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .q-text {
    font-size: .97rem;
    line-height: 1.7;
    color: var(--text);
  }

  /* ── Optionen ────────────────────────────────────────────────────────────── */
  .options { display: flex; flex-direction: column; gap: 7px; }

  .option {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 13px;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    cursor: pointer;
    text-align: left;
    font-family: var(--font-ui);
    font-size: .88rem;
    color: var(--text);
    line-height: 1.5;
    transition: border-color .13s, background .13s, opacity .13s;
    width: 100%;
  }
  .option:hover:not(:disabled):not(.correct):not(.wrong) {
    border-color: var(--blue);
    background: var(--blue-lt);
  }
  .option.sel     { border-color: var(--blue);  background: var(--blue-lt); }
  .option.correct { border-color: var(--green); background: var(--green-lt); }
  .option.wrong   { border-color: var(--red);   background: var(--red-lt); }
  .option.dimmed  { opacity: .38; }
  .option:disabled { cursor: default; }

  .opt-label {
    flex-shrink: 0;
    width: 22px; height: 22px;
    border-radius: 50%;
    background: #e8e8e0;
    font-size: .72rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted);
    font-family: var(--font-ui);
    transition: background .13s, color .13s;
  }
  .option.correct .opt-label { background: var(--green); color: #fff; }
  .option.wrong   .opt-label { background: var(--red);   color: #fff; }
  .option.sel:not(.correct):not(.wrong) .opt-label { background: var(--blue); color: #fff; }

  .opt-text { flex: 1; }

  /* ── Feedback ────────────────────────────────────────────────────────────── */
  .feedback {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 11px 13px;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: #f8f8f5;
    font-family: var(--font-ui);
    font-size: .84rem;
    line-height: 1.55;
  }
  .fb-ok  { border-color: var(--green); background: var(--green-lt); }
  .fb-err { border-color: var(--red);   background: var(--red-lt); }

  .fb-icon {
    font-size: 1.05rem; font-weight: 700; flex-shrink: 0; margin-top: 1px;
  }
  .fb-ok  .fb-icon { color: var(--green); }
  .fb-err .fb-icon { color: var(--red); }

  .fb-content { display: flex; flex-direction: column; gap: 3px; }
  .fb-content strong { color: var(--text); }

  /* ── Aktionen ────────────────────────────────────────────────────────────── */
  .actions { display: flex; justify-content: flex-end; }

  .btn-primary {
    padding: 9px 20px;
    background: var(--blue);
    color: #fff;
    border: none;
    border-radius: 7px;
    font-family: var(--font-ui);
    font-size: .86rem; font-weight: 600;
    cursor: pointer;
    transition: opacity .13s;
  }
  .btn-primary:hover:not(:disabled) { opacity: .84; }
  .btn-primary:disabled { opacity: .3; cursor: default; }

  .btn-secondary {
    padding: 9px 20px;
    background: transparent;
    color: var(--blue);
    border: 1.5px solid var(--blue);
    border-radius: 7px;
    font-family: var(--font-ui);
    font-size: .86rem; font-weight: 600;
    cursor: pointer;
    transition: background .13s;
    margin-top: 4px;
  }
  .btn-secondary:hover { background: var(--blue-lt); }

  /* ── Ergebnis ────────────────────────────────────────────────────────────── */
  .result-body {
    padding: 36px 20px 32px;
    display: flex; flex-direction: column;
    align-items: center; gap: 10px; text-align: center;
  }
  .score-display { line-height: 1; }
  .score-num {
    font-family: var(--font-ui);
    font-size: 3.2rem; font-weight: 700;
    color: var(--blue);
    font-variant-numeric: tabular-nums;
  }
  .score-denom {
    font-family: var(--font-ui);
    font-size: 1.5rem; color: var(--muted);
  }
  .result-msg {
    font-family: var(--font-ui);
    font-size: .9rem; line-height: 1.55;
    color: var(--text); max-width: 380px;
  }

  /* ── Responsiv ───────────────────────────────────────────────────────────── */
  @media (max-width: 480px) {
    header          { padding: 12px 14px; }
    .quiz-body      { padding: 16px 14px 14px; }
    .result-body    { padding: 28px 14px 24px; }
    .option         { padding: 9px 11px; font-size: .84rem; }
    .score-num      { font-size: 2.6rem; }
  }
</style>
