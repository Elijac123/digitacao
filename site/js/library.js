// Biblioteca: livros base (livros/index.json) + livros do usuário (IndexedDB).
import { load, save, KEYS } from "./storage.js";
import { parseEpub } from "./epub.js";

export const libraryEvents = new EventTarget();
const emit = () => libraryEvents.dispatchEvent(new Event("change"));

const DB_NAME = "digitando";
const STORE = "books";
let dbPromise;

function openDb() {
  dbPromise ||= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

let baseBooks = [];
let userBooks = []; // metadados (sem o texto)
const textCache = new Map();

export async function initLibrary() {
  // Sem await: em alguns navegadores a promessa pode ficar pendente (pedido de permissão).
  try { navigator.storage?.persist?.(); } catch { /* ignora */ }
  try {
    const res = await fetch("livros/index.json");
    baseBooks = res.ok ? (await res.json()).map((b) => ({ ...b, base: true })) : [];
  } catch {
    baseBooks = []; // ex.: aberto via file://
  }
  try {
    const all = (await tx("readonly", (s) => s.getAll())) || [];
    userBooks = all.map(({ text, ...meta }) => ({ ...meta, base: false, chars: text.length }));
  } catch {
    userBooks = [];
  }
  emit();
}

export const listBase = () => baseBooks;
export const listMine = () => userBooks;
export const listAll = () => [...baseBooks, ...userBooks];
export const baseUnavailable = () => baseBooks.length === 0;

export async function getText(id) {
  if (textCache.has(id)) return textCache.get(id);
  let text;
  const base = baseBooks.find((b) => b.id === id);
  if (base) {
    const res = await fetch("livros/" + base.file);
    text = decode(await res.arrayBuffer());
  } else {
    text = (await tx("readonly", (s) => s.get(id)))?.text;
  }
  if (text == null) throw new Error("Livro não encontrado.");
  textCache.set(id, text);
  return text;
}

export async function removeBook(id) {
  await tx("readwrite", (s) => s.delete(id));
  userBooks = userBooks.filter((b) => b.id !== id);
  textCache.delete(id);
  const pos = load(KEYS.pos, {});
  delete pos[id];
  save(KEYS.pos, pos);
  emit();
}

export const getPos = (id) => load(KEYS.pos, {})[id] || 0;
export function setPos(id, idx) {
  const pos = load(KEYS.pos, {});
  pos[id] = idx;
  save(KEYS.pos, pos);
}

function decode(buf) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, "");
  } catch {
    return new TextDecoder("windows-1252").decode(buf);
  }
}

function stripGutenberg(text) {
  const start = text.match(/\*\*\* ?START OF (?:THE|THIS) PROJECT GUTENBERG[^\n]*\n/i);
  if (start) text = text.slice(start.index + start[0].length);
  const end = text.search(/\*\*\* ?END OF (?:THE|THIS) PROJECT GUTENBERG/i);
  if (end > -1) text = text.slice(0, end);
  return text;
}

/** Envia um arquivo .txt/.epub; devolve o livro salvo. */
export async function addFromFile(file) {
  const name = file.name.replace(/\.[^.]+$/, "");
  const buf = await file.arrayBuffer();
  let title = name, author = "", text;
  if (/\.epub$/i.test(file.name)) {
    const r = await parseEpub(buf);
    text = r.text;
    title = r.title || name;
    author = r.author;
  } else if (/\.txt$/i.test(file.name) || file.type === "text/plain") {
    text = stripGutenberg(decode(buf));
  } else {
    throw new Error(`Formato não suportado: ${file.name}. Use .txt ou .epub.`);
  }
  text = text.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t ]+/g, " ").trim();
  if (text.length < 200) throw new Error(`"${file.name}" tem pouco texto utilizável.`);
  const book = { id: crypto.randomUUID(), title, author, added: Date.now(), text };
  await tx("readwrite", (s) => s.put(book));
  const { text: _t, ...meta } = book;
  userBooks.push({ ...meta, base: false, chars: text.length });
  textCache.set(book.id, text);
  emit();
  return meta;
}
