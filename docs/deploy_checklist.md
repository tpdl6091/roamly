# 배포(Vercel) 체크리스트

> 배포 단계가 되면 이 순서로 진행해요. 가입·연결은 직접 하셔야 하고, 비밀 키는 각 대시보드에만 입력해요.
> (현재는 개발 중이라 `http://localhost:5173` 에서만 열려요.)

## A. 배포 **직후**에 꼭 추가할 것 (주소가 바뀌기 때문)
배포하면 사이트 주소가 `https://무엇.vercel.app`(또는 내 도메인)으로 바뀌어요. 아래 3곳에 **새 주소를 추가**해야 Google 로그인과 이메일 확인 링크가 새 주소에서 동작해요.

- [ ] **Google Cloud → API 및 서비스 → 사용자 인증 정보 → OAuth 클라이언트(roamly-web)**
  - **승인된 JavaScript 원본**에 `https://배포주소` 추가(끝에 `/` 없이)
  - (승인된 리디렉션 URI `https://asuspicgsuawmahwqaxt.supabase.co/auth/v1/callback` 은 **그대로**)
- [ ] **Supabase → Authentication → URL Configuration**
  - **Site URL** 을 `https://배포주소` 로 변경
  - **Redirect URLs** 에 `https://배포주소/**` 추가
  - 배포 때마다 생기는 미리보기 주소에서도 쓰려면 `https://*.vercel.app/**` 도 추가(선택)
- [ ] 로그인 시험: 배포 주소에서 이메일 로그인 / Google 로그인 / 회원가입 확인 메일 링크가 모두 동작하는지

## B. 공개하기 전에 정리할 것
- [ ] **예시 현지인 삭제**: Supabase SQL Editor 에서 `select public.demo_remove_all();`(60명 삭제, 실제 사용자는 그대로)
- [ ] **개인정보 처리방침·이용약관**에 아래 내용 반영: 이메일(Supabase 저장), Google 로그인, 여행·사진·메시지 저장, 현지인 프로필 공개 범위
- [ ] **Google OAuth 동의 화면 게시**: 지금은 "테스트" 상태라 등록한 테스트 사용자만 Google 로그인이 돼요. 누구나 쓰게 하려면 "앱 게시"가 필요해요(기본 범위만 쓰면 보통 간단해요)
- [ ] **이메일 확인(Confirm email)**: 개발 중에 껐다면 다시 켜기
- [ ] **운영자 계정**: 신원 확인·검수를 할 운영자 계정에 admin 권한 지정(docs/matching_admin_howto.md, 005 SQL 안내 참고)
- [ ] **신고·검수 담당** 정하기(신고가 쌓이면 확인할 사람)

## C. 배포 설정 파일(제가 준비)
- [ ] `vercel.json` (정적 사이트, `site/` 폴더를 서비스)
- [ ] 보안 헤더, 캐시 설정
- [ ] 배포 후 확인 목록(6개 언어, 모바일, 회원/비회원 흐름)

## D. 하지 말 것
- Google **클라이언트 보안 비밀번호**, Supabase **service_role 키**, **DB 비밀번호**를 코드·채팅·문서에 적지 않기(대시보드에만 입력).
  사이트 코드에 있는 `sb_publishable_...` 키(공개용)는 괜찮아요.
