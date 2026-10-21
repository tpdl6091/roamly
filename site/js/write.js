// 추천 작성: 방문 선언, 현장 체크인(선택), 협찬·광고 표기, 생활 팁
import { el, store, pick, fmtDate } from "./util.js";
import { LANGS, getLang, t } from "./i18n.js";
import { CITIES, NEIGHBORHOODS, PLACES, NEIGHBORHOOD_GEO, CHECKIN_RADIUS_M } from "./data.js";
import { SAMPLE_POSTS } from "./data-posts.js";
import { statusBadges, statusPills, statusBanner, confirmControl, reportPanel, trustRank } from "./trust.js";
import { currentUserId } from "./sync.js";
import { loginGate } from "./auth.js";
import { getPlaceRemote, ensurePlaceRemote, postRemoteTarget, submitPost, verifyCheckin, deletePost, loadMyPosts, getMyPostsCache } from "./remote.js";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const PAYS = ["cash", "card", "ic", "qr"];
const TIMES = ["morning", "weekday_afternoon", "evening", "anytime"];
const SPONSORS = ["none", "gifted", "paid", "affiliate"];

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayIso = () => iso(new Date());
const yesterdayIso = () => { const d = new Date(); d.setDate(d.getDate() - 1); return iso(d); };
const isRecentVisit = (v) => v === todayIso() || v === yesterdayIso();

const getPosts = () => store.get("myPosts", []);
const placeById = (id) => PLACES.find((p) => p.id === id);
const nbOf = (place) => NEIGHBORHOODS.find((n) => n.id === place.nb);
const langLabel = (code) => LANGS.find((l) => l.code === code)?.label ?? code;
const cityLabel = (id) => { const c = CITIES.find((x) => x.id === id); return c ? (c.name[getLang()] ?? c.name.en) : id; };

// 두 좌표 사이 거리(m)
function distanceM([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---------- 글 카드(장소 상세·내가 쓴 글에서 공통 사용) ----------
function sponsorBadge(type) {
  return type !== "none" ? ["warn", "!", t("b_sp_" + type)] : null;
}

// 신뢰 규칙에 넘길 대상. 내가 쓴 글(mine)은 owner 라서 스스로 신고·투표할 수 없다.
const postTarget = (post, mine) => ({ type: "post", id: post.id, visit: post.visit, cat: placeById(post.place)?.cat, seed: post.seed, owner: mine });

// onDelete 가 있으면 '내가 쓴 글' 목록용, 없으면 장소 상세용(신고·투표 표시)
function postCard(post, onDelete, { mine = false, onChange, target } = {}) {
  const tg = target ?? postTarget(post, mine);
  const showTrust = !onDelete && onChange;
  const badges = [
    ["ok", "✓", t("b_visit", { d: fmtDate(post.visit) }) + " · " + t("b_written", { d: fmtDate(post.written) })],
    ["ok", "✓", t("b_l0")],
    ...(post.checkin ? [["ok", "✓", t("b_l1")]] : []),
    ...(sponsorBadge(post.sponsored) ? [sponsorBadge(post.sponsored)] : []),
    ...(showTrust ? statusBadges(tg) : []),
  ];
  const place = placeById(post.place);
  return el("div", { class: "sec" },
    el("div", { class: "author" },
      el("span", { class: "pill " + (post.role === "local" ? "ok" : "") }, t("role_" + (post.role ?? "traveler"))),
      mine ? el("span", { class: "pill" }, t("tr_mine")) : "",
      post.lang !== getLang() ? el("span", { class: "pill" }, t("post_lang") + ": " + langLabel(post.lang)) : "",
      ...(showTrust ? statusPills(tg) : [])),
    ...(showTrust ? statusBanner(tg) : []),
    place && onDelete ? el("p", { class: "note", style: "margin:0 0 6px" }, el("a", { href: `#/p/${place.id}` }, pick(place.name))) : "",
    el("p", { class: "quote", lang: post.lang }, post.comment),
    el("ul", { class: "badges", style: "margin-top:12px" }, ...badges.map(([cls, mark, text]) =>
      el("li", {}, el("span", { class: "dot " + cls, "aria-hidden": "true" }, mark), el("span", {}, text)))),
    showTrust ? confirmControl(tg, onChange, { compact: true }) : "",
    ...(showTrust ? reportPanel(tg, onChange) : []),
    onDelete ? el("button", { class: "link", type: "button", onclick: onDelete }, t("delete_post")) : "");
}

// 장소 상세에 붙는 '새로 올라온 추천' 영역: 다른 이용자의 예시 글 + 내가 쓴 글.
// 검수 대기·오래된 글은 뒤로 보낸다.
export function userPostsSection(placeId, onChange) {
  ensurePlaceRemote(placeId, onChange);                    // 서버 글을 가져오고, 도착하면 화면을 다시 그린다
  const remote = getPlaceRemote(placeId);
  const mineIds = new Set(getPosts().map((p) => p.id));
  // 예시 글(가상) + 이 브라우저에만 있는 글 + 서버 글. 각각 신뢰 대상(target)을 함께 만든다.
  const entries = [
    ...[...SAMPLE_POSTS, ...getPosts()].filter((p) => p.place === placeId).map((p) => ({ post: p, mine: mineIds.has(p.id), target: postTarget(p, mineIds.has(p.id)) })),
    ...(remote?.posts ?? []).map((p) => ({ post: p, mine: p.mine, target: postRemoteTarget(p, remote) })),
  ];
  entries.sort((a, b) => trustRank(a.target) - trustRank(b.target) || b.post.written.localeCompare(a.post.written));
  if (!entries.length) return "";
  return el("section", {},
    el("h2", { class: "section-title" }, t("more_recs")),
    ...entries.map((x) => postCard(x.post, null, { mine: x.mine, onChange, target: x.target })),
    el("p", { class: "note" }, t("sample_posts_note")));
}

// ---------- 추천 작성 화면 ----------
export function writeView(presetPlaceId) {
  // 글쓰기는 회원만 할 수 있다
  if (!currentUserId()) {
    return el("div", { class: "onb" }, el("h1", {}, t("write_title")), loginGate(t("gate_write")));
  }
  const draft = store.get("writeDraft", {});
  const form = {
    place: placeById(presetPlaceId) ? presetPlaceId : (draft.place ?? ""),
    comment: draft.comment ?? "",
    visit: draft.visit ?? todayIso(),
    closed: draft.closed ?? [],
    pay: draft.pay ?? [],
    time: draft.time ?? "",
    menu: draft.menu ?? "",
    solo: draft.solo ?? true,
    sponsored: draft.sponsored ?? "none",
    declared: draft.declared ?? false,
    nonaffil: draft.nonaffil ?? false,
  };
  let checkin = false;
  let checkinPos = null;           // 현장 체크인 때 읽은 좌표. 저장하지 않고 글을 올리는 순간 서버 확인에만 쓴다

  const root = el("div", { class: "onb" });
  const draftNote = el("span", { class: "note", style: "margin:0" }, t("draft_saved"));
  const err = el("div", { class: "err", role: "alert" });
  const checkinStatus = el("div", { class: "note", role: "status", style: "margin-top:6px" });

  const saveDraft = () => store.set("writeDraft", form);
  const resetCheckin = () => { checkin = false; checkinPos = null; checkinStatus.textContent = ""; checkinStatus.className = "note"; };

  // 장소 선택 (도시별 묶음)
  const placeSel = el("select", { id: "wPlace" }, el("option", { value: "" }, t("f_place_ph")));
  for (const city of CITIES.filter((c) => c.status === "open")) {
    const group = el("optgroup", { label: cityLabel(city.id) });
    for (const p of PLACES.filter((x) => nbOf(x)?.city === city.id)) {
      const nb = nbOf(p);
      group.append(el("option", { value: p.id }, `${pick(p.name)} · ${getLang() === "ko" ? nb.name.ko : nb.name.en}`));
    }
    placeSel.append(group);
  }
  placeSel.value = form.place;
  placeSel.addEventListener("change", () => { form.place = placeSel.value; resetCheckin(); saveDraft(); });

  const comment = el("textarea", { id: "wComment", rows: "5", placeholder: t("f_comment_ph"), maxlength: "1500" });
  comment.value = form.comment;
  comment.addEventListener("input", () => { form.comment = comment.value; saveDraft(); });

  const visit = el("input", { id: "wVisit", type: "date", max: todayIso(), value: form.visit });
  visit.addEventListener("change", () => { form.visit = visit.value; resetCheckin(); saveDraft(); });

  // 토글 칩
  const chipGroup = (key, options, label) => el("div", { class: "chips", role: "group", "aria-label": label },
    ...options.map((o) => {
      const b = el("button", { class: "chip", type: "button", "aria-pressed": String(form[key].includes(o)) }, label === t("f_tip_closed") ? t("day_" + o) : t("pay_" + o));
      b.addEventListener("click", () => {
        const i = form[key].indexOf(o);
        if (i >= 0) form[key].splice(i, 1); else form[key].push(o);
        b.setAttribute("aria-pressed", String(i < 0));
        saveDraft();
      });
      return b;
    }));

  const timeSel = el("select", { id: "wTime" }, el("option", { value: "" }, t("f_tip_time_none")),
    ...TIMES.map((x) => el("option", { value: x }, t("time_" + x))));
  timeSel.value = form.time;
  timeSel.addEventListener("change", () => { form.time = timeSel.value; saveDraft(); });

  const menu = el("input", { id: "wMenu", type: "text", maxlength: "80", placeholder: t("f_tip_menu_ph") });
  menu.value = form.menu;
  menu.addEventListener("input", () => { form.menu = menu.value; saveDraft(); });

  const check = (id, key, label, hint) => {
    const box = el("input", { id, type: "checkbox" });
    box.checked = !!form[key];
    box.addEventListener("change", () => { form[key] = box.checked; saveDraft(); });
    return el("div", { class: "check" }, box, el("label", { for: id }, label, hint ? el("small", {}, hint) : ""));
  };

  // 현장 체크인(선택): 좌표는 저장하지 않고 '근처였는지'만 기록한다
  const checkinBtn = el("button", { class: "btn ghost", type: "button" }, t("f_checkin_btn"));
  const setStatus = (text, ok) => { checkinStatus.textContent = text; checkinStatus.className = ok ? "ok" : "note"; };
  checkinBtn.addEventListener("click", () => {
    const place = placeById(form.place);
    if (!place) { setStatus(t("e_place"), false); return; }
    if (!isRecentVisit(form.visit)) { setStatus(t("f_checkin_date"), false); return; }
    if (!("geolocation" in navigator)) { setStatus(t("f_checkin_unavail"), false); return; }
    setStatus(t("f_checkin_checking"), false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geo = NEIGHBORHOOD_GEO[place.nb];
        const near = geo && distanceM([pos.coords.latitude, pos.coords.longitude], geo) <= CHECKIN_RADIUS_M;
        checkin = !!near;
        checkinPos = near ? [pos.coords.latitude, pos.coords.longitude] : null;
        setStatus(near ? "✓ " + t("f_checkin_ok") : t("f_checkin_far"), !!near);
      },
      (e) => setStatus(e.code === 1 ? t("f_checkin_denied") : t("f_checkin_unavail"), false),
      { timeout: 10000, maximumAge: 60000 });
  });

  const sponsorRadios = el("div", { class: "radios", role: "radiogroup", "aria-label": t("f_sponsor") },
    ...SPONSORS.map((s) => {
      const r = el("input", { type: "radio", name: "wSponsor", id: "sp_" + s, value: s });
      r.checked = form.sponsored === s;
      r.addEventListener("change", () => { form.sponsored = s; saveDraft(); });
      return el("div", { class: "check" }, r, el("label", { for: "sp_" + s }, t("sp_" + s)));
    }));

  const field = (label, control, id, hint) => el("div", { class: "field" }, el("label", { for: id }, label), control, hint ? el("small", { class: "note", style: "margin:0" }, hint) : "");

  let sending = false;
  async function submit(e) {
    e.preventDefault();
    if (sending) return;
    const text = form.comment.trim();
    if (!placeById(form.place)) { err.textContent = t("e_place"); return; }
    if (text.length < 10) { err.textContent = t("e_comment"); return; }
    if (!form.visit || form.visit > todayIso()) { err.textContent = t("e_visit"); return; }
    if (!form.declared) { err.textContent = t("e_declare"); return; }
    if (!form.nonaffil) { err.textContent = t("e_nonaffil"); return; }
    const post = {
      id: "u" + Date.now().toString(36),
      place: form.place,
      lang: getLang(),
      comment: text,
      visit: form.visit,
      written: todayIso(),
      checkin,
      sponsored: form.sponsored,
      tip: { closed: form.closed, pay: form.pay, time: form.time, menu: form.menu.trim(), solo: form.solo },
    };
    if (currentUserId()) {
      // 로그인한 상태: 서버에 올린다. 작성자 역할·체크인 확인·작성 시각은 서버가 정한다.
      sending = true; err.textContent = "";
      try {
        const id = await submitPost(post);
        if (checkinPos) await verifyCheckin(id, checkinPos[0], checkinPos[1], CHECKIN_RADIUS_M);
      } catch { sending = false; err.textContent = t("e_server"); return; }
      sending = false;
    } else {
      store.set("myPosts", [...getPosts(), post]);
    }
    checkinPos = null;
    store.set("writeDraft", {});
    location.hash = `#/p/${post.place}`;
  }

  // 내가 쓴 글: 이 브라우저에만 있는 글 + (로그인했다면) 서버에 올린 글
  const myPosts = () => {
    const box = el("section", {}, el("h2", { class: "section-title" }, t("my_posts")));
    const draw = () => {
      const local = getPosts().map((p) => ({ p, del: () => { store.set("myPosts", getPosts().filter((x) => x.id !== p.id)); draw(); } }));
      const server = (currentUserId() ? getMyPostsCache() ?? [] : []).map((p) => ({ p, del: async () => { try { await deletePost(p.id); } catch { return; } await loadMyPosts(); draw(); } }));
      const all = [...local, ...server].sort((a, b) => b.p.written.localeCompare(a.p.written));
      box.replaceChildren(el("h2", { class: "section-title" }, t("my_posts")),
        ...(all.length ? all.map((x) => postCard(x.p, x.del)) : [el("p", { class: "note" }, t("no_my_posts"))]));
    };
    draw();
    if (currentUserId()) loadMyPosts().then(draw);
    return box;
  };

  root.append(
    el("h1", {}, t("write_title")),
    el("p", { class: "hint" }, t("write_sub")),
    el("div", { style: "margin:4px 0 0" }, draftNote),
    el("form", { onsubmit: submit, novalidate: "" },
      field(t("f_place"), placeSel, "wPlace"),
      field(t("f_comment"), comment, "wComment", t("f_comment_hint", { lang: langLabel(getLang()) })),
      field(t("f_visit"), visit, "wVisit"),
      el("section", { class: "sec" },
        el("h2", {}, t("f_tips")),
        el("div", { class: "field" }, el("label", {}, t("f_tip_closed")), chipGroup("closed", DAYS, t("f_tip_closed"))),
        el("div", { class: "field" }, el("label", {}, t("f_tip_pay")), chipGroup("pay", PAYS, t("f_tip_pay"))),
        field(t("f_tip_time"), timeSel, "wTime"),
        field(t("f_tip_menu"), menu, "wMenu"),
        check("wSolo", "solo", t("f_tip_solo"))),
      el("section", { class: "sec" },
        el("h2", {}, t("f_trust")),
        check("wDeclare", "declared", t("f_declare"), t("f_declare_hint")),
        el("div", { class: "field", style: "margin-top:16px" },
          el("label", {}, t("f_checkin")),
          el("small", { class: "note", style: "margin:0" }, t("f_checkin_hint")),
          checkinBtn, checkinStatus),
        el("div", { class: "field" }, el("label", {}, t("f_sponsor")), sponsorRadios),
        check("wNonaffil", "nonaffil", t("f_nonaffil"))),
      err,
      el("div", { class: "actions" }, el("button", { class: "btn grow", type: "submit" }, t("f_submit")))),
    myPosts());
  return root;
}
