// Modo "Textos de IA": ~1000 textos curtos escritos por IA (textos/ia_*.txt, um por linha; lista em textos/ia.json).
// Cada trecho de prática junta 1 a 3 textos sorteados (conforme o tamanho), sem repetir até o baralho acabar.
let texts = null;
let deck = [];

export const AI_TITLE = "Textos de IA";

export async function loadAiTexts() {
  if (texts) return texts;
  const files = await (await fetch("textos/ia.json")).json();
  const parts = await Promise.all(files.map(async (f) => (await (await fetch("textos/" + f)).text()).split(/\r?\n/)));
  texts = parts.flat().map((s) => s.trim()).filter(Boolean);
  return texts;
}

export const aiCount = () => (texts ? texts.length : 0);

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sorteia textos até chegar perto de `target` palavras. */
export async function pickAiExcerpt(target) {
  const all = await loadAiTexts();
  const parts = [];
  let words = 0;
  while (parts.length < 4 && words < target * 0.7) {
    if (!deck.length) deck = shuffle(all.map((_, i) => i));
    const t = all[deck.pop()];
    parts.push(t);
    words += t.split(" ").length;
  }
  return parts.join(" ");
}
