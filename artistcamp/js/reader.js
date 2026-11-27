/* =====================================================================
   Ugandan Sheikhs — Book reader (reader.html)
   Continuous-scroll PDF.js view with zoom, page tones, contents, bookmarks, notes, remembered
   position, focus mode and a follow-along bar that links lecture time to book page in both directions.

   Page numbers: the UI and the saved bookmarks/notes use PRINTED page numbers (the ones a sheikh calls out
   in class). PDF page = printed page + book.pageOffset. Reading progress is stored as a PDF page.

   Prototype notes (what changes with Laravel):
   - BookShelf (app.js) is the localStorage stand-in for the book_user_state / bookmarks / notes endpoints.
   - LectureClock below is a simulated timer, because the prototype has no audio files. Swap it for an
     <audio> element: use "timeupdate" instead of the interval and audio.currentTime instead of clock.t.
   ===================================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const root = $("reader");
  const qs = new URLSearchParams(location.search);
  const book = bookById(qs.get("id")) || publishedBooks()[0];

  document.querySelectorAll("[data-ico]").forEach((el) => { el.innerHTML = ICONS[el.dataset.ico] || ""; });

  /* ---------------- State helpers ---------------- */
  const stateBox = $("rd-state");
  function showState(html) { stateBox.innerHTML = `<div class="box">${html}</div>`; stateBox.classList.add("show"); }
  function hideState() { stateBox.classList.remove("show"); stateBox.innerHTML = ""; }

  if (!book || book.status !== "Published") {
    showState(`<h3>This book isn't available</h3><p>It may have been unpublished or the link is wrong.</p><div class="rd-row"><a class="btn btn-primary" href="books.html">Browse books</a></div>`);
    return;
  }

  const OFFSET = book.pageOffset;
  const NUM = book.pages;
  const printedOfPdf = (p) => p - OFFSET;
  const pdfOfPrinted = (n) => n + OFFSET;
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const pageLabel = (printed) => (printed >= 1 ? String(printed) : printed === 0 ? "Cover" : "Front");
  const outline = bookOutline(book);
  const chapterIdx = (printed) => { let hit = -1; outline.forEach((c, i) => { if (c.page <= printed) hit = i; }); return hit; };

  document.title = `${book.title} — Ugandan Sheikhs`;
  $("rd-title").textContent = book.title;
  $("rd-back").href = `book.html?id=${book.id}`;
  $("rd-total").textContent = lastPrintedPage(book);
  $("rd-download").style.display = book.downloadable ? "" : "none";

  /* ---------------- Reader state ---------------- */
  const ZOOMS = [0.6, 0.8, 1, 1.25, 1.5, 2, 2.5];
  let zoomIdx = 2;
  let pdf = null;
  let pages = [];            // { el, ratio, w, rendered, busy, task }
  let tops = [];
  let current = 1;           // PDF page in view
  let ready = false;         // true once the first jump has happened (so progress isn't overwritten)
  let progScrollUntil = 0;   // scrolls before this time were caused by us, not the reader
  let baseRatio = 1.4;
  const scrollEl = $("rd-scroll");
  const pagesEl = $("rd-pages");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------------- Opening the PDF ---------------- */
  const lib = window.pdfjsLib || window["pdfjs-dist/build/pdf"];

  function loadingState(msg) { showState(`<div class="rd-spin"></div><h3>${escapeHTML(msg || "Opening the book…")}</h3><p style="margin:0">${escapeHTML(book.title)} · ${fmtBytes(book.fileSize)}</p>`); }

  function failureState(err) {
    const isFile = location.protocol === "file:";
    const startPdf = clamp(pdfOfPrinted(Number(qs.get("page")) || 1), 1, NUM);
    console.warn("Book failed to open:", err);
    showState(`
      <h3>${isFile ? "Your browser blocked the book file" : "The book couldn't be opened"}</h3>
      <p>${isFile
        ? "This page was opened straight from your computer (<code>file://</code>), and browsers don't let a page read a PDF that way. Nothing is wrong with the book. Choose the PDF yourself, or run the site through a small local server."
        : "The PDF didn't load. Check your connection and try again, or choose the PDF from your device."}</p>
      <div class="rd-row" style="margin-bottom:14px;">
        <label class="btn btn-primary" style="cursor:pointer;">Choose the PDF<input type="file" id="pick-pdf" accept="application/pdf,.pdf" hidden /></label>
        <a class="btn btn-secondary" href="${book.file}#page=${startPdf}" target="_blank" rel="noopener">Open in browser viewer</a>
        ${isFile ? "" : `<button class="btn btn-ghost" id="retry-pdf">Try again</button>`}
      </div>
      ${isFile ? `<p style="font-size:12.5px;margin:0">To run it locally, open a terminal in the <code>artistcamp</code> folder and run <code>python -m http.server 8000</code>, then visit <code>http://localhost:8000/reader.html?id=${book.id}</code>.</p>` : ""}
    `);
    $("pick-pdf")?.addEventListener("change", async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      loadingState("Reading the file…");
      try { await openDocument({ data: new Uint8Array(await f.arrayBuffer()) }); }
      catch (e2) { failureState(e2); }
    });
    $("retry-pdf")?.addEventListener("click", () => start());
  }

  async function openDocument(source) {
    if (!lib) throw new Error("PDF.js did not load");
    lib.GlobalWorkerOptions.workerSrc = `${ASSET_BASE}js/vendor/pdfjs/pdf.worker.min.js`;
    const task = lib.getDocument({ ...source, isEvalSupported: false });
    const doc = await Promise.race([task.promise, new Promise((_, rej) => setTimeout(() => rej(new Error("Timed out opening the PDF")), 30000))]);
    if (pdf) { try { pdf.destroy(); } catch {} }
    pdf = doc;
    // Most scanned books have a cover with its own size, so measure a body page for the default shape
    const sample = await pdf.getPage(Math.min(3, pdf.numPages));
    const vp = sample.getViewport({ scale: 1 });
    baseRatio = vp.height / vp.width;
    buildPages();
    hideState();
    const target = initialPage();
    layout(false);
    goToPdf(target, { instant: true });
    ready = true;
    setCurrent(target, true);
    updateVisible();
  }

  function start() { loadingState(); openDocument({ url: book.file }).catch(failureState); }

  /* ---------------- Page elements, layout, rendering ---------------- */
  function buildPages() {
    pagesEl.innerHTML = "";
    pages = [];
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= pdf.numPages; i++) {
      const el = document.createElement("div");
      el.className = "rd-page";
      el.dataset.p = i;
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", `Page ${pageLabel(printedOfPdf(i))}`);
      el.innerHTML = `<span class="pn">${pageLabel(printedOfPdf(i))}</span>`;
      frag.appendChild(el);
      pages.push({ el, ratio: baseRatio, w: 0, rendered: null, busy: false, task: null });
    }
    pagesEl.appendChild(frag);
  }

  function fitWidth() { return Math.min(Math.max(scrollEl.clientWidth - 24, 260), 880); }

  /* Resize every page for the current zoom, keeping the reader on the same spot */
  function layout(keepAnchor = true) {
    let anchorPage = current, frac = 0;
    if (keepAnchor && tops.length) {
      const h = (pages[current - 1].w * pages[current - 1].ratio) || 1;
      frac = (scrollEl.scrollTop - tops[current - 1]) / h;
    }
    const w = Math.round(fitWidth() * ZOOMS[zoomIdx]);
    pages.forEach((p) => {
      if (p.w !== w) p.rendered = null;       // needs a sharper/softer render at the new size
      p.w = w;
      p.el.style.width = w + "px";
      p.el.style.height = Math.round(w * p.ratio) + "px";
    });
    measure();
    if (keepAnchor && tops.length) {
      progScrollUntil = performance.now() + 400;
      scrollEl.scrollTop = tops[anchorPage - 1] + frac * (pages[anchorPage - 1].w * pages[anchorPage - 1].ratio);
    }
    $("rd-zoom-val").textContent = Math.round(ZOOMS[zoomIdx] * 100) + "%";
    $("rd-zoom-out").disabled = zoomIdx === 0;
    $("rd-zoom-in").disabled = zoomIdx === ZOOMS.length - 1;
  }
  function measure() { tops = pages.map((p) => p.el.offsetTop + pagesEl.offsetTop); }

  async function renderPage(i) {
    const rec = pages[i];
    if (!rec || rec.busy) return;
    const key = rec.w + "|" + dpr;
    if (rec.rendered === key) return;
    rec.busy = true;
    try {
      const page = await pdf.getPage(i + 1);
      const v1 = page.getViewport({ scale: 1 });
      const r = v1.height / v1.width;
      if (Math.abs(r - rec.ratio) > 0.004) setRatio(i, r);
      let scale = (rec.w / v1.width) * dpr;
      if (v1.width * scale > 2200) scale = 2200 / v1.width;      // keep canvases a sane size at high zoom
      const vp = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      rec.task = page.render({ canvasContext: canvas.getContext("2d", { alpha: false }), viewport: vp });
      await rec.task.promise;
      rec.el.querySelector("canvas")?.remove();
      rec.el.insertBefore(canvas, rec.el.firstChild);
      rec.el.querySelector(".pn")?.remove();
      rec.rendered = rec.w + "|" + dpr;
      page.cleanup();
    } catch (e) {
      if (!e || e.name !== "RenderingCancelledException") console.warn("Page", i + 1, "failed to render", e);
    } finally { rec.busy = false; rec.task = null; }
  }

  /* A page turned out to be a different shape than the guess. Resize it, and if it sits above the reader's
     position, shift the scroll by the same amount so the text under their eyes doesn't jump. */
  function setRatio(i, r) {
    const rec = pages[i], oldH = rec.w * rec.ratio;
    rec.ratio = r;
    rec.el.style.height = Math.round(rec.w * r) + "px";
    const delta = Math.round(rec.w * r) - Math.round(oldH);
    measure();
    if (delta && tops[i] + oldH <= scrollEl.scrollTop + 1) { progScrollUntil = performance.now() + 300; scrollEl.scrollTop += delta; }
  }

  function unloadPage(i) {
    const rec = pages[i];
    if (!rec || (!rec.rendered && !rec.busy)) return;
    try { rec.task && rec.task.cancel(); } catch {}
    rec.el.querySelector("canvas")?.remove();
    if (!rec.el.querySelector(".pn")) rec.el.insertAdjacentHTML("afterbegin", `<span class="pn">${pageLabel(printedOfPdf(i + 1))}</span>`);
    rec.rendered = null;
  }

  let queue = [], pumping = false;
  function updateVisible() {
    if (!pages.length) return;
    const top = scrollEl.scrollTop, h = scrollEl.clientHeight, mid = top + h / 2;
    const want = [];
    for (let i = 0; i < pages.length; i++) {
      const t = tops[i], b = t + pages[i].w * pages[i].ratio;
      if (b >= top - h * 1.1 && t <= top + h * 2.1) want.push(i);
      else if (b < top - h * 4 || t > top + h * 5) unloadPage(i);
    }
    queue = want.filter((i) => pages[i].rendered !== pages[i].w + "|" + dpr)
      .sort((a, z) => Math.abs(tops[a] - mid) - Math.abs(tops[z] - mid));
    pump();
  }
  async function pump() {
    if (pumping) return;
    pumping = true;
    while (queue.length) { await renderPage(queue.shift()); }
    pumping = false;
  }

  /* ---------------- Navigation + current page ---------------- */
  function pageFromScroll() {
    const y = scrollEl.scrollTop + scrollEl.clientHeight * 0.3;
    let lo = 0, hi = tops.length - 1, ans = 0;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (tops[m] <= y) { ans = m; lo = m + 1; } else hi = m - 1; }
    return ans + 1;
  }

  function goToPdf(p, { instant = false, flash = false } = {}) {
    p = clamp(Math.round(p), 1, pages.length);
    progScrollUntil = performance.now() + (instant ? 400 : 900);
    scrollEl.scrollTo({ top: Math.max(0, tops[p - 1] - 10), behavior: instant ? "auto" : "smooth" });
    if (flash) { const el = pages[p - 1].el; el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 900); }
    if (instant) setCurrent(p, false);
  }
  const goToPrinted = (n, opts) => goToPdf(pdfOfPrinted(n), opts);
  /* A jump the reader asked for (arrows, page box, contents, bookmarks): it pauses following so the audio
     doesn't snap the book back. Following resumes with the Follow button or "Audio → this page". */
  function userGo(p, opts) { if (lec && following) setFollowing(false); goToPdf(p, opts); }

  function initialPage() {
    const q = Number(qs.get("page"));
    if (q >= 1) return clamp(pdfOfPrinted(q), 1, NUM);
    const lec = lectureFromQuery();
    if (lec) return clamp(pdfOfPrinted(lec.bookRef.from), 1, NUM);
    const saved = BookShelf.progress(book.id);
    return saved ? clamp(saved.page, 1, NUM) : 1;
  }

  let saveTimer = 0;
  function setCurrent(p, force) {
    if (!force && p === current && ready) { refreshMarkUI(); return; }
    current = p;
    const printed = printedOfPdf(p);
    const input = $("rd-page-input");
    if (document.activeElement !== input) input.value = pageLabel(printed);
    const ci = chapterIdx(printed);
    $("rd-chapter").textContent = ci >= 0 ? outline[ci].title : "";
    $("rd-prev").disabled = p <= 1;
    $("rd-next").disabled = p >= pages.length;
    refreshMarkUI();
    highlightToc(ci);
    $("note-add-label").textContent = printed >= 1 ? `Add note · p. ${printed}` : "Add note";
    updateLectureInfo();
    if (ready) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => BookShelf.setProgress(book.id, current), 700);
      try { const u = new URL(location.href); u.searchParams.set("page", printed >= 1 ? printed : 1); history.replaceState(null, "", u); } catch {}
    }
  }

  let scrollRaf = 0;
  scrollEl.addEventListener("scroll", () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      if (!pages.length) return;
      const p = pageFromScroll();
      if (p !== current) {
        // a manual scroll while following the audio pauses following (so the book doesn't fight the reader)
        if (performance.now() > progScrollUntil && lec && following) setFollowing(false);
        setCurrent(p, false);
      }
      updateVisible();
    });
  }, { passive: true });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (pages.length) { layout(true); updateVisible(); } }, 150);
  });
  window.addEventListener("pagehide", () => { if (ready) BookShelf.setProgress(book.id, current); saveClock(); });

  $("rd-prev").addEventListener("click", () => userGo(current - 1));
  $("rd-next").addEventListener("click", () => userGo(current + 1));
  const pageInput = $("rd-page-input");
  pageInput.addEventListener("focus", () => pageInput.select());
  pageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const n = parseInt(pageInput.value.replace(/[^\d-]/g, ""), 10);
      if (Number.isFinite(n)) userGo(pdfOfPrinted(clamp(n, 1 - OFFSET, lastPrintedPage(book))));
      pageInput.blur();
    } else if (e.key === "Escape") { pageInput.value = pageLabel(printedOfPdf(current)); pageInput.blur(); }
  });
  pageInput.addEventListener("blur", () => { pageInput.value = pageLabel(printedOfPdf(current)); });

  /* ---------------- Zoom, tone, panel, focus ---------------- */
  function setZoom(i) { zoomIdx = clamp(i, 0, ZOOMS.length - 1); layout(true); updateVisible(); }
  $("rd-zoom-in").addEventListener("click", () => setZoom(zoomIdx + 1));
  $("rd-zoom-out").addEventListener("click", () => setZoom(zoomIdx - 1));
  $("rd-zoom-reset").addEventListener("click", () => { setZoom(2); closePop(); });

  function setTone(t) {
    root.dataset.tone = t;
    document.querySelectorAll(".rd-tone").forEach((b) => b.setAttribute("aria-pressed", b.dataset.tone === t));
    BookShelf.setPref("tone", t);
  }
  setTone(BookShelf.pref("tone", "light"));
  document.querySelectorAll(".rd-tone").forEach((b) => b.addEventListener("click", () => setTone(b.dataset.tone)));
  const pop = $("rd-pop");
  function closePop() { pop.classList.remove("open"); $("rd-tone-btn").setAttribute("aria-expanded", "false"); }
  $("rd-tone-btn").addEventListener("click", (e) => { e.stopPropagation(); const on = pop.classList.toggle("open"); $("rd-tone-btn").setAttribute("aria-expanded", on); });
  pop.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", (e) => {
    closePop();
    if (!e.target.closest("#rd-tools")) { $("rd-tools").classList.remove("open"); $("rd-more").setAttribute("aria-expanded", "false"); }
  });
  $("rd-more").addEventListener("click", (e) => { e.stopPropagation(); const on = $("rd-tools").classList.toggle("open"); $("rd-more").setAttribute("aria-expanded", on); });

  function setPanel(open) {
    root.dataset.panel = open ? "open" : "closed";
    $("rd-panel-btn").setAttribute("aria-pressed", open);
    $("rd-panel-btn").classList.toggle("on", open);
    setTimeout(() => { if (pages.length) { layout(true); updateVisible(); } }, 30);
  }
  $("rd-panel-btn").addEventListener("click", () => setPanel(root.dataset.panel !== "open"));
  setPanel(window.innerWidth >= 1100);

  function setFocus(on) {
    root.dataset.focus = on ? "on" : "off";
    setTimeout(() => { if (pages.length) { layout(true); updateVisible(); } }, 30);
    if (on) toast("Focus mode · press F or Esc to exit", "info");
  }
  $("rd-focus").addEventListener("click", () => { $("rd-tools").classList.remove("open"); setFocus(true); });
  $("rd-focus-exit").addEventListener("click", () => setFocus(false));

  $("rd-download").addEventListener("click", () => downloadBook(book));
  $("rd-share").addEventListener("click", async () => {
    const printed = printedOfPdf(current);
    const href = `reader.html?id=${book.id}&page=${printed >= 1 ? printed : 1}`;
    const url = new URL(href, location.href).href;
    if (navigator.share && location.protocol !== "file:") {
      try { await navigator.share({ title: `${book.title} — page ${printed}`, url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    copyLink(href);
  });

  /* ---------------- Contents ---------------- */
  const tocList = $("toc-list");
  tocList.innerHTML = outline.map((c, i) => `
    <button type="button" class="toc-item ${c.depth ? "sub" : ""}" data-i="${i}" data-page="${c.page}" data-q="${escapeHTML((c.title + " " + c.titleAr).toLowerCase())}">
      <span class="toc-n">${c.label || ""}</span>
      <span class="toc-t"><span class="en">${escapeHTML(c.title)}</span><span class="ar" lang="ar">${c.titleAr}</span></span>
      <span class="toc-p">p. ${c.page}</span>
    </button>`).join("");
  tocList.addEventListener("click", (e) => {
    const b = e.target.closest(".toc-item");
    if (!b) return;
    userGo(pdfOfPrinted(Number(b.dataset.page)), { flash: true });
    if (window.innerWidth <= 900) setPanel(false);
  });
  $("toc-filter").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    tocList.querySelectorAll(".toc-item").forEach((b) => { b.style.display = !q || b.dataset.q.includes(q) ? "" : "none"; });
  });
  let lastTocIdx = -2;
  function highlightToc(i) {
    if (i === lastTocIdx) return;
    lastTocIdx = i;
    tocList.querySelectorAll(".toc-item.current").forEach((b) => b.classList.remove("current"));
    const b = tocList.querySelector(`.toc-item[data-i="${i}"]`);
    if (b) { b.classList.add("current"); if (root.dataset.panel === "open") b.scrollIntoView({ block: "nearest" }); }
  }

  /* ---------------- Panel tabs ---------------- */
  function showTab(name) {
    document.querySelectorAll(".rd-ptab").forEach((t) => t.classList.toggle("active", t.dataset.ptab === name));
    document.querySelectorAll(".rd-pbody").forEach((b) => { b.hidden = b.dataset.pbody !== name; });
    if (name === "marks") renderMarks();
    if (name === "notes") renderNotes();
    if (name === "listen") renderListen();
  }
  document.querySelectorAll(".rd-ptab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.ptab)));

  /* ---------------- Bookmarks ---------------- */
  function refreshMarkUI() {
    const printed = printedOfPdf(current);
    const on = BookShelf.hasBookmark(book.id, printed);
    const btn = $("rd-mark");
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", on);
    btn.innerHTML = on ? ICONS.bookmarkFill : ICONS.bookmark;
    btn.title = on ? "Remove bookmark (B)" : "Bookmark this page (B)";
    pages.forEach((p, i) => p.el.classList.toggle("marked", BookShelf.hasBookmark(book.id, printedOfPdf(i + 1))));
    $("cnt-marks").textContent = BookShelf.bookmarks(book.id).length;
    $("cnt-notes").textContent = BookShelf.notes(book.id).length;
  }
  function toggleMark() {
    const printed = printedOfPdf(current);
    const on = BookShelf.toggleBookmark(book.id, printed);
    refreshMarkUI();
    toast(on ? `Bookmarked page ${pageLabel(printed)}` : "Bookmark removed", on ? "success" : "info");
    if (!$("marks-list").closest(".rd-pbody").hidden) renderMarks();
  }
  $("rd-mark").addEventListener("click", toggleMark);

  const chapterName = (printed) => { const i = chapterIdx(printed); return i >= 0 ? outline[i].title : "Front matter"; };
  function renderMarks() {
    const list = BookShelf.bookmarks(book.id);
    $("marks-list").innerHTML = list.length ? list.map((m) => `
      <div class="rd-item is-link" data-page="${m.page}">
        <span class="pg">${m.page >= 1 ? "p. " + m.page : "Cover"}</span>
        <div class="main"><div class="t">${escapeHTML(chapterName(m.page))}</div><div class="m">${agoLabel(m.at)}</div></div>
        <button class="icon-btn" data-del-mark="${m.page}" aria-label="Remove bookmark">${ICONS.trash}</button>
      </div>`).join("")
      : emptyStateHTML({ icon: "bookmark", title: "No bookmarks yet", body: "Press the bookmark button (or B) on any page to keep your place.", style: "padding:36px 8px;" });
  }
  $("marks-list").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del-mark]");
    if (del) { e.stopPropagation(); BookShelf.toggleBookmark(book.id, Number(del.dataset.delMark)); refreshMarkUI(); renderMarks(); return; }
    const row = e.target.closest(".rd-item");
    if (row) { userGo(pdfOfPrinted(Number(row.dataset.page)), { flash: true }); if (window.innerWidth <= 900) setPanel(false); }
  });

  /* ---------------- Notes ---------------- */
  function renderNotes() {
    const list = BookShelf.notes(book.id);
    $("notes-list").innerHTML = list.length ? list.map((n) => `
      <div class="rd-item is-link" data-page="${n.page}">
        <span class="pg">${n.page >= 1 ? "p. " + n.page : "Cover"}</span>
        <div class="main"><div class="t">${escapeHTML(n.text)}</div><div class="m">${escapeHTML(chapterName(n.page))} · ${agoLabel(n.at)}</div></div>
        <button class="icon-btn" data-del-note="${n.id}" aria-label="Delete note">${ICONS.trash}</button>
      </div>`).join("")
      : emptyStateHTML({ icon: "note", title: "No notes yet", body: "Write what you learn beside the page it belongs to. Notes stay private to you.", style: "padding:32px 8px;" });
  }
  $("note-add").addEventListener("click", () => {
    const ta = $("note-text"), text = ta.value.trim();
    if (!text) { ta.focus(); return toast("Write something first", "warning"); }
    BookShelf.addNote(book.id, printedOfPdf(current), text);
    ta.value = "";
    refreshMarkUI(); renderNotes();
    toast("Note saved", "success");
  });
  $("notes-list").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del-note]");
    if (del) { e.stopPropagation(); BookShelf.removeNote(book.id, del.dataset.delNote); refreshMarkUI(); renderNotes(); toast("Note deleted", "info"); return; }
    const row = e.target.closest(".rd-item");
    if (row) { userGo(pdfOfPrinted(Number(row.dataset.page)), { flash: true }); if (window.innerWidth <= 900) setPanel(false); }
  });
  $("notes-export").addEventListener("click", () => exportBookNotes(book));
  $("notes-copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(bookNotesMarkdown(book)); toast("Notes copied", "success"); }
    catch { toast("Copy isn't available here, use Export instead", "warning"); }
  });

  /* ---------------- Follow along: lecture time <-> book page ---------------- */
  const lectures = lecturesOfBook(book);
  const SPEEDS = [{ x: 1, label: "1×" }, { x: 2, label: "2×" }, { x: 4, label: "4×" }, { x: 60, label: "60× demo" }];
  let lec = null, following = true, speedIdx = 0, lastFollowPage = null, tick = 0, ticks = 0;
  const clock = { t: 0, playing: false };

  function lectureFromQuery() { const id = qs.get("lecture"); return id ? lectures.find((t) => t.id === id) || null : null; }
  function saveClock() { if (lec) BookShelf.setPref("clock:" + lec.id, Math.round(clock.t)); }

  function renderListen() {
    $("listen-list").innerHTML = lectures.length ? lectures.map((t, i) => `
      <button type="button" class="rd-lec ${lec && lec.id === t.id ? "active" : ""}" data-id="${t.id}">
        <span class="n">${i + 1}</span>
        <span class="tx"><span class="t" style="display:block">${escapeHTML(t.title)}</span><span class="m" style="display:block">${pagesLabel(t.bookRef.from, t.bookRef.to)} · ${fmtDuration(t.duration)} · ${lectureHasExactSync(t) ? "exact sync" : "estimated sync"}</span></span>
      </button>`).join("")
      : emptyStateHTML({ icon: "headphones", title: "No lectures linked yet", body: "When a sheikh's lecture is linked to pages of this book, it appears here so you can follow along.", style: "padding:32px 8px;" });
  }
  $("listen-list").addEventListener("click", (e) => {
    const b = e.target.closest(".rd-lec");
    if (!b) return;
    selectLecture(lectures.find((t) => t.id === b.dataset.id), { jump: true });
    if (window.innerWidth <= 900) setPanel(false);
  });

  function selectLecture(t, { jump }) {
    if (!t) return;
    saveClock();
    stopClock();
    lec = t;
    clock.t = Number(BookShelf.pref("clock:" + t.id, 0)) || 0;
    following = true; lastFollowPage = null;
    root.dataset.lecture = "on";
    $("lec-title").textContent = t.title;
    $("lec-pages").textContent = pagesLabel(t.bookRef.from, t.bookRef.to);
    $("lec-sync").textContent = lectureHasExactSync(t) ? "Exact sync" : "Estimated pages";
    $("lec-scrub").max = t.duration;
    $("lec-dur").textContent = fmtDuration(t.duration);
    setFollowing(true);
    paintClock();
    renderListen();
    if (jump) goToPrinted(clamp(pageAtTime(t, clock.t), 1 - OFFSET, lastPrintedPage(book)), { instant: true });
    if (pages.length) { layout(true); updateVisible(); }
  }
  function closeLecture() {
    saveClock(); stopClock(); lec = null;
    root.dataset.lecture = "off";
    renderListen();
    if (pages.length) { layout(true); updateVisible(); }
  }

  function startClock() {
    if (!lec || clock.playing) return;
    if (clock.t >= lec.duration) clock.t = 0;
    clock.playing = true;
    $("lec-play").innerHTML = ICONS.pause; $("lec-play").setAttribute("aria-label", "Pause lecture");
    tick = setInterval(() => {
      clock.t = Math.min(lec.duration, clock.t + 0.25 * SPEEDS[speedIdx].x);
      if (++ticks % 20 === 0) saveClock();
      paintClock(true);
      if (clock.t >= lec.duration) stopClock();
    }, 250);
  }
  function stopClock() {
    clearInterval(tick);
    if (clock.playing) saveClock();
    clock.playing = false;
    $("lec-play").innerHTML = ICONS.play; $("lec-play").setAttribute("aria-label", "Play lecture");
  }
  function paintClock(fromTick) {
    if (!lec) return;
    $("lec-cur").textContent = fmtDuration(Math.floor(clock.t));
    $("lec-scrub").value = clock.t;
    if (following) {
      const p = pageAtTime(lec, clock.t);
      if (p !== lastFollowPage) {
        lastFollowPage = p;
        const pdfP = clamp(pdfOfPrinted(p), 1, pages.length || NUM);
        if (pages.length && pdfP !== current) goToPdf(pdfP, { instant: !fromTick });
      }
    }
    updateLectureInfo();
  }
  function updateLectureInfo() {
    if (!lec) return;
    const printed = printedOfPdf(current), { from, to } = lec.bookRef;
    const inside = printed >= from && printed <= to;
    $("lec-pages").textContent = `${pagesLabel(from, to)} · ${inside ? "now p. " + printed : "you're outside these pages"}`;
  }
  function setFollowing(on) {
    following = on;
    const b = $("lec-follow");
    b.setAttribute("aria-pressed", on);
    b.textContent = on ? "Following" : "Follow";
    if (on && lec) { lastFollowPage = null; paintClock(); }
  }

  $("lec-play").addEventListener("click", () => (clock.playing ? stopClock() : startClock()));
  $("lec-scrub").addEventListener("input", (e) => { clock.t = Number(e.target.value); lastFollowPage = null; paintClock(); });
  $("lec-scrub").addEventListener("change", saveClock);
  $("lec-speed").addEventListener("click", () => { speedIdx = (speedIdx + 1) % SPEEDS.length; $("lec-speed").textContent = SPEEDS[speedIdx].label; });
  $("lec-follow").addEventListener("click", () => setFollowing(!following));
  $("lec-sync-btn").addEventListener("click", () => {
    if (!lec) return;
    const printed = printedOfPdf(current), { from, to } = lec.bookRef;
    if (printed < from || printed > to) return toast(`This lecture covers ${pagesLabel(from, to)}`, "warning");
    clock.t = timeAtPage(lec, printed);
    setFollowing(true);
    paintClock();
    saveClock();
    toast(`Audio moved to page ${printed} · ${fmtDuration(Math.floor(clock.t))}`, "success");
  });
  $("lec-close").addEventListener("click", closeLecture);

  /* ---------------- Keyboard ---------------- */
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); userGo(current + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); userGo(current - 1); }
    else if (e.key === "Home") { e.preventDefault(); userGo(1); }
    else if (e.key === "End") { e.preventDefault(); userGo(pages.length); }
    else if (e.key === "+" || e.key === "=") setZoom(zoomIdx + 1);
    else if (e.key === "-") setZoom(zoomIdx - 1);
    else if (e.key === "b" || e.key === "B") toggleMark();
    else if (e.key === "f" || e.key === "F") setFocus(root.dataset.focus !== "on");
    else if (e.key === " " && lec) { e.preventDefault(); clock.playing ? stopClock() : startClock(); }
    else if (e.key === "Escape") { if (root.dataset.focus === "on") setFocus(false); closePop(); }
  });

  /* ---------------- Go ---------------- */
  refreshMarkUI();
  renderListen();
  const startLec = lectureFromQuery();
  if (startLec) { selectLecture(startLec, { jump: false }); showTab("listen"); }
  start();
  // expose a tiny hook so the admin preview / tests can reach the reader
  window.__reader = { goToPrinted, get current() { return current; }, get lecture() { return lec; } };
})();
