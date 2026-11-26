/* =====================================================================
   Ugandan Sheikhs — Show / hide password
   Adds an eye button inside every <input type="password"> on the page.
   Loaded (deferred) by every page that has a password field, so a new
   password input anywhere — even one added later by script — gets it too.
   Opt out for a single field with data-no-toggle.
   ===================================================================== */
(function () {
  var EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.4 10.4 0 0 1 12 19C5.6 19 2 12 2 12a18.3 18.3 0 0 1 5.1-5.9"/><path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M2 2l20 20"/></svg>';

  function enhance(input) {
    if (input.dataset.pwReady || input.hasAttribute("data-no-toggle")) return;
    input.dataset.pwReady = "1";

    var wrap = document.createElement("div");
    wrap.className = "pw-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pw-toggle";
    btn.innerHTML = EYE;
    function sync(visible) {
      btn.innerHTML = visible ? EYE_OFF : EYE;
      btn.setAttribute("aria-label", visible ? "Hide password" : "Show password");
      btn.setAttribute("title", visible ? "Hide password" : "Show password");
      btn.setAttribute("aria-pressed", visible ? "true" : "false");
    }
    sync(false);
    // keep focus (and the caret) in the field when the eye is pressed
    btn.addEventListener("mousedown", function (e) { e.preventDefault(); });
    btn.addEventListener("click", function () {
      var show = input.type === "password";
      var start = input.selectionStart, end = input.selectionEnd;
      input.type = show ? "text" : "password";
      sync(show);
      try { input.focus(); input.setSelectionRange(start, end); } catch (e) {}
    });
    wrap.appendChild(btn);
  }

  function scan(root) {
    (root || document).querySelectorAll('input[type="password"]').forEach(enhance);
  }

  function start() {
    scan();
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType !== 1) return;
            if (n.matches && n.matches('input[type="password"]')) enhance(n); else scan(n);
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
