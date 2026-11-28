/* =====================================================================
   Ugandan Sheikhs — Admin core
   Loaded on every admin page, after data.js / icons.js / shell.js / app.js.

   Roles & access ........ AdminAuth, ROLES
   Settings .............. AdminSettings
   Audit trail ........... Audit
   Entities, trash ....... Admin  (patch, setStatus, remove, restore, purge, create)
   Dialogs ............... Confirm (ask / prompt), toastUndo
   Side panel ............ Panel
   Reusable table ........ DataTable
   Session timeout ....... Session

   Prototype note: everything is stored in the browser (AdminDB in data.js). A real backend must
   re-check every permission on the server — hiding a button is never a security control.
   Laravel mapping: README, section "Admin (roles, audit, trash, settings)".
   ===================================================================== */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => (typeof escapeHTML === "function" ? escapeHTML(s) : String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])));
  const db = () => AdminDB.get();
  const save = () => AdminDB.save();
  const uid = (p) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const fmtWhen = (iso) => { const d = new Date(iso); return isNaN(d) ? String(iso || "") : d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); };
  const ago = (iso) => {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (isNaN(s)) return "";
    if (s < 60) return "just now"; if (s < 3600) return `${Math.floor(s / 60)} min ago`; if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    return `${Math.floor(s / 86400)} d ago`;
  };
  const icon = (n) => (typeof ICONS !== "undefined" && ICONS[n]) || "";

  /* ---------------------------------------------------------------
     Roles & permissions
     --------------------------------------------------------------- */
  const ROLES = {
    super_admin: { label: "Super admin", badge: "badge-accent", desc: "Full access: content, people, settings, audit log, trash." },
    editor: { label: "Editor", badge: "badge-neutral", desc: "Creates and publishes content and books. No users, settings or staff." },
    moderator: { label: "Moderator", badge: "badge-warning", desc: "Reviews comments and reports, warns and suspends listeners." },
    sheikh: { label: "Sheikh account", badge: "badge-success", desc: "Sees and edits only their own lectures, series, books and stats." },
  };
  const PERMS = {
    super_admin: ["*"],
    editor: ["content.view", "content.edit", "content.publish", "content.delete", "books.manage", "analytics.view", "trash.restore", "comments.view"],
    moderator: ["content.view", "comments.view", "comments.moderate", "reports.manage", "users.view", "users.warn", "users.suspend"],
    sheikh: ["content.view", "content.edit", "content.publish", "books.manage", "analytics.view", "comments.view"],
  };
  const PAGE_ACCESS = {
    dashboard: ["super_admin", "editor", "moderator", "sheikh"],
    artists: ["super_admin", "editor", "sheikh"], albums: ["super_admin", "editor", "sheikh"], tracks: ["super_admin", "editor", "sheikh"],
    books: ["super_admin", "editor", "sheikh"], genres: ["super_admin", "editor"], playlists: ["super_admin", "editor"], featured: ["super_admin", "editor"],
    users: ["super_admin", "moderator"], comments: ["super_admin", "editor", "moderator", "sheikh"], moderation: ["super_admin", "moderator"],
    reports: ["super_admin", "editor", "sheikh"], downloads: ["super_admin", "editor", "sheikh"],
    roles: ["super_admin"], audit: ["super_admin"], trash: ["super_admin", "editor"], settings: ["super_admin"],
  };
  const SESSION_KEY = "us_admin_session";
  const seedStaff = () => [
    { id: "stf-1", name: "Amina Nakato", email: "amina@ugandansheikhs.dev", role: "super_admin", status: "Active", created: "2026-01-12T08:00:00Z" },
    { id: "stf-2", name: "Yusuf Kato", email: "yusuf@ugandansheikhs.dev", role: "editor", status: "Active", created: "2026-02-03T08:00:00Z" },
    { id: "stf-3", name: "Mariam Nabirye", email: "mariam@ugandansheikhs.dev", role: "moderator", status: "Active", created: "2026-03-18T08:00:00Z" },
    { id: "stf-4", name: ARTISTS[0].name, email: "hamza@ugandansheikhs.dev", role: "sheikh", sheikhId: ARTISTS[0].id, status: "Active", created: "2026-04-02T08:00:00Z" },
    { id: "stf-5", name: ARTISTS[5].name, email: "swiddiq@ugandansheikhs.dev", role: "sheikh", sheikhId: ARTISTS[5].id, status: "Active", created: "2026-04-09T08:00:00Z" },
  ];
  function staffList() { const d = db(); if (!d.staff) { d.staff = seedStaff(); save(); } return d.staff; }
  function readSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } }
  function writeSession(s) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {} }

  const AdminAuth = {
    ROLES, PERMS, PAGE_ACCESS,
    staff: staffList,
    session: readSession,
    me() { const s = readSession(); if (!s) return null; return staffList().find((x) => x.id === s.staffId) || null; },
    role() { const m = this.me(); return m ? m.role : null; },
    login(staffId) {
      const m = staffList().find((x) => x.id === staffId);
      if (!m || m.status !== "Active") return false;
      writeSession({ staffId: m.id, at: Date.now(), last: Date.now() });
      Audit.log({ action: "Signed in", kind: "session", id: m.id, label: m.name, detail: ROLES[m.role].label, silentIfNoSession: true, who: m });
      return true;
    },
    logout(reason) { const m = this.me(); if (m) Audit.log({ action: reason || "Signed out", kind: "session", id: m.id, label: m.name }); try { localStorage.removeItem(SESSION_KEY); } catch {} },
    can(perm) { const r = this.role(); if (!r) return false; const p = PERMS[r]; return p.includes("*") || p.includes(perm); },
    canPage(id) { const r = this.role(); return !!r && (!PAGE_ACCESS[id] || PAGE_ACCESS[id].includes(r)); },
    sheikhScope() { const m = this.me(); return m && m.role === "sheikh" ? m.sheikhId : null; },
    /* does the signed-in person own this row? (only sheikh accounts are limited) */
    owns(kind, row) {
      const sid = this.sheikhScope(); if (!sid || !row) return true;
      if (kind === "artist") return row.id === sid;
      if (kind === "album" || kind === "track") return row.artistId === sid;
      if (kind === "book") return row.sheikhId === sid;
      if (kind === "comment") { const t = TRACKS.find((x) => x.id === row.trackId); return !!t && t.artistId === sid; }
      return false;
    },
  };

  /* A sheikh account only ever receives its own rows. (Demo: done by trimming the in-memory lists;
     the real backend must filter in the query and authorise every request.) */
  (function scopeForRole() {
    const sid = AdminAuth.sheikhScope(); if (!sid) return;
    const keep = (arr, fn) => { for (let i = arr.length - 1; i >= 0; i--) if (!fn(arr[i])) arr.splice(i, 1); };
    const own = new Set(TRACKS.filter((t) => t.artistId === sid).map((t) => t.id));
    keep(ARTISTS, (a) => a.id === sid);
    keep(ALBUMS, (a) => a.artistId === sid);
    keep(TRACKS, (t) => t.artistId === sid);
    keep(COMMENTS, (c) => own.has(c.trackId));
    keep(BOOKS, (b) => b.sheikhId === sid);
    ALBUMS.forEach((a) => { a.tracks = a.tracks.filter((t) => t.artistId === sid); });
  })();

  /* ---------------------------------------------------------------
     Settings
     --------------------------------------------------------------- */
  const SETTING_DEFAULTS = () => ({
    branding: { siteName: "Ugandan Sheikhs", tagline: "Lectures, series and books from Uganda's sheikhs", supportEmail: "support@ugandansheikhs.dev", logo: "" },
    uploads: { maxAudioMB: 200, maxPdfMB: 60, maxImageMB: 5, audioFormats: ["mp3", "m4a", "wav", "flac", "ogg"], requireReview: true },
    audio: { bitrate: 128, lowBandwidth: true, normalize: true, mono: false, downloadQuality: "standard" },
    maintenance: { on: false, title: "We'll be right back", message: "Ugandan Sheikhs is being updated. Please check back shortly.", until: "", allowAdmins: true },
    security: { timeoutMin: 30, trashDays: 30, confirmDestructive: true, minPassword: 10 },
    email: { templates: {} },
    moderation: { autoHideAfter: 5, profanityFilter: true },
  });
  const EMAIL_TEMPLATES = [
    { id: "welcome", name: "Welcome", when: "A listener creates an account", subject: "Welcome to {{site}}, {{name}}", body: "Assalamu alaikum {{name}},\n\nWelcome to {{site}}. You can now follow your favourite sheikhs, save lectures and read books online.\n\nStart listening: {{link}}\n\nJazakallahu khayran,\nThe {{site}} team", vars: ["name", "site", "link"] },
    { id: "reset", name: "Password reset", when: "A listener or staff member asks to reset a password", subject: "Reset your {{site}} password", body: "Assalamu alaikum {{name}},\n\nUse this link to choose a new password. It expires in 60 minutes:\n{{link}}\n\nIf you didn't ask for this, you can ignore this email.", vars: ["name", "site", "link"] },
    { id: "warning", name: "Comment warning", when: "A moderator warns a listener", subject: "A note about your comment on {{site}}", body: "Assalamu alaikum {{name}},\n\nA comment of yours was reviewed by our moderators: {{reason}}\n\nPlease keep comments respectful and on topic. Repeated breaches may lead to suspension.\n\nThe {{site}} moderation team", vars: ["name", "site", "reason"] },
    { id: "report", name: "Report received", when: "A listener sends a report", subject: "We received your report", body: "Assalamu alaikum {{name}},\n\nThank you for telling us about \"{{item}}\". Our team will review it and act where needed.\n\nJazakallahu khayran,\nThe {{site}} team", vars: ["name", "site", "item"] },
    { id: "published", name: "Lecture published", when: "A followed sheikh publishes a lecture", subject: "New from {{sheikh}}: {{item}}", body: "Assalamu alaikum {{name}},\n\n{{sheikh}} just published \"{{item}}\".\n\nListen now: {{link}}", vars: ["name", "sheikh", "item", "link"] },
    { id: "summary", name: "Scheduled summary", when: "A scheduled analytics summary is sent to staff", subject: "{{site}} {{period}} summary", body: "Assalamu alaikum,\n\nHere is your {{period}} summary for {{scope}}:\n\n{{table}}\n\nOpen the full report: {{link}}", vars: ["site", "period", "scope", "table", "link"] },
  ];
  const AdminSettings = {
    TEMPLATES: EMAIL_TEMPLATES,
    defaults: SETTING_DEFAULTS,
    get() {
      const d = SETTING_DEFAULTS(), s = db().settings || {};
      Object.keys(d).forEach((k) => { d[k] = { ...d[k], ...(s[k] || {}) }; });
      return d;
    },
    set(section, patch) {
      const d = db(); d.settings = d.settings || {};
      d.settings[section] = { ...(d.settings[section] || {}), ...patch };
      save();
    },
    template(id) {
      const base = EMAIL_TEMPLATES.find((t) => t.id === id), over = (this.get().email.templates || {})[id] || {};
      return { ...base, ...over, custom: !!(over.subject || over.body) };
    },
  };

  /* ---------------------------------------------------------------
     Audit log
     --------------------------------------------------------------- */
  const Audit = {
    log(e) {
      const d = db(), who = e.who || AdminAuth.me();
      const entry = { id: uid("aud"), at: new Date().toISOString(), by: who ? who.name : "System", role: who ? who.role : "", action: e.action, kind: e.kind || "", itemId: e.id || "", label: e.label || "", detail: e.detail || "", undo: e.undo || null };
      d.audit.unshift(entry);
      if (d.audit.length > 800) d.audit.length = 800;
      save();
      return entry;
    },
    list() { return db().audit; },
  };

  /* ---------------------------------------------------------------
     Entities
     --------------------------------------------------------------- */
  const COLL = () => ({ artist: ARTISTS, album: ALBUMS, track: TRACKS, user: ADMIN_USERS, comment: COMMENTS, book: BOOKS, genre: GENRES });
  const KIND_LABEL = { artist: "Sheikh", album: "Series", track: "Lecture", user: "User", comment: "Comment", book: "Book", genre: "Topic" };
  const rowLabel = (kind, r) => (!r ? "" : kind === "artist" || kind === "user" || kind === "genre" ? r.name : kind === "comment" ? `${r.user}: ${String(r.body).slice(0, 40)}…` : r.title);

  const Admin = {
    KIND_LABEL,
    collection(kind) { return COLL()[kind] || []; },
    find(kind, id) { return this.collection(kind).find((x) => x.id === id) || null; },
    visible(kind) { return this.collection(kind).filter((r) => !r._del); },
    label: rowLabel,
    patch(kind, id, patch, opts = {}) {
      const row = this.find(kind, id); if (!row) return null;
      const before = {}; Object.keys(patch).forEach((k) => { before[k] = row[k]; });
      Object.assign(row, patch);
      const d = db();
      if (d.created[kind] && d.created[kind].some((x) => x.id === id)) Object.assign(d.created[kind].find((x) => x.id === id), patch);
      d.ent[kind][id] = { ...(d.ent[kind][id] || {}), ...patch };
      save();
      if (opts.audit !== false) {
        const changed = Object.keys(patch).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(patch[k]));
        if (changed.length) Audit.log({ action: opts.action || "Edited", kind, id, label: rowLabel(kind, row), detail: changed.map((k) => `${k}: ${short(before[k])} → ${short(patch[k])}`).join("; ") });
      }
      return row;
    },
    setStatus(kind, ids, status) {
      let n = 0;
      ids.forEach((id) => {
        const r = this.find(kind, id); if (!r || r.status === status) return;
        const from = r.status;
        this.patch(kind, id, { status }, { action: `Set ${status.toLowerCase()}`, audit: false });
        if (kind === "track") { const L = db().lectures[id] = { ...(db().lectures[id] || {}), status }; if (status !== "Scheduled") delete L.publishAt; save(); }
        Audit.log({ action: status === "Published" ? "Published" : status === "Draft" ? "Unpublished" : `Set ${status.toLowerCase()}`, kind, id, label: rowLabel(kind, r), detail: `${from} → ${status}` });
        n++;
      });
      return n;
    },
    setFeatured(kind, ids, on) {
      let n = 0;
      ids.forEach((id) => { const r = this.find(kind, id); if (r && !!r.featured !== on) { this.patch(kind, id, { featured: on }, { action: on ? "Featured" : "Unfeatured" }); n++; } });
      return n;
    },
    /* Move rows to the trash (soft delete). Everything can be restored until it is emptied. */
    remove(kind, ids) {
      const d = db(), done = [];
      ids.forEach((id) => {
        const r = this.find(kind, id); if (!r || r._del) return;
        r._del = true;
        const t = { tid: uid("trs"), kind, id, label: rowLabel(kind, r), sub: kind === "track" || kind === "album" ? r.artist : kind === "book" ? r.author : kind === "comment" ? `on ${(TRACKS.find((x) => x.id === r.trackId) || {}).title || "a lecture"}` : "", at: new Date().toISOString(), by: (AdminAuth.me() || {}).name || "System" };
        d.trash.unshift(t); done.push(t);
        Audit.log({ action: "Deleted", kind, id, label: t.label, detail: "Moved to trash", undo: { type: "restore", tid: t.tid } });
      });
      save();
      return done;
    },
    restore(tid, opts = {}) {
      const d = db(), i = d.trash.findIndex((t) => t.tid === tid); if (i < 0) return false;
      const t = d.trash[i]; if (t.purged) return false;
      d.trash.splice(i, 1);
      const r = this.find(t.kind, t.id); if (r) r._del = false;
      save();
      if (!opts.silent) Audit.log({ action: "Restored", kind: t.kind, id: t.id, label: t.label, detail: "Back from trash" });
      return true;
    },
    /* Permanent delete: row stays hidden for good (kept as a tombstone so seeded demo rows do not come back). */
    purge(tid) {
      const d = db(), t = d.trash.find((x) => x.tid === tid); if (!t || t.purged) return false;
      t.purged = true; t.purgedAt = new Date().toISOString();
      if (t.kind === "book") BookFiles.del(t.id).catch(() => {});
      save();
      Audit.log({ action: "Deleted forever", kind: t.kind, id: t.id, label: t.label });
      return true;
    },
    trashed() { return db().trash.filter((t) => !t.purged); },
    autoPurge() {
      const days = AdminSettings.get().security.trashDays; if (!days) return;
      const lim = Date.now() - days * 86400000; let n = 0;
      db().trash.forEach((t) => { if (!t.purged && new Date(t.at).getTime() < lim) { t.purged = true; n++; } });
      if (n) { save(); Audit.log({ action: "Trash emptied automatically", kind: "trash", label: `${n} item${n === 1 ? "" : "s"} older than ${days} days`, who: { name: "System", role: "" } }); }
    },
    create(kind, obj) {
      const d = db(); d.created[kind].push(obj); this.collection(kind).push(obj); obj._del = false;
      Audit.log({ action: "Created", kind, id: obj.id, label: rowLabel(kind, obj) });
      return obj;
    },
    nextId(kind) {
      const pre = { artist: "", album: "alb-", track: "trk-", book: "book-" }[kind] || "";
      if (kind === "artist") return null;
      const nums = this.collection(kind).map((x) => parseInt(String(x.id).replace(/\D+/g, ""), 10)).filter(Number.isFinite);
      return `${pre}${Math.max(0, ...nums) + 1}`;
    },
    /* The one delete flow every table uses: confirm → trash → toast with Undo. */
    async deleteFlow(kind, ids, opt = {}) {
      const rows = ids.map((i) => this.find(kind, i)).filter(Boolean); if (!rows.length) return false;
      const noun = KIND_LABEL[kind].toLowerCase(), days = AdminSettings.get().security.trashDays;
      const title = rows.length === 1 ? `Move “${short(rowLabel(kind, rows[0]))}” to the trash?` : `Move ${rows.length} ${noun}s to the trash?`;
      const ok = await Confirm.ask({ title, body: `${opt.extra || ""}<p style="margin-top:8px;">You can restore ${rows.length === 1 ? "it" : "them"} from <strong>Trash</strong>${days ? ` for ${days} days` : ""}.</p>`, confirmText: "Move to trash", tone: "danger", typeText: rows.length >= 10 ? "DELETE" : undefined });
      if (!ok) return false;
      const done = this.remove(kind, rows.map((r) => r.id));
      toastUndo(`${done.length} ${noun}${done.length === 1 ? "" : "s"} moved to trash`, () => { done.forEach((t) => this.restore(t.tid)); if (opt.after) opt.after(); toast("Restored", "success"); });
      if (opt.after) opt.after();
      return true;
    },
    slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item"; },
    /* Pre-publish checklist for a lecture. `over` lets the editor test unsaved values.
       Each item: { id, label, state: ok|bad|warn, required, note } */
    lectureChecklist(t, over = {}) {
      const L = { ...this.lectureMeta(t.id), ...(over.meta || {}) }, v = { ...t, ...over };
      const series = v.seriesId ? ALBUMS.find((a) => a.id === v.seriesId) : (typeof seriesOf === "function" ? seriesOf(t) : null);
      const hasAudio = v.audioName || v.audioAttached || (!String(t.id).startsWith("trk-new") && !(db().created.track || []).some((x) => x.id === t.id)) || !!L.audioName;
      const book = v.bookRef;
      const bookOk = !book || (() => { const b = BOOKS.find((x) => x.id === book.bookId); return !!b && Number.isFinite(book.from) && Number.isFinite(book.to) && book.from >= 1 - b.pageOffset && book.to <= b.pages - b.pageOffset && book.to >= book.from; })();
      const when = (over.status || L.status || v.status) === "Scheduled" ? new Date(over.publishAt || L.publishAt || "") : null;
      const items = [
        { id: "title", label: "Has a clear title", required: true, ok: String(v.title || "").trim().length >= 5, note: "At least 5 characters." },
        { id: "sheikh", label: "A sheikh is assigned", required: true, ok: !!v.artistId && !!ARTISTS.find((a) => a.id === v.artistId) },
        { id: "series", label: "Belongs to a series", required: true, ok: !!series, note: "Pick a series so listeners can find it." },
        { id: "topic", label: "Topic chosen", required: true, ok: !!v.genre },
        { id: "audio", label: "Audio file attached", required: true, ok: !!hasAudio, note: "Upload the recording in the Audio tab." },
        { id: "duration", label: "Duration is known", required: true, ok: Number(v.duration) > 0 },
        { id: "book", label: "Linked book pages are valid", required: true, ok: bookOk, note: "Check the from/to pages against the book." },
        { id: "schedule", label: "Publish date is in the future", required: true, ok: !when || (!isNaN(when) && when.getTime() > Date.now() - 60000), skip: !when, note: "Pick a date and time that hasn't passed." },
        { id: "desc", label: "Description of 20+ characters", required: false, ok: String(v.description || "").trim().length >= 20 },
        { id: "chapters", label: "Chapters or timestamps added", required: false, ok: !!((over.meta && over.meta.chapters) || L.chapters || v.chapters || []).length },
        { id: "transcript", label: "Transcript uploaded", required: false, ok: !!(L.transcript || (over.meta && over.meta.transcript)) },
      ].filter((i) => !i.skip);
      return items.map((i) => ({ ...i, state: i.ok ? "ok" : i.required ? "bad" : "warn" }));
    },
    lectureReady(t, over) { return this.lectureChecklist(t, over).every((i) => i.state !== "bad"); },
    lectureMeta(id) { return db().lectures[id] || {}; },
    setLectureMeta(id, patch) { const d = db(); d.lectures[id] = { ...(d.lectures[id] || {}), ...patch }; save(); },
    esc, fmtWhen, ago, uid, icon,
    queues() { return typeof adminQueues === "function" ? adminQueues() : {}; },
  };
  function short(v) { if (v === undefined || v === null || v === "") return "∅"; const s = typeof v === "object" ? JSON.stringify(v) : String(v); return s.length > 40 ? s.slice(0, 37) + "…" : s; }

  /* ---------------------------------------------------------------
     Toast with an Undo button
     --------------------------------------------------------------- */
  function toastUndo(message, undo, label = "Undo") {
    let stack = document.querySelector(".toast-stack");
    if (!stack) { stack = document.createElement("div"); stack.className = "toast-stack"; document.body.appendChild(stack); }
    const el = document.createElement("div"); el.className = "toast warning toast-undo";
    el.innerHTML = `<span>${esc(message)}</span><button type="button" class="toast-btn">${esc(label)}</button>`;
    stack.appendChild(el);
    const kill = () => { el.style.opacity = "0"; setTimeout(() => el.remove(), 220); };
    el.querySelector("button").addEventListener("click", () => { undo(); kill(); });
    setTimeout(kill, 8000);
  }

  /* ---------------------------------------------------------------
     Confirm / prompt dialogs (own overlay, so they stack above the side panel)
     --------------------------------------------------------------- */
  const Confirm = {
    _open(html, onReady) {
      return new Promise((resolve) => {
        const ov = document.createElement("div"); ov.className = "confirm-overlay";
        ov.innerHTML = `<div class="confirm-box" role="alertdialog" aria-modal="true">${html}</div>`;
        document.body.appendChild(ov);
        requestAnimationFrame(() => ov.classList.add("open"));
        const box = ov.querySelector(".confirm-box");
        const finish = (v) => { document.removeEventListener("keydown", onKey, true); ov.classList.remove("open"); setTimeout(() => ov.remove(), 180); resolve(v); };
        const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); finish(null); } };
        document.addEventListener("keydown", onKey, true);
        ov.addEventListener("mousedown", (e) => { if (e.target === ov) finish(null); });
        onReady(box, finish);
      });
    },
    /* ask({title, body, confirmText, tone:'danger'|'primary', typeText}) -> Promise<boolean> */
    async ask(o) {
      const settings = AdminSettings.get().security;
      if (o.tone === "danger" && settings.confirmDestructive === false && !o.typeText) return true;
      const r = await this._open(`
        <div class="confirm-icon ${o.tone === "danger" ? "danger" : ""}">${icon(o.tone === "danger" ? "alertTriangle" : "check")}</div>
        <h3>${esc(o.title || "Are you sure?")}</h3>
        <div class="confirm-body">${o.body || ""}</div>
        ${o.typeText ? `<div class="field" style="margin:14px 0 0;"><label>Type <strong>${esc(o.typeText)}</strong> to confirm</label><input class="input" data-confirm-type autocomplete="off" /></div>` : ""}
        <div class="confirm-actions"><button type="button" class="btn btn-ghost" data-no>Cancel</button><button type="button" class="btn ${o.tone === "danger" ? "btn-danger" : "btn-primary"}" data-yes ${o.typeText ? "disabled" : ""}>${esc(o.confirmText || "Confirm")}</button></div>`,
      (box, finish) => {
        const yes = box.querySelector("[data-yes]"), t = box.querySelector("[data-confirm-type]");
        box.querySelector("[data-no]").addEventListener("click", () => finish(false));
        yes.addEventListener("click", () => finish(true));
        if (t) { t.addEventListener("input", () => { yes.disabled = t.value.trim().toUpperCase() !== o.typeText.toUpperCase(); }); setTimeout(() => t.focus(), 60); }
        else setTimeout(() => (o.tone === "danger" ? box.querySelector("[data-no]") : yes).focus(), 60);
      });
      return r === true;
    },
    /* prompt({title, label, value, placeholder, confirmText, multiline}) -> Promise<string|null> */
    async prompt(o) {
      const r = await this._open(`
        <h3>${esc(o.title || "")}</h3>
        ${o.body ? `<div class="confirm-body">${o.body}</div>` : ""}
        <div class="field" style="margin:12px 0 0;"><label>${esc(o.label || "")}</label>${o.multiline ? `<textarea class="textarea" data-prompt rows="4" placeholder="${esc(o.placeholder || "")}">${esc(o.value || "")}</textarea>` : `<input class="input" data-prompt value="${esc(o.value || "")}" placeholder="${esc(o.placeholder || "")}" />`}</div>
        <div class="confirm-actions"><button type="button" class="btn btn-ghost" data-no>Cancel</button><button type="button" class="btn btn-primary" data-yes>${esc(o.confirmText || "Save")}</button></div>`,
      (box, finish) => {
        const inp = box.querySelector("[data-prompt]");
        const go = () => { const v = inp.value.trim(); if (!v && !o.allowEmpty) { inp.focus(); return; } finish(v); };
        box.querySelector("[data-no]").addEventListener("click", () => finish(null));
        box.querySelector("[data-yes]").addEventListener("click", go);
        if (!o.multiline) inp.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
        setTimeout(() => { inp.focus(); inp.select && inp.select(); }, 60);
      });
      return r === null || r === false ? null : r;
    },
  };

  /* ---------------------------------------------------------------
     Side panel: view / edit one item without leaving the table
     Panel.open({ title, subtitle, img, badges, sections:[{title, fields:[…]}], values, onSave(vals), onDelete,
                  actions:[{label, icon, run}], nav:{index, count, go(i)} , readOnly })
     field: { key, label, type: text|textarea|select|number|date|datetime|toggle|readonly|html, options, hint, rows, required }
     --------------------------------------------------------------- */
  const Panel = {
    el: null, cfg: null, dirty: false,
    _ensure() {
      if (this.el) return;
      ensureOverlay();
      const d = document.createElement("aside");
      d.className = "drawer panel"; d.id = "admin-panel"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
      document.body.appendChild(d); this.el = d;
      document.addEventListener("click", (e) => { if (this.isOpen() && this.dirty && e.target.id === "overlay") { e.stopImmediatePropagation(); e.preventDefault(); this.close(); } }, true);
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && this.isOpen() && this.dirty && !document.querySelector(".confirm-overlay")) { e.stopImmediatePropagation(); this.close(); } }, true);
    },
    isOpen() { return !!(this.el && this.el.classList.contains("open")); },
    open(cfg) {
      this._ensure(); this.cfg = cfg; this.dirty = false;
      const v = cfg.values || {};
      const field = (f) => {
        const val = v[f.key] == null ? "" : v[f.key], id = `pf-${f.key}`;
        const ro = cfg.readOnly || f.readOnly;
        let ctl = "";
        if (f.type === "html") ctl = `<div>${f.html || val}</div>`;
        else if (f.type === "readonly") ctl = `<div class="panel-ro">${val === "" ? "—" : esc(val)}</div>`;
        else if (f.type === "textarea") ctl = `<textarea class="textarea" id="${id}" data-f="${f.key}" rows="${f.rows || 4}" ${ro ? "disabled" : ""} ${f.max ? `maxlength="${f.max}"` : ""}>${esc(val)}</textarea>`;
        else if (f.type === "select") ctl = `<select class="select" id="${id}" data-f="${f.key}" ${ro ? "disabled" : ""}>${(f.options || []).map((o) => { const ov = typeof o === "object" ? o.v : o, ol = typeof o === "object" ? o.l : o; return `<option value="${esc(ov)}" ${String(ov) === String(val) ? "selected" : ""}>${esc(ol)}</option>`; }).join("")}</select>`;
        else if (f.type === "toggle") ctl = `<div class="panel-toggle"><button type="button" class="switch ${val ? "on" : ""}" role="switch" aria-checked="${!!val}" id="${id}" data-f="${f.key}" data-toggle ${ro ? "disabled" : ""}></button><span>${esc(f.toggleText || "")}</span></div>`;
        else ctl = `<input class="input" id="${id}" data-f="${f.key}" type="${f.type === "datetime" ? "datetime-local" : f.type || "text"}" value="${esc(val)}" ${f.min != null ? `min="${f.min}"` : ""} ${f.max != null && f.type === "number" ? `max="${f.max}"` : ""} ${ro ? "disabled" : ""} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ""} />`;
        return `<div class="field ${f.type === "toggle" ? "field-inline" : ""}"><label for="${id}">${esc(f.label)}${f.required ? " *" : ""}</label>${ctl}${f.hint ? `<span class="field-hint">${esc(f.hint)}</span>` : ""}<span class="field-hint field-err" data-err="${f.key}" role="alert"></span></div>`;
      };
      const nav = cfg.nav ? `<div class="panel-nav"><button type="button" class="icon-btn" data-nav="-1" ${cfg.nav.index <= 0 ? "disabled" : ""} aria-label="Previous">${icon("chevLeft")}</button><span>${cfg.nav.index + 1} / ${cfg.nav.count}</span><button type="button" class="icon-btn" data-nav="1" ${cfg.nav.index >= cfg.nav.count - 1 ? "disabled" : ""} aria-label="Next">${icon("chevRight")}</button></div>` : "";
      this.el.innerHTML = `
        <div class="drawer-head panel-head">
          <div class="panel-title">${cfg.img ? `<img src="${esc(cfg.img)}" alt="" class="panel-img" />` : ""}<div style="min-width:0;"><h3 class="truncate">${esc(cfg.title || "")}</h3>${cfg.subtitle ? `<p class="truncate">${esc(cfg.subtitle)}</p>` : ""}</div></div>
          ${nav}<button type="button" class="icon-btn" data-close aria-label="Close panel">${icon("x")}</button>
        </div>
        <div class="drawer-body panel-body">
          ${cfg.badges ? `<div class="panel-badges">${cfg.badges}</div>` : ""}
          ${cfg.intro || ""}
          ${(cfg.sections || []).map((s) => `<section class="panel-section">${s.title ? `<h4>${esc(s.title)}</h4>` : ""}${s.html || ""}${(s.fields || []).map(field).join("")}</section>`).join("")}
        </div>
        <div class="panel-foot">
          ${cfg.onDelete && !cfg.readOnly ? `<button type="button" class="btn btn-danger btn-sm" data-del>${icon("trash")}<span>${esc(cfg.deleteText || "Delete")}</span></button>` : ""}
          ${(cfg.actions || []).map((a, i) => `<button type="button" class="btn btn-secondary btn-sm" data-act="${i}">${a.icon ? icon(a.icon) : ""}<span>${esc(a.label)}</span></button>`).join("")}
          <span class="panel-dirty" id="panel-dirty" hidden>Unsaved changes</span>
          <span style="flex:1"></span>
          <button type="button" class="btn btn-ghost btn-sm" data-close>${cfg.readOnly ? "Close" : "Cancel"}</button>
          ${cfg.onSave && !cfg.readOnly ? `<button type="button" class="btn btn-primary btn-sm" data-save disabled>${esc(cfg.saveText || "Save changes")}</button>` : ""}
        </div>`;
      this._wire();
      document.getElementById("overlay").classList.add("open");
      document.body.classList.add("modal-open");
      this.el.classList.add("open");
      this.el.querySelector(".panel-body").scrollTop = 0;
    },
    values() {
      const out = {};
      this.el.querySelectorAll("[data-f]").forEach((el) => {
        const k = el.dataset.f;
        out[k] = el.hasAttribute("data-toggle") ? el.classList.contains("on") : el.type === "number" ? (el.value === "" ? "" : Number(el.value)) : el.value;
      });
      return out;
    },
    _setDirty(on) {
      this.dirty = on;
      const s = this.el.querySelector("[data-save]"); if (s) s.disabled = !on;
      const d = $("panel-dirty"); if (d) d.hidden = !on;
    },
    _wire() {
      const root = this.el;
      root.querySelectorAll("[data-f]").forEach((el) => {
        el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => this._setDirty(true));
        if (el.hasAttribute("data-toggle")) el.addEventListener("click", () => { el.classList.toggle("on"); el.setAttribute("aria-checked", el.classList.contains("on")); this._setDirty(true); });
      });
      root.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => this.close()));
      root.querySelectorAll("[data-nav]").forEach((b) => b.addEventListener("click", async () => {
        if (this.dirty && !(await Confirm.ask({ title: "Discard your changes?", body: "You have edits that are not saved.", confirmText: "Discard", tone: "danger" }))) return;
        this.cfg.nav.go(this.cfg.nav.index + Number(b.dataset.nav));
      }));
      root.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => this.cfg.actions[Number(b.dataset.act)].run(this)));
      const del = root.querySelector("[data-del]"); if (del) del.addEventListener("click", () => this.cfg.onDelete(this));
      const sv = root.querySelector("[data-save]");
      if (sv) sv.addEventListener("click", async () => {
        root.querySelectorAll("[data-err]").forEach((e) => { e.textContent = ""; });
        const vals = this.values(), errs = {};
        (this.cfg.sections || []).forEach((s) => (s.fields || []).forEach((f) => { if (f.required && String(vals[f.key] ?? "").trim() === "") errs[f.key] = `${f.label} is required.`; }));
        if (this.cfg.validate) Object.assign(errs, this.cfg.validate(vals) || {});
        const keys = Object.keys(errs);
        if (keys.length) { keys.forEach((k) => { const e = root.querySelector(`[data-err="${k}"]`); if (e) e.textContent = errs[k]; }); const first = root.querySelector(`[data-f="${keys[0]}"]`); if (first) first.focus(); return toast("Please fix the highlighted fields", "warning"); }
        const r = await this.cfg.onSave(vals, this);
        if (r !== false) { this._setDirty(false); }
      });
    },
    async close(force) {
      if (!this.isOpen()) return true;
      if (this.dirty && !force && !(await Confirm.ask({ title: "Discard your changes?", body: "You have edits that are not saved.", confirmText: "Discard", tone: "danger" }))) return false;
      this.dirty = false; this.el.classList.remove("open");
      document.getElementById("overlay")?.classList.remove("open");
      document.body.classList.remove("modal-open");
      return true;
    },
  };

  /* ---------------------------------------------------------------
     DataTable — the one table every admin list uses
     new DataTable({
       el, id, kind, rows:()=>[], getId,
       columns:[{ key, label, render(row), sort(row), csv(row), cls, width }],
       search(row)->string, searchPlaceholder,
       filters:[{ key, label, all, options:[{v,l}]|[str], test(row,val) }],
       tabs:{ options:[{ v, l, test }] },
       defaultSort:{ key, dir }, pageSize,
       bulk:[{ id, label, icon, perm, danger, confirm(n,rows)->{title,body,typeText,confirmText}, run(ids,rows) }],
       actions:[{ id, icon, title, danger, perm, show(row), href(row), run(row) }],
       onOpen(row, ctx), canSelect(row), emptyTitle, emptyBody, exportName
     })
     --------------------------------------------------------------- */
  class DataTable {
    constructor(o) {
      this.o = { getId: (r) => r.id, pageSize: 10, select: true, ...o };
      this.s = { q: "", f: {}, tab: o.tabs ? o.tabs.options[0].v : "", sort: o.defaultSort ? { ...o.defaultSort } : null, page: 1, size: this.o.pageSize, sel: new Set(), allMatching: false };
      this._build(); this.render();
    }
    _views() { const d = db(); return (d.filters[this.o.id] = d.filters[this.o.id] || []); }
    _build() {
      const o = this.o, root = o.el;
      root.classList.add("dt");
      root.innerHTML = `
        ${o.tabs ? `<div class="tabs dt-tabs" role="tablist">${o.tabs.options.map((t) => `<button type="button" class="tab ${t.v === this.s.tab ? "active" : ""}" data-tab="${esc(t.v)}">${esc(t.l)} <span class="dt-count" data-count="${esc(t.v)}"></span></button>`).join("")}</div>` : ""}
        <div class="table-toolbar dt-toolbar">
          <div class="search-field dt-search">${icon("search")}<input type="search" data-q placeholder="${esc(o.searchPlaceholder || "Search…")}" aria-label="Search" /></div>
          ${(o.filters || []).map((f) => `<select class="select dt-filter" data-filter="${f.key}" aria-label="${esc(f.label)}"><option value="">${esc(f.all || `All ${f.label}`)}</option>${(typeof f.options === "function" ? f.options() : f.options).map((x) => { const v = typeof x === "object" ? x.v : x, l = typeof x === "object" ? x.l : x; return `<option value="${esc(v)}">${esc(l)}</option>`; }).join("")}</select>`).join("")}
          <button type="button" class="btn btn-ghost btn-sm" data-clear hidden>Clear filters</button>
          <span style="flex:1"></span>
          <div class="dt-views"><button type="button" class="btn btn-secondary btn-sm" data-views aria-haspopup="menu">${icon("bookmark")}<span>Saved views</span></button><div class="menu dt-views-menu" data-views-menu></div></div>
          <button type="button" class="btn btn-secondary btn-sm" data-export title="Download as CSV">${icon("download")}<span>Export</span></button>
        </div>
        <div class="dt-bulk" data-bulk hidden role="region" aria-label="Bulk actions"></div>
        <div class="dt-wrap"><table class="data-table dt-table"><thead></thead><tbody></tbody></table></div>
        <div class="dt-foot"><span class="dt-info" data-info></span><div class="dt-pager" data-pager></div><label class="dt-size">Rows <select class="select" data-size>${[10, 25, 50, 100].map((n) => `<option ${n === this.s.size ? "selected" : ""}>${n}</option>`).join("")}</select></label></div>`;
      this.$ = (sel) => root.querySelector(sel);
      let t = null;
      this.$("[data-q]").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { this.s.q = e.target.value; this.s.page = 1; this.render(); }, 120); });
      root.querySelectorAll("[data-filter]").forEach((sel) => sel.addEventListener("change", () => { this.s.f[sel.dataset.filter] = sel.value; this.s.page = 1; this.render(); }));
      root.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { this.s.tab = b.dataset.tab; this.s.page = 1; root.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("active", x === b)); this.render(); }));
      this.$("[data-clear]").addEventListener("click", () => { this.s.q = ""; this.s.f = {}; this.s.page = 1; this._syncControls(); this.render(); });
      this.$("[data-size]").addEventListener("change", (e) => { this.s.size = Number(e.target.value); this.s.page = 1; this.render(); });
      this.$("[data-export]").addEventListener("click", () => this.exportCsv());
      const vb = this.$("[data-views]"), vm = this.$("[data-views-menu]");
      vb.addEventListener("click", (e) => { e.stopPropagation(); this._paintViews(); document.querySelectorAll(".menu.open").forEach((m) => { if (m !== vm) m.classList.remove("open"); }); vm.classList.toggle("open"); });
      vm.addEventListener("click", async (e) => {
        e.stopPropagation();
        const apply = e.target.closest("[data-apply]"), del = e.target.closest("[data-delview]"), add = e.target.closest("[data-saveview]");
        if (apply) { const v = this._views()[Number(apply.dataset.apply)]; if (v) { this._applyState(v.state); vm.classList.remove("open"); toast(`View “${v.name}” applied`); } }
        else if (del) { const i = Number(del.dataset.delview), v = this._views()[i]; if (v && await Confirm.ask({ title: "Delete this saved view?", body: `“${esc(v.name)}” will be removed. Your data is not affected.`, confirmText: "Delete view", tone: "danger" })) { this._views().splice(i, 1); save(); this._paintViews(); } }
        else if (add) {
          vm.classList.remove("open");
          const name = await Confirm.prompt({ title: "Save this view", label: "Name", placeholder: "e.g. Drafts waiting for review", body: "Saves the current search, filters, tab, sorting and page size so you can come back to it in one click." });
          if (name) { this._views().push({ name, state: this._snapshot() }); save(); toast("View saved", "success"); }
        }
      });
      // sorting + selection + row actions
      this.$("thead").addEventListener("click", (e) => {
        const th = e.target.closest("th[data-sort]"); if (!th || e.target.closest("input")) return;
        const k = th.dataset.sort, cur = this.s.sort;
        this.s.sort = !cur || cur.key !== k ? { key: k, dir: "asc" } : cur.dir === "asc" ? { key: k, dir: "desc" } : null;
        this.render();
      });
      this.$("thead").addEventListener("change", (e) => {
        if (!e.target.matches("[data-all]")) return;
        this._pageRows.forEach((r) => { const id = this.o.getId(r); if (this._selectable(r)) e.target.checked ? this.s.sel.add(id) : this.s.sel.delete(id); });
        this.s.allMatching = false; this._paint();
      });
      this.$("tbody").addEventListener("change", (e) => {
        const c = e.target.closest("[data-sel]"); if (!c) return;
        c.checked ? this.s.sel.add(c.dataset.sel) : this.s.sel.delete(c.dataset.sel);
        this.s.allMatching = false; this._paint();
      });
      this.$("tbody").addEventListener("click", (e) => {
        const act = e.target.closest("[data-ract]");
        if (act) {
          e.preventDefault(); e.stopPropagation();
          const r = this._byId(act.closest("tr").dataset.id), a = this.o.actions.find((x) => x.id === act.dataset.ract);
          if (r && a && a.run) a.run(r, this); return;
        }
        if (e.target.closest("a,button,input,select,label,.switch")) return;
        const tr = e.target.closest("tr[data-id]"); if (!tr || !this.o.onOpen) return;
        this.openAt(this._rows.findIndex((r) => String(this.o.getId(r)) === tr.dataset.id));
      });
      this.$("[data-bulk]").addEventListener("click", (e) => {
        const b = e.target.closest("[data-b]"), all = e.target.closest("[data-selall]"), none = e.target.closest("[data-selnone]");
        if (all) { this.s.allMatching = true; this._rows.forEach((r) => this._selectable(r) && this.s.sel.add(String(this.o.getId(r)))); this._paint(); }
        else if (none) { this.clearSelection(); }
        else if (b) this._runBulk(this.o.bulk.find((x) => x.id === b.dataset.b));
      });
      document.addEventListener("click", () => vm.classList.remove("open"));
    }
    _snapshot() { return { q: this.s.q, f: { ...this.s.f }, tab: this.s.tab, sort: this.s.sort ? { ...this.s.sort } : null, size: this.s.size }; }
    _applyState(st) { Object.assign(this.s, { q: st.q || "", f: { ...(st.f || {}) }, tab: st.tab ?? this.s.tab, sort: st.sort || null, size: st.size || this.s.size, page: 1 }); this._syncControls(); this.render(); }
    _syncControls() {
      this.$("[data-q]").value = this.s.q;
      this.o.el.querySelectorAll("[data-filter]").forEach((sel) => { sel.value = this.s.f[sel.dataset.filter] || ""; });
      this.$("[data-size]").value = String(this.s.size);
      this.o.el.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b.dataset.tab === this.s.tab));
    }
    _paintViews() {
      const v = this._views();
      this.$("[data-views-menu]").innerHTML = `<div class="nav-group-label" style="padding:6px 10px;">Saved views</div>${v.length ? v.map((x, i) => `<div class="dt-view-row"><button type="button" class="menu-item" data-apply="${i}">${esc(x.name)}</button><button type="button" class="icon-btn" data-delview="${i}" aria-label="Delete view ${esc(x.name)}">${icon("x")}</button></div>`).join("") : `<div class="menu-item" style="color:var(--text-tertiary);">None yet</div>`}<div class="menu-divider"></div><button type="button" class="menu-item" data-saveview>${icon("plus")}Save current view</button>`;
    }
    _selectable(r) { return this.o.select && (!this.o.canSelect || this.o.canSelect(r)); }
    _byId(id) { return this._all.find((r) => String(this.o.getId(r)) === String(id)); }
    clearSelection() { this.s.sel.clear(); this.s.allMatching = false; this._paint(); }
    selectedRows() { return this._all.filter((r) => this.s.sel.has(String(this.o.getId(r)))); }
    refresh() { this.render(); }
    /* the filtered + sorted list, then the page */
    _compute() {
      const o = this.o, s = this.s;
      this._all = o.rows();
      const q = s.q.trim().toLowerCase();
      const passes = (r, skipTab) => {
        if (q && !String(o.search ? o.search(r) : JSON.stringify(r)).toLowerCase().includes(q)) return false;
        for (const f of o.filters || []) { const v = s.f[f.key]; if (v && !f.test(r, v)) return false; }
        if (!skipTab && o.tabs) { const t = o.tabs.options.find((x) => x.v === s.tab); if (t && t.test && !t.test(r)) return false; }
        return true;
      };
      this._rows = this._all.filter((r) => passes(r));
      if (o.tabs) o.tabs.options.forEach((t) => { const c = this.$(`[data-count="${t.v}"]`); if (c) c.textContent = this._all.filter((r) => passes(r, true) && (!t.test || t.test(r))).length; });
      if (s.sort) {
        const col = o.columns.find((c) => c.key === s.sort.key), get = col && col.sort ? col.sort : () => 0, m = s.sort.dir === "asc" ? 1 : -1;
        this._rows.sort((a, b) => { const x = get(a), y = get(b); return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: "base" })) * m; });
      }
      const pages = Math.max(1, Math.ceil(this._rows.length / s.size)); if (s.page > pages) s.page = pages;
      this._pageRows = this._rows.slice((s.page - 1) * s.size, s.page * s.size);
      this._pages = pages;
    }
    render() {
      this._compute();
      const o = this.o, s = this.s;
      const hasF = !!(s.q || Object.values(s.f).some(Boolean));
      this.$("[data-clear]").hidden = !hasF;
      // keep selection to rows that still exist
      const ids = new Set(this._all.map((r) => String(o.getId(r)))); [...s.sel].forEach((id) => { if (!ids.has(id)) s.sel.delete(id); });
      const acts = (r) => (o.actions || []).filter((a) => (!a.perm || AdminAuth.can(a.perm)) && (!a.show || a.show(r)));
      this.$("thead").innerHTML = `<tr>${o.select ? `<th class="dt-check"><input type="checkbox" data-all aria-label="Select all rows on this page" /></th>` : ""}${o.columns.map((c) => `<th ${c.sort ? `data-sort="${c.key}" class="sortable" aria-sort="${s.sort && s.sort.key === c.key ? (s.sort.dir === "asc" ? "ascending" : "descending") : "none"}"` : ""} ${c.width ? `style="width:${c.width}"` : ""}>${esc(c.label)}${c.sort ? `<span class="sort-ind">${s.sort && s.sort.key === c.key ? (s.sort.dir === "asc" ? "▲" : "▼") : "↕"}</span>` : ""}</th>`).join("")}${o.actions ? `<th class="dt-acts"><span class="sr-only">Actions</span></th>` : ""}</tr>`;
      this.$("tbody").innerHTML = this._pageRows.length ? this._pageRows.map((r) => {
        const id = String(o.getId(r));
        return `<tr data-id="${esc(id)}" class="${o.onOpen ? "dt-click" : ""} ${s.sel.has(id) ? "selected" : ""}">${o.select ? `<td class="dt-check" data-label="Select">${this._selectable(r) ? `<input type="checkbox" data-sel="${esc(id)}" ${s.sel.has(id) ? "checked" : ""} aria-label="Select row" />` : ""}</td>` : ""}${o.columns.map((c) => `<td class="${c.cls || ""}">${c.render(r)}</td>`).join("")}${o.actions ? `<td class="dt-acts"><div class="flex gap-8">${acts(r).map((a) => a.href ? `<a class="icon-btn" style="width:30px;height:30px;${a.danger ? "color:var(--error);" : ""}" href="${esc(a.href(r))}" title="${esc(a.title)}" aria-label="${esc(a.title)}" ${a.blank ? 'target="_blank" rel="noopener"' : ""}>${icon(a.icon)}</a>` : `<button type="button" class="icon-btn" style="width:30px;height:30px;${a.danger ? "color:var(--error);" : ""}" data-ract="${a.id}" title="${esc(a.title)}" aria-label="${esc(a.title)}">${icon(a.icon)}</button>`).join("")}</div></td>` : ""}</tr>`;
      }).join("") : `<tr><td colspan="${o.columns.length + (o.select ? 1 : 0) + (o.actions ? 1 : 0)}" class="dt-empty"><div class="empty-state"><div class="icon-wrap">${icon("search")}</div><h3>${esc(hasF ? "Nothing matches" : o.emptyTitle || "Nothing here yet")}</h3><p>${esc(hasF ? "Try a different search or clear the filters." : o.emptyBody || "")}</p></div></td></tr>`;
      if (typeof labelTables === "function") labelTables();
      this._paint();
    }
    /* things that change with selection but not with the data */
    _paint() {
      const o = this.o, s = this.s, n = this._rows.length;
      this.$("tbody").querySelectorAll("tr[data-id]").forEach((tr) => { const on = s.sel.has(tr.dataset.id); tr.classList.toggle("selected", on); const c = tr.querySelector("[data-sel]"); if (c) c.checked = on; });
      const all = this.$("[data-all]");
      if (all) { const sel = this._pageRows.filter((r) => this._selectable(r)); const k = sel.filter((r) => s.sel.has(String(o.getId(r)))).length; all.checked = !!sel.length && k === sel.length; all.indeterminate = k > 0 && k < sel.length; }
      const from = n ? (s.page - 1) * s.size + 1 : 0, to = Math.min(n, s.page * s.size);
      this.$("[data-info]").textContent = n ? `Showing ${from}–${to} of ${n}${n !== this._all.length ? ` (filtered from ${this._all.length})` : ""}` : `0 results`;
      const pg = this._pages, cur = s.page, pill = [];
      const add = (p) => pill.push(`<button type="button" class="dt-pg ${p === cur ? "active" : ""}" data-pg="${p}" ${p === cur ? 'aria-current="page"' : ""}>${p}</button>`);
      for (let p = 1; p <= pg; p++) { if (p === 1 || p === pg || Math.abs(p - cur) <= 1) add(p); else if (pill[pill.length - 1] !== "…") pill.push("…"); }
      this.$("[data-pager]").innerHTML = pg > 1 ? `<button type="button" class="dt-pg" data-pg="${cur - 1}" ${cur <= 1 ? "disabled" : ""} aria-label="Previous page">${icon("chevLeft")}</button>${pill.map((x) => (x === "…" ? `<span class="dt-gap">…</span>` : x)).join("")}<button type="button" class="dt-pg" data-pg="${cur + 1}" ${cur >= pg ? "disabled" : ""} aria-label="Next page">${icon("chevRight")}</button>` : "";
      this.$("[data-pager]").querySelectorAll("[data-pg]").forEach((b) => b.addEventListener("click", () => { this.s.page = Number(b.dataset.pg); this.render(); this.o.el.scrollIntoView({ block: "nearest" }); }));
      const bar = this.$("[data-bulk]"), cnt = s.sel.size;
      if (!cnt || !o.bulk) { bar.hidden = true; return; }
      const sel = this.selectedRows();
      const matching = this._rows.filter((r) => this._selectable(r)).length;
      bar.hidden = false;
      bar.innerHTML = `<strong>${cnt} selected</strong>${!s.allMatching && matching > cnt ? `<button type="button" class="link-btn" data-selall>Select all ${matching} matching</button>` : s.allMatching ? `<span class="text-secondary">All ${matching} matching rows</span>` : ""}<span class="dt-bulk-btns">${o.bulk.filter((b) => (!b.perm || AdminAuth.can(b.perm)) && (!b.show || sel.some(b.show))).map((b) => `<button type="button" class="btn ${b.danger ? "btn-danger" : "btn-secondary"} btn-sm" data-b="${b.id}">${b.icon ? icon(b.icon) : ""}<span>${esc(b.label)}</span></button>`).join("")}</span><button type="button" class="link-btn" data-selnone>Clear</button>`;
    }
    async _runBulk(b) {
      if (!b) return;
      const rows = this.selectedRows(), ids = rows.map((r) => String(this.o.getId(r)));
      if (!ids.length) return;
      if (b.confirm) {
        const c = b.confirm(ids.length, rows);
        if (c && !(await Confirm.ask({ tone: b.danger ? "danger" : "primary", confirmText: b.label, ...c, typeText: c.typeText || (b.danger && ids.length >= 10 ? "DELETE" : undefined) }))) return;
      }
      const r = await b.run(ids, rows, this);
      if (r === false) return;
      this.s.sel.clear(); this.s.allMatching = false; this.render();
    }
    openAt(i) {
      if (i < 0 || i >= this._rows.length) return;
      const row = this._rows[i];
      this.o.onOpen(row, { index: i, count: this._rows.length, rows: this._rows, table: this, go: (j) => this.openAt(j) });
    }
    exportCsv() {
      const o = this.o, rows = this.s.sel.size ? this.selectedRows() : this._rows;
      const cols = o.columns.filter((c) => c.csv !== false && (c.csv || c.sort));
      const cell = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
      const lines = [cols.map((c) => cell(c.label)).join(",")].concat(rows.map((r) => cols.map((c) => cell(c.csv ? c.csv(r) : c.sort(r))).join(",")));
      download(`${o.exportName || o.id}-${new Date().toISOString().slice(0, 10)}.csv`, "\ufeff" + lines.join("\r\n"), "text/csv;charset=utf-8");
      toast(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`, "success");
      Audit.log({ action: "Exported", kind: "export", label: `${o.exportName || o.id} (${rows.length} rows)` });
    }
  }
  function download(name, text, type) {
    const blob = new Blob([text], { type }), a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  /* status badge helper shared by tables */
  const STATUS_CLASS = { Published: "badge-success", Approved: "badge-success", Active: "badge-success", Open: "badge-warning", Pending: "badge-warning", Scheduled: "badge-accent", Draft: "badge-neutral", Reported: "badge-error", Rejected: "badge-error", Hidden: "badge-neutral", Suspended: "badge-error", Banned: "badge-error", Resolved: "badge-success", Dismissed: "badge-neutral" };
  const badge = (s) => `<span class="badge ${STATUS_CLASS[s] || "badge-neutral"}">${esc(s)}</span>`;

  /* ---------------------------------------------------------------
     Session timeout + page guard
     --------------------------------------------------------------- */
  const Session = {
    start() {
      const me = AdminAuth.me(); if (!me) return;
      const touch = (() => { let last = 0; return () => { const n = Date.now(); if (n - last < 4000) return; last = n; const s = readSession(); if (s) { s.last = n; writeSession(s); } }; })();
      ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) => document.addEventListener(ev, () => { if (!this._warn) touch(); }, { passive: true }));
      setInterval(() => this.tick(), 1000);
    },
    tick() {
      const s = readSession(); if (!s) { location.replace(`login.html?expired=1`); return; }
      const mins = AdminSettings.get().security.timeoutMin; if (!mins) return;
      const left = mins * 60 - Math.floor((Date.now() - (s.last || s.at)) / 1000);
      if (left <= 0) { AdminAuth.logout("Session timed out"); location.replace("login.html?expired=1"); return; }
      if (left <= 60) this.warn(left); else if (this._warn) this.unwarn();
    },
    warn(left) {
      if (!this._warn) {
        const el = document.createElement("div"); el.className = "confirm-overlay open";
        el.innerHTML = `<div class="confirm-box" role="alertdialog" aria-modal="true"><div class="confirm-icon">${icon("clock")}</div><h3>Still there?</h3><div class="confirm-body">For your security you will be signed out in <strong id="sess-left"></strong> seconds because there has been no activity.</div><div class="confirm-actions"><button class="btn btn-ghost" data-out>Sign out now</button><button class="btn btn-primary" data-stay>Stay signed in</button></div></div>`;
        document.body.appendChild(el); this._warn = el;
        el.querySelector("[data-stay]").addEventListener("click", () => { const s = readSession(); if (s) { s.last = Date.now(); writeSession(s); } this.unwarn(); });
        el.querySelector("[data-out]").addEventListener("click", () => { AdminAuth.logout(); location.replace("login.html"); });
      }
      const n = this._warn.querySelector("#sess-left"); if (n) n.textContent = left;
    },
    unwarn() { if (this._warn) { this._warn.remove(); this._warn = null; } },
  };

  function noAccess(active) {
    const main = document.querySelector(".admin-content"); if (!main) return;
    const m = AdminAuth.me();
    main.innerHTML = `<div class="empty-state" style="margin-top:60px;"><div class="icon-wrap">${icon("lock")}</div><h3>You don't have access to this page</h3><p>${esc(m ? ROLES[m.role].label : "This account")} can't open it. Ask a super admin if you need access.</p><a class="btn btn-primary" href="dashboard.html" style="margin-top:14px;">Back to dashboard</a></div>`;
  }

  const AdminCore = {
    /* called by initAdminPage() in shell.js. Returns false if the page must not render. */
    boot(active) {
      if (!AdminAuth.me()) { location.replace(`login.html?next=${encodeURIComponent(location.pathname.split("/").pop() + location.hash)}`); return false; }
      Admin.autoPurge();
      return true;
    },
    after(active) {
      Session.start();
      if (!AdminAuth.canPage(active)) noAccess(active);
      const m = AdminSettings.get().maintenance;
      if (m.on) { const b = document.createElement("a"); b.className = "maint-banner"; b.href = "settings.html#maintenance"; b.innerHTML = `${icon("alertTriangle")}<span>Maintenance mode is ON. Listeners see a “back soon” page.</span>`; document.querySelector(".admin-main")?.prepend(b); }
    },
    blocked(active) { return !AdminAuth.canPage(active); },
  };


  /* ---------------------------------------------------------------
     Upload helpers: limits come from Settings → Uploads, so changing a limit there changes every form.
     Prototype: files are read in the browser; images are shrunk and kept as data URLs, PDFs go to IndexedDB.
     Laravel: validate the same limits server-side (max:KB, mimes:) before storing to disk / S3.
     --------------------------------------------------------------- */
  const Upload = {
    limits() { return AdminSettings.get().uploads; },
    ext(f) { return (f.name.split(".").pop() || "").toLowerCase(); },
    mb(n) { return `${(n / 1048576).toFixed(n >= 10485760 ? 0 : 1)} MB`; },
    checkAudio(f) {
      const L = this.limits();
      if (!L.audioFormats.includes(this.ext(f))) return `“.${this.ext(f)}” isn't allowed. Use ${L.audioFormats.map((x) => x.toUpperCase()).join(", ")}.`;
      if (f.size > L.maxAudioMB * 1048576) return `${f.name} is ${this.mb(f.size)}. The limit is ${L.maxAudioMB} MB.`;
      return null;
    },
    checkPdf(f) {
      const L = this.limits();
      if (this.ext(f) !== "pdf" && f.type !== "application/pdf") return "That isn't a PDF file.";
      if (f.size > L.maxPdfMB * 1048576) return `${f.name} is ${this.mb(f.size)}. The limit for books is ${L.maxPdfMB} MB.`;
      return null;
    },
    checkImage(f) {
      const L = this.limits();
      if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return "Use a PNG, JPG or WebP image.";
      if (f.size > L.maxImageMB * 1048576) return `${f.name} is ${this.mb(f.size)}. The limit for images is ${L.maxImageMB} MB.`;
      return null;
    },
    /* shrink to maxSide px and return a JPEG data URL (keeps localStorage small) */
    imageToDataURL(file, { maxSide = 700, quality = 0.86 } = {}) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file), img = new Image();
        img.onload = () => {
          const k = Math.min(1, maxSide / Math.max(img.width, img.height)), c = document.createElement("canvas");
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url); resolve(c.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That image couldn't be read.")); };
        img.src = url;
      });
    },
    audioDuration(file) {
      return new Promise((resolve) => {
        const a = new Audio(), u = URL.createObjectURL(file);
        a.preload = "metadata"; a.onloadedmetadata = () => { const d = Math.round(a.duration); URL.revokeObjectURL(u); resolve(Number.isFinite(d) ? d : 0); };
        a.onerror = () => { URL.revokeObjectURL(u); resolve(0); }; a.src = u;
      });
    },
  };
  const parseCount = (v) => { const m = /^([\d.]+)\s*([KkMm]?)/.exec(String(v)); if (!m) return 0; return parseFloat(m[1]) * ({ k: 1e3, m: 1e6 }[m[2].toLowerCase()] || 1); };

  /* ---------------------------------------------------------------
     Moderation engine: banned words, queue, warnings, decision history
     --------------------------------------------------------------- */
  const DEFAULT_BANNED = ["idiot", "stupid", "kafir", "hate you", "shut up", "fool"];
  const Mod = {
    banned() { const d = db(); if (!d.mod.bannedSet) { d.mod.banned = DEFAULT_BANNED.slice(); d.mod.bannedSet = true; save(); } return d.mod.banned; },
    addWord(w) { w = w.trim().toLowerCase(); if (!w) return false; const l = this.banned(); if (l.includes(w)) return false; l.push(w); save(); Audit.log({ action: "Added banned word", kind: "moderation", label: w }); return true; },
    removeWord(w) { const d = db(), l = this.banned(), i = l.indexOf(w); if (i < 0) return; l.splice(i, 1); save(); Audit.log({ action: "Removed banned word", kind: "moderation", label: w }); },
    hits(text) { const t = String(text).toLowerCase(); return this.banned().filter((w) => t.includes(w)); },
    highlight(text) {
      const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      let out = esc(text);
      this.banned().forEach((w) => { out = out.replace(new RegExp(reEsc(esc(w)), "gi"), (m) => `<mark class="hl">${m}</mark>`); });
      return out;
    },
    reportsStored() { try { return typeof loadReports === "function" ? loadReports() : []; } catch { return []; } },
    reportStatus(r) { return (db().mod.reports[r.id] || {}).status || r.status || "Open"; },
    /* queue items: a comment (with any reports about it) or a report about something else */
    queue() {
      const reps = this.reportsStored().filter((r) => this.reportStatus(r) === "Open");
      const items = [];
      COMMENTS.filter((c) => !c._del).forEach((c) => {
        const mine = reps.filter((r) => r.type === "Comment" && r.itemId === c.id);
        const hit = this.hits(c.body);
        const reasons = [];
        if (c.status === "Reported") reasons.push("Reported by listeners");
        if (c.status === "Pending") reasons.push("Awaiting review");
        if (mine.length) reasons.push(`${mine.length} new report${mine.length === 1 ? "" : "s"}`);
        if (hit.length && c.status !== "Rejected" && c.status !== "Hidden" && !(db().mod.cleared || {})[c.id]) reasons.push(`Banned word: ${hit.join(", ")}`);
        if (reasons.length && !["Rejected", "Hidden"].includes(c.status)) items.push({ key: `c:${c.id}`, kind: "comment", comment: c, reports: mine, reasons, hits: hit, when: c.time });
      });
      reps.filter((r) => r.type !== "Comment").forEach((r) => items.push({ key: `r:${r.id}`, kind: "report", report: r, reports: [r], reasons: [r.reason], hits: [], when: r.date }));
      const sev = (i) => (i.hits.length ? 0 : i.comment && i.comment.status === "Reported" ? 1 : 2);
      return items.sort((a, b) => sev(a) - sev(b));
    },
    count() { try { return this.queue().length; } catch { return 0; } },
    decisions() { return db().mod.decisions; },
    warnings(userName) { return db().mod.warnings.filter((w) => w.user === userName); },
    record(d) {
      const e = { id: uid("dec"), at: new Date().toISOString(), by: (AdminAuth.me() || {}).name || "System", ...d };
      db().mod.decisions.unshift(e); if (db().mod.decisions.length > 500) db().mod.decisions.length = 500; save();
      Audit.log({ action: `Moderation: ${d.decision}`, kind: d.itemKind || "comment", id: d.itemId, label: d.itemLabel, detail: d.reason || "" });
      return e;
    },
    userByName(name) { return ADMIN_USERS.find((u) => u.name === name) || null; },
    warn(userName, reason, ref) {
      const e = { id: uid("wrn"), at: new Date().toISOString(), user: userName, reason, by: (AdminAuth.me() || {}).name || "System", ref: ref || "" };
      db().mod.warnings.unshift(e); save();
      Audit.log({ action: "Warned a listener", kind: "user", id: (this.userByName(userName) || {}).id, label: userName, detail: reason });
      return e;
    },
    resolveReport(r, status) {
      const d = db(); d.mod.reports[r.id] = { status, at: new Date().toISOString() }; save();
      try { if (typeof loadReports === "function") { const l = loadReports(); const x = l.find((y) => y.id === r.id); if (x) { x.status = status; saveReports(l); } } } catch {}
    },
    clear(commentId) { const d = db(); d.mod.cleared = d.mod.cleared || {}; d.mod.cleared[commentId] = true; save(); },
  };

  Object.assign(window, { esc, Upload, parseCount, Mod, AdminAuth, AdminSettings, Audit, Admin, Confirm, Panel, DataTable, AdminCore, Session, toastUndo, adminBadge: badge, adminDownload: download, ROLES, AdminFmt: { when: fmtWhen, ago } });
})();
