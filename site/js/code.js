// Aba Programar: treino de velocidade digitando trechos de código.
// Enter quebra a linha e a indentação da linha seguinte é preenchida sozinha (não conta no WPM).
import { Typer, buildTypingCard } from "./typing.js";
import { LANGS, SIZES, sizeOf } from "./snippets.js";
import { load, save, KEYS } from "./storage.js";
import { gainXp, practiceXp, xpSummaryHtml } from "./gamify.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ALL = "__todas__";
const HINT = "Digite o código acima. <kbd>Enter</kbd> quebra a linha (a indentação vem sozinha). <kbd>Esc</kbd> sorteia outro trecho.";

let typer = null;
let ui = null;
let current = null; // { lang, name, code, size }
let resultOpen = false;
let lastKey = null;
let initialized = false;

const defaultStats = () => ({ best: null, last: null, history: [], count: 0, sumWpm: 0, sumAcc: 0 });
const getStats = () => ({ ...defaultStats(), ...load(KEYS.progStats, {}) });

/* ---------- estatísticas ---------- */
function renderStats() {
  const s = getStats();
  const avgAll = s.count ? s.sumWpm / s.count : 0;
  const lastN = s.history.slice(-10);
  const avg10 = lastN.length ? lastN.reduce((a, h) => a + h.wpm, 0) / lastN.length : 0;
  const box = (label, value, sub) =>
    `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`;
  $("#code-stats").innerHTML =
    box("Recorde", s.best ? Math.round(s.best.wpm) + " WPM" : "—", s.best ? `${Math.round(s.best.acc)}% precisão · ${esc(s.best.name || "")}` : "ainda sem registro") +
    box("Média geral", s.count ? Math.round(avgAll) + " WPM" : "—", s.count ? `${Math.round(s.sumAcc / s.count)}% precisão · ${s.count} trechos` : "") +
    box("Média (últimos 10)", lastN.length ? Math.round(avg10) + " WPM" : "—", lastN.length ? `${lastN.length} trechos` : "") +
    box("Último trecho", s.last ? Math.round(s.last.wpm) + " WPM" : "—", s.last ? `${Math.round(s.last.acc)}% precisão · ${esc(s.last.name || "")}` : "") +
    `<div class="stats-actions"><button class="link-btn" id="code-reset-stats">Zerar estatísticas</button></div>`;
  $("#code-reset-stats").onclick = () => {
    if (confirm("Zerar recorde, média e histórico de código?")) { save(KEYS.progStats, defaultStats()); renderStats(); }
  };
}

function recordResult(st, name) {
  const s = getStats();
  const entry = { wpm: st.wpm, acc: st.acc, date: Date.now(), name, chars: st.length };
  const isRecord = !s.best || entry.wpm > s.best.wpm;
  s.last = entry;
  if (isRecord) s.best = entry;
  s.history = [...s.history, { wpm: entry.wpm, acc: entry.acc, date: entry.date }].slice(-200);
  s.count += 1;
  s.sumWpm += entry.wpm;
  s.sumAcc += entry.acc;
  save(KEYS.progStats, s);
  renderStats();
  return isRecord;
}

/* ---------- controles ---------- */
function savePrefs() {
  save(KEYS.progPrefs, { lang: $("#code-lang").value, size: $("#code-size").value });
}

function fillControls() {
  const p = load(KEYS.progPrefs, {});
  $("#code-lang").innerHTML =
    `<option value="${ALL}">Todas as linguagens</option>` +
    Object.entries(LANGS).map(([id, l]) => `<option value="${id}">${esc(l.name)}</option>`).join("");
  $("#code-size").innerHTML = Object.entries(SIZES).map(([id, n]) => `<option value="${id}">${n}</option>`).join("");
  $("#code-lang").value = p.lang === ALL || LANGS[p.lang] ? p.lang : ALL;
  $("#code-size").value = SIZES[p.size] ? p.size : "curto";
}

/** Sorteia um trecho da linguagem/tamanho escolhidos, sem repetir o anterior. */
function pick(langKey, size) {
  const keys = langKey === ALL ? Object.keys(LANGS) : [langKey];
  const all = keys.flatMap((k) => LANGS[k].snippets.map((code, i) => ({ k, i, code })));
  let pool = all.filter((p) => sizeOf(p.code) === size);
  if (!pool.length) { // nenhuma linguagem/tamanho exato: usa os de comprimento mais próximo
    const target = { curto: 60, medio: 150, longo: 300 }[size];
    pool = all.sort((a, b) => Math.abs(a.code.length - target) - Math.abs(b.code.length - target)).slice(0, 3);
  }
  if (pool.length > 1) pool = pool.filter((p) => `${p.k}:${p.i}` !== lastKey);
  const p = pool[Math.floor(Math.random() * pool.length)];
  lastKey = `${p.k}:${p.i}`;
  return p;
}

/* ---------- fluxo ---------- */
function start(code, titleSuffix = "") {
  typer?.destroy();
  resultOpen = false;
  $("#code-result").hidden = true;
  ui = buildTypingCard($("#code-typing"), { hint: HINT });
  ui.display.classList.add("code");
  ui.title.textContent = `${current.name} · trecho ${SIZES[current.size].toLowerCase()}${titleSuffix}`;
  typer = new Typer({ ui, text: code, multiline: true, onDone: finish, onEscape: newSnippet });
  typer.focus();
}

function newSnippet() {
  const p = pick($("#code-lang").value, $("#code-size").value);
  savePrefs();
  current = { lang: p.k, name: LANGS[p.k].name, code: p.code, size: sizeOf(p.code) };
  start(p.code);
}

const keyName = (k) => (k === " " ? "espaço" : k === "\n" ? "Enter" : k);

function finish(st) {
  const isRecord = recordResult(st, current.name);
  const xp = gainXp(practiceXp(st, isRecord), { type: "code", wpm: st.wpm, acc: st.acc, chars: st.length });
  const worst = Object.entries(st.errMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([k, n]) => `<kbd>${esc(keyName(k))}</kbd> ×${n}`).join(" ");
  const el = $("#code-result");
  el.hidden = false;
  resultOpen = true;
  el.innerHTML = `
    <h2>${st.errors === 0 ? "Código perfeito!" : "Código concluído!"} ${isRecord ? '<span class="badge">Novo recorde!</span>' : ""}</h2>
    ${xpSummaryHtml(xp)}
    <div class="grid">
      <div><div class="big">${Math.round(st.wpm)}</div><div class="muted">palavras por minuto</div></div>
      <div><div class="big">${Math.round(st.acc)}%</div><div class="muted">precisão</div></div>
      <div><div class="big">${Math.round(st.elapsed)}s</div><div class="muted">tempo</div></div>
      <div><div class="big">${st.errors}</div><div class="muted">erros</div></div>
    </div>
    ${worst ? `<p>Teclas com mais erros: ${worst}</p>` : `<p>Sem erros — excelente!</p>`}
    <div class="actions">
      <button class="btn primary" id="code-next">Próximo trecho (Enter)</button>
      <button class="btn" id="code-retry">Repetir este trecho</button>
    </div>`;
  $("#code-next").onclick = newSnippet;
  $("#code-retry").onclick = () => start(current.code, " (repetição)");
  $("#code-next").focus();
}

function init() {
  if (initialized) return;
  initialized = true;
  $("#code-new").onclick = newSnippet;
  for (const id of ["#code-lang", "#code-size"]) $(id).addEventListener("change", newSnippet);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && resultOpen && !$("#view-programar").hidden && document.activeElement?.tagName !== "BUTTON") newSnippet();
  });
  fillControls();
  renderStats();
}

export function showCode() {
  init();
  renderStats();
  if (!typer) newSnippet();
  else if (!resultOpen) typer.focus();
}

export function hideCode() {
  typer?.destroy();
  typer = null;
  resultOpen = false;
  $("#code-typing").innerHTML = "";
}
