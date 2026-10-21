// 내 현지인 프로필: 소개·관심사·언어·가능 시간을 서버에 저장한다. 신원 확인은 운영자가 하고, 확인된 뒤 공개한 프로필만 추천에 나온다.
import { el, fmtDate } from "./util.js";
import { getLang, t, LANGS } from "./i18n.js";
import { CITIES, NEIGHBORHOODS, PLACES } from "./data.js";
import { pick } from "./util.js";
import { currentUserId } from "./sync.js";
import { loginGate } from "./auth.js";
import { compressImage } from "./photo-db.js";
import * as api from "./match-api.js";

const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const cityName = (id) => { const c = CITIES.find((x) => x.id === id); return c ? (c.name[getLang()] ?? c.name.en) : id; };
const nbName = (n) => (getLang() === "ko" ? n.name.ko : n.name.en);
const hhmm = (s) => String(s).slice(0, 5);

function chip(label, pressed, onclick) { return el("button", { class: "chip", type: "button", "aria-pressed": String(pressed), onclick }, label); }
function multiChips(options, list, labelOf) {
  const wrap = el("div", { class: "chips", role: "group" });
  const draw = () => wrap.replaceChildren(...options.map((o) => chip(labelOf(o), list.includes(o), () => { const i = list.indexOf(o); if (i >= 0) list.splice(i, 1); else list.push(o); draw(); })));
  draw();
  return wrap;
}

export function matchProfileView() {
  const root = el("div", { class: "onb match" });
  root.append(el("h1", {}, t("mh_title")), el("p", { class: "hint" }, t("mh_sub")));
  if (!currentUserId()) { root.append(loginGate(t("mh_gate"))); return root; }
  const body = el("div", {}, el("p", { class: "note" }, t("m_searching")));
  root.append(body);
  api.loadMyHost().then((data) => draw(body, data)).catch(() => body.replaceChildren(el("p", { class: "alert" }, t("m_err_server"))));
  return root;
}

function draw(body, data) {
  const h = data.host;
  const d = {
    city: h?.home_city_id ?? "", bio: h?.bio ?? "", years: h?.years_in_city ?? "", nbs: [...(h?.activity_nbs ?? [])], places: [...(h?.recommended_places ?? [])],
    styles: [...(h?.travel_styles ?? [])], exchanges: [...(h?.exchange_modes ?? [])], duration: h?.duration_hours ?? "", cost: h?.cost_note ?? "", isPublic: !!h?.is_public,
    interests: [...data.interests], langs: Object.fromEntries(data.languages.map((l) => [l.language, l.level])),
  };
  const err = el("div", { class: "err", role: "alert" });
  const ok = el("div", { class: "ok", role: "status" });

  // 상태 안내
  const verified = h?.identity_status === "verified";
  const status = el("div", { class: "alert" }, verified ? "✓ " + t("mh_status_verified") : t("mh_status_none"));

  // 사진
  const avatarBox = el("span", { class: "avatar", style: "width:72px;height:72px;font-size:30px" }, (data.profile?.display_name || "?").slice(0, 1).toUpperCase());
  if (data.profile?.avatar_path) api.avatarUrl(data.profile.avatar_path).then((u) => { if (u) avatarBox.replaceChildren(el("img", { src: u, alt: "" })); });
  const photoMsg = el("div", { class: "err", role: "alert" });
  const file = el("input", { type: "file", accept: "image/*", hidden: "" });
  file.addEventListener("change", async () => {
    photoMsg.textContent = "";
    const f = file.files[0]; file.value = "";
    if (!f) return;
    try {
      const blob = await compressImage(f, 480, 0.82);
      await api.uploadAvatar(blob);
      avatarBox.replaceChildren(el("img", { src: URL.createObjectURL(blob), alt: "" }));
    } catch { photoMsg.textContent = t("mh_photo_fail"); }
  });

  // 도시에 따라 동네·장소 선택지가 바뀐다
  const citySel = el("select", { id: "mhCity" }, el("option", { value: "" }, "—"), ...CITIES.filter((c) => c.status === "open").map((c) => el("option", { value: c.id }, cityName(c.id))));
  citySel.value = d.city;
  const nbBox = el("div"), placeBox = el("div");
  function drawCityParts() {
    const nbs = NEIGHBORHOODS.filter((n) => n.city === d.city);
    d.nbs = d.nbs.filter((id) => nbs.some((n) => n.id === id));
    nbBox.replaceChildren(multiChips(nbs.map((n) => n.id), d.nbs, (id) => nbName(nbs.find((n) => n.id === id))));
    const places = PLACES.filter((p) => nbs.some((n) => n.id === p.nb));
    d.places = d.places.filter((id) => places.some((p) => p.id === id));
    placeBox.replaceChildren(multiChips(places.map((p) => p.id), d.places, (id) => pick(places.find((p) => p.id === id).name)));
  }
  citySel.addEventListener("change", () => { d.city = citySel.value; drawCityParts(); });
  drawCityParts();

  const bio = el("textarea", { id: "mhBio", rows: "4", maxlength: "800" }); bio.value = d.bio;
  bio.addEventListener("input", () => { d.bio = bio.value; });
  const years = el("input", { id: "mhYears", type: "number", min: "0", max: "80", value: String(d.years) });
  years.addEventListener("input", () => { d.years = years.value; });
  const duration = el("input", { id: "mhDur", type: "number", min: "1", max: "12", value: String(d.duration) });
  duration.addEventListener("input", () => { d.duration = duration.value; });
  const cost = el("input", { id: "mhCost", type: "text", maxlength: "300", placeholder: t("mh_cost_ph"), value: d.cost });
  cost.addEventListener("input", () => { d.cost = cost.value; });

  // 관심사(분류별)
  const interestGroups = api.INTEREST_GROUPS.map(([cat, ids]) => el("div", { class: "igroup" }, el("div", { class: "igroup-title" }, t("mc_" + cat)), multiChips(ids, d.interests, (id) => t("mi_" + id))));

  // 언어: 쓰는 언어를 고르고 숙련도를 정한다
  const langBox = el("div");
  function drawLangs() {
    langBox.replaceChildren(...api.HOST_LANGS.map((code) => {
      const on = d.langs[code] !== undefined;
      const sel = el("select", { "aria-label": t("mh_langs"), ...(on ? {} : { hidden: "" }) }, ...api.LEVELS.map((lv) => el("option", { value: lv }, t("mlv_" + lv))));
      sel.value = d.langs[code] ?? "conversational";
      sel.addEventListener("change", () => { d.langs[code] = sel.value; });
      return el("div", { class: "langrow" }, chip(LANGS.find((l) => l.code === code)?.label ?? code, on, () => { if (on) delete d.langs[code]; else d.langs[code] = "conversational"; drawLangs(); }), sel);
    }));
  }
  drawLangs();

  // 가능한 날짜·시간
  const slotList = el("div");
  const slotErr = el("div", { class: "err", role: "alert" });
  const sDay = el("input", { type: "date", min: todayIso(), "aria-label": t("mh_slots") });
  const sFrom = el("input", { type: "time", value: "10:00", "aria-label": t("mr_time_from") });
  const sTo = el("input", { type: "time", value: "13:00", "aria-label": t("mr_time_to") });
  let slots = [...data.slots];
  function drawSlots() {
    slotList.replaceChildren(...(slots.length ? [el("ul", { class: "slots" }, ...slots.map((s) => el("li", {},
      `${fmtDate(s.day)} ${hhmm(s.start_time)}–${hhmm(s.end_time)}`, s.is_booked ? el("span", { class: "pill warn", style: "margin-left:8px" }, t("mh_slot_booked")) : el("button", { class: "link", type: "button", style: "margin-left:8px",
        onclick: async () => { try { await api.removeSlot(s.id); slots = slots.filter((x) => x.id !== s.id); drawSlots(); } catch { slotErr.textContent = t("mh_err_generic"); } } }, t("mh_slot_remove")))))] : [el("p", { class: "note", style: "margin:0" }, t("mh_slot_none"))]));
  }
  drawSlots();
  const addSlotBtn = el("button", { class: "btn ghost sm", type: "button", onclick: async () => {
    slotErr.textContent = "";
    if (!sDay.value || sDay.value < todayIso() || !sFrom.value || !sTo.value || sTo.value <= sFrom.value) { slotErr.textContent = t("mh_err_slot"); return; }
    try { await api.addSlot(sDay.value, sFrom.value, sTo.value); slots = (await api.loadMyHost()).slots; drawSlots(); } catch (e) { slotErr.textContent = /duplicate|unique/.test(String(e?.message)) ? t("mh_err_slot") : t("mh_err_generic"); }
  } }, t("mh_add_slot"));

  const saveBtn = el("button", { class: "btn grow", type: "submit" }, t("mh_save"));
  const form = el("form", {
    novalidate: "",
    onsubmit: async (e) => {
      e.preventDefault(); err.textContent = ""; ok.textContent = "";
      if (!d.city) { err.textContent = t("mh_err_city"); return; }
      if (!d.interests.length) { err.textContent = t("mh_err_interest"); return; }
      if (!Object.keys(d.langs).length) { err.textContent = t("mh_err_lang"); return; }
      saveBtn.disabled = true; saveBtn.textContent = t("mh_saving");
      try {
        // 신청하면 곧 공개 상태가 된다(추천에는 운영자 신원 확인이 끝난 뒤부터 나온다)
        await api.saveMyHost({ ...d, isPublic: true, languages: Object.entries(d.langs).map(([language, level]) => ({ language, level })) });
        const fresh = await api.loadMyHost();
        draw(body, fresh);     // '신청 완료' 화면으로 바꾸고 일정 추가를 연다
        return;
      } catch { err.textContent = t("mh_err_generic"); }
      saveBtn.disabled = false; saveBtn.textContent = t("mh_save");
    },
  },
  el("section", { class: "sec" },
    el("div", { class: "mhead" }, avatarBox, el("div", { class: "grow" }, el("b", {}, data.profile?.display_name || ""), el("div", { class: "note", style: "margin:0" }, t("mh_name")),
      el("button", { class: "btn ghost sm", type: "button", style: "margin-top:6px", onclick: () => file.click() }, t("mh_photo_pick")), file)), photoMsg),
  el("section", { class: "sec" },
    el("div", { class: "field" }, el("label", { for: "mhCity" }, t("mh_city")), citySel),
    el("div", { class: "field" }, el("label", { for: "mhBio" }, t("mh_intro")), bio),
    el("div", { class: "row2" }, el("div", { class: "field" }, el("label", { for: "mhYears" }, t("mh_years")), years), el("div", { class: "field" }, el("label", { for: "mhDur" }, t("mh_duration")), duration)),
    el("div", { class: "field" }, el("label", {}, t("mh_nbs")), nbBox),
    el("div", { class: "field" }, el("label", {}, t("mh_places")), placeBox)),
  el("section", { class: "sec" }, el("h2", {}, t("mh_interests")), ...interestGroups),
  el("section", { class: "sec" },
    el("div", { class: "field" }, el("label", {}, t("mh_langs")), langBox),
    el("div", { class: "field" }, el("label", {}, t("mh_styles")), multiChips(api.STYLES, d.styles, (o) => t("ms_" + o))),
    el("div", { class: "field" }, el("label", {}, t("mh_exchange")), multiChips(api.EXCHANGES, d.exchanges, (o) => t("mx_" + o))),
    el("div", { class: "field" }, el("label", { for: "mhCost" }, t("mh_cost")), cost)),
  err, ok,
  el("div", { class: "actions" }, saveBtn));

  // 호스트 신청 취소(프로필을 저장한 적이 있을 때만)
  const withdrawMsg = el("div", { class: "err", role: "alert" });
  const withdrawBtn = el("button", { class: "btn ghost sm", type: "button" }, t("mh_withdraw"));
  withdrawBtn.addEventListener("click", async () => {
    withdrawMsg.textContent = "";
    if (!window.confirm(t("mh_withdraw_confirm"))) return;
    withdrawBtn.disabled = true;
    try {
      const r = await api.withdrawHost();
      const fresh = await api.loadMyHost();
      draw(body, fresh);
      const done = el("div", { class: "ok", role: "status" }, t(r === "hidden" ? "mh_withdrawn_hidden" : "mh_withdrawn_deleted"));
      body.prepend(done);
    } catch (e) {
      withdrawMsg.textContent = /accepted meetings/.test(String(e?.message)) ? t("mh_err_withdraw_accepted") : t("mh_err_generic");
      withdrawBtn.disabled = false;
    }
  });

  // 신청 완료 상태: 입력 칸은 숨기고 신청 내용만 보여 준다. 취소하면 비공개로 돌아가 입력 칸이 다시 나온다.
  const applied = !!h && h.is_public;
  const appliedCard = el("section", { class: "sec" },
    el("h2", {}, "✓ " + t("mh_applied")),
    el("p", { class: "note", style: "margin-top:0" }, t("mh_applied_hint")),
    el("div", { class: "mhead" }, avatarBox, el("div", { class: "grow" }, el("b", {}, data.profile?.display_name || ""),
      el("div", { class: "note", style: "margin:2px 0 0" }, cityName(d.city)))),
    d.interests.length ? el("div", { class: "chips" }, ...d.interests.map((id) => el("span", { class: "pill" }, t("mi_" + id)))) : "",
    el("div", { style: "margin-top:12px" }, withdrawBtn), withdrawMsg);

  body.replaceChildren(
    applied ? status : "",
    applied ? appliedCard : form,
    applied ? el("section", { class: "sec" }, el("h2", {}, t("mh_slots")), slotList, el("div", { class: "row3" }, sDay, sFrom, sTo, addSlotBtn), slotErr) : "",
    el("div", { class: "paction" }, el("a", { class: "btn ghost sm", href: "#/match" }, t("md_back")), el("a", { class: "btn ghost sm", href: "#/match-requests" }, t("m_my_requests"))));
}
