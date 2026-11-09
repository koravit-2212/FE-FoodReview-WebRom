import { Link } from 'react-router-dom';
import RestaurantImage from './RestaurantImage';
import WishlistButton from './WishlistButton';
import { cuisinesText, fullAddress } from '../utils/format';

// การ์ดร้านแบบแถวนอน (รูปเล็กซ้าย ชื่อ คะแนน ที่อยู่) รับ object รูปร่างเดียวกับ GET /api/restaurants:
// { id, name, nameTh, cuisine, cuisines, province, address, rating, reviewCount, image, isWishlisted }
// showHeart=false ใช้ในช่องค้นหาหน้าแรกที่อยากให้การ์ดโล่ง ๆ
function RestaurantCard({ restaurant, onWishlistChange, showHeart = true }) {
  return (
    <div className="relative flex items-center rounded-2xl bg-[#f3f3f3] p-3 shadow-sm transition hover:shadow-md sm:p-4">
      <Link to={`/restaurants/${restaurant.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <RestaurantImage src={restaurant.image} alt={`รูปร้าน ${restaurant.name}`}
                         cuisine={restaurant.cuisine}
                         className="h-28 w-28 shrink-0 rounded-xl object-cover sm:h-32 sm:w-32" />

        <div className="min-w-0 flex-1 text-slate-700">
          <h3 className="truncate text-2xl font-medium leading-tight text-slate-800" title={restaurant.name}>{restaurant.name}</h3>
          {restaurant.nameTh && <p className="mt-1 truncate text-base text-slate-500">{restaurant.nameTh}</p>}

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            {restaurant.reviewCount > 0 ? (
              <>
                <span className="text-[#f7b500]">★</span>
                <span>{Number(restaurant.rating).toFixed(1)}</span>
                <span className="text-slate-400">({restaurant.reviewCount})</span>
              </>
            ) : (
              <span className="text-slate-400">ยังไม่มีรีวิว</span>
            )}
          </div>

          <p className="mt-2 truncate text-sm text-slate-500">
            {restaurant.province}
            <span className="mx-2 text-slate-300">|</span>
            {cuisinesText(restaurant, 2)}
          </p>

          <p className="mt-1 truncate text-sm text-slate-500">{fullAddress(restaurant)}</p>
        </div>
      </Link>

      {showHeart && (
        <div className="ml-3 shrink-0">
          <WishlistButton restaurantId={restaurant.id} initial={restaurant.isWishlisted}
                          onChange={(value) => onWishlistChange?.(restaurant.id, value)}
                          className="h-12 w-12 border-slate-200 bg-white text-slate-400 hover:text-red-600" />
        </div>
      )}
    </div>
  );
}

export default RestaurantCard;
