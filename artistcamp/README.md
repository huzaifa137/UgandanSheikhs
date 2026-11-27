# Ugandan Sheikhs — Frontend Prototype

A complete, static frontend for Ugandan Sheikhs: an Islamic lecture discovery, streaming,
download and offline-listening platform for Ugandan sheikhs. No backend, database, or authentication
is implemented — every interaction is mocked in the browser so the whole product
can be clicked through and evaluated before Laravel work begins.

**Open `index.html` in a browser to start.** No build step, no server required.

---

> **Sample data.** Names come from the supplied photo set; lecture titles, series, bios,
> counts and comments in `js/data.js` are placeholders, not real statements by or about
> any person. Replace them before launch.
>
> **Vocabulary.** Code keeps the original names (`artist`, `album`, `track`, `playlist`,
> `genre`); the UI says Sheikh, Series, Lecture, Collection and Topic.
>
> **Theme.** Emerald & gold, dark by default with a light toggle. All colours live in
> `css/tokens.css`, so re-skinning the whole app means editing that one file.
>
> **Responsive.** Pages fit the screen with no sideways scrolling from 320px up. On
> tablets/phones the admin sidebar becomes a slide-in menu, admin tables become labelled
> cards, and card rails wrap into grids. Desktop keeps scrollable rails.


## 1. Project Structure

```
artistcamp/
├── index.html                 Home / discovery feed
├── discover.html              Discover page (filters, moods, rails)
├── search.html                Advanced search with grouped results
├── artist.html                Sheikh profile (?id=amara-ndlovu)
├── album.html                 Series details (?id=alb-1)
├── track.html                 Lecture details + comments (?id=trk-1)
├── playlist.html               Collection details (?id=pl-1)
├── library.html                Your Library (tabs: overview/playlists/albums/artists/liked/downloads)
├── liked.html                  Liked Lectures collection
├── downloads.html               Download manager (downloaded/downloading/queued/failed)
├── offline.html                 Offline Music (PWA-style offline state)
├── history.html                  Recently Played, grouped by day
├── following.html                Followed artists
├── profile.html                   Public user profile
├── settings.html                  Account/appearance/audio/downloads/playback/notifications/privacy/offline
├── login.html / register.html     Listener auth (split-screen)
├── forgot-password.html / reset-password.html / verify-email.html
├── states.html                    Reference sheet of empty/error/skeleton states (design QA only)
│
├── admin/
│   ├── login.html               Separate, minimal admin sign-in
│   ├── dashboard.html            Stats, charts, top tracks, recent activity
│   ├── artists.html              Sheikh listing + Add Sheikh modal
│   ├── albums.html               Series listing + Add Series modal
│   ├── tracks.html               Lecture listing
│   ├── tracks-upload.html        Drag-and-drop upload + metadata form
│   ├── genres.html               Topic management
│   ├── playlists.html            Collection moderation
│   ├── comments.html             Comment moderation + thread drawer
│   ├── users.html                 User management + detail drawer
│   ├── downloads.html             Platform-wide download stats
│   ├── featured.html              Drag-to-reorder homepage curation
│   ├── reports.html               Flagged content queue
│   └── settings.html              Platform configuration
│
├── errors/
│   ├── 403.html 404.html 419.html 429.html 500.html 503.html
│
├── css/
│   ├── tokens.css                Design tokens (colors, type, spacing, motion)
│   └── main.css                  All component + layout styles
│
└── js/
    ├── data.js                   Mock data (artists, albums, tracks, playlists, etc.)
    ├── icons.js                  Local inline SVG icon set (Lucide-style, zero dependency)
    ├── shell.js                  Sidebar / topbar / player / mobile nav / admin shell renderers
    └── app.js                    Interactions: player, menus, toasts, modals, drawers, tabs, search
```

Every listener page follows the same skeleton: `#shell-sidebar`, `#shell-topbar`,
page content, `#shell-player`, `#shell-mini-player`, `#shell-mobilenav`, and
`#shell-overlays`, all populated by `initAppPage("<nav-id>")` in `js/app.js`.
Admin pages follow the same idea via `initAdminPage("<nav-id>", "<title>")`.

---

## 2. Pages Delivered

Listener app (24 pages): Home, Discover, Search, Sheikh, Series, Lecture, Collection,
Library, Liked Lectures, Downloads, Offline Music, Recently Played, Following,
Profile, Settings, Sign In, Register, Forgot Password, Reset Password, Verify
Email, plus a states/QA reference page.

Admin dashboard (13 pages): Admin Sign In, Dashboard, Sheikhs, Series, Lectures,
Upload Lecture, Topics, Collections, Comments, Users, Downloads, Featured Content,
Reports, Settings.

Error pages (6): 403, 404, 419, 429, 500, 503.

## 3. Reusable Components (markup patterns in css/main.css + js/app.js)

`AppSidebar` `AdminSidebar` `TopNavbar` `AdminTopbar` `MobileNavigation`
`MusicPlayer` `MiniPlayer` `TrackRow` (`trackRowHTML()`) `TrackCard` / `AlbumCard`
/ `ArtistCard` / `PlaylistCard` (`cardHTML()`) `GenreTile` `CommentItem`
`NotificationItem` `DownloadItem` `SearchAutocomplete` `PageHeader` /
`SectionHeader` `EmptyState` (`emptyStateHTML()`) `ErrorState` `SkeletonLoader` `Modal` `Drawer`
`Dropdown/Menu` `ContextMenu` (`t-actions` row) `Toast` (`toast()`) `Badge`
`Avatar` `Button` variants (`.btn-primary/secondary/ghost/outline/danger`)
`Tabs` (`wireTabs(el, onChange?)`) `FilterChip` (`wireChips(el, { onChange })`) `ProgressBar` /
`AudioProgressBar` `VolumeControl` `UploadDropzone` `DataTable` `StatCard`
`ActivityItem`.

> **Tabs and chips must do something.** `wireTabs()` swaps `data-tabpanel` panels (via `data-target`) and
> `wireChips()` only moves the highlight. Anything that filters or sorts content passes an `onChange`
> callback (see the Comments sort on `track.html`, the notification drawer in `js/shell.js`).
> Use `emptyStateHTML({ icon, title, body })` for empty states so the icon size cannot drift.

## 4. Design Tokens (`css/tokens.css`)

- **Surfaces:** `--bg-base #0B0B0D`, `--bg-canvas #101014`, `--bg-raised #151519`,
  `--surface-1/2/3` for elevation.
- **Accent:** `--accent #FF5A4E` (electric coral) with `--accent-2 #F6B73C` as a
  secondary/warm accent for genre tiles and highlights.
- **Semantic:** success `#32C48D`, warning `#F4B740`, error `#EF5350`, info `#5AA9FF`.
- **Type:** Fraunces (display/editorial headings) + Inter (UI/body) + IBM Plex
  Mono (eyebrows, metadata, admin labels) — a deliberate three-role system so
  editorial headings read differently from interface chrome.
- **Layout:** sidebar/topbar/player heights, radii, shadows, and z-index scale
  are all tokenized so a future light theme only needs new token values, not
  new components.
- **Motion:** 150–300ms transitions; `prefers-reduced-motion` is respected globally.

## 5. Mock Data (`js/data.js`)

16 artists, 20 albums, 52 tracks (procedurally titled, all avoiding Lorem
Ipsum), 10 playlists, 10 genres, 20 comments, 10 notifications, 10 admin
users, plus a `CURRENT_USER` and a `STATE` object (current track, playing
state, online/offline flag, queue). Helper functions: `fmtDuration()`,
`fmtCount()`. Everything is generated once at load and shared by reference
across every page, so "Amara Ndlovu" on the homepage is the same object as on
her artist page.

## 6. JavaScript Service Architecture (mock, in `js/app.js` + `js/shell.js`)

These stand in for the services that will eventually call the Laravel API:

- **Player** — play/pause/seek/shuffle/repeat/volume/like, drives both the
  desktop player and mobile mini-player from one state object.
- **toast() / openModal() / openDrawer() / closeModals()** — shared UI feedback
  primitives used by every page.
- **wireGlobalSearch()** — client-side autocomplete over the mock catalog;
  swap for a debounced fetch to `/api/search` later.
- **wireConnectivityToggle() / STATE.online** — simulates the online/offline
  flag the real app will get from a `ConnectivityService` (`navigator.onLine`
  + Service Worker events).
- **renderShell() / renderAdminSidebar() / initAppPage() / initAdminPage()** —
  the composition layer; this is the natural seam for injecting real
  session/user data once Laravel provides it via Blade or an initial API call.

Conceptually, the future service split (not yet implemented) is:
`AudioService`, `DownloadService`, `OfflineStorageService`,
`ConnectivityService`, `PlayerService`, `LibraryService` — each currently
represented by a handful of functions/mock handlers in `app.js` that log a
toast instead of calling an endpoint.

## 7. Offline / PWA Preparation Notes

The UI anticipates, but does not implement:

- A Service Worker caching static assets + downloaded audio/artwork.
- IndexedDB storing offline track references and metadata.
- The Cache API for artwork.
- `offline.html` and the `.status-pill.offline` / "Offline Mode" indicator in
  the topbar already model the visual state; `STATE.online` is the single
  source of truth the real `ConnectivityService` should replace.
- Download states (`Downloaded / Downloading / Queued / Failed`) in
  `downloads.html` map directly to future `offline_sync_records` and
  `track_downloads` rows.

## 8. Laravel Backend Integration Points

Every mock array in `data.js` corresponds to a future Eloquent model /
migration from the brief's entity list (`artists`, `albums`, `tracks`,
`playlists`, `comments`, `downloads`, `listening_history`, `notifications`,
`reports`, `featured_contents`, `settings`, `offline_sync_records`, etc.).
Suggested seams:

1. Replace `js/data.js` arrays with `fetch()` calls to REST endpoints
   (`/api/artists`, `/api/albums`, …), keeping the same shape so
   `cardHTML()`, `trackRowHTML()` and page scripts don't need to change.
2. Move `CURRENT_USER` / `STATE.online` into a Blade-injected `window.__INITIAL_STATE__`
   or an authenticated `/api/me` call.
3. Wire `login.html` / `register.html` / `admin/login.html` forms to Laravel's
   auth routes (Breeze/Fortify or custom controllers); currently they just
   toast and redirect.
4. Wire `admin/tracks-upload.html`'s dropzone to a real multipart upload +
   queue job (Laravel Queues) instead of the `setInterval` progress mock.
5. Replace `toast()`-only actions (follow, like, download, comment, moderate)
   with real POST/PATCH/DELETE calls once controllers exist.

## 9. Features Still Requiring Backend Implementation

- Authentication, sessions, password reset emails, email verification.
- Real file upload/storage/transcoding for audio and images.
- Persistence for playlists, likes, follows, comments, downloads, history.
- Payment/licensing if downloads are ever gated.
- Search indexing (the mock search is a simple client-side `includes()` filter).
- Notification delivery (queued jobs, broadcast/websocket for live updates).
- Actual Service Worker + IndexedDB offline sync.
- Admin RBAC (only a single "Owner" role is mocked in `admin/settings.html`).

## 10. Recommended Laravel/MySQL Build Order

1. **Auth & Users** — migrations for `users`, `admins`; Breeze/Fortify auth;
   wire `login.html`, `register.html`, `admin/login.html`.
2. **Core catalog** — `artists`, `genres`, `artist_genres`, `albums`, `tracks`,
   `track_files`; admin CRUD (`admin/artists.html`, `admin/albums.html`,
   `admin/tracks.html`, upload pipeline).
3. **Public catalog pages** — wire `index.html`, `discover.html`,
   `search.html`, `artist.html`, `album.html`, `track.html` to real queries.
4. **Engagement** — `track_likes`, `playlists`, `playlist_tracks`,
   `playlist_follows`, `artist_follows`; wire `library.html`, `liked.html`,
   `following.html`, playlist CRUD.
5. **Comments & moderation** — `comments`, `comment_replies`,
   `comment_likes`, `reports`; wire `track.html` comments and
   `admin/comments.html` / `admin/reports.html`.
6. **Downloads & offline** — `downloads`, `track_downloads`,
   `offline_sync_records`; wire `downloads.html`, `offline.html`, Service
   Worker + IndexedDB.
7. **Listening history & notifications** — `listening_history`,
   `notifications` (+ queued jobs); wire `history.html` and the
   notification drawer.
8. **Featured content & settings** — `featured_contents`, `settings`; wire
   `admin/featured.html`, `settings.html`, `admin/settings.html`.

---

Nothing in this prototype talks to a network beyond loading Google Fonts and
`picsum.photos` placeholder imagery — everything else is local HTML/CSS/JS,
ready to be dropped into `resources/views` once Blade integration begins.

---

## Books

Sheikhs teach from books, so a book can be attached to a sheikh, to a series and to individual lectures. Listeners read it online, download it, save it to a shelf, keep bookmarks and private notes, and follow the pages while a lecture plays.

**Pages**

| File | Purpose |
|---|---|
| `books.html` | Book library: featured book, continue reading, search, filters |
| `book.html?id=book-1` | Book page: About, Contents, Lectures, My study (bookmarks and notes, export) |
| `reader.html?id=book-1&page=55&lecture=trk-55` | Reader. `page` is the PRINTED page; `lecture` turns on follow-along |
| `admin/books.html` | Library table (download switch, publish), lecture page mapper, add-book form |

**Reader:** continuous PDF.js scroll (bundled in `js/vendor/pdfjs`, works offline), zoom, light / sepia / night tones, contents, bookmarks, notes, remembered position, focus mode, "share this page" link. Keys: arrows / PgUp / PgDn, `+` `-`, `B` bookmark, `F` focus, space plays the lecture.

**Page numbers.** Data uses PRINTED page numbers. `pageOffset` is how many PDF pages sit before printed page 1, so PDF page = printed + offset.

**Follow-along.** Each lecture has `bookRef: { bookId, from, to }` and optionally `syncPoints: [{ t, page }]`. Without sync points the page is estimated by spreading the pages evenly across the lecture. The prototype has no audio, so the reader uses a simulated clock (`60x demo` speed); replace it with an `<audio>` element's `timeupdate`.

**Opening from disk.** Browsers block a page opened as `file://` from reading a PDF. The reader then offers "Choose the PDF". For the full experience run `python -m http.server 8000` inside `artistcamp`, or use the Vercel deployment.

**Admin edits** are stored in `localStorage` (`us_book_admin`) and re-applied by `data.js` on every page load. The listener's shelf, position, bookmarks and notes use `us_books`.

**Laravel mapping**

```
books              id, slug, title, title_ar, author, author_ar, sheikh_id, topic, level, language, page_offset,
                   pages, file_path, file_size, cover_path, downloadable, status, featured, scanned
book_chapters      book_id, title, title_ar, page, parent_id, sort
book_series        book_id, series_id
book_lecture_links lecture_id, book_id, from_page, to_page, sync_points (json)
book_user_state    user_id, book_id, last_pdf_page, saved_at, downloaded_at
book_bookmarks     user_id, book_id, page, created_at
book_notes         user_id, book_id, page, body, created_at
```

Serve PDFs with HTTP range support (Nginx, S3 and Vercel do) so the first page opens before the whole file has downloaded. If `downloadable` is false, do not expose the file URL directly: stream it through a controller that checks the book is published.

**Scanned books.** `Bidayat al-Mutafaqqih` is images only, so in-book text search needs OCR first (for example `ocrmypdf -l ara`). Until then the reader offers a contents filter instead.

**Next features that fit:** in-book search after OCR, highlights, flashcards from notes, quizzes per lecture pages, reading streaks, EPUB support, per-chapter audio links, and a "teacher's notes" overlay.
