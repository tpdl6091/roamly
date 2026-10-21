// 예시 현지인 60명의 소개글을 6개 언어로 만든다. 실행: node tools/make-demo-bios.mjs → site/js/data-demo-bios.js
//  · DB 에는 소개글이 한 가지 언어로만 저장돼 있어서, 사용자가 고른 언어로 보여 주려고 예시 현지인만 번역본을 따로 둔다.
//  · 그 현지인의 원래 언어(DB 에 저장된 글)는 그대로 쓴다. 나머지 5개 언어만 새로 만든다.
//  · 앞의 13명은 직접 번역했고, 나머지 47명은 같은 문장 조각(demo-hosts-data.mjs)으로 언어별로 조립한다.
import fs from "node:fs";
import { NEIGHBORHOODS } from "../site/js/data.js";
import { HOSTS, TXT, CAT_OF } from "./demo-hosts-data.mjs";

const LANGS = ["ko", "en", "ja", "zh", "es", "de"];
const uuid = (i) => `de00de00-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;

// 중국어는 demo-hosts-data 에 없어서 여기서 보탠다.
const ZH = {
  intro: (nb, y) => `我在${nb}已经住了${y}年。`,
  cat: {
    cafe_food: ["我常去小巷里的咖啡馆、面包店和街坊美食店。", "我会带你去当地人真正吃饭的地方。"],
    culture: ["我喜欢展览、小书店和古着店。", "我喜欢带着相机慢慢散步，也爱聊音乐。"],
    outdoor: ["我喜欢散步，也喜欢在公园里休息。", "我会带你去隐秘的角落，看看这里的日常生活。"],
    people: ["我喜欢语言交流和结识新朋友。", "我们可以聊聊当地文化，也可以一起玩桌游或做饭。"],
  },
  end: ["欢迎随时发来请求。", "我们慢慢走，慢慢聊。"],
};
const TPL = { ...TXT, zh: ZH };

// 앞의 13명(손으로 쓴 소개)의 번역. 원래 언어는 HOSTS 의 bio 를 쓴다.
const TR = {
  sora_k: {
    en: "I've lived in Yeonnam-dong for six years. I love alley cafés, small bakeries and film photography, so I like to walk slowly and show you the neighborhood.",
    ja: "延南洞に住んで6年になります。路地のカフェや小さなパン屋、フィルム写真が好きなので、ゆっくり歩きながら街をご案内します。",
    zh: "我在延南洞住了六年。我喜欢小巷咖啡馆、小面包店和胶片摄影，会慢慢走着给你介绍这个街区。",
    es: "Vivo en Yeonnam-dong desde hace seis años. Me encantan los cafés de los callejones, las panaderías pequeñas y la fotografía analógica, así que te enseño el barrio paseando despacio.",
    de: "Ich wohne seit sechs Jahren in Yeonnam-dong. Ich mag Gassen-Cafés, kleine Bäckereien und analoge Fotografie und zeige dir das Viertel gern in aller Ruhe zu Fuß.",
  },
  minjun_s: {
    en: "I often visit the workshops and exhibitions in Seongsu-dong. I like pairing one good eatery with one exhibition for an easy walk around.",
    ja: "聖水洞の工房や展示をよく訪ねます。おいしいお店を1軒と展示を1つ組み合わせて、気軽に回るのが好きです。",
    zh: "我常去圣水洞的工坊和展览。我喜欢把一家好吃的店和一个展览搭配起来，轻松地逛一逛。",
    es: "Visito a menudo los talleres y las exposiciones de Seongsu-dong. Me gusta combinar un buen restaurante con una exposición para dar un paseo tranquilo.",
    de: "Ich besuche oft die Werkstätten und Ausstellungen in Seongsu-dong. Am liebsten verbinde ich ein gutes Lokal mit einer Ausstellung zu einem lockeren Rundgang.",
  },
  hayeon_p: {
    en: "I'm a regular at Mangwon Market. I'd love to browse the market, relax in the Han River park and chat about life in Seoul. I can also talk in Japanese.",
    ja: "望遠市場の常連です。市場を見て回り、漢江公園でひと休みしながら、ソウルでの暮らしの話をしたいです。日本語でも話せます。",
    zh: "我是望远市场的常客。想一起逛市场，在汉江公园休息，聊聊在首尔生活的故事。我也会说日语。",
    es: "Soy clienta habitual del mercado de Mangwon. Me gustaría recorrer el mercado, descansar en el parque del río Han y hablar de cómo se vive en Seúl. También puedo hablar en japonés.",
    de: "Ich bin Stammgast auf dem Mangwon-Markt. Gern schlendern wir über den Markt, ruhen uns im Han-Fluss-Park aus und reden über das Leben in Seoul. Ich spreche auch Japanisch.",
  },
  yuki_t: {
    ko: "시모키타자와에서 헌책방과 빈티지숍을 도는 게 일상이에요. 조용한 골목과 라이브 하우스가 있는 동네를 천천히 안내해 드릴게요.",
    en: "Browsing secondhand bookshops and vintage stores in Shimokitazawa is part of my daily routine. I'll slowly show you the quiet alleys and live houses of the neighborhood.",
    zh: "在下北泽逛旧书店和古着店是我的日常。我会慢慢带你走走这个有安静小巷和现场演出小酒吧的街区。",
    es: "Recorrer las librerías de segunda mano y las tiendas vintage de Shimokitazawa es mi rutina diaria. Te enseñaré con calma los callejones tranquilos y los locales de música en directo del barrio.",
    de: "Antiquariate und Vintage-Läden in Shimokitazawa gehören zu meinem Alltag. Ich zeige dir in Ruhe die stillen Gassen und die Livemusik-Clubs des Viertels.",
  },
  kenji_m: {
    ko: "스미다강변을 자전거로 달리고 구라마에의 작은 공방을 둘러보는 게 주말 일과예요. 자전거로 숨은 장소를 안내해 드릴게요.",
    ja: "隅田川沿いを自転車で走り、蔵前の小さな工房を訪ねるのが週末の日課です。自転車で隠れた場所をご案内します。",
    zh: "沿着隅田川骑车、参观藏前的小工坊，是我周末的日常。我很乐意骑车带你去那些隐秘的地方。",
    es: "Pedalear junto al río Sumida y visitar los pequeños talleres de Kuramae es mi rutina de fin de semana. Con gusto te llevo en bici a rincones escondidos.",
    de: "Am Wochenende fahre ich am Sumida-Fluss entlang und besuche kleine Werkstätten in Kuramae. Gern zeige ich dir verborgene Orte mit dem Fahrrad.",
  },
  haru_o: {
    ko: "나카자키초의 레트로 카페와 호리에의 잡화점을 돌아다녀요. 사진을 좋아하는 분과 함께 걷고 싶어요.",
    en: "I make the rounds of retro cafés in Nakazakicho and variety shops in Horie. I'd love to walk with someone who enjoys photography.",
    zh: "我会逛中崎町的复古咖啡馆和堀江的杂货店。想和喜欢摄影的朋友一起散步。",
    es: "Recorro los cafés retro de Nakazakicho y las tiendas de objetos de Horie. Me gustaría pasear con alguien a quien le guste la fotografía.",
    de: "Ich besuche die Retro-Cafés in Nakazakicho und die Läden für Kleinkram in Horie. Ich würde gern mit jemandem spazieren gehen, der gern fotografiert.",
  },
  mei_n: {
    ko: "덴진바시스지 상점가 근처에서 자랐어요. 오사카 먹거리를 맛보며 현지 사람들의 생활 이야기를 나누며 걸어요. 중국어도 할 수 있어요.",
    en: "I grew up near the Tenjinbashisuji shopping street. Let's walk, try Osaka street food and talk about everyday life here. I also speak Chinese.",
    zh: "我在天神桥筋商店街附近长大。我们边走边吃大阪的美食，聊聊当地人的生活吧。我也会说中文。",
    es: "Crecí cerca de la calle comercial Tenjinbashisuji. Paseemos probando la comida callejera de Osaka y hablando de la vida cotidiana aquí. También hablo chino.",
    de: "Ich bin in der Nähe der Einkaufsstraße Tenjinbashisuji aufgewachsen. Lass uns spazieren, Osaka-Streetfood probieren und über den Alltag hier reden. Ich spreche auch Chinesisch.",
  },
  lena_b: {
    ko: "크로이츠베르크에서 10년째 살고 있어요. 주말 시장, 작은 갤러리, 벼룩시장 등 제가 좋아하는 곳을 기꺼이 보여 드릴게요.",
    en: "I've lived in Kreuzberg for ten years. Weekly markets, small galleries and flea markets — I'm happy to show you my favorite places.",
    ja: "クロイツベルクに住んで10年になります。週末の市場、小さなギャラリー、蚤の市など、お気に入りの場所を喜んでご案内します。",
    zh: "我在克罗伊茨贝格住了十年。周末集市、小画廊、跳蚤市场，我很乐意带你去我最喜欢的地方。",
    es: "Vivo en Kreuzberg desde hace diez años. Mercados semanales, pequeñas galerías y mercadillos: te enseño encantada mis lugares favoritos.",
  },
  jonas_k: {
    ko: "프렌츨라우어 베르크, 작은 서점, 맛있는 빵집, 그리고 자전거 타기를 좋아해요. 커피와 함께하는 보드게임의 밤도 좋아요.",
    en: "Prenzlauer Berg, small bookshops, good bakeries and lots of cycling. A board-game evening with coffee is welcome too.",
    ja: "プレンツラウアー・ベルク、小さな書店、おいしいパン屋、そしてサイクリングが好きです。コーヒーを飲みながらのボードゲームの夜も歓迎です。",
    zh: "我喜欢普伦茨劳贝格、小书店、好吃的面包店，还有骑自行车。一边喝咖啡一边玩桌游的夜晚也很欢迎。",
    es: "Prenzlauer Berg, librerías pequeñas, buenas panaderías y mucho ciclismo. Una noche de juegos de mesa con café también es bienvenida.",
  },
  maya_r: {
    ko: "빌리지에서 7년째 살고 있어요. 중고 서점, 재즈 클럽, 커피를 들고 걷는 긴 산책을 좋아해요. 제 코스를 기꺼이 알려 드릴게요.",
    ja: "ビレッジに住んで7年になります。古書店、ジャズクラブ、コーヒーを片手にした長い散歩が好きです。私のコースを喜んでお教えします。",
    zh: "我在格林尼治村住了七年。旧书店、爵士俱乐部，还有手捧咖啡的长长散步，都是我的最爱。很乐意分享我的路线。",
    es: "Llevo siete años viviendo en el Village. Librerías de segunda mano, clubes de jazz y largos paseos con un café en la mano: encantada de compartir mis rutas.",
    de: "Ich lebe seit sieben Jahren im Village. Antiquariate, Jazzclubs und lange Spaziergänge mit einem Kaffee in der Hand – gern teile ich meine Routen.",
  },
  dan_w: {
    ko: "로어 이스트 사이드 맛집 탐방이나 프로스펙트 공원 피크닉, 편하게 골라 보세요. 걸으면서 언어 팁을 나누는 것도 좋아해요.",
    ja: "ローワー・イースト・サイドのグルメ巡りでも、プロスペクト公園でのピクニックでも、お好きな方をどうぞ。歩きながら言葉のコツを交換するのも好きです。",
    zh: "下东区美食探店，或者在展望公园野餐，由你来选。我也喜欢边走边交换语言小技巧。",
    es: "Una ruta gastronómica por el Lower East Side o un picnic en Prospect Park: tú eliges. También me encanta intercambiar consejos de idiomas por el camino.",
    de: "Eine kulinarische Tour durch die Lower East Side oder ein Picknick im Prospect Park – du entscheidest. Unterwegs tausche ich gern Sprachtipps aus.",
  },
  marta_v: {
    ko: "그라시아에 살고 있고, 광장과 시장, 중고 가게를 걷는 걸 좋아해요. 동네 사람들이 어떻게 사는지 이야기해 드릴게요.",
    en: "I live in Gràcia and love strolling through its squares, the market and the secondhand shops. I'll tell you how people in the neighborhood really live.",
    ja: "グラシアに住んでいて、広場や市場、古着・古道具の店を歩くのが大好きです。地元の人たちの暮らしぶりをお話しします。",
    zh: "我住在格拉西亚，喜欢逛广场、市场和二手店。我会告诉你街坊邻居是怎么生活的。",
    de: "Ich wohne in Gràcia und schlendere gern über die Plätze, den Markt und durch die Second-Hand-Läden. Ich erzähle dir, wie die Menschen im Viertel leben.",
  },
  diego_l: {
    ko: "자전거로 포블레노우를 돌고, 산 안토니에서 타파스를 먹고, 밤에는 보드게임을 해요. 먹으면서 언어도 연습해 봐요.",
    en: "Poblenou by bike, tapas in Sant Antoni and board games at night. Let's practice languages while we eat.",
    ja: "自転車でポブレノウを回り、サン・アントニでタパスを食べ、夜はボードゲーム。食べながら言葉の練習もしましょう。",
    zh: "骑车逛波布诺，在圣安东尼吃小吃，晚上玩桌游。我们边吃边练习语言吧。",
    de: "Mit dem Rad durch Poblenou, Tapas in Sant Antoni und abends Brettspiele. Lass uns beim Essen Sprachen üben.",
  },
};

// 도시별 현지어(= DB 에 저장된 소개글의 언어). 앞의 13명은 직접 지정한다.
const NATIVE = { seoul: "ko", tokyo: "ja", osaka: "ja", berlin: "de", newyork: "en", barcelona: "es" };
const NATIVE_BASE = { sora_k: "ko", minjun_s: "ko", hayeon_p: "ko", yuki_t: "ja", kenji_m: "en", haru_o: "ja", mei_n: "ja", lena_b: "de", jonas_k: "de", maya_r: "en", dan_w: "en", marta_v: "es", diego_l: "es" };

const nbById = Object.fromEntries(NEIGHBORHOODS.map((n) => [n.id, n]));
const nbText = (id, lang) => (lang === "ko" ? nbById[id].name.ko : ["en", "es", "de"].includes(lang) ? nbById[id].name.en : nbById[id].original);
const BASE_N = 13;

const out = {};
HOSTS.forEach((h, i) => {
  const native = i < BASE_N ? NATIVE_BASE[h.n] : NATIVE[h.city];
  const row = {};
  for (const lang of LANGS) {
    if (lang === native) { row[lang] = h.bio; continue; }
    if (i < BASE_N) { row[lang] = TR[h.n][lang]; continue; }
    // 생성된 소개: [시작 문장, 분야별 문장(최대 2분야), 마무리]. 문장 고르는 번호는 현지인마다 고정한다.
    const tpl = TPL[lang];
    const usedCats = [...new Set(h.ints.map((x) => CAT_OF[x]))].slice(0, 2);
    // 원래 소개글이 고른 문장 번호를 그대로 따라가서, 번역본도 같은 내용이 되게 한다
    const nat = TPL[native];
    const idxOf = (list) => Math.max(0, list.findIndex((x) => h.bio.includes(x)));
    row[lang] = [tpl.intro(nbText(h.nbs[0], lang), h.years), ...usedCats.map((c) => tpl.cat[c][idxOf(nat.cat[c])]), tpl.end[idxOf(nat.end)]].join(lang === "ja" || lang === "zh" ? "" : " ");
  }
  for (const lang of LANGS) if (!row[lang]) throw new Error(`누락: ${h.n} ${lang}`);
  out[uuid(i)] = row;
});

const header = `// 예시 현지인 소개글 번역(자동 생성: node tools/make-demo-bios.mjs). 사용자가 고른 언어로 소개글을 보여 줄 때 쓴다.
// DB 에는 소개글이 한 가지 언어로만 있어서, 예시 현지인에 한해 6개 언어를 여기에 둔다. 번역본이 없는 실제 사용자의 소개글은 쓴 그대로 보인다.
`;
fs.writeFileSync(new URL("../site/js/data-demo-bios.js", import.meta.url), header + "export const DEMO_BIOS = " + JSON.stringify(out, null, 1) + ";\n");
console.log(`소개글 번역 ${Object.keys(out).length}명 × ${LANGS.length}개 언어`);
