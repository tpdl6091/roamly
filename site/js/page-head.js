// 탭 화면 맨 위의 머리말: 홈과 같은 분위기(가운데 정렬된 큰 제목 + 설명). photo 를 켜면 아래에 둥근 큰 사진이 붙는다.
import { el } from "./util.js";

export function pageHead(title, sub = "", { photo = false, extra = null } = {}) {
  return el("header", { class: "phead" },
    el("h1", {}, title),
    sub ? el("p", { class: "psub" }, sub) : "",
    extra ? el("div", { class: "pextra" }, extra) : "",
    photo ? el("img", { class: "pphoto", src: "img/match-puzzle.jpg", alt: "", width: "1059", height: "660", loading: "lazy" }) : "");
}
