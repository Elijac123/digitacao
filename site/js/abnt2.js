// Converte qualquer texto para caracteres que existem no teclado ABNT2.

const MAP = {
  // travessões, hífens e traços
  "—": "-", "–": "-", "―": "-", "‒": "-", "−": "-", "‐": "-", "‑": "-", "­": "",
  // aspas
  "“": '"', "”": '"', "„": '"', "‟": '"', "«": '"', "»": '"', "″": '"', "❝": '"', "❞": '"',
  "‘": "'", "’": "'", "‚": "'", "‛": "'", "′": "'", "‹": "'", "›": "'",
  // reticências, marcadores e símbolos
  "…": "...", "•": "-", "·": "-", "‣": "-", "◦": "-", "∙": "-", "×": "x", "÷": "/",
  "©": "(c)", "®": "(R)", "™": "TM", "€": "EUR", "¥": "JPY", "£": "GBP", "¢": "c",
  "§": "S", "¶": "P", "°": "o", "º": "o", "ª": "a", "¬": "!", "¿": "?", "¡": "!",
  "½": "1/2", "¼": "1/4", "¾": "3/4", "²": "2", "³": "3", "¹": "1",
  "←": "<-", "→": "->", "⇒": "=>", "≤": "<=", "≥": ">=", "≠": "!=", "≈": "~",
  // letras sem equivalente direto
  "œ": "oe", "Œ": "OE", "æ": "ae", "Æ": "AE", "ß": "ss", "ø": "o", "Ø": "O", "ð": "d", "þ": "th",
  "ſ": "s", "ı": "i", "ł": "l", "Ł": "L", "đ": "d", "Đ": "D",
  // espaços e controles
  " ": " ", " ": " ", " ": " ", " ": " ", " ": " ", " ": " ",
  " ": " ", " ": " ", " ": " ", " ": " ", " ": " ", " ": " ", "　": " ",
  "​": "", "‌": "", "‍": "", "⁠": "", "﻿": "", "\t": " ", "\n": " ", "\r": " ",
};

// Letras do português mantidas no texto-alvo: acentos agudo, grave, til, circunflexo + ç.
// Trema NÃO é mantido: ü/ä/ë/ï/ö/ÿ (e maiúsculas) viram a letra sem trema (ver toAbnt2).
const OK_LETTERS = "áéíóúÁÉÍÓÚàÀâêôÂÊÔãõÃÕçÇ";
const OK_ASCII = /[\x20-\x7e]/;

function isAllowed(ch) {
  return OK_ASCII.test(ch) || OK_LETTERS.includes(ch);
}

export function toAbnt2(text) {
  let out = "";
  for (const ch of text.normalize("NFC")) {
    if (isAllowed(ch)) { out += ch; continue; }
    if (ch in MAP) { out += MAP[ch]; continue; }
    // decompõe (ex.: ñ → n, ė → e) e mantém só o que existe no teclado
    const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (base && [...base].every(isAllowed)) { out += base; continue; }
    // desconhecido (outro alfabeto, emoji…): descarta
  }
  return out.replace(/ {2,}/g, " ").trim();
}
