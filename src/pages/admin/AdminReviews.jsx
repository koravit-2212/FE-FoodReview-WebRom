import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminReviews, deleteReview } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, inputClass } from '../../components/admin/AdminStates';
import { dateTH } from '../../utils/format';

// ตรวจรีวิวทั้งหมดของทุกร้าน + ลบรีวิวที่ไม่เหมาะสม (ลบแล้ว backend คำนวณคะแนนเฉลี่ยของร้านใหม่)
function AdminReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null);      // รีวิวที่กำลังจะลบ (เปิดกล่องยืนยัน)
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getAdminReviews(token);
        if (!ignore) { setReviews(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function confirmDelete() {
    setBusy(true);
    setActionError(null);
    try {
      await deleteReview(target.id, token);
      setReviews(reviews.filter(r => r.id !== target.id));
      setTarget(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const q = query.trim().toLowerCase();
  const shown = reviews.filter(r =>
    q === '' || r.text.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q) || r.restaurantName.toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">รีวิวทั้งหมด</h2>
          {status === 'success' && <p className="text-sm text-slate-500">แสดง {shown.length} จาก {reviews.length} รีวิว</p>}
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นข้อความ ชื่อผู้รีวิว หรือชื่อร้าน" className={inputClass + ' md:w-72'} />
      </div>

      {actionError && <p className="mb-3 text-sm text-red-600">{actionError}</p>}
      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ร้าน</th>
                <th className="px-4 py-3">รีวิว</th>
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map(r => (
                <tr key={r.id} className="align-top hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link to={`/restaurants/${r.restaurantId}`} className="font-medium text-slate-900 hover:text-red-600">{r.restaurantName}</Link>
                  </td>
                  <td className="px-4 py-2">
                    <p className="text-slate-700">{r.text}</p>
                    <p className="text-xs text-slate-400">{r.authorName} | ⭐ {r.rating}/5</p>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{dateTH(r.createdAt)}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setTarget(r)} className="text-red-600 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">ไม่พบรีวิว</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmBox open={Boolean(target)} busy={busy} title="ลบรีวิวนี้ ?" confirmText="ลบรีวิว"
                  onConfirm={confirmDelete} onCancel={() => setTarget(null)}>
        <p>รีวิวของ {target?.authorName} ต่อร้าน {target?.restaurantName} จะถูกลบถาวร และคะแนนเฉลี่ยของร้านจะถูกคำนวณใหม่</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminReviews;
