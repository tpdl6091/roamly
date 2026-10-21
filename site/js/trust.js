// 신뢰 규칙: 신고 누적 → 검수 대기, 정보 오래됨, '여전히 맞아요'·'도움이 돼요' 투표
// 대상(target)은 장소·이용자가 쓴 글(post)·식품 리뷰(review) 세 가지다.
//   target = { type: "place" | "post" | "review", id, visit?, cat?, seed?, owner?, status?, remote? }
//   remote = 서버에서 온 대상: 신고·투표 기록이 서버에 있고(remote.mine), 이미 서버 집계(seed)에 내 것이 들어 있다.
// 장소 객체를 그대로 넘겨도 장소 대상으로 처리한다.
import { el, store, isOutdated, fmtDate } from "./util.js";
import { t } from "./i18n.js";
import { TRUST_SEEDS } from "./data.js";
import { currentUserId } from "./sync.js";

const DAY = 86400000;
const RECENT_DAYS = 90;          // '최근 확인'으로 보는 기간
const REVIEW_THRESHOLD = 3;      // 이 수 이상 신고되면 검수 대기
const OUTDATED_REPORTS = 2;      // '오래됨' 신고가 이 수 이상이면 날짜와 상관없이 정보 오래됨
const REASONS = ["ad", "fake", "outdated", "other"];

const T = (x) => (x.type ? x : { type: "place", id: x.id, visit: x.visit, cat: x.cat });
const keyOf = (tg) => `${tg.type}:${tg.id}`;
const REPORT_FIELD = { place: "place", post: "post", review: "review" };

// 신고·투표는 로그인한 회원만 할 수 있다(서버에서 온 대상은 서버가 정한 canAct 를 따른다)
const needsLogin = (tg) => (tg.remote ? !tg.remote.canAct : !currentUserId());

const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const daysSince = (isoDate) => Math.floor((Date.now() - new Date(isoDate).getTime()) / DAY);
const seedOf = (tg) => tg.seed ?? (tg.type === "place" ? TRUST_SEEDS[tg.id] ?? {} : {});
const myReports = (tg) => (tg.remote
  ? tg.remote.mine.reasons.map((reason) => ({ reason }))
  : store.get("reports", []).filter((r) => r[REPORT_FIELD[tg.type]] === tg.id));
// 장소는 예전과 같은 키(장소 id)를 쓰고, 글·리뷰는 종류를 앞에 붙인다
const confirmKey = (tg) => (tg.type === "place" ? tg.id : keyOf(tg));
const myConfirmDate = (tg) => store.get("confirms", {})[confirmKey(tg)] ?? null;

// 대상의 현재 신뢰 상태를 한 번에 계산한다
export function trustOf(x) {
  const tg = T(x);
  const seed = seedOf(tg);
  const mine = myReports(tg);
  const seedTotal = Object.values(seed.reports ?? {}).reduce((a, b) => a + b, 0);
  // 서버 대상은 서버 집계(seed)에 내 신고·투표가 이미 들어 있어서 다시 더하지 않는다
  const extraReports = tg.remote ? 0 : mine.length;
  const reportTotal = seedTotal + extraReports;
  const outdatedReports = (seed.reports?.outdated ?? 0) + (tg.remote ? 0 : mine.filter((r) => r.reason === "outdated").length);
  const own = tg.remote ? null : myConfirmDate(tg);
  const ownRecent = tg.remote ? tg.remote.mine.confirmed : (!!own && daysSince(own) <= RECENT_DAYS);
  const confirms = (seed.confirmDaysAgo ?? []).filter((d) => d <= RECENT_DAYS).length + (!tg.remote && ownRecent ? 1 : 0);
  const byDate = tg.visit ? isOutdated({ visit: tg.visit, cat: tg.cat }) : false;
  return {
    review: reportTotal >= REVIEW_THRESHOLD || tg.status === "under_review",
    // 날짜상 오래됐어도 최근에 확인된 정보면 오래됨이 아니다. 오래됨 신고가 쌓이면 다시 오래됨이 된다.
    outdated: (byDate && confirms === 0) || outdatedReports >= OUTDATED_REPORTS,
    recent: confirms > 0,
    confirms,
    reportTotal,
    ownConfirmed: ownRecent,
    reported: mine.length > 0,
    reportedOutdated: mine.some((r) => r.reason === "outdated"),
    owner: !!tg.owner,
  };
}

// 목록 정렬용: 0 정상, 1 정보 오래됨, 2 검수 대기
export function trustRank(x) {
  const s = trustOf(x);
  return s.review ? 2 : s.outdated ? 1 : 0;
}

// 신고·투표 직후 화면이 다시 그려져도 결과 안내가 남도록 대상별로 잠시 보관한다
const flash = {};
const takeFlash = (tg, kind) => { const k = `${kind}:${keyOf(tg)}`; const v = flash[k] ?? ""; delete flash[k]; return v; };
const setFlash = (tg, kind, text) => { flash[`${kind}:${keyOf(tg)}`] = text; };

function addReport(tg, reason) {
  if (myReports(tg).some((r) => r.reason === reason)) return false;   // 같은 이유로는 한 번만
  const reports = store.get("reports", []);
  reports.push({ [REPORT_FIELD[tg.type]]: tg.id, reason, at: new Date().toISOString() });
  store.set("reports", reports);
  return true;
}

// 상태 안내 상자(검수 대기, 정보 오래됨)
export function statusBanner(x) {
  const tg = T(x);
  const s = trustOf(tg);
  const boxes = [];
  if (s.review) boxes.push(el("div", { class: "alert", role: "status" }, el("b", {}, t("tr_review_pill")), " ", t("tr_review_banner")));
  if (s.outdated && tg.visit) boxes.push(el("div", { class: "alert", role: "status" }, t("tr_outdated_banner", { d: fmtDate(tg.visit) })));
  return boxes;
}

// 상태 표시(목록용 작은 라벨)
export function statusPills(x) {
  const s = trustOf(x);
  return [
    s.review ? el("span", { class: "pill warn" }, t("tr_review_pill")) : "",
    s.outdated ? el("span", { class: "pill warn" }, t("b_outdated")) : "",
    s.recent && !s.outdated && !s.review ? el("span", { class: "pill ok" }, t("tr_recent_pill")) : "",
  ];
}

// 신뢰 정보 목록에 넣을 줄
export function statusBadges(x) {
  const s = trustOf(x);
  return [
    ...(s.review ? [["warn", "!", t("tr_review_badge")]] : []),
    ...(s.outdated ? [["warn", "!", t("b_outdated")]] : []),
    ...(s.recent ? [["ok", "✓", t("tr_recent_badge", { n: s.confirms })]] : []),
  ];
}

// '여전히 맞아요' 투표(누르면 취소) + '정보가 바뀌었어요' 제보. compact=true면 글 카드용 한 줄 형태.
export function confirmControl(x, onChange, { compact = false } = {}) {
  const tg = T(x);
  const s = trustOf(tg);
  if (s.owner) return compact ? "" : el("p", { class: "note" }, t("tr_own"));
  if (needsLogin(tg)) return el("p", { class: "note", style: compact ? "margin:8px 0 0" : "" }, t("tr_login_needed"));   // 비회원은 투표할 수 없다
  const msg = el("div", { class: "ok", role: "status" }, takeFlash(tg, "confirm"));
  const confirmBtn = el("button", {
    class: "btn" + (s.ownConfirmed ? " on" : " ghost") + (compact ? " sm" : ""), type: "button", "aria-pressed": String(s.ownConfirmed),
    onclick: () => {
      if (tg.remote) { tg.remote.setConfirm(!s.ownConfirmed).catch(() => {}).finally(onChange); return; }
      const all = store.get("confirms", {});
      if (s.ownConfirmed) delete all[confirmKey(tg)]; else all[confirmKey(tg)] = todayIso();
      store.set("confirms", all);
      onChange();
    },
  }, (s.ownConfirmed ? t("tr_confirmed_btn") : t("tr_confirm_btn")) + (compact && s.confirms ? ` (${s.confirms})` : ""));
  const changedBtn = el("button", {
    class: "btn ghost" + (compact ? " sm" : ""), type: "button", ...(s.reportedOutdated ? { disabled: "" } : {}),
    onclick: () => {
      if (tg.remote) {
        tg.remote.report("outdated").then((sent) => { if (sent) setFlash(tg, "confirm", t("tr_changed_done")); }).catch(() => {}).finally(onChange);
        return;
      }
      if (addReport(tg, "outdated")) setFlash(tg, "confirm", t("tr_changed_done"));
      onChange();
    },
  }, t("tr_changed_btn"));
  return el("div", compact ? { class: "confirmrow" } : { class: "confirmbox" },
    compact ? "" : el("div", { class: "note", style: "margin:0 0 8px;font-weight:600;color:var(--ink)" }, t("tr_confirm_title")),
    el("div", { class: "paction" }, confirmBtn, changedBtn),
    msg,
    compact ? "" : el("p", { class: "note" }, t("tr_confirm_note")));
}

// 리뷰용 '도움이 돼요' 투표(누르면 취소). 예시 리뷰는 seed.helpful 만큼의 표가 이미 있다.
export function helpfulControl(x, onChange) {
  const tg = T(x);
  const helpful = store.get("helpful", {});
  const mine = !!helpful[keyOf(tg)];
  const count = (tg.seed?.helpful ?? 0) + (mine ? 1 : 0);
  if (tg.owner || needsLogin(tg)) return el("span", { class: "note", style: "margin:0" }, t("tr_helpful_n", { n: count }));   // 내 글·비회원은 숫자만 보인다
  return el("button", {
    class: "btn ghost sm" + (mine ? " on" : ""), type: "button", "aria-pressed": String(mine),
    onclick: () => {
      const all = store.get("helpful", {});
      if (mine) delete all[keyOf(tg)]; else all[keyOf(tg)] = todayIso();
      store.set("helpful", all);
      onChange();
    },
  }, (mine ? t("tr_helpful_done") : t("tr_helpful")) + ` (${count})`);
}

// 신고 패널: 이유를 고르고 보낸다. 이유별로 한 번만 신고할 수 있다.
export function reportPanel(x, onChange) {
  const tg = T(x);
  if (tg.owner || needsLogin(tg)) return [];
  const box = el("div", { class: "reportbox", hidden: "" });
  const btn = el("button", { class: "link", type: "button", "aria-expanded": "false" }, t("report"));
  btn.addEventListener("click", () => {
    const open = box.hasAttribute("hidden");
    if (open) box.removeAttribute("hidden"); else box.setAttribute("hidden", "");
    btn.setAttribute("aria-expanded", String(open));
  });
  let reason = null;
  const reportedNote = takeFlash(tg, "report");
  const msg = el("div", { class: "ok", role: "status" }, reportedNote);
  if (reportedNote) { box.removeAttribute("hidden"); btn.setAttribute("aria-expanded", "true"); }

  function draw() {
    const done = new Set(myReports(tg).map((r) => r.reason));
    box.replaceChildren(
      el("div", { class: "chips" }, ...REASONS.map((r) => el("button", {
        class: "chip", type: "button", "aria-pressed": String(reason === r), ...(done.has(r) ? { disabled: "" } : {}),
        onclick: () => { reason = r; draw(); },
      }, t("report_" + r)))),
      el("button", {
        class: "btn", type: "button",
        onclick: () => {
          if (!reason) return;
          if (tg.remote) {
            tg.remote.report(reason).then((sent) => { if (sent) setFlash(tg, "report", t("report_done")); else msg.textContent = t("tr_report_dup"); })
              .catch(() => { msg.textContent = t("tr_report_fail"); }).then(() => { if (!msg.textContent) onChange(); });
            return;
          }
          if (!addReport(tg, reason)) { msg.textContent = t("tr_report_dup"); return; }
          setFlash(tg, "report", t("report_done"));
          onChange();
        },
      }, t("report_send")),
      msg);
  }
  draw();
  return [el("div", { style: "margin-top:8px" }, btn), box];
}
