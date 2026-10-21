// 이동 시간(도보)·끌어서 순서 바꾸기 문구
export const ROUTE_T = {
  ko: {
    drag_handle: "끌어서 순서 바꾸기 (키보드: ↑ ↓)", drag_hint: "⠿ 손잡이를 끌어서 순서를 바꿀 수 있어요.",
    rt_walk: "이전 장소에서 도보 약 {m}분", rt_far: "이전 장소에서 {km}km · 대중교통·택시 권장",
    rt_walk_s: "도보 약 {m}분", rt_far_s: "대중교통·택시 권장",
    rt_day: "하루 이동", rt_walk_total: "도보 합계 약 {m}분", rt_transit_n: "대중교통 권장 {n}구간",
    rt_note: "시간은 직선거리 기준의 대략값이에요(우회 30%, 시속 4.5km 가정). 실제 경로와 교통에 따라 달라져요.",
  },
  en: {
    drag_handle: "Drag to reorder (keyboard: ↑ ↓)", drag_hint: "Drag the ⠿ handle to reorder.",
    rt_walk: "About {m} min walk from the previous stop", rt_far: "{km} km from the previous stop · transit or taxi recommended",
    rt_walk_s: "About {m} min walk", rt_far_s: "Transit or taxi recommended",
    rt_day: "Travel today", rt_walk_total: "Walking total about {m} min", rt_transit_n: "{n} leg(s) better by transit",
    rt_note: "Times are rough estimates from straight-line distance (30% detour, 4.5 km/h assumed). Real routes and transit will differ.",
  },
  ja: {
    drag_handle: "ドラッグして並べ替え（キーボード：↑ ↓）", drag_hint: "⠿ のハンドルをドラッグして順番を変えられます。",
    rt_walk: "前の場所から徒歩約{m}分", rt_far: "前の場所から{km}km・公共交通機関やタクシー推奨",
    rt_walk_s: "徒歩約{m}分", rt_far_s: "公共交通機関やタクシー推奨",
    rt_day: "この日の移動", rt_walk_total: "徒歩合計約{m}分", rt_transit_n: "公共交通推奨 {n}区間",
    rt_note: "時間は直線距離に基づくおおよその目安です（迂回30%、時速4.5km想定）。実際の経路や交通により異なります。",
  },
  zh: {
    drag_handle: "拖动以调整顺序（键盘：↑ ↓）", drag_hint: "拖动 ⠿ 手柄即可调整顺序。",
    rt_walk: "距上一站步行约{m}分钟", rt_far: "距上一站{km}公里 · 建议乘公共交通或打车",
    rt_walk_s: "步行约{m}分钟", rt_far_s: "建议乘公共交通或打车",
    rt_day: "当天移动", rt_walk_total: "步行合计约{m}分钟", rt_transit_n: "建议乘交通工具的路段 {n} 段",
    rt_note: "时间是按直线距离估算的大概值（绕路30%，时速4.5公里）。实际路线和交通会有差异。",
  },
  es: {
    drag_handle: "Arrastra para reordenar (teclado: ↑ ↓)", drag_hint: "Arrastra el asa ⠿ para reordenar.",
    rt_walk: "Unos {m} min a pie desde la parada anterior", rt_far: "{km} km desde la parada anterior · mejor transporte público o taxi",
    rt_walk_s: "Unos {m} min a pie", rt_far_s: "Mejor transporte público o taxi",
    rt_day: "Desplazamientos del día", rt_walk_total: "Total a pie: unos {m} min", rt_transit_n: "{n} tramo(s) mejor en transporte",
    rt_note: "Los tiempos son estimaciones a partir de la línea recta (30 % de rodeo, 4,5 km/h). Las rutas y el transporte reales variarán.",
  },
  de: {
    drag_handle: "Zum Umsortieren ziehen (Tastatur: ↑ ↓)", drag_hint: "Ziehe den ⠿-Griff, um die Reihenfolge zu ändern.",
    rt_walk: "Ca. {m} Min. zu Fuß vom vorherigen Halt", rt_far: "{km} km vom vorherigen Halt · ÖPNV oder Taxi empfohlen",
    rt_walk_s: "Ca. {m} Min. zu Fuß", rt_far_s: "ÖPNV oder Taxi empfohlen",
    rt_day: "Wege des Tages", rt_walk_total: "Zu Fuß insgesamt ca. {m} Min.", rt_transit_n: "{n} Abschnitt(e) besser mit ÖPNV",
    rt_note: "Zeiten sind grobe Schätzungen aus der Luftlinie (30 % Umweg, 4,5 km/h). Echte Routen und Verbindungen weichen ab.",
  },
};
