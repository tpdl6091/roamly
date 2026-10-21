-- =====================================================================
-- Roamly 마이그레이션 005: 운영자 화면(#/admin)용 서버 함수
-- 004 다음에 실행한다. 여러 번 실행해도 안전하다. 표는 새로 만들지 않는다.
--
-- 운영자 = JWT 의 app_metadata.role = 'admin' (public.is_admin()). app_metadata 는 사용자가 바꿀 수 없다.
-- 운영자 지정: SQL Editor 에서
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = '운영자_이메일';
--   (지정 후 그 계정은 로그아웃했다가 다시 로그인해야 새 권한이 적용된다)
--
-- 모든 함수는 맨 처음에 is_admin() 을 확인하고, 아니면 거절한다. 화면을 숨기는 것만으로 막지 않는다.
-- 처리 기록은 admin_actions 에 남긴다(누가·언제·무엇을).
-- =====================================================================

create table if not exists public.admin_actions (
  id bigint generated always as identity primary key,
  admin_id uuid not null references auth.users(id),
  action text not null,
  target_type text not null,
  target_id text not null,
  note text,
  created_at timestamptz not null default now()
);
alter table public.admin_actions enable row level security;
drop policy if exists admin_actions_read on public.admin_actions;
create policy admin_actions_read on public.admin_actions for select using (public.is_admin());
-- 쓰기는 아래 함수로만(직접 쓰기 정책 없음)

create or replace function public.admin_guard() returns uuid
language plpgsql stable as $$
begin
  if auth.uid() is null or not public.is_admin() then raise exception 'admin only' using errcode = '42501'; end if;
  return auth.uid();
end $$;

-- ---------- 1. 현지인 신원 확인 ----------
-- p_filter: 'waiting'(확인 전) | 'verified' | 'all'
create or replace function public.admin_hosts(p_filter text default 'waiting') returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return coalesce((select jsonb_agg(x order by (x->>'created_rank')::int) from (
    select jsonb_build_object(
      'user_id', h.user_id, 'name', p.display_name, 'email', u.email, 'avatar_path', p.avatar_path,
      'city', h.home_city_id, 'bio', h.bio, 'years', h.years_in_city,
      'identity_status', h.identity_status, 'verified_at', h.verified_at, 'is_public', h.is_public, 'suspended', p.suspended,
      'interests', coalesce((select jsonb_agg(interest_id order by interest_id) from public.host_interests where host_id = h.user_id), '[]'::jsonb),
      'languages', coalesce((select jsonb_agg(jsonb_build_object('language', language, 'level', level) order by language) from public.host_languages where host_id = h.user_id), '[]'::jsonb),
      'slots', (select count(*) from public.availability a where a.host_id = h.user_id and a.day >= current_date),
      'reviews', (select count(*) from public.reviews r where r.target_id = h.user_id and r.status = 'published'),
      'reports', (select count(distinct user_id) from public.reports where target_type = 'user' and target_id = h.user_id::text and resolved_at is null),
      'created_rank', row_number() over (order by p.created_at)
    ) as x
    from public.host_profiles h join public.profiles p on p.id = h.user_id left join auth.users u on u.id = h.user_id
    where case coalesce(p_filter, 'waiting')
            when 'waiting' then h.identity_status <> 'verified'
            when 'verified' then h.identity_status = 'verified'
            else true end
  ) t), '[]'::jsonb);
end $$;

create or replace function public.admin_set_host_status(p_user uuid, p_verified boolean, p_note text default null) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := public.admin_guard();
begin
  update public.host_profiles
     set identity_status = case when p_verified then 'verified' else 'none' end,
         verified_at = case when p_verified then now() else null end
   where user_id = p_user;
  if not found then raise exception 'not found'; end if;
  insert into public.admin_actions (admin_id, action, target_type, target_id, note)
  values (me, case when p_verified then 'verify_host' else 'unverify_host' end, 'user', p_user::text, left(p_note, 500));
  return case when p_verified then 'verified' else 'none' end;
end $$;

create or replace function public.admin_set_suspended(p_user uuid, p_on boolean, p_note text default null) returns boolean
language plpgsql security definer set search_path = public as $$
declare me uuid := public.admin_guard();
begin
  if p_user = me then raise exception 'cannot suspend yourself'; end if;
  update public.profiles set suspended = p_on where id = p_user;
  if not found then raise exception 'not found'; end if;
  -- 정지하면 대기 중인 매칭 요청은 취소한다(상대가 기다리지 않도록)
  if p_on then
    update public.match_requests set status = 'cancelled', updated_at = now()
     where status = 'pending' and (traveler_id = p_user or host_id = p_user);
  end if;
  insert into public.admin_actions (admin_id, action, target_type, target_id, note)
  values (me, case when p_on then 'suspend' else 'unsuspend' end, 'user', p_user::text, left(p_note, 500));
  return p_on;
end $$;

-- ---------- 2. 신고 검수 ----------
-- 처리되지 않은 신고를 대상별로 묶고, 대상의 내용·현재 상태·작성자를 함께 돌려준다
create or replace function public.admin_report_queue() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return coalesce((select jsonb_agg(q order by (q->>'users')::int desc, q->>'last_at' desc) from (
    select jsonb_build_object(
      'target_type', g.target_type, 'target_id', g.target_id, 'users', g.users, 'reasons', g.reasons,
      'first_at', g.first_at, 'last_at', g.last_at,
      'detail', case g.target_type
        when 'content' then (select jsonb_build_object('body', c.body, 'status', c.status, 'owner_id', c.author_id,
                               'owner', (select display_name from public.profiles where id = c.author_id), 'place_id', c.place_id, 'sponsored', c.sponsored)
                             from public.contents c where c.id::text = g.target_id)
        when 'place' then (select jsonb_build_object('name', pl.name, 'status', pl.status, 'place_id', pl.id) from public.places pl where pl.id = g.target_id)
        when 'review' then (select jsonb_build_object('body', r.body, 'rating', r.rating_overall, 'status', r.status, 'owner_id', r.reviewer_id,
                               'owner', (select display_name from public.profiles where id = r.reviewer_id),
                               'about', (select display_name from public.profiles where id = r.target_id))
                            from public.reviews r where r.id::text = g.target_id)
        when 'message' then (select jsonb_build_object('body', m.body, 'sent_at', m.created_at, 'owner_id', m.sender_id, 'conversation_id', m.conversation_id,
                               'owner', (select display_name from public.profiles where id = m.sender_id))
                             from public.messages m where m.id::text = g.target_id)
        when 'user' then (select jsonb_build_object('owner_id', p.id, 'owner', p.display_name, 'suspended', p.suspended,
                               'is_host', exists (select 1 from public.host_profiles h where h.user_id = p.id))
                          from public.profiles p where p.id::text = g.target_id)
      end
    ) as q
    from (select target_type, target_id, count(distinct user_id)::int as users,
                 jsonb_agg(distinct reason) as reasons, min(created_at) as first_at, max(created_at) as last_at
            from public.reports where resolved_at is null group by target_type, target_id) g
  ) t), '[]'::jsonb);
end $$;

-- p_action: 'dismiss'(문제없음: 검수 대기였다면 다시 공개) | 'hide'(글·장소·후기 숨김, 메시지는 내용 가림) | 'suspend'(작성자 계정 정지)
-- 어떤 처리든 그 대상의 신고는 모두 '처리됨'으로 바꾼다
create or replace function public.admin_resolve_report(p_type text, p_id text, p_action text, p_note text default null) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := public.admin_guard(); v_owner uuid;
begin
  if p_type not in ('content','place','review','message','user') then raise exception 'invalid type'; end if;
  if p_action not in ('dismiss','hide','suspend') then raise exception 'invalid action'; end if;
  perform set_config('roamly.internal', 'on', true);

  if p_action = 'dismiss' then
    if p_type = 'content' then update public.contents set status = 'published' where id::text = p_id and status = 'under_review';
    elsif p_type = 'place' then update public.places set status = 'published' where id = p_id and status = 'under_review';
    elsif p_type = 'review' then update public.reviews set status = 'published' where id::text = p_id and status = 'under_review';
    end if;
  elsif p_action = 'hide' then
    if p_type = 'content' then update public.contents set status = 'hidden' where id::text = p_id;
    elsif p_type = 'place' then update public.places set status = 'hidden' where id = p_id;
    elsif p_type = 'review' then update public.reviews set status = 'hidden' where id::text = p_id;
    elsif p_type = 'message' then update public.messages set body = '[운영 정책에 따라 가려진 메시지 · Hidden by a moderator]' where id::text = p_id;
    else raise exception 'use suspend for users';
    end if;
    if not found then raise exception 'not found'; end if;
  else
    v_owner := case p_type
      when 'content' then (select author_id from public.contents where id::text = p_id)
      when 'review' then (select reviewer_id from public.reviews where id::text = p_id)
      when 'message' then (select sender_id from public.messages where id::text = p_id)
      when 'user' then (select id from public.profiles where id::text = p_id)
    end;
    if v_owner is null then raise exception 'no owner to suspend'; end if;
    perform public.admin_set_suspended(v_owner, true, p_note);
  end if;

  update public.reports set resolved_at = now() where target_type = p_type and target_id = p_id and resolved_at is null;
  insert into public.admin_actions (admin_id, action, target_type, target_id, note) values (me, 'report_' || p_action, p_type, p_id, left(p_note, 500));
  return p_action;
end $$;

-- 운영 기록(최근 50건)
create or replace function public.admin_recent_actions() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.admin_guard();
  return coalesce((select jsonb_agg(jsonb_build_object('action', a.action, 'target_type', a.target_type, 'target_id', a.target_id, 'note', a.note,
                     'at', a.created_at, 'admin', (select display_name from public.profiles where id = a.admin_id)) order by a.id desc)
                   from (select * from public.admin_actions order by id desc limit 50) a), '[]'::jsonb);
end $$;

-- 내가 운영자인가(화면 표시용. 실제 권한은 위 함수들이 다시 확인한다)
create or replace function public.am_i_admin() returns boolean
language sql stable as $$ select auth.uid() is not null and public.is_admin() $$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.admin_hosts(text)', 'public.admin_set_host_status(uuid,boolean,text)', 'public.admin_set_suspended(uuid,boolean,text)',
    'public.admin_report_queue()', 'public.admin_resolve_report(text,text,text,text)', 'public.admin_recent_actions()', 'public.am_i_admin()'] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;
revoke execute on function public.admin_guard() from public, anon;
grant execute on function public.admin_guard() to authenticated;
