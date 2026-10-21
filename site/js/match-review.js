// 1:1 만남 후기(#/mate-review/<요청 id>): '만남 완료'된 요청의 참여자만, 한 만남에 한 번 쓸 수 있다.
// 쓸 수 있는지는 서버가 다시 확인한다(reviews_before_insert 트리거 + 중복 금지 제약).
import { el, fmtDate } from "./util.js";
import { t } from "./i18n.js";
import { currentUserId } from "./sync.js";
import { loginGate } from "./auth.js";
import * as api from "./match-api.js";

const ASPECTS = ["overall", "communication", "punctuality", "activity"];

// 별 1~5 고르기(라디오 버튼이라 키보드 ←→ 로도 고를 수 있다)
function starInput(name, label, state) {
  const wrap = el("fieldset", { class: "stars" }, el("legend", {}, label));
  const row = el("div", { class: "starrow" });
  for (let i = 1; i <= 5; i++) {
    const id = `${name}-${i}`;
    const input = el("input", { type: "radio", name, id, value: String(i), class: "sr" });
    input.addEventListener("change", () => { state[name] = i; paint(); });
    row.append(input, el("label", { for: id, title: t("rvw_star_n", { n: i }) }, el("span", { "aria-hidden": "true" }, "★"), el("span", { class: "sr" }, t("rvw_star_n", { n: i }))));
  }
  const value = el("small", { class: "note", style: "margin:0 0 0 6px" });
  function paint() {
    row.querySelectorAll("label").forEach((lb, idx) => lb.classList.toggle("on", idx < (state[name] || 0)));
    value.textContent = state[name] ? `${state[name]} / 5` : "";
  }
  wrap.append(row, value);
  return wrap;
}

export function mateReviewView(requestId) {
  const root = el("div", { class: "onb match" });
  root.append(el("a", { class: "crumb", href: "#/match-requests" }, t("rvw_back")), el("h1", {}, t("rvw_title")));
  if (!currentUserId()) { root.append(loginGate(t("rvw_gate"))); return root; }
  const body = el("div", {}, el("p", { class: "note" }, t("m_searching")));
  root.append(body);

  api.reviewContext(requestId).then((ctx) => {
    if (!ctx) { body.replaceChildren(el("p", { class: "alert" }, t("rvw_not_found"))); return; }
    const { req } = ctx;
    const head = el("div", { class: "mhead" },
      el("div", { class: "grow" }, el("b", {}, ctx.otherName || "—"),
        el("div", { class: "note", style: "margin:2px 0 0" }, `${fmtDate(req.meet_date)}${req.activity ? " · " + req.activity : ""}`)));
    if (ctx.mine) { body.replaceChildren(head, done(ctx.mine)); return; }
    if (req.status !== "completed") { body.replaceChildren(head, el("p", { class: "alert" }, t("rvw_err_not_done")), el("a", { class: "btn ghost sm", href: "#/match-requests" }, t("m_my_requests"))); return; }
    body.replaceChildren(head, form(ctx));
  }).catch(() => body.replaceChildren(el("p", { class: "alert" }, t("m_err_server"))));
  return root;
}

// 이미 쓴 후기
function done(r) {
  return el("section", { class: "sec" },
    el("h2", {}, t("rvw_mine")),
    el("p", { style: "margin:0 0 6px" }, el("b", {}, "★".repeat(r.rating_overall)), " ", el("small", { class: "note" }, fmtDate(String(r.created_at).slice(0, 10)))),
    el("p", { class: "quote", style: "margin:0 0 6px" }, r.body),
    el("p", { class: "note", style: "margin:0" }, t("md_review_detail", { c: r.rating_communication, p: r.rating_punctuality, a: r.rating_activity })),
    r.status === "under_review" ? el("p", { class: "note" }, t("rvw_under_review")) : "");
}

function form(ctx) {
  const state = { overall: 0, communication: 0, punctuality: 0, activity: 0 };
  const err = el("div", { class: "err", role: "alert" });
  const text = el("textarea", { id: "rvBody", rows: "5", maxlength: "1000", placeholder: t("rvw_body_ph") });
  const count = el("small", { class: "note", style: "margin:0" }, "0 / 1000");
  text.addEventListener("input", () => { count.textContent = `${text.value.trim().length} / 1000`; });
  // 함께한 활동: 요청에 적힌 활동을 기본값으로, 관심사 목록에서 고를 수 있다
  const typeSel = el("select", { id: "rvType" }, el("option", { value: "" }, "—"),
    ...api.INTEREST_GROUPS.flatMap(([, ids]) => ids).map((id) => el("option", { value: id }, t("mi_" + id))));
  const guess = api.INTEREST_GROUPS.flatMap(([, ids]) => ids).find((id) => t("mi_" + id) === ctx.req.activity);
  if (guess) typeSel.value = guess;
  const btn = el("button", { class: "btn", type: "submit" }, t("rvw_submit"));

  const f = el("form", {
    class: "sec", novalidate: "",
    onsubmit: async (e) => {
      e.preventDefault();
      err.textContent = "";
      if (ASPECTS.some((k) => !state[k])) { err.textContent = t("rvw_err_stars"); return; }
      const b = text.value.trim();
      if (b.length < 10) { err.textContent = t("rvw_err_short"); return; }
      btn.disabled = true; btn.textContent = t("mh_saving");
      try {
        await api.submitReview({ requestId: ctx.req.id, targetId: ctx.otherId, ...state, body: b, activityType: typeSel.value });
        const fresh = await api.reviewContext(ctx.req.id);
        f.replaceWith(el("p", { class: "ok", role: "status" }, t("rvw_saved")), done(fresh.mine));
      } catch (ex) { err.textContent = t(api.reviewErrorKey(ex)); btn.disabled = false; btn.textContent = t("rvw_submit"); }
    },
  },
  el("p", { class: "note", style: "margin-top:0" }, t(ctx.iAmHost ? "rvw_sub_host" : "rvw_sub")),
  starInput("overall", t("rvw_overall"), state),
  starInput("communication", t("rvw_communication"), state),
  starInput("punctuality", t("rvw_punctuality"), state),
  starInput("activity", t("rvw_activity"), state),
  el("div", { class: "field" }, el("label", { for: "rvType" }, t("rvw_type")), typeSel),
  el("div", { class: "field" }, el("label", { for: "rvBody" }, t("rvw_body")), text, count),
  el("p", { class: "note" }, t("rvw_policy")),
  err,
  el("div", { class: "actions" }, btn));
  return f;
}
