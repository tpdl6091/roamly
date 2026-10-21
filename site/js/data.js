// 임시(목) 데이터. 이후 단계에서 실제 저장소·현지인 콘텐츠로 교체한다.
export const CITY_OPEN_THRESHOLD = 2000;   // 이 인원이 모이면 도시가 열린다(달성률 100%)

export const CITIES = [
  { id: "seoul", status: "open", name: { ko: "서울", en: "Seoul", ja: "ソウル", zh: "首尔", es: "Seúl", de: "Seoul" } },
  { id: "tokyo", status: "open", name: { ko: "도쿄", en: "Tokyo", ja: "東京", zh: "东京", es: "Tokio", de: "Tokio" } },
  { id: "osaka", status: "open", name: { ko: "오사카", en: "Osaka", ja: "大阪", zh: "大阪", es: "Osaka", de: "Osaka" } },
  { id: "berlin", status: "open", name: { ko: "베를린", en: "Berlin", ja: "ベルリン", zh: "柏林", es: "Berlín", de: "Berlin" } },
  { id: "newyork", status: "open", name: { ko: "뉴욕", en: "New York", ja: "ニューヨーク", zh: "纽约", es: "Nueva York", de: "New York" } },
  { id: "barcelona", status: "open", name: { ko: "바르셀로나", en: "Barcelona", ja: "バルセロナ", zh: "巴塞罗那", es: "Barcelona", de: "Barcelona" } },
];

// 동네 카드 사진(site/img/nb/<동네 id>.jpg). 사진이 없는 동네는 기본 배경을 쓴다
export const NB_IMAGES = {
  elborn: "img/nb/elborn.jpg",
  friedrichshain: "img/nb/friedrichshain.jpg",
  gracia: "img/nb/gracia.jpg",
  greenwichvillage: "img/nb/greenwichvillage.jpg",
  horie: "img/nb/horie.jpg",
  kreuzberg: "img/nb/kreuzberg.jpg",
  kuramae: "img/nb/kuramae.jpg",
  lowereastside: "img/nb/lowereastside.jpg",
  mangwon: "img/nb/mangwon.jpg",
  nakameguro: "img/nb/nakameguro.jpg",
  nakanoshima: "img/nb/nakanoshima.jpg",
  nakazakicho: "img/nb/nakazakicho.jpg",
  neukolln: "img/nb/neukolln.jpg",
  parkslope: "img/nb/parkslope.jpg",
  poblenou: "img/nb/poblenou.jpg",
  prenzlauerberg: "img/nb/prenzlauerberg.webp",
  santantoni: "img/nb/santantoni.jpg",
  seochon: "img/nb/seochon.jpg",
  seongsu: "img/nb/seongsu.jpg",
  shimokitazawa: "img/nb/shimokitazawa.jpg",
  tenjinbashisuji: "img/nb/tenjinbashisuji.jpg",
  williamsburg: "img/nb/williamsburg.jpg",
  yanaka: "img/nb/yanaka.jpg",
  yeonnam: "img/nb/yeonnam.jpg",
};

// 홈 도시 카드 사진(site/img/city/). pos = 카드에서 잘릴 때 보여 줄 중심 위치
export const CITY_IMAGES = {
  seoul: { src: "img/city/seoul.jpg", pos: "20% 45%" },
  tokyo: { src: "img/city/tokyo.jpg", pos: "50% 40%" },
  osaka: { src: "img/city/osaka.jpg", pos: "60% 55%" },
  berlin: { src: "img/city/berlin.jpg", pos: "50% 55%" },
  newyork: { src: "img/city/newyork.jpg", pos: "72% 55%" },
  barcelona: { src: "img/city/barcelona.jpg", pos: "50% 38%" },
};

// 도시 요청 수(목). 사용자가 요청하면 +1.
// 예시 요청 수(2000명 기준): 파리·니스 76%, 포르투·리스본 81%, 부다페스트 42%
export const SEED_REQUESTS = { "프랑스 파리, 니스": 1520, "포르투갈 포르투, 리스본": 1620, "헝가리 부다페스트": 840 };
export const SEED_DEST_NAMES = {
  "프랑스 파리, 니스": { en: "Paris & Nice, France", ja: "フランス パリ・ニース", zh: "法国 巴黎、尼斯", es: "París y Niza, Francia", de: "Paris & Nizza, Frankreich" },
  "포르투갈 포르투, 리스본": { en: "Porto & Lisbon, Portugal", ja: "ポルトガル ポルト・リスボン", zh: "葡萄牙 波尔图、里斯本", es: "Oporto y Lisboa, Portugal", de: "Porto & Lissabon, Portugal" },
  "헝가리 부다페스트": { en: "Budapest, Hungary", ja: "ハンガリー ブダペスト", zh: "匈牙利 布达佩斯", es: "Budapest, Hungría", de: "Budapest, Ungarn" },
};

// 취향 온보딩 선택지 (코드값; 문구는 i18n의 tag_*, style_*, pain_*)
export const TASTE_TAGS = ["quiet_alley", "cafe", "bookstore", "design_shop", "nature", "market"];
export const STYLES = ["slow", "walk", "food"];
export const PAINS = ["eat", "safety", "route", "language"];

// 장소 상세용 코드값 (문구는 i18n의 cat_*, day_*, pay_*, time_*)
export const CATEGORIES = ["cafe", "restaurant", "park", "market", "bookstore", "shop"];

// 장소(목). 모두 가상의 예시이며 실제 가게가 아니다. 실제 현지인 콘텐츠로 교체한다.
// comment.orig 언어가 원문. 그 외 언어는 번역본(없으면 en). visit=방문월, written=작성일.
export const PLACES = [
  { id: "sk-books", nb: "shimokitazawa", cat: "bookstore", orig: "ja", name: { ko: "골목 책방", en: "Alley Books", ja: "路地の本屋" },
    comment: { ja: "平日の午後がおすすめです。週末は混み合うので、ゆっくり見たいなら15時ごろが静かです。", ko: "평일 오후를 추천해요. 주말에는 붐비니, 천천히 보고 싶다면 오후 3시쯤이 조용해요.", en: "Weekday afternoons are best. Weekends get crowded; around 3 pm is quieter if you want to browse slowly." },
    author: { role: "local", years: 6 }, visit: "2026-09", written: "2026-09-20", checkin: true, sponsored: "none",
    tip: { closed: ["mon"], pay: ["card", "ic"], time: "weekday_afternoon", solo: true } },
  { id: "sk-cafe", nb: "shimokitazawa", cat: "cafe", orig: "ja", name: { ko: "작은 커피집", en: "Little Coffee", ja: "小さな珈琲店" },
    comment: { ja: "席が少ないので、一人でカウンターに座るのにちょうどいいです。ブレンドと自家製プリンが人気です。", ko: "좌석이 적어서 혼자 카운터에 앉기 좋아요. 블렌드 커피와 수제 푸딩이 인기예요.", en: "Few seats, so it's a good spot to sit alone at the counter. The house blend and homemade pudding are popular." },
    author: { role: "local", years: 3 }, visit: "2026-08", written: "2026-08-12", checkin: false, sponsored: "none",
    tip: { closed: ["wed"], pay: ["cash", "card"], time: "morning", menu: { ko: "블렌드 커피, 수제 푸딩", en: "House blend, homemade pudding", ja: "ブレンドコーヒー、自家製プリン" }, solo: true } },
  { id: "sk-vintage", nb: "shimokitazawa", cat: "shop", orig: "en", name: { ko: "빈티지 잡화점", en: "Vintage Goods", ja: "古着と雑貨の店" },
    comment: { en: "Narrow shop packed with secondhand clothes. Prices are on tags; some staff speak a little English.", ko: "중고 의류로 가득한 좁은 가게예요. 가격표가 붙어 있고, 영어를 조금 하는 직원도 있어요.", ja: "古着でいっぱいの細い店。値札が付いていて、少し英語が話せるスタッフもいます。" },
    author: { role: "traveler" }, visit: "2025-02", written: "2025-03-05", checkin: false, sponsored: "none",
    tip: { closed: [], pay: ["card", "cash"], time: "weekday_afternoon", solo: true } },

  { id: "yn-books", nb: "yeonnam", cat: "bookstore", orig: "ko", name: { ko: "연남 골목 서점", en: "Lane Bookshop", ja: "路地の書店" },
    comment: { ko: "작은 독립 서점이라 혼자 책 고르기 편해요. 일요일 오후는 조용해서 오래 머물기 좋아요.", en: "A small indie bookstore, easy to browse alone. Sunday afternoons are quiet, good for a long stay.", ja: "小さな独立系書店で、ひとりで本を選びやすいです。日曜の午後は静かで長居できます。" },
    author: { role: "local", years: 5 }, visit: "2026-09", written: "2026-09-11", checkin: true, sponsored: "none",
    tip: { closed: ["mon"], pay: ["card", "qr"], time: "weekday_afternoon", solo: true } },
  { id: "yn-cafe", nb: "yeonnam", cat: "cafe", orig: "ko", name: { ko: "창가 카페", en: "Window Café", ja: "窓辺のカフェ" },
    comment: { ko: "창가 1인석이 있어서 혼자 가기 좋아요. 시그니처 라떼를 추천해요.", en: "Has window seats for one, great for going alone. Try the signature latte.", ja: "窓際に一人席があり、ひとりで行きやすいです。シグネチャーラテがおすすめ。" },
    author: { role: "local", years: 2 }, visit: "2026-08", written: "2026-08-30", checkin: false, sponsored: "gifted",
    tip: { closed: [], pay: ["card", "qr"], time: "morning", menu: { ko: "시그니처 라떼", en: "Signature latte", ja: "シグネチャーラテ" }, solo: true } },
  { id: "yn-noodle", nb: "yeonnam", cat: "restaurant", orig: "ko", name: { ko: "동네 국수집", en: "Neighborhood Noodles", ja: "町の麺屋" },
    comment: { ko: "혼밥 하기 좋은 바 좌석이 있어요. 점심시간에는 줄이 길어서 오후 2시 이후가 편해요.", en: "Has bar seats that suit solo diners. Lunch lines are long; after 2 pm is easier.", ja: "ひとりご飯に向いたカウンター席があります。昼は行列なので14時以降が快適です。" },
    author: { role: "local", years: 8 }, visit: "2026-09", written: "2026-09-25", checkin: true, sponsored: "none",
    tip: { closed: ["sun"], pay: ["card", "cash", "qr"], time: "weekday_afternoon", menu: { ko: "잔치국수", en: "Janchi-guksu (warm noodles)", ja: "チャンチグクス(温かい麺)" }, solo: true } },

  { id: "kr-craft", nb: "kuramae", cat: "shop", orig: "ja", name: { ko: "작은 공방 숍", en: "Tiny Workshop Shop", ja: "小さな工房ショップ" },
    comment: { ja: "手作りの文具や革小物が並びます。見るだけでも歓迎してくれる雰囲気です。", ko: "수제 문구와 가죽 소품이 있어요. 구경만 해도 환영해 주는 분위기예요.", en: "Handmade stationery and leather goods. Browsing only is welcome." },
    author: { role: "local", years: 4 }, visit: "2026-09", written: "2026-09-14", checkin: false, sponsored: "none",
    tip: { closed: ["mon", "tue"], pay: ["card", "ic"], time: "weekday_afternoon", solo: true } },
  { id: "kr-river", nb: "kuramae", cat: "cafe", orig: "ja", name: { ko: "강변 카페", en: "Riverside Café", ja: "川沿いのカフェ" },
    comment: { ja: "川沿いのテラス席が気持ちいいです。夕方は風が涼しくておすすめです。", ko: "강변 테라스 자리가 기분 좋아요. 저녁에는 바람이 시원해서 추천해요.", en: "The riverside terrace is lovely. Evenings are breezy and especially nice." },
    author: { role: "local", years: 4 }, visit: "2026-07", written: "2026-07-30", checkin: true, sponsored: "none",
    tip: { closed: ["tue"], pay: ["card", "ic"], time: "evening", menu: { ko: "아이스 커피, 구운 과자", en: "Iced coffee, baked sweets", ja: "アイスコーヒー、焼き菓子" }, solo: true } },

  { id: "ss-factory", nb: "seongsu", cat: "cafe", orig: "ko", name: { ko: "공장 개조 카페", en: "Factory Café", ja: "工場跡カフェ" },
    comment: { ko: "높은 천장이 인상적이에요. 주말은 대기가 있으니 평일 오전을 추천해요.", en: "Impressive high ceilings. Weekends have waits, so weekday mornings are best.", ja: "高い天井が印象的。週末は待ち時間があるので平日午前がおすすめ。" },
    author: { role: "local", years: 3 }, visit: "2026-09", written: "2026-09-08", checkin: true, sponsored: "none",
    tip: { closed: [], pay: ["card", "qr"], time: "morning", menu: { ko: "드립 커피", en: "Drip coffee", ja: "ドリップコーヒー" }, solo: true } },
  { id: "ss-design", nb: "seongsu", cat: "shop", orig: "en", name: { ko: "디자인 소품점", en: "Design Goods", ja: "デザイン雑貨店" },
    comment: { en: "Lots of items by Korean makers. Good for picking gifts.", ko: "국내 작가 소품이 많아요. 선물 고르기 좋아요.", ja: "韓国の作家の小物が豊富。ギフト選びに向いています。" },
    author: { role: "traveler" }, visit: "2026-08", written: "2026-08-18", checkin: false, sponsored: "none",
    tip: { closed: ["mon"], pay: ["card", "qr"], time: "weekday_afternoon", solo: true } },

  { id: "nz-house", nb: "nakazakicho", cat: "cafe", orig: "ja", name: { ko: "고민가 카페", en: "Old House Café", ja: "古民家カフェ" },
    comment: { ja: "古い家を改装したカフェで、一人席も多いです。雨の日の静かな時間が好きです。", ko: "오래된 집을 개조한 카페로 1인석도 많아요. 비 오는 날의 조용한 시간이 좋아요.", en: "A café in a renovated old house with plenty of single seats. I love the quiet on rainy days." },
    author: { role: "local", years: 7 }, visit: "2026-09", written: "2026-09-16", checkin: false, sponsored: "none",
    tip: { closed: ["mon", "tue"], pay: ["cash", "card"], time: "weekday_afternoon", menu: { ko: "런치 세트", en: "Lunch set", ja: "ランチセット" }, solo: true } },
  { id: "nz-small", nb: "nakazakicho", cat: "shop", orig: "ja", name: { ko: "소품 가게", en: "Small Shop", ja: "雑貨店" },
    comment: { ja: "細い路地にある小さな雑貨店。写真は店主に聞いてから撮ってください。", ko: "좁은 골목의 작은 소품 가게예요. 사진은 점주에게 물어본 뒤 찍어 주세요.", en: "A small shop on a narrow lane. Please ask the owner before taking photos." },
    author: { role: "local", years: 7 }, visit: "2026-09", written: "2026-09-02", checkin: true, sponsored: "none",
    tip: { closed: ["wed"], pay: ["cash"], time: "weekday_afternoon", solo: true } },
];

// 신뢰 시연용 예시 데이터: 다른 이용자들이 남긴 신고·'여전히 맞아요'가 있는 것처럼 보이게 한다.
// reports = 이유별 신고 수, confirmDaysAgo = 며칠 전에 누가 '여전히 맞아요'를 눌렀는지
export const TRUST_SEEDS = {
  "yn-cafe": { reports: { ad: 2 } },                          // 신고 2건: 1건만 더 오면 검수 대기
  "ss-design": { reports: { ad: 1, fake: 1, other: 1 } },     // 신고 3건: 이미 검수 대기
  "sk-books": { confirmDaysAgo: [14, 40] },                   // 최근 확인 2명
  "sk-vintage": { reports: { outdated: 1 } },                 // 오래됨 신고 1건
};

// 지도 표시용 장소 좌표(예시). 가상 장소라 실제 위치가 아니며, 동네 중심 근처에 임의로 흩어 놓았다.
export const PLACE_GEO = {
  "sk-books": [35.6618, 139.6672], "sk-cafe": [35.6609, 139.6684], "sk-vintage": [35.6621, 139.6690],
  "yn-books": [37.5627, 126.9238], "yn-cafe": [37.5618, 126.9252], "yn-noodle": [37.5630, 126.9255],
  "kr-craft": [35.7031, 139.7891], "kr-river": [35.7022, 139.7906],
  "ss-factory": [37.5449, 127.0549], "ss-design": [37.5440, 127.0564],
  "nz-house": [34.7069, 135.5079], "nz-small": [34.7061, 135.5093],
};

// 현장 체크인용 동네 중심 좌표(대략값, 예시). 장소별 정확한 좌표는 실제 장소 데이터가 생기면 사용한다.
export const NEIGHBORHOOD_GEO = {
  shimokitazawa: [35.6613, 139.6677], kuramae: [35.7027, 139.7899], yanaka: [35.7274, 139.7667], nakameguro: [35.6440, 139.6988],
  yeonnam: [37.5622, 126.9245], seongsu: [37.5445, 127.0557], seochon: [37.5806, 126.9703], mangwon: [37.5560, 126.9013],
  nakazakicho: [34.7065, 135.5086], horie: [34.6752, 135.4930], tenjinbashisuji: [34.7040, 135.5120], nakanoshima: [34.6925, 135.5018],
};
export const CHECKIN_RADIUS_M = 1500; // 예시 장소는 동네 반경으로 확인한다. 실제 장소는 100~200m 수준으로 줄인다.

// 동네(목). original=현지 표기, name=표시 이름(ko/en), summary=ko/en/ja (그 외 언어는 en으로 대체)
export const NEIGHBORHOODS = [
  { id: "shimokitazawa", city: "tokyo", original: "下北沢", name: { ko: "시모키타자와", en: "Shimokitazawa" }, places: 24, tags: ["quiet_alley", "bookstore", "cafe"],
    summary: { ko: "조용한 골목에 서점과 빈티지 숍이 모여 있는 동네", en: "Quiet lanes with bookstores and vintage shops", ja: "静かな路地に古書店とヴィンテージショップが集まる街" } },
  { id: "kuramae", city: "tokyo", original: "蔵前", name: { ko: "구라마에", en: "Kuramae" }, places: 17, tags: ["design_shop", "cafe"],
    summary: { ko: "공방과 디자인 숍, 강변 카페가 있는 동네", en: "Workshops, design shops and riverside cafés", ja: "工房とデザインショップ、川沿いのカフェの街" } },
  { id: "yanaka", city: "tokyo", original: "谷中", name: { ko: "야나카", en: "Yanaka" }, places: 12, tags: ["quiet_alley", "market"],
    summary: { ko: "옛 골목과 작은 시장이 남아 있는 동네", en: "Old alleys and a small shopping street", ja: "古い路地と小さな商店街が残る街" } },
  { id: "nakameguro", city: "tokyo", original: "中目黒", name: { ko: "나카메구로", en: "Nakameguro" }, places: 15, tags: ["nature", "cafe"],
    summary: { ko: "강변 산책길과 카페가 이어지는 동네", en: "Riverside walks and cafés", ja: "川沿いの散歩道とカフェが続く街" } },

  { id: "yeonnam", city: "seoul", original: "연남동", name: { ko: "연남동", en: "Yeonnam-dong" }, places: 21, tags: ["cafe", "bookstore", "quiet_alley"],
    summary: { ko: "작은 카페와 독립 서점이 많은 골목 동네", en: "Small cafés and indie bookstores on lanes", ja: "小さなカフェと独立系書店が並ぶ路地の街" } },
  { id: "seongsu", city: "seoul", original: "성수동", name: { ko: "성수동", en: "Seongsu-dong" }, places: 19, tags: ["design_shop", "cafe"],
    summary: { ko: "공장 건물을 개조한 카페와 디자인 숍", en: "Converted factories turned cafés and design shops", ja: "工場跡を改装したカフェとデザインショップ" } },
  { id: "seochon", city: "seoul", original: "서촌", name: { ko: "서촌", en: "Seochon" }, places: 14, tags: ["quiet_alley", "market", "design_shop"],
    summary: { ko: "한옥 골목과 작은 갤러리, 전통시장", en: "Hanok lanes, small galleries and a traditional market", ja: "韓屋の路地と小さなギャラリー、伝統市場" } },
  { id: "mangwon", city: "seoul", original: "망원동", name: { ko: "망원동", en: "Mangwon-dong" }, places: 16, tags: ["market", "nature"],
    summary: { ko: "망원시장과 한강 공원이 가까운 생활 동네", en: "A local market and Han River park nearby", ja: "望遠市場と漢江公園が近い生活の街" } },

  { id: "nakazakicho", city: "osaka", original: "中崎町", name: { ko: "나카자키초", en: "Nakazakicho" }, places: 13, tags: ["cafe", "quiet_alley", "design_shop"],
    summary: { ko: "오래된 집을 고친 카페와 소품숍 골목", en: "Old houses turned into cafés and small shops", ja: "古民家を改装したカフェと雑貨店の路地" } },
  { id: "horie", city: "osaka", original: "堀江", name: { ko: "호리에", en: "Horie" }, places: 15, tags: ["design_shop", "cafe"],
    summary: { ko: "디자인 숍과 카페가 모인 세련된 거리", en: "Design shops and cafés on stylish streets", ja: "デザインショップとカフェが集まるおしゃれな通り" } },
  { id: "tenjinbashisuji", city: "osaka", original: "天神橋筋", name: { ko: "덴진바시스지", en: "Tenjinbashisuji" }, places: 11, tags: ["market"],
    summary: { ko: "길게 이어지는 아케이드 시장 거리", en: "A long covered shopping arcade", ja: "長く続くアーケード商店街" } },
  { id: "nakanoshima", city: "osaka", original: "中之島", name: { ko: "나카노시마", en: "Nakanoshima" }, places: 9, tags: ["nature"],
    summary: { ko: "강 사이 섬의 공원과 미술관 산책", en: "Riverside park and museums on a river island", ja: "川の中洲の公園と美術館の散歩" } },
];

// 베를린·뉴욕·바르셀로나 예시 콘텐츠를 위 목록에 합친다(data-extra-cities.js)
import { EXTRA_NEIGHBORHOODS, EXTRA_NEIGHBORHOOD_GEO, EXTRA_PLACE_GEO, EXTRA_PLACES } from "./data-extra-cities.js";
NEIGHBORHOODS.push(...EXTRA_NEIGHBORHOODS);
PLACES.push(...EXTRA_PLACES);
Object.assign(NEIGHBORHOOD_GEO, EXTRA_NEIGHBORHOOD_GEO);
Object.assign(PLACE_GEO, EXTRA_PLACE_GEO);
