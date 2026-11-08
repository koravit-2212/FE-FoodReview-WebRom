import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import RestaurantActions from '../components/RestaurantActions';
import RestaurantImage from '../components/RestaurantImage';
import { getRestaurant, getReviews, postReview } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { fullAddress, ratingText, safeUrl } from '../utils/format';

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
  async function handleReviewSubmit({ rating, text, photos }) {
    const saved = await postReview(id, { rating, text, authorName: member.displayName, photos }, token);   // 201
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
  const cuisines = restaurant.cuisines?.length ? restaurant.cuisines : [restaurant.cuisine].filter(Boolean);
  const mapUrl = safeUrl(restaurant.googleMapsLink);
  const facebookUrl = safeUrl(restaurant.facebook);
  // รางวัลของร้านรวมปีเป็นข้อความเดียว เช่น { "Bib Gourmand": [2025, 2024] }
  const awards = {};
  (restaurant.awards ?? []).forEach(a => { (awards[a.award] ??= []).push(a.year); });
  const menu = Array.isArray(restaurant.menu) ? restaurant.menu.join(', ') : restaurant.menu;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Link to="/restaurants" className="text-sm text-slate-500 hover:text-red-600">กลับไปหน้าร้านทั้งหมด</Link>

      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        <div className="w-full shrink-0 self-start md:w-72">
          <RestaurantImage src={cover} alt={`รูปร้าน ${restaurant.name}`} cuisine={restaurant.cuisine} emojiClass="text-6xl"
                           className="aspect-[4/3] w-full rounded-xl border border-slate-200 object-cover" />
          {cover && restaurant.imageCredit && (
            <p className="mt-1 text-xs text-slate-400">{restaurant.imageCredit}</p>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{restaurant.name}</h1>
          {restaurant.nameTh && <p className="mt-1 text-slate-500">{restaurant.nameTh}</p>}
          <p className="mt-2 text-sm text-slate-500">
            {restaurant.province} | {ratingText(restaurant.rating, restaurant.reviewCount)}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {cuisines.map(c => (
              <li key={c} className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">{c}</li>
            ))}
            {Object.entries(awards).map(([award, years]) => (
              <li key={award} className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs text-yellow-800">
                🏅 Michelin {award} {years.join(', ')}
              </li>
            ))}
          </ul>
          {restaurant.description && <p className="mt-4 leading-relaxed text-slate-700">{restaurant.description}</p>}

          <dl className="mt-4 space-y-1 text-sm text-slate-600">
            {fullAddress(restaurant) && <div><dt className="inline font-medium">ที่อยู่: </dt><dd className="inline">{fullAddress(restaurant)}</dd></div>}
            {restaurant.phone && <div><dt className="inline font-medium">โทร: </dt><dd className="inline">{restaurant.phone}</dd></div>}
            {restaurant.openingHours && <div><dt className="inline font-medium">เวลาเปิด: </dt><dd className="inline">{restaurant.openingHours}</dd></div>}
            {menu && <div><dt className="inline font-medium">เมนูแนะนำ: </dt><dd className="inline">{menu}</dd></div>}
          </dl>

          {(mapUrl || facebookUrl) && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noreferrer"
                   className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-red-50">📍 เปิดแผนที่</a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noreferrer"
                   className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-red-50">Facebook ของร้าน</a>
              )}
            </div>
          )}

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
