// site/js/data.js 의 도시·동네·장소(예시 데이터)를 Supabase 에 넣을 INSERT 문으로 바꾼다.
// 실행: node tools/make-seed.mjs  →  docs/supabase_seed.sql 생성 (여러 번 실행해도 안전: upsert)
import fs from "node:fs";
import { CITIES, NEIGHBORHOODS, PLACES, NEIGHBORHOOD_GEO, PLACE_GEO } from "../site/js/data.js";

const s = (v) => (v == null ? "null" : `'${String(v).replaceAll("'", "''")}'`);
const j = (v) => `${s(JSON.stringify(v ?? {}))}::jsonb`;
const arr = (a) => `array[${(a ?? []).map(s).join(",")}]::text[]`;
const num = (v) => (v == null ? "null" : String(v));

// 도시 메타(시간대·통화·국가). 앱의 data.js 에는 없어서 여기서 정한다.
const META = {
  seoul: ["KR", "Asia/Seoul", "KRW"], tokyo: ["JP", "Asia/Tokyo", "JPY"], osaka: ["JP", "Asia/Tokyo", "JPY"],
  berlin: ["DE", "Europe/Berlin", "EUR"], newyork: ["US", "America/New_York", "USD"], barcelona: ["ES", "Europe/Madrid", "EUR"],
};

const out = [];
out.push(`-- 자동 생성 파일: node tools/make-seed.mjs  (직접 고치지 말고 data.js 를 고친 뒤 다시 생성)
-- 도시 ${CITIES.length}곳, 동네 ${NEIGHBORHOODS.length}곳, 장소 ${PLACES.length}곳. 모두 가상의 예시 데이터. 여러 번 실행해도 안전하다(upsert).

-- 장소 좌표 칸(지도용)
alter table public.places add column if not exists lat double precision;
alter table public.places add column if not exists lng double precision;
`);

out.push("-- 도시");
for (const c of CITIES) {
  const [country, tz, cur] = META[c.id] ?? [null, null, null];
  out.push(`insert into public.cities (id, name, country, timezone, currency, status) values (${s(c.id)}, ${j(c.name)}, ${s(country)}, ${s(tz)}, ${s(cur)}, ${s(c.status)})
  on conflict (id) do update set name = excluded.name, country = excluded.country, timezone = excluded.timezone, currency = excluded.currency, status = excluded.status;`);
}

out.push("\n-- 동네");
for (const n of NEIGHBORHOODS) {
  const g = NEIGHBORHOOD_GEO[n.id];
  out.push(`insert into public.neighborhoods (id, city_id, original, name, tags, summary, center_lat, center_lng) values (${s(n.id)}, ${s(n.city)}, ${s(n.original)}, ${j(n.name)}, ${arr(n.tags)}, ${j(n.summary)}, ${num(g?.[0])}, ${num(g?.[1])})
  on conflict (id) do update set city_id = excluded.city_id, original = excluded.original, name = excluded.name, tags = excluded.tags, summary = excluded.summary, center_lat = excluded.center_lat, center_lng = excluded.center_lng;`);
}

out.push("\n-- 장소 (life_tip = 휴무·결제·좋은 시간·추천 메뉴·혼자 가기 좋음)");
for (const p of PLACES) {
  const g = PLACE_GEO[p.id];
  out.push(`insert into public.places (id, neighborhood_id, category, name, life_tip, lat, lng) values (${s(p.id)}, ${s(p.nb)}, ${s(p.cat)}, ${j(p.name)}, ${j(p.tip)}, ${num(g?.[0])}, ${num(g?.[1])})
  on conflict (id) do update set neighborhood_id = excluded.neighborhood_id, category = excluded.category, name = excluded.name, life_tip = excluded.life_tip, lat = excluded.lat, lng = excluded.lng;`);
}

fs.writeFileSync(new URL("../docs/supabase_seed.sql", import.meta.url), out.join("\n") + "\n");
console.log(`도시 ${CITIES.length}, 동네 ${NEIGHBORHOODS.length}, 장소 ${PLACES.length}`);
const noGeoN = NEIGHBORHOODS.filter((n) => !NEIGHBORHOOD_GEO[n.id]).map((n) => n.id);
const noGeoP = PLACES.filter((p) => !PLACE_GEO[p.id]).map((p) => p.id);
console.log("동네 좌표 없음:", noGeoN, "장소 좌표 없음:", noGeoP);
const badNb = PLACES.filter((p) => !NEIGHBORHOODS.some((n) => n.id === p.nb)).map((p) => p.id);
console.log("동네 참조 오류:", badNb);
