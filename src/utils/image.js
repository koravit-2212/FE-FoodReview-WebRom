// ย่อรูปในเบราว์เซอร์ก่อนอัปโหลด: รูปจากกล้องมือถือมักใหญ่หลาย MB
// ย่อให้ด้านยาวไม่เกิน 1280 px แล้วแปลงเป็น JPEG ได้ไฟล์หลักร้อย KB อัปโหลดเร็วและไม่เกินเพดาน 5 MB ของ backend

export const MAX_PHOTOS = 3;   // ต้องตรงกับ backend (handler/reviews.go) และ CHECK ใน schema

// อ่านไฟล์เป็นภาพ ใช้ createImageBitmap ก่อน (หมุนรูปตามที่ถ่ายให้ถูกด้าน) ถ้าไม่มีก็ถอยไปใช้ <img>
async function loadImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // ไปลองวิธีสำรองด้านล่าง
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('เปิดไฟล์รูปนี้ไม่ได้'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImage(file, maxSide = 1280, quality = 0.82) {
  if (!file.type.startsWith('image/')) {
    throw new Error('ไฟล์ต้องเป็นรูปภาพ');
  }
  const img = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  if (typeof img.close === 'function') img.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('ย่อรูปไม่สำเร็จ');
  const baseName = (file.name || 'photo').replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}
