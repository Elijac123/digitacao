// Aba Biblioteca: upload e listas de livros.
import { load, save, KEYS } from "./storage.js";
import { askText, askConfirm } from "./dialog.js";
import { listBase, listMine, listAll, baseUnavailable, addFromFile, removeBook, getPos, getLists, createList, renameList, deleteList, setListBooks, toggleInList, libraryEvents } from "./library.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let initialized = false;

function bookRow(b, removable, inList, noList) {
  const info = [b.author, b.note, b.chars ? `${Math.round(b.chars / 1000)} mil caracteres` : ""].filter(Boolean).join(" · ");
  return `<li data-id="${b.id}">
    <label class="pick"><input type="checkbox" data-pick="${b.id}"${inList.has(b.id) ? " checked" : ""}${noList ? " disabled" : ""}><span class="sr-only">Incluir "${esc(b.title)}" na lista em edição</span></label>
    <div class="grow"><div class="title">${esc(b.title)}</div><div class="meta">${esc(info)}${getPos(b.id) ? " · já iniciado" : ""}</div></div>
    <div class="row-actions">
      <a class="btn primary" href="#praticar" data-practice="${b.id}">Praticar</a>
      ${removable ? `<button class="btn" data-remove="${b.id}">Remover</button>` : ""}
    </div></li>`;
}

function activeList(lists) {
  const id = load(KEYS.listaAtiva, null);
  return lists.find((l) => l.id === id) || lists[0] || null;
}

function render() {
  const base = listBase(), mine = listMine();
  const lists = getLists(), cur = activeList(lists);
  const inList = new Set(cur?.books ?? []);
  $("#sel-list").innerHTML = lists.length
    ? lists.map((l) => `<option class="opt-list" style="font-weight:700" value="${l.id}"${l.id === cur.id ? " selected" : ""}>${esc(l.name)} (${l.books.length})</option>`).join("")
    : `<option value="">(nenhuma lista — crie uma)</option>`;
  $("#sel-list").disabled = !lists.length;
  for (const id of ["#btn-list-rename", "#btn-list-delete", "#btn-list-all", "#btn-list-clear"]) $(id).hidden = !cur;
  $("#btn-list-practice").hidden = !cur?.books.length;
  $("#list-count").textContent = cur
    ? `${cur.books.length} ${cur.books.length === 1 ? "livro" : "livros"} em "${cur.name}"`
    : "Crie uma lista para marcar livros.";
  const row = (b, removable) => bookRow(b, removable, inList, !cur);
  $("#list-base").innerHTML = base.length
    ? base.map((b) => row(b, false)).join("")
    : `<li class="muted">${baseUnavailable() ? "Livros base indisponíveis — abra o site por um servidor (ex.: <code>python -m http.server</code>), não direto do arquivo." : ""}</li>`;
  $("#list-mine").innerHTML = mine.length
    ? mine.map((b) => row(b, true)).join("")
    : `<li class="muted">Você ainda não enviou nenhum livro.</li>`;
}

async function handleFiles(files) {
  const msg = $("#upload-msg");
  const ok = [], err = [];
  for (const f of files) {
    msg.textContent = `Processando ${f.name}…`;
    try { ok.push((await addFromFile(f)).title); } catch (e) { err.push(e.message); }
  }
  msg.textContent = [ok.length ? `Adicionado: ${ok.join(", ")}.` : "", ...err].filter(Boolean).join(" ");
}

export function initLibraryView() {
  render();
  if (initialized) return;
  initialized = true;
  const input = $("#file-input"), dz = $("#dropzone");
  input.onchange = async () => { await handleFiles([...input.files]); input.value = ""; };
  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("over"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("over"));
  dz.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("over"); handleFiles([...e.dataTransfer.files]); });
  libraryEvents.addEventListener("change", render);
  const cur = () => activeList(getLists());
  const setActive = (id) => { save(KEYS.listaAtiva, id); render(); };
  $("#sel-list").onchange = (e) => setActive(e.target.value);
  $("#btn-list-new").onclick = async () => {
    const name = await askText({ title: "Nova lista", label: "Nome da lista", ok: "Criar" });
    const id = name && createList(name);
    if (id) setActive(id);
  };
  $("#btn-list-rename").onclick = async () => {
    const l = cur();
    const name = l && (await askText({ title: "Renomear lista", label: "Novo nome", value: l.name }));
    if (name) renameList(l.id, name);
  };
  $("#btn-list-delete").onclick = async () => {
    const l = cur();
    if (l && (await askConfirm({ title: "Excluir lista", message: `Excluir a lista "${l.name}"? Os livros não são apagados.`, ok: "Excluir", danger: true }))) deleteList(l.id);
  };
  $("#btn-list-all").onclick = () => { const l = cur(); if (l) setListBooks(l.id, listAll().map((b) => b.id)); };
  $("#btn-list-clear").onclick = () => { const l = cur(); if (l) setListBooks(l.id, []); };
  $("#btn-list-practice").onclick = () => {
    const l = cur();
    if (!l) return;
    save(KEYS.prefs, { ...load(KEYS.prefs, {}), book: "__lista__:" + l.id });
    location.hash = "#praticar";
  };
  $("#view-biblioteca").addEventListener("change", (e) => {
    const p = e.target.closest("[data-pick]");
    const l = cur();
    if (!p || !l) return;
    toggleInList(l.id, p.dataset.pick, p.checked);
    document.querySelector(`[data-pick="${CSS.escape(p.dataset.pick)}"]`)?.focus(); // a lista é redesenhada: devolve o foco
  });
  $("#view-biblioteca").addEventListener("click", async (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm && (await askConfirm({ title: "Remover livro", message: "Remover este livro da sua biblioteca?", ok: "Remover", danger: true }))) await removeBook(rm.dataset.remove);
    const pr = e.target.closest("[data-practice]");
    if (pr) save(KEYS.prefs, { ...load(KEYS.prefs, {}), book: pr.dataset.practice });
  });
}
