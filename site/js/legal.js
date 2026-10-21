// 이용약관·개인정보 처리방침 화면
import { el } from "./util.js";
import { getLang, t } from "./i18n.js";
import { LEGAL } from "./legal-content.js";

export function legalView(kind) {
  const type = kind === "privacy" ? "privacy" : "terms";
  const lang = getLang();
  const docLang = LEGAL[type][lang] ? lang : "en";      // 한국어·영어만 제공, 나머지는 영어
  const sections = LEGAL[type][docLang];
  const root = el("div", { class: "onb legal" });
  const sectionEls = sections.map(([title, ...blocks], i) => {
    const h = el("h2", { id: `lg-${i}`, tabindex: "-1" }, title);
    const body = blocks.map((b) => (Array.isArray(b)
      ? el("ul", {}, ...b.map((x) => el("li", {}, x)))
      : el("p", {}, b)));
    return el("section", { class: "lg-sec" }, h, ...body);
  });

  const tab = (href, label, on) => el("a", { class: "chip", href, ...(on ? { "aria-current": "page" } : {}) }, label);
  root.append(
    el("div", { class: "chips" },
      tab("#/legal/terms", t("legal_terms"), type === "terms"),
      tab("#/legal/privacy", t("legal_privacy"), type === "privacy")),
    el("h1", {}, t(type === "terms" ? "legal_terms" : "legal_privacy"), " ", el("span", { class: "pill warn", style: "vertical-align:middle" }, t("legal_draft"))),
    el("p", { class: "note", style: "margin-top:0" }, t("legal_effective")),
    el("div", { class: "alert", role: "note" }, t("legal_draft_banner")),
    docLang !== lang ? el("p", { class: "note" }, t("legal_lang_note")) : "",
    el("nav", { class: "sec", "aria-label": t("legal_toc") },
      el("h2", {}, t("legal_toc")),
      el("ol", { class: "toc" }, ...sections.map(([title], i) => el("li", {},
        el("button", { class: "link", type: "button", onclick: () => { const h = document.getElementById(`lg-${i}`); h.scrollIntoView({ block: "start" }); h.focus({ preventScroll: true }); } }, title))))),
    ...sectionEls,
    el("button", { class: "link", type: "button", onclick: () => window.scrollTo({ top: 0 }) }, t("legal_top")));
  return root;
}
