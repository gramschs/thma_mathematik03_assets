# Entwicklungsanleitung – thma_mathematik03_assets

## Projektstruktur auf einen Blick

```
./
├── package.json               ← Abhängigkeiten, Scripts
├── vite.config.js             ← Dev-Server (root: src/)
├── src/
│   ├── shared/
│   │   └── Quiz.svelte        ← generische Quiz-Komponente, nicht bearbeiten
│   ├── index.html             ← lokale Dev-Übersicht (wird nicht gebaut)
│   ├── chapter06/
│   │   ├── chap06_kurvenschar.html
│   │   ├── chap06_kurvenschar.js
│   │   └── chap06_kurvenschar.svelte
│   └── chapter11/
│       ├── chap11_sec01_quiz.html
│       ├── chap11_sec01_quiz.js
│       └── chap11_sec01_quiz.svelte
├── scripts/
│   ├── build.js               ← baut alle Apps einzeln (wg. vite-plugin-singlefile)
│   ├── generate_index.py      ← erzeugt interactive/index.html
│   └── migrate_app.sh         ← Migrationshilfe für alte App-Struktur
└── interactive/               ← Build-Ausgabe → GitHub Pages
    ├── index.html             ← erzeugt von generate_index.py
    ├── chapter06/
    │   └── chap06_kurvenschar.html
    └── chapter11/
        └── chap11_sec01_quiz.html
```

## Workflow: Neue interaktive Visualisierung

### 1. Drei Dateien anlegen

Namensschema: `chapXX_bezeichnung`  
Beispiel: `chap11_schwingung` in Kapitel 11

```
src/chapter11/chap11_schwingung.html
src/chapter11/chap11_schwingung.js
src/chapter11/chap11_schwingung.svelte
```

**`chap11_schwingung.html`** – Einstiegsdatei (immer gleich, nur `<title>` anpassen):

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Schwingung 11</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: #f0f0eb;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 24px 16px 40px;
    }
    #app { width: 100%; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./chap11_schwingung.js"></script>
</body>
</html>
```

**`chap11_schwingung.js`** – Einstiegsskript (immer gleich, nur Dateiname anpassen):

```javascript
import { mount } from 'svelte'
import App from './chap11_schwingung.svelte'
mount(App, { target: document.getElementById('app') })
```

**`chap11_schwingung.svelte`** – die eigentliche App:

```svelte
<script>
  // Ihre Svelte-Logik hier
</script>

<!-- Template -->

<style>
  /* Design-Token aus App.svelte übernehmen */
</style>
```

### 2. Eintrag in `scripts/build.js`

```javascript
const ENTRIES = [
  // ...bestehende Einträge...
  { chapter: 'chapter11', name: 'chap11_schwingung' },  // ← neu
]
```

### 3. Eintrag in `src/index.html` (Dev-Übersicht)

```html
<a href="/chapter11/chap11_schwingung.html">chap11_schwingung</a>
```

### 4. Entwickeln und bauen

```bash
npm run dev
# → http://localhost:5173/chapter11/chap11_schwingung.html

npm run build
# → interactive/chapter11/chap11_schwingung.html
# → interactive/index.html wird aktualisiert
```

---

## Workflow: Neues Quiz

### 1. Drei Dateien anlegen

Namensschema: `chapXX_secYY_quiz`  
Beispiel: `chap11_sec02_quiz` für Abschnitt 11.2

```
src/chapter11/chap11_sec02_quiz.html
src/chapter11/chap11_sec02_quiz.js
src/chapter11/chap11_sec02_quiz.svelte
```

**`chap11_sec02_quiz.html`** – identisch mit dem Visualisierungs-Template, nur `<title>` anpassen.

**`chap11_sec02_quiz.js`** – identisch mit dem Visualisierungs-Template, Dateiname anpassen.

**`chap11_sec02_quiz.svelte`** – nur Fragen-Daten, kein Design:

```svelte
<script>
  import katex from 'katex';
  import Quiz  from '../shared/Quiz.svelte';

  function tex(str) {
    return katex.renderToString(str, { throwOnError: false });
  }

  const title = 'Lernkontrolle 11.2';
  const nShow = 3;   // Fragen pro Durchlauf (≤ pool.length)

  const pool = [
    {
      text:        `Fragetext mit optionalem KaTeX: ${tex('y_p = Ae^{\\alpha t}')}`,
      options:     [tex('...'), tex('...'), tex('...'), tex('...')],
      correct:     0,   // Index der richtigen Antwort (vor dem Mischen)
      explanation: `Erklärungstext mit optionalem KaTeX: ${tex('A = 5/2')}`,
    },
    // weitere Fragen ...
  ];
</script>

<Quiz {title} {pool} {nShow} />
```

> **Hinweis zu KaTeX-Strings mit Ableitungszeichen:**  
> Strings mit `'` (Primzeichen) in **doppelten** Anführungszeichen schreiben:
> ```javascript
> tex("y''+3y'+2y=0")   // ✓
> tex('y\\'\\'+3y\\'+2y=0')   // ✗ Parser-Fehler
> ```

### 2. Eintrag in `scripts/build.js`

```javascript
const ENTRIES = [
  // ...bestehende Einträge...
  { chapter: 'chapter11', name: 'chap11_sec02_quiz' },  // ← neu
]
```

### 3. Eintrag in `src/index.html` (Dev-Übersicht)

```html
<a href="/chapter11/chap11_sec02_quiz.html">chap11_sec02_quiz</a>
```

### 4. Entwickeln und bauen

```bash
npm run dev
# → http://localhost:5173/chapter11/chap11_sec02_quiz.html

npm run build
# → interactive/chapter11/chap11_sec02_quiz.html
```

### 5. Overlay ins Vorlesungsskript einbinden

In der entsprechenden `.md`-Datei des Jupyter Books **vor** `## Zusammenfassung und Ausblick` einfügen:

````markdown
```{raw} html
<div class="lk-wrap">
  <button class="lk-btn"
          onclick="document.getElementById('lk-112').style.display='flex'">
    ▶&ensp;Lernkontrolle 11.2 starten
  </button>
  <div id="lk-112" class="lk-overlay"
       onclick="if(event.target===this) this.style.display='none'">
    <div class="lk-card">
      <button class="lk-close"
              onclick="document.getElementById('lk-112').style.display='none'">✕</button>
      <iframe src="https://DEIN-USER.github.io/thma_mathematik03_assets/chapter11/chap11_sec02_quiz.html"
              title="Lernkontrolle 11.2"
              loading="lazy"
              class="lk-frame">
      </iframe>
    </div>
  </div>
</div>

<style>
  .lk-wrap { margin: 1.6rem 0; }
  .lk-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; background: #005a94; color: #fff;
    border: none; border-radius: 8px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: .9rem; font-weight: 600; cursor: pointer; transition: opacity .15s;
  }
  .lk-btn:hover { opacity: .85; }
  .lk-overlay {
    display: none; position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,.55); align-items: center;
    justify-content: center; padding: 16px;
  }
  .lk-card {
    position: relative; width: 100%; max-width: 700px;
    max-height: 92vh; border-radius: 12px; overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,.35); background: #fff;
  }
  .lk-close {
    position: absolute; top: 10px; right: 10px; z-index: 1;
    width: 30px; height: 30px; border-radius: 50%; border: none;
    background: #1c1c1a; color: #fff; font-size: 14px;
    cursor: pointer; opacity: .75; transition: opacity .15s;
  }
  .lk-close:hover { opacity: 1; }
  .lk-frame { width: 100%; height: 88vh; max-height: 700px; border: none; display: block; }
  @media (max-width: 500px) {
    .lk-overlay { padding: 0; }
    .lk-card    { max-width: 100%; max-height: 100vh; border-radius: 0; }
    .lk-frame   { height: 100vh; max-height: none; }
  }
</style>
```
````

> **Anpassen pro Abschnitt:** `lk-112` (eindeutige ID), `11.2` im Buttontitel und `chap11_sec02_quiz.html` in der iframe-URL.

---

## Deployment

```bash
npm run build   # baut alle Apps + aktualisiert interactive/index.html
git add -A
git commit -m "Add chap11_sec02_quiz"
git push        # GitHub Actions / GitHub Pages übernimmt automatisch
```

---

## Übersicht: Dateien pro neuem Element

| Datei | App | Quiz |
|---|---|---|
| `chapXX_name.html` | ✓ (Template) | ✓ (Template) |
| `chapXX_name.js` | ✓ (Template) | ✓ (Template) |
| `chapXX_name.svelte` | eigene Logik | nur `pool`-Array |
| Eintrag `build.js` | ✓ | ✓ |
| Eintrag `src/index.html` | ✓ | ✓ |
| Overlay-Snippet in `.md` | – | ✓ |

---

## SVG-Größe und Lesbarkeit auf Smartphones

Die Hälfte der Studierenden liest das Skript auf dem Smartphone (~380 px
Viewport). SVGs mit `width: 100%` skalieren proportional zum Container – die
`viewBox`-Dimensionen bestimmen daher indirekt die Schriftgröße auf dem
Bildschirm.

### Das Problem mit großen viewBox-Werten

Ein SVG mit `viewBox="0 0 680 340"` in einem Container mit `max-width: 720px`
rendert auf dem Desktop bei ~688 px (Skalierungsfaktor ≈ 1). Auf einem
Smartphone mit 380 px Viewport stehen nach Padding nur ~348 px zur Verfügung
(Faktor ≈ 0.51). Ein Label mit `font-size="12"` wird dann mit ~6 px gerendert –
zu klein.

### Empfohlene Lösung

**viewBox:** `W = 420`, `H = 280` (Seitenverhältnis 3:2).  
**CSS auf dem SVG:** `max-width: 452px`, damit das SVG auf dem Desktop nicht
über die natürliche Koordinatengröße hinaus skaliert.

```css
.chart-wrap svg {
  width: 100%;
  max-width: 452px;
  height: auto;
  display: block;
  margin: 0 auto;
}
```

Das ergibt folgende Skalierungsfaktoren:

| Gerät | Verfügbare Breite | Faktor | `font-size="14"` → |
|---|---|---|---|
| Smartphone (380 px) | 348 px | 0.83 | ≈ 11.6 px ✓ |
| Tablet / Desktop | 452 px | 1.08 | ≈ 15 px ✓ |

### Schriftgrößen im SVG

| Verwendung | `font-size` |
|---|---|
| Achsenbeschriftung (`t (s)`, `y (mm)`) | `14` |
| Tick-Labels, Klammerbeschriftung | `13` |
| Sekundäre Annotationen (Formeln, Hinweise) | `12` |

Werte unter `12` vermeiden – sie werden auf dem Smartphone nicht mehr lesbar.

### Plot-Rand (Padding im Koordinatensystem)

Richtwerte für `W = 420`, `H = 280`:

```javascript
const PL = 44;   // links  – Platz für y-Tick-Labels
const PR = 412;  // rechts – 8 px Luft
const PT = 32;   // oben   – Platz für Klammern / Annotationen
const PB = 248;  // unten  – Platz für x-Tick-Labels und Achsentitel
```

### Seitenverhältnis wählen

Das Seitenverhältnis richtet sich nach dem Inhalt, nicht nach einem fixen
Standard:

- **Funktionsgraph (eine Kurve, t-Achse):** 3:2 → `W = 420`, `H = 280`
- **Phasen- oder Vektordiagramm (quadratischer Inhalt):** 1:1 → `W = H = 340`
- **Zwei-Panel-Layout (Mechanik links, Graph rechts):** 2:1 → `W = 680`,
  `H = 340`; in diesem Fall `max-width` weglassen, da die zwei Panels die
  Breite rechtfertigen.

