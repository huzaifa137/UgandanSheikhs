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
     Theme.getAccent()  -> saved accent: "default" | "coral" | "gold" | "blue" | "green"
     Theme.setAccent(n) -> save + apply (re-derived per theme so text stays readable)
   Markup hooks:
     [data-theme-toggle]      button that cycles themes
     [data-theme-set="ocean"] any element that selects a theme (settings picker)
     [data-accent-set="gold"] any element that selects an accent colour (settings picker)
   ===================================================================== */
(function () {
  var KEY = "ac-theme";
  var THEMES = ["ocean", "dark", "light"]; // order used by the toggle button
  var DEFAULT = "ocean";
  var LABELS = { dark: "Emerald Night", ocean: "Royal Blue", light: "Ivory Light", system: "Match system" };
  var CHROME = { dark: "#0C1914", ocean: "#0B2F73", light: "#FFFFFF" }; // mobile browser bar colour
  var root = document.documentElement;

  /* ---------- Accent colour ----------
     "default" = leave the theme's own accent alone. Any other preset overrides the
     accent variables inline on <html> (inline beats the theme stylesheets), derived
     separately for each theme so buttons/links keep readable contrast. */
  var ACCENT_KEY = "ac-accent";
  var ACCENTS = { coral: "#FF5A4E", gold: "#F6B73C", blue: "#5AA9FF", green: "#32C48D" };
  var ACCENT_VARS = ["--accent", "--accent-hover", "--accent-active", "--accent-soft", "--text-on-accent",
                     "--accent-fill", "--accent-rgb", "--accent-lite", "--accent-edge", "--accent-deep"];

  function hex2rgb(h) { h = h.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function rgb2hex(c) { return "#" + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
  function mix(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }   // t=0 -> a, t=1 -> b
  function lum(c) {
    var l = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  // darken `c` just enough that white text on it reaches `min`:1
  function darkenForWhite(c, min) {
    var out = c, i = 0;
    while (contrast(out, [255, 255, 255]) < min && i++ < 40) out = mix(out, [0, 0, 0], 0.06);
    return out;
  }

  function readAccent() {
    var v = null;
    try { v = localStorage.getItem(ACCENT_KEY); } catch (e) {}
    return ACCENTS[v] ? v : "default";
  }
  function applyAccent(theme) {
    var name = readAccent(), st = root.style, WHITE = [255, 255, 255], BLACK = [0, 0, 0];
    ACCENT_VARS.forEach(function (v) { st.removeProperty(v); });
    document.querySelectorAll("[data-accent-set]").forEach(function (el) {
      var on = el.getAttribute("data-accent-set") === name;
      el.classList.toggle("selected", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (name === "default") return;

    var base = hex2rgb(ACCENTS[name]), accent, hover, active, soft, onAccent;
    if (theme === "light") {
      accent = darkenForWhite(base, 4.5);                 // accent doubles as link/text colour on a pale page
      hover = mix(accent, BLACK, 0.14); active = mix(accent, BLACK, 0.28);
      soft = 0.11; onAccent = "#FFFFFF";
    } else {
      accent = base;
      hover = mix(base, WHITE, 0.22); active = mix(base, BLACK, 0.18);
      soft = theme === "ocean" ? 0.20 : 0.15;
      onAccent = contrast(base, WHITE) >= 3.2 ? "#FFFFFF" : "#04150E";   // filled buttons: pick the readable text colour
    }
    st.setProperty("--accent", rgb2hex(accent));
    st.setProperty("--accent-hover", rgb2hex(hover));
    st.setProperty("--accent-active", rgb2hex(active));
    st.setProperty("--accent-soft", "rgba(" + accent.map(Math.round).join(",") + "," + soft + ")");
    st.setProperty("--text-on-accent", onAccent);
    // Royal Blue keeps its glossy gradient buttons (always white text), so derive that too
    var deep = darkenForWhite(base, 4.5);
    st.setProperty("--accent-fill", "linear-gradient(180deg," + rgb2hex(mix(deep, WHITE, 0.08)) + " 0%," + rgb2hex(mix(deep, BLACK, 0.12)) + " 100%)");
    st.setProperty("--accent-deep", rgb2hex(mix(deep, BLACK, 0.12)));
    st.setProperty("--accent-rgb", base.map(Math.round).join(","));
    st.setProperty("--accent-lite", rgb2hex(mix(base, WHITE, 0.6)));
    st.setProperty("--accent-edge", rgb2hex(mix(base, WHITE, 0.35)));
  }
  function setAccent(name) {
    try { localStorage.setItem(ACCENT_KEY, ACCENTS[name] ? name : "default"); } catch (e) {}
    applyAccent(root.getAttribute("data-theme"));
  }

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
    applyAccent(theme);

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
    var acc = e.target.closest && e.target.closest("[data-accent-set]");
    if (acc) { setAccent(acc.getAttribute("data-accent-set")); return; }
    if (e.target.closest && e.target.closest("[data-theme-toggle]")) cycle();
  });
  document.addEventListener("DOMContentLoaded", function () { apply(read()); });
  if (mq) {
    var onSys = function () { if (read() === "system") apply("system"); };
    if (mq.addEventListener) mq.addEventListener("change", onSys); else if (mq.addListener) mq.addListener(onSys);
  }
  // keep several open tabs in step
  window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === ACCENT_KEY) apply(read()); });

  window.Theme = { get: read, set: set, cycle: cycle, labels: LABELS, getAccent: readAccent, setAccent: setAccent, accents: ACCENTS };
})();
