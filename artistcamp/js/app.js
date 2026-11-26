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
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

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
    document.getElementById("player-more")?.addEventListener("click", () => toast("Lecture options opened"));
  },
};

/* ---------- Search autocomplete (mock, client side) ---------- */
function wireGlobalSearch() {
  const input = document.getElementById("global-search");
  const box = document.getElementById("search-autocomplete");
  if (!input || !box) return;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.classList.remove("open"); return; }
    const artists = ARTISTS.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 3);
    const tracks = TRACKS.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 3);
    const albums = ALBUMS.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 2);
    if (!artists.length && !tracks.length && !albums.length) { box.classList.remove("open"); return; }
    box.innerHTML = [
      artists.length ? `<div class="nav-group-label">Sheikhs</div>${artists.map((a) => `<a class="menu-item" href="artist.html?id=${a.id}">${ICONS.users}${a.name}</a>`).join("")}` : "",
      tracks.length ? `<div class="nav-group-label">Lectures</div>${tracks.map((t) => `<a class="menu-item" href="track.html?id=${t.id}">${ICONS.disc}${t.title}</a>`).join("")}` : "",
      albums.length ? `<div class="nav-group-label">Series</div>${albums.map((a) => `<a class="menu-item" href="album.html?id=${a.id}">${ICONS.disc}${a.title}</a>`).join("")}` : "",
    ].join("");
    box.classList.add("open");
  });
  document.addEventListener("click", (e) => { if (!input.contains(e.target)) box.classList.remove("open"); });
}

/* ---------- Connectivity simulation ---------- */
function wireConnectivityToggle(btnId) {
  const btn = document.getElementById(btnId);
  btn?.addEventListener("click", () => {
    STATE.online = !STATE.online;
    renderTopbar();
    wireGlobalSearch();
    wireMenu("user-menu-btn", "user-menu");
    wireMenu("notif-btn", "notif-drawer-btn");
    toast(STATE.online ? "Back online — syncing library" : "You're offline. Showing downloaded lectures.", STATE.online ? "success" : "warning");
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
    ${opts.album ? `<td class="t-meta truncate"><a href="album.html?id=${t.id.replace("trk", "alb")}">${t.album}</a></td>` : ""}
    <td class="t-meta">${fmtCount(t.plays)}</td>
    <td class="t-meta">${fmtDuration(t.duration)}</td>
    <td>
      <div class="t-actions">
        <button class="icon-btn" style="width:30px;height:30px;background:none;" title="Like" onclick="toast('Added to Liked Lectures','success')">${ICONS.heart}</button>
        ${t.downloadable ? `<button class="icon-btn" style="width:30px;height:30px;background:none;" title="Download" onclick="toast('Download started')">${ICONS.download}</button>` : ""}
        <button class="icon-btn" style="width:30px;height:30px;background:none;" title="More" onclick="toast('Lecture options opened')">${ICONS.more}</button>
      </div>
    </td>
  </tr>`;
}

function cardHTML(item, kind) {
  const href = kind === "artist" ? `artist.html?id=${item.id}` : kind === "album" ? `album.html?id=${item.id}` : `playlist.html?id=${item.id}`;
  const title = item.name || item.title;
  const sub = kind === "artist" ? item.genre : kind === "album" ? item.artist : `By ${item.creator}`;
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

/* ---------- Init hook every page calls ---------- */
function initAppPage(active) {
  renderShell(active);
  Player.init();
  wireGlobalSearch();
  wireMenu("user-menu-btn", "user-menu");
  wireMenu("notif-btn", "notif-drawer-btn");
  document.getElementById("notif-btn")?.addEventListener("click", () => { ensureOverlay(); openDrawer("notif-drawer"); });
  document.getElementById("create-playlist-btn")?.addEventListener("click", () => { ensureOverlay(); openModal("create-playlist-modal"); });
  document.getElementById("status-pill")?.addEventListener("click", () => { STATE.online = !STATE.online; renderTopbar(); wireGlobalSearch(); wireMenu("user-menu-btn", "user-menu"); wireMenu("notif-btn", "notif-drawer-btn"); document.getElementById("notif-btn")?.addEventListener("click", () => { ensureOverlay(); openDrawer("notif-drawer"); }); toast(STATE.online ? "Back online — syncing library" : "You're offline. Showing downloaded lectures.", STATE.online ? "success" : "warning"); });
}