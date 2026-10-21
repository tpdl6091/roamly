// 예시 현지인 60명(도시당 10명)의 데이터. make-demo-hosts.mjs(SQL)와 make-demo-avatars.mjs(얼굴 그림)가 함께 쓴다.
// 앞의 13명은 손으로 쓴 소개이고, 나머지 47명은 규칙(+고정 시드)으로 만들어서 다시 실행해도 같은 결과가 나온다.
// 실제 사람이 아니며, 도시별 동네·관심사·언어는 실제 서비스 데이터(site/js/data.js)와 맞춘다.
const BASE = [
  // 서울
  { n: "sora_k", city: "seoul", nbs: ["yeonnam", "seochon"], ints: ["cafe_tour", "bakery", "photo", "vintage", "neighborhood_walk"], styles: ["relaxed", "like_local"], modes: ["casual", "deep_talk"], langs: [["ko", "native"], ["en", "fluent"]], years: 6, hours: 3, dow: [2, 4, 6, 0],
    bio: "연남동에서 6년째 살고 있어요. 골목 카페와 작은 빵집, 필름 사진 찍기를 좋아해서 천천히 걸으며 동네를 소개해 드려요." },
  { n: "minjun_s", city: "seoul", nbs: ["seongsu"], ints: ["local_eats", "hotspot", "art_exhibit", "music_show", "board_games"], styles: ["active", "new_experience"], modes: ["activity", "casual"], langs: [["ko", "native"], ["en", "conversational"]], years: 4, hours: 2, dow: [3, 5, 6],
    bio: "성수동 공방과 전시를 자주 다녀요. 맛집 한 곳과 전시 한 곳을 묶어서 가볍게 돌아보는 걸 좋아해요." },
  { n: "hayeon_p", city: "seoul", nbs: ["mangwon", "seochon"], ints: ["local_market", "market_street_food", "cooking_together", "language_exchange", "park_nature"], styles: ["relaxed"], modes: ["deep_talk", "casual"], langs: [["ko", "native"], ["ja", "fluent"], ["en", "basic"]], years: 9, hours: 3, dow: [1, 3, 6, 0],
    bio: "망원시장 단골이에요. 시장 구경을 하고 한강 공원에서 쉬면서 서울 사는 이야기를 나누고 싶어요. 일본어로도 대화할 수 있어요.", cost: "시장에서 먹은 것만 각자 부담해요." },
  // 도쿄
  { n: "yuki_t", city: "tokyo", nbs: ["shimokitazawa"], ints: ["reading", "vintage", "cafe_tour", "music_show", "photo"], styles: ["relaxed", "like_local"], modes: ["deep_talk", "casual"], langs: [["ja", "native"], ["en", "conversational"]], years: 8, hours: 3, dow: [2, 4, 6, 0],
    bio: "下北沢で古書店と古着屋めぐりをするのが日課です。静かな路地とライブハウスのある街をゆっくり案内します。" },
  { n: "kenji_m", city: "tokyo", nbs: ["kuramae", "nakameguro"], ints: ["cycling", "local_eats", "art_exhibit", "hidden_spots"], styles: ["active", "new_experience"], modes: ["activity"], langs: [["ja", "native"], ["en", "fluent"]], years: 5, hours: 3, dow: [1, 3, 5, 6],
    bio: "Cycling along the Sumida River and visiting small workshops in Kuramae is my weekend routine. Happy to show you hidden spots by bike." },
  // 오사카
  { n: "haru_o", city: "osaka", nbs: ["nakazakicho", "horie"], ints: ["cafe_tour", "vintage", "photo", "hotspot"], styles: ["relaxed", "new_experience"], modes: ["casual"], langs: [["ja", "native"], ["en", "conversational"]], years: 7, hours: 3, dow: [2, 4, 6, 0],
    bio: "中崎町のレトロなカフェと堀江の雑貨店をまわります。写真が好きな方と一緒に歩きたいです。" },
  { n: "mei_n", city: "osaka", nbs: ["tenjinbashisuji"], ints: ["market_street_food", "local_eats", "local_culture_talk", "cooking_together"], styles: ["like_local"], modes: ["deep_talk", "casual"], langs: [["ja", "native"], ["zh", "fluent"]], years: 12, hours: 3, dow: [1, 3, 6, 0],
    bio: "天神橋筋商店街の近くで育ちました。大阪の食べ歩きと、地元の人の暮らしの話をしながら歩きましょう。中国語も話せます。" },
  // 베를린
  { n: "lena_b", city: "berlin", nbs: ["kreuzberg", "friedrichshain"], ints: ["art_exhibit", "music_show", "local_market", "new_friends", "vintage"], styles: ["active", "new_experience"], modes: ["activity", "casual"], langs: [["de", "native"], ["en", "fluent"]], years: 10, hours: 3, dow: [3, 5, 6, 0],
    bio: "Ich wohne seit zehn Jahren in Kreuzberg. Wochenmarkt, kleine Galerien und Flohmärkte – ich zeige dir gern meine Lieblingsorte." },
  { n: "jonas_k", city: "berlin", nbs: ["prenzlauerberg"], ints: ["reading", "bakery", "cycling", "board_games", "park_nature"], styles: ["relaxed"], modes: ["deep_talk", "casual"], langs: [["de", "native"], ["en", "fluent"]], years: 6, hours: 2, dow: [2, 4, 6],
    bio: "Prenzlauer Berg, kleine Buchläden, gute Bäckereien und viel Radfahren. Gern auch ein Brettspiel-Abend mit Kaffee." },
  // 뉴욕
  { n: "maya_r", city: "newyork", nbs: ["greenwichvillage", "williamsburg"], ints: ["reading", "cafe_tour", "music_show", "photo", "neighborhood_walk"], styles: ["relaxed", "like_local"], modes: ["casual", "deep_talk"], langs: [["en", "native"], ["es", "conversational"]], years: 7, hours: 3, dow: [2, 4, 6, 0],
    bio: "I've lived in the Village for seven years. Used bookshops, jazz clubs and long walks with a coffee in hand — happy to share my routes." },
  { n: "dan_w", city: "newyork", nbs: ["lowereastside", "parkslope"], ints: ["local_eats", "market_street_food", "park_nature", "hidden_spots", "language_exchange"], styles: ["active", "like_local"], modes: ["activity", "casual"], langs: [["en", "native"], ["zh", "basic"]], years: 11, hours: 3, dow: [1, 3, 5, 6],
    bio: "Lower East Side food crawl or a picnic in Prospect Park — you pick. I love swapping language tips along the way." },
  // 바르셀로나
  { n: "marta_v", city: "barcelona", nbs: ["gracia", "elborn"], ints: ["local_market", "cafe_tour", "vintage", "local_culture_talk", "photo"], styles: ["relaxed", "like_local"], modes: ["deep_talk", "casual"], langs: [["es", "native"], ["en", "fluent"]], years: 9, hours: 3, dow: [2, 4, 6, 0],
    bio: "Vivo en Gràcia y me encanta pasear por sus plazas, el mercado y las tiendas de segunda mano. Te cuento cómo vive la gente del barrio." },
  { n: "diego_l", city: "barcelona", nbs: ["poblenou", "santantoni"], ints: ["local_eats", "cycling", "park_nature", "board_games", "language_exchange"], styles: ["active", "new_experience"], modes: ["activity", "casual"], langs: [["es", "native"], ["en", "conversational"]], years: 5, hours: 3, dow: [1, 3, 6, 0],
    bio: "Poblenou en bici, tapas en Sant Antoni y juegos de mesa por la noche. Practiquemos idiomas mientras comemos." },
];

const PEOPLE = {
  sora_k:   { skin: "#f3cfae", hair: "#2b1d16", style: "long",   shirt: "#4a9fb0", bg: "#e4f1f4" },
  minjun_s: { skin: "#f0c8a4", hair: "#1c1612", style: "short",  shirt: "#3b4a5a", bg: "#eef0ea", glasses: true },
  hayeon_p: { skin: "#f5d3b8", hair: "#3a2a20", style: "bun",    shirt: "#c98b6b", bg: "#f6ebe3" },
  yuki_t:   { skin: "#f4d6bb", hair: "#15110f", style: "bob",    shirt: "#6b7f5e", bg: "#e8efe2", glasses: true },
  kenji_m:  { skin: "#e8bd98", hair: "#1a1411", style: "short",  shirt: "#2f5d75", bg: "#e1edf3" },
  haru_o:   { skin: "#f2cfae", hair: "#4a2f21", style: "wavy",   shirt: "#d4a35a", bg: "#f7efdc" },
  mei_n:    { skin: "#f6d9c0", hair: "#161110", style: "long",   shirt: "#a35a6b", bg: "#f5e6ea" },
  lena_b:   { skin: "#f7dcc6", hair: "#b5793c", style: "bob",    shirt: "#4d6b5e", bg: "#e6efe9", freckles: true },
  jonas_k:  { skin: "#f1cfb2", hair: "#6b4a2c", style: "short",  shirt: "#7a8aa6", bg: "#e9edf4", beard: true },
  maya_r:   { skin: "#8d5a3b", hair: "#1a120e", style: "curly",  shirt: "#e0b04f", bg: "#f6edd8" },
  dan_w:    { skin: "#c68a5f", hair: "#201813", style: "buzz",   shirt: "#3d6a8c", bg: "#e4edf5", beard: true },
  marta_v:  { skin: "#e9b88f", hair: "#2a1a14", style: "long",   shirt: "#c45b4a", bg: "#f6e5e0" },
  diego_l:  { skin: "#d6a074", hair: "#231a15", style: "wavy",   shirt: "#5a7d4a", bg: "#e8f0e1", beard: true },
};

// ---------- 도시당 10명이 되도록 나머지를 규칙에 따라 만든다(같은 입력이면 항상 같은 결과) ----------
import { NEIGHBORHOODS } from "../site/js/data.js";

function rng(seed) {                       // mulberry32: 시드가 같으면 같은 수열
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pickOne = (r, a) => a[Math.floor(r() * a.length)];
const pickN = (r, a, n) => { const c = [...a]; const out = []; while (out.length < n && c.length) out.push(c.splice(Math.floor(r() * c.length), 1)[0]); return out; };

export const CATS = {
  cafe_food: ["cafe_tour", "local_eats", "bakery", "market_street_food", "hotspot"],
  culture: ["art_exhibit", "reading", "vintage", "photo", "music_show"],
  outdoor: ["neighborhood_walk", "park_nature", "cycling", "local_market", "hidden_spots"],
  people: ["language_exchange", "new_friends", "local_culture_talk", "board_games", "cooking_together"],
};
export const CAT_OF = Object.fromEntries(Object.entries(CATS).flatMap(([c, ids]) => ids.map((i) => [i, c])));

// 도시별 설정: 현지어, 동네, 영어 외에 덧붙일 수 있는 언어, 피부색 후보, 새 호스트(닉네임·성별 표시)
const CITY = {
  seoul: { lang: "ko", more: ["ja", "zh"], skins: ["#f3cfae", "#f0c8a4", "#f5d3b8", "#e8bd98"], hairs: ["#2b1d16", "#1c1612", "#3a2a20"],
    people: [["jiwoo_l", "f"], ["taeyang_c", "m"], ["seoyeon_h", "f"], ["dohyun_j", "m"], ["eunji_k", "f"], ["hyunwoo_p", "m"], ["naeun_y", "f"]] },
  tokyo: { lang: "ja", more: ["ko", "zh"], skins: ["#f4d6bb", "#e8bd98", "#f2cfae", "#f6d9c0"], hairs: ["#15110f", "#1a1411", "#2b1d16"],
    people: [["sakura_h", "f"], ["ren_k", "m"], ["aoi_s", "f"], ["daichi_t", "m"], ["mio_y", "f"], ["takumi_n", "m"], ["hina_m", "f"], ["sota_i", "m"]] },
  osaka: { lang: "ja", more: ["zh", "ko"], skins: ["#f2cfae", "#e8bd98", "#f6d9c0", "#f4d6bb"], hairs: ["#15110f", "#4a2f21", "#1a1411"],
    people: [["rina_o", "f"], ["shun_k", "m"], ["nana_t", "f"], ["ryota_m", "m"], ["saki_h", "f"], ["kaito_y", "m"], ["yuna_s", "f"], ["tomoya_n", "m"]] },
  berlin: { lang: "de", more: ["es", "ja"], skins: ["#f7dcc6", "#f1cfb2", "#f0c8a4", "#e0ac86"], hairs: ["#b5793c", "#6b4a2c", "#2a1a14", "#d9b26a", "#4a3a2e"],
    people: [["felix_w", "m"], ["anna_m", "f"], ["paul_r", "m"], ["clara_s", "f"], ["max_h", "m"], ["nora_b", "f"], ["leon_k", "m"], ["ida_f", "f"]] },
  newyork: { lang: "en", more: ["es", "zh"], skins: ["#f7dcc6", "#e8bd98", "#c68a5f", "#8d5a3b", "#f0c8a4"], hairs: ["#1a120e", "#6b4a2c", "#2a1a14", "#b5793c"],
    people: [["chris_p", "m"], ["zoe_l", "f"], ["nate_b", "m"], ["lily_t", "f"], ["omar_s", "m"], ["grace_k", "f"], ["jake_m", "m"], ["nina_c", "f"]] },
  barcelona: { lang: "es", more: ["en", "de"], skins: ["#e9b88f", "#d6a074", "#f1cfb2", "#e0ac86"], hairs: ["#2a1a14", "#231a15", "#4a2f21", "#6b4a2c"],
    people: [["pau_g", "m"], ["laia_r", "f"], ["jordi_m", "m"], ["carla_v", "f"], ["nuria_s", "f"], ["marc_b", "m"], ["irene_p", "f"], ["adria_c", "m"]] },
};

// 소개 문장 조각(언어별): 시작 문장 + 분야별 문장 + 마무리
export const TXT = {
  ko: { intro: (nb, y) => `${nb}에서 ${y}년째 살고 있어요.`, cat: {
      cafe_food: ["골목 카페와 작은 빵집, 동네 맛집을 자주 찾아요.", "현지 사람들이 가는 식당과 시장 음식을 소개해 드려요."],
      culture: ["전시와 작은 서점, 빈티지숍을 좋아해요.", "사진을 찍으며 천천히 걷고, 공연 이야기도 나누고 싶어요."],
      outdoor: ["동네를 걷고 공원에서 쉬는 걸 좋아해요.", "숨은 장소를 찾아다니며 일상의 모습을 보여 드려요."],
      people: ["언어 교류와 새로운 친구 만나기를 좋아해요.", "현지 문화 이야기를 나누고, 보드게임이나 요리도 함께 해요."] }, end: ["편하게 요청 주세요.", "천천히 이야기하며 걸어요."] },
  ja: { intro: (nb, y) => `${nb}に${y}年住んでいます。`, cat: {
      cafe_food: ["路地のカフェや小さなパン屋、地元の食堂をよく巡ります。", "地元の人が通う食堂や市場の味を紹介します。"],
      culture: ["展覧会や小さな書店、古着屋めぐりが好きです。", "写真を撮りながらゆっくり歩き、音楽の話もしたいです。"],
      outdoor: ["街歩きと公園でひと休みするのが好きです。", "隠れた場所を探しながら、日常の姿をお見せします。"],
      people: ["言語交換や新しい友達との出会いが好きです。", "地元の文化の話をしたり、ボードゲームや料理も一緒に楽しめます。"] }, end: ["気軽にリクエストしてください。", "のんびり話しながら歩きましょう。"] },
  de: { intro: (nb, y) => `Ich wohne seit ${y} Jahren in ${nb}.`, cat: {
      cafe_food: ["Ich gehe oft in kleine Cafés, Bäckereien und Lokale im Viertel.", "Ich zeige dir, wo die Leute hier wirklich essen."],
      culture: ["Ich mag Ausstellungen, kleine Buchläden und Vintage-Läden.", "Ich fotografiere gern beim Spazieren und rede gern über Musik."],
      outdoor: ["Ich gehe gern spazieren und ruhe mich in Parks aus.", "Ich suche verborgene Orte und zeige dir den Alltag hier."],
      people: ["Ich mag Sprachaustausch und neue Bekanntschaften.", "Wir können über lokale Kultur reden, Brettspiele spielen oder zusammen kochen."] }, end: ["Schreib mir gern eine Anfrage.", "Lass uns in Ruhe plaudern und laufen."] },
  en: { intro: (nb, y) => `I've lived in ${nb} for ${y} years.`, cat: {
      cafe_food: ["I love small cafés, bakeries and neighborhood spots.", "I'll show you where locals actually eat."],
      culture: ["I enjoy exhibitions, little bookshops and vintage stores.", "I like walking slowly with a camera and talking about music."],
      outdoor: ["I like long walks and a rest in the park.", "I'll take you to hidden spots and show everyday life."],
      people: ["I enjoy language exchange and meeting new people.", "We can talk about local culture, play board games or cook together."] }, end: ["Feel free to send a request.", "Let's walk and chat at an easy pace."] },
  es: { intro: (nb, y) => `Vivo en ${nb} desde hace ${y} años.`, cat: {
      cafe_food: ["Me encantan los cafés pequeños, las panaderías y los sitios del barrio.", "Te enseño dónde come de verdad la gente de aquí."],
      culture: ["Me gustan las exposiciones, las librerías pequeñas y las tiendas vintage.", "Disfruto paseando con la cámara y hablando de música."],
      outdoor: ["Me gusta pasear y descansar en el parque.", "Te llevo a rincones escondidos y te muestro el día a día."],
      people: ["Me gusta el intercambio de idiomas y conocer gente nueva.", "Podemos hablar de cultura local, jugar a juegos de mesa o cocinar juntos."] }, end: ["Envíame una solicitud sin problema.", "Paseemos y charlemos con calma."] },
};

const STYLES_ALL = ["relaxed", "active", "like_local", "new_experience"];
const MODES_ALL = ["deep_talk", "casual", "activity"];
const SHIRTS = ["#4a9fb0", "#3b4a5a", "#c98b6b", "#6b7f5e", "#2f5d75", "#d4a35a", "#a35a6b", "#4d6b5e", "#7a8aa6", "#e0b04f", "#3d6a8c", "#c45b4a", "#5a7d4a", "#8a6f9e", "#5f8a8b"];
const BGS = ["#e4f1f4", "#eef0ea", "#f6ebe3", "#e8efe2", "#e1edf3", "#f7efdc", "#f5e6ea", "#e6efe9", "#e9edf4", "#f6edd8", "#e8f0e1", "#efe8f4"];
const STYLES_F = ["long", "bob", "bun", "wavy", "curly", "long"];
const STYLES_M = ["short", "short", "buzz", "wavy", "curly"];

function makeHost(city, [n, g], idx) {
  const c = CITY[city];
  const r = rng(1000 * (Object.keys(CITY).indexOf(city) + 1) + idx * 17 + 5);
  const nbsAll = NEIGHBORHOODS.filter((x) => x.city === city);
  const nbs = pickN(r, nbsAll.map((x) => x.id), 1 + Math.floor(r() * 2));
  // 서로 다른 분야 2~3개에서 관심사를 고른다(3~5개)
  const cats = pickN(r, Object.keys(CATS), 2 + Math.floor(r() * 2));
  const ints = [];
  cats.forEach((cat, k) => ints.push(...pickN(r, CATS[cat], k === 0 ? 2 : 1 + Math.floor(r() * 2))));   // 첫 분야에서 2개 이상 → 항상 3개 이상
  const interests = [...new Set(ints)].slice(0, 5);
  const years = 2 + Math.floor(r() * 13);
  const lang = TXT[c.lang];
  const nbName = nbsAll.find((x) => x.id === nbs[0]).original;
  const usedCats = [...new Set(interests.map((i) => CAT_OF[i]))].slice(0, 2);
  const bio = [lang.intro(nbName, years), ...usedCats.map((cat) => pickOne(r, lang.cat[cat])), pickOne(r, lang.end)].join(" ");
  const langs = [[c.lang, "native"]];
  if (c.lang !== "en") langs.push(["en", pickOne(r, ["basic", "conversational", "conversational", "fluent"])]);
  const extraLang = c.more.filter((l) => !langs.some(([x]) => x === l));   // 이미 있는 언어는 다시 넣지 않는다
  if (extraLang.length && r() < 0.3) langs.push([pickOne(r, extraLang), pickOne(r, ["basic", "conversational"])]);
  const dowAll = [0, 1, 2, 3, 4, 5, 6];
  const dow = pickN(r, dowAll, 3 + Math.floor(r() * 2)).sort();
  if (!dow.includes(6) && !dow.includes(0)) dow[dow.length - 1] = 6;       // 주말이 하나도 없으면 토요일을 넣는다
  const style = g === "f" ? pickOne(r, STYLES_F) : pickOne(r, STYLES_M);
  const avatar = { skin: pickOne(r, c.skins), hair: pickOne(r, c.hairs), style, shirt: pickOne(r, SHIRTS), bg: pickOne(r, BGS),
    ...(r() < 0.2 ? { glasses: true } : {}), ...(g === "m" && ["short", "buzz", "wavy"].includes(style) && r() < 0.3 ? { beard: true } : {}) };
  return {
    n, city, nbs, ints: interests, styles: pickN(r, STYLES_ALL, 1 + Math.floor(r() * 2)), modes: pickN(r, MODES_ALL, 1 + Math.floor(r() * 2)),
    langs, years, hours: 2 + Math.floor(r() * 3), dow, bio, ...(r() < 0.25 ? { cost: { ko: "각자 먹은 것만 부담해요.", ja: "各自が食べた分だけ負担します。", de: "Jeder zahlt nur, was er isst.", en: "Everyone pays only for what they eat.", es: "Cada uno paga solo lo que consume." }[c.lang] } : {}), avatar,
  };
}

const extra = [];
for (const city of Object.keys(CITY)) CITY[city].people.forEach((p, i) => extra.push(makeHost(city, p, i)));

// 기존 13명(손으로 쓴 소개) + 새로 만든 47명 = 도시당 10명. 앞의 13명 순서를 바꾸지 않아 id 가 그대로 유지된다.
// ---------- 거주지: 도시의 동네 4곳 중 한 곳을 시드 기반으로 무작위 선택하고, 소개글을 그 동네 중심으로 다시 쓴다 ----------
// 동네의 성격(tags)을 한 문장으로 풀어 쓴다. 호스트의 모국어로 쓴다.
const NB_LINE = {
  ko: { quiet_alley: (nb) => `${nb}의 조용한 골목길을 눈 감고도 걸을 수 있어요.`, cafe: (nb) => `${nb}에서 오래 앉아 있기 좋은 카페를 여럿 알아요.`,
    bookstore: (nb) => `${nb}의 작은 서점들을 자주 들러요.`, design_shop: (nb) => `${nb}의 디자인 숍과 공방 구경을 좋아해요.`,
    nature: (nb) => `${nb} 근처 공원과 물가를 자주 산책해요.`, market: (nb) => `${nb}의 시장과 먹거리 골목이 제 단골 코스예요.` },
  ja: { quiet_alley: (nb) => `${nb}の静かな路地は目をつぶっても歩けます。`, cafe: (nb) => `${nb}で長居したくなるカフェをいくつも知っています。`,
    bookstore: (nb) => `${nb}の小さな書店によく立ち寄ります。`, design_shop: (nb) => `${nb}のデザインショップや工房めぐりが好きです。`,
    nature: (nb) => `${nb}の近くの公園や水辺をよく散歩します。`, market: (nb) => `${nb}の市場や食べ歩きの路地が行きつけです。` },
  de: { quiet_alley: (nb) => `Die ruhigen Gassen in ${nb} kenne ich im Schlaf.`, cafe: (nb) => `In ${nb} kenne ich mehrere Cafés, in denen man lange sitzen kann.`,
    bookstore: (nb) => `Ich schaue oft in den kleinen Buchläden in ${nb} vorbei.`, design_shop: (nb) => `Ich stöbere gern in den Designläden und Werkstätten in ${nb}.`,
    nature: (nb) => `Ich gehe oft in den Parks und am Wasser bei ${nb} spazieren.`, market: (nb) => `Die Märkte und Imbissgassen in ${nb} sind meine Stammrunde.` },
  en: { quiet_alley: (nb) => `I know the quiet side streets of ${nb} like the back of my hand.`, cafe: (nb) => `I know several cafés in ${nb} that are great for lingering.`,
    bookstore: (nb) => `I'm often popping into the little bookshops in ${nb}.`, design_shop: (nb) => `I love browsing the design shops and workshops in ${nb}.`,
    nature: (nb) => `I often stroll the parks and waterfront near ${nb}.`, market: (nb) => `The markets and food alleys of ${nb} are my regular route.` },
  es: { quiet_alley: (nb) => `Conozco las calles tranquilas de ${nb} como la palma de mi mano.`, cafe: (nb) => `Conozco varios cafés de ${nb} donde da gusto quedarse un rato.`,
    bookstore: (nb) => `Paso a menudo por las pequeñas librerías de ${nb}.`, design_shop: (nb) => `Me encanta curiosear en las tiendas de diseño y talleres de ${nb}.`,
    nature: (nb) => `Suelo pasear por los parques y la orilla cerca de ${nb}.`, market: (nb) => `Los mercados y callejones de comida de ${nb} son mi ruta de siempre.` },
};
// 소개글 첫 문장에서 동네 이름을 말했으니, 둘째 문장에서는 "이 동네"로 받는다
const HERE = { ko: "이 동네", ja: "この街", de: "diesem Viertel", en: "this neighborhood", es: "este barrio" };
const hash = (str) => [...str].reduce((a, ch) => Math.imul(a ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);

function withResidence(h) {
  const r = rng(hash(h.n) + 7);
  const nbsAll = NEIGHBORHOODS.filter((x) => x.city === h.city);
  const home = pickOne(r, nbsAll);
  const lang = TXT[CITY[h.city].lang];
  const nbName = home.original;
  const tag = pickOne(r, home.tags);
  const cat = CAT_OF[pickOne(r, h.ints)];
  const bio = [lang.intro(nbName, h.years), NB_LINE[CITY[h.city].lang][tag](HERE[CITY[h.city].lang]), pickOne(r, lang.cat[cat]), pickOne(r, lang.end)].join(" ");
  return { ...h, nbs: [home.id], bio };
}

export const HOSTS = [...BASE.map((h) => ({ ...h, avatar: PEOPLE[h.n] })), ...extra].map(withResidence);

// 확인: 도시당 10명, 닉네임 중복 없음, 형식·길이
const counts = {};
for (const h of HOSTS) counts[h.city] = (counts[h.city] ?? 0) + 1;
if (Object.values(counts).some((n) => n !== 10)) throw new Error("도시당 10명이 아니에요: " + JSON.stringify(counts));
if (new Set(HOSTS.map((h) => h.n)).size !== HOSTS.length) throw new Error("닉네임이 중복돼요");
for (const h of HOSTS) if (new Set(h.langs.map((l) => l[0])).size !== h.langs.length) throw new Error("언어가 중복돼요: " + h.n);
for (const h of HOSTS) { if (!/^[A-Za-z0-9_가-힣]{2,12}$/.test(h.n)) throw new Error("닉네임 형식: " + h.n); if (h.bio.length > 800) throw new Error("소개가 너무 길어요: " + h.n); if (h.ints.length < 3) throw new Error("관심사가 적어요: " + h.n); }
