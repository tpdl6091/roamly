// 추천 글·신고·'여전히 맞아요'를 Supabase 와 주고받는다.
//  - 글(contents)은 로그인하지 않은 사람도 읽을 수 있고, 쓰기·신고·투표는 로그인해야 한다.
//  - 장소 화면은 동기 방식으로 그려지므로, 서버에서 받은 값을 장소별로 캐시에 두고 읽는다.
//    캐시가 없으면 가져오기를 시작하고, 도착하면 화면을 다시 그린다.
import { getClient } from "./auth.js";
import { currentUserId } from "./sync.js";
import { TRUST_SEEDS, PLACES } from "./data.js";

const TTL_MS = 30000;
const placeCache = new Map();       // placeId → { at, data }
const inflight = new Map();         // placeId → Promise
let myPostsCache = null;            // { at, list }

const placeById = (id) => PLACES.find((p) => p.id === id);

// 서버 글 한 건 → 화면에서 쓰는 글 모양
const toPost = (r, uid) => ({
  id: r.id, place: r.place_id, lang: r.original_language, role: r.author_role, comment: r.body,
  visit: r.visit_date, written: String(r.written_at).slice(0, 10), checkin: !!r.checkin_verified,
  sponsored: r.sponsored, tip: r.tip ?? {}, status: r.status, mine: !!uid && r.author_id === uid, remote: true,
});

const CONTENT_COLS = "id,author_id,place_id,original_language,body,tip,visit_date,written_at,author_role,checkin_verified,sponsored,status";

// 한 장소의 글·신뢰 집계·내 신고/투표를 가져온다
async function fetchPlace(placeId) {
  const c = await getClient();
  if (!c) return null;
  const uid = currentUserId();
  const { data: rows, error } = await c.from("contents").select(CONTENT_COLS).eq("place_id", placeId).order("written_at", { ascending: false }).limit(50);
  if (error) return null;
  const posts = rows.map((r) => toPost(r, uid));
  const ids = posts.map((p) => p.id);
  const trust = {};
  if (ids.length) {
    const { data } = await c.from("content_trust").select("content_id,report_users,outdated_report_users,recent_confirms").in("content_id", ids);
    for (const r of data ?? []) trust[r.content_id] = r;
  }
  const { data: pt } = await c.from("place_trust").select("report_users,outdated_report_users,recent_confirms").eq("place_id", placeId).maybeSingle();
  const mine = { placeReasons: [], placeConfirmed: false, contentReasons: {}, contentConfirmed: new Set() };
  if (uid) {
    const { data: reps } = await c.from("reports").select("target_type,target_id,reason");
    for (const r of reps ?? []) {
      if (r.target_type === "place" && r.target_id === placeId) mine.placeReasons.push(r.reason);
      if (r.target_type === "content" && ids.includes(r.target_id)) (mine.contentReasons[r.target_id] ??= []).push(r.reason);
    }
    const { data: pc } = await c.from("place_confirmations").select("place_id").eq("place_id", placeId);
    mine.placeConfirmed = (pc ?? []).length > 0;
    if (ids.length) {
      const { data: cc } = await c.from("content_confirmations").select("content_id").in("content_id", ids);
      (cc ?? []).forEach((r) => mine.contentConfirmed.add(r.content_id));
    }
  }
  return { uid, posts, trust, place: pt ?? { report_users: 0, outdated_report_users: 0, recent_confirms: 0 }, mine };
}

async function loadPlace(placeId) {
  if (inflight.has(placeId)) return inflight.get(placeId);
  const p = fetchPlace(placeId).then((data) => { if (data) placeCache.set(placeId, { at: Date.now(), data }); return data; })
    .catch(() => null).finally(() => inflight.delete(placeId));
  inflight.set(placeId, p);
  return p;
}

// 캐시에 있는 값(없으면 null). 사용자가 바뀌었으면 쓰지 않는다.
export function getPlaceRemote(placeId) {
  const hit = placeCache.get(placeId);
  return hit && hit.data.uid === (currentUserId() ?? null) ? hit.data : null;
}

// 값이 없거나 오래됐으면 가져오고, 도착하면 onLoaded 를 부른다(이미 신선하면 아무것도 하지 않아 다시 그리기가 반복되지 않는다)
export function ensurePlaceRemote(placeId, onLoaded) {
  const hit = placeCache.get(placeId);
  const fresh = hit && Date.now() - hit.at < TTL_MS && hit.data.uid === (currentUserId() ?? null);
  if (fresh || inflight.has(placeId)) return;
  loadPlace(placeId).then((d) => { if (d) onLoaded?.(); });
}

export function clearRemoteCache() { placeCache.clear(); inflight.clear(); myPostsCache = null; }

// ---------- 신뢰 규칙에 넘길 대상 만들기 ----------
const sumReports = (a = {}, b = {}) => { const o = { ...a }; for (const [k, v] of Object.entries(b)) o[k] = (o[k] ?? 0) + v; return o; };
const countSeed = (tr) => ({
  reports: { outdated: tr?.outdated_report_users ?? 0, other: Math.max(0, (tr?.report_users ?? 0) - (tr?.outdated_report_users ?? 0)) },
  confirmDaysAgo: Array(tr?.recent_confirms ?? 0).fill(0),
});

// type: "place" | "content". 신고·투표를 서버에 보내는 함수를 함께 건넨다.
function makeRemote(type, id, data, placeId) {
  const mine = type === "place"
    ? { reasons: data.mine.placeReasons, confirmed: data.mine.placeConfirmed }
    : { reasons: data.mine.contentReasons[id] ?? [], confirmed: data.mine.contentConfirmed.has(id) };
  const reload = () => loadPlace(placeId);
  return {
    canAct: !!data.uid, mine,
    async report(reason) {
      const c = await getClient();
      const { error } = await c.from("reports").insert({ target_type: type, target_id: String(id), reason });
      if (error && error.code !== "23505") throw error;
      await reload();
      return !error;                                   // 같은 이유로 이미 신고했으면 false
    },
    async setConfirm(on) {
      const c = await getClient();
      const [table, col] = type === "place" ? ["place_confirmations", "place_id"] : ["content_confirmations", "content_id"];
      const { error } = on ? await c.from(table).upsert({ [col]: id }, { onConflict: `user_id,${col}`, ignoreDuplicates: true }) : await c.from(table).delete().eq(col, id);
      if (error) throw error;
      await reload();
    },
  };
}

// 장소 자체의 신뢰 대상. 서버에서 받은 값이 있으면 예시 값(TRUST_SEEDS)에 서버 집계를 더하고, 없으면 장소 그대로(이 브라우저 기록) 쓴다.
export function placeTarget(p) {
  const data = getPlaceRemote(p.id);
  if (!data || !data.uid) return p;                    // 로그인하지 않았으면 이 브라우저 기록으로 신고·투표한다
  const base = TRUST_SEEDS[p.id] ?? {};
  const add = countSeed(data.place);
  return { type: "place", id: p.id, visit: p.visit, cat: p.cat,
    seed: { reports: sumReports(base.reports, add.reports), confirmDaysAgo: [...(base.confirmDaysAgo ?? []), ...add.confirmDaysAgo] },
    remote: makeRemote("place", p.id, data, p.id) };
}

// 서버 글의 신뢰 대상
export function postRemoteTarget(post, data) {
  return { type: "post", id: post.id, visit: post.visit, cat: placeById(post.place)?.cat, status: post.status, owner: post.mine,
    seed: countSeed(data.trust[post.id]), remote: makeRemote("content", post.id, data, post.place) };
}

// ---------- 글쓰기 ----------
// 서버에 글을 올린다. 신뢰 필드(작성자 역할·체크인 확인·상태·작성 시각)는 서버가 정한다.
export async function submitPost(post) {
  const c = await getClient();
  if (!c) throw new Error("offline");
  const { data, error } = await c.from("contents").insert({
    place_id: post.place, original_language: post.lang, body: post.comment, tip: post.tip ?? {}, visit_date: post.visit,
    declared_visit: true, not_affiliated: true, sponsored: post.sponsored ?? "none",
  }).select("id").single();
  if (error) throw error;
  clearRemoteCache();
  return data.id;
}

// 현장 체크인: 좌표는 이 호출에만 쓰고 저장하지 않는다. 결과(true/false)는 서버가 정한다.
export async function verifyCheckin(contentId, lat, lng, radiusM) {
  const c = await getClient();
  const { data, error } = await c.rpc("verify_checkin", { p_content: contentId, p_lat: lat, p_lng: lng, p_radius_m: radiusM });
  clearRemoteCache();
  return !error && data === true;
}

export async function deletePost(id) {
  const c = await getClient();
  const { error } = await c.from("contents").delete().eq("id", id);
  if (error) throw error;
  clearRemoteCache();
}

// 내가 쓴 글(서버)
export function getMyPostsCache() { return myPostsCache && myPostsCache.uid === (currentUserId() ?? null) ? myPostsCache.list : null; }
export async function loadMyPosts() {
  const uid = currentUserId();
  if (!uid) { myPostsCache = null; return []; }
  const c = await getClient();
  const { data, error } = c ? await c.from("contents").select(CONTENT_COLS).eq("author_id", uid).order("written_at", { ascending: false }) : { data: null, error: true };
  if (error) { myPostsCache = { uid, list: [] }; return []; }   // 실패해도 빈 목록으로 두어 화면이 계속 다시 그려지지 않게 한다
  myPostsCache = { uid, list: data.map((r) => toPost(r, uid)) };
  return myPostsCache.list;
}
