import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { addToWishlist, removeFromWishlist } from '../api/backend';

// ปุ่มหัวใจใต้ชื่อร้าน (เฉพาะสมาชิก) Guest จะเห็นข้อความชวนเข้าสู่ระบบแทน
// initialWishlisted มาจาก isWishlisted ในคำตอบ GET /api/restaurants/{id} ไม่ต้องยิงขอ wishlist ซ้ำ
function RestaurantActions({ restaurantId, initialWishlisted }) {
  const { isLoggedIn, token } = useAuth();
  const [inWishlist, setInWishlist] = useState(Boolean(initialWishlisted));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        <Link to="/login" className="text-red-600 hover:underline">เข้าสู่ระบบ</Link> เพื่อเขียนรีวิวและเก็บร้านนี้ไว้ในรายการที่อยากไปกิน
      </p>
    );
  }

  async function handleWishlist() {
    setBusy(true);
    setMessage(null);
    try {
      if (inWishlist) {
        await removeFromWishlist(restaurantId, token);
        setInWishlist(false);
        setMessage('เอาออกจากรายการที่อยากไปกินแล้ว');
      } else {
        await addToWishlist(restaurantId, token);
        setInWishlist(true);
        setMessage('เพิ่มเข้ารายการที่อยากไปกินแล้ว');
      }
    } catch (err) {
      setMessage(err.message || 'เกิดข้อผิดพลาดขณะอัปเดตรายการที่อยากไปกิน');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <button onClick={handleWishlist} disabled={busy}
              className={'rounded-lg border px-4 py-2 text-sm disabled:opacity-60 ' +
                (inWishlist ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-red-50')}>
        {inWishlist ? '❤️ อยู่ในรายการที่อยากไปกินแล้ว' : '🤍 เพิ่มเข้ารายการที่อยากไปกิน'}
      </button>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}

export default RestaurantActions;
