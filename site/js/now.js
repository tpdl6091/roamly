// 지금 뭐 하지?: 남은 시간·기분·예산에 맞춘 규칙 기반 장소 추천
import { el, store, pick } from "./util.js";
import { trustOf } from "./trust.js";
import { getLang, t } from "./i18n.js";
import { CITIES, NEIGHBORHOODS, PLACES, NEIGHBORHOOD_GEO, PLACE_GEO } from "./data.js";
import { addToTripPanel } from "./trips.js";

const TIMES = ["15m", "30m", "1h", "2h"];
const MOODS = ["quiet", "active", "new", "social"];
const BUDGETS = ["free", "10k", "50k", "any"];
// 예산 한도(원). any는 제한 없음
const BUDGET_MAX = { free: 0, "10k": 10000, "50k": 50000, any: Infinity };
// 장소 데이터에 가격이 없어서, 종류별 1인 예상 지출(원)로 예산을 거른다. place.cost가 있으면 그 값을 우선한다
const EST_COST = { park: 0, bookstore: 10000, shop: 10000, market: 10000, cafe: 8000, restaurant: 25000 };
const costOf = (p) => p.cost ?? EST_COST[p.cat] ?? 10000;
const DAY_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// 기분별 장소 종류 가중치 (0이면 추천에서 제외)
const MOOD_WEIGHTS = {
  quiet: { bookstore: 3, cafe: 3, park: 3, market: 0, restaurant: 1, shop: 1 },
  active: { park: 3, market: 3, shop: 2, cafe: 1, bookstore: 1, restaurant: 1 },
  new: { market: 3, shop: 3, bookstore: 2, restaurant: 2, park: 1, cafe: 1 },
  social: { cafe: 3, restaurant: 3, market: 3, park: 1, shop: 1, bookstore: 0 },
  any: { cafe: 1, restaurant: 1, bookstore: 1, shop: 1, park: 1, market: 1 },  // '아무거나' 모드: 종류는 가리지 않는다
};
// 남은 시간별로 갈 수 있는 거리(km). 0이면 같은 동네만
const MAX_KM = { "15m": 0, "30m": 1.5, "1h": 4, "2h": Infinity };
const FAR_FROM_ANY_KM = 30;

const nbById = (id) => NEIGHBORHOODS.find((n) => n.id === id);
const cityOfNb = (nb) => nb.city;

function distanceKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function recommend({ nbId, time, mood, budget = "any", now = new Date(), userTags = [], limit = 5 }) {
  const home = nbById(nbId);
  if (!home) return [];
  const homeGeo = NEIGHBORHOOD_GEO[nbId];
  const today = DAY_CODES[now.getDay()];
  const hour = now.getHours();
  const slot = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const weekday = now.getDay() >= 1 && now.getDay() <= 5;
  const weights = MOOD_WEIGHTS[mood ?? "any"];   // 고르지 않은 항목은 제한 없음으로 본다

  const results = [];
  for (const p of PLACES) {
    const nb = nbById(p.nb);
    if (!nb || cityOfNb(nb) !== cityOfNb(home)) continue;
    const km = nb.id === nbId ? 0 : distanceKm(homeGeo, NEIGHBORHOOD_GEO[nb.id]);
    if (km > (MAX_KM[time] ?? Infinity)) continue;
    if (p.tip.closed.includes(today)) continue;      // 오늘 쉬는 곳은 제외
    if (costOf(p) > (BUDGET_MAX[budget] ?? Infinity)) continue;    // 예산 초과 제외
    const w = weights[p.cat] ?? 0;
    if (w <= 0) continue;

    let score = w;
    const reasons = ["r_open"];
    const tt = p.tip.time;
    if ((tt === "morning" && slot === "morning") || (tt === "evening" && slot === "evening")
      || (tt === "weekday_afternoon" && slot === "afternoon" && weekday)) { score += 2; reasons.push("r_timeslot"); }
    if (p.tip.solo) { score += 1; reasons.push("r_solo"); }
    if (nb.tags.some((tag) => userTags.includes(tag))) { score += 1; reasons.push("r_taste"); }
    // 신뢰 상태 반영: 검수 대기와 오래된 정보는 순위를 낮추고, 최근 확인된 정보는 올린다
    const trust = trustOf(p);
    if (trust.review) score -= 3;
    if (trust.outdated) score -= 2;
    if (trust.recent) { score += 1; reasons.push("r_recent"); }
    if (p.sponsored !== "none") score -= 1;
    if (km === 0) { score += 1; reasons.push("r_same"); }

    const cost = costOf(p);
    reasons.push(cost === 0 ? "r_cost_free" : "r_cost");
    if (score > 0) results.push({ place: p, nb, km, score, reasons, cost });
  }
  results.sort((a, b) => b.score - a.score || a.km - b.km);
  return results.slice(0, limit);
}

const gmLink = (label, href) => el("a", { href, target: "_blank", rel: "noopener noreferrer" }, label);

// ---------- 화면 ----------
export function nowView(cityParam) {
  const openNbs = NEIGHBORHOODS.filter((n) => CITIES.find((c) => c.id === n.city)?.status === "open");
  const userTags = store.get("taste", null)?.tags ?? [];
  const state = { nb: null, time: null, mood: null, budget: null, shown: false, random: false };

  const root = el("div", { class: "onb" });
  const nbSel = el("select", { id: "nowNb" }, el("option", { value: "" }, t("now_nb_placeholder")));
  for (const city of CITIES.filter((c) => c.status === "open")) {
    const g = el("optgroup", { label: city.name[getLang()] ?? city.name.en });
    for (const n of openNbs.filter((x) => x.city === city.id)) g.append(el("option", { value: n.id }, getLang() === "ko" ? n.name.ko : n.name.en));
    nbSel.append(g);
  }
  nbSel.value = "";
  nbSel.addEventListener("change", () => { state.nb = nbSel.value || null; refresh(); });

  const locStatus = el("div", { class: "note", role: "status", style: "margin:6px 0 0" });
  const locBtn = el("button", { class: "btn ghost", type: "button" }, t("now_use_location"));
  locBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) { locStatus.textContent = t("now_loc_unavail"); return; }
    if (window.isSecureContext === false) { locStatus.textContent = t("now_loc_insecure"); return; }
    locStatus.textContent = t("now_loc_checking");
    locBtn.disabled = true;
    // 데스크톱은 고정밀(GPS) 요청이 시간초과되기 쉬워, 저정밀(Wi-Fi/IP)로 먼저 시도하고 실패하면 고정밀로 재시도한다
    const attempt = (opts, onFail, precise = false) => navigator.geolocation.getCurrentPosition((pos) => onPos(pos, precise), onFail, opts);
    const onErr = (e) => {
      locBtn.disabled = false;
      locStatus.textContent = e.code === 1 ? t("now_loc_denied") : e.code === 3 ? t("now_loc_timeout") : t("now_loc_unavail");
    };
    const onPos = (pos, precise = false) => {
      // 좌표는 저장하지 않고, 가장 가까운 동네만 고른다
      let best = null;
      for (const n of openNbs) {
        const d = distanceKm([pos.coords.latitude, pos.coords.longitude], NEIGHBORHOOD_GEO[n.id]);
        if (!best || d < best.d) best = { n, d };
      }
      if (!best || best.d > FAR_FROM_ANY_KM) {
        // 저정밀(IP·Wi-Fi) 위치는 수십 km 틀릴 수 있어, 한 번은 정밀 위치로 다시 확인한다
        if (!precise) { locStatus.textContent = t("now_loc_retry"); attempt({ enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }, onErr, true); return; }
        locBtn.disabled = false;
        locStatus.textContent = t("now_loc_far") + " ";
        locStatus.append(gmLink(t("gm_here"), `https://www.google.com/maps/search/?api=1&query=${pos.coords.latitude},${pos.coords.longitude}`));
        return;
      }
      locBtn.disabled = false;
      state.nb = best.n.id; nbSel.value = state.nb;
      locStatus.textContent = t("now_loc_ok", { name: getLang() === "ko" ? best.n.name.ko : best.n.name.en }) + " ";
      // 링크를 누를 때만 구글로 좌표가 전달된다(우리 서버에는 저장·전송하지 않는다)
      locStatus.append(gmLink(t("gm_here"), `https://www.google.com/maps/search/?api=1&query=${pos.coords.latitude},${pos.coords.longitude}`));
      refresh();
    };
    attempt({ enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }, (e) => {
      if (e.code === 1) return onErr(e);
      locStatus.textContent = t("now_loc_retry");
      attempt({ enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }, onErr, true);
    });
  });

  const results = el("div");
  const chipRow = (label, keys, prefix, key) => el("div", { class: "field" },
    el("label", {}, label),
    el("div", { class: "chips", role: "group", "aria-label": label, "data-key": key },
      ...keys.map((k) => el("button", { class: "chip", type: "button", "aria-pressed": String(state[key] === k), "data-value": k }, t(prefix + k)))));

  function draw() {
    root.replaceChildren(
      el("h1", {}, t("now_title")),
      el("p", { class: "hint" }, t("now_sub")),
      el("div", { class: "field" }, el("label", { for: "nowNb" }, t("now_where")), nbSel, el("div", {}, locBtn), locStatus),
      chipRow(t("now_time"), TIMES, "tm_", "time"),
      chipRow(t("now_mood"), MOODS, "md_", "mood"),
      chipRow(t("now_budget"), BUDGETS, "bd_", "budget"),
      el("div", { class: "actions" },
        el("button", { class: "btn grow", type: "button", id: "nowGo" }, t("now_go")),
        el("button", { class: "btn ghost", type: "button", id: "nowRandom" }, t("now_random"))),
      results);
    root.querySelectorAll(".chips[data-key] .chip").forEach((b) => b.addEventListener("click", () => {
      state[b.parentElement.dataset.key] = b.dataset.value;
      b.parentElement.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (state.shown) { state.random = false; refresh(); }
    }));
    root.querySelector("#nowGo").addEventListener("click", () => { state.shown = true; state.random = false; refresh(); });
    root.querySelector("#nowRandom").addEventListener("click", () => { state.shown = true; state.random = true; state.pick = null; refresh(); });
    if (state.shown) renderResults();
  }

  function refresh() { if (state.shown) renderResults(); }

  function renderResults() {
    if (!state.nb) { results.replaceChildren(el("p", { class: "note", role: "alert" }, t("now_need_nb"))); return; }
    const base = { nbId: state.nb, time: state.time, budget: state.budget, userTags };
    if (state.random) {
      // 기분을 묻지 않고, 시간·예산·장소 조건을 통과한 후보 중에서 무작위로 하나를 고른다
      const pool = recommend({ ...base, mood: "any", limit: Infinity });
      const prev = state.pick;
      const choices = pool.length > 1 ? pool.filter((x) => x.place.id !== prev) : pool;
      const chosen = choices[Math.floor(Math.random() * choices.length)];
      state.pick = chosen?.place.id;
      results.replaceChildren(
        el("h2", { class: "section-title" }, t("now_random")),
        ...(chosen
          ? [el("p", { class: "note" }, t("now_random_note")), resultCard(chosen),
             el("button", { class: "btn ghost sm", type: "button", onclick: () => renderResults() }, t("now_random_again"))]
          : [el("p", { class: "note" }, t("now_none"))]),
        el("p", { class: "note" }, t("now_note")));
      return;
    }
    const items = recommend({ ...base, mood: state.mood });
    results.replaceChildren(
      el("h2", { class: "section-title" }, t("now_results")),
      ...(items.length ? items.map(resultCard) : [el("p", { class: "note" }, t("now_none"))]),
      el("p", { class: "note" }, t("now_note")));
  }

  function resultCard({ place, nb, km, reasons, cost }) {
    const panel = addToTripPanel(place);
    const addBtn = el("button", { class: "btn ghost sm", type: "button", onclick: () => addBtn.setAttribute("aria-expanded", String(panel.toggle())) }, t("add_trip"));
    return el("div", { class: "pcard", style: "margin-bottom:12px" },
      el("div", { class: "nhead" },
        el("a", { href: `#/p/${place.id}` }, el("b", {}, pick(place.name))),
        el("small", {}, getLang() === "ko" ? nb.name.ko : nb.name.en)),
      el("p", {}, pick(place.comment)),
      el("div", { class: "ntags" },
        el("span", { class: "pill" }, t("cat_" + place.cat)),
        ...reasons.map((r) => el("span", { class: "pill ok" }, t(r, { cost: "₩" + cost.toLocaleString() }))),
        km > 0 ? el("span", { class: "pill" }, t("r_near", { km: Math.max(1, Math.round(km)) })) : ""),
      el("div", { style: "margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center" }, addBtn,
        ...(PLACE_GEO[place.id] ? [
          gmLink(t("gm_open"), `https://www.google.com/maps/search/?api=1&query=${PLACE_GEO[place.id].join(",")}`),
          gmLink(t("gm_route"), `https://www.google.com/maps/dir/?api=1&destination=${PLACE_GEO[place.id].join(",")}`)] : [])),
      panel.el);
  }

  draw();
  return root;
}
