// 1:1 메시지: 대화 목록(#/messages) · 대화 화면(#/messages/<대화 id>)
// 메시지는 Supabase 의 messages 표에 저장되고, 참여자만 읽고 쓸 수 있다(RLS). 새 메시지는 Realtime 으로 바로 받는다.
import { el, fmtDate } from "./util.js";
import { getLang, t } from "./i18n.js";
import { currentUserId } from "./sync.js";
import { loginGate } from "./auth.js";
import { pageHead } from "./page-head.js";
import * as api from "./match-api.js";

const POLL_MS = 15000;   // 실시간 연결이 끊겼을 때를 대비한 보조 확인 간격

// 지금 열린 대화의 구독·타이머. 다른 화면으로 가거나 다시 그릴 때 정리한다.
let active = null;
function cleanup() {
  if (!active) return;
  active.unsub?.();
  clearInterval(active.timer);
  window.removeEventListener("hashchange", active.onHash);
  active = null;
}

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const timeOf = (iso) => new Date(iso).toLocaleTimeString(getLang(), { hour: "2-digit", minute: "2-digit" });
// 목록의 시각: 오늘이면 시:분, 아니면 날짜
function shortWhen(iso) {
  const d = new Date(iso);
  return sameDay(d, new Date()) ? timeOf(iso) : d.toLocaleDateString(getLang(), { month: "short", day: "numeric" });
}
const dayKey = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function initialAvatar(name, path, size) {
  const box = el("span", { class: "avatar", style: `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px`, "aria-hidden": "true" }, (name || "?").slice(0, 1).toUpperCase());
  if (path) api.avatarUrl(path).then((u) => { if (u) box.replaceChildren(el("img", { src: u, alt: "", loading: "lazy" })); }).catch(() => {});
  return box;
}

// ============ 대화 목록 ============
export function inboxView() {
  cleanup();
  const root = el("div", { class: "onb match" });
  root.append(pageHead(t("ch_title"), t("ph_msg_sub")));
  if (!currentUserId()) { root.append(loginGate(t("ch_gate"))); return root; }
  const box = el("div", { class: "inbox", "aria-live": "polite" }, el("p", { class: "note" }, t("m_searching")));
  root.append(box, el("div", { class: "paction", style: "margin-top:12px" },
    el("a", { class: "btn ghost sm", href: "#/match-requests" }, t("m_my_requests")),
    el("a", { class: "btn ghost sm", href: "#/match" }, t("m_title"))));

  api.myConversations().then((list) => {
    if (!list.length) { box.replaceChildren(el("p", { class: "note" }, t("ch_none")), el("p", { class: "note" }, t("ch_none_hint"))); return; }
    box.replaceChildren(el("ul", { class: "convlist" }, ...list.map((c) =>
      el("li", {}, el("a", { class: "conv" + (c.unread ? " unread" : ""), href: `#/messages/${c.conversation_id}` },
        initialAvatar(c.other_name, null, 44),
        el("div", { class: "grow" },
          el("div", { class: "conv-top" }, el("b", {}, c.other_name || t("ch_unknown")), el("small", {}, shortWhen(c.last_at))),
          el("div", { class: "conv-sub" },
            el("span", { class: "conv-last" }, c.last_body ?? t("ch_no_msgs")),
            c.unread ? el("span", { class: "badge", "aria-label": t("ch_unread", { n: c.unread }) }, String(c.unread)) : ""),
          el("small", { class: "note", style: "margin:0" }, `${t("mst_" + c.request_status)} · ${fmtDate(c.meet_date)}`)))))));
  }).catch(() => box.replaceChildren(el("p", { class: "alert" }, t("ch_err_load"))));
  return root;
}

// ============ 대화 화면 ============
export function chatView(convId) {
  cleanup();
  const root = el("div", { class: "onb match chat" });
  root.append(el("a", { class: "crumb", href: "#/messages" }, t("ch_back")));
  if (!currentUserId()) { root.append(loginGate(t("ch_gate"))); return root; }
  const me = currentUserId();
  const body = el("div", {}, el("p", { class: "note" }, t("m_searching")));
  root.append(body);

  const state = { msgs: [], ids: new Set(), oldest: null, more: true, info: null, blocked: false };
  const session = { unsub: null, timer: null, onHash: null };
  active = session;
  session.onHash = () => { if (location.hash !== `#/messages/${convId}`) cleanup(); };
  window.addEventListener("hashchange", session.onHash);

  api.conversationInfo(convId).then(async (info) => {
    if (active !== session) return;
    if (!info) { body.replaceChildren(el("p", { class: "alert" }, t("ch_not_found"))); return; }
    state.info = info;
    state.blocked = await api.iBlocked(info.otherId).catch(() => false);
    const first = await api.loadMessages(convId);
    if (active !== session) return;
    add(first);
    state.more = first.length >= 50;
    build();
    api.markRead(convId).then(() => refreshUnreadBadge()).catch(() => {});
    // 실시간 구독 + 보조 확인(실시간이 막힌 환경에서도 새 메시지가 들어오게)
    session.unsub = await api.subscribeMessages(convId, (m) => { if (active === session && add([m])) { if (m.sender_id !== me) showTyping(false); drawList(true); if (m.sender_id !== me) api.markRead(convId).then(() => refreshUnreadBadge()).catch(() => {}); } }, (m) => { if (active === session) updateRead(m); }, (uid) => { if (active === session && uid && uid !== me) showTyping(true); }).catch(() => null);
    session.timer = setInterval(poll, POLL_MS);
  }).catch(() => body.replaceChildren(el("p", { class: "alert" }, t("ch_err_load"))));

  // 받은 메시지를 목록에 더한다(중복 제외). 하나라도 새로 들어갔으면 true.
  function add(list) {
    let added = false;
    for (const m of list) {
      if (state.ids.has(m.id)) continue;
      state.ids.add(m.id); state.msgs.push(m); added = true;
    }
    state.msgs.sort((a, b) => a.id - b.id);
    state.oldest = state.msgs[0]?.id ?? null;
    return added;
  }
  function updateRead(m) {
    const x = state.msgs.find((y) => y.id === m.id);
    if (x && m.read_at && !x.read_at) { x.read_at = m.read_at; drawList(false); }
  }
  async function poll() {
    if (active !== session || document.hidden) return;
    try {
      const latest = await api.loadMessages(convId, { limit: 30 });
      const newer = latest.filter((m) => !state.ids.has(m.id));
      latest.forEach((m) => { const x = state.msgs.find((y) => y.id === m.id); if (x && m.read_at) x.read_at = m.read_at; });
      if (add(newer)) { drawList(true); if (newer.some((m) => m.sender_id !== me)) api.markRead(convId).then(() => refreshUnreadBadge()).catch(() => {}); }
      else drawList(false);
    } catch { /* 다음 확인 때 다시 */ }
  }

  // 상대가 입력 중이면 점 세 개가 튀는 말풍선을 보여 준다. 신호가 4초 동안 없으면(입력을 멈췄거나 보냈으면) 사라진다.
  const TYPING_HIDE_MS = 4000, TYPING_SEND_MS = 2000;
  let typingEl, typingTimer = null, lastTypingSent = 0;
  function showTyping(on) {
    clearTimeout(typingTimer);
    if (!typingEl) return;
    typingEl.hidden = !on;
    if (on) {
      if (listBox && listBox.scrollHeight - listBox.scrollTop - listBox.clientHeight < 80) listBox.scrollTop = listBox.scrollHeight;
      typingTimer = setTimeout(() => showTyping(false), TYPING_HIDE_MS);
    }
  }
  let listBox, moreBtn, input, sendBtn, err, composer;
  function build() {
    const { info } = state;
    const r = info.req;
    const canSend = !state.blocked && ["pending", "accepted", "completed"].includes(r?.status);
    listBox = el("div", { class: "msgs", role: "log", "aria-live": "polite", "aria-label": t("ch_title") });
    moreBtn = el("button", { class: "link", type: "button", onclick: loadOlder }, t("ch_older"));
    err = el("div", { class: "err", role: "alert" });
    input = el("textarea", { id: "chatInput", rows: "2", maxlength: "2000", placeholder: t("ch_ph"), "aria-label": t("ch_ph") });
    sendBtn = el("button", { class: "btn", type: "submit" }, t("ch_send"));
    input.addEventListener("keydown", (e) => {
      // Enter 로 보내고, Shift+Enter 는 줄바꿈(한글 조합 중에는 보내지 않는다)
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); composer.requestSubmit(); }
    });
    // 입력하는 동안 2초에 한 번만 '입력 중' 신호를 보낸다(비어 있으면 보내지 않는다)
    input.addEventListener("input", () => {
      if (!input.value.trim() || Date.now() - lastTypingSent < TYPING_SEND_MS) return;
      lastTypingSent = Date.now();
      session.unsub?.typing?.();
    });
    typingEl = el("div", { class: "typing", hidden: "", role: "status", "aria-live": "polite" },
      el("span", { class: "dots", "aria-hidden": "true" }, el("i"), el("i"), el("i")),
      el("span", {}, t("ch_typing", { name: info.otherName || t("ch_unknown") })));
    composer = el("form", { class: "composer", novalidate: "", onsubmit: send }, input, sendBtn);

    const status = el("span", { class: "pill" + (r.status === "accepted" || r.status === "completed" ? " ok" : r.status === "pending" ? "" : " warn") }, t("mst_" + r.status));
    const otherLink = info.iAmHost ? el("b", {}, info.otherName || t("ch_unknown")) : el("a", { href: `#/mate/${info.otherId}` }, el("b", {}, info.otherName || t("ch_unknown")));
    const msg = el("div", { class: "ok", role: "status" });

    const blockBtn = el("button", { class: "link", type: "button" }, state.blocked ? t("ch_unblock") : t("md_block"));
    blockBtn.addEventListener("click", async () => {
      if (!state.blocked && !window.confirm(t("md_block_confirm"))) return;
      try {
        if (state.blocked) await api.unblockUser(info.otherId); else await api.blockUser(info.otherId);
        state.blocked = !state.blocked;
        // 차단하면 대기 중 요청은 서버가 취소한다 → 상태를 다시 읽어 그린다
        const fresh = await api.conversationInfo(convId).catch(() => null);
        if (fresh) state.info = fresh;
        build();
      } catch { msg.textContent = t("mq_err"); }
    });

    body.replaceChildren(
      el("div", { class: "mhead chat-head" },
        initialAvatar(info.otherName, info.otherAvatar, 48),
        el("div", { class: "grow" }, otherLink, el("div", { class: "note", style: "margin:2px 0 0" }, status, " ", fmtDate(r.meet_date), r.activity ? " · " + r.activity : ""))),
      el("p", { class: "note" }, t("ch_safety")),
      el("div", { class: "msgwrap" }, state.more ? moreBtn : "", listBox, typingEl),
      canSend ? composer : el("p", { class: "alert" }, state.blocked ? t("ch_closed_blocked") : t("ch_closed")),
      err,
      el("div", { class: "paction", style: "margin-top:10px" },
        el("a", { class: "btn ghost sm", href: "#/match-requests" }, t("m_my_requests")),
        r.status === "completed" ? el("a", { class: "btn ghost sm", href: `#/mate-review/${r.id}` }, t("rvw_write")) : "",
        el("button", { class: "link", type: "button", onclick: async () => { if (!window.confirm(t("md_report_confirm"))) return; try { await api.reportUser(info.otherId); msg.textContent = t("md_reported"); } catch { msg.textContent = t("mq_err"); } } }, t("md_report")),
        blockBtn),
      msg);
    drawList(true);
    if (canSend) input.focus({ preventScroll: true });
  }

  function bubble(m) {
    const mine = m.sender_id === me;
    const reportBtn = mine ? "" : el("button", { class: "link mini", type: "button", "aria-label": t("ch_report_msg"), onclick: async (e) => {
      if (!window.confirm(t("ch_report_msg_confirm"))) return;
      try { await api.reportTarget("message", m.id); e.target.textContent = t("ch_reported"); e.target.disabled = true; } catch { err.textContent = t("mq_err"); }
    } }, t("md_report"));
    return el("div", { class: "msg" + (mine ? " mine" : "") },
      el("div", { class: "bubble" }, m.body),
      // 내가 보낸 메시지를 상대가 아직 읽지 않았으면 읽지 않은 사람 수(1:1 이라 1)를 보여 주고, 읽으면 사라진다
      el("div", { class: "meta" }, mine && !m.read_at ? el("span", { class: "unread-n", title: t("ch_unread_by_other"), "aria-label": t("ch_unread_by_other") }, "1") : "", el("time", { datetime: m.created_at }, timeOf(m.created_at)), reportBtn));
  }

  function drawList(scrollToEnd) {
    if (!listBox) return;
    const nearEnd = listBox.scrollHeight - listBox.scrollTop - listBox.clientHeight < 80;
    const parts = [];
    let prevDay = "";
    for (const m of state.msgs) {
      const k = dayKey(m.created_at);
      if (k !== prevDay) { parts.push(el("div", { class: "dayline" }, fmtDate(k))); prevDay = k; }
      parts.push(bubble(m));
    }
    if (!parts.length) parts.push(el("p", { class: "note", style: "text-align:center" }, t("ch_empty")));
    listBox.replaceChildren(...parts);
    if (scrollToEnd || nearEnd) listBox.scrollTop = listBox.scrollHeight;
  }

  async function loadOlder() {
    if (!state.oldest) return;
    moreBtn.disabled = true;
    try {
      const older = await api.loadMessages(convId, { before: state.oldest });
      const h = listBox.scrollHeight;
      add(older);
      state.more = older.length >= 50;
      drawList(false);
      listBox.scrollTop = listBox.scrollHeight - h;     // 보던 위치 유지
      if (!state.more) moreBtn.remove();
    } catch { err.textContent = t("ch_err_load"); }
    moreBtn.disabled = false;
  }

  async function send(e) {
    e.preventDefault();
    const text = input.value.trim();
    err.textContent = "";
    if (!text) return;
    if (text.length > 2000) { err.textContent = t("ch_err_long"); return; }
    sendBtn.disabled = true;
    try {
      const saved = await api.sendMessage(convId, text);
      input.value = "";
      if (add([saved])) drawList(true);
    } catch { err.textContent = t("ch_err_send"); }
    sendBtn.disabled = false;
    input.focus();
  }

  return root;
}

// 메뉴의 '메시지' 링크 옆에 읽지 않은 수를 붙인다(로그인했을 때만)
export async function refreshUnreadBadge() {
  const links = document.querySelectorAll("[data-unread]");
  if (!links.length) return;
  const n = currentUserId() ? await api.unreadTotal() : 0;
  links.forEach((a) => {
    a.querySelector(".badge")?.remove();
    if (n > 0) a.append(el("span", { class: "badge", "aria-label": t("ch_unread", { n }) }, n > 99 ? "99+" : String(n)));
  });
}

// 다른 화면에 있어도 1분마다 읽지 않은 수를 갱신한다(창이 보일 때만)
setInterval(() => { if (!document.hidden) refreshUnreadBadge().catch(() => {}); }, 60000);
