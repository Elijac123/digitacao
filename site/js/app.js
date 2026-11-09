import { initLibrary } from "./library.js";
import { showPractice, hidePractice } from "./practice.js";
import { showLearn, hideLearn } from "./learn.js";
import { showCode, hideCode } from "./code.js";
import { initLibraryView } from "./libraryView.js";
import { load, save, KEYS } from "./storage.js";
import { initThemePicker } from "./themes.js";
import { renderHud } from "./gamify.js";

const VIEWS = {
  praticar: { show: showPractice, hide: hidePractice },
  aprender: { show: showLearn, hide: hideLearn },
  programar: { show: showCode, hide: hideCode },
  biblioteca: { show: initLibraryView, hide() {} },
};
let active = null;

function route() {
  const last = load(KEYS.aba, "praticar");
  const name = VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : VIEWS[last] ? last : "praticar";
  save(KEYS.aba, name);
  if (active && active !== name) VIEWS[active].hide();
  active = name;
  for (const v of Object.keys(VIEWS)) document.getElementById("view-" + v).hidden = v !== name;
  document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("active", a.dataset.tab === name));
  VIEWS[name].show();
}

initThemePicker();
renderHud();
await initLibrary();
window.addEventListener("hashchange", route);
route();
