-- =====================================================================
-- Roamly 마이그레이션 003: 취향 기반 1:1 현지인 매칭 (추천·요청·메시지·후기)
-- 이미 실행한 스키마(v0.2)와 002(아이디) 위에 더한다. 여러 번 실행해도 안전하다.
--
-- 설계 원칙
--  1) 기존 표를 먼저 쓴다: 현지인 프로필은 host_profiles(신원 확인 상태 포함)를 확장하고, 신고는 reports 를 확장한다.
--  2) 점수 계산·요청 상태 변경·읽음 처리 같은 '믿어야 하는 일'은 서버 함수가 한다(브라우저가 보낸 점수·사용자 id 는 쓰지 않는다).
--  3) 모든 표에 RLS 를 켜고, 비로그인 사용자에게는 현지인 정보를 보여 주지 않는다.
-- =====================================================================

-- ---------- 0. 공통 도우미 ----------
create or replace function public.is_authed() returns boolean
language sql stable as $$ select auth.uid() is not null $$;

-- SQL Editor·서비스 키처럼 서버 관리자 권한으로 실행 중인가(브라우저 사용자는 해당 없음)
create or replace function public.is_service() returns boolean
language sql stable as $$ select current_user in ('postgres', 'supabase_admin', 'service_role') $$;


-- ---------- 1. 기존 표 확장 ----------
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles add column if not exists suspended boolean not null default false;   -- 운영자만 바꾼다

alter table public.cities add column if not exists local_language text;
update public.cities set local_language = case id
  when 'seoul' then 'ko' when 'tokyo' then 'ja' when 'osaka' then 'ja'
  when 'berlin' then 'de' when 'newyork' then 'en' when 'barcelona' then 'es' else local_language end;

alter table public.host_profiles add column if not exists is_public boolean not null default false;   -- 현지인이 공개를 켠 경우
alter table public.host_profiles add column if not exists travel_styles text[] not null default '{}';
alter table public.host_profiles add column if not exists exchange_modes text[] not null default '{}';
alter table public.host_profiles add column if not exists activity_nbs text[] not null default '{}';          -- 주로 활동하는 동네(neighborhoods.id)
alter table public.host_profiles add column if not exists recommended_places text[] not null default '{}';    -- 추천하는 장소(places.id)
alter table public.host_profiles add column if not exists duration_hours int;
alter table public.host_profiles add column if not exists cost_note text;

do $$ begin
  alter table public.host_profiles drop constraint if exists host_profiles_values;
  alter table public.host_profiles add constraint host_profiles_values check (
    travel_styles <@ array['relaxed','active','like_local','new_experience']
    and exchange_modes <@ array['deep_talk','casual','activity']
    and (duration_hours is null or duration_hours between 1 and 12)
    and (cost_note is null or char_length(cost_note) <= 300)
    and (bio is null or char_length(bio) <= 800));
end $$;

-- 계정 상태(suspended)는 본인이 바꿀 수 없다
create or replace function public.protect_profile_flags() returns trigger
language plpgsql as $$
begin
  if tg_op = 'UPDATE' and not (public.is_admin() or public.is_service()) then
    new.suspended := old.suspended;
  end if;
  if tg_op = 'INSERT' and not (public.is_admin() or public.is_service()) then
    new.suspended := false;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before insert or update on public.profiles
  for each row execute function public.protect_profile_flags();

-- 신원 확인 상태는 운영자(또는 서버 관리자)만 바꾼다. 예전에는 SQL Editor 에서도 되돌려졌던 문제를 고친다.
create or replace function public.protect_host_verification() returns trigger
language plpgsql as $$
begin
  if not (public.is_admin() or public.is_service()) then
    if tg_op = 'INSERT' then
      new.identity_status := 'none'; new.verified_at := null;
    else
      new.identity_status := old.identity_status; new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end $$;

-- 현지인 프로필은 로그인한 사용자에게, 신원 확인을 마치고 공개한 것만 보인다(본인·운영자는 항상)
drop policy if exists host_read on public.host_profiles;
create policy host_read on public.host_profiles for select
  using (user_id = auth.uid() or public.is_admin()
         or (auth.uid() is not null and identity_status = 'verified' and is_public));

-- ---------- 2. 관심사 목록과 여행자·현지인의 취향 ----------
create table if not exists public.interest_catalog (
  id text primary key,
  category text not null check (category in ('cafe_food', 'culture', 'outdoor', 'people')),
  sort int not null default 0
);
alter table public.interest_catalog enable row level security;
drop policy if exists interest_read on public.interest_catalog;
create policy interest_read on public.interest_catalog for select using (true);
insert into public.interest_catalog (id, category, sort) values
  ('cafe_tour','cafe_food',1), ('local_eats','cafe_food',2), ('bakery','cafe_food',3), ('market_street_food','cafe_food',4), ('hotspot','cafe_food',5),
  ('art_exhibit','culture',1), ('reading','culture',2), ('vintage','culture',3), ('photo','culture',4), ('music_show','culture',5),
  ('neighborhood_walk','outdoor',1), ('park_nature','outdoor',2), ('cycling','outdoor',3), ('local_market','outdoor',4), ('hidden_spots','outdoor',5),
  ('language_exchange','people',1), ('new_friends','people',2), ('local_culture_talk','people',3), ('board_games','people',4), ('cooking_together','people',5)
on conflict (id) do update set category = excluded.category, sort = excluded.sort;

create table if not exists public.host_interests (
  host_id uuid not null references public.host_profiles(user_id) on delete cascade,
  interest_id text not null references public.interest_catalog(id),
  primary key (host_id, interest_id)
);
create table if not exists public.host_languages (
  host_id uuid not null references public.host_profiles(user_id) on delete cascade,
  language text not null check (language in ('ko','en','ja','zh','es','de')),
  level text not null default 'conversational' check (level in ('basic','conversational','fluent','native')),
  primary key (host_id, language)
);
create table if not exists public.traveler_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  city_id text references public.cities(id),
  date_from date,
  date_to date,
  travel_style text check (travel_style in ('relaxed','active','like_local','new_experience')),
  exchange_mode text check (exchange_mode in ('deep_talk','casual','activity')),
  preferred_language text check (preferred_language in ('ko','en','local','any')),
  updated_at timestamptz not null default now()
);
create table if not exists public.traveler_interests (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  interest_id text not null references public.interest_catalog(id),
  primary key (user_id, interest_id)
);

-- 현지인 가능 시간(날짜별). 같은 시작 시간은 한 번만.
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.host_profiles(user_id) on delete cascade default auth.uid(),
  day date not null,
  start_time time not null,
  end_time time not null,
  is_booked boolean not null default false,          -- 요청이 수락되면 서버가 true 로 바꾼다
  unique (host_id, day, start_time),
  check (end_time > start_time)
);
create index if not exists availability_day on public.availability (day) where not is_booked;

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  host_id uuid not null references public.host_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, host_id)
);
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- 두 사용자 사이에 차단이 있는가(어느 방향이든)
create or replace function public.is_blocked(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.blocks where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a))
$$;

-- 차단 여부는 서버 함수 안에서만 확인한다(브라우저가 다른 두 사람의 차단 관계를 조회하지 못하게)
revoke execute on function public.is_blocked(uuid, uuid) from public, anon, authenticated;

-- 현지인 정보를 읽을 수 있는 경우(본인 또는 신원 확인을 마치고 공개한 현지인, 로그인 필요)
create or replace function public.host_visible(h uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (h = auth.uid() or exists (
    select 1 from public.host_profiles x where x.user_id = h and x.identity_status = 'verified' and x.is_public))
$$;

alter table public.host_interests enable row level security;
alter table public.host_languages enable row level security;
alter table public.traveler_preferences enable row level security;
alter table public.traveler_interests enable row level security;
alter table public.availability enable row level security;
alter table public.favorites enable row level security;
alter table public.blocks enable row level security;

drop policy if exists host_interests_read on public.host_interests;
drop policy if exists host_interests_write on public.host_interests;
create policy host_interests_read on public.host_interests for select using (public.host_visible(host_id));
create policy host_interests_write on public.host_interests for all using (host_id = auth.uid()) with check (host_id = auth.uid());
drop policy if exists host_languages_read on public.host_languages;
drop policy if exists host_languages_write on public.host_languages;
create policy host_languages_read on public.host_languages for select using (public.host_visible(host_id));
create policy host_languages_write on public.host_languages for all using (host_id = auth.uid()) with check (host_id = auth.uid());
drop policy if exists availability_read on public.availability;
drop policy if exists availability_insert on public.availability;
drop policy if exists availability_delete on public.availability;
create policy availability_read on public.availability for select using (public.host_visible(host_id));
create policy availability_insert on public.availability for insert with check (host_id = auth.uid() and not is_booked);
create policy availability_delete on public.availability for delete using (host_id = auth.uid() and not is_booked);
-- is_booked 는 직접 바꿀 수 없다(수정 정책 없음)
drop policy if exists traveler_prefs_own on public.traveler_preferences;
create policy traveler_prefs_own on public.traveler_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists traveler_interests_own on public.traveler_interests;
create policy traveler_interests_own on public.traveler_interests for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists favorites_own on public.favorites;
create policy favorites_own on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists blocks_own on public.blocks;
create policy blocks_own on public.blocks for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- ---------- 3. 매칭 요청·대화·메시지 ----------
create table if not exists public.match_requests (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid not null references auth.users(id) on delete cascade,
  host_id uuid not null references public.host_profiles(user_id) on delete cascade,
  city_id text not null references public.cities(id),
  meet_date date not null,
  start_time time,
  end_time time,
  activity text not null default '' check (char_length(activity) <= 80),
  area text not null default '' check (char_length(area) <= 120),
  message text not null default '' check (char_length(message) <= 1000),
  availability_id uuid references public.availability(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (traveler_id <> host_id),
  check (end_time is null or start_time is null or end_time > start_time)
);
-- 같은 사람에게 같은 날 중복 요청 금지(대기·수락 중인 것 기준)
create unique index if not exists match_requests_no_dup on public.match_requests (traveler_id, host_id, meet_date) where status in ('pending','accepted');
-- 현지인은 같은 날 같은 시작 시간에 둘 이상 수락할 수 없다
create unique index if not exists match_requests_no_double_book on public.match_requests (host_id, meet_date, start_time) where status = 'accepted' and start_time is not null;
create index if not exists match_requests_host on public.match_requests (host_id, status);
create index if not exists match_requests_traveler on public.match_requests (traveler_id, status);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.match_requests(id) on delete cascade,
  traveler_id uuid not null references auth.users(id) on delete cascade,
  host_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists messages_conv on public.messages (conversation_id, created_at);

alter table public.match_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- 내가 보내거나 받은 요청만 보인다. 만들기·상태 변경은 아래 함수로만 한다(직접 쓰기 정책 없음).
drop policy if exists match_requests_read on public.match_requests;
create policy match_requests_read on public.match_requests for select
  using (traveler_id = auth.uid() or host_id = auth.uid() or public.is_admin());
drop policy if exists conversations_read on public.conversations;
create policy conversations_read on public.conversations for select
  using (traveler_id = auth.uid() or host_id = auth.uid() or public.is_admin());
drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages for select
  using (exists (select 1 from public.conversations c where c.id = conversation_id and (c.traveler_id = auth.uid() or c.host_id = auth.uid())) or public.is_admin());

-- 메시지를 보낼 수 있는 경우: 대화 참여자이고, 요청이 취소·거절되지 않았고, 차단이 없고, 정지된 계정이 아닐 때
create or replace function public.can_message(conv uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (
    select 1 from public.conversations c
    join public.match_requests r on r.id = c.request_id
    where c.id = conv and auth.uid() in (c.traveler_id, c.host_id)
      and r.status in ('pending','accepted','completed')
      and not public.is_blocked(c.traveler_id, c.host_id)
      and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.suspended))
$$;
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert
  with check (sender_id = auth.uid() and public.can_message(conversation_id));

-- 읽음 표시·전송 시각은 서버가 정한다
create or replace function public.messages_before_insert() returns trigger
language plpgsql as $$
begin
  new.created_at := now(); new.read_at := null; new.body := btrim(new.body);
  return new;
end $$;
drop trigger if exists messages_bi on public.messages;
create trigger messages_bi before insert on public.messages for each row execute function public.messages_before_insert();

-- 실시간(Supabase Realtime): 새 메시지가 상대 화면에 바로 오게 한다. 접근 규칙(RLS)은 실시간에도 똑같이 적용된다.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ---------- 4. 후기 ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.match_requests(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  target_id uuid not null references auth.users(id) on delete cascade,
  rating_overall smallint not null check (rating_overall between 1 and 5),
  rating_communication smallint not null check (rating_communication between 1 and 5),
  rating_punctuality smallint not null check (rating_punctuality between 1 and 5),
  rating_activity smallint not null check (rating_activity between 1 and 5),
  body text not null check (char_length(btrim(body)) between 10 and 1000),
  activity_type text not null default '' check (char_length(activity_type) <= 40),
  status text not null default 'published' check (status in ('published','under_review','hidden')),
  created_at timestamptz not null default now(),
  unique (request_id, reviewer_id)                     -- 한 만남에 한 사람이 후기 하나
);
create index if not exists reviews_target on public.reviews (target_id) where status = 'published';
alter table public.reviews enable row level security;
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select
  using (auth.uid() is not null and (status <> 'hidden' or reviewer_id = auth.uid() or public.is_admin()));
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert with check (reviewer_id = auth.uid());
drop policy if exists reviews_delete on public.reviews;
create policy reviews_delete on public.reviews for delete using (reviewer_id = auth.uid() or public.is_admin());

-- 후기를 쓸 수 있는 사람: 만남이 '완료'된 요청의 참여자. 대상(상대방)과 상태는 서버가 정한다.
create or replace function public.reviews_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare r public.match_requests%rowtype;
begin
  select * into r from public.match_requests where id = new.request_id;
  if not found or r.status <> 'completed' then raise exception 'review requires a completed meeting'; end if;
  if new.reviewer_id not in (r.traveler_id, r.host_id) then raise exception 'not a participant'; end if;
  new.target_id := case when new.reviewer_id = r.traveler_id then r.host_id else r.traveler_id end;
  new.status := 'published'; new.created_at := now(); new.body := btrim(new.body);
  return new;
end $$;
drop trigger if exists reviews_bi on public.reviews;
create trigger reviews_bi before insert on public.reviews for each row execute function public.reviews_before_insert();

-- 현지인의 후기 평균·개수(비공개 정보 없이 숫자만)
create or replace view public.host_rating_stats as
  select target_id as host_id, count(*)::int as review_count,
         round(avg(rating_overall)::numeric, 1) as avg_overall,
         round(avg(rating_communication)::numeric, 1) as avg_communication,
         round(avg(rating_punctuality)::numeric, 1) as avg_punctuality,
         round(avg(rating_activity)::numeric, 1) as avg_activity
  from public.reviews where status = 'published' group by target_id;
revoke all on public.host_rating_stats from anon;
grant select on public.host_rating_stats to authenticated;

-- ---------- 5. 신고 확장(사용자·메시지·후기) ----------
alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check check (target_type in ('place','content','user','message','review'));

-- 서로 다른 사용자 3명 이상이 신고하면 검수 대기로 바꾼다(후기까지 확대)
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
    elsif new.target_type = 'place' then
      update public.places set status = 'under_review' where id = new.target_id and status = 'published';
    elsif new.target_type = 'review' then
      update public.reviews set status = 'under_review' where id::text = new.target_id and status = 'published';
    end if;
  end if;
  return new;
end $$;

-- 차단하면 둘 사이의 대기 중인 요청은 취소한다
create or replace function public.blocks_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.match_requests set status = 'cancelled', updated_at = now()
   where status = 'pending' and ((traveler_id = new.blocker_id and host_id = new.blocked_id) or (traveler_id = new.blocked_id and host_id = new.blocker_id));
  return new;
end $$;
drop trigger if exists blocks_ai on public.blocks;
create trigger blocks_ai after insert on public.blocks for each row execute function public.blocks_after_insert();

-- ---------- 6. 요청을 만들고 응답하는 함수(상태 변경은 모두 여기로만) ----------
create or replace function public.create_match_request(
  p_host uuid, p_date date, p_start time default null, p_end time default null,
  p_activity text default '', p_area text default '', p_message text default '', p_availability uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); v_city text; v_id uuid; v_conv uuid; v_slot public.availability%rowtype;
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  if p_host = me then raise exception 'cannot request yourself'; end if;
  select h.home_city_id into v_city from public.host_profiles h
    join public.profiles p on p.id = h.user_id
   where h.user_id = p_host and h.identity_status = 'verified' and h.is_public and not p.suspended;
  if v_city is null then raise exception 'host not available'; end if;
  if public.is_blocked(me, p_host) then raise exception 'blocked'; end if;
  if exists (select 1 from public.profiles where id = me and suspended) then raise exception 'account suspended'; end if;
  if p_date is null or p_date < current_date or p_date > current_date + 365 then raise exception 'invalid date'; end if;
  if (select count(*) from public.match_requests where traveler_id = me and status = 'pending') >= 10 then raise exception 'too many pending requests'; end if;
  if p_availability is not null then
    select * into v_slot from public.availability where id = p_availability and host_id = p_host;
    if not found or v_slot.is_booked or v_slot.day <> p_date then raise exception 'slot not available'; end if;
    p_start := coalesce(p_start, v_slot.start_time); p_end := coalesce(p_end, v_slot.end_time);
  end if;
  begin
    insert into public.match_requests (traveler_id, host_id, city_id, meet_date, start_time, end_time, activity, area, message, availability_id)
    values (me, p_host, v_city, p_date, p_start, p_end, left(coalesce(p_activity, ''), 80), left(coalesce(p_area, ''), 120), left(coalesce(p_message, ''), 1000), p_availability)
    returning id into v_id;
  exception when unique_violation then
    raise exception 'duplicate request';
  end;
  insert into public.conversations (request_id, traveler_id, host_id) values (v_id, me, p_host) returning id into v_conv;
  if btrim(coalesce(p_message, '')) <> '' then
    insert into public.messages (conversation_id, sender_id, body) values (v_conv, me, left(btrim(p_message), 1000));
  end if;
  return v_id;
end $$;

-- 현지인이 대기 중인 요청을 수락하거나 거절한다
create or replace function public.respond_match(p_request uuid, p_accept boolean) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r public.match_requests%rowtype;
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  select * into r from public.match_requests where id = p_request for update;
  if not found or r.host_id <> me then raise exception 'not found'; end if;
  if r.status <> 'pending' then raise exception 'request is not pending'; end if;
  if p_accept then
    if r.meet_date < current_date then raise exception 'date has passed'; end if;
    if r.availability_id is not null then
      update public.availability set is_booked = true where id = r.availability_id and not is_booked;
      if not found then raise exception 'slot already booked'; end if;
    end if;
    begin
      update public.match_requests set status = 'accepted', updated_at = now() where id = p_request;
    exception when unique_violation then
      raise exception 'already accepted another request at that time';
    end;
    return 'accepted';
  end if;
  update public.match_requests set status = 'declined', updated_at = now() where id = p_request;
  return 'declined';
end $$;

-- 여행자는 대기·수락 상태의 요청을, 현지인은 수락한 요청을 취소할 수 있다(예약된 시간은 다시 열린다)
create or replace function public.cancel_match(p_request uuid) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r public.match_requests%rowtype;
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  select * into r from public.match_requests where id = p_request for update;
  if not found or me not in (r.traveler_id, r.host_id) then raise exception 'not found'; end if;
  if not ((me = r.traveler_id and r.status in ('pending','accepted')) or (me = r.host_id and r.status = 'accepted')) then
    raise exception 'cannot cancel in this state';
  end if;
  update public.match_requests set status = 'cancelled', updated_at = now() where id = p_request;
  if r.availability_id is not null then update public.availability set is_booked = false where id = r.availability_id; end if;
  return 'cancelled';
end $$;

-- 만남 날짜가 된 수락 요청을 참여자 누구든 '만남 완료'로 바꾼다(후기는 완료 뒤에 쓸 수 있다)
create or replace function public.complete_match(p_request uuid) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r public.match_requests%rowtype;
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  select * into r from public.match_requests where id = p_request for update;
  if not found or me not in (r.traveler_id, r.host_id) then raise exception 'not found'; end if;
  if r.status <> 'accepted' then raise exception 'only accepted meetings can be completed'; end if;
  if r.meet_date > current_date then raise exception 'meeting date has not arrived'; end if;
  update public.match_requests set status = 'completed', updated_at = now() where id = p_request;
  return 'completed';
end $$;

-- 상대가 보낸 메시지를 읽음으로 바꾼다(내가 보낸 메시지는 건드리지 않는다)
create or replace function public.mark_read(p_conversation uuid) returns int
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); n int;
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  if not exists (select 1 from public.conversations c where c.id = p_conversation and me in (c.traveler_id, c.host_id)) then raise exception 'not found'; end if;
  update public.messages set read_at = now() where conversation_id = p_conversation and sender_id <> me and read_at is null;
  get diagnostics n = row_count;
  return n;
end $$;

-- 내 대화 목록: 상대 이름, 최근 메시지, 읽지 않은 수(내 권한으로 실행되어 내 대화만 나온다)
create or replace function public.my_conversations()
returns table (conversation_id uuid, request_id uuid, other_id uuid, other_name text, request_status text, meet_date date, last_body text, last_at timestamptz, unread int)
language sql stable set search_path = public as $$
  select c.id, c.request_id,
         case when c.traveler_id = auth.uid() then c.host_id else c.traveler_id end,
         (select p.display_name from public.profiles p where p.id = case when c.traveler_id = auth.uid() then c.host_id else c.traveler_id end),
         r.status, r.meet_date,
         (select m.body from public.messages m where m.conversation_id = c.id order by m.created_at desc, m.id desc limit 1),
         coalesce((select m.created_at from public.messages m where m.conversation_id = c.id order by m.created_at desc, m.id desc limit 1), c.created_at),
         (select count(*)::int from public.messages m where m.conversation_id = c.id and m.sender_id <> auth.uid() and m.read_at is null)
  from public.conversations c join public.match_requests r on r.id = c.request_id
  where auth.uid() in (c.traveler_id, c.host_id)
  order by 8 desc
$$;

-- ---------- 7. 추천: 점수는 서버가 계산한다 ----------
-- 점수 = 관심사 40% + 여행 스타일 15% + 교류 방식 15% + 언어 10% + 일정 20% (각 0~100)
--  · 관심사: 내가 고른 관심사 중 현지인이 가진 비율. 하나도 겹치지 않으면 후보에서 뺀다.
--  · 스타일·교류·언어: 고르지 않았거나 '언어 무관'이면 100점(점수 차이를 만들지 않는다), 골랐다면 일치 100 / 불일치 0.
--  · 일정: 기간 안에 예약 가능한 날(최대 3일 기준) 비율. 가능한 날이 하나도 없으면 후보에서 뺀다.
--  · 후보 조건: 같은 도시, 신원 확인·공개, 정지·차단 없음, 본인 제외.
--  · 다양성: 점수 순으로 고르되 아직 뽑히지 않은 관심 분야(카테고리)의 현지인에게 +5점을 준다.
-- 추천 후보가 될 수 있는 현지인(내부용: 서버 함수만 부르고, 브라우저는 부를 수 없다)
create or replace function public.rec_base(p_me uuid, p_city text) returns setof public.host_profiles
language sql stable security definer set search_path = public as $$
  select h.* from public.host_profiles h join public.profiles p on p.id = h.user_id
   where h.is_public and h.identity_status = 'verified' and h.home_city_id = p_city and h.user_id <> p_me and not p.suspended
     and not public.is_blocked(p_me, h.user_id)
$$;
revoke execute on function public.rec_base(uuid, text) from public, anon, authenticated;

create or replace function public.recommend_hosts(
  p_city text, p_date_from date, p_date_to date, p_interests text[],
  p_style text default null, p_exchange text default null, p_lang text default 'any', p_limit int default 5)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_limit int := least(greatest(coalesce(p_limit, 5), 1), 10);
  v_ints text[]; v_days int; v_local text; v_lang text := coalesce(p_lang, 'any');
  v_total int; v_with_slots int; v_with_interest int;
  cands jsonb; best jsonb; chosen jsonb := '[]'::jsonb; chosen_ids text[] := '{}'; seen_cats text[] := '{}';
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  select coalesce(array_agg(distinct i), '{}') into v_ints from unnest(coalesce(p_interests, '{}')) i
    where i in (select id from public.interest_catalog);
  if coalesce(array_length(v_ints, 1), 0) = 0 then raise exception 'interests required' using errcode = '22023'; end if;
  if p_city is null or p_date_from is null then raise exception 'city and date required' using errcode = '22023'; end if;
  p_date_to := coalesce(p_date_to, p_date_from);
  if p_date_to < p_date_from or p_date_to - p_date_from > 30 then raise exception 'invalid date range' using errcode = '22023'; end if;
  if p_style is not null and p_style not in ('relaxed','active','like_local','new_experience') then raise exception 'invalid style' using errcode = '22023'; end if;
  if p_exchange is not null and p_exchange not in ('deep_talk','casual','activity') then raise exception 'invalid exchange' using errcode = '22023'; end if;
  if v_lang not in ('ko','en','local','any') then raise exception 'invalid language' using errcode = '22023'; end if;
  v_days := p_date_to - p_date_from + 1;
  select local_language into v_local from public.cities where id = p_city;

  select count(*) into v_total from public.rec_base(me, p_city);
  select count(*) into v_with_slots from public.rec_base(me, p_city) b where exists (
    select 1 from public.availability a where a.host_id = b.user_id and not a.is_booked and a.day between greatest(p_date_from, current_date) and p_date_to);
  select count(*) into v_with_interest from public.rec_base(me, p_city) b where exists (
    select 1 from public.host_interests hi where hi.host_id = b.user_id and hi.interest_id = any (v_ints));

  select coalesce(jsonb_agg(x order by (x->>'score')::numeric desc, x->>'user_id'), '[]'::jsonb) into cands from (
    select jsonb_build_object(
      'user_id', b.user_id, 'name', p.display_name, 'avatar_path', p.avatar_path, 'city', b.home_city_id, 'intro', b.bio,
      'years', b.years_in_city, 'neighborhoods', b.activity_nbs, 'duration_hours', b.duration_hours, 'cost_note', b.cost_note,
      'travel_styles', b.travel_styles, 'exchange_modes', b.exchange_modes,
      'interests', coalesce((select jsonb_agg(hi.interest_id order by hi.interest_id) from public.host_interests hi where hi.host_id = b.user_id), '[]'::jsonb),
      'matched', to_jsonb(s.matched),
      'languages', coalesce((select jsonb_agg(jsonb_build_object('language', hl.language, 'level', hl.level) order by hl.language) from public.host_languages hl where hl.host_id = b.user_id), '[]'::jsonb),
      'score', s.score,
      'breakdown', jsonb_build_object('interest', s.sc_interest, 'style', s.sc_style, 'exchange', s.sc_exchange, 'language', s.sc_lang, 'schedule', s.sc_schedule),
      'schedule_days', s.days_ok,
      'cat', s.cat,
      'rating', jsonb_build_object('count', coalesce(rs.review_count, 0), 'avg', rs.avg_overall),
      'next_slots', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'day', q.day, 'start', q.start_time, 'end', q.end_time) order by q.day, q.start_time)
                              from (select a.* from public.availability a where a.host_id = b.user_id and not a.is_booked
                                      and a.day between greatest(p_date_from, current_date) and p_date_to order by a.day, a.start_time limit 3) q), '[]'::jsonb),
      'is_favorite', exists (select 1 from public.favorites f where f.user_id = me and f.host_id = b.user_id)
    ) as x
    from public.rec_base(me, p_city) b
    join public.profiles p on p.id = b.user_id
    left join public.host_rating_stats rs on rs.host_id = b.user_id
    cross join lateral (
      select m.matched, m.days_ok,
        round(100.0 * coalesce(cardinality(m.matched), 0) / cardinality(v_ints)) as sc_interest,
        case when p_style is null or p_style = any (b.travel_styles) then 100 else 0 end as sc_style,
        case when p_exchange is null or p_exchange = any (b.exchange_modes) then 100 else 0 end as sc_exchange,
        case when v_lang = 'any' then 100
             when exists (select 1 from public.host_languages hl where hl.host_id = b.user_id
                          and hl.language = case when v_lang = 'local' then v_local else v_lang end) then 100 else 0 end as sc_lang,
        round(100.0 * least(1, m.days_ok::numeric / least(v_days, 3))) as sc_schedule,
        (select c.category from public.interest_catalog c where c.id = any (m.matched)
           group by c.category order by count(*) desc, c.category limit 1) as cat
      from (select coalesce((select array_agg(hi.interest_id order by hi.interest_id) from public.host_interests hi
                              where hi.host_id = b.user_id and hi.interest_id = any (v_ints)), '{}') as matched,
                   (select count(distinct a.day)::int from public.availability a where a.host_id = b.user_id and not a.is_booked
                      and a.day between greatest(p_date_from, current_date) and p_date_to) as days_ok) m
    ) base
    cross join lateral (
      select base.matched, base.days_ok, base.sc_interest, base.sc_style, base.sc_exchange, base.sc_lang, base.sc_schedule, base.cat,
        round((base.sc_interest * 0.40 + base.sc_style * 0.15 + base.sc_exchange * 0.15 + base.sc_lang * 0.10 + base.sc_schedule * 0.20)::numeric, 1) as score
    ) s
    where coalesce(cardinality(s.matched), 0) >= 1 and s.days_ok >= 1
  ) t;

  -- 점수 순으로 고르되, 아직 나오지 않은 관심 분야에는 +5점(같은 분야만 줄줄이 나오지 않게)
  for i in 1..v_limit loop
    select c into best from jsonb_array_elements(cands) c
     where not (c->>'user_id' = any (chosen_ids))
     order by (c->>'score')::numeric + case when (c->>'cat') = any (seen_cats) then 0 else 5 end desc, (c->>'score')::numeric desc, c->>'user_id'
     limit 1;
    exit when best is null;
    chosen := chosen || jsonb_build_array(best);
    chosen_ids := chosen_ids || (best->>'user_id');
    seen_cats := seen_cats || coalesce(best->>'cat', '');
    best := null;
  end loop;

  return jsonb_build_object('hosts', chosen,
    'stats', jsonb_build_object('city_public_hosts', v_total, 'with_availability', v_with_slots, 'with_shared_interest', v_with_interest, 'candidates', jsonb_array_length(cands), 'returned', jsonb_array_length(chosen)));
end $$;

-- 현지인 프로필 상세(로그인 필요): 공개된 현지인만. 후기 목록과 앞으로 가능한 시간을 함께 돌려준다.
create or replace function public.get_host_profile(p_host uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); h public.host_profiles%rowtype; p public.profiles%rowtype;
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  select * into h from public.host_profiles where user_id = p_host and identity_status = 'verified' and is_public;
  if not found then return null; end if;
  select * into p from public.profiles where id = p_host;
  if p.suspended or public.is_blocked(me, p_host) then return null; end if;
  return jsonb_build_object(
    'user_id', p_host, 'name', p.display_name, 'avatar_path', p.avatar_path, 'city', h.home_city_id, 'intro', h.bio, 'years', h.years_in_city,
    'neighborhoods', h.activity_nbs, 'recommended_places', h.recommended_places, 'duration_hours', h.duration_hours, 'cost_note', h.cost_note,
    'travel_styles', h.travel_styles, 'exchange_modes', h.exchange_modes, 'verified', true,
    'interests', coalesce((select jsonb_agg(interest_id order by interest_id) from public.host_interests where host_id = p_host), '[]'::jsonb),
    'languages', coalesce((select jsonb_agg(jsonb_build_object('language', language, 'level', level) order by language) from public.host_languages where host_id = p_host), '[]'::jsonb),
    'slots', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'day', day, 'start', start_time, 'end', end_time) order by day, start_time)
                       from (select * from public.availability where host_id = p_host and not is_booked and day >= current_date and day <= current_date + 60 order by day, start_time limit 60) s), '[]'::jsonb),
    'rating', (select jsonb_build_object('count', review_count, 'avg', avg_overall, 'communication', avg_communication, 'punctuality', avg_punctuality, 'activity', avg_activity)
               from public.host_rating_stats where host_id = p_host),
    'reviews', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'rating', rating_overall, 'communication', rating_communication, 'punctuality', rating_punctuality,
                           'activity', rating_activity, 'body', body, 'activity_type', activity_type, 'created_at', created_at,
                           'reviewer', (select display_name from public.profiles where id = reviewer_id)) order by created_at desc)
                         from (select * from public.reviews where target_id = p_host and status = 'published' order by created_at desc limit 20) r), '[]'::jsonb),
    'is_favorite', exists (select 1 from public.favorites where user_id = me and host_id = p_host));
end $$;

-- ---------- 8. 함수 실행 권한: 로그인한 사용자만 ----------
do $$
declare f text;
begin
  foreach f in array array[
    'public.create_match_request(uuid,date,time,time,text,text,text,uuid)', 'public.respond_match(uuid,boolean)', 'public.cancel_match(uuid)',
    'public.complete_match(uuid)', 'public.mark_read(uuid)', 'public.my_conversations()',
    'public.recommend_hosts(text,date,date,text[],text,text,text,int)', 'public.get_host_profile(uuid)'] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- ---------- 9. 프로필 사진(avatars): 읽기는 공개 주소, 올리기·지우기는 내 폴더({사용자 id}/...)만 ----------
-- 프로필 사진은 추천 카드에 보여 주려는 것이라 공개 버킷으로 두고, 파일 이름에 시각을 넣어 주소를 추측하기 어렵게 한다.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do update set public = true;
drop policy if exists avatars_insert on storage.objects;
drop policy if exists avatars_delete on storage.objects;
create policy avatars_insert on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
