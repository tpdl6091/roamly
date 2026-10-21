// 서버 동기화: 로그인하면 '저장한 장소'를 Supabase(saved_places)와 맞춘다.
// 화면은 계속 이 브라우저의 저장값(localStorage)을 읽고, 바뀔 때마다 서버에도 알린다(로그인했을 때만).
// 로그인하지 않았거나 서버에 닿지 않아도 기존처럼 이 브라우저에서 그대로 동작한다.
import { store } from "./util.js";
import { getClient } from "./auth.js";
import { tripsSyncLogin, tripsSyncLogout, initTripsSync, flushTripsNow } from "./sync-trips.js";
import { photosSyncLogin } from "./photos-sync.js";
import { migrateGuestData } from "./migrate.js";

let userId = null;

// 지금 로그인한 사용자 id(로그인하지 않았으면 null)
export const currentUserId = () => userId;

export const getSaved = () => store.get("saved", []);

// 저장한 장소 목록을 바꾼다: 이 브라우저에 저장하고, 로그인 상태면 바뀐 것만 서버에 보낸다.
export function setSaved(list) {
  const before = getSaved();
  store.set("saved", list);
  pushSavedDiff(before, list);
}

async function pushSavedDiff(before, after) {
  if (!userId) return;
  const add = after.filter((id) => !before.includes(id));
  const del = before.filter((id) => !after.includes(id));
  if (!add.length && !del.length) return;
  const c = await getClient();
  if (!c) return;
  try {
    if (add.length) await c.from("saved_places").upsert(add.map((place_id) => ({ place_id })), { onConflict: "user_id,place_id", ignoreDuplicates: true });
    if (del.length) await c.from("saved_places").delete().in("place_id", del);
  } catch { /* 서버에 못 보내도 이 브라우저에는 저장돼 있다. 다음 로그인 때 다시 맞춘다 */ }
}

// 로그인했을 때 서버와 맞춘다.
//  - 이 계정으로 이 브라우저에서 처음: 서버 목록 + 이 브라우저의 목록을 합치고, 서버에 없던 것은 올린다
//  - 그 뒤: 서버 목록을 기준으로 삼는다(다른 기기에서 뺀 것이 되살아나지 않도록)
async function syncSaved(uid, onChange) {
  const c = await getClient();
  if (!c) return;
  const { data, error } = await c.from("saved_places").select("place_id").order("saved_at", { ascending: true });
  if (error) return;
  const server = data.map((r) => r.place_id);
  const local = getSaved();
  const synced = store.get("syncedUsers", []);
  let merged = server;
  if (!synced.includes(uid)) {
    const onlyLocal = local.filter((id) => !server.includes(id));
    merged = [...server, ...onlyLocal];
    if (onlyLocal.length) {
      const { error: upErr } = await c.from("saved_places").upsert(onlyLocal.map((place_id) => ({ place_id })), { onConflict: "user_id,place_id", ignoreDuplicates: true });
      if (upErr) return;                              // 올리지 못했으면 '처음'으로 남겨 두고 다음에 다시 시도한다
    }
    store.set("syncedUsers", [...synced, uid]);
  }
  const changed = merged.length !== local.length || merged.some((id, i) => id !== local[i]);
  if (changed) { store.set("saved", merged); onChange?.(); }
}

// 로그인·로그아웃 상태 변화를 지켜본다. onChange 는 목록이 바뀌었을 때 화면을 다시 그리는 함수.
export function initSync(onChange) {
  initTripsSync();
  getClient().then((c) => c?.auth.onAuthStateChange((event, session) => {
    userId = session?.user?.id ?? null;
    // 이 콜백 안에서 바로 서버를 부르면 막힐 수 있어 한 박자 뒤로 미룬다
    if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
      setTimeout(() => {
        onChange?.();                                  // 로그인 상태가 정해졌으니 화면이 서버 글·신고 상태를 가져오게 한다
        syncSaved(session.user.id, onChange);
        // 여행을 먼저 맞추고 서버에 올린 뒤, 사진을 맞춘다(사진은 여행이 서버에 있어야 올릴 수 있다)
        tripsSyncLogin(session.user.id, onChange).then(() => flushTripsNow()).then(() => photosSyncLogin(session.user.id, onChange)).catch(() => {});
        migrateGuestData().then((changed) => { if (changed) onChange?.(); });
      }, 0);
    }
    if (event === "SIGNED_OUT") { tripsSyncLogout().then(() => onChange?.()).catch(() => {}); store.set("saved", []); onChange?.(); }   // 다음 사용자에게 보이지 않도록 이 브라우저의 사본을 지운다(서버에는 남아 있다)
  }));
}
