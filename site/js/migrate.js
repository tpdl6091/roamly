// 로그인하기 전에 이 브라우저에 쌓아 둔 글·장소 신고·장소 '여전히 맞아요'를 계정으로 옮긴다.
//  - 서버에 올라간 것은 이 브라우저의 목록에서 뺀다(올리지 못한 것은 남겨 두고 다음에 다시 시도한다).
//  - 예시 글·예시 리뷰에 한 신고·투표는 서버에 대응되는 것이 없어서 이 브라우저에만 남는다.
//  - 현장 체크인 표시는 옮기지 않는다(서버가 방문 당일에만 확인한다).
import { store } from "./util.js";
import { getClient } from "./auth.js";
import { submitPost } from "./remote.js";
import { PLACES } from "./data.js";

const PLACE_IDS = new Set(PLACES.map((p) => p.id));
let running = false;

// 옮긴 것이 하나라도 있으면 true
export async function migrateGuestData() {
  if (running) return false;
  running = true;
  let changed = false;
  try {
    const c = await getClient();
    if (!c) return false;

    // 1) 내가 쓴 글
    const posts = store.get("myPosts", []);
    if (posts.length) {
      const left = [];
      for (const p of posts) {
        try { await submitPost(p); changed = true; } catch { left.push(p); }
      }
      store.set("myPosts", left);
    }

    // 2) 장소 신고(같은 이유로 이미 신고한 것도 '옮긴 것'으로 본다)
    const reports = store.get("reports", []);
    if (reports.some((r) => r.place && PLACE_IDS.has(r.place))) {
      const keep = [];
      for (const r of reports) {
        if (!r.place || !PLACE_IDS.has(r.place)) { keep.push(r); continue; }
        const { error } = await c.from("reports").insert({ target_type: "place", target_id: r.place, reason: r.reason });
        if (error && error.code !== "23505") keep.push(r); else changed = true;
      }
      store.set("reports", keep);
    }

    // 3) 장소 '여전히 맞아요'(키가 장소 id 그대로인 것)
    const confirms = store.get("confirms", {});
    const placeKeys = Object.keys(confirms).filter((k) => PLACE_IDS.has(k));
    if (placeKeys.length) {
      const ok = [];
      for (const k of placeKeys) {
        const { error } = await c.from("place_confirmations").upsert({ place_id: k }, { onConflict: "user_id,place_id", ignoreDuplicates: true });
        if (!error) ok.push(k);
      }
      if (ok.length) { ok.forEach((k) => delete confirms[k]); store.set("confirms", confirms); changed = true; }
    }
  } finally {
    running = false;
  }
  return changed;
}
