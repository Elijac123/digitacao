// Motor de digitação compartilhado por Praticar e Aprender.

/** Monta o cartão de digitação e devolve referências aos elementos. */
export function buildTypingCard(container, { hint = "" } = {}) {
  container.innerHTML = `
    <div class="typing-card">
      <div class="typing-meta">
        <span class="t-title"></span>
        <span class="live">
          <span>WPM <b class="t-wpm">0</b></span>
          <span>Precisão <b class="t-acc">100%</b></span>
          <span>Tempo <b class="t-time">0:00</b></span>
        </span>
      </div>
      <div class="typing-display blurred" tabindex="-1"></div>
      <textarea class="typing-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Área de digitação"></textarea>
      <div class="typing-hint">${hint}</div>
      <div class="typing-echo" aria-hidden="true"><span class="echo-label">Palavra que você está digitando</span><div class="echo-text"></div></div>
    </div>`;
  const q = (s) => container.querySelector(s);
  return {
    title: q(".t-title"), wpm: q(".t-wpm"), acc: q(".t-acc"), time: q(".t-time"),
    display: q(".typing-display"), echo: q(".echo-text"), input: q(".typing-input"), hint: q(".typing-hint"),
  };
}

export function fmtTime(sec) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export class Typer {
  /**
   * @param {object} o
   * @param {object} o.ui  refs de buildTypingCard
   * @param {string} o.text texto-alvo
   * @param {(stats)=>void} [o.onProgress]  a cada tecla (inclui typed.length)
   * @param {(stats)=>void} [o.onDone]
   * @param {()=>void} [o.onEscape]
   * @param {boolean} [o.multiline] modo código: Enter quebra a linha e a indentação seguinte é preenchida sozinha
   */
  constructor({ ui, text, onProgress, onDone, onEscape, multiline = false }) {
    this.ui = ui;
    this.text = text.normalize("NFC");
    this.onProgress = onProgress;
    this.onDone = onDone;
    this.onEscape = onEscape;
    this.multiline = multiline;
    this.autoChars = 0; // caracteres de indentação preenchidos automaticamente (não contam no WPM)
    this.typed = "";
    this.lockIdx = 0; // início da palavra atual: o que ficou antes (palavra certa + espaço) não pode ser apagado
    this.startTime = 0;
    this.endTime = 0;
    this.keystrokes = 0;
    this.errors = 0;
    this.errMap = {};
    this.done = false;
    this.composing = false;
    this._bind();
    this._buildSpans();
    this.render();
    this._timer = setInterval(() => this._tick(), 200);
  }

  _bind() {
    const { input, display } = this.ui;
    input.value = "";
    this._h = {
      input: (e) => { if (!e.isComposing && !this.composing) this.handle(input.value); },
      compStart: () => { this.composing = true; },
      compEnd: () => { this.composing = false; setTimeout(() => this.handle(input.value), 0); },
      keydown: (e) => {
        if (e.key === "Escape") { e.preventDefault(); this.onEscape?.(); return; }
        if (e.key === "Backspace" && this.typed.length <= this.lockIdx) { e.preventDefault(); return; }
        if (e.key === "Enter" && this.multiline) return; // código: Enter quebra a linha
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Enter", "Tab", "Delete"].includes(e.key)) e.preventDefault();
        if ((e.ctrlKey || e.metaKey) && ["a", "z", "y", "x", "v"].includes(e.key.toLowerCase())) e.preventDefault();
      },
      block: (e) => e.preventDefault(),
      focus: () => display.classList.remove("blurred"),
      blur: () => display.classList.add("blurred"),
      clickDisplay: () => this.focus(),
      caret: () => { const n = input.value.length; input.setSelectionRange(n, n); },
    };
    const h = this._h;
    input.addEventListener("input", h.input);
    input.addEventListener("compositionstart", h.compStart);
    input.addEventListener("compositionend", h.compEnd);
    input.addEventListener("keydown", h.keydown);
    for (const ev of ["paste", "cut", "drop"]) input.addEventListener(ev, h.block);
    input.addEventListener("focus", h.focus);
    input.addEventListener("blur", h.blur);
    input.addEventListener("select", h.caret);
    display.addEventListener("click", h.clickDisplay);
  }

  _buildSpans() {
    const d = this.ui.display;
    d.textContent = "";
    this.spans = [];
    const frag = document.createDocumentFragment();
    for (const c of this.text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      if (c === "\n") s.dataset.nl = "1"; // CSS desenha a marca de fim de linha
      this.spans.push(s);
      frag.appendChild(s);
    }
    d.appendChild(frag);
  }

  focus() { this.ui.input.focus({ preventScroll: true }); }

  handle(value) {
    if (this.done) return;
    let fixed = false;
    if (value.length > this.text.length) { value = value.slice(0, this.text.length); fixed = true; }
    value = value.normalize("NFC");
    // palavra já confirmada (certa + espaço) é intocável: desfaz qualquer apagamento além da trava
    const lock = this.lockIdx;
    if (value.length < lock || value.slice(0, lock) !== this.typed.slice(0, lock)) {
      value = this.typed.slice(0, lock) + (value.length > lock ? value.slice(lock) : "");
      fixed = true;
    }
    if (fixed && value !== this.ui.input.value) {
      this.ui.input.value = value;
      this.ui.input.setSelectionRange(value.length, value.length);
    }
    if (value === this.typed) return;
    if (!this.startTime && value.length > 0) this.startTime = performance.now();
    if (value.length > this.typed.length) {
      for (let i = this.typed.length; i < value.length; i++) {
        this.keystrokes++;
        if (value[i] !== this.text[i]) {
          this.errors++;
          const t = this.text[i];
          this.errMap[t] = (this.errMap[t] || 0) + 1;
        }
      }
    }
    const prevLen = this.typed.length;
    this.typed = value;
    this._autoIndent(prevLen);
    this._advanceLock();
    this.render();
    const st = this.stats();
    this.onProgress?.(st);
    if (this.typed === this.text) this.finish(); // só termina com tudo certo; com erro, corrija com Backspace
  }

  /** Modo código: ao digitar um Enter certo, preenche a indentação da próxima linha (não conta no WPM nem na precisão). */
  _autoIndent(prevLen) {
    if (!this.multiline || this.typed.length <= prevLen || !this.typed.endsWith("\n")) return;
    if (this._firstError() >= 0) return;
    const ind = /^[ \t]+/.exec(this.text.slice(this.typed.length));
    if (!ind) return;
    this.typed += ind[0];
    this.autoChars += ind[0].length;
    this.ui.input.value = this.typed;
    this.ui.input.setSelectionRange(this.typed.length, this.typed.length);
  }

  /** Índice do primeiro caractere errado (-1 se não há erro). Tudo a partir dele conta como errado. */
  _firstError() {
    const t = this.typed;
    for (let i = 0; i < t.length; i++) if (t[i] !== this.text[i]) return i;
    return -1;
  }

  /** Ao completar uma palavra correta seguida de espaço, trava o apagamento até ali. */
  _advanceLock() {
    for (let i = this.lockIdx; i < this.typed.length; i++) {
      if (this.typed[i] !== this.text[i]) return;
      if (this.text[i] === " " || (this.multiline && this.text[i] === "\n")) this.lockIdx = i + 1;
    }
  }

  render() {
    const t = this.typed;
    const f = this._firstError();
    for (let i = 0; i < this.spans.length; i++) {
      const s = this.spans[i];
      let cls = "ch";
      if (i < t.length) cls += f < 0 || i < f ? " ok" : " bad"; // após o 1º erro, tudo fica errado
      else if (i === t.length) cls += " cur"; // posição atual: barra | piscando
      if (s.className !== cls) s.className = cls;
    }
    this._renderEcho(t, f);
    const cur = this.spans[t.length];
    if (cur && cur.offsetTop > this.ui.display.clientHeight + this.ui.display.scrollTop - 40) cur.scrollIntoView({ block: "nearest" });
  }

  /** Caixa abaixo do texto: mostra só a palavra que está sendo digitada (esvazia ao fechar a palavra com espaço);
   *  do 1º erro em diante, em vermelho (como no texto-alvo). */
  _renderEcho(t, f) {
    const echo = this.ui.echo;
    if (!echo) return;
    const ws = Math.max(t.lastIndexOf(" "), t.lastIndexOf("\n")) + 1; // início da palavra atual
    const word = t.slice(ws);
    const split = f < 0 ? word.length : Math.max(0, Math.min(word.length, f - ws));
    echo.replaceChildren(document.createTextNode(word.slice(0, split)));
    if (split < word.length) {
      const b = document.createElement("span");
      b.className = "bad";
      b.textContent = word.slice(split);
      echo.append(b);
    }
    echo.classList.toggle("empty", !t);
    // a caixa fica abaixo da dica, muitas vezes fora da tela: ao digitar, rola só o suficiente para ela aparecer
    if (t) echo.closest(".typing-echo").scrollIntoView({ block: "nearest" });
  }

  stats() {
    const end = this.endTime || performance.now();
    const elapsed = this.startTime ? Math.max((end - this.startTime) / 1000, 0.001) : 0;
    const f = this._firstError();
    const correct = Math.max(0, (f < 0 ? this.typed.length : f) - this.autoChars); // só antes do 1º erro; sem a indentação automática
    const wpm = elapsed > 1 ? (correct / 5) / (elapsed / 60) : 0;
    const acc = this.keystrokes ? ((this.keystrokes - this.errors) / this.keystrokes) * 100 : 100;
    return {
      wpm, acc, elapsed, correct, typedLength: this.typed.length, length: this.text.length,
      errors: this.errors, keystrokes: this.keystrokes, errMap: this.errMap, done: this.done,
      next: this.text[this.typed.length] || "",
    };
  }

  _tick() {
    if (this.done) return;
    const st = this.stats();
    this.ui.wpm.textContent = Math.round(st.wpm);
    this.ui.acc.textContent = Math.round(st.acc) + "%";
    this.ui.time.textContent = fmtTime(st.elapsed);
  }

  finish() {
    this.done = true;
    this.endTime = performance.now();
    clearInterval(this._timer);
    const st = this.stats();
    st.done = true;
    this.ui.wpm.textContent = Math.round(st.wpm);
    this.ui.acc.textContent = Math.round(st.acc) + "%";
    this.ui.time.textContent = fmtTime(st.elapsed);
    this.ui.input.blur();
    this.onDone?.(st);
  }

  destroy() {
    clearInterval(this._timer);
    const { input, display } = this.ui;
    const h = this._h;
    input.removeEventListener("input", h.input);
    input.removeEventListener("compositionstart", h.compStart);
    input.removeEventListener("compositionend", h.compEnd);
    input.removeEventListener("keydown", h.keydown);
    for (const ev of ["paste", "cut", "drop"]) input.removeEventListener(ev, h.block);
    input.removeEventListener("focus", h.focus);
    input.removeEventListener("blur", h.blur);
    input.removeEventListener("select", h.caret);
    display.removeEventListener("click", h.clickDisplay);
  }
}
