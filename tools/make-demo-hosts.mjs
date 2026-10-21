// 포트폴리오용 예시 현지인 프로필 SQL 을 만든다. 실행: node tools/make-demo-hosts.mjs → docs/supabase_migration_006_demo_hosts.sql
//  · 모든 예시 계정은 이메일이 @demo.roamly.invalid 이고 id 가 de00de00- 로 시작한다(실제 사용자와 겹치지 않는다).
//  · 비밀번호가 없어 로그인할 수 없다. 지울 때는 auth.users 의 해당 계정만 지우면 연결된 모든 데이터가 함께 지워진다.
import fs from "node:fs";
import { NEIGHBORHOODS, PLACES } from "../site/js/data.js";
import { HOSTS } from "./demo-hosts-data.mjs";

const DOMAIN = "demo.roamly.invalid";
const H = HOSTS;

const uuid = (i) => `de00de00-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
const q = (s) => `'${String(s).replaceAll("'", "''")}'`;
const arr = (a) => `array[${a.map(q).join(",")}]::text[]`;
const placesFor = (h) => PLACES.filter((p) => h.nbs.includes(p.nb)).map((p) => p.id);

// 이름·동네·관심사가 실제 데이터와 맞는지 확인
for (const h of H) {
  for (const nb of h.nbs) if (!NEIGHBORHOODS.some((x) => x.id === nb && x.city === h.city)) throw new Error(`${h.n}: unknown neighborhood ${nb}`);
  if (!/^[A-Za-z0-9_가-힣]{2,12}$/.test(h.n)) throw new Error(`${h.n}: invalid nickname`);
  if (h.bio.length > 800) throw new Error(`${h.n}: bio too long`);
}

const out = [];
out.push(`-- =====================================================================
-- Roamly 마이그레이션 006: 포트폴리오용 예시 현지인 프로필 ${H.length}명 (자동 생성: node tools/make-demo-hosts.mjs)
-- 005 다음에 실행한다. 여러 번 실행해도 안전하다(이미 있으면 덮어쓴다).
--
-- ※ 실제 사람이 아닌 예시 프로필이다. 화면에도 '예시 프로필'로 표시된다.
-- ※ 지우는 방법(실제 배포 전에 한 번 실행하면 예시 계정과 연결된 모든 데이터가 함께 지워진다):
--      select public.demo_remove_all();
--    (이메일이 @${DOMAIN} 인 계정만 지운다)
-- ※ 가능한 일정은 demo_topup()이 앞으로 30일치를 자동으로 채운다(화면이 열릴 때 불린다).
-- =====================================================================

alter table public.host_profiles add column if not exists is_demo boolean not null default false;
`);

out.push(`-- ---------- 1. 예시 계정(로그인 불가: 비밀번호 없음) ----------`);
H.forEach((h, i) => {
  out.push(`insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('${uuid(i)}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${h.n}@${DOMAIN}',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"${h.n}","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;`);
});

out.push(`\n-- ---------- 2. 현지인 프로필(신원 확인·공개 상태, 예시 표시) ----------`);
H.forEach((h, i) => {
  out.push(`insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('${uuid(i)}', ${q(h.city)}, ${q(h.bio)}, ${h.years}, 'verified', now(), true, true, ${arr(h.styles)}, ${arr(h.modes)}, ${arr(h.nbs)}, ${arr(placesFor(h))}, ${h.hours}, ${h.cost ? q(h.cost) : "null"})
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = '${uuid(i)}';
insert into public.host_interests (host_id, interest_id) values ${h.ints.map((x) => `('${uuid(i)}', ${q(x)})`).join(", ")};
delete from public.host_languages where host_id = '${uuid(i)}';
insert into public.host_languages (host_id, language, level) values ${h.langs.map(([l, lv]) => `('${uuid(i)}', ${q(l)}, ${q(lv)})`).join(", ")};`);
});

// 요일 패턴(0=일 … 6=토)은 JSON 으로 함수에 넣어 둔다
const dowMap = H.map((h, i) => `    ('${uuid(i)}'::uuid, ${arr(h.dow.map(String))})`).join(",\n");
out.push(`
-- ---------- 3. 가능 일정 자동 채우기 / 전체 제거 ----------
-- 예시 현지인의 오늘부터 30일치 일정을 채운다(요일별 오전 10~13시, 오후 14~17시). 이미 있으면 건드리지 않는다.
create or replace function public.demo_topup() returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.availability (host_id, day, start_time, end_time)
  select d.host_id, g.day, s.st, s.et
    from (values
${dowMap}
    ) as d(host_id, dows)
    join public.host_profiles h on h.user_id = d.host_id and h.is_demo
    cross join lateral generate_series(current_date, current_date + 30, interval '1 day') as gs(ts)
    cross join lateral (select gs.ts::date as day) g
    cross join lateral (values ('10:00'::time, '13:00'::time), ('14:00'::time, '17:00'::time)) as s(st, et)
   where extract(dow from g.day)::int::text = any (d.dows)
     and (s.st = '10:00'::time or extract(dow from g.day)::int in (0, 6))      -- 평일은 오전만, 주말은 오전·오후
  on conflict (host_id, day, start_time) do nothing;
end $$;
revoke execute on function public.demo_topup() from public, anon;
grant execute on function public.demo_topup() to authenticated;
select public.demo_topup();

-- 예시 계정과 연결된 모든 데이터(프로필·관심사·일정·요청·대화·후기·즐겨찾기)를 한 번에 지운다. 운영자(SQL Editor)만 실행할 수 있다.
create or replace function public.demo_remove_all() returns int
language plpgsql security definer set search_path = public, auth as $$
declare n int;
begin
  if not (public.is_admin() or public.is_service()) then raise exception 'admin only'; end if;
  delete from auth.users where email like '%@${DOMAIN}';
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.demo_remove_all() from public, anon, authenticated;
`);

fs.writeFileSync(new URL("../docs/supabase_migration_006_demo_hosts.sql", import.meta.url), out.join("\n") + "\n");
console.log(`예시 현지인 ${H.length}명 (도시별: ${[...new Set(H.map((h) => h.city))].map((c) => c + " " + H.filter((h) => h.city === c).length).join(", ")})`);
