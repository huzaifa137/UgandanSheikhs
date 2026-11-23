/* =====================================================================
   Ugandan Sheikhs — Theme engine
   Three themes:  ocean (Royal Blue, DEFAULT)
                  dark  (Emerald Night)
                  light (Ivory Light)
   plus "system", which follows the device (dark device -> Royal Blue,
   light device -> Ivory Light).

   Loaded in <head> of EVERY page (listener, auth, admin, errors) so the
   chosen theme is applied before first paint — no flash of wrong colours.

   Public API (window.Theme):
     Theme.get()        -> saved preference: "dark" | "ocean" | "light" | "system"
     Theme.set(pref)    -> save + apply
     Theme.cycle()      -> ocean -> dark -> light -> ocean …
   Markup hooks:
     [data-theme-toggle]      button that cycles themes
     [data-theme-set="ocean"] any element that selects a theme (settings picker)
   ===================================================================== */
(function () {
  var KEY = "ac-theme";
  var THEMES = ["ocean", "dark", "light"]; // order used by the toggle button
  var DEFAULT = "ocean";
  var LABELS = { dark: "Emerald Night", ocean: "Royal Blue", light: "Ivory Light", system: "Match system" };
  var CHROME = { dark: "#0C1914", ocean: "#0B2F73", light: "#FFFFFF" }; // mobile browser bar colour
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

  function read() {
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    return THEMES.indexOf(v) > -1 || v === "system" ? v : DEFAULT;
  }
  function resolve(pref) {
    if (pref === "system") return mq && mq.matches ? "light" : "ocean";
    return pref;
  }
  function apply(pref) {
    var theme = resolve(pref);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-theme-pref", pref);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta && document.head) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    if (meta) meta.setAttribute("content", CHROME[theme]);

    // keep any on-page controls in sync (settings picker, toggle tooltip)
    document.querySelectorAll("[data-theme-set]").forEach(function (el) {
      var on = el.getAttribute("data-theme-set") === pref;
      el.classList.toggle("selected", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      el.setAttribute("title", LABELS[theme] + " — click to switch theme");
    });
    var sys = document.getElementById("theme-system-switch");
    if (sys) sys.classList.toggle("on", pref === "system");
  }
  function set(pref) {
    try { localStorage.setItem(KEY, pref); } catch (e) {}
    apply(pref);
  }
  function cycle() {
    var i = THEMES.indexOf(resolve(read()));
    set(THEMES[(i + 1) % THEMES.length]);
  }

  apply(read());

  document.addEventListener("click", function (e) {
    var pick = e.target.closest && e.target.closest("[data-theme-set]");
    if (pick) { set(pick.getAttribute("data-theme-set")); return; }
    if (e.target.closest && e.target.closest("[data-theme-toggle]")) cycle();
  });
  document.addEventListener("DOMContentLoaded", function () { apply(read()); });
  if (mq) {
    var onSys = function () { if (read() === "system") apply("system"); };
    if (mq.addEventListener) mq.addEventListener("change", onSys); else if (mq.addListener) mq.addListener(onSys);
  }
  // keep several open tabs in step
  window.addEventListener("storage", function (e) { if (e.key === KEY) apply(read()); });

  window.Theme = { get: read, set: set, cycle: cycle, labels: LABELS };
})();
