// Aba Biblioteca: upload e listas de livros.
import { load, save, KEYS } from "./storage.js";
import { listBase, listMine, baseUnavailable, addFromFile, removeBook, getPos, libraryEvents } from "./library.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let initialized = false;

function bookRow(b, removable) {
  const info = [b.author, b.note, b.chars ? `${Math.round(b.chars / 1000)} mil caracteres` : ""].filter(Boolean).join(" · ");
  return `<li data-id="${b.id}">
    <div><div class="title">${esc(b.title)}</div><div class="meta">${esc(info)}${getPos(b.id) ? " · já iniciado" : ""}</div></div>
    <div class="row-actions">
      <a class="btn primary" href="#praticar" data-practice="${b.id}">Praticar</a>
      ${removable ? `<button class="btn" data-remove="${b.id}">Remover</button>` : ""}
    </div></li>`;
}

function render() {
  const base = listBase(), mine = listMine();
  $("#list-base").innerHTML = base.length
    ? base.map((b) => bookRow(b, false)).join("")
    : `<li class="muted">${baseUnavailable() ? "Livros base indisponíveis — abra o site por um servidor (ex.: <code>python -m http.server</code>), não direto do arquivo." : ""}</li>`;
  $("#list-mine").innerHTML = mine.length
    ? mine.map((b) => bookRow(b, true)).join("")
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
  $("#view-biblioteca").addEventListener("click", async (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm && confirm("Remover este livro da sua biblioteca?")) await removeBook(rm.dataset.remove);
    const pr = e.target.closest("[data-practice]");
    if (pr) save(KEYS.prefs, { ...load(KEYS.prefs, {}), book: pr.dataset.practice });
  });
}
