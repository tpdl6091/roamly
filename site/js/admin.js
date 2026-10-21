// 운영자 화면(#/admin): 현지인 신원 확인 · 신고 검수 · 처리 기록
// 화면은 운영자에게만 보이지만, 실제 권한은 서버 함수(admin_*)가 매번 다시 확인한다(supabase_migration_005_admin.sql).
import { el, pick } from "./util.js";
import { getLang, t, LANGS } from "./i18n.js";
import { CITIES, PLACES } from "./data.js";
import { getClient, loginGate } from "./auth.js";
import { currentUserId } from "./sync.js";
import { avatarUrl } from "./match-api.js";

// ---- 서버 호출 ----
async function rpc(name, args) {
  const c = await getClient();
  if (!c || !currentUserId()) throw new Error("not signed in");
  const { data, error } = await c.rpc(name, args);
  if (error) throw error;
  return data;
}
let adminCache = null;   // 같은 로그인 동안 운영자 여부를 기억한다(메뉴 표시용)
let adminCacheUser = null;
export async function amIAdmin() {
  if (!currentUserId()) return false;
  if (adminCacheUser === currentUserId() && adminCache !== null) return adminCache;
  try { adminCache = !!(await rpc("am_i_admin")); } catch { adminCache = false; }
  adminCacheUser = currentUserId();
  return adminCache;
}

const cityName = (id) => { const c = CITIES.find((x) => x.id === id); return c ? (c.name[getLang()] ?? c.name.en) : (id || "—"); };
const langLabel = (code) => LANGS.find((l) => l.code === code)?.label ?? code;
const when = (iso) => (iso ? new Date(iso).toLocaleString(getLang(), { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

function initial(name, path) {
  const box = el("span", { class: "avatar", style: "width:44px;height:44px;font-size:18px", "aria-hidden": "true" }, (name || "?").slice(0, 1).toUpperCase());
  if (path) avatarUrl(path).then((u) => { if (u) box.replaceChildren(el("img", { src: u, alt: "" })); }).catch(() => {});
  return box;
}

export function adminView() {
  const root = el("div", { class: "onb admin" });
  root.append(el("h1", {}, t("ad_title")));
  if (!currentUserId()) { root.append(loginGate(t("ad_gate"))); return root; }
  const body = el("div", {}, el("p", { class: "note" }, t("m_searching")));
  root.append(body);

  const state = { tab: "hosts", filter: "waiting", hosts: null, reports: null, log: null };
  const tabs = el("div", { class: "tabs", role: "tablist" });
  const box = el("div", { "aria-live": "polite" });
  const msg = el("div", { role: "status", class: "ok" });

  amIAdmin().then((ok) => {
    if (!ok) { body.replaceChildren(el("p", { class: "alert" }, t("ad_denied")), el("p", { class: "note" }, t("ad_denied_hint"))); return; }
    body.replaceChildren(el("p", { class: "note", style: "margin-top:0" }, t("ad_sub")), tabs, msg, box);
    load();
  });

  async function load() {
    box.replaceChildren(el("p", { class: "note" }, t("m_searching")));
    try {
      // 탭 숫자를 위해 두 목록은 함께 불러 둔다
      [state.hosts, state.reports] = await Promise.all([rpc("admin_hosts", { p_filter: state.filter }), rpc("admin_report_queue")]);
      if (state.tab === "log") state.log = await rpc("admin_recent_actions");
      draw();
    } catch { box.replaceChildren(el("p", { class: "alert" }, t("ad_err_load"))); }
  }

  // 처리 버튼 공통: 확인 → 서버 호출 → 결과 문구 → 다시 불러오기
  const act = (confirmKey, fn, doneKey) => async (e) => {
    if (confirmKey && !window.confirm(t(confirmKey))) return;
    const btn = e.currentTarget; btn.disabled = true; msg.textContent = "";
    try { await fn(); msg.className = "ok"; msg.textContent = t(doneKey); await load(); }
    catch (ex) { msg.className = "err"; msg.textContent = t(/yourself/.test(ex?.message ?? "") ? "ad_err_self" : "ad_err_action"); btn.disabled = false; }
  };

  function draw() {
    const nR = state.reports?.length ?? 0;
    tabs.replaceChildren(...[["hosts", t("ad_tab_hosts")], ["reports", `${t("ad_tab_reports")}${nR ? " " + nR : ""}`], ["log", t("ad_tab_log")]].map(([k, label]) =>
      el("button", { class: "chip", type: "button", role: "tab", "aria-pressed": String(state.tab === k), onclick: async () => {
        state.tab = k; msg.textContent = "";
        if (k === "log") { box.replaceChildren(el("p", { class: "note" }, t("m_searching"))); try { state.log = await rpc("admin_recent_actions"); } catch { state.log = []; } }
        draw();
      } }, label)));
    if (state.tab === "hosts") drawHosts();
    else if (state.tab === "reports") drawReports();
    else drawLog();
  }

  // ---- 1) 현지인 신원 확인 ----
  function drawHosts() {
    const filters = el("div", { class: "chips", role: "group", "aria-label": t("ad_tab_hosts") },
      ...["waiting", "verified", "all"].map((f) => el("button", { class: "chip", type: "button", "aria-pressed": String(state.filter === f), onclick: () => { state.filter = f; load(); } }, t("ad_f_" + f))));
    const list = state.hosts ?? [];
    box.replaceChildren(filters,
      el("p", { class: "note" }, t("ad_hosts_hint")),
      ...(list.length ? list.map(hostCard) : [el("p", { class: "note" }, t("ad_hosts_none"))]));
  }

  function hostCard(h) {
    const verified = h.identity_status === "verified";
    const note = el("input", { type: "text", maxlength: "200", placeholder: t("ad_note_ph"), "aria-label": t("ad_note_ph"), class: "ad-note" });
    const langs = (h.languages ?? []).map((l) => `${langLabel(l.language)}(${t("mlv_" + l.level)})`).join(" · ");
    return el("article", { class: "sec" },
      el("div", { class: "mhead" }, initial(h.name, h.avatar_path),
        el("div", { class: "grow" },
          el("b", {}, h.name || t("ch_unknown")),
          el("div", { class: "note", style: "margin:0;word-break:break-all" }, h.email ?? ""),
          el("div", { class: "ntags", style: "margin-top:4px" },
            el("span", { class: "pill" + (verified ? " ok" : "") }, verified ? "✓ " + t("mh_status_verified") : t("ad_unverified")),
            el("span", { class: "pill" }, cityName(h.city)),
            el("span", { class: "pill" }, h.is_public ? t("ad_public") : t("ad_private")),
            h.suspended ? el("span", { class: "pill warn" }, t("ad_suspended")) : "",
            h.reports ? el("span", { class: "pill warn" }, t("ad_reports_n", { n: h.reports })) : ""))),
      h.bio ? el("p", { class: "quote", style: "margin:10px 0 6px;font-size:15px" }, h.bio) : el("p", { class: "note" }, t("ad_no_bio")),
      el("p", { class: "note", style: "margin:4px 0" }, [
        (h.interests ?? []).map((i) => t("mi_" + i)).join(", ") || "—",
        langs || "—",
        t("ad_slots_n", { n: h.slots ?? 0 }) + " · " + t("ad_reviews_n", { n: h.reviews ?? 0 }),
        h.years != null ? t("md_years", { y: h.years }) : "",
      ].filter(Boolean).join(" · ")),
      verified && h.verified_at ? el("p", { class: "note", style: "margin:0" }, t("ad_verified_at", { d: when(h.verified_at) })) : "",
      el("div", { class: "paction", style: "margin-top:10px;align-items:center" },
        note,
        verified
          ? el("button", { class: "btn ghost sm", type: "button", onclick: act("ad_c_unverify", () => rpc("admin_set_host_status", { p_user: h.user_id, p_verified: false, p_note: note.value.trim() || null }), "ad_done") }, t("ad_unverify"))
          : el("button", { class: "btn sm", type: "button", onclick: act("ad_c_verify", () => rpc("admin_set_host_status", { p_user: h.user_id, p_verified: true, p_note: note.value.trim() || null }), "ad_done") }, t("ad_verify")),
        el("button", { class: "btn ghost sm", type: "button", onclick: act(h.suspended ? null : "ad_c_suspend", () => rpc("admin_set_suspended", { p_user: h.user_id, p_on: !h.suspended, p_note: note.value.trim() || null }), "ad_done") }, h.suspended ? t("ad_unsuspend") : t("ad_suspend"))));
  }

  // ---- 2) 신고 검수 ----
  function drawReports() {
    const list = state.reports ?? [];
    box.replaceChildren(el("p", { class: "note" }, t("ad_reports_hint")),
      ...(list.length ? list.map(reportCard) : [el("p", { class: "note" }, t("ad_reports_none"))]));
  }

  function reportCard(r) {
    const d = r.detail;
    const note = el("input", { type: "text", maxlength: "200", placeholder: t("ad_note_ph"), "aria-label": t("ad_note_ph"), class: "ad-note" });
    const call = (action) => () => rpc("admin_resolve_report", { p_type: r.target_type, p_id: r.target_id, p_action: action, p_note: note.value.trim() || null });
    let preview;
    if (!d) preview = el("p", { class: "note" }, t("ad_gone"));
    else if (r.target_type === "place") preview = el("p", { style: "margin:6px 0" }, el("a", { href: `#/p/${d.place_id}` }, pick(d.name) || d.place_id));
    else if (r.target_type === "user") preview = el("p", { style: "margin:6px 0" }, el("b", {}, d.owner || t("ch_unknown")), d.is_host ? " · " + t("ad_is_host") : "", d.suspended ? " · " + t("ad_suspended") : "");
    else preview = el("div", {},
      d.body ? el("p", { class: "quote ad-body", style: "margin:6px 0" }, d.body) : "",
      el("p", { class: "note", style: "margin:0" }, [
        d.owner ? t("ad_by", { name: d.owner }) : "",
        r.target_type === "review" ? `★${d.rating}` + (d.about ? " · " + t("ad_about", { name: d.about }) : "") : "",
        r.target_type === "content" && d.place_id ? (PLACES.find((p) => p.id === d.place_id) ? pick(PLACES.find((p) => p.id === d.place_id).name) : d.place_id) : "",
        r.target_type === "content" && d.sponsored && d.sponsored !== "none" ? t("ad_sponsored") : "",
        d.sent_at ? when(d.sent_at) : "",
      ].filter(Boolean).join(" · ")));
    const status = d?.status;
    const canHide = d && ["content", "place", "review", "message"].includes(r.target_type) && status !== "hidden";
    const canSuspend = d && d.owner_id && r.target_type !== "place" && !(r.target_type === "user" && d.suspended);
    return el("article", { class: "sec" },
      el("div", { class: "nhead" },
        el("span", {}, el("span", { class: "pill" }, t("ad_t_" + r.target_type)), " ",
          status ? el("span", { class: "pill" + (status === "published" ? "" : " warn") }, t("ad_s_" + status)) : ""),
        el("b", { class: "ad-count" }, t("ad_users_n", { n: r.users }))),
      preview,
      el("p", { class: "note", style: "margin:6px 0 0" }, `${t("ad_reasons")}: ${(r.reasons ?? []).map((x) => t("report_" + x)).join(", ")} · ${t("ad_first_last", { a: when(r.first_at), b: when(r.last_at) })}`),
      el("div", { class: "paction", style: "margin-top:10px;align-items:center" },
        note,
        el("button", { class: "btn ghost sm", type: "button", onclick: act(null, call("dismiss"), "ad_done_dismiss") }, t("ad_dismiss")),
        canHide ? el("button", { class: "btn sm", type: "button", onclick: act("ad_c_hide", call("hide"), "ad_done_hide") }, t(r.target_type === "message" ? "ad_mask" : "ad_hide")) : "",
        canSuspend ? el("button", { class: "btn ghost sm warnbtn", type: "button", onclick: act("ad_c_suspend", call("suspend"), "ad_done_suspend") }, t("ad_suspend_owner")) : ""));
  }

  // ---- 3) 처리 기록 ----
  function drawLog() {
    const list = state.log ?? [];
    box.replaceChildren(...(list.length
      ? [el("ul", { class: "ad-log" }, ...list.map((a) => el("li", {},
          el("small", { class: "note", style: "margin:0" }, when(a.at)), " ",
          el("b", {}, t("ad_a_" + a.action)), ` · ${t("ad_t_" + a.target_type)} ${String(a.target_id).slice(0, 8)}`,
          a.admin ? ` · ${a.admin}` : "", a.note ? el("span", { class: "note" }, ` — ${a.note}`) : "")))]
      : [el("p", { class: "note" }, t("ad_log_none"))]));
  }

  return root;
}

// MY 화면 등에 '운영자' 바로가기를 붙인다(운영자일 때만)
export function adminShortcut() {
  const slot = el("span", { style: "display:contents" });
  amIAdmin().then((ok) => { if (ok) slot.append(el("a", { class: "btn ghost", href: "#/admin" }, t("ad_title"))); });
  return slot;
}
