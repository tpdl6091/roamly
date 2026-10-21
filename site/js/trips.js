// 내 여행: 여행 목록·저장함, 새 여행 만들기, 날짜별 일정, 장소 상세의 '일정에 추가'
import { el, store, pick, fmtDate, getTrips, setTrips, mutateTrip } from "./util.js";
import { pageHead } from "./page-head.js";
import { budgetPanel, checklistPanel } from "./trip-tools.js";
import { journalPanel, journalArchive, isVisited, toggleVisited, purgeTripPhotos } from "./journal.js";
import { programDayCards } from "./programs.js";
import { mapPanel } from "./map.js";
import { legInfo, legText, daySummaryText } from "./routing.js";
import { enableDragSort } from "./dragsort.js";
import { setSaved, currentUserId } from "./sync.js";
import { loginGate } from "./auth.js";
import { getLang, t } from "./i18n.js";
import { CITIES, NEIGHBORHOODS, PLACES } from "./data.js";

const MAX_DAYS = 30;

// ---------- 데이터 도우미 ----------
const savedIds = () => store.get("saved", []);

const cityOfPlace = (place) => NEIGHBORHOODS.find((n) => n.id === place.nb)?.city;
const cityName = (id) => {
  const c = CITIES.find((x) => x.id === id);
  return c ? (c.name[getLang()] ?? c.name.en) : id;
};
const placeById = (id) => PLACES.find((p) => p.id === id);

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

function datesBetween(start, end) {
  const out = [];
  const d = parse(start);
  const last = parse(end);
  while (d <= last && out.length <= MAX_DAYS) { out.push(iso(d)); d.setDate(d.getDate() + 1); }
  return out;
}
const tripDays = (trip) => datesBetween(trip.start, trip.end);
const itemCount = (trip) => Object.values(trip.days).reduce((sum, list) => sum + list.length, 0);
const range = (trip) => `${fmtDate(trip.start)} – ${fmtDate(trip.end)}`;
const dayLabel = (date, i) =>
  `${t("day_n", { n: i + 1 })} · ${parse(date).toLocaleDateString(getLang(), { month: "short", day: "numeric" })}`;

// ---------- 내 여행 (여행 목록 / 저장함) ----------
export function tripsView(sub) {
  const isSaved = sub === "saved";
  const isJournal = sub === "journal";
  const tab = (href, label, on) => el("a", { class: "chip", href, ...(on ? { "aria-current": "page" } : {}) }, label);
  const tabs = el("div", { class: "chips" },
    tab("#/trips", t("trips_tab_trips"), !isSaved && !isJournal),
    tab("#/trips/saved", t("trips_tab_saved") + ` ${savedIds().length}`, isSaved),
    tab("#/trips/journal", t("tab_journal"), isJournal));

  return el("div", {},
    pageHead(t("trips_title"), t("ph_trips_sub"), { extra: el("a", { class: "btn", href: "#/trips/new" }, t("new_trip")) }),
    tabs,
    isSaved ? savedList() : isJournal ? journalArchive() : tripList());
}

function emptyState(title, sub) {
  return el("div", { class: "placeholder" }, el("h2", {}, title), el("p", {}, sub));
}

function tripList() {
  const trips = getTrips().slice().sort((a, b) => a.start.localeCompare(b.start));
  if (!trips.length) return emptyState(t("no_trips"), t("no_trips_sub"));
  return el("div", { class: "ngrid" }, ...trips.map((trip) =>
    el("a", { class: "pcard", href: `#/trip/${trip.id}` },
      el("div", { class: "nhead" }, el("b", {}, t("trip_title", { city: cityName(trip.city) }))),
      el("p", {}, range(trip)),
      el("div", { class: "ntags" },
        el("span", { class: "pill" }, t("trip_meta", { n: tripDays(trip).length, m: itemCount(trip) }))))));
}

function savedList() {
  const places = savedIds().map(placeById).filter(Boolean);
  if (!places.length) return emptyState(t("no_saved"), t("no_saved_sub"));
  const grid = el("div", { class: "ngrid" });
  function draw() {
    const items = savedIds().map(placeById).filter(Boolean);
    if (!items.length) { grid.replaceChildren(emptyState(t("no_saved"), t("no_saved_sub"))); return; }
    grid.replaceChildren(...items.map((p) =>
      el("div", { class: "pcard" },
        el("div", { class: "nhead" },
          el("a", { href: `#/p/${p.id}` }, el("b", {}, pick(p.name))),
          el("button", {
            class: "link", type: "button",
            onclick: () => { setSaved(savedIds().filter((x) => x !== p.id)); draw(); },
          }, t("unsave"))),
        el("p", {}, pick(p.comment)),
        el("div", { class: "ntags" },
          el("span", { class: "pill" }, t("cat_" + p.cat)),
          el("span", { class: "pill" }, cityName(cityOfPlace(p)))))));
  }
  draw();
  return grid;
}

// ---------- 새 여행 만들기 ----------
export function newTripView(presetCity) {
  // 여행 만들기는 회원만 할 수 있다
  if (!currentUserId()) {
    return el("div", { class: "onb" },
      el("a", { class: "crumb", href: "#/trips" }, t("back_trips")),
      el("h1", {}, t("new_trip").replace(/^\+\s*/, "")),
      loginGate(t("gate_trip_new")));
  }
  const openCities = CITIES.filter((c) => c.status === "open");
  const today = new Date();
  const later = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

  const citySel = el("select", { id: "tripCity" },
    ...openCities.map((c) => el("option", { value: c.id }, c.name[getLang()] ?? c.name.en)));
  if (openCities.some((c) => c.id === presetCity)) citySel.value = presetCity;
  const startIn = el("input", { id: "tripStart", type: "date", value: iso(today) });
  const endIn = el("input", { id: "tripEnd", type: "date", value: iso(later) });
  const err = el("div", { class: "err", role: "alert" });

  startIn.addEventListener("change", () => { if (startIn.value && endIn.value < startIn.value) endIn.value = startIn.value; });

  function submit(e) {
    e.preventDefault();
    if (!citySel.value || !startIn.value || !endIn.value) { err.textContent = t("trip_err_missing"); return; }
    if (endIn.value < startIn.value) { err.textContent = t("trip_err_dates"); return; }
    if (datesBetween(startIn.value, endIn.value).length > MAX_DAYS) { err.textContent = t("trip_err_len"); return; }
    const trip = { id: "t" + Date.now().toString(36), city: citySel.value, start: startIn.value, end: endIn.value, days: {} };
    setTrips([...getTrips(), trip]);
    location.hash = `#/trip/${trip.id}`;
  }

  const field = (label, input, id) => el("div", { class: "field" }, el("label", { for: id }, label), input);
  return el("div", { class: "onb" },
    el("a", { class: "crumb", href: "#/trips" }, t("back_trips")),
    el("h1", {}, t("new_trip").replace(/^\+\s*/, "")),
    el("form", { onsubmit: submit },
      field(t("trip_city"), citySel, "tripCity"),
      field(t("trip_start"), startIn, "tripStart"),
      field(t("trip_end"), endIn, "tripEnd"),
      err,
      el("div", { class: "actions" }, el("button", { class: "btn grow", type: "submit" }, t("trip_create")))));
}

// ---------- 여행 일정 (날짜별 장소 배치) ----------
export function tripView(id, initialTab) {
  let trip = getTrips().find((x) => x.id === id);
  if (!trip) return tripsView();
  const days = tripDays(trip);
  // 탭은 주소에 남겨 두어(#/trip/id/budget) 언어를 바꿔 화면이 다시 그려져도 유지된다.
  const state = { day: days[0], picker: false, map: false, tab: ["budget", "checklist", "journal"].includes(initialTab) ? initialTab : "plan" };
  const root = el("div");

  const refresh = () => { trip = getTrips().find((x) => x.id === id); };
  const listOf = (date) => trip.days[date] ?? [];

  function move(date, index, delta) {
    mutateTrip(id, (tr) => {
      const list = tr.days[date] ?? [];
      const j = index + delta;
      if (j < 0 || j >= list.length) return;
      [list[index], list[j]] = [list[j], list[index]];
      tr.days[date] = list;
    });
    refresh(); draw();
  }
  // 항목을 from → to 위치로 옮긴다(끌어서 놓기·키보드). 옮긴 뒤 손잡이에 포커스를 돌려 준다.
  function reorder(date, from, to) {
    mutateTrip(id, (tr) => {
      const list = tr.days[date] ?? [];
      if (from < 0 || from >= list.length || to < 0 || to >= list.length) return;
      const [pid] = list.splice(from, 1);
      list.splice(to, 0, pid);
      tr.days[date] = list;
    });
    refresh(); draw();
    root.querySelector(`[data-handle="${to}"]`)?.focus();
  }
  function remove(date, index) {
    mutateTrip(id, (tr) => { (tr.days[date] ?? []).splice(index, 1); });
    refresh(); draw();
  }
  function moveToDay(fromDate, index, toDate) {
    mutateTrip(id, (tr) => {
      const [pid] = (tr.days[fromDate] ?? []).splice(index, 1);
      const target = tr.days[toDate] ?? [];
      if (pid && !target.includes(pid)) target.push(pid);
      tr.days[toDate] = target;
    });
    refresh(); draw();
  }
  function addPlace(pid) {
    mutateTrip(id, (tr) => {
      const list = tr.days[state.day] ?? [];
      if (!list.includes(pid)) list.push(pid);
      tr.days[state.day] = list;
    });
    refresh(); draw();
  }

  function itemRow(pid, index, list) {
    const p = placeById(pid);
    if (!p) return el("li", {});
    const otherDays = days.filter((d) => d !== state.day);
    const sel = el("select", { "aria-label": t("move_to"), class: "mini", onchange: (e) => { if (e.target.value) moveToDay(state.day, index, e.target.value); } },
      el("option", { value: "" }, t("move_to")),
      ...otherDays.map((d) => el("option", { value: d }, dayLabel(d, days.indexOf(d)))));
    const small = (label, fn, disabled) => el("button", { class: "btn ghost sm", type: "button", onclick: fn, ...(disabled ? { disabled: "" } : {}) }, label);
    const prev = index > 0 ? placeById(list[index - 1]) : null;
    const leg = prev ? legInfo(prev, p) : null;
    return el("li", { class: "item" },
      el("button", {
        class: "drag", type: "button", "data-handle": String(index), "aria-label": t("drag_handle"), title: t("drag_handle"),
        onkeydown: (e) => {
          const dir = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
          if (!dir) return;
          e.preventDefault();
          reorder(state.day, index, index + dir);
        },
      }, "⠿"),
      el("span", { class: "num", "aria-hidden": "true" }, String(index + 1)),
      el("div", { class: "grow" },
        el("a", { href: `#/p/${p.id}` }, el("b", {}, pick(p.name))),
        el("div", { class: "ntags" }, el("span", { class: "pill" }, t("cat_" + p.cat))),
        leg ? el("div", { class: "legline" }, "↳ " + legText(leg)) : ""),
      el("div", { class: "ctrl" },
        small(isVisited(trip, pid) ? t("jr_checked") : t("jr_check"), () => { toggleVisited(id, pid, state.day); refresh(); draw(); }),
        small("↑", () => move(state.day, index, -1), index === 0),
        small("↓", () => move(state.day, index, 1), index === list.length - 1),
        otherDays.length ? sel : "",
        small(t("remove"), () => remove(state.day, index))));
  }

  function picker() {
    const taken = new Set(listOf(state.day));
    const cityPlaces = PLACES.filter((p) => cityOfPlace(p) === trip.city && !taken.has(p.id));
    const saved = new Set(savedIds());
    const fromSaved = cityPlaces.filter((p) => saved.has(p.id));
    const others = cityPlaces.filter((p) => !saved.has(p.id));
    const row = (p) => el("li", { class: "item" },
      el("div", { class: "grow" }, el("b", {}, pick(p.name)), el("div", { class: "ntags" }, el("span", { class: "pill" }, t("cat_" + p.cat)))),
      el("button", { class: "btn sm", type: "button", onclick: () => addPlace(p.id) }, t("add_btn")));
    const group = (title, items) => items.length ? [el("h3", { class: "section-title" }, title), el("ul", { class: "items" }, ...items.map(row))] : [];
    const body = [...group("♥ " + t("picker_saved"), fromSaved), ...group(t("picker_city", { city: cityName(trip.city) }), others)];
    return el("section", { class: "sec" },
      ...(body.length ? body : [el("p", { class: "note" }, t("picker_empty"))]),
      el("button", { class: "link", type: "button", onclick: () => { state.picker = false; draw(); } }, t("close_picker")));
  }

  function tabsRow() {
    return el("div", { class: "chips", role: "tablist" },
      ...[["plan", "tab_plan"], ["budget", "tab_budget"], ["checklist", "tab_checklist"], ["journal", "tab_journal"]].map(([key, label]) => el("button", {
        class: "chip", type: "button", role: "tab", "aria-selected": String(state.tab === key), "aria-pressed": String(state.tab === key),
        onclick: () => {
          state.tab = key;
          history.replaceState(null, "", key === "plan" ? `#/trip/${id}` : `#/trip/${id}/${key}`);
          draw();
        },
      }, t(label))));
  }

  // 끌어서 순서를 바꿀 수 있는 그날의 장소 목록
  function sortableList(list) {
    const ol = el("ol", { class: "items" }, ...list.map((pid, i) => itemRow(pid, i, list)));
    enableDragSort(ol, { handleSelector: ".drag", onReorder: (from, to) => reorder(state.day, from, to) });
    return ol;
  }

  function planBody(list) {
    return [
      el("div", { class: "chips" }, ...days.map((d, i) => el("button", {
        class: "chip", type: "button", "aria-pressed": String(d === state.day),
        onclick: () => { state.day = d; draw(); },
      }, dayLabel(d, i) + (listOf(d).length ? ` (${listOf(d).length})` : "")))),
      ...(programDayCards(trip, state.day).length ? [el("ul", { class: "items" }, ...programDayCards(trip, state.day))] : []),
      el("button", { class: "btn ghost sm", type: "button", "aria-pressed": String(state.map),
        onclick: () => { state.map = !state.map; draw(); } }, state.map ? t("map_hide") : t("map_show")),
      ...(state.map ? [mapPanel(list.map(placeById).filter(Boolean))] : []),
      ...(list.length > 1 && daySummaryText(list.map(placeById).filter(Boolean))
        ? [el("p", { class: "note", style: "margin-bottom:0" }, daySummaryText(list.map(placeById).filter(Boolean)))] : []),
      list.length
        ? sortableList(list)
        : el("p", { class: "note" }, t("empty_day")),
      ...(list.length > 1 ? [el("p", { class: "note", style: "margin-top:0" }, t("drag_hint") + " " + t("rt_note"))] : []),
      state.picker ? picker()
        : el("div", { class: "paction" },
          el("button", { class: "btn ghost", type: "button", onclick: () => { state.picker = true; draw(); } }, t("add_place")),
          el("a", { class: "btn ghost", href: `#/now/${trip.city}` }, t("now_title"))),
    ];
  }

  function draw() {
    const list = listOf(state.day);
    root.replaceChildren(
      el("a", { class: "crumb", href: "#/trips" }, t("back_trips")),
      el("div", { class: "city-head" },
        el("h1", {}, t("trip_title", { city: cityName(trip.city) })),
        el("button", {
          class: "link", type: "button",
          onclick: () => {
            if (!window.confirm(t("delete_confirm"))) return;
            purgeTripPhotos(trip);
            setTrips(getTrips().filter((x) => x.id !== id));
            location.hash = "#/trips";
          },
        }, t("delete_trip"))),
      el("p", { class: "note", style: "margin-top:0" }, range(trip) + " · " + t("trip_meta", { n: days.length, m: itemCount(trip) })),
      tabsRow(),
      ...(state.tab === "budget" ? [budgetPanel(id)]
        : state.tab === "checklist" ? [checklistPanel(id)]
        : state.tab === "journal" ? [journalPanel(id)]
        : planBody(list)));
  }

  draw();
  return root;
}

// ---------- 장소 상세의 '일정에 추가' 패널 ----------
export function addToTripPanel(place) {
  const city = cityOfPlace(place);
  const box = el("section", { class: "sec", hidden: "" });
  const msg = el("div", { class: "ok", role: "status" });

  function draw() {
    msg.textContent = "";
    const trips = getTrips().filter((x) => x.city === city).sort((a, b) => a.start.localeCompare(b.start));
    if (!trips.length) {
      box.replaceChildren(
        el("p", { class: "note", style: "margin-top:0" }, t("no_trip_for_city", { city: cityName(city) })),
        el("a", { class: "btn", href: `#/trips/new/${city}` }, t("create_trip_for_city", { city: cityName(city) })));
      return;
    }
    const tripSel = el("select", { id: "addTrip" },
      ...trips.map((tr) => el("option", { value: tr.id }, `${t("trip_title", { city: cityName(tr.city) })} · ${range(tr)}`)));
    const daySel = el("select", { id: "addDay" });
    const fillDays = () => {
      const tr = trips.find((x) => x.id === tripSel.value);
      daySel.replaceChildren(...tripDays(tr).map((d, i) => el("option", { value: d }, dayLabel(d, i))));
    };
    fillDays();
    tripSel.addEventListener("change", fillDays);
    const link = el("a", { class: "link", href: "#/trips" }, t("view_trip"));
    box.replaceChildren(
      el("div", { class: "field" }, el("label", { for: "addTrip" }, t("choose_trip")), tripSel),
      el("div", { class: "field" }, el("label", { for: "addDay" }, t("choose_day")), daySel),
      el("button", {
        class: "btn", type: "button",
        onclick: () => {
          const tid = tripSel.value;
          const date = daySel.value;
          let added = false;
          mutateTrip(tid, (tr) => {
            const list = tr.days[date] ?? [];
            if (!list.includes(place.id)) { list.push(place.id); added = true; }
            tr.days[date] = list;
          });
          msg.textContent = added ? t("added_ok") : t("already_in");
          link.setAttribute("href", `#/trip/${tid}`);
        },
      }, t("add_btn")),
      msg, link);
  }

  return {
    el: box,
    toggle() {
      if (box.hasAttribute("hidden")) { draw(); box.removeAttribute("hidden"); return true; }
      box.setAttribute("hidden", "");
      return false;
    },
  };
}
