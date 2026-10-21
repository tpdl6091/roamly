// 장소 사이 이동 거리·도보 시간 추정(직선거리 기준)
import { t } from "./i18n.js";
import { PLACE_GEO } from "./data.js";

const DETOUR = 1.3;          // 직선거리보다 실제 길이 30% 더 길다고 가정
const WALK_KMH = 4.5;        // 걷는 속도 가정
const WALK_LIMIT_MIN = 30;   // 이보다 오래 걸리면 대중교통·택시를 권한다

export function distanceKm([lat1, lon1], [lat2, lon2]) {
  const rad = (x) => (x * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

// 두 장소 사이 정보. 좌표가 없으면 null
export function legInfo(from, to) {
  const a = from && PLACE_GEO[from.id];
  const b = to && PLACE_GEO[to.id];
  if (!a || !b) return null;
  const km = distanceKm(a, b);
  const min = Math.max(1, Math.round((km * DETOUR / WALK_KMH) * 60));
  return { km, min, walk: min <= WALK_LIMIT_MIN };
}

// "이전 장소에서 도보 약 5분 · 0.3 km" 형태의 문구
export function legText(info) {
  return info.walk ? `${t("rt_walk", { m: info.min })} · ${info.km.toFixed(1)} km` : t("rt_far", { km: info.km.toFixed(1) });
}
// 지도 구간 목록용 짧은 문구
export function legTextShort(info) {
  return info.walk ? t("rt_walk_s", { m: info.min }) : t("rt_far_s");
}

// 하루 요약: 순서대로 이어지는 장소들의 이동 합계
export function daySummary(places) {
  let km = 0, walkMin = 0, transit = 0, legs = 0;
  for (let i = 1; i < places.length; i++) {
    const info = legInfo(places[i - 1], places[i]);
    if (!info) continue;
    legs += 1; km += info.km;
    if (info.walk) walkMin += info.min; else transit += 1;
  }
  return { legs, km, walkMin, transit };
}
export function daySummaryText(places) {
  const s = daySummary(places);
  if (!s.legs) return "";
  return [`${t("rt_day")}: ${s.km.toFixed(1)} km`, t("rt_walk_total", { m: s.walkMin }), s.transit ? t("rt_transit_n", { n: s.transit }) : ""].filter(Boolean).join(" · ");
}
