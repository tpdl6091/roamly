// 1:1 현지인 매칭 화면: 취향 선택 → 추천 5명 → 프로필 상세 → 요청 / 받은·보낸 요청
import { el, store, pick, fmtDate } from "./util.js";
import { getLang, t, LANGS } from "./i18n.js";
import { CITIES, NEIGHBORHOODS, PLACES } from "./data.js";
import { currentUserId } from "./sync.js";
import { loginGate, promptLogin } from "./auth.js";
import { pageHead } from "./page-head.js";
import * as api from "./match-api.js";
import { DEMO_BIOS } from "./data-demo-bios.js";

const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const cityName = (id) => { const c = CITIES.find((x) => x.id === id); return c ? (c.name[getLang()] ?? c.name.en) : id; };
const nbName = (id) => { const n = NEIGHBORHOODS.find((x) => x.id === id); return n ? (getLang() === "ko" ? n.name.ko : n.name.en) : id; };
const placeName = (id) => { const p = PLACES.find((x) => x.id === id); return p ? pick(p.name) : id; };
const hhmm = (s) => (s ? String(s).slice(0, 5) : "");
const langLabel = (code) => LANGS.find((l) => l.code === code)?.label ?? code;
// 소개글: 예시 현지인은 사용자가 고른 언어 번역본을, 그 밖의 사용자는 쓴 그대로 보여 준다
const introOf = (h) => DEMO_BIOS[h.user_id]?.[getLang()] ?? h.intro;
const openCities = () => CITIES.filter((c) => c.status === "open");

// 호스트 카드 목록 정렬: 세로(위아래로 쌓기) / 가로(옆으로 나란히, 좌우로 넘기기). 선택은 이 브라우저에 기억한다.
const LAYOUTS = ["column", "grid"];
function currentLayout() { const v = store.get("matchLayout", "column"); return v === "row" ? "grid" : LAYOUTS.includes(v) ? v : "column"; }   // 예전 값 'row' 는 격자로 본다
function applyLayout(layout) {
  store.set("matchLayout", layout);
  document.querySelectorAll(".match").forEach((m) => { m.dataset.layout = layout; });
  document.querySelectorAll(".layout-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.layout === layout)));
}
// 아이콘(문구 없음): 목록 = 가로줄 세 개, 격자 = 네모 네 개. 화면 읽기 도구용 이름은 aria-label 로만 둔다.
const SVG = "http://www.w3.org/2000/svg";
function icon(kind) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("width", "20"); svg.setAttribute("height", "20"); svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "currentColor");
  const rects = kind === "grid"
    ? [[3, 3, 8, 8], [13, 3, 8, 8], [3, 13, 8, 8], [13, 13, 8, 8]]
    : [[3, 4, 18, 4], [3, 10, 18, 4], [3, 16, 18, 4]];
  for (const [x, y, w, h] of rects) {
    const r = document.createElementNS(SVG, "rect");
    r.setAttribute("x", x); r.setAttribute("y", y); r.setAttribute("width", w); r.setAttribute("height", h); r.setAttribute("rx", "1.5");
    svg.append(r);
  }
  return svg;
}
function layoutBar() {
  const now = currentLayout();
  return el("div", { class: "layout-toggle", role: "group", "aria-label": t("m_layout_label") },
    ...[["column", "m_layout_v"], ["grid", "m_layout_h"]].map(([l, key]) =>
      el("button", { type: "button", "data-layout": l, "aria-label": t(key), "aria-pressed": String(now === l), onclick: () => applyLayout(l) }, icon(l))));
}

// 큰 사진: 실제 사진(.jpg)이 없으면 같은 이름의 얼굴 그림(.svg)으로 바꿔 보여 준다
function photoImg(src, name) {
  const img = el("img", { src, alt: name });
  img.addEventListener("error", () => {
    if (img.dataset.fallback || !img.src.includes(".jpg")) return;
    img.dataset.fallback = "1";
    img.src = img.src.replace(".jpg", ".svg");
  });
  return img;
}

// 프로필 사진을 눌렀을 때 크게 보여 주는 창
function openPhoto(name, src) {
  const dlg = el("dialog", { class: "photodlg", "aria-label": name });
  const close = () => { dlg.close(); dlg.remove(); };
  dlg.append(
    el("button", { class: "photodlg-x", type: "button", "aria-label": t("au_close"), onclick: close }, "×"),
    src ? photoImg(src, name) : el("div", { class: "photodlg-initial", "aria-hidden": "true" }, (name || "?").slice(0, 1).toUpperCase()),
    el("p", { class: "photodlg-name" }, name));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });       // 바깥을 누르면 닫힌다
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });         // Esc
  document.body.append(dlg);
  dlg.showModal();
}

// 이름의 첫 글자를 보여 주는 동그란 기본 사진
function avatar(name, url, size = 56) {
  const box = el("span", { class: "avatar", style: `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px`, "aria-hidden": "true" }, (name || "?").slice(0, 1).toUpperCase());
  if (url) box.replaceChildren(el("img", { src: url, alt: "", loading: "lazy" }));
  return box;
}
// 사진 주소는 비동기로 받아서 채운다
// 예시 현지인은 site/img/hosts/<닉네임>.jpg(실제 사진을 넣었다면) → 없으면 .svg(정면 얼굴 일러스트)를 쓴다.
function avatarFor(name, path, size, id) {
  const box = avatar(name, null, size);
  let src = null;                                       // 지금 보이는 사진 주소(크게 볼 때 쓴다)
  if (api.isDemoHost(id)) {
    const img = el("img", { src: `img/hosts/${name}.jpg`, alt: name, loading: "lazy" });
    img.addEventListener("error", () => { if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = `img/hosts/${name}.svg`; } });
    box.replaceChildren(img);
    src = () => img.currentSrc || img.src;
  } else if (path) {
    api.avatarUrl(path).then((u) => { if (u) { src = u; box.replaceChildren(el("img", { src: u, alt: "", loading: "lazy" })); } }).catch(() => {});
  }
  return el("button", { class: "avatar-btn", type: "button", "aria-label": t("m_photo_zoom"),
    onclick: () => openPhoto(name, typeof src === "function" ? src() : src) }, box);
}

function chip(label, pressed, onclick, extra = {}) {
  return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick, ...extra }, label);
}

// 라디오처럼 하나만 고르는 칩 묶음(다시 누르면 해제)
function singleChips(options, state, key, labelOf, { allowNone = true } = {}) {
  const wrap = el("div", { class: "chips", role: "group" });
  const draw = () => wrap.replaceChildren(...options.map((o) => chip(labelOf(o), state[key] === o, () => { state[key] = state[key] === o && allowNone ? "" : o; draw(); })));
  draw();
  return wrap;
}

const fieldBox = (label, control, hint) => el("div", { class: "field" }, el("label", {}, label), control, hint ? el("small", { class: "note", style: "margin:0" }, hint) : "");

// ============ 1) 취향 선택 + 추천 결과 ============
let lastResult = null;   // 마지막 추천 결과(상세에서 돌아와도 남긴다)

export function matchView(presetCity = "") {
  const root = el("div", { class: "onb match", "data-layout": currentLayout() });
  root.append(pageHead(t("m_title"), t("m_sub"), { photo: true }));
  if (!currentUserId()) { root.append(loginGate(t("m_gate"))); return root; }

  const form = { interests: [], city: openCities().some((c) => c.id === presetCity) ? presetCity : "", from: todayIso(), to: "", style: "", exchange: "", lang: "any" };
  const err = el("div", { class: "err", role: "alert" });
  const results = el("div", { class: "match-results", "aria-live": "polite" });
  const submitBtn = el("button", { class: "btn grow", type: "submit" }, t("m_find"));

  // 관심사: 분류별 선택형 태그
  const groups = api.INTEREST_GROUPS.map(([cat, ids]) => {
    const wrap = el("div", { class: "chips", role: "group", "aria-label": t("mc_" + cat) });
    const draw = () => wrap.replaceChildren(...ids.map((id) => chip(t("mi_" + id), form.interests.includes(id), () => {
      const i = form.interests.indexOf(id);
      if (i >= 0) form.interests.splice(i, 1); else form.interests.push(id);
      draw();
    })));
    draw();
    return el("div", { class: "igroup" }, el("div", { class: "igroup-title" }, t("mc_" + cat)), wrap);
  });

  const citySel = el("select", { id: "mCity" }, el("option", { value: "" }, "—"), ...openCities().map((c) => el("option", { value: c.id }, cityName(c.id))));
  citySel.value = form.city;
  citySel.addEventListener("change", () => { form.city = citySel.value; });
  const from = el("input", { id: "mFrom", type: "date", min: todayIso(), value: form.from });
  const to = el("input", { id: "mTo", type: "date", min: todayIso() });
  from.addEventListener("change", () => { form.from = from.value; });
  to.addEventListener("change", () => { form.to = to.value; });

  // 저장해 둔 취향이 있으면 채운다
  api.loadPrefs().then(({ prefs, interests }) => {
    if (!prefs && !interests.length) return;
    form.interests = [...interests];
    if (prefs?.city_id) { form.city = prefs.city_id; citySel.value = prefs.city_id; }
    form.style = prefs?.travel_style ?? ""; form.exchange = prefs?.exchange_mode ?? ""; form.lang = prefs?.preferred_language ?? "any";
    root.querySelectorAll(".igroup").forEach((g, i) => {
      const ids = api.INTEREST_GROUPS[i][1];
      g.querySelectorAll(".chip").forEach((b, j) => b.setAttribute("aria-pressed", String(form.interests.includes(ids[j]))));
    });
    drawOptions();
  }).catch(() => {});

  const styleBox = el("div"), exBox = el("div"), langBox = el("div");
  function drawOptions() {
    styleBox.replaceChildren(singleChips(api.STYLES, form, "style", (o) => t("ms_" + o)));
    exBox.replaceChildren(singleChips(api.EXCHANGES, form, "exchange", (o) => t("mx_" + o)));
    langBox.replaceChildren(singleChips(api.PREF_LANGS, form, "lang", (o) => t("ml_" + o), { allowNone: false }));
  }
  drawOptions();

  async function submit(e) {
    e.preventDefault();
    err.textContent = "";
    if (!form.interests.length) { err.textContent = t("m_err_interest"); return; }
    if (!form.city) { err.textContent = t("m_err_city"); return; }
    if (!form.from || form.from < todayIso() || (form.to && form.to < form.from)) { err.textContent = t("m_err_date"); return; }
    if (form.to && (new Date(form.to) - new Date(form.from)) / 86400000 > 30) { err.textContent = t("m_err_range"); return; }
    submitBtn.disabled = true; submitBtn.textContent = t("m_searching");
    try {
      const params = { ...form, interests: [...form.interests] };
      api.savePrefs(params).catch(() => {});              // 다음에 다시 고르지 않도록 저장(실패해도 추천은 계속)
      const res = await api.recommend(params);
      lastResult = { params, res };
      drawResults(res, params);
    } catch { err.textContent = t("m_err_server"); }
    submitBtn.disabled = false; submitBtn.textContent = t("m_find");
  }

  function drawResults(res, params) {
    const hosts = res.hosts ?? [];
    const s = res.stats ?? {};
    const parts = [el("h2", { class: "section-title" }, hosts.length ? `${t("m_results")} · ${t("m_for_you", { n: hosts.length })}` : t("m_results"))];
    if (!hosts.length) {
      parts.push(el("p", { class: "note" }, t("m_none")), el("p", { class: "note" }, t("m_short_why", { city: cityName(params.city), a: s.city_public_hosts ?? 0, b: s.with_availability ?? 0, c: s.with_shared_interest ?? 0 })), el("p", { class: "note" }, t("m_none_hint")));
    } else {
      if (hosts.length < 5) parts.push(el("div", { class: "alert" }, el("b", {}, t("m_short", { n: hosts.length })), " ", t("m_short_why", { city: cityName(params.city), a: s.city_public_hosts ?? 0, b: s.with_availability ?? 0, c: s.with_shared_interest ?? 0 })));
      parts.push(layoutBar(), el("div", { class: "hostlist" }, ...hosts.map((h) => hostCard(h, params))));
    }
    parts.push(browseSection(params, hosts.map((h) => h.user_id), !hosts.length));
    // 추천 결과는 별도 화면으로 보여 주고, '이전'으로 취향 선택 화면(선택값 유지)에 돌아간다
    const back = el("button", { class: "btn ghost sm", type: "button", onclick: () => {
      lastResult = null; results.replaceChildren(); formEl.hidden = false; window.scrollTo?.({ top: 0 });
    } }, "← " + t("m_prev"));
    formEl.hidden = true;
    results.replaceChildren(...parts, el("div", { class: "actions", style: "justify-content:flex-start;margin-top:18px" }, back));
    window.scrollTo?.({ top: 0 });
  }

  const formEl =
    el("form", { onsubmit: submit, novalidate: "" },
      el("section", { class: "sec" }, el("h2", {}, t("m_interests")), el("small", { class: "note", style: "margin:0" }, t("m_interests_hint")), ...groups),
      el("section", { class: "sec" },
        fieldBox(t("m_city"), citySel),
        el("div", { class: "field" }, el("label", {}, t("m_dates")), el("div", { class: "row2" }, el("div", {}, el("small", { class: "note", style: "margin:0" }, t("m_date_from")), from), el("div", {}, el("small", { class: "note", style: "margin:0" }, t("m_date_to")), to))),
        el("div", { class: "field" }, el("label", {}, `${t("m_style")} (${t("m_optional")})`), styleBox),
        el("div", { class: "field" }, el("label", {}, `${t("m_exchange")} (${t("m_optional")})`), exBox),
        el("div", { class: "field" }, el("label", {}, t("m_language")), langBox)),
      err,
      el("div", { class: "actions" }, submitBtn));
  root.append(
    formEl,
    results,
    el("div", { class: "paction", style: "margin-top:18px" },
      el("a", { class: "btn ghost sm", href: "#/match-requests" }, t("m_my_requests")),
      el("a", { class: "btn ghost sm", href: "#/match-profile" }, t("m_become_host"))));

  if (lastResult) drawResults(lastResult.res, lastResult.params);   // 상세에서 돌아온 경우
  return root;
}

// 추천 카드: '당신과 잘 맞는 이유'는 서버가 돌려준 점수 항목으로 만든다(꾸며 낸 문장이 아니다)
function reasonsOf(h, params) {
  const out = [];
  const m = h.matched ?? [];
  if (m.length) out.push(t("m_why_interest", { n: m.length, list: m.map((i) => t("mi_" + i)).join(", ") }));
  if (params.style && h.breakdown?.style === 100) out.push(t("m_why_style"));
  if (params.exchange && h.breakdown?.exchange === 100) out.push(t("m_why_exchange"));
  if (params.lang && params.lang !== "any" && h.breakdown?.language === 100) out.push(t("m_why_lang"));
  if (h.schedule_days) out.push(t("m_why_schedule", { n: h.schedule_days }));
  return out;
}

// '다른 호스트 둘러보기': 같은 도시의 공개 호스트를(추천에 나온 사람 제외) 12명씩 보여 준다
function browseSection(params, exclude, withBar = false) {
  const box = el("section", { class: "browse" });
  const head = el("div", { hidden: "" });
  const list = el("div", { class: "hostlist" });
  const msg = el("p", { class: "note", role: "status" });
  const first = el("button", { class: "btn ghost", type: "button" }, t("m_browse"));
  const more = el("button", { class: "btn ghost sm", type: "button", hidden: "" }, t("m_browse_more"));
  let offset = 0, busy = false;

  async function load() {
    if (busy) return;
    busy = true; first.disabled = true; more.disabled = true; msg.textContent = t("m_searching");
    try {
      const r = await api.browseHosts({ city: params.city, interests: params.interests, exclude, limit: 12, offset });
      const hosts = r.hosts ?? [];
      list.append(...hosts.map((h) => hostCard(h, params, { browse: true })));
      offset += hosts.length;
      head.replaceChildren(el("h2", { class: "section-title" }, t("m_browse_title", { city: cityName(params.city) })), el("p", { class: "note", style: "margin:0 0 8px" }, t("m_browse_count", { n: (r.total ?? 0) })), ...(withBar ? [layoutBar()] : []));
      head.hidden = false;
      first.hidden = true;
      more.hidden = !r.has_more;
      msg.textContent = offset === 0 ? t("m_browse_none") : "";
    } catch { msg.textContent = t("m_err_server"); }
    busy = false; first.disabled = false; more.disabled = false;
  }
  first.addEventListener("click", load);
  more.addEventListener("click", load);
  box.append(el("div", { class: "paction", style: "margin-top:18px" }, first), head, list, msg, el("div", { class: "paction" }, more));
  return box;
}

function slotText(s) { return `${fmtDate(s.day)} ${hhmm(s.start)}–${hhmm(s.end)}`; }

function hostCard(h, params, opts = {}) {
  const browse = !!opts.browse;                       // 둘러보기 목록의 카드: 점수·'잘 맞는 이유' 없이 소개 위주
  const favBtn = el("button", { class: "btn ghost sm", type: "button" });
  let fav = !!h.is_favorite;
  const drawFav = () => { favBtn.textContent = fav ? t("m_faved") : t("m_fav"); favBtn.setAttribute("aria-pressed", String(fav)); favBtn.className = "btn ghost sm" + (fav ? " on" : ""); };
  drawFav();
  favBtn.addEventListener("click", async () => {
    favBtn.disabled = true;
    try { await api.setFavorite(h.user_id, !fav); fav = !fav; h.is_favorite = fav; } catch { /* 실패하면 그대로 둔다 */ }
    favBtn.disabled = false; drawFav();
  });
  const rating = h.rating?.count ? t("m_rating", { a: h.rating.avg, n: h.rating.count }) : t("m_no_reviews");
  const langs = (h.languages ?? []).map((l) => `${langLabel(l.language)} (${t("mlv_" + l.level)})`).join(" · ");
  return el("article", { class: "sec mcard" },
    el("div", { class: "mhead" },
      avatarFor(h.name, h.avatar_path, 64, h.user_id),
      el("div", { class: "grow" }, el("b", {}, h.name),
        el("div", { class: "note", style: "margin:0" }, `${cityName(h.city)}${h.years ? " · " + t("md_years", { y: h.years }) : ""}`)),
      browse ? "" : el("div", { class: "score", title: t("m_score", { s: h.score }) }, el("b", {}, String(Math.round(h.score))), el("small", {}, t("m_score_label")))),
    browse ? "" : el("div", { class: "meter", style: "margin:8px 0" }, el("i", { style: `width:${Math.min(100, h.score)}%` })),
    introOf(h) ? el("p", { class: "quote", style: "margin:6px 0" }, introOf(h)) : "",
    el("div", { class: "ntags" }, ...(h.interests ?? []).slice(0, 8).map((i) => el("span", { class: "pill" + ((h.matched ?? []).includes(i) ? " ok" : "") }, t("mi_" + i)))),
    langs ? el("p", { class: "note langs", style: "margin:6px 0 0" }, langs) : "",
    browse ? "" : el("div", { class: "why" }, el("b", {}, t("m_why")), el("ul", { class: "badges" }, ...reasonsOf(h, params).map((r) => el("li", {}, el("span", { class: "dot ok", "aria-hidden": "true" }, "✓"), el("span", {}, r))))),
    el("p", { class: "note rating", style: "margin:6px 0" }, h.rating?.count ? el("a", { class: "link", href: `#/mate/${h.user_id}/reviews`, title: t("md_reviews") }, "★ " + rating) : "★ " + rating),
    el("div", { class: "slotsbox" }, el("b", { class: "note", style: "margin:0" }, t("m_slots")),
      (h.next_slots ?? []).length ? el("ul", { class: "slots" }, ...h.next_slots.map((s) => el("li", {}, slotText(s)))) : el("p", { class: "note", style: "margin:2px 0" }, t("m_no_slots"))),
    el("div", { class: "paction", style: "margin-top:10px" },
      el("a", { class: "btn ghost sm", href: `#/mate/${h.user_id}` }, t("m_detail")),
      favBtn,
      el("a", { class: "btn sm", href: `#/mate/${h.user_id}/request` }, t("m_request"))));
}

// ============ 2) 현지인 프로필 상세 + 요청 ============
export function mateView(hostId, mode) {
  const root = el("div", { class: "onb match" });
  root.append(el("a", { class: "crumb", href: "#/match" }, t("md_back")));
  if (!currentUserId()) { root.append(loginGate(t("m_gate"))); return root; }
  const body = el("div", {}, el("p", { class: "note" }, t("m_searching")));
  root.append(body);

  api.getHost(hostId).then((h) => {
    if (!h) { body.replaceChildren(el("p", { class: "alert" }, t("md_unavailable"))); return; }
    h.user_id ??= hostId;
    drawHost(body, h, mode === "request", mode === "reviews");
  }).catch(() => body.replaceChildren(el("p", { class: "alert" }, t("m_err_server"))));
  return root;
}

// 후기의 원래 언어가 사용자가 고른 언어와 다르면 '번역하기' 버튼을 보여 준다.
// 번역본이 있는 것은 예시 후기뿐이다(실제 사용자의 후기는 원래 언어를 알 수 없어서 원문 그대로 보인다). 번역본은 필요할 때만 불러온다.
let reviewI18n = null;
const loadReviewI18n = () => (reviewI18n ??= import("./data-demo-review-i18n.js").then((m) => m.DEMO_REVIEW_I18N).catch(() => ({})));
async function attachTranslate(r, bodyEl, transRow) {
  const entry = (await loadReviewI18n())[r.id];
  const lang = getLang();
  if (!entry || entry.lang === lang || !entry.t[lang]) return;
  let showing = false;
  const btn = el("button", { class: "link mini", type: "button" }, t("translate_btn"));
  const tag = el("span", { class: "note", style: "margin:0 8px 0 0" });
  btn.addEventListener("click", () => {
    showing = !showing;
    bodyEl.textContent = showing ? entry.t[lang] : r.body;
    tag.textContent = showing ? t("translated") : "";
    btn.textContent = showing ? t("show_original") : t("translate_btn");
  });
  transRow.replaceChildren(tag, btn);
}

function drawHost(body, h, openRequest, showReviews = false) {
  const nbs = (h.neighborhoods ?? []).map(nbName).join(", ");
  const rating = h.rating;
  const requestBox = el("section", { class: "sec", id: "requestBox", ...(openRequest ? {} : { hidden: "" }) });
  requestBox.append(requestForm(h));

  const reviews = (h.reviews ?? []).map((r) => {
    const bodyEl = el("p", { style: "margin:6px 0" }, r.body);
    const transRow = el("div", { class: "trans" });
    attachTranslate(r, bodyEl, transRow);
    return el("div", { class: "sec" },
    el("div", { class: "nhead" }, el("b", {}, "★".repeat(r.rating)), el("small", {}, t("md_review_by", { name: r.reviewer ?? "", date: fmtDate(String(r.created_at).slice(0, 10)) }))),
    bodyEl,
    transRow,
    el("p", { class: "note", style: "margin:0" }, `${r.activity_type ? (api.INTEREST_CATEGORY[r.activity_type] ? t("mi_" + r.activity_type) : r.activity_type) + " · " : ""}${t("md_review_detail", { c: r.communication, p: r.punctuality, a: r.activity })}`),
    el("button", { class: "link mini", type: "button", onclick: async (e) => {
      // 부적절한 후기 신고: 서로 다른 3명이 신고하면 서버가 검수 대기로 돌린다
      if (!window.confirm(t("rvw_report_confirm"))) return;
      try { await api.reportTarget("review", r.id); e.target.textContent = t("ch_reported"); e.target.disabled = true; } catch { e.target.textContent = t("mq_err"); }
    } }, t("rvw_report")));
  });

  const reviewsHead = el("h2", { class: "section-title", id: "reviews" }, `${t("md_reviews")}${rating?.count ? " · " + rating.count : ""}`);
  const msg = el("div", { class: "ok", role: "status" });
  body.replaceChildren(
    el("div", { class: "mhead" },
      avatarFor(h.name, h.avatar_path, 84, h.user_id),
      el("div", { class: "grow" }, el("h1", { style: "margin:0" }, h.name),
        el("div", { class: "ntags" }, el("span", { class: "pill ok" }, "✓ " + t("md_verified")), el("span", { class: "pill" }, cityName(h.city)), h.years ? el("span", { class: "pill" }, t("md_years", { y: h.years })) : ""),
        el("p", { class: "note", style: "margin:4px 0 0" }, rating?.count ? el("a", { class: "link", href: "#reviews", onclick: (e) => { e.preventDefault(); reviewsHead.scrollIntoView({ behavior: "smooth", block: "start" }); } }, "★ " + t("m_rating", { a: rating.avg, n: rating.count })) : t("m_no_reviews")))),
    el("div", { class: "paction", style: "margin:12px 0" },
      el("button", { class: "btn", type: "button", onclick: () => { requestBox.removeAttribute("hidden"); requestBox.scrollIntoView({ behavior: "smooth" }); } }, t("m_request"))),
    requestBox,
    introOf(h) ? el("section", { class: "sec" }, el("h2", {}, t("md_intro")), el("p", { class: "quote", style: "margin:0" }, introOf(h))) : "",
    el("section", { class: "sec" },
      nbs ? el("p", { style: "margin:0 0 8px" }, el("b", {}, t("md_nbs") + ": "), nbs) : "",
      el("h2", {}, t("md_interests")), el("div", { class: "ntags" }, ...(h.interests ?? []).map((i) => el("span", { class: "pill" }, t("mi_" + i)))),
      el("h2", { style: "margin-top:14px" }, t("md_langs")), el("p", { style: "margin:0" }, (h.languages ?? []).map((l) => `${langLabel(l.language)} (${t("mlv_" + l.level)})`).join(" · ") || "—"),
      el("h2", { style: "margin-top:14px" }, t("m_style")), el("div", { class: "ntags" }, ...(h.travel_styles ?? []).map((s) => el("span", { class: "pill" }, t("ms_" + s))), ...(h.exchange_modes ?? []).map((s) => el("span", { class: "pill" }, t("mx_" + s))))),
    (h.recommended_places ?? []).length ? el("section", { class: "sec" }, el("h2", {}, t("md_places")),
      el("ul", { class: "badges" }, ...h.recommended_places.filter((id) => PLACES.some((p) => p.id === id)).map((id) => el("li", {}, el("a", { href: `#/p/${id}` }, placeName(id)))))) : "",
    el("section", { class: "sec" }, el("h2", {}, t("md_slots")),
      (h.slots ?? []).length ? el("ul", { class: "slots" }, ...h.slots.slice(0, 12).map((s) => el("li", {}, slotText(s)))) : el("p", { class: "note", style: "margin:0" }, t("m_no_slots")),
      h.duration_hours ? el("p", { class: "note" }, t("md_duration", { h: h.duration_hours })) : "",
      el("p", { class: "note", style: "margin:6px 0 0" }, el("b", {}, t("md_cost") + ": "), h.cost_note || t("md_free"))),
    reviewsHead,
    ...(reviews.length ? reviews : [el("p", { class: "note" }, t("m_no_reviews"))]),
    el("p", { class: "note" }, t("md_priv")),
    el("div", { class: "paction" },
      el("button", { class: "link", type: "button", onclick: async () => { if (!window.confirm(t("md_report_confirm"))) return; try { await api.reportUser(h.user_id); msg.textContent = t("md_reported"); } catch { msg.textContent = t("mq_err"); } } }, t("md_report")),
      el("button", { class: "link", type: "button", onclick: async () => { if (!window.confirm(t("md_block_confirm"))) return; try { await api.blockUser(h.user_id); location.hash = "#/match"; } catch { msg.textContent = t("mq_err"); } } }, t("md_block"))),
    msg);
  if (openRequest) requestBox.scrollIntoView?.({ behavior: "smooth" });
  else if (showReviews) reviewsHead.scrollIntoView?.({ behavior: "smooth", block: "start" });   // 카드의 별점·후기를 눌러 들어온 경우
}

function requestForm(h) {
  const err = el("div", { class: "err", role: "alert" });
  const ok = el("div", { class: "ok", role: "status" });
  const slots = h.slots ?? [];
  const f = { slot: "", date: slots[0]?.day ?? todayIso(), start: "", end: "" };
  const date = el("input", { id: "rqDate", type: "date", min: todayIso(), value: f.date });
  // 희망 시작 시간: 오전/오후 + 시(1~12) + 분(00·15·30·45)으로 고른다. 끝나는 시간은 받지 않는다
  const optSel = (id, ph, opts) => el("select", { id }, el("option", { value: "" }, ph), ...opts.map(([v, label]) => el("option", { value: v }, label)));
  const ampm = optSel("rqAmPm", t("mr_ph_ampm"), [["am", t("mr_am")], ["pm", t("mr_pm")]]);
  const hour12 = optSel("rqHour", t("mr_ph_hour"), Array.from({ length: 12 }, (_, i) => [String(i + 1), (i + 1) + t("mr_h_suf")]));
  const minute = optSel("rqMin", t("mr_ph_min"), ["00", "15", "30", "45"].map((m) => [m, m + t("mr_m_suf")]));
  const start = el("div", { class: "row3t", style: "display:grid;grid-template-columns:repeat(3,1fr);gap:8px" }, ampm, hour12, minute);
  const toHalfHour = (v) => { const [h, m] = String(v).split(":").map(Number); return [h >= 12 ? "pm" : "am", String(h % 12 || 12), String(Math.floor(m / 15) * 15).padStart(2, "0")]; };
  const setStart = (v) => { [ampm.value, hour12.value, minute.value] = toHalfHour(v); };
  // 세 칸이 모두 골라졌을 때만 24시간제 'HH:MM'으로 바꿔 돌려준다(하나도 안 골랐으면 빈 값, 일부만 골랐으면 null)
  const getStart = () => {
    if (!ampm.value && !hour12.value && !minute.value) return "";
    if (!ampm.value || !hour12.value || !minute.value) return null;
    const h = Number(hour12.value) % 12 + (ampm.value === "pm" ? 12 : 0);
    return String(h).padStart(2, "0") + ":" + minute.value;
  };
  const slotSel = el("select", { id: "rqSlot" }, el("option", { value: "" }, t("mr_slot_free")),
    ...slots.map((s) => el("option", { value: s.id }, slotText(s))));
  const activity = el("select", { id: "rqAct" }, el("option", { value: "" }, "—"), ...(h.interests ?? []).map((i) => el("option", { value: t("mi_" + i) }, t("mi_" + i))));
  const area = el("input", { id: "rqArea", type: "text", maxlength: "120" });
  const message = el("textarea", { id: "rqMsg", rows: "4", maxlength: "1000" });
  slotSel.addEventListener("change", () => {
    const s = slots.find((x) => x.id === slotSel.value);
    f.slot = s ? s.id : "";
    if (s) { date.value = s.day; setStart(hhmm(s.start)); f.end = hhmm(s.end); date.disabled = true; } else { f.end = ""; date.disabled = false; }
  });
  const btn = el("button", { class: "btn", type: "submit" }, t("mr_send"));
  const form = el("form", {
    novalidate: "",
    onsubmit: async (e) => {
      e.preventDefault();
      err.textContent = ""; ok.textContent = "";
      const d = date.value;
      if (!d || d < todayIso()) { err.textContent = t("mr_err_date"); return; }
      const st = getStart();
      if (st === null) { err.textContent = t("mr_err_time"); return; }
      btn.disabled = true; btn.textContent = t("mr_sending");
      try {
        await api.createRequest({ host: h.user_id, date: d, start: st, end: f.end, activity: activity.value, area: area.value.trim(), message: message.value.trim(), slot: f.slot });
        ok.textContent = t("mr_sent");
        form.querySelectorAll("input,select,textarea,button").forEach((x) => { x.disabled = true; });
      } catch (ex) { err.textContent = t(api.requestErrorKey(ex)); btn.disabled = false; btn.textContent = t("mr_send"); }
    },
  },
  el("h2", {}, t("mr_title")),
  slots.length ? el("div", { class: "field" }, el("label", { for: "rqSlot" }, t("mr_pick_slot")), slotSel) : "",
  el("div", { class: "field" }, el("label", { for: "rqDate" }, t("mr_date")), date),
  el("div", { class: "field" }, el("label", { for: "rqAmPm" }, t("mr_time_from")), start),
  el("div", { class: "field" }, el("label", { for: "rqAct" }, t("mr_activity")), activity),
  el("div", { class: "field" }, el("label", { for: "rqArea" }, t("mr_area")), area),
  el("div", { class: "field" }, el("label", { for: "rqMsg" }, t("mr_message")), message),
  el("p", { class: "note" }, t("mr_safety")),
  err, ok,
  el("div", { class: "actions" }, btn, el("a", { class: "btn ghost", href: "#/match-requests" }, t("m_my_requests"))));
  return form;
}

// ============ 3) 받은 요청 · 보낸 요청 ============
export function requestsMatchView(onChange) {
  const root = el("div", { class: "onb match" });
  root.append(el("h1", {}, t("mq_title")));
  if (!currentUserId()) { root.append(loginGate(t("mq_gate"))); return root; }
  const uid = currentUserId();
  const state = { tab: "received", list: null };
  const tabs = el("div", { class: "tabs", role: "tablist" });
  const box = el("div", {}, el("p", { class: "note" }, t("m_searching")));
  const msg = el("div", { class: "err", role: "alert" });

  const act = (fn, confirmText) => async () => {
    if (confirmText && !window.confirm(confirmText)) return;
    msg.textContent = "";
    try { await fn(); state.list = await api.myRequests(); draw(); } catch { msg.textContent = t("mq_err"); }
  };

  function card(r) {
    const iAmHost = r.host_id === uid;
    const other = iAmHost ? r.traveler_name : r.host_name;
    const time = r.start_time ? `${hhmm(r.start_time)}${r.end_time ? "–" + hhmm(r.end_time) : ""}` : "";
    const past = r.meet_date <= todayIso();
    const actions = [];
    if (iAmHost && r.status === "pending") actions.push(el("button", { class: "btn sm", type: "button", onclick: act(() => api.respondRequest(r.id, true)) }, t("mq_accept")), el("button", { class: "btn ghost sm", type: "button", onclick: act(() => api.respondRequest(r.id, false)) }, t("mq_decline")));
    if (!iAmHost && r.status === "pending") actions.push(el("button", { class: "btn ghost sm", type: "button", onclick: act(() => api.cancelRequest(r.id), t("mq_confirm_cancel")) }, t("mq_cancel")));
    if (r.status === "accepted") {
      if (past) actions.push(el("button", { class: "btn sm", type: "button", onclick: act(() => api.completeRequest(r.id)) }, t("mq_complete")));
      actions.push(el("button", { class: "btn ghost sm", type: "button", onclick: act(() => api.cancelRequest(r.id), t("mq_confirm_cancel")) }, t("mq_cancel_meet")));
    }
    // 메시지: 요청을 보내면 서버가 대화를 만든다. 후기: 만남 완료 후 한 번.
    if (r.conversation_id) actions.push(el("a", { class: "btn ghost sm", href: `#/messages/${r.conversation_id}` }, t("ch_open")));
    if (r.status === "completed") actions.push(r.reviewed
      ? el("span", { class: "pill ok" }, "✓ " + t("rvw_done"))
      : el("a", { class: "btn sm", href: `#/mate-review/${r.id}` }, t("rvw_write")));
    return el("article", { class: "sec" },
      el("div", { class: "nhead" },
        el("b", {}, `${iAmHost ? t("mq_from") : t("mq_to")}: `, iAmHost ? other : el("a", { href: `#/mate/${r.host_id}` }, other)),
        el("span", { class: "pill" + (r.status === "accepted" || r.status === "completed" ? " ok" : r.status === "pending" ? "" : " warn") }, t("mst_" + r.status))),
      el("p", { class: "note", style: "margin:4px 0" }, `${cityName(r.city_id)} · ${t("mq_when", { date: fmtDate(r.meet_date), time })}`),
      r.activity ? el("p", { style: "margin:2px 0" }, el("b", {}, t("mr_activity") + ": "), r.activity) : "",
      r.area ? el("p", { style: "margin:2px 0" }, el("b", {}, t("mr_area") + ": "), r.area) : "",
      r.message ? el("p", { class: "quote", style: "margin:6px 0" }, r.message) : "",
      actions.length ? el("div", { class: "paction" }, ...actions) : "");
  }

  function draw() {
    tabs.replaceChildren(...["received", "sent"].map((k) => el("button", { class: "chip", type: "button", role: "tab", "aria-pressed": String(state.tab === k), onclick: () => { state.tab = k; draw(); } },
      `${t(k === "received" ? "mq_received" : "mq_sent")} ${state.list ? state.list.filter((r) => (k === "received" ? r.host_id === uid : r.traveler_id === uid)).length : ""}`)));
    if (!state.list) return;
    const list = state.list.filter((r) => (state.tab === "received" ? r.host_id === uid : r.traveler_id === uid));
    box.replaceChildren(...(list.length ? list.map(card) : [el("p", { class: "note" }, t("mq_none"))]));
  }
  draw();
  api.myRequests().then((l) => { state.list = l; draw(); }).catch(() => { box.replaceChildren(el("p", { class: "alert" }, t("m_err_server"))); });
  root.append(tabs, msg, box, el("div", { class: "paction", style: "margin-top:12px" }, el("a", { class: "btn ghost sm", href: "#/match" }, t("md_back")), el("a", { class: "btn ghost sm", href: "#/messages", "data-unread": "" }, t("ch_title"))));
  return root;
}
