// Janelas do próprio site (no lugar de prompt/confirm do navegador): usam .modal-overlay/.modal.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function open({ title, body, ok, cancel = "Cancelar", field = false, danger = false }) {
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const ov = document.createElement("div");
    ov.className = "modal-overlay";
    ov.innerHTML = `<form class="modal" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <h2 id="dlg-title">${esc(title)}</h2>${body}
      <div class="actions"><button class="btn primary${danger ? " danger" : ""}" type="submit">${esc(ok)}</button><button class="btn" type="button" data-cancel>${esc(cancel)}</button></div>
    </form>`;
    const input = ov.querySelector("input");
    const close = (v) => {
      ov.remove();
      document.removeEventListener("keydown", onKey, true);
      prev?.focus?.();
      resolve(v);
    };
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); close(null); } };
    ov.addEventListener("submit", (e) => { e.preventDefault(); close(field ? input.value.trim() || null : true); });
    ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest("[data-cancel]")) close(null); });
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(ov);
    (input || ov.querySelector("button")).focus();
    input?.select();
  });
}

/** Pede um texto. Devolve o texto (sem espaços nas pontas) ou null se cancelar/vazio. */
export function askText({ title, label, value = "", ok = "Salvar", maxLength = 40 }) {
  return open({
    title, ok, field: true,
    body: `<label class="dlg-field">${esc(label)}<input type="text" maxlength="${maxLength}" value="${esc(value)}" autocomplete="off"></label>`,
  });
}

/** Pede confirmação. Devolve true ou null. */
export function askConfirm({ title, message, ok = "Confirmar", danger = false }) {
  return open({ title, ok, danger, body: `<p>${esc(message)}</p>` });
}
