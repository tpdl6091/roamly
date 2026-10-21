// UI 문구 6개 언어. 키는 코드값, 화면에서 언어별로 렌더링한다.
import { TRIPS_T } from "./i18n-trips.js";
import { WRITE_T } from "./i18n-write.js";
import { HOME_T } from "./i18n-home.js";
import { EXTRAS_T } from "./i18n-extras.js";
import { NOW_T } from "./i18n-now.js";
import { JOURNAL_T } from "./i18n-journal.js";
import { TRUST_T } from "./i18n-trust.js";
import { AUTH_T } from "./i18n-auth.js";
import { MATCH_T } from "./i18n-match.js";
import { CHAT_T } from "./i18n-chat.js";
import { ADMIN_T } from "./i18n-admin.js";
import { LANDING_T } from "./i18n-landing.js";
import { ME_T } from "./i18n-me.js";
import { PROGRAMS_T } from "./i18n-programs.js";
import { FOOD_T } from "./i18n-food.js";
import { MAP_T } from "./i18n-map.js";
import { HOST_T } from "./i18n-host.js";
import { LEGAL_T } from "./i18n-legal.js";
import { ROUTE_T } from "./i18n-route.js";

// 화면별로 나눠 둔 문구 사전. 기본 사전(T)에 없으면 여기서 찾는다.
const EXTRA_SETS = [TRIPS_T, WRITE_T, HOME_T, EXTRAS_T, NOW_T, JOURNAL_T, TRUST_T, ME_T, PROGRAMS_T, FOOD_T, MAP_T, HOST_T, LEGAL_T, ROUTE_T, AUTH_T, MATCH_T, CHAT_T, ADMIN_T, LANDING_T];

export const LANGS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

const T = {
  ko: {
    language: "언어", nav_home: "홈", nav_explore: "탐색", nav_trips: "내 여행", nav_write: "작성", nav_me: "MY",
    hero_title: "혼자 떠나도,\n혼자 헤매지 않도록",
    hero_sub: "어디를 가야 할지 막막한 순간부터 현지인과 함께하는 특별한 경험까지. 믿을 수 있는 로컬 정보로 혼자 떠나는 여행을 더 가볍고 풍성하게 만들어 보세요.",
    search_ph: "도시 검색", pick_city: "도시를 선택하세요", neighborhoods: "동네 {n}곳", coming_soon: "오픈 예정",
    no_result: "검색 결과가 없어요", req_title: "떠나고 싶은 여행지가 있나요?",
    req_sub: "요청이 {t}명 모이면 도시가 열려요.", req_ph: "여행지 이름", req_btn: "여행지 요청하기",
    req_done: "요청이 접수됐어요. 고마워요!", req_dup: "이미 요청한 여행지예요.", req_count: "요청 {n} / {t}명 · 달성률 {p}%",
    soon_title: "준비 중이에요", soon_body: "이 화면은 다음 단계에서 만들어요.",
    city_title: "{city}의 동네", back_home: "← 홈으로",
    onb_title: "나에게 맞는 동네 찾기", onb_step: "{i} / {n}",
    onb_q1: "어떤 동네가 끌리세요?", onb_q1_hint: "여러 개 선택할 수 있어요",
    onb_q2: "여행 스타일은요?", onb_q2_hint: "하나만 골라 주세요 (선택)",
    onb_q3: "혼자일 때 불편한 점", onb_q3_hint: "여러 개 선택할 수 있어요 (선택)",
    tag_quiet_alley: "조용한 골목", tag_cafe: "카페", tag_bookstore: "독립 서점", tag_design_shop: "디자인 숍", tag_nature: "자연·공원", tag_market: "시장·마켓",
    style_slow: "느긋하게", style_walk: "많이 걷기", style_food: "맛집 위주",
    pain_eat: "혼밥", pain_safety: "안전", pain_route: "길 찾기", pain_language: "언어",
    onb_next: "다음", onb_prev: "이전", onb_skip: "건너뛰기", onb_done: "완료하고 동네 보기", onb_need_one: "하나 이상 선택해 주세요",
    sort_taste: "내 취향순", filter_all: "전체", places_count: "현지인 추천 {n}곳", match: "내 취향 {p}%",
    taste_edit: "취향 다시 설정", taste_hint: "취향을 알려 주면 맞는 동네를 먼저 보여드려요", taste_set_btn: "취향 설정하기",
    sample_note: "예시 데이터예요. 실제 현지인 콘텐츠로 교체될 예정이에요.",
    cat_cafe: "카페", cat_restaurant: "식당", cat_park: "공원", cat_market: "시장·마켓", cat_bookstore: "서점", cat_shop: "소품·상점",
    no_places: "아직 등록된 장소가 없어요", no_places_sub: "현지인 추천이 곧 채워질 예정이에요",
    back_city: "← {city}", back_nb: "← {name}", places_total: "장소 {n}곳", solo_ok: "혼자 가기 좋음",
    role_local: "현지인", role_traveler: "여행자", author_years: "거주 {y}년",
    sec_comment: "추천 코멘트", sec_tips: "생활 팁", sec_trust: "신뢰 정보",
    tip_closed: "휴무", tip_closed_none: "정해진 휴무일 없음", tip_pay: "결제", tip_time: "좋은 시간", tip_menu: "추천 메뉴", tip_solo: "혼자 방문", tip_solo_yes: "편해요",
    day_mon: "월요일", day_tue: "화요일", day_wed: "수요일", day_thu: "목요일", day_fri: "금요일", day_sat: "토요일", day_sun: "일요일",
    pay_cash: "현금", pay_card: "카드", pay_ic: "교통카드(IC)", pay_qr: "QR·간편결제",
    time_morning: "오전", time_weekday_afternoon: "평일 오후", time_evening: "저녁", time_anytime: "언제든",
    b_visit: "방문 {d}", b_written: "작성 {d}", b_l0: "직접 방문했다고 작성자가 밝힘", b_l1: "방문일 근처 현장 체크인",
    b_sponsored: "협찬·광고 포함", b_outdated: "정보가 오래됐을 수 있어요", b_sample: "예시 데이터",
    translate_btn: "번역하기", translated: "번역됨", show_original: "원문 보기", show_translation: "번역 보기",
    save: "저장", saved: "저장됨", add_trip: "일정에 추가", add_trip_soon: "일정 기능은 다음 단계에서 만들어요",
    report: "광고·협찬 의심 신고", report_ad: "광고성", report_fake: "허위", report_outdated: "오래된 정보", report_other: "기타",
    report_send: "신고하기", report_done: "신고가 접수됐어요. 검수 후 처리돼요.",
  },
  en: {
    language: "Language", nav_home: "Home", nav_explore: "Explore", nav_trips: "My trips", nav_write: "Write", nav_me: "Me",
    hero_title: "Go solo,\nbut never lost.",
    hero_sub: "From the moment you don't know where to go to special experiences with locals, make solo travel lighter and richer with local info you can trust.",
    search_ph: "Search cities", pick_city: "Choose a city", neighborhoods: "{n} neighborhoods", coming_soon: "Coming soon",
    no_result: "No results", req_title: "Is there a destination you want to visit?",
    req_sub: "We open a city once {t} people request it.", req_ph: "Destination name", req_btn: "Request a destination",
    req_done: "Request received. Thank you!", req_dup: "You already requested this destination.", req_count: "{n} / {t} requests · {p}% reached",
    soon_title: "Coming soon", soon_body: "This screen is built in a later step.",
    city_title: "Neighborhoods in {city}", back_home: "← Home",
    onb_title: "Find neighborhoods for you", onb_step: "{i} / {n}",
    onb_q1: "What kind of neighborhood do you like?", onb_q1_hint: "Pick as many as you like",
    onb_q2: "What's your travel style?", onb_q2_hint: "Pick one (optional)",
    onb_q3: "What's hard when you travel alone?", onb_q3_hint: "Pick any (optional)",
    tag_quiet_alley: "Quiet alleys", tag_cafe: "Cafés", tag_bookstore: "Indie bookstores", tag_design_shop: "Design shops", tag_nature: "Nature & parks", tag_market: "Markets",
    style_slow: "Slow", style_walk: "Lots of walking", style_food: "Food-focused",
    pain_eat: "Eating alone", pain_safety: "Safety", pain_route: "Finding my way", pain_language: "Language",
    onb_next: "Next", onb_prev: "Back", onb_skip: "Skip", onb_done: "Done: see neighborhoods", onb_need_one: "Pick at least one",
    sort_taste: "Best match", filter_all: "All", places_count: "{n} local picks", match: "{p}% match",
    taste_edit: "Retake taste quiz", taste_hint: "Tell us your taste and we'll show matching neighborhoods first", taste_set_btn: "Set my taste",
    sample_note: "Sample data. It will be replaced with real local content.",
    cat_cafe: "Cafés", cat_restaurant: "Restaurants", cat_park: "Parks", cat_market: "Markets", cat_bookstore: "Bookstores", cat_shop: "Shops",
    no_places: "No places yet", no_places_sub: "Local picks are coming soon",
    back_city: "← {city}", back_nb: "← {name}", places_total: "{n} places", solo_ok: "Good for solo visits",
    role_local: "Local", role_traveler: "Traveler", author_years: "Lives here {y} yrs",
    sec_comment: "Recommendation", sec_tips: "Local tips", sec_trust: "Trust info",
    tip_closed: "Closed", tip_closed_none: "No regular closing day", tip_pay: "Payment", tip_time: "Best time", tip_menu: "Try", tip_solo: "Solo visit", tip_solo_yes: "Comfortable",
    day_mon: "Monday", day_tue: "Tuesday", day_wed: "Wednesday", day_thu: "Thursday", day_fri: "Friday", day_sat: "Saturday", day_sun: "Sunday",
    pay_cash: "Cash", pay_card: "Card", pay_ic: "Transit IC card", pay_qr: "QR / mobile pay",
    time_morning: "Morning", time_weekday_afternoon: "Weekday afternoon", time_evening: "Evening", time_anytime: "Anytime",
    b_visit: "Visited {d}", b_written: "Written {d}", b_l0: "Author says they visited in person", b_l1: "Checked in near the visit date",
    b_sponsored: "Includes sponsorship or ads", b_outdated: "Info may be outdated", b_sample: "Sample data",
    translate_btn: "Translate", translated: "Translated", show_original: "Show original", show_translation: "Show translation",
    save: "Save", saved: "Saved", add_trip: "Add to trip", add_trip_soon: "Trip planning is built in the next step",
    report: "Report suspected ad", report_ad: "Ad", report_fake: "Fake", report_outdated: "Outdated", report_other: "Other",
    report_send: "Report", report_done: "Report received. We'll review it.",
  },
  ja: {
    language: "言語", nav_home: "ホーム", nav_explore: "探す", nav_trips: "マイ旅行", nav_write: "投稿", nav_me: "MY",
    hero_title: "ひとりで旅立っても、\nひとりで迷わないように",
    hero_sub: "どこへ行けばいいかわからない瞬間から、地元の人と過ごす特別な体験まで。信頼できるローカル情報で、ひとり旅をもっと軽やかに、もっと豊かに。",
    search_ph: "都市を検索", pick_city: "都市を選んでください", neighborhoods: "エリア {n}", coming_soon: "近日オープン",
    no_result: "結果がありません", req_title: "行ってみたい旅行先はありますか？",
    req_sub: "{t}人のリクエストで都市がオープンします。", req_ph: "旅行先の名前", req_btn: "旅行先をリクエスト",
    req_done: "リクエストを受け付けました。ありがとう！", req_dup: "すでにリクエスト済みの旅行先です。", req_count: "リクエスト {n} / {t}人・達成率 {p}%",
    soon_title: "準備中です", soon_body: "この画面は次のステップで作ります。",
    city_title: "{city}のエリア", back_home: "← ホームへ",
    onb_title: "自分に合う街を探す", onb_step: "{i} / {n}",
    onb_q1: "どんな街に惹かれますか？", onb_q1_hint: "複数選べます",
    onb_q2: "旅のスタイルは？", onb_q2_hint: "ひとつ選択（任意）",
    onb_q3: "ひとり旅で困ることは？", onb_q3_hint: "複数選べます（任意）",
    tag_quiet_alley: "静かな路地", tag_cafe: "カフェ", tag_bookstore: "独立系書店", tag_design_shop: "デザインショップ", tag_nature: "自然・公園", tag_market: "市場・マーケット",
    style_slow: "のんびり", style_walk: "たくさん歩く", style_food: "グルメ中心",
    pain_eat: "ひとりご飯", pain_safety: "安全", pain_route: "道案内", pain_language: "言語",
    onb_next: "次へ", onb_prev: "戻る", onb_skip: "スキップ", onb_done: "完了して街を見る", onb_need_one: "1つ以上選んでください",
    sort_taste: "好みに合う順", filter_all: "すべて", places_count: "地元のおすすめ {n}件", match: "好みに {p}%一致",
    taste_edit: "好みを設定し直す", taste_hint: "好みを教えると合う街を先に表示します", taste_set_btn: "好みを設定",
    sample_note: "サンプルデータです。実際の地元コンテンツに置き換わります。",
    cat_cafe: "カフェ", cat_restaurant: "飲食店", cat_park: "公園", cat_market: "市場・マーケット", cat_bookstore: "書店", cat_shop: "雑貨・ショップ",
    no_places: "まだ場所がありません", no_places_sub: "地元のおすすめがまもなく追加されます",
    back_city: "← {city}", back_nb: "← {name}", places_total: "{n}件", solo_ok: "ひとりで行きやすい",
    role_local: "地元の人", role_traveler: "旅行者", author_years: "在住{y}年",
    sec_comment: "おすすめコメント", sec_tips: "暮らしのコツ", sec_trust: "信頼情報",
    tip_closed: "休み", tip_closed_none: "定休日なし", tip_pay: "支払い", tip_time: "おすすめの時間", tip_menu: "おすすめメニュー", tip_solo: "ひとり利用", tip_solo_yes: "行きやすい",
    day_mon: "月曜日", day_tue: "火曜日", day_wed: "水曜日", day_thu: "木曜日", day_fri: "金曜日", day_sat: "土曜日", day_sun: "日曜日",
    pay_cash: "現金", pay_card: "カード", pay_ic: "交通系IC", pay_qr: "QR・モバイル決済",
    time_morning: "午前", time_weekday_afternoon: "平日の午後", time_evening: "夕方", time_anytime: "いつでも",
    b_visit: "訪問 {d}", b_written: "投稿 {d}", b_l0: "投稿者が実際に訪問したと申告", b_l1: "訪問日の近くに現地チェックイン",
    b_sponsored: "協賛・広告を含む", b_outdated: "情報が古い可能性があります", b_sample: "サンプルデータ",
    translate_btn: "翻訳する", translated: "翻訳済み", show_original: "原文を見る", show_translation: "翻訳を見る",
    save: "保存", saved: "保存済み", add_trip: "旅程に追加", add_trip_soon: "旅程機能は次のステップで作ります",
    report: "広告・協賛の疑いを報告", report_ad: "広告", report_fake: "虚偽", report_outdated: "古い情報", report_other: "その他",
    report_send: "報告する", report_done: "報告を受け付けました。確認後に対応します。",
  },
  zh: {
    language: "语言", nav_home: "首页", nav_explore: "探索", nav_trips: "我的行程", nav_write: "发布", nav_me: "我的",
    hero_title: "一个人出发，\n也不必一个人迷路",
    hero_sub: "从不知道去哪里的迷茫时刻，到与当地人一起的特别体验。用可靠的本地信息，让独自旅行更轻松、更丰富。",
    search_ph: "搜索城市", pick_city: "请选择城市", neighborhoods: "{n}个街区", coming_soon: "即将开放",
    no_result: "没有结果", req_title: "有想去的旅行目的地吗？",
    req_sub: "达到{t}人申请后将开放该城市。", req_ph: "目的地名称", req_btn: "申请开放目的地",
    req_done: "已收到申请，谢谢！", req_dup: "你已申请过这个目的地。", req_count: "申请 {n} / {t}人 · 达成率 {p}%",
    soon_title: "准备中", soon_body: "此页面将在下一步制作。",
    city_title: "{city}的街区", back_home: "← 返回首页",
    onb_title: "找到适合我的街区", onb_step: "{i} / {n}",
    onb_q1: "你喜欢什么样的街区？", onb_q1_hint: "可多选",
    onb_q2: "你的旅行风格？", onb_q2_hint: "单选（可选）",
    onb_q3: "一个人旅行时哪里不方便？", onb_q3_hint: "可多选（可选）",
    tag_quiet_alley: "安静小巷", tag_cafe: "咖啡馆", tag_bookstore: "独立书店", tag_design_shop: "设计小店", tag_nature: "自然·公园", tag_market: "市场",
    style_slow: "悠闲", style_walk: "多走路", style_food: "美食为主",
    pain_eat: "一个人吃饭", pain_safety: "安全", pain_route: "找路", pain_language: "语言",
    onb_next: "下一步", onb_prev: "上一步", onb_skip: "跳过", onb_done: "完成并查看街区", onb_need_one: "请至少选择一项",
    sort_taste: "按我的喜好", filter_all: "全部", places_count: "当地人推荐 {n}处", match: "契合度 {p}%",
    taste_edit: "重新设置喜好", taste_hint: "告诉我们你的喜好，优先为你显示合适的街区", taste_set_btn: "设置喜好",
    sample_note: "这是示例数据，之后会替换为真实的当地内容。",
    cat_cafe: "咖啡馆", cat_restaurant: "餐厅", cat_park: "公园", cat_market: "市场", cat_bookstore: "书店", cat_shop: "小店",
    no_places: "暂无地点", no_places_sub: "当地人推荐即将补充",
    back_city: "← {city}", back_nb: "← {name}", places_total: "{n}处地点", solo_ok: "适合一个人去",
    role_local: "当地人", role_traveler: "旅行者", author_years: "居住{y}年",
    sec_comment: "推荐说明", sec_tips: "生活小贴士", sec_trust: "可信度信息",
    tip_closed: "休息", tip_closed_none: "无固定休息日", tip_pay: "支付", tip_time: "推荐时间", tip_menu: "推荐菜单", tip_solo: "一人到访", tip_solo_yes: "很方便",
    day_mon: "星期一", day_tue: "星期二", day_wed: "星期三", day_thu: "星期四", day_fri: "星期五", day_sat: "星期六", day_sun: "星期日",
    pay_cash: "现金", pay_card: "银行卡", pay_ic: "交通卡(IC)", pay_qr: "扫码·移动支付",
    time_morning: "上午", time_weekday_afternoon: "工作日下午", time_evening: "晚上", time_anytime: "任何时间",
    b_visit: "到访 {d}", b_written: "发布 {d}", b_l0: "作者声明亲自到访", b_l1: "到访日期前后现场签到",
    b_sponsored: "含赞助或广告", b_outdated: "信息可能已过时", b_sample: "示例数据",
    translate_btn: "翻译", translated: "已翻译", show_original: "查看原文", show_translation: "查看译文",
    save: "收藏", saved: "已收藏", add_trip: "加入行程", add_trip_soon: "行程功能将在下一步制作",
    report: "举报疑似广告", report_ad: "广告", report_fake: "虚假", report_outdated: "过时信息", report_other: "其他",
    report_send: "提交举报", report_done: "已收到举报，审核后处理。",
  },
  es: {
    language: "Idioma", nav_home: "Inicio", nav_explore: "Explorar", nav_trips: "Mis viajes", nav_write: "Escribir", nav_me: "Yo",
    hero_title: "Viaja solo,\nsin perderte solo",
    hero_sub: "Desde ese momento en que no sabes adónde ir hasta experiencias especiales con locales. Con información local de confianza, haz tu viaje en solitario más ligero y más rico.",
    search_ph: "Buscar ciudades", pick_city: "Elige una ciudad", neighborhoods: "{n} barrios", coming_soon: "Próximamente",
    no_result: "Sin resultados", req_title: "¿Hay un destino al que quieras viajar?",
    req_sub: "Abrimos una ciudad cuando {t} personas la piden.", req_ph: "Nombre del destino", req_btn: "Pedir un destino",
    req_done: "Solicitud recibida. ¡Gracias!", req_dup: "Ya pediste este destino.", req_count: "{n} / {t} solicitudes · {p}% alcanzado",
    soon_title: "Próximamente", soon_body: "Esta pantalla se crea en un paso posterior.",
    city_title: "Barrios de {city}", back_home: "← Inicio",
    onb_title: "Encuentra barrios para ti", onb_step: "{i} / {n}",
    onb_q1: "¿Qué tipo de barrio te gusta?", onb_q1_hint: "Elige los que quieras",
    onb_q2: "¿Cuál es tu estilo de viaje?", onb_q2_hint: "Elige uno (opcional)",
    onb_q3: "¿Qué te incomoda al viajar solo?", onb_q3_hint: "Elige los que quieras (opcional)",
    tag_quiet_alley: "Callejones tranquilos", tag_cafe: "Cafeterías", tag_bookstore: "Librerías independientes", tag_design_shop: "Tiendas de diseño", tag_nature: "Naturaleza y parques", tag_market: "Mercados",
    style_slow: "Con calma", style_walk: "Caminar mucho", style_food: "Gastronomía",
    pain_eat: "Comer solo", pain_safety: "Seguridad", pain_route: "Orientarme", pain_language: "Idioma",
    onb_next: "Siguiente", onb_prev: "Atrás", onb_skip: "Omitir", onb_done: "Listo: ver barrios", onb_need_one: "Elige al menos una opción",
    sort_taste: "Mejor coincidencia", filter_all: "Todos", places_count: "{n} recomendaciones locales", match: "{p}% de afinidad",
    taste_edit: "Repetir cuestionario", taste_hint: "Cuéntanos tus gustos y te mostramos primero los barrios afines", taste_set_btn: "Definir mis gustos",
    sample_note: "Datos de ejemplo. Se sustituirán por contenido local real.",
    cat_cafe: "Cafeterías", cat_restaurant: "Restaurantes", cat_park: "Parques", cat_market: "Mercados", cat_bookstore: "Librerías", cat_shop: "Tiendas",
    no_places: "Aún no hay lugares", no_places_sub: "Pronto añadiremos recomendaciones locales",
    back_city: "← {city}", back_nb: "← {name}", places_total: "{n} lugares", solo_ok: "Ideal para ir solo",
    role_local: "Local", role_traveler: "Viajero", author_years: "Vive aquí {y} años",
    sec_comment: "Recomendación", sec_tips: "Consejos locales", sec_trust: "Información de confianza",
    tip_closed: "Cierra", tip_closed_none: "Sin día de cierre fijo", tip_pay: "Pago", tip_time: "Mejor momento", tip_menu: "Recomendado", tip_solo: "Para ir solo", tip_solo_yes: "Cómodo",
    day_mon: "lunes", day_tue: "martes", day_wed: "miércoles", day_thu: "jueves", day_fri: "viernes", day_sat: "sábados", day_sun: "domingos",
    pay_cash: "Efectivo", pay_card: "Tarjeta", pay_ic: "Tarjeta de transporte (IC)", pay_qr: "QR / pago móvil",
    time_morning: "Mañana", time_weekday_afternoon: "Tarde entre semana", time_evening: "Noche", time_anytime: "Cualquier momento",
    b_visit: "Visita: {d}", b_written: "Escrito: {d}", b_l0: "El autor dice que fue en persona", b_l1: "Check-in cerca de la fecha de visita",
    b_sponsored: "Incluye patrocinio o publicidad", b_outdated: "Información posiblemente desactualizada", b_sample: "Datos de ejemplo",
    translate_btn: "Traducir", translated: "Traducido", show_original: "Ver original", show_translation: "Ver traducción",
    save: "Guardar", saved: "Guardado", add_trip: "Añadir al viaje", add_trip_soon: "La planificación del viaje se crea en el siguiente paso",
    report: "Denunciar posible publicidad", report_ad: "Publicidad", report_fake: "Falso", report_outdated: "Desactualizado", report_other: "Otro",
    report_send: "Enviar", report_done: "Denuncia recibida. La revisaremos.",
  },
  de: {
    language: "Sprache", nav_home: "Start", nav_explore: "Entdecken", nav_trips: "Meine Reisen", nav_write: "Schreiben", nav_me: "Ich",
    hero_title: "Allein reisen,\nohne allein herumzuirren",
    hero_sub: "Vom Moment der Ratlosigkeit bis zu besonderen Erlebnissen mit Einheimischen: Mit verlässlichen lokalen Infos wird dein Solo-Trip leichter und reicher.",
    search_ph: "Städte suchen", pick_city: "Stadt wählen", neighborhoods: "{n} Viertel", coming_soon: "Demnächst",
    no_result: "Keine Ergebnisse", req_title: "Gibt es ein Reiseziel, das du besuchen möchtest?",
    req_sub: "Eine Stadt öffnet, sobald {t} Personen sie wünschen.", req_ph: "Name des Reiseziels", req_btn: "Reiseziel anfragen",
    req_done: "Anfrage erhalten. Danke!", req_dup: "Du hast dieses Reiseziel schon angefragt.", req_count: "{n} / {t} Anfragen · {p}% erreicht",
    soon_title: "Demnächst", soon_body: "Diese Seite entsteht in einem späteren Schritt.",
    city_title: "Viertel in {city}", back_home: "← Start",
    onb_title: "Viertel für dich finden", onb_step: "{i} / {n}",
    onb_q1: "Welche Art Viertel gefällt dir?", onb_q1_hint: "Mehrfachauswahl möglich",
    onb_q2: "Wie reist du am liebsten?", onb_q2_hint: "Eine Auswahl (optional)",
    onb_q3: "Was ist beim Alleinreisen schwierig?", onb_q3_hint: "Mehrfachauswahl möglich (optional)",
    tag_quiet_alley: "Ruhige Gassen", tag_cafe: "Cafés", tag_bookstore: "Unabhängige Buchläden", tag_design_shop: "Designläden", tag_nature: "Natur & Parks", tag_market: "Märkte",
    style_slow: "Entspannt", style_walk: "Viel laufen", style_food: "Essen im Fokus",
    pain_eat: "Allein essen", pain_safety: "Sicherheit", pain_route: "Orientierung", pain_language: "Sprache",
    onb_next: "Weiter", onb_prev: "Zurück", onb_skip: "Überspringen", onb_done: "Fertig – Viertel ansehen", onb_need_one: "Bitte mindestens eine Auswahl",
    sort_taste: "Beste Übereinstimmung", filter_all: "Alle", places_count: "{n} Tipps von Einheimischen", match: "{p} % Übereinstimmung",
    taste_edit: "Quiz wiederholen", taste_hint: "Sag uns deinen Geschmack, dann zeigen wir passende Viertel zuerst", taste_set_btn: "Geschmack festlegen",
    sample_note: "Beispieldaten. Sie werden durch echte lokale Inhalte ersetzt.",
    cat_cafe: "Cafés", cat_restaurant: "Restaurants", cat_park: "Parks", cat_market: "Märkte", cat_bookstore: "Buchläden", cat_shop: "Läden",
    no_places: "Noch keine Orte", no_places_sub: "Tipps von Einheimischen folgen bald",
    back_city: "← {city}", back_nb: "← {name}", places_total: "{n} Orte", solo_ok: "Gut für Alleinreisende",
    role_local: "Einheimisch", role_traveler: "Reisende:r", author_years: "Wohnt seit {y} Jahren hier",
    sec_comment: "Empfehlung", sec_tips: "Tipps vor Ort", sec_trust: "Vertrauensinfos",
    tip_closed: "Ruhetag", tip_closed_none: "Kein fester Ruhetag", tip_pay: "Zahlung", tip_time: "Beste Zeit", tip_menu: "Probier", tip_solo: "Allein besuchen", tip_solo_yes: "Angenehm",
    day_mon: "Montag", day_tue: "Dienstag", day_wed: "Mittwoch", day_thu: "Donnerstag", day_fri: "Freitag", day_sat: "Samstag", day_sun: "Sonntag",
    pay_cash: "Bar", pay_card: "Karte", pay_ic: "ÖPNV-Karte (IC)", pay_qr: "QR / Mobile Pay",
    time_morning: "Morgens", time_weekday_afternoon: "Wochentags nachmittags", time_evening: "Abends", time_anytime: "Jederzeit",
    b_visit: "Besucht: {d}", b_written: "Verfasst: {d}", b_l0: "Autor:in gibt an, persönlich dort gewesen zu sein", b_l1: "Check-in nahe dem Besuchsdatum",
    b_sponsored: "Enthält Sponsoring oder Werbung", b_outdated: "Infos evtl. veraltet", b_sample: "Beispieldaten",
    translate_btn: "Übersetzen", translated: "Übersetzt", show_original: "Original anzeigen", show_translation: "Übersetzung anzeigen",
    save: "Speichern", saved: "Gespeichert", add_trip: "Zur Reise hinzufügen", add_trip_soon: "Reiseplanung entsteht im nächsten Schritt",
    report: "Verdacht auf Werbung melden", report_ad: "Werbung", report_fake: "Falsch", report_outdated: "Veraltet", report_other: "Sonstiges",
    report_send: "Melden", report_done: "Meldung erhalten. Wir prüfen sie.",
  },
};

let current = "ko";

export function detectLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved && T[saved]) return saved;
  } catch {}
  const nav = (navigator.language || "ko").slice(0, 2);
  return T[nav] ? nav : "en";
}

export function setLang(code) {
  current = T[code] ? code : "en";
  try { localStorage.setItem("lang", current); } catch {}
  document.documentElement.lang = current;
}

export const getLang = () => current;

function lookup(lang, key) {
  let v = T[lang]?.[key];
  for (const set of EXTRA_SETS) { if (v !== undefined) break; v = set[lang]?.[key]; }
  return v;
}

export function t(key, vars = {}) {
  const s = lookup(current, key) ?? lookup("en", key) ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}
