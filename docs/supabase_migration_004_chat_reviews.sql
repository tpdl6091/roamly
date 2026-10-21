-- =====================================================================
-- Roamly 마이그레이션 004: 1:1 메시지·후기 화면에 맞춘 신고 규칙 보완
-- 003(매칭) 위에 실행한다. 여러 번 실행해도 안전하다.
--
-- 003 까지의 신고 규칙은 '자기 글(content) 신고 금지'만 확인했다. 메시지·후기·사용자 신고가 화면에 생기면서
--  · 자기 자신, 자기가 쓴 후기, 자기가 보낸 메시지는 신고할 수 없게 하고
--  · 메시지는 내가 참여한 대화의 것만 신고할 수 있게 한다(남의 대화 메시지 id 를 추측해 신고하는 것을 막는다).
-- 테이블·함수는 새로 만들지 않는다(메시지·후기·실시간은 003 에 이미 있다).
-- =====================================================================

-- 정책을 지우고 다시 만드는 사이에 오류가 나도 신고 규칙이 비지 않도록 한 번에 실행한다
begin;
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert with check (
  -- 하위 쿼리 안의 같은 이름 열(reviews.target_id 등)과 헷갈리지 않게 reports.target_id 로 적는다
  user_id = auth.uid()
  -- 자기 추천 글 금지(기존 규칙)
  and not (target_type = 'content' and exists (
    select 1 from public.contents c where c.id::text = reports.target_id and c.author_id = auth.uid()))
  -- 자기 자신 금지
  and not (target_type = 'user' and reports.target_id = auth.uid()::text)
  -- 자기가 쓴 후기 금지
  and not (target_type = 'review' and exists (
    select 1 from public.reviews r where r.id::text = reports.target_id and r.reviewer_id = auth.uid()))
  -- 메시지: 내가 참여한 대화에서 상대가 보낸 것만
  and (target_type <> 'message' or exists (
    select 1 from public.messages m join public.conversations c on c.id = m.conversation_id
     where m.id::text = reports.target_id and m.sender_id <> auth.uid() and auth.uid() in (c.traveler_id, c.host_id)))
);
commit;

-- 실시간 '읽음' 표시: messages 의 UPDATE(read_at) 도 상대 화면에 전달되도록 게시 대상에 들어 있는지 다시 확인한다
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
