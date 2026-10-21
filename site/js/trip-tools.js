// 여행 도구: 예산(목표·지출·환율 직접 입력)과 준비물 체크리스트
import { el, pick, getTrips, mutateTrip } from "./util.js";
import { getLang, t } from "./i18n.js";
import { PLACES } from "./data.js";

const CURRENCIES = ["KRW", "JPY", "USD", "EUR"];
const CATS = ["transport", "lodging", "food", "other"];
const pad = (n) => String(n).padStart(2, "0");
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

const money = (n, cur) =>
  new Intl.NumberFormat(getLang(), {
    style: "currency", currency: cur, maximumFractionDigits: ["KRW", "JPY"].includes(cur) ? 0 : 2,
  }).format(n);
const round2 = (n) => Math.round(n * 100) / 100;
const num = (v) => { const x = parseFloat(String(v).replace(/,/g, "")); return Number.isFinite(x) && x >= 0 ? x : 0; };
const findTrip = (id) => getTrips().find((x) => x.id === id);

function field(label, control, id) {
  return el("div", { class: "field" }, el("label", { for: id }, label), control);
}

// ================= 예산 =================
export function budgetPanel(tripId) {
  const root = el("div");
  const ui = { budgetForm: false, expenseForm: false, saved: false, lastCurrency: null, category: "food" };

  function draw() {
    const trip = findTrip(tripId);
    const base = trip.currency ?? "KRW";
    const budget = trip.budget ?? { total: 0, cats: {} };
    const expenses = trip.expenses ?? [];
    const spent = expenses.reduce((s, e) => s + e.amountBase, 0);
    const byCat = Object.fromEntries(CATS.map((c) => [c, expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amountBase, 0)]));

    const meter = (value, target) => {
      const over = target > 0 && value > target;
      return el("div", { class: "meter" + (over ? " over" : ""), role: "img",
        "aria-label": `${money(value, base)} / ${money(target, base)}` },
        el("i", { style: `width:${target > 0 ? Math.min(100, (value / target) * 100) : 0}%` }));
    };

    const total = budget.total;
    const left = total - spent;
    const summary = el("section", { class: "sec" },
      el("div", { class: "sumline" },
        el("div", {}, el("span", { class: "note", style: "margin:0" }, t("bd_spent")), el("div", { class: "big" }, money(spent, base))),
        total > 0 ? el("div", { style: "text-align:right" },
          el("span", { class: "note", style: "margin:0" }, left >= 0 ? t("bd_left") : t("bd_over")),
          el("div", { class: "big" + (left < 0 ? " warn" : "") }, money(Math.abs(left), base))) : ""),
      total > 0 ? [meter(spent, total), el("div", { class: "note", style: "margin:4px 0 0" }, `${t("bd_total")} ${money(total, base)}`)]
        : el("p", { class: "note" }, t("no_budget")),
      ...CATS.map((c) => {
        const target = budget.cats?.[c] ?? 0;
        return el("div", { class: "catrow" },
          el("div", { class: "catname" }, el("span", {}, t("cat_" + c)),
            el("span", { class: "note", style: "margin:0" }, target > 0 ? `${money(byCat[c], base)} / ${money(target, base)}` : money(byCat[c], base))),
          target > 0 ? meter(byCat[c], target) : "");
      }));

    const actions = el("div", { class: "paction" },
      el("button", { class: "btn", type: "button", onclick: () => { ui.expenseForm = !ui.expenseForm; draw(); } }, t("ex_add")),
      el("button", { class: "btn ghost", type: "button", onclick: () => { ui.budgetForm = !ui.budgetForm; ui.saved = false; draw(); } }, t("bd_set")));

    root.replaceChildren(summary, actions,
      ui.expenseForm ? expenseForm(trip, base) : "",
      ui.budgetForm ? budgetForm(trip, base, expenses.length > 0) : "",
      expenseList(trip, base, expenses));
  }

  function budgetForm(trip, base, locked) {
    const cur = el("select", { id: "bdCur", ...(locked ? { disabled: "" } : {}) }, ...CURRENCIES.map((c) => el("option", { value: c }, c)));
    cur.value = base;
    const totalIn = el("input", { id: "bdTotal", type: "number", inputmode: "decimal", min: "0", step: "any", value: String(trip.budget?.total || "") });
    const catIns = CATS.map((c) => el("input", { id: "bd_" + c, type: "number", inputmode: "decimal", min: "0", step: "any", value: String(trip.budget?.cats?.[c] || "") }));
    const status = el("div", { class: "ok", role: "status" }, ui.saved ? t("bd_saved") : "");
    return el("form", {
      class: "sec",
      onsubmit: (e) => {
        e.preventDefault();
        mutateTrip(tripId, (tr) => {
          tr.currency = locked ? (tr.currency ?? "KRW") : cur.value;
          tr.budget = { total: num(totalIn.value), cats: Object.fromEntries(CATS.map((c, i) => [c, num(catIns[i].value)])) };
        });
        ui.saved = true;
        draw();
      },
    },
      field(t("bd_currency"), cur, "bdCur"),
      locked ? el("p", { class: "note", style: "margin-top:-6px" }, t("bd_currency_locked")) : "",
      field(`${t("bd_total")} (${base})`, totalIn, "bdTotal"),
      el("h3", { class: "section-title" }, t("bd_cat_target")),
      ...CATS.map((c, i) => field(t("cat_" + c), catIns[i], "bd_" + c)),
      el("button", { class: "btn", type: "submit" }, t("bd_save")), status);
  }

  function expenseForm(trip, base) {
    const places = [...new Set(Object.values(trip.days).flat())].map((id) => PLACES.find((p) => p.id === id)).filter(Boolean);
    const amount = el("input", { id: "exAmount", type: "number", inputmode: "decimal", min: "0", step: "any" });
    const curSel = el("select", { id: "exCur" }, ...CURRENCIES.map((c) => el("option", { value: c }, c)));
    curSel.value = ui.lastCurrency ?? base;
    const date = el("input", { id: "exDate", type: "date", value: todayIso() });
    const memo = el("input", { id: "exMemo", type: "text", maxlength: "80" });
    const placeSel = el("select", { id: "exPlace" }, el("option", { value: "" }, t("ex_place_none")),
      ...places.map((p) => el("option", { value: p.id }, pick(p.name))));
    const rate = el("input", { id: "exRate", type: "number", inputmode: "decimal", min: "0", step: "any" });
    const rateBox = el("div", { class: "field" });
    const rateHint = el("small", { class: "note", style: "margin:0" });
    const preview = el("div", { class: "ok", "aria-live": "polite" });
    const err = el("div", { class: "err", role: "alert" });

    function syncRate() {
      const cur = curSel.value;
      if (cur === base) { rateBox.hidden = true; rate.value = "1"; }
      else {
        rateBox.hidden = false;
        if (!rate.dataset.touched || rate.dataset.cur !== cur) { rate.value = trip.rates?.[`${cur}>${base}`] ?? ""; rate.dataset.touched = ""; }
        rate.dataset.cur = cur;
        rateHint.textContent = t("ex_rate_hint", { from: cur, to: base });
      }
      updatePreview();
    }
    function updatePreview() {
      const a = num(amount.value), r = curSel.value === base ? 1 : num(rate.value);
      preview.textContent = a > 0 && r > 0 && curSel.value !== base ? t("ex_converted", { amount: money(round2(a * r), base) }) : "";
    }
    rateBox.append(el("label", { for: "exRate" }, t("ex_rate")), rate, rateHint, el("small", { class: "note", style: "margin:0" }, t("ex_fx_note")));
    amount.addEventListener("input", updatePreview);
    rate.addEventListener("input", () => { rate.dataset.touched = "1"; updatePreview(); });
    curSel.addEventListener("change", () => { ui.lastCurrency = curSel.value; syncRate(); });

    const cats = el("div", { class: "chips", role: "group", "aria-label": t("ex_category") },
      ...CATS.map((c) => el("button", {
        class: "chip", type: "button", "aria-pressed": String(ui.category === c),
        onclick: (e) => {
          ui.category = c;
          e.currentTarget.parentElement.querySelectorAll(".chip").forEach((b, i) => b.setAttribute("aria-pressed", String(CATS[i] === c)));
        },
      }, t("cat_" + c))));

    const form = el("form", {
      class: "sec",
      onsubmit: (e) => {
        e.preventDefault();
        const a = num(amount.value);
        const cur = curSel.value;
        const r = cur === base ? 1 : num(rate.value);
        if (a <= 0) { err.textContent = t("ex_err_amount"); return; }
        if (r <= 0) { err.textContent = t("ex_err_rate"); return; }
        mutateTrip(tripId, (tr) => {
          tr.expenses = tr.expenses ?? [];
          tr.expenses.push({
            id: "e" + Date.now().toString(36), amount: a, currency: cur, rate: r, amountBase: round2(a * r),
            category: ui.category, date: date.value || todayIso(), memo: memo.value.trim(), place: placeSel.value || "",
          });
          if (cur !== base) { tr.rates = tr.rates ?? {}; tr.rates[`${cur}>${base}`] = r; }
        });
        ui.expenseForm = false;
        draw();
      },
    },
      field(t("ex_amount"), amount, "exAmount"),
      field(t("ex_currency"), curSel, "exCur"),
      rateBox, preview,
      el("div", { class: "field" }, el("label", {}, t("ex_category")), cats),
      field(t("ex_date"), date, "exDate"),
      field(t("ex_memo"), memo, "exMemo"),
      places.length ? field(t("ex_place"), placeSel, "exPlace") : "",
      err,
      el("div", { class: "actions" },
        el("button", { class: "btn", type: "submit" }, t("ex_save")),
        el("button", { class: "link", type: "button", onclick: () => { ui.expenseForm = false; draw(); } }, t("ex_cancel"))));
    syncRate();
    return form;
  }

  function expenseList(trip, base, expenses) {
    const sorted = expenses.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    return el("section", {},
      el("h2", { class: "section-title" }, t("ex_list")),
      sorted.length ? el("ul", { class: "items" }, ...sorted.map((e) => {
        const place = PLACES.find((p) => p.id === e.place);
        return el("li", { class: "item" },
          el("div", { class: "grow" },
            el("b", {}, e.memo || (place ? pick(place.name) : t("cat_" + e.category))),
            el("div", { class: "ntags" }, el("span", { class: "pill" }, t("cat_" + e.category)),
              el("span", { class: "note", style: "margin:0" }, e.date))),
          el("div", { style: "text-align:right" },
            el("b", {}, money(e.amountBase, base)),
            e.currency !== base ? el("div", { class: "note", style: "margin:0" }, money(e.amount, e.currency)) : ""),
          el("button", {
            class: "link", type: "button", "aria-label": t("ex_delete"),
            onclick: () => { mutateTrip(tripId, (tr) => { tr.expenses = (tr.expenses ?? []).filter((x) => x.id !== e.id); }); draw(); },
          }, t("ex_delete")));
      })) : el("p", { class: "note" }, t("ex_none")));
  }

  draw();
  return root;
}

// ================= 준비물 =================
const TEMPLATE = [
  ["before", "passport"], ["before", "esim"], ["before", "stay"], ["before", "insurance"], ["before", "cash"],
  ["packing", "adapter"], ["packing", "charger"], ["packing", "meds"], ["packing", "shoes"], ["packing", "umbrella"], ["packing", "bag"],
  ["local", "transit"], ["local", "hours"], ["local", "emergency"],
];
const GROUPS = ["before", "packing", "local"];

export function checklistPanel(tripId) {
  const root = el("div");
  const ui = { group: "before", message: "" };

  const labelOf = (item) => (item.key ? t("ck_" + item.key) : item.text);

  function draw() {
    const trip = findTrip(tripId);
    const items = trip.checklist ?? [];
    const done = items.filter((i) => i.done).length;

    const input = el("input", { id: "ckText", type: "text", maxlength: "80", placeholder: t("ck_add_ph"), "aria-label": t("ck_add_ph") });
    const groupSel = el("select", { "aria-label": t("ck_group_before"), class: "mini" },
      ...GROUPS.map((g) => el("option", { value: g }, t("ck_group_" + g))));
    groupSel.value = ui.group;
    groupSel.addEventListener("change", () => { ui.group = groupSel.value; });

    const add = (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      mutateTrip(tripId, (tr) => { (tr.checklist = tr.checklist ?? []).push({ id: "c" + Date.now().toString(36), text, group: ui.group, done: false }); });
      ui.message = "";
      draw();
    };

    const loadTemplate = () => {
      let added = 0;
      mutateTrip(tripId, (tr) => {
        tr.checklist = tr.checklist ?? [];
        for (const [group, key] of TEMPLATE) {
          if (!tr.checklist.some((i) => i.key === key)) {
            tr.checklist.push({ id: "c" + Date.now().toString(36) + key, key, group, done: false });
            added += 1;
          }
        }
      });
      ui.message = added ? t("ck_template_done", { n: added }) : t("ck_template_none");
      draw();
    };

    const toggle = (item) => mutateTrip(tripId, (tr) => { const x = tr.checklist.find((i) => i.id === item.id); if (x) x.done = !x.done; });
    const remove = (item) => mutateTrip(tripId, (tr) => { tr.checklist = tr.checklist.filter((i) => i.id !== item.id); });

    const groupBlock = (g) => {
      const list = items.filter((i) => i.group === g);
      if (!list.length) return "";
      return el("section", {},
        el("h3", { class: "section-title" }, t("ck_group_" + g)),
        el("ul", { class: "items" }, ...list.map((item) => {
          const box = el("input", { type: "checkbox", id: "ck_" + item.id });
          box.checked = item.done;
          box.addEventListener("change", () => { toggle(item); draw(); });
          return el("li", { class: "item" + (item.done ? " done" : "") },
            el("div", { class: "check grow", style: "margin:0" }, box, el("label", { for: "ck_" + item.id }, labelOf(item))),
            el("button", { class: "link", type: "button", onclick: () => { remove(item); draw(); } }, t("ck_delete")));
        })));
    };

    root.replaceChildren(
      el("section", { class: "sec" },
        el("div", { class: "sumline" }, el("b", {}, t("ck_progress", { d: done, n: items.length }))),
        el("div", { class: "meter" }, el("i", { style: `width:${items.length ? (done / items.length) * 100 : 0}%` }))),
      el("form", { class: "addrow", onsubmit: add }, input, groupSel, el("button", { class: "btn", type: "submit" }, t("ck_add"))),
      el("div", { class: "paction", style: "margin-top:10px" },
        el("button", { class: "btn ghost", type: "button", onclick: loadTemplate }, t("ck_template"))),
      el("div", { class: "ok", role: "status" }, ui.message),
      ...(items.length ? GROUPS.map(groupBlock) : [el("p", { class: "note" }, t("ck_empty"))]));
  }

  draw();
  return root;
}
