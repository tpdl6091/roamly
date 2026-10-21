// 여행 사진 서버 동기화: 비공개 저장소(trip-photos)와 trip_photos 표.
//  - 파일 경로는 "{사용자 id}/{여행 sid}/{사진 id}.jpg". 저장소 규칙이 첫 폴더가 내 id 인 파일만 읽고 쓰게 한다.
//  - 사진은 이 브라우저(IndexedDB)에 계속 두고(캐시), 로그인했을 때 서버에도 올린다. 다른 기기의 사진은 화면에 나올 때 내려받는다.
//  - 올리지 못한 사진은 이 브라우저에 남고, 다음 로그인·여행 변경 때 다시 올린다.
import { store, getTrips } from "./util.js";
import { getClient } from "./auth.js";
import { currentUserId } from "./sync.js";
import { putPhoto, getPhoto, deletePhoto } from "./photo-db.js";

const BUCKET = "trip-photos";
const pathOf = (uid, sid, id) => `${uid}/${sid}/${id}.jpg`;
const idOfPath = (path) => path.split("/").pop().replace(/\.jpg$/, "");

// ---- 이 브라우저에 남기는 기록 ----
const getConfirmed = () => new Set(store.get("photoSynced", []));          // 서버에 있는 것이 확인된 사진 id
const addConfirmed = (ids) => { const s = getConfirmed(); ids.forEach((i) => s.add(i)); store.set("photoSynced", [...s]); };
const dropConfirmed = (id) => { const s = getConfirmed(); s.delete(id); store.set("photoSynced", [...s]); };
const getPendingRemovals = () => store.get("photoPendingRemove", []);       // 서버에서 지워야 하는 사진: { sid, id }
const setPendingRemovals = (a) => store.set("photoPendingRemove", a);

const tripOf = (localId) => getTrips().find((t) => t.id === localId);

// 사진 한 장을 서버에 올린다(이미 있으면 성공으로 본다). 실패하면 예외.
async function uploadOne(c, uid, trip, pid, id) {
  const blob = await getPhoto(id);
  if (!blob) return;                                           // 이 브라우저에 파일이 없으면 올릴 것이 없다
  const path = pathOf(uid, trip.sid, id);
  const { error: upErr } = await c.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (upErr && !/exists|Duplicate/i.test(upErr.message ?? "") && upErr.statusCode !== "409") throw upErr;
  const { error } = await c.from("trip_photos").insert({ trip_id: trip.sid, place_id: pid, storage_path: path });
  if (error && error.code !== "23505") {                       // 23505: 이미 등록됨
    await c.storage.from(BUCKET).remove([path]).catch(() => {});   // 장소당 10장 제한 등으로 거부되면 올린 파일도 거둔다
    throw error;
  }
  addConfirmed([id]);
}

// 방금 추가한 사진들을 올린다. 호출하는 쪽이 먼저 여행이 서버에 올라가 있게 해야 한다(flushTripsNow).
// 올라간 것과 못 올린 것을 나누어 돌려준다(못 올린 사진은 이 브라우저에 남아 있고 다음에 다시 올린다).
export async function uploadPhotos(tripLocalId, pid, ids) {
  const ok = [], failed = [];
  const uid = currentUserId();
  const c = uid ? await getClient() : null;
  const trip = tripOf(tripLocalId);
  if (!uid || !c || !trip?.sid) return { ok, failed: [...ids], skipped: true };
  for (const id of ids) {
    try { await uploadOne(c, uid, trip, pid, id); ok.push(id); } catch { failed.push(id); }
  }
  return { ok, failed, skipped: false };
}

// 사진 한 장을 지운다(서버에서도). 실패하면 목록에 적어 두고 다음 로그인 때 다시 지운다.
export async function removePhoto(tripLocalId, id) {
  deletePhoto(id).catch(() => {});
  const uid = currentUserId();
  const trip = tripOf(tripLocalId);
  dropConfirmed(id);
  if (!uid || !trip?.sid) return;
  const c = await getClient();
  if (!c) return;
  try { await removeRemote(c, uid, trip.sid, id); }
  catch { setPendingRemovals([...getPendingRemovals(), { sid: trip.sid, id }]); }
}

async function removeRemote(c, uid, sid, id) {
  const path = pathOf(uid, sid, id);
  const { error } = await c.from("trip_photos").delete().eq("storage_path", path);
  if (error) throw error;
  await c.storage.from(BUCKET).remove([path]).catch(() => {});
}

// 화면에 사진을 그릴 때: 이 브라우저에 있으면 그것을, 없으면 서버에서 내려받아 저장해 두고 쓴다.
export async function loadPhoto(tripLocalId, id) {
  const local = await getPhoto(id).catch(() => null);
  if (local) return local;
  const uid = currentUserId();
  const trip = tripOf(tripLocalId);
  if (!uid || !trip?.sid) return null;
  const c = await getClient();
  if (!c) return null;
  const { data, error } = await c.storage.from(BUCKET).download(pathOf(uid, trip.sid, id));
  if (error || !data) return null;
  await putPhoto(id, data).catch(() => {});
  return data;
}

// 여행을 지울 때: 그 여행 폴더의 파일을 모두 지운다(표의 줄은 여행 삭제와 함께 서버가 지운다).
export async function removeTripFiles(c, uid, sid) {
  const folder = `${uid}/${sid}`;
  const { data } = await c.storage.from(BUCKET).list(folder, { limit: 200 });
  const paths = (data ?? []).map((o) => `${folder}/${o.name}`);
  if (paths.length) await c.storage.from(BUCKET).remove(paths);
}

// 로그인했을 때: 지우기 대기 → 서버 목록과 이 브라우저 목록 맞추기 → 서버에 없는 사진 올리기
export async function photosSyncLogin(uid, onChange) {
  const c = await getClient();
  if (!c) return;
  // 1) 지우지 못했던 사진
  const left = [];
  for (const r of getPendingRemovals()) { try { await removeRemote(c, uid, r.sid, r.id); } catch { left.push(r); } }
  setPendingRemovals(left);
  const pendingIds = new Set(left.map((r) => r.id));

  // 2) 서버에 있는 사진 목록
  const { data, error } = await c.from("trip_photos").select("trip_id,place_id,storage_path");
  if (error) return;
  const bySid = new Map();                                      // sid → Map(pid → [사진 id])
  for (const r of data) {
    const id = idOfPath(r.storage_path);
    if (pendingIds.has(id)) continue;
    if (!bySid.has(r.trip_id)) bySid.set(r.trip_id, new Map());
    const m = bySid.get(r.trip_id);
    if (!m.has(r.place_id)) m.set(r.place_id, []);
    m.get(r.place_id).push(id);
  }

  // 3) 서버에만 있는 사진을 이 브라우저 목록에 넣는다(파일은 화면에 나올 때 내려받는다). 읽고 바로 저장해서 다른 수정과 겹치지 않게 한다.
  const trips = getTrips();
  let added = false;
  const toUpload = [];
  const confirmed = [];
  for (const tr of trips) {
    if (!tr.sid) continue;
    const server = bySid.get(tr.sid) ?? new Map();
    tr.journal = tr.journal ?? {};
    for (const [pid, ids] of server) {
      const e = (tr.journal[pid] ??= { visited: false, memo: "", photos: [], visitedAt: null });
      e.photos = e.photos ?? [];
      for (const id of ids) { confirmed.push(id); if (!e.photos.includes(id)) { e.photos.push(id); added = true; } }
    }
    // 이 브라우저에만 있는 사진은 올릴 목록에 넣는다
    for (const [pid, e] of Object.entries(tr.journal)) {
      for (const id of e.photos ?? []) if (!(server.get(pid) ?? []).includes(id)) toUpload.push({ tr, pid, id });
    }
  }
  if (added) store.set("trips", trips);
  addConfirmed(confirmed);
  if (added) onChange?.();

  // 4) 올리기(여행이 서버에 있어야 한다: 호출하는 쪽이 여행 동기화를 먼저 끝낸다)
  for (const { tr, pid, id } of toUpload) { try { await uploadOne(c, uid, tr, pid, id); } catch { /* 다음에 다시 */ } }
}

// 이 브라우저에 파일이 있는데 서버에 올라간 것이 확인되지 않은 사진이 있는가(파일이 없는 사진은 지워도 잃을 것이 없다)
export async function hasUnsyncedPhotos() {
  const confirmed = getConfirmed();
  for (const tr of getTrips()) {
    for (const e of Object.values(tr.journal ?? {})) {
      for (const id of e.photos ?? []) {
        if (confirmed.has(id)) continue;
        if (await getPhoto(id).catch(() => null)) return true;
      }
    }
  }
  return false;
}

// 모든 사진 파일 캐시를 지운다(로그아웃할 때)
export function clearPhotoCache() {
  try { indexedDB.deleteDatabase("roamly"); } catch { /* 없으면 그만 */ }
  store.set("photoSynced", []);
}
