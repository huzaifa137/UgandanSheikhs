/* =====================================================================
   ArtistCamp — Mock Data Layer
   This file simulates what will eventually come from Laravel API
   endpoints (see README "Future API Integration Points"). Nothing here
   touches a network — it's an in-memory fixture set used by every page.
   ===================================================================== */

const ART = (seed, w = 500, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const GENRES = [
  { slug: "afrobeats", name: "Afrobeats", color: "#FF5A4E" },
  { slug: "hip-hop", name: "Hip Hop", color: "#5AA9FF" },
  { slug: "gospel", name: "Gospel", color: "#F6B73C" },
  { slug: "rnb", name: "R&B", color: "#C86BE0" },
  { slug: "jazz", name: "Jazz", color: "#32C48D" },
  { slug: "acoustic", name: "Acoustic", color: "#E0A96B" },
  { slug: "electronic", name: "Electronic", color: "#5A5FE0" },
  { slug: "reggae", name: "Reggae", color: "#6BC26B" },
  { slug: "dancehall", name: "Dancehall", color: "#E06B8F" },
  { slug: "traditional", name: "Traditional", color: "#C2955A" },
];

const ARTISTS = [
  { id: "amara-ndlovu", name: "Amara Ndlovu", genre: "Afrobeats", country: "Nigeria", city: "Lagos", listeners: "2.4M", followers: "812K", verified: true, img: ART("amara", 600, 600), cover: ART("amara-cover", 1600, 500), bio: "Amara Ndlovu writes basslines before she writes words. Raised between Lagos and London, her sound folds Afrobeats percussion into airy, melodic hooks that have made her one of the genre's most streamed new voices." },
  { id: "kofi-asante", name: "Kofi Asante", genre: "Hip Hop", country: "Ghana", city: "Accra", listeners: "1.1M", followers: "398K", verified: true, img: ART("kofi", 600, 600), cover: ART("kofi-cover", 1600, 500), bio: "Kofi Asante raps in three languages over production built from highlife samples and 808s, chronicling Accra's rise as a creative capital." },
  { id: "thandiwe-moyo", name: "Thandiwe Moyo", genre: "Gospel", country: "Zimbabwe", city: "Harare", listeners: "640K", followers: "205K", verified: true, img: ART("thandiwe", 600, 600), cover: ART("thandiwe-cover", 1600, 500), bio: "A choir director's daughter, Thandiwe Moyo brings full-voiced Southern African gospel to contemporary arrangements." },
  { id: "zola-khumalo", name: "Zola Khumalo", genre: "R&B", country: "South Africa", city: "Johannesburg", listeners: "980K", followers: "310K", verified: true, img: ART("zola", 600, 600), cover: ART("zola-cover", 1600, 500), bio: "Zola Khumalo's whisper-close vocals and late-night production have earned comparisons to the greats of slow-burning R&B." },
  { id: "the-nile-collective", name: "The Nile Collective", genre: "Jazz", country: "Egypt", city: "Cairo", listeners: "410K", followers: "142K", verified: false, img: ART("nile", 600, 600), cover: ART("nile-cover", 1600, 500), bio: "A rotating ensemble of Cairo session players reinterpreting modal jazz through instruments pulled from the Nile Valley's own tradition." },
  { id: "juma-otieno", name: "Juma Otieno", genre: "Acoustic", country: "Kenya", city: "Nairobi", listeners: "295K", followers: "88K", verified: false, img: ART("juma", 600, 600), cover: ART("juma-cover", 1600, 500), bio: "Juma Otieno's single guitar and unguarded voice have made him a fixture of Nairobi's small-room circuit." },
  { id: "lumen-drift", name: "Lumen Drift", genre: "Electronic", country: "South Africa", city: "Cape Town", listeners: "525K", followers: "176K", verified: true, img: ART("lumen", 600, 600), cover: ART("lumen-cover", 1600, 500), bio: "Lumen Drift builds slow-moving electronic soundscapes out of field recordings taken across the Cape." },
  { id: "isaac-marley-jr", name: "Isaac Marley Jr.", genre: "Reggae", country: "Jamaica", city: "Kingston", listeners: "760K", followers: "260K", verified: true, img: ART("isaac", 600, 600), cover: ART("isaac-cover", 1600, 500), bio: "Carrying his family's name into a new decade, Isaac Marley Jr. writes roots reggae for a generation raised on both vinyl and streaming." },
  { id: "ama-serwaa", name: "Ama Serwaa", genre: "Dancehall", country: "Ghana", city: "Kumasi", listeners: "355K", followers: "121K", verified: false, img: ART("ama", 600, 600), cover: ART("ama-cover", 1600, 500), bio: "Ama Serwaa turns Kumasi street slang into dancehall hooks built for the club and the timeline alike." },
  { id: "griot-echoes", name: "Griot Echoes", genre: "Traditional", country: "Mali", city: "Bamako", listeners: "180K", followers: "64K", verified: false, img: ART("griot", 600, 600), cover: ART("griot-cover", 1600, 500), bio: "A kora-and-voice duo preserving Mande oral tradition while scoring it for modern ears." },
  { id: "nnamdi-eze", name: "Nnamdi Eze", genre: "Afrobeats", country: "Nigeria", city: "Enugu", listeners: "1.6M", followers: "540K", verified: true, img: ART("nnamdi", 600, 600), cover: ART("nnamdi-cover", 1600, 500), bio: "Nnamdi Eze's log-drum-driven productions have soundtracked two consecutive festival seasons across West Africa." },
  { id: "efe-obasi", name: "Efe Obasi", genre: "R&B", country: "Nigeria", city: "Port Harcourt", listeners: "512K", followers: "190K", verified: false, img: ART("efe", 600, 600), cover: ART("efe-cover", 1600, 500), bio: "Efe Obasi's debut EP was recorded almost entirely in a converted shipping container studio." },
  { id: "north-star-radio", name: "North Star Radio", genre: "Electronic", country: "Ethiopia", city: "Addis Ababa", listeners: "230K", followers: "77K", verified: false, img: ART("northstar", 600, 600), cover: ART("northstar-cover", 1600, 500), bio: "A three-piece live electronic act blending Ethio-jazz scales with modular synthesis." },
  { id: "sipho-dlamini", name: "Sipho Dlamini", genre: "Hip Hop", country: "South Africa", city: "Durban", listeners: "690K", followers: "224K", verified: true, img: ART("sipho", 600, 600), cover: ART("sipho-cover", 1600, 500), bio: "Sipho Dlamini raps in isiZulu and English over amapiano-adjacent low end, chronicling Durban nightlife." },
  { id: "wanjiru-kamau", name: "Wanjiru Kamau", genre: "Gospel", country: "Kenya", city: "Nairobi", listeners: "445K", followers: "160K", verified: true, img: ART("wanjiru", 600, 600), cover: ART("wanjiru-cover", 1600, 500), bio: "Wanjiru Kamau's Sunday-morning sound has quietly become one of East Africa's most-streamed gospel catalogs." },
  { id: "bongani-radebe", name: "Bongani Radebe", genre: "Jazz", country: "South Africa", city: "Cape Town", listeners: "298K", followers: "99K", verified: false, img: ART("bongani", 600, 600), cover: ART("bongani-cover", 1600, 500), bio: "Bongani Radebe's upright bass anchors a jazz quartet steeped in Cape Town's District Six history." },
];

function makeTracks(count, artistPool) {
  const adjectives = ["Midnight", "Golden", "Late", "Slow", "Wild", "Quiet", "Electric", "Blue", "Open", "Distant", "Warm", "Lost", "Home", "Bright", "Coastal", "Second", "First", "Last", "Dry", "Salt"];
  const nouns = ["Lights", "Road", "Rain", "River", "Fire", "Skyline", "Harbour", "Static", "Echo", "Bloom", "Signal", "Season", "Horizon", "Streets", "Tide", "Dust", "Gravity", "Glow", "Border", "Hymn"];
  const tracks = [];
  for (let i = 0; i < count; i++) {
    const artist = artistPool[i % artistPool.length];
    const title = `${adjectives[i % adjectives.length]} ${nouns[(i * 3) % nouns.length]}`;
    tracks.push({
      id: `trk-${i + 1}`,
      title,
      artistId: artist.id,
      artist: artist.name,
      album: `${nouns[(i * 5) % nouns.length]} Sessions`,
      genre: artist.genre,
      duration: 120 + ((i * 37) % 180),
      plays: (5000 + i * 4231) % 980000,
      downloads: (200 + i * 91) % 40000,
      likes: (100 + i * 53) % 22000,
      explicit: i % 7 === 0,
      downloadable: i % 4 !== 0,
      art: ART(`track-${i}`, 500, 500),
      year: 2022 + (i % 4),
    });
  }
  return tracks;
}

const TRACKS = makeTracks(52, ARTISTS);

function fmtDuration(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function fmtCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

const ALBUM_TITLES = [
  "Harbour Lights", "Second Skyline", "Static Bloom", "Golden Hymn", "Salt & Signal",
  "Distant Season", "Quiet Fire", "Coastal Dust", "Open Horizon", "Blue Gravity",
  "Wild Tide", "Home Static", "Bright Border", "Slow River", "Midnight Echo",
  "Warm Rain", "Lost Glow", "First Streets", "Electric Road", "Last Harbour",
];
const ALBUMS = ALBUM_TITLES.map((title, i) => {
  const artist = ARTISTS[i % ARTISTS.length];
  const type = i % 6 === 0 ? "EP" : i % 9 === 0 ? "Single" : "Album";
  const albumTracks = TRACKS.filter((t) => t.artistId === artist.id).slice(0, type === "Single" ? 1 : type === "EP" ? 5 : 10);
  return {
    id: `alb-${i + 1}`,
    title,
    artistId: artist.id,
    artist: artist.name,
    type,
    genre: artist.genre,
    year: 2021 + (i % 5),
    art: ART(`album-${i}`, 700, 700),
    tracks: albumTracks.length ? albumTracks : TRACKS.slice(i, i + 6),
    description: `${title} finds ${artist.name} pushing further into ${artist.genre.toLowerCase()} territory, recorded largely in ${artist.city} across a single rainy season.`,
    label: i % 3 === 0 ? "ArtistCamp Records" : "Independent",
    copyright: `© ${2021 + (i % 5)} ${artist.name}, under exclusive license`,
  };
});

const PLAYLIST_NAMES = [
  { name: "Late Night Kampala", desc: "Slow tempo, low light — the drive home playlist." },
  { name: "Afro Discovery", desc: "Fresh Afrobeats voices you haven't heard yet." },
  { name: "Sunday Acoustic", desc: "Guitars, hymns, and quiet mornings." },
  { name: "Road Trip", desc: "Windows down from Lagos to Accra." },
  { name: "Chill Sessions", desc: "Low-key beats for focus and unwinding." },
  { name: "Daily Discovery", desc: "New tracks picked for your taste, refreshed daily." },
  { name: "ArtistCamp Mix", desc: "The editorial team's rotating favorites." },
  { name: "Afro Pulse", desc: "High-energy Afrobeats and dancehall." },
  { name: "Acoustic Evenings", desc: "Stripped-back sets for wind-down hours." },
  { name: "Fresh East Africa", desc: "The best new releases out of Nairobi, Kampala and Addis." },
];
const PLAYLISTS = PLAYLIST_NAMES.map((p, i) => ({
  id: `pl-${i + 1}`,
  name: p.name,
  description: p.desc,
  creator: i < 5 ? "You" : "ArtistCamp Editorial",
  art: ART(`playlist-${i}`, 700, 700),
  tracks: TRACKS.slice(i * 4, i * 4 + 12).length ? TRACKS.slice((i * 3) % TRACKS.length, (i * 3) % TRACKS.length + 10) : TRACKS.slice(0, 10),
  updated: `${(i % 20) + 1} days ago`,
  privacy: i % 4 === 0 ? "Private" : "Public",
}));

const COMMENT_BODIES = [
  "This one's been on repeat since it dropped, the bridge alone is worth the download.",
  "The production on this is insane, whoever mixed it deserves a raise.",
  "Been following since the first EP, this is a whole new level.",
  "Downloaded this for offline before my flight, no regrets.",
  "The way this builds in the last minute gives me chills every time.",
  "This deserves way more plays than it's getting right now.",
  "Playing this at every gathering from now on, no exceptions.",
  "The vocal layering in the chorus is criminally underrated.",
  "First listen and I already know this is going on my Sunday playlist.",
  "The bassline alone could carry this track, but the whole thing just works.",
];
const COMMENT_NAMES = ["Tendai M.", "Aisha K.", "Kwame O.", "Naledi P.", "Yusuf A.", "Chidinma R.", "Baraka S.", "Fatima N.", "Emeka J.", "Zanele T.", "Kojo B.", "Rahel D."];
const COMMENTS = Array.from({ length: 20 }, (_, i) => ({
  id: `cmt-${i + 1}`,
  user: COMMENT_NAMES[i % COMMENT_NAMES.length],
  avatar: ART(`user-${i}`, 100, 100),
  body: COMMENT_BODIES[i % COMMENT_BODIES.length],
  time: `${(i % 12) + 1}${i % 2 === 0 ? "h" : "d"} ago`,
  likes: (i * 13) % 340,
  trackId: TRACKS[i % TRACKS.length].id,
  status: i % 9 === 0 ? "Reported" : i % 6 === 0 ? "Pending" : "Approved",
}));

const NOTIFICATIONS = [
  { id: 1, type: "follower", text: "Zola Khumalo started following you", time: "2h ago", unread: true },
  { id: 2, type: "release", text: "Nnamdi Eze released a new single, \"Golden Hymn\"", time: "5h ago", unread: true },
  { id: 3, type: "playlist", text: "Your playlist \"Afro Discovery\" was added to 12 libraries", time: "1d ago", unread: true },
  { id: 4, type: "reply", text: "Kwame O. replied to your comment on \"Blue Gravity\"", time: "1d ago", unread: false },
  { id: 5, type: "download", text: "\"Harbour Lights\" finished downloading", time: "2d ago", unread: false },
  { id: 6, type: "system", text: "ArtistCamp: scheduled maintenance completed", time: "3d ago", unread: false },
  { id: 7, type: "follower", text: "Juma Otieno started following you", time: "4d ago", unread: false },
  { id: 8, type: "release", text: "Amara Ndlovu released a new album, \"Static Bloom\"", time: "5d ago", unread: false },
  { id: 9, type: "playlist", text: "5 new tracks added to \"Daily Discovery\"", time: "6d ago", unread: false },
  { id: 10, type: "reply", text: "Fatima N. replied to your comment on \"Slow River\"", time: "1w ago", unread: false },
];

const ADMIN_USERS = Array.from({ length: 10 }, (_, i) => ({
  id: `usr-${i + 1}`,
  name: COMMENT_NAMES[i % COMMENT_NAMES.length],
  email: `${COMMENT_NAMES[i % COMMENT_NAMES.length].toLowerCase().replace(/[^a-z]/g, "")}@mail.com`,
  avatar: ART(`user-${i}`, 100, 100),
  playlists: (i * 2) % 14,
  downloads: (i * 37) % 260,
  comments: (i * 5) % 40,
  status: i % 8 === 0 ? "Suspended" : "Active",
  joined: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6]} 2025`,
}));

const CURRENT_USER = {
  name: "Sena Okafor",
  username: "senaokafor",
  email: "sena@artistcamp.dev",
  avatar: ART("current-user", 200, 200),
  bio: "Collecting basslines from Lagos to Nairobi. Always looking for the next Sunday morning record.",
  followers: 128,
  following: 340,
};

const STATE = {
  currentTrack: TRACKS[3],
  isPlaying: false,
  online: true,
  queue: TRACKS.slice(4, 10),
};