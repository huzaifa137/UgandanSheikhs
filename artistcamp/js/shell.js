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
  { id: "books", label: "Books", href: "books.html", icon: "book" },
];
const NAV_LIBRARY = [
  { id: "library", label: "My Library", href: "library.html", icon: "library" },
  { id: "liked", label: "Liked Lectures", href: "liked.html", icon: "heart" },
  { id: "albums", label: "Series", href: "library.html#albums", icon: "disc" },
  { id: "my-books", label: "My Books", href: "library.html#books", icon: "book" },
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
        ${myCollections().slice(0, 5).map((p) => `<a class="nav-link" href="playlist.html?id=${p.id}"><span style="width:18px;height:18px;border-radius:4px;background:var(--surface-3);flex-shrink:0;background-image:url('${p.art}');background-size:cover;"></span><span class="truncate">${p.name}</span></a>`).join("")}
        <button class="nav-link" id="create-playlist-btn" style="width:100%;">${ICONS.plus}<span>Create Collection</span></button>
      </div>
    </div>
    <div class="sidebar-bottom">
      <a class="nav-link" href="settings.html">${ICONS.settings}<span>Settings</span></a>
      <a class="nav-link ${active === "help" ? "active" : ""}" href="help.html">${ICONS.help}<span>Help</span></a>
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
          <a class="menu-item" href="help.html">${ICONS.help}Help</a>
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

function queueListHTML() {
  if (!STATE.queue.length) return `<p class="text-secondary" style="font-size:13px;padding:8px 0;">Nothing queued yet.</p>`;
  return STATE.queue.map((t) => `
    <div style="display:flex;gap:10px;align-items:center;padding:8px 0;">
      <img src="${t.art}" style="width:44px;height:44px;border-radius:6px;object-fit:cover;" />
      <div style="min-width:0;flex:1;"><div class="truncate" style="font-size:13.5px;font-weight:600;">${t.title}</div><div class="truncate" style="font-size:12px;color:var(--text-secondary);">${t.artist}</div></div>
      <span style="font-size:12px;color:var(--text-tertiary);">${fmtDuration(t.duration)}</span>
    </div>`).join("");
}
function renderQueueList() {
  const el = document.getElementById("queue-list");
  if (el) el.innerHTML = queueListHTML();
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
        <div id="queue-list">${queueListHTML()}</div>
      </div>
    </div>

    <div class="modal" id="create-playlist-modal">
      <div class="modal-head"><h3>Create Collection</h3><button class="icon-btn" onclick="closeModals()">${ICONS.x}</button></div>
      <div class="field"><label>Collection name</label><input class="input" id="new-collection-name" placeholder="e.g. Friday Reminders" /></div>
      <div class="field"><label>Description</label><textarea class="textarea" placeholder="What's this collection about?"></textarea></div>
      <p class="private-note">${ICONS.lock}<span>Collections you create are private. Only you can see and open them.</span></p>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModals()">Cancel</button>
        <button class="btn btn-primary" onclick="createCollectionFromModal()">Create Collection</button>
      </div>
    </div>
  `;
  document.getElementById("overlay").addEventListener("click", closeModals);
}

function createCollectionFromModal() {
  const input = document.getElementById("new-collection-name");
  if (!input.value.trim()) { input.focus(); input.style.borderColor = "var(--error)"; return toast("Give your collection a name", "warning"); }
  input.style.borderColor = ""; input.value = "";
  closeModals();
  toast("Private collection created", "success");
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
/* Admin navigation, grouped. `badge` names a counter from adminQueues() that shows as a pill when above 0. */
const ADMIN_NAV_GROUPS = [
  { label: "Overview", items: [
    { id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "grid" },
  ] },
  { label: "Content", items: [
    { id: "artists", label: "Sheikhs", href: "artists.html", icon: "users" },
    { id: "albums", label: "Series", href: "albums.html", icon: "disc" },
    { id: "tracks", label: "Lectures", href: "tracks.html", icon: "layers" },
    { id: "books", label: "Books", href: "books.html", icon: "book", badge: "draftBooks" },
    { id: "genres", label: "Topics", href: "genres.html", icon: "tag" },
    { id: "playlists", label: "Collections", href: "playlists.html", icon: "library" },
    { id: "featured", label: "Featured Content", href: "featured.html", icon: "star" },
  ] },
  { label: "Community", items: [
    { id: "users", label: "Users", href: "users.html", icon: "users" },
    { id: "comments", label: "Comments", href: "comments.html", icon: "message", badge: "comments" },
    { id: "reports", label: "Reports", href: "reports.html", icon: "flag", badge: "reports" },
  ] },
  { label: "Insights & System", items: [
    { id: "downloads", label: "Downloads", href: "downloads.html", icon: "download" },
    { id: "settings", label: "Settings", href: "settings.html", icon: "settings" },
  ] },
];
const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

/* Work waiting for a human. Used by the sidebar badges, the bell menu and the dashboard "Needs attention" list. */
function adminQueues() {
  const flagged = COMMENTS.filter((c) => c.status !== "Approved").length;
  let stored = [];
  try { stored = typeof loadReports === "function" ? loadReports() : []; } catch {}
  const seeded = COMMENTS.filter((c) => c.status === "Reported").filter((_, i) => i % 2 === 0).length;   // same rule as admin/reports.html
  const openReports = stored.filter((r) => r.status === "Open").length + seeded;
  const draftBooks = BOOKS.filter((b) => b.status !== "Published").length;
  const unmappedBooks = BOOKS.filter((b) => !lecturesOfBook(b).length).length;
  const orphanLectures = TRACKS.filter((t) => !seriesOf(t)).length;
  const emptySeries = ALBUMS.filter((a) => !a.tracks.length).length;
  const suspended = ADMIN_USERS.filter((u) => u.status === "Suspended").length;
  return { comments: flagged, reports: openReports, draftBooks, unmappedBooks, orphanLectures, emptySeries, suspended };
}

function renderAdminSidebar(active) {
  const el = document.getElementById("admin-sidebar");
  if (!el) return;
  const q = adminQueues();
  const link = (i) => `<a class="nav-link ${active === i.id ? "active" : ""}" href="${i.href}">${ICONS[i.icon]}<span>${i.label}</span>${i.badge && q[i.badge] ? `<span class="nav-count" aria-label="${q[i.badge]} waiting">${q[i.badge]}</span>` : ""}</a>`;
  el.innerHTML = `
    <a class="sidebar-logo" href="dashboard.html">
      <span class="logo-mark"><img class="logo-blue" src="../img/logo-mark-blue.png" alt="" width="36" height="36" /><img class="logo-green" src="../img/logo-mark-green.png" alt="" width="36" height="36" /></span>
      <span class="word">Ugandan Sheikhs</span>
      <span class="badge badge-neutral" style="margin-left:auto;">Admin</span>
    </a>
    <nav class="nav-group admin-nav" style="flex:1;overflow-y:auto;">
      ${ADMIN_NAV_GROUPS.map((g) => `<div class="nav-group-label">${g.label}</div>${g.items.map(link).join("")}`).join("")}
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

/* Everything the admin search box can find: [label, sub, href, icon] */
function adminSearchIndex() {
  return [
    ...ARTISTS.map((a) => [a.name, "Sheikh", `artists.html`, "users"]),
    ...ALBUMS.map((a) => [a.title, `Series · ${a.artist}`, `../album.html?id=${a.id}`, "disc"]),
    ...TRACKS.map((t) => [t.title, `Lecture · ${t.artist}`, `../track.html?id=${t.id}`, "layers"]),
    ...BOOKS.map((b) => [b.title, `Book · ${b.author}`, `books.html`, "book"]),
    ...ADMIN_USERS.map((u) => [u.name, `User · ${u.email}`, `users.html`, "users"]),
  ];
}

function renderAdminTopbar(title) {
  const el = document.getElementById("admin-topbar");
  if (!el) return;
  const q = adminQueues();
  const waiting = q.comments + q.reports + q.draftBooks;
  const alerts = [
    q.reports ? { icon: "flag", text: `${q.reports} open report${q.reports === 1 ? "" : "s"} from listeners`, href: "reports.html" } : null,
    q.comments ? { icon: "message", text: `${q.comments} comment${q.comments === 1 ? "" : "s"} waiting for review`, href: "comments.html" } : null,
    q.draftBooks ? { icon: "book", text: `${q.draftBooks} book${q.draftBooks === 1 ? "" : "s"} still in draft`, href: "books.html" } : null,
    q.unmappedBooks ? { icon: "headphones", text: `${q.unmappedBooks} book${q.unmappedBooks === 1 ? " has" : "s have"} no lectures linked`, href: "books.html#mapper" } : null,
  ].filter(Boolean);
  el.innerHTML = `
    <button class="icon-btn admin-menu-btn" data-admin-menu aria-label="Open menu">${ICONS.menu}</button>
    <div class="admin-crumbs"><a href="dashboard.html">Admin</a><span>/</span><h1>${title}</h1></div>
    <div class="admin-search" style="position:relative;">
      <div class="search-field" style="max-width:340px;">${ICONS.search}<input id="admin-search" placeholder="Search sheikhs, lectures, books, users…" autocomplete="off" aria-label="Search admin" /></div>
      <div class="menu" id="admin-search-menu" style="left:0;right:0;top:44px;min-width:320px;"></div>
    </div>
    <div class="topbar-right">
      <div style="position:relative;">
        <button class="btn btn-primary btn-sm" id="admin-quick-btn" aria-haspopup="menu">${ICONS.plus}<span>Quick Add</span></button>
        <div class="menu" id="admin-quick-menu" style="right:0;top:42px;min-width:210px;">
          <a class="menu-item" href="tracks-upload.html">${ICONS.upload}Upload lecture</a>
          <a class="menu-item" href="albums.html#add">${ICONS.disc}Add series</a>
          <a class="menu-item" href="books.html#add">${ICONS.book}Add book</a>
          <a class="menu-item" href="artists.html#add">${ICONS.users}Add sheikh</a>
          <div class="menu-divider"></div>
          <a class="menu-item" href="featured.html">${ICONS.star}Feature something</a>
        </div>
      </div>
      <div style="position:relative;">
        <button class="icon-btn" id="admin-bell-btn" style="position:relative;" aria-label="${waiting} items need attention" aria-haspopup="menu">${ICONS.bell}${waiting ? `<span class="bell-count">${waiting > 9 ? "9+" : waiting}</span>` : ""}</button>
        <div class="menu" id="admin-bell-menu" style="right:0;top:42px;min-width:290px;">
          <div class="nav-group-label" style="padding:6px 10px;">Needs attention</div>
          ${alerts.length ? alerts.map((a) => `<a class="menu-item" href="${a.href}">${ICONS[a.icon]}${a.text}</a>`).join("") : `<div class="menu-item" style="color:var(--text-secondary);">You're all caught up.</div>`}
        </div>
      </div>
      <div style="position:relative;">
        <button class="user-chip" id="admin-user-btn" aria-haspopup="menu"><img class="avatar" src="${CURRENT_USER.avatar}" width="30" height="30" alt="${CURRENT_USER.name}" /></button>
        <div class="menu" id="admin-user-menu" style="right:0;top:44px;min-width:200px;">
          <div class="nav-group-label" style="padding:6px 10px;">${CURRENT_USER.name}</div>
          <a class="menu-item" href="settings.html">${ICONS.settings}Settings</a>
          <a class="menu-item" href="../index.html" target="_blank" rel="noopener">${ICONS.eye}View listener site</a>
          <div class="menu-divider"></div>
          <a class="menu-item danger" href="../login.html">${ICONS.logout}Sign out</a>
        </div>
      </div>
    </div>
  `;
  wireMenu("admin-quick-btn", "admin-quick-menu");
  wireMenu("admin-bell-btn", "admin-bell-menu");
  wireMenu("admin-user-btn", "admin-user-menu");
  const input = document.getElementById("admin-search"), box = document.getElementById("admin-search-menu");
  let index = null;
  input.addEventListener("input", () => {
    const v = input.value.trim().toLowerCase();
    if (!v) { box.classList.remove("open"); return; }
    index = index || adminSearchIndex();
    const hits = index.filter(([t, sub]) => `${t} ${sub}`.toLowerCase().includes(v)).slice(0, 8);
    box.innerHTML = hits.length
      ? hits.map(([t, sub, href, icon]) => `<a class="menu-item" href="${href}">${ICONS[icon]}<span style="min-width:0;"><span class="truncate" style="display:block;">${escapeHTML(t)}</span><span class="truncate" style="display:block;font-size:11.5px;color:var(--text-tertiary);">${escapeHTML(sub)}</span></span></a>`).join("")
      : `<div class="menu-item" style="color:var(--text-secondary);">No matches for “${escapeHTML(input.value.trim())}”</div>`;
    box.classList.add("open");
  });
  input.addEventListener("click", (e) => e.stopPropagation());
  box.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("keydown", (e) => { if (e.key === "/" && !e.target.closest("input,textarea,select")) { e.preventDefault(); input.focus(); } });
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