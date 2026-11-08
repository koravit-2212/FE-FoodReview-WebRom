import { photoUrl } from '../api/backend';
import { dateTH } from '../utils/format';

// รายการรีวิวของร้าน 1 ร้าน รับ items รูปร่างตามสัญญา GET /api/restaurants/{id}/reviews:
// { id, rating, text, authorName, createdAt, photos: [{ id, url }] }
function ReviewList({ items }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">ยังไม่มีรีวิว เป็นคนแรกเลย</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map(r => (
        <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-900">{r.authorName}</span>
            <span className="text-slate-400">⭐ {r.rating}/5 | {dateTH(r.createdAt)}</span>
          </div>
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
      ))}
    </ul>
  );
}

export default ReviewList;
