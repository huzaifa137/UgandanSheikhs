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

/* The series a lecture really belongs to (the one whose page lists it).
   A lecture can sit in more than one series in this mock data, so prefer the
   series with the same topic. Returns an ALBUMS entry, or null. */
const _seriesOfCache = {};
function seriesOf(track) {
  if (!track) return null;
  if (!(track.id in _seriesOfCache)) {
    const owners = ALBUMS.filter((a) => a.tracks.some((x) => x.id === track.id));
    _seriesOfCache[track.id] = owners.find((a) => a.genre === track.genre) || owners[0] || null;
  }
  return _seriesOfCache[track.id];
}

/* =====================================================================
   Books
   A book is a PDF (or later EPUB) that belongs to a sheikh and can be attached to a series and
   to individual lectures, so a listener can follow the teaching on the page.

   Page numbers in this file are PRINTED page numbers (the numbers on the paper pages that
   sheikhs refer to in class). `pageOffset` is how many pages sit in front of printed page 1 in the
   PDF file, so PDF page = printed page + pageOffset.

   Laravel: books, book_chapters, book_lecture_links (lecture_id, book_id, from_page, to_page,
   sync_points JSON), book_user_state (user_id, book_id, last_page, saved, downloaded_at),
   book_bookmarks, book_notes. See README section "Books".
   ===================================================================== */
const BOOK_CHAPTERS_BIDAYAT = [
  { title: "Preface to the tenth edition", titleAr: "مقدمة الطبعة العاشرة", page: 3, front: true },
  { title: "Intentions of the student of knowledge", titleAr: "النوايا التي ينويها الطالب", page: 4, front: true },
  { title: "Etiquette of the student of knowledge", titleAr: "آداب طالب العلم", page: 19, front: true },
  { title: "Introduction", titleAr: "مقدمة", page: 45, front: true },
  { n: 1, title: "Purification (Taharah)", titleAr: "كتاب الطهارة", page: 48, sub: [
    { title: "Waters", titleAr: "باب المياه", page: 50 },
    { title: "Vessels", titleAr: "باب الآنية", page: 51 },
    { title: "Siwak and the acts of fitrah", titleAr: "باب السواك وخصال الفطرة", page: 54 },
    { title: "Wudu", titleAr: "باب الوضوء", page: 55 },
    { title: "Wiping over the socks", titleAr: "باب المسح على الخفين", page: 58 },
    { title: "What nullifies wudu", titleAr: "باب نواقض الوضوء", page: 59 },
    { title: "Ghusl", titleAr: "باب الغسل", page: 60 },
    { title: "Tayammum", titleAr: "باب التيمم", page: 63 },
    { title: "Removing impurity", titleAr: "باب إزالة النجاسة", page: 65 },
  ] },
  { n: 2, title: "Prayer (Salah)", titleAr: "كتاب الصلاة", page: 68, sub: [
    { title: "Adhan and iqamah", titleAr: "باب الأذان والإقامة", page: 69 },
    { title: "Conditions of a valid prayer", titleAr: "باب شروط صحة الصلاة", page: 71 },
    { title: "Rulings of the prayer", titleAr: "باب أحكام الصلاة", page: 72 },
    { title: "Prostrations of forgetfulness", titleAr: "باب سجود السهو", page: 81 },
    { title: "Congregational prayer", titleAr: "باب صلاة الجماعة", page: 82 },
    { title: "Friday prayer", titleAr: "باب صلاة الجمعة", page: 84 },
  ] },
  { n: 3, title: "Funerals (Janaiz)", titleAr: "كتاب الجنائز", page: 85 },
  { n: 4, title: "Zakah", titleAr: "كتاب الزكاة", page: 90 },
  { n: 5, title: "Fasting (Siyam)", titleAr: "كتاب الصيام", page: 95 },
  { n: 6, title: "I'tikaf", titleAr: "كتاب الاعتكاف", page: 100 },
  { n: 7, title: "Hajj", titleAr: "كتاب الحج", page: 102 },
  { n: 8, title: "Jihad", titleAr: "كتاب الجهاد", page: 110 },
  { n: 9, title: "Sales (Buyu')", titleAr: "كتاب البيع", page: 113 },
  { n: 10, title: "Interdiction (Hajr)", titleAr: "كتاب الحجر", page: 128 },
  { n: 11, title: "Partnerships (Sharikah)", titleAr: "كتاب الشركة", page: 133 },
  { n: 12, title: "Loans for use (Ariyah)", titleAr: "كتاب العارية", page: 142 },
  { n: 13, title: "Usurpation (Ghasb)", titleAr: "كتاب الغصب", page: 145 },
  { n: 14, title: "Endowments (Waqf)", titleAr: "كتاب الوقف", page: 154 },
  { n: 15, title: "Wills (Wasaya)", titleAr: "كتاب الوصايا", page: 160 },
  { n: 16, title: "Inheritance (Fara'id)", titleAr: "كتاب الفرائض", page: 164 },
  { n: 17, title: "Manumission ('Itq)", titleAr: "كتاب العتق", page: 169 },
  { n: 18, title: "Marriage (Nikah)", titleAr: "كتاب النكاح", page: 171 },
  { n: 19, title: "Dowry (Sadaq)", titleAr: "كتاب الصداق", page: 180 },
  { n: 20, title: "Khul'", titleAr: "كتاب الخلع", page: 187 },
  { n: 21, title: "Divorce (Talaq)", titleAr: "كتاب الطلاق", page: 189 },
  { n: 22, title: "Ila'", titleAr: "كتاب الإيلاء", page: 195 },
  { n: 23, title: "Zihar", titleAr: "كتاب الظهار", page: 197 },
  { n: 24, title: "Li'an", titleAr: "كتاب اللعان", page: 199 },
  { n: 25, title: "Waiting period ('Iddah)", titleAr: "كتاب العدة", page: 202 },
  { n: 26, title: "Breastfeeding (Rada')", titleAr: "كتاب الرضاع", page: 205 },
  { n: 27, title: "Maintenance (Nafaqat)", titleAr: "كتاب النفقات", page: 207 },
  { n: 28, title: "Offences against persons (Jinayat)", titleAr: "كتاب الجنايات", page: 211 },
  { n: 29, title: "Blood money (Diyat)", titleAr: "كتاب الديات", page: 216 },
  { n: 30, title: "Prescribed punishments (Hudud)", titleAr: "كتاب الحدود", page: 222 },
  { n: 31, title: "Foods (At'imah)", titleAr: "كتاب الأطعمة", page: 234 },
  { n: 32, title: "Hunting and slaughter", titleAr: "كتاب الصيد والذبائح", page: 237 },
  { n: 33, title: "Oaths (Aymaan)", titleAr: "كتاب الأيمان", page: 240 },
  { n: 34, title: "Judiciary (Qada')", titleAr: "كتاب القضاء", page: 245 },
  { n: 35, title: "Testimony (Shahadat)", titleAr: "كتاب الشهادات", page: 252 },
  { n: 36, title: "Acknowledgement (Iqrar)", titleAr: "كتاب الإقرار", page: 259 },
  { title: "Index (Fihris)", titleAr: "الفهرس", page: 263, back: true },
  { title: "Licence to teach the text", titleAr: "إجازة في حفظ متن بداية المتفقه", page: 285, back: true },
];

const BOOKS = [
  {
    id: "book-1",
    slug: "bidayat-al-mutafaqqih",
    title: "Bidayat al-Mutafaqqih",
    titleAr: "بداية المتفقه",
    subtitle: "A book that gathers the rulings of fiqh into general principles",
    subtitleAr: "كتاب يجمع الأحكام الفقهية في ضوابط كلية",
    author: "Wahid ibn Abd al-Salam Bali",
    authorAr: "وحيد بن عبد السلام بن بالي",
    publisher: "Dar al-Fawa'id · Dar Ibn Rajab",
    edition: "15th edition",
    language: "Arabic",
    dir: "rtl",
    topic: "Fiqh",
    level: "Beginner",
    format: "PDF",
    pages: 292,                 // pages in the PDF file
    pageOffset: 2,              // PDF page = printed page + 2
    fileSize: 4528715,          // bytes
    file: `${ASSET_BASE}books/bidayat-al-mutafaqqih.pdf`,
    cover: `${ASSET_BASE}img/books/bidayat-al-mutafaqqih.jpg`,
    scanned: true,              // images only, so no in-book text search yet (needs OCR, see README)
    sheikhId: "ssenjala",
    seriesIds: ["alb-21"],
    downloadable: true,
    status: "Published",
    featured: true,
    added: "Nov 2026",
    readers: 3920,
    downloads: 1284,
    description: "A beginner's compendium of Islamic jurisprudence that arranges the rulings of fiqh, from purification to acknowledgement, into short general principles that a student can memorise and return to. It opens with the intentions and etiquette of the student of knowledge. Ssenjala teaches it lesson by lesson in the series below.",
    chapters: BOOK_CHAPTERS_BIDAYAT,
  },
];

const bookById = (id) => BOOKS.find((b) => b.id === id) || null;
const publishedBooks = () => BOOKS.filter((b) => b.status === "Published");
const booksOfSheikh = (sheikhId) => publishedBooks().filter((b) => b.sheikhId === sheikhId);
const booksOfSeries = (series) => (series && series.bookIds ? series.bookIds.map(bookById).filter(Boolean) : []);
const bookOfLecture = (t) => (t && t.bookRef ? bookById(t.bookRef.bookId) : null);
const lecturesOfBook = (b) => TRACKS.filter((t) => t.bookRef && t.bookRef.bookId === b.id).sort((x, y) => x.bookRef.from - y.bookRef.from);
const printedOf = (b, pdfPage) => pdfPage - b.pageOffset;      // PDF page → printed page (≤ 0 means cover/front)
const pdfPageOf = (b, printed) => printed + b.pageOffset;      // printed page → PDF page
const lastPrintedPage = (b) => b.pages - b.pageOffset;

function fmtBytes(n) {
  return n >= 1048576 ? (n / 1048576).toFixed(1).replace(/\.0$/, "") + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
}

/* Flat outline of a book (front matter, books, and their chapters) with the printed page each one ends on. */
function bookOutline(b) {
  const flat = [];
  b.chapters.forEach((c) => {
    flat.push({ ...c, depth: 0, label: c.n ? `${c.n}` : "" });
    (c.sub || []).forEach((s, i) => flat.push({ ...s, depth: 1, label: "" }));
  });
  flat.sort((a, z) => a.page - z.page || a.depth - z.depth);
  flat.forEach((c, i) => { c.end = flat[i + 1] ? Math.max(c.page, flat[i + 1].page - 1) : lastPrintedPage(b); });
  return flat;
}
/* The chapter (deepest one) that contains a printed page, or null before the first chapter. */
function chapterAt(b, printed) {
  let hit = null;
  bookOutline(b).forEach((c) => { if (c.page <= printed) hit = c; });
  return hit;
}

/* Follow-along: which printed page a lecture is on at a given second, and the reverse.
   Exact if an admin saved sync points ({ t: seconds, page }), otherwise spread evenly (an estimate). */
function pageAtTime(t, secs) {
  const { from, to } = t.bookRef;
  if (t.syncPoints && t.syncPoints.length) {
    let p = from;
    t.syncPoints.forEach((s) => { if (secs >= s.t) p = s.page; });
    return p;
  }
  return Math.min(to, from + Math.floor((secs / t.duration) * (to - from + 1)));
}
function timeAtPage(t, page) {
  const { from, to } = t.bookRef;
  if (t.syncPoints && t.syncPoints.length) {
    const hit = t.syncPoints.find((s) => s.page >= page);
    return hit ? hit.t : 0;
  }
  return Math.round(((page - from) / (to - from + 1)) * t.duration);
}
const lectureHasExactSync = (t) => !!(t.syncPoints && t.syncPoints.length);

/* Ssenjala teaches Bidayat al-Mutafaqqih (demo data): one series, one lesson per stretch of pages. */
(function seedBidayatSeries() {
  const book = BOOKS[0];
  const sheikh = ARTISTS.find((a) => a.id === book.sheikhId);
  const lessons = [
    ["Intentions and Etiquette of the Student", 4, 44, 3300],
    ["Purification: Waters and Vessels", 48, 54, 2400],
    ["Wudu, Wiping over the Socks and What Nullifies Wudu", 55, 59, 2700],
    ["Ghusl, Tayammum and Removing Impurity", 60, 67, 3000],
    ["Prayer: Adhan, Conditions and Rulings", 68, 80, 3600],
    ["Forgetfulness, Congregation and Friday Prayer", 81, 84, 2400],
    ["Funerals", 85, 89, 2100],
    ["Zakah", 90, 94, 2700],
  ];
  const series = {
    id: "alb-21",
    title: "Explanation of Bidayat al-Mutafaqqih",
    artistId: sheikh.id,
    artist: sheikh.name,
    type: "Series",
    genre: "Fiqh",
    year: 2026,
    art: book.cover,
    tracks: [],
    bookIds: [book.id],
    description: `${sheikh.name} explains Bidayat al-Mutafaqqih lesson by lesson. Open the book beside each lecture and follow the pages as he teaches.`,
    label: "Ugandan Sheikhs",
    copyright: `© 2026 ${sheikh.name}`,
  };
  lessons.forEach(([name, from, to, duration], i) => {
    const t = {
      id: `trk-${TRACKS.length + 1}`,
      title: `Bidayat al-Mutafaqqih, Lesson ${i + 1}: ${name}`,
      artistId: sheikh.id, artist: sheikh.name,
      album: series.title, genre: "Fiqh", duration,
      plays: 2400 - i * 190, downloads: 610 - i * 48, likes: 380 - i * 31,
      explicit: false, downloadable: true, art: book.cover, year: 2026,
      bookRef: { bookId: book.id, from, to },
    };
    TRACKS.push(t);
    series.tracks.push(t);
  });
  ALBUMS.push(series);
})();

/* "Listen by Moment" (Discover). PLACEHOLDER RULES for the prototype: in Laravel these become
   tags on each lecture (a lecture_moment pivot table). Add as many as you like, the UI copes. */
const _topicIn = (t, ...names) => names.includes(t.genre);
const MOMENTS = [
  { id: "morning",  name: "Morning",       hint: "Short reminders to start the day", icon: "sparkle",   test: (t) => t.duration <= 1800 && _topicIn(t, "Tazkiyah", "Hadith", "Qur'an & Tafsir") },
  { id: "commute",  name: "Commute",       hint: "Under 40 minutes",                 icon: "compass",   test: (t) => t.duration <= 2400 },
  { id: "sleep",    name: "Before Sleep",  hint: "Calm, reflective listening",       icon: "volume",    test: (t) => _topicIn(t, "Seerah", "Tazkiyah", "Qur'an & Tafsir") && t.duration <= 2700 },
  { id: "friday",   name: "Friday",        hint: "Khutbahs and Jumu'ah themes",      icon: "megaphone", test: (t) => _topicIn(t, "Khutbah") || /Friday/i.test(t.title) },
  { id: "ramadan",  name: "Ramadan",       hint: "Fasting and the blessed month",    icon: "star",      test: (t) => _topicIn(t, "Ramadan") || /Fasting/i.test(t.title) },
  { id: "study",    name: "Study",         hint: "In-depth, 40 minutes and longer",  icon: "file",      test: (t) => _topicIn(t, "Fiqh", "Aqeedah", "Hadith", "Qur'an & Tafsir") && t.duration >= 2400 },
  { id: "reflect",  name: "Reflection",    hint: "Character, family and the heart",  icon: "heart",     test: (t) => _topicIn(t, "Tazkiyah", "Family & Marriage", "Youth") },
  { id: "short",    name: "Under 25 min",  hint: "Quick listens",                    icon: "clock",     test: (t) => t.duration <= 1500 },
  { id: "long",     name: "Long-form",     hint: "50 minutes and longer",            icon: "layers",    test: (t) => t.duration >= 3000 },
];

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
  kind: i < 5 ? "personal" : "official",            // personal = made by the listener; official = made by admins
  owner: i < 5 ? "aminanakato" : null,              // personal collections belong to one user (CURRENT_USER.username)
  creator: i < 5 ? "You" : "Ugandan Sheikhs Editorial",
  art: ART(`collection-${i}`, 700, 700),
  tracks: TRACKS.slice(i * 4, i * 4 + 12).length ? TRACKS.slice((i * 3) % TRACKS.length, (i * 3) % TRACKS.length + 10) : TRACKS.slice(0, 10),
  updated: `${(i % 20) + 1} days ago`,
  privacy: i < 5 ? "Private" : "Public",           // personal collections are ALWAYS private; official ones are public
}));

/* Collections come in two kinds:
   - official: created by admins (admin/playlists.html), public to every listener.
   - personal: created by a listener for themselves, visible ONLY to that listener. They never appear
     in Home, Search, sheikh pages or profiles of other people, and admins only see an aggregate count.
   In Laravel: collections.kind + collections.user_id, and a policy that scopes every query. */
const isOfficialCollection = (p) => p.kind === "official";
const isMyCollection = (p) => p.kind === "personal" && p.owner === CURRENT_USER.username;
const canSeeCollection = (p) => isOfficialCollection(p) || isMyCollection(p);
const officialCollections = () => PLAYLISTS.filter(isOfficialCollection);
const myCollections = () => PLAYLISTS.filter(isMyCollection);
const visibleCollections = () => PLAYLISTS.filter(canSeeCollection);

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

/* category groups the notification drawer tabs: lectures | social | system */
const NOTIFICATIONS = [
  { id: 1, type: "follower", category: "social", text: `${COMMENT_NAMES[2]} started following you`, time: "2h ago", unread: true },
  { id: 2, type: "release", category: "lectures", text: `${ARTISTS[0].name} published a new lecture, "${LECTURE_TITLES[0]}"`, time: "5h ago", unread: true },
  { id: 3, type: "playlist", category: "social", text: `Your collection "Understanding the Qur'an" was added to 12 libraries`, time: "1d ago", unread: true },
  { id: 4, type: "reply", category: "social", text: `${COMMENT_NAMES[1]} replied to your comment on "${LECTURE_TITLES[2]}"`, time: "1d ago", unread: false },
  { id: 5, type: "download", category: "system", text: `"${SERIES[0].title}" finished downloading`, time: "2d ago", unread: false },
  { id: 6, type: "system", category: "system", text: "Ugandan Sheikhs: scheduled maintenance completed", time: "3d ago", unread: false },
  { id: 7, type: "follower", category: "social", text: `${COMMENT_NAMES[3]} started following you`, time: "4d ago", unread: false },
  { id: 8, type: "release", category: "lectures", text: `${ARTISTS[1].name} published a new series, "${SERIES[1].title}"`, time: "5d ago", unread: false },
  { id: 9, type: "playlist", category: "lectures", text: `5 new lectures added to "Daily Reminders"`, time: "6d ago", unread: false },
  { id: 10, type: "reply", category: "social", text: `${COMMENT_NAMES[4]} replied to your comment on "${LECTURE_TITLES[5]}"`, time: "1w ago", unread: false },
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
