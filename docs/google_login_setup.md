# Google 로그인 설정 (직접 하는 부분)

사이트 코드(Google로 계속하기 버튼, 돌아온 뒤 처리, 닉네임 정하기)는 만들어 두었어요.
Google 로그인이 **실제로 되려면** Google Cloud 와 Supabase 대시보드에서 아래 설정을 직접 해야 해요.

> **중요**: Google 의 **클라이언트 비밀(Client secret)** 은 Supabase 대시보드에만 붙여 넣으세요. 저에게 보내거나 코드·문서에 적지 마세요.
> (클라이언트 **ID** 는 공개돼도 괜찮지만, 이 작업에서는 저에게 알려 줄 필요가 없어요.)

## 1. Google Cloud 에서 OAuth 클라이언트 만들기
1. [console.cloud.google.com](https://console.cloud.google.com) 에 Google 계정으로 로그인해요.
2. 위쪽 프로젝트 선택 → **새 프로젝트**(이름: `roamly`) → 만들기
3. 왼쪽 메뉴 **API 및 서비스 → OAuth 동의 화면**
   - 사용자 유형: **외부** → 만들기
   - 앱 이름 `Roamly`, 사용자 지원 이메일(본인), 개발자 연락처 이메일(본인) 입력 → 저장하고 계속
   - 범위(Scopes) 화면에서는 **기본값 그대로** 저장하고 계속(`email`, `profile`, `openid` 만 쓰면 돼요)
   - **테스트 사용자**에 본인 Google 이메일을 추가해요(앱이 "테스트" 상태일 때는 등록한 계정만 로그인돼요)
4. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**
   - 애플리케이션 유형: **웹 애플리케이션**
   - **승인된 리디렉션 URI**에 아래 주소를 그대로 추가:
     `https://asuspicgsuawmahwqaxt.supabase.co/auth/v1/callback`
   - 만들기 → 나오는 **클라이언트 ID**와 **클라이언트 보안 비밀번호(secret)** 를 복사해 둬요

## 2. Supabase 에서 Google 켜기
1. Supabase → `roamly` 프로젝트 → **Authentication → Sign In / Providers → Google**
2. **Enable** 을 켜고, 1번에서 복사한 **Client ID** 와 **Client Secret** 을 붙여 넣고 **Save**

## 3. Supabase 에서 돌아올 주소 허용
1. **Authentication → URL Configuration**
2. **Site URL**: `http://localhost:5173` (배포하면 배포 주소로 바꿔요)
3. **Redirect URLs** 에 추가: `http://localhost:5173/**`
   (배포 후에는 `https://배포주소/**` 도 추가해요)

## 4. 확인하기
1. 사이트를 Ctrl+F5 로 새로고침 → 사람 아이콘 → **Google로 계속하기**
2. Google 로그인 화면에서 테스트 사용자로 등록한 계정을 고르면 사이트로 돌아와요(보던 화면으로 되돌아와요)
3. 처음이면 **"닉네임을 정해 주세요"** 창이 떠요(2~12자, 한글·영문·숫자·밑줄). **나중에**를 눌러도 되고, MY 화면에서 **닉네임 정하기**로 언제든 정할 수 있어요

## 알아둘 점
- **같은 이메일**로 이미 이메일·비밀번호 가입이 되어 있으면, Supabase 가 같은 계정으로 연결하는 경우가 있어요. 이전 데이터(여행·저장)가 그대로 보이면 정상이에요.
- 앱이 "테스트" 상태면 **테스트 사용자만** 로그인할 수 있어요. 누구나 쓰게 하려면 OAuth 동의 화면에서 "앱 게시"를 해야 하고, 그때 Google 의 검토가 필요할 수 있어요. 요청하는 정보가 기본(이메일·프로필)뿐이라 보통 간단해요.
- 로그인에 쓰는 정보: Google 이 알려 주는 **이메일**과 계정 식별자뿐이에요. 사이트는 Google 프로필 사진·이름을 가져다 쓰지 않아요(닉네임은 직접 정해요).
- 개인정보 처리방침에 "Google 로그인 시 이메일 주소를 인증 서비스(Supabase)에 저장한다"는 내용을 넣는 것을 권해요(배포 전에 정리해요).

## 안 될 때 (자주 나오는 오류)
| 증상 | 원인·해결 |
|---|---|
| Google 화면에서 `redirect_uri_mismatch` | 1-4 의 **승인된 리디렉션 URI**가 위 주소와 한 글자라도 다름. 그대로 다시 입력 |
| `Access blocked: ... has not completed verification` / 403 | 앱이 테스트 상태인데 **테스트 사용자**에 그 계정이 없음. 1-3 에서 추가 |
| 돌아왔는데 로그인이 안 된 상태 | 3 의 **Redirect URLs** 에 `http://localhost:5173/**` 가 없음 |
| `provider is not enabled` | 2 의 Google **Enable** 이 꺼져 있음 |
| 사이트에 "Google 로그인을 시작하지 못했어요" | 위 중 하나이거나 인터넷 문제. 브라우저 콘솔의 오류 문구를 알려 주세요 |
