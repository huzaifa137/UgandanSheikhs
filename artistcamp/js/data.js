/* =====================================================================
   Ugandan Sheikhs — Mock Data Layer
   This file simulates what will eventually come from Laravel API
   endpoints. Nothing here touches a network — it is an in-memory
   fixture set used by every page.

   >>> SAMPLE DATA <<<  Names come from the supplied photo set. Lecture
   titles, series, bios, follower/listener counts and comments are
   PLACEHOLDERS for the prototype and are NOT real statements by or
   about any person. Replace them with real content before launch.

   Field names (id, artistId, genre, album, plays …) are kept from the
   original prototype on purpose so every page keeps working; in the UI
   they now mean: artist = Sheikh, album = Series, track = Lecture,
   playlist = Collection, genre = Topic.
   ===================================================================== */

/* Folder that holds /img, resolved from this script's own URL so images load
   from root pages AND from /admin pages. */
const ASSET_BASE = (document.currentScript && document.currentScript.src)
  ? new URL("../", document.currentScript.src).href : "";

/* Locally generated artwork (no external requests, works offline).
   Deterministic: the same seed always gives the same emerald/gold tile. */
const ART_PALETTES = [
  ["#0E6B52", "#0A2F26"], ["#0B5D6B", "#082F3A"], ["#1D5FA8", "#0F2F57"], ["#7A5A14", "#3A2A08"],
  ["#6B2E4A", "#331526"], ["#2F6B3A", "#14301A"], ["#4B3F8F", "#201A47"], ["#8A4B2B", "#3D2012"],
];
const ART = (seed, w = 500, h = 500) => {
  let hsh = 5381;
  for (const ch of String(seed)) hsh = ((hsh << 5) + hsh + ch.charCodeAt(0)) >>> 0;
  const [a, b] = ART_PALETTES[hsh % ART_PALETTES.length];
  const rot = (hsh >> 3) % 45;
  const s = 120 + ((hsh >> 5) % 60);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 500 500' preserveAspectRatio='xMidYMid slice'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient>` +
    `<pattern id='p' width='60' height='60' patternUnits='userSpaceOnUse'><g fill='none' stroke='#D9B26A' stroke-opacity='.16' stroke-width='1'>` +
    `<rect x='15' y='15' width='30' height='30'/><rect x='15' y='15' width='30' height='30' transform='rotate(45 30 30)'/></g></pattern></defs>` +
    `<rect width='500' height='500' fill='url(#g)'/><rect width='500' height='500' fill='url(#p)'/>` +
    `<g transform='rotate(${rot} 250 250)' fill='none' stroke='#D9B26A' stroke-opacity='.75' stroke-width='3'>` +
    `<rect x='${250 - s / 2}' y='${250 - s / 2}' width='${s}' height='${s}'/>` +
    `<rect x='${250 - s / 2}' y='${250 - s / 2}' width='${s}' height='${s}' transform='rotate(45 250 250)'/></g></svg>`;
  return svgUri(svg);
};
/* encodeURIComponent leaves ' ( ) unescaped, which breaks CSS url('...') — escape them too. */
function svgUri(svg) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
}
/* Initials avatar (emerald gradient) for people without a photo */
const AVATAR = (name, size = 100) => {
  const ini = String(name).replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 100 100'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1FB87A'/><stop offset='1' stop-color='#0A5C44'/></linearGradient></defs>` +
    `<rect width='100' height='100' fill='url(#g)'/><text x='50' y='50' text-anchor='middle' dominant-baseline='central' ` +
    `font-family='Inter,Arial,sans-serif' font-weight='700' font-size='38' fill='#fff'>${ini}</text></svg>`;
  return svgUri(svg);
};

/* Topics (was "genres") */
const GENRES = [
  { slug: "tafsir", name: "Qur'an & Tafsir", color: "#0E7F5C" },
  { slug: "aqeedah", name: "Aqeedah", color: "#1D5FA8" },
  { slug: "fiqh", name: "Fiqh", color: "#9A7418" },
  { slug: "hadith", name: "Hadith", color: "#7B3F9E" },
  { slug: "seerah", name: "Seerah", color: "#0B7A75" },
  { slug: "tazkiyah", name: "Tazkiyah", color: "#B04A2E" },
  { slug: "khutbah", name: "Khutbah", color: "#3F4FB0" },
  { slug: "family", name: "Family & Marriage", color: "#A63D6B" },
  { slug: "youth", name: "Youth", color: "#2F7D32" },
  { slug: "ramadan", name: "Ramadan", color: "#6B5A2E" },
];

/* Sheikhs (was "artists"). Names follow the supplied photo filenames —
   please confirm spellings and honorifics. */
const SHEIKH_SEED = [
  { id: "hamza-kayiira", name: "Hamza Kayiira", followers: "18K", listeners: "42K" },
  { id: "imaam-kyeyune", name: "Imaam Kyeyune", followers: "15K", listeners: "37K" },
  { id: "mazinga", name: "Mazinga", followers: "12K", listeners: "29K" },
  { id: "mugendera", name: "Mugendera", followers: "11K", listeners: "26K" },
  { id: "salim-bbosa", name: "Salim Bbosa", followers: "14K", listeners: "33K" },
  { id: "sheikh-swiddiq-nasir", name: "Sheikh Swiddiq Nasir", followers: "16K", listeners: "38K" },
  { id: "ssenjala", name: "Ssenjala", followers: "9.4K", listeners: "21K" },
  { id: "swiddiq-nasir", name: "Swiddiq Nasir", followers: "13K", listeners: "31K" },
  { id: "twantwawi", name: "Twantwawi", followers: "8.8K", listeners: "19K" },
  { id: "kitti", name: "Kitti", followers: "10K", listeners: "24K" },
];
const ARTISTS = SHEIKH_SEED.map((s) => ({
  ...s,
  genre: "Islamic Studies",
  country: "Uganda",
  city: "Kampala",
  verified: false,
  img: `${ASSET_BASE}img/sheikhs/${s.id}.jpg`,
  cover: `${ASSET_BASE}img/pattern-cover.svg`,
  bio: `Lectures and reminders by ${s.name} on Islamic knowledge, available to stream and download on Ugandan Sheikhs.`,
}));

/* Lectures (was "tracks") */
const LECTURE_TITLES = [
  "The Meaning of La ilaha illa Allah", "Sincerity in Worship", "Patience in Hardship", "Gratitude and Contentment",
  "The Importance of Salah", "Honoring Parents", "Seeking Knowledge", "Brotherhood in Islam",
  "Repentance and Forgiveness", "Trust in Allah (Tawakkul)", "Good Character", "Fasting and Its Virtues",
  "The Day of Judgment", "Remembrance of Allah", "Rights of Neighbors", "Honesty in Trade",
  "Lessons from the Seerah", "Dua and Its Etiquette", "The Virtues of Friday", "Unity of the Ummah",
];

/* Series (was "albums"): title + topic */
const SERIES = [
  { title: "Foundations of Tawheed", topic: "Aqeedah" },
  { title: "Stories of the Prophets", topic: "Seerah" },
  { title: "Tafsir of Juz Amma", topic: "Qur'an & Tafsir" },
  { title: "The Forty Hadith", topic: "Hadith" },
  { title: "Fiqh of Salah", topic: "Fiqh" },
  { title: "Purification of the Heart", topic: "Tazkiyah" },
  { title: "Friday Khutbah Highlights", topic: "Khutbah" },
  { title: "Building a Muslim Home", topic: "Family & Marriage" },
  { title: "Guidance for Muslim Youth", topic: "Youth" },
  { title: "Ramadan Reminders", topic: "Ramadan" },
  { title: "Lives of the Companions", topic: "Seerah" },
  { title: "Understanding Surah Al-Kahf", topic: "Qur'an & Tafsir" },
  { title: "Fiqh of Zakah", topic: "Fiqh" },
  { title: "Names and Attributes of Allah", topic: "Aqeedah" },
  { title: "Selected Hadith on Character", topic: "Hadith" },
  { title: "Manners of the Muslim", topic: "Tazkiyah" },
  { title: "Rights of Parents and Spouses", topic: "Family & Marriage" },
  { title: "Fiqh of Fasting", topic: "Ramadan" },
  { title: "Lessons from Surah Yusuf", topic: "Qur'an & Tafsir" },
  { title: "Faith in a Modern World", topic: "Youth" },
];
const seriesForTopic = (topic) => (SERIES.find((s) => s.topic === topic) || SERIES[0]).title;

function makeTracks(count, artistPool) {
  const tracks = [];
  for (let i = 0; i < count; i++) {
    const artist = artistPool[i % artistPool.length];
    const topic = GENRES[(i * 3) % GENRES.length].name;
    const part = Math.floor(i / LECTURE_TITLES.length);
    const title = LECTURE_TITLES[i % LECTURE_TITLES.length] + (part ? ` — Part ${part + 1}` : "");
    tracks.push({
      id: `trk-${i + 1}`,
      title,
      artistId: artist.id,
      artist: artist.name,
      album: seriesForTopic(topic),
      genre: topic,
      duration: 1200 + ((i * 137) % 2400), // 20–60 min lectures
      plays: (5000 + i * 4231) % 98000,
      downloads: (200 + i * 91) % 9000,
      likes: (100 + i * 53) % 5200,
      explicit: false,
      downloadable: i % 4 !== 0,
      art: ART(`lecture-${i}`, 500, 500),
      year: 2022 + (i % 5),
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

const ALBUM_TITLES = SERIES.map((s) => s.title);
const ALBUMS = SERIES.map((ser, i) => {
  const artist = ARTISTS[i % ARTISTS.length];
  const type = i % 6 === 0 ? "Short Series" : i % 9 === 0 ? "Single Lecture" : "Series";
  const albumTracks = TRACKS.filter((t) => t.artistId === artist.id).slice(0, type === "Single Lecture" ? 1 : type === "Short Series" ? 5 : 10);
  return {
    id: `alb-${i + 1}`,
    title: ser.title,
    artistId: artist.id,
    artist: artist.name,
    type,
    genre: ser.topic,
    year: 2021 + (i % 6),
    art: ART(`series-${i}`, 700, 700),
    tracks: albumTracks.length ? albumTracks : TRACKS.slice(i, i + 6),
    description: `${ser.title} is a lecture series on ${ser.topic} by ${artist.name}, available to stream and download.`,
    label: i % 3 === 0 ? "Ugandan Sheikhs" : "Independent",
    copyright: `© ${2021 + (i % 6)} ${artist.name}`,
  };
});

/* Collections (was "playlists") */
const PLAYLIST_NAMES = [
  { name: "Morning Reminders", desc: "Short reminders to start the day with focus." },
  { name: "Understanding the Qur'an", desc: "Tafsir lectures to deepen your reading." },
  { name: "Friday Khutbah Highlights", desc: "Sermons worth hearing again." },
  { name: "Ramadan Preparation", desc: "Get ready for the blessed month." },
  { name: "Learning Fiqh Basics", desc: "Clear, practical lessons on everyday rulings." },
  { name: "Daily Reminders", desc: "New lectures picked for you, refreshed daily." },
  { name: "Editor's Selection", desc: "The editorial team's rotating favorites." },
  { name: "Stories of the Prophets", desc: "Lessons from the lives of the Prophets." },
  { name: "Youth & Identity", desc: "Talks for young Muslims on faith and daily life." },
  { name: "Fresh from Uganda", desc: "The latest lectures from sheikhs across Uganda." },
];
const PLAYLISTS = PLAYLIST_NAMES.map((p, i) => ({
  id: `pl-${i + 1}`,
  name: p.name,
  description: p.desc,
  creator: i < 5 ? "You" : "Ugandan Sheikhs Editorial",
  art: ART(`collection-${i}`, 700, 700),
  tracks: TRACKS.slice(i * 4, i * 4 + 12).length ? TRACKS.slice((i * 3) % TRACKS.length, (i * 3) % TRACKS.length + 10) : TRACKS.slice(0, 10),
  updated: `${(i % 20) + 1} days ago`,
  privacy: i % 4 === 0 ? "Private" : "Public",
}));

const COMMENT_BODIES = [
  "Jazakallahu khayran, this reminder came at exactly the right time.",
  "Very clear explanation, I understood this much better now.",
  "I have been following this series from the start, it keeps getting better.",
  "Downloaded this for offline listening on my commute, so beneficial.",
  "May Allah reward the speaker and everyone who made this available.",
  "I shared this with my family and we discussed it after Maghrib.",
  "Please make more lectures on this topic, insha'Allah.",
  "The examples used here made the lesson easy to remember.",
  "First time listening and I already added it to my Friday collection.",
  "Barakallahu feekum, this is a lecture worth listening to twice.",
];
const COMMENT_NAMES = ["Aisha N.", "Yusuf K.", "Fatuma S.", "Ibrahim M.", "Mariam B.", "Hassan T.", "Zainab A.", "Umar L.", "Khadija R.", "Abdul S.", "Halima O.", "Ismail W."];
const COMMENTS = Array.from({ length: 20 }, (_, i) => ({
  id: `cmt-${i + 1}`,
  user: COMMENT_NAMES[i % COMMENT_NAMES.length],
  avatar: AVATAR(COMMENT_NAMES[i % COMMENT_NAMES.length]),
  body: COMMENT_BODIES[i % COMMENT_BODIES.length],
  time: `${(i % 12) + 1}${i % 2 === 0 ? "h" : "d"} ago`,
  likes: (i * 13) % 340,
  trackId: TRACKS[i % TRACKS.length].id,
  status: i % 9 === 0 ? "Reported" : i % 6 === 0 ? "Pending" : "Approved",
}));

const NOTIFICATIONS = [
  { id: 1, type: "follower", text: `${COMMENT_NAMES[2]} started following you`, time: "2h ago", unread: true },
  { id: 2, type: "release", text: `${ARTISTS[0].name} published a new lecture, "${LECTURE_TITLES[0]}"`, time: "5h ago", unread: true },
  { id: 3, type: "playlist", text: `Your collection "Understanding the Qur'an" was added to 12 libraries`, time: "1d ago", unread: true },
  { id: 4, type: "reply", text: `${COMMENT_NAMES[1]} replied to your comment on "${LECTURE_TITLES[2]}"`, time: "1d ago", unread: false },
  { id: 5, type: "download", text: `"${SERIES[0].title}" finished downloading`, time: "2d ago", unread: false },
  { id: 6, type: "system", text: "Ugandan Sheikhs: scheduled maintenance completed", time: "3d ago", unread: false },
  { id: 7, type: "follower", text: `${COMMENT_NAMES[3]} started following you`, time: "4d ago", unread: false },
  { id: 8, type: "release", text: `${ARTISTS[1].name} published a new series, "${SERIES[1].title}"`, time: "5d ago", unread: false },
  { id: 9, type: "playlist", text: `5 new lectures added to "Daily Reminders"`, time: "6d ago", unread: false },
  { id: 10, type: "reply", text: `${COMMENT_NAMES[4]} replied to your comment on "${LECTURE_TITLES[5]}"`, time: "1w ago", unread: false },
];

const ADMIN_USERS = Array.from({ length: 10 }, (_, i) => ({
  id: `usr-${i + 1}`,
  name: COMMENT_NAMES[i % COMMENT_NAMES.length],
  email: `${COMMENT_NAMES[i % COMMENT_NAMES.length].toLowerCase().replace(/[^a-z]/g, "")}@mail.com`,
  avatar: AVATAR(COMMENT_NAMES[i % COMMENT_NAMES.length]),
  playlists: (i * 2) % 14,
  downloads: (i * 37) % 260,
  comments: (i * 5) % 40,
  status: i % 8 === 0 ? "Suspended" : "Active",
  joined: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6]} 2025`,
}));

const CURRENT_USER = {
  name: "Amina Nakato",
  username: "aminanakato",
  email: "amina@ugandansheikhs.dev",
  avatar: AVATAR("Amina Nakato", 200),
  bio: "Student of knowledge. Always looking for the next reminder to carry through the week.",
  followers: 128,
  following: 340,
};

const STATE = {
  currentTrack: TRACKS[3],
  isPlaying: false,
  online: true,
  queue: TRACKS.slice(4, 10),
};
