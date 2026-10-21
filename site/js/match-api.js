// 1:1 현지인 매칭: 서버(Supabase)와 주고받는 함수 모음. 점수 계산·요청 상태 변경은 서버 함수가 하고, 여기서는 부르기만 한다.
import { getClient } from "./auth.js";
import { currentUserId } from "./sync.js";

// 관심사 목록(서버 interest_catalog 와 같은 id). 이름은 i18n 의 mi_<id>, 분류는 mc_<category>.
export const INTEREST_GROUPS = [
  ["cafe_food", ["cafe_tour", "local_eats", "bakery", "market_street_food", "hotspot"]],
  ["culture", ["art_exhibit", "reading", "vintage", "photo", "music_show"]],
  ["outdoor", ["neighborhood_walk", "park_nature", "cycling", "local_market", "hidden_spots"]],
  ["people", ["language_exchange", "new_friends", "local_culture_talk", "board_games", "cooking_together"]],
];
export const INTEREST_CATEGORY = Object.fromEntries(INTEREST_GROUPS.flatMap(([cat, ids]) => ids.map((id) => [id, cat])));
export const STYLES = ["relaxed", "active", "like_local", "new_experience"];
export const EXCHANGES = ["deep_talk", "casual", "activity"];
export const HOST_LANGS = ["ko", "en", "ja", "zh", "es", "de"];
export const LEVELS = ["basic", "conversational", "fluent", "native"];
export const PREF_LANGS = ["any", "ko", "en", "local"];

// 서버가 돌려준 오류를 화면 문구 키로 바꾼다
export function requestErrorKey(err) {
  const m = String(err?.message ?? "");
  if (/duplicate request/.test(m)) return "mr_err_dup";
  if (/host not available|cannot request yourself/.test(m)) return "mr_err_unavail";
  if (/blocked/.test(m)) return "mr_err_blocked";
  if (/too many pending/.test(m)) return "mr_err_many";
  if (/slot not available|slot already booked/.test(m)) return "mr_err_slot";
  if (/invalid date/.test(m)) return "mr_err_date";
  return "mr_err_generic";
}

async function client() {
  const c = await getClient();
  if (!c || !currentUserId()) throw new Error("not signed in");
  return c;
}
const must = ({ data, error }) => { if (error) throw error; return data; };

// ---- 여행자: 취향 저장·추천 ----
export async function loadPrefs() {
  const c = await client();
  const uid = currentUserId();
  const [prefs, ints] = await Promise.all([
    c.from("traveler_preferences").select("*").eq("user_id", uid).maybeSingle(),
    c.from("traveler_interests").select("interest_id").eq("user_id", uid),
  ]);
  return { prefs: prefs.data ?? null, interests: (ints.data ?? []).map((r) => r.interest_id) };
}

export async function savePrefs(p) {
  const c = await client();
  const uid = currentUserId();
  await c.from("traveler_preferences").upsert({ user_id: uid, city_id: p.city, date_from: p.from, date_to: p.to || null, travel_style: p.style || null, exchange_mode: p.exchange || null, preferred_language: p.lang, updated_at: new Date().toISOString() });
  await c.from("traveler_interests").delete().eq("user_id", uid);
  if (p.interests.length) await c.from("traveler_interests").insert(p.interests.map((interest_id) => ({ user_id: uid, interest_id })));
}

// 포트폴리오용 예시 현지인(서버 마이그레이션 006): id 가 de00de00- 로 시작한다. 실제 사용자 id 와 겹치지 않는다.
export const isDemoHost = (id) => String(id ?? "").startsWith("de00de00-");

// 예시 현지인의 가능 일정을 앞으로 30일치로 채운다(006 을 실행하지 않았거나 예시가 없으면 조용히 건너뛴다). 접속당 한 번만.
let topped = 0;
async function topupDemo(c) {
  if (Date.now() - topped < 6 * 3600 * 1000) return;
  topped = Date.now();
  try { await c.rpc("demo_topup"); } catch { /* 예시 현지인 기능이 없는 서버 */ }
}

export async function recommend(p) {
  const c = await client();
  await topupDemo(c);
  return must(await c.rpc("recommend_hosts", {
    p_city: p.city, p_date_from: p.from, p_date_to: p.to || p.from, p_interests: p.interests,
    p_style: p.style || null, p_exchange: p.exchange || null, p_lang: p.lang || "any", p_limit: 5,
  }));
}

// 같은 도시의 다른 호스트 목록(추천에 나온 사람은 exclude 로 뺀다). 페이지 단위로 받는다.
export async function browseHosts({ city, interests = [], exclude = [], limit = 12, offset = 0 }) {
  const c = await client();
  await topupDemo(c);
  return must(await c.rpc("browse_hosts", { p_city: city, p_interests: interests, p_exclude: exclude, p_limit: limit, p_offset: offset }));
}

export async function getHost(id) {
  const c = await client();
  await topupDemo(c);
  return must(await c.rpc("get_host_profile", { p_host: id }));
}

export async function setFavorite(hostId, on) {
  const c = await client();
  const uid = currentUserId();
  if (on) must(await c.from("favorites").upsert({ user_id: uid, host_id: hostId }, { onConflict: "user_id,host_id", ignoreDuplicates: true }));
  else must(await c.from("favorites").delete().eq("user_id", uid).eq("host_id", hostId));
}

export async function blockUser(userId) {
  const c = await client();
  must(await c.from("blocks").upsert({ blocker_id: currentUserId(), blocked_id: userId }, { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true }));
}

export async function reportUser(userId, reason = "other") {
  const c = await client();
  const { error } = await c.from("reports").insert({ target_type: "user", target_id: userId, reason });
  if (error && error.code !== "23505") throw error;
}

// ---- 매칭 요청 ----
export async function createRequest(r) {
  const c = await client();
  return must(await c.rpc("create_match_request", {
    p_host: r.host, p_date: r.date, p_start: r.start || null, p_end: r.end || null,
    p_activity: r.activity || "", p_area: r.area || "", p_message: r.message || "", p_availability: r.slot || null,
  }));
}
export async function respondRequest(id, accept) { const c = await client(); return must(await c.rpc("respond_match", { p_request: id, p_accept: accept })); }
export async function cancelRequest(id) { const c = await client(); return must(await c.rpc("cancel_match", { p_request: id })); }
export async function completeRequest(id) { const c = await client(); return must(await c.rpc("complete_match", { p_request: id })); }

// 내가 보내거나 받은 요청 + 상대 이름
export async function myRequests() {
  const c = await client();
  const rows = must(await c.from("match_requests").select("*").order("created_at", { ascending: false }).limit(100)) ?? [];
  const ids = [...new Set(rows.flatMap((r) => [r.traveler_id, r.host_id]))];
  const names = {};
  if (ids.length) {
    const profs = must(await c.from("profiles").select("id,display_name").in("id", ids)) ?? [];
    for (const p of profs) names[p.id] = p.display_name;
  }
  // 요청마다 연결된 대화와 내가 이미 쓴 후기(요청 카드의 '메시지'·'후기 쓰기' 버튼에 쓴다)
  const reqIds = rows.map((r) => r.id);
  const convOf = {}, reviewed = new Set();
  if (reqIds.length) {
    const [convs, revs] = await Promise.all([
      c.from("conversations").select("id,request_id").in("request_id", reqIds),
      c.from("reviews").select("request_id").eq("reviewer_id", currentUserId()).in("request_id", reqIds),
    ]);
    for (const x of convs.data ?? []) convOf[x.request_id] = x.id;
    for (const x of revs.data ?? []) reviewed.add(x.request_id);
  }
  return rows.map((r) => ({ ...r, traveler_name: names[r.traveler_id] ?? "", host_name: names[r.host_id] ?? "", conversation_id: convOf[r.id] ?? null, reviewed: reviewed.has(r.id) }));
}

// ---- 1:1 메시지 ----
// 대화 목록(상대 이름·최근 메시지·읽지 않은 수). 서버 함수가 내 대화만 돌려준다.
export async function myConversations() {
  const c = await client();
  return must(await c.rpc("my_conversations")) ?? [];
}

// 읽지 않은 메시지 합계(메뉴 배지용). 로그인하지 않았거나 실패하면 0.
export async function unreadTotal() {
  try { return (await myConversations()).reduce((s, x) => s + (x.unread || 0), 0); } catch { return 0; }
}

// 대화 하나의 정보: 연결된 요청과 상대방. 내가 참여하지 않은 대화면 null(RLS가 막는다).
export async function conversationInfo(convId) {
  const c = await client();
  const conv = must(await c.from("conversations").select("*").eq("id", convId).maybeSingle());
  if (!conv) return null;
  const req = must(await c.from("match_requests").select("*").eq("id", conv.request_id).maybeSingle());
  const otherId = conv.traveler_id === currentUserId() ? conv.host_id : conv.traveler_id;
  const prof = must(await c.from("profiles").select("id,display_name,avatar_path").eq("id", otherId).maybeSingle());
  return { conv, req, otherId, otherName: prof?.display_name ?? "", otherAvatar: prof?.avatar_path ?? null, iAmHost: conv.host_id === currentUserId() };
}

// 메시지: 최근 것부터 limit 개를 가져와 시간순으로 돌려준다. before(id)를 주면 그보다 앞의 메시지.
export async function loadMessages(convId, { before = null, limit = 50 } = {}) {
  const c = await client();
  let q = c.from("messages").select("id,conversation_id,sender_id,body,created_at,read_at").eq("conversation_id", convId).order("id", { ascending: false }).limit(limit);
  if (before) q = q.lt("id", before);
  return (must(await q) ?? []).reverse();
}

// 보내기: 보낸 사람·시각은 서버가 정한다(RLS: 참여자이고, 취소·거절·차단·정지가 아닐 때만)
export async function sendMessage(convId, body) {
  const c = await client();
  return must(await c.from("messages").insert({ conversation_id: convId, sender_id: currentUserId(), body }).select("id,conversation_id,sender_id,body,created_at,read_at").single());
}

export async function markRead(convId) { const c = await client(); return must(await c.rpc("mark_read", { p_conversation: convId })); }

// 실시간: 이 대화에 새 메시지가 들어오면(내 것 포함) onInsert, 읽음 표시가 바뀌면 onUpdate. 돌려준 함수를 부르면 구독을 끊는다.
// '입력 중' 신호는 DB 에 저장하지 않는 Realtime broadcast 로 주고받는다(상대가 입력할 때마다 onTyping(상대 id)).
// 돌려준 함수를 부르면 구독을 끊고, 그 함수의 typing() 을 부르면 내가 입력 중이라는 신호를 보낸다.
export async function subscribeMessages(convId, onInsert, onUpdate, onTyping) {
  const c = await client();
  const ch = c.channel(`messages:${convId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` }, (p) => onInsert?.(p.new))
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` }, (p) => onUpdate?.(p.new))
    .on("broadcast", { event: "typing" }, (p) => onTyping?.(p.payload?.uid))
    .subscribe();
  const off = () => { c.removeChannel(ch).catch(() => {}); };
  off.typing = () => { ch.send({ type: "broadcast", event: "typing", payload: { uid: currentUserId() } }).catch?.(() => {}); };
  return off;
}

// 차단했는지(내가 건 차단만 볼 수 있다)
export async function iBlocked(userId) {
  const c = await client();
  const r = must(await c.from("blocks").select("blocked_id").eq("blocker_id", currentUserId()).eq("blocked_id", userId).maybeSingle());
  return !!r;
}
export async function unblockUser(userId) {
  const c = await client();
  must(await c.from("blocks").delete().eq("blocker_id", currentUserId()).eq("blocked_id", userId));
}

// 메시지·후기 신고(같은 이유로 두 번 신고하면 조용히 넘어간다)
export async function reportTarget(type, id, reason = "other") {
  const c = await client();
  const { error } = await c.from("reports").insert({ target_type: type, target_id: String(id), reason });
  if (error && error.code !== "23505") throw error;
}

// ---- 후기 ----
// 후기를 쓸 요청: 내가 참여했고 '만남 완료'인지, 이미 썼는지 함께 확인한다
export async function reviewContext(requestId) {
  const c = await client();
  const req = must(await c.from("match_requests").select("*").eq("id", requestId).maybeSingle());
  if (!req) return null;
  const otherId = req.traveler_id === currentUserId() ? req.host_id : req.traveler_id;
  const [prof, mine] = await Promise.all([
    c.from("profiles").select("display_name,avatar_path").eq("id", otherId).maybeSingle(),
    c.from("reviews").select("*").eq("request_id", requestId).eq("reviewer_id", currentUserId()).maybeSingle(),
  ]);
  return { req, otherId, otherName: prof.data?.display_name ?? "", otherAvatar: prof.data?.avatar_path ?? null, mine: mine.data ?? null, iAmHost: req.host_id === currentUserId() };
}

// 후기 저장: 대상·상태·작성일은 서버가 정하고, 완료된 만남의 참여자인지도 서버가 확인한다
export async function submitReview(r) {
  const c = await client();
  return must(await c.from("reviews").insert({
    request_id: r.requestId, reviewer_id: currentUserId(), target_id: r.targetId,
    rating_overall: r.overall, rating_communication: r.communication, rating_punctuality: r.punctuality, rating_activity: r.activity,
    body: r.body, activity_type: r.activityType || "",
  }).select("id").single());
}

// 서버 오류 → 후기 화면 문구 키
export function reviewErrorKey(err) {
  const m = String(err?.message ?? "");
  if (err?.code === "23505") return "rvw_err_dup";
  if (/completed meeting/.test(m)) return "rvw_err_not_done";
  if (/not a participant/.test(m)) return "rvw_err_not_part";
  return "rvw_err_generic";
}

// ---- 현지인 프로필(내 것) ----
export async function loadMyHost() {
  const c = await client();
  const uid = currentUserId();
  const [h, ints, langs, prof, slots] = await Promise.all([
    c.from("host_profiles").select("*").eq("user_id", uid).maybeSingle(),
    c.from("host_interests").select("interest_id").eq("host_id", uid),
    c.from("host_languages").select("language,level").eq("host_id", uid),
    c.from("profiles").select("display_name,avatar_path").eq("id", uid).maybeSingle(),
    c.from("availability").select("*").eq("host_id", uid).gte("day", new Date().toISOString().slice(0, 10)).order("day").order("start_time"),
  ]);
  return { host: h.data ?? null, interests: (ints.data ?? []).map((r) => r.interest_id), languages: langs.data ?? [], profile: prof.data ?? null, slots: slots.data ?? [] };
}

export async function saveMyHost(d) {
  const c = await client();
  const uid = currentUserId();
  must(await c.from("host_profiles").upsert({
    user_id: uid, home_city_id: d.city, bio: d.bio, years_in_city: d.years === "" || d.years == null ? null : Number(d.years),
    activity_nbs: d.nbs, recommended_places: d.places, travel_styles: d.styles, exchange_modes: d.exchanges,
    duration_hours: d.duration === "" || d.duration == null ? null : Number(d.duration), cost_note: d.cost || null, is_public: !!d.isPublic,
  }, { onConflict: "user_id" }));
  must(await c.from("host_interests").delete().eq("host_id", uid));
  if (d.interests.length) must(await c.from("host_interests").insert(d.interests.map((interest_id) => ({ host_id: uid, interest_id }))));
  must(await c.from("host_languages").delete().eq("host_id", uid));
  if (d.languages.length) must(await c.from("host_languages").insert(d.languages.map((l) => ({ host_id: uid, language: l.language, level: l.level }))));
}

// 현지인 신청 취소. 'deleted'(프로필 삭제) | 'hidden'(기록이 있어 비공개로 전환) | 'none'(등록한 적 없음).
// 수락된 만남이 남아 있으면 서버가 거절한다.
export async function withdrawHost() {
  const c = await client();
  return must(await c.rpc("withdraw_host"));
}

export async function addSlot(day, start, end) {
  const c = await client();
  must(await c.from("availability").insert({ host_id: currentUserId(), day, start_time: start, end_time: end }));
}
export async function removeSlot(id) { const c = await client(); must(await c.from("availability").delete().eq("id", id)); }

// 프로필 사진: 공개 버킷 avatars 의 {내 id}/avatar-{시각}.jpg 에 올리고, 이전 사진은 지운다
export async function uploadAvatar(blob) {
  const c = await client();
  const uid = currentUserId();
  const path = `${uid}/avatar-${Date.now()}.jpg`;
  const up = await c.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (up.error) throw up.error;
  const prev = must(await c.from("profiles").select("avatar_path").eq("id", uid).maybeSingle())?.avatar_path;
  must(await c.from("profiles").update({ avatar_path: path }).eq("id", uid));
  if (prev) await c.storage.from("avatars").remove([prev]).catch(() => {});
  return path;
}

// 사진 주소(공개). 사진이 없으면 null
export async function avatarUrl(path) {
  if (!path) return null;
  const c = await getClient();
  return c ? c.storage.from("avatars").getPublicUrl(path).data.publicUrl : null;
}
