-- 이미 스키마(v0.2)를 실행한 DB에 아이디(닉네임) 기능을 더하는 파일. 여러 번 실행해도 안전하다.

-- >>> username (아이디=닉네임: 2~12자의 한글·영문·숫자·밑줄, 대소문자 구분 없이 중복 불가)
alter table public.profiles drop constraint if exists profiles_name_format;
alter table public.profiles add constraint profiles_name_format
  check (display_name = '' or display_name ~ '^[A-Za-z0-9_가-힣]{2,12}$');
create unique index if not exists profiles_display_name_unique on public.profiles (lower(display_name)) where display_name <> '';

-- 가입할 때 보낸 이름이 형식에 맞을 때만 프로필에 저장한다(맞지 않으면 빈 이름)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_name text := coalesce(new.raw_user_meta_data ->> 'name', '');
begin
  if v_name !~ '^[A-Za-z0-9_가-힣]{2,12}$' then v_name := ''; end if;
  insert into public.profiles (id, display_name) values (new.id, v_name);
  return new;
end $$;

-- 가입 화면에서 아이디가 비어 있는지 미리 확인한다(로그인하기 전이라 anon 도 부를 수 있다)
create or replace function public.username_available(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where lower(display_name) = lower(p_name))
$$;
revoke execute on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
-- <<< username
