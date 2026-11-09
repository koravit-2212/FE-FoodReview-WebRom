import { useState } from 'react';
import { photoUrl } from '../api/backend';
import { dateTH } from '../utils/format';

// รายการรีวิวของร้าน 1 ร้าน รับ items รูปร่างตามสัญญา GET /api/restaurants/{id}/reviews:
// { id, rating, text, authorName, createdAt, photos: [{ id, url }], isMine?: boolean }
function ReviewList({ items, onDelete }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const isReviewMine = (review) => Boolean(review.isMine);

  async function confirmDelete(id) {
    if (!onDelete) return;
    try {
      await onDelete(id);
      setConfirmDeleteId(null);
      setDeleteError('');
    } catch (err) {
      setDeleteError(err.message || 'ลบรีวิวไม่สำเร็จ');
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-slate-400">ยังไม่มีรีวิว เป็นคนแรกเลย</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map(r => {
        const mine = isReviewMine(r);
        return (
          <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{r.authorName}</span>
                {mine && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">รีวิวของคุณ</span>}
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span>⭐ {r.rating}/5 | {dateTH(r.createdAt)}</span>
                {onDelete && mine && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(r.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    ลบรีวิวของฉัน
                  </button>
                )}
              </div>
            </div>

            {confirmDeleteId === r.id && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p>ยืนยันลบรีวิวนี้ใช่หรือไม่</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => confirmDelete(r.id)} className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700">
                    ยืนยันลบ
                  </button>
                  <button type="button" onClick={() => { setConfirmDeleteId(null); setDeleteError(''); }} className="rounded border border-red-200 bg-white px-3 py-1.5 text-red-700 hover:bg-red-100">
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}

            {deleteError && confirmDeleteId === r.id && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}

            <p className="mt-2 whitespace-pre-line text-slate-700">{r.text}</p>
            {r.photos?.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {r.photos.map((p, i) => (
                  <li key={p.id}>
                    {/* กดที่รูปเพื่อเปิดดูรูปเต็มในแท็บใหม่ */}
                    <a href={photoUrl(p)} target="_blank" rel="noreferrer">
                      <img src={photoUrl(p)} alt={`รูปจากรีวิวของ ${r.authorName} รูปที่ ${i + 1}`} loading="lazy"
                           className="h-24 w-24 rounded-lg border border-slate-200 object-cover hover:opacity-90" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default ReviewList;
