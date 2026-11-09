// Aba Praticar: trechos de livros, estatísticas persistentes (recorde, média, última).
import { Typer, buildTypingCard } from "./typing.js";
import { listAll, getText, getPos, setPos, libraryEvents } from "./library.js";
import { load, save, KEYS } from "./storage.js";
import { toAbnt2 } from "./abnt2.js";
import { gainXp, practiceXp, xpSummaryHtml } from "./gamify.js";

const SIZES = { curto: 25, medio: 50, longo: 90 };
const $ = (s) => document.querySelector(s);

let typer = null;
let ui = null;
let current = null; // { bookId, endIdx, text }
let sentencesCache = { key: "", list: [] };
let resultOpen = false;

const defaultStats = () => ({ best: null, last: null, history: [], count: 0, sumWpm: 0, sumAcc: 0 });
const getStats = () => ({ ...defaultStats(), ...load(KEYS.stats, {}) });

function sentencesOf(bookId, text) {
  if (sentencesCache.key === bookId) return sentencesCache.list;
  const t = toAbnt2(text); // só caracteres que existem no teclado ABNT2
  const list = (t.match(/[^.!?…]+(?:[.!?…]+["”»')\]]*)?\s*/g) || []).map((s) => s.trim()).filter(Boolean);
  sentencesCache = { key: bookId, list };
  return list;
}

export function pickExcerpt(sentences, start, target) {
  const wc = (s) => s.split(" ").length;
  let idx = start, words = 0, parts = [];
  while (idx < sentences.length) {
    const s = sentences[idx];
    const w = wc(s);
    if (parts.length && words + w > target * 1.4) break;
    if (!parts.length && w > target * 1.6) {
      parts.push(s.split(" ").slice(0, target).join(" "));
      idx++;
      break;
    }
    parts.push(s);
    words += w;
    idx++;
    if (words >= target * 0.8) break;
  }
  return { text: parts.join(" "), endIdx: idx };
}

/* ---------- estatísticas ---------- */
function renderStats() {
  const s = getStats();
  const avgAll = s.count ? s.sumWpm / s.count : 0;
  const lastN = s.history.slice(-10);
  const avg10 = lastN.length ? lastN.reduce((a, h) => a + h.wpm, 0) / lastN.length : 0;
  const box = (ic, tone, label, value, sub) =>
    `<div class="stat ${tone}"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`;
  $("#stats-panel").innerHTML =
    box("trophy", "gold", "Recorde", s.best ? Math.round(s.best.wpm) + " WPM" : "—", s.best ? `${Math.round(s.best.acc)}% precisão` : "ainda sem registro") +
    box("target", "blue", "Média geral", s.count ? Math.round(avgAll) + " WPM" : "—", s.count ? `${Math.round(s.sumAcc / s.count)}% precisão · ${s.count} testes` : "") +
    box("zap", "purple", "Média (últimos 10)", lastN.length ? Math.round(avg10) + " WPM" : "—", lastN.length ? `${lastN.length} testes` : "") +
    box("check", "green", "Última digitação", s.last ? Math.round(s.last.wpm) + " WPM" : "—", s.last ? `${Math.round(s.last.acc)}% precisão` : "") +
    `<div class="stats-actions"><button class="link-btn" id="btn-reset-stats">Zerar estatísticas</button></div>`;
  $("#btn-reset-stats").onclick = () => {
    if (confirm("Zerar recorde, média e histórico?")) { save(KEYS.stats, defaultStats()); renderStats(); }
  };
}

function recordResult(st, bookTitle) {
  const s = getStats();
  const entry = { wpm: st.wpm, acc: st.acc, date: Date.now(), book: bookTitle, chars: st.length };
  const isRecord = !s.best || entry.wpm > s.best.wpm;
  s.last = entry;
  if (isRecord) s.best = entry;
  s.history = [...s.history, { wpm: entry.wpm, acc: entry.acc, date: entry.date }].slice(-200);
  s.count += 1;
  s.sumWpm += entry.wpm;
  s.sumAcc += entry.acc;
  save(KEYS.stats, s);
  renderStats();
  return isRecord;
}

/* ---------- fluxo ---------- */
function prefs() { return load(KEYS.prefs, {}); }
function savePrefs() {
  save(KEYS.prefs, { book: $("#sel-book").value, size: $("#sel-size").value, mode: $("#sel-mode").value });
}

const RANDOM = "__aleatorio__"; // opção "Livro aleatório": sorteia um livro a cada novo trecho
let lastRandom = null;

function pickRandomBook() {
  const books = listAll();
  const pool = books.length > 1 ? books.filter((b) => b.id !== lastRandom) : books; // evita repetir o mesmo livro em seguida
  lastRandom = pool[Math.floor(Math.random() * pool.length)].id;
  return lastRandom;
}

function fillBooks() {
  const sel = $("#sel-book");
  const p = prefs();
  const books = listAll();
  sel.innerHTML = books.length
    ? `<option value="${RANDOM}">Livro aleatório</option>` + books.map((b) => `<option value="${b.id}">${esc(b.title)}${b.author ? " — " + esc(b.author) : ""}</option>`).join("")
    : `<option value="">(nenhum livro — vá em Biblioteca)</option>`;
  if (p.book === RANDOM || (p.book && books.some((b) => b.id === p.book))) sel.value = p.book;
  else if (books.length) sel.value = books[0].id; // padrão: primeiro livro (o aleatório é opt-in)
  if (p.size) $("#sel-size").value = p.size;
  if (p.mode) $("#sel-mode").value = p.mode;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function newExcerpt() {
  typer?.destroy();
  typer = null;
  resultOpen = false;
  $("#practice-result").hidden = true;
  const choice = $("#sel-book").value;
  const area = $("#practice-typing");
  if (!choice) {
    area.innerHTML = `<div class="panel muted">Nenhum livro disponível. Envie um .txt/.epub na aba <a href="#biblioteca">Biblioteca</a>.</div>`;
    return;
  }
  savePrefs();
  const bookId = choice === RANDOM ? pickRandomBook() : choice;
  let text;
  try { text = await getText(bookId); } catch (e) { area.innerHTML = `<div class="panel">Erro ao abrir o livro: ${esc(e.message)}</div>`; return; }
  const book = listAll().find((b) => b.id === bookId);
  const list = sentencesOf(bookId, text);
  if (!list.length) { area.innerHTML = `<div class="panel">Livro sem texto utilizável.</div>`; return; }

  const target = SIZES[$("#sel-size").value] || 50;
  const mode = $("#sel-mode").value;
  let start = mode === "continuar" ? getPos(bookId) : Math.floor(Math.random() * list.length);
  if (start >= list.length) start = 0;
  const { text: excerpt, endIdx } = pickExcerpt(list, start, target);
  current = { bookId, endIdx: endIdx >= list.length ? 0 : endIdx, startIdx: start, total: list.length };

  ui = buildTypingCard(area, { hint: "Digite o texto acima. <kbd>Esc</kbd> sorteia outro trecho." });
  ui.title.textContent = `${book?.title ?? ""}${choice === RANDOM ? " (sorteado)" : ""} · trecho ${Math.round((start / list.length) * 100)}% do livro`;
  typer = new Typer({
    ui, text: excerpt,
    onDone: (st) => finish(st, book),
    onEscape: newExcerpt,
  });
  typer.focus();
}

function finish(st, book) {
  const isRecord = recordResult(st, book?.title ?? "");
  setPos(current.bookId, current.endIdx); // avança "continuar de onde parei"
  const xp = gainXp(practiceXp(st, isRecord), { type: "practice", wpm: st.wpm, acc: st.acc, chars: st.length });
  const worst = Object.entries(st.errMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([k, n]) => `<kbd>${k === " " ? "espaço" : esc(k)}</kbd> ×${n}`).join(" ");
  const el = $("#practice-result");
  el.hidden = false;
  resultOpen = true;
  el.innerHTML = `
    <h2>${st.errors === 0 ? "Trecho perfeito!" : "Trecho concluído!"} ${isRecord ? `<span class="badge">Novo recorde!</span>` : ""}</h2>
    ${xpSummaryHtml(xp)}
    <div class="grid">
      <div><div class="big">${Math.round(st.wpm)}</div><div class="muted">palavras por minuto</div></div>
      <div><div class="big">${Math.round(st.acc)}%</div><div class="muted">precisão</div></div>
      <div><div class="big">${Math.round(st.elapsed)}s</div><div class="muted">tempo</div></div>
      <div><div class="big">${st.errors}</div><div class="muted">erros</div></div>
    </div>
    ${worst ? `<p>Teclas com mais erros: ${worst}</p>` : `<p>Sem erros — excelente!</p>`}
    <div class="actions">
      <button class="btn primary" id="btn-next">Próximo trecho (Enter)</button>
      <button class="btn" id="btn-retry">Repetir este trecho</button>
    </div>`;
  const text = typer.text;
  $("#btn-next").onclick = newExcerpt;
  $("#btn-retry").onclick = () => retry(text);
  $("#btn-next").focus();
}

function retry(text) {
  typer?.destroy();
  $("#practice-result").hidden = true;
  resultOpen = false;
  const area = $("#practice-typing");
  const title = ui.title.textContent;
  ui = buildTypingCard(area, { hint: "Digite o texto acima. <kbd>Esc</kbd> sorteia outro trecho." });
  ui.title.textContent = title + " (repetição)";
  typer = new Typer({ ui, text, onDone: (st) => finish(st, listAll().find((b) => b.id === current.bookId)), onEscape: newExcerpt });
  typer.focus();
}

let initialized = false;
export function initPractice() {
  if (initialized) return;
  initialized = true;
  $("#btn-new").onclick = newExcerpt;
  for (const id of ["#sel-book", "#sel-size", "#sel-mode"]) $(id).addEventListener("change", newExcerpt);
  libraryEvents.addEventListener("change", () => { fillBooks(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && resultOpen && !$("#view-praticar").hidden && document.activeElement?.tagName !== "BUTTON") newExcerpt();
  });
  fillBooks();
  renderStats();
}

export function showPractice() {
  initPractice();
  fillBooks();
  renderStats();
  if (!typer) newExcerpt();
  else if (!resultOpen) typer.focus();
}

export function hidePractice() {
  typer?.destroy();
  typer = null;
  $("#practice-typing").innerHTML = "";
}
