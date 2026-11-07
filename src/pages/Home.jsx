import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRestaurants } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import RestaurantGrid from '../components/RestaurantGrid';
import SearchBar from '../components/SearchBar';

// รูปพื้นหลัง hero: วางรูปอาหารของตัวเองไว้ที่ public/hero.jpg ได้เลย (ถ้าไม่มีรูปจะเห็นพื้นหลังไล่สีเข้มแทน)
const HERO_BG = "linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('/hero.jpg'), linear-gradient(135deg, #7f1d1d, #111827)";

function Home() {
  const { isLoggedIn, member, token } = useAuth();
  const navigate = useNavigate();

  // ค่าในแถบค้นหา
  const [province, setProvince] = useState('all');
  const [query, setQuery] = useState('');

  // ผลลัพธ์ในกล่องใต้แถบค้นหา (4 ร้านคะแนนสูงสุดตามเงื่อนไข)
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  // ร้านใหม่ล่าสุด
  const [newest, setNewest] = useState([]);
  const [newestStatus, setNewestStatus] = useState('loading');
  const [newestError, setNewestError] = useState(null);

  // ค้นหาแบบสด หน่วง 300 ms กันยิง API ทุกตัวอักษร
  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setStatus('loading');
      try {
        const data = await getRestaurants({ q: query.trim(), province, sort: 'rating', limit: 4 }, token);
        if (!ignore) { setResults(data.results); setTotal(data.total); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }, 300);
    return () => { ignore = true; clearTimeout(timer); };
  }, [query, province, token, reloadKey]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setNewestStatus('loading');
      try {
        const data = await getRestaurants({ sort: 'newest', limit: 6 }, token);
        if (!ignore) { setNewest(data.results); setNewestStatus('success'); }
      } catch (err) {
        if (!ignore) { setNewestError(err); setNewestStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token]);

  // ไปหน้า "ร้านทั้งหมด" พร้อมเงื่อนไขที่กรอกไว้
  function seeAll() {
    const sp = new URLSearchParams();
    if (query.trim()) sp.set('q', query.trim());
    if (province !== 'all') sp.set('province', province);
    navigate(`/restaurants${sp.toString() ? `?${sp}` : ''}`);
  }

  return (
    <div>
      <section className="px-4 pb-10 pt-14 text-center md:px-8 md:pt-20"
               style={{ backgroundImage: HERO_BG, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <h1 className="text-3xl font-medium text-white drop-shadow md:text-5xl">ค้นหาร้านอร่อยทั่วไทย</h1>
        <p className="mt-3 text-white/90">
          {isLoggedIn ? `ยินดีต้อนรับกลับมา ${member?.displayName}` : 'ดูร้านและอ่านรีวิวได้เลยโดยไม่ต้องสมัคร'}
        </p>

        <div className="mx-auto mt-8 max-w-3xl text-left">
          <SearchBar province={province} query={query} onProvince={setProvince} onQuery={setQuery} onSubmit={seeAll} />

          {/* กล่องผลลัพธ์ใต้แถบค้นหา */}
          <div className="mt-2 rounded-2xl bg-white/95 p-4 shadow-lg md:p-6">
            <RestaurantGrid restaurants={results} status={status} error={error}
                            onRetry={() => setReloadKey(k => k + 1)} />
            <div className="mt-5 text-center">
              <button onClick={seeAll}
                      className="rounded-full bg-red-600 px-8 py-2.5 font-medium text-white shadow hover:bg-red-700">
                {status === 'success' && total > 0 ? `ดูผลลัพธ์ทั้งหมด (${total})` : 'ดูผลลัพธ์ทั้งหมด'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">ร้านใหม่ล่าสุด</h2>
            <p className="text-sm text-slate-500">ร้านที่เพิ่งเข้ามาในระบบ</p>
          </div>
          <Link to="/restaurants?sort=newest" className="text-sm text-red-600 hover:underline">ดูทั้งหมด</Link>
        </div>
        <RestaurantGrid restaurants={newest} status={newestStatus} error={newestError} />
        {!isLoggedIn && (
          <p className="mt-8 rounded-xl bg-red-50 p-4 text-center text-sm text-slate-600">
            อยากเขียนรีวิวหรือเก็บร้านที่อยากไปกิน?{' '}
            <Link to="/register" className="font-medium text-red-600 hover:underline">สมัครสมาชิกฟรี</Link>
          </p>
        )}
      </section>
    </div>
  );
}

export default Home;
