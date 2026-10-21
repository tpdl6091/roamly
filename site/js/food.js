// 해외 식품 리뷰: 목록·검색·입맛 맞춤 정렬, 상세(리뷰·질문·리뷰 쓰기), 비교
import { el, store, pick } from "./util.js";
import { getLang, t } from "./i18n.js";
import { PRODUCTS, FOOD_COUNTRIES, FOOD_CATS } from "./data-food.js";
import { currentUserId } from "./sync.js";
import { loginGate, promptLogin } from "./auth.js";
import { statusPills, statusBanner, helpfulControl, reportPanel, trustRank } from "./trust.js";

const TASTES = ["sweet", "salty", "spicy"];
const MAX_COMPARE = 3;

const productById = (id) => PRODUCTS.find((p) => p.id === id);
const myTaste = () => store.get("foodTaste", { sweet: 2, salty: 2, spicy: 2 });
const savedIds = () => store.get("productSaved", []);
const compareIds = () => store.get("compareList", []);

const money = (price) => new Intl.NumberFormat(getLang(), {
  style: "currency", currency: price.currency, maximumFractionDigits: ["KRW", "JPY"].includes(price.currency) ? 0 : 2,
}).format(price.amount);

// 내 입맛과 맛 프로필의 차이(작을수록 비슷). 리뷰어의 feel에도 쓴다.
const distance = (a, b) => TASTES.reduce((s, k) => s + Math.abs((a[k] ?? 0) - (b[k] ?? 0)), 0);

function dots(value) {
  return "●".repeat(Math.round(value)) + "○".repeat(5 - Math.round(value));
}

function tasteBars(profile) {
  return el("div", { class: "tastebars" }, ...TASTES.map((k) => el("div", { class: "tb" },
    el("span", {}, t("fd_" + k)),
    el("span", { class: "dots", "aria-label": `${t("fd_" + k)} ${profile[k]}/5` }, dots(profile[k])))));
}

function toggleList(key, id, max) {
  const list = store.get(key, []);
  const i = list.indexOf(id);
  if (i >= 0) list.splice(i, 1);
  else { if (max && list.length >= max) return false; list.push(id); }
  store.set(key, list);
  return true;
}

// ---------- 목록 ----------
export function foodListView() {
  const state = { q: "", country: "all", cat: "all", sort: "pop", savedOnly: false };
  const list = el("div", { class: "ngrid" });
  const filters = el("div");
  const compareBar = el("div", { class: "paction", style: "margin:8px 0" });
  const msg = el("div", { class: "note", role: "status", style: "margin:4px 0" });

  // 내 입맛 슬라이더
  const tasteBox = el("details", { class: "sec" }, el("summary", {}, t("fd_mytaste")));
  for (const k of TASTES) {
    const input = el("input", { id: "ft_" + k, type: "range", min: "0", max: "5", step: "1", value: String(myTaste()[k]) });
    const val = el("span", { class: "note", style: "margin:0" }, String(myTaste()[k]));
    input.addEventListener("input", () => {
      store.set("foodTaste", { ...myTaste(), [k]: Number(input.value) });
      val.textContent = input.value;
      if (state.sort === "taste") draw();
    });
    tasteBox.append(el("div", { class: "field" }, el("label", { for: "ft_" + k }, t("fd_" + k), " ", val), input));
  }

  const search = el("input", { class: "search", type: "search", placeholder: t("fd_search_ph"), "aria-label": t("fd_search_ph"), style: "margin-bottom:12px" });
  search.addEventListener("input", () => { state.q = search.value.trim().toLowerCase(); draw(); });

  const photo = el("input", { type: "file", accept: "image/*", hidden: "", id: "fdPhoto" });
  photo.addEventListener("change", () => { msg.textContent = t("fd_photo_note"); search.focus(); });

  const chipRow = (label, keys, current, fmt, key) => el("div", { class: "field" }, el("label", {}, label),
    el("div", { class: "chips" }, ...keys.map((k) => el("button", {
      class: "chip", type: "button", "aria-pressed": String(current === k),
      onclick: () => { state[key] = k; if (key === "sort" && k === "taste") tasteBox.open = true; draw(); },
    }, fmt(k)))));

  function filtered() {
    const mine = myTaste();
    let items = PRODUCTS.filter((p) =>
      (state.country === "all" || p.country === state.country)
      && (state.cat === "all" || p.cat === state.cat)
      && (!state.savedOnly || savedIds().includes(p.id))
      && (!state.q || Object.values(p.name).some((n) => n.toLowerCase().includes(state.q))));
    if (state.sort === "pop") items = items.sort((a, b) => b.pop - a.pop || b.rating - a.rating);
    else if (state.sort === "taste") items = items.sort((a, b) => distance(a.taste, mine) - distance(b.taste, mine));
    else items = items.sort((a, b) => a.price.amount * (a.price.currency === "JPY" ? 9 : 1) - b.price.amount * (b.price.currency === "JPY" ? 9 : 1));
    return items;
  }

  function card(p) {
    const saved = savedIds().includes(p.id);
    const inCmp = compareIds().includes(p.id);
    return el("div", { class: "pcard" },
      el("div", { class: "nhead" }, el("a", { href: `#/food/${p.id}` }, el("b", {}, pick(p.name))), el("small", {}, money(p.price))),
      el("div", { class: "ntags", style: "margin:6px 0" },
        el("span", { class: "pill" }, t("c_" + p.country)), el("span", { class: "pill" }, t("fcat_" + p.cat)),
        el("span", { class: "pill ok" }, t("fd_rating", { r: p.rating })), el("span", { class: "pill" }, t("fd_rebuy", { p: p.rebuy }))),
      tasteBars(p.taste),
      el("div", { class: "paction", style: "margin-top:10px" },
        el("button", { class: "btn ghost sm", type: "button", "aria-pressed": String(inCmp),
          onclick: () => { if (!currentUserId()) { promptLogin(t("gate_compare")); return; } if (!toggleList("compareList", p.id, MAX_COMPARE)) msg.textContent = t("fd_compare_max"); else msg.textContent = ""; draw(); } },
        inCmp ? "✓ " + t("fd_compare_in") : t("fd_compare_add")),
        el("button", { class: "btn ghost sm", type: "button", "aria-pressed": String(saved),
          onclick: () => { if (!currentUserId()) { promptLogin(t("gate_save")); return; } toggleList("productSaved", p.id); draw(); } }, (saved ? "♥ " : "♡ ") + (saved ? t("fd_saved") : t("fd_save")))));
  }

  function draw() {
    filters.replaceChildren(
      chipRow(t("fd_country"), ["all", ...FOOD_COUNTRIES], state.country, (k) => (k === "all" ? t("fd_all") : t("c_" + k)), "country"),
      chipRow(t("fd_category"), ["all", ...FOOD_CATS], state.cat, (k) => (k === "all" ? t("fd_all") : t("fcat_" + k)), "cat"),
      chipRow(t("fd_sort"), ["pop", "taste", "price"], state.sort, (k) => t("fs_" + k), "sort"),
      el("div", { class: "chips" }, el("button", { class: "chip", type: "button", "aria-pressed": String(state.savedOnly),
        onclick: () => { state.savedOnly = !state.savedOnly; draw(); } }, "♥ " + t("fd_saved_only"))));
    const items = filtered();
    list.replaceChildren(...(items.length ? items.map(card) : [el("div", { class: "placeholder", style: "grid-column:1/-1" }, el("p", {}, t("fd_none")))]));
    const n = compareIds().length;
    compareBar.replaceChildren(n >= 2 ? el("a", { class: "btn", href: "#/food/compare" }, t("fd_compare_go", { n })) : "");
  }

  draw();
  return el("div", {},
    el("h1", {}, t("fd_title")),
    el("p", { class: "note", style: "margin-top:0" }, t("fd_sub")),
    search,
    el("div", { class: "paction", style: "margin-bottom:8px" },
      el("button", { class: "btn ghost sm", type: "button", onclick: () => photo.click() }, "📷 " + t("fd_photo")), photo),
    msg,
    tasteBox, filters, compareBar, list,
    el("p", { class: "alert" }, t("fd_disclaimer")));
}

// ---------- 상세 ----------
export function foodDetailView(id, onChange) {
  const p = productById(id);
  if (!p) return foodListView();
  const mine = myTaste();
  const saved = savedIds().includes(p.id);
  const inCmp = compareIds().includes(p.id);

  const myReviews = store.get("productReviews", []).filter((r) => r.product === p.id);
  // 예시 리뷰의 신고·도움 표는 예시 값이다(실제 서비스에서는 다른 이용자의 신고·투표가 쌓인다)
  const sampleSeed = (i) => ({ helpful: Math.max(1, 6 - i * 2), ...(p.id === "jp-ramen-spicy" && i === 1 ? { reports: { ad: 1, fake: 1, other: 1 } } : {}) });
  const allReviews = [
    ...myReviews.map((r) => ({ ...r, mine: true })),
    ...p.reviews.map((r, i) => ({ ...r, id: `${p.id}-r${i}`, seed: sampleSeed(i), mine: false })),
  ].map((r) => ({ ...r, dist: distance(r.feel, mine), tg: { type: "review", id: r.id, seed: r.seed, owner: r.mine } }))
    .sort((a, b) => trustRank(a.tg) - trustRank(b.tg) || a.dist - b.dist);   // 검수 대기는 뒤로, 그다음 입맛이 비슷한 리뷰를 먼저

  function reviewCard(r) {
    return el("div", { class: "sec" },
      el("div", { class: "author" },
        el("span", { class: "pill " + (r.role === "local" ? "ok" : "") }, r.mine ? t("fd_my_review") : t("host_" + r.role)),
        r.dist <= 2 ? el("span", { class: "pill ok" }, t("fd_similar")) : "",
        ...statusPills(r.tg)),
      ...statusBanner(r.tg),
      el("p", { class: "quote", ...(r.mine ? { lang: r.lang } : {}) }, r.mine ? r.text : pick(r.text)),
      el("p", { class: "note", style: "margin:8px 0 0" }, `${t("fd_review_meta", { t: r.taste, x: r.texture })} · ${r.rebuy ? t("fd_rebuy_yes") : t("fd_rebuy_no")}`),
      tasteBars(r.feel),
      el("ul", { class: "badges", style: "margin-top:10px" },
        el("li", {}, el("span", { class: "dot ok", "aria-hidden": "true" }, "✓"), el("span", {}, t("fd_purchased", { d: r.bought }))),
        r.mine && r.sponsored && r.sponsored !== "none" ? el("li", {}, el("span", { class: "dot warn", "aria-hidden": "true" }, "!"), el("span", {}, t("b_sp_" + r.sponsored))) : ""),
      el("div", { class: "confirmrow" }, helpfulControl(r.tg, onChange)),
      ...reportPanel(r.tg, onChange));
  }

  // 질문
  const myQs = store.get("productQuestions", []).filter((q) => q.product === p.id);
  const askIn = el("textarea", { id: "askText", rows: "2", maxlength: "200", placeholder: t("fd_ask_ph"), "aria-label": t("fd_ask_ph") });
  const askForm = el("form", {
    onsubmit: (e) => {
      e.preventDefault();
      const text = askIn.value.trim();
      if (text.length < 3) return;
      store.set("productQuestions", [...store.get("productQuestions", []), { id: "q" + Date.now().toString(36), product: p.id, text, at: new Date().toISOString() }]);
      onChange();
    },
  }, askIn, el("button", { class: "btn", type: "submit", style: "margin-top:8px" }, t("fd_ask_send")));

  // 리뷰 쓰기
  const form = { taste: 4, texture: 4, rebuy: true, feel: { sweet: 2, salty: 2, spicy: 2 }, sponsored: "none", ate: false };
  const text = el("textarea", { id: "revText", rows: "4", maxlength: "800", "aria-label": t("fd_w_text") });
  const err = el("div", { class: "err", role: "alert" });
  const num = (key, id, label) => {
    const sel = el("select", { id }, ...[1, 2, 3, 4, 5].map((n) => el("option", { value: n }, String(n))));
    sel.value = String(form[key]);
    sel.addEventListener("change", () => { form[key] = Number(sel.value); });
    return el("div", { class: "field" }, el("label", { for: id }, label), sel);
  };
  const feelRow = (k) => {
    const r = el("input", { id: "wf_" + k, type: "range", min: "0", max: "5", step: "1", value: String(form.feel[k]) });
    r.addEventListener("input", () => { form.feel[k] = Number(r.value); });
    return el("div", { class: "field" }, el("label", { for: "wf_" + k }, t("fd_" + k)), r);
  };
  const ateBox = el("input", { id: "revAte", type: "checkbox" });
  ateBox.addEventListener("change", () => { form.ate = ateBox.checked; });
  const rebuyBox = el("input", { id: "revRebuy", type: "checkbox" });
  rebuyBox.checked = true;
  rebuyBox.addEventListener("change", () => { form.rebuy = rebuyBox.checked; });
  const sponsorRadios = ["none", "gifted", "paid", "affiliate"].map((s) => {
    const r = el("input", { type: "radio", name: "revSponsor", id: "rs_" + s, value: s });
    r.checked = s === "none";
    r.addEventListener("change", () => { form.sponsored = s; });
    return el("div", { class: "check" }, r, el("label", { for: "rs_" + s }, t("sp_" + s)));
  });
  const writeForm = el("form", {
    class: "sec",
    onsubmit: (e) => {
      e.preventDefault();
      if (text.value.trim().length < 10) { err.textContent = t("fd_w_err_text"); return; }
      if (!form.ate) { err.textContent = t("fd_w_err_ate"); return; }
      const d = new Date();
      store.set("productReviews", [...store.get("productReviews", []), {
        id: "v" + Date.now().toString(36), product: p.id, role: "traveler", lang: getLang(), text: text.value.trim(),
        taste: form.taste, texture: form.texture, rebuy: form.rebuy, feel: form.feel, sponsored: form.sponsored,
        bought: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      }]);
      onChange();
    },
  },
    el("h2", {}, t("fd_write")),
    num("taste", "revTaste", t("fd_w_taste")), num("texture", "revTexture", t("fd_w_texture")),
    el("div", { class: "check" }, rebuyBox, el("label", { for: "revRebuy" }, t("fd_w_rebuy"))),
    el("div", { class: "field" }, el("label", {}, t("fd_w_feel"))), ...TASTES.map(feelRow),
    el("div", { class: "field" }, el("label", { for: "revText" }, t("fd_w_text")), text),
    el("div", { class: "field" }, el("label", {}, t("f_sponsor")), ...sponsorRadios),
    el("div", { class: "check" }, ateBox, el("label", { for: "revAte" }, t("fd_w_ate"))),
    err, el("button", { class: "btn", type: "submit" }, t("fd_w_submit")));

  const allergens = p.allergens.length ? p.allergens.map((a) => t("al_" + a)).join(", ") : t("fd_allergen_none");

  return el("div", { class: "place" },
    el("a", { class: "crumb", href: "#/food" }, t("fd_back")),
    el("div", { class: "ntags" }, el("span", { class: "pill" }, t("c_" + p.country)), el("span", { class: "pill" }, t("fcat_" + p.cat)), el("span", { class: "pill" }, t("b_sample"))),
    el("h1", {}, pick(p.name)),
    el("p", { class: "note", style: "margin:0" }, money(p.price)),
    el("div", { class: "paction", style: "margin-top:12px" },
      el("button", { class: "btn" + (saved ? " on" : ""), type: "button", onclick: () => { if (!currentUserId()) { promptLogin(t("gate_save")); return; } toggleList("productSaved", p.id); onChange(); } }, (saved ? "♥ " : "♡ ") + (saved ? t("fd_saved") : t("fd_save"))),
      el("button", { class: "btn ghost", type: "button", onclick: () => { if (!currentUserId()) { promptLogin(t("gate_compare")); return; } toggleList("compareList", p.id, MAX_COMPARE); onChange(); } }, inCmp ? "✓ " + t("fd_compare_in") : t("fd_compare_add")),
      compareIds().length >= 2 ? el("a", { class: "btn ghost", href: "#/food/compare" }, t("fd_compare_go", { n: compareIds().length })) : ""),
    el("section", { class: "sec" },
      el("h2", {}, t("fd_taste_profile")), tasteBars(p.taste),
      el("p", { class: "note" }, `${t("fd_rating", { r: p.rating })} · ${t("fd_rebuy", { p: p.rebuy })} · ${t("fd_gift")} ${p.gift}/5 · ${t("fd_pop")} ${p.pop}/5`)),
    el("section", { class: "sec" },
      el("h2", {}, t("fd_allergen")), el("p", { style: "margin:0" }, allergens),
      el("p", { class: "alert" }, t("fd_disclaimer"))),
    el("h2", { class: "section-title" }, t("fd_reviews")),
    currentUserId() ? "" : el("p", { class: "note" }, t("tr_login_needed")),
    ...allReviews.map(reviewCard),
    el("h2", { class: "section-title" }, t("fd_qa")),
    ...(p.qa.length || myQs.length ? [
      ...p.qa.map((x) => el("div", { class: "sec" }, el("b", {}, "Q. " + pick(x.q)), el("p", { style: "margin:6px 0 0" }, `${t("fd_answer_by")}: ${pick(x.a)}`))),
      ...myQs.map((q) => el("div", { class: "sec" }, el("b", {}, "Q. " + q.text), el("p", { class: "note", style: "margin:6px 0 0" }, t("fd_ask_wait"))))]
      : [el("p", { class: "note" }, t("fd_no_qa"))]),
    currentUserId() ? el("div", { class: "sec" }, askForm) : loginGate(t("gate_question"), onChange),
    currentUserId() ? writeForm : loginGate(t("gate_review"), onChange),
    el("p", { class: "note" }, t("sample_note")));
}

// ---------- 비교 ----------
export function foodCompareView(onChange) {
  const items = compareIds().map(productById).filter(Boolean);
  if (items.length < 2) {
    return el("div", { class: "placeholder" }, el("h2", {}, t("cmp_title")), el("p", {}, t("cmp_empty")),
      el("a", { class: "btn ghost", href: "#/food" }, t("fd_back")));
  }
  const best = (fn, higher = true) => { const vals = items.map(fn); const target = higher ? Math.max(...vals) : Math.min(...vals); return (p) => fn(p) === target; };
  const row = (label, fn, fmt, isBest) => el("tr", {}, el("th", { scope: "row" }, label),
    ...items.map((p) => el("td", { class: isBest && isBest(p) ? "best" : "" }, fmt(p))));
  return el("div", {},
    el("a", { class: "crumb", href: "#/food" }, t("fd_back")),
    el("h1", {}, t("cmp_title")),
    el("div", { class: "tablewrap" }, el("table", { class: "cmp" },
      el("thead", {}, el("tr", {}, el("th", {}, ""), ...items.map((p) => el("th", { scope: "col" },
        el("a", { href: `#/food/${p.id}` }, pick(p.name)),
        el("div", {}, el("button", { class: "link", type: "button", onclick: () => { toggleList("compareList", p.id); onChange(); } }, t("cmp_remove"))))))),
      el("tbody", {},
        row(t("fd_price"), (p) => money(p.price), (p) => money(p.price)),
        row(t("fd_rating", { r: "" }).trim(), (p) => p.rating, (p) => String(p.rating), best((p) => p.rating)),
        row(t("fd_rebuy", { p: "" }).replace("%", "").trim(), (p) => p.rebuy, (p) => `${p.rebuy}%`, best((p) => p.rebuy)),
        row(t("fd_pop"), (p) => p.pop, (p) => `${p.pop}/5`, best((p) => p.pop)),
        row(t("fd_gift"), (p) => p.gift, (p) => `${p.gift}/5`, best((p) => p.gift)),
        ...TASTES.map((k) => row(t("fd_" + k), (p) => p.taste[k], (p) => dots(p.taste[k]))),
        row(t("fd_allergen"), () => "", (p) => (p.allergens.length ? p.allergens.map((a) => t("al_" + a)).join(", ") : t("fd_allergen_none")))))),
    el("p", { class: "alert" }, t("fd_disclaimer")));
}
