-- =====================================================================
-- Roamly 마이그레이션 008: 비밀번호 재설정용 '아이디·이메일 일치 확인'
-- 003(매칭: profiles.suspended 추가) 이후 아무 때나 실행한다. 여러 번 실행해도 안전하다.
--
-- 비밀번호를 잊은 사람이 아이디와 이메일을 입력하면, 둘이 같은 계정의 것인지 서버가 확인한 뒤에만
-- 재설정 메일(인증번호)을 보내게 한다. 이메일은 비밀 정보라서 다음처럼 조심한다.
--  · 이 함수는 true/false 만 돌려주고 이메일·계정 정보를 돌려주지 않는다.
--  · 화면은 일치 여부와 상관없이 같은 안내를 보여 준다(계정이 있는지 알아내지 못하게).
--  · 같은 접속 주소(IP)에서 1시간에 20번까지만 확인할 수 있다(무차별 대입 방지).
--    (이 확인은 아이디가 공개 정보라는 점 때문에 필요하다: 아이디는 다른 이용자에게 보이지만 이메일은 보이지 않는다.)
-- =====================================================================

create table if not exists public.auth_pair_attempts (
  ip text not null,
  bucket timestamptz not null,
  n int not null default 0,
  primary key (ip, bucket)
);
alter table public.auth_pair_attempts enable row level security;     -- 정책이 없어서 서버 함수만 읽고 쓴다

create or replace function public.check_account_pair(p_username text, p_email text) returns boolean
language plpgsql security definer set search_path = public, auth as $$
declare
  v_headers text := current_setting('request.headers', true);
  v_ip text := 'unknown';
  v_n int;
  v_ok boolean;
begin
  -- 접속 주소(PostgREST 가 넣어 주는 헤더). 없으면 'unknown' 으로 묶는다.
  begin
    if v_headers is not null and v_headers <> '' then
      v_ip := coalesce(nullif(btrim(split_part(coalesce(v_headers::json ->> 'x-forwarded-for', ''), ',', 1)), ''), 'unknown');
    end if;
  exception when others then v_ip := 'unknown';
  end;

  delete from public.auth_pair_attempts where bucket < now() - interval '1 day';
  insert into public.auth_pair_attempts as a (ip, bucket, n) values (v_ip, date_trunc('hour', now()), 1)
    on conflict (ip, bucket) do update set n = a.n + 1
    returning a.n into v_n;
  if v_n > 20 then raise exception 'too many attempts' using errcode = '54000'; end if;

  if coalesce(btrim(p_username), '') = '' or coalesce(btrim(p_email), '') = '' then return false; end if;
  select exists (
    select 1 from public.profiles p join auth.users u on u.id = p.id
     where p.display_name <> '' and lower(p.display_name) = lower(btrim(p_username)) and lower(u.email) = lower(btrim(p_email))
       and not p.suspended
  ) into v_ok;
  return v_ok;
end $$;

revoke execute on function public.check_account_pair(text, text) from public;
grant execute on function public.check_account_pair(text, text) to anon, authenticated;
