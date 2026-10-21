// 호스트 프로필, 로컬 프로그램(산책·맛집/마켓 탐방·동행), 신청 내역, 참여 후기
import { el, store, pick } from "./util.js";
import { LANGS, getLang, t } from "./i18n.js";
import { CITIES, NEIGHBORHOODS, TASTE_TAGS } from "./data.js";
import { HOSTS, PROGRAMS, PROGRAM_TYPES, PROGRAM_REVIEWS } from "./data-programs.js";
import { currentUserId } from "./sync.js";
import { loginGate, promptLogin } from "./auth.js";

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayIso = () => iso(new Date());
const dateAfter = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return iso(d); };
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const fmtDay = (isoDate) => parse(isoDate).toLocaleDateString(getLang(), { month: "long", day: "numeric", weekday: "short" });

// ---------- 내 호스트·내 프로그램·받은 신청(이 브라우저에 저장) ----------
export const getMyHost = () => store.get("myHost", null);
export const setMyHost = (h) => store.set("myHost", h);
export const getMyPrograms = () => store.get("myPrograms", []);
export const setMyPrograms = (list) => store.set("myPrograms", list);
export const getInbox = () => store.get("hostInbox", []);
export const setInbox = (list) => store.set("hostInbox", list);
export const getRequests = () => store.get("progRequests", []);
const setRequests = (list) => store.set("progRequests", list);
export const getReviews = () => store.get("progReviews", []);

// 호스트: 'me'는 내가 만든 프로필
export function hostById(id) {
  if (id === "me") {
    const h = getMyHost();
    if (!h) return null;
    return { id: "me", role: h.role, verified: !!h.verified, city: h.city, nb: h.nb || null, years: h.role === "local" ? h.years : null,
      rating: null, reviews: 0, name: { [h.lang]: h.name }, languages: h.languages, interests: h.interests, bio: { [h.lang]: h.bio } };
  }
  return HOSTS.find((x) => x.id === id) ?? null;
}
export const allPrograms = () => [...PROGRAMS, ...getMyPrograms().map((p) => ({ ...p, host: "me" }))];
export const programById = (id) => allPrograms().find((p) => p.id === id);
// 내 프로그램은 현지인이면 신원 확인 후, 여행자(동행)는 바로 공개된다
export function isPublic(p) {
  if (p.host !== "me") return true;
  const h = hostById("me");
  // 여행자 호스트는 동행 프로그램만 공개된다(역할을 바꾸면 다른 유형은 숨겨진다)
  return !!h && (h.role === "traveler" ? p.type === "companion" : h.verified);
}
const publicPrograms = () => allPrograms().filter(isPublic);

const cityName = (id) => { const c = CITIES.find((x) => x.id === id); return c ? (c.name[getLang()] ?? c.name.en) : id; };
const nbName = (id) => { const n = NEIGHBORHOODS.find((x) => x.id === id); return n ? (getLang() === "ko" ? n.name.ko : n.name.en) : ""; };
const langNames = (codes) => codes.map((c) => LANGS.find((l) => l.code === c)?.label ?? c).join(", ");

export const sessionsOf = (program) => program.sessions.map((s) => ({ ...s, date: s.date ?? dateAfter(s.days) }));

// 남은 자리 = 정원 − 예시 신청 인원 − 내가 한 신청 − 호스트가 수락한 신청
export function seatsLeft(program, session, date) {
  const mine = getRequests().filter((r) => r.program === program.id && r.session === session.id && r.date === date && !["cancelled"].includes(r.status)).length;
  const accepted = getInbox().filter((r) => r.program === program.id && r.session === session.id && r.date === date && r.status === "accepted").length;
  return Math.max(0, program.capacity - session.booked - mine - accepted);
}

// 현지인은 신원 확인 여부를, 여행자 호스트는 역할만 표시한다
function hostPills(host) {
  return [
    el("span", { class: "pill " + (host.role === "local" ? "ok" : "") }, t("host_" + host.role)),
    host.verified ? el("span", { class: "pill ok" }, "✓ " + t("host_verified"))
      : host.role === "local" ? el("span", { class: "pill warn" }, t("hc_verify_pending")) : "",
  ];
}

// 프로그램 후기: 예시 + 내가 쓴 것
export function reviewsOfProgram(programId) {
  const sample = (PROGRAM_REVIEWS[programId] ?? []).map((r) => ({ ...r, mine: false }));
  const mine = getReviews().filter((r) => r.program === programId).map((r) => ({ ...r, mine: true, text: { [r.lang]: r.text }, at: r.at.slice(0, 7) }));
  return [...mine, ...sample];
}
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

// ---------- 프로그램 목록 ----------
export function programsView(cityParam, typeParam) {
  const openCities = CITIES.filter((c) => c.status === "open");
  const state = {
    city: openCities.some((c) => c.id === cityParam) ? cityParam : "all",
    type: PROGRAM_TYPES.includes(typeParam) ? typeParam : "all",
  };
  const list = el("div", { class: "ngrid" });
  const chipsBox = el("div", { class: "chips toolbar" });
  const citySel = el("select", { id: "pgCity", "aria-label": t("pg_city") },
    el("option", { value: "all" }, t("pg_all")),
    ...openCities.map((c) => el("option", { value: c.id }, c.name[getLang()] ?? c.name.en)));
  citySel.value = state.city;
  citySel.addEventListener("change", () => { state.city = citySel.value; draw(); });

  function draw() {
    chipsBox.replaceChildren(
      ...["all", ...PROGRAM_TYPES].map((k) => el("button", {
        class: "chip", type: "button", "aria-pressed": String(state.type === k),
        onclick: () => { state.type = k; draw(); },
      }, k === "all" ? t("pg_all") : t("ptype_" + k))));
    const items = publicPrograms().filter((p) => (state.city === "all" || p.city === state.city) && (state.type === "all" || p.type === state.type));
    list.replaceChildren(...(items.length ? items.map(programCard)
      : [el("div", { class: "placeholder", style: "grid-column:1/-1" }, el("p", {}, t("pg_none")))]));
  }

  function programCard(p) {
    const host = hostById(p.host);
    const next = sessionsOf(p).sort((a, b) => a.date.localeCompare(b.date))[0];
    return el("a", { class: "pcard", href: `#/program/${p.id}` },
      el("div", { class: "nhead" }, el("b", {}, pick(p.title)), el("small", {}, cityName(p.city) + (p.nb ? " · " + nbName(p.nb) : ""))),
      el("p", {}, pick(p.desc)),
      el("div", { class: "ntags" },
        el("span", { class: "pill" }, t("ptype_" + p.type)),
        el("span", { class: "pill" }, t("pg_duration", { h: p.hours })),
        el("span", { class: "pill" }, `${t("pg_from")} ${pick(host.name)}`),
        ...hostPills(host)),
      el("div", { class: "nmeta" }, el("span", {}, next ? `${fmtDay(next.date)} ${next.time}` : ""), el("span", {}, t("pg_seats", { n: p.capacity }))));
  }

  draw();
  return el("div", {},
    el("div", { class: "city-head" }, el("h1", {}, t("pg_title")), el("a", { class: "link", href: "#/requests" }, t("me_go_requests"))),
    el("p", { class: "note", style: "margin-top:4px" }, t("pg_sub")),
    el("div", { class: "field" }, el("label", { for: "pgCity" }, t("pg_city")), citySel),
    chipsBox, list,
    el("p", { class: "note" }, t("host_sample")));
}

// ---------- 호스트 프로필 ----------
export function hostView(id) {
  const host = hostById(id);
  if (!host) return programsView();
  const programs = publicPrograms().filter((p) => p.host === id);
  const reviews = programs.flatMap((p) => reviewsOfProgram(p.id).map((r) => ({ ...r, program: p })));
  return el("div", { class: "onb" },
    el("a", { class: "crumb", href: "#/programs" }, "← " + t("pg_title")),
    el("div", { class: "author", style: "margin-top:8px" }, ...hostPills(host)),
    el("h1", {}, pick(host.name)),
    el("p", { class: "note", style: "margin-top:0" },
      [host.city ? cityName(host.city) : "", host.years ? t("host_years", { y: host.years }) : "", host.rating ? t("host_rating", { r: host.rating, n: host.reviews }) : ""].filter(Boolean).join(" · ")),
    el("section", { class: "sec" }, el("h2", {}, t("host_about")), el("p", { class: "quote" }, pick(host.bio))),
    el("section", { class: "sec" },
      el("dl", { class: "tips" },
        el("dt", {}, t("host_langs")), el("dd", {}, langNames(host.languages)),
        el("dt", {}, t("host_interests")),
        el("dd", {}, host.interests.map((x) => (TASTE_TAGS.includes(x) ? t("tag_" + x) : x)).join(", ")))),
    el("h2", { class: "section-title" }, t("host_programs")),
    el("div", { class: "ngrid" }, ...programs.map((p) => el("a", { class: "pcard", href: `#/program/${p.id}` },
      el("div", { class: "nhead" }, el("b", {}, pick(p.title))),
      el("div", { class: "ntags" }, el("span", { class: "pill" }, t("ptype_" + p.type)), el("span", { class: "pill" }, t("pg_duration", { h: p.hours })))))),
    ...(reviews.length ? [el("h2", { class: "section-title" }, t("rv_section")), ...reviews.slice(0, 5).map((r) => reviewCard(r, true))] : []),
    el("p", { class: "note" }, t("host_sample")));
}

function reviewCard(r, showProgram) {
  return el("div", { class: "sec" },
    el("div", { class: "author" },
      el("span", { class: "pill ok" }, "✓ " + t("rv_badge")),
      el("span", { class: "note", style: "margin:0" }, r.at),
      el("b", { "aria-label": `${r.rating}/5` }, stars(r.rating))),
    showProgram ? el("p", { class: "note", style: "margin:0 0 6px" }, pick(r.program.title)) : "",
    el("p", { class: "quote", style: "font-size:15px" }, pick(r.text)));
}

// ---------- 프로그램 상세 + 신청 + 후기 ----------
export function programView(id) {
  const p = programById(id);
  if (!p) return programsView();
  const host = hostById(p.host);
  const own = p.host === "me";
  const sessions = sessionsOf(p).sort((a, b) => a.date.localeCompare(b.date));
  const state = { pick: null };
  const sessionBox = el("div", { class: "radios", role: "radiogroup", "aria-label": t("pg_session") });
  const msg = el("textarea", { id: "pgMsg", rows: "3", maxlength: "300", placeholder: t("pg_apply_ph") });
  const err = el("div", { class: "err", role: "alert" });
  const ok = el("div", { class: "ok", role: "status" });

  function drawSessions() {
    sessionBox.replaceChildren(...sessions.map((s) => {
      const left = seatsLeft(p, s, s.date);
      const r = el("input", { type: "radio", name: "pgSession", id: "ses_" + s.id, value: s.id, ...(left === 0 ? { disabled: "" } : {}) });
      r.checked = state.pick === s.id;
      r.addEventListener("change", () => { state.pick = s.id; err.textContent = ""; });
      return el("div", { class: "check" }, r,
        el("label", { for: "ses_" + s.id }, `${fmtDay(s.date)} ${s.time}`,
          el("small", {}, left === 0 ? t("pg_full") : t("pg_left", { n: left }))));
    }));
  }
  drawSessions();

  const reportMsg = el("div", { class: "ok", role: "status" });
  function apply(e) {
    e.preventDefault();
    const s = sessions.find((x) => x.id === state.pick);
    if (!s) { err.textContent = t("pg_apply_err"); return; }
    const requests = getRequests();
    if (requests.some((r) => r.program === p.id && r.session === s.id && r.date === s.date && r.status !== "cancelled")) { err.textContent = t("pg_applied_dup"); return; }
    requests.push({ id: "r" + Date.now().toString(36), program: p.id, session: s.id, date: s.date, time: s.time,
      message: msg.value.trim(), status: "requested", createdAt: new Date().toISOString() });
    setRequests(requests);
    err.textContent = "";
    ok.textContent = t("pg_applied");
    drawSessions();
  }

  const reviews = reviewsOfProgram(p.id);
  return el("div", { class: "place" },
    el("a", { class: "crumb", href: `#/programs/${p.city}` }, "← " + t("pg_title")),
    el("div", { class: "ntags" }, el("span", { class: "pill" }, t("ptype_" + p.type)), el("span", { class: "pill" }, own ? t("pg_own") : t("host_sample"))),
    el("h1", {}, pick(p.title)),
    el("p", { class: "note", style: "margin:0" }, cityName(p.city) + (p.nb ? " · " + nbName(p.nb) : "")),
    own && !isPublic(p) ? el("div", { class: "alert" }, t("pg_hidden_banner")) : "",
    el("div", { class: "pphoto", "aria-hidden": "true" }),
    el("section", { class: "sec" },
      el("div", { class: "author" }, ...hostPills(host), el("a", { href: `#/host/${host.id}` }, el("b", {}, pick(host.name)))),
      el("p", { class: "quote" }, pick(p.desc)),
      el("dl", { class: "tips", style: "margin-top:12px" },
        el("dt", {}, t("pg_meeting")), el("dd", {}, pick(p.meeting)),
        el("dt", {}, t("pg_lang")), el("dd", {}, langNames(p.languages)),
        el("dt", {}, t("pg_cost")), el("dd", {}, pick(p.cost)),
        el("dt", {}, t("pg_seats", { n: p.capacity })), el("dd", {}, t("pg_duration", { h: p.hours })))),
    el("section", { class: "sec" },
      el("h2", {}, t("pg_safety")),
      el("ul", { class: "badges" },
        ...[t("pg_s1"), t("pg_s2"), t("pg_s3")].map((x) => el("li", {}, el("span", { class: "dot ok", "aria-hidden": "true" }, "✓"), el("span", {}, x)))),
      p.type === "companion" ? el("p", { class: "note" }, t("pg_companion_note")) : "",
      el("button", {
        class: "link", type: "button",
        onclick: () => {
          if (!currentUserId()) { promptLogin(t("tr_login_needed")); return; }   // 신고는 회원만
          const reports = store.get("reports", []);
          reports.push({ program: p.id, reason: "other", at: new Date().toISOString() });
          store.set("reports", reports);
          reportMsg.textContent = t("pg_report_done");
        },
      }, t("pg_report")), reportMsg),
    own
      ? el("section", { class: "sec" }, el("p", { class: "note", style: "margin:0 0 10px" }, t("pg_own")),
        el("a", { class: "btn ghost", href: `#/program-edit/${p.id}` }, t("hc_edit")))
      : !currentUserId() ? loginGate(t("gate_apply"))   // 신청은 회원만
      : el("form", { class: "sec", onsubmit: apply },
        el("h2", {}, t("pg_apply")),
        el("div", { class: "field" }, el("label", {}, t("pg_session")), sessionBox),
        el("div", { class: "field" }, el("label", { for: "pgMsg" }, t("pg_apply_msg")), msg),
        err,
        el("button", { class: "btn", type: "submit" }, t("pg_apply_send")),
        ok, el("div", {}, el("a", { class: "link", href: "#/requests" }, t("pg_view_requests")))),
    el("h2", { class: "section-title" }, t("rv_section")),
    ...(reviews.length ? reviews.map((r) => reviewCard(r, false)) : [el("p", { class: "note" }, t("rv_none"))]));
}

// ---------- 내 신청 내역 ----------
export function requestsView(onChange) {
  const list = getRequests().slice().sort((a, b) => a.date.localeCompare(b.date));
  const reviewed = new Set(getReviews().map((r) => r.request));
  const setStatus = (id, status) => { setRequests(getRequests().map((r) => (r.id === id ? { ...r, status } : r))); onChange(); };
  return el("div", { class: "onb" },
    el("h1", {}, t("rq_title")),
    list.length ? el("div", {}, ...list.map((r) => {
      const p = programById(r.program);
      if (!p) return "";
      const host = hostById(p.host);
      return el("section", { class: "sec" },
        el("div", { class: "nhead" }, el("a", { href: `#/program/${p.id}` }, el("b", {}, pick(p.title))),
          el("span", { class: "pill " + (["accepted", "completed"].includes(r.status) ? "ok" : r.status === "cancelled" ? "warn" : "") }, t("rq_" + r.status))),
        el("p", { class: "note", style: "margin:4px 0" }, `${fmtDay(r.date)} ${r.time} · ${t("rq_with", { name: pick(host.name) })}`),
        r.message ? el("p", { class: "quote", style: "font-size:14px" }, r.message) : "",
        r.status === "accepted" ? el("p", { class: "ok" }, t("rq_confirmed_note")) : "",
        el("div", { class: "paction" },
          r.status === "requested" ? el("button", { class: "btn ghost sm", type: "button", onclick: () => setStatus(r.id, "accepted") }, t("rq_demo_accept")) : "",
          r.status === "accepted" ? el("button", { class: "btn ghost sm", type: "button", onclick: () => setStatus(r.id, "completed") }, t("rq_demo_complete")) : "",
          r.status === "completed" && !reviewed.has(r.id) ? el("a", { class: "btn sm", href: `#/review/${r.id}` }, t("rq_review")) : "",
          r.status === "completed" && reviewed.has(r.id) ? el("span", { class: "pill ok" }, t("rq_reviewed")) : "",
          ["requested", "accepted"].includes(r.status) ? el("button", { class: "btn ghost sm", type: "button", onclick: () => setStatus(r.id, "cancelled") }, t("rq_cancel")) : ""));
    }), el("p", { class: "note" }, t("rq_note")))
      : el("div", { class: "placeholder" }, el("h2", {}, t("rq_none")), el("p", {}, t("rq_none_sub")),
        el("a", { class: "btn ghost", href: "#/programs" }, t("rq_browse"))));
}

// ---------- 참여 후기 쓰기 ----------
export function reviewView(requestId) {
  const r = getRequests().find((x) => x.id === requestId);
  const p = r && programById(r.program);
  if (!r || !p || r.status !== "completed") return requestsView(() => {});
  if (getReviews().some((x) => x.request === r.id)) { location.hash = `#/program/${p.id}`; return el("div"); }
  const form = { rating: 5, hostRating: 5 };
  const err = el("div", { class: "err", role: "alert" });
  const text = el("textarea", { id: "rvText", rows: "5", maxlength: "800", placeholder: t("rv_text_ph") });
  const rate = (key, id, label) => {
    const sel = el("select", { id }, ...[5, 4, 3, 2, 1].map((n) => el("option", { value: n }, `${n}  ${stars(n)}`)));
    sel.value = String(form[key]);
    sel.addEventListener("change", () => { form[key] = Number(sel.value); });
    return el("div", { class: "field" }, el("label", { for: id }, label), sel);
  };
  return el("div", { class: "onb" },
    el("a", { class: "crumb", href: "#/requests" }, t("rv_back")),
    el("h1", {}, t("rv_title")),
    el("p", { class: "note", style: "margin-top:0" }, `${pick(p.title)} · ${fmtDay(r.date)}`),
    el("form", {
      onsubmit: (e) => {
        e.preventDefault();
        if (text.value.trim().length < 10) { err.textContent = t("rv_err_text"); return; }
        store.set("progReviews", [...getReviews(), { id: "pr" + Date.now().toString(36), program: p.id, request: r.id,
          rating: form.rating, hostRating: form.hostRating, lang: getLang(), text: text.value.trim(), at: new Date().toISOString() }]);
        location.hash = `#/program/${p.id}`;
      },
    },
      rate("rating", "rvRate", t("rv_program")), rate("hostRating", "rvHost", t("rv_host")),
      el("div", { class: "field" }, el("label", { for: "rvText" }, t("rv_text")), text),
      err, el("button", { class: "btn", type: "submit" }, t("rv_submit"))));
}

// 여행 일정의 같은 날에 보여줄 '확정된 프로그램' 카드
export function programDayCards(trip, date) {
  return getRequests()
    .filter((r) => r.status === "accepted" && r.date === date)
    .map((r) => ({ r, p: programById(r.program) }))
    .filter(({ p }) => p && p.city === trip.city)
    .map(({ r, p }) => el("li", { class: "item" },
      el("span", { class: "num", "aria-hidden": "true" }, "★"),
      el("div", { class: "grow" },
        el("a", { href: `#/program/${p.id}` }, el("b", {}, pick(p.title))),
        el("div", { class: "ntags" }, el("span", { class: "pill ok" }, t("pg_in_plan")), el("span", { class: "note", style: "margin:0" }, r.time)))));
}
