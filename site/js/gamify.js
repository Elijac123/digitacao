// Gamificação: XP, níveis, ofensiva (dias seguidos) e conquistas. Tudo salvo no navegador.
import { load, save, KEYS } from "./storage.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const empty = () => ({ xp: 0, streak: 0, bestStreak: 0, last: "", practices: 0, codes: 0, perfects: 0, chars: 0, days: 0, badges: {} });
let G = { ...empty(), ...load(KEYS.gamificacao, {}) };
const persist = () => save(KEYS.gamificacao, G);

/* ---------- nível ---------- */
/** Nível n -> n+1 custa 100 + 40*(n-1) XP. */
export function levelInfo(xp = G.xp) {
  let level = 1, need = 100, rem = xp;
  while (rem >= need) { rem -= need; level++; need = 100 + (level - 1) * 40; }
  return { level, into: rem, need, pct: Math.round((rem / need) * 100) };
}

/* ---------- ofensiva ---------- */
const dayStr = (d = new Date()) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD local
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };

/** Ofensiva exibida: zera se passou mais de um dia sem treinar. */
export function currentStreak() {
  return G.last === dayStr() || G.last === yesterday() ? G.streak : 0;
}
export const practicedToday = () => G.last === dayStr();

function touchStreak() {
  const today = dayStr();
  if (G.last === today) return;
  G.streak = G.last === yesterday() ? G.streak + 1 : 1;
  G.bestStreak = Math.max(G.bestStreak, G.streak);
  G.days = (G.days || 0) + 1;
  G.last = today;
}

/* ---------- conquistas ---------- */
// ctx: { type: "practice"|"lesson", wpm, acc, chars, stars, lessonsDone, threeStars, lessonsTotal }
// tier 1 bronze · 2 prata · 3 ouro · 4 diamante (dificuldade crescente)
const B = (id, cat, tier, icon, title, desc, test) => ({ id, cat, tier, icon, title, desc, test });
const wpmB = (n, tier, icon, title) => B("wpm" + n, "Velocidade", tier, icon, title, `Alcance ${n} WPM.`, (g, c) => (c.wpm || 0) >= n);

export const BADGES = [
  // Curso
  B("licao1", "Curso", 1, "learn", "Primeiros passos", "Conclua sua primeira lição.", (g, c) => (c.lessonsDone || 0) >= 1),
  B("licao5", "Curso", 1, "book", "Aluno dedicado", "Conclua 5 lições.", (g, c) => (c.lessonsDone || 0) >= 5),
  B("licao10", "Curso", 2, "book", "Pegando o jeito", "Conclua 10 lições.", (g, c) => (c.lessonsDone || 0) >= 10),
  B("licao15", "Curso", 2, "medal", "Veterano do curso", "Conclua 15 lições.", (g, c) => (c.lessonsDone || 0) >= 15),
  B("licao25", "Curso", 3, "medal", "Quase formado", "Conclua 25 lições.", (g, c) => (c.lessonsDone || 0) >= 25),
  B("cursoTodo", "Curso", 4, "trophy", "Formado em digitação", "Conclua todas as lições do curso.", (g, c) => c.lessonsTotal > 0 && c.lessonsDone >= c.lessonsTotal),
  B("estrelas", "Curso", 1, "star", "Nota máxima", "Ganhe 3 estrelas em uma lição.", (g, c) => c.stars === 3),
  B("estrelas5", "Curso", 2, "star", "Estrela em ascensão", "Tenha 3 estrelas em 5 lições.", (g, c) => (c.threeStars || 0) >= 5),
  B("estrelas15", "Curso", 3, "star", "Constelação", "Tenha 3 estrelas em 15 lições.", (g, c) => (c.threeStars || 0) >= 15),
  B("estrelasTodas", "Curso", 4, "trophy", "Galáxia completa", "Tenha 3 estrelas em todas as lições.", (g, c) => c.lessonsTotal > 0 && c.threeStars >= c.lessonsTotal),

  // Praticar
  B("trecho1", "Praticar", 1, "keyboard", "Primeiro trecho", "Termine um trecho em Praticar.", (g) => g.practices >= 1),
  B("trecho10", "Praticar", 1, "target", "Maratonista", "Termine 10 trechos.", (g) => g.practices >= 10),
  B("trecho25", "Praticar", 2, "target", "Leitor voraz", "Termine 25 trechos.", (g) => g.practices >= 25),
  B("trecho50", "Praticar", 3, "book", "Rato de biblioteca", "Termine 50 trechos.", (g) => g.practices >= 50),
  B("trecho100", "Praticar", 3, "library", "Centenário", "Termine 100 trechos.", (g) => g.practices >= 100),
  B("trecho250", "Praticar", 4, "library", "Escritor fantasma", "Termine 250 trechos.", (g) => g.practices >= 250),

  // Velocidade (WPM)
  wpmB(20, 1, "zap", "Aquecendo"),
  wpmB(30, 1, "zap", "Pegando ritmo"),
  wpmB(40, 1, "zap", "Ligeiro"),
  wpmB(50, 2, "zap", "Veloz"),
  wpmB(60, 2, "trophy", "Dedos de raio"),
  wpmB(70, 2, "flame", "Furacão"),
  wpmB(80, 3, "flame", "Foguete"),
  wpmB(90, 3, "flame", "Supersônico"),
  wpmB(100, 4, "trophy", "Clube dos 100"),
  wpmB(110, 4, "trophy", "Máquina de escrever"),
  wpmB(120, 4, "medal", "Lenda do teclado"),

  // Precisão
  B("perfeito", "Precisão", 1, "check", "Sem errar", "100% de precisão em um texto de 40+ caracteres.", (g, c) => c.acc === 100 && (c.chars || 0) >= 40),
  B("perfeito5", "Precisão", 2, "check", "Mãos firmes", "Faça 5 trechos perfeitos (100%) em Praticar.", (g) => g.perfects >= 5),
  B("perfeito25", "Precisão", 3, "target", "Cirúrgico", "Faça 25 trechos perfeitos em Praticar.", (g) => g.perfects >= 25),
  B("perfeitoLongo", "Precisão", 4, "medal", "Impecável", "100% de precisão em um trecho de 300+ caracteres.", (g, c) => c.type === "practice" && c.acc === 100 && (c.chars || 0) >= 300),

  // Velocidade + precisão
  B("combo40", "Combo", 2, "zap", "Rápido e certeiro", "40 WPM com 98% ou mais de precisão.", (g, c) => c.wpm >= 40 && c.acc >= 98),
  B("combo70", "Combo", 3, "flame", "Piloto de elite", "70 WPM com 98% ou mais de precisão.", (g, c) => c.wpm >= 70 && c.acc >= 98),
  B("combo100", "Combo", 4, "trophy", "Perfeição veloz", "100 WPM com 97% ou mais de precisão.", (g, c) => c.wpm >= 100 && c.acc >= 97),

  // Ofensiva
  B("streak3", "Ofensiva", 1, "flame", "Pegando fogo", "Treine 3 dias seguidos.", (g) => g.streak >= 3),
  B("streak7", "Ofensiva", 1, "flame", "Semana de fogo", "Treine 7 dias seguidos.", (g) => g.streak >= 7),
  B("streak14", "Ofensiva", 2, "flame", "Quinzena firme", "Treine 14 dias seguidos.", (g) => g.streak >= 14),
  B("streak30", "Ofensiva", 3, "flame", "Mês de ouro", "Treine 30 dias seguidos.", (g) => g.streak >= 30),
  B("streak60", "Ofensiva", 4, "flame", "Imparável", "Treine 60 dias seguidos.", (g) => g.streak >= 60),
  B("streak100", "Ofensiva", 4, "trophy", "Cem dias de chama", "Treine 100 dias seguidos.", (g) => g.streak >= 100),

  // Constância e volume
  B("dias10", "Constância", 2, "target", "Hábito formado", "Treine em 10 dias diferentes.", (g) => g.days >= 10),
  B("dias30", "Constância", 3, "target", "Rotina de ferro", "Treine em 30 dias diferentes.", (g) => g.days >= 30),
  B("chars1k", "Constância", 1, "keyboard", "Mil toques", "Digite 1.000 caracteres.", (g) => g.chars >= 1000),
  B("chars10k", "Constância", 2, "keyboard", "Dez mil toques", "Digite 10.000 caracteres.", (g) => g.chars >= 10000),
  B("chars50k", "Constância", 3, "book", "Um conto inteiro", "Digite 50.000 caracteres.", (g) => g.chars >= 50000),
  B("chars200k", "Constância", 4, "library", "Um romance", "Digite 200.000 caracteres.", (g) => g.chars >= 200000),

  // Programar
  B("code1", "Programar", 1, "keyboard", "Hello, mundo", "Termine seu primeiro trecho de código.", (g) => g.codes >= 1),
  B("code10", "Programar", 2, "keyboard", "Dev em treino", "Termine 10 trechos de código.", (g) => g.codes >= 10),
  B("code50", "Programar", 3, "keyboard", "Dev dedicado", "Termine 50 trechos de código.", (g) => g.codes >= 50),
  B("code150", "Programar", 4, "keyboard", "Dedos de compilador", "Termine 150 trechos de código.", (g) => g.codes >= 150),

  // Nível
  B("nivel5", "Nível", 1, "trophy", "Nível 5", "Chegue ao nível 5.", (g, c, lv) => lv.level >= 5),
  B("nivel10", "Nível", 2, "trophy", "Nível 10", "Chegue ao nível 10.", (g, c, lv) => lv.level >= 10),
  B("nivel15", "Nível", 3, "trophy", "Nível 15", "Chegue ao nível 15.", (g, c, lv) => lv.level >= 15),
  B("nivel20", "Nível", 3, "medal", "Nível 20", "Chegue ao nível 20.", (g, c, lv) => lv.level >= 20),
  B("nivel30", "Nível", 4, "medal", "Nível 30", "Chegue ao nível 30.", (g, c, lv) => lv.level >= 30),
];

export const TIERS = { 1: "bronze", 2: "prata", 3: "ouro", 4: "diamante" };

/* ---------- XP ---------- */
export function gainXp(amount, ctx = {}) {
  const before = levelInfo().level;
  touchStreak();
  G.xp += amount;
  if (ctx.type === "code") G.codes = (G.codes || 0) + 1;
  if (ctx.type === "practice") { G.practices++; if (ctx.acc === 100) G.perfects = (G.perfects || 0) + 1; }
  G.chars = (G.chars || 0) + (ctx.chars || 0);
  const lv = levelInfo();
  const out = { amount, level: lv.level, leveledUp: lv.level > before, badges: [] };
  for (const b of BADGES) {
    if (!G.badges[b.id] && b.test(G, ctx, lv)) { G.badges[b.id] = Date.now(); out.badges.push(b); }
  }
  persist();
  renderHud();
  if (out.leveledUp) toast(`Nível ${lv.level}!`, "Você subiu de nível. Continue assim!", "zap", "level");
  for (const b of out.badges) toast("Conquista desbloqueada", b.title, b.icon, "badge");
  return out;
}

/** XP por trecho de Praticar: ~1 XP por palavra correta, ponderado pela precisão. */
export const practiceXp = (st, isRecord) => Math.max(5, Math.round((st.correct / 5) * (st.acc / 100))) + (isRecord ? 25 : 0);

/** Barra de nível + XP ganho (para painéis de resultado). */
export function xpSummaryHtml(out) {
  const lv = levelInfo();
  return `<div class="xp-summary">
    <span class="xp-chip">+${out.amount} XP</span>
    <div class="xp-line"><span class="small">Nível ${lv.level}</span>
      <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${lv.need}" aria-valuenow="${lv.into}" aria-label="Progresso do nível"><i style="width:${lv.pct}%"></i></div>
      <span class="small muted">${lv.into}/${lv.need}</span></div>
  </div>`;
}

/* ---------- avisos (toasts) ---------- */
function toast(title, text, ic, kind) {
  const box = $("#toasts");
  if (!box) return;
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.innerHTML = `<div><b>${esc(title)}</b><div class="small">${esc(text)}</div></div>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 300); }, 4500);
}

/* ---------- HUD no cabeçalho ---------- */
export function renderHud() {
  const hud = $("#hud");
  if (!hud) return;
  const s = currentStreak();
  const lv = levelInfo();
  hud.innerHTML = `
    <div class="chip streak ${s ? "on" : ""}" title="${s ? `${s} dia(s) seguidos` : "Treine hoje para começar uma ofensiva"}">
      <span class="chip-lbl">Ofensiva</span><b>${s}</b><span class="sr-only"> dias seguidos</span>
    </div>
    <button class="chip level" id="btn-conquistas" aria-label="Nível ${lv.level}, ${lv.into} de ${lv.need} XP. Abrir conquistas">
      <span class="lv-num">${lv.level}</span>
      <span class="lv-bar"><span class="small">Nível ${lv.level}</span><span class="meter"><i style="width:${lv.pct}%"></i></span></span>
    </button>`;
  $("#btn-conquistas").onclick = openAchievements;
}

function openAchievements() {
  const lv = levelInfo();
  const got = BADGES.filter((b) => G.badges[b.id]).length;
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="ach-title">
    <div class="modal-head"><h2 id="ach-title">Suas conquistas</h2><button class="icon-btn" id="ach-close">Fechar</button></div>
    <div class="ach-stats">
      <div class="stat"><div class="label">Nível</div><div class="value">${lv.level}</div><div class="sub">${G.xp} XP no total</div></div>
      <div class="stat"><div class="label">Ofensiva</div><div class="value">${currentStreak()}</div><div class="sub">recorde: ${G.bestStreak} dia(s)</div></div>
      <div class="stat"><div class="label">Conquistas</div><div class="value">${got}/${BADGES.length}</div><div class="sub">desbloqueadas</div></div>
    </div>
    ${[...new Set(BADGES.map((b) => b.cat))].map((cat) => `<h3 class="ach-cat">${esc(cat)}</h3>
    <ul class="badge-grid">${BADGES.filter((b) => b.cat === cat).map((b) => {
      const on = !!G.badges[b.id];
      return `<li class="bdg t${b.tier} ${on ? "on" : "off"}"><span class="bdg-ic" aria-hidden="true"></span>
        <div><b>${esc(b.title)}</b><div class="small muted"><span class="tier-name">${TIERS[b.tier]}</span> · ${esc(b.desc)}</div></div>
        <span class="sr-only">${on ? "Desbloqueada" : "Bloqueada"}, ${TIERS[b.tier]}</span></li>`;
    }).join("")}</ul>`).join("")}
  </div>`;
  const close = () => { ov.remove(); document.removeEventListener("keydown", onKey, true); $("#btn-conquistas")?.focus(); };
  const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
  ov.onclick = (e) => { if (e.target === ov) close(); };
  document.addEventListener("keydown", onKey, true);
  document.body.appendChild(ov);
  $("#ach-close").onclick = close;
  $("#ach-close").focus();
}
