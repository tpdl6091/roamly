// 사진 저장소: 브라우저 IndexedDB (localStorage보다 용량이 커서 사진에 알맞다)
const DB_NAME = "roamly";
const STORE = "photos";

function open() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) { reject(new Error("no indexedDB")); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req?.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

export const putPhoto = (id, blob) => run("readwrite", (s) => s.put(blob, id));
export const getPhoto = (id) => run("readonly", (s) => s.get(id));
export const deletePhoto = (id) => run("readwrite", (s) => s.delete(id));

// 사진을 다시 그려서 저장한다: 긴 변 1280px, JPEG. 다시 그리는 과정에서 위치(EXIF) 정보가 사라진다.
export async function compressImage(file, maxSide = 1280, quality = 0.78) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", quality));
}
