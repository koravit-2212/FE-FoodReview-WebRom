import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getWishlist } from '../api/backend';
import RestaurantGrid from '../components/RestaurantGrid';

// หน้า "ร้านที่อยากไปกิน" ของสมาชิกที่ login อยู่ (เส้นทาง /me/wishlist ครอบด้วย ProtectedRoute แล้ว)
// กดหัวใจบนการ์ดเพื่อลบร้านออกจากรายการ การ์ดจะหายไปทันที
function Wishlist() {
  const { member, token } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getWishlist(token);
        // wishlist ส่ง restaurantId มา แต่การ์ดใช้ id และทุกร้านในหน้านี้คือร้านที่กดหัวใจไว้แล้ว
        const list = data.results.map(w => ({ ...w, id: w.restaurantId, isWishlisted: true }));
        if (!ignore) { setRestaurants(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  // การ์ดแจ้งว่าหัวใจถูกกดสลับ: ถ้าไม่ได้อยู่ในรายการแล้วให้เอาออกจากหน้านี้
  function handleWishlistChange(restaurantId, saved) {
    if (!saved) setRestaurants(list => list.filter(r => r.id !== restaurantId));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">ร้านที่อยากไปกินของ {member?.displayName}</h1>
      <p className="mb-6 text-sm text-slate-500">
        {status === 'success' ? `ทั้งหมด ${restaurants.length} ร้าน | ` : ''}กดหัวใจเพื่อเอาร้านออกจากรายการ
      </p>
      <RestaurantGrid restaurants={restaurants} status={status} error={error}
                      onRetry={() => setReloadKey(k => k + 1)} onWishlistChange={handleWishlistChange}
                      emptyText="ยังไม่มีร้านในรายการ" />
      {status === 'success' && restaurants.length === 0 && (
        <p className="text-center">
          <Link to="/restaurants" className="text-sm text-red-600 hover:underline">ไปเลือกร้านที่สนใจ</Link>
        </p>
      )}
    </div>
  );
}

export default Wishlist;
