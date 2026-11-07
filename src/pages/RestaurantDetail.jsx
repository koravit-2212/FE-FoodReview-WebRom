import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import RestaurantActions from '../components/RestaurantActions';
import { getRestaurant, getReviews, postReview } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { cuisineEmoji, ratingText } from '../utils/format';

function RestaurantDetail() {
  const { id } = useParams();                       // ได้เป็น string เสมอ
  const { isLoggedIn, token, member } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);       // รีวิวแยกโหลด คนละ endpoint กับข้อมูลร้าน

  // โหลดข้อมูลร้าน ส่ง token ไปด้วย (ถ้ามี) เพื่อให้ได้ isWishlisted ของสมาชิกคนนี้
  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const r = await getRestaurant(id, token);
        if (!ignore) { setRestaurant(r); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, token]);                                   // id เปลี่ยน = โหลดร้านใหม่

  // โหลดรีวิวแยก effect เพราะรีวิวล่มไม่ควรทำให้หน้าทั้งหน้าพัง
  useEffect(() => {
    let ignore = false;
    getReviews(id)
      .then(data => { if (!ignore) setReviews(data.results); })
      .catch(() => { if (!ignore) setReviews([]); });   // backend รีวิวล่มก็แค่ไม่มีรีวิว หน้าร้านยังดูได้
    return () => { ignore = true; };
  }, [id]);

  // ส่งรีวิวจริง: ReviewForm เรียกฟังก์ชันนี้ตอนกดส่ง ถ้า throw ฟอร์มจะโชว์ข้อความ error เอง
  async function handleReviewSubmit({ rating, text }) {
    const saved = await postReview(id, { rating, text, authorName: member.displayName }, token);   // 201
    setReviews([saved, ...reviews]);                                // ต่อหน้ารายการเดิม
    // backend อัปเดตคะแนนเฉลี่ยกับจำนวนรีวิวของร้านแล้ว โหลดร้านใหม่เพื่อให้ตัวเลขบนหน้าตรงกัน
    getRestaurant(id, token).then(setRestaurant).catch(() => {});
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="aspect-[4/3] w-full shrink-0 rounded-xl bg-slate-100 md:w-72" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-24 w-full rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-slate-700">ไม่พบร้านนี้ 😢</p>
        <p className="text-sm text-slate-400">{error.message}</p>
        <Link to="/restaurants" className="mt-6 inline-block text-sm text-red-600 hover:underline">กลับไปหน้าร้านทั้งหมด</Link>
      </div>
    );
  }

  const cover = restaurant.images?.[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Link to="/restaurants" className="text-sm text-slate-500 hover:text-red-600">กลับไปหน้าร้านทั้งหมด</Link>

      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        {cover ? (
          <img src={cover} alt={`รูปร้าน ${restaurant.name}`}
               className="aspect-[4/3] w-full shrink-0 self-start rounded-xl border border-slate-200 object-cover md:w-72" />
        ) : (
          <div className="grid aspect-[4/3] w-full shrink-0 place-items-center rounded-xl bg-slate-100 text-6xl md:w-72">
            {cuisineEmoji(restaurant.cuisine)}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{restaurant.name}</h1>
          {restaurant.nameTh && <p className="mt-1 text-slate-500">{restaurant.nameTh}</p>}
          <p className="mt-2 text-sm text-slate-500">
            {restaurant.cuisine} | {restaurant.province} | {ratingText(restaurant.rating, restaurant.reviewCount)}
          </p>
          {restaurant.description && <p className="mt-4 leading-relaxed text-slate-700">{restaurant.description}</p>}

          <dl className="mt-4 space-y-1 text-sm text-slate-600">
            {restaurant.address && <div><dt className="inline font-medium">ที่อยู่: </dt><dd className="inline">{restaurant.address} {restaurant.province}</dd></div>}
            {restaurant.phone && <div><dt className="inline font-medium">โทร: </dt><dd className="inline">{restaurant.phone}</dd></div>}
            {restaurant.openingHours && <div><dt className="inline font-medium">เวลาเปิด: </dt><dd className="inline">{restaurant.openingHours}</dd></div>}
            {restaurant.menu?.length > 0 && <div><dt className="inline font-medium">เมนูแนะนำ: </dt><dd className="inline">{restaurant.menu.join(', ')}</dd></div>}
          </dl>

          {/* Guest เห็นลิงก์ให้เข้าสู่ระบบ, Member เห็นปุ่มหัวใจ */}
          <RestaurantActions key={restaurant.id + String(token)} restaurantId={restaurant.id} initialWishlisted={restaurant.isWishlisted} />

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">รีวิว ({reviews.length})</h2>
            <ReviewList items={reviews} />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            {isLoggedIn ? (
              <ReviewForm key={restaurant.id} restaurantName={restaurant.name} onSubmit={handleReviewSubmit} />
            ) : (
              <p className="text-sm text-slate-500">
                <Link to="/login" className="text-red-600 hover:underline">เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetail;
