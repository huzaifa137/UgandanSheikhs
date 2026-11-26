/* =====================================================================
   Ugandan Sheikhs — App Interactions
   Mock frontend logic. Every function here stands in for a future
   Laravel/JS service call — see README "JavaScript Service Architecture".
   ===================================================================== */

/* ---------- Toasts ---------- */
function toast(message, type = "info") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";
    setTimeout(() => el.remove(), 220);
  }, 2600);
}

/* ---------- Generic menu / dropdown toggling ---------- */
function wireMenu(btnId, menuId) {
  const btn = document.getElementById(btnId);
  const menu = document.getElementById(menuId);
  if (!btn || !menu) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".menu.open").forEach((m) => { if (m !== menu) m.classList.remove("open"); });
    menu.classList.toggle("open");
  });
}
document.addEventListener("click", () => document.querySelectorAll(".menu.open").forEach((m) => m.classList.remove("open")));

/* ---------- Tabs ----------
   Two ways to use a tab strip:
   1. Panels   – give each tab data-target="x" and each panel data-tabpanel="x"
                 (panels are looked up inside the strip's parent element).
   2. Callback – pass onChange(value, tab); value is data-filter, else data-target,
                 else the tab's text. Use this when the tabs re-render a list. */
function wireTabs(container, onChange) {
  if (!container) return;
  container.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.target;
      if (target) {
        container.parentElement.querySelectorAll("[data-tabpanel]").forEach((p) => {
          p.style.display = p.dataset.tabpanel === target ? "" : "none";
        });
      }
      if (typeof onChange === "function") onChange(tab.dataset.filter ?? target ?? tab.textContent.trim(), tab);
    });
  });
}

/* ---------- Chips (single or multi active) ----------
   onChange(value, chip) fires after every click; value is the chip's
   data-value, else its text. A chip row with no onChange only changes
   highlight, so give it one whenever the chips are meant to filter something. */
function wireChips(container, { multi = false, onChange } = {}) {
  if (!container) return;
  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (!multi) container.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.toggle("active");
      if (typeof onChange === "function") onChange(chip.dataset.value ?? chip.textContent.trim(), chip);
    });
  });
}

/* ---------- Small shared helpers ---------- */
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* Icon with an explicit pixel size baked into the SVG itself, so it can never
   balloon to fill its container even if a stylesheet rule is missing. */
function sizedIcon(name, px) {
  return (ICONS[name] || "").replace("<svg", `<svg width="${px}" height="${px}"`);
}

/* One empty-state implementation for every page (icon in a 64px circle, 28px glyph).
   icon is a key of ICONS; title/body are HTML, so escape anything user-typed first. */
function emptyStateHTML({ icon, title, body = "", style = "" } = {}) {
  return `<div class="empty-state"${style ? ` style="${style}"` : ""}><div class="icon-wrap">${sizedIcon(icon, 28)}</div><h3>${title}</h3>${body ? `<p>${body}</p>` : ""}</div>`;
}

/* ---------- Modals ---------- */
function openModal(id) {
  document.getElementById("overlay")?.classList.add("open");
  document.getElementById(id)?.classList.add("open");
}
function closeModals() {
  document.getElementById("overlay")?.classList.remove("open");
  document.querySelectorAll(".modal.open").forEach((m) => m.classList.remove("open"));
  document.querySelectorAll(".drawer.open").forEach((d) => d.classList.remove("open"));
}
function ensureOverlay() {
  if (document.getElementById("overlay")) return;
  const ov = document.createElement("div");
  ov.className = "overlay";
  ov.id = "overlay";
  ov.addEventListener("click", closeModals);
  document.body.appendChild(ov);
}
function openDrawer(id) {
  ensureOverlay();
  document.getElementById("overlay").classList.add("open");
  document.getElementById(id)?.classList.add("open");
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModals(); CtxMenu.close(); } });

/* ---------- Player logic (mock) ---------- */
const Player = {
  playing: false,
  progress: 34,
  shuffle: false,
  repeat: false,
  volume: 70,
  init() {
    const playBtn = document.getElementById("p-play");
    const miniPlay = document.getElementById("mini-play");
    const fill = document.getElementById("p-fill");
    const track = document.getElementById("p-track");
    const current = document.getElementById("p-current");
    const shuffleBtn = document.getElementById("p-shuffle");
    const repeatBtn = document.getElementById("p-repeat");
    const volFill = document.getElementById("p-volume-fill");
    const volTrack = document.getElementById("p-volume-track");
    const likeBtn = document.getElementById("player-like");
    if (fill) fill.style.width = this.progress + "%";

    const toggle = () => {
      this.playing = !this.playing;
      [playBtn, miniPlay].forEach((b) => { if (b) b.innerHTML = this.playing ? ICONS.pause : ICONS.play; });
      toast(this.playing ? `Playing "${STATE.currentTrack.title}"` : "Paused");
    };
    playBtn?.addEventListener("click", toggle);
    miniPlay?.addEventListener("click", toggle);

    document.getElementById("p-next")?.addEventListener("click", () => toast("Skipped to next track"));
    document.getElementById("mini-next")?.addEventListener("click", () => toast("Skipped to next track"));
    document.getElementById("p-prev")?.addEventListener("click", () => toast("Skipped to previous track"));

    shuffleBtn?.addEventListener("click", () => { this.shuffle = !this.shuffle; shuffleBtn.classList.toggle("on", this.shuffle); toast(this.shuffle ? "Shuffle on" : "Shuffle off"); });
    repeatBtn?.addEventListener("click", () => { this.repeat = !this.repeat; repeatBtn.classList.toggle("on", this.repeat); toast(this.repeat ? "Repeat on" : "Repeat off"); });

    likeBtn?.addEventListener("click", () => {
      const liked = likeBtn.innerHTML === ICONS.heartFill;
      likeBtn.innerHTML = liked ? ICONS.heart : ICONS.heartFill;
      likeBtn.style.color = liked ? "" : "var(--accent)";
      toast(liked ? "Removed from Liked Lectures" : "Added to Liked Lectures", "success");
    });

    track?.addEventListener("click", (e) => {
      const rect = track.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      fill.style.width = pct + "%";
      const secs = Math.round((pct / 100) * STATE.currentTrack.duration);
      if (current) current.textContent = fmtDuration(secs);
    });
    volTrack?.addEventListener("click", (e) => {
      const rect = volTrack.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      volFill.style.width = pct + "%";
    });

    document.getElementById("p-queue")?.addEventListener("click", () => openDrawer("queue-drawer"));
    document.getElementById("p-download")?.addEventListener("click", () => toast("Downloaded for offline listening", "success"));
    document.getElementById("player-more")?.setAttribute("data-menu", "player");
  },
};

/* ---------- Search autocomplete (mock, client side) ---------- */
// One search bar for every screen size. On phones it sits in the top bar next to the icons and,
// when tapped, grows to the full width of the bar (the icons step aside) with a full-width results panel.
function wireGlobalSearch() {
  const input = document.getElementById("global-search");
  const box = document.getElementById("search-autocomplete");
  if (!input || !box) return;
  const topbar = input.closest(".topbar");
  const closeBtn = document.getElementById("search-close");
  const FULL = "Search sheikhs, series, lectures and collections";

  // Placeholder that fits the room: full text on desktop, shorter as the bar gets narrower
  const mqMid = window.matchMedia("(max-width:860px)");
  const mqSmall = window.matchMedia("(max-width:600px)");
  const setPlaceholder = () => { input.placeholder = mqSmall.matches ? "Search…" : mqMid.matches ? "Search sheikhs, series, lectures…" : FULL; };
  setPlaceholder();
  [mqMid, mqSmall].forEach((mq) => (mq.addEventListener ? mq.addEventListener("change", setPlaceholder) : mq.addListener(setPlaceholder)));

  const closeBox = () => box.classList.remove("open");
  const render = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { closeBox(); return; }
    const artists = ARTISTS.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 3);
    const tracks = TRACKS.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 3);
    const albums = ALBUMS.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 2);
    if (!artists.length && !tracks.length && !albums.length) {
      box.innerHTML = `<div class="nav-group-label">No quick matches</div><a class="menu-item" href="search.html?q=${encodeURIComponent(input.value.trim())}">${ICONS.search}Search all for “${escapeHTML(input.value.trim())}”</a>`;
      box.classList.add("open");
      return;
    }
    box.innerHTML = [
      artists.length ? `<div class="nav-group-label">Sheikhs</div>${artists.map((a) => `<a class="menu-item" href="artist.html?id=${a.id}">${ICONS.users}${a.name}</a>`).join("")}` : "",
      tracks.length ? `<div class="nav-group-label">Lectures</div>${tracks.map((t) => `<a class="menu-item" href="track.html?id=${t.id}">${ICONS.disc}${t.title}</a>`).join("")}` : "",
      albums.length ? `<div class="nav-group-label">Series</div>${albums.map((a) => `<a class="menu-item" href="album.html?id=${a.id}">${ICONS.disc}${a.title}</a>`).join("")}` : "",
      `<a class="menu-item" href="search.html?q=${encodeURIComponent(input.value.trim())}">${ICONS.search}See all results for “${escapeHTML(input.value.trim())}”</a>`,
    ].join("");
    box.classList.add("open");
  };
  input.addEventListener("input", render);
  input.addEventListener("focus", () => { topbar?.classList.add("search-open"); render(); });
  // Enter (or the phone keyboard's Search key) opens the full results page
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
    if (e.key === "Escape") { input.value = ""; closeBox(); input.blur(); }
  });
  // keep focus in the field while a result is being tapped, so the panel doesn't vanish before the tap lands
  box.addEventListener("mousedown", (e) => e.preventDefault());
  input.addEventListener("blur", () => { topbar?.classList.remove("search-open"); closeBox(); });
  closeBtn?.addEventListener("mousedown", (e) => e.preventDefault());
  closeBtn?.addEventListener("click", () => { input.value = ""; closeBox(); input.blur(); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search-field")) closeBox(); });
}

/* ---------- Connectivity simulation ---------- */
// The topbar status pill flips STATE.online. It's updated IN PLACE and listened to via ONE
// delegated handler on document, so it keeps working however many times the topbar is
// re-rendered (the old per-element listener died with the first re-render, which is why
// the pill could go Offline but never come back Online).
function paintStatusPill() {
  const pill = document.getElementById("status-pill");
  if (!pill) return;
  pill.classList.toggle("online", STATE.online);
  pill.classList.toggle("offline", !STATE.online);
  pill.setAttribute("aria-label", STATE.online ? "Online — click to simulate offline mode" : "Offline mode — click to go back online");
  pill.lastChild.textContent = STATE.online ? "Online" : "Offline Mode";
}
function toggleConnectivity() {
  STATE.online = !STATE.online;
  paintStatusPill();
  toast(STATE.online ? "Back online — syncing library" : "You're offline. Showing downloaded lectures.", STATE.online ? "success" : "warning");
}
function wireConnectivityToggle() {
  if (wireConnectivityToggle.done) return;
  wireConnectivityToggle.done = true;
  document.addEventListener("click", (e) => { if (e.target.closest("#status-pill")) toggleConnectivity(); });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("#status-pill")) { e.preventDefault(); toggleConnectivity(); }
  });
}

/* ---------- Lecture row / card builders (shared markup) ---------- */
function trackRowHTML(t, i, opts = {}) {
  return `
  <tr class="track-row" data-id="${t.id}">
    <td class="t-num"><span class="num">${i + 1}</span><button class="icon-btn play-ico" style="background:none;width:18px;height:18px;" aria-label="Play">${ICONS.play}</button></td>
    <td>
      <div class="t-title-cell">
        <img src="${t.art}" alt="${t.title}" />
        <div>
          <div class="t-title">${t.title} ${t.explicit ? '<span class="badge badge-explicit">E</span>' : ""}</div>
          <a class="t-artist" href="artist.html?id=${t.artistId}">${t.artist}</a>
        </div>
      </div>
    </td>
    ${opts.album ? `<td class="t-meta truncate">${seriesLinkHTML(t)}</td>` : ""}
    <td class="t-meta">${fmtCount(t.plays)}</td>
    <td class="t-meta">${fmtDuration(t.duration)}</td>
    <td>
      <div class="t-actions">
        <button class="icon-btn" style="width:30px;height:30px;background:none;" title="Like" onclick="toast('Added to Liked Lectures','success')">${ICONS.heart}</button>
        ${t.downloadable ? `<button class="icon-btn" style="width:30px;height:30px;background:none;" title="Download" onclick="toast('Download started')">${ICONS.download}</button>` : ""}
        <button class="icon-btn" style="width:30px;height:30px;background:none;" title="More options" aria-label="More options" aria-haspopup="menu" data-menu="lecture:${t.id}">${ICONS.more}</button>
      </div>
    </td>
  </tr>`;
}

/* Topic tile (Home): calm, uniform card with a small eight-pointed star (khatam) ornament.
   The topic colour is deliberately NOT used here, so the grid stays quiet and consistent. */
const TOPIC_ORNAMENT = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" stroke="currentColor" stroke-width="1.3"/><rect x="6.5" y="6.5" width="11" height="11" stroke="currentColor" stroke-width="1.3" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>`;
function topicTileHTML(g) {
  const n = TRACKS.filter((t) => t.genre === g.name).length;
  return `
  <a class="topic-tile" href="discover.html?genre=${g.slug}">
    <span class="topic-tile-mark">${TOPIC_ORNAMENT}</span>
    <span class="topic-tile-body"><span class="topic-tile-name">${g.name}</span><span class="topic-tile-count">${n} lecture${n === 1 ? "" : "s"}</span></span>
    <span class="topic-tile-go" aria-hidden="true">${ICONS.chevRight}</span>
  </a>`;
}

/* Link to the series a lecture belongs to (falls back to plain text if it is in no series) */
function seriesLinkHTML(t) {
  const s = seriesOf(t);
  return s ? `<a href="album.html?id=${s.id}">${s.title}</a>` : escapeHTML(t.album);
}

function cardHTML(item, kind) {
  const href = kind === "artist" ? `artist.html?id=${item.id}` : kind === "album" ? `album.html?id=${item.id}` : `playlist.html?id=${item.id}`;
  const title = item.name || item.title;
  const sub = kind === "artist" ? item.genre : kind === "album" ? item.artist : item.kind === "personal" ? "Private · only you" : `By ${item.creator}`;
  return `
  <a class="card card-w ${kind === "artist" ? "artist" : ""}" href="${href}">
    <div class="card-art">
      <img src="${item.img || item.art}" alt="${title}" loading="lazy" />
      <span class="card-play" onclick="event.preventDefault();toast('Playing ${title.replace(/'/g, "")}')">${ICONS.play}</span>
    </div>
    <div class="card-title truncate">${title}</div>
    <div class="card-sub truncate">${sub}</div>
  </a>`;
}

/* ---------- "More options" menus ----------
   One menu component for every ⋯ button. Put data-menu="lecture:<id>", "series:<id>", "sheikh:<id>" or "player"
   on a button and the delegated handler below opens the right menu. Desktop: a popover next to the
   button. Phones (<=640px): a bottom sheet. Actions that need the backend (download, like, follow)
   still toast in this prototype; navigation, copy-link and queue actions are real. */
const CtxMenu = {
  el: null, scrim: null, anchor: null, items: [], isSheet: false,

  ensure() {
    if (this.el) return;
    this.scrim = document.createElement("div");
    this.scrim.className = "ctx-scrim";
    this.scrim.addEventListener("click", () => this.close());
    this.el = document.createElement("div");
    this.el.className = "ctx-menu";
    this.el.setAttribute("role", "menu");
    this.el.addEventListener("click", (e) => {
      const row = e.target.closest("[data-ctx]");
      if (!row || row.disabled || row.getAttribute("aria-disabled") === "true") return;
      const item = this.items[Number(row.dataset.ctx)];
      if (!item) return;
      if (item.keepOpen) { e.preventDefault(); item.onClick && item.onClick(); return; }
      this.close(!item.href);
      if (item.onClick) item.onClick();
    });
    this.el.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const rows = [...this.el.querySelectorAll("[data-ctx]:not([aria-disabled='true'])")];
      const i = rows.indexOf(document.activeElement);
      rows[(i + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length]?.focus();
    });
    document.body.append(this.scrim, this.el);
    // a popover would drift away from its button, so it closes on resize/scroll; a bottom sheet stays put
    window.addEventListener("resize", () => { if (!this.isSheet) this.close(false); });
    window.addEventListener("scroll", (e) => { if (!this.isSheet && this.el.classList.contains("open") && !this.el.contains(e.target)) this.close(false); }, true);
  },

  /* spec = { title, subtitle, art, items: [{ icon, label, onClick, href, danger, disabled, divider, keepOpen }] } */
  open(anchor, spec) {
    this.ensure();
    this.anchor = anchor || this.anchor;
    this.items = spec.items.filter((i) => !i.divider);
    let n = -1;
    this.el.innerHTML = `
      ${spec.title ? `<div class="ctx-head">${spec.art ? `<img src="${spec.art}" alt="" />` : ""}<div><div class="ctx-title truncate">${escapeHTML(spec.title)}</div>${spec.subtitle ? `<div class="ctx-sub truncate">${escapeHTML(spec.subtitle)}</div>` : ""}</div></div>` : ""}
      <div class="ctx-list">
        ${spec.items.map((i) => {
          if (i.divider) return `<div class="menu-divider"></div>`;
          n++;
          const inner = `${i.icon ? ICONS[i.icon] : "<span class=\"ctx-noicon\"></span>"}<span>${i.label}</span>`;
          const cls = `menu-item${i.danger ? " danger" : ""}`;
          return i.href
            ? `<a class="${cls}" role="menuitem" data-ctx="${n}" href="${i.href}">${inner}</a>`
            : `<button type="button" class="${cls}" role="menuitem" data-ctx="${n}"${i.disabled ? ` aria-disabled="true"` : ""}>${inner}</button>`;
        }).join("")}
      </div>`;
    this.isSheet = window.matchMedia("(max-width:640px)").matches;
    this.el.classList.toggle("is-sheet", this.isSheet);
    this.scrim.classList.toggle("open", this.isSheet);
    this.anchor?.setAttribute("aria-expanded", "true");
    if (!this.isSheet && this.anchor) {
      const r = this.anchor.getBoundingClientRect();
      const w = this.el.offsetWidth, h = this.el.offsetHeight;
      const left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
      let top = r.bottom + 6;
      if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
      this.el.style.left = left + "px";
      this.el.style.top = top + "px";
    } else { this.el.style.left = this.el.style.top = ""; }
    this.el.classList.add("open");
    this.el.querySelector("[data-ctx]")?.focus({ preventScroll: true });
  },

  close(returnFocus = true) {
    if (!this.el || !this.el.classList.contains("open")) return;
    this.el.classList.remove("open");
    this.scrim.classList.remove("open");
    this.anchor?.setAttribute("aria-expanded", "false");
    if (returnFocus) this.anchor?.focus({ preventScroll: true });
  },
};

function copyLink(href) {
  const url = new URL(href, location.href).href;
  const done = () => toast("Link copied to clipboard", "success");
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, () => toast(url));
  else {
    const ta = Object.assign(document.createElement("textarea"), { value: url });
    ta.style.cssText = "position:fixed;opacity:0;";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch { toast(url); }
    ta.remove();
  }
}

let MENU_FROM = "";   // which surface opened the current "more options" menu (used by Report a problem)
function queueRefresh() { if (typeof renderQueueList === "function") renderQueueList(); }

function lectureMenuSpec(t, anchor) {
  const series = seriesOf(t);
  const artist = ARTISTS.find((a) => a.id === t.artistId);
  return {
    title: t.title, subtitle: `${t.artist}${series ? " · " + series.title : ""}`, art: t.art,
    items: [
      { icon: "play", label: "Play now", onClick: () => toast(`Playing ${t.title}`) },
      { icon: "queue", label: "Play next", onClick: () => { STATE.queue.unshift(t); queueRefresh(); toast("Will play next", "success"); } },
      { icon: "plus", label: "Add to queue", onClick: () => { STATE.queue.push(t); queueRefresh(); toast("Added to queue", "success"); } },
      { icon: "layers", label: "Add to collection…", keepOpen: true, onClick: () => CtxMenu.open(anchor, collectionPickerSpec(t, anchor)) },
      { icon: "heart", label: "Add to Liked Lectures", onClick: () => toast("Added to Liked Lectures", "success") },
      t.downloadable
        ? { icon: "download", label: "Download", onClick: () => toast("Download started") }
        : { icon: "cloudOff", label: "Streaming only", disabled: true },
      { divider: true },
      series ? { icon: "disc", label: "Go to series", href: `album.html?id=${series.id}` } : null,
      artist ? { icon: "users", label: "Go to sheikh", href: `artist.html?id=${artist.id}` } : null,
      { icon: "file", label: "Open lecture page", href: `track.html?id=${t.id}` },
      { divider: true },
      { icon: "share", label: "Copy link", onClick: () => copyLink(`track.html?id=${t.id}`) },
      { icon: "flag", label: "Report a problem", onClick: () => openReport({ kind: "Lecture", id: t.id, title: t.title, sub: t.artist, source: MENU_FROM || "Lecture menu", itemHref: `track.html?id=${t.id}` }) },
    ].filter(Boolean),
  };
}

function collectionPickerSpec(t, anchor) {
  const mine = myCollections();
  return {
    title: "Add to collection", subtitle: t.title,
    items: [
      { icon: "chevLeft", label: "Back", keepOpen: true, onClick: () => CtxMenu.open(anchor, lectureMenuSpec(t, anchor)) },
      { divider: true },
      { icon: "plus", label: "New collection", onClick: () => { ensureOverlay(); openModal("create-playlist-modal"); } },
      ...mine.map((p) => ({ icon: "layers", label: escapeHTML(p.name), onClick: () => toast(`Added to ${p.name}`, "success") })),
    ],
  };
}

function seriesMenuSpec(a) {
  const dl = a.tracks.filter((t) => t.downloadable).length;
  return {
    title: a.title, subtitle: `${a.artist} · ${a.tracks.length} lecture${a.tracks.length === 1 ? "" : "s"}`, art: a.art,
    items: [
      { icon: "play", label: "Play series", onClick: () => toast(`Playing ${a.title}`) },
      { icon: "shuffle", label: "Shuffle", onClick: () => toast("Shuffling series") },
      { icon: "queue", label: "Add all to queue", onClick: () => { STATE.queue.push(...a.tracks); queueRefresh(); toast(`${a.tracks.length} lectures added to queue`, "success"); } },
      { icon: "download", label: dl ? `Download ${dl} lecture${dl === 1 ? "" : "s"}` : "No downloads available", disabled: !dl, onClick: () => toast("Series download started", "success") },
      { icon: "library", label: "Save to library", onClick: () => toast("Saved to library", "success") },
      { divider: true },
      { icon: "users", label: "Go to sheikh", href: `artist.html?id=${a.artistId}` },
      { icon: "share", label: "Copy link", onClick: () => copyLink(`album.html?id=${a.id}`) },
      { icon: "flag", label: "Report a problem", onClick: () => openReport({ kind: "Series", id: a.id, title: a.title, sub: a.artist, source: "Series menu", itemHref: `album.html?id=${a.id}` }) },
    ],
  };
}

function sheikhMenuSpec(a) {
  return {
    title: a.name, subtitle: `${a.followers} followers`, art: a.img,
    items: [
      { icon: "play", label: "Play lectures", onClick: () => toast(`Playing ${a.name}`) },
      { icon: "shuffle", label: "Shuffle", onClick: () => toast("Shuffling lectures") },
      { icon: "userPlus", label: "Follow", onClick: () => { const f = document.getElementById("follow-btn"); if (f) f.click(); else toast("Following " + a.name, "success"); } },
      { divider: true },
      { icon: "share", label: "Copy profile link", onClick: () => copyLink(`artist.html?id=${a.id}`) },
      { icon: "flag", label: "Report a problem", onClick: () => openReport({ kind: "Sheikh", id: a.id, title: a.name, sub: "Sheikh profile", source: "Sheikh menu", itemHref: `artist.html?id=${a.id}` }) },
    ],
  };
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-menu]");
  if (!btn) {
    if (CtxMenu.el && !CtxMenu.el.contains(e.target)) CtxMenu.close(false);
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  if (CtxMenu.el?.classList.contains("open") && CtxMenu.anchor === btn) { CtxMenu.close(); return; }
  const [kind, id] = btn.dataset.menu.split(":");
  MENU_FROM = kind === "player" ? "Player bar" : "";
  let spec = null;
  if (kind === "lecture") { const t = TRACKS.find((x) => x.id === id); if (t) spec = lectureMenuSpec(t, btn); }
  else if (kind === "player") spec = lectureMenuSpec(STATE.currentTrack, btn);
  else if (kind === "series") { const a = ALBUMS.find((x) => x.id === id); if (a) spec = seriesMenuSpec(a); }
  else if (kind === "sheikh") { const a = ARTISTS.find((x) => x.id === id); if (a) spec = sheikhMenuSpec(a); }
  if (!spec) return toast("Options aren't available for this item");
  btn.setAttribute("aria-haspopup", "menu");
  CtxMenu.close(false);
  CtxMenu.open(btn, spec);
}, true);

/* ---------- Report a problem ----------
   One modal for every "Report a problem" entry point (lecture / series / sheikh menus, comment Report links).
   It captures WHAT is reported and WHERE the listener was when they reported it, plus their own message.
   Prototype: saved to localStorage ("us_reports") and shown on admin/reports.html.
   Laravel: POST /reports { type, item_id, source, page_url, reason, message }. */
const REPORT_STORE = "us_reports";
const PAGE_LABELS = { index: "Home", discover: "Discover", library: "Your Library", search: "Search", track: "Lecture page", album: "Series page", artist: "Sheikh page", playlist: "Collection page", history: "History", liked: "Liked Lectures", downloads: "Downloads", offline: "Offline", following: "Following", profile: "Profile", settings: "Settings" };
const REPORT_REASONS = ["Won't play or download", "Wrong title, sheikh or details", "Inappropriate or disrespectful content", "Incorrect or misleading content", "Copyright concern", "Something else"];
function currentPageLabel() {
  const file = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  return PAGE_LABELS[file] || document.title.split("—")[0].trim() || "Ugandan Sheikhs";
}
function loadReports() { try { return JSON.parse(localStorage.getItem(REPORT_STORE) || "[]"); } catch { return []; } }
function saveReports(list) { try { localStorage.setItem(REPORT_STORE, JSON.stringify(list)); return true; } catch { return false; } }

let _report = null;
function ensureReportModal() {
  if (document.getElementById("report-modal")) return;
  ensureOverlay();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal report-modal" id="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div class="modal-head"><h3 id="report-title">Report a problem</h3><button type="button" class="icon-btn" aria-label="Close" onclick="closeModals()">${ICONS.x}</button></div>
      <div class="report-context" id="report-context"></div>
      <div class="field"><label for="report-reason">What's the problem?</label>
        <select class="select" id="report-reason">${REPORT_REASONS.map((r) => `<option>${r}</option>`).join("")}</select></div>
      <div class="field"><label for="report-message">Tell us more</label>
        <textarea class="textarea" id="report-message" maxlength="1000" placeholder="Describe the problem in your own words so the team can look into it."></textarea>
        <div class="report-meta"><span class="field-hint" id="report-error" role="alert"></span><span class="field-hint" id="report-count">0 / 1000</span></div></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModals()">Cancel</button>
        <button type="button" class="btn btn-primary" id="report-send">Send report</button>
      </div>
    </div>`);
  const msg = document.getElementById("report-message");
  msg.addEventListener("input", () => {
    document.getElementById("report-count").textContent = `${msg.value.length} / 1000`;
    if (msg.value.trim().length >= 10) document.getElementById("report-error").textContent = "";
  });
  document.getElementById("report-send").addEventListener("click", submitReport);
}
function openReport(ctx) {
  _report = { place: currentPageLabel(), href: location.href.split("/").pop(), source: "", sub: "", ...ctx };
  ensureReportModal();
  document.getElementById("report-context").innerHTML = `
    <div class="report-context-row"><span>Reporting</span><strong>${escapeHTML(_report.kind)}: ${escapeHTML(_report.title)}</strong></div>
    ${_report.sub ? `<div class="report-context-row"><span>Details</span><strong>${escapeHTML(_report.sub)}</strong></div>` : ""}
    <div class="report-context-row"><span>Found on</span><strong>${escapeHTML(_report.place)}${_report.source ? ` · ${escapeHTML(_report.source)}` : ""}</strong></div>`;
  document.getElementById("report-reason").selectedIndex = 0;
  document.getElementById("report-message").value = "";
  document.getElementById("report-count").textContent = "0 / 1000";
  document.getElementById("report-error").textContent = "";
  openModal("report-modal");
  setTimeout(() => document.getElementById("report-message")?.focus(), 60);
}
function submitReport() {
  const message = document.getElementById("report-message").value.trim();
  if (message.length < 10) {
    document.getElementById("report-error").textContent = "Please write at least a short sentence (10 characters).";
    document.getElementById("report-message").focus();
    return;
  }
  const list = loadReports();
  list.unshift({
    id: `rep-${Date.now()}`, type: _report.kind, itemId: _report.id || "", title: _report.title,
    place: _report.place, source: _report.source, page: _report.href, itemHref: _report.itemHref || "",
    reason: document.getElementById("report-reason").value, message,
    by: CURRENT_USER.name, date: new Date().toISOString(), status: "Open",
  });
  saveReports(list);
  closeModals();
  toast("Report sent. Jazakallahu khayran, our team will review it.", "success");
}
// Comment "Report" links: <button data-report="comment:cmt-3">
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-report]");
  if (!b) return;
  const [kind, id] = b.dataset.report.split(":");
  if (kind !== "comment") return;
  const c = COMMENTS.find((x) => x.id === id);
  const lecture = c && TRACKS.find((x) => x.id === c.trackId);
  openReport({ kind: "Comment", id, title: c ? `Comment by ${c.user}` : "Comment", sub: c ? `“${c.body.slice(0, 80)}${c.body.length > 80 ? "…" : ""}”` : "", source: "Comments" + (lecture ? ` on “${lecture.title}”` : "") });
});

/* ---------- Init hook every page calls ---------- */
function initAppPage(active) {
  renderShell(active);
  Player.init();
  wireGlobalSearch();
  wireMenu("user-menu-btn", "user-menu");
  wireMenu("notif-btn", "notif-drawer-btn");
  document.getElementById("notif-btn")?.addEventListener("click", () => { ensureOverlay(); openDrawer("notif-drawer"); });
  document.getElementById("create-playlist-btn")?.addEventListener("click", () => { ensureOverlay(); openModal("create-playlist-modal"); });
  wireConnectivityToggle();
}