import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants } from '../../api/backend';
import { ErrorBox, Loading, btnGhost, btnPrimary, inputClass } from '../../components/admin/AdminStates';
import { cuisinesText, ratingText } from '../../utils/format';

const LIMIT = 20;   // ร้านต่อหน้า

// ตารางร้านทั้งหมด: ใช้ GET /api/restaurants ตัวเดิม (สาธารณะ) แต่ให้ backend ค้นและแบ่งหน้าให้
// (เดิมขอ 100 ร้านแล้วกรองในเครื่อง ทำให้ร้านที่ 101 เป็นต้นไปหายจากตารางและค้นไม่เจอ)
// ส่วนที่ต้องเป็น admin คือปุ่มแก้ไข/เพิ่ม ซึ่งพาไปหน้าฟอร์ม
function AdminRestaurants() {
  const [data, setData] = useState({ results: [], total: 0 });   // คำตอบจาก GET /api/restaurants
  const [status, setStatus] = useState('loading');               // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  // โหลดใหม่ทุกครั้งที่คำค้นหรือหน้าเปลี่ยน หน่วง 300 ms กันยิง API ทุกตัวอักษร
  useEffect(() => {
    let ignore = false;                                          // ธงกันคำตอบเก่ามาทับคำตอบใหม่
    const timer = setTimeout(async () => {
      setStatus('loading');
      try {
        const res = await getRestaurants({ q: query.trim(), sort: 'newest', page, limit: LIMIT });
        if (!ignore) { setData(res); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }, 300);
    return () => { ignore = true; clearTimeout(timer); };
  }, [query, page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(data.total / LIMIT));

  // เปลี่ยนคำค้นแล้วต้องกลับไปหน้า 1 เสมอ
  function handleQuery(value) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">ร้านอาหารทั้งหมด</h2>
          {status === 'success' && <p className="text-sm text-slate-500">พบ {data.total} ร้าน</p>}
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => handleQuery(e.target.value)}
                 placeholder="ค้นชื่อร้านหรือเมนู" className={inputClass + ' md:w-64'} />
          <Link to="/admin/restaurants/new" className={btnPrimary + ' whitespace-nowrap'}>+ เพิ่มร้าน</Link>
        </div>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ร้าน</th>
                  <th className="px-4 py-3">ประเภท</th>
                  <th className="px-4 py-3">จังหวัด</th>
                  <th className="px-4 py-3">คะแนน</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.results.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <p className="truncate font-medium text-slate-900">{r.name}</p>
                      <p className="truncate text-xs text-slate-500">{r.nameTh ?? '(ยังไม่มีชื่อไทย)'} <span className="text-slate-300">#{r.id}</span></p>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{cuisinesText(r, 2)}</td>
                    <td className="px-4 py-2 text-slate-600">{r.province}</td>
                    <td className="px-4 py-2 text-slate-600">{ratingText(r.rating, r.reviewCount)}</td>
                    <td className="px-4 py-2 text-right">
                      <Link to={`/admin/restaurants/${r.id}`} className="text-red-600 hover:underline">แก้ไข</Link>
                    </td>
                  </tr>
                ))}
                {data.results.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">ไม่พบร้านที่ค้นหา</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {data.total > LIMIT && (
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className={btnGhost}>
                ก่อนหน้า
              </button>
              <span className="text-slate-500">หน้า {page} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className={btnGhost}>
                ถัดไป
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminRestaurants;
