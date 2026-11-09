// Leitor EPUB mínimo (usa JSZip carregado via <script> no index.html).

function parseXml(str, type = "application/xml") {
  return new DOMParser().parseFromString(str, type);
}

function resolvePath(baseDir, href) {
  const parts = (baseDir + decodeURIComponent(href.split("#")[0])).split("/");
  const out = [];
  for (const p of parts) {
    if (p === "..") out.pop();
    else if (p && p !== ".") out.push(p);
  }
  return out.join("/");
}

function htmlToText(html) {
  let doc = parseXml(html, "application/xhtml+xml");
  if (doc.querySelector("parsererror")) doc = parseXml(html, "text/html");
  const body = doc.querySelector("body");
  if (!body) return "";
  body.querySelectorAll("script,style,nav,svg,head").forEach((n) => n.remove());
  body.querySelectorAll("p,h1,h2,h3,h4,h5,h6,li,div,br,blockquote,tr").forEach((n) => {
    n.appendChild(doc.createTextNode("\n"));
  });
  return body.textContent;
}

const JSZIP_URL = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

// Carrega o JSZip só quando um EPUB é enviado (não bloqueia o resto do site).
function loadJsZip() {
  if (window.JSZip) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = JSZIP_URL;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Não foi possível carregar o leitor de EPUB (verifique a conexão com a internet)."));
    document.head.appendChild(s);
  });
}

export async function parseEpub(arrayBuffer) {
  await loadJsZip();
  const zip = await window.JSZip.loadAsync(arrayBuffer);
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) throw new Error("EPUB inválido (sem container.xml).");
  const container = parseXml(await containerFile.async("string"));
  const opfPath = container.querySelector("rootfile")?.getAttribute("full-path");
  if (!opfPath || !zip.file(opfPath)) throw new Error("EPUB inválido (OPF não encontrado).");

  const opf = parseXml(await zip.file(opfPath).async("string"));
  const baseDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";
  const title = opf.getElementsByTagNameNS("*", "title")[0]?.textContent?.trim() || "";
  const author = opf.getElementsByTagNameNS("*", "creator")[0]?.textContent?.trim() || "";

  const manifest = {};
  for (const item of opf.getElementsByTagNameNS("*", "item")) {
    manifest[item.getAttribute("id")] = { href: item.getAttribute("href"), type: item.getAttribute("media-type") };
  }
  const chunks = [];
  for (const ref of opf.getElementsByTagNameNS("*", "itemref")) {
    const item = manifest[ref.getAttribute("idref")];
    if (!item || !/x?html/.test(item.type || "")) continue;
    const f = zip.file(resolvePath(baseDir, item.href));
    if (!f) continue;
    chunks.push(htmlToText(await f.async("string")));
  }
  return { title, author, text: chunks.join("\n") };
}
