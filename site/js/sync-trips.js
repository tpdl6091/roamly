// 내 여행 서버 동기화(사진 제외): 여행·일정·방문 체크와 메모·가계부·체크리스트를 Supabase 와 맞춘다.
// 화면은 계속 이 브라우저의 저장값을 읽는다. 로그인한 상태에서 여행이 바뀌면 잠깐 뒤 바뀐 여행만 서버에 올린다.
//  - 이 브라우저의 여행은 id("t...")를 그대로 쓰고, 서버의 여행 id(uuid)는 trip.sid 에 따로 적어 둔다.
//  - 서버에 올릴 때는 여행 한 건씩 '여행 줄 덮어쓰기 + 하위 항목 지우고 다시 넣기'로 처리한다.
//  - 사진은 아직 서버에 올리지 않는다(이 브라우저에만 있다).
import { store, getTrips, onTripsSaved } from "./util.js";
import { getClient } from "./auth.js";
import { removeTripFiles, hasUnsyncedPhotos, clearPhotoCache } from "./photos-sync.js";
import { PLACES } from "./data.js";

const PLACE_IDS = new Set(PLACES.map((p) => p.id));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CURRENCIES = ["KRW", "JPY", "USD", "EUR"];
const EXP_CATS = ["transport", "lodging", "food", "other"];
const GROUPS = ["before", "packing", "local"];
const uuid = () => crypto.randomUUID();

let userId = null;
const pushed = new Map();          // 이 접속 동안 서버와 맞춰진 여행: 로컬 id → { sid, sig }
const known = new Map();           // 마지막으로 본 로컬 여행: 로컬 id → sid (지워진 여행을 알아내는 데 쓴다)

// ---- 이 브라우저에 남기는 작은 기록 ----
const getSynced = () => new Set(store.get("tripSynced", []));      // 서버와 맞춰진 적 있는 여행(sid)
const setSynced = (s) => store.set("tripSynced", [...s]);
const getPendingDeletes = () => store.get("tripPendingDelete", []);  // 서버에서 지워야 하는 여행(sid)
const setPendingDeletes = (a) => store.set("tripPendingDelete", a);

// 서버에 보낼 때 사진 목록은 뺀 값(사진만 바뀐 경우에는 서버에 보낼 일이 없다)
function sigOf(tr) {
  const journal = Object.fromEntries(Object.entries(tr.journal ?? {}).map(([k, e]) => [k, { v: !!e.visited, a: e.visitedAt ?? null, m: e.memo ?? "" }]));
  return JSON.stringify({ c: tr.city, s: tr.start, e: tr.end, cur: tr.currency ?? "KRW", b: tr.budget ?? null, r: tr.rates ?? {}, d: tr.days ?? {}, x: tr.expenses ?? [], k: tr.checklist ?? [], j: journal });
}

// ---- 이 브라우저의 여행 → 서버 표의 줄 ----
function toRows(tr) {
  const tid = tr.sid;
  const trip = { id: tid, city_id: tr.city, start_date: tr.start, end_date: tr.end, base_currency: CURRENCIES.includes(tr.currency) ? tr.currency : "KRW", budget: tr.budget ?? {}, rates: tr.rates ?? {} };
  const items = [];
  for (const [day, list] of Object.entries(tr.days ?? {})) {
    if (!DATE_RE.test(day) || !Array.isArray(list)) continue;
    const seen = new Set();
    list.forEach((pid, i) => {
      if (typeof pid !== "string" || !PLACE_IDS.has(pid) || seen.has(pid)) return;   // 서버에 없는 장소·같은 날 중복은 건너뛴다
      seen.add(pid);
      items.push({ trip_id: tid, day, place_id: pid, position: i });
    });
  }
  const journal = [];
  for (const [pid, e] of Object.entries(tr.journal ?? {})) {
    if (!PLACE_IDS.has(pid) || (!e.visited && !e.memo)) continue;
    journal.push({ trip_id: tid, place_id: pid, visited: !!e.visited, visited_on: DATE_RE.test(e.visitedAt ?? "") ? e.visitedAt : null, memo: String(e.memo ?? "").slice(0, 1000) });
  }
  const expenses = [];
  for (const x of tr.expenses ?? []) {
    if (!(x.amount > 0) || !(x.rate > 0) || !CURRENCIES.includes(x.currency) || !EXP_CATS.includes(x.category)) continue;
    expenses.push({ id: uuid(), trip_id: tid, amount: x.amount, currency: x.currency, rate: x.rate, amount_base: x.amountBase ?? Math.round(x.amount * x.rate * 100) / 100,
      category: x.category, spent_on: DATE_RE.test(x.date ?? "") ? x.date : tr.start, memo: x.memo ?? "", place_id: PLACE_IDS.has(x.place) ? x.place : null });
  }
  const checklist = [];
  for (const k of tr.checklist ?? []) {
    if (!GROUPS.includes(k.group) || (!k.key && !k.text)) continue;
    checklist.push({ trip_id: tid, key: k.key ?? null, text: k.key ? null : (k.text ?? null), group_name: k.group, done: !!k.done });
  }
  return { trip, items, journal, expenses, checklist };
}

// ---- 서버 표의 줄 → 이 브라우저의 여행 ----
function fromServer(row, local) {
  const days = {};
  [...(row.trip_items ?? [])].sort((a, b) => a.position - b.position).forEach((i) => { (days[i.day] ??= []).push(i.place_id); });
  const journal = {};
  for (const r of row.trip_journal ?? []) {
    journal[r.place_id] = { visited: r.visited, visitedAt: r.visited_on, memo: r.memo ?? "", photos: local?.journal?.[r.place_id]?.photos ?? [] };
  }
  // 서버에는 없지만 이 브라우저에 사진이 있는 기록은 그대로 둔다
  for (const [pid, e] of Object.entries(local?.journal ?? {})) if (!journal[pid] && e.photos?.length) journal[pid] = e;
  const trip = {
    id: local?.id ?? "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), sid: row.id,
    city: row.city_id, start: row.start_date, end: row.end_date, currency: row.base_currency, rates: row.rates ?? {}, days, journal,
    expenses: (row.expenses ?? []).map((r) => ({ id: r.id, amount: Number(r.amount), currency: r.currency, rate: Number(r.rate), amountBase: Number(r.amount_base),
      category: r.category, date: r.spent_on, memo: r.memo ?? "", place: r.place_id ?? "" })),
    checklist: (row.checklist_items ?? []).map((r) => ({ id: r.id, ...(r.key ? { key: r.key } : { text: r.text }), group: r.group_name, done: r.done })),
  };
  if (row.budget && row.budget.total !== undefined) trip.budget = row.budget;   // 서버 기본값 {} 는 '예산 없음'
  return trip;
}

async function must(promise) {
  const { error } = await promise;
  if (error) throw error;
}

// 여행 한 건을 서버에 맞춘다(하나라도 실패하면 예외 → 나중에 다시 시도)
async function pushTrip(c, tr) {
  const { trip, items, journal, expenses, checklist } = toRows(tr);
  await must(c.from("trips").upsert(trip));
  for (const [table, rows] of [["trip_items", items], ["trip_journal", journal], ["expenses", expenses], ["checklist_items", checklist]]) {
    await must(c.from(table).delete().eq("trip_id", trip.id));
    if (rows.length) await must(c.from(table).insert(rows));
  }
}

// ---- 바뀐 여행을 서버로 ----
let timer = null, dirty = false;

// setTrips 가 불릴 때마다 실행된다: 지워진 여행을 기록하고, 새 여행에 sid 를 붙이고, 잠깐 뒤 올린다.
function onTripsChanged() {
  if (!userId) return;
  const trips = getTrips();
  const now = new Map(trips.map((t) => [t.id, t.sid]));
  const gone = [...known].filter(([lid, sid]) => sid && !now.has(lid)).map(([, sid]) => sid);
  if (gone.length) setPendingDeletes([...new Set([...getPendingDeletes(), ...gone])]);
  let assigned = false;
  for (const tr of trips) if (!tr.sid) { tr.sid = uuid(); assigned = true; }   // 바로 저장해야 다른 수정과 겹치지 않는다
  if (assigned) store.set("trips", trips);
  known.clear(); trips.forEach((t) => known.set(t.id, t.sid));
  clearTimeout(timer);
  timer = setTimeout(runPush, 700);
}

// 서버에서 지워야 하는 여행을 지운다(성공한 것만 대기 목록에서 뺀다)
async function flushDeletes(c) {
  const synced = getSynced();
  let pending = getPendingDeletes();
  for (const sid of [...pending]) {
    try {
      if (userId) await removeTripFiles(c, userId, sid).catch(() => {});   // 사진 파일(표의 줄은 여행 삭제와 함께 지워진다)
      await must(c.from("trips").delete().eq("id", sid));
      pending = pending.filter((x) => x !== sid); synced.delete(sid);
    } catch { /* 다음에 다시 */ }
  }
  setPendingDeletes(pending); setSynced(synced);
}

let current = null;
function runPush() {
  if (current) { dirty = true; return current; }
  current = (async () => {
    const c = await getClient();
    if (!c || !userId) return;
    await flushDeletes(c);
    // 바뀐 여행
    for (const tr of getTrips()) {
      if (!tr.sid) continue;
      const sig = sigOf(tr);
      if (pushed.get(tr.id)?.sig === sig) continue;
      try {
        await pushTrip(c, tr);
        pushed.set(tr.id, { sid: tr.sid, sig });
        const s = getSynced(); s.add(tr.sid); setSynced(s);
      } catch { /* 서버에 못 올려도 이 브라우저에는 남아 있다. 다음 변경이나 로그인 때 다시 시도한다 */ }
    }
  })().catch(() => {}).finally(() => {
    current = null;
    if (dirty) { dirty = false; runPush(); }
  });
  return current;
}

// 대기 중인 올리기를 바로 실행하고 끝날 때까지 기다린다
export async function flushTripsNow() {
  clearTimeout(timer);
  await runPush();
  if (current) await current;
}

// ---- 로그인할 때 서버와 맞추기 ----
//  · 이 브라우저의 여행 중 서버에 올린 적 없는 것은 서버에 올린다
//  · 서버에 있는 여행은 서버 내용이 기준(사진은 이 브라우저 것을 유지)
//  · 다른 기기에서 지운 여행(서버에서 사라진 것)은 이 브라우저에서도 뺀다
export async function tripsSyncLogin(uid, onChange) {
  userId = uid;
  const c = await getClient();
  if (!c) return;
  // 다른 계정의 사본이 남아 있으면 비운다(그 계정의 데이터는 서버에 있다)
  const owner = store.get("tripOwner", null);
  if (owner && owner !== uid) { store.set("trips", []); store.set("tripSynced", []); store.set("tripPendingDelete", []); }
  // 서버에서 지워야 하는 여행만 먼저 처리(오래된 내용을 서버에 덮어쓰지 않도록 올리기는 하지 않는다)
  await flushDeletes(c);
  const { data, error } = await c.from("trips").select("*, trip_items(*), trip_journal(*), expenses(*), checklist_items(*)").order("created_at", { ascending: true });
  if (error) return;
  const rows = new Map(data.map((r) => [r.id, r]));
  const pendingDel = new Set(getPendingDeletes());
  const synced = getSynced();
  const next = [];
  for (const tr of getTrips()) {
    if (tr.sid && pendingDel.has(tr.sid)) continue;
    const row = tr.sid ? rows.get(tr.sid) : null;
    if (row) { next.push(fromServer(row, tr)); rows.delete(tr.sid); continue; }
    if (tr.sid && synced.has(tr.sid)) continue;           // 서버에서 지워진 여행
    next.push(tr);                                         // 서버에 올린 적 없는 여행: 아래에서 올린다
  }
  for (const row of rows.values()) if (!pendingDel.has(row.id)) next.push(fromServer(row, null));
  for (const tr of next) { if (!tr.sid) tr.sid = uuid(); }
  const before = JSON.stringify(getTrips());
  const after = JSON.stringify(next);
  store.set("trips", next);
  store.set("tripOwner", uid);
  known.clear(); next.forEach((t) => known.set(t.id, t.sid));
  // 서버에서 가져온 것은 이미 맞춰진 상태로 기록하고, 서버에 없던 것은 올린다
  for (const tr of next) {
    if (data.some((r) => r.id === tr.sid)) { pushed.set(tr.id, { sid: tr.sid, sig: sigOf(tr) }); const s = getSynced(); s.add(tr.sid); setSynced(s); }
  }
  runPush();
  if (before !== after) onChange?.();
}

// 올라가지 않은 사진이 있으면 지우지 않는다(그 사진은 이 브라우저에만 있어서 지우면 사라진다).
export async function tripsSyncLogout() {
  userId = null; clearTimeout(timer); pushed.clear(); known.clear();
  if (await hasUnsyncedPhotos()) return false;
  store.set("trips", []); store.set("tripSynced", []); store.set("tripOwner", null);
  clearPhotoCache();
  return true;
}

export function initTripsSync() { onTripsSaved(onTripsChanged); }

// 시험용(실제 서비스 코드에서는 쓰지 않는다)
export const _toRows = toRows;
export const _fromServer = fromServer;
