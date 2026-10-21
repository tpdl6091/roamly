// 예시 현지인 13명의 '정면 얼굴' 일러스트 아바타(SVG)를 만든다. 실제 사람 사진이 아니다.
// 실행: node tools/make-demo-avatars.mjs → site/img/hosts/<닉네임>.svg
// 실제 사진으로 바꾸려면 같은 이름의 site/img/hosts/<닉네임>.jpg 를 넣으면 사진이 먼저 쓰인다.
import fs from "node:fs";
import { HOSTS } from "./demo-hosts-data.mjs";

const OUT = new URL("../site/img/hosts/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });

const PEOPLE = Object.fromEntries(HOSTS.map((h) => [h.n, h.avatar]));

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, v + amt)).toString(16).padStart(2, "0");
  return `#${f(n >> 16)}${f((n >> 8) & 255)}${f(n & 255)}`;
};

function hairBack(p) {            // 얼굴 뒤쪽 머리(긴 머리·단발·번)
  const h = p.hair;
  if (p.style === "long") return `<path d="M42 78 C34 110 36 142 48 160 L112 160 C124 142 126 110 118 78 Z" fill="${h}"/>`;
  if (p.style === "bob") return `<path d="M44 76 C38 100 40 118 50 124 L110 124 C120 118 122 100 116 76 Z" fill="${h}"/>`;
  if (p.style === "bun") return `<circle cx="80" cy="26" r="13" fill="${h}"/>`;
  if (p.style === "curly") return [[48, 52, 15], [62, 38, 16], [80, 33, 17], [98, 38, 16], [112, 52, 15], [42, 72, 13], [118, 72, 13]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${h}"/>`).join("");
  if (p.style === "wavy") return `<path d="M42 74 C36 96 40 112 48 118 C52 106 52 92 54 80 Z M118 74 C124 96 120 112 112 118 C108 106 108 92 106 80 Z" fill="${h}"/>`;
  return "";
}
function hairFront(p) {           // 이마를 덮는 앞머리·윗머리
  const h = p.hair;
  if (p.style === "buzz") return `<path d="M47 70 C47 42 64 33 80 33 C96 33 113 42 113 70 C105 56 96 52 80 52 C64 52 55 56 47 70 Z" fill="${h}" opacity=".85"/>`;
  if (p.style === "curly") return `<path d="M46 66 C46 44 62 36 80 36 C98 36 114 44 114 66 C104 52 94 50 80 50 C66 50 56 52 46 66 Z" fill="${h}"/>`;
  return `<path d="M44 72 C42 40 62 28 80 28 C98 28 118 40 116 72 C108 54 98 48 80 48 C62 48 52 54 44 72 Z" fill="${h}"/>`;
}

function svg(name, p) {
  const skin = p.skin, shadow = shade(skin, -22), shirt = p.shirt, hair = p.hair;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="${name}">`,
    `<defs><clipPath id="c"><circle cx="80" cy="80" r="80"/></clipPath></defs>`,
    `<g clip-path="url(#c)">`,
    `<rect width="160" height="160" fill="${p.bg}"/>`,
    hairBack(p),
    // 어깨와 옷
    `<path d="M14 164 C18 134 50 124 80 124 C110 124 142 134 146 164 Z" fill="${shirt}"/>`,
    `<path d="M66 124 L80 142 L94 124 Z" fill="${shade(shirt, -28)}" opacity=".55"/>`,
    // 목
    `<rect x="68" y="102" width="24" height="26" rx="8" fill="${skin}"/>`,
    `<rect x="68" y="108" width="24" height="10" fill="${shadow}" opacity=".35"/>`,
    // 귀
    `<ellipse cx="46" cy="82" rx="5.5" ry="8" fill="${skin}"/><ellipse cx="114" cy="82" rx="5.5" ry="8" fill="${skin}"/>`,
    // 얼굴(정면)
    `<ellipse cx="80" cy="80" rx="34" ry="40" fill="${skin}"/>`,
    p.beard ? `<path d="M48 88 C50 120 110 120 112 88 C104 108 56 108 48 88 Z" fill="${shade(hair, 8)}"/><path d="M68 100 C74 96 86 96 92 100 C86 104 74 104 68 100 Z" fill="${shade(hair, 8)}"/>` : "",
    hairFront(p),
    // 눈썹·눈
    `<path d="M57 68 Q65 63 73 67" stroke="${hair}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M87 67 Q95 63 103 68" stroke="${hair}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    `<ellipse cx="65" cy="78" rx="4.2" ry="4.8" fill="#2a2320"/><ellipse cx="95" cy="78" rx="4.2" ry="4.8" fill="#2a2320"/>`,
    `<circle cx="66.4" cy="76.4" r="1.4" fill="#fff"/><circle cx="96.4" cy="76.4" r="1.4" fill="#fff"/>`,
    p.glasses ? `<circle cx="65" cy="78" r="9.5" fill="none" stroke="#3a3a3a" stroke-width="2"/><circle cx="95" cy="78" r="9.5" fill="none" stroke="#3a3a3a" stroke-width="2"/><path d="M74.5 78 H85.5" stroke="#3a3a3a" stroke-width="2"/>` : "",
    p.freckles ? [[60, 88], [65, 91], [70, 88], [90, 88], [95, 91], [100, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="${shade(skin, -60)}" opacity=".6"/>`).join("") : "",
    // 코·입·볼
    `<path d="M80 80 C78 88 77 91 80 92 C83 92 82 88 80 80" stroke="${shadow}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    `<path d="M67 99 Q80 110 93 99" stroke="${p.beard ? "#5a2a2a" : "#a8514b"}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    `<ellipse cx="56" cy="92" rx="6" ry="3.5" fill="#e98a8a" opacity=".28"/><ellipse cx="104" cy="92" rx="6" ry="3.5" fill="#e98a8a" opacity=".28"/>`,
    `</g></svg>`,
  ];
  return parts.join("\n");
}

for (const [name, p] of Object.entries(PEOPLE)) fs.writeFileSync(new URL(`${name}.svg`, OUT), svg(name, p));
console.log(`아바타 ${Object.keys(PEOPLE).length}개 생성 → site/img/hosts/`);
