import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import RestaurantActions from '../components/RestaurantActions';
import RestaurantImage from '../components/RestaurantImage';
import { getRestaurant, getReviews, postReview, deleteMyReview } from '../api/backend';
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
    getReviews(id, {}, token)
      .then(data => {
        if (!ignore) {
          setReviews((data.results || []).map(review => ({
            ...review,
            isMine: Boolean(member && (review.isMine || Number(review.memberId) === Number(member.id))),
          })));
        }
      })
      .catch(() => { if (!ignore) setReviews([]); });   // backend รีวิวล่มก็แค่ไม่มีรีวิว หน้าร้านยังดูได้
    return () => { ignore = true; };
  }, [id, token, member]);

  // ส่งรีวิวจริง: ReviewForm เรียกฟังก์ชันนี้ตอนกดส่ง ถ้า throw ฟอร์มจะโชว์ข้อความ error เอง
  async function handleReviewSubmit({ rating, text, photos }) {
    const saved = await postReview(id, { rating, text, authorName: member.displayName, photos }, token);   // 201
    setReviews([{ ...saved, isMine: true }, ...reviews]);
    // backend อัปเดตคะแนนเฉลี่ยกับจำนวนรีวิวของร้านแล้ว โหลดร้านใหม่เพื่อให้ตัวเลขบนหน้าตรงกัน
    getRestaurant(id, token).then(setRestaurant).catch(() => {});
  }

  async function handleReviewDelete(reviewId) {
    if (!token) throw new Error('กรุณาเข้าสู่ระบบก่อน');
    await deleteMyReview(reviewId, token);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    getRestaurant(id, token).then(setRestaurant).catch(() => {});
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-6xl animate-pulse px-4 py-6 md:px-6">
          <div className="h-64 rounded-xl bg-slate-200 md:h-80" />
          <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="space-y-3 rounded-xl bg-white p-5">
              <div className="h-8 w-2/3 rounded bg-slate-100" />
              <div className="h-4 w-1/3 rounded bg-slate-100" />
              <div className="h-24 w-full rounded bg-slate-100" />
            </div>
            <div className="h-64 rounded-xl bg-white" />
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

  const images = (restaurant.images ?? []).filter(Boolean);
  const galleryImages = (images.length ? images : [null]).slice(0, 5);
  const galleryColumns = galleryImages.length === 1 ? 'md:grid-cols-1' : galleryImages.length === 2 ? 'md:grid-cols-2' : galleryImages.length === 3 ? 'md:grid-cols-4' : 'md:grid-cols-5';
  const cover = images[0];
  const cuisines = restaurant.cuisines?.length ? restaurant.cuisines : [restaurant.cuisine].filter(Boolean);
  const mapUrl = safeUrl(restaurant.googleMapsLink);
  const facebookUrl = safeUrl(restaurant.facebook);
  // รางวัลของร้านรวมปีเป็นข้อความเดียว เช่น { "Bib Gourmand": [2025, 2024] }
  const awards = {};
  (restaurant.awards ?? []).forEach(a => { (awards[a.award] ??= []).push(a.year); });
  const menu = Array.isArray(restaurant.menu) ? restaurant.menu.join(', ') : restaurant.menu;

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-5 md:px-6">
        <Link to="/restaurants" className="text-sm text-slate-500 hover:text-red-600">กลับไปหน้าร้านทั้งหมด</Link>

        <div className={`mt-3 grid h-56 grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-xl md:h-80 ${galleryColumns}`}>
          {galleryImages.map((image, index) => (
            <div
              key={image ?? `placeholder-${index}`}
              className={`relative overflow-hidden ${index === 0 ? `col-span-2 row-span-2 ${galleryImages.length >= 3 ? 'md:col-span-2' : 'md:col-span-1'}` : index === 1 ? 'row-span-2 md:col-span-1' : 'md:col-span-1'}`}
            >
              <RestaurantImage
                src={image}
                alt={`รูปร้าน ${restaurant.name} รูปที่ ${index + 1}`}
                cuisine={restaurant.cuisine}
                emojiClass="text-5xl"
                className="h-full w-full object-cover"
              />
              {index === galleryImages.length - 1 && images.length > galleryImages.length && (
                <div className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-semibold text-white">
                  ดูรูปทั้งหมด +{images.length - galleryImages.length}
                </div>
              )}
            </div>
          ))}
        </div>

        {cover && restaurant.imageCredit && (
          <p className="mt-1 text-right text-xs text-slate-400">{restaurant.imageCredit}</p>
        )}

        <div className="mt-4 grid items-start gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="p-5">
                <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{restaurant.name}</h1>
                {restaurant.nameTh && <p className="mt-1 text-slate-500">{restaurant.nameTh}</p>}
                <p className="mt-2 text-sm text-slate-500">
                  {restaurant.province} | {ratingText(restaurant.rating, restaurant.reviewCount)}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
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
                <RestaurantActions key={restaurant.id + String(token)} restaurantId={restaurant.id} initialWishlisted={restaurant.isWishlisted} />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">รีวิว ({reviews.length})</h2>
              <ReviewList items={reviews} onDelete={isLoggedIn ? handleReviewDelete : undefined} />
              <div className="mt-5 border-t border-slate-100 pt-5">
                {isLoggedIn ? (
                  <ReviewForm key={restaurant.id} restaurantName={restaurant.name} onSubmit={handleReviewSubmit} />
                ) : (
                  <p className="text-sm text-slate-500">
                    <Link to="/login" className="text-red-600 hover:underline">เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว
                  </p>
                )}
              </div>
            </section>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">ข้อมูลร้าน</h2>
            <dl className="mt-4 space-y-4 text-sm text-slate-600">
              {fullAddress(restaurant) && <div><dt className="font-medium text-slate-800">ที่อยู่</dt><dd className="mt-1">{fullAddress(restaurant)}</dd></div>}
              {restaurant.phone && <div><dt className="font-medium text-slate-800">โทร</dt><dd className="mt-1">{restaurant.phone}</dd></div>}
              {restaurant.openingHours && <div><dt className="font-medium text-slate-800">เวลาเปิด</dt><dd className="mt-1">{restaurant.openingHours}</dd></div>}
              {menu && <div><dt className="font-medium text-slate-800">เมนูแนะนำ</dt><dd className="mt-1">{menu}</dd></div>}
            </dl>
            {(mapUrl || facebookUrl) && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-sm">
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
          </aside>
        </div>
      </main>
    </div>
  );
}

export default RestaurantDetail;
