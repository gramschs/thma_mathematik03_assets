<script>
  import katex from 'katex';
  import Quiz  from '../shared/Quiz.svelte';

  function tex(str) {
    return katex.renderToString(str, { throwOnError: false });
  }

  const title = 'Lernkontrolle 11.3';
  const nShow = 3;

  const pool = [
    {
      text: `Welche Kräfte gehen in die Bewegungsgleichung
             ${tex("m\\,y'' = F_{\\text{ges}}")} eines
             Feder-Masse-Dämpfer-Systems ein?`,
      options: [
        `Nur Federkraft ${tex('-k\\,y')}`,
        `Federkraft ${tex('-k\\,y')} und Gewichtskraft ${tex('m\\,g')}`,
        `Federkraft ${tex('-k\\,y')}, Dämpferkraft ${tex("-d\\,y'")}
         und äußere Kraft ${tex('F(t)')}`,
        `Nur Dämpferkraft ${tex("-d\\,y'")}`,
      ],
      correct: 2,
      explanation: `Alle drei Kräfte zusammen ergeben ${tex("m\\,y'' = -k\\,y - d\\,y' + F(t)")}.
        Division durch ${tex('m')} liefert die Standardform der ODE.`,
    },
    {
      text: `Für ein System mit ${tex('m = 2~\\text{kg}')} und
             ${tex('k = 4~\\text{N/m}')}: Wie groß ist die
             Eigenkreisfrequenz ${tex('\\omega_0')}?`,
      options: [
        tex('\\omega_0 = 2~\\text{rad/s}'),
        tex('\\omega_0 = \\sqrt{2}~\\text{rad/s}'),
        tex('\\omega_0 = 8~\\text{rad/s}'),
        tex('\\omega_0 = \\tfrac{1}{2}~\\text{rad/s}'),
      ],
      correct: 1,
      explanation: `${tex('\\omega_0 = \\sqrt{k/m} = \\sqrt{4/2} = \\sqrt{2} \\approx 1.41~\\text{rad/s}')}.
        Die Eigenkreisfrequenz hängt ausschließlich von ${tex('k')} und ${tex('m')} ab,
        nicht von Anfangsbedingungen oder äußeren Kräften.`,
    },
    {
      text: `Wie lautet die allgemeine Lösung der Schwingungsgleichung
             ${tex("y''+\\omega_0^2\\,y=0")}?`,
      options: [
        tex('y = C_1\\,e^{\\omega_0 t} + C_2\\,e^{-\\omega_0 t}'),
        tex('y = C_1\\cos(\\omega_0 t) + C_2\\sin(\\omega_0 t)'),
        tex('y = C_1\\,t + C_2'),
        tex('y = C_1\\,e^{-\\omega_0 t}'),
      ],
      correct: 1,
      explanation: `Die charakteristische Gleichung ${tex('\\lambda^2 + \\omega_0^2 = 0')}
        hat rein imaginäre Eigenwerte ${tex('\\lambda = \\pm\\,i\\,\\omega_0')}.
        Das reelle Fundamentalsystem besteht aus
        ${tex('\\cos(\\omega_0 t)')} und ${tex('\\sin(\\omega_0 t)')}.`,
    },
    {
      text: `Wovon hängt die Schwingungsdauer
             ${tex('T = 2\\pi/\\omega_0')} ab?`,
      options: [
        `Von den Anfangsbedingungen ${tex('y(0)')} und ${tex("y'(0)")}`,
        `Von der Amplitude der Schwingung`,
        `Ausschließlich von den Systemparametern ${tex('k')} und ${tex('m')}`,
        `Von der Dämpfungskonstante ${tex('d')}`,
      ],
      correct: 2,
      explanation: `${tex('T = 2\\pi/\\omega_0 = 2\\pi/\\sqrt{k/m}')} hängt nur von
        Feder und Masse ab. Die Anfangsbedingungen bestimmen die
        <em>Amplitude</em>, nicht die Schwingungsdauer.`,
    },
  ];
</script>

<Quiz {title} {pool} {nShow} />
