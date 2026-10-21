// 다른 이용자가 쓴 추천 글 예시. 모두 가상이며, seed 는 다른 이용자들의 신고·'여전히 맞아요'가 이미 있는 것처럼 보이게 한다.
// seed.reports = 이유별 신고 수, seed.confirmDaysAgo = 며칠 전에 누가 '여전히 맞아요'를 눌렀는지
export const SAMPLE_POSTS = [
  { id: "sp-1", place: "sk-books", lang: "en", role: "traveler", visit: "2026-09-02", written: "2026-09-05", checkin: true, sponsored: "none",
    comment: "Went on a Tuesday afternoon and had the whole shop almost to myself. The owner doesn't mind if you read for a while.",
    seed: { confirmDaysAgo: [10, 25] } },
  { id: "sp-2", place: "sk-books", lang: "ja", role: "local", visit: "2026-08-20", written: "2026-08-21", checkin: false, sponsored: "affiliate",
    comment: "新刊も古書も並んでいて楽しいです。オンラインショップのリンクから買うと私にも少し収益が入ります。",
    seed: { reports: { ad: 2 } } },                                  // 신고 2건: 1건만 더 오면 검수 대기
  { id: "sp-3", place: "sk-cafe", lang: "ko", role: "traveler", visit: "2025-02-10", written: "2025-02-12", checkin: false, sponsored: "none",
    comment: "카운터 자리가 편했고 푸딩이 맛있었어요. 지금은 어떨지 모르겠네요.",
    seed: {} },                                                      // 방문일이 오래돼서 '정보 오래됨'
  { id: "sp-4", place: "yn-cafe", lang: "es", role: "traveler", visit: "2026-09-12", written: "2026-09-13", checkin: true, sponsored: "paid",
    comment: "Un café muy bonito con asientos junto a la ventana. Este texto fue escrito como publicidad pagada.",
    seed: { reports: { ad: 1, fake: 1, other: 1 } } },               // 신고 3건: 이미 검수 대기
  { id: "sp-5", place: "yn-noodle", lang: "ko", role: "local", visit: "2026-09-20", written: "2026-09-21", checkin: true, sponsored: "none",
    comment: "혼자 가도 눈치 안 보이는 바 좌석이 있어요. 오후 2시 이후에 가면 줄이 없어요.",
    seed: { confirmDaysAgo: [5] } },
  { id: "sp-6", place: "be-market", lang: "de", role: "traveler", visit: "2026-09-27", written: "2026-09-28", checkin: false, sponsored: "none",
    comment: "Samstag früh hingehen! Gegen Mittag ist kaum noch Platz zum Laufen.",
    seed: {} },
  { id: "sp-7", place: "ny-books", lang: "en", role: "traveler", visit: "2026-09-10", written: "2026-09-11", checkin: false, sponsored: "gifted",
    comment: "The staff gave me a free tote bag, but honestly the poetry section is the best part of the shop.",
    seed: { confirmDaysAgo: [30] } },
  { id: "sp-8", place: "bc-tapas", lang: "es", role: "local", visit: "2026-09-25", written: "2026-09-26", checkin: true, sponsored: "none",
    comment: "Pide dos o tres raciones pequeñas y comparte la barra con la gente del barrio. Muy auténtico.",
    seed: {} },
];
