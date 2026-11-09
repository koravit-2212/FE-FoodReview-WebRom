import { Link } from 'react-router-dom';
import RestaurantImage from './RestaurantImage';
import WishlistButton from './WishlistButton';
import { cuisinesText, fullAddress } from '../utils/format';

// การ์ดร้านแบบแถวนอน (รูปเล็กซ้าย ชื่อ คะแนน ที่อยู่) รับ object รูปร่างเดียวกับ GET /api/restaurants:
// { id, name, nameTh, cuisine, cuisines, province, address, rating, reviewCount, image, isWishlisted }
// showHeart=false ใช้ในช่องค้นหาหน้าแรกที่อยากให้การ์ดโล่ง ๆ
function RestaurantCard({ restaurant, onWishlistChange, showHeart = true }) {
  return (
    <div className="relative flex w-full items-center overflow-hidden rounded-2xl bg-[#f3f3f3] p-2.5 shadow-sm transition hover:shadow-md sm:p-3">
      <Link to={`/restaurants/${restaurant.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <RestaurantImage src={restaurant.image} alt={`รูปร้าน ${restaurant.name}`}
                         cuisine={restaurant.cuisine}
                         className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28" />

        <div className="min-w-0 flex-1 overflow-hidden text-slate-700">
          <h3 className="truncate text-[1.15rem] font-medium leading-tight text-slate-800 sm:text-[1.6rem]" title={restaurant.name}>{restaurant.name}</h3>
          {restaurant.nameTh && <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">{restaurant.nameTh}</p>}

          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600 sm:gap-2 sm:text-sm">
            {restaurant.reviewCount > 0 ? (
              <>
                <span className="text-[#f7b500]">★</span>
                <span className="shrink-0">{Number(restaurant.rating).toFixed(1)}</span>
                <span className="truncate text-slate-400">({restaurant.reviewCount})</span>
              </>
            ) : (
              <span className="text-slate-400">ยังไม่มีรีวิว</span>
            )}
          </div>

          <p className="mt-1.5 truncate text-[11px] text-slate-500 sm:text-sm">
            {restaurant.province}
            <span className="mx-1.5 text-slate-300 sm:mx-2">|</span>
            {cuisinesText(restaurant, 2)}
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-sm">{fullAddress(restaurant)}</p>
        </div>
      </Link>

      {showHeart && (
        <div className="ml-2 shrink-0">
          <WishlistButton restaurantId={restaurant.id} initial={restaurant.isWishlisted}
                          onChange={(value) => onWishlistChange?.(restaurant.id, value)}
                          className="h-10 w-10 border-slate-200 bg-white text-slate-400 hover:text-red-600 sm:h-12 sm:w-12" />
        </div>
      )}
    </div>
  );
}

export default RestaurantCard;
