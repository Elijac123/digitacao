// Teclado virtual ABNT2 + mapa de dedos.

export const FINGERS = [
  "mindinho esquerdo", "anelar esquerdo", "médio esquerdo", "indicador esquerdo",
  "indicador direito", "médio direito", "anelar direito", "mindinho direito", "polegar",
];

// [base, shift?]
const ROWS = [
  { keys: [["'", '"'], ["1", "!"], ["2", "@"], ["3", "#"], ["4", "$"], ["5", "%"], ["6", "¨"], ["7", "&"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"]],
    fingers: [0, 0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7, 7], indent: 0 },
  { keys: [["q"], ["w"], ["e"], ["r"], ["t"], ["y"], ["u"], ["i"], ["o"], ["p"], ["´", "`"], ["[", "{"]],
    fingers: [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7, 7], indent: 0.5 },
  { keys: [["a"], ["s"], ["d"], ["f"], ["g"], ["h"], ["j"], ["k"], ["l"], ["ç"], ["~", "^"], ["]", "}"]],
    fingers: [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7, 7], indent: 0.8 },
  { keys: [["\\", "|"], ["z"], ["x"], ["c"], ["v"], ["b"], ["n"], ["m"], [",", "<"], [".", ">"], [";", ":"], ["/", "?"]],
    fingers: [0, 0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7], indent: 0 },
];

// char -> { key, shift, finger }
const MAP = new Map();
for (const row of ROWS) {
  row.keys.forEach(([base, shifted], i) => {
    const finger = row.fingers[i];
    MAP.set(base, { key: base, shift: false, finger });
    if (shifted) MAP.set(shifted, { key: base, shift: true, finger });
    else if (/[a-zç]/.test(base)) MAP.set(base.toUpperCase(), { key: base, shift: true, finger });
  });
}
MAP.set(" ", { key: " ", shift: false, finger: 8 });

const COMBINING = { "́": "´", "̀": "`", "̃": "~", "̂": "^", "̈": "¨" };
const ACCENT_NAME = { "´": "acento agudo", "`": "acento grave (crase)", "~": "til", "^": "circunflexo", "¨": "trema" };

export function fingerName(f) { return FINGERS[f]; }

/** Descreve como digitar um caractere: teclas a destacar e dedo(s). */
export function keysFor(ch) {
  const out = { keys: [], shiftSide: null, parts: [] };
  if (!ch) return out;
  const nfd = ch.normalize("NFD");
  const baseCh = nfd[0];
  const accent = nfd.length > 1 ? COMBINING[nfd[1]] : null;
  const base = MAP.get(baseCh);
  if (!base) return out;

  const side = (finger) => (finger <= 3 ? "R" : "L"); // shift da mão oposta
  if (accent) {
    const a = MAP.get(accent);
    out.keys.push(a.key);
    out.parts.push({ label: ACCENT_NAME[accent], finger: a.finger });
    if (a.shift) out.shiftSide = side(a.finger);
  }
  out.keys.push(base.key);
  out.parts.push({ label: baseCh === " " ? "espaço" : baseCh, finger: base.finger });
  if (base.shift) out.shiftSide = out.shiftSide || side(base.finger);
  if (out.shiftSide) out.keys.push(out.shiftSide === "L" ? "ShiftL" : "ShiftR");
  return out;
}

export function describe(ch) {
  const info = keysFor(ch);
  if (!info.parts.length) return "";
  const txt = info.parts.map((p) => `<b>${escapeHtml(p.label)}</b> → ${FINGERS[p.finger]}`).join(" · ");
  const shift = info.shiftSide ? ` · <b>Shift</b> → ${info.shiftSide === "L" ? "mindinho esquerdo" : "mindinho direito"}` : "";
  return txt + shift;
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

export function renderKeyboard(container) {
  container.innerHTML = "";
  container.classList.add("keyboard");
  const mk = (cls, label, shifted, key) => {
    const el = document.createElement("div");
    el.className = "kb-key " + cls;
    if (key !== undefined) el.dataset.k = key;
    if (shifted) {
      const s = document.createElement("small");
      s.textContent = shifted;
      el.appendChild(s);
    }
    el.appendChild(document.createTextNode(label));
    return el;
  };
  ROWS.forEach((row, ri) => {
    const r = document.createElement("div");
    r.className = "kb-row";
    if (row.indent) {
      const sp = mk("spacer", "", null);
      sp.style.width = `calc(var(--kw) * ${row.indent})`;
      r.appendChild(sp);
    }
    if (ri === 3) r.appendChild(mk("wide f0", "⇧", null, "ShiftL"));
    row.keys.forEach(([base, shifted], i) => {
      const label = /[a-zç]/.test(base) ? base.toUpperCase() : base;
      const el = mk("f" + row.fingers[i], label, shifted, base);
      if (ri === 2 && (base === "f" || base === "j")) el.classList.add("home");
      r.appendChild(el);
    });
    if (ri === 3) r.appendChild(mk("wide f7", "⇧", null, "ShiftR"));
    container.appendChild(r);
  });
  const sp = document.createElement("div");
  sp.className = "kb-row";
  sp.appendChild(mk("space f8", "espaço", null, " "));
  container.appendChild(sp);

  const legend = document.createElement("div");
  legend.className = "kb-legend";
  legend.innerHTML = FINGERS.map((n, i) => `<span><i style="background:var(--f${i})"></i>${n}</span>`).join("");
  container.parentNode?.insertBefore(legend, container.nextSibling);
  return legend;
}

/** Destaca as teclas para o caractere `ch`. */
export function highlight(container, ch) {
  container.querySelectorAll(".kb-key.target").forEach((k) => k.classList.remove("target"));
  if (!ch) return;
  const info = keysFor(ch);
  for (const k of info.keys) {
    const el = container.querySelector(`.kb-key[data-k="${CSS.escape(k)}"]`);
    if (el) el.classList.add("target");
  }
}
