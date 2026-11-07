import { Link } from 'react-router-dom';
import WishlistButton from './WishlistButton';
import { cuisineEmoji } from '../utils/format';

// การ์ดร้านแบบแถวนอน (รูปเล็กซ้าย ชื่อ คะแนน ที่อยู่) รับ object รูปร่างเดียวกับ GET /api/restaurants:
// { id, name, nameTh, cuisine, province, address, rating, reviewCount, image, isWishlisted }
// showHeart=false ใช้ในช่องค้นหาหน้าแรกที่อยากให้การ์ดโล่ง ๆ
function RestaurantCard({ restaurant, onWishlistChange, showHeart = true }) {
  return (
    <div className="relative flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-50">
      <Link to={`/restaurants/${restaurant.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        {restaurant.image ? (
          <img src={restaurant.image} alt={`รูปร้าน ${restaurant.name}`} loading="lazy"
               className="h-24 w-24 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-red-50 text-4xl">{cuisineEmoji(restaurant.cuisine)}</div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-lg font-medium text-slate-900" title={restaurant.name}>{restaurant.name}</h3>
          <p className="mt-0.5 text-sm text-slate-700">
            {restaurant.reviewCount > 0 ? (
              <><span className="text-yellow-400">★</span> {Number(restaurant.rating).toFixed(1)}
                <span className="text-slate-400"> ({restaurant.reviewCount})</span></>
            ) : (
              <span className="text-slate-400">ยังไม่มีรีวิว</span>
            )}
            <span className="text-slate-400"> | {restaurant.cuisine}</span>
          </p>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {[restaurant.address, restaurant.province].filter(Boolean).join(' ')}
          </p>
        </div>
      </Link>
      {showHeart && (
        <WishlistButton restaurantId={restaurant.id} initial={restaurant.isWishlisted}
                        onChange={(value) => onWishlistChange?.(restaurant.id, value)} />
      )}
    </div>
  );
}

export default RestaurantCard;
