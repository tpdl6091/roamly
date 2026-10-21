// 일정 지도: Leaflet + OpenStreetMap 타일(필요할 때만 불러온다)
import { el, pick } from "./util.js";
import { t } from "./i18n.js";
import { PLACE_GEO } from "./data.js";
import { distanceKm as routeKm, legInfo, legTextShort, daySummary } from "./routing.js";

const LEAFLET_VERSION = "1.9.4";
const BASE = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}`;
let loading = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = `${BASE}/leaflet.min.css`;
    document.head.append(css);
    const script = document.createElement("script");
    script.src = `${BASE}/leaflet.min.js`;
    script.onload = () => resolve(window.L);
    script.onerror = () => { loading = null; reject(new Error("leaflet load failed")); };
    document.head.append(script);
  });
  return loading;
}

function distanceKm([lat1, lon1], [lat2, lon2]) {
  const rad = (x) => (x * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

// places: 그날 일정 순서대로의 장소 목록
export function mapPanel(places) {
  const stops = places.filter((p) => PLACE_GEO[p.id]).map((p) => ({ place: p, geo: PLACE_GEO[p.id] }));
  const box = el("section", { class: "sec" });
  if (!stops.length) { box.append(el("p", { class: "note", style: "margin:0" }, t("map_empty"))); return box; }

  const mapEl = el("div", { class: "tripmap", role: "region", "aria-label": t("map_show") });
  const status = el("p", { class: "note", role: "status", style: "margin:8px 0 0" }, t("map_loading"));
  box.append(mapEl, status);

  // 구간 거리 목록(지도와 상관없이 항상 보여 준다)
  const legs = [];
  for (let i = 1; i < stops.length; i++) legs.push(legInfo(stops[i - 1].place, stops[i].place));
  if (legs.length) {
    const sum = daySummary(stops.map((s) => s.place));
    box.append(el("h3", { class: "section-title" }, t("map_legs")),
      el("ul", { class: "legs" },
        ...legs.map((info, i) => el("li", {}, `${i + 1} → ${i + 2}  ·  ${pick(stops[i].place.name)} → ${pick(stops[i + 1].place.name)}`,
          el("b", {}, ` ${info.km.toFixed(1)} km`), ` · ${legTextShort(info)}`)),
        el("li", {}, `${t("map_total")}`, el("b", {}, ` ${sum.km.toFixed(1)} km`), ` · ${t("rt_walk_total", { m: sum.walkMin })}`)));
  }
  box.append(el("p", { class: "note" }, t("map_note")));

  loadLeaflet().then((L) => {
    const map = L.map(mapEl, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }).addTo(map);
    const pts = stops.map((s) => s.geo);
    if (pts.length > 1) L.polyline(pts, { color: "#1d5c6b", weight: 4, opacity: 0.8, dashArray: "6 8" }).addTo(map);
    stops.forEach((s, i) => {
      L.marker(s.geo, {
        title: pick(s.place.name),
        icon: L.divIcon({ className: "mk-wrap", html: `<span class="mk">${i + 1}</span>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
      }).addTo(map).bindPopup(el("span", {}, `${i + 1}. ${pick(s.place.name)}`));   // 요소로 넘겨 문자열이 HTML로 해석되지 않게 한다
    });
    map.fitBounds(pts, { padding: [32, 32], maxZoom: 16 });
    status.textContent = "";
  }).catch(() => { status.textContent = t("map_fail"); status.className = "err"; });

  return box;
}
