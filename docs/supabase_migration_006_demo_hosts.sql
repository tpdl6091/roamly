-- =====================================================================
-- Roamly 마이그레이션 006: 포트폴리오용 예시 현지인 프로필 60명 (자동 생성: node tools/make-demo-hosts.mjs)
-- 005 다음에 실행한다. 여러 번 실행해도 안전하다(이미 있으면 덮어쓴다).
--
-- ※ 실제 사람이 아닌 예시 프로필이다. 화면에도 '예시 프로필'로 표시된다.
-- ※ 지우는 방법(실제 배포 전에 한 번 실행하면 예시 계정과 연결된 모든 데이터가 함께 지워진다):
--      select public.demo_remove_all();
--    (이메일이 @demo.roamly.invalid 인 계정만 지운다)
-- ※ 가능한 일정은 demo_topup()이 앞으로 30일치를 자동으로 채운다(화면이 열릴 때 불린다).
-- =====================================================================

alter table public.host_profiles add column if not exists is_demo boolean not null default false;

-- ---------- 1. 예시 계정(로그인 불가: 비밀번호 없음) ----------
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sora_k@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"sora_k","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'minjun_s@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"minjun_s","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hayeon_p@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"hayeon_p","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'yuki_t@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"yuki_t","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kenji_m@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"kenji_m","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'haru_o@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"haru_o","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mei_n@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"mei_n","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lena_b@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"lena_b","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jonas_k@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"jonas_k","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya_r@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"maya_r","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dan_w@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"dan_w","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marta_v@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"marta_v","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'diego_l@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"diego_l","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jiwoo_l@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"jiwoo_l","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000015', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'taeyang_c@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"taeyang_c","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000016', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seoyeon_h@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"seoyeon_h","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000017', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dohyun_j@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"dohyun_j","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000018', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'eunji_k@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"eunji_k","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000019', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hyunwoo_p@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"hyunwoo_p","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'naeun_y@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"naeun_y","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000021', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sakura_h@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"sakura_h","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000022', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ren_k@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"ren_k","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000023', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aoi_s@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"aoi_s","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000024', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'daichi_t@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"daichi_t","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000025', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mio_y@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"mio_y","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000026', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'takumi_n@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"takumi_n","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000027', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hina_m@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"hina_m","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000028', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sota_i@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"sota_i","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000029', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rina_o@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"rina_o","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000030', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'shun_k@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"shun_k","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000031', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nana_t@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"nana_t","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000032', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ryota_m@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"ryota_m","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000033', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'saki_h@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"saki_h","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000034', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kaito_y@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"kaito_y","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000035', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'yuna_s@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"yuna_s","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000036', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tomoya_n@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"tomoya_n","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000037', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'felix_w@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"felix_w","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000038', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anna_m@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"anna_m","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000039', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'paul_r@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"paul_r","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000040', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'clara_s@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"clara_s","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000041', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'max_h@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"max_h","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000042', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nora_b@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"nora_b","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000043', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'leon_k@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"leon_k","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000044', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ida_f@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"ida_f","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000045', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'chris_p@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"chris_p","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000046', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'zoe_l@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"zoe_l","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000047', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nate_b@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"nate_b","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000048', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lily_t@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"lily_t","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000049', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'omar_s@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"omar_s","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000050', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'grace_k@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"grace_k","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000051', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jake_m@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"jake_m","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000052', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nina_c@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"nina_c","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000053', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pau_g@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"pau_g","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000054', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'laia_r@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"laia_r","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000055', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jordi_m@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"jordi_m","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000056', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carla_v@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"carla_v","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000057', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nuria_s@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"nuria_s","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000058', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marc_b@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"marc_b","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000059', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'irene_p@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"irene_p","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;
insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('de00de00-0000-4000-8000-000000000060', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'adria_c@demo.roamly.invalid',
          '{"provider":"demo","providers":["demo"]}'::jsonb, '{"name":"adria_c","demo":true}'::jsonb, now(), now())
  on conflict (id) do nothing;

-- ---------- 2. 현지인 프로필(신원 확인·공개 상태, 예시 표시) ----------
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000001', 'seoul', '망원동에서 6년째 살고 있어요. 이 동네의 시장과 먹거리 골목이 제 단골 코스예요. 사진을 찍으며 천천히 걷고, 공연 이야기도 나누고 싶어요. 편하게 요청 주세요.', 6, 'verified', now(), true, true, array['relaxed','like_local']::text[], array['casual','deep_talk']::text[], array['mangwon']::text[], array[]::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000001';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000001', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000001', 'bakery'), ('de00de00-0000-4000-8000-000000000001', 'photo'), ('de00de00-0000-4000-8000-000000000001', 'vintage'), ('de00de00-0000-4000-8000-000000000001', 'neighborhood_walk');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000001';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000001', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000001', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000002', 'seoul', '성수동에서 4년째 살고 있어요. 이 동네의 디자인 숍과 공방 구경을 좋아해요. 사진을 찍으며 천천히 걷고, 공연 이야기도 나누고 싶어요. 천천히 이야기하며 걸어요.', 4, 'verified', now(), true, true, array['active','new_experience']::text[], array['activity','casual']::text[], array['seongsu']::text[], array['ss-factory','ss-design']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000002';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000002', 'local_eats'), ('de00de00-0000-4000-8000-000000000002', 'hotspot'), ('de00de00-0000-4000-8000-000000000002', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000002', 'music_show'), ('de00de00-0000-4000-8000-000000000002', 'board_games');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000002';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000002', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000002', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000003', 'seoul', '망원동에서 9년째 살고 있어요. 이 동네의 시장과 먹거리 골목이 제 단골 코스예요. 동네를 걷고 공원에서 쉬는 걸 좋아해요. 천천히 이야기하며 걸어요.', 9, 'verified', now(), true, true, array['relaxed']::text[], array['deep_talk','casual']::text[], array['mangwon']::text[], array[]::text[], 3, '시장에서 먹은 것만 각자 부담해요.')
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000003';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000003', 'local_market'), ('de00de00-0000-4000-8000-000000000003', 'market_street_food'), ('de00de00-0000-4000-8000-000000000003', 'cooking_together'), ('de00de00-0000-4000-8000-000000000003', 'language_exchange'), ('de00de00-0000-4000-8000-000000000003', 'park_nature');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000003';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000003', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000003', 'ja', 'fluent'), ('de00de00-0000-4000-8000-000000000003', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000004', 'tokyo', '蔵前に8年住んでいます。 この街のデザインショップや工房めぐりが好きです。 展覧会や小さな書店、古着屋めぐりが好きです。 のんびり話しながら歩きましょう。', 8, 'verified', now(), true, true, array['relaxed','like_local']::text[], array['deep_talk','casual']::text[], array['kuramae']::text[], array['kr-craft','kr-river']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000004';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000004', 'reading'), ('de00de00-0000-4000-8000-000000000004', 'vintage'), ('de00de00-0000-4000-8000-000000000004', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000004', 'music_show'), ('de00de00-0000-4000-8000-000000000004', 'photo');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000004';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000004', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000004', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000005', 'tokyo', '下北沢に5年住んでいます。 この街の小さな書店によく立ち寄ります。 街歩きと公園でひと休みするのが好きです。 のんびり話しながら歩きましょう。', 5, 'verified', now(), true, true, array['active','new_experience']::text[], array['activity']::text[], array['shimokitazawa']::text[], array['sk-books','sk-cafe','sk-vintage']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000005';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000005', 'cycling'), ('de00de00-0000-4000-8000-000000000005', 'local_eats'), ('de00de00-0000-4000-8000-000000000005', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000005', 'hidden_spots');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000005';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000005', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000005', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000006', 'osaka', '中崎町に7年住んでいます。 この街のデザインショップや工房めぐりが好きです。 路地のカフェや小さなパン屋、地元の食堂をよく巡ります。 気軽にリクエストしてください。', 7, 'verified', now(), true, true, array['relaxed','new_experience']::text[], array['casual']::text[], array['nakazakicho']::text[], array['nz-house','nz-small']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000006';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000006', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000006', 'vintage'), ('de00de00-0000-4000-8000-000000000006', 'photo'), ('de00de00-0000-4000-8000-000000000006', 'hotspot');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000006';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000006', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000006', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000007', 'osaka', '中之島に12年住んでいます。 この街の近くの公園や水辺をよく散歩します。 路地のカフェや小さなパン屋、地元の食堂をよく巡ります。 のんびり話しながら歩きましょう。', 12, 'verified', now(), true, true, array['like_local']::text[], array['deep_talk','casual']::text[], array['nakanoshima']::text[], array[]::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000007';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000007', 'market_street_food'), ('de00de00-0000-4000-8000-000000000007', 'local_eats'), ('de00de00-0000-4000-8000-000000000007', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000007', 'cooking_together');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000007';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000007', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000007', 'zh', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000008', 'berlin', 'Ich wohne seit 10 Jahren in Prenzlauer Berg. Die ruhigen Gassen in diesem Viertel kenne ich im Schlaf. Ich fotografiere gern beim Spazieren und rede gern über Musik. Lass uns in Ruhe plaudern und laufen.', 10, 'verified', now(), true, true, array['active','new_experience']::text[], array['activity','casual']::text[], array['prenzlauerberg']::text[], array['be-books','be-park']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000008';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000008', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000008', 'music_show'), ('de00de00-0000-4000-8000-000000000008', 'local_market'), ('de00de00-0000-4000-8000-000000000008', 'new_friends'), ('de00de00-0000-4000-8000-000000000008', 'vintage');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000008';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000008', 'de', 'native'), ('de00de00-0000-4000-8000-000000000008', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000009', 'berlin', 'Ich wohne seit 6 Jahren in Neukölln. Ich stöbere gern in den Designläden und Werkstätten in diesem Viertel. Ich suche verborgene Orte und zeige dir den Alltag hier. Schreib mir gern eine Anfrage.', 6, 'verified', now(), true, true, array['relaxed']::text[], array['deep_talk','casual']::text[], array['neukolln']::text[], array['be-noodle']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000009';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000009', 'reading'), ('de00de00-0000-4000-8000-000000000009', 'bakery'), ('de00de00-0000-4000-8000-000000000009', 'cycling'), ('de00de00-0000-4000-8000-000000000009', 'board_games'), ('de00de00-0000-4000-8000-000000000009', 'park_nature');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000009';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000009', 'de', 'native'), ('de00de00-0000-4000-8000-000000000009', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000010', 'newyork', 'I''ve lived in Park Slope for 7 years. I know several cafés in this neighborhood that are great for lingering. I like walking slowly with a camera and talking about music. Feel free to send a request.', 7, 'verified', now(), true, true, array['relaxed','like_local']::text[], array['casual','deep_talk']::text[], array['parkslope']::text[], array['ny-park']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000010';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000010', 'reading'), ('de00de00-0000-4000-8000-000000000010', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000010', 'music_show'), ('de00de00-0000-4000-8000-000000000010', 'photo'), ('de00de00-0000-4000-8000-000000000010', 'neighborhood_walk');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000010';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000010', 'en', 'native'), ('de00de00-0000-4000-8000-000000000010', 'es', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000011', 'newyork', 'I''ve lived in Greenwich Village for 11 years. I know several cafés in this neighborhood that are great for lingering. I enjoy language exchange and meeting new people. Feel free to send a request.', 11, 'verified', now(), true, true, array['active','like_local']::text[], array['activity','casual']::text[], array['greenwichvillage']::text[], array['ny-books','ny-cafe']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000011';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000011', 'local_eats'), ('de00de00-0000-4000-8000-000000000011', 'market_street_food'), ('de00de00-0000-4000-8000-000000000011', 'park_nature'), ('de00de00-0000-4000-8000-000000000011', 'hidden_spots'), ('de00de00-0000-4000-8000-000000000011', 'language_exchange');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000011';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000011', 'en', 'native'), ('de00de00-0000-4000-8000-000000000011', 'zh', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000012', 'barcelona', 'Vivo en Gràcia desde hace 9 años. Conozco las calles tranquilas de este barrio como la palma de mi mano. Te llevo a rincones escondidos y te muestro el día a día. Paseemos y charlemos con calma.', 9, 'verified', now(), true, true, array['relaxed','like_local']::text[], array['deep_talk','casual']::text[], array['gracia']::text[], array['bc-cafe','bc-market']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000012';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000012', 'local_market'), ('de00de00-0000-4000-8000-000000000012', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000012', 'vintage'), ('de00de00-0000-4000-8000-000000000012', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000012', 'photo');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000012';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000012', 'es', 'native'), ('de00de00-0000-4000-8000-000000000012', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000013', 'barcelona', 'Vivo en Sant Antoni desde hace 5 años. Los mercados y callejones de comida de este barrio son mi ruta de siempre. Me encantan los cafés pequeños, las panaderías y los sitios del barrio. Envíame una solicitud sin problema.', 5, 'verified', now(), true, true, array['active','new_experience']::text[], array['activity','casual']::text[], array['santantoni']::text[], array['bc-tapas']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000013';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000013', 'local_eats'), ('de00de00-0000-4000-8000-000000000013', 'cycling'), ('de00de00-0000-4000-8000-000000000013', 'park_nature'), ('de00de00-0000-4000-8000-000000000013', 'board_games'), ('de00de00-0000-4000-8000-000000000013', 'language_exchange');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000013';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000013', 'es', 'native'), ('de00de00-0000-4000-8000-000000000013', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000014', 'seoul', '성수동에서 6년째 살고 있어요. 이 동네의 디자인 숍과 공방 구경을 좋아해요. 숨은 장소를 찾아다니며 일상의 모습을 보여 드려요. 편하게 요청 주세요.', 6, 'verified', now(), true, true, array['new_experience','like_local']::text[], array['deep_talk']::text[], array['seongsu']::text[], array['ss-factory','ss-design']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000014';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000014', 'park_nature'), ('de00de00-0000-4000-8000-000000000014', 'neighborhood_walk'), ('de00de00-0000-4000-8000-000000000014', 'new_friends'), ('de00de00-0000-4000-8000-000000000014', 'cooking_together'), ('de00de00-0000-4000-8000-000000000014', 'hotspot');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000014';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000014', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000014', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000015', 'seoul', '성수동에서 13년째 살고 있어요. 이 동네에서 오래 앉아 있기 좋은 카페를 여럿 알아요. 언어 교류와 새로운 친구 만나기를 좋아해요. 편하게 요청 주세요.', 13, 'verified', now(), true, true, array['active']::text[], array['deep_talk']::text[], array['seongsu']::text[], array['ss-factory','ss-design']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000015';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000015', 'local_market'), ('de00de00-0000-4000-8000-000000000015', 'hidden_spots'), ('de00de00-0000-4000-8000-000000000015', 'photo'), ('de00de00-0000-4000-8000-000000000015', 'board_games'), ('de00de00-0000-4000-8000-000000000015', 'local_culture_talk');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000015';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000015', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000015', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000016', 'seoul', '성수동에서 2년째 살고 있어요. 이 동네의 디자인 숍과 공방 구경을 좋아해요. 언어 교류와 새로운 친구 만나기를 좋아해요. 편하게 요청 주세요.', 2, 'verified', now(), true, true, array['like_local','new_experience']::text[], array['deep_talk','casual']::text[], array['seongsu']::text[], array['ss-factory','ss-design']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000016';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000016', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000016', 'board_games'), ('de00de00-0000-4000-8000-000000000016', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000016', 'hotspot'), ('de00de00-0000-4000-8000-000000000016', 'cycling');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000016';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000016', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000016', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000017', 'seoul', '서촌에서 9년째 살고 있어요. 이 동네의 디자인 숍과 공방 구경을 좋아해요. 숨은 장소를 찾아다니며 일상의 모습을 보여 드려요. 편하게 요청 주세요.', 9, 'verified', now(), true, true, array['active','new_experience']::text[], array['casual']::text[], array['seochon']::text[], array[]::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000017';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000017', 'board_games'), ('de00de00-0000-4000-8000-000000000017', 'language_exchange'), ('de00de00-0000-4000-8000-000000000017', 'bakery'), ('de00de00-0000-4000-8000-000000000017', 'hotspot'), ('de00de00-0000-4000-8000-000000000017', 'hidden_spots');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000017';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000017', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000017', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000018', 'seoul', '성수동에서 9년째 살고 있어요. 이 동네에서 오래 앉아 있기 좋은 카페를 여럿 알아요. 현지 문화 이야기를 나누고, 보드게임이나 요리도 함께 해요. 천천히 이야기하며 걸어요.', 9, 'verified', now(), true, true, array['relaxed']::text[], array['casual','activity']::text[], array['seongsu']::text[], array['ss-factory','ss-design']::text[], 4, '각자 먹은 것만 부담해요.')
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000018';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000018', 'new_friends'), ('de00de00-0000-4000-8000-000000000018', 'language_exchange'), ('de00de00-0000-4000-8000-000000000018', 'vintage'), ('de00de00-0000-4000-8000-000000000018', 'cycling');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000018';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000018', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000018', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000019', 'seoul', '연남동에서 6년째 살고 있어요. 이 동네의 작은 서점들을 자주 들러요. 현지 문화 이야기를 나누고, 보드게임이나 요리도 함께 해요. 편하게 요청 주세요.', 6, 'verified', now(), true, true, array['relaxed']::text[], array['casual']::text[], array['yeonnam']::text[], array['yn-books','yn-cafe','yn-noodle']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000019';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000019', 'new_friends'), ('de00de00-0000-4000-8000-000000000019', 'cooking_together'), ('de00de00-0000-4000-8000-000000000019', 'photo'), ('de00de00-0000-4000-8000-000000000019', 'local_eats'), ('de00de00-0000-4000-8000-000000000019', 'cafe_tour');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000019';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000019', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000019', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000020', 'seoul', '망원동에서 13년째 살고 있어요. 이 동네 근처 공원과 물가를 자주 산책해요. 골목 카페와 작은 빵집, 동네 맛집을 자주 찾아요. 천천히 이야기하며 걸어요.', 13, 'verified', now(), true, true, array['active','relaxed']::text[], array['deep_talk']::text[], array['mangwon']::text[], array[]::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000020';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000020', 'board_games'), ('de00de00-0000-4000-8000-000000000020', 'language_exchange'), ('de00de00-0000-4000-8000-000000000020', 'hotspot'), ('de00de00-0000-4000-8000-000000000020', 'market_street_food');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000020';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000020', 'ko', 'native'), ('de00de00-0000-4000-8000-000000000020', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000021', 'tokyo', '谷中に10年住んでいます。 この街の静かな路地は目をつぶっても歩けます。 展覧会や小さな書店、古着屋めぐりが好きです。 のんびり話しながら歩きましょう。', 10, 'verified', now(), true, true, array['like_local']::text[], array['deep_talk','activity']::text[], array['yanaka']::text[], array[]::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000021';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000021', 'neighborhood_walk'), ('de00de00-0000-4000-8000-000000000021', 'local_market'), ('de00de00-0000-4000-8000-000000000021', 'reading'), ('de00de00-0000-4000-8000-000000000021', 'vintage');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000021';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000021', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000021', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000022', 'tokyo', '下北沢に3年住んでいます。 この街の小さな書店によく立ち寄ります。 隠れた場所を探しながら、日常の姿をお見せします。 気軽にリクエストしてください。', 3, 'verified', now(), true, true, array['relaxed']::text[], array['activity']::text[], array['shimokitazawa']::text[], array['sk-books','sk-cafe','sk-vintage']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000022';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000022', 'new_friends'), ('de00de00-0000-4000-8000-000000000022', 'cooking_together'), ('de00de00-0000-4000-8000-000000000022', 'cycling'), ('de00de00-0000-4000-8000-000000000022', 'hidden_spots');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000022';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000022', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000022', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000023', 'tokyo', '谷中に11年住んでいます。 この街の市場や食べ歩きの路地が行きつけです。 街歩きと公園でひと休みするのが好きです。 のんびり話しながら歩きましょう。', 11, 'verified', now(), true, true, array['like_local']::text[], array['activity','deep_talk']::text[], array['yanaka']::text[], array[]::text[], 3, '各自が食べた分だけ負担します。')
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000023';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000023', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000023', 'new_friends'), ('de00de00-0000-4000-8000-000000000023', 'neighborhood_walk');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000023';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000023', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000023', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000024', 'tokyo', '蔵前に7年住んでいます。 この街のデザインショップや工房めぐりが好きです。 写真を撮りながらゆっくり歩き、音楽の話もしたいです。 気軽にリクエストしてください。', 7, 'verified', now(), true, true, array['new_experience','relaxed']::text[], array['activity','deep_talk']::text[], array['kuramae']::text[], array['kr-craft','kr-river']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000024';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000024', 'local_eats'), ('de00de00-0000-4000-8000-000000000024', 'market_street_food'), ('de00de00-0000-4000-8000-000000000024', 'board_games'), ('de00de00-0000-4000-8000-000000000024', 'reading'), ('de00de00-0000-4000-8000-000000000024', 'photo');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000024';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000024', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000024', 'en', 'conversational'), ('de00de00-0000-4000-8000-000000000024', 'ko', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000025', 'tokyo', '蔵前に9年住んでいます。 この街で長居したくなるカフェをいくつも知っています。 地元の文化の話をしたり、ボードゲームや料理も一緒に楽しめます。 のんびり話しながら歩きましょう。', 9, 'verified', now(), true, true, array['relaxed']::text[], array['deep_talk','casual']::text[], array['kuramae']::text[], array['kr-craft','kr-river']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000025';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000025', 'cycling'), ('de00de00-0000-4000-8000-000000000025', 'park_nature'), ('de00de00-0000-4000-8000-000000000025', 'photo'), ('de00de00-0000-4000-8000-000000000025', 'cooking_together'), ('de00de00-0000-4000-8000-000000000025', 'new_friends');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000025';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000025', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000025', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000026', 'tokyo', '中目黒に4年住んでいます。 この街で長居したくなるカフェをいくつも知っています。 展覧会や小さな書店、古着屋めぐりが好きです。 気軽にリクエストしてください。', 4, 'verified', now(), true, true, array['relaxed']::text[], array['deep_talk','casual']::text[], array['nakameguro']::text[], array[]::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000026';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000026', 'bakery'), ('de00de00-0000-4000-8000-000000000026', 'local_eats'), ('de00de00-0000-4000-8000-000000000026', 'neighborhood_walk'), ('de00de00-0000-4000-8000-000000000026', 'reading');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000026';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000026', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000026', 'en', 'fluent'), ('de00de00-0000-4000-8000-000000000026', 'ko', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000027', 'tokyo', '中目黒に2年住んでいます。 この街の近くの公園や水辺をよく散歩します。 地元の人が通う食堂や市場の味を紹介します。 気軽にリクエストしてください。', 2, 'verified', now(), true, true, array['like_local']::text[], array['activity']::text[], array['nakameguro']::text[], array[]::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000027';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000027', 'market_street_food'), ('de00de00-0000-4000-8000-000000000027', 'bakery'), ('de00de00-0000-4000-8000-000000000027', 'neighborhood_walk');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000027';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000027', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000027', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000028', 'tokyo', '下北沢に9年住んでいます。 この街の静かな路地は目をつぶっても歩けます。 写真を撮りながらゆっくり歩き、音楽の話もしたいです。 のんびり話しながら歩きましょう。', 9, 'verified', now(), true, true, array['like_local']::text[], array['deep_talk']::text[], array['shimokitazawa']::text[], array['sk-books','sk-cafe','sk-vintage']::text[], 2, '各自が食べた分だけ負担します。')
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000028';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000028', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000028', 'vintage'), ('de00de00-0000-4000-8000-000000000028', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000028', 'market_street_food');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000028';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000028', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000028', 'en', 'conversational'), ('de00de00-0000-4000-8000-000000000028', 'zh', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000029', 'osaka', '中之島に6年住んでいます。 この街の近くの公園や水辺をよく散歩します。 路地のカフェや小さなパン屋、地元の食堂をよく巡ります。 のんびり話しながら歩きましょう。', 6, 'verified', now(), true, true, array['new_experience']::text[], array['activity','deep_talk']::text[], array['nakanoshima']::text[], array[]::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000029';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000029', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000029', 'hotspot'), ('de00de00-0000-4000-8000-000000000029', 'hidden_spots'), ('de00de00-0000-4000-8000-000000000029', 'local_market'), ('de00de00-0000-4000-8000-000000000029', 'music_show');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000029';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000029', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000029', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000030', 'osaka', '中之島に11年住んでいます。 この街の近くの公園や水辺をよく散歩します。 写真を撮りながらゆっくり歩き、音楽の話もしたいです。 のんびり話しながら歩きましょう。', 11, 'verified', now(), true, true, array['new_experience','like_local']::text[], array['activity']::text[], array['nakanoshima']::text[], array[]::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000030';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000030', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000030', 'market_street_food'), ('de00de00-0000-4000-8000-000000000030', 'new_friends'), ('de00de00-0000-4000-8000-000000000030', 'vintage'), ('de00de00-0000-4000-8000-000000000030', 'music_show');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000030';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000030', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000030', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000031', 'osaka', '中崎町に13年住んでいます。 この街の静かな路地は目をつぶっても歩けます。 地元の人が通う食堂や市場の味を紹介します。 気軽にリクエストしてください。', 13, 'verified', now(), true, true, array['like_local','new_experience']::text[], array['deep_talk','activity']::text[], array['nakazakicho']::text[], array['nz-house','nz-small']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000031';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000031', 'local_eats'), ('de00de00-0000-4000-8000-000000000031', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000031', 'hidden_spots'), ('de00de00-0000-4000-8000-000000000031', 'local_market'), ('de00de00-0000-4000-8000-000000000031', 'cooking_together');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000031';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000031', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000031', 'en', 'fluent'), ('de00de00-0000-4000-8000-000000000031', 'zh', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000032', 'osaka', '中崎町に14年住んでいます。 この街のデザインショップや工房めぐりが好きです。 写真を撮りながらゆっくり歩き、音楽の話もしたいです。 気軽にリクエストしてください。', 14, 'verified', now(), true, true, array['new_experience','active']::text[], array['deep_talk','casual']::text[], array['nakazakicho']::text[], array['nz-house','nz-small']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000032';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000032', 'music_show'), ('de00de00-0000-4000-8000-000000000032', 'photo'), ('de00de00-0000-4000-8000-000000000032', 'hotspot');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000032';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000032', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000032', 'en', 'conversational'), ('de00de00-0000-4000-8000-000000000032', 'zh', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000033', 'osaka', '堀江に6年住んでいます。 この街で長居したくなるカフェをいくつも知っています。 街歩きと公園でひと休みするのが好きです。 のんびり話しながら歩きましょう。', 6, 'verified', now(), true, true, array['like_local']::text[], array['deep_talk']::text[], array['horie']::text[], array[]::text[], 3, '各自が食べた分だけ負担します。')
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000033';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000033', 'cycling'), ('de00de00-0000-4000-8000-000000000033', 'park_nature'), ('de00de00-0000-4000-8000-000000000033', 'language_exchange'), ('de00de00-0000-4000-8000-000000000033', 'hotspot');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000033';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000033', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000033', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000034', 'osaka', '中之島に10年住んでいます。 この街の近くの公園や水辺をよく散歩します。 路地のカフェや小さなパン屋、地元の食堂をよく巡ります。 気軽にリクエストしてください。', 10, 'verified', now(), true, true, array['new_experience','relaxed']::text[], array['casual']::text[], array['nakanoshima']::text[], array[]::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000034';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000034', 'local_market'), ('de00de00-0000-4000-8000-000000000034', 'hidden_spots'), ('de00de00-0000-4000-8000-000000000034', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000034', 'photo'), ('de00de00-0000-4000-8000-000000000034', 'market_street_food');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000034';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000034', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000034', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000035', 'osaka', '天神橋筋に14年住んでいます。 この街の市場や食べ歩きの路地が行きつけです。 展覧会や小さな書店、古着屋めぐりが好きです。 気軽にリクエストしてください。', 14, 'verified', now(), true, true, array['relaxed']::text[], array['deep_talk','activity']::text[], array['tenjinbashisuji']::text[], array[]::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000035';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000035', 'vintage'), ('de00de00-0000-4000-8000-000000000035', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000035', 'language_exchange');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000035';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000035', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000035', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000036', 'osaka', '天神橋筋に5年住んでいます。 この街の市場や食べ歩きの路地が行きつけです。 地元の人が通う食堂や市場の味を紹介します。 気軽にリクエストしてください。', 5, 'verified', now(), true, true, array['like_local','new_experience']::text[], array['deep_talk','activity']::text[], array['tenjinbashisuji']::text[], array[]::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000036';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000036', 'bakery'), ('de00de00-0000-4000-8000-000000000036', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000036', 'local_market'), ('de00de00-0000-4000-8000-000000000036', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000036', 'reading');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000036';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000036', 'ja', 'native'), ('de00de00-0000-4000-8000-000000000036', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000037', 'berlin', 'Ich wohne seit 6 Jahren in Friedrichshain. In diesem Viertel kenne ich mehrere Cafés, in denen man lange sitzen kann. Ich mag Ausstellungen, kleine Buchläden und Vintage-Läden. Lass uns in Ruhe plaudern und laufen.', 6, 'verified', now(), true, true, array['relaxed']::text[], array['casual']::text[], array['friedrichshain']::text[], array['be-vintage']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000037';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000037', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000037', 'cooking_together'), ('de00de00-0000-4000-8000-000000000037', 'local_eats'), ('de00de00-0000-4000-8000-000000000037', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000037', 'photo');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000037';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000037', 'de', 'native'), ('de00de00-0000-4000-8000-000000000037', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000038', 'berlin', 'Ich wohne seit 7 Jahren in Prenzlauer Berg. In diesem Viertel kenne ich mehrere Cafés, in denen man lange sitzen kann. Ich gehe gern spazieren und ruhe mich in Parks aus. Lass uns in Ruhe plaudern und laufen.', 7, 'verified', now(), true, true, array['like_local','new_experience']::text[], array['casual','deep_talk']::text[], array['prenzlauerberg']::text[], array['be-books','be-park']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000038';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000038', 'park_nature'), ('de00de00-0000-4000-8000-000000000038', 'cycling'), ('de00de00-0000-4000-8000-000000000038', 'reading'), ('de00de00-0000-4000-8000-000000000038', 'art_exhibit');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000038';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000038', 'de', 'native'), ('de00de00-0000-4000-8000-000000000038', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000039', 'berlin', 'Ich wohne seit 12 Jahren in Prenzlauer Berg. Die ruhigen Gassen in diesem Viertel kenne ich im Schlaf. Ich mag Ausstellungen, kleine Buchläden und Vintage-Läden. Schreib mir gern eine Anfrage.', 12, 'verified', now(), true, true, array['like_local','active']::text[], array['casual']::text[], array['prenzlauerberg']::text[], array['be-books','be-park']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000039';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000039', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000039', 'photo'), ('de00de00-0000-4000-8000-000000000039', 'board_games'), ('de00de00-0000-4000-8000-000000000039', 'hidden_spots');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000039';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000039', 'de', 'native'), ('de00de00-0000-4000-8000-000000000039', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000040', 'berlin', 'Ich wohne seit 5 Jahren in Kreuzberg. Die Märkte und Imbissgassen in diesem Viertel sind meine Stammrunde. Ich mag Sprachaustausch und neue Bekanntschaften. Schreib mir gern eine Anfrage.', 5, 'verified', now(), true, true, array['active']::text[], array['deep_talk','casual']::text[], array['kreuzberg']::text[], array['be-market','be-cafe']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000040';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000040', 'music_show'), ('de00de00-0000-4000-8000-000000000040', 'reading'), ('de00de00-0000-4000-8000-000000000040', 'cooking_together'), ('de00de00-0000-4000-8000-000000000040', 'local_culture_talk');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000040';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000040', 'de', 'native'), ('de00de00-0000-4000-8000-000000000040', 'en', 'conversational'), ('de00de00-0000-4000-8000-000000000040', 'ja', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000041', 'berlin', 'Ich wohne seit 12 Jahren in Neukölln. Die Märkte und Imbissgassen in diesem Viertel sind meine Stammrunde. Ich mag Sprachaustausch und neue Bekanntschaften. Lass uns in Ruhe plaudern und laufen.', 12, 'verified', now(), true, true, array['like_local']::text[], array['casual','deep_talk']::text[], array['neukolln']::text[], array['be-noodle']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000041';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000041', 'new_friends'), ('de00de00-0000-4000-8000-000000000041', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000041', 'music_show'), ('de00de00-0000-4000-8000-000000000041', 'market_street_food');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000041';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000041', 'de', 'native'), ('de00de00-0000-4000-8000-000000000041', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000042', 'berlin', 'Ich wohne seit 6 Jahren in Friedrichshain. In diesem Viertel kenne ich mehrere Cafés, in denen man lange sitzen kann. Wir können über lokale Kultur reden, Brettspiele spielen oder zusammen kochen. Lass uns in Ruhe plaudern und laufen.', 6, 'verified', now(), true, true, array['active']::text[], array['deep_talk']::text[], array['friedrichshain']::text[], array['be-vintage']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000042';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000042', 'market_street_food'), ('de00de00-0000-4000-8000-000000000042', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000042', 'board_games'), ('de00de00-0000-4000-8000-000000000042', 'local_market'), ('de00de00-0000-4000-8000-000000000042', 'neighborhood_walk');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000042';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000042', 'de', 'native'), ('de00de00-0000-4000-8000-000000000042', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000043', 'berlin', 'Ich wohne seit 7 Jahren in Friedrichshain. Ich stöbere gern in den Designläden und Werkstätten in diesem Viertel. Ich fotografiere gern beim Spazieren und rede gern über Musik. Schreib mir gern eine Anfrage.', 7, 'verified', now(), true, true, array['active','relaxed']::text[], array['deep_talk','activity']::text[], array['friedrichshain']::text[], array['be-vintage']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000043';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000043', 'local_market'), ('de00de00-0000-4000-8000-000000000043', 'hidden_spots'), ('de00de00-0000-4000-8000-000000000043', 'vintage'), ('de00de00-0000-4000-8000-000000000043', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000043', 'language_exchange');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000043';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000043', 'de', 'native'), ('de00de00-0000-4000-8000-000000000043', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000044', 'berlin', 'Ich wohne seit 12 Jahren in Friedrichshain. Ich stöbere gern in den Designläden und Werkstätten in diesem Viertel. Ich zeige dir, wo die Leute hier wirklich essen. Lass uns in Ruhe plaudern und laufen.', 12, 'verified', now(), true, true, array['like_local','relaxed']::text[], array['casual','activity']::text[], array['friedrichshain']::text[], array['be-vintage']::text[], 3, 'Jeder zahlt nur, was er isst.')
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000044';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000044', 'hotspot'), ('de00de00-0000-4000-8000-000000000044', 'bakery'), ('de00de00-0000-4000-8000-000000000044', 'language_exchange');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000044';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000044', 'de', 'native'), ('de00de00-0000-4000-8000-000000000044', 'en', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000045', 'newyork', 'I''ve lived in Park Slope for 10 years. I know the quiet side streets of this neighborhood like the back of my hand. I''ll show you where locals actually eat. Feel free to send a request.', 10, 'verified', now(), true, true, array['relaxed','like_local']::text[], array['activity']::text[], array['parkslope']::text[], array['ny-park']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000045';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000045', 'cooking_together'), ('de00de00-0000-4000-8000-000000000045', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000045', 'hotspot'), ('de00de00-0000-4000-8000-000000000045', 'local_eats'), ('de00de00-0000-4000-8000-000000000045', 'music_show');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000045';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000045', 'en', 'native');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000046', 'newyork', 'I''ve lived in Lower East Side for 5 years. The markets and food alleys of this neighborhood are my regular route. I like long walks and a rest in the park. Feel free to send a request.', 5, 'verified', now(), true, true, array['active','like_local']::text[], array['deep_talk']::text[], array['lowereastside']::text[], array['ny-deli']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000046';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000046', 'bakery'), ('de00de00-0000-4000-8000-000000000046', 'local_eats'), ('de00de00-0000-4000-8000-000000000046', 'cycling'), ('de00de00-0000-4000-8000-000000000046', 'park_nature'), ('de00de00-0000-4000-8000-000000000046', 'new_friends');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000046';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000046', 'en', 'native');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000047', 'newyork', 'I''ve lived in Williamsburg for 12 years. The markets and food alleys of this neighborhood are my regular route. We can talk about local culture, play board games or cook together. Feel free to send a request.', 12, 'verified', now(), true, true, array['like_local','new_experience']::text[], array['deep_talk','activity']::text[], array['williamsburg']::text[], array['ny-market','ny-shop']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000047';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000047', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000047', 'board_games'), ('de00de00-0000-4000-8000-000000000047', 'hidden_spots');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000047';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000047', 'en', 'native');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000048', 'newyork', 'I''ve lived in Lower East Side for 10 years. The markets and food alleys of this neighborhood are my regular route. I enjoy exhibitions, little bookshops and vintage stores. Let''s walk and chat at an easy pace.', 10, 'verified', now(), true, true, array['relaxed']::text[], array['casual']::text[], array['lowereastside']::text[], array['ny-deli']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000048';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000048', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000048', 'reading'), ('de00de00-0000-4000-8000-000000000048', 'local_market'), ('de00de00-0000-4000-8000-000000000048', 'cooking_together');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000048';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000048', 'en', 'native'), ('de00de00-0000-4000-8000-000000000048', 'zh', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000049', 'newyork', 'I''ve lived in Williamsburg for 4 years. I know several cafés in this neighborhood that are great for lingering. I love small cafés, bakeries and neighborhood spots. Feel free to send a request.', 4, 'verified', now(), true, true, array['relaxed']::text[], array['activity','casual']::text[], array['williamsburg']::text[], array['ny-market','ny-shop']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000049';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000049', 'photo'), ('de00de00-0000-4000-8000-000000000049', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000049', 'cafe_tour');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000049';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000049', 'en', 'native'), ('de00de00-0000-4000-8000-000000000049', 'zh', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000050', 'newyork', 'I''ve lived in Williamsburg for 14 years. I know several cafés in this neighborhood that are great for lingering. I like walking slowly with a camera and talking about music. Let''s walk and chat at an easy pace.', 14, 'verified', now(), true, true, array['new_experience','active']::text[], array['deep_talk','casual']::text[], array['williamsburg']::text[], array['ny-market','ny-shop']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000050';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000050', 'language_exchange'), ('de00de00-0000-4000-8000-000000000050', 'new_friends'), ('de00de00-0000-4000-8000-000000000050', 'reading'), ('de00de00-0000-4000-8000-000000000050', 'cafe_tour');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000050';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000050', 'en', 'native');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000051', 'newyork', 'I''ve lived in Greenwich Village for 7 years. I know the quiet side streets of this neighborhood like the back of my hand. We can talk about local culture, play board games or cook together. Let''s walk and chat at an easy pace.', 7, 'verified', now(), true, true, array['like_local','active']::text[], array['deep_talk','casual']::text[], array['greenwichvillage']::text[], array['ny-books','ny-cafe']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000051';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000051', 'language_exchange'), ('de00de00-0000-4000-8000-000000000051', 'new_friends'), ('de00de00-0000-4000-8000-000000000051', 'neighborhood_walk'), ('de00de00-0000-4000-8000-000000000051', 'hidden_spots'), ('de00de00-0000-4000-8000-000000000051', 'cafe_tour');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000051';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000051', 'en', 'native');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000052', 'newyork', 'I''ve lived in Greenwich Village for 12 years. I know several cafés in this neighborhood that are great for lingering. I enjoy language exchange and meeting new people. Feel free to send a request.', 12, 'verified', now(), true, true, array['active','like_local']::text[], array['deep_talk']::text[], array['greenwichvillage']::text[], array['ny-books','ny-cafe']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000052';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000052', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000052', 'language_exchange'), ('de00de00-0000-4000-8000-000000000052', 'reading');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000052';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000052', 'en', 'native'), ('de00de00-0000-4000-8000-000000000052', 'zh', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000053', 'barcelona', 'Vivo en El Born desde hace 2 años. Paso a menudo por las pequeñas librerías de este barrio. Me gusta el intercambio de idiomas y conocer gente nueva. Paseemos y charlemos con calma.', 2, 'verified', now(), true, true, array['relaxed']::text[], array['deep_talk','casual']::text[], array['elborn']::text[], array['bc-books','bc-shop']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000053';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000053', 'board_games'), ('de00de00-0000-4000-8000-000000000053', 'language_exchange'), ('de00de00-0000-4000-8000-000000000053', 'art_exhibit');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000053';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000053', 'es', 'native'), ('de00de00-0000-4000-8000-000000000053', 'en', 'basic'), ('de00de00-0000-4000-8000-000000000053', 'de', 'basic');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000054', 'barcelona', 'Vivo en Sant Antoni desde hace 3 años. Los mercados y callejones de comida de este barrio son mi ruta de siempre. Me gustan las exposiciones, las librerías pequeñas y las tiendas vintage. Paseemos y charlemos con calma.', 3, 'verified', now(), true, true, array['active']::text[], array['casual']::text[], array['santantoni']::text[], array['bc-tapas']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000054';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000054', 'photo'), ('de00de00-0000-4000-8000-000000000054', 'music_show'), ('de00de00-0000-4000-8000-000000000054', 'park_nature'), ('de00de00-0000-4000-8000-000000000054', 'cycling');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000054';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000054', 'es', 'native'), ('de00de00-0000-4000-8000-000000000054', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000055', 'barcelona', 'Vivo en Gràcia desde hace 11 años. Los mercados y callejones de comida de este barrio son mi ruta de siempre. Me gustan las exposiciones, las librerías pequeñas y las tiendas vintage. Envíame una solicitud sin problema.', 11, 'verified', now(), true, true, array['like_local','relaxed']::text[], array['deep_talk']::text[], array['gracia']::text[], array['bc-cafe','bc-market']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000055';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000055', 'new_friends'), ('de00de00-0000-4000-8000-000000000055', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000055', 'local_eats'), ('de00de00-0000-4000-8000-000000000055', 'reading'), ('de00de00-0000-4000-8000-000000000055', 'photo');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000055';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000055', 'es', 'native'), ('de00de00-0000-4000-8000-000000000055', 'en', 'conversational'), ('de00de00-0000-4000-8000-000000000055', 'de', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000056', 'barcelona', 'Vivo en Sant Antoni desde hace 6 años. Los mercados y callejones de comida de este barrio son mi ruta de siempre. Me gustan las exposiciones, las librerías pequeñas y las tiendas vintage. Paseemos y charlemos con calma.', 6, 'verified', now(), true, true, array['active']::text[], array['casual']::text[], array['santantoni']::text[], array['bc-tapas']::text[], 3, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000056';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000056', 'neighborhood_walk'), ('de00de00-0000-4000-8000-000000000056', 'park_nature'), ('de00de00-0000-4000-8000-000000000056', 'music_show'), ('de00de00-0000-4000-8000-000000000056', 'art_exhibit');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000056';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000056', 'es', 'native'), ('de00de00-0000-4000-8000-000000000056', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000057', 'barcelona', 'Vivo en Gràcia desde hace 7 años. Los mercados y callejones de comida de este barrio son mi ruta de siempre. Me gustan las exposiciones, las librerías pequeñas y las tiendas vintage. Paseemos y charlemos con calma.', 7, 'verified', now(), true, true, array['new_experience','like_local']::text[], array['casual','activity']::text[], array['gracia']::text[], array['bc-cafe','bc-market']::text[], 2, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000057';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000057', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000057', 'language_exchange'), ('de00de00-0000-4000-8000-000000000057', 'music_show'), ('de00de00-0000-4000-8000-000000000057', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000057', 'park_nature');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000057';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000057', 'es', 'native'), ('de00de00-0000-4000-8000-000000000057', 'en', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000058', 'barcelona', 'Vivo en Gràcia desde hace 11 años. Conozco varios cafés de este barrio donde da gusto quedarse un rato. Me encantan los cafés pequeños, las panaderías y los sitios del barrio. Envíame una solicitud sin problema.', 11, 'verified', now(), true, true, array['relaxed']::text[], array['activity','deep_talk']::text[], array['gracia']::text[], array['bc-cafe','bc-market']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000058';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000058', 'bakery'), ('de00de00-0000-4000-8000-000000000058', 'cafe_tour'), ('de00de00-0000-4000-8000-000000000058', 'vintage');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000058';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000058', 'es', 'native'), ('de00de00-0000-4000-8000-000000000058', 'en', 'fluent'), ('de00de00-0000-4000-8000-000000000058', 'de', 'conversational');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000059', 'barcelona', 'Vivo en Poblenou desde hace 2 años. Conozco las calles tranquilas de este barrio como la palma de mi mano. Te llevo a rincones escondidos y te muestro el día a día. Paseemos y charlemos con calma.', 2, 'verified', now(), true, true, array['like_local']::text[], array['casual']::text[], array['poblenou']::text[], array['bc-park']::text[], 4, null)
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000059';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000059', 'vintage'), ('de00de00-0000-4000-8000-000000000059', 'photo'), ('de00de00-0000-4000-8000-000000000059', 'bakery'), ('de00de00-0000-4000-8000-000000000059', 'cycling');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000059';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000059', 'es', 'native'), ('de00de00-0000-4000-8000-000000000059', 'en', 'fluent');
insert into public.host_profiles (user_id, home_city_id, bio, years_in_city, identity_status, verified_at, is_public, is_demo, travel_styles, exchange_modes, activity_nbs, recommended_places, duration_hours, cost_note)
  values ('de00de00-0000-4000-8000-000000000060', 'barcelona', 'Vivo en Gràcia desde hace 8 años. Conozco varios cafés de este barrio donde da gusto quedarse un rato. Me encantan los cafés pequeños, las panaderías y los sitios del barrio. Paseemos y charlemos con calma.', 8, 'verified', now(), true, true, array['active']::text[], array['casual','activity']::text[], array['gracia']::text[], array['bc-cafe','bc-market']::text[], 3, 'Cada uno paga solo lo que consume.')
  on conflict (user_id) do update set home_city_id = excluded.home_city_id, bio = excluded.bio, years_in_city = excluded.years_in_city, identity_status = 'verified',
    is_public = true, is_demo = true, travel_styles = excluded.travel_styles, exchange_modes = excluded.exchange_modes, activity_nbs = excluded.activity_nbs,
    recommended_places = excluded.recommended_places, duration_hours = excluded.duration_hours, cost_note = excluded.cost_note;
delete from public.host_interests where host_id = 'de00de00-0000-4000-8000-000000000060';
insert into public.host_interests (host_id, interest_id) values ('de00de00-0000-4000-8000-000000000060', 'reading'), ('de00de00-0000-4000-8000-000000000060', 'art_exhibit'), ('de00de00-0000-4000-8000-000000000060', 'local_culture_talk'), ('de00de00-0000-4000-8000-000000000060', 'hotspot'), ('de00de00-0000-4000-8000-000000000060', 'bakery');
delete from public.host_languages where host_id = 'de00de00-0000-4000-8000-000000000060';
insert into public.host_languages (host_id, language, level) values ('de00de00-0000-4000-8000-000000000060', 'es', 'native'), ('de00de00-0000-4000-8000-000000000060', 'en', 'conversational');

-- ---------- 3. 가능 일정 자동 채우기 / 전체 제거 ----------
-- 예시 현지인의 오늘부터 30일치 일정을 채운다(요일별 오전 10~13시, 오후 14~17시). 이미 있으면 건드리지 않는다.
create or replace function public.demo_topup() returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.availability (host_id, day, start_time, end_time)
  select d.host_id, g.day, s.st, s.et
    from (values
    ('de00de00-0000-4000-8000-000000000001'::uuid, array['2','4','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000002'::uuid, array['3','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000003'::uuid, array['1','3','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000004'::uuid, array['2','4','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000005'::uuid, array['1','3','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000006'::uuid, array['2','4','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000007'::uuid, array['1','3','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000008'::uuid, array['3','5','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000009'::uuid, array['2','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000010'::uuid, array['2','4','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000011'::uuid, array['1','3','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000012'::uuid, array['2','4','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000013'::uuid, array['1','3','6','0']::text[]),
    ('de00de00-0000-4000-8000-000000000014'::uuid, array['0','1','2','4']::text[]),
    ('de00de00-0000-4000-8000-000000000015'::uuid, array['1','2','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000016'::uuid, array['4','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000017'::uuid, array['0','1','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000018'::uuid, array['0','2','4']::text[]),
    ('de00de00-0000-4000-8000-000000000019'::uuid, array['2','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000020'::uuid, array['0','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000021'::uuid, array['1','2','6']::text[]),
    ('de00de00-0000-4000-8000-000000000022'::uuid, array['0','3','6']::text[]),
    ('de00de00-0000-4000-8000-000000000023'::uuid, array['0','3','4','5']::text[]),
    ('de00de00-0000-4000-8000-000000000024'::uuid, array['0','3','4']::text[]),
    ('de00de00-0000-4000-8000-000000000025'::uuid, array['1','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000026'::uuid, array['0','2','3','4']::text[]),
    ('de00de00-0000-4000-8000-000000000027'::uuid, array['0','1','2']::text[]),
    ('de00de00-0000-4000-8000-000000000028'::uuid, array['0','1','6']::text[]),
    ('de00de00-0000-4000-8000-000000000029'::uuid, array['1','3','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000030'::uuid, array['2','3','6']::text[]),
    ('de00de00-0000-4000-8000-000000000031'::uuid, array['1','3','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000032'::uuid, array['1','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000033'::uuid, array['3','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000034'::uuid, array['3','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000035'::uuid, array['1','2','6']::text[]),
    ('de00de00-0000-4000-8000-000000000036'::uuid, array['0','3','4','5']::text[]),
    ('de00de00-0000-4000-8000-000000000037'::uuid, array['0','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000038'::uuid, array['0','2','3']::text[]),
    ('de00de00-0000-4000-8000-000000000039'::uuid, array['1','2','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000040'::uuid, array['2','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000041'::uuid, array['3','4','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000042'::uuid, array['0','2','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000043'::uuid, array['1','2','6']::text[]),
    ('de00de00-0000-4000-8000-000000000044'::uuid, array['0','1','2']::text[]),
    ('de00de00-0000-4000-8000-000000000045'::uuid, array['0','1','5']::text[]),
    ('de00de00-0000-4000-8000-000000000046'::uuid, array['0','1','3','4']::text[]),
    ('de00de00-0000-4000-8000-000000000047'::uuid, array['1','3','6']::text[]),
    ('de00de00-0000-4000-8000-000000000048'::uuid, array['0','2','6']::text[]),
    ('de00de00-0000-4000-8000-000000000049'::uuid, array['3','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000050'::uuid, array['0','3','6']::text[]),
    ('de00de00-0000-4000-8000-000000000051'::uuid, array['0','1','4','5']::text[]),
    ('de00de00-0000-4000-8000-000000000052'::uuid, array['1','2','3','6']::text[]),
    ('de00de00-0000-4000-8000-000000000053'::uuid, array['0','1','5']::text[]),
    ('de00de00-0000-4000-8000-000000000054'::uuid, array['0','1','3','5']::text[]),
    ('de00de00-0000-4000-8000-000000000055'::uuid, array['0','1','3','6']::text[]),
    ('de00de00-0000-4000-8000-000000000056'::uuid, array['0','3','5','6']::text[]),
    ('de00de00-0000-4000-8000-000000000057'::uuid, array['3','4','6']::text[]),
    ('de00de00-0000-4000-8000-000000000058'::uuid, array['0','2','6']::text[]),
    ('de00de00-0000-4000-8000-000000000059'::uuid, array['0','1','2']::text[]),
    ('de00de00-0000-4000-8000-000000000060'::uuid, array['1','2','6']::text[])
    ) as d(host_id, dows)
    join public.host_profiles h on h.user_id = d.host_id and h.is_demo
    cross join lateral generate_series(current_date, current_date + 30, interval '1 day') as gs(ts)
    cross join lateral (select gs.ts::date as day) g
    cross join lateral (values ('10:00'::time, '13:00'::time), ('14:00'::time, '17:00'::time)) as s(st, et)
   where extract(dow from g.day)::int::text = any (d.dows)
     and (s.st = '10:00'::time or extract(dow from g.day)::int in (0, 6))      -- 평일은 오전만, 주말은 오전·오후
  on conflict (host_id, day, start_time) do nothing;
end $$;
revoke execute on function public.demo_topup() from public, anon;
grant execute on function public.demo_topup() to authenticated;
select public.demo_topup();

-- 예시 계정과 연결된 모든 데이터(프로필·관심사·일정·요청·대화·후기·즐겨찾기)를 한 번에 지운다. 운영자(SQL Editor)만 실행할 수 있다.
create or replace function public.demo_remove_all() returns int
language plpgsql security definer set search_path = public, auth as $$
declare n int;
begin
  if not (public.is_admin() or public.is_service()) then raise exception 'admin only'; end if;
  delete from auth.users where email like '%@demo.roamly.invalid';
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.demo_remove_all() from public, anon, authenticated;

