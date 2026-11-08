import { useEffect, useRef, useState } from 'react';
import { compressImage, MAX_PHOTOS } from '../utils/image';

// ฟอร์มรีวิว state หลัก: rating, text, photos, error, status
// ไม่จำลอง server เอง: รับฟังก์ชัน onSubmit({ rating, text, photos }) จากแม่ ซึ่งจะไปยิง POST จริง
// photos คืออาร์เรย์ไฟล์รูปที่ย่อแล้ว (ว่างได้) แนบได้ไม่เกิน MAX_PHOTOS รูป
function ReviewForm({ restaurantName, onSubmit }) {
  const [rating, setRating] = useState(0);            // 0 = ยังไม่เลือก
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);           // [{ file, preview }]
  const [photoError, setPhotoError] = useState(null);
  const [processing, setProcessing] = useState(false);   // กำลังย่อรูป
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');     // 'typing' | 'submitting' | 'success'
  const cameraRef = useRef(null);                     // <input capture> เปิดกล้องบนมือถือ
  const galleryRef = useRef(null);                    // <input> เลือกรูปจากเครื่อง

  // คืนหน่วยความจำของรูปตัวอย่างตอนปิดฟอร์ม
  const previewsRef = useRef([]);
  previewsRef.current = photos.map(p => p.preview);
  useEffect(() => () => previewsRef.current.forEach(url => URL.revokeObjectURL(url)), []);

  if (status === 'success') {
    return <p className="rounded-lg bg-red-50 p-4 text-red-700">ขอบคุณสำหรับรีวิว {restaurantName} 🎉</p>;
  }

  // เลือกรูปมาแล้ว: ย่อทีละรูป แล้วเพิ่มในรายการ (เกินจำนวนที่กำหนดจะตัดทิ้งและแจ้ง)
  async function handleFiles(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';                              // ให้เลือกไฟล์เดิมซ้ำได้
    if (picked.length === 0) return;

    setPhotoError(null);
    const room = MAX_PHOTOS - photos.length;
    if (picked.length > room) {
      setPhotoError(`แนบรูปได้ไม่เกิน ${MAX_PHOTOS} รูป`);
    }
    setProcessing(true);
    const added = [];
    for (const file of picked.slice(0, Math.max(room, 0))) {
      try {
        const small = await compressImage(file);
        added.push({ file: small, preview: URL.createObjectURL(small) });
      } catch (err) {
        setPhotoError(err.message || 'เตรียมรูปไม่สำเร็จ');
      }
    }
    setPhotos(current => [...current, ...added]);
    setProcessing(false);
  }

  function removePhoto(index) {
    URL.revokeObjectURL(photos[index].preview);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit({ rating, text, photos: photos.map(p => p.file) });   // แม่เป็นคนรู้ว่าจะส่งไปที่ไหน ฟอร์มไม่ต้องรู้
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);                                // ข้อความ 400 / 401 / 409 จาก server
    }
  }

  const busy = status === 'submitting';
  const photoBtn = 'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-red-50 disabled:opacity-50';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-slate-900">เขียนรีวิว {restaurantName}</h3>
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-500">ให้คะแนน</span>
        {[1, 2, 3, 4, 5].map(n => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} ดาว`}
                  className={'h-8 w-8 rounded-lg border text-sm ' +
                    (rating === n ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-red-50')}>
            {n}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
                disabled={busy} rows={3}
                placeholder="กินแล้วรู้สึกอย่างไร (อย่างน้อย 10 ตัวอักษร)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:bg-slate-50" />

      {/* แนบรูป: ถ่ายจากกล้อง (มือถือ) หรือเลือกจากเครื่อง ไม่เกิน 3 รูป */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={photoBtn} disabled={busy || processing || photos.length >= MAX_PHOTOS}
                  onClick={() => cameraRef.current?.click()}>
            📷 ถ่ายรูป
          </button>
          <button type="button" className={photoBtn} disabled={busy || processing || photos.length >= MAX_PHOTOS}
                  onClick={() => galleryRef.current?.click()}>
            🖼️ เลือกรูป
          </button>
          <span className="text-xs text-slate-400">
            {processing ? 'กำลังเตรียมรูป...' : `แนบได้สูงสุด ${MAX_PHOTOS} รูป (${photos.length}/${MAX_PHOTOS})`}
          </span>
          {/* capture="environment" = เปิดกล้องหลังบนมือถือ บนคอมจะเปิดหน้าต่างเลือกไฟล์ตามปกติ */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFiles}
                 className="hidden" data-testid="camera-input" />
          <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleFiles}
                 className="hidden" data-testid="gallery-input" />
        </div>
        {photos.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <li key={p.preview} className="relative">
                <img src={p.preview} alt={`รูปที่ ${i + 1}`} className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
                <button type="button" onClick={() => removePhoto(i)} disabled={busy} aria-label={`ลบรูปที่ ${i + 1}`}
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-slate-800 text-xs text-white hover:bg-red-600">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        {photoError && <p className="mt-1 text-sm text-red-600">{photoError}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit"
                disabled={rating === 0 || text.trim().length === 0 || busy || processing}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-300">
          {busy ? 'กำลังส่ง...' : 'ส่งรีวิว'}
        </button>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    </form>
  );
}

export default ReviewForm;
