// 로그인·회원가입: Supabase Auth(이메일 + 비밀번호, Google). 라이브러리는 필요할 때만 불러온다.
// 로그인하지 않아도 사이트의 기존 기능은 그대로 동작한다(데이터는 이 브라우저에만 저장).
import { el } from "./util.js";
import { t } from "./i18n.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
let clientPromise = null;

// Supabase 클라이언트(처음 부를 때 한 번만 만든다). 불러오지 못하면 null.
export function getClient() {
  clientPromise ??= import(LIB)
    .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, flowType: "pkce", detectSessionInUrl: true } }))
    .catch(() => null);
  return clientPromise;
}

// 시험용: 가짜 클라이언트를 끼워 넣는다(실제 서비스 코드에서는 부르지 않는다)
export function _useClientForTest(c) { clientPromise = Promise.resolve(c); }

export async function getUser() {
  const c = await getClient();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session?.user ?? null;
}

// Supabase 오류를 화면에 보여 줄 문구로 바꾼다(모르는 오류는 일반 문구 + 원문)
function errText(err) {
  const code = err?.code ?? "";
  const known = {
    invalid_credentials: "au_err_credentials", user_already_exists: "au_err_exists", weak_password: "au_err_weak",
    email_not_confirmed: "au_err_unconfirmed", over_email_send_rate_limit: "au_err_rate", over_request_rate_limit: "au_err_rate",
    email_address_invalid: "au_err_email", validation_failed: "au_err_email",
  };
  return known[code] ? t(known[code]) : `${t("au_err_generic")}${err?.message ? ` (${err.message})` : ""}`;
}

const MIN_PW = 6;
const ID_RE = /^[A-Za-z0-9_가-힣]{2,12}$/;           // 아이디(닉네임) 형식. 서버(profiles_name_format)와 같은 규칙
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Google 로 계속하기: Google 로그인 화면으로 이동했다가 이 사이트로 돌아온다. 돌아온 뒤 보던 화면으로 되돌리려고 주소의 '#...' 를 기억해 둔다.
// (Google 사용 설정은 Supabase 대시보드에서 한다. 비밀 키는 이 코드에 두지 않는다.)
const GOOGLE_G = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
function googleBlock(c, onError) {
  const btn = el("button", { class: "btn google", type: "button" });
  btn.innerHTML = GOOGLE_G;
  btn.append(el("span", {}, t("au_google")));
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try { sessionStorage.setItem("afterLogin", location.hash || "#/"); } catch { /* 저장소를 못 쓰면 홈으로 돌아온다 */ }
    const { error } = await c.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + "/" } });
    if (error) { onError?.(t("au_err_google")); btn.disabled = false; }   // 성공하면 Google 화면으로 이동한다
  });
  return el("div", { class: "oauth" }, el("div", { class: "or" }, el("span", {}, t("au_or"))), btn);
}

// 로그인 입력(이메일·비밀번호). '회원가입' 버튼은 회원가입 화면으로 보낸다.
function loginForm(c, onDone, onSignup, idPrefix, onRecover) {
  const err = el("div", { class: "err", role: "alert" });
  const email = el("input", { id: idPrefix + "Email", type: "email", autocomplete: "email", required: "", placeholder: "name@example.com" });
  const pw = el("input", { id: idPrefix + "Pw", type: "password", autocomplete: "current-password", required: "" });
  const submit = async () => {
    err.textContent = "";
    if (!email.value.trim() || !pw.value) { err.textContent = t("au_err_input"); return; }
    const { error } = await c.auth.signInWithPassword({ email: email.value.trim(), password: pw.value });
    if (error) { err.textContent = errText(error); return; }
    onDone();
  };
  return {
    email,
    el: el("form", { onsubmit: (e) => { e.preventDefault(); submit(); }, novalidate: "" },
      el("div", { class: "field" }, el("label", { for: idPrefix + "Email" }, t("au_email")), email),
      el("div", { class: "field" }, el("label", { for: idPrefix + "Pw" }, t("au_password")), pw),
      err,
      el("div", { class: "paction" },
        el("button", { class: "btn", type: "submit" }, t("me_login")),
        el("button", { class: "btn ghost", type: "button", onclick: onSignup }, t("au_signup"))),
      onRecover ? el("p", { class: "recover-links" },
        el("button", { class: "linkbtn", type: "button", onclick: () => onRecover("findId") }, t("au_find_id")),
        el("span", { "aria-hidden": "true" }, "·"),
        el("button", { class: "linkbtn", type: "button", onclick: () => onRecover("reset") }, t("au_find_pw"))) : "",
      googleBlock(c, (m) => { err.textContent = m; })),
  };
}

// 회원가입 입력(이메일·비밀번호·비밀번호 확인). 비밀번호와 확인이 같을 때만 '회원가입' 버튼이 켜진다.
function signupForm(c, onBack, idPrefix) {
  const err = el("div", { class: "err", role: "alert" });
  const msg = el("div", { class: "ok", role: "status" });
  const mismatch = el("small", { class: "err", style: "margin:0", role: "status" });
  const uid = el("input", { id: idPrefix + "Id", type: "text", autocomplete: "username", maxlength: "12", required: "", autocapitalize: "none", spellcheck: "false" });
  const uidNote = el("small", { class: "note", style: "margin:0" }, t("au_id_hint"));
  const email = el("input", { id: idPrefix + "Email", type: "email", autocomplete: "email", required: "", placeholder: "name@example.com" });
  const pw = el("input", { id: idPrefix + "Pw", type: "password", autocomplete: "new-password", required: "" });
  const pw2 = el("input", { id: idPrefix + "Pw2", type: "password", autocomplete: "new-password", required: "" });
  const go = el("button", { class: "btn", type: "submit", disabled: "" }, t("au_signup"));

  const ready = () => ID_RE.test(uid.value.trim()) && looksLikeEmail(email.value.trim()) && pw.value.length >= MIN_PW && pw.value === pw2.value;
  function refresh() {
    go.disabled = !ready();
    const id = uid.value.trim();
    uidNote.className = id && !ID_RE.test(id) ? "err" : "note";
    uidNote.textContent = id && !ID_RE.test(id) ? t("au_err_id_format") : t("au_id_hint");
    mismatch.textContent = pw2.value && pw.value !== pw2.value ? t("au_pw_mismatch") : "";
  }
  [uid, email, pw, pw2].forEach((i) => i.addEventListener("input", refresh));

  async function submit() {
    err.textContent = ""; msg.textContent = "";
    if (!ready()) return;
    go.disabled = true;
    const name = uid.value.trim();
    // 아이디가 이미 쓰이는지 먼저 확인한다(확인 함수가 아직 없는 DB에서는 건너뛴다)
    const { data: free, error: rpcErr } = await c.rpc("username_available", { p_name: name });
    if (!rpcErr && free === false) { err.textContent = t("au_err_id_taken"); refresh(); return; }
    const { data, error } = await c.auth.signUp({ email: email.value.trim(), password: pw.value, options: { data: { name } } });
    if (error) { err.textContent = errText(error); refresh(); return; }
    // 메일 확인이 켜져 있으면 세션이 아직 없다: 안내하고 입력 칸은 잠근다
    if (!data.session) { msg.textContent = t("au_check_mail"); [uid, email, pw, pw2].forEach((i) => { i.disabled = true; }); return; }
    onBack(true);                                    // 바로 로그인된 경우
  }
  return {
    email: uid,
    el: el("form", { onsubmit: (e) => { e.preventDefault(); submit(); }, novalidate: "" },
      el("div", { class: "field" }, el("label", { for: idPrefix + "Id" }, t("au_id")), uid, uidNote),
      el("div", { class: "field" }, el("label", { for: idPrefix + "Email" }, t("au_email")), email),
      el("div", { class: "field" }, el("label", { for: idPrefix + "Pw" }, t("au_password")), pw, el("small", { class: "note", style: "margin:0" }, t("au_pw_hint"))),
      el("div", { class: "field" }, el("label", { for: idPrefix + "Pw2" }, t("au_pw_confirm")), pw2, mismatch),
      err, msg,
      el("div", { class: "paction" },
        go,
        el("button", { class: "btn ghost", type: "button", onclick: () => onBack(false) }, t("au_back_login"))),
      googleBlock(c, (m) => { err.textContent = m; })),
  };
}

const isRateLimit = (e) => e && (e.code === "over_email_send_rate_limit" || e.code === "over_request_rate_limit" || e.status === 429);

// 아이디 찾기: 이메일을 넣으면 그 주소로 아이디가 담긴 메일을 보낸다(가입 여부와 상관없이 같은 안내를 보여 준다).
// 사이트는 실명을 받지 않으므로 '이름'은 따로 묻지 않고, 아이디는 그 이메일 주인에게만 보낸다. 메일 문구는 Supabase '비밀번호 재설정' 템플릿에서 정한다.
function findIdForm(c, onBack, idPrefix) {
  const err = el("div", { class: "err", role: "alert" });
  const msg = el("div", { class: "ok", role: "status" });
  const email = el("input", { id: idPrefix + "Email", type: "email", autocomplete: "email", required: "", placeholder: "name@example.com" });
  const go = el("button", { class: "btn", type: "submit" }, t("au_find_id_send"));
  return {
    email,
    el: el("form", { novalidate: "", onsubmit: async (e) => {
      e.preventDefault(); err.textContent = ""; msg.textContent = "";
      const v = email.value.trim();
      if (!looksLikeEmail(v)) { err.textContent = t("au_err_email"); return; }
      go.disabled = true;
      const { error } = await c.auth.resetPasswordForEmail(v, { redirectTo: location.origin + "/" });
      if (isRateLimit(error)) { err.textContent = errText(error); go.disabled = false; return; }
      msg.textContent = t("au_find_id_done");           // 그 밖의 오류(없는 주소 등)도 같은 안내: 가입 여부를 알려 주지 않는다
      email.disabled = true;
    } },
      el("p", { class: "note", style: "margin:0 0 4px" }, t("au_find_id_sub")),
      el("div", { class: "field" }, el("label", { for: idPrefix + "Email" }, t("au_email")), email),
      err, msg,
      el("div", { class: "paction" }, go, el("button", { class: "btn ghost", type: "button", onclick: onBack }, t("au_back_login")))),
  };
}

// 비밀번호 찾기: 아이디 + 이메일이 같은 계정이면 재설정 메일을 보낸다. 메일의 링크로 돌아오면 새 비밀번호 창이 열린다(openNewPasswordDialog).
function resetForm(c, onBack, idPrefix) {
  const err = el("div", { class: "err", role: "alert" });
  const msg = el("div", { class: "ok", role: "status" });
  const uid = el("input", { id: idPrefix + "Id", type: "text", autocomplete: "username", maxlength: "12", required: "", autocapitalize: "none", spellcheck: "false" });
  const email = el("input", { id: idPrefix + "Email", type: "email", autocomplete: "email", required: "", placeholder: "name@example.com" });
  const go = el("button", { class: "btn", type: "submit" }, t("au_reset_send"));
  return {
    email: uid,
    el: el("form", { novalidate: "", onsubmit: async (e) => {
      e.preventDefault(); err.textContent = ""; msg.textContent = "";
      const name = uid.value.trim(), mail = email.value.trim();
      if (!name || !looksLikeEmail(mail)) { err.textContent = t("au_err_reset_input"); return; }
      go.disabled = true;
      const { data: match, error: rpcErr } = await c.rpc("check_account_pair", { p_username: name, p_email: mail });
      if (rpcErr) { err.textContent = rpcErr.code === "54000" ? t("au_err_rate") : errText(rpcErr); go.disabled = false; return; }
      if (match === true) {
        const { error } = await c.auth.resetPasswordForEmail(mail, { redirectTo: location.origin + "/" });
        if (isRateLimit(error)) { err.textContent = errText(error); go.disabled = false; return; }
      }
      msg.textContent = t("au_reset_done");              // 일치 여부와 상관없이 같은 안내
      [uid, email].forEach((i) => { i.disabled = true; });
    } },
      el("p", { class: "note", style: "margin:0 0 4px" }, t("au_reset_sub")),
      el("div", { class: "field" }, el("label", { for: idPrefix + "Id" }, t("au_id")), uid),
      el("div", { class: "field" }, el("label", { for: idPrefix + "Email" }, t("au_email")), email),
      err, msg,
      el("div", { class: "paction" }, go, el("button", { class: "btn ghost", type: "button", onclick: onBack }, t("au_back_login")))),
  };
}

// 재설정 메일의 링크로 돌아왔을 때: 새 비밀번호 + 확인이 같으면 바꾼다(링크로 이미 본인 확인이 끝난 상태)
export function openNewPasswordDialog(c, onDone) {
  const dlg = el("dialog", { class: "authdlg", "aria-labelledby": "auNewPwTitle" });
  const close = () => { dlg.close(); dlg.remove(); };
  const err = el("div", { class: "err", role: "alert" });
  const msg = el("div", { class: "ok", role: "status" });
  const mismatch = el("small", { class: "err", style: "margin:0", role: "status" });
  const pw = el("input", { id: "auNewPw", type: "password", autocomplete: "new-password", required: "" });
  const pw2 = el("input", { id: "auNewPw2", type: "password", autocomplete: "new-password", required: "" });
  const go = el("button", { class: "btn", type: "submit", disabled: "" }, t("au_newpw_save"));
  const later = el("button", { class: "btn ghost", type: "button", onclick: close }, t("au_nick_later"));
  const ready = () => pw.value.length >= MIN_PW && pw.value === pw2.value;
  const refresh = () => { go.disabled = !ready(); mismatch.textContent = pw2.value && pw.value !== pw2.value ? t("au_pw_mismatch") : ""; };
  [pw, pw2].forEach((i) => i.addEventListener("input", refresh));
  const form = el("form", { novalidate: "", onsubmit: async (e) => {
    e.preventDefault(); err.textContent = "";
    if (!ready()) return;
    go.disabled = true;
    const { error } = await c.auth.updateUser({ password: pw.value });
    if (error) { err.textContent = errText(error); refresh(); return; }
    msg.textContent = t("au_newpw_done"); [pw, pw2].forEach((i) => { i.disabled = true; });
    go.hidden = true; later.textContent = t("au_close");
    onDone?.();
  } },
    el("p", { class: "note", style: "margin:0 0 4px" }, t("au_newpw_sub")),
    el("div", { class: "field" }, el("label", { for: "auNewPw" }, t("au_newpw")), pw, el("small", { class: "note", style: "margin:0" }, t("au_pw_hint"))),
    el("div", { class: "field" }, el("label", { for: "auNewPw2" }, t("au_pw_confirm")), pw2, mismatch),
    err, msg,
    el("div", { class: "paction" }, go, later));
  dlg.append(el("div", { class: "authdlg-head" }, el("h2", { id: "auNewPwTitle" }, t("au_newpw_title"))), form);
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  document.body.append(dlg);
  dlg.showModal();
  pw.focus();
}

// 로그인 창(회원가입·아이디 찾기·비밀번호 찾기 화면으로 바꿔 보여 줄 수 있다). mode: "login" | "signup" | "findId" | "reset"
function openAuthDialog(c, onChange, mode = "login", reason = "") {
  const dlg = el("dialog", { class: "authdlg", "aria-labelledby": "auDlgTitle" });
  const close = () => { dlg.close(); dlg.remove(); };
  function show(view) {
    const done = () => { close(); onChange(); };
    const form = view === "signup" ? signupForm(c, (loggedIn) => (loggedIn ? done() : show("login")), "auS")
      : view === "findId" ? findIdForm(c, () => show("login"), "auF")
      : view === "reset" ? resetForm(c, () => show("login"), "auR")
      : loginForm(c, done, () => show("signup"), "auD", show);
    dlg.replaceChildren(
      el("div", { class: "authdlg-head" },
        el("h2", { id: "auDlgTitle" }, view === "signup" ? t("au_signup") : view === "findId" ? t("au_find_id") : view === "reset" ? t("au_find_pw") : t("au_dlg_title")),
        el("button", { class: "authdlg-x", type: "button", "aria-label": t("au_close"), onclick: close }, "×")),
      view === "login" && reason ? el("p", { class: "note", style: "margin:0 0 4px" }, reason) : "",
      form.el);
    form.email.focus();
  }
  // 바깥(어두운 부분)을 누르거나 Esc 를 누르면 닫힌다
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  document.body.append(dlg);
  dlg.showModal();
  show(mode);
}

// MY 화면에 들어가는 로그인 영역. onChange 는 로그인 상태가 바뀐 뒤 화면을 다시 그리는 함수.
export function authSection(onChange) {
  const box = el("section", { class: "sec" });
  async function draw() {
    const c = await getClient();
    if (!c) { box.replaceChildren(el("p", { class: "note", style: "margin:0" }, t("au_offline"))); return; }
    const user = await getUser();
    if (user) {
      const { data: prof } = await c.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      const nick = prof?.display_name ?? "";
      box.replaceChildren(
        el("div", { class: "author" }, el("span", { class: "pill ok" }, t("au_signed_in"))),
        nick ? el("p", { style: "margin:0 0 4px;font-weight:700" }, nick)
             : el("p", { style: "margin:0 0 8px" }, el("span", { class: "note", style: "margin:0 8px 0 0" }, t("au_nick_none")), el("button", { class: "btn ghost sm", type: "button", onclick: () => openNicknameDialog(c, user.id, () => { draw(); onChange?.(); }) }, t("au_nick_set"))),
        el("p", { style: "margin:0 0 12px;word-break:break-all" }, user.email),
        el("p", { class: "note", style: "margin:0 0 12px" }, t("au_note_signed_in")),
        el("button", { class: "btn ghost", type: "button", onclick: async () => { await c.auth.signOut(); onChange(); } }, t("au_logout")));
      return;
    }
    box.replaceChildren(
      el("div", { class: "author" }, el("span", { class: "pill" }, t("me_guest"))),
      loginForm(c, onChange, () => openAuthDialog(c, onChange, "signup"), "au", (v) => openAuthDialog(c, onChange, v)).el);
  }
  draw();
  return box;
}

// ---------- 헤더의 계정 아이콘: 로그인 전이면 로그인 창, 로그인 후면 MY 화면으로 ----------
// 회원만 쓸 수 있는 기능 자리에 놓는 안내 상자: 설명 + 로그인 버튼(누르면 로그인 창이 열린다)
export function loginGate(text, onChange) {
  const box = el("div", { class: "sec gate" },
    el("p", { style: "margin:0 0 12px" }, text),
    el("button", { class: "btn", type: "button", onclick: async () => {
      const c = await getClient();
      if (c) openAuthDialog(c, onChange ?? (() => window.dispatchEvent(new HashChangeEvent("hashchange"))));
    } }, t("me_login")));
  return box;
}

// 비회원이 회원 전용 기능(저장 등)을 눌렀을 때: 이유와 함께 로그인 창을 연다
export async function promptLogin(reason, onChange) {
  const c = await getClient();
  if (c) openAuthDialog(c, onChange ?? (() => window.dispatchEvent(new HashChangeEvent("hashchange"))), "login", reason);
}

// ---------- 닉네임(아이디) 정하기: Google 로 처음 들어온 사람은 닉네임이 비어 있다 ----------
function openNicknameDialog(c, userId, onDone) {
  const dlg = el("dialog", { class: "authdlg", "aria-labelledby": "auNickTitle" });
  const close = () => { dlg.close(); dlg.remove(); };
  const input = el("input", { id: "auNick", type: "text", maxlength: "12", autocomplete: "nickname", autocapitalize: "none", spellcheck: "false" });
  const hint = el("small", { class: "note", style: "margin:0" }, t("au_id_hint"));
  const err = el("div", { class: "err", role: "alert" });
  const save = el("button", { class: "btn", type: "submit", disabled: "" }, t("au_nick_save"));
  input.addEventListener("input", () => {
    const v = input.value.trim();
    save.disabled = !ID_RE.test(v);
    hint.className = v && !ID_RE.test(v) ? "err" : "note";
    hint.textContent = v && !ID_RE.test(v) ? t("au_err_id_format") : t("au_id_hint");
  });
  const form = el("form", { novalidate: "", onsubmit: async (e) => {
    e.preventDefault(); err.textContent = "";
    const name = input.value.trim();
    if (!ID_RE.test(name)) return;
    save.disabled = true;
    const { data: free, error: rpcErr } = await c.rpc("username_available", { p_name: name });
    if (!rpcErr && free === false) { err.textContent = t("au_err_id_taken"); save.disabled = false; return; }
    const { error } = await c.from("profiles").update({ display_name: name }).eq("id", userId);
    if (error) { err.textContent = error.code === "23505" ? t("au_err_id_taken") : t("au_err_generic"); save.disabled = false; return; }
    close(); onDone?.();
  } },
    el("div", { class: "field" }, el("label", { for: "auNick" }, t("au_id")), input, hint),
    err,
    el("div", { class: "paction" }, save, el("button", { class: "btn ghost", type: "button", onclick: close }, t("au_nick_later"))));
  dlg.append(el("div", { class: "authdlg-head" }, el("h2", { id: "auNickTitle" }, t("au_nick_title"))), el("p", { class: "note", style: "margin:0 0 4px" }, t("au_nick_sub")), form);
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  document.body.append(dlg);
  dlg.showModal();
  input.focus();
}

// 로그인한 직후: Google 로 돌아왔다면 보던 화면으로 되돌리고, 닉네임이 비어 있으면 한 번(접속당) 정하게 한다.
async function afterSignIn(onChange) {
  try {
    const back = sessionStorage.getItem("afterLogin");
    if (back) { sessionStorage.removeItem("afterLogin"); if (location.hash !== back) location.hash = back; }
  } catch { /* 저장소를 못 쓰면 그대로 둔다 */ }
  try { if (sessionStorage.getItem("nickAsked")) return; } catch { /* 계속 */ }
  const c = await getClient();
  const user = await getUser();
  if (!c || !user) return;
  const { data } = await c.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
  if (data && data.display_name === "") {
    try { sessionStorage.setItem("nickAsked", "1"); } catch { /* 계속 */ }
    openNicknameDialog(c, user.id, () => onChange?.());
  }
}

export function initAccountButton(onChange) {
  const link = document.getElementById("acctLink");
  if (!link) return;
  link.addEventListener("click", async (e) => {
    e.preventDefault();                              // 이동할지 창을 열지는 로그인 상태를 보고 정한다
    const c = await getClient();
    if (!c || (await getUser())) { location.hash = "#/me"; return; }   // 서비스에 못 닿거나 이미 로그인: MY 화면으로
    openAuthDialog(c, onChange);
  });
  // 로그인 상태를 아이콘에 표시(색이 채워진다)
  getClient().then((c) => c?.auth.onAuthStateChange((event, session) => {
    link.classList.toggle("in", !!session);
    if (event === "PASSWORD_RECOVERY") setTimeout(() => openNewPasswordDialog(c, onChange), 0);   // 재설정 메일의 링크로 들어온 경우
    if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) setTimeout(() => afterSignIn(onChange), 0);   // 이 콜백 안에서는 서버를 바로 부르지 않는다
  }));
}
