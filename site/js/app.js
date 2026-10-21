import { LANGS, detectLang, setLang, getLang, t } from "./i18n.js";
import { CITY_IMAGES, NB_IMAGES, CITIES, CITY_OPEN_THRESHOLD, SEED_REQUESTS, SEED_DEST_NAMES, NEIGHBORHOODS, TASTE_TAGS, STYLES, PAINS, CATEGORIES, PLACES } from "./data.js";
import { el, store, pick, fmtDate, isOutdated } from "./util.js";
import { nowView } from "./now.js";
import { meView } from "./me.js";
import { initAccountButton, promptLogin, loginGate } from "./auth.js";
import { setSaved, initSync, currentUserId } from "./sync.js";
import { placeTarget } from "./remote.js";
import { matchView, mateView, requestsMatchView } from "./match.js";
import { matchProfileView } from "./match-profile.js";
import { inboxView, chatView, refreshUnreadBadge } from "./chat.js";
import { mateReviewView } from "./match-review.js";
import { adminView } from "./admin.js";
import { programsView, hostView, programView, requestsView, reviewView } from "./programs.js";
import { hostCenterView, hostFormView, programFormView } from "./host.js";
import { legalView } from "./legal.js";
import { foodListView, foodDetailView, foodCompareView } from "./food.js";
import { statusBanner, statusPills, statusBadges, confirmControl, reportPanel, trustRank } from "./trust.js";
import { tripsView, newTripView, tripView, addToTripPanel } from "./trips.js";
import { writeView, userPostsSection } from "./write.js";

const app = document.getElementById("app");
const langSelect = document.getElementById("langSelect");


// ---------- 화면 ----------
function homeView() {
  const cities = CITIES.filter((c) => c.status === "open");
  return el("div", { class: "landing" },
    // 1) 첫 화면: 현지인 1:1 매칭이 주인공
    el("section", { class: "lhero" },
      el("img", { class: "lphoto", src: "img/hero-local.jpg", alt: "", width: "995", height: "941", fetchpriority: "high" }),
      el("div", { class: "ltext" },
      el("p", { class: "eyebrow", lang: "en" }, t("hl_eyebrow")),
      el("h1", {}, ...t("hl_title").split("\n").flatMap((line, i) => (i ? [el("br"), line] : [line]))),
      el("p", { class: "lsub" }, t("hl_sub")),
      el("a", { class: "lcta", href: "#/match" }, t("hl_cta"), el("span", { "aria-hidden": "true" }, " →")),
      el("a", { class: "llink", href: "#city-list", onclick: (e) => { e.preventDefault(); document.getElementById("cityList")?.scrollIntoView({ behavior: "smooth" }); } }, t("hl_cities")),
      el("p", { class: "ltrust" }, el("span", { "aria-hidden": "true" }, "✓ "), t("hl_trust")))),
    // 2) 이용 방법 3단계
    el("section", { class: "lsec" },
      el("h2", { class: "lh" }, t("hl_steps")),
      el("ol", { class: "lsteps" }, ...[1, 2, 3].map((n) => el("li", {}, el("span", { class: "n", "aria-hidden": "true" }, String(n)), el("b", {}, t("hl_s" + n)), el("small", {}, t("hl_s" + n + "d")))))),
    // 3) 도시별 현지인 찾기
    el("section", { class: "lsec", id: "cityList" },
      el("h2", { class: "lh" }, t("hl_by_city")),
      el("p", { class: "note", style: "margin:0 0 10px" }, t("hl_by_city_sub")),
      el("div", { class: "grid" }, ...cities.map((c) => cityCard(c, `#/match/${c.id}`)))),
    // 4) 안전
    el("section", { class: "lsec" },
      el("h2", { class: "lh" }, t("hl_safe")),
      el("ul", { class: "lsafe" }, ...[1, 2, 3].map((n) => el("li", {}, t("hl_safe_" + n))))),
    // 5) 호스트 모집
    el("a", { class: "lhost", href: "#/host-center" },
      el("div", {}, el("b", {}, t("hl_host")), el("p", { class: "note", style: "margin:4px 0 0" }, t("hl_host_sub"))),
      el("span", { "aria-hidden": "true", class: "arrow" }, "→")),
    // 6) 보조 기능
    el("section", { class: "lsec" },
      el("h2", { class: "lh" }, t("hl_more")),
      el("div", { class: "lmore" },
        el("a", { href: "#/explore" }, t("hl_explore")),
        el("a", { href: "#/write" }, t("hl_write")),
        el("a", { href: "#/programs" }, t("f3_title")),
        el("a", { href: "#/food" }, t("f4_title")))),
    requestBox());
}

function cityCard(city, href = `#/city/${city.id}`) {
  const name = city.name[getLang()] ?? city.name.en;
  const open = city.status === "open";
  const img = CITY_IMAGES[city.id];
  const style = img
    ? `background-image:linear-gradient(to top,rgba(8,20,24,.72),rgba(8,20,24,.08) 62%),url(${img.src});background-position:center,${img.pos}`
    : "";
  return el("a", { class: "city" + (img ? " photo" : ""), href, ...(style ? { style } : {}) },
    open ? "" : el("span", { class: "tag" }, t("coming_soon")),
    el("b", {}, name),
    el("small", {}, open ? t("neighborhoods", { n: NEIGHBORHOODS.filter((n) => n.city === city.id).length }) : " "));
}

function requestBox() {
  const requests = { ...SEED_REQUESTS, ...store.get("cityRequests", {}) };   // 저장값에 없는 예시 항목도 보이게 합친다
  const mine = store.get("myRequests", []);
  const msg = el("div", { class: "ok", role: "status" });
  const meter = el("div");

  const input = el("input", { type: "text", placeholder: t("req_ph"), "aria-label": t("req_ph"), maxlength: "60" });

  const pctOf = (n) => Math.min(100, Math.round((n / CITY_OPEN_THRESHOLD) * 100));
  const destLabel = (key) => SEED_DEST_NAMES[key]?.[getLang()] ?? key;
  const row = (key, label) => {
    const n = requests[key] ?? 0;
    return el("div", { class: "reqrow" },
      el("div", { class: "reqhead" }, el("b", {}, label), el("span", {}, `${pctOf(n)}%`)),
      el("div", { class: "meter", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pctOf(n)), "aria-label": label },
        el("i", { style: `width:${pctOf(n)}%` })),
      el("div", { class: "note" }, t("req_count", { n, t: CITY_OPEN_THRESHOLD, p: pctOf(n) })));
  };
  // 예시 여행지(+내가 요청한 곳)의 달성률 목록
  function showMeter(cityName) {
    const keys = [...new Set([...Object.keys(SEED_REQUESTS), ...(cityName ? [cityName] : []), ...mine])];
    meter.replaceChildren(...keys.map((k) => row(k, destLabel(k))));
  }
  showMeter();

  function submit(e) {
    e.preventDefault();
    if (!currentUserId()) { promptLogin(t("gate_request")); return; }   // 도시 요청은 회원만
    const name = input.value.trim();
    if (!name) return;
    if (mine.includes(name)) { msg.textContent = t("req_dup"); showMeter(name); return; }
    requests[name] = (requests[name] ?? 0) + 1;
    mine.push(name);
    store.set("cityRequests", requests);
    store.set("myRequests", mine);
    msg.textContent = t("req_done");
    showMeter(name);
    input.value = "";
  }

  return el("section", { class: "request" },
    el("h3", {}, t("req_title")),
    el("p", {}, t("req_sub", { t: CITY_OPEN_THRESHOLD })),
    el("form", { onsubmit: submit }, input, el("button", { class: "btn", type: "submit" }, t("req_btn"))),
    msg, meter);
}

const getTaste = () => store.get("taste", null);
const placeCount = (nb) => PLACES.filter((p) => p.nb === nb.id).length;


const savedIds = () => store.get("saved", []);

// ---------- 동네 → 장소 목록 ----------
function neighborhoodView(id) {
  const nb = NEIGHBORHOODS.find((n) => n.id === id);
  if (!nb) return homeView();
  const city = CITIES.find((c) => c.id === nb.city);
  const lang = getLang();
  const nbName = lang === "ko" ? nb.name.ko : nb.name.en;
  const cityName = city.name[lang] ?? city.name.en;
  const all = PLACES.filter((p) => p.nb === id);
  const state = { cat: null };
  const chipsBox = el("div", { class: "chips toolbar" });
  const list = el("div", { class: "ngrid" });
  const cats = CATEGORIES.filter((c) => all.some((p) => p.cat === c));

  function draw() {
    const mk = (label, on, fn) => el("button", { class: "chip", type: "button", "aria-pressed": String(on), onclick: fn }, label);
    chipsBox.replaceChildren(
      ...(cats.length > 1 ? [mk(t("filter_all"), state.cat === null, () => { state.cat = null; draw(); }),
        ...cats.map((c) => mk(t("cat_" + c), state.cat === c, () => { state.cat = state.cat === c ? null : c; draw(); }))] : []));
    // 검수 대기·정보 오래됨인 장소는 뒤로 보낸다(같은 상태끼리는 원래 순서 유지)
    const items = all.filter((p) => !state.cat || p.cat === state.cat).sort((a, b) => trustRank(a) - trustRank(b));
    const saved = savedIds();
    list.replaceChildren(...(items.length ? items.map((p) => placeCard(p, saved.includes(p.id)))
      : [el("div", { class: "placeholder", style: "grid-column:1/-1" }, el("h2", {}, t("no_places")), el("p", {}, t("no_places_sub")))]));
  }

  function placeCard(p, isSaved) {
    return el("a", { class: "pcard", href: `#/p/${p.id}` },
      el("div", { class: "nhead" }, el("b", {}, pick(p.name)), isSaved ? el("span", { class: "heart", title: t("saved") }, "♥") : ""),
      el("p", {}, pick(p.comment)),
      el("div", { class: "ntags" },
        el("span", { class: "pill" }, t("cat_" + p.cat)),
        el("span", { class: "pill " + (p.author.role === "local" ? "ok" : "") }, t("role_" + p.author.role)),
        p.tip.solo ? el("span", { class: "pill" }, t("solo_ok")) : "",
        ...statusPills(p)));
  }

  draw();
  return el("div", {},
    el("a", { class: "crumb", href: `#/city/${city.id}` }, t("back_city", { city: cityName })),
    el("div", { class: "nb-head" },
      el("h1", {}, nbName, " ", el("small", { class: "note" }, nb.original !== nbName ? nb.original : "")),
      el("p", {}, nb.summary[lang] ?? nb.summary.en)),
    chipsBox, list,
    el("p", { class: "note" }, t("sample_note")));
}

// ---------- 장소 상세 ----------
function placeView(id) {
  const p = PLACES.find((x) => x.id === id);
  if (!p) return homeView();
  const nb = NEIGHBORHOODS.find((n) => n.id === p.nb);
  const lang = getLang();
  const nbName = lang === "ko" ? nb.name.ko : nb.name.en;
  const needsTranslation = lang !== p.orig;
  const state = { showOriginal: false, reportOpen: false };
  const pt = placeTarget(p);   // 로그인했다면 서버의 신고·투표 집계를 반영한 신뢰 대상

  const quote = el("p", { class: "quote" });
  const transRow = el("div", { class: "trans" });
  function drawComment() {
    const useOrig = !needsTranslation || state.showOriginal;
    quote.textContent = useOrig ? p.comment[p.orig] : (p.comment[lang] ?? p.comment.en);
    quote.setAttribute("lang", useOrig ? p.orig : lang);
    transRow.replaceChildren(...(needsTranslation ? [
      el("span", {}, useOrig ? "" : t("translated")),
      el("button", { class: "link", type: "button", onclick: () => { state.showOriginal = !state.showOriginal; drawComment(); } },
        useOrig ? t("show_translation") : t("show_original"))] : []));
  }
  drawComment();

  // 생활 팁
  const closed = p.tip.closed.length ? p.tip.closed.map((d) => t("day_" + d)).join(", ") : t("tip_closed_none");
  const tipRows = [
    [t("tip_closed"), closed],
    [t("tip_pay"), p.tip.pay.length ? p.tip.pay.map((x) => t("pay_" + x)).join(", ") : "-"],
    [t("tip_time"), t("time_" + p.tip.time)],
    ...(p.tip.menu ? [[t("tip_menu"), pick(p.tip.menu)]] : []),
    [t("tip_solo"), p.tip.solo ? t("tip_solo_yes") : "-"],
  ];

  // 신뢰 정보: 방문일·작성일·방문 선언(L0)·현장 체크인(L1, 선택)·협찬·최신성
  const badges = [
    ["ok", "✓", t("b_visit", { d: fmtDate(p.visit) }) + " · " + t("b_written", { d: fmtDate(p.written) })],
    ["ok", "✓", t("b_l0")],
    ...(p.checkin ? [["ok", "✓", t("b_l1")]] : []),
    ...(p.sponsored !== "none" ? [["warn", "!", t("b_sponsored")]] : []),
    ...statusBadges(pt),
    ["", "i", t("b_sample")],
  ];

  // 저장
  const saveBtn = el("button", { class: "btn", type: "button" });
  function drawSave() {
    const on = savedIds().includes(p.id);
    saveBtn.textContent = (on ? "♥ " : "♡ ") + (on ? t("saved") : t("save"));
    saveBtn.className = "btn" + (on ? " on" : "");
    saveBtn.setAttribute("aria-pressed", String(on));
  }
  saveBtn.addEventListener("click", () => {
    if (!currentUserId()) { promptLogin(t("gate_save")); return; }   // 저장은 회원만
    const list = savedIds();
    const i = list.indexOf(p.id);
    if (i >= 0) list.splice(i, 1); else list.push(p.id);
    setSaved(list);
    drawSave();
  });
  drawSave();

  // 신고·'여전히 맞아요': 누르면 상태를 다시 계산해 화면을 다시 그린다(스크롤 위치는 유지)
  const refreshView = () => render({ keepScroll: true });
  const reportUi = reportPanel(pt, refreshView);
  const confirmUi = confirmControl(pt, refreshView);

  // 일정에 추가: 버튼을 누르면 여행·날짜를 고르는 패널이 열린다
  const addPanel = addToTripPanel(p);
  const addBtn = el("button", {
    class: "btn ghost", type: "button", "aria-expanded": "false",
    onclick: () => {
      if (!currentUserId()) { promptLogin(t("gate_trip_add")); return; }   // 일정 추가는 회원만
      addBtn.setAttribute("aria-expanded", String(addPanel.toggle()));
    },
  }, t("add_trip"));

  return el("div", { class: "place" },
    el("a", { class: "crumb", href: `#/n/${nb.id}` }, t("back_nb", { name: nbName })),
    el("h1", {}, pick(p.name)),
    el("div", { class: "ntags" },
      el("span", { class: "pill" }, t("cat_" + p.cat)),
      p.tip.solo ? el("span", { class: "pill ok" }, t("solo_ok")) : "",
      ...statusPills(pt),
      el("span", { class: "pill" }, t("b_sample"))),
    ...statusBanner(pt),
    el("div", { class: "pphoto", "aria-hidden": "true" }),
    el("div", { class: "paction" }, saveBtn, addBtn),
    addPanel.el,
    el("a", { class: "link", href: `#/write/${p.id}` }, t("write_here")),
    el("section", { class: "sec" },
      el("h2", {}, t("sec_comment")),
      el("div", { class: "author" },
        el("span", { class: "pill " + (p.author.role === "local" ? "ok" : "") }, t("role_" + p.author.role)),
        p.author.years ? el("span", { class: "note", style: "margin:0" }, t("author_years", { y: p.author.years })) : ""),
      quote, transRow),
    userPostsSection(p.id, refreshView),
    el("section", { class: "sec" },
      el("h2", {}, t("sec_tips")),
      el("dl", { class: "tips" }, ...tipRows.flatMap(([k, v]) => [el("dt", {}, k), el("dd", {}, v)]))),
    el("section", { class: "sec" },
      el("h2", {}, t("sec_trust")),
      el("ul", { class: "badges" }, ...badges.map(([cls, mark, text]) =>
        el("li", {}, el("span", { class: "dot " + cls, "aria-hidden": "true" }, mark), el("span", {}, text)))),
      confirmUi,
      ...reportUi),
    el("p", { class: "note" }, t("sample_note")));
}

// ---------- 취향 온보딩 ----------
function onboardingView(cityId) {
  const prev = getTaste() ?? { tags: [], style: null, pains: [] };
  const draft = { tags: [...prev.tags], style: prev.style, pains: [...prev.pains] };
  const total = 3;
  let step = 1;
  let error = "";
  const root = el("div", { class: "onb" });
  const dest = () => (CITIES.some((c) => c.id === cityId) ? `#/city/${cityId}` : "#/");

  function finish(skip) {
    if (skip) {
      store.set("tasteSkipped", true);
    } else {
      store.set("taste", draft);
      store.set("tasteSkipped", false);
    }
    location.hash = dest();
  }

  function chip(label, selected, onclick) {
    return el("button", { class: "chip", type: "button", "aria-pressed": String(selected), onclick }, label);
  }

  function draw() {
    const cfg = {
      1: { q: "onb_q1", hint: "onb_q1_hint", opts: TASTE_TAGS, prefix: "tag_", multi: true, sel: draft.tags },
      2: { q: "onb_q2", hint: "onb_q2_hint", opts: STYLES, prefix: "style_", multi: false },
      3: { q: "onb_q3", hint: "onb_q3_hint", opts: PAINS, prefix: "pain_", multi: true, sel: draft.pains },
    }[step];

    const chips = cfg.opts.map((o) => {
      const selected = cfg.multi ? cfg.sel.includes(o) : draft.style === o;
      return chip(t(cfg.prefix + o), selected, () => {
        error = "";
        if (cfg.multi) {
          const i = cfg.sel.indexOf(o);
          if (i >= 0) cfg.sel.splice(i, 1); else cfg.sel.push(o);
        } else {
          draft.style = draft.style === o ? null : o;
        }
        draw();
      });
    });

    const last = step === total;
    const next = el("button", {
      class: "btn grow", type: "button",
      onclick: () => {
        if (step === 1 && draft.tags.length === 0) { error = t("onb_need_one"); draw(); return; }
        if (last) finish(false); else { step += 1; error = ""; draw(); }
      },
    }, last ? t("onb_done") : t("onb_next"));

    root.replaceChildren(
      el("p", { class: "hint" }, t("onb_title") + " · " + t("onb_step", { i: step, n: total })),
      el("div", { class: "steps" }, ...[1, 2, 3].map((i) => el("i", { class: i <= step ? "on" : "" }))),
      el("h1", {}, t(cfg.q)),
      el("p", { class: "hint" }, t(cfg.hint)),
      el("div", { class: "chips" }, ...chips),
      el("div", { class: "err", role: "alert" }, error),
      el("div", { class: "actions" },
        step > 1 ? el("button", { class: "btn ghost", type: "button", onclick: () => { step -= 1; error = ""; draw(); } }, t("onb_prev")) : "",
        next),
      el("div", { class: "actions" }, el("button", { class: "link", type: "button", onclick: () => finish(true) }, t("onb_skip"))));
  }

  draw();
  return root;
}

// ---------- 도시 → 동네 목록 ----------
function cityView(id) {
  const city = CITIES.find((c) => c.id === id);
  if (!city) return homeView();
  if (city.status !== "open") return soonView();
  if (!getTaste() && !store.get("tasteSkipped", false)) {
    location.hash = `#/onboarding/${id}`;
    return el("div");
  }

  const lang = getLang();
  const name = city.name[lang] ?? city.name.en;
  const userTags = getTaste()?.tags ?? [];
  const state = { sortTaste: userTags.length > 0, tag: null };
  const chipsBox = el("div", { class: "chips toolbar" });
  const list = el("div", { class: "ngrid" });

  const score = (n) => {
    if (!userTags.length) return null;
    const hit = n.tags.filter((x) => userTags.includes(x)).length;
    return Math.round((100 * hit) / Math.max(1, Math.min(userTags.length, n.tags.length)));
  };

  function neighborhoodCard(n, s) {
    const label = lang === "ko" ? n.name.ko : n.name.en;
    return el("a", { class: "ncard", href: `#/n/${n.id}` },
      el("div", { class: "nphoto", "aria-hidden": "true", ...(NB_IMAGES[n.id] ? { style: `background-image:url(${NB_IMAGES[n.id]})` } : {}) }),
      el("div", { class: "nhead" }, el("b", {}, label), el("small", {}, n.original !== label ? n.original : "")),
      el("p", {}, n.summary[lang] ?? n.summary.en),
      el("div", { class: "ntags" }, ...n.tags.map((tg) => el("span", { class: "ntag" + (userTags.includes(tg) ? " hit" : "") }, t("tag_" + tg)))),
      el("div", { class: "nmeta" },
        el("span", {}, placeCount(n) ? t("places_total", { n: placeCount(n) }) : ""),
        s !== null ? el("span", { class: "match" }, t("match", { p: s })) : ""));
  }

  function draw() {
    const chips = [];
    if (userTags.length) {
      chips.push(chip(t("sort_taste"), state.sortTaste, () => { state.sortTaste = !state.sortTaste; draw(); }));
    }
    chips.push(chip(t("filter_all"), state.tag === null, () => { state.tag = null; draw(); }));
    for (const tg of TASTE_TAGS) {
      chips.push(chip(t("tag_" + tg), state.tag === tg, () => { state.tag = state.tag === tg ? null : tg; draw(); }));
    }
    chipsBox.replaceChildren(...chips);

    let items = NEIGHBORHOODS.filter((n) => n.city === id && (!state.tag || n.tags.includes(state.tag)))
      .map((n) => ({ n, s: score(n) }));
    if (state.sortTaste && userTags.length) items.sort((a, b) => b.s - a.s || placeCount(b.n) - placeCount(a.n));
    list.replaceChildren(...items.map(({ n, s }) => neighborhoodCard(n, s)));
  }

  function chip(label, selected, onclick) {
    return el("button", { class: "chip", type: "button", "aria-pressed": String(selected), onclick }, label);
  }

  draw();
  return el("div", {},
    el("a", { class: "crumb", href: "#/" }, t("back_home")),
    el("div", { class: "city-head" },
      el("h1", {}, t("city_title", { city: name })),
      el("a", { class: "link", href: `#/onboarding/${id}` }, t("taste_edit"))),
    // 도시 안에서 동네·프로그램·식품·지금 뭐 하지?로 오가는 줄
    el("div", { class: "chips" },
      el("a", { class: "chip", href: `#/city/${id}`, "aria-current": "page" }, t("now_pick_nb")),
      el("a", { class: "chip", href: `#/programs/${id}` }, t("pg_title")),
      el("a", { class: "chip", href: "#/food" }, t("fd_title")),
      el("a", { class: "chip", href: `#/now/${id}` }, t("now_title"))),
    userTags.length ? "" : el("div", { class: "banner" },
      el("span", {}, t("taste_hint")),
      el("a", { class: "btn", href: `#/onboarding/${id}` }, t("taste_set_btn"))),
    chipsBox, list,
    el("p", { class: "note" }, t("sample_note")));
}

function soonView() {
  return el("div", { class: "placeholder" }, el("h2", {}, t("soon_title")), el("p", {}, t("soon_body")));
}

// ---------- 라우터 ----------
// 회원만 쓸 수 있는 화면을 비회원이 열었을 때: 제목 + 로그인 안내
function gateView(text, title) {
  return el("div", { class: "onb" }, el("h1", {}, title), loginGate(text));
}

function render(opts = {}) {
  const keepScroll = opts.keepScroll === true;   // hashchange 이벤트가 넘어오면 false
  const scrollY = window.scrollY;
  const [, route = "", param, param2] = location.hash.replace(/^#/, "").split("/");
  let view;
  if (route === "") view = homeView();
  else if (route === "city") view = cityView(param);
  else if (route === "onboarding") view = onboardingView(param);
  else if (route === "n") view = neighborhoodView(param);
  else if (route === "p") view = placeView(param);
  else if (route === "trips") view = param === "new" ? newTripView(param2) : tripsView(param);
  else if (route === "trip") view = tripView(param, param2);
  else if (route === "write") view = writeView(param);
  else if (route === "explore" || route === "now") view = nowView(param);
  else if (route === "me") view = meView(() => render({ keepScroll: true }));
  else if (route === "programs") view = programsView(param, param2);
  else if (route === "program") view = programView(param);
  else if (route === "host") view = hostView(param);
  else if (route === "host-center") view = currentUserId() ? hostCenterView(() => render({ keepScroll: true })) : gateView(t("gate_host"), t("hc_title"));
  else if (route === "host-edit") view = currentUserId() ? hostFormView(() => {}, false) : gateView(t("gate_host"), t("hc_title"));
  else if (route === "program-edit") view = currentUserId() ? programFormView(param) : gateView(t("gate_host"), t("hc_title"));
  else if (route === "review") view = currentUserId() ? reviewView(param) : gateView(t("gate_apply"), t("rv_section"));
  else if (route === "legal") view = legalView(param);
  else if (route === "match") view = matchView(param);
  else if (route === "mate") view = mateView(param, param2);
  else if (route === "match-requests") view = requestsMatchView(() => render({ keepScroll: true }));
  else if (route === "match-profile") view = matchProfileView();
  else if (route === "messages") view = param ? chatView(param) : inboxView();
  else if (route === "mate-review") view = mateReviewView(param);
  else if (route === "admin") view = adminView();
  else if (route === "requests") view = currentUserId() ? requestsView(() => render({ keepScroll: true })) : gateView(t("gate_apply"), t("me_go_requests"));
  else if (route === "food") {
    const again = () => render({ keepScroll: true });
    view = param === "compare" ? foodCompareView(again) : param ? foodDetailView(param, again) : foodListView();
  }
  else view = soonView();
  app.replaceChildren(view);

  const homeRoutes = ["", "city", "onboarding", "n", "p", "programs", "program", "host", "food", "explore", "now", "write"];
  const mateRoutes = ["match", "mate", "match-requests", "match-profile"];
  document.querySelectorAll(".tabbar a").forEach((a) => {
    const r = a.dataset.route;
    a.classList.toggle("on", (r === "home" && homeRoutes.includes(route)) || (r === "match" && mateRoutes.includes(route)) || (r === "messages" && ["messages", "mate-review"].includes(route)) || r === route || (r === "trips" && route === "trip") || (r === "me" && ["requests", "host-center", "host-edit", "program-edit", "review"].includes(route)));
  });
  document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
  // 헤더의 호스트 버튼: 1:1 매칭 현지인 프로필(#/match-profile)로 연결한다(프로그램용 호스트 센터는 MY 화면에서)
  const hostCta = document.getElementById("hostCta");
  if (hostCta) {
    hostCta.textContent = t("pg_become_host");
    if (route === "match-profile") hostCta.setAttribute("aria-current", "page"); else hostCta.removeAttribute("aria-current");
  }
  window.scrollTo(0, keepScroll ? scrollY : 0);
  refreshUnreadBadge().catch(() => {});   // 메시지 링크의 읽지 않은 수
}

// ---------- 첫 화면(스플래시) ----------
function initSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  const behind = document.querySelectorAll("header.topbar, main, footer, nav.tabbar");
  const logo = splash.querySelector(".splash-logo");
  let visible = false;
  let hideTimer = null;
  let touchY = null;

  function show() {
    clearTimeout(hideTimer);
    document.documentElement.classList.remove("seen");
    splash.classList.remove("gone", "out");
    logo.style.animation = "none";
    void logo.offsetWidth; // 로고 등장 애니메이션을 다시 재생
    logo.style.animation = "";
    behind.forEach((n) => n.setAttribute("inert", ""));
    visible = true;
    window.scrollTo(0, 0);
    splash.focus();
  }

  function hide() {
    if (!visible) return;
    visible = false;
    behind.forEach((n) => n.removeAttribute("inert"));
    splash.classList.add("out");
    try { sessionStorage.setItem("splashSeen", "1"); } catch {}
    hideTimer = setTimeout(() => splash.classList.add("gone"), 700);
  }

  // 헤더의 로고를 누르면 홈으로 이동하고 첫 화면을 다시 보여준다.
  document.querySelector(".logo").addEventListener("click", (e) => {
    e.preventDefault();
    if (location.hash !== "#/" && location.hash !== "") location.hash = "#/";
    show();
  });

  // 클릭, 마우스 휠(스크롤), 터치 스와이프, 키보드로 홈 화면으로 이동한다.
  splash.addEventListener("click", hide);
  splash.addEventListener("wheel", hide, { passive: true });
  splash.addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  splash.addEventListener("touchmove", (e) => { if (touchY !== null && Math.abs(e.touches[0].clientY - touchY) > 24) hide(); }, { passive: true });
  splash.addEventListener("keydown", (e) => {
    if (["Enter", " ", "Escape", "ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); hide(); }
  });

  if (document.documentElement.classList.contains("seen")) splash.classList.add("gone");
  else show();
}

// ---------- 시작 ----------
setLang(detectLang());
langSelect.replaceChildren(...LANGS.map((l) => el("option", { value: l.code }, l.label)));
langSelect.value = getLang();
langSelect.addEventListener("change", () => { setLang(langSelect.value); render(); });
window.addEventListener("hashchange", render);
initAccountButton(() => render({ keepScroll: true }));
initSync(() => render({ keepScroll: true }));
render();
initSplash();
