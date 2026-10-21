# 1:1 현지인 매칭 — 운영 메모


## 현지인 계정을 "신원 확인"으로 바꾸는 방법
추천 목록에는 **신원 확인(verified)을 마치고 공개(is_public)한 현지인**만 나와요.
신원 확인은 운영자만 바꿀 수 있어서, Supabase **SQL Editor**에서 아래처럼 직접 바꿔요.

```sql
-- 이메일로 계정을 찾아 신원 확인 처리
update public.host_profiles
   set identity_status = 'verified', verified_at = now()
 where user_id = (select id from auth.users where email = '여기에_현지인_이메일');
```

되돌리려면 `identity_status = 'none'` 으로 바꿔요.

## 계정 정지 / 해제
```sql
update public.profiles set suspended = true  where id = (select id from auth.users where email = '이메일');  -- 정지
update public.profiles set suspended = false where id = (select id from auth.users where email = '이메일');  -- 해제
```
정지된 계정은 추천·요청·메시지에서 빠져요.

## 서버가 점수를 계산하는 방식 (recommend_hosts)
- 최종 점수 = 관심사 40% + 여행 스타일 15% + 교류 방식 15% + 언어 10% + 일정 20%
- 같은 도시, 신원 확인·공개, 정지·차단 없음, 예약 가능한 날짜가 있는 현지인만 후보예요.
- 관심사가 하나도 겹치지 않는 현지인은 후보에서 빠져요.
- 점수 순으로 고르되, 아직 나오지 않은 관심 분야의 현지인에게 +5점을 줘서 한 분야만 나오지 않게 해요.
- 조건에 맞는 사람이 5명보다 적으면 있는 사람만 보여 주고, 이유(도시 안 공개 현지인 수, 날짜가 맞는 수, 관심사가 맞는 수)를 함께 돌려줘요.

## 요청 상태
`pending`(응답 대기) → `accepted`(수락) / `declined`(거절) / `cancelled`(취소) → `completed`(만남 완료, 후기는 이 뒤에 작성)
상태 변경은 서버 함수로만 할 수 있어요: `respond_match`, `cancel_match`, `complete_match`.

## 메시지·후기 (2026-10-19 추가)
- **실행할 SQL**: `docs/supabase_migration_004_chat_reviews.sql` 을 SQL Editor 에서 한 번 실행해요(003 다음). 여러 번 실행해도 안전해요.
- **실시간**: Supabase 대시보드 → Database → Publications → `supabase_realtime` 에 `messages` 가 켜져 있는지 확인해요(003·004 가 자동으로 넣지만, 대시보드에서 끈 경우 다시 켜야 해요). 꺼져 있어도 화면은 15초마다 새 메시지를 확인해요.
- **신고 확인**: 메시지·후기·사용자 신고는 `reports` 표에 쌓여요.
```sql
select target_type, target_id, count(distinct user_id) as users, min(created_at)
  from public.reports where resolved_at is null and target_type in ('message','review','user')
 group by 1, 2 order by users desc;
```
- 후기는 서로 다른 3명이 신고하면 자동으로 `under_review`(목록에서 계속 보이되 운영자 확인 대상)가 돼요. 숨기려면:
```sql
update public.reviews set status = 'hidden' where id = '후기_id';
update public.reports set resolved_at = now() where target_type = 'review' and target_id = '후기_id';
```
- 운영자는 모든 대화를 읽을 수 있어요(신고 확인용, `is_admin()`). 일반 사용자는 자기가 참여한 대화만 읽고 쓸 수 있어요.

## 포트폴리오용 예시 현지인 (006)
- **실행할 SQL**: `docs/supabase_migration_006_demo_hosts.sql` 을 SQL Editor 에서 한 번 실행해요(005 다음). 여러 번 실행해도 안전해요.
- **도시당 10명씩 총 60명**(서울·도쿄·오사카·베를린·뉴욕·바르셀로나), 모두 **신원 확인·공개 상태**로 들어가요. 화면에는 예시 표시가 없고 실제 호스트와 똑같이 보여요(구분은 이메일 @demo.roamly.invalid 와 id de00de00- 로 해요).
- 예시 계정은 비밀번호가 없어서 로그인할 수 없고, 요청을 보내도 답이 오지 않아요(실제 사람이 아니에요).
- 가능 일정은 앞으로 30일치가 자동으로 채워져요(화면이 열릴 때 서버 함수 `demo_topup()`이 불려요).
- **실제 배포 전에 예시를 모두 지우는 방법**(SQL Editor, 한 번):
```sql
select public.demo_remove_all();   -- 지운 계정 수를 돌려줘요(60)
```
  이메일이 `@demo.roamly.invalid` 인 계정만 지워지고, 프로필·관심사·일정·요청·대화·후기·즐겨찾기가 함께 지워져요. 진짜 사용자는 그대로예요.
- 예시 데이터 내용을 바꾸려면 `tools/demo-hosts-data.mjs` 를 고치고 `node tools/make-demo-hosts.mjs`(SQL)와 `node tools/make-demo-avatars.mjs`(얼굴 그림)를 다시 실행한 뒤, SQL 을 다시 실행해요. 앞의 13명은 손으로 쓴 소개이고 나머지 47명은 규칙으로 만들어요(다시 만들어도 같은 결과).
- **예시 현지인 사진**: 정면 얼굴 일러스트(SVG)가 `site/img/hosts/<닉네임>.svg` 에 있어요(`node tools/make-demo-avatars.mjs` 로 다시 만들 수 있어요). 실제 사진을 쓰고 싶으면 같은 이름의 `site/img/hosts/<닉네임>.jpg` 를 넣으면 사진이 먼저 보여요(예: `sora_k.jpg`). 사진은 사용 권한이 있는 것만 쓰세요.

## 다른 호스트 둘러보기 (007)
- **실행할 SQL**: `docs/supabase_migration_007_browse_hosts.sql` 을 SQL Editor 에서 한 번 실행해요(003 이후 언제든). 여러 번 실행해도 안전해요.
- 추천 아래의 **"다른 호스트 둘러보기"** 버튼을 누르면, 추천에 나온 사람을 뺀 **같은 도시의 호스트 목록**(신원 확인·공개, 정지·차단 제외)이 12명씩 나오고 **더 보기**로 이어서 볼 수 있어요. 순서는 고른 관심사와 겹치는 수 → 후기 수 → 이름 순이에요.
- 추천이 0명이어도 이 버튼으로 같은 도시의 호스트를 볼 수 있어요.
