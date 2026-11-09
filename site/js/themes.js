// Temas de cor: lista, aplicação no <html> e o seletor do cabeçalho.
// As variáveis de cada tema ficam em css/style.css (:root[data-theme="<id>"]).
import { load, save, KEYS } from "./storage.js";

export const THEMES = [
  { id: "verde", name: "Verde", dark: false, bg: "#eaf6ec", ac: "#288446" },
  { id: "azul", name: "Azul", dark: false, bg: "#e8f1fb", ac: "#2a6fc4" },
  { id: "lavanda", name: "Lavanda", dark: false, bg: "#f0ebfa", ac: "#6a49c2" },
  { id: "pessego", name: "Pêssego", dark: false, bg: "#fdf0e6", ac: "#b84d14" },
  { id: "areia", name: "Areia", dark: false, bg: "#f3efe6", ac: "#5c6b3a" },
  { id: "floresta", name: "Floresta", dark: true, bg: "#14231a", ac: "#86d99a" },
  { id: "noite", name: "Noite", dark: true, bg: "#0f1824", ac: "#7db4f5" },
  { id: "grafite", name: "Grafite", dark: true, bg: "#161616", ac: "#f0b24a" },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** Tema salvo; migra os valores antigos ("light"/"dark") e, sem escolha, segue o sistema. */
function savedTheme() {
  let t = load(KEYS.tema, null);
  if (t === "light") t = "verde";
  else if (t === "dark") t = "floresta";
  if (THEMES.some((x) => x.id === t)) return t;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "floresta" : "verde";
}

export function applyTheme(id) {
  const th = THEMES.find((x) => x.id === id) || THEMES[0];
  const root = document.documentElement;
  root.setAttribute("data-theme", th.id);
  root.setAttribute("data-mode", th.dark ? "dark" : "light");
  return th;
}

export function initThemePicker() {
  const btn = document.getElementById("theme-toggle");
  const menu = document.getElementById("theme-menu");
  let current = applyTheme(savedTheme()).id;

  const opt = (t) =>
    `<button class="theme-opt" type="button" data-id="${t.id}" aria-pressed="${t.id === current}">
      <span class="sw" style="--sw-bg:${t.bg};--sw-ac:${t.ac}" aria-hidden="true"></span>${esc(t.name)}</button>`;
  const render = () => {
    menu.innerHTML =
      `<div class="theme-group">Claros</div>${THEMES.filter((t) => !t.dark).map(opt).join("")}` +
      `<div class="theme-group">Escuros</div>${THEMES.filter((t) => t.dark).map(opt).join("")}`;
  };
  const setOpen = (open, focusBtn = false) => {
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) menu.querySelector('[aria-pressed="true"]')?.focus();
    else if (focusBtn) btn.focus();
  };

  render();
  btn.onclick = () => setOpen(menu.hidden);
  menu.addEventListener("click", (e) => {
    const b = e.target.closest(".theme-opt");
    if (!b) return;
    current = applyTheme(b.dataset.id).id;
    save(KEYS.tema, current);
    render();
    menu.querySelector('[aria-pressed="true"]')?.focus(); // mantém o foco no menu
  });
  document.addEventListener("click", (e) => {
    // composedPath() é calculado no disparo: vale mesmo se o botão clicado já foi redesenhado
    const path = e.composedPath();
    if (!menu.hidden && !path.includes(menu) && !path.includes(btn)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) { e.stopPropagation(); setOpen(false, true); }
  }, true);
}
