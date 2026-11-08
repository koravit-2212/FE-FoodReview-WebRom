import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants } from '../../api/backend';
import { ErrorBox, Loading, btnPrimary, inputClass } from '../../components/admin/AdminStates';
import { cuisinesText, ratingText } from '../../utils/format';

// ตารางร้านทั้งหมด: ใช้ GET /api/restaurants ตัวเดิม (สาธารณะ) ขอทีละ 100 ร้านแล้วกรองในเครื่อง
// ส่วนที่ต้องเป็น admin คือปุ่มแก้ไข/เพิ่ม ซึ่งพาไปหน้าฟอร์ม
function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getRestaurants({ sort: 'newest', limit: 100 });
        if (!ignore) { setRestaurants(data.results); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  const q = query.trim().toLowerCase();
  const shown = restaurants.filter(r =>
    q === '' || r.name.toLowerCase().includes(q) || (r.nameTh ?? '').toLowerCase().includes(q) || String(r.id) === q
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">ร้านอาหารทั้งหมด</h2>
          {status === 'success' && <p className="text-sm text-slate-500">แสดง {shown.length} จาก {restaurants.length} ร้าน</p>}
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="ค้นชื่อร้าน หรือพิมพ์เลข id" className={inputClass + ' md:w-64'} />
          <Link to="/admin/restaurants/new" className={btnPrimary + ' whitespace-nowrap'}>+ เพิ่มร้าน</Link>
        </div>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
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
              {shown.map(r => (
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
              {shown.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">ไม่พบร้านที่ค้นหา</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;
