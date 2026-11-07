import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { addToWishlist, removeFromWishlist } from '../api/backend';
import { HeartIcon } from './Icons';

// ปุ่มหัวใจ เพิ่ม/ลบร้านออกจากรายการที่อยากไปกิน (POST / DELETE /api/wishlist)
// Guest กดแล้วถูกพาไปหน้า Login แล้วกลับมาที่เดิม, Member กดแล้วสลับทันที
// onChange(ค่าใหม่) ให้แม่รู้ เช่น หน้า Wishlist เอาการ์ดนั้นออกจากรายการ
function WishlistButton({ restaurantId, initial = false, onChange, className = '' }) {
  const { isLoggedIn, token } = useAuth();
  const [saved, setSaved] = useState(Boolean(initial));
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleClick() {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await removeFromWishlist(restaurantId, token);
      } else {
        await addToWishlist(restaurantId, token);
      }
      setSaved(!saved);
      onChange?.(!saved);
    } catch (err) {
      window.alert(err.message || 'อัปเดตรายการที่อยากไปกินไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={busy}
            aria-label={saved ? 'เอาออกจากรายการที่อยากไปกิน' : 'เพิ่มเข้ารายการที่อยากไปกิน'}
            aria-pressed={saved}
            className={'grid h-9 w-9 shrink-0 place-items-center rounded-full border transition disabled:opacity-60 ' +
              (saved ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-white text-slate-400 hover:text-red-600') + ' ' + className}>
      <HeartIcon filled={saved} />
    </button>
  );
}

export default WishlistButton;
