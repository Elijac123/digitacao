// Aba Aprender: curso em lições com progresso salvo no navegador.
import { Typer, buildTypingCard } from "./typing.js";
import { SECTIONS, LESSONS, lessonIndex, buildSteps } from "./lessons.js";
import { renderKeyboard, highlight, describe } from "./keyboard.js";
import { load, save, KEYS } from "./storage.js";
import { starsHtml } from "./icons.js";
import { gainXp, xpSummaryHtml } from "./gamify.js";

const $ = (s) => document.querySelector(s);
const secStyle = (sec) => `style="--sec:var(--c${SECTIONS.indexOf(sec) % 6})"`;
const lessonCtx = () => {
  const keys = LESSONS.filter((l) => l.kind !== "info");
  return {
    lessonsDone: keys.filter((l) => progress.done[l.id]?.stars > 0).length,
    threeStars: keys.filter((l) => progress.done[l.id]?.stars === 3).length,
    lessonsTotal: keys.length,
  };
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let progress = { done: {}, current: null, run: null, ...load(KEYS.progresso, {}) };
let typer = null;
let kbEl = null;
let onEnter = null;
let run = null; // { lesson, steps, stepIdx, results[] }

const persist = () => save(KEYS.progresso, progress);
const isDone = (id) => !!progress.done[id];
const isUnlocked = (i) => i === 0 || isDone(LESSONS[i - 1].id);
const stars = (n, size) => starsHtml(n, 3, size);

function stopTyper() { typer?.destroy(); typer = null; }

/* ---------- mapa do curso ---------- */
function renderMap() {
  const cur = progress.current || LESSONS[0].id;
  const curSection = LESSONS[lessonIndex(cur)]?.section;
  const total = LESSONS.length;
  const totalDone = LESSONS.filter((l) => isDone(l.id)).length;
  $("#course-map").innerHTML = `<div class="course-head"><h3>Trilha do curso</h3>
      <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${totalDone}" aria-label="Progresso do curso"><i style="width:${Math.round((totalDone / total) * 100)}%"></i></div>
      <div class="small muted">${totalDone} de ${total} lições</div></div>` + SECTIONS.map((sec) => {
    const done = sec.lessons.filter((l) => isDone(l.id)).length;
    const pct = Math.round((done / sec.lessons.length) * 100);
    const items = sec.lessons.map((l, li) => {
      const i = lessonIndex(l.id);
      const unlocked = isUnlocked(i);
      const d = progress.done[l.id];
      const node = li + 1;
      const status = d?.stars ? stars(d.stars, 14) : "";
      return `<button class="lesson-btn ${d ? "done" : ""} ${unlocked ? "" : "locked"} ${l.id === cur ? "current" : ""}" data-id="${l.id}"
        ${l.id === cur ? 'aria-current="step"' : ""}>
        <span class="node">${node}</span><span class="lt">${esc(l.title)}<span class="sr-only">${unlocked ? "" : " (bloqueada)"}</span></span><span class="status">${status}</span></button>`;
    }).join("");
    return `<details ${secStyle(sec)} ${sec.id === curSection ? "open" : ""}>
      <summary><span class="sec-title">${esc(sec.title)}</span><span class="count">${done}/${sec.lessons.length}</span></summary>
      <div class="meter sm" aria-hidden="true"><i style="width:${pct}%"></i></div><div class="lesson-list">${items}</div></details>`;
  }).join("") + `<p class="small"><button class="link-btn" id="btn-reset-course">Reiniciar progresso do curso</button></p>`;

  document.querySelectorAll("#course-map .lesson-btn").forEach((b) => (b.onclick = () => clickLesson(b.dataset.id)));
  $("#btn-reset-course").onclick = () => {
    if (confirm("Apagar todo o progresso do curso?")) {
      progress = { done: {}, current: null, run: null };
      persist();
      showLearn();
    }
  };
}

/* ---------- pular partes ---------- */
function askYesNo(question) {
  return new Promise((resolve) => {
    const ov = document.createElement("div");
    ov.className = "modal-overlay";
    ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><p>${question}</p>
      <div class="actions"><button class="btn primary" data-a="yes">Sim</button><button class="btn" data-a="no">Não</button></div></div>`;
    const close = (v) => { ov.remove(); document.removeEventListener("keydown", onKey, true); resolve(v); };
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); close(false); }
    };
    ov.onclick = (e) => { const a = e.target.dataset?.a; if (a) close(a === "yes"); else if (e.target === ov) close(false); };
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(ov);
    ov.querySelector('[data-a="yes"]').focus();
  });
}

async function clickLesson(id) {
  const i = lessonIndex(id);
  if (isUnlocked(i)) return openLesson(id);
  if (!(await askYesNo("Pular para essa parte?"))) return;
  for (let k = 0; k < i; k++) {
    const l = LESSONS[k];
    if (!progress.done[l.id]) progress.done[l.id] = { stars: 0, wpm: 0, acc: 0, skipped: true, date: Date.now() };
  }
  persist();
  openLesson(id);
}

/* ---------- lição ---------- */
function newKeyHints(l) {
  const chars = [...(l.new || "")].filter((c) => c.trim());
  if (!chars.length) return "";
  return `<ul>${chars.map((c) => `<li>${describe(c)}</li>`).join("")}</ul>`;
}

export function openLesson(id) {
  stopTyper();
  onEnter = null;
  const l = LESSONS[lessonIndex(id)];
  progress.current = id;
  if (progress.run?.id !== id) progress.run = null;
  persist();
  renderMap();
  const sec = SECTIONS.find((s) => s.id === l.section);
  const view = $("#lesson-view");

  if (l.kind === "info") {
    view.innerHTML = `<div class="panel intro lesson-card" ${secStyle(sec)}>
      <div class="lesson-hero"><div><div class="small">${esc(sec.title)}</div><h2>${esc(l.title)}</h2></div></div>
      ${l.html}
      <div class="actions"><button class="btn primary big" id="btn-ack">Entendi, continuar (Enter)</button></div></div>`;
    const ack = () => { completeInfo(l); };
    $("#btn-ack").onclick = ack;
    onEnter = ack;
    return;
  }

  const d = progress.done[id];
  view.innerHTML = `<div class="panel intro lesson-card" ${secStyle(sec)}>
    <div class="lesson-hero">
      <div><div class="small">${esc(sec.title)}</div><h2>${esc(l.title)}</h2></div>
      ${d?.stars ? `<div class="hero-stars">${stars(d.stars, 22)}</div>` : ""}</div>
    ${l.tip ? `<p>${l.tip}</p>` : ""}
    ${newKeyHints(l)}
    <div class="goals">
      <div class="goal"><span><b>${sec.goal.acc}%</b> de precisão por etapa</span></div>
      ${sec.goal.wpm ? `<div class="goal"><span><b>${sec.goal.wpm} WPM</b> para 3 estrelas</span></div>` : ""}
      ${d?.stars ? `<div class="goal"><span>Seu melhor: <b>${Math.round(d.wpm)} WPM</b> · ${Math.round(d.acc)}%</span></div>` : ""}
    </div>
    <label class="check"><input type="checkbox" id="chk-kb" ${load(KEYS.teclado, true) ? "checked" : ""}> Mostrar teclado virtual</label>
    <div class="actions" style="margin-top:.75rem"><button class="btn primary big" id="btn-start">Começar (Enter)</button></div>
  </div>`;
  const start = () => beginRun(l);
  $("#btn-start").onclick = start;
  onEnter = start;
}

function completeInfo(l) {
  progress.done[l.id] = { stars: 0, wpm: 0, acc: 0, date: Date.now() };
  persist();
  goNext(l);
}

function goNext(l) {
  const i = lessonIndex(l.id);
  if (i + 1 < LESSONS.length) openLesson(LESSONS[i + 1].id);
  else { renderMap(); $("#lesson-view").innerHTML = `<div class="panel"><h2>Curso concluído!</h2><p>Continue em <a href="#praticar">Praticar</a>.</p></div>`; }
}

function beginRun(l, startStep = 0) {
  onEnter = null;
  const showKb = $("#chk-kb")?.checked ?? load(KEYS.teclado, true);
  save(KEYS.teclado, showKb);
  const steps = buildSteps(l);
  run = { lesson: l, steps, stepIdx: Math.min(startStep, steps.length - 1), results: [], showKb };
  const view = $("#lesson-view");
  const runSec = SECTIONS.find((s) => s.id === l.section);
  view.innerHTML = `<div class="panel lesson-card" ${secStyle(runSec)}>
    <div class="lesson-hero compact"><div><div class="small">${esc(runSec.title)}</div><h2>${esc(l.title)}</h2></div></div>
    <div class="steps" id="steps"></div>
    <div id="lesson-typing"></div>
    <div class="finger-hint" id="finger-hint"></div>
    <div id="kb-wrap" ${showKb ? "" : "hidden"}><div id="kb"></div></div>
    <div id="feedback"></div>
  </div>`;
  kbEl = $("#kb");
  renderKeyboard(kbEl);
  runStep();
}

function renderSteps() {
  $("#steps").innerHTML = run.steps.map((_, i) => `<span class="${i < run.stepIdx ? "done" : i === run.stepIdx ? "now" : ""}"></span>`).join("");
}

function runStep(retryText) {
  stopTyper();
  progress.run = { id: run.lesson.id, stepIdx: run.stepIdx };
  persist();
  onEnter = null;
  $("#feedback").innerHTML = "";
  renderSteps();
  const step = run.steps[run.stepIdx];
  if (retryText) step.text = retryText;
  const ui = buildTypingCard($("#lesson-typing"), { hint: "<kbd>Esc</kbd> reinicia a etapa." });
  ui.title.textContent = `Etapa ${run.stepIdx + 1}/${run.steps.length} · ${step.label}`;
  const hint = (ch) => {
    $("#finger-hint").innerHTML = ch ? `Próxima tecla: ${describe(ch)}` : "";
    if (run.showKb) highlight(kbEl, ch);
  };
  typer = new Typer({
    ui, text: step.text,
    onProgress: (st) => hint(st.next),
    onDone: (st) => stepDone(st),
    onEscape: () => runStep(step.text),
  });
  hint(step.text[0]);
  typer.focus();
}

function stepDone(st) {
  const { lesson } = run;
  const goal = lesson.goal;
  highlight(kbEl, "");
  $("#finger-hint").innerHTML = "";
  const fb = $("#feedback");
  const stepText = run.steps[run.stepIdx].text;
  if (st.acc < goal.acc) {
    fb.innerHTML = `<div class="feedback fail"><div>Precisão de <b>${Math.round(st.acc)}%</b> — a meta é ${goal.acc}%. Vá mais devagar e tente de novo.</div></div>
      <div class="actions" style="margin-top:.6rem"><button class="btn primary" id="btn-retry">Tentar de novo (Enter)</button></div>`;
    const retry = () => runStep(stepText);
    $("#btn-retry").onclick = retry;
    onEnter = retry;
    return;
  }
  run.results.push(st);
  const last = run.stepIdx === run.steps.length - 1;
  if (!last) {
    const xp = gainXp(5, { type: "lesson", wpm: st.wpm, acc: st.acc, chars: st.length, ...lessonCtx() });
    fb.innerHTML = `<div class="feedback pass"><div><b>Etapa concluída!</b> ${Math.round(st.acc)}% de precisão · ${Math.round(st.wpm)} WPM.</div><span class="xp-chip">+${xp.amount} XP</span></div>
      <div class="actions" style="margin-top:.6rem"><button class="btn primary" id="btn-cont">Continuar (Enter)</button></div>`;
    const cont = () => { run.stepIdx++; runStep(); };
    $("#btn-cont").onclick = cont;
    onEnter = cont;
    return;
  }
  finishLesson();
}

function finishLesson() {
  const { lesson, results } = run;
  const avg = (k) => results.reduce((a, r) => a + r[k], 0) / results.length;
  const acc = avg("acc"), wpm = avg("wpm");
  let s = 1;
  if (acc >= 97) s = 2;
  if (acc >= 97 && wpm >= lesson.goal.wpm) s = 3;
  const prev = progress.done[lesson.id];
  progress.done[lesson.id] = {
    stars: Math.max(s, prev?.stars || 0),
    wpm: Math.max(wpm, prev?.wpm || 0),
    acc: Math.max(acc, prev?.acc || 0),
    date: Date.now(),
  };
  progress.run = null;
  persist();
  const xp = gainXp(20 + 15 * s, { type: "lesson", wpm, acc, stars: s, ...lessonCtx() });
  renderMap();
  renderSteps();
  const hasNext = lessonIndex(lesson.id) + 1 < LESSONS.length;
  $("#feedback").innerHTML = `<div class="feedback pass celebrate">
      <div class="hero-stars">${stars(s, 36)}</div>
      <div><b>Lição concluída!</b> Média: ${Math.round(wpm)} WPM · ${Math.round(acc)}% de precisão.
      ${s < 3 ? `<br><span class="small">3 estrelas: ≥97% de precisão e ≥${lesson.goal.wpm} WPM.</span>` : ""}</div>
      ${xpSummaryHtml(xp)}
    </div>
    <div class="actions" style="margin-top:.6rem">
      ${hasNext ? `<button class="btn primary" id="btn-next-lesson">Próxima lição (Enter)</button>` : ""}
      <button class="btn" id="btn-redo">Repetir lição</button>
    </div>`;
  const next = () => goNext(lesson);
  if (hasNext) { $("#btn-next-lesson").onclick = next; onEnter = next; }
  $("#btn-redo").onclick = () => openLesson(lesson.id);
}

/* ---------- entrada/saída da aba ---------- */
let initialized = false;
export function showLearn() {
  if (!initialized) {
    initialized = true;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && onEnter && !$("#view-aprender").hidden && document.activeElement?.tagName !== "BUTTON" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        onEnter();
      }
    });
  }
  let id = progress.current;
  if (!id || lessonIndex(id) < 0 || !isUnlocked(lessonIndex(id))) {
    id = (LESSONS.find((l) => !isDone(l.id)) || LESSONS[0]).id;
  }
  const l = LESSONS[lessonIndex(id)];
  if (progress.run?.id === id && l.kind !== "info") {
    progress.current = id;
    renderMap();
    beginRun(l, progress.run.stepIdx); // retoma de onde parou
  } else openLesson(id);
}

export function hideLearn() {
  stopTyper();
  onEnter = null;
}
