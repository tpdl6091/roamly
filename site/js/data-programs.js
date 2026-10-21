// 호스트·로컬 프로그램 예시 데이터. 모두 가상의 인물·프로그램이며 실제 서비스에서는 서버 데이터로 대체한다.
// 법무 확인 전이라 모든 프로그램은 무료 + 실비 각자 부담(free_cost_share)으로만 둔다.
export const HOSTS = [
  { id: "yuki", role: "local", verified: true, city: "tokyo", nb: "shimokitazawa", years: 6, rating: 4.9, reviews: 31,
    name: { ko: "유키", en: "Yuki", ja: "ゆき" }, languages: ["ja", "en", "ko"], interests: ["bookstore", "cafe", "quiet_alley"],
    bio: { ko: "조용한 골목을 천천히 걷는 걸 좋아해요. 혼자 오신 분도 편하게 함께 걸어요.", en: "I love walking quiet lanes slowly. Solo travelers are very welcome.", ja: "静かな路地をゆっくり歩くのが好きです。ひとりで来た方も気軽にどうぞ。" } },
  { id: "jimin", role: "local", verified: true, city: "seoul", nb: "yeonnam", years: 8, rating: 4.8, reviews: 24,
    name: { ko: "지민", en: "Jimin", ja: "ジミン" }, languages: ["ko", "en", "ja"], interests: ["market", "cafe", "bookstore"],
    bio: { ko: "연남동과 망원동에서 8년째 살고 있어요. 시장 구경과 동네 맛집을 좋아해요.", en: "I've lived in Yeonnam and Mangwon for 8 years. I love markets and neighborhood eateries.", ja: "延南洞と望遠洞に8年住んでいます。市場巡りと町の食堂が好きです。" } },
  { id: "haru", role: "local", verified: true, city: "osaka", nb: "nakazakicho", years: 4, rating: 4.7, reviews: 12,
    name: { ko: "하루", en: "Haru", ja: "はる" }, languages: ["ja", "en"], interests: ["design_shop", "cafe", "quiet_alley"],
    bio: { ko: "오래된 집을 고친 카페와 작은 가게를 좋아해요. 나카자키초 골목을 안내해요.", en: "I love cafés in renovated old houses and tiny shops. I'll show you the lanes of Nakazakicho.", ja: "古民家を改装したカフェや小さなお店が好きです。中崎町の路地をご案内します。" } },
  { id: "mina", role: "traveler", verified: false, city: "tokyo", nb: null, years: null, rating: null, reviews: 0,
    name: { ko: "미나", en: "Mina", ja: "ミナ" }, languages: ["ko", "en"], interests: ["cafe"],
    bio: { ko: "도쿄를 혼자 여행 중이에요. 혼자 먹기 아쉬운 식당에 같이 갈 분을 찾아요.", en: "Travelling solo in Tokyo. Looking for someone to share meals at places that feel awkward alone.", ja: "東京をひとり旅中です。ひとりでは入りにくいお店に一緒に行ける方を探しています。" } },
  { id: "jisu", role: "traveler", verified: false, city: "seoul", nb: null, years: null, rating: null, reviews: 0,
    name: { ko: "지수", en: "Jisu", ja: "ジス" }, languages: ["ko", "en"], interests: ["market"],
    bio: { ko: "서울에서 며칠 머물러요. 시장 구경을 같이 할 여행자를 찾아요.", en: "Staying in Seoul for a few days. Looking for a fellow traveler to explore a market with.", ja: "ソウルに数日滞在します。一緒に市場を回れる旅行者を探しています。" } },
];

// sessions: days = 오늘로부터 며칠 뒤, booked = 이미 신청한 인원(예시)
export const PROGRAMS = [
  { id: "pg-shimokita-walk", type: "walk", host: "yuki", city: "tokyo", nb: "shimokitazawa", hours: 2, capacity: 4, languages: ["ja", "en"],
    title: { ko: "시모키타 골목 산책", en: "Shimokitazawa lane walk", ja: "下北沢の路地さんぽ" },
    desc: { ko: "서점과 빈티지 숍이 모인 골목을 천천히 걷고, 마지막은 동네 카페에서 쉬어요.", en: "A slow walk through lanes of bookstores and vintage shops, ending with a rest at a neighborhood café.", ja: "古書店とヴィンテージショップが集まる路地をゆっくり歩き、最後は町のカフェで一休みします。" },
    cost: { ko: "무료 · 카페 음료는 각자 부담", en: "Free · Drinks at the café are paid by each person", ja: "無料・カフェのドリンクは各自負担" },
    meeting: { ko: "시모키타자와역 남쪽 출구 앞 (공공장소)", en: "In front of Shimokitazawa Station south exit (public place)", ja: "下北沢駅南口前（公共の場所）" },
    sessions: [{ id: "a", days: 3, time: "15:00", booked: 2 }, { id: "b", days: 6, time: "10:30", booked: 0 }, { id: "c", days: 9, time: "15:00", booked: 4 }] },
  { id: "pg-shimokita-eat", type: "food_market", host: "yuki", city: "tokyo", nb: "shimokitazawa", hours: 2.5, capacity: 3, languages: ["ja", "en"],
    title: { ko: "동네 식당 탐방", en: "Neighborhood eatery tour", ja: "町の食堂めぐり" },
    desc: { ko: "현지인이 자주 가는 작은 식당 두 곳을 함께 가요. 혼자서는 들어가기 어려운 곳 위주예요.", en: "We visit two small eateries locals actually use, mostly places that feel hard to enter alone.", ja: "地元の人が通う小さな食堂を2軒、一緒に回ります。ひとりでは入りにくい店が中心です。" },
    cost: { ko: "무료 · 식사비는 각자 부담", en: "Free · Meals are paid by each person", ja: "無料・食事代は各自負担" },
    meeting: { ko: "시모키타자와역 중앙 출구 앞 (공공장소)", en: "In front of Shimokitazawa Station central exit (public place)", ja: "下北沢駅中央口前（公共の場所）" },
    sessions: [{ id: "a", days: 4, time: "18:00", booked: 1 }, { id: "b", days: 8, time: "12:00", booked: 0 }] },
  { id: "pg-yeonnam-walk", type: "walk", host: "jimin", city: "seoul", nb: "yeonnam", hours: 2, capacity: 4, languages: ["ko", "en", "ja"],
    title: { ko: "연남동 골목과 서점 산책", en: "Yeonnam lanes and bookshops walk", ja: "延南洞の路地と書店さんぽ" },
    desc: { ko: "작은 독립 서점과 골목 카페를 걸으며 연남동의 분위기를 느껴 봐요.", en: "Walk past small indie bookstores and lane cafés to feel the mood of Yeonnam.", ja: "小さな独立系書店や路地のカフェを歩いて、延南洞の雰囲気を感じましょう。" },
    cost: { ko: "무료 · 음료는 각자 부담", en: "Free · Drinks are paid by each person", ja: "無料・ドリンクは各自負担" },
    meeting: { ko: "홍대입구역 3번 출구 앞 (공공장소)", en: "In front of Hongik Univ. Station exit 3 (public place)", ja: "弘大入口駅3番出口前（公共の場所）" },
    sessions: [{ id: "a", days: 2, time: "14:00", booked: 3 }, { id: "b", days: 5, time: "14:00", booked: 0 }] },
  { id: "pg-mangwon-market", type: "food_market", host: "jimin", city: "seoul", nb: "mangwon", hours: 3, capacity: 4, languages: ["ko", "en"],
    title: { ko: "망원시장 먹거리 탐방", en: "Mangwon market food tour", ja: "望遠市場グルメ散歩" },
    desc: { ko: "시장을 돌며 현지인이 즐겨 먹는 간식을 맛보고 쓰는 방법도 알려 드려요.", en: "Stroll the market, taste snacks locals love and learn how to order like one.", ja: "市場を巡り、地元の人が好きな軽食を味わい、頼み方もご紹介します。" },
    cost: { ko: "무료 · 먹은 음식 값은 각자 부담", en: "Free · Food is paid by each person", ja: "無料・食べた分は各自負担" },
    meeting: { ko: "망원역 2번 출구 앞 (공공장소)", en: "In front of Mangwon Station exit 2 (public place)", ja: "望遠駅2番出口前（公共の場所）" },
    sessions: [{ id: "a", days: 4, time: "11:00", booked: 1 }, { id: "b", days: 11, time: "11:00", booked: 0 }] },
  { id: "pg-nakazaki-walk", type: "walk", host: "haru", city: "osaka", nb: "nakazakicho", hours: 2, capacity: 4, languages: ["ja", "en"],
    title: { ko: "나카자키초 고민가 골목 산책", en: "Nakazakicho old-house lanes walk", ja: "中崎町の古民家路地さんぽ" },
    desc: { ko: "오래된 집을 고친 카페와 소품 가게를 천천히 둘러봐요.", en: "A relaxed look around cafés and small shops in renovated old houses.", ja: "古民家を改装したカフェや雑貨店をゆっくり巡ります。" },
    cost: { ko: "무료 · 음료는 각자 부담", en: "Free · Drinks are paid by each person", ja: "無料・ドリンクは各自負担" },
    meeting: { ko: "우메다역 인근 공원 입구 (공공장소)", en: "Park entrance near Umeda Station (public place)", ja: "梅田駅近くの公園入口（公共の場所）" },
    sessions: [{ id: "a", days: 5, time: "14:00", booked: 0 }, { id: "b", days: 10, time: "14:00", booked: 2 }] },
  { id: "pg-tokyo-ramen-mate", type: "companion", host: "mina", city: "tokyo", nb: null, hours: 1.5, capacity: 2, languages: ["ko", "en"],
    title: { ko: "혼자 가기 아쉬운 라멘집, 같이 가요", en: "Ramen shop that feels awkward alone: let's go together", ja: "ひとりでは入りにくいラーメン店、一緒に行きましょう" },
    desc: { ko: "카운터 좌석 위주인 인기 라멘집에 같이 갈 여행자를 찾아요. 각자 주문하고 각자 계산해요.", en: "Looking for fellow travelers to try a popular counter-seat ramen shop. Everyone orders and pays for their own.", ja: "カウンター席中心の人気ラーメン店に一緒に行ける旅行者を探しています。注文も支払いもそれぞれです。" },
    cost: { ko: "무료 · 각자 주문하고 각자 계산", en: "Free · Everyone orders and pays separately", ja: "無料・注文も支払いも各自" },
    meeting: { ko: "식당 앞 (공공장소)", en: "In front of the restaurant (public place)", ja: "店の前（公共の場所）" },
    sessions: [{ id: "a", days: 2, time: "19:00", booked: 0 }, { id: "b", days: 3, time: "12:00", booked: 1 }] },
  { id: "pg-seoul-market-mate", type: "companion", host: "jisu", city: "seoul", nb: null, hours: 2, capacity: 3, languages: ["ko", "en"],
    title: { ko: "시장 구경 같이 해요", en: "Let's explore a market together", ja: "一緒に市場を見に行きましょう" },
    desc: { ko: "혼자 시장을 둘러보기 어색한 여행자끼리 가볍게 같이 걸어요. 각자 먹고 싶은 것만 사요.", en: "A light walk for travelers who feel shy about markets alone. Buy only what you like.", ja: "ひとりで市場を回るのが気まずい旅行者同士で気軽に歩きます。食べたいものだけ各自で。" },
    cost: { ko: "무료 · 먹은 음식 값은 각자 부담", en: "Free · Food is paid by each person", ja: "無料・食べた分は各自負担" },
    meeting: { ko: "시장 입구 (공공장소)", en: "Market entrance (public place)", ja: "市場の入口（公共の場所）" },
    sessions: [{ id: "a", days: 3, time: "11:00", booked: 1 }, { id: "b", days: 7, time: "11:00", booked: 0 }] },
];

export const PROGRAM_TYPES = ["walk", "food_market", "companion"];

// 베를린·뉴욕·바르셀로나 예시 호스트·프로그램(모두 가상)
HOSTS.push(
  { id: "lena", role: "local", verified: true, city: "berlin", nb: "kreuzberg", years: 5, rating: 4.8, reviews: 14,
    name: { ko: "레나", en: "Lena", ja: "レナ" }, languages: ["de", "en"], interests: ["market", "cafe"],
    bio: { ko: "크로이츠베르크에서 5년째 살고 있어요. 운하와 시장 산책을 좋아해요.", en: "I've lived in Kreuzberg for 5 years and love walks along the canal and through markets.", ja: "クロイツベルクに5年住んでいます。運河と市場の散歩が好きです。" } },
  { id: "dan", role: "local", verified: true, city: "newyork", nb: "greenwichvillage", years: 9, rating: 4.9, reviews: 22,
    name: { ko: "댄", en: "Dan", ja: "ダン" }, languages: ["en"], interests: ["bookstore", "quiet_alley"],
    bio: { ko: "그리니치 빌리지의 작은 서점과 골목을 안내해요. 천천히 걷는 걸 좋아해요.", en: "I show people the small bookstores and lanes of Greenwich Village. I like walking slowly.", ja: "グリニッジ・ビレッジの小さな書店と路地をご案内します。ゆっくり歩くのが好きです。" } },
  { id: "marta", role: "local", verified: true, city: "barcelona", nb: "gracia", years: 6, rating: 4.7, reviews: 11,
    name: { ko: "마르타", en: "Marta", ja: "マルタ" }, languages: ["es", "en"], interests: ["market", "cafe"],
    bio: { ko: "그라시아의 동네 시장과 광장 카페를 좋아해요. 현지 방식으로 주문하는 법도 알려 드려요.", en: "I love Gràcia's neighborhood market and plaza cafés, and I'll show you how to order like a local.", ja: "グラシアの町の市場と広場のカフェが好きです。地元流の頼み方もお教えします。" } },
);
PROGRAMS.push(
  { id: "pg-berlin-walk", type: "walk", host: "lena", city: "berlin", nb: "kreuzberg", hours: 2, capacity: 4, languages: ["de", "en"],
    title: { ko: "크로이츠베르크 운하 산책", en: "Kreuzberg canal walk", ja: "クロイツベルクの運河さんぽ" },
    desc: { ko: "운하를 따라 걷고 작은 시장과 로스터리 카페에서 쉬어 가요.", en: "Walk along the canal and stop at a small market and a roastery café.", ja: "運河沿いを歩き、小さな市場とロースタリーカフェで休憩します。" },
    cost: { ko: "무료 · 음료는 각자 부담", en: "Free · Drinks are paid by each person", ja: "無料・ドリンクは各自負担" },
    meeting: { ko: "지하철역 출구 앞 (공공장소)", en: "In front of the U-Bahn station exit (public place)", ja: "地下鉄駅の出口前（公共の場所）" },
    sessions: [{ id: "a", days: 4, time: "15:00", booked: 1 }, { id: "b", days: 8, time: "10:30", booked: 0 }] },
  { id: "pg-ny-walk", type: "walk", host: "dan", city: "newyork", nb: "greenwichvillage", hours: 2, capacity: 4, languages: ["en"],
    title: { ko: "그리니치 빌리지 골목과 서점 산책", en: "Greenwich Village lanes and bookstores walk", ja: "グリニッジ・ビレッジの路地と書店さんぽ" },
    desc: { ko: "작은 서점과 카페가 있는 골목을 천천히 걸어요.", en: "A slow walk through lanes with small bookstores and cafés.", ja: "小さな書店とカフェのある路地をゆっくり歩きます。" },
    cost: { ko: "무료 · 음료는 각자 부담", en: "Free · Drinks are paid by each person", ja: "無料・ドリンクは各自負担" },
    meeting: { ko: "지하철역 앞 광장 (공공장소)", en: "Plaza in front of the subway station (public place)", ja: "地下鉄駅前の広場（公共の場所）" },
    sessions: [{ id: "a", days: 3, time: "11:00", booked: 2 }, { id: "b", days: 7, time: "11:00", booked: 0 }] },
  { id: "pg-bcn-market", type: "food_market", host: "marta", city: "barcelona", nb: "gracia", hours: 3, capacity: 4, languages: ["es", "en"],
    title: { ko: "그라시아 동네 시장 탐방", en: "Gràcia neighborhood market tour", ja: "グラシアの町の市場めぐり" },
    desc: { ko: "시장을 돌며 현지인처럼 간식을 사고 광장 카페에서 쉬어요.", en: "Stroll the market, buy snacks like a local and rest at a plaza café.", ja: "市場を巡って地元の人のように軽食を買い、広場のカフェで休みます。" },
    cost: { ko: "무료 · 산 것은 각자 부담", en: "Free · What you buy is paid by each person", ja: "無料・買った分は各自負担" },
    meeting: { ko: "시장 입구 (공공장소)", en: "Market entrance (public place)", ja: "市場の入口（公共の場所）" },
    sessions: [{ id: "a", days: 5, time: "10:30", booked: 1 }, { id: "b", days: 9, time: "10:30", booked: 0 }] },
);

// 참여 후기 예시(참여가 확인된 후기로 표시). 실제 서비스에서는 참여 완료한 사람만 작성할 수 있다.
export const PROGRAM_REVIEWS = {
  "pg-shimokita-walk": [
    { rating: 5, hostRating: 5, at: "2026-09", text: { ko: "혼자 가기 어려웠던 골목을 편하게 걸었어요. 유키 님이 서점 고르는 법도 알려 주셨어요.", en: "I walked lanes I'd never dare alone. Yuki even showed me how to pick a bookstore.", ja: "ひとりでは入りにくい路地を気楽に歩けました。本屋の選び方も教えてもらいました。" } },
    { rating: 4, hostRating: 5, at: "2026-08", text: { ko: "2시간이 금방 갔어요. 마지막 카페에서 쉬는 시간이 좋았어요.", en: "Two hours flew by. The break at the café at the end was lovely.", ja: "2時間があっという間でした。最後のカフェでの休憩が良かったです。" } },
  ],
  "pg-yeonnam-walk": [
    { rating: 5, hostRating: 5, at: "2026-09", text: { ko: "지민 님 덕분에 혼자서는 못 찾았을 서점을 갔어요.", en: "Thanks to Jimin I visited a bookshop I'd never have found alone.", ja: "ジミンさんのおかげで、ひとりでは見つけられない書店に行けました。" } },
  ],
  "pg-mangwon-market": [
    { rating: 4, hostRating: 5, at: "2026-09", text: { ko: "시장 음식 주문하는 법을 배웠어요. 간식을 많이 먹게 되니 배고프게 오세요!", en: "Learned how to order at the market. Come hungry, there's lots of snacking!", ja: "市場での頼み方を教わりました。軽食をたくさん食べるのでお腹をすかせて来てください！" } },
  ],
};
