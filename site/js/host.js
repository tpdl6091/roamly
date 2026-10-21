// 호스트 센터: 호스트 가입·프로필, 프로그램 만들기·수정, 받은 신청 수락·거절
import { el, pick } from "./util.js";
import { LANGS, getLang, t } from "./i18n.js";
import { CITIES, NEIGHBORHOODS, TASTE_TAGS } from "./data.js";
import { PROGRAM_TYPES, PROGRAM_REVIEWS, HOSTS } from "./data-programs.js";
import {
  getMyHost, setMyHost, getMyPrograms, setMyPrograms, getInbox, setInbox, hostById, isPublic,
  sessionsOf, seatsLeft, fmtDay, todayIso, reviewsOfProgram,
} from "./programs.js";

const MAX_SESSIONS = 5;
const cityName = (id) => { const c = CITIES.find((x) => x.id === id); return c ? (c.name[getLang()] ?? c.name.en) : id; };
const nbLabel = (n) => (getLang() === "ko" ? n.name.ko : n.name.en);
const openCities = () => CITIES.filter((c) => c.status === "open");

// 시연용 신청자(가상 인물)
const SAMPLE_APPLICANTS = [
  { name: "Alex", languages: ["en"], message: { en: "Hi! I'm travelling alone for 5 days and would love to join.", ko: "안녕하세요! 5일째 혼자 여행 중인데 함께하고 싶어요.", ja: "こんにちは！5日間ひとり旅中で、ぜひ参加したいです。" } },
  { name: "Sakura", languages: ["ja", "en"], message: { ja: "ひとり旅の初日です。よろしくお願いします。", ko: "혼자 여행 첫날이에요. 잘 부탁드려요.", en: "It's my first day travelling solo. Nice to meet you." } },
  { name: "Lucía", languages: ["es", "en"], message: { es: "¡Hola! Me encantan los mercados, ¿puedo unirme?", ko: "안녕하세요! 시장을 좋아하는데 함께해도 될까요?", en: "Hi! I love markets, may I join?" } },
];

function chipGroup(options, selected, labelOf, onChange) {
  const box = el("div", { class: "chips", role: "group" });
  const draw = () => box.replaceChildren(...options.map((o) => el("button", {
    class: "chip", type: "button", "aria-pressed": String(selected.includes(o)),
    onclick: () => { const i = selected.indexOf(o); if (i >= 0) selected.splice(i, 1); else selected.push(o); draw(); onChange?.(); },
  }, labelOf(o))));
  draw();
  return box;
}

// ---------- 호스트 센터 ----------
export function hostCenterView(onChange) {
  const host = getMyHost();
  if (!host) return hostFormView(onChange, true);
  const me = hostById("me");
  const programs = getMyPrograms();
  const inbox = getInbox();
  const myProgramIds = new Set(programs.map((p) => p.id));

  function demoInbox() {
    // 내 프로그램 중 남은 자리가 있는 첫 날짜에 가상 신청 1건을 만든다
    for (const p of programs.map((x) => ({ ...x, host: "me" }))) {
      for (const s of sessionsOf(p)) {
        if (seatsLeft(p, s, s.date) > 0) {
          const a = SAMPLE_APPLICANTS[inbox.length % SAMPLE_APPLICANTS.length];
          setInbox([...inbox, { id: "i" + Date.now().toString(36), program: p.id, session: s.id, date: s.date, time: s.time,
            applicant: { name: a.name, languages: a.languages }, message: a.message, status: "requested", createdAt: new Date().toISOString() }]);
          onChange();
          return;
        }
      }
    }
  }
  const setStatus = (id, status) => { setInbox(getInbox().map((r) => (r.id === id ? { ...r, status } : r))); onChange(); };

  const reviews = programs.flatMap((p) => reviewsOfProgram(p.id).map((r) => ({ ...r, program: p })));

  return el("div", { class: "onb" },
    el("h1", {}, t("hc_title")),
    el("section", { class: "sec" },
      el("div", { class: "author" },
        el("span", { class: "pill " + (me.role === "local" ? "ok" : "") }, t("host_" + me.role)),
        me.verified ? el("span", { class: "pill ok" }, "✓ " + t("hc_verified"))
          : me.role === "local" ? el("span", { class: "pill warn" }, t("hc_verify_pending")) : ""),
      el("b", { style: "font-size:20px" }, pick(me.name)),
      el("p", { class: "note", style: "margin:4px 0 0" }, [cityName(me.city), me.nb ? nbLabel(NEIGHBORHOODS.find((n) => n.id === me.nb)) : "", me.years ? t("host_years", { y: me.years }) : ""].filter(Boolean).join(" · ")),
      me.role === "local" && !me.verified ? el("p", { class: "note" }, t("hc_verify_note")) : "",
      el("div", { class: "paction", style: "margin-top:10px" },
        el("a", { class: "btn ghost sm", href: "#/host-edit" }, t("hc_edit_profile")),
        me.role === "local" && !me.verified
          ? el("button", { class: "btn ghost sm", type: "button", onclick: () => { setMyHost({ ...getMyHost(), verified: true }); onChange(); } }, t("hc_demo_verify")) : "")),

    el("div", { class: "city-head" }, el("h2", { class: "section-title", style: "margin:16px 0 8px" }, t("hc_my_programs")),
      el("a", { class: "btn sm", href: "#/program-edit/new" }, t("hc_new_program"))),
    programs.length ? el("div", { class: "ngrid" }, ...programs.map((p) => {
      const pub = isPublic({ ...p, host: "me" });
      return el("div", { class: "pcard" },
        el("div", { class: "nhead" }, el("a", { href: `#/program/${p.id}` }, el("b", {}, pick(p.title))),
          el("span", { class: "pill " + (pub ? "ok" : "warn") }, pub ? t("hc_status_public") : t("hc_status_hidden"))),
        el("div", { class: "ntags", style: "margin:6px 0" }, el("span", { class: "pill" }, t("ptype_" + p.type)), el("span", { class: "pill" }, cityName(p.city)),
          el("span", { class: "pill" }, t("pg_seats", { n: p.capacity }))),
        el("p", { class: "note", style: "margin:0 0 8px" }, sessionsOf({ ...p }).map((s) => `${fmtDay(s.date)} ${s.time}`).join(" · ")),
        el("div", { class: "paction" },
          el("a", { class: "btn ghost sm", href: `#/program-edit/${p.id}` }, t("hc_edit")),
          el("button", { class: "btn ghost sm", type: "button", onclick: () => {
            if (!window.confirm(t("hc_delete_confirm"))) return;
            setMyPrograms(getMyPrograms().filter((x) => x.id !== p.id));
            setInbox(getInbox().filter((x) => x.program !== p.id));
            onChange();
          } }, t("hc_delete"))));
    })) : el("p", { class: "note" }, t("hc_no_programs")),

    el("h2", { class: "section-title" }, t("hc_inbox")),
    ...(inbox.filter((r) => myProgramIds.has(r.program)).length
      ? inbox.filter((r) => myProgramIds.has(r.program)).map((r) => {
        const p = programs.find((x) => x.id === r.program);
        return el("section", { class: "sec" },
          el("div", { class: "nhead" }, el("b", {}, t("hc_from", { name: r.applicant.name })),
            el("span", { class: "pill " + (r.status === "accepted" ? "ok" : r.status === "declined" ? "warn" : "") },
              r.status === "requested" ? t("rq_requested") : t("hc_" + r.status))),
          el("p", { class: "note", style: "margin:4px 0" }, `${pick(p.title)} · ${fmtDay(r.date)} ${r.time}`),
          el("p", { class: "quote", style: "font-size:15px" }, pick(r.message)),
          r.status === "requested" ? el("div", { class: "paction" },
            el("button", { class: "btn sm", type: "button", onclick: () => setStatus(r.id, "accepted") }, t("hc_accept")),
            el("button", { class: "btn ghost sm", type: "button", onclick: () => setStatus(r.id, "declined") }, t("hc_decline"))) : "");
      })
      : [el("p", { class: "note" }, t("hc_no_inbox"))]),
    programs.length ? el("div", { class: "paction" }, el("button", { class: "btn ghost sm", type: "button", onclick: demoInbox }, t("hc_demo_inbox"))) : "",
    el("p", { class: "note" }, t("hc_inbox_note")),

    el("h2", { class: "section-title" }, t("hc_my_reviews")),
    ...(reviews.length ? reviews.map((r) => el("div", { class: "sec" },
      el("b", {}, "★".repeat(r.rating) + "☆".repeat(5 - r.rating)), el("span", { class: "note", style: "margin:0 0 0 8px" }, r.at),
      el("p", { class: "quote", style: "font-size:15px;margin-top:6px" }, pick(r.text))))
      : [el("p", { class: "note" }, t("hc_no_reviews"))]));
}

// ---------- 호스트 가입·프로필 수정 ----------
export function hostFormView(onChange, isNew) {
  const cur = getMyHost();
  const form = {
    role: cur?.role ?? "local", name: cur?.name ?? "", city: cur?.city ?? openCities()[0].id, nb: cur?.nb ?? "",
    years: cur?.years ?? 1, languages: [...(cur?.languages ?? [getLang()])], interests: [...(cur?.interests ?? [])], bio: cur?.bio ?? "",
  };
  const err = el("div", { class: "err", role: "alert" });
  const roleBox = el("div", { class: "radios", role: "radiogroup", "aria-label": t("hc_role") },
    ...["local", "traveler"].map((r) => {
      const input = el("input", { type: "radio", name: "hcRole", id: "role_" + r, value: r });
      input.checked = form.role === r;
      input.addEventListener("change", () => { form.role = r; yearsField.hidden = r !== "local"; });
      return el("div", { class: "check" }, input, el("label", { for: "role_" + r }, t("hc_role_" + r)));
    }));
  const name = el("input", { id: "hcName", type: "text", maxlength: "30", value: form.name });
  name.addEventListener("input", () => { form.name = name.value; });
  const citySel = el("select", { id: "hcCity" }, ...openCities().map((c) => el("option", { value: c.id }, c.name[getLang()] ?? c.name.en)));
  citySel.value = form.city;
  const nbSel = el("select", { id: "hcNb" });
  const fillNb = () => {
    nbSel.replaceChildren(el("option", { value: "" }, t("hc_none")),
      ...NEIGHBORHOODS.filter((n) => n.city === form.city).map((n) => el("option", { value: n.id }, nbLabel(n))));
    if (!NEIGHBORHOODS.some((n) => n.id === form.nb && n.city === form.city)) form.nb = "";
    nbSel.value = form.nb;
  };
  fillNb();
  citySel.addEventListener("change", () => { form.city = citySel.value; fillNb(); });
  nbSel.addEventListener("change", () => { form.nb = nbSel.value; });
  const years = el("input", { id: "hcYears", type: "number", min: "0", max: "80", value: String(form.years) });
  years.addEventListener("input", () => { form.years = Math.max(0, Math.min(80, Number(years.value) || 0)); });
  const yearsField = el("div", { class: "field" }, el("label", { for: "hcYears" }, t("hc_years")), years);
  yearsField.hidden = form.role !== "local";
  const bio = el("textarea", { id: "hcBio", rows: "4", maxlength: "500", placeholder: t("hc_bio_ph") });
  bio.value = form.bio;
  bio.addEventListener("input", () => { form.bio = bio.value; });
  const field = (label, control, id) => el("div", { class: "field" }, el("label", { for: id }, label), control);

  return el("div", { class: "onb" },
    el("a", { class: "crumb", href: isNew ? "#/programs" : "#/host-center" }, "←"),
    el("h1", {}, isNew ? t("hc_become") : t("hc_edit_profile")),
    isNew ? el("p", { class: "note", style: "margin-top:0" }, t("hc_intro")) : "",
    el("form", {
      onsubmit: (e) => {
        e.preventDefault();
        if (!form.name.trim()) { err.textContent = t("hc_err_name"); return; }
        if (!form.languages.length) { err.textContent = t("hc_err_langs"); return; }
        if (form.bio.trim().length < 10) { err.textContent = t("hc_err_bio"); return; }
        setMyHost({
          role: form.role, name: form.name.trim(), city: form.city, nb: form.nb, years: form.years, languages: form.languages,
          interests: form.interests, bio: form.bio.trim(), lang: getLang(),
          // 신원 확인은 운영팀이 하므로 사용자가 바꿀 수 없다(시연 버튼으로만 바뀜)
          verified: form.role === "local" ? !!cur?.verified : false,
        });
        location.hash = "#/host-center";
        onChange?.();
      },
    },
      el("div", { class: "field" }, el("label", {}, t("hc_role")), roleBox),
      field(t("hc_name"), name, "hcName"),
      field(t("hc_city"), citySel, "hcCity"), field(t("hc_nb"), nbSel, "hcNb"), yearsField,
      el("div", { class: "field" }, el("label", {}, t("hc_langs")), chipGroup(LANGS.map((l) => l.code), form.languages, (c) => LANGS.find((l) => l.code === c).label)),
      el("div", { class: "field" }, el("label", {}, t("hc_interests")), chipGroup(TASTE_TAGS, form.interests, (x) => t("tag_" + x))),
      field(t("hc_bio"), bio, "hcBio"),
      isNew ? el("p", { class: "note" }, t("legal_agree"), " ",
        el("a", { href: "#/legal/terms" }, t("legal_terms")), " · ", el("a", { href: "#/legal/privacy" }, t("legal_privacy"))) : "",
      err, el("button", { class: "btn", type: "submit" }, t("hc_save"))));
}

// ---------- 프로그램 만들기·수정 ----------
export function programFormView(idParam) {
  const me = hostById("me");
  if (!me) return hostFormView(null, true);
  const editing = idParam && idParam !== "new" ? getMyPrograms().find((p) => p.id === idParam) : null;
  const allowedTypes = me.role === "traveler" ? ["companion"] : PROGRAM_TYPES;
  const lang = getLang();
  const form = {
    type: editing?.type ?? allowedTypes[0],
    city: editing?.city ?? me.city,
    nb: editing?.nb ?? "",
    title: editing ? pick(editing.title) : "",
    desc: editing ? pick(editing.desc) : "",
    hours: editing?.hours ?? 2,
    capacity: editing?.capacity ?? 3,
    languages: [...(editing?.languages ?? me.languages)],
    meeting: editing ? pick(editing.meeting) : "",
    isPublic: !!editing,
    cost: editing ? pick(editing.cost) : t("pf_cost_default"),
    sessions: editing ? editing.sessions.map((s) => ({ ...s })) : [],
  };
  const err = el("div", { class: "err", role: "alert" });

  const typeBox = el("div", { class: "chips", role: "group" },
    ...PROGRAM_TYPES.map((k) => el("button", {
      class: "chip", type: "button", "aria-pressed": String(form.type === k), ...(allowedTypes.includes(k) ? {} : { disabled: "" }),
      onclick: (e) => { form.type = k; e.currentTarget.parentElement.querySelectorAll(".chip").forEach((b, i) => b.setAttribute("aria-pressed", String(PROGRAM_TYPES[i] === k))); },
    }, t("ptype_" + k))));
  const text = (id, key, attrs = {}) => { const i = el("input", { id, type: "text", maxlength: "100", value: form[key], ...attrs }); i.addEventListener("input", () => { form[key] = i.value; }); return i; };
  const area = (id, key) => { const a = el("textarea", { id, rows: "4", maxlength: "600" }); a.value = form[key]; a.addEventListener("input", () => { form[key] = a.value; }); return a; };
  const select = (id, key, opts) => { const s = el("select", { id }, ...opts.map((o) => el("option", { value: o }, String(o)))); s.value = String(form[key]); s.addEventListener("change", () => { form[key] = Number(s.value); }); return s; };
  const field = (label, control, id) => el("div", { class: "field" }, el("label", { for: id }, label), control);

  const citySel = el("select", { id: "pfCity" }, ...openCities().map((c) => el("option", { value: c.id }, c.name[lang] ?? c.name.en)));
  citySel.value = form.city;
  const nbSel = el("select", { id: "pfNb" });
  const fillNb = () => {
    nbSel.replaceChildren(el("option", { value: "" }, t("hc_none")), ...NEIGHBORHOODS.filter((n) => n.city === form.city).map((n) => el("option", { value: n.id }, nbLabel(n))));
    if (!NEIGHBORHOODS.some((n) => n.id === form.nb && n.city === form.city)) form.nb = "";
    nbSel.value = form.nb;
  };
  fillNb();
  citySel.addEventListener("change", () => { form.city = citySel.value; fillNb(); });
  nbSel.addEventListener("change", () => { form.nb = nbSel.value; });

  const publicBox = el("input", { id: "pfPublic", type: "checkbox" });
  publicBox.checked = form.isPublic;
  publicBox.addEventListener("change", () => { form.isPublic = publicBox.checked; });

  const sessionsBox = el("div");
  function drawSessions() {
    sessionsBox.replaceChildren(
      ...form.sessions.map((s, i) => {
        const d = el("input", { type: "date", min: todayIso(), value: s.date ?? "", "aria-label": t("pf_sessions") + " " + (i + 1) });
        d.addEventListener("change", () => { s.date = d.value; });
        const tm = el("input", { type: "time", value: s.time ?? "14:00", "aria-label": t("pf_sessions") + " " + (i + 1) });
        tm.addEventListener("change", () => { s.time = tm.value; });
        if (!s.time) s.time = "14:00";
        return el("div", { class: "row2" }, d, tm,
          el("button", { class: "link", type: "button", onclick: () => { form.sessions.splice(i, 1); drawSessions(); } }, t("pf_remove_session")));
      }),
      form.sessions.length < MAX_SESSIONS ? el("button", { class: "btn ghost sm", type: "button",
        onclick: () => { form.sessions.push({ id: "s" + Date.now().toString(36) + form.sessions.length, date: "", time: "14:00", booked: 0 }); drawSessions(); } }, t("pf_add_session")) : "");
  }
  if (!form.sessions.length) form.sessions.push({ id: "s" + Date.now().toString(36), date: "", time: "14:00", booked: 0 });
  drawSessions();

  function submit(e) {
    e.preventDefault();
    if (form.title.trim().length < 2) { err.textContent = t("pf_err_title"); return; }
    if (form.desc.trim().length < 10) { err.textContent = t("pf_err_desc"); return; }
    if (!form.meeting.trim()) { err.textContent = t("pf_err_meeting"); return; }
    if (!form.isPublic) { err.textContent = t("pf_err_public"); return; }
    if (!form.languages.length) { err.textContent = t("pf_err_langs"); return; }
    const valid = form.sessions.filter((s) => s.date && s.date >= todayIso());
    if (!valid.length) { err.textContent = t("pf_err_sessions"); return; }
    const one = (v) => ({ [lang]: v.trim() });    // 쓴 언어로 저장하고, 다른 언어에서는 그대로 보여 준다
    const program = {
      id: editing?.id ?? "mp" + Date.now().toString(36), type: form.type, city: form.city, nb: form.nb || null,
      title: one(form.title), desc: one(form.desc), hours: form.hours, capacity: form.capacity, languages: form.languages,
      meeting: one(form.meeting), cost: one(form.cost || t("pf_cost_default")), sessions: valid.map((s) => ({ id: s.id, date: s.date, time: s.time, booked: 0 })),
    };
    setMyPrograms(editing ? getMyPrograms().map((p) => (p.id === editing.id ? program : p)) : [...getMyPrograms(), program]);
    location.hash = "#/host-center";
  }

  return el("div", { class: "onb" },
    el("a", { class: "crumb", href: "#/host-center" }, "←"),
    el("h1", {}, editing ? t("pf_edit") : t("pf_new")),
    me.role === "traveler" ? el("p", { class: "note", style: "margin-top:0" }, t("hc_traveler_only")) : "",
    el("form", { onsubmit: submit },
      el("div", { class: "field" }, el("label", {}, t("pf_type")), typeBox),
      field(t("pf_name"), text("pfTitle", "title"), "pfTitle"),
      field(t("pf_desc"), area("pfDesc", "desc"), "pfDesc"),
      field(t("hc_city"), citySel, "pfCity"), field(t("hc_nb"), nbSel, "pfNb"),
      field(t("pf_hours"), select("pfHours", "hours", [1, 1.5, 2, 2.5, 3, 4, 5, 6]), "pfHours"),
      field(t("pf_capacity"), select("pfCap", "capacity", [1, 2, 3, 4, 5, 6]), "pfCap"),
      el("div", { class: "field" }, el("label", {}, t("pf_langs")), chipGroup(LANGS.map((l) => l.code), form.languages, (c) => LANGS.find((l) => l.code === c).label)),
      field(t("pf_meeting"), text("pfMeeting", "meeting"), "pfMeeting"),
      el("div", { class: "check" }, publicBox, el("label", { for: "pfPublic" }, t("pf_public"))),
      field(t("pf_cost"), text("pfCost", "cost"), "pfCost"),
      el("div", { class: "field" }, el("label", {}, t("pf_sessions")), sessionsBox),
      err,
      el("div", { class: "actions" }, el("button", { class: "btn grow", type: "submit" }, t("pf_publish")),
        el("a", { class: "link", href: "#/host-center" }, t("pf_cancel")))));
}
