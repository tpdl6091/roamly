-- =====================================================================
-- Roamly Supabase 스키마 v0.2  (로컬 Postgres(WASM)에서 실행·RLS 시나리오 39건 통과. 실제 Supabase에서는 아직 실행 전)
--
-- 사용법: Supabase 대시보드 → SQL Editor 에 붙여 넣고 실행. 오류가 나면 줄 번호와 함께 알려 주세요.
-- 기준 문서: docs/solo_travel_data_model.md, docs/solo_travel_service_plan.md (8-3 확정 규칙)
--
-- 보안 원칙
--  1) 모든 테이블에 RLS(행 단위 접근 규칙)를 켠다. 규칙이 없으면 아무도 접근하지 못한다.
--  2) 신뢰 필드(작성자 역할, 체크인 확인, 검수 상태, 작성 시각)는 서버(트리거·함수)가 정하고, 사용자가 직접 바꿀 수 없다.
--  3) 운영자는 JWT의 app_metadata.role = 'admin' 으로 구분한다. app_metadata 는 사용자가 바꿀 수 없다(서버에서만 설정).
--  4) service_role(비밀) 키는 브라우저 코드에 절대 넣지 않는다.
-- =====================================================================

-- ---------- 0. 공통 ----------
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- 서버 안에서만 쓰는 '신뢰 필드 수정 허용' 표시 (함수 안에서 켜고, 트랜잭션이 끝나면 꺼진다)
create or replace function public.internal_on() returns boolean
language sql stable as $$
  select coalesce(current_setting('roamly.internal', true), '') = 'on'
$$;

-- ---------- 1. 사용자 ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  ui_language text not null default 'ko' check (ui_language in ('ko','en','ja','zh','es','de')),
  home_country text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
-- 작성자 이름은 글과 함께 보이므로 누구나 읽을 수 있다(민감한 정보는 이 표에 넣지 않는다)
create policy profiles_read on public.profiles for select using (true);
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- 가입하면 프로필을 자동으로 만든다
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- >>> username (아이디=닉네임: 2~12자의 한글·영문·숫자·밑줄, 대소문자 구분 없이 중복 불가)
alter table public.profiles drop constraint if exists profiles_name_format;
alter table public.profiles add constraint profiles_name_format
  check (display_name = '' or display_name ~ '^[A-Za-z0-9_가-힣]{2,12}$');
create unique index if not exists profiles_display_name_unique on public.profiles (lower(display_name)) where display_name <> '';

-- 가입할 때 보낸 이름이 형식에 맞을 때만 프로필에 저장한다(맞지 않으면 빈 이름)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_name text := coalesce(new.raw_user_meta_data ->> 'name', '');
begin
  if v_name !~ '^[A-Za-z0-9_가-힣]{2,12}$' then v_name := ''; end if;
  insert into public.profiles (id, display_name) values (new.id, v_name);
  return new;
end $$;

-- 가입 화면에서 아이디가 비어 있는지 미리 확인한다(로그인하기 전이라 anon 도 부를 수 있다)
create or replace function public.username_available(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where lower(display_name) = lower(p_name))
$$;
revoke execute on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
-- <<< username

create table public.taste_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  place_tags text[] not null default '{}',
  travel_style text,
  pain_points text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.taste_profiles enable row level security;
create policy taste_own on public.taste_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- 2. 도시·동네·장소 (운영자만 쓰고, 누구나 읽는다) ----------
create table public.cities (
  id text primary key,                         -- 'seoul', 'tokyo' ...
  name jsonb not null,                         -- {"ko":"서울","en":"Seoul",...}
  country text,
  timezone text,
  currency text,
  status text not null default 'soon' check (status in ('open','soon'))
);
create table public.neighborhoods (
  id text primary key,
  city_id text not null references public.cities(id),
  original text,
  name jsonb not null,
  tags text[] not null default '{}',
  summary jsonb not null default '{}'::jsonb,
  center_lat double precision,
  center_lng double precision
);
create table public.places (
  id text primary key,
  neighborhood_id text not null references public.neighborhoods(id),
  category text not null check (category in ('cafe','restaurant','park','market','bookstore','shop')),
  name jsonb not null,
  life_tip jsonb not null default '{}'::jsonb, -- 휴무 요일·결제·좋은 시간·추천 메뉴·혼자 가기 좋음
  status text not null default 'published' check (status in ('published','under_review','hidden')),
  created_at timestamptz not null default now(),
  lat double precision,                        -- 지도 표시용 좌표(예시 장소는 대략값)
  lng double precision
);
create index on public.neighborhoods (city_id);
create index on public.places (neighborhood_id);

alter table public.cities enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.places enable row level security;
create policy cities_read on public.cities for select using (true);
create policy nbs_read on public.neighborhoods for select using (true);
create policy places_read on public.places for select using (status <> 'hidden' or public.is_admin());
create policy cities_admin on public.cities for all using (public.is_admin()) with check (public.is_admin());
create policy nbs_admin on public.neighborhoods for all using (public.is_admin()) with check (public.is_admin());
create policy places_admin on public.places for all using (public.is_admin()) with check (public.is_admin());

-- 도시 요청: 한 사람이 같은 도시는 한 번만. 개수는 아래 뷰로만 공개한다.
create table public.city_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  city_name text not null check (char_length(city_name) between 1 and 60),
  created_at timestamptz not null default now()
);
create unique index city_requests_unique on public.city_requests (user_id, lower(city_name));
alter table public.city_requests enable row level security;
create policy city_requests_insert on public.city_requests for insert with check (user_id = auth.uid());
create policy city_requests_own on public.city_requests for select using (user_id = auth.uid() or public.is_admin());
-- 뷰는 소유자 권한으로 실행되어 집계 결과만 공개한다(개별 요청자는 보이지 않는다)
create view public.city_request_counts as
  select lower(city_name) as key, min(city_name) as name, count(*)::int as requests
  from public.city_requests group by lower(city_name);
grant select on public.city_request_counts to anon, authenticated;

-- ---------- 3. 호스트(현지인) ----------
create table public.host_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  home_city_id text references public.cities(id),
  years_in_city int check (years_in_city between 0 and 80),
  bio text,
  languages text[] not null default '{}',
  interests text[] not null default '{}',
  identity_status text not null default 'none' check (identity_status in ('none','pending','verified')),
  verified_at timestamptz
);
alter table public.host_profiles enable row level security;
-- 인증을 마친 호스트만 공개된다
create policy host_read on public.host_profiles for select
  using (identity_status = 'verified' or user_id = auth.uid() or public.is_admin());
create policy host_write_own on public.host_profiles for insert with check (user_id = auth.uid());
create policy host_update_own on public.host_profiles for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
-- 신원 확인 상태는 운영자만 바꿀 수 있다
create or replace function public.protect_host_verification() returns trigger
language plpgsql as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.identity_status := 'none'; new.verified_at := null;
    else
      new.identity_status := old.identity_status; new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end $$;
create trigger host_protect before insert or update on public.host_profiles
  for each row execute function public.protect_host_verification();

-- ---------- 4. 콘텐츠(장소 추천·생활 팁) ----------
create table public.contents (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'place_rec' check (type in ('place_rec','life_tip')),
  author_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  place_id text not null references public.places(id),
  original_language text not null check (original_language in ('ko','en','ja','zh','es','de')),
  body text not null check (char_length(body) between 10 and 1500),
  tip jsonb not null default '{}'::jsonb,
  visit_date date not null,
  written_at timestamptz not null default now(),
  author_role text not null default 'traveler' check (author_role in ('traveler','local')),
  declared_visit boolean not null check (declared_visit),       -- 방문 선언(필수)
  not_affiliated boolean not null check (not_affiliated),       -- 장소 관계자 아님 선언(필수)
  checkin_verified boolean not null default false,              -- 현장 체크인(서버 함수만 true로 바꿈)
  sponsored text not null default 'none' check (sponsored in ('none','gifted','paid','affiliate')),
  status text not null default 'published' check (status in ('published','under_review','hidden'))
);
create index on public.contents (place_id, written_at desc);
create index on public.contents (author_id);

create table public.content_translations (
  content_id uuid not null references public.contents(id) on delete cascade,
  language text not null check (language in ('ko','en','ja','zh','es','de')),
  body text not null,
  engine text,
  translated_at timestamptz not null default now(),
  primary key (content_id, language)
);

alter table public.contents enable row level security;
alter table public.content_translations enable row level security;
create policy contents_read on public.contents for select
  using (status <> 'hidden' or author_id = auth.uid() or public.is_admin());
create policy contents_insert on public.contents for insert with check (author_id = auth.uid());
create policy contents_update on public.contents for update
  using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy contents_delete on public.contents for delete using (author_id = auth.uid() or public.is_admin());
create policy translations_read on public.content_translations for select using (true);
create policy translations_admin on public.content_translations for all using (public.is_admin()) with check (public.is_admin());

-- 작성할 때: 신뢰 필드를 서버가 정한다 (사용자가 보낸 값은 무시)
create or replace function public.contents_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_city text;
begin
  if new.visit_date > current_date + 1 then
    raise exception 'visit_date cannot be in the future';
  end if;
  new.written_at := now();
  new.checkin_verified := false;
  new.status := 'published';
  select n.city_id into v_city
    from public.places p join public.neighborhoods n on n.id = p.neighborhood_id where p.id = new.place_id;
  -- 현지인 라벨: 신원 확인을 마친 호스트이고 그 도시에 사는 경우에만
  new.author_role := case when exists (
      select 1 from public.host_profiles h
      where h.user_id = new.author_id and h.identity_status = 'verified' and h.home_city_id = v_city
    ) then 'local' else 'traveler' end;
  return new;
end $$;
create trigger contents_bi before insert on public.contents
  for each row execute function public.contents_before_insert();

-- 수정할 때: 운영자나 서버 함수가 아니면 신뢰 필드는 그대로 둔다
create or replace function public.contents_before_update() returns trigger
language plpgsql as $$
begin
  if not public.is_admin() and not public.internal_on() then
    new.author_id := old.author_id;
    new.place_id := old.place_id;
    new.visit_date := old.visit_date;
    new.written_at := old.written_at;
    new.author_role := old.author_role;
    new.declared_visit := old.declared_visit;
    new.checkin_verified := old.checkin_verified;
    new.status := old.status;
  end if;
  return new;
end $$;
create trigger contents_bu before update on public.contents
  for each row execute function public.contents_before_update();

-- 현장 체크인: 좌표는 이 함수 안에서 거리만 계산하고 저장하지 않는다.
-- 방문일이 오늘·어제(서버 UTC 기준)일 때만, 장소가 속한 동네 중심에서 반경 안일 때만 true.
-- ※ 예시 장소는 동네 중심 기준 1500m. 실제 장소 좌표가 생기면 반경을 100~200m로 줄인다.
create or replace function public.verify_checkin(p_content uuid, p_lat double precision, p_lng double precision, p_radius_m double precision default 1500)
returns boolean language plpgsql security definer set search_path = public as $$
declare c public.contents%rowtype; n public.neighborhoods%rowtype; d double precision;
begin
  select * into c from public.contents where id = p_content and author_id = auth.uid();
  if not found then return false; end if;
  if c.visit_date < current_date - 1 or c.visit_date > current_date then return false; end if;
  select nb.* into n from public.places p join public.neighborhoods nb on nb.id = p.neighborhood_id where p.id = c.place_id;
  if n.center_lat is null then return false; end if;
  d := 2 * 6371000 * asin(sqrt(
        power(sin(radians(p_lat - n.center_lat) / 2), 2)
        + cos(radians(n.center_lat)) * cos(radians(p_lat)) * power(sin(radians(p_lng - n.center_lng) / 2), 2)));
  if d <= p_radius_m then
    perform set_config('roamly.internal', 'on', true);
    update public.contents set checkin_verified = true where id = c.id;
    return true;
  end if;
  return false;
end $$;
revoke execute on function public.verify_checkin(uuid, double precision, double precision, double precision) from public, anon;
grant execute on function public.verify_checkin(uuid, double precision, double precision, double precision) to authenticated;

-- ---------- 5. 신고·검수·'여전히 맞아요' ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  target_type text not null check (target_type in ('place','content')),
  target_id text not null,                       -- places.id 또는 contents.id(문자열)
  reason text not null check (reason in ('ad','fake','outdated','other')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,                       -- 운영자가 검수를 끝내면 채운다(이후 집계에서 제외)
  unique (user_id, target_type, target_id, reason)   -- 한 사람은 같은 이유로 한 번만
);
create index on public.reports (target_type, target_id);
alter table public.reports enable row level security;
-- 자기 글은 신고할 수 없다. 신고 내용은 본인과 운영자만 본다.
create policy reports_insert on public.reports for insert with check (
  user_id = auth.uid()
  and not (target_type = 'content' and exists (
    select 1 from public.contents c where c.id::text = target_id and c.author_id = auth.uid()))
);
create policy reports_read on public.reports for select using (user_id = auth.uid() or public.is_admin());
create policy reports_admin_update on public.reports for update using (public.is_admin()) with check (public.is_admin());

-- 서로 다른 사용자 3명 이상이 신고하면 검수 대기로 바꾼다
create or replace function public.refresh_review_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(distinct user_id) into n from public.reports
    where target_type = new.target_type and target_id = new.target_id and resolved_at is null;
  if n >= 3 then
    perform set_config('roamly.internal', 'on', true);
    if new.target_type = 'content' then
      update public.contents set status = 'under_review' where id::text = new.target_id and status = 'published';
    else
      update public.places set status = 'under_review' where id = new.target_id and status = 'published';
    end if;
  end if;
  return new;
end $$;
create trigger reports_ai after insert on public.reports
  for each row execute function public.refresh_review_status();

create table public.place_confirmations (        -- '여전히 맞아요'
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  place_id text not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);
alter table public.place_confirmations enable row level security;
create policy confirm_own on public.place_confirmations for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 장소의 신뢰 집계(서로 다른 사용자 수). 개별 신고자는 보이지 않는다.
create view public.place_trust as
select p.id as place_id,
  (select count(distinct r.user_id) from public.reports r
     where r.target_type = 'place' and r.target_id = p.id and r.resolved_at is null)::int as report_users,
  (select count(distinct r.user_id) from public.reports r
     where r.target_type = 'place' and r.target_id = p.id and r.reason = 'outdated' and r.resolved_at is null)::int as outdated_report_users,
  (select count(*) from public.place_confirmations c
     where c.place_id = p.id and c.created_at > now() - interval '90 days')::int as recent_confirms
from public.places p;
grant select on public.place_trust to anon, authenticated;

-- 이용자가 쓴 글에 대한 '여전히 맞아요'. 자기 글에는 누를 수 없다.
create table public.content_confirmations (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);
alter table public.content_confirmations enable row level security;
create policy content_confirm_own on public.content_confirmations for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid()
    and not exists (select 1 from public.contents c where c.id = content_id and c.author_id = auth.uid()));

-- 글의 신뢰 집계(서로 다른 사용자 수)
create view public.content_trust as
select c.id as content_id,
  (select count(distinct r.user_id) from public.reports r
     where r.target_type = 'content' and r.target_id = c.id::text and r.resolved_at is null)::int as report_users,
  (select count(distinct r.user_id) from public.reports r
     where r.target_type = 'content' and r.target_id = c.id::text and r.reason = 'outdated' and r.resolved_at is null)::int as outdated_report_users,
  (select count(*) from public.content_confirmations x
     where x.content_id = c.id and x.created_at > now() - interval '90 days')::int as recent_confirms
from public.contents c;
grant select on public.content_trust to anon, authenticated;

-- ---------- 6. 내 여행 ----------
create table public.saved_places (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  place_id text not null references public.places(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, place_id)
);
alter table public.saved_places enable row level security;
create policy saved_own on public.saved_places for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  city_id text not null references public.cities(id),
  start_date date not null,
  end_date date not null,
  base_currency text not null default 'KRW' check (base_currency in ('KRW','JPY','USD','EUR')),
  budget jsonb not null default '{}'::jsonb,       -- {"total":800000,"cats":{"transport":80000,...}}
  rates jsonb not null default '{}'::jsonb,        -- 직접 입력한 환율 기억 {"JPY>KRW":9.5}
  created_at timestamptz not null default now(),
  check (end_date >= start_date and end_date - start_date <= 29)   -- 최대 30일
);
create index on public.trips (user_id, start_date);
alter table public.trips enable row level security;
create policy trips_own on public.trips for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 이 여행의 주인인지 확인하는 도우미(하위 표의 규칙에서 쓴다)
create or replace function public.owns_trip(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.trips where id = t and user_id = auth.uid())
$$;

create table public.trip_items (                 -- 날짜별 일정
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day date not null,
  place_id text not null references public.places(id),
  position int not null default 0,
  unique (trip_id, day, place_id)
);
create table public.trip_journal (               -- 기록(장소 단위): 방문 체크·메모
  trip_id uuid not null references public.trips(id) on delete cascade,
  place_id text not null references public.places(id),
  visited boolean not null default false,
  visited_on date,
  memo text not null default '' check (char_length(memo) <= 1000),
  primary key (trip_id, place_id)
);
create table public.trip_photos (                -- 사진 파일은 Storage, 여기엔 경로만 저장
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  place_id text not null references public.places(id),
  storage_path text not null unique,
  created_at timestamptz not null default now()
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (currency in ('KRW','JPY','USD','EUR')),
  rate numeric(18,8) not null check (rate > 0),
  amount_base numeric(14,2) not null,
  category text not null check (category in ('transport','lodging','food','other')),
  spent_on date not null,
  memo text not null default '',
  place_id text references public.places(id)
);
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  key text,                                      -- 추천 항목 코드(passport 등), 직접 만든 항목은 null
  text text,
  group_name text not null check (group_name in ('before','packing','local')),
  done boolean not null default false,
  check (key is not null or text is not null)
);
create index on public.trip_items (trip_id, day);
create index on public.trip_photos (trip_id, place_id);
create index on public.expenses (trip_id);
create index on public.checklist_items (trip_id);

do $$
declare t text;
begin
  foreach t in array array['trip_items','trip_journal','trip_photos','expenses','checklist_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (public.owns_trip(trip_id)) with check (public.owns_trip(trip_id))', t || '_own', t);
  end loop;
end $$;

-- 사진은 장소당 10장까지
create or replace function public.limit_trip_photos() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.trip_photos where trip_id = new.trip_id and place_id = new.place_id) >= 10 then
    raise exception 'photo limit reached (10 per place)';
  end if;
  return new;
end $$;
create trigger trip_photos_limit before insert on public.trip_photos
  for each row execute function public.limit_trip_photos();

-- ---------- 7. 사진 저장소(Storage) ----------
-- 비공개 버킷. 파일 경로는 '{user_id}/{trip_id}/{파일명}' 형식으로 올린다.
insert into storage.buckets (id, name, public) values ('trip-photos', 'trip-photos', false)
  on conflict (id) do nothing;
create policy trip_photos_read on storage.objects for select
  using (bucket_id = 'trip-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy trip_photos_insert on storage.objects for insert
  with check (bucket_id = 'trip-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy trip_photos_delete on storage.objects for delete
  using (bucket_id = 'trip-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- 아직 하지 않은 것(다음 단계)
--  - 시드 데이터 넣기: site/js/data.js 의 도시·동네·장소를 INSERT 로 변환(별도 파일)
--  - 호스트·프로그램·식품 표(P2)
--  - 사용자가 쓴 글에 대한 '여전히 맞아요'·오래됨 신고 집계(contents 용 뷰)
--  - 운영자 계정 만들기: 대시보드에서 해당 사용자의 app_metadata 에 {"role":"admin"} 설정
--  - 두 개의 테스트 계정으로 RLS 점검(다른 사람 데이터가 읽히거나 수정되지 않는지)
-- =====================================================================
