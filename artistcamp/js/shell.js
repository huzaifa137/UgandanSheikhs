/* =====================================================================
   Ugandan Sheikhs — App Shell
   Renders the persistent sidebar / topbar / player / mobile nav into
   placeholder elements so every listener page shares one implementation.
   Pages declare data-active="discover" etc. on <body> to set nav state.
   ===================================================================== */

/* ---- Theme: handled by js/theme.js (dark / ocean / light / system), loaded in <head> of every page. ---- */

const NAV_PRIMARY = [
  { id: "home", label: "Home", href: "index.html", icon: "home" },
  { id: "discover", label: "Discover", href: "discover.html", icon: "compass" },
  { id: "browse", label: "Browse", href: "search.html", icon: "grid" },
  { id: "new-releases", label: "New Lectures", href: "discover.html#new", icon: "sparkle" },
  { id: "trending", label: "Trending", href: "discover.html#trending", icon: "trendingUp" },
  { id: "genres", label: "Topics", href: "discover.html#genres", icon: "tag" },
];
const NAV_LIBRARY = [
  { id: "library", label: "My Library", href: "library.html", icon: "library" },
  { id: "liked", label: "Liked Lectures", href: "liked.html", icon: "heart" },
  { id: "albums", label: "Series", href: "library.html#albums", icon: "disc" },
  { id: "following", label: "Following", href: "following.html", icon: "userPlus" },
  { id: "playlists", label: "Collections", href: "library.html#playlists", icon: "layers" },
  { id: "downloads", label: "Downloads", href: "downloads.html", icon: "download" },
  { id: "offline", label: "Offline Lectures", href: "offline.html", icon: "cloudOff" },
  { id: "history", label: "Recently Played", href: "history.html", icon: "clock" },
];

function renderSidebar(active) {
  const el = document.getElementById("shell-sidebar");
  if (!el) return;
  const navItem = (i) => `<a class="nav-link ${active === i.id ? "active" : ""}" href="${i.href}">${ICONS[i.icon]}<span>${i.label}</span></a>`;
  el.innerHTML = `
    <a class="sidebar-logo" href="index.html">
      <span class="logo-mark"><img class="logo-blue" src="img/logo-mark-blue.png" alt="" width="36" height="36" /><img class="logo-green" src="img/logo-mark-green.png" alt="" width="36" height="36" /></span>
      <span class="word">Ugandan Sheikhs</span>
    </a>
    <nav class="nav-group">
      ${NAV_PRIMARY.map(navItem).join("")}
    </nav>
    <div class="nav-group">
      <div class="nav-group-label">Your Library</div>
      ${NAV_LIBRARY.map(navItem).join("")}
    </div>
    <div class="nav-group">
      <div class="nav-group-label">Collections</div>
      <div class="playlist-nav">
        ${PLAYLISTS.slice(0, 5).map((p) => `<a class="nav-link" href="playlist.html?id=${p.id}"><span style="width:18px;height:18px;border-radius:4px;background:var(--surface-3);flex-shrink:0;background-image:url('${p.art}');background-size:cover;"></span><span class="truncate">${p.name}</span></a>`).join("")}
        <button class="nav-link" id="create-playlist-btn" style="width:100%;">${ICONS.plus}<span>Create Collection</span></button>
      </div>
    </div>
    <div class="sidebar-bottom">
      <a class="nav-link" href="settings.html">${ICONS.settings}<span>Settings</span></a>
      <a class="nav-link" href="#" onclick="return false;">${ICONS.help}<span>Help</span></a>
    </div>
  `;
}

function renderTopbar() {
  const el = document.getElementById("shell-topbar");
  if (!el) return;
  el.innerHTML = `
    <div class="nav-arrows">
      <button class="icon-btn" onclick="history.back()" aria-label="Back">${ICONS.chevLeft}</button>
      <button class="icon-btn" onclick="history.forward()" aria-label="Forward">${ICONS.chevRight}</button>
    </div>
    <div class="search-field" role="search">
      ${ICONS.search}
      <input id="global-search" type="text" placeholder="Search sheikhs, series, lectures and collections" autocomplete="off" enterkeyhint="search" aria-label="Search sheikhs, series, lectures and collections" />
      <button type="button" class="search-close" id="search-close" aria-label="Close search">${ICONS.x}</button>
      <div class="menu" id="search-autocomplete" style="left:0;right:0;top:44px;"></div>
    </div>
    <div class="topbar-right">
      <button class="icon-btn theme-toggle" data-theme-toggle aria-label="Switch theme">${ICONS.moon}${ICONS.ocean}${ICONS.sun}</button>
      <span class="status-pill ${STATE.online ? "online" : "offline"}" id="status-pill" role="button" tabindex="0" aria-label="${STATE.online ? "Online — click to simulate offline mode" : "Offline mode — click to go back online"}">
        <span class="status-dot"></span>${STATE.online ? "Online" : "Offline Mode"}
      </span>
      <button class="icon-btn" id="notif-btn" aria-label="Notifications" style="position:relative;">
        ${ICONS.bell}
        <span style="position:absolute;top:5px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--accent);"></span>
      </button>
      <div style="position:relative;">
        <button class="user-chip" id="user-menu-btn">
          <img class="avatar" src="${CURRENT_USER.avatar}" width="30" height="30" alt="${CURRENT_USER.name}" />
          <span class="name">${CURRENT_USER.name}</span>
          ${ICONS.chevDown}
        </button>
        <div class="menu" id="user-menu" style="right:0;top:44px;">
          <a class="menu-item" href="profile.html">${ICONS.users}Profile</a>
          <a class="menu-item" href="library.html">${ICONS.library}My Library</a>
          <a class="menu-item" href="downloads.html">${ICONS.download}Downloads</a>
          <a class="menu-item" href="settings.html">${ICONS.settings}Settings</a>
          <div class="menu-divider"></div>
          <a class="menu-item danger" href="login.html">${ICONS.logout}Sign Out</a>
        </div>
      </div>
    </div>
  `;
}

function renderPlayer() {
  const el = document.getElementById("shell-player");
  if (!el) return;
  const t = STATE.currentTrack;
  el.innerHTML = `
    <div class="player-track">
      <img src="${t.art}" alt="${t.title}" />
      <div class="info">
        <div class="title truncate">${t.title}</div>
        <a class="artist truncate" href="artist.html?id=${t.artistId}">${t.artist}</a>
      </div>
      <button class="icon-btn" id="player-like" aria-label="Like">${ICONS.heart}</button>
      <button class="icon-btn" id="player-more" aria-label="More options">${ICONS.more}</button>
    </div>
    <div class="player-center">
      <div class="player-controls">
        <button class="icon-btn" id="p-shuffle" aria-label="Shuffle">${ICONS.shuffle}</button>
        <button class="icon-btn" id="p-prev" aria-label="Previous">${ICONS.skipBack}</button>
        <button class="play-toggle" id="p-play" aria-label="Play">${ICONS.play}</button>
        <button class="icon-btn" id="p-next" aria-label="Next">${ICONS.skipFwd}</button>
        <button class="icon-btn" id="p-repeat" aria-label="Repeat">${ICONS.repeat}</button>
      </div>
      <div class="player-progress">
        <span id="p-current">0:00</span>
        <div class="progress-track" id="p-track"><div class="progress-fill" id="p-fill" style="width:0%"></div></div>
        <span>${fmtDuration(t.duration)}</span>
      </div>
    </div>
    <div class="player-right">
      <button class="icon-btn" id="p-queue" aria-label="Queue">${ICONS.queue}</button>
      <button class="icon-btn" id="p-lyrics" aria-label="Transcript">${ICONS.mic}</button>
      <button class="icon-btn" id="p-cast" aria-label="Devices">${ICONS.cast}</button>
      <button class="icon-btn" id="p-download" aria-label="Download status">${ICONS.download}</button>
      <div class="volume-wrap">
        ${ICONS.volume}
        <div class="progress-track" id="p-volume-track"><div class="progress-fill" id="p-volume-fill" style="width:70%"></div></div>
      </div>
    </div>
  `;

  const mini = document.getElementById("shell-mini-player");
  if (mini) {
    mini.innerHTML = `
      <img src="${t.art}" alt="${t.title}" />
      <div class="info">
        <div class="title truncate">${t.title}</div>
        <div class="artist truncate">${t.artist}</div>
      </div>
      <button class="icon-btn" id="mini-play" aria-label="Play">${ICONS.play}</button>
      <button class="icon-btn" id="mini-next" aria-label="Next">${ICONS.skipFwd}</button>
    `;
  }
}

function renderMobileNav(active) {
  const el = document.getElementById("shell-mobilenav");
  if (!el) return;
  const items = [
    { id: "home", label: "Home", href: "index.html", icon: "home" },
    { id: "discover", label: "Discover", href: "discover.html", icon: "compass" },
    { id: "search", label: "Search", href: "search.html", icon: "search" },
    { id: "library", label: "Library", href: "library.html", icon: "library" },
    { id: "profile", label: "Profile", href: "profile.html", icon: "users" },
  ];
  el.innerHTML = items.map((i) => `<a class="${active === i.id ? "active" : ""}" href="${i.href}">${ICONS[i.icon]}<span>${i.label}</span></a>`).join("");
}

/* ---- Notification drawer: one row, one list per tab (all | lectures | social | system) ---- */
const NOTIF_ICON = { follower: "userPlus", release: "sparkle", playlist: "layers", reply: "message", download: "download" };
const NOTIF_EMPTY = {
  lectures: "No lecture updates right now.",
  social: "No follows or replies right now.",
  system: "No system messages right now.",
  all: "You're all caught up.",
};

function notifRowHTML(n) {
  return `
    <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-subtle);">
      <span class="icon-btn" style="background:var(--surface-2);flex-shrink:0;">${ICONS[NOTIF_ICON[n.type] || "megaphone"]}</span>
      <div>
        <div style="font-size:13.5px;${n.unread ? "font-weight:600;" : "color:var(--text-secondary);"}">${n.text}</div>
        <div style="font-size:11.5px;color:var(--text-tertiary);margin-top:3px;">${n.time}</div>
      </div>
    </div>`;
}

function notifListHTML(filter = "all") {
  const items = filter === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => n.category === filter);
  return items.length
    ? items.map(notifRowHTML).join("")
    : emptyStateHTML({ icon: "bell", title: "Nothing here", body: NOTIF_EMPTY[filter] || NOTIF_EMPTY.all, style: "padding:48px 8px;" });
}

function wireNotifications() {
  const tabs = document.getElementById("notif-tabs");
  const list = document.getElementById("notif-list");
  if (!tabs || !list) return;
  wireTabs(tabs, (filter) => { list.innerHTML = notifListHTML(filter); list.scrollTop = 0; });
}

function renderGlobalOverlays() {
  const el = document.getElementById("shell-overlays");
  if (!el) return;
  el.innerHTML = `
    <div class="overlay" id="overlay"></div>

    <div class="drawer" id="notif-drawer">
      <div class="drawer-head">
        <h3 style="font-size:17px;">Notifications</h3>
        <button class="icon-btn" onclick="closeModals()">${ICONS.x}</button>
      </div>
      <div class="tabs" id="notif-tabs" style="margin:14px 20px 0;">
        <button class="tab active" data-filter="all">All</button>
        <button class="tab" data-filter="lectures">Lectures</button>
        <button class="tab" data-filter="social">Social</button>
        <button class="tab" data-filter="system">System</button>
      </div>
      <div class="drawer-body" id="notif-list">${notifListHTML("all")}</div>
      <div style="padding:14px 20px;border-top:1px solid var(--border-subtle);">
        <button class="btn btn-secondary" style="width:100%;" onclick="toast('All notifications marked as read')">Mark all as read</button>
      </div>
    </div>

    <div class="drawer" id="queue-drawer">
      <div class="drawer-head">
        <h3 style="font-size:17px;">Queue</h3>
        <button class="icon-btn" onclick="closeModals()">${ICONS.x}</button>
      </div>
      <div class="drawer-body">
        <div class="nav-group-label">Now Playing</div>
        <div style="display:flex;gap:10px;align-items:center;padding:8px 0 16px;">
          <img src="${STATE.currentTrack.art}" style="width:44px;height:44px;border-radius:6px;object-fit:cover;" />
          <div><div style="font-size:13.5px;font-weight:600;color:var(--accent);">${STATE.currentTrack.title}</div><div style="font-size:12px;color:var(--text-secondary);">${STATE.currentTrack.artist}</div></div>
        </div>
        <div class="nav-group-label">Next Up</div>
        ${STATE.queue.map((t) => `
          <div style="display:flex;gap:10px;align-items:center;padding:8px 0;">
            <img src="${t.art}" style="width:44px;height:44px;border-radius:6px;object-fit:cover;" />
            <div style="min-width:0;flex:1;"><div class="truncate" style="font-size:13.5px;font-weight:600;">${t.title}</div><div class="truncate" style="font-size:12px;color:var(--text-secondary);">${t.artist}</div></div>
            <span style="font-size:12px;color:var(--text-tertiary);">${fmtDuration(t.duration)}</span>
          </div>`).join("")}
      </div>
    </div>

    <div class="modal" id="create-playlist-modal">
      <div class="modal-head"><h3>Create Collection</h3><button class="icon-btn" onclick="closeModals()">${ICONS.x}</button></div>
      <div class="field"><label>Collection name</label><input class="input" placeholder="e.g. Friday Reminders" /></div>
      <div class="field"><label>Description</label><textarea class="textarea" placeholder="What's this collection about?"></textarea></div>
      <div class="field"><label>Privacy</label>
        <select class="select"><option>Public</option><option>Private</option><option>Unlisted</option></select>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModals()">Cancel</button>
        <button class="btn btn-primary" onclick="closeModals();toast('Collection created','success')">Create Collection</button>
      </div>
    </div>
  `;
  document.getElementById("overlay").addEventListener("click", closeModals);
}

function renderShell(active) {
  renderSidebar(active);
  renderTopbar();
  renderPlayer();
  renderMobileNav(active);
  renderGlobalOverlays();
  wireNotifications();
}

/* =====================================================================
   Admin Dashboard Shell
   ===================================================================== */
const ADMIN_NAV = [
  { id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "grid" },
  { id: "artists", label: "Sheikhs", href: "artists.html", icon: "users" },
  { id: "albums", label: "Series", href: "albums.html", icon: "disc" },
  { id: "tracks", label: "Lectures", href: "tracks.html", icon: "layers" },
  { id: "genres", label: "Topics", href: "genres.html", icon: "tag" },
  { id: "playlists", label: "Collections", href: "playlists.html", icon: "library" },
  { id: "users", label: "Users", href: "users.html", icon: "users" },
  { id: "comments", label: "Comments", href: "comments.html", icon: "message" },
  { id: "downloads", label: "Downloads", href: "downloads.html", icon: "download" },
  { id: "featured", label: "Featured Content", href: "featured.html", icon: "star" },
  { id: "reports", label: "Reports", href: "reports.html", icon: "flag" },
  { id: "settings", label: "Settings", href: "settings.html", icon: "settings" },
];

function renderAdminSidebar(active) {
  const el = document.getElementById("admin-sidebar");
  if (!el) return;
  el.innerHTML = `
    <a class="sidebar-logo" href="dashboard.html">
      <span class="logo-mark"><img class="logo-blue" src="../img/logo-mark-blue.png" alt="" width="36" height="36" /><img class="logo-green" src="../img/logo-mark-green.png" alt="" width="36" height="36" /></span>
      <span class="word">Ugandan Sheikhs</span>
      <span class="badge badge-neutral" style="margin-left:auto;">Admin</span>
    </a>
    <nav class="nav-group" style="flex:1;overflow-y:auto;">
      ${ADMIN_NAV.map((i) => `<a class="nav-link ${active === i.id ? "active" : ""}" href="${i.href}">${ICONS[i.icon]}<span>${i.label}</span></a>`).join("")}
    </nav>
    <div class="sidebar-bottom">
      <div class="user-chip" style="width:100%;">
        <img class="avatar" src="${CURRENT_USER.avatar}" width="30" height="30" />
        <span class="name">Admin · ${CURRENT_USER.name}</span>
      </div>
      <a class="nav-link" href="../login.html">${ICONS.logout}<span>Logout</span></a>
    </div>
  `;
}

function renderAdminTopbar(title) {
  const el = document.getElementById("admin-topbar");
  if (!el) return;
  el.innerHTML = `
    <button class="icon-btn admin-menu-btn" data-admin-menu aria-label="Open menu">${ICONS.menu}</button>
    <h1 style="font-size:18px;font-family:var(--font-display);">${title}</h1>
    <div class="search-field" style="max-width:340px;margin-left:24px;">${ICONS.search}<input placeholder="Search admin…" /></div>
    <div class="topbar-right">
      <button class="btn btn-primary btn-sm" onclick="toast('Quick add menu opened')">${ICONS.plus}<span>Quick Add</span></button>
      <button class="icon-btn" style="position:relative;">${ICONS.bell}<span style="position:absolute;top:5px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--accent);"></span></button>
      <img class="avatar" src="${CURRENT_USER.avatar}" width="32" height="32" />
    </div>
  `;
}

function initAdminPage(active, title) {
  renderAdminSidebar(active);
  renderAdminTopbar(title);
  ensureOverlay();
  if (!document.querySelector(".admin-scrim")) {
    const scrim = document.createElement("div");
    scrim.className = "admin-scrim";
    scrim.setAttribute("data-admin-menu-close", "");
    document.body.appendChild(scrim);
  }
}

/* ---- Admin slide-in menu (small screens) ---- */
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-admin-menu]")) { document.body.classList.toggle("admin-nav-open"); return; }
  if (e.target.closest("[data-admin-menu-close]") || e.target.closest(".admin-sidebar a")) document.body.classList.remove("admin-nav-open");
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.body.classList.remove("admin-nav-open"); });

/* ---- Tables: copy each header label onto its cells so rows can turn into
   labelled cards on small screens (see "data-table" rules in main.css). ---- */
function labelTables() {
  document.querySelectorAll(".data-table").forEach((t) => {
    const heads = [...t.querySelectorAll("thead th")].map((h) => h.textContent.trim());
    t.querySelectorAll("tbody tr").forEach((tr) => {
      [...tr.children].forEach((td, i) => { if (heads[i] && !td.dataset.label) td.dataset.label = heads[i]; });
    });
  });
}
document.addEventListener("DOMContentLoaded", labelTables);
new MutationObserver(labelTables).observe(document.documentElement, { childList: true, subtree: true });