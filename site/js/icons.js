// Sem pictogramas (nada de ícones/emoji): a nota por estrelas é feita com marcas geométricas em CSS (.pip).
export function starsHtml(n, total = 3) {
  let s = "";
  for (let i = 0; i < total; i++) s += `<span class="pip ${i < n ? "on" : "off"}"></span>`;
  return `<span class="stars" role="img" aria-label="${n} de ${total} estrelas">${s}</span>`;
}
