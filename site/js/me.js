// MY: 로그인·내 정보·설정·내 활동·바로가기
import { el, store, getTrips } from "./util.js";
import { pageHead } from "./page-head.js";
import { LANGS, getLang, t } from "./i18n.js";
import { TASTE_TAGS } from "./data.js";
import { authSection } from "./auth.js";
import { currentUserId } from "./sync.js";
import { adminShortcut } from "./admin.js";
import { getMyPostsCache, loadMyPosts } from "./remote.js";

function stat(label, value) {
  return el("div", { class: "stat" }, el("b", {}, String(value)), el("span", { class: "note", style: "margin:0" }, label));
}

export function meView(onChange) {
  const taste = store.get("taste", null);
  const serverPosts = currentUserId() ? getMyPostsCache() : null;
  if (currentUserId() && serverPosts === null) loadMyPosts().then(() => onChange());   // 서버에 올린 내 글 수를 가져온다
  const trips = getTrips();
  const photos = trips.reduce((s, tr) => s + Object.values(tr.journal ?? {}).reduce((a, e) => a + (e.photos?.length ?? 0), 0), 0);

  const langSel = el("select", { id: "meLang" }, ...LANGS.map((l) => el("option", { value: l.code }, l.label)));
  langSel.value = getLang();
  langSel.addEventListener("change", () => {
    // 상단 언어 선택과 같은 동작을 하도록 그쪽 선택을 바꾼다
    const header = document.getElementById("langSelect");
    header.value = langSel.value;
    header.dispatchEvent(new Event("change"));
  });

  return el("div", { class: "onb" },
    pageHead(t("me_title"), t("ph_me_sub")),
    authSection(onChange),
    el("section", { class: "sec" },
      el("div", { class: "field" }, el("label", { for: "meLang" }, t("me_lang")), langSel)),
    el("section", { class: "sec" },
      el("h2", {}, t("me_taste")),
      taste?.tags?.length
        ? el("div", { class: "ntags" }, ...taste.tags.filter((x) => TASTE_TAGS.includes(x)).map((x) => el("span", { class: "pill ok" }, t("tag_" + x))))
        : el("p", { class: "note", style: "margin:0" }, t("me_taste_none")),
      el("div", { style: "margin-top:10px" }, el("a", { class: "link", href: "#/onboarding/" }, t("me_taste_edit")))),
    el("section", { class: "sec" },
      el("h2", {}, t("me_activity")),
      el("div", { class: "stats" },
        stat(t("me_saved"), store.get("saved", []).length),
        stat(t("me_trips"), trips.length),
        stat(t("me_posts"), store.get("myPosts", []).length + (serverPosts?.length ?? 0)),
        stat(t("me_photos"), photos))),
    el("div", { style: "text-align:center;margin-top:20px" }, adminShortcut()));   // 바로가기는 탭·화면 안의 버튼으로 모두 갈 수 있어 없앴다. 운영자 버튼만 여기 남긴다(운영자 계정에만 보임)
}
