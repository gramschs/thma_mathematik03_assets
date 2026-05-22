<script>
  import katex from 'katex';
  import Quiz  from '../shared/Quiz.svelte';

  function tex(str) {
    return katex.renderToString(str, { throwOnError: false });
  }

  const title = 'Lernkontrolle 11.2';
  const nShow = 3;

  const pool = [
    {
      text: `Die ODE ${tex("y''+3y'+2y=g(t)")} hat Eigenwerte
             ${tex('\\lambda_1=-1')} und ${tex('\\lambda_2=-2')}.
             Für welche Störfunktion tritt der Resonanzfall auf?`,
      options: [
        tex('g(t) = e^{-3t}'),
        tex('g(t) = e^{-t}'),
        tex('g(t) = \\sin(t)'),
        tex('g(t) = t^2'),
      ],
      correct: 1,
      explanation: `Der Resonanzfall tritt auf, wenn der Exponent ${tex('\\alpha')}
        der Störfunktion ${tex('e^{\\alpha t}')} mit einem Eigenwert der homogenen
        ODE übereinstimmt. Hier: ${tex('\\alpha = -1 = \\lambda_1')}.
        Der Standardansatz liefert dann beim Einsetzen identisch null.`,
    },
    {
      text: `Im Resonanzfall mit ${tex('\\alpha = \\lambda_1')}: Welcher
             modifizierte Ansatz für ${tex('y_p')} ist richtig?`,
      options: [
        tex('y_p = A\\,e^{\\alpha t}'),
        tex('y_p = A + Bt'),
        tex('y_p = At\\,e^{\\alpha t}'),
        tex('y_p = At^2\\,e^{\\alpha t}'),
      ],
      correct: 2,
      explanation: `Der zusätzliche Faktor ${tex('t')} stellt sicher, dass
        ${tex('y_p')} nicht mehr im Lösungsraum der homogenen ODE liegt.
        Der Ansatz ${tex('At^2 e^{\\alpha t}')} wird erst benötigt, wenn
        ${tex('\\alpha')} ein <em>doppelter</em> Eigenwert ist (${tex('D=0')}).`,
    },
    {
      text: `Wie viele Anfangsbedingungen sind nötig, um ${tex('C_1')} und
             ${tex('C_2')} in ${tex('y_{\\text{allg}} = C_1 y_1 + C_2 y_2 + y_p')}
             eindeutig festzulegen?`,
      options: [
        `Eine: ${tex('y(x_0) = y_0')}`,
        `Zwei: ${tex('y(x_0) = y_0')} und ${tex("y'(x_0) = v_0")}`,
        `Drei Bedingungen`,
        `Keine – ${tex('C_1')} und ${tex('C_2')} sind frei wählbar`,
      ],
      correct: 1,
      explanation: `Eine ODE 2. Ordnung hat genau zwei freie Konstanten.
        Zu ihrer eindeutigen Bestimmung braucht man zwei Anfangsbedingungen:
        Anfangslage ${tex('y(x_0) = y_0')} und
        Anfangsgeschwindigkeit ${tex("y'(x_0) = v_0")}.`,
    },
    {
      text: `Gegeben: ${tex('y(t) = C_1 e^{-t} + C_2 e^{-2t} + 5t\\,e^{-t}')}
             mit Anfangsbedingung ${tex('y(0) = 0')}.
             Was ergibt sich beim Einsetzen?`,
      options: [
        tex('C_1 = 0'),
        tex('C_1 + C_2 = 0'),
        tex('C_1 + C_2 = 5'),
        tex('C_1 - C_2 = 0'),
      ],
      correct: 1,
      explanation: `Einsetzen von ${tex('t=0')}:
        ${tex('y(0) = C_1 \\cdot 1 + C_2 \\cdot 1 + 5 \\cdot 0 \\cdot 1 = C_1 + C_2 = 0')}.
        Der ${tex('y_p')}-Term verschwindet wegen des Faktors ${tex('t')}.`,
    },
  ];
</script>

<Quiz {title} {pool} {nShow} />
