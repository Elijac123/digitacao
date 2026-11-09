// Currículo do curso "Aprender" + geração de exercícios.
import { PALAVRAS, FRASES } from "./palavras.js";

// Remove numerais romanos (ex.: "clviii") que aparecem no livro-fonte.
const ROMAN = /^m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/;
const WORDS = PALAVRAS.split(" ").filter((w) => !(w.length >= 3 && ROMAN.test(w)) && w !== "byron");
const LOWER_LETTERS = "abcdefghijklmnopqrstuvwxyzç";

/*
 * kind:
 *  info      – só leitura (dicas)
 *  keys      – letras novas (aquecimento + palavras + revisão)
 *  upper     – maiúsculas (Shift)
 *  digits    – números
 *  punct     – pontuação
 *  accents   – acentos do português
 *  words     – fluência com palavras
 *  sentences – frases reais (Machado de Assis)
 */
export const SECTIONS = [
  {
    id: "inicio", title: "1. Antes de começar", goal: { acc: 0, wpm: 0 },
    lessons: [
      {
        id: "i-postura", kind: "info", title: "Postura e regras de ouro",
        html: `<ul>
          <li><b>Postura:</b> costas retas, ombros relaxados, cotovelos a ~90°, pulsos retos (sem apoiar no chão da mesa), tela na altura dos olhos.</li>
          <li><b>Não olhe para o teclado.</b> Use o teclado virtual desta página só no começo; seu cérebro memoriza a posição pelo tato.</li>
          <li><b>Precisão antes de velocidade.</b> Digite devagar e sem erros — a velocidade vem sozinha com a repetição. Cada lição exige 90–95% de precisão.</li>
          <li><b>Ritmo constante.</b> Prefira um ritmo regular a "arrancadas" seguidas de erros.</li>
          <li><b>Pratique pouco, todo dia.</b> 15–20 minutos diários rendem mais do que 2 horas uma vez por semana. Faça pausas.</li>
        </ul>`,
      },
      {
        id: "i-maos", kind: "info", title: "Posição dos dedos (fileira base)",
        html: `<ul>
          <li>Mão esquerda: <b>A S D F</b> (mindinho, anelar, médio, indicador). Mão direita: <b>J K L Ç</b> (indicador, médio, anelar, mindinho).</li>
          <li>Os indicadores ficam em <b>F</b> e <b>J</b> — as teclas têm uma pequena saliência. Sinta-a para achar a posição sem olhar.</li>
          <li>Os polegares ficam sobre a <b>barra de espaço</b> (use o polegar da mão que preferir).</li>
          <li>Depois de digitar qualquer tecla, <b>volte os dedos para a fileira base</b>.</li>
          <li>Cada dedo cuida de uma "coluna" do teclado — as cores do teclado virtual mostram qual dedo usar em cada tecla.</li>
        </ul>`,
      },
    ],
  },
  {
    id: "base", title: "2. Fileira base", goal: { acc: 90, wpm: 8 },
    lessons: [
      { id: "b-fj", kind: "keys", title: "F e J", new: "fj" },
      { id: "b-dk", kind: "keys", title: "D e K", new: "dk" },
      { id: "b-sl", kind: "keys", title: "S e L", new: "sl" },
      { id: "b-aç", kind: "keys", title: "A e Ç", new: "aç" },
      { id: "b-gh", kind: "keys", title: "G e H", new: "gh" },
      { id: "b-rev", kind: "keys", title: "Revisão da fileira base", new: "" },
    ],
  },
  {
    id: "sup", title: "3. Fileira superior", goal: { acc: 92, wpm: 10 },
    lessons: [
      { id: "s-ei", kind: "keys", title: "E e I", new: "ei" },
      { id: "s-ru", kind: "keys", title: "R e U", new: "ru" },
      { id: "s-ty", kind: "keys", title: "T e Y", new: "ty" },
      { id: "s-op", kind: "keys", title: "O e P", new: "op" },
      { id: "s-qw", kind: "keys", title: "Q e W", new: "qw" },
      { id: "s-rev", kind: "keys", title: "Revisão das fileiras base e superior", new: "" },
    ],
  },
  {
    id: "inf", title: "4. Fileira inferior", goal: { acc: 92, wpm: 12 },
    lessons: [
      { id: "i-cm", kind: "keys", title: "C e M", new: "cm" },
      { id: "i-vb", kind: "keys", title: "V e B", new: "vb" },
      { id: "i-nx", kind: "keys", title: "N e X", new: "nx" },
      { id: "i-z", kind: "keys", title: "Z", new: "z" },
      { id: "i-rev", kind: "keys", title: "Alfabeto completo", new: "" },
    ],
  },
  {
    id: "shift", title: "5. Maiúsculas, números e pontuação", goal: { acc: 93, wpm: 14 },
    lessons: [
      { id: "m-shift", kind: "upper", title: "Maiúsculas com Shift", new: "", tip: "Use o Shift da mão <b>oposta</b> à da letra: letra da mão esquerda → Shift direito, e vice-versa." },
      { id: "m-virg", kind: "punct", title: "Vírgula e ponto", new: ",." },
      { id: "m-n15", kind: "digits", title: "Números 1 a 5", new: "12345" },
      { id: "m-n60", kind: "digits", title: "Números 6 a 0", new: "67890" },
      { id: "m-pont", kind: "punct", title: "; : ? ! -", new: ";:?!-", tip: "Todos exigem Shift ou os mindinhos — vá devagar. <b>?</b> = Shift + / ; <b>!</b> = Shift + 1." },
    ],
  },
  {
    id: "acentos", title: "6. Acentos do português", goal: { acc: 93, wpm: 14 },
    lessons: [
      { id: "a-agudo", kind: "accents", title: "Acento agudo (á é í ó ú)", new: "áéíóú", tip: "Tecla morta: aperte <b>´</b> (ao lado do P) <b>e solte</b>, depois a vogal." },
      { id: "a-til", kind: "accents", title: "Til (ã õ)", new: "ãõ", tip: "Tecla <b>~</b> (ao lado do Ç), solte e depois A ou O." },
      { id: "a-circ", kind: "accents", title: "Circunflexo (â ê ô)", new: "âêô", tip: "<b>Shift + ~</b> (^), solte e depois a vogal." },
      { id: "a-grave", kind: "accents", title: "Crase (à)", new: "à", tip: "<b>Shift + ´</b> (`), solte e depois A." },
      { id: "a-rev", kind: "accents", title: "Revisão de acentos", new: "" },
    ],
  },
  {
    id: "fluencia", title: "7. Fluência", goal: { acc: 94, wpm: 20 },
    lessons: [
      { id: "f-pal", kind: "words", title: "Palavras do dia a dia", new: "" },
      { id: "f-fr1", kind: "sentences", title: "Frases de Machado de Assis I", new: "" },
      { id: "f-fr2", kind: "sentences", title: "Frases de Machado de Assis II", new: "" },
      { id: "f-fim", kind: "info", title: "Próximos passos",
        html: `<p>Parabéns, você concluiu o curso! Agora vá para <a href="#praticar">Praticar</a> e digite trechos de livros de verdade. Para ganhar velocidade:</p>
        <ul><li>Mantenha a precisão acima de 95%.</li><li>Olhe sempre uma palavra à frente do que está digitando.</li><li>Repita trechos em que errou muito.</li><li>Envie na <a href="#biblioteca">Biblioteca</a> livros que você gosta.</li></ul>` },
    ],
  },
];

/* ---------- pré-processamento: acumula teclas conhecidas ---------- */
(function annotate() {
  let known = " ";
  let upper = false;
  for (const sec of SECTIONS) {
    sec.lessons.forEach((l, i) => {
      l.section = sec.id;
      l.goal = sec.goal;
      if (l.kind === "upper") upper = true;
      known += l.new || "";
      l.known = known;
      l.upper = upper;
    });
  }
})();

export const LESSONS = SECTIONS.flatMap((s) => s.lessons);
export const lessonIndex = (id) => LESSONS.findIndex((l) => l.id === id);

/* ---------- geração de exercícios ---------- */
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const cap = (w) => w[0].toUpperCase() + w.slice(1);

function realWords(l, mustHaveNew) {
  const known = new Set(l.known);
  const nw = [...l.new];
  return WORDS.filter((w) => [...w].every((c) => known.has(c)) && (!mustHaveNew || !nw.length || nw.some((c) => w.includes(c))));
}

function pseudoWord(l, needNew) {
  const letters = [...l.known].filter((c) => LOWER_LETTERS.includes(c));
  const nl = [...l.new].filter((c) => LOWER_LETTERS.includes(c));
  const len = 2 + rnd(4);
  let w = "";
  for (let i = 0; i < len; i++) w += pick(letters);
  if (needNew && nl.length && !nl.some((c) => w.includes(c))) {
    const p = rnd(len);
    w = w.slice(0, p) + pick(nl) + w.slice(p + 1);
  }
  return w;
}

/** Junta palavras até ~chars caracteres. */
function fill(chars, gen) {
  const out = [];
  let n = 0;
  while (n < chars) { const w = gen(); out.push(w); n += w.length + 1; }
  return out.join(" ");
}

function wordGen(l, mustHaveNew, { capsChance = 0 } = {}) {
  const pool = realWords(l, mustHaveNew);
  const seen = new Set();
  return () => {
    let w;
    if (pool.length >= 6) {
      const free = pool.filter((x) => !seen.has(x));
      w = pick(free.length ? free : pool);
      seen.add(w);
      if (seen.size > pool.length * 0.6) seen.clear();
    } else {
      w = Math.random() < 0.5 && pool.length ? pick(pool) : pseudoWord(l, mustHaveNew);
    }
    if (l.upper && Math.random() < capsChance) w = cap(w);
    return w;
  };
}

function drillTokens(l) {
  const nl = [...l.new].filter((c) => c.trim());
  const base = nl.length ? nl : [...l.known].filter((c) => LOWER_LETTERS.includes(c)).slice(-6);
  const letters = [...l.known].filter((c) => LOWER_LETTERS.includes(c));
  return () => {
    const a = pick(base), b = pick(nl.length > 1 ? nl : letters);
    switch (rnd(4)) {
      case 0: return a.repeat(2 + rnd(3));
      case 1: return a + b + a + b;
      case 2: return a + pick(letters) + pick(letters);
      default: return a + b;
    }
  };
}

const PUNCT_END = [",", ".", ";", ":", "?", "!"];

export function buildSteps(l) {
  const mk = (label, text) => ({ label, text: text.replace(/\s+/g, " ").trim() });
  const wg = (must, o) => wordGen(l, must, o);

  switch (l.kind) {
    case "keys": {
      const rev = !l.new;
      return [
        mk(rev ? "Aquecimento" : "Aquecimento com as teclas novas", fill(70, drillTokens(l))),
        mk(rev ? "Palavras" : "Palavras com as teclas novas", fill(80, wg(true))),
        mk("Revisão geral", fill(100, wg(false))),
      ];
    }
    case "upper": {
      const g = wg(false);
      const capped = () => cap(g());
      return [
        mk("Letras maiúsculas", fill(60, () => cap(pseudoWord({ ...l, new: "" }, false)))),
        mk("Palavras com inicial maiúscula", fill(80, capped)),
        mk("Alternando maiúsculas e minúsculas", fill(100, () => (Math.random() < 0.5 ? capped() : g()))),
      ];
    }
    case "digits": {
      const nl = [...l.new];
      const allDigits = [...l.known].filter((c) => /\d/.test(c));
      const num = (pool, n) => Array.from({ length: n }, () => pick(pool)).join("");
      return [
        mk("Aquecimento", fill(50, () => num(nl, 2 + rnd(3)))),
        mk("Sequências de números", fill(70, () => num(allDigits, 3 + rnd(3)))),
        mk("Palavras e números", (() => { const g = wg(false); return fill(90, () => (Math.random() < 0.45 ? num(allDigits, 1 + rnd(3)) : g())); })()),
      ];
    }
    case "punct": {
      const marks = [...l.new].filter((c) => c.trim());
      const g = wg(false, { capsChance: 0.25 });
      const withMark = () => {
        const w = g();
        const m = pick(marks);
        return m === "-" ? w + "-" + g() : w + m;
      };
      return [
        mk("Aquecimento", fill(40, () => `${pseudoWord({ ...l, new: "" }, false)}${pick(marks)}`)),
        mk("Palavras com pontuação", fill(80, withMark)),
        mk("Frases", fill(110, () => (Math.random() < 0.5 ? withMark() : g()))),
      ];
    }
    case "accents": {
      const nl = [...l.new];
      const g = wg(true, { capsChance: 0.15 });
      const gAny = wg(false, { capsChance: 0.15 });
      const rev = !nl.length;
      return [
        mk("Aquecimento", rev ? fill(70, wg(true)) : fill(40, () => pick(nl).repeat(1 + rnd(2)) + pick(nl))),
        mk("Palavras acentuadas", fill(80, g)),
        mk("Revisão geral", fill(100, () => (Math.random() < 0.6 ? g() : gAny()))),
      ];
    }
    case "words": {
      return [
        mk("Palavras comuns", fill(110, wg(false, { capsChance: 0.1 }))),
        mk("Palavras comuns", fill(130, wg(false, { capsChance: 0.1 }))),
        mk("Palavras comuns", fill(150, wg(false, { capsChance: 0.1 }))),
      ];
    }
    case "sentences": {
      const idx = l.id.endsWith("2") ? 1 : 0;
      const pool = FRASES.filter((_, i) => i % 2 === idx);
      const frases = shuffle(pool);
      return [
        mk("Frase 1", frases[0] + " " + frases[1]),
        mk("Frase 2", frases[2] + " " + frases[3]),
        mk("Frase 3", frases[4] + " " + frases[5]),
      ];
    }
    default:
      return [];
  }
}

export { PUNCT_END };
