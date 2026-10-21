-- =====================================================================
-- Roamly 마이그레이션 010: 현지인(호스트) 신청 취소
-- 003(매칭) 이후 아무 때나 실행한다. 여러 번 실행해도 안전하다.
--
-- host_profiles 는 브라우저에서 직접 지울 수 없다(삭제 정책이 없다). 지우면 match_requests·대화·후기가
-- on delete cascade 로 함께 사라지기 때문이다. 그래서 서버 함수 하나로만 취소하고, 상황에 따라 다르게 처리한다.
--  · 수락된(아직 끝나지 않은) 만남이 있으면 취소할 수 없다 → 먼저 그 만남을 취소하거나 완료해야 한다.
--  · 요청·대화 기록이 전혀 없으면 프로필을 통째로 지운다('deleted') → 운영자 대기 목록에서도 사라진다.
--  · 기록이 있으면 프로필은 남기되(후기·대화 보존) 비공개로 돌리고, 대기 중 요청은 취소하고,
--    아직 예약되지 않은 일정은 지운다('hidden').
-- =====================================================================

create or replace function public.withdraw_host() returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'login required' using errcode = '28000'; end if;
  if not exists (select 1 from public.host_profiles where user_id = me) then return 'none'; end if;

  if exists (select 1 from public.match_requests where host_id = me and status = 'accepted') then
    raise exception 'has accepted meetings';
  end if;

  -- 대기 중인 요청은 거절이 아니라 취소로 정리한다
  update public.match_requests set status = 'cancelled', updated_at = now() where host_id = me and status = 'pending';

  if not exists (select 1 from public.match_requests where host_id = me) then
    delete from public.host_profiles where user_id = me;   -- 관심사·언어·일정은 cascade 로 함께 지워진다
    return 'deleted';
  end if;

  delete from public.availability where host_id = me and not is_booked;
  update public.host_profiles set is_public = false where user_id = me;
  return 'hidden';
end $$;

revoke execute on function public.withdraw_host() from public, anon;
grant execute on function public.withdraw_host() to authenticated;
