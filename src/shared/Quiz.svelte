<!--
  src/shared/Quiz.svelte  –  Generische Lernkontrolle
  KaTeX-CSS wird per import eingebunden → vite-plugin-singlefile inlinet sie.
-->
<script>
  import 'katex/dist/katex.min.css';
  import katex from 'katex';

  // ── Props ─────────────────────────────────────────────────────────────────
  export let title  = 'Lernkontrolle';
  export let pool   = [];
  export let nShow  = 3;

  // ── Hilfsfunktionen ───────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildRound(pool, n) {
    return shuffle(pool).slice(0, n).map(q => {
      const indexed = q.options.map((opt, i) => ({ opt, ok: i === q.correct }));
      const shuffled = shuffle(indexed);
      return {
        text:        q.text,
        options:     shuffled.map(o => o.opt),
        correct:     shuffled.findIndex(o => o.ok),
        explanation: q.explanation,
      };
    });
  }

  // ── Zustand ───────────────────────────────────────────────────────────────
  let questions = buildRound(pool, nShow);
  let current   = 0;
  let selected  = null;
  let submitted = false;
  let score     = 0;
  let completed = false;

  const LABELS = ['A', 'B', 'C', 'D'];

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
    questions = buildRound(pool, nShow);
    current = 0;  selected = null;  submitted = false;
    score = 0;    completed = false;
  }

  $: q         = questions[current];
  $: isCorrect = submitted && selected === q.correct;
  $: resultMsg = score === questions.length
    ? 'Alle Konzepte sitzen – sehr gut!'
    : score >= Math.ceil(questions.length * 0.66)
      ? 'Gut! Schau dir die falsche Antwort nochmals an.'
      : 'Lies den Abschnitt nochmals durch und versuche es erneut.';
</script>

<div class="applet">

  <header>
    <span class="header-title">{title}</span>
    {#if !completed}
      <span class="header-counter">{current + 1}&thinsp;/&thinsp;{questions.length}</span>
    {:else}
      <span class="header-counter">{score}&thinsp;/&thinsp;{questions.length} richtig</span>
    {/if}
  </header>

  <div class="progress-wrap">
    <div class="progress-fill"
         class:progress-done={completed}
         style="width: {completed ? 100 : Math.round((current / questions.length) * 100)}%">
    </div>
  </div>

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

  {:else}
    <div class="result-body">
      <p class="score-display">
        <span class="score-num">{score}</span>
        <span class="score-denom">&thinsp;/ {questions.length}</span>
      </p>
      <p class="result-msg">{resultMsg}</p>
      <button class="btn-secondary" on:click={reset}>Nochmal – neue Reihenfolge</button>
    </div>
  {/if}

</div>

<style>
  :root {
    --surface: #ffffff; --border: #ddddd0; --text: #1c1c1a; --muted: #666660;
    --radius: 10px; --shadow: 0 3px 16px rgba(0,0,0,.09);
    --blue: #005a94; --blue-lt: #eef4fa;
    --green: #2a7a38; --green-lt: #edf7ef;
    --red: #c0392b;   --red-lt: #fdf0ef;
    --font-b:  'Georgia', 'Times New Roman', serif;
    --font-ui: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .applet {
    color-scheme: light; font-family: var(--font-b); color: var(--text);
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow);
    overflow: hidden; width: 100%; max-width: 680px; margin: 0 auto;
  }
  header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px 13px; background: #f3f4f6;
    border-bottom: 1px solid var(--border);
  }
  .header-title  { font-family: var(--font-ui); font-size: .95rem; font-weight: 600; color: var(--text); }
  .header-counter { font-family: var(--font-ui); font-size: .8rem; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--muted); }

  .progress-wrap { height: 3px; background: var(--border); }
  .progress-fill { height: 100%; background: var(--blue); transition: width .3s ease; }
  .progress-done { background: var(--green); }

  .quiz-body { padding: 20px 20px 18px; display: flex; flex-direction: column; gap: 14px; }
  .q-text    { font-size: .97rem; line-height: 1.7; }
  .options   { display: flex; flex-direction: column; gap: 7px; }

  .option {
    display: flex; align-items: center; gap: 11px; padding: 10px 13px;
    border: 1.5px solid var(--border); border-radius: 8px; background: var(--surface);
    cursor: pointer; text-align: left; font-family: var(--font-ui);
    font-size: .88rem; color: var(--text); line-height: 1.5;
    transition: border-color .13s, background .13s, opacity .13s; width: 100%;
  }
  .option:hover:not(:disabled):not(.correct):not(.wrong) { border-color: var(--blue); background: var(--blue-lt); }
  .option.sel     { border-color: var(--blue);  background: var(--blue-lt); }
  .option.correct { border-color: var(--green); background: var(--green-lt); }
  .option.wrong   { border-color: var(--red);   background: var(--red-lt); }
  .option.dimmed  { opacity: .38; }
  .option:disabled { cursor: default; }

  .opt-label {
    flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
    background: #e8e8e0; font-size: .72rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted); font-family: var(--font-ui);
    transition: background .13s, color .13s;
  }
  .option.correct .opt-label { background: var(--green); color: #fff; }
  .option.wrong   .opt-label { background: var(--red);   color: #fff; }
  .option.sel:not(.correct):not(.wrong) .opt-label { background: var(--blue); color: #fff; }
  .opt-text { flex: 1; }

  .feedback {
    display: flex; gap: 10px; align-items: flex-start; padding: 11px 13px;
    border-radius: 8px; border: 1.5px solid var(--border); background: #f8f8f5;
    font-family: var(--font-ui); font-size: .84rem; line-height: 1.55;
  }
  .fb-ok  { border-color: var(--green); background: var(--green-lt); }
  .fb-err { border-color: var(--red);   background: var(--red-lt); }
  .fb-icon { font-size: 1.05rem; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .fb-ok  .fb-icon { color: var(--green); }
  .fb-err .fb-icon { color: var(--red); }
  .fb-content { display: flex; flex-direction: column; gap: 3px; }

  .actions { display: flex; justify-content: flex-end; }
  .btn-primary {
    padding: 9px 20px; background: var(--blue); color: #fff; border: none;
    border-radius: 7px; font-family: var(--font-ui); font-size: .86rem;
    font-weight: 600; cursor: pointer; transition: opacity .13s;
  }
  .btn-primary:hover:not(:disabled) { opacity: .84; }
  .btn-primary:disabled { opacity: .3; cursor: default; }
  .btn-secondary {
    padding: 9px 20px; background: transparent; color: var(--blue);
    border: 1.5px solid var(--blue); border-radius: 7px;
    font-family: var(--font-ui); font-size: .86rem; font-weight: 600;
    cursor: pointer; transition: background .13s; margin-top: 4px;
  }
  .btn-secondary:hover { background: var(--blue-lt); }

  .result-body {
    padding: 36px 20px 32px; display: flex; flex-direction: column;
    align-items: center; gap: 10px; text-align: center;
  }
  .score-display { line-height: 1; }
  .score-num     { font-family: var(--font-ui); font-size: 3.2rem; font-weight: 700; color: var(--blue); font-variant-numeric: tabular-nums; }
  .score-denom   { font-family: var(--font-ui); font-size: 1.5rem; color: var(--muted); }
  .result-msg    { font-family: var(--font-ui); font-size: .9rem; line-height: 1.55; color: var(--text); max-width: 380px; }

  @media (max-width: 480px) {
    header { padding: 12px 14px; }
    .quiz-body { padding: 16px 14px 14px; }
    .result-body { padding: 28px 14px 24px; }
    .option { padding: 9px 11px; font-size: .84rem; }
    .score-num { font-size: 2.6rem; }
  }
</style>
