// 여행 기록: 방문 체크, 메모, 사진(IndexedDB), 도시별 아카이브
import { el, pick, getTrips, mutateTrip } from "./util.js";
import { getLang, t } from "./i18n.js";
import { CITIES, PLACES } from "./data.js";
import { putPhoto, deletePhoto, compressImage } from "./photo-db.js";
import { uploadPhotos, removePhoto, loadPhoto } from "./photos-sync.js";
import { flushTripsNow } from "./sync-trips.js";
import { currentUserId } from "./sync.js";

const MAX_PHOTOS = 10;
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const findTrip = (id) => getTrips().find((x) => x.id === id);
const placeById = (id) => PLACES.find((p) => p.id === id);
const cityName = (id) => { const c = CITIES.find((x) => x.id === id); return c ? (c.name[getLang()] ?? c.name.en) : id; };
const entryOf = (trip, pid) => trip.journal?.[pid] ?? { visited: false, memo: "", photos: [], visitedAt: null };

// ---------- 일정 화면에서 쓰는 방문 체크 ----------
export const isVisited = (trip, pid) => !!trip.journal?.[pid]?.visited;

export function toggleVisited(tripId, pid, date) {
  mutateTrip(tripId, (tr) => {
    tr.journal = tr.journal ?? {};
    const e = entryOf(tr, pid);
    e.visited = !e.visited;
    e.visitedAt = e.visited ? date : null;
    tr.journal[pid] = e;
  });
}

// 여행을 지울 때 그 여행의 사진도 함께 지운다
export function purgeTripPhotos(trip) {
  for (const e of Object.values(trip.journal ?? {})) for (const id of e.photos ?? []) deletePhoto(id).catch(() => {});
}

// 일정 순서대로 장소를 한 번씩만 모은다
function itineraryPlaces(trip) {
  const seen = new Set();
  const list = [];
  for (const date of Object.keys(trip.days).sort()) {
    for (const pid of trip.days[date]) {
      if (seen.has(pid) || !placeById(pid)) continue;
      seen.add(pid);
      list.push({ pid, date });
    }
  }
  return list;
}

const dayNumber = (trip, date) => Math.round((parse(date) - parse(trip.start)) / 86400000) + 1;
const dayText = (trip, date) =>
  `${t("day_n", { n: dayNumber(trip, date) })} · ${parse(date).toLocaleDateString(getLang(), { month: "short", day: "numeric" })}`;

function stats(trips) {
  let visited = 0, photos = 0;
  const seen = new Set();
  for (const tr of trips) {
    for (const [pid, e] of Object.entries(tr.journal ?? {})) {
      if (e.visited) seen.add(pid);
      photos += (e.photos ?? []).length;
    }
  }
  visited = seen.size;
  return { trips: trips.length, visited, photos };
}

// ---------- 여행 안의 '기록' 탭 ----------
// 화면 아래의 '수정'을 눌러야 고칠 수 있고, '저장'을 눌러야 방문 체크·메모·사진이 저장된다(저장이 끝나면 '저장 완료'가 뜬다).
export function journalPanel(tripId) {
  const root = el("div");
  let urls = [];
  const state = { editing: false, saving: false, done: "", warn: "" };
  const draft = { visited: {}, memo: {} };   // 수정 중인 값(저장 전)
  const pending = {};                        // 고른 뒤 아직 저장하지 않은 사진: 장소 id → [{ id, blob, url }]
  const removing = {};                       // 지우기로 표시한 저장된 사진: 장소 id → Set(사진 id)
  const notices = {};

  function startEdit(trip, items) {
    draft.visited = {}; draft.memo = {};
    for (const { pid } of items) { const e = entryOf(trip, pid); draft.visited[pid] = !!e.visited; draft.memo[pid] = e.memo ?? ""; }
    state.editing = true; state.done = ""; state.warn = "";
    draw();
  }

  function draw() {
    urls.forEach((u) => URL.revokeObjectURL(u));
    urls = [];
    const trip = findTrip(tripId);
    const items = itineraryPlaces(trip);
    const visitedCount = items.filter((i) => isVisited(trip, i.pid)).length;
    const photoCount = items.reduce((n, i) => n + entryOf(trip, i.pid).photos.length, 0);

    if (!items.length) {
      root.replaceChildren(el("div", { class: "placeholder" }, el("p", {}, t("jr_empty")),
        el("a", { class: "btn ghost", href: `#/trip/${tripId}` }, t("jr_goto_plan"))));
      return;
    }
    root.replaceChildren(
      el("section", { class: "sec" },
        el("b", {}, t("jr_summary", { v: visitedCount, n: items.length, p: photoCount })),
        el("div", { class: "meter", style: "margin-top:8px" }, el("i", { style: `width:${(visitedCount / items.length) * 100}%` }))),
      ...items.map((i) => card(trip, i)),
      controls(trip, items),
      el("p", { class: "note" }, t("jr_privacy")));
  }

  // 사진 파일을 줄여서(위치 정보는 이때 사라진다) 저장 전 목록에 둔다
  async function addFiles(pid, files, stored) {
    const room = MAX_PHOTOS - stored - (pending[pid]?.length ?? 0);
    const all = [...files].filter((f) => f.type.startsWith("image/"));
    const picked = all.slice(0, Math.max(0, room));
    const results = await Promise.allSettled(picked.map(async (f) => ({
      id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), blob: await compressImage(f),
    })));
    for (const r of results) {
      if (r.status === "fulfilled") (pending[pid] ??= []).push({ id: r.value.id, blob: r.value.blob, url: URL.createObjectURL(r.value.blob) });
    }
    if (results.some((r) => r.status === "rejected")) notices[pid] = t("jr_photo_fail");
    else if (all.length > room) notices[pid] = t("jr_photo_limit");
    draw();
  }

  function card(trip, { pid, date }) {
    const place = placeById(pid);
    const e = entryOf(trip, pid);
    const editing = state.editing;
    const queue = pending[pid] ?? [];
    const marked = removing[pid] ?? new Set();
    const msg = el("div", { class: "err", role: "alert" }, notices[pid] ?? "");
    delete notices[pid];

    // 방문 체크
    const visited = el("input", { type: "checkbox", id: "vis_" + pid, ...(editing ? {} : { disabled: "" }) });
    visited.checked = editing ? !!draft.visited[pid] : e.visited;
    visited.addEventListener("change", () => { draft.visited[pid] = visited.checked; });

    // 메모: 수정 중에는 입력 칸, 아니면 저장된 글
    const memoView = editing
      ? (() => {
        const memo = el("textarea", { id: "memo_" + pid, rows: "3", maxlength: "1000", placeholder: t("jr_memo_ph"), "aria-label": t("jr_memo_label") });
        memo.value = draft.memo[pid] ?? "";
        memo.addEventListener("input", () => { draft.memo[pid] = memo.value; });
        return memo;
      })()
      : (e.memo ? el("p", { class: "memo-read" }, e.memo) : el("p", { class: "note", style: "margin:0" }, t("jr_memo_empty")));

    // 사진: 저장된 사진(수정 중에는 × 로 삭제 표시) + 저장 전 미리보기
    const grid = el("div", { class: "photos" });
    for (const id of e.photos) {
      const tile = el("div", { class: "photo" + (marked.has(id) ? " removing" : "") });
      grid.append(tile);
      loadPhoto(tripId, id).then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        tile.append(el("img", { src: url, alt: "", loading: "lazy" }));
        if (marked.has(id)) tile.append(el("span", { class: "tag" }, t("jr_removing_tag")));
        if (editing) {
          tile.append(el("button", {
            class: "x", type: "button", "aria-label": marked.has(id) ? t("jr_undo") : t("jr_photo_remove"),
            onclick: () => {
              const set = (removing[pid] ??= new Set());
              if (set.has(id)) set.delete(id); else set.add(id);
              draw();
            },
          }, marked.has(id) ? "↺" : "×"));
        }
      }).catch(() => {});
    }
    for (const item of queue) {
      grid.append(el("div", { class: "photo pending" },
        el("img", { src: item.url, alt: "" }),
        el("span", { class: "tag" }, t("jr_pending_tag")),
        el("button", {
          class: "x", type: "button", "aria-label": t("jr_photo_remove"),
          onclick: () => { URL.revokeObjectURL(item.url); pending[pid] = queue.filter((q) => q !== item); draw(); },
        }, "×")));
    }

    // 사진 추가: 한 번에 여러 장을 고를 수 있다(끌어다 놓기도 된다)
    const storedKept = e.photos.length - marked.size;
    const total = storedKept + queue.length;
    const file = el("input", { type: "file", accept: "image/*", multiple: "", hidden: "", id: "file_" + pid });
    file.multiple = true;
    file.addEventListener("change", () => { addFiles(pid, file.files, storedKept); file.value = ""; });
    const addBtn = el("button", { class: "btn ghost sm", type: "button", onclick: () => file.click(), ...(total >= MAX_PHOTOS ? { disabled: "" } : {}) },
      t("jr_add_photo") + ` (${total}/${MAX_PHOTOS})`);
    if (editing) {
      grid.addEventListener("dragover", (ev) => { ev.preventDefault(); grid.classList.add("drop"); });
      grid.addEventListener("dragleave", () => grid.classList.remove("drop"));
      grid.addEventListener("drop", (ev) => { ev.preventDefault(); grid.classList.remove("drop"); addFiles(pid, ev.dataTransfer?.files ?? [], storedKept); });
    }

    return el("section", { class: "sec" },
      el("div", { class: "nhead" },
        el("a", { href: `#/p/${pid}` }, el("b", {}, pick(place.name))),
        el("small", {}, dayText(trip, date))),
      el("div", { class: "check" }, visited, el("label", { for: "vis_" + pid }, t("jr_visited"))),
      el("div", { class: "field" }, memoView),
      grid,
      el("div", { class: "paction", style: "margin-top:10px" }, editing ? addBtn : "", editing ? file : "",
        e.visited ? el("a", { class: "btn ghost sm", href: `#/write/${pid}` }, t("jr_write_rec")) : ""),
      msg);
  }

  // 화면 아래의 '수정'·'저장' 버튼과 저장 결과 표시
  function controls(trip, items) {
    const editBtn = el("button", { class: "btn" + (state.editing ? " ghost" : ""), type: "button", ...(state.editing || state.saving ? { disabled: "" } : {}),
      onclick: () => startEdit(trip, items) }, t("jr_edit"));
    const saveBtn = el("button", { class: "btn" + (state.editing ? "" : " ghost"), type: "button", ...(!state.editing || state.saving ? { disabled: "" } : {}),
      onclick: () => save(items) }, state.saving ? t("jr_uploading") : t("jr_save_all"));
    return el("section", { class: "sec jr-actions" },
      el("div", { class: "paction" }, editBtn, saveBtn),
      state.done ? el("div", { class: "ok done", role: "status" }, "✓ " + state.done) : "",
      state.warn ? el("div", { class: "err", role: "alert" }, state.warn) : "",
      el("p", { class: "note", style: "margin:8px 0 0" }, state.editing ? t("jr_hint_edit") : t("jr_hint_view")));
  }

  // 저장: 방문 체크·메모·사진 삭제/추가를 한꺼번에 저장하고, 로그인했다면 서버에도 올린다
  async function save(items) {
    if (state.saving || !state.editing) return;
    state.saving = true; state.done = ""; state.warn = "";
    draw();
    const newIds = {};
    let photoFailed = false;
    for (const { pid } of items) {
      for (const it of pending[pid] ?? []) {
        try { await putPhoto(it.id, it.blob); (newIds[pid] ??= []).push(it.id); } catch { photoFailed = true; }
        URL.revokeObjectURL(it.url);
      }
    }
    const removedIds = {};
    mutateTrip(tripId, (tr) => {
      tr.journal = tr.journal ?? {};
      for (const { pid, date } of items) {
        const cur = entryOf(tr, pid);
        const wasVisited = cur.visited;
        cur.visited = !!draft.visited[pid];
        if (cur.visited && !wasVisited) cur.visitedAt = date;
        if (!cur.visited) cur.visitedAt = null;
        cur.memo = draft.memo[pid] ?? cur.memo;
        const drop = removing[pid] ?? new Set();
        removedIds[pid] = [...drop];
        cur.photos = [...cur.photos.filter((id) => !drop.has(id)), ...(newIds[pid] ?? [])];
        const empty = !cur.visited && !cur.memo && !cur.photos.length;
        if (!empty || tr.journal[pid]) tr.journal[pid] = cur;
      }
    });
    for (const pid of Object.keys(removedIds)) for (const id of removedIds[pid]) removePhoto(tripId, id);   // 이 브라우저와 서버에서 지운다
    Object.keys(pending).forEach((k) => delete pending[k]);
    Object.keys(removing).forEach((k) => delete removing[k]);

    const uploadedCount = Object.values(newIds).reduce((n, l) => n + l.length, 0);
    let failed = photoFailed ? 1 : 0;
    if (uploadedCount && currentUserId()) {
      try {
        await flushTripsNow();                            // 여행이 서버에 먼저 올라가 있어야 사진을 올릴 수 있다
        for (const [pid, ids] of Object.entries(newIds)) failed += (await uploadPhotos(tripId, pid, ids)).failed.length;
      } catch { failed += 1; }
    }
    state.saving = false;
    state.editing = false;
    state.done = t("jr_save_done") + (uploadedCount && currentUserId() && !failed ? " · " + t("jr_upload_done") : "");
    if (failed) state.warn = t("jr_upload_partial");
    draw();
  }

  draw();
  return root;
}

// ---------- 내 여행 > 기록 탭: 도시별 아카이브 ----------
export function journalArchive() {
  const trips = getTrips();
  const byCity = new Map();
  for (const tr of trips) {
    if (!byCity.has(tr.city)) byCity.set(tr.city, []);
    byCity.get(tr.city).push(tr);
  }
  const withData = [...byCity.entries()].filter(([, list]) => stats(list).visited || stats(list).photos
    || list.some((tr) => Object.values(tr.journal ?? {}).some((e) => e.memo)));
  if (!withData.length) return el("div", { class: "placeholder" }, el("h2", {}, t("jr_none")), el("p", {}, t("jr_none_sub")));

  return el("div", { class: "ngrid" }, ...withData.map(([city, list]) => {
    const s = stats(list);
    return el("div", { class: "pcard" },
      el("div", { class: "nhead" }, el("b", {}, cityName(city))),
      el("p", {}, t("jr_stats", { t: s.trips, v: s.visited, p: s.photos })),
      el("div", { class: "ntags" }, ...list.slice().sort((a, b) => a.start.localeCompare(b.start)).map((tr) =>
        el("a", { class: "pill ok", href: `#/trip/${tr.id}/journal` }, `${parse(tr.start).toLocaleDateString(getLang(), { month: "short", day: "numeric" })} · ${t("jr_open")}`))));
  }));
}
