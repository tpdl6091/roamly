-- =====================================================================
-- Roamly 마이그레이션 007: '다른 호스트 둘러보기' (같은 도시의 공개 호스트 목록)
-- 003(매칭) 위에 실행한다(004~006 과 순서는 상관없다). 여러 번 실행해도 안전하다. 표는 새로 만들지 않는다.
--
-- 추천(recommend_hosts)은 관심사·날짜가 맞는 사람만 점수 순으로 5명 보여 준다.
-- 이 함수는 추천에 없던 사람까지 같은 도시의 호스트를 둘러볼 수 있게 한다.
--  · 후보 조건은 추천과 같다: 같은 도시, 신원 확인·공개, 정지·차단 없음, 본인 제외(rec_base 를 그대로 쓴다)
--  · 순서: 내가 고른 관심사와 겹치는 수가 많은 순 → 후기가 많은 순 → 이름 순
--  · 이미 추천으로 보여 준 사람은 p_exclude 로 뺀다. 페이지 단위(p_limit/p_offset)로 나누어 돌려준다.
-- =====================================================================

create or replace function public.browse_hosts(
  p_city text, p_interests text[] default '{}', p_exclude uuid[] default '{}', p_limit int default 12, p_offset int default 0)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_limit int := least(greatest(coalesce(p_limit, 12), 1), 30);
  v_off int := greatest(coalesce(p_offset, 0), 0);
  v_ints text[]; v_excl uuid[] := coalesce(p_exclude, '{}'); v_total int; v_hosts jsonb;
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  if p_city is null or p_city = '' then raise exception 'city required' using errcode = '22023'; end if;
  select coalesce(array_agg(distinct i), '{}') into v_ints from unnest(coalesce(p_interests, '{}')) i
    where i in (select id from public.interest_catalog);

  select count(*) into v_total from public.rec_base(me, p_city) b where not (b.user_id = any (v_excl));

  select coalesce(jsonb_agg(t.j order by t.ord), '[]'::jsonb) into v_hosts from (
    select row_number() over (order by
             (select count(*) from public.host_interests hi where hi.host_id = b.user_id and hi.interest_id = any (v_ints)) desc,
             coalesce(rs.review_count, 0) desc, p.display_name, b.user_id) as ord,
           jsonb_build_object(
             'user_id', b.user_id, 'name', p.display_name, 'avatar_path', p.avatar_path, 'city', b.home_city_id, 'intro', b.bio, 'years', b.years_in_city,
             'neighborhoods', b.activity_nbs, 'duration_hours', b.duration_hours, 'cost_note', b.cost_note,
             'travel_styles', b.travel_styles, 'exchange_modes', b.exchange_modes,
             'interests', coalesce((select jsonb_agg(hi.interest_id order by hi.interest_id) from public.host_interests hi where hi.host_id = b.user_id), '[]'::jsonb),
             'matched', coalesce((select jsonb_agg(hi.interest_id order by hi.interest_id) from public.host_interests hi where hi.host_id = b.user_id and hi.interest_id = any (v_ints)), '[]'::jsonb),
             'languages', coalesce((select jsonb_agg(jsonb_build_object('language', hl.language, 'level', hl.level) order by hl.language) from public.host_languages hl where hl.host_id = b.user_id), '[]'::jsonb),
             'rating', jsonb_build_object('count', coalesce(rs.review_count, 0), 'avg', rs.avg_overall),
             'next_slots', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'day', q.day, 'start', q.start_time, 'end', q.end_time) order by q.day, q.start_time)
                                     from (select a.* from public.availability a where a.host_id = b.user_id and not a.is_booked
                                             and a.day between current_date and current_date + 30 order by a.day, a.start_time limit 3) q), '[]'::jsonb),
             'is_favorite', exists (select 1 from public.favorites f where f.user_id = me and f.host_id = b.user_id)
           ) as j
      from public.rec_base(me, p_city) b
      join public.profiles p on p.id = b.user_id
      left join public.host_rating_stats rs on rs.host_id = b.user_id
     where not (b.user_id = any (v_excl))
     order by ord
     limit v_limit offset v_off) t;

  return jsonb_build_object('hosts', v_hosts, 'total', v_total, 'has_more', (v_off + v_limit) < v_total);
end $$;

revoke execute on function public.browse_hosts(text, text[], uuid[], int, int) from public, anon;
grant execute on function public.browse_hosts(text, text[], uuid[], int, int) to authenticated;
