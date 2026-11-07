import { dateTH } from '../utils/format';

// รายการรีวิวของร้าน 1 ร้าน รับ items รูปร่างตามสัญญา GET /api/restaurants/{id}/reviews:
// { id, rating, text, authorName, createdAt }
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
          <p className="mt-2 text-slate-700">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
