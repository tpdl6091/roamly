// 여러 화면에서 함께 쓰는 작은 도구들
import { getLang } from "./i18n.js";

// 브라우저 localStorage. 막혀 있어도 오류 없이 동작한다.
export const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

// 여행 데이터(브라우저에 저장). 여행 화면·예산·준비물이 함께 쓴다.
export const getTrips = () => store.get("trips", []);
// 여행이 바뀔 때마다 알려 받을 곳(서버 동기화가 등록한다)
let tripsListener = null;
export const onTripsSaved = (fn) => { tripsListener = fn; };
export const setTrips = (list) => { store.set("trips", list); tripsListener?.(); };
export function mutateTrip(id, fn) {
  const trips = getTrips();
  const trip = trips.find((x) => x.id === id);
  if (!trip) return;
  fn(trip);
  setTrips(trips);
}

// DOM 요소 만들기. 문자열은 textContent로 들어가므로 HTML로 해석되지 않는다.
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) node.append(c?.nodeType ? c : document.createTextNode(c ?? ""));
  return node;
}

// {ko, en, ja} 같은 다국어 값에서 현재 언어를 고르고, 없으면 영어
// 현재 언어 → 영어 → 있는 값 중 첫 번째 순서로 고른다(사용자가 한 언어로만 쓴 글도 보이게)
export const pick = (obj) => obj?.[getLang()] ?? obj?.en ?? Object.values(obj ?? {})[0] ?? "";

// 신뢰 규칙: 식당·카페·시장은 6개월, 그 외 12개월이 지나면 "정보 오래됨"
export function isOutdated(place) {
  const [y, m] = place.visit.split("-").map(Number);
  const now = new Date();
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  const limit = ["cafe", "restaurant", "market"].includes(place.cat) ? 6 : 12;
  return months > limit;
}

// "2026-09" 또는 "2026-09-20" → 현재 언어의 날짜 표기
export function fmtDate(str) {
  const parts = str.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2] || 1);
  const opts = parts[2] ? { year: "numeric", month: "long", day: "numeric" } : { year: "numeric", month: "long" };
  return d.toLocaleDateString(getLang(), opts);
}
