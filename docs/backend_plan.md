# Roamly 백엔드(Supabase) 연결 계획

> 상태: 설계 초안. `docs/supabase_schema.sql`은 **아직 실제 DB에서 실행해 검증하지 않았다.** 실행하면서 나오는 오류를 고쳐 가며 확정한다.

## 1. 지금 사용자가 할 일 (순서대로)

### 1-1. 프로젝트 만들기
1. Supabase 대시보드(supabase.com/dashboard)에 로그인한다.
2. **New project**를 누르고 아래처럼 입력한다.
   - Name: `roamly`
   - Database Password: 길고 복잡한 비밀번호 → **비밀번호 관리 도구나 안전한 곳에 보관한다. 채팅·문서·코드에 적지 않는다.**
   - Region: **Northeast Asia (Seoul)** — 한국·일본 이용자가 먼저이기 때문. (유럽 이용자는 속도가 느릴 수 있다. 나중에 다시 검토)
   - Plan: **Free**(개발용). 1주일 동안 활동이 없으면 자동 일시정지되므로 출시할 때 Pro로 올린다.
3. 프로젝트가 만들어질 때까지 1~2분 기다린다.

### 1-2. 사이트에 넣을 공개 정보 확인
**Project Settings → API**(또는 Connect 화면)에서 아래 두 가지를 확인한다.
| 항목 | 설명 | 공유 |
|---|---|---|
| Project URL | `https://xxxx.supabase.co` 형태 | 알려 줘도 됨 |
| `anon` 공개 키 (또는 `publishable` 키) | 브라우저 코드에 넣도록 만들어진 **공개용** 키 | 알려 줘도 됨 |
| `service_role` 키 (또는 `secret` 키), DB 비밀번호 | **전체 권한 비밀 키** | **절대 공유 금지, 사이트 코드에도 금지** |

> 공개 키가 노출돼도 안전하려면 **모든 표에 접근 규칙(RLS)이 올바르게 걸려 있어야 한다.** 스키마 초안이 그 규칙을 포함한다.

### 1-3. 스키마 적용
1. 대시보드 → **SQL Editor** → New query
2. `docs/supabase_schema.sql` 전체를 붙여 넣고 **Run**
3. 오류가 나면 **오류 메시지 전체와 줄 번호**를 알려 준다. (초안이라 한두 번 고칠 수 있다.)
4. 성공하면 Table Editor에서 표들이 만들어졌는지 확인한다.

### 1-4. 로그인 설정(Authentication)
- Authentication → Providers → **Email** 사용(기본)
- 소셜 로그인(구글 등)은 그다음 단계에서 설정한다. 외부 서비스의 키 발급이 필요해서 따로 안내한다.
- URL Configuration의 **Site URL**에 개발 주소(`http://localhost:5173`)를 넣는다.

## 2. 지금 사이트 데이터 → DB 표 대응

| 지금(브라우저 저장) | 옮길 곳 |
|---|---|
| `data.js`의 도시·동네·장소 | `cities`, `neighborhoods`, `places` (시드 SQL을 만들어 넣음) |
| `TRUST_SEEDS`(시연용 신고·투표) | **삭제** (진짜 데이터로 대체) |
| `taste`, `tasteSkipped` | `taste_profiles` |
| `cityRequests`, `myRequests` | `city_requests` + `city_request_counts` 뷰 |
| `saved` | `saved_places` |
| `trips` (일정·예산·지출·준비물) | `trips`, `trip_items`, `expenses`, `checklist_items` |
| `trips[].journal` (방문·메모) | `trip_journal` |
| 사진(IndexedDB) | Storage 버킷 `trip-photos` + `trip_photos` |
| `myPosts` (추천 글) | `contents` |
| `reports`, `confirms` | `reports`, `place_confirmations` + `place_trust` 뷰 |
| `lang` | `profiles.ui_language` (+ 브라우저에도 유지) |
| `writeDraft` (초안) | 계속 브라우저에 둠 |

## 3. 코드 이전 순서 (단계마다 동작 확인)
1. **연결 준비**: `supabase-js`를 사이트에 불러오고 설정 파일에 URL·공개 키를 넣는다.
2. **로그인 화면**: 가입·로그인·로그아웃, 로그인 상태 표시, 내 정보(MY) 탭
3. **읽기 전용 콘텐츠**: 도시·동네·장소를 DB에서 읽기 (시드 SQL 먼저 실행)
4. **내 데이터**: 취향, 저장함, 여행(일정·예산·준비물·기록) 저장·불러오기
5. **쓰기와 신뢰 규칙**: 추천 글 작성, 현장 체크인(서버 함수), 신고, 여전히 맞아요, 검수 대기
6. **사진**: 업로드를 Storage로 옮기기
7. **운영자 도구**: 관리자 계정 지정, 검수 대기 목록 확인

> 기존 브라우저 데이터는 로그인 후 "내 기기의 여행 가져오기" 버튼으로 한 번에 옮기는 방법을 둘 수 있다. (필요하면 결정)

## 4. 코드가 바뀌는 점
- 저장·불러오기가 즉시 처리에서 **서버 응답을 기다리는 방식**으로 바뀐다. 화면에 "불러오는 중", 오류, 오프라인 상태 처리가 필요하다.
- `store.get/set`(`util.js`)을 직접 쓰던 곳을 데이터 함수(`api.js` 같은 한 곳)로 모아서 부른다.
- 신고·투표 같은 계산은 서버 규칙을 따르므로 `trust.js`의 계산을 서버 뷰(`place_trust`) 결과로 대체한다.
- 현장 체크인은 브라우저가 아니라 **서버 함수 `verify_checkin`**이 거리를 계산한다. 좌표는 저장하지 않는다.

## 5. 보안 점검 목록 (출시 전 필수)
- [ ] 모든 표에 RLS가 켜져 있고, 규칙이 의도대로인지 **테스트 계정 2개**로 확인(다른 사람의 여행·사진·신고가 읽히거나 수정되지 않는지)
- [ ] `service_role`/`secret` 키가 사이트 코드·저장소·채팅 어디에도 없는지
- [ ] 사용자가 `author_role`, `checkin_verified`, `status` 같은 신뢰 필드를 직접 바꿀 수 없는지
- [ ] 비공개 버킷의 사진이 본인에게만 보이는지
- [ ] Supabase 대시보드의 보안 점검(Advisors) 경고 확인. 집계용 뷰(`city_request_counts`, `place_trust`)는 소유자 권한으로 실행되도록 **의도적으로** 만든 것이다.
- [ ] 이메일 인증, 비밀번호 정책, 로그인 시도 제한 설정
- [ ] 개인정보 처리방침·약관(위치·사진·계정), EU 이용자 처리 방침 → 전문가 검토

## 6. 비용·지역 메모
- Free는 개발용(1주일 미사용 시 자동 일시정지). 출시 시 Pro(월 25달러부터, 서버 사양·용량 초과분은 별도).
- 요금과 포함 용량은 글마다 다르므로 **공식 요금 페이지에서 최신 내용 확인**.
- 지역은 프로젝트당 하나. 데이터·로그인·사진이 그 지역에 저장된다. 유럽 이용자 비중이 커지면 유럽 지역 프로젝트를 따로 두는 방안을 검토한다(개인정보 규정 확인 포함).

## 7. 열린 질문
1. 소셜 로그인은 어떤 것을 지원할지(구글, 애플, 카카오 등) → 제공 국가·심사 조건 확인 필요
2. 기존 브라우저 데이터 가져오기 기능을 둘지
3. 운영자(관리자) 계정은 누가 갖는지, 검수는 누가 하는지
4. 번역은 서버(Edge Function + 번역 서비스)에서 처리할지, 나중에 할지
5. 웹사이트를 어디에 배포할지(정적 호스팅: Cloudflare Pages / Netlify / Vercel 등)
