<script>
  import katex from 'katex';
  import Quiz  from '../shared/Quiz.svelte';

  function tex(str) {
    return katex.renderToString(str, { throwOnError: false });
  }

  const title = 'Lernkontrolle 11.4';
  const nShow = 3;

  const pool = [
    {
      text: `Wie verhält sich die Resonanzamplitude
             ${tex('\\hat{y}_p = \\frac{F_0/m}{|\\omega_0^2-\\Omega^2|}')}
             wenn ${tex('\\Omega \\to \\omega_0')}?`,
      options: [
        `Sie bleibt konstant`,
        `Sie geht gegen null`,
        `Sie wächst unbegrenzt`,
        `Sie wird negativ`,
      ],
      correct: 2,
      explanation: `Der Nenner ${tex('|\\omega_0^2 - \\Omega^2| \\to 0')},
        damit wächst ${tex('\\hat{y}_p')} ohne Schranke.
        Das ist das mathematische Kennzeichen der Resonanzkatastrophe.`,
    },
    {
      text: `Für ${tex("y''+\\omega_0^2\\,y = (F_0/m)\\sin(\\Omega t)")}
             mit ${tex('\\Omega \\neq \\omega_0')}: Welcher Ansatz ist richtig?`,
      options: [
        tex('y_p = A\\,e^{\\Omega t}'),
        tex('y_p = A\\sin(\\Omega t)'),
        tex('y_p = At\\sin(\\Omega t)'),
        tex('y_p = A\\sin(\\omega_0 t)'),
      ],
      correct: 1,
      explanation: `Da die ODE keinen ${tex("y'")}-Term enthält,
        entkoppeln Sinus- und Kosinusanteile beim Einsetzen.
        Der Ansatz vereinfacht sich auf ${tex('A\\sin(\\Omega t)')}.
        Der Ansatz mit ${tex('t')} wäre nur im Resonanzfall
        ${tex('\\Omega = \\omega_0')} nötig.`,
    },
    {
      text: `Was beschreibt die kritische Drehzahl
             ${tex('n_{\\text{krit}} = \\omega_0 / (2\\pi)')}?`,
      options: [
        `Die maximale Betriebsdrehzahl`,
        `Die Drehzahl, bei der ${tex('\\Omega = \\omega_0')} gilt`,
        `Die Drehzahl, bei der die Dämpfung maximal ist`,
        `Die Mindestdrehzahl für stabilen Betrieb`,
      ],
      correct: 1,
      explanation: `Bei ${tex('\\Omega = \\omega_0')} trifft die Erregerfrequenz
        die Eigenfrequenz des Systems. Die Schwingungsamplitude wächst dann
        ohne Schranke (ohne Dämpfung) oder auf ein sehr großes Maximum
        (mit Dämpfung). Der Betrieb nahe ${tex('n_{\\text{krit}}')} ist
        konstruktiv zu vermeiden.`,
    },
    {
      text: `Was ergibt die Resonanzamplitude ${tex('\\hat{y}_p')}
             für sehr langsame Erregung ${tex('\\Omega \\to 0')}?`,
      options: [
        tex('\\hat{y}_p \\to 0'),
        tex('\\hat{y}_p \\to F_0/k'),
        tex('\\hat{y}_p \\to \\infty'),
        tex('\\hat{y}_p \\to F_0 \\cdot m'),
      ],
      correct: 1,
      explanation: `Für ${tex('\\Omega \\to 0')} gilt
        ${tex('|\\omega_0^2-\\Omega^2| \\to \\omega_0^2 = k/m')}, also
        ${tex('\\hat{y}_p \\to (F_0/m)/(k/m) = F_0/k')}.
        Das ist die <em>statische</em> Auslenkung unter der Kraft ${tex('F_0')}:
        Das System folgt der langsamen Kraft wie eine ruhende Feder.`,
    },
  ];
</script>

<Quiz {title} {pool} {nShow} />
