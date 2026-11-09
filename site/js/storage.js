// Acesso seguro ao localStorage (pode falhar em janela privada / dados bloqueados).
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const KEYS = {
  progresso: "aprender.progresso", // { done: { [lessonId]: {wpm, acc, stars, date} }, current }
  stats: "praticar.stats", // { best, last, history[], count, sumWpm, sumAcc }
  pos: "biblioteca.pos", // { [bookId]: indice da frase }
  prefs: "praticar.prefs",
  tema: "tema",
  aba: "ultima.aba",
  teclado: "aprender.teclado",
  progStats: "programar.stats", // { best, last, history[], count, sumWpm, sumAcc } (aba Programar)
  progPrefs: "programar.prefs", // { lang, size }
  gamificacao: "gamificacao", // { xp, streak, bestStreak, last:"YYYY-MM-DD", practices, badges:{[id]:ts} }
};
