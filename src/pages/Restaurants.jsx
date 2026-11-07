import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RestaurantGrid from '../components/RestaurantGrid';
import SearchBar from '../components/SearchBar';
import { getRestaurants } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { CUISINES, SORTS } from '../data/data';

const LIMIT = 10;   // ร้านต่อหน้า

function Restaurants() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();                       // ค่าตั้งต้นมาจากลิงก์ เช่น /restaurants?province=เชียงใหม่&q=ข้าวซอย
  const [query, setQuery] = useState(searchParams.get('q') || '');            // คำค้น ค้นจากชื่อร้านหรือเมนู
  const [province, setProvince] = useState(searchParams.get('province') || 'all');   // 'all' = ทุกจังหวัด
  const [cuisine, setCuisine] = useState('all');                  // 'all' = ทุกประเภท
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ results: [], total: 0 });    // คำตอบจาก GET /api/restaurants
  const [status, setStatus] = useState('loading');                // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);                  // ตัวนับสำหรับปุ่ม "ลองใหม่"

  // โหลดใหม่ทุกครั้งที่เงื่อนไขเปลี่ยน (ค้นหา, จังหวัด, ประเภท, เรียง, หน้า) หรือกด "ลองใหม่"
  // หน่วงคำค้น 300 ms กันยิง API ทุกตัวอักษรที่พิมพ์
  useEffect(() => {
    let ignore = false;                                           // ธงกันคำตอบเก่ามาทับคำตอบใหม่
    const timer = setTimeout(async () => {
      setStatus('loading');
      try {
        const res = await getRestaurants({ q: query.trim(), province, cuisine, sort, page, limit: LIMIT }, token);
        if (!ignore) { setData(res); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }, 300);
    return () => { ignore = true; clearTimeout(timer); };         // cleanup: effect รอบเก่าถูกยกเลิก
  }, [query, province, cuisine, sort, page, token, reloadKey]);

  // เปลี่ยนเงื่อนไขแล้วต้องกลับไปหน้า 1 เสมอ
  function change(setter) {
    return (value) => { setter(value); setPage(1); };
  }
  const totalPages = Math.max(1, Math.ceil(data.total / LIMIT));

  const chipClass = (active) =>
    'rounded-full border px-3 py-1 text-sm transition ' +
    (active ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-red-50');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">ร้านอาหารทั้งหมด</h1>
      <p className="mb-5 text-sm text-slate-500">
        {status === 'success' ? `พบ ${data.total} ร้าน` : 'ค้นหาจากชื่อร้านหรือเมนู กรองตามจังหวัดและประเภทอาหาร'}
      </p>

      <SearchBar province={province} query={query}
                 onProvince={change(setProvince)} onQuery={change(setQuery)} />

      {/* ปุ่มกรองประเภทอาหาร + เรียงลำดับ */}
      <div className="mb-6 mt-5 flex flex-wrap items-center gap-2">
        <button onClick={() => change(setCuisine)('all')} className={chipClass(cuisine === 'all')}>ทุกประเภท</button>
        {CUISINES.map(c => (
          <button key={c} onClick={() => change(setCuisine)(c)} className={chipClass(cuisine === c)}>{c}</button>
        ))}
        <select value={sort} onChange={(e) => change(setSort)(e.target.value)} aria-label="เรียงลำดับ"
                className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <RestaurantGrid restaurants={data.results} status={status} error={error}
                      onRetry={() => setReloadKey(k => k + 1)} />

      {status === 'success' && data.total > LIMIT && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-red-700 hover:bg-red-50 disabled:text-slate-300">
            ก่อนหน้า
          </button>
          <span className="text-slate-500">หน้า {page} / {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-red-700 hover:bg-red-50 disabled:text-slate-300">
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}

export default Restaurants;
