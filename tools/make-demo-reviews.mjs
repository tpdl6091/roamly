// 예시 현지인 60명에게 달 '예시 후기' SQL 을 만든다. 실행: node tools/make-demo-reviews.mjs → docs/supabase_migration_009_demo_reviews.sql
//  · 현지인 한 명당 6~14개(고정 시드라 다시 실행해도 같은 결과). 006 다음에 실행한다.
//  · 후기를 쓰는 '예시 여행자' 계정도 @demo.roamly.invalid 이메일이라 demo_remove_all() 한 번이면 후기·만남 요청까지 함께 지워진다.
//  · 후기는 '완료된 만남'이 있어야 쓸 수 있어서, 후기마다 완료된 예시 만남(match_requests)을 함께 만든다.
import fs from "node:fs";
import { NEIGHBORHOODS, PLACES } from "../site/js/data.js";
import { MATCH_T } from "../site/js/i18n-match.js";
import { HOSTS } from "./demo-hosts-data.mjs";

const DOMAIN = "demo.roamly.invalid";
const hostUuid = (i) => `de00de00-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
const revUuid = (i) => `de00de01-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
const reqUuid = (i) => `de00de02-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
const rvwUuid = (i) => `de00de03-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
const q = (s) => `'${String(s).replaceAll("'", "''")}'`;

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const r = rng(20261020);
const pick = (a) => a[Math.floor(r() * a.length)];
const chance = (p) => r() < p;

// ---------- 예시 여행자(후기를 쓰는 사람) ----------
const NAMES = {
  ko: ["하늘", "지안", "서윤", "도윤", "예린", "시우", "하린", "유나", "준서", "나연", "태오", "소율", "민서", "지후", "다은"],
  en: ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Mia", "Lucas", "Ella", "Owen", "Chloe", "Henry", "Ruby", "Jack"],
  ja: ["Haruka", "Sota", "Yui", "Kaito", "Misaki", "Ren", "Nanami", "Daiki", "Aya", "Takuya"],
  zh: ["Xiaoyu", "Weiming", "Lanlan", "Haoran", "Meiling", "Zihan"],
  es: ["Lucia", "Mateo", "Sofia", "Diego", "Valeria", "Pablo"],
  de: ["Greta", "Moritz", "Lena", "Jannik", "Frieda", "Tobias"],
};
const COUNTS = { ko: 30, en: 24, ja: 14, zh: 8, es: 7, de: 7 };
const hostNames = new Set(HOSTS.map((h) => h.n.toLowerCase()));
const used = new Set(hostNames);
const REVIEWERS = [];
for (const [lang, n] of Object.entries(COUNTS)) {
  for (let k = 0; k < n; k++) {
    const base = NAMES[lang][k % NAMES[lang].length];
    let nick = k < NAMES[lang].length ? base : base + (2 + Math.floor(k / NAMES[lang].length));
    if (nick.length > 12) nick = nick.slice(0, 12);
    let tries = 0;
    while (used.has(nick.toLowerCase())) nick = base.slice(0, 9) + (10 + (tries++ % 90));
    used.add(nick.toLowerCase());
    REVIEWERS.push({ nick, lang });
  }
}
for (const x of REVIEWERS) if (!/^[A-Za-z0-9_가-힣]{2,12}$/.test(x.nick)) throw new Error("닉네임 형식: " + x.nick);

// ---------- 후기 문장 조각 ----------
// {nb}=동네, {act}=활동, {place}=장소. 앞에서부터 '무엇을 했나 → 현지인 인상 → 기억에 남는 순간 → 마무리' 순으로 붙인다.
const T = {
  ko: {
    did: ["{nb}에서 {h}시간 정도 같이 걸었어요.", "{nb} 쪽으로 코스를 짜 주셔서 편하게 둘러봤어요.", "{nb} 골목을 돌며 이런저런 이야기를 많이 나눴어요.", "첫 만남이라 긴장했는데 {nb}에서 자연스럽게 시작했어요.", "{nb}에서 오전을 여유롭게 보냈어요.", "짧은 일정이었는데 {nb} 중심으로 알차게 돌아봤어요."],
    host: ["약속 시간을 정확히 지키셨고 연락도 빨랐어요.", "말투가 편안해서 처음 만났는데도 어색하지 않았어요.", "제가 걷는 속도에 맞춰 주셔서 편하게 다녔어요.", "질문에 하나하나 친절하게 답해 주셨어요.", "관광 책자에 없는 이야기를 많이 들려주셨어요.", "취향을 먼저 물어보고 거기에 맞춰 안내해 주셨어요."],
    placeS: ["{place}에 들렀는데 현지 분이 아니면 몰랐을 곳이라 좋았어요.", "특히 {place}가 기억에 남아요.", "{place}는 혼자였으면 그냥 지나쳤을 것 같아요.", "{place}에서 쉬어 가며 이야기한 시간이 제일 좋았어요."],
    noPlace: ["동네의 숨은 골목을 알려 주셔서 혼자 다닐 때와 완전히 달랐어요.", "점심을 어디서 먹으면 좋은지도 알려 주셔서 도움이 됐어요.", "사진 찍기 좋은 자리를 짚어 주셔서 사진이 잘 나왔어요.", "돌아가는 길까지 챙겨 주셔서 마음이 놓였어요."],
    end: ["또 오게 되면 다시 만나고 싶어요.", "혼자 여행하는 분께 추천해요.", "덕분에 이 도시가 좋아졌어요.", "시간이 더 길었다면 좋았을 거예요.", "만족스러운 만남이었어요."],
    mild: ["다만 이동 거리가 조금 길어서 힘들었어요.", "일정이 조금 빠듯했지만 전반적으로 괜찮았어요.", "대화가 조금 어색한 순간도 있었지만 금방 풀렸어요.", "날씨 때문에 계획을 바꿨는데 그래도 즐거웠어요."],
  },
  en: {
    did: ["We spent about {h} hours around {nb}.", "They built a little route around {nb} for me.", "We wandered the side streets of {nb} and chatted the whole time.", "I was nervous meeting someone new, but {nb} made it easy.", "A relaxed morning in {nb}.", "It was a short trip, yet we covered a lot of {nb}."],
    host: ["Showed up right on time and replied quickly before we met.", "Very easy to talk to — it never felt awkward.", "Walked at my pace and never rushed me.", "Answered every question patiently.", "Shared stories you won't find in any guidebook.", "Asked what I like first, then tailored everything to it."],
    placeS: ["We stopped at {place}, which I'd never have found alone.", "{place} was my favorite stop.", "I would have walked right past {place} without them.", "Sitting down at {place} for a chat was the best part."],
    noPlace: ["They showed me hidden alleys that felt nothing like a tourist route.", "Great tip on where to have lunch nearby.", "Pointed out good photo spots and my pictures turned out great.", "They even made sure I got back safely."],
    end: ["I'd happily meet again next time.", "Recommended for solo travelers.", "It made me like the city even more.", "I just wish we had more time.", "A genuinely good experience."],
    mild: ["The walking distance was a bit long for me.", "The schedule felt a little tight, but overall fine.", "A few awkward moments at first, which faded quickly.", "We had to change plans because of the weather, still fun."],
  },
  ja: {
    did: ["{nb}を中心に{h}時間ほど歩きました。", "{nb}でコースを考えてくださいました。", "{nb}の路地をめぐりながらたくさん話しました。", "初対面で緊張しましたが、{nb}で自然に始められました。", "午前中、{nb}でのんびり過ごしました。", "短い日程でしたが、{nb}をしっかり回れました。"],
    host: ["待ち合わせの時間をきちんと守ってくださり、連絡も早かったです。", "話しやすくて、初めてでも気まずくなりませんでした。", "私の歩く速さに合わせてくださって楽でした。", "質問に一つひとつ丁寧に答えてくださいました。", "ガイドブックにない話をたくさん聞けました。", "先に好みを聞いて、それに合わせて案内してくださいました。"],
    placeS: ["{place}に立ち寄りましたが、地元の方でないと分からない場所でした。", "特に{place}が印象に残っています。", "{place}は一人なら通り過ぎていたと思います。", "{place}で休みながら話した時間が一番よかったです。"],
    noPlace: ["街の隠れた路地を教えてもらえて、一人で歩くのとは全然違いました。", "近くでお昼を食べる場所も教えてもらえて助かりました。", "写真映えするスポットを教えてもらい、きれいに撮れました。", "帰り道まで気にかけてくださって安心でした。"],
    end: ["また来たらぜひお会いしたいです。", "一人旅の方におすすめです。", "おかげでこの街が好きになりました。", "もっと時間があればよかったです。", "満足できる出会いでした。"],
    mild: ["ただ、移動距離が少し長くて疲れました。", "日程は少しタイトでしたが、全体的には良かったです。", "最初は少し気まずい瞬間もありましたが、すぐ解けました。", "天気で予定を変えましたが、それでも楽しかったです。"],
  },
  zh: {
    did: ["我们在{nb}一带逛了大约{h}小时。", "对方围绕{nb}安排了路线。", "我们边逛{nb}的小巷边聊天。", "第一次见面有点紧张，但在{nb}很自然。", "上午在{nb}度过了轻松的时光。", "行程很短，但把{nb}逛得很充实。"],
    host: ["非常准时，见面前回复也很快。", "很好聊，第一次见面也不尴尬。", "会配合我的步调，一点也不赶。", "每个问题都耐心回答。", "讲了很多旅游指南上没有的故事。", "先问了我的喜好，再按喜好来带路。"],
    placeS: ["我们去了{place}，没有当地人带路根本找不到。", "最难忘的是{place}。", "如果一个人，我大概会直接路过{place}。", "在{place}坐下来聊天的时光最棒。"],
    noPlace: ["带我走了不少隐蔽的小巷，和自己逛完全不同。", "还推荐了附近吃午饭的地方，很有帮助。", "告诉我哪里适合拍照，照片都很好看。", "连回去的路也照顾到了，很安心。"],
    end: ["下次来还想再见面。", "推荐给一个人旅行的朋友。", "多亏他/她，我更喜欢这座城市了。", "要是时间更长就好了。", "是一次令人满意的见面。"],
    mild: ["不过步行距离有点长，比较累。", "行程稍微有点紧，但整体不错。", "一开始有些尴尬，很快就好了。", "因为天气改了计划，但依然很开心。"],
  },
  es: {
    did: ["Pasamos unas {h} horas por {nb}.", "Armó una pequeña ruta por {nb} para mí.", "Paseamos por las callejuelas de {nb} charlando todo el rato.", "Estaba nervioso/a por conocer a alguien nuevo, pero {nb} lo hizo fácil.", "Una mañana tranquila en {nb}.", "Fue un viaje corto, pero recorrimos mucho de {nb}."],
    host: ["Llegó puntual y respondió rápido antes de vernos.", "Muy fácil de hablar, nunca fue incómodo.", "Caminó a mi ritmo sin meterme prisa.", "Respondió a todas mis preguntas con paciencia.", "Contó historias que no salen en ninguna guía.", "Primero preguntó mis gustos y adaptó todo a ellos."],
    placeS: ["Paramos en {place}, un sitio que yo solo no habría encontrado.", "{place} fue mi parada favorita.", "Sin esta persona habría pasado de largo por {place}.", "Sentarnos a charlar en {place} fue lo mejor."],
    noPlace: ["Me enseñó callejones escondidos que no tenían nada de ruta turística.", "Buen consejo para comer por la zona.", "Me indicó buenos rincones para fotos y salieron genial.", "Incluso se aseguró de que volviera sano y salvo."],
    end: ["Repetiría sin dudarlo.", "Lo recomiendo a quien viaja solo.", "Me hizo querer aún más la ciudad.", "Ojalá hubiéramos tenido más tiempo.", "Una experiencia muy buena."],
    mild: ["Eso sí, la caminata fue un poco larga para mí.", "El horario fue algo justo, pero en general bien.", "Hubo algún momento incómodo al principio, que pasó rápido.", "Cambiamos el plan por el tiempo, pero fue divertido igual."],
  },
  de: {
    did: ["Wir waren etwa {h} Stunden in {nb} unterwegs.", "Es gab eine kleine Route durch {nb}.", "Wir sind durch die Seitenstraßen von {nb} gelaufen und haben die ganze Zeit geredet.", "Ich war vor dem ersten Treffen nervös, aber {nb} war ein guter Einstieg.", "Ein entspannter Vormittag in {nb}.", "Es war kurz, aber wir haben viel von {nb} gesehen."],
    host: ["Sehr pünktlich und schon vorab schnell erreichbar.", "Super unkompliziert, nie unangenehm.", "Ist in meinem Tempo gelaufen und hat nie gedrängt.", "Hat alle Fragen geduldig beantwortet.", "Hat Geschichten erzählt, die in keinem Reiseführer stehen.", "Hat zuerst nach meinem Geschmack gefragt und alles darauf abgestimmt."],
    placeS: ["Wir waren bei {place} – allein hätte ich das nie gefunden.", "{place} war mein Lieblingsstopp.", "An {place} wäre ich ohne Begleitung vorbeigelaufen.", "Das Gespräch bei {place} war der schönste Moment."],
    noPlace: ["Es gab versteckte Gassen, die gar nicht nach Touristenroute aussahen.", "Guter Tipp fürs Mittagessen in der Nähe.", "Hat gute Fotospots gezeigt, die Bilder sind richtig gut geworden.", "Hat sogar darauf geachtet, dass ich sicher zurückkomme."],
    end: ["Beim nächsten Mal gern wieder.", "Empfehlenswert für Alleinreisende.", "Dadurch mag ich die Stadt noch mehr.", "Ich hätte mir mehr Zeit gewünscht.", "Eine wirklich gute Erfahrung."],
    mild: ["Der Weg war für mich allerdings etwas weit.", "Der Zeitplan war etwas eng, insgesamt aber gut.", "Am Anfang gab es kurz Verlegenheit, die schnell verflog.", "Wegen des Wetters mussten wir umplanen, trotzdem schön."],
  },
};

const nbById = Object.fromEntries(NEIGHBORHOODS.map((n) => [n.id, n]));
const nbLabel = (id, lang) => (lang === "ko" ? nbById[id].name.ko : lang === "en" ? nbById[id].name.en : nbById[id].original);
const placeLabel = (p, lang) => p.name[lang] ?? p.name.en ?? Object.values(p.name)[0];

// 한 번 고른 문장 번호로 6개 언어 버전을 모두 만든다. 후기의 원래 언어(rev.lang)는 DB 에 넣고, 나머지는 '번역하기' 버튼용 번역본이다.
// 난수를 쓰는 순서와 횟수는 예전 버전과 똑같이 유지한다(이미 DB 에 들어간 만남과 후기가 어긋나지 않게).
function writeBody(host, rev, rating, hours) {
  const nbId = pick(host.nbs);
  const actId = pick(host.ints);
  const places = PLACES.filter((p) => p.nb === nbId);
  const T0 = T[rev.lang];
  const idx = (arr) => Math.floor(r() * arr.length);
  const sel = [{ k: "did", i: idx(T0.did) }, { k: "host", i: idx(T0.host) }];
  if (places.length && chance(0.6)) sel.push({ k: "placeS", i: idx(T0.placeS) }); else sel.push({ k: "noPlace", i: idx(T0.noPlace) });
  if (rating <= 4 && chance(rating <= 3 ? 0.9 : 0.35)) sel.push({ k: "mild", i: idx(T0.mild) });
  if (rating >= 4 && chance(0.7)) sel.push({ k: "end", i: idx(T0.end) });      // 낮은 점수에는 칭찬 마무리를 붙이지 않는다
  // 예전 코드는 문장마다 장소를 하나씩 뽑았다(장소가 있는 동네에서만). 같은 횟수만큼 뽑아 둔다.
  const placePick = sel.map(() => (places.length ? Math.floor(r() * places.length) : -1));
  const render = (lang) => {
    const tpl = T[lang];
    const act = MATCH_T[lang]["mi_" + actId].replace(/^Cycling$/, "Bike rides");   // 영어 라벨 'Cycling' 은 쓰지 않는다
    const actText = lang === "en" || lang === "es" ? act.toLowerCase() : act;
    const fill = (str, k) => str.replaceAll("{nb}", nbLabel(nbId, lang)).replaceAll("{act}", actText).replaceAll("{h}", hours).replaceAll("{place}", placePick[k] >= 0 ? placeLabel(places[placePick[k]], lang) : "");
    const sep = lang === "ja" || lang === "zh" ? "" : " ";
    return { body: sel.map((x, k) => fill(tpl[x.k][x.i], k)).join(sep), act };
  };
  const mine = render(rev.lang);
  const all = Object.fromEntries(Object.keys(T).map((l) => [l, render(l).body]));
  return { body: mine.body, act: mine.act, nbId, all };
}

// 1~5점 중 대부분 4~5점. 현지인마다 약간의 성향 차이를 둔다.
function rate(bias) {
  const x = r() + bias;
  return x > 0.42 ? 5 : x > 0.1 ? 4 : x > 0.0 ? 3 : 2;
}
const clamp = (v) => Math.max(1, Math.min(5, v));
const sub = (o) => clamp(o + (chance(0.25) ? -1 : 0) + (chance(0.1) ? 1 : 0));

// ---------- SQL ----------
const out = [];
out.push(`-- =====================================================================
-- Roamly 마이그레이션 009: 예시 현지인의 예시 후기 (자동 생성: node tools/make-demo-reviews.mjs)
-- 006 다음에 실행한다. 여러 번 실행해도 안전하다(이미 있으면 건너뛴다).
--
-- ※ 실제 후기가 아닌 예시 문장이다. 후기를 쓰는 예시 여행자 ${REVIEWERS.length}명도 @${DOMAIN} 계정(로그인 불가)이다.
-- ※ 지우려면 006의 select public.demo_remove_all(); 한 번이면 이 후기·예시 만남까지 함께 지워진다.
-- =====================================================================
`);

out.push(`-- ---------- 1. 예시 여행자 계정(로그인 불가) ----------`);
REVIEWERS.forEach((v, i) => out.push(`insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('${revUuid(i)}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rv_${v.nick.toLowerCase()}@${DOMAIN}',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"${v.nick}","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;`));

const reqs = [], rvws = [], fix = [];
const I18N = {};
let n = 0;
const today = new Date("2026-10-20T00:00:00Z");
const perHost = {};
HOSTS.forEach((h, hi) => {
  const count = 6 + Math.floor(r() * 9);                                    // 6~14개
  perHost[h.n] = count;
  const bias = (r() - 0.5) * 0.3;
  const order = REVIEWERS.map((_, i) => i).sort(() => r() - 0.5).slice(0, count);   // 같은 사람이 한 현지인에게 두 번 쓰지 않는다
  for (const ri of order) {
    const rev = REVIEWERS[ri];
    const rating = rate(bias);
    const hours = 2 + Math.floor(r() * 3);
    const { body, act, all } = writeBody(h, rev, rating, hours);
    I18N[rvwUuid(n)] = { lang: rev.lang, t: Object.fromEntries(Object.entries(all).filter(([l]) => l !== rev.lang)) };
    const daysAgo = 5 + Math.floor(r() * 420);
    const meet = new Date(today.getTime() - daysAgo * 86400000);
    const written = new Date(meet.getTime() + (1 + Math.floor(r() * 4)) * 86400000 + Math.floor(r() * 12) * 3600000 + 36000000);
    const start = pick(["10:00", "14:00"]);
    const end = `${String(Number(start.slice(0, 2)) + hours).padStart(2, "0")}:00`;
    const nbText = nbLabel(pick(h.nbs), rev.lang);
    reqs.push(`  ('${reqUuid(n)}', '${revUuid(ri)}', '${hostUuid(hi)}', ${q(h.city)}, '${meet.toISOString().slice(0, 10)}', '${start}', '${end}', ${q(act.slice(0, 80))}, ${q(nbText.slice(0, 120))})`);
    rvws.push(`  ('${rvwUuid(n)}', '${reqUuid(n)}', '${revUuid(ri)}', '${hostUuid(hi)}', ${rating}, ${sub(rating)}, ${sub(rating)}, ${sub(rating)}, ${q(body)}, ${q(act.slice(0, 40))})`);
    fix.push(`  ('${rvwUuid(n)}'::uuid, '${written.toISOString()}'::timestamptz)`);
    n++;
  }
});

out.push(`\n-- ---------- 2. 완료된 예시 만남(후기는 완료된 만남이 있어야 쓸 수 있다) ----------
insert into public.match_requests (id, traveler_id, host_id, city_id, meet_date, start_time, end_time, activity, area, status)
select v.id::uuid, v.t::uuid, v.h::uuid, v.city, v.d::date, v.s::time, v.e::time, v.act, v.area, 'completed'
from (values
${reqs.join(",\n")}
) as v(id, t, h, city, d, s, e, act, area)
on conflict (id) do nothing;`);

out.push(`\n-- ---------- 3. 예시 후기(대상·상태는 trigger 가 정한다) ----------
insert into public.reviews (id, request_id, reviewer_id, target_id, rating_overall, rating_communication, rating_punctuality, rating_activity, body, activity_type)
select v.id::uuid, v.req::uuid, v.rev::uuid, v.host::uuid, v.o, v.c, v.p, v.a, v.body, v.act
from (values
${rvws.join(",\n")}
) as v(id, req, rev, host, o, c, p, a, body, act)
on conflict (id) do nothing;

-- trigger 가 작성 시각을 '지금'으로 덮어쓰므로, 만남 뒤 며칠 안으로 보이게 되돌려 놓는다
update public.reviews r set created_at = f.ts
from (values
${fix.join(",\n")}
) as f(id, ts)
where r.id = f.id;
`);

fs.writeFileSync(new URL("../docs/supabase_migration_009_demo_reviews.sql", import.meta.url), out.join("\n") + "\n");

const counts = Object.values(perHost);
console.log(`후기 ${n}개 · 현지인 ${HOSTS.length}명 · 인당 ${Math.min(...counts)}~${Math.max(...counts)}개 · 예시 여행자 ${REVIEWERS.length}명`);

// '번역하기' 버튼용 번역본: 후기 id → { lang: 원래 언어, t: { 나머지 언어별 본문 } }. 화면에서 번역을 눌렀을 때만 불러온다.
fs.writeFileSync(new URL("../site/js/data-demo-review-i18n.js", import.meta.url),
  `// 예시 후기 번역본(자동 생성: node tools/make-demo-reviews.mjs). 후기의 원래 언어와 다른 언어를 쓰는 사용자가 '번역하기'를 누르면 쓴다.\n// DB 의 예시 후기 id 와 같은 키를 쓴다. 실제 사용자가 쓴 후기에는 번역본이 없어서 버튼이 보이지 않는다.\nexport const DEMO_REVIEW_I18N = ${JSON.stringify(I18N)};\n`);
