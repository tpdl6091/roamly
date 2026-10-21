// 끌어서 순서 바꾸기: 포인터 이벤트(마우스·터치·펜)로 목록 항목을 손잡이로 끌어 옮긴다.
// 키보드 사용자는 따로 ↑↓ 버튼과 손잡이의 방향키를 쓴다(호출하는 쪽에서 처리).
export function enableDragSort(list, { handleSelector, onReorder }) {
  let drag = null;

  function reset() {
    if (!drag) return;
    drag.items.forEach((it) => { it.style.transform = ""; it.style.transition = ""; it.classList.remove("dragging"); });
    try { drag.handle.releasePointerCapture(drag.pointerId); } catch {}
    drag = null;
  }

  list.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(handleSelector);
    if (!handle || (e.pointerType === "mouse" && e.button !== 0)) return;
    const items = [...list.children];
    const item = handle.closest("li");
    const startIndex = items.indexOf(item);
    if (startIndex < 0 || items.length < 2) return;
    e.preventDefault();
    try { handle.setPointerCapture(e.pointerId); } catch {}   // 캡처를 못 해도 목록 위에서의 이동은 계속 받는다
    const rects = items.map((it) => it.getBoundingClientRect());
    const gap = rects[1].top - rects[0].bottom;
    drag = { handle, items, item, startIndex, newIndex: startIndex, startY: e.clientY, rects, shift: rects[startIndex].height + gap,
      pointerId: e.pointerId, scrollStart: window.scrollY };
    items.forEach((it) => { it.style.transition = "transform .12s ease"; });
    item.style.transition = "none";
    item.classList.add("dragging");
  });

  list.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    // 화면 위·아래 가장자리에 가까우면 스크롤한다
    const margin = 70;
    if (e.clientY < margin) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - margin) window.scrollBy(0, 14);

    const dy = e.clientY - drag.startY + (window.scrollY - drag.scrollStart);
    drag.item.style.transform = `translateY(${dy}px)`;
    const r = drag.rects[drag.startIndex];
    const center = r.top + r.height / 2 + dy;
    // 끌고 있는 항목의 중심보다 위에 있는 다른 항목 수 = 새 위치
    drag.newIndex = drag.rects.filter((rect, j) => j !== drag.startIndex && rect.top + rect.height / 2 < center).length;
    drag.items.forEach((it, j) => {
      if (j === drag.startIndex) return;
      let y = 0;
      if (j > drag.startIndex && j <= drag.newIndex) y = -drag.shift;
      else if (j < drag.startIndex && j >= drag.newIndex) y = drag.shift;
      it.style.transform = y ? `translateY(${y}px)` : "";
    });
  });

  const finish = (e, commit) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const { startIndex, newIndex } = drag;
    reset();
    if (commit && newIndex !== startIndex) onReorder(startIndex, newIndex);
  };
  list.addEventListener("pointerup", (e) => finish(e, true));
  list.addEventListener("pointercancel", (e) => finish(e, false));
}
